pragma solidity ^0.8.0;

import "../../interfaces/IERC3156FlashLender.sol";
import "../../interfaces/IERC3156FlashBorrower.sol";

contract NotIERCBorrower {
IERC3156FlashLender lender;
    constructor(IERC3156FlashLender _lender) {
        lender = _lender;
    }

    function onLoan(
        uint256 amount,
        address sender,
        address token,
        uint256 fee,
        bytes calldata data
    ) external returns (bytes32) {
        return keccak256('ERC3156FlashBorrower.onFlashLoan');
    }
    function borrow(address token, uint256 amount) external {
        uint fee = lender.flashFee(token, amount);
        lender.flashLoan(IERC3156FlashBorrower(address(this)), token, amount, '');
    }
    fallback() external {  }

}
