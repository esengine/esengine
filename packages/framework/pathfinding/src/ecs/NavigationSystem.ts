/**
 * @zh 统一导航系统
 * @en Unified Navigation System
 *
 * @zh 可插拔的导航系统，支持运行时切换寻路、避让、碰撞检测算法
 * @en Pluggable navigation system, supports runtime swapping of pathfinding, avoidance, and collision detection algorithms
 */

import {
    EntitySystem,
    Matcher,
    ECSSystem,
    type Entity
} from '@esengine/ecs-framework';
import { NavigationAgentComponent, NavigationState } from './NavigationAgentComponent';
import type {
    IPathPlanner,
    IVector2,
    IIncrementalPathPlanner,
    PathPlanState
} from '../interfaces/IPathPlanner';
import { isIncrementalPlanner, PathPlanState as PlanState } from '../interfaces/IPathPlanner';
import type { ILocalAvoidance, IObstacleData, IAvoidanceAgentData } from '../interfaces/ILocalAvoidance';
import type { ICollisionResolver } from '../interfaces/ICollisionResolver';
import type { IFlowController, IFlowAgentData } from '../interfaces/IFlowController';
import { PassPermission } from '../interfaces/IFlowController';

/**
 * @zh 导航系统配置
 * @en Navigation system configuration
 */
export interface INavigationSystemConfig {
    /**
     * @zh 时间步长
     * @en Time step
     */
    timeStep?: number;

    /**
     * @zh 是否启用路径规划阶段
     * @en Whether to enable path planning stage
     */
    enablePathPlanning?: boolean;

    /**
     * @zh 是否启用流量控制阶段
     * @en Whether to enable flow control stage
     */
    enableFlowControl?: boolean;

    /**
     * @zh 是否启用局部避让阶段
     * @en Whether to enable local avoidance stage
     */
    enableLocalAvoidance?: boolean;

    /**
     * @zh 是否启用碰撞解决阶段
     * @en Whether to enable collision resolution stage
     */
    enableCollisionResolution?: boolean;

    /**
     * @zh 是否启用代理间碰撞解决
     * @en Whether to enable agent-agent collision resolution
     */
    enableAgentCollisionResolution?: boolean;

    // =========================================================================
    // 时间切片配置 | Time Slicing Configuration
    // =========================================================================

    /**
     * @zh 是否启用时间切片寻路（需要 IIncrementalPathPlanner）
     * @en Whether to enable time-sliced pathfinding (requires IIncrementalPathPlanner)
     *
     * @zh 启用后，寻路计算会分散到多帧执行，避免卡顿
     * @en When enabled, pathfinding computation is spread across multiple frames to avoid stuttering
     */
    enableTimeSlicing?: boolean;

    /**
     * @zh 每帧总迭代预算
     * @en Total iteration budget per frame
     *
     * @zh 所有代理共享此预算，根据优先级分配
     * @en All agents share this budget, allocated by priority
     *
     * @default 1000
     */
    iterationsBudget?: number;

    /**
     * @zh 每帧最大处理代理数
     * @en Maximum agents to process per frame
     *
     * @zh 限制每帧处理的代理数量，避免过载
     * @en Limits the number of agents processed per frame to avoid overload
     *
     * @default 10
     */
    maxAgentsPerFrame?: number;

    /**
     * @zh 每个代理每帧最大迭代数
     * @en Maximum iterations per agent per frame
     *
     * @default 200
     */
    maxIterationsPerAgent?: number;
}

/**
 * @zh 默认配置
 * @en Default configuration
 */
const DEFAULT_CONFIG: Required<INavigationSystemConfig> = {
    timeStep: 1 / 60,
    enablePathPlanning: true,
    enableFlowControl: true,
    enableLocalAvoidance: true,
    enableCollisionResolution: true,
    enableAgentCollisionResolution: true,
    enableTimeSlicing: false,
    iterationsBudget: 1000,
    maxAgentsPerFrame: 10,
    maxIterationsPerAgent: 200
};

