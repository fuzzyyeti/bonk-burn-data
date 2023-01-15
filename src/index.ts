import express from 'express';
import { Request, Response } from 'express';

const base_path = __dirname.split('/').slice(0, -1).join('/');
const app = express()
const port = 3000
const img = 'https://shdw-drive.genesysgo.net/4EVCAGfgf62Dm3bmd2e6L7BnqKZP2jmuXUtufWND12oo/'

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
