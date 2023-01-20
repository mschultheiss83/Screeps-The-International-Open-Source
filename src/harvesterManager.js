function harvesterManager(room, creepsWithRole) {

    if (creepsWithRole.length == 0) return

    function findTask(creep) {

        let creepsWithTask = { source1: 0, source2: 0 }

        creepsWithRole.filter(function(creep) {

            const task = creep.memory.task
            if (!task) return

            creepsWithTask[task] += 1
        })

        let energyCapacity = room.energyCapacityAvailable

        if (energyCapacity >= 550) {

            var maxHarvesters = 1

        } else {

            var maxHarvesters = 2
        }

        let source1HarvestPositionsAmount = room.get("source1HarvestPositions").positions.length
        let source2HarvestPositionsAmount = room.get("source2HarvestPositions").positions.length
        let sourcePositions = { source1: source1HarvestPositionsAmount, source2: source2HarvestPositionsAmount }

        for (let source in creepsWithTask) {

            let creepsWithtaskAmount = creepsWithTask[source]

            if (creepsWithtaskAmount < Math.min(maxHarvesters, sourcePositions[source])) creep.memory.task = source
        }
    }

    for (let creep of creepsWithRole) {

        creep.say("🚬")

        let task = creep.memory.task

        if (!task) task = findTask(creep)

        if (!task) continue

        creep.say(task)

        // Assign targets depending on task

        if (task == "source1") {

            var source = room.get("source1")
            var sourceLink = room.get("sourceLink1")
            var sourceContainer = room.get("sourceContainer1")

        } else {

            var source = room.get("source2")
            var sourceLink = room.get("sourceLink2")
            var sourceContainer = room.get("sourceContainer2")
        }

        // If full or almost full transfer to sourceLink if exists

        if (sourceLink && creep.store.getUsedCapacity() >= creep.store.getCapacity() - creep.findParts("work") * 2) {

            creep.transfer(sourceLink, RESOURCE_ENERGY)
        }

        // If source container stand on it to harvest

        if (sourceContainer) {

            if (creep.pos.getRangeTo(sourceContainer) == 0) {

                creep.advancedHarvest(source)

            } else {

                creep.travel({
                    origin: creep.pos,
                    goal: { pos: sourceContainer.pos, range: 0 },
                    plainCost: false,
                    swampCost: false,
                    defaultCostMatrix: room.memory.defaultCostMatrix,
                    avoidStages: [],
                    flee: false,
                    cacheAmount: 20,
                })
            }
        } else {

            // If no source container just move to source target

            if (creep.advancedHarvest(source) != 0) {

                creep.travel({
                    origin: creep.pos,
                    goal: { pos: source.pos, range: 1 },
                    plainCost: false,
                    swampCost: false,
                    defaultCostMatrix: room.memory.defaultCostMatrix,
                    avoidStages: [],
                    flee: false,
                    cacheAmount: 20,
                })
            }
        }

        creep.avoidEnemys()
    }
}

module.exports = harvesterManager