import { ethers, upgrades } from "hardhat";
import * as fs from 'fs';
import { Signer } from 'ethers';
import {
  UniswapV2SwapModule,
  UniswapV2SwapModule__factory,
  SwapRouter,
  SwapRouter__factory,
} from "../typechain-types";

async function main() {

  let owner: Signer;

  let swapModule: any; 
  let swapRouter: any; 

  let file = JSON.parse(fs.readFileSync(`${__dirname}/deployAddress.json`, 'utf-8'));

  //need PRIVATE_KEY owner in env.
    owner = (await ethers.getSigners())[0];

    // let SwapModuleFactory = (await ethers.getContractFactory("UniswapV2SwapModule")) as UniswapV2SwapModule__factory;
    // swapModule = await upgrades.deployProxy(SwapModuleFactory, ["0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"], {
    //     initializer: "initialize",
    // });

    let swapRouterFactory = (await ethers.getContractFactory("SwapRouter")) as SwapRouter__factory;
    // swapRouter = await upgrades.deployProxy(swapRouterFactory, ["0xdac17f958d2ee523a2206206994597c13d831ec7", "0x0C76d21E6fDc9D8DAd5cbe02844c618D1C323622"], {
    //     initializer: "initialize",
    // });
    swapRouter = swapRouterFactory.attach("0x7b2E89b7614b89cF8BBCD7c5285461A690Bd62D7");
    await swapRouter.addModuleSwap("0x5D55c7B7DbfF25502a4a80BfBC6bBCabA7932A28");

    file[1].swapModule = "0x5D55c7B7DbfF25502a4a80BfBC6bBCabA7932A28";
    file[1].swapRouter = await swapRouter.getAddress(); 

  console.log(`address swapModule: ${file[1].swapModule}`);
  console.log(`address swapRouter: ${file[1].swapRouter}`);
  fs.writeFileSync(`${__dirname}/deployAddress.json`, JSON.stringify(file, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
