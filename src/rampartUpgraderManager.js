function rampartUpgraderManager(room, creepsWithRole) {

    let ramparts = room.get("myRamparts")
    if (ramparts.length == 0) return

    for (let creep of creepsWithRole) {

        creep.isFull()
        const isFull = creep.memory.isFull

        if (isFull) {

            creep.memory.quota ? creep.say((creep.memory.quota).toFixed(0) / 1000 + "k") : creep.say("NQ")

            if (creep.findRampartToRepair(ramparts)) creep.repairRamparts(creep.target, ramparts)

        } else {

            let storage = room.get("storage")
            let terminal = room.get("terminal")

            if (storage || terminal) {

                console.log(creep.withdrawStoredResource(10000))

            } else {

                let container = creep.searchSourceContainers()

                if (container) {

                    creep.say("SC")

                    creep.advancedWithdraw(container)

                } else {

                    let droppedEnergy = creep.findDroppedEnergyOfAmount(creep.store.getFreeCapacity())

                    if (droppedEnergy) {

                        creep.say("💡")

                        creep.pickupDroppedEnergy(droppedEnergy)
                    }
                }
            }
        }
    }
}

module.exports = rampartUpgraderManager