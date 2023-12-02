require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const privateKey = process.env.PRIVATE_KEY;
const etherscanKey = process.env.ETHERSCAN_KEY;
const polygonscanKey = process.env.POLYGONSCAN_KEY;
const bscscanKey = process.env.BSCSCAN_KEY;
const baseKey = process.env.BASE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  zksolc: {
    version: "1.3.9",
    compilerSource: "binary",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`${privateKey}`],
      chainId: 5,
    },
    hardhat: {
      chainId: 1337,
    },
    base: {
      url: 'https://base.rpc.thirdweb.com',
      chainId: 8453,
      accounts: [`${privateKey}`],
      gasPrice: 1000000000,
    },
    baseGoerli: {
      url: "https://goerli.base.org",
      chainId: 84531,
      accounts: [`${privateKey}`],
      gasPrice: 1000000000,
    },
    bscTestnet: {
      url: 'https://binance-testnet.rpc.thirdweb.com',
      chainId: 97,
      accounts: [`${privateKey}`],
      gasPrice: 'auto',
    },
  },
  paths: {
    artifacts: "./artifacts-zk",
    cache: "./cache-zk",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: {
      goerli: etherscanKey,
      mainnet: etherscanKey,
      polygonMumbai: polygonscanKey,
      bscTestnet: bscscanKey,
      bsc: bscscanKey,
      base: baseKey,
      baseGoerli: baseKey,
    },
  },
  customChains: [
    {
      network: "base-goerli",
      chainId: 84531,
      urls: {
       apiURL: "https://api-goerli.basescan.org/api",
       browserURL: "https://goerli.basescan.org"
      }
    },
    {
      network: "base",
      chainId: 8453,
      urls: {
        apiURL: "https://api.basescan.org/api",
        browserURL: "https://basescan.org"
      }
    }
  ]
};
