const { parse } = require("dotenv");
const { isAddress } = require("ethers/lib/utils");

require("@nomiclabs/hardhat-web3")

task("createVote", "Create a vote")
.addParam("contract", "The Election contract address.")
.addParam("topic", "Subject for voting.")
.setAction(async (taskArgs, hre) => {

  const { contract, topic } = taskArgs;
  let Topic = toString(topic);

  const Election = await hre.ethers.getContractAt( "electionCreation", contract);
  Election = await Election.StartElection(Topic);
  await Election.wait();

  let number = await Election.GetElectionNumber();
  number = parseInt(number) - 1;
  let electionAddress = await (await Election.CreatedElections(number - 1)).ElectionAddress;

  console.log(`address of the new vote: ${electionAddress}`);
})

module.exports = {}