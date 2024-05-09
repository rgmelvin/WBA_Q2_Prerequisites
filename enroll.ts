import {
    Connection,
    Keypair,
    PublicKey
 } from "@solana/web3.js";
 import {
    Program,
    Wallet,
    AnchorProvider
 } from "@coral-xyz/anchor";
 import {
    IDL,
    WbaPrereq
 } from "./programs/wba_prereq";
 import wallet from "./wba-wallet.json"

 //Import keypair from the wallet file.
 const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

 //Create connection to devnet
 const connection = new Connection("https://api.devnet.solana.com");

 //Github account
 const github = Buffer.from("rgmelvin", "utf8");

 //Create anchor provider
 const provider = new AnchorProvider(connection, new Wallet(keypair), {
    commitment: "confirmed"
 });

 //Create the program
 const program : Program<WbaPrereq> = new Program(IDL, provider);

 //Create the PDA for the enrollment account
 const enrolment_seeds = [Buffer.from("prereq"), keypair.publicKey.toBuffer()];
 const [enrollment_key, _bump] = PublicKey.findProgramAddressSync(enrolment_seeds, program.programId);

 //Execute the enrollment transaction
 (async () => {
    try {
        const txhash = await program.methods.complete(github).accounts({
            signer: keypair.publicKey,
        })
        .signers([keypair]).rpc();
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong; ${e}`)
    }
 })();