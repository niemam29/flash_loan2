// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import './interfaces/IERC3156FlashBorrower.sol';
import './interfaces/IERC3156FlashLender.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

contract FlashLoan is IERC3156FlashLender, ReentrancyGuard {
    bytes32 constant expectedHash = keccak256('ERC3156FlashBorrower.onFlashLoan');
    using SafeERC20 for ERC20;
    ERC20 supportedToken;
    address liquidityPool;
    address lpToken;
    uint feeDenominator = 100; // 1% fee
    bool locked = false;

    constructor(address _supportedToken, address _liquidityPool, address _lpToken) {
        supportedToken = ERC20(_supportedToken);
        liquidityPool = _liquidityPool;
        lpToken = _lpToken;
    }

    function flashLoan(
        IERC3156FlashBorrower receiver,
        address token,
        uint256 amount,
        bytes calldata data
    ) external nonReentrant returns (bool) {
        require(token == address(supportedToken), 'Token not supported');
        require(amount <= maxFlashFloan(address(supportedToken)), 'Not enough liquidity');

        supportedToken.safeTransferFrom(liquidityPool, address(this), amount);

        require(
            receiver.onFlashLoan(msg.sender, token, amount, feeDenominator, data) == expectedHash,
            'Flash loan failed'
        );

        supportedToken.safeTransferFrom(address(receiver), lpToken, flashFee(token, amount));
        supportedToken.safeTransferFrom(address(receiver), liquidityPool, amount);

        return true;
    }

    function maxFlashFloan(address token) public view returns (uint256) {
        require(token == address(supportedToken), 'Token not supported');
        return supportedToken.balanceOf(liquidityPool);
    }

    function flashFee(address token, uint256 amount) public view returns (uint256) {
        require(token == address(supportedToken), 'Token not supported');
        require(amount >= feeDenominator, 'Flash fee is not calculable - try bigger amount');
        return amount / feeDenominator;
    }

    receive() external payable {}
}
