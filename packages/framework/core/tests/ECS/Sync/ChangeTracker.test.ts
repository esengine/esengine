import { ChangeTracker } from '../../../src/ECS/Sync/ChangeTracker';

describe('ChangeTracker - 变更追踪器测试', () => {
    let tracker: ChangeTracker;

    beforeEach(() => {
        tracker = new ChangeTracker();
    });

    describe('基本功能', () => {
        test('初始状态应该没有变更', () => {
            expect(tracker.hasChanges()).toBe(false);
            expect(tracker.getDirtyCount()).toBe(0);
            expect(tracker.getDirtyFields()).toEqual([]);
        });

        test('setDirty 应该标记字段为脏', () => {
            tracker.setDirty(0);

            expect(tracker.hasChanges()).toBe(true);
            expect(tracker.isDirty(0)).toBe(true);
            expect(tracker.getDirtyCount()).toBe(1);
            expect(tracker.getDirtyFields()).toEqual([0]);
        });

        test('多次 setDirty 同一字段应该只记录一次', () => {
            tracker.setDirty(0);
            tracker.setDirty(0);
            tracker.setDirty(0);

            expect(tracker.getDirtyCount()).toBe(1);
            expect(tracker.getDirtyFields()).toEqual([0]);
        });

        test('setDirty 不同字段应该都被记录', () => {
            tracker.setDirty(0);
            tracker.setDirty(1);
            tracker.setDirty(2);

            expect(tracker.getDirtyCount()).toBe(3);
            expect(tracker.getDirtyFields().sort()).toEqual([0, 1, 2]);
        });
    });

    describe('isDirty 方法', () => {
        test('未标记的字段应该返回 false', () => {
            expect(tracker.isDirty(0)).toBe(false);
            expect(tracker.isDirty(5)).toBe(false);
        });

        test('已标记的字段应该返回 true', () => {
            tracker.setDirty(3);

            expect(tracker.isDirty(3)).toBe(true);
            expect(tracker.isDirty(0)).toBe(false);
        });
    });

    describe('clear 方法', () => {
        test('clear 应该清除所有变更', () => {
            tracker.setDirty(0);
            tracker.setDirty(1);
            tracker.setDirty(2);

            expect(tracker.hasChanges()).toBe(true);

            tracker.clear();

            expect(tracker.hasChanges()).toBe(false);
            expect(tracker.getDirtyCount()).toBe(0);
            expect(tracker.getDirtyFields()).toEqual([]);
        });

        test('clear 应该更新 lastSyncTime', () => {
            const before = tracker.lastSyncTime;
            tracker.setDirty(0);
            tracker.clear();

            expect(tracker.lastSyncTime).toBeGreaterThan(0);
        });
    });

    describe('clearField 方法', () => {
        test('clearField 应该只清除指定字段', () => {
            tracker.setDirty(0);
            tracker.setDirty(1);
            tracker.setDirty(2);

            tracker.clearField(1);

            expect(tracker.isDirty(0)).toBe(true);
            expect(tracker.isDirty(1)).toBe(false);
            expect(tracker.isDirty(2)).toBe(true);
            expect(tracker.getDirtyCount()).toBe(2);
        });

        test('清除最后一个字段应该使 hasChanges 返回 false', () => {
            tracker.setDirty(0);
            expect(tracker.hasChanges()).toBe(true);

            tracker.clearField(0);

            expect(tracker.hasChanges()).toBe(false);
        });
    });

    describe('markAllDirty 方法', () => {
        test('markAllDirty 应该标记所有字段', () => {
            tracker.markAllDirty(5);

            expect(tracker.hasChanges()).toBe(true);
            expect(tracker.getDirtyCount()).toBe(5);
            expect(tracker.getDirtyFields().sort()).toEqual([0, 1, 2, 3, 4]);
        });

        test('markAllDirty(0) 应该没有变更', () => {
            tracker.markAllDirty(0);

            expect(tracker.hasChanges()).toBe(false);
            expect(tracker.getDirtyCount()).toBe(0);
        });

        test('markAllDirty 用于首次同步', () => {
            tracker.markAllDirty(3);

            expect(tracker.isDirty(0)).toBe(true);
            expect(tracker.isDirty(1)).toBe(true);
            expect(tracker.isDirty(2)).toBe(true);
            expect(tracker.isDirty(3)).toBe(false);
        });
    });

    describe('reset 方法', () => {
        test('reset 应该重置所有状态', () => {
            tracker.setDirty(0);
            tracker.setDirty(1);
            tracker.clear();

            tracker.reset();

            expect(tracker.hasChanges()).toBe(false);
            expect(tracker.getDirtyCount()).toBe(0);
            expect(tracker.lastSyncTime).toBe(0);
        });
    });

    describe('边界情况', () => {
        test('大量字段标记应该正常工作', () => {
            const fieldCount = 1000;

            for (let i = 0; i < fieldCount; i++) {
                tracker.setDirty(i);
            }

            expect(tracker.getDirtyCount()).toBe(fieldCount);
            expect(tracker.hasChanges()).toBe(true);
        });

        test('交替设置和清除应该正常工作', () => {
            tracker.setDirty(0);
            tracker.setDirty(1);
            tracker.clearField(0);
            tracker.setDirty(2);
            tracker.clearField(1);

            expect(tracker.isDirty(0)).toBe(false);
            expect(tracker.isDirty(1)).toBe(false);
            expect(tracker.isDirty(2)).toBe(true);
            expect(tracker.getDirtyCount()).toBe(1);
        });
    });
});
