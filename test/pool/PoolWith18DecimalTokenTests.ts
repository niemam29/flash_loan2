import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
import { request, gql, GraphQLClient } from 'graphql-request'
import { deposits, pools, withdraws } from './queries'

let owner: SignerWithAddress,
    user: SignerWithAddress,
    LpTokenContract,
    PoolContract,
    Pool: Contract,
    LpToken: Contract,
    TokenAContract,
    TokenA: Contract
const url = 'http://localhost:8000/subgraphs/name/LiquidityPool'
const POOL_ADDRESS = '0x60Bb892D3a05a223C0D2aC4F1E72C471080367B8'
const LP_TOKEN_ADDRESS = '0xd4235e5107ab43b28429560e61Cb4EF57F9204De'
const TOKEN_A_ADDRESS = '0x93c64b68D3F3ddD0527F82C0a538967F886712b7'

describe('Liquidity Pool tests - reward token with 18 decimals', function () {
    before(async function () {
        ;[owner, user] = await ethers.getSigners()

        TokenAContract = await ethers.getContractFactory('TokenA')
        LpTokenContract = await ethers.getContractFactory('LPToken')
        PoolContract = await ethers.getContractFactory('LiquidityPool')

        TokenA = await TokenAContract.attach(TOKEN_A_ADDRESS)
        LpToken = await LpTokenContract.attach(LP_TOKEN_ADDRESS)
        Pool = await PoolContract.attach(POOL_ADDRESS)

        // await LpToken.transferOwnership(Pool.address)

        await TokenA.transfer(user.address, '5000000000000000000')
        await TokenA.connect(user).approve(Pool.address, '5000000000000000000')
    })
    it.only('Should return one pool', async function () {
        let t
        await request(url, pools()).then((data) => {
            console.log(data)
            t = data.pools
        })
        expect(t).to.be.an('array')
        expect(t).to.have.length(1)
        expect(t[0].id).to.be.equal(POOL_ADDRESS.toLowerCase())
        expect(t[0].price).to.be.equal('1')
        expect(t[0]._tokenAAdress).to.be.equal(TOKEN_A_ADDRESS.toLowerCase())
        expect(t[0]._tokenBAdress).to.be.equal(LP_TOKEN_ADDRESS.toLowerCase())
    })
    it.only('Should deposit one token', async function () {
        const t2 = await Pool.connect(user).deposit('2000000000000000000', { gasLimit: 5000000 })
        console.log(t2)

        let t
        await request(url, deposits()).then((data) => {
            console.log(data)
            t = data.deposits
        })
        expect(t).to.be.an('array')
        expect(t).to.have.length(1)
        expect(t[0]._valueLiquidityToken).to.be.equal('2000000000000000000')
        expect(t[0]._valueRewardToken).to.be.equal('2000000000000000000')
        expect(t[0].depositor.id).to.be.equal(user.address.toLowerCase())
    })
    it.only('Should withdraw small fraction of user deposit', async function () {
        LpToken.connect(user).approve(Pool.address, '1')
        await Pool.connect(user).withdraw('1')

        let t
        await request(url, withdraws()).then((data) => {
            console.log(data)
            t = data.withdraws
        })
        expect(t).to.be.an('array')
        expect(t).to.have.length(1)
        expect(t[0]._valueLiquidityToken).to.be.equal('1')
        expect(t[0]._valueRewardToken).to.be.equal('1')
        expect(t[0].depositor.id).to.be.equal(user.address.toLowerCase())
        expect(t[0].pool.id).to.be.equal(POOL_ADDRESS.toLowerCase())
    })
    it.only('Should withdraw small fraction of user deposit', async function () {
        LpToken.connect(user).approve(Pool.address, '1')
        await Pool.connect(user).withdraw('1')

        let t
        await request(url, withdraws()).then((data) => {
            console.log(data)
            t = data.withdraws
        })
        expect(t).to.be.an('array')
        expect(t).to.have.length(1)
        expect(t[0]._valueLiquidityToken).to.be.equal('1')
        expect(t[0]._valueRewardToken).to.be.equal('1')
        expect(t[0].depositor.id).to.be.equal(user.address.toLowerCase())
        expect(t[0].pool.id).to.be.equal(POOL_ADDRESS.toLowerCase())
    })
})
