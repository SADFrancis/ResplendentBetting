//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;

//import "./User.sol";
//import "./BetStatus.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

import "./APIConsumer.sol";

//contract APIConsumer{ function requestData() public view returns(bytes32);} 

contract Betting is Ownable, APIConsumer {
    enum Bet{EMPTY, ASKR, EMBLA,NIFL,MUSPELL,HEL,LIGHT_FAIRY,DARK_FAIRY,MECHA,GIANT}
    enum POLL_STATE {
        OPEN,
        CLOSED,
        CALCULATING_WINNERS
    }
    struct User {
        address id;
        Bet bet;
        bool hasBet;
        uint256 amountBet;
        uint256 winningPercentage;  
    }

    POLL_STATE public poll_state;
    mapping(string => int8) public resplendentThemes;
    address[] public Voters;
    mapping(address => User) public users; 
    address payable public contractAddress;
    Bet public finalResultIs;
    mapping(uint => address) public Winners;
    uint public winnerCount;
    User resetUser; 
    address nulladdress;
    event WinnerPayed(address indexed winner, uint256 amount);
    event api_data_received(uint indexed new_resplendent, address sender);
    uint public resplendent;

    APIConsumer internal ResplendentRequest;

    // Ethereum Price Feed routine variables
    AggregatorV3Interface internal ethUsdPriceFeed;
    uint256 public usdEntryFee;
    /**
     * Network: Kovan
     * Aggregator: ETH/USD
     * Address: 0x9326BFA02ADD2366b30bacB125260Af641031331
     * Network: Rinkeby
     * Aggregator: ETH/USD
     * Address: 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
     */


    constructor() public{
        contractAddress = payable(address(this));
        resplendent =42;
        finalResultIs = Bet.EMPTY;
        winnerCount = 0;
        nulladdress = 0x0000000000000000000000000000000000000000;
        resetUser = User(nulladdress,Bet(0), false, 0,0);  
        ethUsdPriceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
        usdEntryFee = 50 * (10**18); // current price, $50 in ETH 
        api_data ="";
        poll_state = POLL_STATE.OPEN;
}

    // Open Lottery
     function openPoll() public onlyOwner {
        require(
            poll_state == POLL_STATE.CLOSED,
            "Can't start a new lottery yet!"
        );
        poll_state = POLL_STATE.OPEN;
    }


    //

    function getPollStatus() public view returns (POLL_STATE) {
        return(poll_state);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (int) {
        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = ethUsdPriceFeed.latestRoundData();
        return price; // returns in gwei
    }

    // setting the entrance fee 

    function getEntranceFee() public view returns (uint256) {
        (, int256 price, , , ) = ethUsdPriceFeed.latestRoundData();
        uint256 adjustedPrice = uint256(price) * 10**10; // 18 decimals -> convert it to wei
        // $50, $2,000 / ETH
        // 50/2,000
        // 50 * 100000 / 2000
        uint256 costToEnter = (usdEntryFee * 10**18) / adjustedPrice;
        return costToEnter; // returns in Wei
    }


    function placeBet(uint8 _bet) public payable{
        require(!users[msg.sender].hasBet, "User has already bet!");
        require(msg.value >= getEntranceFee(),"Don't be cheap! $50 or more in ETH!");
        require(poll_state == POLL_STATE.OPEN, "Polls are closed :/");

        User memory user = User(msg.sender,Bet(_bet+1),true,msg.value, 0);
        Voters.push(msg.sender);
        users[msg.sender] = user;
    }
    
    function getPrizeMoney() public view returns(uint256){
        return(contractAddress.balance * 99)/100; //Contract collects a 1% fee
    }
    
    function getUserStructData() public view returns(User memory){
        return users[msg.sender];
    }

    function setFinalResult(uint _resplendent) private {
        finalResultIs = Bet(_resplendent);
    }

    function sortPlayersByBetsAndGetWinners() private {
        uint256 totalAmountBetByWinners = 0;
        winnerCount = 0;
        setFinalResult(resplendent);
        

        for(uint256 i =0; i < Voters.length; i++){
            if(users[Voters[i]].bet == finalResultIs){
                totalAmountBetByWinners =totalAmountBetByWinners+ users[Voters[i]].amountBet;
                Winners[winnerCount] = users[Voters[i]].id;
                winnerCount++;
            }
        }
        for (uint256 j = 0; j < winnerCount; j++) {    
            users[Winners[j]].winningPercentage = (users[Winners[j]].amountBet*100) / totalAmountBetByWinners;
        }
    }


    // working on this function
    function requestResplendentValue() public onlyOwner {
        requestData(address(this), getFunctionSelector());
    }

    function getFunctionSelector() public pure returns(bytes4) {
        return this.fulfillResplendentValue.selector;
    }

    function fulfillResplendentValue(bytes32 _requestId, bytes32 _api_data) public recordChainlinkFulfillment(_requestId){
        api_data = _api_data;
        (resplendent,) = strToUint(bytes32ToString(_api_data));
        resplendent +=1; // have to shift up since enum Bet's 0 is EMPTY while API's 0 is ASKR
        emit api_data_received(resplendent,owner());
    }
    
    function payWinners() private {
        require(contractAddress.balance >= 0 wei, "No bets placed");
        sortPlayersByBetsAndGetWinners();
        require(winnerCount > 0, "No winners this round");
        uint256 prizemoney = getPrizeMoney();

        for (uint256 i = 0; i < winnerCount; i++) {
            uint256 amountForWinner = (users[Winners[i]].winningPercentage * prizemoney)/100;
            payout(payable(Winners[i]),amountForWinner);
        }
        payout(payable(owner()),address(this).balance);
        poll_state = POLL_STATE.CLOSED;

    }    
    
    function payout(address payable _to, uint256 _amount) private {
        (bool success,) = _to.call{value:_amount}("");
        require(success, "Failed to pay winner");
        emit WinnerPayed(_to, _amount);
    }
    
    function CleanWinnningMapping() private{
        for (uint i = 0; i < winnerCount; i++){
            Winners[i] = nulladdress;
        }

        winnerCount = 0;

        for(uint j = 0; j < Voters.length; j++)
        {
            users[Voters[j]] = resetUser;
        }

        delete Voters;
    }

    function finalResult() public onlyOwner {
        poll_state = POLL_STATE.CALCULATING_WINNERS;
        payWinners();
        CleanWinnningMapping();
    }
    
}
