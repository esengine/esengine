import { Component } from '../../../src/ECS/Component';
import { GlobalComponentRegistry } from '../../../src/ECS/Core/ComponentStorage/ComponentRegistry';
import { Entity } from '../../../src/ECS/Entity';
import { Scene } from '../../../src/ECS/Scene';

describe('ComponentRegistry Extended - 64+ 组件支持', () => {
    // 组件类缓存 | Component class cache
    const componentClassCache = new Map<number, any>();

    beforeEach(() => {
        GlobalComponentRegistry.reset();
        componentClassCache.clear();
    });

    afterEach(() => {
        GlobalComponentRegistry.reset();
        componentClassCache.clear();
    });

    // 动态创建或获取缓存的组件类
    function createTestComponent(index: number) {
        if (componentClassCache.has(index)) {
            return componentClassCache.get(index);
        }

        class TestComponent extends Component {
            static readonly typeName = `TestComponent${index}`;
            public value: number = index;
        }

        componentClassCache.set(index, TestComponent);
        return TestComponent;
    }

    describe('扩展组件注册', () => {
        it('应该能够注册超过 64 个组件类型', () => {
            const componentTypes: any[] = [];

            // 注册 100 个组件类型
            for (let i = 0; i < 100; i++) {
                const ComponentClass = createTestComponent(i);
                const bitIndex = GlobalComponentRegistry.register(ComponentClass);
                componentTypes.push(ComponentClass);

                expect(bitIndex).toBe(i);
                expect(GlobalComponentRegistry.isRegistered(ComponentClass)).toBe(true);
            }

            expect(componentTypes.length).toBe(100);
        });

        it('应该能够获取超过 64 索引的组件位掩码', () => {
            // 注册 80 个组件
            for (let i = 0; i < 80; i++) {
                const ComponentClass = createTestComponent(i);
                GlobalComponentRegistry.register(ComponentClass);
            }

            // 验证第 70 个组件的位掩码
            const Component70 = createTestComponent(70);
            GlobalComponentRegistry.register(Component70);

            const bitMask = GlobalComponentRegistry.getBitMask(Component70);
            expect(bitMask).toBeDefined();
            expect(bitMask.segments).toBeDefined(); // 应该有扩展段
            expect(bitMask.segments!.length).toBeGreaterThan(0);
        });

        it('应该支持超过 1000 个组件类型（无限制）', () => {
            // 注册 1500 个组件验证无限制
            for (let i = 0; i < 1500; i++) {
                const ComponentClass = createTestComponent(i);
                const bitIndex = GlobalComponentRegistry.register(ComponentClass);
                expect(bitIndex).toBe(i);
            }

            expect(GlobalComponentRegistry.getRegisteredCount()).toBe(1500);
        });

    });

    describe('Entity 扩展组件支持', () => {
        let scene: Scene;
        let entity: Entity;

        beforeEach(() => {
            scene = new Scene();
            entity = scene.createEntity('TestEntity');
        });

        it('应该能够添加和获取超过 64 个组件', () => {
            const componentTypes: any[] = [];
            const components: any[] = [];

            // 添加 80 个组件 | Add 80 components
            // 需要同时注册到 GlobalComponentRegistry（ArchetypeSystem 使用）和 Scene registry
            // Need to register to both GlobalComponentRegistry (used by ArchetypeSystem) and Scene registry
            for (let i = 0; i < 80; i++) {
                const ComponentClass = createTestComponent(i);
                GlobalComponentRegistry.register(ComponentClass);
                scene.componentRegistry.register(ComponentClass);
                componentTypes.push(ComponentClass);

                const component = new ComponentClass();
                entity.addComponent(component);
                components.push(component);
            }

            // 验证所有组件都能获取
            for (let i = 0; i < 80; i++) {
                const ComponentClass = componentTypes[i];
                const retrieved = entity.getComponent(ComponentClass);

                expect(retrieved).toBeDefined();
                expect(retrieved).toBe(components[i]);
                expect((retrieved as any).value).toBe(i);
            }
        });

        it('应该能够正确检查超过 64 个组件的存在性', () => {
            // 添加组件 0-79 | Add components 0-79
            for (let i = 0; i < 80; i++) {
                const ComponentClass = createTestComponent(i);
                GlobalComponentRegistry.register(ComponentClass);
                scene.componentRegistry.register(ComponentClass);
                entity.addComponent(new ComponentClass());
            }

            // 验证 hasComponent 对所有组件都工作 | Verify hasComponent works for all
            for (let i = 0; i < 80; i++) {
                const ComponentClass = createTestComponent(i);
                expect(entity.hasComponent(ComponentClass)).toBe(true);
            }

            // 验证不存在的组件 | Verify non-existent component
            const NonExistentComponent = createTestComponent(999);
            GlobalComponentRegistry.register(NonExistentComponent);
            scene.componentRegistry.register(NonExistentComponent);
            expect(entity.hasComponent(NonExistentComponent)).toBe(false);
        });

        it('应该能够移除超过 64 索引的组件', () => {
            const componentTypes: any[] = [];

            // 添加 80 个组件 | Add 80 components
            for (let i = 0; i < 80; i++) {
                const ComponentClass = createTestComponent(i);
                GlobalComponentRegistry.register(ComponentClass);
                scene.componentRegistry.register(ComponentClass);
                componentTypes.push(ComponentClass);
                entity.addComponent(new ComponentClass());
            }

            // 移除第 70 个组件
            const Component70 = componentTypes[70];
            const component70 = entity.getComponent(Component70);
            expect(component70).toBeDefined();

            entity.removeComponent(component70!);

            // 验证已移除
            expect(entity.hasComponent(Component70)).toBe(false);
            expect(entity.getComponent(Component70)).toBeNull();

            // 验证其他组件仍然存在
            expect(entity.hasComponent(componentTypes[69])).toBe(true);
            expect(entity.hasComponent(componentTypes[71])).toBe(true);
        });

        it('应该能够正确遍历超过 64 个组件', () => {
            // 添加 80 个组件 | Add 80 components
            for (let i = 0; i < 80; i++) {
                const ComponentClass = createTestComponent(i);
                GlobalComponentRegistry.register(ComponentClass);
                scene.componentRegistry.register(ComponentClass);
                entity.addComponent(new ComponentClass());
            }

            const components = entity.components;
            expect(components.length).toBe(80);

            // 验证组件值
            const values = components.map((c: any) => c.value).sort((a, b) => a - b);
            for (let i = 0; i < 80; i++) {
                expect(values[i]).toBe(i);
            }
        });
    });

    describe('热更新模式', () => {
        it('默认应该禁用热更新模式', () => {
            expect(GlobalComponentRegistry.isHotReloadEnabled()).toBe(false);
        });

        it('应该能够启用和禁用热更新模式', () => {
            expect(GlobalComponentRegistry.isHotReloadEnabled()).toBe(false);

            GlobalComponentRegistry.enableHotReload();
            expect(GlobalComponentRegistry.isHotReloadEnabled()).toBe(true);

            GlobalComponentRegistry.disableHotReload();
            expect(GlobalComponentRegistry.isHotReloadEnabled()).toBe(false);
        });

        it('reset 应该重置热更新模式为禁用', () => {
            GlobalComponentRegistry.enableHotReload();
            expect(GlobalComponentRegistry.isHotReloadEnabled()).toBe(true);

            GlobalComponentRegistry.reset();
            expect(GlobalComponentRegistry.isHotReloadEnabled()).toBe(false);
        });

        it('启用热更新时应该替换同名组件类', () => {
            GlobalComponentRegistry.enableHotReload();

            // 模拟热更新场景：两个不同的类但有相同的 constructor.name
            // Simulate hot reload: two different classes with same constructor.name
            const createHotReloadComponent = (version: number) => {
                // 使用 eval 创建具有相同名称的类
                // Use function constructor to create classes with same name
                const cls = (new Function('Component', `
                    return class HotReloadTestComponent extends Component {
                        constructor() {
                            super();
                            this.version = ${version};
                        }
                    }
                `))(Component);
                return cls;
            };

            const TestComponentV1 = createHotReloadComponent(1);
            const TestComponentV2 = createHotReloadComponent(2);

            // 确保两个类名相同但不是同一个类
            expect(TestComponentV1.name).toBe(TestComponentV2.name);
            expect(TestComponentV1).not.toBe(TestComponentV2);

            const index1 = GlobalComponentRegistry.register(TestComponentV1);
            const index2 = GlobalComponentRegistry.register(TestComponentV2);

            // 应该复用相同的 bitIndex
            expect(index1).toBe(index2);

            // 新类应该替换旧类
            expect(GlobalComponentRegistry.isRegistered(TestComponentV2)).toBe(true);
            expect(GlobalComponentRegistry.isRegistered(TestComponentV1)).toBe(false);
        });

        it('禁用热更新时不应该替换同名组件类', () => {
            // 确保热更新被禁用
            GlobalComponentRegistry.disableHotReload();

            // 创建两个同名组件
            // Create two classes with same constructor.name
            const createNoHotReloadComponent = (id: number) => {
                const cls = (new Function('Component', `
                    return class NoHotReloadComponent extends Component {
                        constructor() {
                            super();
                            this.id = ${id};
                        }
                    }
                `))(Component);
                return cls;
            };

            const TestCompA = createNoHotReloadComponent(1);
            const TestCompB = createNoHotReloadComponent(2);

            // 确保两个类名相同但不是同一个类
            expect(TestCompA.name).toBe(TestCompB.name);
            expect(TestCompA).not.toBe(TestCompB);

            const index1 = GlobalComponentRegistry.register(TestCompA);
            const index2 = GlobalComponentRegistry.register(TestCompB);

            // 应该分配不同的 bitIndex（因为热更新被禁用）
            expect(index2).toBe(index1 + 1);

            // 两个类都应该被注册
            expect(GlobalComponentRegistry.isRegistered(TestCompA)).toBe(true);
            expect(GlobalComponentRegistry.isRegistered(TestCompB)).toBe(true);
        });
    });

    describe('边界情况', () => {
        it('应该正确处理第 64 个组件（边界）', () => {
            const scene = new Scene();
            const entity = scene.createEntity('TestEntity');

            // 注册 65 个组件（跨越 64 位边界）| Register 65 components (crossing 64-bit boundary)
            for (let i = 0; i < 65; i++) {
                const ComponentClass = createTestComponent(i);
                GlobalComponentRegistry.register(ComponentClass);
                scene.componentRegistry.register(ComponentClass);
                entity.addComponent(new ComponentClass());
            }

            // 验证第 63, 64, 65 个组件 | Verify components 63, 64
            const Component63 = createTestComponent(63);
            const Component64 = createTestComponent(64);

            expect(entity.hasComponent(Component63)).toBe(true);
            expect(entity.hasComponent(Component64)).toBe(true);
        });

        it('应该在组件缓存重建时正确处理扩展位', () => {
            const scene = new Scene();
            const entity = scene.createEntity('TestEntity');

            // 添加 80 个组件 | Add 80 components
            for (let i = 0; i < 80; i++) {
                const ComponentClass = createTestComponent(i);
                GlobalComponentRegistry.register(ComponentClass);
                scene.componentRegistry.register(ComponentClass);
                entity.addComponent(new ComponentClass());
            }

            // 强制重建缓存（通过访问 components）| Force cache rebuild
            const components1 = entity.components;
            expect(components1.length).toBe(80);

            // 添加更多组件 | Add more components
            for (let i = 80; i < 90; i++) {
                const ComponentClass = createTestComponent(i);
                GlobalComponentRegistry.register(ComponentClass);
                scene.componentRegistry.register(ComponentClass);
                entity.addComponent(new ComponentClass());
            }

            // 重新获取组件数组（应该重建缓存）| Re-get component array (should rebuild cache)
            const components2 = entity.components;
            expect(components2.length).toBe(90);
        });
    });
});