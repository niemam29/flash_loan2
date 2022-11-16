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

describe('Liquidity Pool tests - reward token with 6 decimals', function () {
    before(async function () {
        ;[owner, user] = await ethers.getSigners()

        TokenAContract = await ethers.getContractFactory('TokenA')
        LpTokenContract = await ethers.getContractFactory('LPToken')
        PoolContract = await ethers.getContractFactory('LiquidityPool')

        TokenA = await TokenAContract.deploy('TokenA', 'TKA', 6)
        Pool = await PoolContract.deploy(TokenA.address)
        LpToken = await LpTokenContract.attach(await Pool.lpToken())

        TokenA.transfer(user.address, '1000000')
        TokenA.connect(user).approve(Pool.address, '1000000000000000000')
    })
    it('Should deposit one token', async function () {
        await Pool.connect(user).deposit('1000000')
        expect(await LpToken.balanceOf(user.address)).to.be.eq('1000000000000000000')
        expect(await TokenA.balanceOf(user.address)).to.be.eq('0')
    })
    it('Should withdraw small fraction of user deposit', async function () {
        LpToken.connect(user).approve(Pool.address, '1000000000000')
        await Pool.connect(user).withdraw('1')
        expect(await LpToken.balanceOf(user.address)).to.be.eq('999999000000000000')
        expect(await TokenA.balanceOf(user.address)).to.be.eq(1)
    })
    it('Should withdraw all of user deposit', async function () {
        LpToken.connect(user).approve(Pool.address, '999999000000000000')
        await Pool.connect(user).withdraw('999999')
        expect(await LpToken.balanceOf(user.address)).to.be.eq(0)
        expect(await TokenA.balanceOf(user.address)).to.be.eq('1000000')
    })
})
