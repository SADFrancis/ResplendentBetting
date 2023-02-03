# Fire Emblem Heroes Resplendent Betting Contract

This project is a frontend for a contract that allows people to bet on the next "realm" theme of the resplendent that is revealed in Fire Emblem Heroes. Every 10th and 25th, a new resplendent outfit is released for a character in Fire Emblem Heroes, a mobile title created by Intelligent Systems and Nintendo. This allows people to bet on which in-game realm or kingdom the newly released character's outfit was inspired by.

The contract is deployed on the Rinkeby network with the address: `0xDE9A750E9DE9c1d1c20CDFd6734D50623905d38f`

You can view the contract on the Rinkeby network using the [defunct Rinkeby explorer](https://rinkeby.etherscan.io/address/0xDE9A750E9DE9c1d1c20CDFd6734D50623905d38f).

You can access the frontend for the contract at [https://fehresplendentpoll.herokuapp.com/resplendent](https://fehresplendentpoll.herokuapp.com/resplendent).

New characters are released on [https://fehpass.fire-emblem-heroes.com/en-US/](https://fehpass.fire-emblem-heroes.com/en-US/).

The contract uses a Chainlink oracle to connect to a custom built API that scrapes data from the above website (you can find the API at [https://feh-resplendent.herokuapp.com/](https://feh-resplendent.herokuapp.com/)). It then uses Chainlink price feed data to set a minimum fee of $50 to participate in each betting round.
