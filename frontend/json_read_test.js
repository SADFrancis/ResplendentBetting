var fs = require('fs');
var data = JSON.parse(fs.readFileSync("../build/contracts/Betting.json"))
console.log(data.abi)