//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.7;
import "./BetStatus.sol";

struct User {
        address id;
        Bet bet;
        bool hasBet;
        uint256 amountBet;
        uint256 winningPercentage;  
    }