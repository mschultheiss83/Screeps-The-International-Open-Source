import { minHarvestWorkRatio, remoteHarvesterRoles, RemoteNeeds, spawnByRoomRemoteRoles } from 'international/constants'
import { customLog, findCarryPartsRequired } from 'international/generalFunctions'

Room.prototype.remotesManager = function () {
    // Loop through the commune's remote names

    for (let index = this.memory.remotes.length - 1; index >= 0; index -= 1) {
        // Get the name of the remote using the index

        const remoteName = this.memory.remotes[index]

        const remoteMemory = Memory.rooms[remoteName]

        // If the room isn't a remote, remove it from the remotes array

        if (remoteMemory.T !== 'remote' || remoteMemory.commune !== this.name) {
            this.memory.remotes.splice(index, 1)
            continue
        }

        // Intialize an array for this room's creepsFromRoomWithRemote

        this.creepsFromRoomWithRemote[remoteName] = {}

        // For each role, construct an array for the role in creepsFromWithRemote

        for (const role of spawnByRoomRemoteRoles) this.creepsFromRoomWithRemote[remoteName][role] = []

        if (remoteMemory.abandoned > 0) {
            remoteMemory.abandoned -= 1

            for (const need in remoteMemory.needs) remoteMemory.needs[need] = 0

            continue
        }

        remoteMemory.needs[RemoteNeeds.source1RemoteHarvester] = 3
        remoteMemory.needs[RemoteNeeds.source2RemoteHarvester] = remoteMemory.SIDs[1] ? 3 : 0
        remoteMemory.needs[RemoteNeeds.remoteHauler] = 0
        remoteMemory.needs[RemoteNeeds.remoteReserver] = 1

        // Get the remote

        const remote = Game.rooms[remoteName]

        const possibleReservation = this.energyCapacityAvailable >= 650

        // If the remote is reserved

        if (possibleReservation) {
            // Increase the remoteHarvester need accordingly

            remoteMemory.needs[RemoteNeeds.source1RemoteHarvester] *= 2
            remoteMemory.needs[RemoteNeeds.source2RemoteHarvester] *= remoteMemory.SIDs[1] ? 2 : 1

            const isReserved =
                remote && remote.controller.reservation && remote.controller.reservation.username === Memory.me

            // If the reservation isn't soon to run out, relative to the room's sourceEfficacy average

            if (isReserved && remote.controller.reservation.ticksToEnd >= Math.min(remoteMemory.RE * 5, 2500))
                remoteMemory.needs[RemoteNeeds.remoteReserver] = 0
        }

        // Loop through each index of sourceEfficacies

        for (let index = 0; index < remoteMemory.SE.length; index += 1) {
            // Get the income based on the reservation of the room and remoteHarvester need

            /* const income = possibleReservation ? 10 : 5 */
            const income =
                (possibleReservation ? 10 : 5) -
                Math.floor(remoteMemory.needs[RemoteNeeds[remoteHarvesterRoles[index]]] * minHarvestWorkRatio)

            // Find the number of carry parts required for the source, and add it to the remoteHauler need

            remoteMemory.needs[RemoteNeeds.remoteHauler] += findCarryPartsRequired(remoteMemory.SE[index], income) / 2
        }

        if (remote) {
            remoteMemory.needs[RemoteNeeds.minDamage] = 0
            remoteMemory.needs[RemoteNeeds.minHeal] = 0

            // Increase the defenderNeed according to the enemy attackers' combined strength

            for (const enemyCreep of remote.enemyCreeps) {
                remoteMemory.needs[RemoteNeeds.minDamage] += enemyCreep.healStrength
                remoteMemory.needs[RemoteNeeds.minHeal] += enemyCreep.attackStrength
            }

            // If the controller is reserved and not by me

            if (remote.controller.reservation && remote.controller.reservation.username !== Memory.me)
                remoteMemory.needs[RemoteNeeds.enemyReserved] = 1
            // If the controller is not reserved or is by us
            else remoteMemory.needs[RemoteNeeds.enemyReserved] = 0

            remoteMemory.needs[RemoteNeeds.remoteCoreAttacker] = remote.structures.invaderCore.length
            remoteMemory.needs[RemoteNeeds.invaderCore] = remote.structures.invaderCore.length

            // Create need if there are any walls or enemy owner structures (not including invader cores)

            remoteMemory.needs[RemoteNeeds.remoteDismantler] =
                Math.min(remote.actionableWalls.length, 1) ||
                Math.min(
                    remote.find(FIND_HOSTILE_STRUCTURES).filter(function (structure) {
                        return structure.structureType != STRUCTURE_INVADER_CORE
                    }).length,
                    1,
                )
        }

        // If the remote is assumed to be reserved by an enemy

        if (remoteMemory.needs[RemoteNeeds.enemyReserved]) {
            remoteMemory.needs[RemoteNeeds.source1RemoteHarvester] = 0
            remoteMemory.needs[RemoteNeeds.source2RemoteHarvester] = 0
            remoteMemory.needs[RemoteNeeds.remoteHauler] = 0
        }

        // If there is assumed to be an invader core

        if (remoteMemory.needs[RemoteNeeds.invaderCore]) {
            remoteMemory.needs[RemoteNeeds.source1RemoteHarvester] = 0
            remoteMemory.needs[RemoteNeeds.source2RemoteHarvester] = 0
            remoteMemory.needs[RemoteNeeds.remoteHauler] = 0
        }
    }
}
