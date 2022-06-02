const hre = require("hardhat");
const ethers = hre.ethers

async function main() {
    const [signer] = await ethers.getSigners()

    const Election = await ethers.getContractFactory("AddElection", signer)
    const donat = await Election.deploy()

    await donat.deployed();
    console.log(donat.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });