/**
 * @zh 寻路系统
 * @en Pathfinding System
 */

import {
    EntitySystem,
    Matcher,
    ECSSystem,
    type Entity
} from '@esengine/ecs-framework';
import { PathfindingAgentComponent } from './PathfindingAgentComponent';
import { PathfindingMapComponent } from './PathfindingMapComponent';
import { PathfindingState } from '../core/IIncrementalPathfinding';
import type { IIncrementalPathfinder, IPathProgress } from '../core/IIncrementalPathfinding';
import { IncrementalAStarPathfinder } from '../core/IncrementalAStarPathfinder';
import { GridMap } from '../grid/GridMap';
import { LineOfSightSmoother, CatmullRomSmoother, CombinedSmoother } from '../smoothing/PathSmoother';
import { PathValidator } from '../core/PathValidator';

// =============================================================================
// 代理队列项 | Agent Queue Item
// =============================================================================

/**
 * @zh 代理队列项
 * @en Agent queue item
 */
interface AgentQueueItem {
    entity: Entity;
    component: PathfindingAgentComponent;
}

// =============================================================================
// 寻路系统 | Pathfinding System
// =============================================================================

/**
 * @zh 寻路系统
 * @en Pathfinding System
 *
 * @zh 处理所有 PathfindingAgentComponent，支持时间切片和动态重规划
 * @en Processes all PathfindingAgentComponents, supports time slicing and dynamic replanning
 *
 * @example
 * ```typescript
 * // Add system to scene
 * scene.addSystem(new PathfindingSystem());
 *
 * // Create map entity
 * const mapEntity = scene.createEntity('Map');
 * mapEntity.addComponent(new PathfindingMapComponent());
 *
 * // Create agents
 * const agent = scene.createEntity('Agent');
 * const pathAgent = agent.addComponent(new PathfindingAgentComponent());
 * pathAgent.requestPathTo(50, 50);
 *
 * // System handles pathfinding automatically each frame
 * ```
 */
@ECSSystem('Pathfinding', { updateOrder: 0 })
export class PathfindingSystem extends EntitySystem {
    private mapEntity: Entity | null = null;
    private mapComponent: PathfindingMapComponent | null = null;
    private pathValidator: PathValidator;

    private agentQueue: AgentQueueItem[] = [];
    private frameCounter: number = 0;

    constructor() {
        super(Matcher.all(PathfindingAgentComponent));
        this.pathValidator = new PathValidator();
    }

    /**
     * @zh 系统初始化
     * @en System initialization
     */
    protected onInitialize(): void {
        this.findMapEntity();
        this.initializeMap();
    }

    /**
     * @zh 系统激活时调用
     * @en Called when system is enabled
     */
    protected onEnable(): void {
        this.findMapEntity();
    }

    /**
     * @zh 处理实体
     * @en Process entities
     */
    protected process(entities: readonly Entity[]): void {
        if (!this.mapComponent?.pathfinder) {
            this.findMapEntity();
            if (!this.mapComponent?.pathfinder) {
                return;
            }
        }

        this.frameCounter++;
        this.mapComponent.resetStats();

        this.buildAgentQueue(entities);

        this.processAgentsWithBudget();

        this.validatePaths(entities);
    }

    // =========================================================================
    // 私有方法 | Private Methods
    // =========================================================================

    /**
     * @zh 查找地图实体
     * @en Find map entity
     */
    private findMapEntity(): void {
        if (!this.scene) return;

        const entities = this.scene.entities.findEntitiesWithComponent(PathfindingMapComponent);
        if (entities.length > 0) {
            const entity = entities[0]!;
            const mapComp = entity.getComponent(PathfindingMapComponent);
            if (mapComp) {
                this.mapEntity = entity;
                this.mapComponent = mapComp;

                if (!mapComp.initialized) {
                    this.initializeMap();
                }
            }
        }
    }

    /**
     * @zh 初始化地图
     * @en Initialize map
     */
    private initializeMap(): void {
        if (!this.mapComponent) return;
        if (this.mapComponent.initialized) return;

        if (!this.mapComponent.map) {
            if (this.mapComponent.mapType === 'grid') {
                this.mapComponent.map = new GridMap(
                    this.mapComponent.width,
                    this.mapComponent.height,
                    {
                        allowDiagonal: this.mapComponent.allowDiagonal,
                        avoidCorners: this.mapComponent.avoidCorners
                    }
                );
            }
        }

        if (!this.mapComponent.pathfinder && this.mapComponent.map) {
            this.mapComponent.pathfinder = new IncrementalAStarPathfinder(
                this.mapComponent.map,
                {
                    enableCache: this.mapComponent.enableCache,
                    cacheConfig: {
                        maxEntries: this.mapComponent.cacheMaxEntries,
                        ttlMs: this.mapComponent.cacheTtlMs
                    }
                }
            );
        }

        if (!this.mapComponent.smoother && this.mapComponent.enableSmoothing) {
            switch (this.mapComponent.smoothingType) {
                case 'catmullrom':
                    this.mapComponent.smoother = new CatmullRomSmoother();
                    break;
                case 'combined':
                    this.mapComponent.smoother = new CombinedSmoother();
                    break;
                case 'los':
                default:
                    this.mapComponent.smoother = new LineOfSightSmoother();
                    break;
            }
        }

        this.mapComponent.initialized = true;
    }

