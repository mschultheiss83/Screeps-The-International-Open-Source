import { CommuneManager } from './room/commune/commune'
import { RoomManager } from './room/room'
import { Duo } from './room/creeps/roleManagers/antifa/duo'
import { Quad } from './room/creeps/roleManagers/antifa/quad'
import { CombatRequestData } from 'international/constants'
import { Operator } from 'room/creeps/powerCreeps/operator'
import { MeleeDefender } from 'room/creeps/roleManagers/commune/meleeDefender'
import { Settings } from 'international/settings'

declare global {
    interface ProfilerMemory {
        data: { [name: string]: ProfilerData }
        start?: number
        total: number
    }

    interface ProfilerData {
        calls: number
        time: number
    }

    interface Profiler {
        clear(): void
        output(): void
        start(): void
        status(): void
        stop(): void
        toString(): string
    }

    interface Coord {
        x: number
        y: number
    }

    interface Rect {
        x1: number
        y1: number
        x2: number
        y2: number
    }

    interface Colors {
        white: string
        lightGrey: string
        lightBlue: string
        darkBlue: string
        black: string
        yellow: string
        red: string
        green: string
        brown: string
    }

    type PartsByPriority =
        | 'tough'
        | 'claim'
        | 'attack'
        | 'ranged_attack'
        | 'secondaryTough'
        | 'work'
        | 'carry'
        | 'move'
        | 'secondaryAttack'
        | 'heal'

    interface ResourceTarget {
        resource: ResourceConstant
        conditions?(communeManager: CommuneManager): any
        min: number
        max: number
    }

    type RemoteStampTypes = 'road' | 'container'

    type StampTypes =
        | 'fastFiller'
        | 'hub'
        | 'extensions'
        | 'labs'
        | 'tower'
        | 'extension'
        | 'observer'
        | 'sourceLink'
        | 'sourceExtension'
        | 'container'
        | 'extractor'
        | 'road'
        | 'rampart'

    interface Stamp {
        offset: number

        /**
         * The range of protection from the anchor to provide when deciding rampart placement
         */
        protectionOffset: number
        size: number
        structures: { [structureType: string]: Coord[] }
        asymmetry?: number
    }

    type StampAnchors = Partial<Record<StampTypes, RoomPosition[]>>

    type PosMap<T> = T[]

    type CoordMap = Uint8Array

    type CreepRoles =
        | 'source1Harvester'
        | 'source2Harvester'
        | 'hauler'
        | 'requestHauler'
        | 'controllerUpgrader'
        | 'builder'
        | 'maintainer'
        | 'mineralHarvester'
        | 'hubHauler'
        | 'fastFiller'
        | 'meleeDefender'
        | 'rangedDefender'
        | 'remoteSourceHarvester0'
        | 'remoteSourceHarvester1'
        | 'remoteHauler'
        | 'remoteReserver'
        | 'remoteDefender'
        | 'remoteCoreAttacker'
        | 'remoteDismantler'
        | 'scout'
        | 'claimer'
        | 'vanguard'
        | 'allyVanguard'
        | 'antifaRangedAttacker'
        | 'antifaAttacker'
        | 'antifaHealer'
        | 'antifaDismantler'
        | 'antifaDowngrader'
    interface TerminalRequest {
        ID: string
        /**
         * Preference from 0-1 where 1 is least prefered
         */
        priority: number
        amount: number
        resource: ResourceConstant
        roomName: string
    }

    type QuadTransformTypes = 'none' | 'rotateLeft' | 'rotateRight' | 'tradeHorizontal' | 'tradeVertical'

    interface PathGoal {
        pos: RoomPosition
        range: number
    }

    interface PathOpts {
        /**
         * Not required when pathing for creeps
         */
        origin?: RoomPosition
        goals: PathGoal[]
        /**
         * room types as keys to weight based on properties
         */
        typeWeights?: { [weight: string]: number }
        plainCost?: number
        swampCost?: number
        maxRooms?: number
        flee?: boolean
        creep?: Creep

        avoidAbandonedRemotes?: boolean

        weightStructures?: Partial<{ [key in StructureConstant]: number }>

        /**
         * An object with keys of weights and values of positions
         */

        weightCoords?: { [roomName: string]: { [packedCoord: string]: number } }

        /**
         *
         */
        weightCostMatrixes?: string[]

        weightCoordMaps?: CoordMap[]

        /**
         *
         */
        avoidEnemyRanges?: boolean

        avoidStationaryPositions?: boolean

        /**
         *
         */
        avoidImpassibleStructures?: boolean

        /**
         * Marks creeps not owned by the bot as avoid
         */
        avoidNotMyCreeps?: boolean

        /**
         * Weight my ramparts by this value
         */
        myRampartWeight?: number

        weightStructurePlans?: boolean
    }

    interface CombatStrength {
        dismantle: number
        melee: number
        ranged: number
        heal: number
    }

    interface FindClosestPosOfValueOpts {
        coordMap: CoordMap
        startCoords: Coord[]
        requiredValue: number
        reduceIterations: number
        initialWeight?: number
        adjacentToRoads?: boolean
        roadCoords?: CoordMap
        visuals?: boolean
        /**
         * Wether or not to attempt a cardinal flood
         */
        cardinalFlood?: boolean
        /**
         * The protection offset of the stamp
         */
        protectionOffset?: number
    }

    interface FindClosestPosOfValueOptsAsym extends FindClosestPosOfValueOpts {
        /**
         * The x and y offset from the top left of the stamp
         */
        offset: number
        /**
         * The asymmetrical x and y offset from the top left of the stamp
         */
        asymOffset: number
    }

    interface MoveRequestOpts extends PathOpts {
        cacheAmount?: number
    }

    interface MoveRequestByPathOpts {
        packedPath: string
        loose?: boolean
        remoteName?: string
    }

    type OrderedStructurePlans = BuildObj[]

    interface BuildObj {
        structureType: BuildableStructureConstant
        x: number
        y: number
    }

    interface SpawnRequestOpts {
        role: CreepRoles
        /**
         * Parts that should be attempted to be implemented once
         */
        defaultParts: BodyPartConstant[]
        /**
         * Parts that should be attempted to be implemented based on the partsMultiplier
         */
        extraParts: BodyPartConstant[]
        /**
         * The number of times to attempt to duplicate extraParts
         */
        partsMultiplier: number
        /**
         * The absolute minimum cost the creep may be spawned with
         */
        minCost: number
        /**
         * The priority of spawning, where 0 is greatest, and Infinity is least
         */
        priority: number
        /**
         * Properties to apply to the creep on top of the defaults
         */
        memoryAdditions: Partial<CreepMemory>
        /**
         * The specific group of which to compare the creep amount to
         */
        spawnGroup?: string[]
        /**
         *
         */
        threshold?: number
        /**
         *
         */
        minCreeps?: number | undefined
        /**
         *
         */
        maxCreeps?: number | undefined
        /**
         * The absolute max cost a creep may be applied with
         */
        maxCostPerCreep?: number | undefined
    }

    interface SpawnRequest {
        role: CreepRoles
        priority: number
        defaultParts: number
        bodyPartCounts: { [key in PartsByPriority]: number }
        body?: BodyPartConstant[]
        tier: number
        cost: number
        extraOpts: SpawnOptions
    }

    type FlagNames = 'disableTowerAttacks' | 'internationalDataVisuals'

    type RoomLogisticsRequestTypes = 'transfer' | 'withdraw' | 'pickup' | 'offer'

    interface RoomLogisticsRequest {
        ID: string
        type: RoomLogisticsRequestTypes
        /**
         * Consider in weighting the task, lower is more preffered
         */
        priority?: number
        targetID: Id<AnyStoreStructure | Creep | Tombstone | Ruin | Resource>
        resourceType: ResourceConstant
        amount: number
        /**
         * If the responder should only take the task if it will use its full capacity. Default is false
         */
        onlyFull?: boolean
        /**
         * The ID of a roomLogisticsTask or store structure
         */
        delivery?: Id<AnyStoreStructure> | string
        /**
         * Wether the responder should interact with reserveStore of the target
         */
        noReserve?: boolean
    }

    interface CreateRoomLogisticsRequestArgs {
        type: RoomLogisticsRequestTypes
        target: AnyStoreStructure | Creep | Tombstone | Ruin | Resource
        resourceType?: ResourceConstant
        onlyFull?: boolean
        priority?: number
        maxAmount?: number
    }

    interface findNewRoomLogisticsRequestArgs {
        types?: Set<RoomLogisticsRequestTypes>
        conditions?(request: RoomLogisticsRequest): any
    }

    interface CreepRoomLogisticsRequest {
        /**
         * The Type of logistic task
         */
        T: RoomLogisticsRequestTypes
        /**
         * Target ID
         */
        TID: Id<AnyStoreStructure | Creep | Tombstone | Ruin | Resource>
        /**
         * The Resource Type involved
         */
        RT: ResourceConstant
        /**
         * The Amount of resources involved
         */
        A: number
        /**
         * Only Full, if they want a responder only if fully filled
         */
        OF?: boolean
        /**
         * No reserve, if the creep shouldn't interact with the reserveStore of the target
         */
        NR?: boolean
    }

    interface PowerTask {
        taskID: string
        targetID: Id<Structure | Source>
        powerType: PowerConstant
        packedCoord: string
        cooldown: number
        priority: number
    }

    interface PackedPowerTask {
        /**
         * Target ID
         */
        TID: Id<Structure | Source>
        /**
         * Power Type
         */
        PT: PowerConstant
        /**
         * Cooldown
         */
        C: number
    }

    type Reservations = 'transfer' | 'withdraw' | 'pickup'

    interface Reservation {
        type: Reservations
        amount: number
        resourceType: ResourceConstant
        targetID: Id<AnyStoreStructure | Creep | Tombstone | Ruin | Resource>
    }

    type CombatRequestTypes = 'attack' | 'harass' | 'defend'

    interface ClaimRequest {
        /**
         * The name of the room responding to the request
         */
        responder?: string
        data: number[]
    }

    interface AllyCreepRequest {
        /**
         * The name of the room responding to the request
         */
        responder?: string
        data: number[]
    }

    interface CombatRequest {
        /**
         * The Type of attack request
         */
        T: CombatRequestTypes
        /**request
         * The name of the room responding to the request
         */
        responder?: string
        data: number[]
    }

    interface HaulRequest {
        data: number[]
        responder?: string
    }

    interface ControllerLevel {
        level: number
        progress: number
        progressTotal: number
    }
    interface RoomStats {
        /**
         * Game Time
         */
        gt: number
        /**
         * Remote Count
         */
        rc: number
        /**
         * Remote Energy Stored
         */
        res: number
        /**
         * Remote Energy Input Harvest
         */
        reih: number
        /**
         * Remote Energy Output Repair Other (non-barricade structures)
         */
        reoro: number
        /**
         * Remote Energy Output Build
         */
        reob: number
        /**
         * Remote Room CPU Usage
         */
        rrocu: number
        /**
         * Remote Room Visuals Manager CPU Usage
         */
        rrvmcu: number
        /**
         * Remote Construction Manager CPU Usage
         */
        rcmcu: number
        /**
         * Remote Role Manager CPU Usage
         */
        rrolmcu: number
        /**
         * Remote Role Manager Per Creep CPU Usage
         */
        rrolmpccu: number
        /**
         * Remote End Tick Creep Manager CPU Usage
         */
        retcmcu: number
        /**
         * Remote Power Role Manager CPU Usage
         */
        rprmcu: number
        /**
         * Remote Power Role Manager Per Creep CPU Usage
         */
        rprmpccu: number
    }

    interface RoomCommuneStats extends RoomStats {
        /**
         * Controller Level
         */
        cl: number
        /**
         * Energy Input Harvest
         */
        eih: number
        /**
         * Energy Input Bought
         */
        eib?: number
        /**
         * Energy Output Upgrade
         */
        eou: number
        /**
         * Energy Output Repair Other (non-barricade structures)
         */
        eoro: number
        /**
         * Energy Output Repair Wall or Rampart
         */
        eorwr: number
        /**
         * Energy Output Build
         */
        eob: number
        /**
         * Energy Output Sold
         */
        eos: number
        /**
         * Energy Output Spawn
         */
        eosp: number
        /**
         * Energy Output Power
         */
        eop: number
        /**
         * Minerals Harvested
         */
        mh: number
        /**
         * Energy Stored
         */
        es: number

        /**
         * Batteries Stored *10
         */
        bes: number
        /**
         * Creep Count
         */
        cc: number
        /**
         * Total Creep Count
         */
        tcc: number
        /**
         * Power Creep Count
         */
        pcc: number
        /**
         * Spawn Usage as a decimal
         */
        su: number
        /**
         * Ally Creep Request Manager CPU Usage
         */
        acrmcu: number
        /**
         * Claim Request Manager CPU Usage
         */
        clrmcu: number
        /**
         * Tower Manager CPU Usage
         */
        tmcu: number
        /**
         * Spawn Manager CPU Usage
         */
        smcu: number
        /**
         * Combat Request Manager CPU Usage
         */
        cormcu: number
        /**
         * Defence Manager CPU Usage
         */
        dmcu: number
        /**
         * Spawn Request Manager CPU Usage
         */
        srmcu: number
        /**
         * Room CPU Usage
         */
        rocu: number
        /**
         * Room Visuals Manager CPU Usage
         */
        rvmcu: number
        /**
         * Construction Manager CPU Usage
         */
        cmcu: number
        /**
         * Role Manager CPU Usage
         */
        rolmcu: number
        /**
         * Role Manager Per Creep CPU Usage
         */
        rolmpccu: number
        /**
         * End Tick Creep Manager CPU Usage
         */
        etcmcu: number
        /**
         * Power Role Manager CPU Usage
         */
        prmcu: number
        /**
         * Role Manager Per Creep CPU Usage
         */
        prmpccu: number
    }

    interface CpuUsers {
        /**
         * International Manager CPU Usage
         */
        imcu: number

        /**
         * Creep Organizer CPU Usage
         */
        cocu: number

        /**
         * Map Visuals Manager CPU Usage
         */
        mvmcu: number

        /**
         * Power Creep Organizer CPU Usage
         */
        pccu: number

        /**
         * Tick Config CPU Usage
         */
        tccu: number

        /**
         * Room Manager CPU Usage
         */
        roomcu: number

        /**
         * Stats Manager CPU Usage
         */
        smcu: number
    }

    type InternationalStatNames = keyof CpuUsers
    type RoomStatNames = keyof RoomStats
    type RoomCommuneStatNames = keyof RoomCommuneStats

    interface Stats {
        lastReset: number

        lastTickTimestamp: number
        tickLength: number

        communeCount: number

        resources: {
            pixels: number
            cpuUnlocks: number
            accessKeys: number
            credits: number
        }

        cpu: {
            bucket: number
            usage: number
            limit: number
        }

        memory: {
            usage: number
            limit: number
        }

        gcl: ControllerLevel

        gpl: ControllerLevel
        rooms: { [roomName: string]: Partial<RoomCommuneStats> }
        constructionSiteCount: number
        CPUUsers: CpuUsers
        heap: HeapStatistics
    }

    type StatsRoomTypes = 'commune' | 'remote'

    type RoomTypes =
        | 'commune'
        | 'remote'
        | 'ally'
        | 'allyRemote'
        | 'enemy'
        | 'enemyRemote'
        | 'neutral'
        | 'keeper'
        | 'keeperCenter'
        | 'highway'
        | 'intersection'

    interface PlayerInfo {
        data: number[]
    }

    interface Memory extends Settings {
        /**
         * The name of the user
         */
        me: string

        /**
         * An ongoing record of the latest ID assigned by the bot
         */
        ID: number

        chantIndex: number

        /**
         * An object of constrctionsSites with keys of site IDs and properties of the site's age
         */
        constructionSites: { [ID: string]: number }

        /**
         *
         */
        claimRequests: { [roomName: string]: ClaimRequest }

        combatRequests: { [roomName: string]: CombatRequest }

        haulRequests: { [roomName: string]: HaulRequest }

        allyCreepRequests: { [roomName: string]: AllyCreepRequest }

        stats: Partial<Stats>

        players: { [playerName: string]: Partial<PlayerInfo> }

        masterPlan: { resources?: { [key in ResourceConstant]?: number } }

        // Other

        profiler: ProfilerMemory
    }

    interface RawMemory {
        _parsed: Memory
    }

    type SpawningStructures = (StructureSpawn | StructureExtension)[]

    interface OrganizedStructures {
        spawn: StructureSpawn[]
        extension: StructureExtension[]
        road: StructureRoad[]
        constructedWall: StructureWall[]
        rampart: StructureRampart[]
        keeperLair: StructureKeeperLair[]
        portal: StructurePortal[]
        controller: StructureController[]
        link: StructureLink[]
        storage: StructureStorage[]
        tower: StructureTower[]
        observer: StructureObserver[]
        powerBank: StructurePowerBank[]
        powerSpawn: StructurePowerSpawn[]
        extractor: StructureExtractor[]
        lab: StructureLab[]
        terminal: StructureTerminal[]
        container: StructureContainer[]
        nuker: StructureNuker[]
        factory: StructureFactory[]
        invaderCore: StructureInvaderCore[]
    }

    interface RoomGlobal {
        [key: string]: any

        // RoomObjects

        stampAnchors: StampAnchors

        source1PathLength: number

        source2PathLength: number

        upgradePathLength: number

        // Containers

        sourceContainers: Id<StructureContainer>[]
        fastFillerContainerLeft: Id<StructureContainer> | undefined
        fastFillerContainerRight: Id<StructureContainer> | undefined
        controllerContainer: Id<StructureContainer> | undefined
        mineralContainer: Id<StructureContainer> | undefined

        centerUpgradePos: RoomPosition | false
        upgradePositions: RoomPosition[]

        allStructureIDs: Id<Structure>[]
        allCSiteIDs: Id<ConstructionSite>[]

        structureCoords: Map<string, Id<Structure>[]>
        cSiteCoords: Map<string, Id<ConstructionSite>[]>


        // Links

        sourceLinks: Id<StructureLink>[]
        controllerLink: Id<StructureLink> | undefined
        fastFillerLink: Id<StructureLink> | undefined
        hubLink: Id<StructureLink> | undefined
    }

    interface Room {
        /**
         * The amount of creeps with a task of harvesting sources in the room
         */
        creepsOfSourceAmount: number[]

        estimatedSourceIncome: number[]

        /**
         * An object with keys of roles with properties of arrays of creep names belonging to the role
         */
        myCreeps: { [key in CreepRoles]?: string[] }

        /**
         * The number of my creeps in the room
         */
        myCreepsAmount: number

        /**
         * An object with keys of roles with properties of arrays of power creep names belonging to the role
         */
        myPowerCreeps: { [key in PowerClassConstant]?: string[] }

        /**
         * The number of my power creeps in the room
         */
        myPowerCreepsAmount: number

        /**
         * An object with keys of roles and properties of the number of creeps with the role from this room
         */
        creepsFromRoom: Partial<{ [key in CreepRoles]: string[] }>

        /**
         * The cumulative amount of creeps with a communeName value of this room's name
         */
        creepsFromRoomAmount: number

        /**
         * An object with keys of roles and properties of the number of creeps with the role from this room
         */
        creepsOfRemote: { [remoteName: string]: Partial<{ [key in CreepRoles]: string[] }> }

        /**
         * A set of roomNames representing the targets stof scouts from this commune
         */
        scoutTargets: Set<string>

        spawnRequests: SpawnRequest[]

        /**
         * Tile types as defined by the rampartPlanner
         */
        tileCoords: CoordMap

        unprotectedCoords: CoordMap

        /**
         * Wether the towers can sufficiently deal with the enemy threat in the room
         */
        towerInferiority: boolean

        baseCoords: CoordMap

        rampartCoords: CoordMap

        roadCoords: CoordMap

        /**
         * A matrix with indexes of packed coords and values of creep names
         */
        creepPositions: Map<string, string>

        /**
         * A matrix with indexes of packed coords and values of creep names
         */
        powerCreepPositions: Map<string, string>

        /**
         * A matrix with indexes of packed coords and values of creep names
         */
        moveRequests: Map<string, string[]>

        roomManager: RoomManager

        communeManager: CommuneManager

        /**
         * The names of creeps looking to join a squad
         */
        squadRequests: Set<string>

        roomLogisticsRequests: { [key in RoomLogisticsRequestTypes]: { [ID: string]: RoomLogisticsRequest }}
        powerTasks: { [ID: string]: PowerTask }

        attackingDefenderIDs: Set<Id<Creep>>
        defenderEnemyTargetsWithDamage: Map<Id<Creep>, number>
        defenderEnemyTargetsWithDefender: Map<Id<Creep>, Id<Creep>[]>
        towerAttackTarget: Creep

        upgradeStrength: number
        mineralHarvestStrength: number

        /**
         * The carry parts needed to effectively run the commune
         */
        haulerNeed: number

        usedRampartIDs: Set<Id<StructureRampart>>

        // Functions

        /**
         *
         * @param pos1 The position of the thing performing the action
         * @param pos2 The position of the thing getting intereacted with
         * @param type The type of interaction, success if not provided
         */
        actionVisual(pos1: RoomPosition, pos2: RoomPosition, type?: string): void

        targetVisual(coord1: Coord, coord2: Coord, visualize?: boolean): void

        /**
         * Generates a path between two positions
         */
        advancedFindPath(opts: PathOpts): RoomPosition[]

        /**
         * Tries to delete a task with the provided ID and response state
         */
        deleteTask(taskID: any, responder: boolean): void

        scoutByRoomName(): RoomTypes | false

        scoutReservedRemote(): RoomTypes | false

        scoutUnreservedRemote(): RoomTypes | false

        scoutMyRemote(scoutingRoom: Room): RoomTypes | false

        scoutEnemyRoom(): RoomTypes | false

        basicScout(): RoomTypes

        /**
         * Finds the type of a room and initializes its custom properties
         * @param scoutingRoom The room that is performing the scout operation
         */
        advancedScout(scoutingRoom: Room): RoomTypes

        makeRemote(scoutingRoom: Room): boolean

        createAttackCombatRequest(opts?: Partial<{ [key in keyof typeof CombatRequestData]: CombatRequestData }>): void

        createHarassCombatRequest(opts?: Partial<{ [key in keyof typeof CombatRequestData]: CombatRequestData }>): void

        createDefendCombatRequest(opts?: Partial<{ [key in keyof typeof CombatRequestData]: CombatRequestData }>): void

        /**
         * Finds the score of rooms for potential communes
         */
        findScore(): void

        /**
         * Finds open spaces in a room and records them in a cost matrix
         */
        distanceTransform(
            initialCoords?: CoordMap,
            visuals?: boolean,
            /**
             * The smallest number to convert into an avoid value
             */
            minAvoid?: number,
            x1?: number,
            y1?: number,
            x2?: number,
            y2?: number,
        ): CoordMap

        /**
         * Finds open spaces in a room without adding depth to diagonals, and records the depth results in a cost matrix
         */
        diagonalDistanceTransform(
            initialCoords?: CoordMap,
            visuals?: boolean,
            /**
             * The smallest number to convert into an avoid value
             */
            minAvoid?: number,
            x1?: number,
            y1?: number,
            x2?: number,
            y2?: number,
        ): CoordMap

        /**
         * Gets ranges from for each position from a certain point
         */
        floodFill(seeds: Coord[], coordMap: CoordMap, visuals?: boolean): CoordMap

        /**
         * Flood fills a room until it finds the closest pos with a value greater than or equal to the one specified
         */
        findClosestPosOfValue(opts: FindClosestPosOfValueOpts): RoomPosition | false

        /**
         * Flood fills a room until it finds the closest pos with a value greater than or equal to the one specified, that does not infringe on disabled tiles
         */
        findClosestPosOfValueAsym(opts: FindClosestPosOfValueOptsAsym): RoomPosition | false

        /**
         *
         */
        pathVisual(path: RoomPosition[], color: keyof Colors, visualize?: boolean): void

        errorVisual(coord: Coord, visualize?: boolean): void

        /**
         * Finds and records a construction site for builders to target
         */
        findAllyCSiteTargetID(creep: Creep): boolean

        /**
         * Groups positions with contigiousness, structured similarily to a flood fill
         */
        groupRampartPositions(rampartPositions: number[]): RoomPosition[][]

        findUnprotectedCoords(visuals?: boolean): void

        /**
         *
         */
        findPositionsInsideRect(x1: number, y1: number, x2: number, y2: number): RoomPosition[]

        /**
         *
         */
        findAdjacentPositions(rx: number, ry: number): RoomPosition[]

        /**
         *
         */
        createPullTask(creator: Structure | Creep | Resource): void

        /**
         *
         */
        createPickupTasks(creator: Structure | Creep | Resource): void

        /**
         *
         */
        createOfferTasks(creator: Structure | Creep | Resource): void

        /**
         *
         */
        createTransferTasks(creator: Structure | Creep | Resource): void

        /**
         *
         */
        createWithdrawTasks(creator: Structure | Creep | Resource): void

        visualizeCoordMap(coordMap: CoordMap, color?: boolean): void

        visualizeCostMatrix(cm: CostMatrix, color?: boolean): void

        coordHasStructureTypes(coord: Coord, types: Set<StructureConstant>): boolean

        createPowerTask(target: Structure | Source, powerType: PowerConstant, priority: number): PowerTask | false

        highestWeightedStoringStructures(resourceType: ResourceConstant): AnyStoreStructure | false

        createRoomLogisticsRequest(args: CreateRoomLogisticsRequestArgs): void

        /**
         * Crudely estimates a room's income by accounting for the number of work parts owned by sourceHarvesters
         */
        estimateIncome(): number

        partsOfRoles: Partial<{ [key in CreepRoles]: Partial<{ [key in BodyPartConstant]: number }> }>

        getPartsOfRole(role: CreepRoles): Partial<{ [key in BodyPartConstant]: number }>

        createClaimRequest(): boolean

        findSwampPlainsRatio(): number

        // General roomFunctions

        claimRequestManager(): void
        combatRequestManager(): void

        allyCreepRequestManager(): void

        trafficManager(): void

        /**
         * Dictates and operates tasks for factories
         */
        factoryManager(): void

        // Spawn functions

        /**
         * Creates spawn requests for the commune
         */
        spawnRequester(): void

        constructSpawnRequests(opts: SpawnRequestOpts | false): void

        findMaxCostPerCreep(maxCostPerCreep: number): number

        createSpawnRequest(
            priority: number,
            role: CreepRoles,
            defaultParts: number,
            bodyPartCounts: { [key in PartsByPriority]: number },
            tier: number,
            cost: number,
            memory: any,
        ): void

        spawnRequestIndividually(opts: SpawnRequestOpts): void

        spawnRequestByGroup(opts: SpawnRequestOpts): void

        // Market functions

        advancedSell(resourceType: ResourceConstant, amount: number, targetAmount: number): boolean

        advancedBuy(resourceType: ResourceConstant, amount: number, targetAmount: number): boolean

        // Construction functions

        remoteConstructionManager(): void

        remotePlanner(commune: Room): boolean

        clearOtherStructures(): void

        remoteConstructionPlacement(): void

        communeConstructionPlacement(): void

        findStructureAtCoord<T extends StructureConstant>(coord: Coord, structureType: T): Structure | false
        findStructureAtXY<T extends StructureConstant>(x: number, y: number, structureType: T): Structure | false

        // Room Getters

        readonly global: Partial<RoomGlobal>

        _anchor: RoomPosition | undefined
        readonly anchor: RoomPosition | undefined

        // Resources

        _sources: Source[]
        readonly sources: Source[]

        _sourcesByEfficacy: Source[]
        readonly sourcesByEfficacy: Source[]

        _mineral: Mineral
        readonly mineral: Mineral

        // Creeps

        _enemyCreeps: Creep[]
        readonly enemyCreeps: Creep[]

        _enemyAttackers: Creep[]
        readonly enemyAttackers: Creep[]

        _allyCreeps: Creep[]
        readonly allyCreeps: Creep[]

        _myDamagedCreeps: Creep[]
        readonly myDamagedCreeps: Creep[]

        _myDamagedPowerCreeps: PowerCreep[]
        readonly myDamagedPowerCreeps: PowerCreep[]

        _allyDamagedCreeps: Creep[]
        readonly allyDamagedCreeps: Creep[]

        // Buildings

        _structureUpdate: boolean
        readonly structureUpdate: boolean
        readonly structureCoords: Map<string, Id<Structure>[]>

        _structures: Partial<OrganizedStructures>
        readonly structures: OrganizedStructures

        _cSiteUpdate: boolean
        readonly cSiteUpdate: boolean
        readonly cSiteCoords: Map<string, Id<ConstructionSite>[]>

        _cSites: Partial<Record<StructureConstant, ConstructionSite[]>>
        readonly cSites: Record<StructureConstant, ConstructionSite[]>

        _enemyCSites: ConstructionSite[]
        readonly enemyCSites: ConstructionSite[]

        _allyCSites: ConstructionSite[]
        readonly allyCSites: ConstructionSite[]

        _allyCSitesByType: Partial<Record<StructureConstant, ConstructionSite[]>>
        readonly allyCSitesByType: Record<StructureConstant, ConstructionSite[]>

        readonly cSiteTarget: ConstructionSite | undefined

        _spawningStructures: SpawningStructures
        readonly spawningStructures: SpawningStructures

        _spawningStructuresByPriority: SpawningStructures
        readonly spawningStructuresByPriority: SpawningStructures

        _spawningStructuresByNeed: SpawningStructures
        readonly spawningStructuresByNeed: SpawningStructures

        _taskNeedingSpawningStructures: SpawningStructures
        readonly taskNeedingSpawningStructures: SpawningStructures

        _dismantleTargets: Structure[]

        readonly dismantleTargets: Structure[]

        _destructableStructures: Structure[]

        readonly destructableStructures: Structure[]

        _combatStructureTargets: Structure[]

        readonly combatStructureTargets: Structure[]

        // Resource info

        _sourcePositions: RoomPosition[][]

        readonly sourcePositions: RoomPosition[][]

        _usedSourceCoords: Set<string>[]

        readonly usedSourceCoords: Set<string>[]

        _sourcePaths: RoomPosition[][]

        readonly sourcePaths: RoomPosition[][]

        readonly centerUpgradePos: RoomPosition | false

        readonly upgradePositions: RoomPosition[]

        _usedUpgradePositions: Set<string>
        readonly usedUpgradePositions: Set<string>

        _controllerPositions: RoomPosition[]
        readonly controllerPositions: RoomPosition[]

        readonly upgradePathLength: number

        _mineralPositions: RoomPosition[]
        readonly mineralPositions: RoomPosition[]

        _usedMineralCoords: Set<string>
        readonly usedMineralCoords: Set<string>

        _mineralPath: RoomPosition[]
        readonly mineralPath: RoomPosition[]

        _fastFillerPositions: RoomPosition[]
        readonly fastFillerPositions: RoomPosition[]

        _usedFastFillerCoords: Set<string>
        readonly usedFastFillerCoords: Set<string>

        _remoteNamesBySourceEfficacy: string[]
        readonly remoteNamesBySourceEfficacy: string[]

        _remoteSourceIndexesByEfficacy: string[]
        readonly remoteSourceIndexesByEfficacy: string[]

        // Container

        _sourceContainers: StructureContainer[]
        readonly sourceContainers: StructureContainer[]

        _sourceLinks: StructureLink[]
        readonly sourceLinks: StructureLink[]

        _fastFillerContainerLeft: StructureContainer | false
        readonly fastFillerContainerLeft: StructureContainer | undefined

        _fastFillerContainerRight: StructureContainer | false
        readonly fastFillerContainerRight: StructureContainer | undefined

        _controllerContainer: StructureContainer | false
        readonly controllerContainer: StructureContainer | undefined

        _mineralContainer: StructureContainer | false
        readonly mineralContainer: StructureContainer | false

        // Links

        _controllerLink: StructureLink | false
        readonly controllerLink: StructureLink | false

        _fastFillerLink: StructureLink | false
        readonly fastFillerLink: StructureLink | false

        _hubLink: StructureLink | false
        readonly hubLink: StructureLink | false

        _droppedEnergy: Resource[]
        readonly droppedEnergy: Resource[]

        _droppedResources: Resource[]
        readonly droppedResources: Resource[]

        _actionableWalls: StructureWall[]
        readonly actionableWalls: StructureWall[]

        _quadCostMatrix: CostMatrix
        readonly quadCostMatrix: CostMatrix

        _quadBulldozeCostMatrix: CostMatrix
        readonly quadBulldozeCostMatrix: CostMatrix

        _enemyDamageThreat: boolean
        readonly enemyDamageThreat: boolean

        _enemyThreatCoords: Set<string>
        readonly enemyThreatCoords: Set<string>

        _enemyThreatGoals: PathGoal[]
        readonly enemyThreatGoals: PathGoal[]

        _flags: Partial<{ [key in FlagNames]: Flag }>
        readonly flags: { [key in FlagNames]: Flag }

        _defensiveRamparts: StructureRampart[]
        readonly defensiveRamparts: StructureRampart[]

        _factory: StructureFactory
        readonly factory: StructureFactory

        _powerSpawn: StructurePowerSpawn
        readonly powerSpawn: StructurePowerSpawn

        _nuker: StructureNuker
        readonly nuker: StructureNuker

        _observer: StructureObserver
        readonly observer: StructureObserver

        _resourcesInStoringStructures: Partial<{ [key in ResourceConstant]: number }>
        readonly resourcesInStoringStructures: { [key in ResourceConstant]: number }

        _unprotectedEnemyCreeps: Creep[]
        readonly unprotectedEnemyCreeps: Creep[]

        _exitCoords: Set<string>
        readonly exitCoords: Set<string>

        // Target finding

        _MEWT: (Creep | AnyStoreStructure | Tombstone | Ruin | Resource)[]

        /**
         * Mandatory energy withdraw targets
         */
        readonly MEWT: (Creep | AnyStoreStructure | Tombstone | Ruin | Resource)[]

        _OEWT: (Creep | AnyStoreStructure | Tombstone | Ruin | Resource)[]

        /**
         * Optional energy withdraw targets
         */
        readonly OEWT: (Creep | AnyStoreStructure | Tombstone | Ruin | Resource)[]

        _MAWT: (Creep | AnyStoreStructure | Tombstone | Ruin | Resource)[]

        /**
         * Mandatory all withdraw targets
         */
        readonly MAWT: (Creep | AnyStoreStructure | Tombstone | Ruin | Resource)[]

        _OAWT: (Creep | AnyStoreStructure | Tombstone | Ruin | Resource)[]

        /**
         * Optional all withdraw targets
         */
        readonly OAWT: (Creep | AnyStoreStructure | Tombstone | Ruin | Resource)[]

        _METT: (Creep | AnyStoreStructure)[]

        /**
         * Mandatory energy transfer targets
         */
        readonly METT: (Creep | AnyStoreStructure)[]

        _OETT: (Creep | AnyStoreStructure)[]

        /**
         * Optional energy transfer targets
         */
        readonly OETT: (Creep | AnyStoreStructure)[]

        _MATT: (Creep | AnyStoreStructure)[]

        /**
         * Mandatory all transfer targets
         */
        readonly MATT: (Creep | AnyStoreStructure)[]

        _OATT: (Creep | AnyStoreStructure)[]

        /**
         * Optional all transfer targets
         */
        readonly OATT: (Creep | AnyStoreStructure)[]

        _MEFTT: (Creep | AnyStoreStructure)[]

        /**
         * Mandatory Energy Fill Transfer Targets
         */
        readonly MEFTT: (Creep | AnyStoreStructure)[]

        _MOFTT: (Creep | AnyStoreStructure)[]

        /**
         * Mandatory Other Fill Transfer Targets
         */
        readonly MOFTT: (Creep | AnyStoreStructure)[]

        _advancedLogistics: boolean
        readonly advancedLogistics: boolean
    }

    interface DepositRecord {
        decay: number
        needs: number[]
    }

    interface RoomMemory {
        /**
         * A packed representation of the center of the fastFiller
         */
        anchor: number

        /**
         * Type of a room that generally describes properties of the room
         */
        T: RoomTypes

        /**
         * A set of names of remotes controlled by this room
         */
        remotes: string[]

        /**
         * Not Claimable, if the room can be constructed by the base planner
         */
        NC: boolean

        /**
         * Source IDs of the sources in the room
         */
        SIDs: Id<Source>[]

        /**
         * The ID of the mineral
         */
        MID: Id<Mineral>

        /**
         * Commune Name
         */
        CN: string

        /**
         * Reservation Efficacy, the path distance from the remote's sources to its commune
         */
        RE: number

        /**
         * A list of needs the remote wants met
         */
        data: number[]

        /**
         * The room owner
         */
        owner: string

        /**
         * The controller's level
         */
        level: number

        powerEnabled: boolean

        /**
         * Wether the room has a terminal
         */
        terminal: boolean

        /**
         * The number of towers in the room
         */
        towers: number

        /**
         * The amount of stored energy in the room
         */
        energy: number

        /**
         * A set of roomNames that portals in this room go to
         */
        portalsTo: string[]

        /**
         * Last Scouted Tick, the last tick the room was scouted at
         */
        LST: number | undefined

        /**
         * The room name of the commune's claim target
         */
        claimRequest: string

        /**
         * The room names of the requests this room is responding to
         */
        combatRequests: string[]

        /**
         * The room names of the requests this room is responding to
         */
        haulRequests: string[]

        /**
         * The room name of the room's ally creep target
         */
        allyCreepRequest: string

        CSTID: Id<ConstructionSite>

        stampAnchors: Partial<Record<StampTypes, number[]>>

        powerBanks: { [roomName: string]: number[] }

        deposits: Record<Id<Deposit>, DepositRecord>

        /**
         * Planning Completed, Wether or not commune planning has been completed for the room
         */
        PC: boolean

        /**
         * Remote Planned, wether or not remote planning has been completed for the room
         */
        RP: boolean

        /**
         * Remote Stamp Anchors
         */
        RSA: Partial<Record<RemoteStampTypes, string>>

        /**
         * Source Positions, packed positions around sources where harvesters can sit
         */
        SP: string[]

        /**
         * Source Paths
         */
        SPs: string[]
        /**
         * Mineral Path
         */
        MPa: string

        /**
         * Mineral Positions, packed positions around the mineral where harvesters can sit
         */
        MP: string

        /**
         * Controller Positions, packed positions around the controller where reservers and downgraders can sit
         */
        CP: string

        /**
         * Defensive Strength
         */
        DS: number

        /**
         * Offensive Strength
         */
        OS: number

        /**
         * Attack Threat, how much a commune is concerned about enemy attackers
         */
        AT: number

        /**
         * Last Attack Tick, how many ticks have passed since the last attack
         */
        LAT: number

        /**
         * Minimum Hauler Cost, what the maxCost of a hauler should be to accomidate for CPU usage
         */
        MHC: number

        /**
         * Hauler Update, how many ticks ago the hauler size was updated
         */
        HU: number

        /**
         * Greatest Room Controller Level
         */
        GRCL: number

        hasTerminal: boolean

        factoryProduct: CommodityConstant | MineralConstant | RESOURCE_ENERGY | RESOURCE_GHODIUM
        factoryUsableResources: (CommodityConstant | MineralConstant | RESOURCE_GHODIUM | RESOURCE_ENERGY)[]

        marketData: {
            [RESOURCE_ENERGY]?: number
            sellAvg?: { [key in ResourceConstant]?: number }
            buyAvg?: { [key in ResourceConstant]?: number }
            aquire?: { [key in ResourceConstant]?: number }
        }
    }

    interface CreepFunctions {
        preTickManager(): void

        endTickManager(): void

        advancedPickup(target: Resource): boolean

        advancedTransfer(target: Creep | AnyStoreStructure, resourceType?: ResourceConstant, amount?: number): boolean

        advancedWithdraw(
            target: Creep | AnyStoreStructure | Tombstone | Ruin,
            resourceType?: ResourceConstant,
            amount?: number,
        ): boolean

        /**
         * Harvests a source and informs the result, while recording the result if successful
         */
        advancedHarvestSource(source: Source): boolean

        findUpgradePos(): RoomPosition | false

        /**
         * Attempts multiple methods to upgrade the controller
         */
        advancedUpgradeController(): boolean

        advancedBuild(): number
        builderGetEnergy(): number

        /**
         * Attempts multiple methods to build one of our construction sites
         */
        advancedBuildCSite(cSite: ConstructionSite): number

        /**
         * Attempts multiple methods to build an ally construction site
         */
        advancedBuildAllyCSite(): boolean

        /**
         *
         */
        findRampartRepairTarget(): StructureRampart | false

        /**
         *
         */
        findRepairTarget(): Structure<BuildableStructureConstant> | false

        findOptimalSourceIndex(): boolean

        findSourcePos(sourceIndex: number): false | RoomPosition

        findMineralHarvestPos(): false | RoomPosition

        /**
         *
         */
        needsNewPath(goalPos: RoomPosition, cacheAmount: number, path: RoomPosition[] | undefined): boolean

        /**
         *
         */
        createMoveRequestByPath(opts: MoveRequestOpts, pathOpts: MoveRequestByPathOpts): boolean | 'unpathable'

        /**
         *
         */
        createMoveRequest(opts: MoveRequestOpts): boolean | 'unpathable'

        assignMoveRequest(coord: Coord): void

        findShovePositions(avoidPackedPositions: Set<string>): RoomPosition[]

        shove(shoverPos: RoomPosition): boolean

        /**
         * Try to enforce a moveRequest and inform the result
         */
        runMoveRequest(): boolean

        /**
         *unpackCoordAsPos
         */
        recurseMoveRequest(queue?: string[]): void

        avoidEnemyThreatCoords(): boolean

        /**
         * Decides if the creep needs to get more resources or not
         */
        needsResources(): boolean

        findRecycleTarget(): StructureSpawn | StructureContainer | false

        advancedRecycle(): boolean

        advancedReserveController(): boolean

        findCost(): number

        passiveHeal(): boolean

        /**
         * Heal nearby allies without moving
         */
        aggressiveHeal(): boolean

        /**
         * Attack nearby enemies without moving
         */
        passiveRangedAttack(): boolean

        reserveWithdrawEnergy(): void

        reserveTransferEnergy(): void

        // Reservation

        deleteReservation(index: number): void

        createReservation(
            type: Reservations,
            target: Id<AnyStoreStructure | Creep | Tombstone | Ruin | Resource>,
            amount: number,
            resourceType?: ResourceConstant,
        ): void

        /**
         * Deletes reservations with no target, pre-emptively modifies store values
         */
        reservationManager(): void

        fulfillReservation(): boolean
    }

    interface CreepProperties {
        /**
         * The packed position of the moveRequest, if one has been made
         */
        moveRequest: string

        /**
         * Wether the creep moved a resource this tick
         */
        movedResource: boolean

        /**
         * The packed coord the creep is trying to act upon, if it exists. -1 means the move attempt failed
         */
        moved?: string | 'moved' | 'yield'

        /**
         * The creep's opts when trying to make a moveRequest intra tick
         */
        pathOpts: PathOpts

        _dying: boolean

        /**
         * Wether the creep is as old as the time it takes to respawn, or is past a role-based threshold
         */
        readonly dying: boolean

        _macroHealStrength: number

        /**
         * The heal strength of the creep alongside its neighbours that we dopn't own
         */
        readonly macroHealStrength: number

        _grossTowerDamage: number

        /**
         * The highest possible tower damage
         */
        readonly grossTowerDamage: number

        _netTowerDamage: number

        /**
         * The highest possible tower damage, accounting for maximum possible enemy heal
         */
        readonly netTowerDamage: number

        _message: string

        /**
         * The cumulative message to present in say()
         */
        message: string

        _freeCapacityNextTick: number

        /**
         * The estimated total free capacity the creep will have next tick
         */
        freeCapacityNextTick: number

        _isOnExit: boolean

        readonly isOnExit: boolean
    }

    // Creeps

    interface Creep extends CreepFunctions, CreepProperties {
        combatTarget: Creep

        /**
         * Wether the creep did a harvest, build, upgrade, dismantle, or repair this tick
         */
        worked: boolean

        /**
         * Wether the creep rangedHealed or rangedAttacked this tick
         */
        ranged: boolean

        /**
         * Wether the creep healed or attacked this tick
         */
        meleed: boolean

        /**
         * Whether the creep is actively pulling another creep or not
         */
        pulling: boolean

        /**
         * Whether the creep is actively getting pulled by another creep or not
         */
        gettingPulled: boolean

        /**
         * The squad the creep belongs to
         */
        squad: Duo | Quad | undefined

        /**
         * Wether the squad has ran yet
         */
        squadRan: boolean

        /**
         * The ID of the spawn the creep is spawning in, if it is spawning
         */
        spawnID: Id<StructureSpawn>

        // Creep Functions

        activeRenew(): void

        passiveRenew(): void

        findBulzodeTargets(goalCoord: RoomPosition): Id<Structure>[]

        findQuadBulldozeTargets(goalCoord: RoomPosition): Id<Structure>[]

        manageSpawning(spawn: StructureSpawn): void

        roomLogisticsRequestManager(): void

        findRoomLogisticsRequest(args?: findNewRoomLogisticsRequestArgs): CreepRoomLogisticsRequest | 0
        findRoomLogisticsRequestTypes(args?: findNewRoomLogisticsRequestArgs): Set<RoomLogisticsRequestTypes>
        canAcceptRoomLogisticsRequest(requestType: RoomLogisticsRequestTypes, requestID: string): boolean
        createBackupStoringStructuresRoomLogisticsRequest(types: Set<RoomLogisticsRequestTypes>): CreepRoomLogisticsRequest | 0
        findRoomLogisticRequestAmount(request: RoomLogisticsRequest): number

        runRoomLogisticsRequest(args?: findNewRoomLogisticsRequestArgs): number

        runRoomLogisticsRequests(args?: findNewRoomLogisticsRequestArgs): boolean

        // Creep Getters

        _role: CreepRoles

        /**
         * The lifetime designation that boardly describes what the creep should do
         */
        readonly role: CreepRoles

        _cost: number

        /**
         * The amount of energy required to spawn the creep
         */
        readonly cost: number

        _commune: Room | undefined

        /**
         * The name of the room the creep is from
         */
        readonly commune: Room | undefined

        _defaultParts: number

        readonly defaultParts: number

        _strength: number

        /**
         * A numerical measurement of the combat abilites of the creep
         */
        readonly strength: number

        _reservation: Reservation

        readonly reservation: Reservation

        _upgradeStrength: number

        readonly upgradeStrength: number

        _combatStrength: CombatStrength

        readonly combatStrength: CombatStrength

        _defenceStrength: number

        /**
         * The multiplier to incoming damage the creep has
         */
        readonly defenceStrength: number

        _parts: Partial<Record<BodyPartConstant, number>>

        /**
         * The number of parts organized by type the creep has
         */
        readonly parts: Partial<Record<BodyPartConstant, number>>

        _boosts: Partial<Record<MineralBoostConstant, number>>

        /**
         * The number of boosts organized by type the creep has
         */
        readonly boosts: Partial<Record<MineralBoostConstant, number>>

        _canMove: boolean

        readonly canMove: boolean
    }

    interface CreepMemoryTemplate {
        /**
         * Task Room Name, the name of the room the creep is trying to perform a task in
         */
        TRN: string
    }

    interface CreepMemory extends CreepMemoryTemplate {
        /**
         * Wether the creep is old enough to need a replacement
         */
        D: boolean

        /**
         * The Source Index of recorded sources in the room
         */
        SI: 0 | 1

        /**
         * The creep's packed coord for a designated target
         */
        PC: string

        /**
         * Last Cache, the last time a path was cached in memory
         */
        LC: number

        /**
         * A packed pos list desciring where the creep neeeds to move to get to its goal
         */
        P: string

        /**
         * Goal Pos, the position the creep is or has tried to path to
         */
        GP: string

        /**
         * Whether the creep is intended to move on its own or not
         */
        getPulled: boolean

        /**
         * The target for which the creep should repair
         */
        repairTarget: Id<Structure<BuildableStructureConstant>>

        /**
         * Scout Target, the name of the room the scout is trying to scout
         */
        scT: string

        /**
         * Sign Target, the name of the room the scout is trying to sign
         */
        siT: string

        /**
         * Remote Name of the room the creep is remoting for
         */
        RN: string

        /**
         * The target ID of the task (for hubHaulers)
         */
        taskTarget: Id<Creep | AnyStoreStructure>

        /**
         * Reservations, An array of targets with information to manage the resources of
         */
        Rs: Reservation[]

        /**
         * Room Logistics Requests
         */
        RLRs: CreepRoomLogisticsRequest[]

        /**
         * The target for which the creep should dismantle
         */
        dismantleTarget: Id<Structure>

        /**
         * Wether or not the creep Needs Resources
         */
        NR: boolean

        /**
         * Roads, wether or not the creep should use roads
         */
        R: boolean

        /**
         * The rampart repair quota the creep currently has decided on
         */
        quota: number

        /**
         * Squad Size of the squad the creep is attempting to form
         */
        SS: number | undefined

        /**
         * Squad Type the combat method the creep's squad is attempting
         */
        ST: 'rangedAttack' | 'attack' | 'dismantle'

        /**
         * Squad Formed, wether the creep has joined a squad or not
         */
        SF: boolean

        /**
         * Squad Member Names
         */
        SMNs: string[]

        /**
         * Quad Bulldoze Targets
         */
        QBTIDs: Id<Structure>[]

        /**
         * Combat Request Name, the name of the room the creep should do combat in
         */
        CRN?: string

        /**
         * Haul Request Name, the name of the room the creep should do hauling for
         */
        HRN?: string

        /**
         * Recycle Target, the spawn ID the creep is going to recycle
         */
        RecT: Id<StructureSpawn | StructureContainer> | undefined

        /**
         * Ticks Waited for an arbitrary event
         */
        TW: number

        /**
         * Rampart Only Shoving, informs wether the creep must be shoved to viable ramparts or not
         */
        ROS: boolean

        /**
         * Rampart ID, the ID of the rampart the creep is trying to sit under
         */
        RID: Id<StructureRampart>
    }

    // PowerCreeps

    interface PowerCreep extends CreepFunctions, CreepProperties {
        /**
         * Wether the creep has used a power this tick
         */
        powered: boolean

        _powerCooldowns: Partial<Map<PowerConstant, number>>

        readonly powerCooldowns: Partial<Map<PowerConstant, number>>
    }

    interface PowerCreepMemory extends CreepMemoryTemplate {
        /**
         * Commune Name
         */
        CN: string

        /**
         * Task name, the method for which the creep is trying to run inter tick
         */
        TN: keyof Operator

        /**
         * Task target ID, the ID of the target the creep is targeting for its task
         */
        TTID: Id<Structure | Source>

        /**
         * Power Type
         */
        PT: PowerConstant
    }

    // Structures

    interface Structure {
        nextHits: number

        // Getters

        _RCLActionable: boolean

        /**
         * Wether the structure is disable or not by the room's controller level
         */
        readonly RCLActionable: boolean
    }

    interface StructureSpawn {
        /**
         * Wether the spawn has renewed a creep this tick
         */
        renewed: boolean

        /**
         * Wether the structure has been transfered or withdrawn from
         */
        hasHadResourcesMoved: boolean

        // Functions

        testSpawn(spawnRequest: SpawnRequest, ID: string): ScreepsReturnCode

        advancedSpawn(spawnRequest: SpawnRequest, ID: string): ScreepsReturnCode
    }

    interface StructureExtension {
        /**
         * Wether the structure has been transfered or withdrawn from
         */
        hasHadResourcesMoved: boolean
    }

    interface StructureTower {
        intended: boolean
    }

    interface StructureTerminal {
        intended: boolean
    }

    interface CustomStore extends StoreDefinition {
        parentID: Id<AnyStoreStructure>
    }

    interface RoomObject {
        // Functions

        /**
         * Finds the present total store usage number of this RoomObject
         * @param resourceType A resourceConstant to ensure proper querying of limit store RoomObjects
         */
        usedStore(resourceType?: ResourceConstant): number

        /**
         * Finds the total free store capacity of this RoomObject
         * @param resourceType A resourceConstant to ensure proper querying of limit store RoomObjects
         */
        freeStore(): number

        /**
         * Finds the total free store capacity of a specific resource for this RoomObject
         */
        freeSpecificStore(resourceType?: ResourceConstant): number

        freeNextStoreOf(resourceType: ResourceConstant): number

        freeReserveStoreOf(resourceType: ResourceConstant): number

        // RoomObject getters

        _effectsData: Map<PowerConstant | EffectConstant, RoomObjectEffect>

        readonly effectsData: Map<PowerConstant | EffectConstant, RoomObjectEffect>

        _nextHits: number

        /**
         * The estimated hits amount next tick
         */
        nextHits: number

        // _nextStore: Partial<StoreDefinition>

        // /**
        //  * The estimated store values next tick
        //  */
        // readonly nextStore: Partial<StoreDefinition>

        _nextStore: Partial<CustomStore>

        /**
         * The estimated store values next tick
         */
        readonly nextStore: Partial<CustomStore>

        _usedNextStore: number

        readonly usedNextStore: number

        readonly freeNextStore: number

        _reserveStore: Partial<CustomStore>

        /**
         * The store values including that reserved by tasks
         */
        readonly reserveStore: Partial<CustomStore>

        _usedReserveStore: number

        readonly usedReserveStore: number

        readonly freeReserveStore: number

        _reservePowers: Set<PowerConstant>

        readonly reservePowers: Set<PowerConstant>
    }

    interface Resource {
        // Getters

        _nextAmount: number

        nextAmount: number

        _reserveAmount: number

        reserveAmount: number
    }

    interface Source {
        /**
         * The index of the source in room.sources
         */
        index: number
    }

    // Global

    namespace NodeJS {
        interface Global {
            [key: string]: any
            /**
             * Whether global is constructed or not
             */
            constructed: true | undefined

            /**
             * A strings to custom log as rich text
             */
            logs: string

            /**
             * The number of construction sites placed by the bot
             */
            constructionSitesCount: number

            packedRoomNames: { [roomName: string]: string }

            unpackedRoomNames: { [roomName: string]: string }
            roomStats: { [roomType in StatsRoomTypes]: { [roomName: string]: Partial<RoomStats | RoomCommuneStats> } }
            CPUUsers: CpuUsers

            terrainCoords: { [roomName: string]: CoordMap }

            lastReset: number

            /**
             * Room names that have controllers we own
             */
            communes: Set<string>

            roomManagers: { [roomName: string]: RoomManager }

            communeManagers: { [roomName: string]: CommuneManager }

            // Command functions

            /**
             * Deletes all properties of global
             */
            clearGlobal(): void

            /**
             * Deletes all properties of Memory
             */
            clearMemory(avoidKeys?: string[]): string

            /**
             * Kills all creeps owned by the bot
             */
            killCreeps(roles?: CreepRoles[]): string

            /**
             * Removes all specified construction sites owned by the bot
             */
            removeCSites(removeInProgress?: boolean, types?: BuildableStructureConstant[]): string

            /**
             * Destroys all specified structures owned by the bot
             */
            destroyStructures(roomName: string, types?: StructureConstant[]): string

            /**
             * Destroys all specified structures in communes
             */
            destroyCommuneStructures(types?: StructureConstant[]): string

            /**
             * Responds, or if needed, creates, a claim request for a specified room, by a specified room
             * @param requestName The roomName of the claimRequest to respond to
             * @param commune The commune to respond to the claimRequest
             */
            claim(requestName: string, communeName?: string): string

            deleteClaimRequests(): string

            /**
             * Responds, or if needed, creates, an attack request for a specified room, by a specified room
             */
            combat(
                requestName: string,
                type: CombatRequestTypes,
                opts?: Partial<{ [key in keyof typeof CombatRequestData]: CombatRequestData }>,
                communeName?: string,
            ): string

            /**
             * Deletes combatRequests for a specified room, if there are any
             */
            deleteCombatRequest(requestName: string): string

            /**
             * Creates an allyCreepRequest for a specified room, that can optionally be assigned to a specified commune
             */
            allyCreepRequest(requestName: string, communeName?: string): string

            deleteBasePlans(roomName?: string): string
        }
    }

    interface StringMap<T> {
        [key: string]: T
    }
    type StringMapGeneric<V, K extends string> = {
        [key in K]: V
    }
}
