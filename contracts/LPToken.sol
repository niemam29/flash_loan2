// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol';

contract LPToken is ERC20, Ownable {
    using SafeERC20 for IERC20;
    IERC20 public rewardToken;
    uint rewardPerShare;
    uint balanceSnap;
    uint previousDepositAmount;
    mapping(address => uint) public stakeAddressSnapshot;

    uint constant STAKE_DENOMINATOR = 100000;

    constructor(ERC20 _token) ERC20('LPToken', 'LPT') {
        rewardPerShare = 0;
        rewardToken = _token;
        previousDepositAmount = 0;
        balanceSnap = 0;
    }

    function mint(address account, uint256 amount) public onlyOwner returns (bool) {
        _mint(account, amount);
        return true;
    }

    function burn(address account, uint256 amount) public onlyOwner returns (bool) {
        _burn(account, amount);
        stakeAddressSnapshot[account] = rewardPerShare;
        return true;
    }

    function distributeReward(uint reward) internal {
        require(this.totalSupply() > 0, 'this.totalSupply() is zero');
        balanceSnap += reward;
        rewardPerShare += (reward * STAKE_DENOMINATOR) / this.totalSupply();
    }

    function collectRewards(address to) public {
        uint rewards = (rewardToken.balanceOf(address(this)) - balanceSnap);
        if (rewards > 0) {
            distributeReward(rewards);
        }

        previousDepositAmount = this.totalSupply();
        uint userReward = ((rewardPerShare - stakeAddressSnapshot[to]) * this.balanceOf(to)) / (STAKE_DENOMINATOR);
        rewardToken.safeTransfer(to, userReward);
        stakeAddressSnapshot[to] = rewardPerShare;

        balanceSnap -= userReward;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        if (to != address(0)) {
            collectRewards(to);
        }
        if (from != address(0)) {
            collectRewards(from);
        }
    }

    receive() external payable {}
}