    /**
     * @zh 构建代理优先级队列
     * @en Build agent priority queue
     */
    private buildAgentQueue(entities: readonly Entity[]): void {
        this.agentQueue.length = 0;

        for (const entity of entities) {
            const agent = entity.getComponent(PathfindingAgentComponent);
            if (!agent) continue;

            if (!agent.hasRequest &&
                (agent.state === PathfindingState.Idle ||
                 agent.state === PathfindingState.Completed ||
                 agent.state === PathfindingState.Cancelled)) {
                continue;
            }

            this.agentQueue.push({ entity, component: agent });
        }

        this.agentQueue.sort((a, b) => a.component.priority - b.component.priority);
    }

    /**
     * @zh 使用预算处理代理
     * @en Process agents with budget
     */
    private processAgentsWithBudget(): void {
        const pathfinder = this.mapComponent!.pathfinder!;
        const maxAgents = this.mapComponent!.maxAgentsPerFrame;
        let remainingBudget = this.mapComponent!.iterationsBudget;
        let agentsProcessed = 0;

        for (const { component: agent } of this.agentQueue) {
            if (agentsProcessed >= maxAgents || remainingBudget <= 0) {
                break;
            }

            if (agent.hasRequest && agent.state === PathfindingState.Idle) {
                this.startNewRequest(agent, pathfinder);
            }

            if (agent.state === PathfindingState.InProgress) {
                const iterations = Math.min(
                    agent.maxIterationsPerFrame,
                    remainingBudget
                );

                const progress = pathfinder.step(agent.currentRequestId, iterations);
                this.updateAgentFromProgress(agent, progress, pathfinder);

                remainingBudget -= progress.nodesSearched;
                this.mapComponent!.iterationsUsedThisFrame += progress.nodesSearched;
            }

            agentsProcessed++;
        }

        this.mapComponent!.agentsProcessedThisFrame = agentsProcessed;
    }

    /**
     * @zh 启动新的寻路请求
     * @en Start new pathfinding request
     */
    private startNewRequest(
        agent: PathfindingAgentComponent,
        pathfinder: IIncrementalPathfinder
    ): void {
        if (agent.currentRequestId >= 0) {
            pathfinder.cancel(agent.currentRequestId);
            pathfinder.cleanup(agent.currentRequestId);
        }

        const request = pathfinder.requestPath(
            agent.x,
            agent.y,
            agent.targetX,
            agent.targetY,
            { priority: agent.priority }
        );

        agent.currentRequestId = request.id;
        agent.state = PathfindingState.InProgress;
        agent.hasRequest = false;
        agent.progress = 0;
        agent.path = [];
        agent.pathIndex = 0;

        this.mapComponent!.activeRequests++;
    }

    /**
     * @zh 从进度更新代理状态
     * @en Update agent state from progress
     */
    private updateAgentFromProgress(
        agent: PathfindingAgentComponent,
        progress: IPathProgress,
        pathfinder: IIncrementalPathfinder
    ): void {
        agent.state = progress.state;
        agent.progress = progress.estimatedProgress;

        agent.onPathProgress?.(progress.estimatedProgress);

        if (progress.state === PathfindingState.Completed) {
            const result = pathfinder.getResult(agent.currentRequestId);
            if (result && result.found) {
                const smoother = this.mapComponent?.smoother;
                const map = this.mapComponent?.map;

                if (smoother && map && this.mapComponent?.enableSmoothing) {
                    agent.path = smoother.smooth(result.path, map);
                } else {
                    agent.path = [...result.path];
                }

                agent.pathIndex = 0;
                agent.pathCost = result.cost;

                agent.onPathComplete?.(true, agent.path);
            } else {
                agent.path = [];
                agent.state = PathfindingState.Failed;
                agent.onPathComplete?.(false, []);
            }

            pathfinder.cleanup(agent.currentRequestId);
            this.mapComponent!.activeRequests--;
        } else if (progress.state === PathfindingState.Failed) {
            agent.path = [];
            agent.onPathComplete?.(false, []);
            pathfinder.cleanup(agent.currentRequestId);
            this.mapComponent!.activeRequests--;
        }
    }

    /**
     * @zh 周期性验证路径有效性
     * @en Periodically validate path validity
     */
    private validatePaths(entities: readonly Entity[]): void {
        const map = this.mapComponent?.map;
        if (!map) return;

        for (const entity of entities) {
            const agent = entity.getComponent(PathfindingAgentComponent);
            if (!agent || !agent.enableDynamicReplan) continue;
            if (agent.path.length === 0 || agent.isPathComplete()) continue;

            if (this.frameCounter - agent.lastValidationFrame < agent.validationInterval) {
                continue;
            }

            agent.lastValidationFrame = this.frameCounter;

            const checkEnd = Math.min(
                agent.pathIndex + agent.lookaheadDistance,
                agent.path.length
            );

            const result = this.pathValidator.validatePath(
                agent.path,
                agent.pathIndex,
                checkEnd,
                map
            );

            if (!result.valid) {
                agent.x = agent.path[agent.pathIndex]?.x ?? agent.x;
                agent.y = agent.path[agent.pathIndex]?.y ?? agent.y;
                agent.requestPathTo(agent.targetX, agent.targetY);
            }
        }
    }
}
