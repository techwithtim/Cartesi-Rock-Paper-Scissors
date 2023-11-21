import { InputBox__factory } from "@cartesi/rollups";
import {DAPP_ADDRESS, INPUTBOX_ADDRESS, DEFAULT_URL, NONCE_KEY, MOVE_KEY} from "./constants"
import { ethers } from "ethers";

export const hex2str = (hex) => {
    try {
        return ethers.utils.toUtf8String(hex);
    } catch (e) {
        // cannot decode hex payload as a UTF-8 string
        return hex;
    }
};

export const waitForTransaction = async (tx, toast) => {
    console.log(`transaction: ${tx.hash}`);
    toast({
        title: "Transaction Sent",
        description: "waiting for confirmation",
        status: "success",
        duration: 9000,
        isClosable: true,
        position: "top-left",
    });

    // Wait for confirmation
    console.log("waiting for confirmation...");
    const receipt = await tx.wait(1);

    // Search for the InputAdded event
    const event = receipt.events?.find((e) => e.event === "InputAdded");

    toast({
        title: "Transaction Confirmed",
        description: `Input added => index: ${event?.args.inboxInputIndex} `,
        status: "success",
        duration: 9000,
        isClosable: true,
        position: "top-left",
    });
    console.log(`Input added => index: ${event?.args.inboxInputIndex} `);
    return receipt
};

export const sendInput = async (value, signer, toast) => {
    // Instantiate the InputBox contract
    const inputBox = InputBox__factory.connect(INPUTBOX_ADDRESS, signer);

    // Encode the input
    const inputBytes = ethers.utils.isBytesLike(value)
        ? value
        : ethers.utils.toUtf8Bytes(value);

    // Send the transaction
    const tx = await inputBox.addInput(DAPP_ADDRESS, inputBytes);
    return await waitForTransaction(tx, toast);
};

export const inspect = async (payload) => {
    const response = await fetch(`${DEFAULT_URL}/${JSON.stringify(payload)}`);

    if (response.status == 200) {
        const result = await response.json();
        return result.reports
    } else {
        console.log(JSON.stringify(await response.text()));
    }
}

export async function generateHash(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); 
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export const generateCommitment = async (choice, signer) => {
    const address = await signer.getAddress()
    
    const nonce = Math.random() * 100;
    localStorage.setItem(NONCE_KEY + address.toLowerCase(), nonce);
    localStorage.setItem(MOVE_KEY + address.toLowerCase(), choice)

    const commitment = await generateHash(nonce.toString() + choice);
    return commitment
}