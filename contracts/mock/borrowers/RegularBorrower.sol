pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '../../interfaces/IERC3156FlashBorrower.sol';
import '../../interfaces/IERC3156FlashLender.sol';

contract RegularBorrower is IERC3156FlashBorrower {
    using SafeERC20 for IERC20;
    IERC3156FlashLender lender;

    constructor(IERC3156FlashLender _lender) {
        lender = _lender;
    }

    function onFlashLoan(
        address sender,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external override returns (bytes32) {
        return keccak256('ERC3156FlashBorrower.onFlashLoan');
    }

    function borrow(address token, uint256 amount) external {
        uint fee = lender.flashFee(token, amount);
        IERC20(token).approve(address(lender), amount + fee);
        lender.flashLoan(this, token, amount, '');
    }
}
