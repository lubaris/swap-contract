import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import { Signer, Contract } from 'ethers';
import { 
    UniswapV2SwapModule__factory,
    SwapRouter__factory,
    ERC20__factory,
    ERC20,
} from "../typechain-types";

const WETH_ABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}]

describe('arbSwap',  () => {
    console.log("Test start...");
    let owner: Signer;

    let weth: any;

    let swapModule: any; //Contract
    let swapRouter: any; //Contract
    
    
    beforeEach(async () => {
        [owner] = (await ethers.getSigners());

        let SwapModuleFactory = (await ethers.getContractFactory("UniswapV2SwapModule")) as UniswapV2SwapModule__factory;
        swapModule = await upgrades.deployProxy(SwapModuleFactory, ["0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506"], {
            initializer: "initialize",
        });

        let swapRouterFactory = (await ethers.getContractFactory("SwapRouter")) as SwapRouter__factory;
        swapRouter = await upgrades.deployProxy(swapRouterFactory, ["0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", "0x0C76d21E6fDc9D8DAd5cbe02844c618D1C323622"], {
            initializer: "initialize",
        });
         
        await swapRouter.addModuleSwap(await swapModule.getAddress());
    });

    describe('Test contract params' , () => {
        it('should return correct token address', async () => {
            const tokenAddress = await swapRouter.finalToken();
            expect(tokenAddress).to.be.equal("0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9");
        });

        it('should return correct moduleSwap address', async () => {
            const swapModuleAddress = await swapRouter.moduleSwap(0);
            expect(swapModuleAddress).to.be.equal(await swapModule.getAddress());
        });

        it('should return correct router address', async () => {
            const routerAddress = await swapModule.router();
            expect(routerAddress).to.be.equal("0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506");
        });
    });

    describe('Test check swap', () => {
        it('test getAllSwap', async () => {
            let receivedInfo = await swapRouter.getAllSwap("0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", ethers.parseEther("1.0"), false);

            expect(receivedInfo[1]).to.be.equal(0n);

            
            receivedInfo  = await swapRouter.getAllSwap(ethers.ZeroAddress, ethers.parseEther("1.0"), false);
            
            expect(receivedInfo[0]).to.be.equal(0n);

            expect(receivedInfo[1]).to.be.equal(0n);
        });
        it('test swap', async () => {
            let ERC20Factory = (await ethers.getContractFactory("ERC20")) as ERC20__factory;
            let stable = ERC20Factory.attach("0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9") as ERC20;
            weth = new ethers.Contract("0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", WETH_ABI, owner);
            console.log("Swapping ETH to WETH...");
            await weth.deposit({ value: ethers.parseEther("1000.0")});
            console.log("WETH balance:", await weth.balanceOf(owner.getAddress()));

            weth.approve(await swapRouter.getAddress(), ethers.MaxInt256);

            let receivedInfo = await swapRouter.getAllSwap("0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", ethers.parseEther("1.0"), false);

            await swapRouter.swap("0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", ethers.parseEther("1.0"), 1, receivedInfo[1]);

            expect(receivedInfo[0]).to.be.closeTo(await stable.balanceOf("0x0C76d21E6fDc9D8DAd5cbe02844c618D1C323622"), 100000);
        })
    });
});