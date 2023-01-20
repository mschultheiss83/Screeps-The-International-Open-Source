import { customColors, roomDimensions } from 'international/constants'
import { findClosestObject, getRange, getRangeOfCoords, isCoordExit, isXYExit } from 'international/utils'
import { Antifa } from './antifa'

export class Trio {
    /**
     * All squad members, where index 0 is the leader
     */
    members: Antifa[] = []
    leader: Antifa

    _combatStrength: CombatStrength

    get combatStrength() {
        if (this._combatStrength) return this._combatStrength

        this._combatStrength = {
            dismantle: 0,
            melee: 0,
            ranged: 0,
            heal: 0,
        }

        for (const member of this.members) {
            for (const key in this._combatStrength) {
                const combatType = key as keyof CombatStrength

                this._combatStrength[combatType] = member.combatStrength[combatType]
            }
        }

        return this._combatStrength
    }

    get canMove() {
        for (const member of this.members) if (!member.canMove) return false
        return true
    }

    constructor(memberNames: string[]) {
        for (let i = 0; i < memberNames.length; i++) {
            const member = Game.creeps[memberNames[i]]
            this.members.push(member)

            member.squad = this
            member.squadRan = true
        }

        this.leader = this.members[0]

        // Ensure the leader is the one with melee parts, if the quad is melee

        if (
            !(this.leader.parts.attack + this.leader.parts.work) &&
            this.members[1].parts.attack + this.members[1].parts.work
        ) {
            this.members.reverse()
            this.leader = this.members[0]
        }
    }

    run() {
        if (this.runCombatRoom()) return

        this.advancedHeal()

        if (!this.getInFormation()) return

        this.leader.say('IF')

        if (this.leader.room.enemyDamageThreat && this.runCombat()) return

        this.createMoveRequest({
            origin: this.leader.pos,
            goals: [
                {
                    pos: new RoomPosition(25, 25, this.leader.memory.CRN),
                    range: 25,
                },
            ],
            typeWeights: {
                enemy: Infinity,
                ally: Infinity,
                keeper: Infinity,
                enemyRemote: 4,
                allyRemote: 4,
                neutral: 2,
            },
        })
    }

    runCombatRoom() {
        if (this.leader.room.name !== this.leader.memory.CRN) return false

        if (!this.leader.room.enemyDamageThreat) {
            for (const member of this.members) member.runCombat()
            return true
        }

        if (this.runCombat()) return true

        this.stompEnemyCSites()
        return true
    }

    runCombat() {
        if (this.leader.memory.ST === 'rangedAttack') return this.advancedRangedAttack()
        if (this.leader.memory.ST === 'attack') return this.advancedAttack()
        return this.advancedDismantle()
    }

    getInFormation() {
        if (this.leader.room.name === this.members[1].room.name) {
            const range = getRangeOfCoords(this.leader.pos, this.members[1].pos)
            if (range === 1) return true

            if (range > 2) {
                this.leader.createMoveRequest({
                    origin: this.leader.pos,
                    goals: [
                        {
                            pos: this.members[1].pos,
                            range: 1,
                        },
                    ],
                })
            }
        }

        this.leader.say('GIF')

        this.members[1].createMoveRequest({
            origin: this.members[1].pos,
            goals: [
                {
                    pos: this.leader.pos,
                    range: 1,
                },
            ],
        })

        return this.leader.isOnExit
    }

    holdFormation() {
        for (const member of this.members) member.moved = 'moved'
    }

    createMoveRequest(opts: MoveRequestOpts, moveLeader = this.leader) {
        if (!this.canMove) {
            this.holdFormation()
            return
        }
        this.leader.say('x')
        if (!moveLeader.createMoveRequest(opts)) return

        if (getRangeOfCoords(this.leader.pos, this.members[1].pos) > 1) {
            this.members[1].createMoveRequest({
                origin: this.members[1].pos,
                goals: [
                    {
                        pos: this.leader.pos,
                        range: 1,
                    },
                ],
            })

            return
        }

        this.members[1].assignMoveRequest(moveLeader.pos)
    }

