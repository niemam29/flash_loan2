import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'

let owner: SignerWithAddress,
    user: SignerWithAddress,
    LpTokenContract,
    PoolContract,
    Pool: Contract,
    LpToken: Contract,
    TokenAContract,
    TokenA: Contract

describe('Liquidity Pool tests - reward token with 24 decimals', function () {
    before(async function () {
        ;[owner, user] = await ethers.getSigners()

        TokenAContract = await ethers.getContractFactory('TokenA')
        LpTokenContract = await ethers.getContractFactory('LPToken')
        PoolContract = await ethers.getContractFactory('LiquidityPool')

        TokenA = await TokenAContract.deploy('TokenA', 'TKA', 24)
        LpToken = await LpTokenContract.deploy(TokenA.address)
        Pool = await PoolContract.deploy(TokenA.address, LpToken.address)

        await LpToken.transferOwnership(Pool.address)

        await TokenA.transfer(user.address, '1000000000000000000000000')
        await TokenA.connect(user).approve(Pool.address, '1000000000000000000000000')
    })
    it('Should deposit one token', async function () {
        await Pool.connect(user).deposit('1000000000000000000000000')
        expect(await LpToken.balanceOf(user.address)).to.be.eq('1000000000000000000')
    })
    it('Should not allow to deposit too small fraction of token', async function () {
        await expect(Pool.connect(user).deposit('1')).to.be.revertedWith('amount is too small')
    })
    it('Should not allow to withdraw too small fraction of token', async function () {
        await expect(Pool.connect(user).withdraw('1')).to.be.revertedWith('amount is too small')
    })
    it('Should withdraw small fraction of user deposit', async function () {
        LpToken.connect(user).approve(Pool.address, '1000000')
        await Pool.connect(user).withdraw('1000000')
        expect(await LpToken.balanceOf(user.address)).to.be.eq('999999999999999999')
        expect(await TokenA.balanceOf(user.address)).to.be.eq('1000000')
    })
    it('Should withdraw all of user deposit', async function () {
        LpToken.connect(user).approve(Pool.address, '999999')
        await Pool.connect(user).withdraw('999999999999999999000000')
        expect(await LpToken.balanceOf(user.address)).to.be.eq(0)
        expect(await TokenA.balanceOf(user.address)).to.be.eq('1000000000000000000000000')
    })
})
