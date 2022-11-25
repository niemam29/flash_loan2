import {
    Deposit as DepositEvent,
    Pool as PoolEvent,
    Withdraw as WithdrawEvent,
} from '../generated/LiquidityPool/LiquidityPool'
import { Deposit, Pool, PoolDepositor, Withdraw } from '../generated/schema'

export function handleDeposit(event: DepositEvent): void {
    const entity = new Deposit(event.transaction.hash.concatI32(event.logIndex.toI32()))
    entity._valueRewardToken = event.params._valueRewardToken
    entity._valueLiquidityToken = event.params._valueLiquidityToken
    entity.pool = event.params._pool

    let depositor = PoolDepositor.load(event.params._from)
    if (depositor == null) {
        depositor = new PoolDepositor(event.params._from)
        depositor.pool = event.params._pool
        depositor.depositorAddress = event.params._from
        depositor.tokenADepositedAmount = event.params._valueRewardToken
        depositor.tokenBDepositedAmount = event.params._valueLiquidityToken
        depositor.save()
        entity.depositor = depositor.id
    } else {
        entity.depositor = event.params._from
        depositor.tokenADepositedAmount = depositor.tokenADepositedAmount.plus(event.params._valueRewardToken)
        depositor.tokenBDepositedAmount = depositor.tokenADepositedAmount.plus(event.params._valueLiquidityToken)
        depositor.save()
    }
    entity.save()
}

export function handlePool(event: PoolEvent): void {
    const entity = new Pool(event.params._poolAdress)
    entity._tokenAAdress = event.params._tokenAAdress
    entity._tokenBAdress = event.params._tokenBAdress
    entity.price = event.params.price

    entity.save()
}

export function handleWithdraw(event: WithdrawEvent): void {
    const entity = new Withdraw(event.transaction.hash.concatI32(event.logIndex.toI32()))
    entity._to = event.params._to
    entity._valueRewardToken = event.params._valueRewardToken
    entity._valueLiquidityToken = event.params._valueLiquidityToken
    entity._pool = event.params._pool
    entity.depositor = event.params._to

    const depositor = PoolDepositor.load(event.params._to)!
    depositor.tokenADepositedAmount = depositor.tokenADepositedAmount.minus(event.params._valueRewardToken)
    depositor.tokenBDepositedAmount = depositor.tokenADepositedAmount.minus(event.params._valueLiquidityToken)
    depositor.save()

    entity.save()
}
