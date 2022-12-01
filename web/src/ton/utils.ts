import { Address, Coins } from 'ton3-core';
import { tonClient } from './index';
import { PairData, SwapParams } from '../types';
import {
    Pair, Tokens,
} from './dex/api/types';

export function getDefaultSwapParams(): SwapParams {
    return {
        slippage: 0.5,
        inAmount: new Coins(0),
        outAmount: new Coins(0),
    };
}

export function getDefaultPairs(): Pair[] {
    return [{
        address: new Address('EQBpLTnl0mciLdS52V6-Eh7h5TX4ivz-jOzVQoXI9ibHy9_i'),
        leftToken: new Address('Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF'),
        leftReserved: new Coins('0'),
        rightToken: new Address('EQCKt2WPGX-fh0cIAz38Ljd_OKQjoZE_cqk7QrYGsNP6wUh-'),
        rightReserved: new Coins('0'),
        lpSupply: new Coins(0),
    }];
}

export function getDefaultPair(): PairData {
    return {
        ...getDefaultPairs()[0],
        leftWallet: null,
        leftBalance: null,
        rightWallet: null,
        rightBalance: null,
    };
}
export function getDefaultTokens(): Tokens {
    return [
        {
            name: 'Toncoin',
            symbol: 'TON',
            address: new Address('Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF'),
            image: 'https://api-testnet.tegro.finance/tokens/TON/image',
            decimals: 9,
        },
        {
            name: 'Tegro',
            symbol: 'TGR',
            address: new Address('EQCKt2WPGX-fh0cIAz38Ljd_OKQjoZE_cqk7QrYGsNP6wUh-'),
            image: 'https://api-testnet.tegro.finance/tokens/TGR/image',
            decimals: 9,
        },
    ];
}

// export function getDefaultJetton(): JettonInfo {
//     const jettonsAddresses = Object.keys(Jettons || {});
//     const jettonAddress = jettonsAddresses[1];
//     const jettonMeta = Jettons[jettonAddress];
//     return { jetton: { address: jettonAddress, meta: jettonMeta }, wallet: {}, balance: new Coins(0) };
// }
//
// export const updateJettonWallet = async (
//     jettonInfo: JettonInfo,
//     address: Address,
// ): Promise<JettonInfo> => {
//     if (!address) return jettonInfo;
//     const jettonMasterContract = new Address(jettonInfo.jetton.address);
//     const jettonWallet = await tonClient.Jetton.getWalletAddress(jettonMasterContract, address);
//     const balance = await tonClient.isContractDeployed(jettonWallet)
//         ? await tonClient.Jetton.getBalance(jettonWallet)
//         : new Coins(0, { decimals: await tonClient.Jetton.getDecimals(jettonMasterContract) });
//     return {
//         ...jettonInfo,
//         wallet: {
//             address: jettonWallet.toString('base64', { bounceable: true }),
//         },
//         balance,
//     };
// };

export async function getJettonBalance(jettonWallet: Address): Promise<Coins> {
    return await tonClient.isContractDeployed(jettonWallet)
        ? tonClient.Jetton.getBalance(jettonWallet)
        : new Coins(0);
}
//
// export function TokenToJettonMeta(token: Token): JettonMeta {
//     return {
//         name: token.name,
//         symbol: token.symbol,
//         description: token.description,
//         image: token.image,
//         decimal: token.decimals,
//     };
// }
