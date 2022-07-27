//import Head from 'next/head'; //NextJS lets you write things that normally go in the Head section directly in a component without going index.html in normal react applications
import { useState, useEffect } from 'react';
import Web3 from 'web3';
//import bettingContract from '../blockchain/resplendent_contract_export'
import 'bulma/css/bulma.css';
import styles from '../styles/Resplendent.module.css';
//import { Reader } from '@ethersproject/contracts/node_modules/@ethersproject/abi/lib/coders/abstract-coder'
import ResplendentCard from './ResplendentCard';
import { realms } from '../data/realms';
import buildData from '../../build/contracts/Betting.json';

// Create single global web3 instance
let web3;
//const web3 = new Web3(window.ethereum);

function Resplendent() {
  const [error, setError] = useState('');
  const [userBet, setUserBet] = useState('');
  const [userAddress, setUserAddress] = useState(null);
  const [bettingContract, setBettingContract] = useState(null);

  // Connection status should be derived from the user address
  const connected = Boolean(userAddress);

  const handleConnectWallet = async () => {
    // Check if Metamask is available
    if (typeof window === 'undefined' || !window.ethereum) {
      console.log('Please install Metamask');
    }

    try {
      // Request wallet connect
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // set web3 instance
      web3 = new Web3(window.ethereum)
        
      // Get list of accounts
      const accounts = await web3.eth.getAccounts();
      setUserAddress(accounts[0]);

      // Set the betting contract
      const bettingContract = new web3.eth.Contract(
        buildData.abi,
        '0xDE9A750E9DE9c1d1c20CDFd6734D50623905d38f'
      );
      setBettingContract(bettingContract);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.main}>
      <head>
        <title>Resplendent Betting Site</title>
        <meta
          name="description"
          content="Come bet on the next Resplendent outfit with the blockchain!"
        />
      </head>
      {/* .hero */}

      <nav className="navbar mt-4 mb-4">
        <div className="container">
          <div className="navbar-brand">
            <h1>Resplendent Betting Site</h1>
            <div className="navbar ml-6">
              <PollStatus bettingContract={bettingContract} />
            </div>
          </div>
          <div className="navbar-end">
            <button onClick={handleConnectWallet} className="button is-primary">
              {connected ? 'Connected' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </nav>
      <section>
        <PrizeMoney bettingContract={bettingContract} />
      </section>
      <section>
        <MinimumEntryFee bettingContract={bettingContract} />
      </section>
      <section>
        <div className="container has-text-danger">
          <p>{error}</p>
        </div>
      </section>
      <section>
        <UserBet bettingContract={bettingContract} userAddress={userAddress} />
      </section>

      {/* Make the boxes for each Realm */}
      <div className="realms-container container">
        {/* Askr Box */}
        {realms.map((item, index) => (
          <ResplendentCard
            key={index}
            id={index}
            realm={item.realm}
            image={item.image.src}
            stateChanger={setUserBet}
            betAmount={userBet}
            web3={web3}
            account={userAddress}
            contract={bettingContract}
          />
        ))}
      </div>
      {/* About the project section */}
      <div className="block">
        <article className="message is-info">
          <div className="message-header">
            <p>About Us</p>
          </div>
          <div className="message-body">Testing Testing 1 2 3</div>
        </article>
      </div>
    </div>
  );
}

function UserBet({ bettingContract, userAddress }) {
  const onchainUserBet = useOnchainUserBet({ bettingContract, userAddress });
  const realmChoice = useRealmChoice({ bettingContract, userAddress });

  return (
    <div className="container">
      <h2>Your bet: {onchainUserBet} ETH</h2>
      {realmChoice === 42 ? (
        <h2>Your Realm Choice: You have yet to choose</h2>
      ) : (
        <h2>Your Realm Choice: {realmChoice}</h2>
      )}
    </div>
  );
}

function PollStatus(props) {
  const pollStatus = usePollStatus(props.bettingContract);

  if (!props.bettingContract || !pollStatus) {
    return null;
  }
  return (
    <h1>
      POLLS ARE{' '}
      <span
        className={
          pollStatus.toLowerCase() === 'open' ? 'status-green' : 'status-red'
        }
      >
        {pollStatus}
      </span>
    </h1>
  );
}

function PrizeMoney(props) {
  const prizeMoney = usePrizeMoney(props.bettingContract);
  return (
    <div className="container">
      <h2>Prize Money: {prizeMoney}</h2>
    </div>
  );
}

function MinimumEntryFee(props) {
  const minimumEntryFee = useMinimumEntryFee(props.bettingContract);
  return (
    <div className="container">
      <h2>Minimum Entryfee ($50 in ETH): {minimumEntryFee} ETH</h2>
    </div>
  );
}

//
// Hooks
//

/**
 * @param {string} userAddress
 */
const useUserAddress = () => {
  const [userAddress, setUserAddress] = useState(null);

  useEffect(() => {
    // Check if Web3 has been injected by the browser (Mist/MetaMask)
    ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        //console.log(accounts);
        if (accounts[0]) {
          setUserAddress(accounts[0]);
        }
      })
      .catch(console.error);
  }, []);

  return userAddress;
};

