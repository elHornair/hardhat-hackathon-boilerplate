const { expect } = require("chai");
const {BigNumber} = require("ethers");

function amountToNativeValue(amount) {
  return BigNumber.from(amount).mul(BigNumber.from(10).pow(18));
}

describe("Harbergia contract", function () {
  let HarbergiaContract;
  let harbergia;

  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    HarbergiaContract = await ethers.getContractFactory("Harbergia");
    [owner, addr1, addr2] = await ethers.getSigners();

    harbergia = await HarbergiaContract.deploy();
    await harbergia.deployed();
  });

  describe("Deployment", function () {
    it("Should set decimals to 18", async function () {
      expect(await harbergia.decimals()).to.equal(18);
    });

    it("Should mint one million as initial amount", async function () {
      expect(await harbergia.totalSupply()).to.equal(amountToNativeValue(1000000));
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await harbergia.balanceOf(owner.address);
      expect(await harbergia.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Minting", function () {
    it("Should fail if non owner attempts to mint", async function () {
      await expect(harbergia.connect(addr1).mint(1000)).to.be.revertedWith("Only contract owner is allowed to mint");
    });

    it("Should allow owner to mint", async function () {
      const initialSupply = await harbergia.totalSupply();
      const amountToMint = amountToNativeValue(1000);
      await harbergia.connect(owner).mint(amountToMint);
      const updatedSupply = await harbergia.totalSupply();

      expect(updatedSupply).to.equal(initialSupply.add(amountToMint));
      expect(initialSupply.toString()).to.equal('1000000000000000000000000');
      expect(updatedSupply.toString()).to.equal('1001000000000000000000000');
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const initialBalance = await harbergia.balanceOf(addr1.address);
      const amountToSend = amountToNativeValue(20);
      await harbergia.connect(owner).transfer(addr1.address, amountToSend);
      const updatedBalance = await harbergia.balanceOf(addr1.address);

      expect(initialBalance).to.equal(amountToNativeValue(0));
      expect(updatedBalance).to.equal(amountToSend);
    });
  });

  describe("Parcel info", async function () {
    it("Should fail if parcel doesn't exist", async function () {
      await expect(harbergia.getParcelInfo(99999)).to.be.revertedWith("Inexisting Parcel");
    });

    it("Should return the correct default values for unclaimed parcels", async function () {
      const parcelInfo = await harbergia.getParcelInfo(0);

      expect(parcelInfo[0]).to.equal(harbergia.address);// harbergia.address is the contracts address
      expect(parcelInfo[1]).to.equal(0);
      expect(parcelInfo[2]).to.equal('000000');
    });
  });

  describe("Buy parcel", async function () {
    it("Should fail if parcel doesn't exist", async function () {
      await expect(harbergia.connect(addr1).buyParcel(99999, 0, 2)).to.be.revertedWith("Inexisting Parcel");
    });

    it("Should fail if parcel price is too low", async function () {
      await harbergia.connect(addr1).buyParcel(0, 0, 1);
      await expect(harbergia.connect(addr1).buyParcel(0, 0, 1)).to.be.revertedWith("Parcel must be bought at current offering price");
    });

    it("Should fail if parcel price is too high", async function () {
      await expect(harbergia.connect(addr1).buyParcel(0, 2, 3)).to.be.revertedWith("Parcel must be bought at current offering price");
    });

    it("Should change the owner and price, but not the color", async function () {
      await harbergia.connect(addr1).buyParcel(1, 0, 5);
      const parcelInfo = await harbergia.getParcelInfo(1);

      expect(parcelInfo[0]).to.equal(addr1.address);
      expect(parcelInfo[1]).to.equal(5);
      expect(parcelInfo[2]).to.equal('000000');
    });

    it("Should fail if buyer's balance is too low", async function () {
      await harbergia.connect(addr1).buyParcel(2, 0, 2);
      await expect(harbergia.connect(addr2).buyParcel(2, 2, 3)).to.be.revertedWith("Balance of message sender must be higher than price");
    });

    it("Should transfer ownership and tokens correctly", async function () {
      // give some money to addr2
      await harbergia.connect(owner).transfer(addr2.address, amountToNativeValue(20));

      // addr1 buys it from Harbergia
      await harbergia.connect(addr1).buyParcel(3, 0, amountToNativeValue(2));
      const parcelInfo = await harbergia.getParcelInfo(3);
      expect(parcelInfo[0]).to.equal(addr1.address);

      // addr2 buys it from addr1
      await harbergia.connect(addr2).buyParcel(3, amountToNativeValue(2), amountToNativeValue(3));

      const parcelInfoNew = await harbergia.getParcelInfo(3);
      expect(parcelInfoNew[0]).to.equal(addr2.address);

      expect(await harbergia.balanceOf(addr1.address)).to.equal(amountToNativeValue(2));
      expect(await harbergia.balanceOf(addr2.address)).to.equal(amountToNativeValue(18));
    });
  });

  describe("Set parcel color", async function () {
    it("Should fail if parcel doesn't exist", async function () {
      await expect(harbergia.connect(addr1).setParcelColor(99999, 'FF0000')).to.be.revertedWith("Inexisting Parcel");
    });

    it("Should fail if the caller is not the parcel owner", async function () {
      await expect(harbergia.connect(addr1).setParcelColor(0, 'FF0000')).to.be.revertedWith("Only parcel owner can change color");
    });

    it("Should correctly set the color if the parameters are correct", async function () {
      const originalParcelInfo = await harbergia.getParcelInfo(0);
      expect(originalParcelInfo[2]).to.equal('000000');

      await harbergia.connect(addr1).buyParcel(0, 0, 2);
      await harbergia.connect(addr1).setParcelColor(0, 'FF0000');

      const updatedParcelInfo = await harbergia.getParcelInfo(0);
      expect(updatedParcelInfo[2]).to.equal('FF0000');
    });
  });
});
