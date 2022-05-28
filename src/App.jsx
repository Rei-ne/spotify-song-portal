import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

const App = () => {
  /*
 * Just a state variable we use to store our user's public wallet.
 */
  const [currentAccount, setCurrentAccount] = useState("");
  const [waveCount, setWaveCount] = useState(null);
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");

  const contractAddress = "0x6bec569088Fe21FE44e151e31463FE95310e086e";

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);

      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);

      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }

  }
  /**
 * connect wallet method implemented
 */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask! Please add the metamask extension to your browser");

        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

    } catch (error) {
      console.log(error)
    }
  }
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        /*
          * using contractABI here
          */
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();

        // console.log("Retrieved total wave count...", count.toNumber());
        /*
           * Execute the actual wave from your smart contract
           */
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        if (count) {
          setWaveCount(count.toNumber())
        }
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        alert("Get MetaMask! Please add the metamask extension to your browser");
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("Please wait 60 seconds before sending another message");
      alert("Please wait 60 seconds before sending another message");
    }
  }


  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        /*
        * Call the getAllWaves method from your Smart Contract
        */
        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });
        /*
          * Store our data in React State
          */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("Please wait 60 seconds before sending another message");
      alert("Please wait 60 seconds before sending another message");
    }
  };

  /**
   * Listen in for emitter events!
   */
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);



  const handleMessage = (e) => {
    setMessage(e.target.value);
  }


  useEffect(() => {
    checkIfWalletIsConnected(); getAllWaves();
  }, [])


  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hello there!
        </div>

        <div className="bio">
          I am <span>Reine</span>, and I love music. <br />
          Got any good recommendations? <br />
          You can connect your testnet wallet and share your favourite playlist/song on spotify!

        </div>


        <input value={message} onChange={handleMessage} />

        <div className="buttonDiv">
          <button className="waveButton" onClick={wave}>
            Send a song
          </button>
        </div>


        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <div className="buttonDiv">
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        )}

        {allWaves.map((wave, index) => {
          return (

            <div key={index} style={{ backgroundColor: "#e8ecd6", marginTop: "13px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>

          )
        })}

      </div>

    </div>
  );
}

export default App