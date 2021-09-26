const { expect } = require("chai");
const {BigNumber} = require("ethers");

describe("HDG token contract", function () {

  let HDGContract;
  let hdgInstance;

  let owner;
  let addr1;

  beforeEach(async function () {
    HDGContract = await ethers.getContractFactory("HDG");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    hdgInstance = await HDGContract.deploy();
    await hdgInstance.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hdgInstance.owner()).to.equal(owner.address);
    });

    it("Should set decimals to 18", async function () {
      expect(await hdgInstance.decimals()).to.equal(18);
    });

    it("Should mint one million as initial amount", async function () {
      expect(await hdgInstance.totalSupply()).to.equal(BigNumber.from(1000000).mul(BigNumber.from(10).pow(18)));
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await hdgInstance.balanceOf(owner.address);
      expect(await hdgInstance.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Minting", function () {
    it("Should fail if non owner attempts to mint", async function () {
      await expect(hdgInstance.connect(addr1).mint(1000)).to.be.revertedWith("Only owner is allowed to mint");
    });

    it("Should allow owner to mint", async function () {
      const initialSupply = await hdgInstance.totalSupply();
      const amountToMint = BigNumber.from(1000).mul(BigNumber.from(10).pow(18));
      await hdgInstance.connect(owner).mint(amountToMint);
      const updatedSupply = await hdgInstance.totalSupply();

      expect(updatedSupply).to.equal(initialSupply.add(amountToMint));
      expect(initialSupply.toString()).to.equal('1000000000000000000000000');
      expect(updatedSupply.toString()).to.equal('1001000000000000000000000');
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const initialBalance = await hdgInstance.balanceOf(addr1.address);
      const amountToSend = BigNumber.from(20).mul(BigNumber.from(10).pow(18));
      await hdgInstance.connect(owner).transfer(addr1.address, amountToSend);
      const updatedBalance = await hdgInstance.balanceOf(addr1.address);

      expect(initialBalance).to.equal(BigNumber.from(0).mul(BigNumber.from(10).pow(18)));
      expect(updatedBalance).to.equal(amountToSend);
    });
  });
});
