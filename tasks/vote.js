
task("Vote", "Vote for a candidate")
.addParam("contract", "The electionCreation contract address.")
.addParam("candidate", "the candidate you want to vote for.")
.setAction(async (taskArgs, hre) => {
  const { contract, candidate } = taskArgs;

  const Election = await hre.ethers.getContractAt( "Election", contract);
  await Election.Vote(candidate, {value: ethers.utils.parseEther("0.01")});
  console.log(`You voted`);
})