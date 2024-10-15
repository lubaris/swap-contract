import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";
dotenv.config({path: __dirname + '/.env'});

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17"
  },
  networks: {
      hardhat: {
          // mining: {
          //   auto: false,
          //   interval: [5000, 5000],
          // },
          chainId: 43114,
          forking: {
              url: process.env.FORK_URL_OVERRIDE || "https://optimism.llamarpc.com",
          },
        //   accounts: [
        //     {
        //       balance: "100000000000000000000000000000",
        //       privateKey: process.env.PRIVATE_KEY as string,
        //     },
        //   ],
      },
      polygon: {
        url: "https://polygon.llamarpc.com",
        accounts: [process.env.PRIVATE_KEY as string || '']
      },
      optimism: {
        url: "https://optimism.llamarpc.com",
        accounts: [process.env.PRIVATE_KEY as string || '']
      },
      arbitrum: {
        url: "https://arb1.arbitrum.io/rpc",
        accounts: [process.env.PRIVATE_KEY as string || '']
      },
      fantom: {
        url: "https://rpc.fantom.network",
        accounts: [process.env.PRIVATE_KEY as string || '']
      },
      avalanche: {
        url: "https://1rpc.io/avax/c",
        accounts: [process.env.PRIVATE_KEY as string || '']
      },
      bsc: {
          url: "https://bsc-dataseed1.ninicoin.io",
          accounts: [process.env.PRIVATE_KEY as string || '']
      },
      eth: {
          url: "https://1rpc.io/eth",
          accounts: [process.env.PRIVATE_KEY as string || '']
      },
  },
  etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY || undefined,
  },
  mocha: {
      timeout: 100000000,
  },
  gasReporter: {
      enabled: true,
      currency: "USD",
  },
};

export default config;