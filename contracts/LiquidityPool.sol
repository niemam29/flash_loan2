pragma solidity ^0.8.0;

import './LPToken.sol';
import './FlashLoan.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import './interfaces/IERC3156FlashLender.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
contract LiquidityPool is Ownable {
    IERC20 tokenA;
    using SafeERC20 for IERC20;
    LPToken lpToken;

    constructor(IERC20 _tokenA) {
        tokenA = _tokenA;
        lpToken = new LPToken(_tokenA);
        lpToken.usePool(address(this), 2**256 - 1);
    }

    function getToken() public view returns (address) {
        return address(lpToken);
    }

    function useLiquidity(IERC3156FlashLender receiver, uint256 amount) public onlyOwner {
        tokenA.transferFrom(address(lpToken), address(this), amount);
        tokenA.approve(address(receiver), amount);
    }

    function maxLiquidity() public view returns (uint256) {
        return tokenA.balanceOf(address(lpToken));
    }
}