/**
 * The total pot amount in contract
 * @param {*} bettingContract
 * @returns {string}
 */
const usePrizeMoney = (bettingContract) => {
  const [prizeMoney, setPrizeMoney] = useState('');
  useEffect(() => {
    if (!bettingContract) {
      return;
    }
    const getPrizeMoney = async () => {
      const prizeMoney = await bettingContract.methods.getPrizeMoney().call();
      setPrizeMoney(web3.utils.fromWei(prizeMoney, 'ether'));
    };
    getPrizeMoney();
  }, [bettingContract]);

  return prizeMoney;
};

/**
 * @param {*} bettingContract
 * @returns {string}
 */
const useMinimumEntryFee = (bettingContract) => {
  const [minimumEntryFee, setMinimumEntryFee] = useState('');
  useEffect(() => {
    if (!bettingContract) {
      return;
    }
    const getMinimumEntryFeeHandler = async () => {
      // const accounts = await web3.eth.getAccounts()
      try {
        const entranceFee = await bettingContract.methods
          .getEntranceFee()
          .call();
        const readableEntranceFee = parseFloat(
          web3.utils.fromWei(entranceFee)
        ).toFixed(7);
        setMinimumEntryFee(readableEntranceFee);
      } catch (err) {
        console.log(err);
      }
      //const readableEntryFee = web3.utils.fromWei(minimumEntryFee, 'ether')
      //setMinimumEntryFee(readableEntryFee)
    };
    getMinimumEntryFeeHandler();
  }, [bettingContract]);

  return minimumEntryFee;
};

const pollStatusOptions = ['OPEN', 'CLOSED', 'CALCULATING'];

/**
 * @param {*} bettingContract
 * @returns {"OPEN" | "CLOSED" | "CALCULATING"}
 */
const usePollStatus = (bettingContract) => {
  const [pollStatus, setPollStatus] = useState('');

  useEffect(() => {
    if (!bettingContract) {
      return;
    }
    const getPollStatus = async () => {
      const pollStatus = await bettingContract.methods.getPollStatus().call();
      setPollStatus(pollStatusOptions[pollStatus]);
    };
    getPollStatus();
  }, [bettingContract]);

  return pollStatus;
};

/**
 * @param {{bettingContract: any, userAddress: any}} param0
 * @returns {string}
 */
const useOnchainUserBet = ({ bettingContract, userAddress }) => {
  const [onchainUserBet, setOnchainUserBet] = useState('');
  useEffect(() => {
    if (!bettingContract || !userAddress) {
      return;
    }
    const getUserBet = async () => {
      try {
        const result = await bettingContract.methods
          .getUserStructData()
          .call({ from: userAddress });
        const readableOnChainBet = web3.utils.fromWei(result[3]);
        setOnchainUserBet(readableOnChainBet);
      } catch (err) {
        console.log(err);
      }
    };
    getUserBet();
  }, [bettingContract, userAddress]);

  return onchainUserBet;
};

/**
 * @param {{bettingContract: any, userAddress: string}} param0
 * @returns {number}
 */
const useRealmChoice = ({ bettingContract, userAddress }) => {
  const [realmChoice, setRealmChoice] = useState(42);

  useEffect(() => {
    if (!bettingContract) {
      return;
    }
    const getRealmChoice = async () => {
      const result = await bettingContract.methods
        .getUserStructData()
        .call({ from: userAddress });
      const index = result[1] - 1; // I have to shift it down from one since solidity's 0 is EMPTY while API/frontend's 0 is ASKR
      //let keys = Object.keys(realms) // keys[index] will give me the position of what realm was chose
      const values = Object.values(realms); // will give the object with both the realm and image
      const realmChoice = values[index];
      if (realmChoice) {
        setRealmChoice(realmChoice.realm);
      }
    };
    getRealmChoice();
  });

  return realmChoice;
};

export default Resplendent;