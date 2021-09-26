//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Harbergia is ERC20 {
    address contract_owner;

    uint map_size;

    address default_parcel_owner;
    uint default_parcel_price;
    string default_parcel_color;

    mapping(uint => address) owners;
    mapping(uint => uint) prices;
    mapping(uint => string) colors;

    constructor() ERC20("Harbergia Decentralised Guilder", "HDG") {
        map_size = 16*9*10;
        default_parcel_owner = address(this);// by default Harbergia (so the contract itself) owns all the parcels
        default_parcel_price = 0;
        default_parcel_color = "000000";
        contract_owner = msg.sender;

        mint(1000000 * 10**super.decimals());
    }

    function mint(uint amount) public {
        require(msg.sender == contract_owner, "Only contract owner is allowed to mint");
        _mint(contract_owner, amount);
    }

    function getParcelInfo(uint parcelId) public view returns (address, uint, string memory) {
        require(parcelId < map_size, "Inexisting Parcel");

        if (owners[parcelId] != 0x0000000000000000000000000000000000000000) {
            return (owners[parcelId], prices[parcelId], (bytes(colors[parcelId]).length == 0 ? default_parcel_color : colors[parcelId]));
        }

        return (default_parcel_owner, default_parcel_price, default_parcel_color);
    }

    function buyParcel(uint parcelId, uint price, uint reselling_price) external {
        require(parcelId < map_size, "Inexisting Parcel");
        require(price == prices[parcelId], "Parcel must be bought at current offering price");
        require(balanceOf(msg.sender) >= price, "Balance of message sender must be higher than price");

        if (owners[parcelId] != 0x0000000000000000000000000000000000000000) {
            transfer(owners[parcelId], prices[parcelId]);
        } else {
            transfer(default_parcel_owner, default_parcel_price);
        }

        owners[parcelId] = msg.sender;
        prices[parcelId] = reselling_price;
    }

    function setParcelColor(uint parcelId, string memory new_color) external {
        require(parcelId < map_size, "Inexisting Parcel");
        require(owners[parcelId] == msg.sender, "Only parcel owner can change color");

        // TODO: check if this is a valid color
        colors[parcelId] = new_color;
    }
}

