
task("finish", "finish voting")
.addParam("contract", "The Election contract address.")
.setAction(async (taskArgs, hre) => {
  const { contract } = taskArgs;

  const Election = await hre.ethers.getContractAt( "Election", contract);
  await Election.Finish();
  console.log(`You have completed the voting`);
})