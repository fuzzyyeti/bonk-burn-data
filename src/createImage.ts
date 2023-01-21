import nodeHtmlToImage from 'node-html-to-image';
import fs from 'fs';

const basePath = __dirname.split('/').slice(0, -1).join('/');
const baseUrl = 'https://shdw-drive.genesysgo.net/4EVCAGfgf62Dm3bmd2e6L7BnqKZP2jmuXUtufWND12oo/'

export const createImage = async (itemNum: number, burnAmount: number) => {
  if (burnAmount === null) {
    return false;
  }
  const metadata = fs.readFileSync(`${basePath}/static/metadata/${itemNum}.json`, 'utf8');
  const parsedMetadata = JSON.parse(metadata);
  const bg = parsedMetadata.attributes.filter(
    (attr: {trait_type: string, value: any}) => attr.trait_type === 'Backgrounds')[0].value as string;
	const imageFileName = `/static/images/${itemNum}.png`
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
		<body><img class="image" src="${baseUrl + itemNum + '.png'}" />
		<div style="color:${bg === 'Space' ? 'white' : 'black'};" id="scroll-text" >${burnAmount.toLocaleString('en-US')} <br> $BONK Burned!</div></body></html>`
		await nodeHtmlToImage({
			output: basePath.concat(imageFileName),
			html: htmlContents
		});
		return true
}

//createImage(2, 500);
