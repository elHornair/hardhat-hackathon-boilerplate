//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract HDG is ERC20 {
    address public owner;

    constructor() ERC20("Harbergia Decentralised Guilder", "HDG") {
        owner = msg.sender;
        mint(1000000 * 10**super.decimals());
    }

    function mint(uint amount) public {
        require(msg.sender == owner, "Only owner is allowed to mint");
        _mint(owner, amount);
    }
}
