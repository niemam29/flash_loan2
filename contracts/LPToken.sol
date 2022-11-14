// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import 'hardhat/console.sol';

contract LPToken is ERC20, ERC20Burnable, Ownable {
    using SafeERC20 for ERC20;
    ERC20 tokenA;
    uint totalTokenAmount;
    uint stakeParameter;
    address liquidityPoolAddress;
    mapping(address => uint) public stakeAddressAmount;
    mapping(address => uint) public stakeAddressSnapshot;

    uint constant STAKE_DENOMINATOR = 1000000;

    constructor(address _token, address _liquidityPool) ERC20('LPToken', 'LPT') {
        stakeParameter = 0;
        totalTokenAmount = 0;
        tokenA = ERC20(_token);
        liquidityPoolAddress = _liquidityPool;
    }

    function mintLPToken(address to, uint256 amount) public onlyOwner {
        console.log('minting %s', amount);
        _mint(to, amount);
        stakeAddressAmount[to] = amount;
        stakeAddressSnapshot[to] = totalTokenAmount;

        totalTokenAmount += amount;
    }

    function burnLPToken(address from, uint256 amount) public onlyOwner {
        stakeAddressAmount[from] -= amount;
        stakeAddressSnapshot[from] = totalTokenAmount;

        totalTokenAmount -= amount;
        console.log(amount);
        console.log(balanceOf(address(this)));
        burnFrom(from, amount);
    }

    function distributeReward(uint reward) internal {
        require(totalTokenAmount > 0, 'totalTokenAmount is zero');
        console.log('reward: %s', reward);
        console.log('totalTokenAmount: %s', totalTokenAmount);
        console.log('st: %s', (5000 / totalTokenAmount));
        stakeParameter = (((stakeParameter + reward) * STAKE_DENOMINATOR) / totalTokenAmount); // INVESTIGATE - 6 DECIMALS
        console.log('stakeParameter: %s', stakeParameter);
    }

    function collectRewards(address to) public {
        uint reward = ((stakeParameter - stakeAddressSnapshot[to]) * ERC20.balanceOf(to)) / STAKE_DENOMINATOR;

        require(stakeAddressAmount[to] == this.balanceOf(to), 'Stake amount invalid');

        console.log('reward: %s', reward);
        console.log('stake: %s', stakeParameter);
        tokenA.safeTransfer(to, reward);

        stakeAddressSnapshot[to] = stakeParameter;
    }

    function depositReward(uint256 amount) public onlyOwner {
        tokenA.safeTransferFrom(msg.sender, address(this), amount);
        distributeReward(amount);
    }
}
