//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "hardhat/console.sol";

contract Harbergia {
    uint map_size;

    address default_owner;
    uint default_price;
    string default_color;

    mapping(uint => address) public owners;
    mapping(uint => uint) public prices;
    mapping(uint => string) public colors;

    constructor() {
        map_size = 16*9*10;
        default_owner = address(this);
        default_price = 1;
        default_color = "000000";
    }

    function getParcelInfo(uint parcelId) public view returns (address, uint, string memory) {
        require(parcelId < map_size, "Inexisting Parcel");

        if (owners[parcelId] != 0x0000000000000000000000000000000000000000) {
            return (owners[parcelId], prices[parcelId], colors[parcelId]);
        }

        return (default_owner, default_price, default_color);
    }
}

