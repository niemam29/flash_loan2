import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import forEach from 'mocha-each'
let FlashLoanContract, FlashLoan: Contract, TokenAContract, TokenA: Contract

describe('Fee calculation tests', function () {
  before(async function () {
    FlashLoanContract = await ethers.getContractFactory('FlashLoan')
    TokenAContract = await ethers.getContractFactory('TokenA')
    TokenA = await TokenAContract.deploy('TokenA', 'TKA', 6)
    FlashLoan = await FlashLoanContract.deploy(TokenA.address)
  })
  forEach([
    [100, 1],
    [1000, 10],
    [500, 5],
    [273, 2],
    [59253, 592]
  ]).it('Fee for %d amount should be %d', async function (amount, expectedFee) {
    expect(await FlashLoan.flashFee(TokenA.address, amount)).to.equal(expectedFee)
  })
  it('Should revert when amount is to low to calculate fee', async function () {
    await expect(FlashLoan.flashFee(TokenA.address, 1)).to.be.revertedWith(
      'Flash fee is not calculable - try bigger amount'
    )
  })
})
