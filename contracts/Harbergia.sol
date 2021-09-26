//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./HDG.sol";

contract Harbergia {
    uint map_size;

    address default_owner;
    HDG bank;
    uint default_price;
    string default_color;

    mapping(uint => address) public owners;
    mapping(uint => uint) public prices;
    mapping(uint => string) public colors;

    constructor(address bank_address) {
        map_size = 16*9*10;
        default_owner = address(this);
        default_price = 0;
        default_color = "000000";
        bank = HDG(bank_address);
    }

    function getParcelInfo(uint parcelId) public view returns (address, uint, string memory) {
        require(parcelId < map_size, "Inexisting Parcel");

        if (owners[parcelId] != 0x0000000000000000000000000000000000000000) {
            return (owners[parcelId], prices[parcelId], (bytes(colors[parcelId]).length == 0 ? default_color : colors[parcelId]));
        }

        return (default_owner, default_price, default_color);
    }

    function getBankAddress() public view returns (address) {
        return address(bank);
    }

    function buyParcel(uint parcelId, uint price, uint reselling_price) external {
        require(parcelId < map_size, "Inexisting Parcel");
        require(price == prices[parcelId], "Parcel must be bought at current offering price");

        // TODO: now somehow import the HDG smart contract and interact with it

        // TODO: if enough money, then transfer
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

