import { keypairIdentity, Metaplex, OperationOptions } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import dotenv from 'dotenv'
dotenv.config();
const COLLECTION_MINT = new PublicKey('9sCMDMcd6ppsfbFaipuzXzpEduQ58KHrdUTeHbWZWfnE');

export const updateMetadata = async (item: number, mint: string, signature: string) => {
	const connection = new Connection(process.env.RPC!);
	const metaplex = new Metaplex(connection);
	const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.UPDATE_AUTHORITY!)))
	metaplex.use(keypairIdentity(keypair));
	const latestBlockhash = await connection.getLatestBlockhash();
	await connection.confirmTransaction({signature, ...latestBlockhash}, 'finalized')

	const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mint)}, 
	{ commitment: 'finalized' });
	const tx = await metaplex.nfts().update( {
		nftOrSft: nft,
		uri: `https://shdw-drive.genesysgo.net/${process.env.SHDW_DRIVE!}/${item}.json`,
		collection: COLLECTION_MINT,
	}, {commitment: 'finalized'});
	console.log('metadata updated')
	await verifyCreator(mint);
	console.log('owner verified')
	await metaplex.nfts().verifyCollection({
		mintAddress: new PublicKey(mint),
		collectionMintAddress: COLLECTION_MINT,
		collectionAuthority: keypair,
	}, { commitment: 'finalized' });
	console.log('collection verified')

}



const verifyCreator = async (mint: string) => {
	const connection = new Connection(process.env.RPC!);
	const metaplex = new Metaplex(connection);
	const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.CREATOR_KEY!)))
	metaplex.use(keypairIdentity(keypair));
	const tx = await metaplex.nfts().verifyCreator({
		mintAddress: new PublicKey(mint),
			creator: keypair
	}, { commitment: 'finalized' });
}

