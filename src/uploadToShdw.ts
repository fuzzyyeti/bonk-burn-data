import {Wallet } from '@project-serum/anchor'
import {ShdwDrive } from "@shadow-drive/sdk";
import {Keypair, Connection, PublicKey} from "@solana/web3.js";
import fs from "fs";
import { config } from "dotenv";
import { readFileSync} from "fs";
config();

const base_path = __dirname.split('/').slice(0, -1).join('/');

export const updateImageAndMetadata = async (item: number)=> {
	const keypair = Uint8Array.from(JSON.parse(process.env.SHDW_KEY!));
	const walletKeyPair = Keypair.fromSecretKey(keypair);
	const connection = new Connection(process.env.RPC!)
	const wallet = new Wallet(walletKeyPair); 
	console.log(wallet.publicKey.toBase58());
    const drive = await new ShdwDrive(connection, wallet).init();
		const metaDataToUpload = { name: `${item}.json`, 
				file: readFileSync(`${base_path}/static/metadata/${item}.json`)};
		drive.editFile(new PublicKey(process.env.SHDW_DRIVE!),`https://shdw-drive.genesysgo.net/${process.env.SHDW_DRIVE}/${item}.json`, metaDataToUpload, "v2");
		const imageToUpload = { name: `${item}.png`, 
				file: readFileSync(`${base_path}/static/images/${item}.png`)};
		await drive.editFile(new PublicKey(process.env.SHDW_DRIVE!),`https://shdw-drive.genesysgo.net/${process.env.SHDW_DRIVE}/${item}.png`, imageToUpload, "v2");
		console.log('done uploading');
}

updateImageAndMetadata(1);
