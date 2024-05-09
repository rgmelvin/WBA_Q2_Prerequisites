import {
    Transaction,
    SystemProgram,
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    PublicKey } from "@solana/web3.js";
import wallet from "./dev-wallet.json";

//Import dev-wallet
const from = Keypair.fromSecretKey(new Uint8Array(wallet));

//Define the public key provided to WBA
const to = new PublicKey("LhxKFBg2xJMbYXbLRsxC2LdN1aQSFYRn2RxdbQL6Ma7");

//Create a Solana devnet connection
const connection = new Connection("https://api.devnet.solana.com");

//Create a transaction to transfer 0.1 SOL from the dev-wallet to the address provided to WBA
(async () => {
    try {
        //Get balance of devnet wallet.
        const balance = await connection.getBalance(from.publicKey);

        //Create transaction
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey: to,
                lamports: balance,
            })
        );
        transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
        transaction.feePayer = from.publicKey;

        //Calculate exact fee rate to transfer the entire SOL amount out of the account minus the fees.
        const fee = (await connection.getFeeForMessage(transaction.compileMessage(), 'confirmed')).value || 0;

        //Pop the transfer instruction.
        transaction.instructions.pop();

        //Add instruction back with balance less fees.
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: from.publicKey,
                toPubkey: to,
                lamports: balance - fee,
            })
        );

        //Sign the transaction, broadcast, and confirm.
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        );
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
}) ();