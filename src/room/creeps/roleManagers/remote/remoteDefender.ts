import { RemoteNeeds } from 'international/constants'
import { findClosestObject, getRange, pack, randomIntRange } from 'international/generalFunctions'

export class RemoteDefender extends Creep {
    public get dying() {
        // Inform as dying if creep is already recorded as dying

        if (this._dying) return true

        // Stop if creep is spawning

        if (!this.ticksToLive) return false

        // If the creep's remaining ticks are more than the estimated spawn time, inform false

        if (this.ticksToLive > this.body.length * CREEP_SPAWN_TIME) return false

        // Record creep as dying

        return (this._dying = true)
    }

    preTickManager(): void {
        if (!this.memory.RN) return

        const role = this.role as 'remoteDefender'

        // If the creep's remote no longer is managed by its commune

        if (!Memory.rooms[this.commune.name].remotes.includes(this.memory.RN)) {
            // Delete it from memory and try to find a new one

            delete this.memory.RN
            if (!this.findRemote()) return
        }

        if (this.dying) return

        // Reduce remote need

        Memory.rooms[this.memory.RN].needs[RemoteNeeds.minDamage] -= this.attackStrength
        Memory.rooms[this.memory.RN].needs[RemoteNeeds.minHeal] -= this.healStrength

        const commune = this.commune

        // Add the creep to creepsFromRoomWithRemote relative to its remote

        if (commune.creepsFromRoomWithRemote[this.memory.RN])
            commune.creepsFromRoomWithRemote[this.memory.RN][role].push(this.name)
    }

    /**
     * Finds a remote to defend
     */
    findRemote?(): boolean {
        const creep = this

        // If the creep already has a remote, inform true

        if (creep.memory.RN) return true

        // Get remotes by their efficacy

        const remoteNamesByEfficacy = creep.commune?.remoteNamesBySourceEfficacy

        let roomMemory

        // Loop through each remote name

        for (const roomName of remoteNamesByEfficacy) {
            // Get the remote's memory using its name

            roomMemory = Memory.rooms[roomName]

            // If the needs of this remote are met, iterate

            if (roomMemory.needs[RemoteNeeds.minDamage] + roomMemory.needs[RemoteNeeds.minHeal] <= 0) continue

            // Otherwise assign the remote to the creep and inform true

            creep.memory.RN = roomName
            roomMemory.needs[RemoteNeeds.minDamage] -= creep.attackStrength
            roomMemory.needs[RemoteNeeds.minHeal] -= creep.healStrength

            return true
        }

        // Inform false

        return false
    }

