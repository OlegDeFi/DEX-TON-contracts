import { Address, Coins } from 'ton3-core';
// import { JettonInfo, Pair } from '../../types';
import { getPair, getPairs, getToken } from './api/apiClient';
import { tonClient } from '../index';
import { Pair, Pairs, Token } from './api/types';

export const getPairByTokens = (pairs: Pairs, token1: Address, token2: Address): Pair => {
    // const pairs = await getPairs(null);
    const pair = pairs.find((p) => ((p.leftToken.eq(token1) && p.rightToken.eq(token2)) || (p.leftToken.eq(token2) && p.rightToken.eq(token1))));
    console.log('GGG', pair);
    if (pair!.leftToken.eq(token1)) {
        return pair!;
    }
    return {
        address: pair!.address,
        leftToken: pair!.rightToken,
        leftReserved: pair!.rightReserved,
        rightToken: pair!.leftToken,
        rightReserved: pair!.leftReserved,
        lpSupply: pair!.lpSupply,
    };
};
export const getLPSupply = async (pairAddress: string): Promise<Coins> => {
    const { totalSupply } = await tonClient.Jetton.getData(new Address(pairAddress));
    return new Coins(totalSupply, { isNano: true });
};
//
// export function getDefaultPair(): Pair {
//     const right = getDefaultJetton();
//     return {
//         address: 'EQBpLTnl0mciLdS52V6-Eh7h5TX4ivz-jOzVQoXI9ibHy9_i',
//         left: null,
//         right,
//         leftReserve: new Coins(0),
//         rightReserve: new Coins(0),
//         lpSupply: new Coins(0),
//     };
// }
//
// export const getPairInfo = async (leftSymbol: string, rightSymbol: string): Promise<{ address: string | null, leftReserve: Coins, rightReserve: Coins }> => {
//     let address;
//     let leftReserve;
//     let rightReserve;
//     try {
//         const pairMeta = await getPair(leftSymbol, rightSymbol);
//         address = pairMeta.address;
//         leftReserve = new Coins(pairMeta.leftReserved, { isNano: true });
//         rightReserve = new Coins(pairMeta.rightReserved, { isNano: true });
//     } catch {
//         // pass
//     }
//     return { address: address ?? null, leftReserve: leftReserve ?? new Coins(0), rightReserve: rightReserve ?? new Coins(0) };
// };
//
// export const getJettonInfo = async (symbol: string): Promise<JettonInfo | null> => {
//     const token = await getToken(symbol);
//     return symbol === 'TON' ? null : { jetton: { address: token.address, meta: TokenToJettonMeta(token) }, wallet: {}, balance: new Coins(0) };
// };
//
// export const getPairBySymbol = async (leftSymbol: string, rightSymbol: string): Promise<Pair> => {
//     const { address, leftReserve, rightReserve } = await getPairInfo(leftSymbol, rightSymbol);
//     if (!address) throw Error('PAIR NOT VALID'); // TODO запилить функцию выбора другой пары
//     return {
//         address,
//         left: await getJettonInfo(leftSymbol),
//         right: await getJettonInfo(rightSymbol),
//         leftReserve,
//         rightReserve,
//         lpSupply: await getLPSupply(address),
//     };
// };
//
// export const getValidPair = async (left: JettonInfo | null, right: JettonInfo | null): Promise<Pair> => {
//     const { address, leftReserve, rightReserve } = await getPairInfo(left ? left.jetton.meta.symbol : 'TON', right ? right.jetton.meta.symbol : 'TON');
//     if (!address) throw Error('PAIR NOT VALID'); // TODO запилить функцию выбора другой пары
//     return {
//         address,
//         left,
//         right,
//         leftReserve,
//         rightReserve,
//         lpSupply: await getLPSupply(address),
//     };
// };

export const getOutAmount = (inAmount: Coins, inReserved: Coins, outReserved: Coins): Coins => {
    const inAmountWithFee = new Coins(inAmount).mul(9965);
    const numerator = new Coins(inAmountWithFee).mul(outReserved.toString());
    const denominator = new Coins(inReserved).mul(10000).add(inAmountWithFee);
    return numerator.div(denominator.toString());
};

export const getStakeAmount = (inAmount: Coins, inReserved: Coins, outReserved: Coins): Coins => {
    const numerator = new Coins(inAmount).mul(outReserved.toString());
    const denominator = new Coins(inReserved).add(inAmount);
    return numerator.div(denominator.toString());
};
