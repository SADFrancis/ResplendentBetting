import Web3 from "web3"
import fs from 'fs'
import buildData from '../../build/contracts/Betting.json'
import ReactDOM from 'react-dom';
import { abiData } from "../../build";

// export local copies of contracts

const provider = new Web3.providers.HttpProvider(
    process.env.NEXT_PUBLIC_RINKEBY_RPC_URL
)
const web3 = new Web3(provider)

const bettingContract = new web3.eth.Contract(buildData.abi,"0x6841121b8CC025D2558eBC1a7144B17B1F25159B")

export default bettingContract