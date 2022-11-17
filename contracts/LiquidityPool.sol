pragma solidity ^0.8.0;

import './FlashLoan.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './interfaces/IERC3156FlashLender.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './interfaces/ILPToken.sol';

contract LiquidityPool is Ownable {
    using SafeERC20 for IERC20;
    using SafeERC20 for ILPToken;
    ILPToken public lpToken;
    ERC20 rewardToken;
    uint decimalDiff;

    constructor(ERC20 _rewardToken, address _lpToken) {
        lpToken = ILPToken(_lpToken);
        rewardToken = _rewardToken;
        decimalDiff = (_rewardToken.decimals() > ERC20(address(lpToken)).decimals())
            ? _rewardToken.decimals() - ERC20(address(lpToken)).decimals()
            : ERC20(address(lpToken)).decimals() - _rewardToken.decimals();
    }

    function deposit(uint amountInRewardToken) public {
        if (rewardToken.decimals() > ERC20(address(lpToken)).decimals()) {
            require(amountInRewardToken / 10 ** decimalDiff > 0, 'amount is too small');
            lpToken.rewardToken().safeTransferFrom(msg.sender, address(this), amountInRewardToken);
            lpToken.mint(msg.sender, amountInRewardToken / 10 ** decimalDiff);
        } else {
            lpToken.rewardToken().safeTransferFrom(msg.sender, address(this), amountInRewardToken);
            lpToken.mint(msg.sender, amountInRewardToken * 10 ** decimalDiff);
        }
    }

    function withdraw(uint amountInRewardToken) public {
        if (rewardToken.decimals() > ERC20(address(lpToken)).decimals()) {
            require(amountInRewardToken / 10 ** decimalDiff > 0, 'amount is too small');
            lpToken.burn(msg.sender, amountInRewardToken / (10 ** decimalDiff));
            lpToken.rewardToken().safeTransfer(msg.sender, amountInRewardToken);
        } else {
            lpToken.burn(msg.sender, amountInRewardToken * (10 ** decimalDiff));
            lpToken.rewardToken().safeTransfer(msg.sender, amountInRewardToken);
        }
    }

    function useLiquidity(address receiver) public onlyOwner {
        SafeERC20.safeApprove(rewardToken, receiver, type(uint).max);
    }
}
