module.exports.cliPort = 21026

module.exports.tickDuration = 10

module.exports.playerRooms = {"W2N2":'user1',"W1N1":"user2","W2N5":"user3"}
module.exports.rooms ={
     "W1N1":'bot',
     "W6N1":'bot',
     "W2N5":'bot',
     "W5N8":'bot',
     "W7N3":'bot',
     "W9N9":'bot',
     "W3N9":'bot',
     "W8N6":'bot',
     "W3N3":'bot',
}

module.exports.milestones = [
     { tick: 10000, check: { level: 2 }, required:false },
     { tick: 15000, check: { level: 3 }, required:false },
     { tick: 45000, check: { level: 4 }, required:false },
]
