pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../../interfaces/IERC3156FlashBorrower.sol';
import '../../interfaces/IERC3156FlashLender.sol';

contract ReentrancyBorrower is IERC3156FlashBorrower {
    IERC3156FlashLender lender;
    address receiver;

    constructor(IERC3156FlashLender _lender, address _receiver) {
        lender = _lender;
        receiver = _receiver;
    }

    function onFlashLoan(
        address sender,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external override returns (bytes32) {
        lender.flashLoan(this, token, amount, '');
        return keccak256('ERC3156FlashBorrower.onFlashLoan');
    }

    function borrow(address token, uint256 amount) external {
        uint fee = lender.flashFee(token, amount);
        IERC20(token).approve(address(lender), 10100);
        lender.flashLoan(this, token, amount, '');
    }
}
