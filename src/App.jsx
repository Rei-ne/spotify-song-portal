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
  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0xb65CFEE0bc2F4a1D9E263da81180C37Dd19bc7C5";

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
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }
   /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
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
        * You're using contractABI here
        */   
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
       
        // console.log("Retrieved total wave count...", count.toNumber());
     /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        if(count){
          
          setWaveCount(count.toNumber())
        }
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
}
  
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hello there!
        </div>

        <div className="bio">
        I am <span>Reine</span> and I am a software developer learning web 3. Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
 
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div>
          Total waves: {waveCount}
        </div>
      </div>
     
    </div>
  );
}

export default App