import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
let owner: SignerWithAddress,
  user: SignerWithAddress,
  FlashLoanContract,
  ReentrancyBorrowerContract,
  ReentrancyBorrower: Contract,
  FlashLoan: Contract,
  TokenAContract,
  TokenA: Contract

describe('Borrowing Loans - Reentrancy borrower', function () {
  before(async function () {
    ;[owner, user] = await ethers.getSigners()

    FlashLoanContract = await ethers.getContractFactory('FlashLoan')
    ReentrancyBorrowerContract = await ethers.getContractFactory('ReentrancyBorrower')
    TokenAContract = await ethers.getContractFactory('TokenA')
    TokenA = await TokenAContract.deploy('TokenA', 'TKA', 6)
    FlashLoan = await FlashLoanContract.deploy(TokenA.address)
    ReentrancyBorrower = await ReentrancyBorrowerContract.deploy(FlashLoan.address, user.address)
    TokenA.transfer(FlashLoan.address, 1000000)
    TokenA.approve(FlashLoan.address, 1000000)
    TokenA.transfer(ReentrancyBorrower.address, 100)
  })
  it('Should revert reentrancy borrower', async function () {
    await expect(ReentrancyBorrower.borrow(TokenA.address, 10000)).to.be.revertedWith('ReentrancyGuard: reentrant call')
    expect(await TokenA.balanceOf(user.address)).to.be.eq(0)
    expect(await TokenA.balanceOf(ReentrancyBorrower.address)).to.be.eq(100)
  })
})
