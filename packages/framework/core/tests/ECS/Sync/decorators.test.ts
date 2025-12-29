import { Component } from '../../../src/ECS/Component';
import { ECSComponent } from '../../../src/ECS/Decorators';
import { Scene } from '../../../src/ECS/Scene';
import {
    sync,
    getSyncMetadata,
    hasSyncFields,
    getChangeTracker,
    initChangeTracker,
    clearChanges,
    hasChanges
} from '../../../src/ECS/Sync/decorators';
import { SYNC_METADATA, CHANGE_TRACKER } from '../../../src/ECS/Sync/types';

@ECSComponent('SyncTest_PlayerComponent')
class PlayerComponent extends Component {
    @sync("string") name: string = "";
    @sync("uint16") score: number = 0;
    @sync("float32") x: number = 0;
    @sync("float32") y: number = 0;

    localData: string = "not synced";
}

@ECSComponent('SyncTest_SimpleComponent')
class SimpleComponent extends Component {
    @sync("boolean") active: boolean = true;
    @sync("int32") value: number = 100;
}

@ECSComponent('SyncTest_NoSyncComponent')
class NoSyncComponent extends Component {
    localValue: number = 0;
}

@ECSComponent('SyncTest_AllTypesComponent')
class AllTypesComponent extends Component {
    @sync("boolean") boolField: boolean = false;
    @sync("int8") int8Field: number = 0;
    @sync("uint8") uint8Field: number = 0;
    @sync("int16") int16Field: number = 0;
    @sync("uint16") uint16Field: number = 0;
    @sync("int32") int32Field: number = 0;
    @sync("uint32") uint32Field: number = 0;
    @sync("float32") float32Field: number = 0;
    @sync("float64") float64Field: number = 0;
    @sync("string") stringField: string = "";
}

