import axios from 'axios';
import dotenv from 'dotenv';
import { getTotalMinted } from './getTotal';
const BONK_MINT='DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
dotenv.config();

const transaction = process.argv[2] 

const testTransaction = async (transaction: string) => {
	const url = `https://api.helius.xyz/v0/transactions?api-key=${process.env.API_KEY}`
	const { data } = await axios.post(url, { transactions: [transaction]})
	console.log(JSON.stringify(data))
	//await axios.post('https://metadata.mintbubble.xyz/mint', data) 
}
testTransaction(transaction);
