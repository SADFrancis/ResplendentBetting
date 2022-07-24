import Head from 'next/head' //NextJS lets you write things that normally go in the Head section directly in a component without going index.html in normal react applications
import { useState, useEffect} from 'react'
import Web3 from 'web3'
//import bettingContract from '../blockchain/resplendent_contract_export'
import 'bulma/css/bulma.css'
import styles from '../styles/Resplendent.module.css'
import { Reader } from '@ethersproject/contracts/node_modules/@ethersproject/abi/lib/coders/abstract-coder'
import ResplendentCard from './ResplendentCard'
import { realms } from '../data/realms'
import buildData from '../../build/contracts/Betting.json'
    

const Resplendent = () => {

    const [error, setError] = useState('')
    const [prizeMoney, setPrizeMoney] = useState('')
    const [minimumEntryFee, setMinimumEntryFee] = useState('')
    const [connected, setConnected] = useState('Connect Wallet')
    const [userBet, setUserBet] = useState('')
    const [onchainUserBet, setOnchainUserBet] = useState('')
    const [userAddress, setUserAddress] = useState(null)
    const [realmChoice, setRealmChoice] = useState(42)
    const [web3,setWeb3] = useState(null)
    const [bettingContract, setBettingContract] = useState(null)
    const [isWeb3InstanceSet,setWeb3Instance] = useState(null)
    const [POLLSTATUS, setPOLLSTATUS] = useState('')
    useEffect( () => {
        
        if (bettingContract) {
            getPrizeMoneyHandler() 
            getMinimumEntryFeeHandler()
            getPollStatusHandler()
            getUserBetHandler()
            getUserRealmChoiceHandler()
        } 
        if (web3 && isWeb3InstanceSet === null){
            setWeb3ObjectHandler()
        } 
        checkConnectionHandler()
    },[bettingContract,web3])

    const poll_status_options = Array("OPEN","CLOSED","CALCULATING")

    // Show the total pot amount in contract
    const getPrizeMoneyHandler = async () => {
        const prizeMoney = await bettingContract.methods.getPrizeMoney().call()
        setPrizeMoney(web3.utils.fromWei(prizeMoney,'ether'))
    }

    const getPollStatusHandler = async () => {
        const pollStatus = await bettingContract.methods.getPollStatus().call()
        setPOLLSTATUS(pollStatus)
    }

    const checkConnectionHandler = ()=> {
        ethereum
            .request({ method: 'eth_accounts' })
            .then(checkAccountConnected)
            .catch(console.error);
    }


    const setWeb3ObjectHandler = async () => {
        // const provider = new Web3.providers.HttpProvider(
        //     process.env.NEXT_PUBLIC_RINKEBY_RPC_URL
        // )
        // const web3 = new Web3(provider)
        const bettingContract = new web3.eth.Contract(buildData.abi,"0xDE9A750E9DE9c1d1c20CDFd6734D50623905d38f")
        
        setWeb3Instance(1)
        setWeb3(web3)
        setBettingContract(bettingContract)
    }

    const checkAccountConnected = (accounts) => {
        //console.log(accounts);
        if (accounts[0]) {
            setConnected('Connected')
            setUserAddress(accounts[0])
         }
    }

    // const getUserBet = event => {
    //     setUserBet(event.target.value)
    // }

    const getUserBetHandler = async () => {
        try {
            bettingContract.methods.getUserStructData().call({ from: userAddress })
                .then((result) => {
                    let readableOnChainBet = web3.utils.fromWei(result[3])
                    setOnchainUserBet(readableOnChainBet)
            })
        }
        catch (err){
            console.log(err)
        }
    }

    const getUserRealmChoiceHandler = async () => {
        try {
            bettingContract.methods.getUserStructData().call({ from: userAddress })
                .then((result) => {
                    let index = result[1] - 1 // I have to shift it down from one since solidity's 0 is EMPTY while API/frontend's 0 is ASKR
                    //let keys = Object.keys(realms) // keys[index] will give me the position of what realm was chose
                    let values = Object.values(realms) // will give the object with both the realm and image
                    let realm_choice = values[index]
                    if (realm_choice) { setRealmChoice(realm_choice.realm) }
            })
        }
        catch (err){
            console.log(err)
        }
    }

    const getMinimumEntryFeeHandler = async () => {
        //const accounts = await web3.eth.getAccounts()
        try {
            bettingContract.methods.getEntranceFee().call().then((EntranceFee) => {
                var readableEntranceFee = web3.utils.fromWei(EntranceFee)
                readableEntranceFee = parseFloat(readableEntranceFee).toFixed(7)
                setMinimumEntryFee(readableEntranceFee)
            });
        } catch (err) {
            console.log(err)
        }
        //const readableEntryFee = web3.utils.fromWei(minimumEntryFee, 'ether')
        //setMinimumEntryFee(readableEntryFee)
    }

    const setResplendentValue = value => () => {
        setRealmChoice(value)
    }

    const connectWalletHandler = async () => {
        // Check if Metamask is available
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            try {
                //request wallet connect
                await window.ethereum.request({ method: "eth_requestAccounts" })

                //set web3 instance
                web3 = new Web3(window.ethereum)
                setWeb3(web3)

                //get list of accounts
                const accounts = await web3.eth.getAccounts()
                setUserAddress(accounts[0])
            } catch (err) {
                setError(err.message)
            }

            
        } else {
            // meta not installed
            console.log("Please install Metamask")
        }
    }
    
    return (
    <div className={styles.main}>
        <Head>
            <title>Resplendent Betting Site</title>
            <meta name="description" content="Come bet on the next Resplendent outfit with the blockchain!" />
        </Head>
            {/* .hero */}
                           

        <navbar className="navbar mt-4 mb-4">
            <div className="container">
                <div className="navbar-brand">
                        <h1>Resplendent Betting Site</h1>
                        <div className="navbar ml-6">
                            {bettingContract !== null &&
                                poll_status_options[POLLSTATUS] !== undefined &&
                                <h1>POLLS ARE <span className={poll_status_options[POLLSTATUS].toLowerCase() === "open" ? "status-green" : "status-red"}>{poll_status_options[POLLSTATUS]}</span></h1>
                            }
                        </div>
                        
                </div>
                <div className="navbar-end">
                    <button onClick={connectWalletHandler} className="button is-primary">{connected}</button>
                </div>
        </div>
        </navbar>
        <section>
            <div className="container">
                <h2>Prize Money: {prizeMoney}</h2>
            </div>
        </section>
        <section>
            <div className="container">
                <h2>Minimum Entryfee ($50 in ETH): {minimumEntryFee} ETH</h2>
            </div>
        </section>
        <section>
            <div className="container has-text-danger">
                <p>{error}</p>
            </div>
        </section>
        <section>
            <div className="container">
                <h2>Your bet: {onchainUserBet} ETH</h2>
                { realmChoice === 42 ?
                        <h2>Your Realm Choice: You have yet to choose</h2>  
                        : <h2>Your Realm Choice: {realmChoice}</h2> 
                }
                    
            </div>
            </section>
        
        {/* Make the boxes for each Realm */}
        <div className="realms-container container">
            {/* Askr Box */ }
                {realms.map((item, index) =>
                (<ResplendentCard
                    key={index}
                    id={index}
                    realm={item.realm}
                    image={item.image.src}
                    stateChanger={setUserBet}
                    betAmount={userBet}
                    web3={web3}
                    account={userAddress}
                    contract={bettingContract} />)    
                )
                }
        </div>
        {/* About the project section */}
        <div className="block">        
            <article className="message is-info">
                <div className="message-header">
                    <p>About Us</p>    
                </div>
                <div className="message-body">
                    Testing Testing 1 2 3    
                </div>    
            </article>
                </div>
    </div>
    )
}

export default Resplendent