describe('@sync 装饰器测试', () => {
    describe('getSyncMetadata', () => {
        test('应该返回带 @sync 字段的组件元数据', () => {
            const metadata = getSyncMetadata(PlayerComponent);

            expect(metadata).not.toBeNull();
            expect(metadata!.typeId).toBe('PlayerComponent');
            expect(metadata!.fields.length).toBe(4);
        });

        test('应该正确记录字段信息', () => {
            const metadata = getSyncMetadata(PlayerComponent);

            const nameField = metadata!.fields.find(f => f.name === 'name');
            expect(nameField).toBeDefined();
            expect(nameField!.type).toBe('string');
            expect(nameField!.index).toBe(0);

            const scoreField = metadata!.fields.find(f => f.name === 'score');
            expect(scoreField).toBeDefined();
            expect(scoreField!.type).toBe('uint16');

            const xField = metadata!.fields.find(f => f.name === 'x');
            expect(xField).toBeDefined();
            expect(xField!.type).toBe('float32');
        });

        test('没有 @sync 字段的组件应该返回 null', () => {
            const metadata = getSyncMetadata(NoSyncComponent);

            expect(metadata).toBeNull();
        });

        test('可以从实例获取元数据', () => {
            const component = new PlayerComponent();
            const metadata = getSyncMetadata(component);

            expect(metadata).not.toBeNull();
            expect(metadata!.fields.length).toBe(4);
        });

        test('fieldIndexMap 应该正确映射字段名到索引', () => {
            const metadata = getSyncMetadata(PlayerComponent);

            expect(metadata!.fieldIndexMap.get('name')).toBe(0);
            expect(metadata!.fieldIndexMap.get('score')).toBe(1);
            expect(metadata!.fieldIndexMap.get('x')).toBe(2);
            expect(metadata!.fieldIndexMap.get('y')).toBe(3);
        });
    });

    describe('hasSyncFields', () => {
        test('有 @sync 字段应该返回 true', () => {
            expect(hasSyncFields(PlayerComponent)).toBe(true);
            expect(hasSyncFields(new PlayerComponent())).toBe(true);
        });

        test('没有 @sync 字段应该返回 false', () => {
            expect(hasSyncFields(NoSyncComponent)).toBe(false);
            expect(hasSyncFields(new NoSyncComponent())).toBe(false);
        });
    });

    describe('支持所有同步类型', () => {
        test('AllTypesComponent 应该有所有类型的字段', () => {
            const metadata = getSyncMetadata(AllTypesComponent);

            expect(metadata).not.toBeNull();
            expect(metadata!.fields.length).toBe(10);

            const types = metadata!.fields.map(f => f.type);
            expect(types).toContain('boolean');
            expect(types).toContain('int8');
            expect(types).toContain('uint8');
            expect(types).toContain('int16');
            expect(types).toContain('uint16');
            expect(types).toContain('int32');
            expect(types).toContain('uint32');
            expect(types).toContain('float32');
            expect(types).toContain('float64');
            expect(types).toContain('string');
        });
    });

    describe('字段值拦截', () => {
        test('修改 @sync 字段应该触发变更追踪', () => {
            const component = new PlayerComponent();
            initChangeTracker(component);

            const tracker = getChangeTracker(component);
            expect(tracker).not.toBeNull();
            tracker!.clear();

            component.name = "TestPlayer";

            expect(tracker!.hasChanges()).toBe(true);
            expect(tracker!.isDirty(0)).toBe(true);
        });

        test('设置相同值不应该触发变更', () => {
            const component = new PlayerComponent();
            component.name = "Test";
            initChangeTracker(component);

            const tracker = getChangeTracker(component);
            tracker!.clear();

            component.name = "Test";

            expect(tracker!.hasChanges()).toBe(false);
        });

        test('修改非 @sync 字段不应该触发变更', () => {
            const component = new PlayerComponent();
            initChangeTracker(component);

            const tracker = getChangeTracker(component);
            tracker!.clear();

            component.localData = "new value";

            expect(tracker!.hasChanges()).toBe(false);
        });

        test('多个字段变更应该都被追踪', () => {
            const component = new PlayerComponent();
            initChangeTracker(component);

            const tracker = getChangeTracker(component);
            tracker!.clear();

            component.name = "NewName";
            component.score = 100;
            component.x = 1.5;

            expect(tracker!.getDirtyCount()).toBe(3);
            expect(tracker!.isDirty(0)).toBe(true);
            expect(tracker!.isDirty(1)).toBe(true);
            expect(tracker!.isDirty(2)).toBe(true);
            expect(tracker!.isDirty(3)).toBe(false);
        });
    });

    describe('initChangeTracker', () => {
        test('应该创建变更追踪器', () => {
            const component = new PlayerComponent();

            expect(getChangeTracker(component)).toBeNull();

            initChangeTracker(component);

            expect(getChangeTracker(component)).not.toBeNull();
        });

        test('应该标记所有字段为脏（用于首次同步）', () => {
            const component = new PlayerComponent();
            initChangeTracker(component);

            const tracker = getChangeTracker(component);
            expect(tracker!.hasChanges()).toBe(true);
            expect(tracker!.getDirtyCount()).toBe(4);
        });

        test('对没有 @sync 字段的组件应该抛出错误', () => {
            const component = new NoSyncComponent();

            expect(() => {
                initChangeTracker(component);
            }).toThrow();
        });

        test('重复初始化应该重新标记所有字段', () => {
            const component = new PlayerComponent();
            initChangeTracker(component);

            const tracker = getChangeTracker(component);
            tracker!.clear();

            expect(tracker!.hasChanges()).toBe(false);

            initChangeTracker(component);

            expect(tracker!.hasChanges()).toBe(true);
            expect(tracker!.getDirtyCount()).toBe(4);
        });
    });

    describe('clearChanges', () => {
        test('应该清除所有变更标记', () => {
            const component = new PlayerComponent();
            initChangeTracker(component);

            expect(hasChanges(component)).toBe(true);

            clearChanges(component);

            expect(hasChanges(component)).toBe(false);
        });

        test('对没有追踪器的组件应该安全执行', () => {
            const component = new PlayerComponent();

            expect(() => {
                clearChanges(component);
            }).not.toThrow();
        });
    });

    describe('hasChanges', () => {
        test('初始化后应该有变更', () => {
            const component = new PlayerComponent();
            initChangeTracker(component);

            expect(hasChanges(component)).toBe(true);
        });

        test('清除后应该没有变更', () => {
            const component = new PlayerComponent();
            initChangeTracker(component);
            clearChanges(component);

            expect(hasChanges(component)).toBe(false);
        });

        test('修改字段后应该有变更', () => {
            const component = new PlayerComponent();
            initChangeTracker(component);
            clearChanges(component);

            component.score = 999;

            expect(hasChanges(component)).toBe(true);
        });

        test('没有追踪器应该返回 false', () => {
            const component = new PlayerComponent();

            expect(hasChanges(component)).toBe(false);
        });
    });

    describe('与实体集成', () => {
        let scene: Scene;

        beforeEach(() => {
            scene = new Scene();
        });

        test('添加到实体的组件应该能正常工作', () => {
            const entity = scene.createEntity('TestEntity');
            const component = new PlayerComponent();

            entity.addComponent(component);
            initChangeTracker(component);

            component.name = "EntityPlayer";
            component.x = 100;

            const tracker = getChangeTracker(component);
            expect(tracker!.hasChanges()).toBe(true);
        });

        test('从实体获取的组件应该保持追踪状态', () => {
            const entity = scene.createEntity('TestEntity');
            const component = new PlayerComponent();

            entity.addComponent(component);
            initChangeTracker(component);
            clearChanges(component);

            const retrieved = entity.getComponent(PlayerComponent);
            retrieved!.score = 50;

            expect(hasChanges(component)).toBe(true);
            expect(hasChanges(retrieved!)).toBe(true);
        });
    });
});
