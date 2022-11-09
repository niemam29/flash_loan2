import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
let owner: SignerWithAddress,
  user: SignerWithAddress,
  FlashLoanContract,
  InvalidAllowanceBorrowerContract,
  InvalidAllowanceBorrower: Contract,
  FlashLoan: Contract,
  TokenAContract,
  TokenA: Contract

describe('Borrowing Loans - invalid allowance tests', function () {
  before(async function () {
    ;[owner, user] = await ethers.getSigners()

    FlashLoanContract = await ethers.getContractFactory('FlashLoan')
    InvalidAllowanceBorrowerContract = await ethers.getContractFactory('InvalidAllowanceBorrower')
    TokenAContract = await ethers.getContractFactory('TokenA')
    TokenA = await TokenAContract.deploy('TokenA', 'TKA', 18)
    FlashLoan = await FlashLoanContract.deploy(TokenA.address)
    InvalidAllowanceBorrower = await InvalidAllowanceBorrowerContract.deploy(FlashLoan.address, user.address)
    TokenA.transfer(FlashLoan.address, 1000000)
    TokenA.approve(FlashLoan.address, 1000000)
    TokenA.transfer(InvalidAllowanceBorrower.address, 3010000)
  })
  it('Should borrow 1 Token A and pay 1% in fee with bigger allowance', async function () {
    await InvalidAllowanceBorrower.borrowWithBiggerAllowance(TokenA.address, 1000000)
    expect(await TokenA.balanceOf(user.address)).to.be.eq(1000000)
    const t = await TokenA.balanceOf(InvalidAllowanceBorrower.address)
    expect(t).to.equal(2000000)
  })
  it('Should revert borrow transaction when allowance is to small', async function () {
    await expect(InvalidAllowanceBorrower.borrowWithLowerAllowance(TokenA.address, 1000000)).to.be.reverted
  })
})
