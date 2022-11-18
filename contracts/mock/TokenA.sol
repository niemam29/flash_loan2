// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract TokenA is ERC20, Ownable {
    uint8 tokenDecimals;
    string tokenName;
    string tokenSymbol;

    constructor(string memory name, string memory symbol, uint8 desiredDecimals) ERC20(name, symbol) {
        tokenDecimals = desiredDecimals;
        tokenName = name;
        tokenSymbol = symbol;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return tokenDecimals;
    }

    function name() public view virtual override returns (string memory) {
        return tokenName;
    }

    function symbol() public view virtual override returns (string memory) {
        return tokenSymbol;
    }
}
