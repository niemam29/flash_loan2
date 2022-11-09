import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
let owner: SignerWithAddress,
  user: SignerWithAddress,
  FlashLoanContract,
  RegularBorrowerContract,
  RegularBorrower: Contract,
  FlashLoan: Contract,
  TokenAContract,
  TokenA: Contract

describe('Borrowing Loans', function () {
  before(async function () {
    ;[owner, user] = await ethers.getSigners()

    FlashLoanContract = await ethers.getContractFactory('FlashLoan')
    RegularBorrowerContract = await ethers.getContractFactory('RegularBorrower')
    TokenAContract = await ethers.getContractFactory('TokenA')
    TokenA = await TokenAContract.deploy('TokenA', 'TKA', 6)
    FlashLoan = await FlashLoanContract.deploy(TokenA.address)
    RegularBorrower = await RegularBorrowerContract.deploy(FlashLoan.address, user.address)
    TokenA.transfer(FlashLoan.address, 1000000)
    TokenA.approve(FlashLoan.address, 1000000)
    TokenA.transfer(RegularBorrower.address, 1010000)
  })
  it('Should borrow 1 Token A and pay 1% in fee', async function () {
    await RegularBorrower.borrow(TokenA.address, 1000000)
    expect(await TokenA.balanceOf(user.address)).to.be.eq(1000000)
    const t = await TokenA.balanceOf(RegularBorrower.address)
    expect(t).to.equal(0)
  })
  it('Should revert transaction when borrower balance is insufficient', async function () {
    TokenA.transfer(FlashLoan.address, 10000000)
    await expect(RegularBorrower.borrow(TokenA.address, 10000000)).to.be.reverted
  })
  it('Should revert transaction when lender balance is insufficient', async function () {
    TokenA.transfer(RegularBorrower.address, 10000000000)
    await expect(RegularBorrower.borrow(TokenA.address, 100000000)).to.be.reverted
  })
  it('Max loan should be the same as contract balance', async function () {
    TokenA.transfer(RegularBorrower.address, 10000000000)
    expect(await FlashLoan.maxFlashFloan(TokenA.address)).to.be.eq(await TokenA.balanceOf(FlashLoan.address))
  })
})
