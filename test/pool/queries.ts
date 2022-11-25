import { gql } from 'graphql-request'

export function pools(): string {
    return gql`
        {
            pools(first: 10) {
                id
                price
                _tokenAAdress
                _tokenBAdress
            }
        }
    `
}

export function deposits(): string {
    return gql`
        {
            deposits(first: 1) {
                id
                _valueLiquidityToken
                _valueRewardToken
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
                _to
                _valueLiquidityToken
                _valueRewardToken
                depositor {
                    id
                }
            }
        }
    `
}