/**
 * @zh 统一导航系统
 * @en Unified Navigation System
 *
 * @zh 可插拔的导航系统，处理管线：PathPlanning → LocalAvoidance → CollisionResolution
 * @en Pluggable navigation system, pipeline: PathPlanning → LocalAvoidance → CollisionResolution
 *
 * @example
 * ```typescript
 * import {
 *     NavigationSystem,
 *     NavigationAgentComponent,
 *     createNavMeshPathPlanner,
 *     createORCAAvoidance,
 *     createDefaultCollisionResolver
 * } from '@esengine/pathfinding/ecs';
 *
 * // 创建系统
 * const navSystem = new NavigationSystem();
 *
 * // 配置算法（可选，每个阶段都可以独立启用/禁用）
 * navSystem.setPathPlanner(createNavMeshPathPlanner(navMesh));
 * navSystem.setLocalAvoidance(createORCAAvoidance());
 * navSystem.setCollisionResolver(createDefaultCollisionResolver());
 *
 * scene.addSystem(navSystem);
 *
 * // 添加障碍物
 * navSystem.addObstacle({ vertices: [...] });
 *
 * // 创建代理
 * const agent = scene.createEntity('Agent');
 * const nav = agent.addComponent(new NavigationAgentComponent());
 * nav.setPosition(0, 0);
 * nav.setDestination(100, 100);
 *
 * // 运行时切换算法
 * navSystem.setPathPlanner(createJPSPlanner(gridMap));
 * navSystem.setLocalAvoidance(null);  // 禁用避让
 * ```
 */
@ECSSystem('Navigation', { updateOrder: 45 })
export class NavigationSystem extends EntitySystem {
    private config: Required<INavigationSystemConfig>;

    private pathPlanner: IPathPlanner | null = null;
    private flowController: IFlowController | null = null;
    private localAvoidance: ILocalAvoidance | null = null;
    private collisionResolver: ICollisionResolver | null = null;

    /**
     * @zh 静态障碍物（墙壁、建筑等）- 由 PathPlanner 和 CollisionResolver 处理
     * @en Static obstacles (walls, buildings) - handled by PathPlanner and CollisionResolver
     */
    private staticObstacles: IObstacleData[] = [];

    /**
     * @zh 动态障碍物（移动物体等）- 由 ORCA 和 CollisionResolver 处理
     * @en Dynamic obstacles (moving objects) - handled by ORCA and CollisionResolver
     */
    private dynamicObstacles: IObstacleData[] = [];

    private currentTime: number = 0;
    private agentEnterTimes: Map<number, number> = new Map();

    // =========================================================================
    // 时间切片状态 | Time Slicing State
    // =========================================================================

    /**
     * @zh 是否为增量寻路器
     * @en Whether the path planner is incremental
     */
    private isIncrementalPlanner: boolean = false;

    /**
     * @zh 等待寻路的代理队列（按优先级排序）
     * @en Queue of agents waiting for pathfinding (sorted by priority)
     */
    private pendingPathRequests: Set<number> = new Set();

