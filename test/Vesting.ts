import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("Vesting", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
   

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const Token = await hre.ethers.getContractFactory("ERC20Mock");
    const token = await Token.deploy(ethers.parseEther("1000000") );
    await token.waitForDeployment();
    token.transfer(otherAccount, ethers.parseEther("10000"))
    
    //await token.delpoyed();
    const blockTimestamp = (await ethers.provider.getBlock('latest'))?.timestamp;

    const Vesting = await hre.ethers.getContractFactory("Vesting");
    const vesting = await Vesting.deploy(await token.getAddress(), blockTimestamp-100000 , 200000n,300000n, 100000n, await owner.getAddress());
    await vesting.waitForDeployment();
    const startTime = blockTimestamp;
    await token.transfer(await vesting.getAddress(), 100000n);
    console.log(await token.balanceOf(await vesting.getAddress()));
    return { vesting, lockedAmount, owner, otherAccount, token };
  }

  async function deployFixtureVestingPeriodPassed() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
   

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const Token = await hre.ethers.getContractFactory("ERC20Mock");
    const token = await Token.deploy(ethers.parseEther("1000000") );
    await token.waitForDeployment();
    token.transfer(otherAccount, ethers.parseEther("10000"))
    
    //await token.delpoyed();
    const blockTimestamp = (await ethers.provider.getBlock('latest'))?.timestamp;

    const Vesting = await hre.ethers.getContractFactory("Vesting");
    const vesting = await Vesting.deploy(await token.getAddress(), blockTimestamp-10000000 , 100000n,300000n, 100000n, await owner.getAddress());
    await vesting.waitForDeployment();
    const startTime = blockTimestamp;
    await token.transfer(await vesting.getAddress(), 100000n);
    console.log(await token.balanceOf(await vesting.getAddress()));
    return { vesting, lockedAmount, owner, otherAccount, token };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { vesting } = await loadFixture(deployOneYearLockFixture);

     // expect(await lock.unlockTime()).to.equal(unlockTime);
    });

    it("Before the Cliff ", async function() {
      const { vesting } = await loadFixture(deployOneYearLockFixture);
      await expect (await vesting.release()).to.be.reverted
    });

    it("After the Cliff ", async function() {
      const { vesting } = await loadFixture(deployOneYearLockFixture);
      await vesting.release()
    });

    
    it("Full vesting  ", async function() {
      const { vesting,token,owner } = await loadFixture(deployFixtureVestingPeriodPassed);
      const initBalance = await token.balanceOf(await owner.getAddress())
      expect (await vesting.release()).to.not.be.reverted
      
      console.log(await token.balanceOf(await vesting.getAddress()))
      expect (await token.balanceOf(await owner.getAddress())- initBalance).to.be.equal(100000n)
      expect (await token.balanceOf(await vesting.getAddress())).to.be.equal(0)
    });

  
  });
});
