task("addCandidate", "Add a candidate")
.addParam("contract", "The Election contract address.")
.addParam("candidate", "the address of the candidate you want to add.")
.addParam("name", "the name of the candidate you want to add.")
.setAction(async (taskArgs, hre) => {
  const { contract, candidate, name } = taskArgs;

  const Election = await hre.ethers.getContractAt( "Election", contract);
  await Election.AddCandidate(name, candidate);
  console.log(`You have added a candidate ${name}`);
})