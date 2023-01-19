import { Connection, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
const COLLECTION_STATE = new PublicKey('4ymKvK3U6edqeNpfX674NGd534uVdDR8ZtDyghgGqPSF') 

dotenv.config();

export const getTotalMinted = async () => {
    const connection = new Connection(process.env.RPC!)
    const account = await connection.getAccountInfo(COLLECTION_STATE);
    const data = Array.from(account!.data);
    let value = 0;
    for (let i = 16; i > 11; i--) {
        value = value * 256 + data[i];
    }
    return value;
}
