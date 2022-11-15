import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
let owner: SignerWithAddress,
    user: SignerWithAddress,
    FlashLoanContract,
    RegularBorrowerContract,
    RegularBorrower: Contract,
    LiquidityPool: Contract,
    FlashLoan: any,
    LpToken: Contract,
    TokenAContract,
    TokenA: Contract

// TODO - Better tests
describe('Borrowing Loans with lp - Regular borrower', function () {
    before(async function () {
        ;[owner, user] = await ethers.getSigners()

        RegularBorrowerContract = await ethers.getContractFactory('RegularBorrower')
        FlashLoanContract = await ethers.getContractFactory('FlashLoan')
        TokenAContract = await ethers.getContractFactory('TokenA')
        TokenA = await TokenAContract.deploy('TokenA', 'TKA', 6)
        FlashLoan = await FlashLoanContract.deploy(TokenA.address)
        RegularBorrower = await RegularBorrowerContract.deploy(FlashLoan.address, user.address)
        LiquidityPool = await ethers.getContractAt('LiquidityPool', await FlashLoan.getLiquidityPool())
        LpToken = await ethers.getContractAt('LPToken', await LiquidityPool.getToken())
    })
    it('Should revert transaction when there are no tokens in liquidity pool', async function () {
        await expect(RegularBorrower.borrow(TokenA.address, 1000000)).to.be.reverted
    })
    it('Should put 1 token A in pool', async function () {
        await TokenA.approve(LpToken.address, 1000000)
        await LpToken.depositFor(owner.address, 1000000)

        expect(await TokenA.balanceOf(LpToken.address)).to.be.eq(1000000)
    })
    it('Should revert loan when borrower is not able to pay', async function () {
        await expect(RegularBorrower.borrow(TokenA.address, 500000)).to.be.reverted
    })
    it('Should borrow 0.5 token and pay 0.05 in fees', async function () {
        await TokenA.transfer(RegularBorrower.address, 1000000)
        await RegularBorrower.borrow(TokenA.address, 500000)

        expect(await TokenA.balanceOf(RegularBorrower.address)).to.be.eq(495000)
        expect(await TokenA.balanceOf(LiquidityPool.getToken())).to.be.eq(1005000)
    })
    it('Should send owner 5000 in token rewards', async function () {
        const balanceBefore = await TokenA.balanceOf(owner.address)

        await LpToken.collectRewards(owner.address);
        const balanceAfter = await TokenA.balanceOf(owner.address)

        expect(balanceAfter).to.be.eq(balanceBefore.add(5000))
    })
    it('Should not send anything on second try to collect rewards', async function () {
        const balanceBefore = await TokenA.balanceOf(owner.address)

        await LpToken.collectRewards(owner.address);
        const balanceAfter = await TokenA.balanceOf(owner.address)

        expect(balanceAfter).to.be.eq(balanceBefore)
    })
})
