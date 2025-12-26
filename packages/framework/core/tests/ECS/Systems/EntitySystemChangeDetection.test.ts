import { EntitySystem } from '../../../src/ECS/Systems/EntitySystem';
import { Entity } from '../../../src/ECS/Entity';
import { Component } from '../../../src/ECS/Component';
import { Scene } from '../../../src/ECS/Scene';
import { Matcher } from '../../../src/ECS/Utils/Matcher';
import { ECSComponent, ECSSystem } from '../../../src/ECS/Decorators';

// 测试组件
@ECSComponent('ChangeDetect_Position')
class PositionComponent extends Component {
    private _x: number;
    private _y: number;

    constructor(...args: unknown[]) {
        super();
        const [x = 0, y = 0] = args as [number?, number?];
        this._x = x;
        this._y = y;
    }

    public get x(): number {
        return this._x;
    }

    public set x(value: number) {
        this._x = value;
        // 实际使用中需要通过 entity.scene.epochManager.current 获取
        // 这里简化测试，手动调用 markDirty
    }

    public get y(): number {
        return this._y;
    }

    public set y(value: number) {
        this._y = value;
    }

    public setPosition(x: number, y: number, epoch: number): void {
        this._x = x;
        this._y = y;
        this.markDirty(epoch);
    }
}

@ECSComponent('ChangeDetect_Velocity')
class VelocityComponent extends Component {
    private _vx: number;
    private _vy: number;

    constructor(...args: unknown[]) {
        super();
        const [vx = 0, vy = 0] = args as [number?, number?];
        this._vx = vx;
        this._vy = vy;
    }

    public get vx(): number {
        return this._vx;
    }

    public get vy(): number {
        return this._vy;
    }

    public setVelocity(vx: number, vy: number, epoch: number): void {
        this._vx = vx;
        this._vy = vy;
        this.markDirty(epoch);
    }
}

@ECSComponent('ChangeDetect_Health')
class HealthComponent extends Component {
    public current: number;
    public max: number;

    constructor(...args: unknown[]) {
        super();
        const [current = 100, max = 100] = args as [number?, number?];
        this.current = current;
        this.max = max;
    }
}

// 测试系统 - 暴露 protected 方法供测试
@ECSSystem('ChangeDetectionTestSystem')
class ChangeDetectionTestSystem extends EntitySystem {
    public processedEntities: Entity[] = [];
    public changedEntities: Entity[] = [];

    constructor() {
        super(Matcher.all(PositionComponent, VelocityComponent));
    }

    protected override process(entities: readonly Entity[]): void {
        this.processedEntities = [...entities];
    }

    // 暴露 protected 方法供测试
    public testForEachChanged(
        entities: readonly Entity[],
        componentTypes: any[],
        processor: (entity: Entity, index: number) => void,
        sinceEpoch?: number
    ): void {
        this.forEachChanged(entities, componentTypes, processor, sinceEpoch);
    }

    public testFilterChanged(
        entities: readonly Entity[],
        componentTypes: any[],
        sinceEpoch?: number
    ): Entity[] {
        return this.filterChanged(entities, componentTypes, sinceEpoch);
    }

    public testHasChanged(
        entity: Entity,
        componentTypes: any[],
        sinceEpoch?: number
    ): boolean {
        return this.hasChanged(entity, componentTypes, sinceEpoch);
    }

    public testSaveEpoch(): void {
        this.saveEpoch();
    }

    public testGetLastProcessEpoch(): number {
        return this.lastProcessEpoch;
    }

    public testGetCurrentEpoch(): number {
        return this.currentEpoch;
    }
}

