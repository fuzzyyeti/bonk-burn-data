import axios from 'axios';
import dotenv from 'dotenv';
import { getTotalMinted } from './getTotal';
const BONK_MINT='DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
dotenv.config();

export type EnhancedTransaction = {
	type: string,
	instructions: { accounts: string[] }[],
	tokenTransfers: { mint: string, toUserAccount: string, tokenAmount: number }[],
	events: { nft: any } 
}

export const getMintAndBurn = async (tx : EnhancedTransaction) => {
		const mint = tx.instructions[1].accounts[4];
		const bonkTx = tx.tokenTransfers.filter(
				(transfer) => 
				transfer.mint === BONK_MINT 
				&& transfer.toUserAccount === '')[0];
		if (bonkTx) {
				return {burn: bonkTx.tokenAmount, mint};
		} else {
			return { mint: null, burn: null}	
		}
}

export const getItemNumber = async (mint: string) => {
	const url = `https://api.helius.xyz/v0/tokens/metadata?api-key=${process.env.API_KEY}`
	const { data } = await axios.post(url, { mintAccounts: [mint]})
	return data[0].onChainData.data.name.split('#')[1]
}

const testTransaction = async () => {
	const url = `https://api.helius.xyz/v0/transactions?api-key=${process.env.API_KEY}`
	const { data } = await axios.post(url, { transactions: ['5NVksW9sN37gyAg9yPTTPpvQjJNwjpu7D2U961a5JaUsnBUt6HzzzDoipmvHsFWBVgjj1QyK9y5928xJBNgzzGSo']})
	const { mint, burn } = await getMintAndBurn(data[0]); 
	await getItemNumber(mint!)
	console.log(mint, burn)
}
//testTransaction()
