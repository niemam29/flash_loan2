import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
let owner: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress,
    user3: SignerWithAddress,
    user4: SignerWithAddress,
    LpTokenContract,
    LpToken: Contract,
    TokenAContract,
    TokenA: Contract

describe('LP Token - first suite', function () {
    before(async function () {
        ;[owner, user1, user2, user3, user4] = await ethers.getSigners()

        TokenAContract = await ethers.getContractFactory('TokenA')
        LpTokenContract = await ethers.getContractFactory('LPToken')

        TokenA = await TokenAContract.deploy('TokenA', 'TKA', 18)

        LpToken = await LpTokenContract.deploy(TokenA.address)
    })
    it('Should mint 0.1 token A to user1', async function () {
        await LpToken.mint(user1.address, 100000)
        expect(await LpToken.balanceOf(user1.address)).to.be.eq(100000)
    })
    it('Should reward user1 0.1 token A', async function () {
        await TokenA.transfer(LpToken.address, 100000)
        await LpToken.connect(user1).collectRewards(user1.address)
        expect(await TokenA.balanceOf(user1.address)).to.be.eq(100000)
        expect(await TokenA.balanceOf(LpToken.address)).to.be.eq(0)
    })

    it('Should split 0.1 reward between two users by 1/1', async function () {
        await LpToken.mint(user2.address, 100000)

        await TokenA.transfer(LpToken.address, 100000)

        await LpToken.connect(user2).collectRewards(user2.address)
        expect(await TokenA.balanceOf(user2.address)).to.be.eq(50000)
    })
    it('Should split 0.1 reward between three users by 1/1/1', async function () {
        await LpToken.mint(user3.address, 100000)

        await TokenA.transfer(LpToken.address, 100000)

        await LpToken.connect(user3).collectRewards(user3.address)
        await LpToken.connect(user2).collectRewards(user2.address)
        await LpToken.connect(user1).collectRewards(user1.address)

        expect(await TokenA.balanceOf(user3.address)).to.be.eq(33333)
        expect(await TokenA.balanceOf(user2.address)).to.be.eq(83333)
        expect(await TokenA.balanceOf(user1.address)).to.be.eq(183333)
    })
    it('Should pay nothing to user when there are no rewards for him', async function () {
        await LpToken.connect(user3).collectRewards(user3.address)

        expect(await TokenA.balanceOf(user3.address)).to.be.eq(33333)
    })
    it('Should pay nothing to user when he receive tokens from other address and there are no rewards for him ', async function () {
        await LpToken.connect(user1).transfer(user4.address, 100000)
        await LpToken.connect(user4).collectRewards(user4.address)

        expect(await TokenA.balanceOf(user4.address)).to.be.eq(0)

        await LpToken.connect(user4).transfer(user1.address, 100000)
    })
    it('Should split the reward between three users by 2/1/1', async function () {
        await LpToken.mint(user1.address, 100000)

        await TokenA.transfer(LpToken.address, 100000)

        await LpToken.connect(user1).collectRewards(user1.address)
        await LpToken.connect(user2).collectRewards(user2.address)
        await LpToken.connect(user3).collectRewards(user3.address)

        expect(await TokenA.balanceOf(user1.address)).to.be.eq(233333)
        expect(await TokenA.balanceOf(user2.address)).to.be.eq(108333)
        expect(await TokenA.balanceOf(user3.address)).to.be.eq(58333)
    })
    it('Should burn half of user tokens', async function () {
        await LpToken.burn(user1.address, 100000)
        expect(await LpToken.balanceOf(user1.address)).to.be.eq(100000)
    })
    it('Should not let user collect after withdrawal when there are no rewards', async function () {
        await LpToken.connect(user1).collectRewards(user1.address)
        expect(await TokenA.balanceOf(user1.address)).to.be.eq(233333)
    })
    it('Should distribute rewards in 1/1/1 proportions', async function () {
        TokenA.transfer(LpToken.address, 100000)

        await LpToken.connect(user1).collectRewards(user1.address)
        await LpToken.connect(user2).collectRewards(user2.address)
        await LpToken.connect(user3).collectRewards(user3.address)

        expect(await TokenA.balanceOf(user1.address)).to.be.eq(266666)
        expect(await TokenA.balanceOf(user2.address)).to.be.eq(141666)
        expect(await TokenA.balanceOf(user3.address)).to.be.eq(91666)
    })
    it('Should withdraw all of user tokens', async function () {
        await LpToken.burn(user1.address, 100000)
        expect(await LpToken.balanceOf(user1.address)).to.be.eq(0)
    })
    it('Should not let user without lp tokens collect rewards', async function () {
        await LpToken.connect(user1).collectRewards(user1.address)
        expect(await TokenA.balanceOf(user1.address)).to.be.eq(266666)
    })
    it('Should distribute rewards in 1/1 proportions', async function () {
        TokenA.transfer(LpToken.address, 100000)

        await LpToken.connect(user1).collectRewards(user1.address)
        await LpToken.connect(user2).collectRewards(user2.address)
        await LpToken.connect(user3).collectRewards(user3.address)

        expect(await TokenA.balanceOf(user1.address)).to.be.eq(266666)
        expect(await TokenA.balanceOf(user2.address)).to.be.eq(191666)
        expect(await TokenA.balanceOf(user3.address)).to.be.eq(141666)
    })
})
