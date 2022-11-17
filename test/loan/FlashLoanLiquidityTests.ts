import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
let owner: SignerWithAddress,
    user: SignerWithAddress,
    FlashLoanContract: any,
    LpTokenContract,
    RegularBorrower: Contract,
    FlashLoan: any,
    PoolContract: any,
    Pool: any,
    RegularBorrowerContract: any,
    LpToken: Contract,
    TokenAContract,
    TokenA: Contract

// TODO - More tests
describe('Borrowing Loans with lp - Regular borrower', function () {
    before(async function () {
        ;[owner, user] = await ethers.getSigners()

        TokenAContract = await ethers.getContractFactory('TokenA')
        LpTokenContract = await ethers.getContractFactory('LPToken')
        PoolContract = await ethers.getContractFactory('LiquidityPool')
        FlashLoanContract = await ethers.getContractFactory('FlashLoan')
        RegularBorrowerContract = await ethers.getContractFactory('RegularBorrower')

        TokenA = await TokenAContract.deploy('TokenA', 'TKA', 18)
        LpToken = await LpTokenContract.deploy(TokenA.address)
        Pool = await PoolContract.deploy(TokenA.address, LpToken.address)
        FlashLoan = await FlashLoanContract.deploy(TokenA.address, Pool.address)
        RegularBorrower = await RegularBorrowerContract.deploy(FlashLoan.address)

        await LpToken.transferOwnership(Pool.address)
        await Pool.useLiquidity(FlashLoan.address)

        await TokenA.transfer(user.address, 1000000)
        await TokenA.connect(user).approve(Pool.address, 1000000)
    })
    it('Should revert transaction when there are no tokens in liquidity pool', async function () {
        await expect(RegularBorrower.borrow(TokenA.address, 1000000)).to.be.reverted
    })
    it('Should put 1 token A in pool', async function () {
        await Pool.connect(user).deposit(1000000)

        expect(await TokenA.balanceOf(Pool.address)).to.be.eq(1000000)
        expect(await LpToken.balanceOf(user.address)).to.be.eq(1000000)
    })
    it('Should revert loan when borrower is not able to pay', async function () {
        await expect(RegularBorrower.borrow(TokenA.address, 500000)).to.be.reverted
    })
    it('Should borrow 0.5 token and pay 0.005 in fees', async function () {
        await TokenA.transfer(RegularBorrower.address, 1000000)
        await RegularBorrower.borrow(TokenA.address, 500000)

        expect(await TokenA.balanceOf(RegularBorrower.address)).to.be.eq(495000)
        expect(await TokenA.balanceOf(Pool.address)).to.be.eq(1000000)
        expect(await TokenA.balanceOf(LpToken.address)).to.be.eq(5000)
    })
    it('Should send owner 5000 in token rewards', async function () {
        const balanceBefore = await TokenA.balanceOf(user.address)

        await LpToken.collectRewards(user.address)
        const balanceAfter = await TokenA.balanceOf(user.address)

        expect(balanceAfter).to.be.eq(balanceBefore.add(5000))
    })
    it('Should not send anything on second try to collect rewards', async function () {
        const balanceBefore = await TokenA.balanceOf(owner.address)

        await LpToken.collectRewards(owner.address)
        const balanceAfter = await TokenA.balanceOf(owner.address)

        expect(balanceAfter).to.be.eq(balanceBefore)
    })
})
