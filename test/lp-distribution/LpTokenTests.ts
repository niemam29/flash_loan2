import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
let owner: SignerWithAddress,
    user: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress,
    user3: SignerWithAddress,
    LpTokenContract,
    LpToken: Contract,
    TokenAContract,
    TokenA: Contract

describe.only('LP Token', function () {
    before(async function () {
        ;[owner, user, user1, user2, user3] = await ethers.getSigners()

        TokenAContract = await ethers.getContractFactory('TokenA')
        LpTokenContract = await ethers.getContractFactory('LPToken')

        TokenA = await TokenAContract.deploy('TokenA', 'TKA', 6)

        LpToken = await LpTokenContract.deploy(TokenA.address)

        await TokenA.transfer(user.address, 100000)
        await TokenA.connect(user).approve(LpToken.address, 100000)
    })
    it('Should deposit 0.1 token A', async function () {
        await LpToken.connect(user).depositFor(user.address, 100000)
        expect(await TokenA.balanceOf(user.address)).to.be.eq(0)
        expect(await TokenA.balanceOf(LpToken.address)).to.be.eq(100000)
        expect(await LpToken.balanceOf(user.address)).to.be.eq(100000)
    })
    it('Should reward user 0.1 token A', async function () {
        await TokenA.transfer(LpToken.address, 100000)
        await LpToken.connect(user).collectRewards(user.address)
        expect(await TokenA.balanceOf(user.address)).to.be.eq(100000)
        expect(await TokenA.balanceOf(LpToken.address)).to.be.eq(100000)
    })

    it('Should split 0.1 reward between two users by 1/1', async function () {
        await TokenA.transfer(user1.address, 100000)
        await TokenA.connect(user1).approve(LpToken.address, 100000)
        await LpToken.connect(user1).depositFor(user1.address, 100000)

        await TokenA.transfer(LpToken.address, 100000)

        await LpToken.connect(user1).collectRewards(user1.address)
        expect(await TokenA.balanceOf(user1.address)).to.be.eq(50000)
        expect(await TokenA.balanceOf(LpToken.address)).to.be.eq(250000)
    })
    it('Should split 0.1 reward between three users by 1/1/1', async function () {
        await TokenA.transfer(user2.address, 100000)
        await TokenA.connect(user2).approve(LpToken.address, 100000)
        await LpToken.connect(user2).depositFor(user2.address, 100000)

        await TokenA.transfer(LpToken.address, 100000)

        await LpToken.connect(user2).collectRewards(user2.address)
        await LpToken.connect(user1).collectRewards(user1.address)
        await LpToken.connect(user).collectRewards(user.address)

        expect(await TokenA.balanceOf(user2.address)).to.be.eq(33333)
        expect(await TokenA.balanceOf(user1.address)).to.be.eq(83333)
        expect(await TokenA.balanceOf(user.address)).to.be.eq(183333)

        expect(await TokenA.balanceOf(LpToken.address)).to.be.eq(300001)
    })
    it('Should pay nothing to user when there are no rewards for him', async function () {
        await LpToken.connect(user2).collectRewards(user2.address)

        expect(await TokenA.balanceOf(user2.address)).to.be.eq(33333)
    })
    it('Should pay nothing to user when he receive tokens from other address and there are no rewards for him ', async function () {
        await LpToken.connect(user).transfer(user3.address, 100000)
        await LpToken.connect(user3).collectRewards(user3.address)

        expect(await TokenA.balanceOf(user3.address)).to.be.eq(0)

        await LpToken.connect(user3).transfer(user.address, 100000)
    })
    it('Should split the reward between three users by 2/1/1', async function () {
        await TokenA.transfer(user.address, 16667)
        await TokenA.connect(user).approve(LpToken.address, 200000)
        await LpToken.connect(user).depositFor(user.address, 100000)

        await TokenA.transfer(LpToken.address, 100000)

        await LpToken.connect(user).collectRewards(user.address)
        await LpToken.connect(user1).collectRewards(user1.address)
        await LpToken.connect(user2).collectRewards(user2.address)

        expect(await TokenA.balanceOf(user.address)).to.be.eq(150000)
        expect(await TokenA.balanceOf(user1.address)).to.be.eq(108333)
        expect(await TokenA.balanceOf(user2.address)).to.be.eq(58333)
    })
    it('Should withdraw half of user tokens', async function () {
        await LpToken.connect(user).withdrawTo(user.address, 100000)
        expect(await TokenA.balanceOf(user.address)).to.be.eq(250000)
    })
    it('Should not let user collect after withdrawal when there are no rewards', async function () {
        await LpToken.connect(user).collectRewards(user.address)
        expect(await TokenA.balanceOf(user.address)).to.be.eq(250000)
    })
    it('Should distribute rewards in 1/1/1 proportions', async function () {
        TokenA.transfer(LpToken.address, 100000)

        await LpToken.connect(user).collectRewards(user.address)
        await LpToken.connect(user1).collectRewards(user1.address)
        await LpToken.connect(user2).collectRewards(user2.address)

        expect(await TokenA.balanceOf(user.address)).to.be.eq(283333)
        expect(await TokenA.balanceOf(user1.address)).to.be.eq(141666)
        expect(await TokenA.balanceOf(user2.address)).to.be.eq(91666)
    })
})
