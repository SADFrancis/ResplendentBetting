from brownie import (
    network,
    accounts,
    config,
    interface,
)
from web3 import Web3

# making my life easy in deploying to either mainnet-fork or kovan



def fund_with_link(account,contract_address, amount):
    # prep as decimals don't exist on Ethereum (aka multiply by 10^18)
    wei_amount = Web3.toWei(amount,"ether")
    # grab the ABI from the LinkTokenInterface from address
    link_token = interface.LinkTokenInterface(config["networks"][network.show_active()]["link_token"])
    # approve spending a link token
    approve_tx = link_token.approve(account,wei_amount,{"from": account})
    approve_tx.wait(1)
    # transfer
    transfer_tx = link_token.transfer(contract_address,wei_amount,{"from":account})
    transfer_tx.wait(1)
    print(f"Contract {contract_address} funded by {amount} Link!")

def get_account(num=None):
    # I have a few accounts in my brownie-config.yaml file 
    # from_key and then from_key_N where N == some integer
    if num:
        account = accounts.add(config["wallets"][f"from_key_{num}"])
    else:
        account = accounts.add(config["wallets"]["from_key"])
    return account
 
