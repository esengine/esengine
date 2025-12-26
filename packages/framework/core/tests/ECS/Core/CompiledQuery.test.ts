import { CompiledQuery } from '../../../src/ECS/Core/Query/CompiledQuery';
import { Scene } from '../../../src/ECS/Scene';
import { Entity } from '../../../src/ECS/Entity';
import { Component } from '../../../src/ECS/Component';
import { ECSComponent } from '../../../src/ECS/Decorators';

// 测试组件
@ECSComponent('CompiledQuery_Position')
class PositionComponent extends Component {
    public x: number;
    public y: number;

    constructor(...args: unknown[]) {
        super();
        const [x = 0, y = 0] = args as [number?, number?];
        this.x = x;
        this.y = y;
    }
}

@ECSComponent('CompiledQuery_Velocity')
class VelocityComponent extends Component {
    public vx: number;
    public vy: number;

    constructor(...args: unknown[]) {
        super();
        const [vx = 0, vy = 0] = args as [number?, number?];
        this.vx = vx;
        this.vy = vy;
    }
}

@ECSComponent('CompiledQuery_Health')
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

describe('CompiledQuery', () => {
    let scene: Scene;

    beforeEach(() => {
        scene = new Scene();
    });

    afterEach(() => {
        scene.end();
    });

    describe('创建和基本属性', () => {
        it('应该能通过 QuerySystem.compile 创建', () => {
            const query = scene.querySystem.compile(PositionComponent);
            expect(query).toBeInstanceOf(CompiledQuery);
        });

        it('应该保存组件类型列表', () => {
            const query = scene.querySystem.compile(PositionComponent, VelocityComponent);
            expect(query.componentTypes).toContain(PositionComponent);
            expect(query.componentTypes).toContain(VelocityComponent);
        });
    });

    describe('entities 属性', () => {
        it('初始应该返回空数组', () => {
            const query = scene.querySystem.compile(PositionComponent);
            expect(query.entities).toHaveLength(0);
        });

        it('应该返回匹配的实体', () => {
            const entity = scene.createEntity('test');
            entity.addComponent(new PositionComponent(10, 20));

            const query = scene.querySystem.compile(PositionComponent);
            expect(query.entities).toHaveLength(1);
            expect(query.entities[0]).toBe(entity);
        });

        it('应该只返回拥有所有组件的实体', () => {
            const entity1 = scene.createEntity('entity1');
            entity1.addComponent(new PositionComponent());
            entity1.addComponent(new VelocityComponent());

            const entity2 = scene.createEntity('entity2');
            entity2.addComponent(new PositionComponent());
            // entity2 没有 VelocityComponent

            const query = scene.querySystem.compile(PositionComponent, VelocityComponent);
            expect(query.entities).toHaveLength(1);
            expect(query.entities[0]).toBe(entity1);
        });
    });

    describe('count 属性', () => {
        it('应该返回匹配实体的数量', () => {
            const query = scene.querySystem.compile(PositionComponent);
            expect(query.count).toBe(0);

            const entity = scene.createEntity('test');
            entity.addComponent(new PositionComponent());

            expect(query.count).toBe(1);
        });
    });

    describe('forEach', () => {
        it('应该遍历所有匹配的实体', () => {
            const entity1 = scene.createEntity('entity1');
            entity1.addComponent(new PositionComponent(10, 20));

            const entity2 = scene.createEntity('entity2');
            entity2.addComponent(new PositionComponent(30, 40));

            const query = scene.querySystem.compile(PositionComponent);
            const visited: Entity[] = [];

            query.forEach((entity, pos) => {
                visited.push(entity);
            });

            expect(visited).toHaveLength(2);
            expect(visited).toContain(entity1);
            expect(visited).toContain(entity2);
        });

        it('应该提供类型安全的组件参数', () => {
            const entity = scene.createEntity('test');
            entity.addComponent(new PositionComponent(10, 20));
            entity.addComponent(new VelocityComponent(1, 2));

            const query = scene.querySystem.compile(PositionComponent, VelocityComponent);

            query.forEach((entity, pos, vel) => {
                expect(pos.x).toBe(10);
                expect(pos.y).toBe(20);
                expect(vel.vx).toBe(1);
                expect(vel.vy).toBe(2);
            });
        });
    });

    describe('forEachChanged', () => {
        it('应该只遍历变更的实体', () => {
            const entity1 = scene.createEntity('entity1');
            const pos1 = entity1.addComponent(new PositionComponent(10, 20));

            const entity2 = scene.createEntity('entity2');
            const pos2 = entity2.addComponent(new PositionComponent(30, 40));

            const query = scene.querySystem.compile(PositionComponent);

            // 获取当前 epoch
            const epoch = scene.epochManager.current;

            // 递增 epoch
            scene.epochManager.increment();

            // 只标记 entity1 的组件为已修改
            pos1.markDirty(scene.epochManager.current);

            const changed: Entity[] = [];
            query.forEachChanged(epoch, (entity, pos) => {
                changed.push(entity);
            });

            expect(changed).toHaveLength(1);
            expect(changed[0]).toBe(entity1);
        });

        it('当所有组件都未变更时应该不遍历任何实体', () => {
            const entity = scene.createEntity('test');
            entity.addComponent(new PositionComponent(10, 20));

            const query = scene.querySystem.compile(PositionComponent);

            // 使用当前 epoch 检查 - 组件的 epoch 应该小于等于当前
            const futureEpoch = scene.epochManager.current + 100;

            const changed: Entity[] = [];
            query.forEachChanged(futureEpoch, (entity, pos) => {
                changed.push(entity);
            });

            expect(changed).toHaveLength(0);
        });
    });

    describe('first', () => {
        it('应该返回第一个匹配的实体和组件', () => {
            const entity = scene.createEntity('test');
            entity.addComponent(new PositionComponent(10, 20));

            const query = scene.querySystem.compile(PositionComponent);
            const result = query.first();

            expect(result).not.toBeNull();
            expect(result![0]).toBe(entity);
            expect(result![1].x).toBe(10);
            expect(result![1].y).toBe(20);
        });

        it('没有匹配实体时应该返回 null', () => {
            const query = scene.querySystem.compile(PositionComponent);
            const result = query.first();

            expect(result).toBeNull();
        });
    });

    describe('toArray', () => {
        it('应该返回实体和组件的数组', () => {
            const entity1 = scene.createEntity('entity1');
            entity1.addComponent(new PositionComponent(10, 20));

            const entity2 = scene.createEntity('entity2');
            entity2.addComponent(new PositionComponent(30, 40));

            const query = scene.querySystem.compile(PositionComponent);
            const result = query.toArray();

            expect(result).toHaveLength(2);
            expect(result[0]![0]).toBe(entity1);
            expect(result[0]![1].x).toBe(10);
        });
    });

    describe('map', () => {
        it('应该映射转换实体数据', () => {
            const entity1 = scene.createEntity('entity1');
            entity1.addComponent(new PositionComponent(10, 20));

            const entity2 = scene.createEntity('entity2');
            entity2.addComponent(new PositionComponent(30, 40));

            const query = scene.querySystem.compile(PositionComponent);
            const result = query.map((entity, pos) => pos.x + pos.y);

            expect(result).toHaveLength(2);
            expect(result).toContain(30); // 10 + 20
            expect(result).toContain(70); // 30 + 40
        });
    });

    describe('filter', () => {
        it('应该过滤实体', () => {
            const entity1 = scene.createEntity('entity1');
            entity1.addComponent(new PositionComponent(10, 20));

            const entity2 = scene.createEntity('entity2');
            entity2.addComponent(new PositionComponent(30, 40));

            const query = scene.querySystem.compile(PositionComponent);
            const result = query.filter((entity, pos) => pos.x > 20);

            expect(result).toHaveLength(1);
            expect(result[0]).toBe(entity2);
        });
    });

    describe('find', () => {
        it('应该找到第一个满足条件的实体', () => {
            const entity1 = scene.createEntity('entity1');
            entity1.addComponent(new PositionComponent(10, 20));

            const entity2 = scene.createEntity('entity2');
            entity2.addComponent(new PositionComponent(30, 40));

            const query = scene.querySystem.compile(PositionComponent);
            const result = query.find((entity, pos) => pos.x > 20);

            expect(result).toBe(entity2);
        });

        it('找不到时应该返回 undefined', () => {
            const entity = scene.createEntity('test');
            entity.addComponent(new PositionComponent(10, 20));

            const query = scene.querySystem.compile(PositionComponent);
            const result = query.find((entity, pos) => pos.x > 100);

            expect(result).toBeUndefined();
        });
    });

    describe('any', () => {
        it('有匹配实体时应该返回 true', () => {
            const entity = scene.createEntity('test');
            entity.addComponent(new PositionComponent());

            const query = scene.querySystem.compile(PositionComponent);
            expect(query.any()).toBe(true);
        });

        it('没有匹配实体时应该返回 false', () => {
            const query = scene.querySystem.compile(PositionComponent);
            expect(query.any()).toBe(false);
        });
    });

    describe('empty', () => {
        it('没有匹配实体时应该返回 true', () => {
            const query = scene.querySystem.compile(PositionComponent);
            expect(query.empty()).toBe(true);
        });

        it('有匹配实体时应该返回 false', () => {
            const entity = scene.createEntity('test');
            entity.addComponent(new PositionComponent());

            const query = scene.querySystem.compile(PositionComponent);
            expect(query.empty()).toBe(false);
        });
    });

    describe('缓存机制', () => {
        it('应该缓存查询结果', () => {
            const entity = scene.createEntity('test');
            entity.addComponent(new PositionComponent());

            const query = scene.querySystem.compile(PositionComponent);

            // 第一次访问
            const entities1 = query.entities;
            // 第二次访问
            const entities2 = query.entities;

            // 应该返回相同的缓存数组
            expect(entities1).toBe(entities2);
        });

        it('当实体变化时应该刷新缓存', () => {
            const query = scene.querySystem.compile(PositionComponent);

            // 初始为空
            expect(query.count).toBe(0);

            // 添加实体
            const entity = scene.createEntity('test');
            entity.addComponent(new PositionComponent());

            // 应该检测到变化
            expect(query.count).toBe(1);
        });
    });

    describe('多组件查询', () => {
        it('应该支持多组件查询', () => {
            const entity = scene.createEntity('test');
            entity.addComponent(new PositionComponent(10, 20));
            entity.addComponent(new VelocityComponent(1, 2));
            entity.addComponent(new HealthComponent(80, 100));

            const query = scene.querySystem.compile(
                PositionComponent,
                VelocityComponent,
                HealthComponent
            );

            query.forEach((entity, pos, vel, health) => {
                expect(pos.x).toBe(10);
                expect(vel.vx).toBe(1);
                expect(health.current).toBe(80);
            });
        });
    });
});
