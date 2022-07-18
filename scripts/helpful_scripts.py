from brownie import (
    network,
    accounts,
    config,
    MockV3Aggregator,
    VRFCoordinatorMock,
    LinkToken,
    Contract,
    interfaces,
)

FORKED_LOCAL_ENVIRONMENTS = ["mainnet-fork", "mainnet-fork-dev"]
LOCAL_BLOCKCHAIN_ENVIRONMENTS = ["development", "ganache-local"]
DECIMALS = 8
STARTING_PRICE = 2000 * 10 ** 8  # Chainlink price feed returns 8 decimals, so mock this

contract_to_mock = {
    "eth_usd_price_feed": MockV3Aggregator,
    "vrf_coordinator": VRFCoordinatorMock,
    "link_token": LinkToken,
}

def get_account(index=None, id=None):
    # accounts[0]
    # accounts.add("env")
    # accounts.load("id")
    if index:
        return accounts[index]
    if id:
        return accounts.load(id)
    if (
        network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS
        or network.show_active() in FORKED_LOCAL_ENVIRONMENTS
    ):
        return accounts[0]
    return accounts.add(config["wallets"]["from_key"])

def fund_with_link(
    contract_address, account=None, link_token=None, amount=0.1*10**18
):  # 0.1 LINK
    account = account if account else get_account()
    link_token = link_token if link_token else get_contract("link_token")
    tx = link_token.transfer(contract_address, amount, {"from": account})
    # link_token_contract = interface.LinkTokenInterface(link_token.address)
    # tx = link_token_contract.transfer(contract_address, amount, {"from": account})
    tx.wait(1)
    print("Fund contract!")
    return tx

def get_contract(contract_name):
    """This function will grab the contract addresses from the brownie config if defined.
    Otherwise it will deploy a mock version of that contract, and return that mock contract.

        Args:
            contract_name (string)

        Returns:
            brownie.network.contract.ProjectContract: The most recently deployed version
            of this contract.
            Contract[-1]

    """
    contract_type = contract_to_mock[contract_name]
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        if len(contract_type) <= 0:
            # MockV3Aggregator.length
            deploy_mocks()
        contract = contract_type[-1]
    else:
        contract_address = config["networks"][network.show_active()][contract_name]
        # need address and ABI
        contract = Contract.from_abi(
            contract_type._name, contract_address, contract_type.abi
        )
    return contract

def deploy_mocks(decimals=DECIMALS, initial_value=STARTING_PRICE):
    print(f"The active network is {network.show_active()}")
    print("Deploying Mocks...")
    if len(MockV3Aggregator) <= 0:
        # check sol contracts to find what is needed for constructors
        MockV3Aggregator.deploy(decimals, initial_value, {"from": get_account()})
        link_token = LinkToken.deploy({"from": get_account()})
        VRFCoordinatorMock.deploy(link_token.address, {"from": get_account()})

    print("Mocks Deployed!")    