import { globalStatsUpdater } from 'international/statsManager'
import { getRange, getRangeOfCoords } from 'international/utils'
import { unpackPos } from 'other/packrat'

export class MineralHarvester extends Creep {
    advancedHarvestMineral?(mineral: Mineral): boolean {

        this.say('🚬')

        // Unpack the creep's packedHarvestPos

        const harvestPos = this.findMineralHarvestPos()
        if (!harvestPos) return true

        // If the creep is not standing on the harvestPos

        if (getRangeOfCoords(this.pos, harvestPos) > 0) {
            this.say('⏩M')

            // Make a move request to it

            this.createMoveRequest({
                origin: this.pos,
                goals: [{ pos: harvestPos, range: 0 }],
                avoidEnemyRanges: true,
            })

            // And inform false

            return true
        }

        // Harvest the mineral, informing the result if it didn't succeed

        if (this.harvest(mineral) !== OK) return true

        // Find amount of minerals harvested and record it in data

        const mineralsHarvested = Math.min(this.parts.work * HARVEST_MINERAL_POWER, mineral.mineralAmount)
            globalStatsUpdater(this.room.name, 'mh', mineralsHarvested)

        this.say(`⛏️${mineralsHarvested}`)
        return true
    }

    constructor(creepID: Id<Creep>) {
        super(creepID)
    }

    static mineralHarvesterManager(room: Room, creepsOfRole: string[]) {
        for (const creepName of creepsOfRole) {
            const creep: MineralHarvester = Game.creeps[creepName]

            // Get the mineral

            const mineral = room.mineral

            if (mineral.mineralAmount === 0) {
                creep.advancedRecycle()
                continue
            }

            creep.advancedHarvestMineral(mineral)
        }
    }
}
