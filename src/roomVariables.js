function roomVariables(room) {

    let allCreeps = room.find(FIND_CREEPS)

    let myCreeps = room.find(FIND_MY_CREEPS)

    let creeps = {
        allCreeps: allCreeps,

        myCreeps: myCreeps,
        /* allyCreeps: allyCreeps,
        enemyCreeps: enemyCreeps,
        invaderCreeps: invaderCreeps, */
    }

    let allPowerCreeps = room.find(FIND_POWER_CREEPS)

    let powerCreeps = {
        allCreeps: allPowerCreeps,

        myCreeps: "",
        allyCreeps: "",
        enemyCreeps: "",
    }

    function findBuildingConstantOfType(constant, type) {

        return room.find(constant, {
            filter: building => building.structureType == type
        })
    }

    let allSites = room.find(FIND_CONSTRUCTION_SITES)

    let mySites = room.find(FIND_MY_CONSTRUCTION_SITES)

    let constructionSites = {
        allSites: allSites,
        mySites: mySites,
    }

    let allStructures = room.find(FIND_STRUCTURES)

    let spawns = room.find(FIND_MY_SPAWNS)

    let links = findBuildingConstantOfType(FIND_MY_STRUCTURES, STRUCTURE_LINK)

    let labs = findBuildingConstantOfType(FIND_MY_STRUCTURES, STRUCTURE_LAB)

    let towers = findBuildingConstantOfType(FIND_MY_STRUCTURES, STRUCTURE_TOWER)

    let containers = findBuildingConstantOfType(FIND_STRUCTURES, STRUCTURE_CONTAINER)

    let factory = findBuildingConstantOfType(FIND_MY_STRUCTURES, STRUCTURE_FACTORY)[0]

    let powerSpawn = findBuildingConstantOfType(FIND_MY_STRUCTURES, STRUCTURE_POWER_SPAWN)[0]

    let storage = room.storage

    let terminal = room.terminal

    let controller = room.controller

    let mineral = room.find(FIND_MINERALS)[0]

    let sources = room.find(FIND_SOURCES)

    let structures = {
        allStructures: allStructures,

        spawns: spawns,
        links: links,
        labs: labs,
        towers: towers,
        containers: containers,
        storage: storage,
        terminal: terminal,
        factory: factory,
        powerSpawn: powerSpawn,

        controller: controller,
        mineral: mineral,
        sources: sources,
    }

    const source1 = findObjectWithId(room.memory.source1)
    const source2 = findObjectWithId(room.memory.source2)

    if (room.memory.stage > 0 || room.memory.stage == "remoteRoom") {

        if (!source1 && sources[0]) room.memory.source1 = sources[0].id
        if (!source2 && sources[1]) room.memory.source2 = sources[1].id
    }

    let baseContainer
    let controllerContainer
    let mineralContainer
    let sourceContainer1
    let sourceContainer2

    for (let container of containers) {

        if (storage && container.pos.getRangeTo(storage) <= 2) {

            baseContainer = container
            continue
        }
        if (container.pos.getRangeTo(controller) <= 2) {

            controllerContainer = container
            continue
        }
        if (mineral && container.pos.getRangeTo(mineral) <= 1) {

            mineralContainer = container
            continue
        }

        if (!sourceContainer1 && container != sourceContainer2 && container.pos.getRangeTo(source1) <= 1) {

            sourceContainer1 = container
            continue
        }
        if (!sourceContainer2 && container != sourceContainer1 && container.pos.getRangeTo(source2) <= 1) {

            sourceContainer2 = container
            continue
        }
    }

    let baseLink
    let controllerLink
    let sourceLink1
    let sourceLink2

    for (let link of links) {

        if (storage && link.pos.getRangeTo(storage) <= 2) {

            baseLink = link
            continue
        }
        if (link.pos.getRangeTo(controller) <= 2) {

            controllerLink = link
            continue
        }

        if (!sourceLink1 && link != sourceLink2 && sourceContainer1 && link.pos.getRangeTo(sourceContainer1) <= 1) {

            sourceLink1 = link
            continue
        }
        if (!sourceLink2 && link != sourceLink1 && sourceContainer2 && link.pos.getRangeTo(sourceContainer2) <= 1) {

            sourceLink2 = link
            continue
        }
    }

    let primaryLabs = []
    let secondaryLabs = []
    let tertiaryLabs = []

    for (let lab of labs) {

        var nearbyLab = lab.pos.findInRange(labs, 2)

        if (controller.level == 7) {
            if (nearbyLab.length == labs.length && primaryLabs.length < 2) {

                lab.room.visual.circle(lab.pos, {
                    fill: 'transparent',
                    radius: 0.8,
                    stroke: '#39A0ED',
                    strokeWidth: 0.125
                });
                primaryLabs.push(lab)

            } else {

                secondaryLabs.push(lab)

            }
        } else if (controller.level == 8) {
            if (nearbyLab.length == labs.length && primaryLabs.length < 2) {

                primaryLabs.push(lab)

            } else {

                secondaryLabs.push(lab)

            }
        }
    }

    let specialStructures = {
        sources: {
            source1: source1,
            source2: source2,
        },
        containers: {
            baseContainer: baseContainer,
            controllerContainer: controllerContainer,
            mineralContainer: mineralContainer,
            sourceContainer1: sourceContainer1,
            sourceContainer2: sourceContainer2,
        },
        links: {
            baseLink: baseLink,
            controllerLink: controllerLink,
            sourceLink1: sourceLink1,
            sourceLink2: sourceLink2,
        },
        labs: {
            primaryLabs: primaryLabs,
            secondaryLabs: secondaryLabs,
            tertiaryLabs: "tertiaryLabs",
        }
    }

    let costMatrixes = {}

    return {
        creeps: creeps,
        powerCreeps: powerCreeps,
        constructionSites: constructionSites,
        structures: structures,
        specialStructures: specialStructures,
        costMatrixes,
    }
}

module.exports = roomVariables