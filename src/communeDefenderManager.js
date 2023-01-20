require("communeDefenderFunctions")

function communeDefenderManager(room, creepsWithRole) {

    if (creepsWithRole.length == 0) return

    for (let creep of creepsWithRole) {

        const roomFrom = creep.memory.roomFrom
        let remoteRoom

        for (let remoteRoomName in Memory.rooms[roomFrom].remoteRooms) {

            let remoteRoomMemory = Memory.rooms[roomFrom].remoteRooms[remoteRoomName]

            if (!remoteRoomMemory.enemy) continue

            remoteRoom = remoteRoomName
            break
        }

        creep.memory.remoteRoom = remoteRoom

        if (remoteRoom) {

            let enemyCreepsObject = creep.findEnemies()

            creep.healMyCreeps(enemyCreepsObject.enemyAttacker)

            if (room.name == remoteRoom) {

                if (enemyCreepsObject.enemyCreeps.length == 0) {

                    Memory.rooms[creep.memory.roomFrom].remoteRooms[creep.memory.remoteRoom].enemy = false
                }

                if (creep.advancedRangedAttackEnemies(enemyCreepsObject.enemyCreeps, enemyCreepsObject.enemyCreep, enemyCreepsObject.enemyAttacker)) continue

                continue
            }

            creep.say(remoteRoom)

            creep.travel({
                origin: creep.pos,
                goal: { pos: new RoomPosition(25, 25, remoteRoom), range: 1 },
                plainCost: 1,
                swampCost: false,
                defaultCostMatrix: false,
                avoidStages: ["enemyRoom", "keeperRoom", "enemyReservation"],
                flee: false,
                cacheAmount: 10,
            })

            continue
        }

        let enemyCreepsObject = creep.findEnemies()

        creep.healMyCreeps(enemyCreepsObject.enemyAttacker)

        if (room.name == roomFrom) {

            if (creep.defendRamparts(enemyCreepsObject.enemyCreeps, enemyCreepsObject.enemyAttacker)) continue

            if (creep.advancedRangedAttackEnemies(enemyCreepsObject.enemyCreeps, enemyCreepsObject.enemyCreep, enemyCreepsObject.enemyAttacker)) continue

            if (creep.wait()) continue

            continue
        }

        creep.say(roomFrom)

        creep.travel({
            origin: creep.pos,
            goal: { pos: new RoomPosition(25, 25, roomFrom), range: 1 },
            plainCost: 1,
            swampCost: false,
            defaultCostMatrix: false,
            avoidStages: ["enemyRoom", "keeperRoom", "enemyReservation"],
            flee: false,
            cacheAmount: 10,
        })
    }
}

module.exports = communeDefenderManager