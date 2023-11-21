import React, { useState } from "react";
import {  Button, useToast, Select } from "@chakra-ui/react";
import { sendInput, generateCommitment } from "./utils";

function CreateChallenge({ signer }) {
    const [choice, setChoice] = useState(1);
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    async function createChallenge() {
        const commitment = await generateCommitment(choice, signer)
        await sendInput(
            JSON.stringify({
                method: "create_challenge",
                commitment: commitment,
            }),
            signer,
            toast
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        await createChallenge();
        setLoading(false);
    }

    let buttonProps = {};
    if (loading) {
        buttonProps.isLoading = true;
    }
    return (
        <div className="challengeForm">
            <form onSubmit={handleSubmit}>
                <h2>Create Challenge</h2>
                <div>
                    <label>
                        <p>Choice</p>
                    </label>
                    <Select
                        focusBorderColor="yellow"
                        size="md"
                        value={choice} // Renamed for clarity
                        onChange={(event) => setChoice(event.target.value)} // Specific handler for choice
                    >
                        <option value="1">ROCK</option>
                        <option value="2">PAPER</option>
                        <option value="3">SCISSORS</option>
                    </Select>
                </div>
                <Button {...buttonProps} type="submit" colorScheme="yellow">
                    Create
                </Button>
            </form>
        </div>
    );
}

export default CreateChallenge;
