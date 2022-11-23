// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol';
import './interfaces/IYieldToken.sol';
import 'hardhat/console.sol';

contract LPToken is ERC20, Ownable {
    using SafeERC20 for IERC20;
    IERC20 public rewardToken;
    IYieldToken public yieldToken;
    uint rewardPerShare;
    uint yieldSupplySnap = 0;
    uint balanceSnap;
    uint rewardPerYield;
    uint previousDepositAmount;
    mapping(address => uint) public stakeAddressSnapshot;

    uint constant STAKE_DENOMINATOR = 1000000;

    constructor(ERC20 _token, IYieldToken _yieldToken) ERC20('LPToken', 'LPT') {
        rewardPerShare = 0;
        rewardToken = _token;
        previousDepositAmount = 0;
        balanceSnap = 0;
        yieldToken = _yieldToken;
    }

    function mint(address account, uint256 amount) public onlyOwner returns (bool) {
        yieldToken.mint(account, amount);
        stakeAddressSnapshot[account] = rewardPerShare;
        _mint(account, amount);
        return true;
    }

    function burn(address account, uint256 amount) public onlyOwner returns (bool) {
        require(balanceOf(account) >= amount, 'burn amount exceeds balance');
        uint supplySnap = this.totalSupply();
        _burn(account, amount);
        yieldToken.burn(
            account,
            (((amount * STAKE_DENOMINATOR) / supplySnap) * yieldToken.balanceOf(account)) / STAKE_DENOMINATOR
        );
        stakeAddressSnapshot[account] = rewardPerShare;
        return true;
    }

    function distributeReward(uint reward) internal {
        require(this.totalSupply() > 0, 'this.totalSupply() is zero');
        balanceSnap += reward;
        rewardPerShare += (reward * STAKE_DENOMINATOR) / this.totalSupply();
        //TODO use yield token instead of lp token
    }

    function collectRewards(address to) public {
        uint rewards = (rewardToken.balanceOf(address(this)) - balanceSnap);
        if (rewards > 0) {
            console.log('rewards', rewards);
            distributeReward(rewards);
        }
        previousDepositAmount = this.totalSupply();
        uint userReward2 = ((rewardPerShare - stakeAddressSnapshot[to]) * this.balanceOf(to)) / (STAKE_DENOMINATOR);
        uint userReward = ((rewardPerShare - stakeAddressSnapshot[to]) *
            ((this.totalSupply() * yieldToken.balanceOf(to)) / yieldToken.totalMinted())) / (STAKE_DENOMINATOR);
        console.log('userRewardPerYield', userReward2);
        console.log('userReward', userReward);
        console.log('user balance', yieldToken.balanceOf(to));
        console.log('rewardPerShare', rewardPerShare);
        console.log('rewardToken', rewardToken.balanceOf(address(this)));
        rewardToken.safeTransfer(to, userReward);
        stakeAddressSnapshot[to] = rewardPerShare;

        balanceSnap -= userReward;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        if (to != address(0)) {
            yieldToken.claim(to);
            collectRewards(to);
        }
        if (from != address(0)) {
            yieldToken.claim(from);
            collectRewards(from);
        }
    }
}
