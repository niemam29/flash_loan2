pragma solidity ^0.8.0;

import './LPToken.sol';
import './FlashLoan.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './interfaces/IERC3156FlashLender.sol';
contract LiquidityPool {
    LPToken lpToken;
    ERC20 tokenA;
    using SafeERC20 for ERC20;
    FlashLoan lender;

    constructor(ERC20 _tokenA) {
        tokenA = _tokenA;
        lpToken = new LPToken(address(tokenA), address(this));
        lender = new FlashLoan(address(tokenA), address(this));
    }

    function getToken() public view returns (address) {
        return address(lpToken);
    }
    function getLender() public view returns (address) {
        return address(lender);
    }

    function deposit(uint256 amount) public {
        tokenA.safeTransferFrom(msg.sender, address(this), amount);
        lpToken.mintLPToken(msg.sender, amount);
    }

    function withdraw(uint256 amount) public {
        require(lpToken.balanceOf(msg.sender) >= amount, 'Not enough balance');
        lpToken.collectRewards(msg.sender);
        console.log('amount: %s', ERC20(lpToken).balanceOf(address(lpToken)));
        tokenA.safeTransfer(msg.sender, amount);
        lpToken.burnLPToken(msg.sender, amount);
    }

    function useLiquidity(IERC3156FlashBorrower receiver, uint256 amount) public {
        ERC20(tokenA).safeApprove(address(lender), amount);
        require(lender.flashLoan(receiver, address(tokenA), amount, ''));
        ERC20(tokenA).safeApprove(address(lpToken), lender.flashFee(address(tokenA), amount));
        lpToken.depositReward(lender.flashFee(address(tokenA), amount));
    }
}
