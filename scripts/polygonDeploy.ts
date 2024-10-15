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
    // swapModule = await upgrades.deployProxy(SwapModuleFactory, ["0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"], {
    //     initializer: "initialize",
    // });

    let swapRouterFactory = (await ethers.getContractFactory("SwapRouter")) as SwapRouter__factory;
    // swapRouter = await upgrades.deployProxy(swapRouterFactory, ["0xc2132D05D31c914a87C6611C10748AEb04B58e8F", "0x0C76d21E6fDc9D8DAd5cbe02844c618D1C323622"], {
    //     initializer: "initialize",
    // });
    swapRouter = swapRouterFactory.attach("0xC81E3827ACfCAF87bF8A5Aa42f27b35ecA3B49E6");    

    await swapRouter.addModuleSwap("0xB28b64aCbC4a3478C4974afB60Fd4Bf2201FD836");

    file[137].swapModule = "0xB28b64aCbC4a3478C4974afB60Fd4Bf2201FD836";
    file[137].swapRouter = await swapRouter.getAddress(); 

  console.log(`address swapModule: ${file[137].swapModule}`);
  console.log(`address swapRouter: ${file[137].swapRouter}`);
  fs.writeFileSync(`${__dirname}/deployAddress.json`, JSON.stringify(file, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
