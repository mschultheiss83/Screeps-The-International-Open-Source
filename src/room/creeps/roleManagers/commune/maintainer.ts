import { roomDimensions } from 'international/constants'
import { globalStatsUpdater } from 'international/statsManager'
import { findCoordsInsideRect, findObjectWithID } from 'international/utils'
import { packCoord } from 'other/packrat'

export class Maintainer extends Creep {
    constructor(creepID: Id<Creep>) {
        super(creepID)
    }

    preTickManager() {
        this.avoidEnemyThreatCoords()
    }

    advancedMaintain?(): boolean {
        const { room } = this

        if (this.needsResources()) {
            delete this.memory.repairTarget

            this.runRoomLogisticsRequestsAdvanced({
                types: new Set(['withdraw', 'offer', 'pickup']),
                conditions: request => request.resourceType === RESOURCE_ENERGY,
            })

            if (this.needsResources()) return false
        }

        // Otherwise if we don't need resources and can maintain

        const workPartCount = this.parts.work
        const repairTarget = this.findRepairTarget() || this.findRampartRepairTarget()

        if (!repairTarget) {
            this.say('❌🔧')
            return false
        }

        this.say('⏩🔧')

        room.targetVisual(this.pos, repairTarget.pos)

        // If the repairTarget is out of repair range

        if (this.pos.getRangeTo(repairTarget.pos) > 3) {
            // Make a move request to it

            this.createMoveRequest({
                origin: this.pos,
                goals: [{ pos: repairTarget.pos, range: 3 }],
                avoidEnemyRanges: true,
            })

            // Inform false

            return false
        }

        if (this.worked) return true

        // Try to repair, stopping if failed

        const repairResult = this.repair(repairTarget)
        if (repairResult !== OK) return false

        // Find the repair amount by finding the smaller of the this's work and the progress left for the cSite divided by repair power

        const energySpentOnRepairs = Math.min(
            workPartCount,
            (repairTarget.hitsMax - repairTarget.hits) / REPAIR_POWER,
            this.store.energy,
        )

        if (repairTarget.structureType === STRUCTURE_RAMPART || repairTarget.structureType === STRUCTURE_WALL) {
            globalStatsUpdater(this.room.name, 'eorwr', energySpentOnRepairs)
            this.say(`🧱${energySpentOnRepairs * REPAIR_POWER}`)
        } else {
            globalStatsUpdater(this.room.name, 'eoro', energySpentOnRepairs)
            this.say(`🔧${energySpentOnRepairs * REPAIR_POWER}`)
        }

        // Implement the results of the repair pre-emptively

        repairTarget.nextHits = Math.min(repairTarget.nextHits + workPartCount * REPAIR_POWER, repairTarget.hitsMax)

        // If the structure is a rampart

        if (repairTarget.structureType === STRUCTURE_RAMPART) {
            // If the repairTarget will be below or equal to expectations next tick

            return true
        }

        // Otherwise if it isn't a rampart and it will be viable to repair next tick
        else if (repairTarget.hitsMax - repairTarget.nextHits >= workPartCount * REPAIR_POWER) return true

        // Otherwise

        // Delete the target from memory

        delete this.memory.repairTarget

        // Find repair targets that don't include the current target, informing true if none were found

        const newRepairTarget = this.findRepairTarget()
        if (!newRepairTarget) return true

        // Make a move request to it

        this.createMoveRequest({
            origin: this.pos,
            goals: [{ pos: newRepairTarget.pos, range: 3 }],
            avoidEnemyRanges: true,
        })

        // Inform false

        return true
    }

    maintainNearby?(): boolean {
        const { room } = this

        // If the this has no energy, inform false

        if (this.store.getUsedCapacity(RESOURCE_ENERGY) === 0) return false

        const workPartCount = this.parts.work
        const adjacentCoords = findCoordsInsideRect(this.pos.x - 3, this.pos.y - 3, this.pos.x + 3, this.pos.y + 3)

        let structureID: Id<Structure<BuildableStructureConstant>>

        for (const coord of adjacentCoords) {
            const structureIDs = room.structureCoords.get(packCoord(coord))
            if (!structureIDs) continue

            structureID = structureIDs.find(structureID => {
                const structure = findObjectWithID(structureID)

                if (structure.structureType !== STRUCTURE_ROAD && structure.structureType !== STRUCTURE_CONTAINER)
                    return false

                // The structure has sufficient hits

                if (structure.hitsMax - structure.hits < workPartCount * REPAIR_POWER) return false

                return true
            }) as Id<Structure<BuildableStructureConstant>>
        }

        if (!structureID) return false

        const structure = findObjectWithID(structureID)
        if (this.repair(structure) !== OK) return false

        // Otherwise we repaired successfully

        // Find the repair amount by finding the smaller of the this's work and the progress left for the cSite divided by repair power

        const energySpentOnRepairs = Math.min(workPartCount, (structure.hitsMax - structure.hits) / REPAIR_POWER)

        // Show it tried to repair

        this.message = `🗺️🔧${energySpentOnRepairs * REPAIR_POWER}`
        return true
    }

    run?() {
        const cSiteTarget = this.room.cSiteTarget
        if (cSiteTarget && cSiteTarget.structureType === STRUCTURE_SPAWN) {
            this.advancedBuild()
            this.say(this.message)
            return
        }

        if (this.advancedMaintain()) return
        if (this.maintainNearby()) return
    }

    static maintainerManager(room: Room, creepsOfRole: string[]) {
        for (const creepName of creepsOfRole) {
            const creep: Maintainer = Game.creeps[creepName]
            creep.run()
        }
    }
}
