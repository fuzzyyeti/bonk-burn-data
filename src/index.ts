import express from 'express';
import { Request, Response } from 'express';
import fs from 'fs';
import { getBurnFromChain } from './burnFromChain';
import nodeHtmlToImage from 'node-html-to-image';
import cors from 'cors';

const base_path = __dirname.split('/').slice(0, -1).join('/');
const app = express()
const port = 3001
const img = 'https://shdw-drive.genesysgo.net/4EVCAGfgf62Dm3bmd2e6L7BnqKZP2jmuXUtufWND12oo/'
let burnAmounts : null | { [index : string]: number | null} = null;

app.use(cors());

const getBurnAmount = async (itemNum: number) => {
 // read in metadata from the file
 if (burnAmounts === null) {
  const burnAmountsRaw = fs.readFileSync(`${base_path}/static/bonkburned.json`, 'utf8');
  burnAmounts = JSON.parse(burnAmountsRaw);
}
if (burnAmounts === null) {
  throw new Error('could not read bonkburned.json');
}
//check if bonkBurnedParsed has item_num as a key
let burnAmount :number | null = 0;
if (burnAmounts[itemNum] === undefined) {
  
  burnAmount = await getBurnFromChain(itemNum);
  if (burnAmount !== null) {
    burnAmounts[itemNum] = burnAmount;
  }
  console.log('retrieved from chain');
  fs.writeFileSync(`${base_path}/static/bonkburned.json`, JSON.stringify(burnAmounts)); 
} else {
  console.log('setting from cache');
  burnAmount = burnAmounts[itemNum];
}
return burnAmount;
}

app.get('/index.css', (req: Request, res: Response) => {
  res.sendFile('static/index.css', { root: base_path });
});

app.get('/:item_num.png', async (req: Request, res: Response) => {
  const burnAmount = await getBurnAmount(Number(req.params.item_num));
  if (burnAmount === null) {
    res.status(404).send('No image found for item ' + req.params.item_num)
    return;
  }
  const metadata = fs.readFileSync(`${base_path}/static/metadata/${req.params.item_num}.json`, 'utf8');
  const parsedMetadata = JSON.parse(metadata);
  const bg = parsedMetadata.attributes.filter(
    (attr: {trait_type: string, value: any}) => attr.trait_type === 'Backgrounds')[0].value as string;
	const imageFileName = `/static/images/${req.params.item_num}.png`
	if(!fs.existsSync(base_path.concat(imageFileName))) {
		const htmlContents = `<html>
		<head>
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet">
		<style>
		body {
			width: 1000px;
			height: 1000px;
		}
		.image {
			overflow: hidden;
		}
		#scroll-text {
			position: absolute;
			top: 805px;
			margin: auto;
			text-align: center;
			width: 1000px;
			font-size: 74px;
			font-family: 'Fredoka One', cursive;
			/* animation properties */
			white-space: nowrap;
		}
		</style>
		</head>
		<body><img class="image" src="${img + req.params.item_num + '.png'}" />
		<div style="color:${bg === 'Space' ? 'white' : 'black'};" id="scroll-text" >${burnAmount.toLocaleString('en-US')} <br> $BONK Burned!</div></body></html>`
		await nodeHtmlToImage({
			output: base_path.concat(imageFileName),
			html: htmlContents
		});
	}
  res.sendFile(imageFileName, { root: base_path});
})


app.get('/:item_num.json', async (req: Request, res: Response) => {
 
  const burnAmount = await getBurnAmount(parseInt(req.params.item_num));
  if (burnAmount === null) {
    res.status(404).send('No metadata found for item ' + req.params.item_num)
    return;
  }
  const metadata = fs.readFileSync(`${base_path}/static/metadata/${req.params.item_num}.json`, 'utf8');
  const parsedMetadata = JSON.parse(metadata);
  parsedMetadata.attributes = [{ trait_type: 'Bonk Burned', value: burnAmount }, ...parsedMetadata.attributes];
  res.send(JSON.stringify(parsedMetadata)); 
  }
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
