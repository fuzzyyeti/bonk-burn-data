import express from 'express';
import { Request, Response } from 'express';
import fs from 'fs';
import { getBurnFromChain } from './burnFromChain';

const base_path = __dirname.split('/').slice(0, -1).join('/');
const app = express()
const port = 3001
const img = 'https://shdw-drive.genesysgo.net/4EVCAGfgf62Dm3bmd2e6L7BnqKZP2jmuXUtufWND12oo/'
let burnAmounts : null | { [index : string]: number} = null;

app.get('/index.css', (req: Request, res: Response) => {
  res.sendFile('static/index.css', { root: base_path });
});

app.get('/:item_num.html', (req: Request, res: Response) => {
  // trim the last directory in __dirname
  //res.sendFile('static/images/0.png', { root: base_path });
  res.send(`<html>
  <meta name="viewport" content="width=10, initial-scale=4" />
  <link rel="stylesheet" href="/index.css" />
  <body><img class="image" src="${img + req.params.item_num + '.png'}" />
  <div class="scroll-container">
  <div id="scroll-text" >5,000,000,000,000 $BONK Burned!</div></div></body></html>`)
})

app.get('/:item_num.json', async (req: Request, res: Response) => {
  // read in metadata from the file
  if (burnAmounts === null) {
    const burnAmountsRaw = fs.readFileSync(`${base_path}/static/bonkburned.json`, 'utf8');
    burnAmounts = JSON.parse(burnAmountsRaw);
  }
  if (burnAmounts === null) {
    throw new Error('could not read bonkburned.json');
  }
  //check if bonkBurnedParsed has item_num as a key
  let burnAmount = 0;
  if (!burnAmounts[req.params.item_num]) {
    const item_number = Number(req.params.item_num)
    burnAmount = await getBurnFromChain(item_number);
    burnAmounts[req.params.item_num] = burnAmount;
    console.log('retrieved from chain');
    fs.writeFileSync(`${base_path}/static/bonkburned.json`, JSON.stringify(burnAmounts)); 
  } else {
    console.log('setting from cache');
    burnAmount = burnAmounts[req.params.item_num];
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
