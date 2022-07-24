import React, {useState} from 'react'
import Image from 'next/image'
import bettingContract from '../blockchain/resplendent_contract_export'
import {userBetHook } from './UserBetHook'
import Web3 from 'web3'
import web3 from 'web3'


const ResplendentCard = ({id, realm, image, stateChanger, betAmount, web3, account, contract}) => {


    // Submit Resplendent Choice to Blockchain
    const handleSubmit = async (web3, id, userBet, account ) => {
        //console.log(`I bet ${userBet} ETH on ${id} `)

        // try {
        //     contract.methods.getEntranceFee().call().then((EntranceFee) => {
        //         var readableEntranceFee = web3.utils.fromWei(EntranceFee)
        //         readableEntranceFee = parseFloat(readableEntranceFee).toFixed(7)
        //         console.log(readableEntranceFee)
        //     });
        // } catch (err) {
        //     console.log(err)
        // }

        try {
             await contract.methods.placeBet(id).send({
                from: account,
                value: web3.utils.toWei(userBet,'ether')
            })
        } catch (err) {
            alert(err.message)
        }
    }

    return (
        <div className="resplendent-card">
              <h1 className="title">{realm}</h1>
            <Image className='resplendent-image' src={image} width={250} height={250} />
        <form>
            {/*Get the bet amount*/}
            <div className="control">
                    <input type="text" className="input is-info" placeholder="Input Bet Amount" onChange={(event)=> stateChanger(event.target.value)}/>
            </div>
        </form>
            {/* Set the Resplendent Value */ }
            <button onClick={()=> handleSubmit(web3, id,betAmount, account)} className="button is-info mt-2">Submit</button>
        </div>        
  )
}

export default ResplendentCard