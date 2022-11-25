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

    event Deposit(
        address indexed _from,
        uint _valueRewardToken,
        uint _valueLiquidityToken,
        LiquidityPool indexed _pool
    );
    event Withdraw(address indexed _to, uint _valueRewardToken, uint _valueLiquidityToken, LiquidityPool indexed _pool);
    event Pool(address indexed _tokenAAdress, address indexed _tokenBAdress, uint price, address indexed _poolAdress);

    constructor(ERC20 _rewardToken, address _lpToken) {
        lpToken = ILPToken(_lpToken);
        rewardToken = _rewardToken;
        decimalDiff = (_rewardToken.decimals() > ERC20(address(lpToken)).decimals())
            ? _rewardToken.decimals() - ERC20(address(lpToken)).decimals()
            : ERC20(address(lpToken)).decimals() - _rewardToken.decimals();
        emit Pool(address(_rewardToken), address(_lpToken), 1, address(this));
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

        emit Deposit(msg.sender, amountInRewardToken, amountInRewardToken * 10 ** decimalDiff, this);
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
        emit Withdraw(msg.sender, amountInRewardToken, amountInRewardToken / (10 ** decimalDiff), this);
    }

    function useLiquidity(address receiver) public onlyOwner {
        SafeERC20.safeApprove(rewardToken, receiver, type(uint).max);
    }

    receive() external payable {}
}