describe('EntitySystem 变更检测', () => {
    let scene: Scene;
    let system: ChangeDetectionTestSystem;
    let entity1: Entity;
    let entity2: Entity;
    let entity3: Entity;

    beforeEach(() => {
        scene = new Scene();
        system = new ChangeDetectionTestSystem();
        scene.addSystem(system);

        // 创建测试实体
        entity1 = scene.createEntity('entity1');
        entity1.addComponent(new PositionComponent(10, 20));
        entity1.addComponent(new VelocityComponent(1, 2));

        entity2 = scene.createEntity('entity2');
        entity2.addComponent(new PositionComponent(30, 40));
        entity2.addComponent(new VelocityComponent(3, 4));

        entity3 = scene.createEntity('entity3');
        entity3.addComponent(new PositionComponent(50, 60));
        entity3.addComponent(new VelocityComponent(5, 6));
    });

    afterEach(() => {
        scene.removeSystem(system);
        scene.end();
    });

    describe('lastProcessEpoch', () => {
        it('初始值应该是 0', () => {
            expect(system.testGetLastProcessEpoch()).toBe(0);
        });
    });

    describe('currentEpoch', () => {
        it('应该返回场景的当前 epoch', () => {
            expect(system.testGetCurrentEpoch()).toBe(scene.epochManager.current);
        });
    });

    describe('saveEpoch', () => {
        it('应该保存当前 epoch', () => {
            const currentEpoch = scene.epochManager.current;
            system.testSaveEpoch();
            expect(system.testGetLastProcessEpoch()).toBe(currentEpoch);
        });

        it('递增 epoch 后 saveEpoch 应该保存新值', () => {
            scene.epochManager.increment();
            scene.epochManager.increment();
            const currentEpoch = scene.epochManager.current;

            system.testSaveEpoch();
            expect(system.testGetLastProcessEpoch()).toBe(currentEpoch);
        });
    });

    describe('hasChanged', () => {
        it('新组件应该被检测为已变更', () => {
            // 组件的 lastWriteEpoch 默认是 0，如果检查点也是 0，则不算变更
            // 需要先保存 epoch，然后修改组件
            system.testSaveEpoch();
            scene.epochManager.increment();

            const pos = entity1.getComponent(PositionComponent)!;
            pos.setPosition(100, 200, scene.epochManager.current);

            expect(system.testHasChanged(entity1, [PositionComponent])).toBe(true);
        });

        it('未修改的组件应该不被检测为变更', () => {
            system.testSaveEpoch();
            scene.epochManager.increment();

            // entity2 的组件未被修改
            expect(system.testHasChanged(entity2, [PositionComponent])).toBe(false);
        });

        it('应该检查多个组件类型', () => {
            system.testSaveEpoch();
            scene.epochManager.increment();

            // 只修改 Velocity
            const vel = entity1.getComponent(VelocityComponent)!;
            vel.setVelocity(10, 20, scene.epochManager.current);

            // 检查 Position 和 Velocity，应该检测到变更
            expect(system.testHasChanged(entity1, [PositionComponent, VelocityComponent])).toBe(true);
        });

        it('指定 sinceEpoch 参数应该使用该值作为检查点', () => {
            const pos = entity1.getComponent(PositionComponent)!;

            // 在 epoch 5 修改组件
            scene.epochManager.increment(); // 2
            scene.epochManager.increment(); // 3
            scene.epochManager.increment(); // 4
            scene.epochManager.increment(); // 5
            pos.setPosition(100, 200, 5);

            // 检查 epoch 4 之后的变更 - 应该检测到
            expect(system.testHasChanged(entity1, [PositionComponent], 4)).toBe(true);

            // 检查 epoch 5 之后的变更 - 不应该检测到
            expect(system.testHasChanged(entity1, [PositionComponent], 5)).toBe(false);
        });
    });

    describe('filterChanged', () => {
        it('应该返回有变更的实体', () => {
            system.testSaveEpoch();
            scene.epochManager.increment();

            // 只修改 entity1
            const pos1 = entity1.getComponent(PositionComponent)!;
            pos1.setPosition(100, 200, scene.epochManager.current);

            const entities = [entity1, entity2, entity3];
            const changed = system.testFilterChanged(entities, [PositionComponent]);

            expect(changed).toHaveLength(1);
            expect(changed[0]).toBe(entity1);
        });

        it('应该返回空数组当没有变更时', () => {
            system.testSaveEpoch();
            scene.epochManager.increment();

            // 没有修改任何组件
            const entities = [entity1, entity2, entity3];
            const changed = system.testFilterChanged(entities, [PositionComponent]);

            expect(changed).toHaveLength(0);
        });

        it('应该返回所有变更的实体', () => {
            system.testSaveEpoch();
            scene.epochManager.increment();

            // 修改 entity1 和 entity3
            const pos1 = entity1.getComponent(PositionComponent)!;
            pos1.setPosition(100, 200, scene.epochManager.current);

            const pos3 = entity3.getComponent(PositionComponent)!;
            pos3.setPosition(500, 600, scene.epochManager.current);

            const entities = [entity1, entity2, entity3];
            const changed = system.testFilterChanged(entities, [PositionComponent]);

            expect(changed).toHaveLength(2);
            expect(changed).toContain(entity1);
            expect(changed).toContain(entity3);
        });
    });

    describe('forEachChanged', () => {
        it('应该只遍历有变更的实体', () => {
            system.testSaveEpoch();
            scene.epochManager.increment();

            // 只修改 entity2
            const pos2 = entity2.getComponent(PositionComponent)!;
            pos2.setPosition(300, 400, scene.epochManager.current);

            const entities = [entity1, entity2, entity3];
            const processed: Entity[] = [];

            system.testForEachChanged(entities, [PositionComponent], (entity) => {
                processed.push(entity);
            });

            expect(processed).toHaveLength(1);
            expect(processed[0]).toBe(entity2);
        });

        it('应该自动更新 lastProcessEpoch', () => {
            system.testSaveEpoch();
            const savedEpoch = system.testGetLastProcessEpoch();

            scene.epochManager.increment();
            const currentEpoch = scene.epochManager.current;

            const entities = [entity1, entity2];
            system.testForEachChanged(entities, [PositionComponent], () => {});

            // forEachChanged 应该更新 lastProcessEpoch
            expect(system.testGetLastProcessEpoch()).toBe(currentEpoch);
            expect(system.testGetLastProcessEpoch()).toBeGreaterThan(savedEpoch);
        });

        it('指定 sinceEpoch 时不应该影响自动更新', () => {
            scene.epochManager.increment();
            scene.epochManager.increment();

            const entities = [entity1];
            system.testForEachChanged(entities, [PositionComponent], () => {}, 0);

            // 应该更新到当前 epoch
            expect(system.testGetLastProcessEpoch()).toBe(scene.epochManager.current);
        });
    });

    describe('实际使用场景', () => {
        it('应该支持增量更新模式', () => {
            // 模拟第一帧
            scene.update();

            // 保存检查点
            system.testSaveEpoch();
            const checkpoint = system.testGetLastProcessEpoch();

            // 模拟第二帧 - 修改一个实体
            scene.epochManager.increment();
            const pos1 = entity1.getComponent(PositionComponent)!;
            pos1.setPosition(100, 200, scene.epochManager.current);

            // 只处理变更的实体
            const changed = system.testFilterChanged(system.entities, [PositionComponent]);
            expect(changed).toHaveLength(1);
            expect(changed[0]).toBe(entity1);

            // 更新检查点
            system.testSaveEpoch();

            // 模拟第三帧 - 没有修改
            scene.epochManager.increment();

            // 不应该有变更
            const noChanges = system.testFilterChanged(system.entities, [PositionComponent]);
            expect(noChanges).toHaveLength(0);
        });

        it('应该正确处理多次变更', () => {
            system.testSaveEpoch();

            // 第一次变更
            scene.epochManager.increment();
            const pos1 = entity1.getComponent(PositionComponent)!;
            pos1.setPosition(100, 200, scene.epochManager.current);

            let changed = system.testFilterChanged(system.entities, [PositionComponent]);
            expect(changed).toContain(entity1);

            // 更新检查点
            system.testSaveEpoch();

            // 第二次变更 - 不同实体
            scene.epochManager.increment();
            const pos2 = entity2.getComponent(PositionComponent)!;
            pos2.setPosition(300, 400, scene.epochManager.current);

            changed = system.testFilterChanged(system.entities, [PositionComponent]);
            expect(changed).not.toContain(entity1);
            expect(changed).toContain(entity2);
        });
    });

    describe('边界情况', () => {
        it('空实体列表应该正常处理', () => {
            const processed: Entity[] = [];
            system.testForEachChanged([], [PositionComponent], (entity) => {
                processed.push(entity);
            });
            expect(processed).toHaveLength(0);
        });

        it('空组件类型列表应该不检测到任何变更', () => {
            system.testSaveEpoch();
            scene.epochManager.increment();

            const pos1 = entity1.getComponent(PositionComponent)!;
            pos1.setPosition(100, 200, scene.epochManager.current);

            // 空组件类型列表
            const changed = system.testFilterChanged(system.entities, []);
            expect(changed).toHaveLength(0);
        });

        it('实体缺少指定组件时应该跳过', () => {
            // 创建一个只有 Position 的实体
            const entityWithoutVelocity = scene.createEntity('noVel');
            entityWithoutVelocity.addComponent(new PositionComponent(70, 80));

            system.testSaveEpoch();
            scene.epochManager.increment();

            // 修改该实体的 Position
            const pos = entityWithoutVelocity.getComponent(PositionComponent)!;
            pos.setPosition(100, 200, scene.epochManager.current);

            // 检查 Velocity 变更 - 该实体没有 Velocity，应该不被检测
            const entities = [entityWithoutVelocity];
            const changed = system.testFilterChanged(entities, [VelocityComponent]);
            expect(changed).toHaveLength(0);
        });
    });
});

describe('Component.markDirty', () => {
    let scene: Scene;

    beforeEach(() => {
        scene = new Scene();
    });

    afterEach(() => {
        scene.end();
    });

    it('应该更新 lastWriteEpoch', () => {
        const entity = scene.createEntity('test');
        const pos = entity.addComponent(new PositionComponent(10, 20));

        expect(pos.lastWriteEpoch).toBe(0);

        pos.markDirty(5);
        expect(pos.lastWriteEpoch).toBe(5);

        pos.markDirty(10);
        expect(pos.lastWriteEpoch).toBe(10);
    });
});
