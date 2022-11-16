import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'

let owner: SignerWithAddress,
    alwin: SignerWithAddress,
    borys: SignerWithAddress,
    diablo: SignerWithAddress,
    ori: SignerWithAddress,
    LpTokenContract,
    LpToken: Contract,
    TokenAContract,
    Reuben: Contract

describe('LP Token - second suite - dogs story', function () {
    before(async function () {
        ;[owner, alwin, borys, diablo, ori] = await ethers.getSigners()

        TokenAContract = await ethers.getContractFactory('TokenA')
        LpTokenContract = await ethers.getContractFactory('LPToken')

        Reuben = await TokenAContract.deploy('TokenA', 'TKA', 6)
        LpToken = await LpTokenContract.deploy(Reuben.address)
    })
    it('Alwin buys 50 shares', async function () {
        await LpToken.mint(alwin.address, 50_000_000)
        expect(await LpToken.balanceOf(alwin.address)).to.be.eq(50_000_000)
    })
    it('Borys buys 40 shares', async function () {
        await LpToken.mint(borys.address, 40_000_000)
        expect(await LpToken.balanceOf(borys.address)).to.be.eq(40_000_000)
    })
    it('Pool makes 50 rubens', async function () {
        await Reuben.transfer(LpToken.address, 50_000_000)
        expect(await Reuben.balanceOf(LpToken.address)).to.be.eq(50_000_000)
    })
    it('Borys claims reward', async function () {
        await LpToken.connect(borys).collectRewards(borys.address)
        expect(await Reuben.balanceOf(borys.address)).to.be.eq(22_222_000)
    })
    it('Pool makes 70 rubens', async function () {
        await Reuben.transfer(LpToken.address, 70_000_000)
        expect(await Reuben.balanceOf(LpToken.address)).to.be.eq(97_778_000)
    })
    it('Alwin claims and sells shares', async function () {
        await LpToken.connect(alwin).approve(LpToken.address, 50_000_000)
        await LpToken.burn(alwin.address, 50_000_000)
        expect(await Reuben.balanceOf(alwin.address)).to.be.eq(66_666_000)
    })
    it('Diablo buys 20 shares', async function () {
        await LpToken.mint(diablo.address, 20_000_000)
        expect(await Reuben.balanceOf(diablo.address)).to.be.eq(0)
        expect(await LpToken.balanceOf(diablo.address)).to.be.eq(20_000_000)
    })
    it('Diablo claims', async function () {
        await LpToken.connect(diablo).collectRewards(diablo.address)
        expect(await Reuben.balanceOf(diablo.address)).to.be.eq(0)
        expect(await LpToken.balanceOf(diablo.address)).to.be.eq(20_000_000)
    })
    it('Borys claims', async function () {
        await LpToken.connect(borys).collectRewards(borys.address)
        expect(await Reuben.balanceOf(borys.address)).to.be.eq(53_332_800)
    })
    it('Pool makes 100 rubens', async function () {
        await Reuben.transfer(LpToken.address, 100_000_000)
        expect(await Reuben.balanceOf(LpToken.address)).to.be.eq(100_001_200)
    })
    it('Diablo claims', async function () {
        await LpToken.connect(diablo).collectRewards(diablo.address)
        expect(await Reuben.balanceOf(diablo.address)).to.be.eq(33_333_200)
        expect(await Reuben.balanceOf(LpToken.address)).to.be.eq(66_668_000)
    })
    it('Pool makes 50 rubens', async function () {
        await Reuben.transfer(LpToken.address, 50_000_000)
        expect(await Reuben.balanceOf(LpToken.address)).to.be.eq(116_668_000)
    })
    it('Borys sends 10 shares to Ori', async function () {
        await LpToken.connect(borys).transfer(ori.address, 10_000_000)
        expect(await LpToken.balanceOf(ori.address)).to.be.eq(10_000_000)
    })
    it('Pool makes 10 rubens', async function () {
        await Reuben.transfer(LpToken.address, 10_000_000)
        expect(await Reuben.balanceOf(LpToken.address)).to.be.eq(26_668_400)
    })
    it('Ori claimes', async function () {
        await LpToken.connect(ori).collectRewards(ori.address)
        expect(await Reuben.balanceOf(ori.address)).to.be.eq(1_666_600)
    })
    it('Borys claimes', async function () {
        await LpToken.connect(borys).collectRewards(borys.address)
        expect(await Reuben.balanceOf(borys.address)).to.be.eq(158_332_200)
    })
})
