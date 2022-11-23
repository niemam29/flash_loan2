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
        YieldToken = await YieldTokenContract.deploy(Reuben.address, 100)
    })
    it('Should mint 100 tokens per block and reward user who hold the whole supply of tracked token', async function () {
        await YieldToken.mint(alwin.address, 1_000_000)
        await YieldToken.mint(diablo.address, 1_000_000)

        await mine(8)
        await YieldToken.claim(alwin.address)
        await YieldToken.claim(diablo.address)
        expect(await YieldToken.balanceOf(alwin.address)).to.be.eq(1000550) // 11 blocks
        expect(await YieldToken.balanceOf(diablo.address)).to.be.eq(1000599) // 12 blocks
    })
    it('Should split the minted tokens between holders', async function () {
        await YieldToken.claim(alwin.address)
        await YieldToken.claim(diablo.address)
        expect(await YieldToken.balanceOf(alwin.address)).to.be.eq(1000648) // 2 blocks
        expect(await YieldToken.balanceOf(diablo.address)).to.be.eq(1000697) // 3 blocks
    })
    it('Should split the minted tokens between holders', async function () {
        await YieldToken.setMintingRate(10)
        await YieldToken.claim(alwin.address)
        await YieldToken.claim(diablo.address)
        expect(await YieldToken.balanceOf(alwin.address)).to.be.eq(1000751) // 2 blocks
        expect(await YieldToken.balanceOf(diablo.address)).to.be.eq(1000755) // 3 blocks (1 block with 10 minting rate)
    })
    it('Should split the minted tokens between holders', async function () {
        await YieldToken.burn(alwin.address, 1000751)
        await YieldToken.claim(alwin.address)
        await YieldToken.claim(diablo.address)
        expect(await YieldToken.balanceOf(alwin.address)).to.be.eq(8) // 1 block
        expect(await YieldToken.balanceOf(diablo.address)).to.be.eq(1000768) // 2 blocks (1 block with 10 minting rate)
    })
})
