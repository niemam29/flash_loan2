import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
let owner: SignerWithAddress,
    user: SignerWithAddress,
    LiqudityPoolContract,
    LiqudityPool: Contract,
    LpToken: Contract,
    TokenAContract,
    TokenA: Contract

describe('LP Token', function () {
    before(async function () {
        ;[owner, user] = await ethers.getSigners()

        TokenAContract = await ethers.getContractFactory('TokenA')
        LiqudityPoolContract = await ethers.getContractFactory('LiquidityPool')

        TokenA = await TokenAContract.deploy('TokenA', 'TKA', 6)
        LiqudityPool = await LiqudityPoolContract.deploy(TokenA.address);

        LpToken = await ethers.getContractAt('LPToken', await LiqudityPool.getToken())

        await TokenA.transfer(user.address, 1000000)
        await TokenA.connect(user).approve(LiqudityPool.address, 1000000)
    })
    it('Should deposit 0.1 token A', async function () {
        await LiqudityPool.connect(user).deposit(100000)
        expect(await TokenA.balanceOf(user.address)).to.be.eq(900000)
        expect(await TokenA.balanceOf(LiqudityPool.address)).to.be.eq(100000)
        expect(await LpToken.balanceOf(user.address)).to.be.eq(100000)
    })
    it('Should withdraw 0.1 token A', async function () {
        // const t = await LpToken.foo()
        await LpToken.connect(user).approve(LiqudityPool.address, 100000)
        await LiqudityPool.connect(user).withdraw(100000)
        expect(await TokenA.balanceOf(user.address)).to.be.eq(1000000)
        expect(await TokenA.balanceOf(LpToken.address)).to.be.eq(0)
        expect(await LpToken.balanceOf(user.address)).to.be.eq(0)
    })
    it('Should revert deposit when user balance is insufficient', async function () {
        await expect(LiqudityPool.connect(user).deposit(100000000)).to.be.reverted
    })
})
