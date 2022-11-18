import { expect } from 'chai'
import { ethers } from 'hardhat'
import { mine } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'

let owner: SignerWithAddress,
    alwin: SignerWithAddress,
    diablo: SignerWithAddress,
    TokenAContract,
    YieldTokenContract,
    YieldToken: any,
    Reuben: Contract

describe('Yield token - single staking user', function () {
    before(async function () {
        ;[owner, alwin, diablo] = await ethers.getSigners()

        TokenAContract = await ethers.getContractFactory('TokenA')
        YieldTokenContract = await ethers.getContractFactory('YieldToken')

        Reuben = await TokenAContract.deploy('TokenA', 'TKA', 6)
        YieldToken = await YieldTokenContract.deploy(Reuben.address)
    })
    it('Should mint 100 tokens per block and reward user who hold the whole supply of tracked token', async function () {
        await Reuben.mint(alwin.address, 1_000_000)
        await Reuben.mint(diablo.address, 1_000_000)

        await YieldToken.startYield(alwin.address)
        await YieldToken.startYield(diablo.address)
        await mine(8)
        await YieldToken.claim(alwin.address)
        await YieldToken.claim(diablo.address)
        expect(await YieldToken.balanceOf(alwin.address)).to.be.eq(500) // 10 blocks * 50 tokens per block
        expect(await YieldToken.balanceOf(diablo.address)).to.be.eq(500) // 10 blocks * 50 tokens per block
    })
    it('Should split the minted tokens between holders', async function () {
        await mine(1)
        await YieldToken.claim(alwin.address)
        await mine(1)
        await YieldToken.claim(diablo.address)
        expect(await YieldToken.balanceOf(alwin.address)).to.be.eq(650) // 3 blocks * 50 tokens per block
        expect(await YieldToken.balanceOf(diablo.address)).to.be.eq(700) // 4 blocks * 50 tokens per block
    })
    it('Should split the minted tokens between holders', async function () {
        await YieldToken.claim(alwin.address)
        await mine(1)
        await Reuben.mint(alwin.address, 2_000_000)
        await YieldToken.claim(diablo.address)
        expect(await YieldToken.balanceOf(alwin.address)).to.be.eq(800) // 3 blocks * 50 tokens per block
        expect(await YieldToken.balanceOf(diablo.address)).to.be.eq(800) // 4 blocks * 50 tokens per block
    })
    it('Should split the minted tokens between holders', async function () {
        await mine(6)
        await YieldToken.claim(alwin.address)
        await YieldToken.claim(diablo.address)
        expect(await YieldToken.balanceOf(alwin.address)).to.be.eq(1550) // 10 blocks * 75 tokens per block
        expect(await YieldToken.balanceOf(diablo.address)).to.be.eq(1000) // 8 blocks * 25 tokens per block
    })
})