    constructor(config: INavigationSystemConfig = {}) {
        super(Matcher.all(NavigationAgentComponent));
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    // =========================================================================
    // 算法设置 | Algorithm Setters
    // =========================================================================

    /**
     * @zh 设置路径规划器
     * @en Set path planner
     *
     * @param planner - @zh 路径规划器，传入 null 禁用路径规划 @en Path planner, pass null to disable
     *
     * @zh 如果传入 IIncrementalPathPlanner 且启用了时间切片，会自动使用增量寻路
     * @en If passing IIncrementalPathPlanner and time slicing is enabled, will automatically use incremental pathfinding
     *
     * @example
     * ```typescript
     * navSystem.setPathPlanner(createNavMeshPathPlanner(navMesh));
     * navSystem.setPathPlanner(createAStarPlanner(gridMap));
     * navSystem.setPathPlanner(createIncrementalAStarPlanner(gridMap));  // 支持时间切片
     * navSystem.setPathPlanner(null);  // 禁用
     * ```
     */
    setPathPlanner(planner: IPathPlanner | null): void {
        this.pathPlanner?.dispose();
        this.pathPlanner = planner;
        this.isIncrementalPlanner = planner !== null && isIncrementalPlanner(planner);
        this.pendingPathRequests.clear();
    }

    /**
     * @zh 获取当前路径规划器
     * @en Get current path planner
     */
    getPathPlanner(): IPathPlanner | null {
        return this.pathPlanner;
    }

    /**
     * @zh 设置流量控制器
     * @en Set flow controller
     *
     * @param controller - @zh 流量控制器，传入 null 禁用流量控制 @en Flow controller, pass null to disable
     *
     * @example
     * ```typescript
     * navSystem.setFlowController(createFlowController());
     * navSystem.setFlowController(null);  // 禁用
     * ```
     */
    setFlowController(controller: IFlowController | null): void {
        this.flowController?.dispose();
        this.flowController = controller;
    }

    /**
     * @zh 获取当前流量控制器
     * @en Get current flow controller
     */
    getFlowController(): IFlowController | null {
        return this.flowController;
    }

    /**
     * @zh 设置局部避让算法
     * @en Set local avoidance algorithm
     *
     * @param avoidance - @zh 局部避让算法，传入 null 禁用避让 @en Local avoidance, pass null to disable
     *
     * @example
     * ```typescript
     * navSystem.setLocalAvoidance(createORCAAvoidance());
     * navSystem.setLocalAvoidance(null);  // 禁用
     * ```
     */
    setLocalAvoidance(avoidance: ILocalAvoidance | null): void {
        this.localAvoidance?.dispose();
        this.localAvoidance = avoidance;
    }

    /**
     * @zh 获取当前局部避让算法
     * @en Get current local avoidance algorithm
     */
    getLocalAvoidance(): ILocalAvoidance | null {
        return this.localAvoidance;
    }

    /**
     * @zh 设置碰撞解决器
     * @en Set collision resolver
     *
     * @param resolver - @zh 碰撞解决器，传入 null 禁用碰撞解决 @en Collision resolver, pass null to disable
     *
     * @example
     * ```typescript
     * navSystem.setCollisionResolver(createDefaultCollisionResolver());
     * navSystem.setCollisionResolver(null);  // 禁用
     * ```
     */
    setCollisionResolver(resolver: ICollisionResolver | null): void {
        this.collisionResolver?.dispose();
        this.collisionResolver = resolver;
    }

    /**
     * @zh 获取当前碰撞解决器
     * @en Get current collision resolver
     */
    getCollisionResolver(): ICollisionResolver | null {
        return this.collisionResolver;
    }

    // =========================================================================
    // 障碍物管理 | Obstacle Management
    // =========================================================================

    /**
     * @zh 添加静态障碍物（墙壁、建筑等）
     * @en Add static obstacle (walls, buildings, etc.)
     *
     * @zh 静态障碍物由 PathPlanner 规划路径时考虑，CollisionResolver 防止穿透
     * @zh ORCA 不会处理静态障碍物，因为路径规划已经绑开了它们
     * @en Static obstacles are considered by PathPlanner for routing, CollisionResolver for penetration prevention
     * @en ORCA does NOT process static obstacles since path planning already avoids them
     *
     * @param obstacle - @zh 障碍物数据 @en Obstacle data
     */
    addStaticObstacle(obstacle: IObstacleData): void {
        this.staticObstacles.push(obstacle);
    }

    /**
     * @zh 添加动态障碍物（移动物体、临时障碍等）
     * @en Add dynamic obstacle (moving objects, temporary obstacles, etc.)
     *
     * @zh 动态障碍物由 ORCA 进行局部避让，CollisionResolver 防止穿透
     * @en Dynamic obstacles are handled by ORCA for local avoidance, CollisionResolver for penetration prevention
     *
     * @param obstacle - @zh 障碍物数据 @en Obstacle data
     */
    addDynamicObstacle(obstacle: IObstacleData): void {
        this.dynamicObstacles.push(obstacle);
    }

    /**
     * @zh 移除所有静态障碍物
     * @en Remove all static obstacles
     */
    clearStaticObstacles(): void {
        this.staticObstacles = [];
    }

    /**
     * @zh 移除所有动态障碍物
     * @en Remove all dynamic obstacles
     */
    clearDynamicObstacles(): void {
        this.dynamicObstacles = [];
    }

    /**
     * @zh 移除所有障碍物（静态和动态）
     * @en Remove all obstacles (static and dynamic)
     */
    clearObstacles(): void {
        this.staticObstacles = [];
        this.dynamicObstacles = [];
    }

    /**
     * @zh 获取静态障碍物列表
     * @en Get static obstacles list
     */
    getStaticObstacles(): readonly IObstacleData[] {
        return this.staticObstacles;
    }

    /**
     * @zh 获取动态障碍物列表
     * @en Get dynamic obstacles list
     */
    getDynamicObstacles(): readonly IObstacleData[] {
        return this.dynamicObstacles;
    }

    /**
     * @zh 获取所有障碍物列表（静态+动态）
     * @en Get all obstacles list (static + dynamic)
     */
    getObstacles(): readonly IObstacleData[] {
        return [...this.staticObstacles, ...this.dynamicObstacles];
    }

    /**
     * @zh 获取所有障碍物用于碰撞检测
     * @en Get all obstacles for collision detection
     */
    private getAllObstaclesForCollision(): readonly IObstacleData[] {
        return [...this.staticObstacles, ...this.dynamicObstacles];
    }

    /**
     * @zh 设置静态障碍物列表
     * @en Set static obstacles list
     *
     * @param obstacles - @zh 障碍物列表 @en Obstacles list
     */
    setStaticObstacles(obstacles: IObstacleData[]): void {
        this.staticObstacles = [...obstacles];
    }

    /**
     * @zh 设置动态障碍物列表
     * @en Set dynamic obstacles list
     *
     * @param obstacles - @zh 障碍物列表 @en Obstacles list
     */
    setDynamicObstacles(obstacles: IObstacleData[]): void {
        this.dynamicObstacles = [...obstacles];
    }

    // =========================================================================
    // 系统生命周期 | System Lifecycle
    // =========================================================================

    /**
     * @zh 系统销毁时调用
     * @en Called when system is destroyed
     */
    protected onDestroy(): void {
        this.pathPlanner?.dispose();
        this.flowController?.dispose();
        this.localAvoidance?.dispose();
        this.collisionResolver?.dispose();
        this.pathPlanner = null;
        this.flowController = null;
        this.localAvoidance = null;
        this.collisionResolver = null;
        this.staticObstacles = [];
        this.dynamicObstacles = [];
        this.agentEnterTimes.clear();
        this.pendingPathRequests.clear();
        this.isIncrementalPlanner = false;
    }

    // =========================================================================
    // 处理管线 | Processing Pipeline
    // =========================================================================

    /**
     * @zh 处理实体
     * @en Process entities
     */
    protected process(entities: readonly Entity[]): void {
        if (entities.length === 0) return;

        const deltaTime = this.config.timeStep;
        this.currentTime += deltaTime;

        const agentDataMap = new Map<number, IAvoidanceAgentData>();
        const flowAgentDataList: IFlowAgentData[] = [];
        const entityMap = new Map<number, Entity>();

        // Build entity map for quick lookup
        for (const entity of entities) {
            entityMap.set(entity.id, entity);
        }

        // Stage 1: Path Planning
        // 时间切片模式使用增量寻路，同步模式使用普通寻路
        // Time slicing mode uses incremental pathfinding, sync mode uses normal pathfinding
        if (this.config.enablePathPlanning && this.pathPlanner) {
            if (this.config.enableTimeSlicing && this.isIncrementalPlanner) {
                // Incremental mode: process all agents together with budget allocation
                const agentList: Array<{ entityId: number; agent: NavigationAgentComponent }> = [];
                for (const entity of entities) {
                    const agent = entity.getComponent(NavigationAgentComponent)!;
                    if (agent.enabled) {
                        agentList.push({ entityId: entity.id, agent });
                    }
                }
                this.processIncrementalPathPlanning(agentList, entityMap);
            } else {
                // Sync mode: process each agent individually
                for (const entity of entities) {
                    const agent = entity.getComponent(NavigationAgentComponent)!;
                    if (!agent.enabled) continue;
                    this.processPathPlanning(agent, deltaTime);
                }
            }
        }

        // Stage 1b: Build Agent Data (after path planning)
        for (const entity of entities) {
            const agent = entity.getComponent(NavigationAgentComponent)!;
            if (!agent.enabled) continue;

            // Track enter time for flow control
            if (!this.agentEnterTimes.has(entity.id)) {
                this.agentEnterTimes.set(entity.id, this.currentTime);
            }

            // Calculate preferred velocity from path
            const preferredVelocity = this.calculatePreferredVelocity(agent);

            // Build agent data for avoidance
            const agentData = this.buildAgentData(entity, agent, preferredVelocity);
            agentDataMap.set(entity.id, agentData);

            // Build flow agent data
            flowAgentDataList.push({
                id: entity.id,
                position: { x: agent.position.x, y: agent.position.y },
                destination: agent.destination,
                currentWaypoint: agent.getCurrentWaypoint(),
                radius: agent.radius,
                priority: 50,
                enterTime: this.agentEnterTimes.get(entity.id)
            });
        }

        // Stage 2: Flow Control
        if (this.config.enableFlowControl && this.flowController) {
            this.flowController.update(flowAgentDataList, deltaTime);
        }

        // Stage 3: Local Avoidance (batch processing)
        // Only process agents that have permission to proceed or yield
        if (this.config.enableLocalAvoidance && this.localAvoidance && agentDataMap.size > 0) {
            const proceedingAgents: IAvoidanceAgentData[] = [];
            const proceedingEntityIds = new Set<number>();

            for (const entity of entities) {
                const agent = entity.getComponent(NavigationAgentComponent)!;
                if (!agent.enabled) continue;

                const flowResult = this.flowController?.getFlowControl(entity.id);
                const permission = flowResult?.permission ?? PassPermission.Proceed;

                if (permission === PassPermission.Wait) {
                    // Agent must wait - move to wait position or stop
                    this.handleWaitingAgent(entity, agent, flowResult!.waitPosition, deltaTime);
                } else {
                    // Agent can proceed (with possible speed reduction for Yield)
                    const agentData = agentDataMap.get(entity.id);
                    if (agentData) {
                        // Apply speed multiplier from flow control
                        const speedMult = flowResult?.speedMultiplier ?? 1.0;
                        if (speedMult < 1.0) {
                            // Create modified agent data with scaled velocity
                            const modifiedAgentData: IAvoidanceAgentData = {
                                ...agentData,
                                preferredVelocity: {
                                    x: agentData.preferredVelocity.x * speedMult,
                                    y: agentData.preferredVelocity.y * speedMult
                                }
                            };
                            proceedingAgents.push(modifiedAgentData);
                        } else {
                            proceedingAgents.push(agentData);
                        }
                        proceedingEntityIds.add(entity.id);
                    }
                }
            }

            // Compute avoidance only for proceeding agents
            // 关键：ORCA 只处理动态障碍物，静态障碍物由路径规划处理
            // Key: ORCA only handles dynamic obstacles, static obstacles are handled by path planning
            if (proceedingAgents.length > 0) {
                const avoidanceResults = this.localAvoidance.computeBatchAvoidance(
                    proceedingAgents,
                    this.dynamicObstacles,
                    deltaTime
                );

                for (const entity of entities) {
                    if (!proceedingEntityIds.has(entity.id)) continue;

                    const agent = entity.getComponent(NavigationAgentComponent)!;
                    if (!agent.enabled) continue;

                    const result = avoidanceResults.get(entity.id);
                    if (result) {
                        this.applyAvoidanceResult(entity, agent, result.velocity, deltaTime);
                    } else {
                        const agentData = agentDataMap.get(entity.id);
                        if (agentData) {
                            this.applyAvoidanceResult(entity, agent, agentData.preferredVelocity, deltaTime);
                        }
                    }
                }
            }
        } else {
            // No avoidance, just use preferred velocity (but still respect flow control)
            for (const entity of entities) {
                const agent = entity.getComponent(NavigationAgentComponent)!;
                if (!agent.enabled) continue;

                const flowResult = this.flowController?.getFlowControl(entity.id);
                const permission = flowResult?.permission ?? PassPermission.Proceed;

                if (permission === PassPermission.Wait && this.config.enableFlowControl && this.flowController) {
                    this.handleWaitingAgent(entity, agent, flowResult!.waitPosition, deltaTime);
                } else {
                    const agentData = agentDataMap.get(entity.id);
                    if (agentData) {
                        let velocity = agentData.preferredVelocity;
                        const speedMult = flowResult?.speedMultiplier ?? 1.0;
                        if (speedMult < 1.0) {
                            velocity = {
                                x: velocity.x * speedMult,
                                y: velocity.y * speedMult
                            };
                        }
                        this.applyAvoidanceResult(entity, agent, velocity, deltaTime);
                    }
                }
            }
        }

        // Stage 4: Agent-Agent Collision Resolution
        if (this.config.enableAgentCollisionResolution && this.collisionResolver) {
            this.resolveAgentCollisions(entities);
        }

        // Cleanup enter times for removed agents
        this.cleanupEnterTimes(entities);
    }

    /**
     * @zh 处理等待中的代理
     * @en Handle waiting agent
     */
    private handleWaitingAgent(
        entity: Entity,
        agent: NavigationAgentComponent,
        waitPosition: IVector2 | null,
        deltaTime: number
    ): void {
        if (waitPosition) {
            // Move towards wait position
            const dx = waitPosition.x - agent.position.x;
            const dy = waitPosition.y - agent.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > agent.arrivalThreshold) {
                const speed = Math.min(agent.maxSpeed * 0.5, dist);
                const velocity: IVector2 = {
                    x: (dx / dist) * speed,
                    y: (dy / dist) * speed
                };
                this.applyAvoidanceResult(entity, agent, velocity, deltaTime);
            } else {
                // At wait position, stop
                agent.velocity = { x: 0, y: 0 };
            }
        } else {
            // No wait position specified, just stop
            agent.velocity = { x: 0, y: 0 };
        }
    }

