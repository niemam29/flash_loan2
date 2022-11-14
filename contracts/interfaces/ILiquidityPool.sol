pragma solidity ^0.8.0;

import './IERC3156FlashBorrower.sol';

interface ILiquidityPool {
    function useLiquidity(IERC3156FlashBorrower receiver, uint256 amount) external;

    function withdraw(uint256 amount) external;

    function deposit(uint256 amount) external;

    function getLender() external view returns (address);

    function getToken() external view returns (address);
}
