import {
    makeHandle,
    indexOf,
    genOf,
    isValidHandle,
    handleEquals,
    handleToString,
    NULL_HANDLE,
    INDEX_BITS,
    GEN_BITS,
    INDEX_MASK,
    GEN_MASK,
    MAX_ENTITIES,
    MAX_GENERATION,
    EntityHandle
} from '../../../src/ECS/Core/EntityHandle';
import { EntityHandleManager } from '../../../src/ECS/Core/EntityHandleManager';

describe('EntityHandle', () => {
    describe('常量定义', () => {
        it('INDEX_BITS 应该是 28', () => {
            expect(INDEX_BITS).toBe(28);
        });

        it('GEN_BITS 应该是 20', () => {
            expect(GEN_BITS).toBe(20);
        });

        it('INDEX_MASK 应该正确', () => {
            expect(INDEX_MASK).toBe((1 << INDEX_BITS) - 1);
        });

        it('GEN_MASK 应该正确', () => {
            expect(GEN_MASK).toBe((1 << GEN_BITS) - 1);
        });

        it('MAX_ENTITIES 应该是 2^28', () => {
            expect(MAX_ENTITIES).toBe(1 << INDEX_BITS);
        });

        it('MAX_GENERATION 应该是 2^20', () => {
            expect(MAX_GENERATION).toBe(1 << GEN_BITS);
        });

        it('NULL_HANDLE 应该是 0', () => {
            expect(NULL_HANDLE).toBe(0);
        });
    });

    describe('makeHandle', () => {
        it('应该正确组合 index 和 generation', () => {
            const handle = makeHandle(100, 5);
            expect(indexOf(handle)).toBe(100);
            expect(genOf(handle)).toBe(5);
        });

        it('应该处理边界值', () => {
            // 最小值
            const minHandle = makeHandle(0, 0);
            expect(indexOf(minHandle)).toBe(0);
            expect(genOf(minHandle)).toBe(0);

            // 最大 index
            const maxIndexHandle = makeHandle(INDEX_MASK, 0);
            expect(indexOf(maxIndexHandle)).toBe(INDEX_MASK);

            // 最大 generation
            const maxGenHandle = makeHandle(0, GEN_MASK);
            expect(genOf(maxGenHandle)).toBe(GEN_MASK);
        });

        it('应该正确处理大数值', () => {
            const largeIndex = 1000000;
            const largeGen = 500;
            const handle = makeHandle(largeIndex, largeGen);

            expect(indexOf(handle)).toBe(largeIndex);
            expect(genOf(handle)).toBe(largeGen);
        });
    });

    describe('indexOf', () => {
        it('应该正确提取 index', () => {
            const handle = makeHandle(12345, 67);
            expect(indexOf(handle)).toBe(12345);
        });

        it('应该对 NULL_HANDLE 返回 0', () => {
            expect(indexOf(NULL_HANDLE)).toBe(0);
        });
    });

    describe('genOf', () => {
        it('应该正确提取 generation', () => {
            const handle = makeHandle(12345, 67);
            expect(genOf(handle)).toBe(67);
        });

        it('应该对 NULL_HANDLE 返回 0', () => {
            expect(genOf(NULL_HANDLE)).toBe(0);
        });
    });

    describe('isValidHandle', () => {
        it('应该判断 NULL_HANDLE 为无效', () => {
            expect(isValidHandle(NULL_HANDLE)).toBe(false);
        });

        it('应该判断非零句柄为有效', () => {
            const handle = makeHandle(1, 0);
            expect(isValidHandle(handle)).toBe(true);
        });

        it('应该判断带 generation 的句柄为有效', () => {
            const handle = makeHandle(0, 1);
            expect(isValidHandle(handle)).toBe(true);
        });
    });

    describe('handleEquals', () => {
        it('应该正确比较相同句柄', () => {
            const handle1 = makeHandle(100, 5);
            const handle2 = makeHandle(100, 5);
            expect(handleEquals(handle1, handle2)).toBe(true);
        });

        it('应该正确比较不同句柄', () => {
            const handle1 = makeHandle(100, 5);
            const handle2 = makeHandle(100, 6);
            expect(handleEquals(handle1, handle2)).toBe(false);
        });

        it('应该区分 index 不同的句柄', () => {
            const handle1 = makeHandle(100, 5);
            const handle2 = makeHandle(101, 5);
            expect(handleEquals(handle1, handle2)).toBe(false);
        });
    });

    describe('handleToString', () => {
        it('应该返回可读的字符串格式', () => {
            const handle = makeHandle(100, 5);
            const str = handleToString(handle);
            expect(str).toContain('100');
            expect(str).toContain('5');
        });

        it('应该对 NULL_HANDLE 返回特殊标记', () => {
            const str = handleToString(NULL_HANDLE);
            expect(str.toLowerCase()).toContain('null');
        });
    });
});

