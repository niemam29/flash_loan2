// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol';

contract YieldToken is ERC20, Ownable {
    using SafeERC20 for IERC20;
    IERC20 public rewardToken;
    uint rewardPerShare;
    uint balanceSnap;

    uint startBlock;
    uint public mintingRate;
    uint rewardSnap = 0;
    uint totalSupplyWhenMintingRateWasSet = 0;

    mapping(address => uint) public userStartBlock;
    mapping(address => uint) public stakeAddressSnapshot;
    mapping(address => uint) public userBalanceSnap;

    uint constant STAKE_DENOMINATOR = 1000000;

    constructor(ERC20 _token, uint _toMintPerBlock) ERC20('YieldToken', 'YTK') {
        rewardPerShare = 0;
        rewardToken = _token;
        balanceSnap = 0;
        startBlock = block.number;
        mintingRate = _toMintPerBlock;
    }

    function mint(address account, uint256 amount) public returns (bool) {
        userStartBlock[account] = block.number;
        balanceSnap += amount;
        _mint(account, amount);
        userBalanceSnap[account] += amount;
        return true;
    }

    function burn(address account, uint256 amount) public onlyOwner returns (bool) {
        _burn(account, amount);
        balanceSnap -= amount;
        userBalanceSnap[account] -= amount;
        stakeAddressSnapshot[account] = rewardPerShare;
        return true;
    }

    function distributeReward(uint reward) internal {
        require(this.totalSupply() > 0, 'this.totalSupply() is zero');
        rewardPerShare += (reward * STAKE_DENOMINATOR) / this.totalSupply();
    }

    function claim(address to) public {
        if (block.number - userStartBlock[to] > 0 && this.balanceOf(to) > 0) {
            uint rewards = ((totalMinted() > rewardSnap) ? (totalMinted() - rewardSnap) : 0);

            distributeReward(rewards);
            uint userReward = ((rewardPerShare * this.balanceOf(to)) / STAKE_DENOMINATOR > userBalanceSnap[to])
                ? ((rewardPerShare * this.balanceOf(to)) / STAKE_DENOMINATOR) - userBalanceSnap[to]
                : 0;
            mint(to, userReward);
            stakeAddressSnapshot[to] = rewardPerShare;
            rewardSnap = totalMinted();
            userBalanceSnap[to] += userReward;
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        if (to != address(0)) {
            claim(to);
        }
        if (from != address(0)) {
            claim(from);
        }
    }

    function setMiningRate(uint rate) public onlyOwner returns (bool) {
        totalSupplyWhenMintingRateWasSet += (block.number - startBlock) * mintingRate;
        mintingRate = rate;
        startBlock = block.number;
        return true;
    }

    function totalMinted() public view returns (uint) {
        return ((((block.number - startBlock)) * mintingRate)) + totalSupplyWhenMintingRateWasSet + balanceSnap;
    }
}
