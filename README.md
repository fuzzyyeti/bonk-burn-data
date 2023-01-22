# Bonk Burn Data
This is a Helius Webhook for post-processing a mint using [Bonk Burn Machine](https://github.com/fuzzyyeti/bonk-burn-machine). Set it to monitor TOKEN_MINT and NFT_MINT transactions for the Update Authority of the collection. 

Right after the mint, the mint endpoint will be called and this
server will pull the image from shadow drive, generate a new image with the amount of $BONK burned, and update the image in SHDW drive. It will also add an attribute to the off-chain metadata to show the amout of $BONK burned and updata it on SHDW drive. 

Finally, the server will verify the creator and verify the NFT as part of a collection.