describe('EntityHandleManager', () => {
    let manager: EntityHandleManager;

    beforeEach(() => {
        manager = new EntityHandleManager();
    });

    describe('create', () => {
        it('应该创建有效的句柄', () => {
            const handle = manager.create();
            expect(isValidHandle(handle)).toBe(true);
        });

        it('应该创建不同的句柄', () => {
            const handle1 = manager.create();
            const handle2 = manager.create();
            expect(handleEquals(handle1, handle2)).toBe(false);
        });

        it('应该递增 index', () => {
            const handle1 = manager.create();
            const handle2 = manager.create();
            expect(indexOf(handle2)).toBe(indexOf(handle1) + 1);
        });

        it('创建的句柄应该是存活的', () => {
            const handle = manager.create();
            expect(manager.isAlive(handle)).toBe(true);
        });

        it('创建的句柄默认应该是启用的', () => {
            const handle = manager.create();
            expect(manager.isEnabled(handle)).toBe(true);
        });
    });

    describe('destroy', () => {
        it('应该销毁句柄', () => {
            const handle = manager.create();
            expect(manager.isAlive(handle)).toBe(true);

            manager.destroy(handle);
            expect(manager.isAlive(handle)).toBe(false);
        });

        it('销毁后使用相同 index 应该增加 generation', () => {
            const handle1 = manager.create();
            const index1 = indexOf(handle1);

            manager.destroy(handle1);
            const handle2 = manager.create();
            const index2 = indexOf(handle2);

            // 应该复用同一个 index
            expect(index2).toBe(index1);
            // 但 generation 应该不同
            expect(genOf(handle2)).toBe(genOf(handle1) + 1);
        });

        it('销毁已销毁的句柄不应该报错', () => {
            const handle = manager.create();
            manager.destroy(handle);

            expect(() => {
                manager.destroy(handle);
            }).not.toThrow();
        });

        it('销毁 NULL_HANDLE 不应该报错', () => {
            expect(() => {
                manager.destroy(NULL_HANDLE);
            }).not.toThrow();
        });
    });

    describe('isAlive', () => {
        it('应该对存活句柄返回 true', () => {
            const handle = manager.create();
            expect(manager.isAlive(handle)).toBe(true);
        });

        it('应该对已销毁句柄返回 false', () => {
            const handle = manager.create();
            manager.destroy(handle);
            expect(manager.isAlive(handle)).toBe(false);
        });

        it('应该对 NULL_HANDLE 返回 false', () => {
            expect(manager.isAlive(NULL_HANDLE)).toBe(false);
        });

        it('应该对过期 generation 返回 false', () => {
            const handle1 = manager.create();
            manager.destroy(handle1);
            const handle2 = manager.create();

            // handle1 的 generation 已过期
            expect(manager.isAlive(handle1)).toBe(false);
            expect(manager.isAlive(handle2)).toBe(true);
        });
    });

    describe('isEnabled/setEnabled', () => {
        it('新创建的句柄默认启用', () => {
            const handle = manager.create();
            expect(manager.isEnabled(handle)).toBe(true);
        });

        it('应该能够禁用句柄', () => {
            const handle = manager.create();
            manager.setEnabled(handle, false);
            expect(manager.isEnabled(handle)).toBe(false);
        });

        it('应该能够重新启用句柄', () => {
            const handle = manager.create();
            manager.setEnabled(handle, false);
            manager.setEnabled(handle, true);
            expect(manager.isEnabled(handle)).toBe(true);
        });

        it('对已销毁句柄设置启用状态不应该报错', () => {
            const handle = manager.create();
            manager.destroy(handle);

            expect(() => {
                manager.setEnabled(handle, true);
            }).not.toThrow();
        });

        it('已销毁句柄应该返回未启用', () => {
            const handle = manager.create();
            manager.destroy(handle);
            expect(manager.isEnabled(handle)).toBe(false);
        });
    });

    describe('aliveCount', () => {
        it('初始时应该为 0', () => {
            expect(manager.aliveCount).toBe(0);
        });

        it('创建句柄后应该增加', () => {
            manager.create();
            expect(manager.aliveCount).toBe(1);

            manager.create();
            expect(manager.aliveCount).toBe(2);
        });

        it('销毁句柄后应该减少', () => {
            const handle1 = manager.create();
            const handle2 = manager.create();
            expect(manager.aliveCount).toBe(2);

            manager.destroy(handle1);
            expect(manager.aliveCount).toBe(1);

            manager.destroy(handle2);
            expect(manager.aliveCount).toBe(0);
        });
    });

    describe('reset', () => {
        it('应该重置所有状态', () => {
            const handle1 = manager.create();
            const handle2 = manager.create();
            manager.destroy(handle1);

            manager.reset();

            expect(manager.aliveCount).toBe(0);
            expect(manager.isAlive(handle2)).toBe(false);
        });

        it('重置后应该能重新创建句柄', () => {
            manager.create();
            manager.create();
            manager.reset();

            const newHandle = manager.create();
            expect(isValidHandle(newHandle)).toBe(true);
            expect(manager.isAlive(newHandle)).toBe(true);
        });
    });

    describe('大规模测试', () => {
        it('应该能处理大量句柄', () => {
            const handles: EntityHandle[] = [];
            const count = 10000;

            // 创建大量句柄
            for (let i = 0; i < count; i++) {
                handles.push(manager.create());
            }

            expect(manager.aliveCount).toBe(count);

            // 验证所有句柄都是存活的
            for (const handle of handles) {
                expect(manager.isAlive(handle)).toBe(true);
            }

            // 销毁一半
            for (let i = 0; i < count / 2; i++) {
                manager.destroy(handles[i]!);
            }

            expect(manager.aliveCount).toBe(count / 2);
        });

        it('应该正确复用已销毁的 index', () => {
            // 创建并销毁
            const handle1 = manager.create();
            manager.destroy(handle1);

            // 再次创建
            const handle2 = manager.create();

            // 应该复用 index
            expect(indexOf(handle2)).toBe(indexOf(handle1));
            // 但 generation 增加
            expect(genOf(handle2)).toBe(genOf(handle1) + 1);
        });
    });
});

