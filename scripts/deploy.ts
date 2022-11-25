import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'

let owner: SignerWithAddress,
    user: SignerWithAddress,
    FlashLoanContract: any,
    LpTokenContract,
    RegularBorrower: Contract,
    FlashLoan: any,
    PoolContract: any,
    Pool: any,
    RegularBorrowerContract: any,
    LpToken: Contract,
    TokenAContract,
    TokenA: Contract

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function main() {
    ;[owner] = await ethers.getSigners()

    TokenAContract = await ethers.getContractFactory('TokenA')
    LpTokenContract = await ethers.getContractFactory('LPToken')
    PoolContract = await ethers.getContractFactory('LiquidityPool')
    FlashLoanContract = await ethers.getContractFactory('FlashLoan')
    RegularBorrowerContract = await ethers.getContractFactory('RegularBorrower')

    const TokenA = await TokenAContract.deploy('TokenA', 'TKA', 18)
    LpToken = await LpTokenContract.deploy(TokenA.address)
    Pool = await PoolContract.deploy(TokenA.address, LpToken.address)
    FlashLoan = await FlashLoanContract.deploy(TokenA.address, Pool.address, LpToken.address)
    RegularBorrower = await RegularBorrowerContract.deploy(FlashLoan.address)

    await TokenA.mint(owner.address, 1000000000000)

    await LpToken.transferOwnership(Pool.address)
    await Pool.useLiquidity(FlashLoan.address)

    console.log('TokenA deployed to:', TokenA.address)
    console.log('owner address:', owner.address)
    console.log('LpToken deployed to:', LpToken.address)
    console.log('Pool deployed to:', Pool.address)
    console.log('FlashLoan deployed to:', FlashLoan.address)
    console.log('RegularBorrower deployed to:', RegularBorrower.address)
    return 0
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
