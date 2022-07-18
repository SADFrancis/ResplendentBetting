from brownie import Betting, Fixed
import requests
import pytest
from scripts.deploy_bet import deploy_bet, get_entrance_fee, retrieve_latest_resplendent_theme
from scripts.helpful import fund_with_link, get_account
from web3 import Web3

# make sure the entrance fee of $50 in ETH works
def test_get_entrance_fee():
    account = get_account()
    bet = deploy_bet(account)
    bet = Betting[-1]
    entrance_fee = Web3.fromWei(int(get_entrance_fee(bet)),'ether')
    print(entrance_fee)
    assert entrance_fee > 0
    return

# def test_enter_bet():
#     return

# make sure the bet can't be closed by another user

def test_only_owner_close_poll():
    #account = get_account()
    #bet = Betting[-1]
    pass


# Test calling an API and make sure it returns what's expected.
def test_get_latest_theme():
    account = get_account()
    bet = Betting[-1]
    fund_with_link(account, bet.address, 0.1)
    theme = retrieve_latest_resplendent_theme(bet,account)
    #check_api_theme = check_api_theme_id_response()
    print(f"the value of theme through the chainlink node is {theme}")
    assert Fixed(theme) == Fixed(check_api_theme_id_response())




###### helpful functions ######

def check_api_theme_id_response():
    # grab the index of the theme of the latest resplendent
    response = requests.get("https://feh-resplendent.herokuapp.com/characters/latest?format=json")
    jason = response.json()    
    return jason["realm_index"]