//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Harbergia is ERC20 {
    address public owner;// TODO: rename this and/or default_owner to make it clear what it is exactly

    uint map_size;

    address default_owner;
    uint default_price;
    string default_color;

    mapping(uint => address) public owners;
    mapping(uint => uint) public prices;
    mapping(uint => string) public colors;

    constructor() ERC20("Harbergia Decentralised Guilder", "HDG") {
        map_size = 16*9*10;
        default_owner = address(this);
        default_price = 0;
        default_color = "000000";
        owner = msg.sender;

        mint(1000000 * 10**super.decimals());
    }

    function mint(uint amount) public {
        require(msg.sender == owner, "Only owner is allowed to mint");
        _mint(owner, amount);
    }

    function getParcelInfo(uint parcelId) public view returns (address, uint, string memory) {
        require(parcelId < map_size, "Inexisting Parcel");

        if (owners[parcelId] != 0x0000000000000000000000000000000000000000) {
            return (owners[parcelId], prices[parcelId], (bytes(colors[parcelId]).length == 0 ? default_color : colors[parcelId]));
        }

        return (default_owner, default_price, default_color);
    }

    function buyParcel(uint parcelId, uint price, uint reselling_price) external {
        require(parcelId < map_size, "Inexisting Parcel");
        require(price == prices[parcelId], "Parcel must be bought at current offering price");
        require(balanceOf(msg.sender) >= price, "Balance of message sender must be higher than price");

        if (owners[parcelId] != 0x0000000000000000000000000000000000000000) {
            transfer(owners[parcelId], prices[parcelId]);
        } else {
            transfer(default_owner, default_price);
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

