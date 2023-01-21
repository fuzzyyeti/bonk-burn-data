import express from 'express';
import { Request, Response } from 'express';
import fs from 'fs';
import nodeHtmlToImage from 'node-html-to-image';
import cors from 'cors';
import { getMintAndBurn, getItemNumber, EnhancedTransaction } from './burnFromChain';
import { createImage } from './createImage';
import { updateImageAndMetadata } from './uploadToShdw'
import { updateMetadata } from './updateMetadata';

const base_path = __dirname.split('/').slice(0, -1).join('/');
const app = express()
const port = 3001
const img = 'https://shdw-drive.genesysgo.net/4EVCAGfgf62Dm3bmd2e6L7BnqKZP2jmuXUtufWND12oo/'
let burnAmounts : null | { [index : string]: number | null} = null;

app.use(cors());
app.use(express.json());

const processMint = async (data: EnhancedTransaction) => {
	const {mint, burn} = await getMintAndBurn(data);
	console.log(mint, burn);
  if(mint === null || burn === null) {
		console.log('could not find mint or burn');
		return;
	}
	const itemNumber = await getItemNumber(mint!);
	console.log(itemNumber, mint!, burn);
    const imageSuccess = await createImage(itemNumber, burn!); 
	console.log('image created successfuly');
	if (imageSuccess) {
		console.log(itemNumber, burn)
		await updateImageAndMetadata(itemNumber, burn!);
		console.log('off-chain image and metadata uploaded')
		await updateMetadata(itemNumber, mint!);
		console.log('on-chain image and metadata uploaded')
		return
	}
	console.log('image and metadata upload failed')
	////Update creator and collection 
}

app.post("/mint", (req : Request, res: Response) => {
  const { body } = req;
  console.log(JSON.stringify(body))
  const data = body[0];
  if (data.type !== "NFT_MINT" && data.type !== "TOKEN_MINT") {
    res.status(500).send("wrong event type");
		return;
	}
	processMint(data);
	res.send('process mint kicked off');
});

app.get('/index.css', (req: Request, res: Response) => {
  res.sendFile('static/index.css', { root: base_path });
});

app.get('/:item_num.json', async (req: Request, res: Response) => {
  const metadata = fs.readFileSync(`${base_path}/static/metadata/${req.params.item_num}.json`, 'utf8');
  const parsedMetadata = JSON.parse(metadata);
  res.send(JSON.stringify(parsedMetadata)); 
  }
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
