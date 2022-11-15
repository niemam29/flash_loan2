// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol';
import 'hardhat/console.sol';

contract LPToken is ERC20Wrapper, Ownable {
    using SafeERC20 for IERC20;
    IERC20 rewardToken;
    uint rewardPerShare;
    uint depositSnap;
    uint balanceSnap;
    uint previousDepositAmount;
    mapping(address => uint) public stakeAddressAmount;
    mapping(address => uint) public stakeAddressSnapshot;

    uint constant STAKE_DENOMINATOR = 100000;

    constructor(IERC20 _token) ERC20Wrapper(_token) ERC20('LPToken', 'LPT') {
        rewardPerShare = 0;
        rewardToken = _token;
        previousDepositAmount = 0;
        depositSnap = 0;
        balanceSnap = 0;
    }

    function depositFor(address account, uint256 amount) public override returns (bool) {
        stakeAddressAmount[account] += amount;
        stakeAddressSnapshot[account] = rewardPerShare;
        super.depositFor(account, amount);
        return true;
    }

    function withdrawTo(address account, uint256 amount) public override returns (bool) {
        super.withdrawTo(account, amount);
        stakeAddressAmount[account] -= amount;
        stakeAddressSnapshot[account] = rewardPerShare;
        return true;
    }

    function distributeReward(uint reward) internal {
        require(this.totalSupply() > 0, 'this.totalSupply() is zero');
        rewardPerShare += (reward * STAKE_DENOMINATOR) / this.totalSupply(); // INVESTIGATE - 6 DECIMALS
    }

    function collectRewards(address to) public {
        uint rew = (rewardToken.balanceOf(address(this)) - this.totalSupply()) - (balanceSnap - depositSnap);
        if (rew > 0) {
            distributeReward(rew);
        }
        previousDepositAmount = this.totalSupply();
        uint reward = ((rewardPerShare - stakeAddressSnapshot[to]) * this.balanceOf(to)) / (STAKE_DENOMINATOR);
        rewardToken.safeTransfer(to, reward);
        stakeAddressSnapshot[to] = rewardPerShare;

        depositSnap = this.totalSupply();
        balanceSnap = rewardToken.balanceOf(address(this));
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        if (from != address(this) && from != address(0) && to != address(0)) {
            collectRewards(to);
        }
    }
}
