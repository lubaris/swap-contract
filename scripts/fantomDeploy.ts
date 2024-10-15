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
    // swapModule = await upgrades.deployProxy(SwapModuleFactory, ["0xf491e7b69e4244ad4002bc14e878a34207e38c29"], {
    //     initializer: "initialize",
    // });

    let swapRouterFactory = (await ethers.getContractFactory("SwapRouter")) as SwapRouter__factory;
    // swapRouter = await upgrades.deployProxy(swapRouterFactory, ["0x049d68029688eAbF473097a2fC38ef61633A3C7A", "0x0C76d21E6fDc9D8DAd5cbe02844c618D1C323622"], {
    //     initializer: "initialize",
    // });
    swapRouter = swapRouterFactory.attach("0x7b2E89b7614b89cF8BBCD7c5285461A690Bd62D7");
    await swapRouter.addModuleSwap("0x5D55c7B7DbfF25502a4a80BfBC6bBCabA7932A28");

    file[250].swapModule = "0x5D55c7B7DbfF25502a4a80BfBC6bBCabA7932A28";
    file[250].swapRouter = await swapRouter.getAddress(); 

  console.log(`address swapModule: ${file[250].swapModule}`);
  console.log(`address swapRouter: ${file[250].swapRouter}`);
  fs.writeFileSync(`${__dirname}/deployAddress.json`, JSON.stringify(file, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
