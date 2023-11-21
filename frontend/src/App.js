import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import CreateChallenge from "./CreateChallenge";
import ListChallenges from "./ListChallenges";

function App() {
    const [signer, setSigner] = useState(undefined);

    useEffect(() => {
        if (typeof window.ethereum !== "undefined") {
            try {
                window.ethereum
                    .request({ method: "eth_requestAccounts" })
                    .then(() => {
                        // Create a Web3 provider from MetaMask's provider
                        const provider = new ethers.providers.Web3Provider(
                            window.ethereum
                        );
                        // Get the signer
                        const signer = provider.getSigner();

                        setSigner(signer);
                    });
            } catch (error) {
                console.error("Error:", error);
                alert("Connection to metamask failed.");
            }
        } else {
            alert("You need metamask installed to use this application.");
        }
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <div>
                    <CreateChallenge signer={signer} />
                </div>
                <div>
                    <ListChallenges signer={signer} />
                </div>
            </header>
        </div>
    );
}

export default App;
