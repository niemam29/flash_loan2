import { gql } from 'graphql-request'

export function pools(): string {
    return gql`
        {
            pools(first: 10) {
                id
                price
                tokenAAdress
                tokenBAdress
            }
        }
    `
}

export function deposits(): string {
    return gql`
        {
            deposits(first: 1) {
                id
                valueLiquidityToken
                valueRewardToken
                depositor {
                    id
                }
            }
        }
    `
}

export function withdraws(): string {
    return gql`
        {
            withdraws(first: 1) {
                to
                valueLiquidityToken
                valueRewardToken
                depositor {
                    id
                }
                pool {
                    id
                }
            }
        }
    `
}
