const { expect } = require("chai");

describe("Harbergia contract", function () {
  let HarbergiaContract;
  let harbergia;
  let owner;
  let addr1;

  beforeEach(async function () {
    HarbergiaContract = await ethers.getContractFactory("Harbergia");
    [owner, addr1] = await ethers.getSigners();

    harbergia = await HarbergiaContract.deploy();
    await harbergia.deployed();
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
});
