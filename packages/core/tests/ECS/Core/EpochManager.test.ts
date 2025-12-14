import { EpochManager } from '../../../src/ECS/Core/EpochManager';

describe('EpochManager', () => {
    let epochManager: EpochManager;

    beforeEach(() => {
        epochManager = new EpochManager();
    });

    describe('初始状态', () => {
        it('初始 epoch 应该是 1', () => {
            expect(epochManager.current).toBe(1);
        });
    });

    describe('increment', () => {
        it('应该递增 epoch', () => {
            const initial = epochManager.current;
            epochManager.increment();
            expect(epochManager.current).toBe(initial + 1);
        });

        it('应该正确递增多次', () => {
            const initial = epochManager.current;
            epochManager.increment();
            epochManager.increment();
            epochManager.increment();
            expect(epochManager.current).toBe(initial + 3);
        });
    });

    describe('reset', () => {
        it('应该重置 epoch 到 1', () => {
            epochManager.increment();
            epochManager.increment();
            expect(epochManager.current).toBeGreaterThan(1);

            epochManager.reset();
            expect(epochManager.current).toBe(1);
        });
    });

    describe('current getter', () => {
        it('应该返回当前 epoch', () => {
            expect(epochManager.current).toBe(1);
            epochManager.increment();
            expect(epochManager.current).toBe(2);
        });
    });

    describe('使用场景', () => {
        it('可以用于追踪帧数', () => {
            // 模拟 10 帧
            for (let i = 0; i < 10; i++) {
                epochManager.increment();
            }
            expect(epochManager.current).toBe(11); // 初始 1 + 10 帧
        });

        it('可以用于变更检测', () => {
            // 保存检查点
            const checkpoint = epochManager.current;

            // 模拟几帧
            epochManager.increment();
            epochManager.increment();

            // 当前 epoch 应该大于检查点
            expect(epochManager.current).toBeGreaterThan(checkpoint);
        });
    });
});
