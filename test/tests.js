const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('AddElection Tests', function () {
    let owner;
    let acc2;
    let election;

    beforeEach(async function(){
        [owner, acc2] = await ethers.getSigners();
        Election = await ethers.getContractFactory("AddElection", owner);
        election = await Election.deploy();
        await election.deployed();
    })

    it('Other addresses cannot expand the contract', async function () {
        await expect(election.connect(acc2).StartElection("Test")).to.be.revertedWith('error: do not enough rights - must be owner');
    })

    it("Sets owner", async function() {
        const currentOwner = await election.Owner();
        expect(currentOwner).to.eq(owner.address);
      })
    
    it("Sets address", async function() {
        const currentAddress = await election.address;
        expect(currentAddress).to.eq(await election.ContractAddress());
      })

    it("A vote is created with the correct topic", async function() {
        await election.StartElection("Test");
        election = await election.CreatedElections(0);
        expect(election.Topic).to.eq("Test");
      })

    it('The function returns the correct number of votes created', async function () {
        await election.StartElection("Test1");
        await election.StartElection("Test2");
        await election.StartElection("Test3");

        expect(await election.GetElectionNumber()).to.eq(3);
    })
  })

  describe('Elections Tests', function () {
    let owner;
    let acc2;
    let acc3;
    let acc4;
    let election;

    beforeEach(async function(){
        [owner, acc2, acc3, acc4] = await ethers.getSigners();
        Election = await ethers.getContractFactory("Election", owner);
        election = await Election.deploy(owner.address, "Test");
        await election.deployed();
    })

    it("Sets owner", async function() {
        const currentOwner = await election.Owner();
        expect(currentOwner).to.eq(owner.address);
      })

    it("Sets address", async function() {
        const currentAddress = await election.address;
        expect(currentAddress).to.eq(await election.ElectionAddress());
    })
      
    it("Only the owner can add a candidate", async function() {
        expect(election.connect(acc2).AddCandidate("Viktor", acc3.address)).to.be.revertedWith("error: do not enough rights - must be owner");

        await election.AddCandidate("Viktor", acc3.address);
        let Viktor = await election.CandidatesList(0);
        expect(Viktor.name).to.eq("Viktor");
        expect(Viktor.voteCount).to.eq(0);
        expect(Viktor.candidateAddress).to.eq(acc3.address);

    })

    it("You cannot add one candidate 2 times", async function() {
        await election.AddCandidate("Viktor", acc3.address);
        await expect(election.AddCandidate("Viktor", acc3.address)).to.be.revertedWith("error: this candidate already exist");
    })

    it("You can't vote if you haven't contributed enough money", async function() {
        await election.AddCandidate("Viktor", acc3.address);
        await expect(election.Vote(acc3.address, {value: ethers.utils.parseEther("0.0001")}))
        .to.be.revertedWith("error: not enough eth in transaction");
    })

    it("You cannot vote more than once", async function() {
        await election.AddCandidate("Viktor", acc3.address);
        await election.Vote(acc3.address, {value: ethers.utils.parseEther("0.1")})
        await expect(election.Vote(acc3.address, {value: ethers.utils.parseEther("0.1")}))
        .to.be.revertedWith("error: second attempt to vote");
    })

    it("You cannot vote for a non-existent candidate", async function() {
        await expect(election.Vote(acc3.address, {value: ethers.utils.parseEther("0.1")}))
        .to.be.revertedWith("error: unknown candidate");
    })

    it("You can't vote if the voting is over", async function() {
        await network.provider.send("evm_increaseTime", [259201]);
        await network.provider.send("evm_mine");
        await election.AddCandidate("Viktor", acc3.address);
        await expect(election.Vote(acc3.address, {value: ethers.utils.parseEther("0.0001")}))
        .to.be.revertedWith("error: elections elready finished");
    })

    it("You can't finish voting earlier than 3 days later", async function() {
        await election.AddCandidate("Viktor", acc3.address);
        await expect(election.Finish())
        .to.be.revertedWith("error: elections not over");
    })

    it("You cannot complete a vote if it has already been completed", async function() {
        await election.AddCandidate("Viktor", acc3.address);
        await network.provider.send("evm_increaseTime", [259201]);
        await network.provider.send("evm_mine");
        await election.Finish();
        await expect(election.Finish())
        .to.be.revertedWith("error: elections already finished");
    })

    it("The owner cannot withdraw the commission if the voting is not completed", async function() {
        await election.AddCandidate("Viktor", acc3.address);
        await network.provider.send("evm_increaseTime", [259201]);
        await network.provider.send("evm_mine");
        await expect(election.Withdrawal(owner.address))
        .to.be.revertedWith("error: elections not overcompleted");
    })

    it("The winner and the owner receive money", async function() {
        await election.AddCandidate("Viktor", acc2.address);
        await election.AddCandidate("Ivan", acc3.address);
        await election.AddCandidate("John", acc4.address);

        let ts = await election.Vote(acc3.address, {value: ethers.utils.parseEther("1")})
        await ts.wait(); 
        ts = await election.connect(acc2).Vote(acc3.address, {value: ethers.utils.parseEther("1")})
        await ts.wait();

        await network.provider.send("evm_increaseTime", [259201]);
        await network.provider.send("evm_mine");

        let beforeBalance = await acc3.getBalance();
        await election.Finish();
        let afterBalance = await acc3.getBalance();

        expect(Math.round((afterBalance - beforeBalance) / 100000000000000000))
        .to.eq(Math.round(1800000000000000000 / 100000000000000000));

        beforeBalance = await owner.getBalance();
        await election.Withdrawal(owner.address);
        afterBalance = await owner.getBalance();

        expect(Math.round((afterBalance - beforeBalance) / 100000000000000000))
        .to.eq(Math.round(200000000000000000 / 100000000000000000));

    })

    it("Other users cannot get the commission.", async function() {

        await election.AddCandidate("Viktor", acc4.address);

        let ts = await election.Vote(acc4.address, {value: ethers.utils.parseEther("1")})
        await ts.wait(); 
        ts = await election.connect(acc2).Vote(acc4.address, {value: ethers.utils.parseEther("1")})
        await ts.wait();

        await network.provider.send("evm_increaseTime", [259201]);
        await network.provider.send("evm_mine");

        await election.Finish();

        await expect(election.connect(acc2).Withdrawal(owner.address))
        .to.be.revertedWith("error: do not enough rights - must be owner");
    })
  })