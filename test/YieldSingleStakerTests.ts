import { expect } from 'chai'
import { ethers } from 'hardhat'
import { mine } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'

let owner: SignerWithAddress,
    alwin: SignerWithAddress,
    borys: SignerWithAddress,
    diablo: SignerWithAddress,
    ori: SignerWithAddress,
    TokenAContract,
    YieldTokenContract,
    YieldToken: any,
    Reuben: Contract

describe('Yield token - single staking user', function () {
    before(async function () {
        ;[owner, alwin, borys, diablo, ori] = await ethers.getSigners()

        TokenAContract = await ethers.getContractFactory('TokenA')
        YieldTokenContract = await ethers.getContractFactory('YieldToken')

        Reuben = await TokenAContract.deploy('TokenA', 'TKA', 6)
        YieldToken = await YieldTokenContract.deploy(Reuben.address, 100)
    })
    it('Should mint 100 tokens per block and reward user who hold the whole supply of tracked token', async function () {
        await YieldToken.mint(alwin.address, 1_000_000)

        await mine(8)
        await YieldToken.claim(alwin.address)
        expect(await YieldToken.balanceOf(alwin.address)).to.be.eq(1_001_000) // 10 blocks * 100 tokens per block
    })
    it('Should split the minted tokens between holders', async function () {
        await mine(1)
        await YieldToken.claim(alwin.address)
        expect(await YieldToken.balanceOf(alwin.address)).to.be.eq(1_001_200) // 2 blocks * 100 tokens per block
    })
    it('Should split the minted tokens between holders', async function () {
        await mine(1)
        await YieldToken.claim(alwin.address)
        expect(await YieldToken.balanceOf(alwin.address)).to.be.eq(1_001_399) // 3 blocks * 20 tokens per block
    })
})
