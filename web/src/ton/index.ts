import { TonClient } from '@tegro/ton3-client';

// testnet
// const url = 'https://testnet.toncenter.com/api/v2/jsonRPC';
const url = 'https://api-testnet.uniton.app/jsonRPC';
// const url = 'https://testnet.tonhubapi.com/jsonRPC';
const apiKey = '09f1e024cbb6af1b0f608631c42b1427313407b7aa385009195e3f5c09d51fb8';

// mainnet
// const url = 'https://toncenter.com/api/v2'
// const url = 'https://api.uniton.app'
// const apiKey = '1048eba2377df542264d2e25589a36b9608d3c746d82b8e99284bc59845b041b'

export const tonClient = new TonClient({ endpoint: url, apiKey });
