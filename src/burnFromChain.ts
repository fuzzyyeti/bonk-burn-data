
import axios from 'axios';
import dotenv from 'dotenv';
import { getTotalMinted } from './getTotal';
//const ADMIN='2caMPE832jAJfrbQdGXYtDWyYaqfg2umgh4cN56QgUAG'
const ADMIN='9Ccz6i4DhCMBzTSkTufRbhkNSd8ySVgns7wJco3cjeU7'
const BONK_MINT='DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
dotenv.config();

let url = `https://api.helius.xyz/v0/addresses/${ADMIN}/transactions?api-key=${process.env.API_KEY}`

let burnAmounts = {};


export const getBurnFromChain = async (nftNumber: number) => {
    const burnAmount = await getBurnAmount(nftNumber);
    return burnAmount;

}
// {
//     fromTokenAccount: 'J8jn8kjPmqr28MAg9SsP94PCuiYEVxT1R1f2JkA6vaT',
//     toTokenAccount: '',
//     fromUserAccount: '2rTVLakADFVbpSdjrm2q8qpBygk6iGGbjdjtQsxRnQVY',
//     toUserAccount: '',
//     tokenAmount: 5000000,
//     mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
//     tokenStandard: 'Fungible'
//   },
const getBurnAmount = async (searchNumber: Number) : Promise<number | null> => {
  if( searchNumber > await getTotalMinted()) {
    return null;
  }
  while (true) {
    const { data } = await axios.get(url)
    let x = 0;
    let last_sig = "";
    for (const tx of data) {
      if (tx.type === "NFT_MINT") {
					const mint = tx.accountData[1].account;
					if(await isMintNumber(tx.accountData[1].account, searchNumber)) {
                        const bonkTx = tx.tokenTransfers.filter(
                            (transfer: BonkTx) => 
                            transfer.mint === BONK_MINT 
                            && transfer.toUserAccount === '')[0];
                        if (bonkTx) {
                            return bonkTx.tokenAmount;
                        } else {
                            throw new Error("No bonk burn found");
                        }
					}
          last_sig = tx.signature;
      }
    }
    url = `https://api.helius.xyz/v0/addresses/${ADMIN}/transactions?api-key=${process.env.API_KEY}&before=${last_sig}`
    if(last_sig === "") {
      break;
    }
    x++;
  }
  return null;
}

const isMintNumber = async (mint: String, searchNumber: Number) =>
{
	const url = `https://api.helius.xyz/v0/tokens/metadata?api-key=${process.env.API_KEY}`
  const { data } = await axios.post(url, { mintAccounts: [mint]})
  if (data[0].onChainData === null) {
    return false;
  }
  const name = data[0].onChainData.data.name
	const mintNumber = Number(name.match(/#(\d+)/)[1])
	return mintNumber === searchNumber;
}
//parseTransactions();
//getMetadata('HJ5p3x2TYqBMtLesDFr467XBxQzTmC5PTghsEm2ePoMM')
//findMintForNumber(10)

type BonkTx = {
  toUserAccount: string,
  tokenAmount: Number,
  mint: string,
}