    advancedRangedAttack() {
        const { room } = this.leader

        let enemyAttackers = room.enemyAttackers.filter(function (creep) {
            return !creep.isOnExit
        })

        if (!room.enemyAttackers.length) enemyAttackers = room.enemyAttackers

        // If there are none

        if (!enemyAttackers.length) {
            let enemyCreeps = room.enemyCreeps.filter(function (creep) {
                return !creep.isOnExit
            })

            if (!room.enemyCreeps.length) enemyCreeps = room.enemyCreeps

            if (!enemyCreeps.length) {
                return this.rangedAttackStructures()
            }

            // Heal nearby creeps

            if (this.leader.passiveHeal()) return true

            this.leader.say('EC')

            const enemyCreep = findClosestObject(this.leader.pos, enemyCreeps)
            if (Memory.roomVisuals)
                this.leader.room.visual.line(this.leader.pos, enemyCreep.pos, {
                    color: customColors.green,
                    opacity: 0.3,
                })

            // Get the range between the creeps

            const range = getRange(this.leader.pos.x, enemyCreep.pos.x, this.leader.pos.y, enemyCreep.pos.y)

            // If the range is more than 1

            if (range > 1) {
                this.leader.rangedAttack(enemyCreep)

                // Have the create a moveRequest to the enemyAttacker and inform true

                this.createMoveRequest({
                    origin: this.leader.pos,
                    goals: [{ pos: enemyCreep.pos, range: 1 }],
                })

                return true
            }

            this.leader.rangedMassAttack()

            if (enemyCreep.canMove && this.canMove) {
                this.leader.assignMoveRequest(enemyCreep.pos)
                this.members[1].assignMoveRequest(this.leader.pos)
            }
            return true
        }

        // Otherwise, get the closest enemyAttacker

        const enemyAttacker = findClosestObject(this.leader.pos, enemyAttackers)
        if (Memory.roomVisuals)
            this.leader.room.visual.line(this.leader.pos, enemyAttacker.pos, {
                color: customColors.green,
                opacity: 0.3,
            })

        // Get the range between the creeps

        const range = getRange(this.leader.pos.x, enemyAttacker.pos.x, this.leader.pos.y, enemyAttacker.pos.y)

        // If the squad is outmatched

        if (
            this.combatStrength.heal + this.combatStrength.ranged <
            enemyAttacker.combatStrength.heal + enemyAttacker.combatStrength.ranged
        ) {
            if (range === 4) {
                return true
            }

            // If too close

            if (range <= 3) {
                this.leader.rangedAttack(enemyAttacker)

                // Have the squad flee

                this.createMoveRequest({
                    origin: this.leader.pos,
                    goals: [{ pos: enemyAttacker.pos, range: 1 }],
                    flee: true,
                })
            }

            return true
        }

        // If it's more than range 3

        if (range > 3) {
            // Heal nearby creeps

            this.leader.passiveHeal()

            // Make a moveRequest to it and inform true

            this.createMoveRequest({
                origin: this.leader.pos,
                goals: [{ pos: enemyAttacker.pos, range: 1 }],
            })

            return true
        }

        this.leader.say('AEA')

        if (range === 1) this.leader.rangedMassAttack()
        else this.leader.rangedAttack(enemyAttacker)

        if (range > 1) {
            this.createMoveRequest({
                origin: this.leader.pos,
                goals: [{ pos: enemyAttacker.pos, range: 1 }],
            })

            return true
        }

        if (enemyAttacker.canMove && this.canMove) {
            this.leader.assignMoveRequest(enemyAttacker.pos)
            this.members[1].assignMoveRequest(this.leader.pos)
        }
        return true
    }

    rangedAttackStructures() {
        const structures = this.leader.room.combatStructureTargets

        if (!structures.length) return false

        let structure = findClosestObject(this.leader.pos, structures)
        if (Memory.roomVisuals)
            this.leader.room.visual.line(this.leader.pos, structure.pos, { color: customColors.green, opacity: 0.3 })

        if (getRange(this.leader.pos.x, structure.pos.x, this.leader.pos.y, structure.pos.y) > 3) {
            this.createMoveRequest({
                origin: this.leader.pos,
                goals: [{ pos: structure.pos, range: 3 }],
            })

            return false
        }

        if (this.leader.rangedAttack(structure) !== OK) return false

        // See if the structure is destroyed next tick

        structure.nextHits -= this.leader.parts.ranged_attack * RANGED_ATTACK_POWER
        if (structure.nextHits > 0) return true

        // Try to find a new structure to preemptively move to

        structures.splice(structures.indexOf(structure), 1)
        if (!structures.length) return true

        structure = findClosestObject(this.leader.pos, structures)

        if (getRange(this.leader.pos.x, structure.pos.y, this.leader.pos.y, structure.pos.y) > 3) {
            this.createMoveRequest({
                origin: this.leader.pos,
                goals: [{ pos: structure.pos, range: 3 }],
            })
        }

        return true
    }

