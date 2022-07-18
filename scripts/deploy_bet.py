from scripts.helpful import fund_with_link, get_account
from brownie import Betting, network, config
import time
from web3 import Web3


def deploy_bet(account):
    bet = Betting.deploy({"from": account}, publish_source=True)
    print("Deployed Betting Contract!")
    return bet

def enter_bet():
    account = get_account()
    bet = Betting[-1]
    #starting_tx = bet.
    return


def get_entrance_fee(bet):
    fee = bet.getEntranceFee()
    print(f"Current Entrance fee is {fee} Wei")
    return fee

def retrieve_latest_resplendent_theme(bet,account):
    bet.requestData({"from": account})
    bytes32_data = bet.api_data()
    theme_int_string = bet.bytes32ToString(bytes32_data)
    theme_int = bet.strToUint(theme_int_string) # returns int + error value
    return theme_int[0]

def deploy_and_retrieve_resplendent():
    account = get_account()
    bet = deploy_bet(account)
    fund_with_link(account, bet.address,0.1)
    bet.requestResplendentValue({"from":account})

def main():
    account = get_account()
    bet = deploy_bet(account)
    #bet = Betting[-1]
    #print(f"Funding Betting Contract {bet.address}")
    #fund_with_link(account, bet.address, 0.1)
    print("Now to determine the entrance fee in ETH")
    fee = Web3.fromWei(int(get_entrance_fee(bet)),'ether')
    print(f"In ether terms, the $50 fee is {fee}")
    #print("Make sure we can query the theme id of the latest unit from the API")
    #theme = retrieve_latest_resplendent_theme(bet,account)
    #print(f"theme index is: {theme}, a {type(theme)}")

