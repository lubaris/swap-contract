import { ethers, upgrades } from "hardhat";
import * as fs from 'fs';
import { Signer } from 'ethers';
import {
  VelodromeSwapModule,
  VelodromeSwapModule__factory,
  SwapRouter,
  SwapRouter__factory,
} from "../typechain-types";

async function main() {

  let owner: Signer;

  let swapModule: any; 
  let swapRouter: any; 

  let file = JSON.parse(fs.readFileSync(`${__dirname}/deployAddress.json`, 'utf-8'));

  //need PRIVATE_KEY owner in env
    owner = (await ethers.getSigners())[0];
    // let SwapModuleFactory = (await ethers.getContractFactory("VelodromeSwapModule")) as VelodromeSwapModule__factory;
    // swapModule = await upgrades.deployProxy(SwapModuleFactory, ["0x9c12939390052919aF3155f41Bf4160Fd3666A6f"], {
    //     initializer: "initialize",
    // });

    let swapRouterFactory = (await ethers.getContractFactory("SwapRouter")) as SwapRouter__factory;
    // swapRouter = await upgrades.deployProxy(swapRouterFactory, ["0x94b008aa00579c1307b0ef2c499ad98a8ce58e58", "0x0C76d21E6fDc9D8DAd5cbe02844c618D1C323622"], {
    //     initializer: "initialize",
    // });
    swapRouter = swapRouterFactory.attach("0x929b21318BAA989Dfb16382308FC273C9C8eC015");

    await swapRouter.addModuleSwap("0xD8e17488D3530B505bf39e42767C1a5BA9831C23");

    file[10].swapModule = "0xD8e17488D3530B505bf39e42767C1a5BA9831C23";
    file[10].swapRouter = await swapRouter.getAddress();  
  

  console.log(`address swapModule: ${file[10].swapModule}`);
  console.log(`address swapRouter: ${file[10].swapRouter}`);
  fs.writeFileSync(`${__dirname}/deployAddress.json`, JSON.stringify(file, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
