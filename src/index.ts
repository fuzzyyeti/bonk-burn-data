import express from 'express';
import { Request, Response } from 'express';
import fs from 'fs';
import { getBurnFromChain } from './burnFromChain';

const base_path = __dirname.split('/').slice(0, -1).join('/');
const app = express()
const port = 3001
const img = 'https://shdw-drive.genesysgo.net/4EVCAGfgf62Dm3bmd2e6L7BnqKZP2jmuXUtufWND12oo/'
let burnAmounts : null | { [index : string]: number | null} = null;

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
  burnAmounts[itemNum] = burnAmount;
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

app.get('/:item_num.html', async (req: Request, res: Response) => {
  const burnAmount = await getBurnAmount(Number(req.params.item_num));
  if (burnAmount === null) {
    res.status(404).send('No image found for item ' + req.params.item_num)
    return;
  }
  const metadata = fs.readFileSync(`${base_path}/static/metadata/${req.params.item_num}.json`, 'utf8');
  const parsedMetadata = JSON.parse(metadata);
  const bg = parsedMetadata.attributes.filter(
    (attr: {trait_type: string, value: any}) => attr.trait_type === 'Backgrounds')[0].value as string;
  res.send(`<html>
  <meta name="viewport" content="width=10, initial-scale=4" />
  <link rel="stylesheet" href="/index.css" />
  <body><img class="image" src="${img + req.params.item_num + '.png'}" />
  <div class="scroll-container">
  <div style="color:${bg === 'Space' ? 'white' : 'black'};" id="scroll-text" >${burnAmount.toLocaleString('en-US')} $BONK Burned!</div></div></body></html>`)
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
