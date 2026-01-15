/**
 * @zh 局部避让系统
 * @en Local Avoidance System
 */

import {
    EntitySystem,
    Matcher,
    ECSSystem,
    type Entity
} from '@esengine/ecs-framework';
import { AvoidanceAgentComponent } from './AvoidanceAgentComponent';
import { AvoidanceWorldComponent } from './AvoidanceWorldComponent';
import { PathfindingAgentComponent } from './PathfindingAgentComponent';
import { ORCASolver, createORCASolver } from '../avoidance/ORCASolver';
import { KDTree, createKDTree } from '../avoidance/KDTree';
import type { IAvoidanceAgent } from '../avoidance/ILocalAvoidance';

// =============================================================================
// 局部避让系统 | Local Avoidance System
// =============================================================================

/**
 * @zh 局部避让系统
 * @en Local Avoidance System
 *
 * @zh 使用 ORCA 算法计算代理的避让速度
 * @en Uses ORCA algorithm to compute avoidance velocities for agents
 *
 * @example
 * ```typescript
 * // 添加系统到场景
 * scene.addSystem(new LocalAvoidanceSystem());
 *
 * // 创建避让世界（可选，用于静态障碍物）
 * const worldEntity = scene.createEntity('AvoidanceWorld');
 * worldEntity.addComponent(new AvoidanceWorldComponent());
 *
 * // 创建代理
 * const agent = scene.createEntity('Agent');
 * const avoidance = agent.addComponent(new AvoidanceAgentComponent());
 *
 * // 可选：同时添加寻路代理，系统会自动同步位置
 * agent.addComponent(new PathfindingAgentComponent());
 *
 * // 每帧设置首选速度（朝向目标）
 * avoidance.setPreferredVelocityTowards(targetX, targetY);
 *
 * // 系统计算后，newVelocity 会被更新
 * // 如果 autoApplyVelocity = true，velocity 也会自动更新
 * ```
 */
@ECSSystem('LocalAvoidance', { updateOrder: 50 })
export class LocalAvoidanceSystem extends EntitySystem {
    private worldEntity: Entity | null = null;
    private worldComponent: AvoidanceWorldComponent | null = null;

    private solver: ORCASolver | null = null;
    private kdTree: KDTree | null = null;

    constructor() {
        super(Matcher.all(AvoidanceAgentComponent));
    }

    /**
     * @zh 系统初始化
     * @en System initialization
     */
    protected onInitialize(): void {
        this.findWorldEntity();
        this.initializeSolver();
    }

    /**
     * @zh 系统激活时调用
     * @en Called when system is enabled
     */
    protected onEnable(): void {
        this.findWorldEntity();
    }

    /**
     * @zh 处理实体
     * @en Process entities
     */
    protected process(entities: readonly Entity[]): void {
        if (entities.length === 0) return;

        // 确保求解器已初始化
        if (!this.solver) {
            this.initializeSolver();
        }

        const startTime = performance.now();

        // 1. 收集所有代理数据
        const agents = this.collectAgentData(entities);

        // 2. 构建 KD-Tree
        this.kdTree!.build(agents);

        // 3. 获取静态障碍物
        const obstacles = this.worldComponent?.obstacles ?? [];

        // 4. 计算每个代理的新速度
        const deltaTime = this.worldComponent?.timeStep ?? (1 / 60);

        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i]!;
            const component = entity.getComponent(AvoidanceAgentComponent)!;

            if (!component.enabled) continue;

            const agent = agents[i]!;

            // 查询邻居
            const neighborResults = this.kdTree!.queryNeighbors(
                agent.position,
                agent.neighborDist,
                agent.maxNeighbors,
                agent.id
            );

            const neighbors = neighborResults.map(r => r.agent);

            // ORCA 求解
            const newVelocity = this.solver!.computeNewVelocity(
                agent,
                neighbors,
                obstacles,
                deltaTime
            );

            // 更新组件
            component.newVelocityX = newVelocity.x;
            component.newVelocityY = newVelocity.y;

            // 自动应用新速度
            if (component.autoApplyVelocity) {
                component.applyNewVelocity();
            }
        }

        // 更新统计信息
        const endTime = performance.now();
        if (this.worldComponent) {
            this.worldComponent.agentCount = entities.length;
            this.worldComponent.agentsProcessedThisFrame = entities.length;
            this.worldComponent.computeTimeMs = endTime - startTime;
        }
    }

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    /**
     * @zh 查找世界实体
     * @en Find world entity
     */
    private findWorldEntity(): void {
        if (!this.scene) return;

        const entities = this.scene.entities.findEntitiesWithComponent(AvoidanceWorldComponent);
        if (entities.length > 0) {
            const entity = entities[0]!;
            const worldComp = entity.getComponent(AvoidanceWorldComponent);
            if (worldComp) {
                this.worldEntity = entity;
                this.worldComponent = worldComp;

                // 共享求解器和 KD-Tree 到世界组件
                if (this.solver && !worldComp.solver) {
                    worldComp.solver = this.solver;
                }
                if (this.kdTree && !worldComp.kdTree) {
                    worldComp.kdTree = this.kdTree;
                }
                worldComp.initialized = true;
            }
        }
    }

    /**
     * @zh 初始化求解器
     * @en Initialize solver
     */
    private initializeSolver(): void {
        const config = this.worldComponent?.getConfig();
        this.solver = createORCASolver(config);
        this.kdTree = createKDTree();

        if (this.worldComponent) {
            this.worldComponent.solver = this.solver;
            this.worldComponent.kdTree = this.kdTree;
        }
    }

    /**
     * @zh 收集代理数据
     * @en Collect agent data
     */
    private collectAgentData(entities: readonly Entity[]): IAvoidanceAgent[] {
        const agents: IAvoidanceAgent[] = [];

        for (const entity of entities) {
            const avoidance = entity.getComponent(AvoidanceAgentComponent)!;

            // 尝试从 PathfindingAgent 同步位置
            const pathAgent = entity.getComponent(PathfindingAgentComponent);
            if (pathAgent) {
                avoidance.positionX = pathAgent.x;
                avoidance.positionY = pathAgent.y;

                // 如果有有效路径，自动设置首选速度
                const waypoint = pathAgent.getNextWaypoint();
                if (waypoint && avoidance.preferredVelocityX === 0 && avoidance.preferredVelocityY === 0) {
                    avoidance.setPreferredVelocityTowards(waypoint.x, waypoint.y);
                }
            }

            agents.push({
                id: entity.id,
                position: {
                    x: avoidance.positionX,
                    y: avoidance.positionY
                },
                velocity: {
                    x: avoidance.velocityX,
                    y: avoidance.velocityY
                },
                preferredVelocity: {
                    x: avoidance.preferredVelocityX,
                    y: avoidance.preferredVelocityY
                },
                radius: avoidance.radius,
                maxSpeed: avoidance.maxSpeed,
                neighborDist: avoidance.neighborDist,
                maxNeighbors: avoidance.maxNeighbors,
                timeHorizon: avoidance.timeHorizon,
                timeHorizonObst: avoidance.timeHorizonObst
            });
        }

        return agents;
    }
}
