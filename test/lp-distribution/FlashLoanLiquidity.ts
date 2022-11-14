import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
let owner: SignerWithAddress,
    user: SignerWithAddress,
    LiquidityPoolContract,
    RegularBorrowerContract,
    RegularBorrower: Contract,
    LiquidityPool: Contract,
    LpTokenContract: any,
    LpToken: Contract,
    TokenAContract,
    TokenA: Contract

describe('Borrowing Loans with lp - Regular borrower', function () {
    before(async function () {
        ;[owner, user] = await ethers.getSigners()

        LiquidityPoolContract = await ethers.getContractFactory('LiquidityPool')
        RegularBorrowerContract = await ethers.getContractFactory('RegularBorrower')
        LpTokenContract = await ethers.getContractFactory('LPToken')
        TokenAContract = await ethers.getContractFactory('TokenA')
        TokenA = await TokenAContract.deploy('TokenA', 'TKA', 6)
        LiquidityPool = await LiquidityPoolContract.deploy(TokenA.address)
        LpToken = await LpTokenContract.attach(LiquidityPool.getToken())
        RegularBorrower = await RegularBorrowerContract.deploy(LiquidityPool.address, user.address)
    })
    it('Should revert transaction when there is no tokens in liquidity pool', async function () {
        await TokenA.approve(RegularBorrower.address, 1000000)

        await expect(RegularBorrower.borrow(TokenA.address, 1000000)).to.be.reverted
    })
    it('Should put 1 token A in pool', async function () {
        await TokenA.approve(LiquidityPool.address, 1000000)
        await LiquidityPool.deposit(1000000)

        expect(await TokenA.balanceOf(LiquidityPool.address)).to.be.eq(1000000)
    })
    it('Should revert loan when borrower is not able to pay', async function () {
        await expect(RegularBorrower.borrow(TokenA.address, 500000)).to.be.reverted
    })
    it('Should borrow 0.5 token and pay 0.05 in fees', async function () {
        await TokenA.transfer(RegularBorrower.address, 1000000)
        await RegularBorrower.borrow(TokenA.address, 500000)

        expect(await TokenA.balanceOf(RegularBorrower.address)).to.be.eq(495000)
        expect(await TokenA.balanceOf(LiquidityPool.getToken())).to.be.eq(5000)
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
    it('Should not send anything when lp tokens are transferred to other account', async function () {
        LpToken.transfer(user.address, 1000000)

        await expect(LpToken.collectRewards(user.address)).to.be.reverted;
    })
})
