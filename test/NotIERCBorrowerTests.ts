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

describe('Borrowing Loans - invalid interface tests', function () {
  before(async function () {
    ;[owner, user] = await ethers.getSigners()

    FlashLoanContract = await ethers.getContractFactory('FlashLoan')
    InvalidAllowanceBorrowerContract = await ethers.getContractFactory('NotIERCBorrower')
    TokenAContract = await ethers.getContractFactory('TokenA')
    TokenA = await TokenAContract.deploy('TokenA', 'TKA', 18)
    FlashLoan = await FlashLoanContract.deploy(TokenA.address)
    InvalidAllowanceBorrower = await InvalidAllowanceBorrowerContract.deploy(FlashLoan.address)
    await TokenA.transfer(FlashLoan.address, 1000000)
    await TokenA.approve(FlashLoan.address, 1000000)
    await TokenA.transfer(InvalidAllowanceBorrower.address, 3010000)
  })
  it('Should revert the transaction when borrower is not recognized', async function () {
    await expect(InvalidAllowanceBorrower.borrow(TokenA.address, 1000000)).to.be.reverted
  })
})
