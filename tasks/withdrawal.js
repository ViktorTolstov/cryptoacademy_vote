task("withdrawal", "remove the commission")
.addParam("contract", "The Election contract address.")
.addParam("address", "the address to which you want to transfer money")
.setAction(async (taskArgs, hre) => {
  const { contract, address } = taskArgs;

  const Election = await hre.ethers.getContractAt( "Election", contract);
  await Election.Withdrawal(address);
  console.log(`You have debited money`);
})