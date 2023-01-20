// Credit to @SemperRabbit for this nice piece of code!
export default class RespawnHandler {
    static HasRespawned(): boolean {
        if (Game.time === 0) {
            return true
        }
        if (Object.keys(Game.creeps).length > 0) {
            return false
        }
        const roomNames = Object.keys(Game.rooms)
        if (roomNames.length !== 1) {
            return false
        }
        const room = Game.rooms[roomNames[0]]
        if (
            !room.controller ||
            !room.controller.my ||
            room.controller.level !== 1 ||
            !room.controller.progress ||
            !room.controller.safeMode ||
            room.controller.safeMode !== SAFE_MODE_DURATION - 1
        ) {
            return false
        }
        if (Object.keys(Game.spawns).length !== 1) {
            return false
        }
        return true
    }
    static HandleRespawn(): void {
        const hasRespawned = this.HasRespawned()
        if (!hasRespawned) return
        global.clearMemory()
    }
}

RespawnHandler.HandleRespawn()