describe('Entity.destroy() handle cleanup', () => {
    // 需要导入 Scene 来进行集成测试
    const { Scene } = require('../../../src/ECS/Scene');

    it('Entity.destroy() 应该正确销毁 handle', () => {
        const scene = new Scene();
        const entity = scene.createEntity('TestEntity');
        const handle = entity.handle;

        // 销毁前 handle 应该存活
        expect(scene.handleManager.isAlive(handle)).toBe(true);
        expect(scene.findEntityByHandle(handle)).toBe(entity);

        // 销毁实体
        entity.destroy();

        // 销毁后 handle 应该不再存活
        expect(scene.handleManager.isAlive(handle)).toBe(false);
        expect(scene.findEntityByHandle(handle)).toBeNull();
    });

    it('Scene.destroyEntities() 应该正确销毁所有 handle', () => {
        const scene = new Scene();
        const entity1 = scene.createEntity('Entity1');
        const entity2 = scene.createEntity('Entity2');
        const handle1 = entity1.handle;
        const handle2 = entity2.handle;

        // 销毁前两个 handle 都应该存活
        expect(scene.handleManager.isAlive(handle1)).toBe(true);
        expect(scene.handleManager.isAlive(handle2)).toBe(true);

        // 批量销毁
        scene.destroyEntities([entity1, entity2]);

        // 销毁后两个 handle 都应该不再存活
        expect(scene.handleManager.isAlive(handle1)).toBe(false);
        expect(scene.handleManager.isAlive(handle2)).toBe(false);
    });

    it('isValidHandle 应该只检查非空', () => {
        // isValidHandle 只是非空检查，不检查存活状态
        const scene = new Scene();
        const entity = scene.createEntity('TestEntity');
        const handle = entity.handle;

        entity.destroy();

        // handle 仍然是非空的（isValidHandle 返回 true）
        expect(isValidHandle(handle)).toBe(true);
        // 但是不再存活
        expect(scene.handleManager.isAlive(handle)).toBe(false);
    });
});