    /**
     * @zh 清理已移除代理的进入时间记录
     * @en Cleanup enter times for removed agents
     */
    private cleanupEnterTimes(entities: readonly Entity[]): void {
        const activeIds = new Set(entities.map(e => e.id));
        for (const id of this.agentEnterTimes.keys()) {
            if (!activeIds.has(id)) {
                this.agentEnterTimes.delete(id);
            }
        }
    }

    /**
     * @zh 处理路径规划（同步模式）
     * @en Process path planning (synchronous mode)
     */
    private processPathPlanning(agent: NavigationAgentComponent, deltaTime: number): void {
        if (!agent.destination || agent.state === NavigationState.Arrived) {
            return;
        }

        const needsRepath =
            agent.path.length === 0 ||
            (agent.autoRepath &&
                this.currentTime - agent.lastRepathTime > agent.repathInterval);

        if (needsRepath && this.pathPlanner) {
            const result = this.pathPlanner.findPath(
                agent.position,
                agent.destination,
                { agentRadius: agent.radius }
            );

            if (result.found) {
                agent.path = result.path.map(p => ({ x: p.x, y: p.y }));
                agent.currentWaypointIndex = 0;
                agent.state = NavigationState.Navigating;
            } else {
                agent.state = NavigationState.Unreachable;
                agent.path = [];
            }

            agent.lastRepathTime = this.currentTime;
        }

        this.advanceWaypoint(agent);
    }

