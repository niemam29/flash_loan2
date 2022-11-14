pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '../../interfaces/IERC3156FlashBorrower.sol';
import '../../interfaces/IERC3156FlashLender.sol';
import '../../interfaces/ILiquidityPool.sol';
import 'hardhat/console.sol';

contract RegularBorrower is IERC3156FlashBorrower {
    using SafeERC20 for IERC20;
    IERC3156FlashLender lender;
    ILiquidityPool lp;
    address receiver;

    constructor(address _liquidityPool , address _receiver) {
        lp = ILiquidityPool(_liquidityPool);
        receiver = _receiver;
    }

    function onFlashLoan(
        address sender,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external override returns (bytes32) {
        IERC20(token).safeTransfer(receiver, amount);
        return keccak256('ERC3156FlashBorrower.onFlashLoan');
    }

    function borrow(address token, uint256 amount) external {
        uint fee = IERC3156FlashLender(lp.getLender()).flashFee(token, amount);
        IERC20(token).safeApprove(address(lp.getLender()), amount + fee);
        lp.useLiquidity(this, amount);
    }
}
