// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./interfaces/IModule.sol";
interface IVelodromeSwap {
    struct route {
        address from;
        address to;
        bool stable;
    }

    function factory() external view returns(address);

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        route[] calldata routes,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function getAmountsOut(uint amountIn, route[] memory routes) external view returns (uint[] memory amounts);
}


interface ERC20Decimals {
    function decimals() external view returns(uint8);

}

interface IVelodromeFactory {
    function getPair(address tokenA, address token, bool stable) external view returns (address);
}

interface IPair {
    function getReserves() external view returns (uint _reserve0, uint _reserve1, uint _blockTimestampLast);
}

contract VelodromeSwapModule is Initializable, OwnableUpgradeable, UUPSUpgradeable, IModule {
    using SafeERC20 for IERC20;
    
    IVelodromeSwap public router;
    IVelodromeFactory public factory;

    function  initialize(IVelodromeSwap _router) external initializer {
        router = _router;
        factory = IVelodromeFactory(router.factory());
        __Ownable_init();
    }

    function _getBetterPair(address _tokenFrom, address _tokenTo) internal view returns(address pair, bool stable) {
        address stableLpPair = factory.getPair(_tokenFrom, _tokenTo, true);
        address notStableLpPair = factory.getPair(_tokenFrom, _tokenTo, false);
        if (stableLpPair == address(0)) 
            return (notStableLpPair, false);
        if (notStableLpPair == address(0))
            return (stableLpPair, true);
        (uint256 amount0Stable , ,) = IPair(stableLpPair).getReserves();
        (uint256 amount0NotStable , ,) = IPair(notStableLpPair).getReserves();
        if (amount0Stable > amount0NotStable)
            return (stableLpPair, true);
        else
            return (notStableLpPair, false);
    }

    function _getSwapRoutes(address _tokenFrom, address _tokenTo) internal view returns(IVelodromeSwap.route[] memory routes) {
        (, bool stable) = _getBetterPair(_tokenFrom, _tokenTo);
        routes = new IVelodromeSwap.route[](1);
        routes[0] = IVelodromeSwap.route({from: _tokenFrom, to: _tokenTo, stable: stable});

    }

    function swap(address _from, address _to, uint256 _amount, uint256 _expectedAmount) external returns(uint256 receivedAmount) {
        IERC20(_from).safeTransferFrom(msg.sender, address(this), _amount);
        if (IERC20(_from).allowance(address(this), address(router)) < _amount) {
            IERC20(_from).safeIncreaseAllowance(address(router), type(uint256).max);
        }
        uint256[] memory amounts = router.swapExactTokensForTokens(_amount, _expectedAmount, _getSwapRoutes(_from, _to), msg.sender, block.timestamp);
        receivedAmount = amounts[amounts.length - 1];
    }

    function getAmountSwap(address _from, address _to, uint256 _amount) external view returns(uint256 receivedAmount) {
        (address pair, ) = _getBetterPair(_from, _to);
        if(pair == address(0)) {
            return 0;
        }
        uint256[] memory amounts = router.getAmountsOut(_amount, _getSwapRoutes(_from, _to));
        receivedAmount = amounts[amounts.length - 1];
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}