    /**
     * @zh 处理增量路径规划（时间切片模式）
     * @en Process incremental path planning (time slicing mode)
     *
     * @param agents - @zh 代理列表 @en Agent list
     * @param entityMap - @zh 实体 ID 到代理的映射 @en Entity ID to agent mapping
     */
    private processIncrementalPathPlanning(
        agents: Array<{ entityId: number; agent: NavigationAgentComponent }>,
        entityMap: Map<number, Entity>
    ): void {
        if (!this.pathPlanner || !this.isIncrementalPlanner) return;

        const planner = this.pathPlanner as IIncrementalPathPlanner;
        let remainingBudget = this.config.iterationsBudget;
        let processedCount = 0;

        // Step 1: Check which agents need path requests
        for (const { entityId, agent } of agents) {
            if (!agent.destination || agent.state === NavigationState.Arrived) {
                if (agent.currentRequestId >= 0) {
                    planner.cleanup(agent.currentRequestId);
                    agent.currentRequestId = -1;
                    agent.isComputingPath = false;
                }
                continue;
            }

            const needsRepath =
                !agent.isComputingPath &&
                agent.currentRequestId < 0 &&
                (agent.path.length === 0 ||
                    (agent.autoRepath &&
                        this.currentTime - agent.lastRepathTime > agent.repathInterval));

            if (needsRepath) {
                this.pendingPathRequests.add(entityId);
            }
        }

        // Step 2: Start new requests for pending agents (limited by maxAgentsPerFrame)
        const pendingArray = Array.from(this.pendingPathRequests);

        // Sort by priority (lower number = higher priority)
        pendingArray.sort((a, b) => {
            const agentA = agents.find(x => x.entityId === a);
            const agentB = agents.find(x => x.entityId === b);
            return (agentA?.agent.priority ?? 50) - (agentB?.agent.priority ?? 50);
        });

        for (const entityId of pendingArray) {
            if (processedCount >= this.config.maxAgentsPerFrame) break;

            const entry = agents.find(x => x.entityId === entityId);
            const destination = entry?.agent.destination;
            if (!entry || !destination) {
                this.pendingPathRequests.delete(entityId);
                continue;
            }

            const { agent } = entry;

            // Start new request
            const request = planner.requestPath(
                agent.position,
                destination,
                { agentRadius: agent.radius }
            );

            agent.currentRequestId = request.id;
            agent.isComputingPath = true;
            agent.pathProgress = 0;
            this.pendingPathRequests.delete(entityId);
            processedCount++;
        }

        // Step 3: Process active requests
        const activeAgents = agents.filter(x => x.agent.isComputingPath && x.agent.currentRequestId >= 0);

        // Sort by priority
        activeAgents.sort((a, b) => a.agent.priority - b.agent.priority);

        for (const { agent } of activeAgents) {
            if (remainingBudget <= 0) break;

            const iterations = Math.min(remainingBudget, this.config.maxIterationsPerAgent);
            const progress = planner.step(agent.currentRequestId, iterations);

            remainingBudget -= progress.nodesSearched;
            agent.pathProgress = progress.estimatedProgress;

            if (progress.state === PlanState.Completed) {
                const result = planner.getResult(agent.currentRequestId);
                planner.cleanup(agent.currentRequestId);

                if (result && result.found) {
                    agent.path = result.path.map(p => ({ x: p.x, y: p.y }));
                    agent.currentWaypointIndex = 0;
                    agent.state = NavigationState.Navigating;
                } else {
                    agent.state = NavigationState.Unreachable;
                    agent.path = [];
                }

                agent.currentRequestId = -1;
                agent.isComputingPath = false;
                agent.pathProgress = 0;
                agent.lastRepathTime = this.currentTime;
            } else if (progress.state === PlanState.Failed || progress.state === PlanState.Cancelled) {
                planner.cleanup(agent.currentRequestId);
                agent.state = NavigationState.Unreachable;
                agent.path = [];
                agent.currentRequestId = -1;
                agent.isComputingPath = false;
                agent.pathProgress = 0;
                agent.lastRepathTime = this.currentTime;
            }
        }

        // Step 4: Advance waypoints for all agents
        for (const { agent } of agents) {
            this.advanceWaypoint(agent);
        }
    }