    advancedAttack() {
        const { room } = this.leader

        let enemyAttackers = room.enemyAttackers.filter(function (creep) {
            return !creep.isOnExit
        })

        if (!enemyAttackers.length) enemyAttackers = room.enemyAttackers

        // If there are none

        if (!enemyAttackers.length) {
            let enemyCreeps = room.enemyCreeps.filter(function (creep) {
                return !creep.isOnExit
            })

            if (!enemyCreeps.length) enemyCreeps = room.enemyCreeps

            if (!enemyCreeps.length) return this.attackStructures()

            this.leader.say('EC')

            const enemyCreep = findClosestObject(this.leader.pos, enemyCreeps)
            if (Memory.roomVisuals)
                this.leader.room.visual.line(this.leader.pos, enemyCreep.pos, {
                    color: customColors.green,
                    opacity: 0.3,
                })

            // If the range is more than 1

            if (getRange(this.leader.pos.x, enemyCreep.pos.x, this.leader.pos.y, enemyCreep.pos.y) > 1) {
                // Have the create a moveRequest to the enemyAttacker and inform true

                this.createMoveRequest({
                    origin: this.leader.pos,
                    goals: [{ pos: enemyCreep.pos, range: 1 }],
                })

                return true
            }

            this.leader.attack(enemyCreep)

            if (enemyCreep.canMove && this.canMove) {
                this.leader.assignMoveRequest(enemyCreep.pos)
                this.members[1].assignMoveRequest(this.leader.pos)
            }
            return true
        }

        const enemyAttacker = findClosestObject(this.leader.pos, enemyAttackers)
        if (Memory.roomVisuals)
            this.leader.room.visual.line(this.leader.pos, enemyAttacker.pos, {
                color: customColors.green,
                opacity: 0.3,
            })

        // If the range is more than 1

        if (getRange(this.leader.pos.x, enemyAttacker.pos.x, this.leader.pos.y, enemyAttacker.pos.y) > 1) {
            // Have the create a moveRequest to the enemyAttacker and inform true

            this.createMoveRequest({
                origin: this.leader.pos,
                goals: [{ pos: enemyAttacker.pos, range: 1 }],
            })

            return true
        }

        // Otherwise attack

        this.leader.attack(enemyAttacker)

        if (enemyAttacker.canMove && this.canMove) {
            this.leader.assignMoveRequest(enemyAttacker.pos)
            this.members[1].assignMoveRequest(this.leader.pos)
        }
        return true
    }

    attackStructures() {
        const structures = this.leader.room.combatStructureTargets

        if (!structures.length) return false

        let structure = findClosestObject(this.leader.pos, structures)
        if (Memory.roomVisuals)
            this.leader.room.visual.line(this.leader.pos, structure.pos, { color: customColors.green, opacity: 0.3 })

        if (getRange(this.leader.pos.x, structure.pos.x, this.leader.pos.y, structure.pos.y) > 1) {
            this.createMoveRequest({
                origin: this.leader.pos,
                goals: [{ pos: structure.pos, range: 1 }],
            })

            return false
        }

        if (this.leader.attack(structure) !== OK) return false

        // See if the structure is destroyed next tick

        structure.nextHits -= this.leader.parts.attack * ATTACK_POWER
        if (structure.nextHits > 0) return true

        // Try to find a new structure to preemptively move to

        structures.splice(structures.indexOf(structure), 1)
        if (!structures.length) return true

        structure = findClosestObject(this.leader.pos, structures)

        if (getRange(this.leader.pos.x, structure.pos.y, this.leader.pos.y, structure.pos.y) > 1) {
            this.createMoveRequest({
                origin: this.leader.pos,
                goals: [{ pos: structure.pos, range: 1 }],
            })
        }

        return true
    }

    advancedDismantle() {
        // Avoid targets we can't dismantle

        const structures = this.leader.room.combatStructureTargets

        if (!structures.length) return false

        let structure = findClosestObject(this.leader.pos, structures)
        if (Memory.roomVisuals)
            this.leader.room.visual.line(this.leader.pos, structure.pos, { color: customColors.green, opacity: 0.3 })

        if (getRange(this.leader.pos.x, structure.pos.x, this.leader.pos.y, structure.pos.y) > 1) {
            this.createMoveRequest({
                origin: this.leader.pos,
                goals: [{ pos: structure.pos, range: 1 }],
            })

            return true
        }

        if (this.leader.dismantle(structure) !== OK) return false

        // See if the structure is destroyed next tick

        structure.nextHits -= this.leader.parts.work * DISMANTLE_POWER
        if (structure.nextHits > 0) return true

        // Try to find a new structure to preemptively move to

        structures.splice(structures.indexOf(structure), 1)
        if (!structures.length) return true

        structure = findClosestObject(this.leader.pos, structures)

        if (getRange(this.leader.pos.x, structure.pos.y, this.leader.pos.y, structure.pos.y) > 1) {
            this.createMoveRequest({
                origin: this.leader.pos,
                goals: [{ pos: structure.pos, range: 1 }],
            })
        }

        return true
    }

    stompEnemyCSites?() {
        if (this.leader.room.controller && this.leader.room.controller.safeMode) return false

        // Filter only enemy construction sites worth stomping

        const enemyCSites = this.leader.room.enemyCSites.filter(cSite => cSite.progress > 0 && !isCoordExit(cSite.pos))

        if (!enemyCSites.length) return false

        const enemyCSite = findClosestObject(this.leader.pos, enemyCSites)

        this.createMoveRequest({
            origin: this.leader.pos,
            goals: [{ pos: enemyCSite.pos, range: 0 }],
        })

        return true
    }

    advancedHeal() {
        if (this.members[1].hits < this.members[1].hitsMax) {
            this.members[1].heal(this.members[1])
            return
        }

        // If there are no attackers, only heal the leader if it's damaged

        if (!this.leader.room.enemyAttackers.length) {
            if (this.leader.hits < this.leader.hitsMax) this.members[1].heal(this.leader)
            return
        }

        this.members[1].heal(this.leader)
    }
}
