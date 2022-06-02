require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("solidity-coverage");
require("dotenv").config();

require("./tasks/createVote");
require("./tasks/addCandidate");
require("./tasks/vote");
require("./tasks/finish");
require("./tasks/withdrawal");
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  networks: {
    hardhat:{},
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.PROJECT_ID}`,
      accounts: ["3d8dd5737437d3de31322735a0a9f145ab80389a7092cd70de97d85c28743237"]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};