    /**
     * @zh 推进路径点
     * @en Advance waypoint
     */
    private advanceWaypoint(agent: NavigationAgentComponent): void {
        while (agent.currentWaypointIndex < agent.path.length) {
            const waypoint = agent.path[agent.currentWaypointIndex]!;
            const dx = waypoint.x - agent.position.x;
            const dy = waypoint.y - agent.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < agent.waypointThreshold) {
                agent.currentWaypointIndex++;
            } else {
                break;
            }
        }
    }

    /**
     * @zh 计算首选速度
     * @en Calculate preferred velocity
     */
    private calculatePreferredVelocity(agent: NavigationAgentComponent): IVector2 {
        if (!agent.destination) {
            return { x: 0, y: 0 };
        }

        let targetX: number, targetY: number;
        let isLastWaypoint = false;

        if (agent.currentWaypointIndex < agent.path.length) {
            const waypoint = agent.path[agent.currentWaypointIndex]!;
            targetX = waypoint.x;
            targetY = waypoint.y;
            isLastWaypoint = agent.currentWaypointIndex === agent.path.length - 1;
        } else {
            targetX = agent.destination.x;
            targetY = agent.destination.y;
            isLastWaypoint = true;
        }

        const dx = targetX - agent.position.x;
        const dy = targetY - agent.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.0001) {
            return { x: 0, y: 0 };
        }

        // 只在接近最终目标时减速，中间路径点保持全速
        // Only slow down when approaching final destination, keep full speed for intermediate waypoints
        const speed = isLastWaypoint ? Math.min(agent.maxSpeed, dist) : agent.maxSpeed;
        return {
            x: (dx / dist) * speed,
            y: (dy / dist) * speed
        };
    }

    /**
     * @zh 构建代理数据
     * @en Build agent data
     */
    private buildAgentData(
        entity: Entity,
        agent: NavigationAgentComponent,
        preferredVelocity: IVector2
    ): IAvoidanceAgentData {
        return {
            id: entity.id,
            position: { x: agent.position.x, y: agent.position.y },
            velocity: { x: agent.velocity.x, y: agent.velocity.y },
            preferredVelocity,
            radius: agent.radius,
            maxSpeed: agent.maxSpeed
        };
    }

    /**
     * @zh 应用避让结果
     * @en Apply avoidance result
     */
    private applyAvoidanceResult(
        entity: Entity,
        agent: NavigationAgentComponent,
        newVelocity: IVector2,
        deltaTime: number
    ): void {
        // CollisionResolver 处理所有障碍物（静态+动态）
        // CollisionResolver handles all obstacles (static + dynamic)
        const allObstacles = this.getAllObstaclesForCollision();

        // Stage 3a: Collision Resolution (velocity validation)
        if (this.config.enableCollisionResolution && this.collisionResolver && allObstacles.length > 0) {
            newVelocity = this.collisionResolver.validateVelocity(
                agent.position,
                newVelocity,
                agent.radius,
                allObstacles,
                deltaTime
            );
        }

        // Apply smooth steering if enabled
        if (agent.smoothSteering) {
            newVelocity = this.applySmoothSteering(agent, newVelocity, deltaTime);
        }

        // Update velocity
        agent.velocity = { x: newVelocity.x, y: newVelocity.y };

        // Calculate new position
        let newPosition: IVector2 = {
            x: agent.position.x + newVelocity.x * deltaTime,
            y: agent.position.y + newVelocity.y * deltaTime
        };

        // Stage 3b: Collision Resolution (position correction)
        if (this.config.enableCollisionResolution && this.collisionResolver && allObstacles.length > 0) {
            newPosition = this.collisionResolver.resolveCollision(
                newPosition,
                agent.radius,
                allObstacles
            );
        }

        // Update position
        agent.position = newPosition;

        // Check arrival
        this.checkArrival(agent);
    }

    /**
     * @zh 应用平滑转向
     * @en Apply smooth steering
     */
    private applySmoothSteering(
        agent: NavigationAgentComponent,
        targetVelocity: IVector2,
        deltaTime: number
    ): IVector2 {
        const maxChange = agent.acceleration * deltaTime;

        const dvx = targetVelocity.x - agent.velocity.x;
        const dvy = targetVelocity.y - agent.velocity.y;
        const changeMag = Math.sqrt(dvx * dvx + dvy * dvy);

        if (changeMag <= maxChange) {
            return targetVelocity;
        }

        const factor = maxChange / changeMag;
        const newVel = {
            x: agent.velocity.x + dvx * factor,
            y: agent.velocity.y + dvy * factor
        };

        // 保持目标速度大小，避免转弯时减速
        // Maintain target speed to prevent slowdown during turns
        const targetSpeed = Math.sqrt(targetVelocity.x * targetVelocity.x + targetVelocity.y * targetVelocity.y);
        const newSpeed = Math.sqrt(newVel.x * newVel.x + newVel.y * newVel.y);
        if (newSpeed > 0.0001 && targetSpeed > 0.0001) {
            const scale = targetSpeed / newSpeed;
            newVel.x *= scale;
            newVel.y *= scale;
        }

        return newVel;
    }

    /**
     * @zh 检查是否到达目标
     * @en Check if arrived at destination
     */
    private checkArrival(agent: NavigationAgentComponent): void {
        if (!agent.destination) return;

        const dx = agent.destination.x - agent.position.x;
        const dy = agent.destination.y - agent.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < agent.arrivalThreshold) {
            agent.state = NavigationState.Arrived;
            agent.velocity = { x: 0, y: 0 };
        }
    }

    /**
     * @zh 解决代理间碰撞
     * @en Resolve agent-agent collisions
     */
    private resolveAgentCollisions(entities: readonly Entity[]): void {
        if (!this.collisionResolver) return;

        const corrections: Map<number, IVector2> = new Map();
        const activeEntities = entities.filter(e => {
            const agent = e.getComponent(NavigationAgentComponent)!;
            return agent.enabled;
        });

        for (let i = 0; i < activeEntities.length; i++) {
            for (let j = i + 1; j < activeEntities.length; j++) {
                const entityA = activeEntities[i]!;
                const entityB = activeEntities[j]!;
                const agentA = entityA.getComponent(NavigationAgentComponent)!;
                const agentB = entityB.getComponent(NavigationAgentComponent)!;

                const collision = this.collisionResolver.detectAgentCollision(
                    agentA.position,
                    agentA.radius,
                    agentB.position,
                    agentB.radius
                );

                if (collision.collided) {
                    const halfPush = (collision.penetration + 0.01) * 0.5;

                    const corrA = corrections.get(entityA.id) ?? { x: 0, y: 0 };
                    corrA.x += collision.normal.x * halfPush;
                    corrA.y += collision.normal.y * halfPush;
                    corrections.set(entityA.id, corrA);

                    const corrB = corrections.get(entityB.id) ?? { x: 0, y: 0 };
                    corrB.x -= collision.normal.x * halfPush;
                    corrB.y -= collision.normal.y * halfPush;
                    corrections.set(entityB.id, corrB);
                }
            }
        }

        const allObstacles = this.getAllObstaclesForCollision();

        for (const [entityId, correction] of corrections) {
            const entity = activeEntities.find(e => e.id === entityId);
            if (!entity) continue;

            const agent = entity.getComponent(NavigationAgentComponent)!;
            let newPosition: IVector2 = {
                x: agent.position.x + correction.x,
                y: agent.position.y + correction.y
            };

            if (allObstacles.length > 0) {
                newPosition = this.collisionResolver.resolveCollision(
                    newPosition,
                    agent.radius,
                    allObstacles
                );
            }

            agent.position = newPosition;
        }
    }
}
