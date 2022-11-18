// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol';

contract YieldToken is ERC20, Ownable {
    using SafeERC20 for IERC20;
    uint startBlock;
    uint mintingRate = 100;

    ERC20 trackedToken;

    mapping(address => uint) public mintedBlocks;
    mapping(address => uint) public userStartBlock;

    constructor(address _trackedToken) ERC20('YieldToken', 'YLT') {
        startBlock = block.number;
        trackedToken = ERC20(_trackedToken);
    }

    function burn(address account, uint256 amount) public onlyOwner returns (bool) {
        _burn(account, amount);
        return true;
    }

    function claim(address to) public onlyOwner {
        require(userStartBlock[to] > 0, 'user has not started');

        uint reward = ((((block.number - userStartBlock[to])) * mintingRate) * trackedToken.balanceOf(address(to))) /
            trackedToken.totalSupply();
        _mint(to, reward);
        userStartBlock[to] = block.number;
    }

    function setMiningRate(uint rate) public onlyOwner {
        mintingRate = rate;
    }

    function startYield(address to) public onlyOwner {
        userStartBlock[to] = block.number;
    }
}
