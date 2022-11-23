pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IYieldToken {
    function mint(address account, uint256 amount) external returns (bool);

    function burn(address account, uint256 amount) external returns (bool);

    function totalMinted() external returns (uint);

    function balanceOf(address to) external returns (uint);

    function claim(address to) external;
}