    /**
     * Find and attack enemyCreeps
     */
    advancedAttackEnemies?(): boolean {
        const { room } = this

        const enemyAttackers = room.enemyAttackers

        // If there are none

        if (!enemyAttackers.length) {
            const enemyCreeps = room.enemyCreeps

            if (!enemyCreeps.length) {
                return this.aggressiveHeal()
            }

            // Heal nearby creeps

            if (this.passiveHeal()) return true

            this.say('EC')

            const enemyCreep = findClosestObject(this.pos, enemyCreeps)
            // Get the range between the creeps

            const range = getRange(this.pos.x, enemyCreep.pos.x, this.pos.y, enemyCreep.pos.y)

            // If the range is more than 1

            if (range > 1) {
                this.rangedAttack(enemyCreep)

                // Have the create a moveRequest to the enemyAttacker and inform true

                this.createMoveRequest({
                    origin: this.pos,
                    goals: [{ pos: enemyCreep.pos, range: 1 }],
                })

                return true
            }

            this.rangedMassAttack()
            this.moveRequest = pack(enemyCreep.pos)

            return true
        }

        // Otherwise, get the closest enemyAttacker

        const enemyAttacker = findClosestObject(this.pos, enemyAttackers)

        // Get the range between the creeps

        const range = getRange(this.pos.x, enemyAttacker.pos.x, this.pos.y, enemyAttacker.pos.y)

        // If it's more than range 3

        if (range > 3) {
            // Heal nearby creeps

            this.passiveHeal()

            // Make a moveRequest to it and inform true

            this.createMoveRequest({
                origin: this.pos,
                goals: [{ pos: enemyAttacker.pos, range: 1 }],
            })

            return true
        }

        this.say('AEA')

        // Otherwise, have the creep pre-heal itself

        this.heal(this)

        // If the range is 1, rangedMassAttack

        if (range === 1) {
            this.rangedMassAttack()
            this.moveRequest = pack(enemyAttacker.pos)
        }

        // Otherwise, rangedAttack the enemyAttacker
        else this.rangedAttack(enemyAttacker)

        // If the creep is out matched, try to always stay in range 3

        if (this.healStrength < enemyAttacker.attackStrength) {
            if (range === 3) return true

            if (range >= 3) {
                this.createMoveRequest({
                    origin: this.pos,
                    goals: [{ pos: enemyAttacker.pos, range: 3 }],
                })

                return true
            }

            this.createMoveRequest({
                origin: this.pos,
                goals: [{ pos: enemyAttacker.pos, range: 25 }],
                flee: true,
            })

            return true
        }

        // If the creep has less heal power than the enemyAttacker's attack power

        if (this.healStrength < enemyAttacker.attackStrength) {
            // If the range is less or equal to 2

            if (range <= 2) {
                // Have the creep flee and inform true

                this.createMoveRequest({
                    origin: this.pos,
                    goals: [{ pos: enemyAttacker.pos, range: 1 }],
                    flee: true,
                })

                return true
            }
        }

        // If the range is more than 1

        if (range > 1) {
            // Have the create a moveRequest to the enemyAttacker and inform true

            this.createMoveRequest({
                origin: this.pos,
                goals: [{ pos: enemyAttacker.pos, range: 1 }],
            })

            return true
        }

        // Otherwise inform true

        return true
    }

    constructor(creepID: Id<Creep>) {
        super(creepID)
    }

    static remoteDefenderManager(room: Room, creepsOfRole: string[]) {
        for (const creepName of creepsOfRole) {
            const creep: RemoteDefender = Game.creeps[creepName]

            // Try to find a remote

            if (!creep.findRemote()) {
                // If the room is the creep's commune

                if (room.name === creep.commune.name) {
                    // Advanced recycle and iterate

                    creep.advancedRecycle()
                    continue
                }

                // Otherwise, have the creep make a moveRequest to its commune and iterate

                creep.createMoveRequest({
                    origin: creep.pos,
                    goals: [
                        {
                            pos: new RoomPosition(25, 25, creep.commune.name),
                            range: 25,
                        },
                    ],
                    typeWeights: {
                        enemy: Infinity,
                        ally: Infinity,
                        keeper: Infinity,
                        enemyRemote: Infinity,
                        allyRemote: Infinity,
                    },
                })

                continue
            }

            creep.say(creep.memory.RN)

            // Try to attack enemyAttackers, iterating if there are none or one was attacked

            if (creep.advancedAttackEnemies()) {
                delete creep.memory.TW
                continue
            }

            // If the creep is in its remote

            if (room.name === creep.memory.RN) {
                if (!creep.memory.TW) creep.memory.TW = 0
                else creep.memory.TW += 1

                // If a random range of time has passed, find a new remote

                if (creep.memory.TW > randomIntRange(20, 100)) {
                    delete creep.memory.RN

                    if (creep.moveRequest) continue

                    // Try to find a remote

                    if (!creep.findRemote()) continue
                }
            }

            // Otherwise, create a moveRequest to its remote

            creep.createMoveRequest({
                origin: creep.pos,
                goals: [
                    {
                        pos: new RoomPosition(25, 25, creep.memory.RN),
                        range: 25,
                    },
                ],
                typeWeights: {
                    enemy: Infinity,
                    ally: Infinity,
                    keeper: Infinity,
                    enemyRemote: Infinity,
                    allyRemote: Infinity,
                },
            })
        }
    }
}
