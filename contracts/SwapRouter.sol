// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./module/interfaces/IModule.sol";
// libraries
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SwapRouter is Initializable,  OwnableUpgradeable, UUPSUpgradeable {
    using SafeERC20 for IERC20;

    IERC20 public finalToken;

    address receiver;

    IModule[] public moduleSwap;

    function  initialize(IERC20 _finalToken, address _receiver) external initializer {
        finalToken = _finalToken;
        receiver = _receiver;
        __Ownable_init();
    }

    function getAllSwap(address _token, uint256 _amount, bool isReverse) external view returns(uint256 maxReceivedAmount, uint256 moduleId) {  
        for(uint256 i = 0; i < moduleSwap.length; i++) {
            uint256 receivedAmount;
            if(address(moduleSwap[i]) == address(0)) {
                continue;
            }
            if(isReverse) {
                receivedAmount = moduleSwap[i].getAmountSwap(address(finalToken), _token, _amount);
            } else {
                receivedAmount = moduleSwap[i].getAmountSwap(_token, address(finalToken), _amount);
            }
            if(maxReceivedAmount < receivedAmount) {
                moduleId = i;
                maxReceivedAmount = receivedAmount;
            }
        }
    }

    function swap(address _token, uint256 _amount, uint256 _expectedAmount,  uint256  _moduleId) external {
        require(address(moduleSwap[_moduleId]) != address(0), "swap: not found module");
        if (IERC20(_token).allowance(address(this), address(moduleSwap[_moduleId])) < _amount) {
            IERC20(_token).safeIncreaseAllowance(address(moduleSwap[_moduleId]), type(uint256).max);
        }
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);    
        
        uint256 receivedAmount = moduleSwap[_moduleId].swap(_token, address(finalToken), _amount, _expectedAmount);   
        
        finalToken.safeTransfer(receiver, receivedAmount);
    } 

    function addModuleSwap(address module) external onlyOwner {
        moduleSwap.push(IModule(module));
    }

    function deleteModuleSwap(uint256 _moduleId) external onlyOwner {
        delete moduleSwap[_moduleId];
    }

    function changeFinalToken(IERC20 _token) external onlyOwner {
        finalToken = _token;
    }

    function changeReceiver(address _receiver) external onlyOwner {
        receiver = _receiver;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}