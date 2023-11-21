import React, { useState } from "react";
import { Button, useToast, Heading, Select } from "@chakra-ui/react";
import { generateCommitment, sendInput } from "./utils";
import { MOVE_KEY, NONCE_KEY } from "./constants";

function Challenges({ challenges, address, signer, showAccept = false }) {
    const toast = useToast();

    const [choice, setChoice] = useState(0);

    const moveToString = (move) => {
        return {
            0: "HIDDEN",
            1: "ROCK",
            2: "PAPER",
            3: "SCISSORS",
        }[move];
    };

    const isAddressUser = (addr) => {
        if (addr === address)
            return <strong style={{ color: "green" }}>You</strong>;
        return <strong style={{ color: "red" }}>Opponent</strong>;
    };

    const revealMove = async () => {
        const nonce = localStorage.getItem(NONCE_KEY + address.toLowerCase());
        const move = localStorage.getItem(MOVE_KEY + address.toLowerCase());

        await sendInput(
            JSON.stringify({
                method: "reveal",
                move: move,
                nonce: nonce,
            }),
            signer,
            toast
        );
    };

    const acceptChallenge = async (id) => {
        const commitment = await generateCommitment(choice, signer);
        await sendInput(
            JSON.stringify({
                method: "accept_challenge",
                commitment: commitment,
                challenge_id: id,
            }),
            signer,
            toast
        );
    };

    const showReveal = (challenge) => {
        if (challenge.opponent === address && challenge.opponent_move !== 0)
            return false;
        if (challenge.creator === address && challenge.creator_move !== 0)
            return false;

        return (
            challenge.opponent_move != undefined &&
            challenge.creator_move != undefined &&
            !challenge.winner
        );
    };

    return (
        <div className="challenges">
            {challenges.map((challenge) => {
                let data = {
                    opponent_move: "",
                    your_move: "",
                    opponent: "",
                };

                if (challenge.opponent !== address && challenge.opponent) {
                    data = {
                        opponent_move: challenge.opponent_move,
                        your_move: challenge.creator_move,
                        opponent: challenge.opponent,
                    };
                } else {
                    data = {
                        opponent_move: challenge.creator_move,
                        your_move: challenge.opponent_move,
                        opponent: challenge.creator,
                    };
                }

                return (
                    <div className="challenge" key={challenge.challenge_id}>
                        <Heading size={"md"}>
                            Challenge #{challenge.challenge_id}
                        </Heading>
                        {data.opponent && (
                            <p>
                                <strong>Opponent</strong>: {data.opponent}
                            </p>
                        )}
                        {challenge.winner && (
                            <p>
                                <strong>Winner</strong>:{" "}
                                {isAddressUser(challenge.winner)}
                            </p>
                        )}
                        {data.opponent_move != undefined && (
                            <p>
                                <strong>Opponent Move</strong>:{" "}
                                {moveToString(data.opponent_move)}
                            </p>
                        )}
                        {data.your_move != undefined && (
                            <p>
                                <strong>Your Move</strong>:{" "}
                                {moveToString(data.your_move)}
                            </p>
                        )}
                        {showReveal(challenge) ? (
                            <Button colorScheme="green" onClick={revealMove}>
                                Reveal Move
                            </Button>
                        ) : (
                            <p>
                                <em>Waiting on opponent...</em>
                            </p>
                        )}
                        {showAccept && (
                            <>
                                <Select
                                    focusBorderColor="yellow"
                                    size="md"
                                    value={choice} // Renamed for clarity
                                    onChange={(event) =>
                                        setChoice(event.target.value)
                                    } // Specific handler for choice
                                >
                                    <option value="1">ROCK</option>
                                    <option value="2">PAPER</option>
                                    <option value="3">SCISSORS</option>
                                </Select>
                                <Button
                                    onClick={() =>
                                        acceptChallenge(challenge.challenge_id)
                                    }
                                    colorScheme="green"
                                >
                                    Challenge
                                </Button>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default Challenges