import {
    SystemScheduler,
    CycleDependencyError,
    DEFAULT_STAGE_ORDER,
    SystemStage
} from '../../../src/ECS/Core/SystemScheduler';
import { SystemDependencyGraph } from '../../../src/ECS/Core/SystemDependencyGraph';
import { EntitySystem } from '../../../src/ECS/Systems/EntitySystem';
import { Scene } from '../../../src/ECS/Scene';
import { Matcher } from '../../../src/ECS/Utils/Matcher';
import { Entity } from '../../../src/ECS/Entity';
import { ECSSystem, Stage, Before, After, InSet } from '../../../src/ECS/Decorators';

// 测试系统
@ECSSystem('TestSystemA')
class TestSystemA extends EntitySystem {
    public executionOrder: number = 0;
    public static executionCounter = 0;

    constructor() {
        super(Matcher.nothing());
    }

    protected override process(entities: readonly Entity[]): void {
        this.executionOrder = ++TestSystemA.executionCounter;
    }
}

@ECSSystem('TestSystemB')
class TestSystemB extends EntitySystem {
    public executionOrder: number = 0;

    constructor() {
        super(Matcher.nothing());
    }

    protected override process(entities: readonly Entity[]): void {
        this.executionOrder = ++TestSystemA.executionCounter;
    }
}

@ECSSystem('TestSystemC')
class TestSystemC extends EntitySystem {
    public executionOrder: number = 0;

    constructor() {
        super(Matcher.nothing());
    }

    protected override process(entities: readonly Entity[]): void {
        this.executionOrder = ++TestSystemA.executionCounter;
    }
}

describe('SystemDependencyGraph', () => {
    let graph: SystemDependencyGraph;

    beforeEach(() => {
        graph = new SystemDependencyGraph();
    });

    describe('addSystemNode', () => {
        it('应该添加节点', () => {
            graph.addSystemNode('SystemA');
            expect(graph.size).toBe(1);
        });

        it('应该支持添加多个节点', () => {
            graph.addSystemNode('SystemA');
            graph.addSystemNode('SystemB');
            expect(graph.size).toBe(2);
        });
    });

    describe('addSetNode', () => {
        it('应该添加虚拟集合节点', () => {
            graph.addSetNode('CoreSystems');
            expect(graph.size).toBe(1);
        });
    });

    describe('addEdge', () => {
        it('应该添加边', () => {
            graph.addSystemNode('SystemA');
            graph.addSystemNode('SystemB');
            graph.addEdge('SystemA', 'SystemB');

            // 拓扑排序后 A 应该在 B 之前
            const sorted = graph.topologicalSort();
            expect(sorted.indexOf('SystemA')).toBeLessThan(sorted.indexOf('SystemB'));
        });

        it('应该忽略自引用边', () => {
            graph.addSystemNode('SystemA');
            graph.addEdge('SystemA', 'SystemA');

            // 不应该产生循环
            const sorted = graph.topologicalSort();
            expect(sorted).toContain('SystemA');
        });
    });

    describe('topologicalSort', () => {
        it('应该返回正确的拓扑顺序', () => {
            graph.addSystemNode('SystemA');
            graph.addSystemNode('SystemB');
            graph.addSystemNode('SystemC');

            // A -> B -> C
            graph.addEdge('SystemA', 'SystemB');
            graph.addEdge('SystemB', 'SystemC');

            const sorted = graph.topologicalSort();

            expect(sorted.indexOf('SystemA')).toBeLessThan(sorted.indexOf('SystemB'));
            expect(sorted.indexOf('SystemB')).toBeLessThan(sorted.indexOf('SystemC'));
        });

        it('应该检测循环依赖', () => {
            graph.addSystemNode('SystemA');
            graph.addSystemNode('SystemB');

            // A -> B -> A (循环)
            graph.addEdge('SystemA', 'SystemB');
            graph.addEdge('SystemB', 'SystemA');

            expect(() => {
                graph.topologicalSort();
            }).toThrow(CycleDependencyError);
        });

        it('应该检测多节点循环依赖', () => {
            graph.addSystemNode('SystemA');
            graph.addSystemNode('SystemB');
            graph.addSystemNode('SystemC');

            // A -> B -> C -> A (循环)
            graph.addEdge('SystemA', 'SystemB');
            graph.addEdge('SystemB', 'SystemC');
            graph.addEdge('SystemC', 'SystemA');

            expect(() => {
                graph.topologicalSort();
            }).toThrow(CycleDependencyError);
        });

        it('应该处理没有依赖的系统', () => {
            graph.addSystemNode('SystemA');
            graph.addSystemNode('SystemB');

            // 没有边，两个独立系统
            const sorted = graph.topologicalSort();

            expect(sorted).toHaveLength(2);
            expect(sorted).toContain('SystemA');
            expect(sorted).toContain('SystemB');
        });

        it('不应该包含虚拟节点在结果中', () => {
            graph.addSystemNode('SystemA');
            graph.addSetNode('CoreSystems');

            const sorted = graph.topologicalSort();

            expect(sorted).toContain('SystemA');
            expect(sorted).not.toContain('set:CoreSystems');
        });
    });

    describe('buildFromSystems', () => {
        it('应该从系统依赖信息构建图', () => {
            graph.buildFromSystems([
                { name: 'SystemA', before: ['SystemB'], after: [], sets: [] },
                { name: 'SystemB', before: [], after: [], sets: [] }
            ]);

            const sorted = graph.topologicalSort();
            expect(sorted.indexOf('SystemA')).toBeLessThan(sorted.indexOf('SystemB'));
        });

        it('应该处理 after 依赖', () => {
            graph.buildFromSystems([
                { name: 'SystemA', before: [], after: [], sets: [] },
                { name: 'SystemB', before: [], after: ['SystemA'], sets: [] }
            ]);

            const sorted = graph.topologicalSort();
            expect(sorted.indexOf('SystemA')).toBeLessThan(sorted.indexOf('SystemB'));
        });

        it('应该处理 set 依赖', () => {
            graph.buildFromSystems([
                { name: 'SystemA', before: [], after: [], sets: ['CoreSystems'] },
                { name: 'SystemB', before: [], after: [], sets: ['CoreSystems'] }
            ]);

            const sorted = graph.topologicalSort();
            expect(sorted).toHaveLength(2);
            expect(sorted).toContain('SystemA');
            expect(sorted).toContain('SystemB');
        });
    });

    describe('clear', () => {
        it('应该清除所有节点和边', () => {
            graph.addSystemNode('SystemA');
            graph.addSystemNode('SystemB');
            graph.addEdge('SystemA', 'SystemB');

            graph.clear();

            expect(graph.size).toBe(0);
        });
    });
});

describe('SystemScheduler', () => {
    let scheduler: SystemScheduler;

    beforeEach(() => {
        scheduler = new SystemScheduler();
        TestSystemA.executionCounter = 0;
    });

    describe('DEFAULT_STAGE_ORDER', () => {
        it('应该包含所有阶段', () => {
            expect(DEFAULT_STAGE_ORDER).toContain('startup');
            expect(DEFAULT_STAGE_ORDER).toContain('preUpdate');
            expect(DEFAULT_STAGE_ORDER).toContain('update');
            expect(DEFAULT_STAGE_ORDER).toContain('postUpdate');
            expect(DEFAULT_STAGE_ORDER).toContain('cleanup');
        });

        it('阶段顺序应该正确', () => {
            expect(DEFAULT_STAGE_ORDER.indexOf('startup')).toBeLessThan(
                DEFAULT_STAGE_ORDER.indexOf('preUpdate')
            );
            expect(DEFAULT_STAGE_ORDER.indexOf('preUpdate')).toBeLessThan(
                DEFAULT_STAGE_ORDER.indexOf('update')
            );
            expect(DEFAULT_STAGE_ORDER.indexOf('update')).toBeLessThan(
                DEFAULT_STAGE_ORDER.indexOf('postUpdate')
            );
            expect(DEFAULT_STAGE_ORDER.indexOf('postUpdate')).toBeLessThan(
                DEFAULT_STAGE_ORDER.indexOf('cleanup')
            );
        });
    });

    describe('getSortedSystems', () => {
        it('应该返回排序后的系统', () => {
            const systemA = new TestSystemA();
            const systemB = new TestSystemB();

            const systems = scheduler.getSortedSystems([systemA, systemB], 'update');
            expect(systems.length).toBeGreaterThanOrEqual(2);
        });

        it('应该按 updateOrder 排序', () => {
            const systemA = new TestSystemA();
            const systemB = new TestSystemB();
            systemA.updateOrder = 10;
            systemB.updateOrder = 5;

            const systems = scheduler.getSortedSystems([systemA, systemB], 'update');

            // B 的 updateOrder 更小，应该在 A 之前
            expect(systems.indexOf(systemB)).toBeLessThan(systems.indexOf(systemA));
        });

        it('应该按依赖关系排序', () => {
            // 创建带有依赖关系的系统
            @ECSSystem('DepSystemA')
            @Stage('update')
            class DepSystemA extends EntitySystem {
                constructor() {
                    super(Matcher.nothing());
                }
            }

            @ECSSystem('DepSystemB')
            @Stage('update')
            @After('DepSystemA')
            class DepSystemB extends EntitySystem {
                constructor() {
                    super(Matcher.nothing());
                }
            }

            const systemA = new DepSystemA();
            const systemB = new DepSystemB();

            const systems = scheduler.getSortedSystems([systemA, systemB], 'update');
            const indexA = systems.indexOf(systemA);
            const indexB = systems.indexOf(systemB);

            expect(indexA).toBeLessThan(indexB);
        });

        it('应该返回指定阶段的系统', () => {
            @ECSSystem('PreUpdateSystem')
            @Stage('preUpdate')
            class PreUpdateSystem extends EntitySystem {
                constructor() {
                    super(Matcher.nothing());
                }
            }

            @ECSSystem('UpdateSystem')
            @Stage('update')
            class UpdateSystem extends EntitySystem {
                constructor() {
                    super(Matcher.nothing());
                }
            }

            const preSystem = new PreUpdateSystem();
            const updateSystem = new UpdateSystem();

            const preSystems = scheduler.getSortedSystems([preSystem, updateSystem], 'preUpdate');
            const updateSystems = scheduler.getSortedSystems([preSystem, updateSystem], 'update');

            expect(preSystems).toContain(preSystem);
            expect(preSystems).not.toContain(updateSystem);

            expect(updateSystems).toContain(updateSystem);
            expect(updateSystems).not.toContain(preSystem);
        });
    });

    describe('getAllSortedSystems', () => {
        it('应该返回所有阶段的系统', () => {
            @ECSSystem('AllPreSystem')
            @Stage('preUpdate')
            class AllPreSystem extends EntitySystem {
                constructor() {
                    super(Matcher.nothing());
                }
            }

            @ECSSystem('AllUpdateSystem')
            @Stage('update')
            class AllUpdateSystem extends EntitySystem {
                constructor() {
                    super(Matcher.nothing());
                }
            }

            const preSystem = new AllPreSystem();
            const updateSystem = new AllUpdateSystem();

            const allSystems = scheduler.getAllSortedSystems([preSystem, updateSystem]);

            expect(allSystems).toContain(preSystem);
            expect(allSystems).toContain(updateSystem);
            // preUpdate 阶段在 update 之前
            expect(allSystems.indexOf(preSystem)).toBeLessThan(allSystems.indexOf(updateSystem));
        });
    });

    describe('markDirty', () => {
        it('调用 markDirty 后应该重新排序', () => {
            const systemA = new TestSystemA();
            const systemB = new TestSystemB();

            // 第一次排序
            scheduler.getSortedSystems([systemA, systemB], 'update');

            // 标记脏
            scheduler.markDirty();

            // 应该重新排序而不出错
            const systems = scheduler.getSortedSystems([systemA, systemB], 'update');
            expect(systems).toHaveLength(2);
        });
    });

    describe('setUseDependencySort', () => {
        it('禁用依赖排序后应该只使用 updateOrder', () => {
            @ECSSystem('DisabledDepA')
            @Stage('update')
            class DisabledDepA extends EntitySystem {
                constructor() {
                    super(Matcher.nothing());
                }
            }

            @ECSSystem('DisabledDepB')
            @Stage('update')
            @Before('DisabledDepA')
            class DisabledDepB extends EntitySystem {
                constructor() {
                    super(Matcher.nothing());
                }
            }

            const systemA = new DisabledDepA();
            const systemB = new DisabledDepB();
            systemA.updateOrder = 1;
            systemB.updateOrder = 2;

            scheduler.setUseDependencySort(false);

            const systems = scheduler.getSortedSystems([systemA, systemB], 'update');
            // 禁用依赖排序后，按 updateOrder 排序
            expect(systems.indexOf(systemA)).toBeLessThan(systems.indexOf(systemB));
        });
    });
});

describe('调度装饰器', () => {
    describe('@Stage', () => {
        it('应该设置系统的执行阶段', () => {
            @ECSSystem('StageTestSystem')
            @Stage('postUpdate')
            class StageTestSystem extends EntitySystem {
                constructor() {
                    super(Matcher.nothing());
                }
            }

            const system = new StageTestSystem();
            expect(system.getStage()).toBe('postUpdate');
        });
    });

    describe('@Before', () => {
        it('应该设置系统的前置依赖', () => {
            @ECSSystem('BeforeTestSystem')
            @Before('OtherSystem')
            class BeforeTestSystem extends EntitySystem {
                constructor() {
                    super(Matcher.nothing());
                }
            }

            const system = new BeforeTestSystem();
            expect(system.getBefore()).toContain('OtherSystem');
        });

        it('应该支持多个前置依赖', () => {
            @ECSSystem('MultiBeforeSystem')
            @Before('SystemA', 'SystemB')
            class MultiBeforeSystem extends EntitySystem {
                constructor() {
                    super(Matcher.nothing());
                }
            }

            const system = new MultiBeforeSystem();
            expect(system.getBefore()).toContain('SystemA');
            expect(system.getBefore()).toContain('SystemB');
        });
    });

    describe('@After', () => {
        it('应该设置系统的后置依赖', () => {
            @ECSSystem('AfterTestSystem')
            @After('OtherSystem')
            class AfterTestSystem extends EntitySystem {
                constructor() {
                    super(Matcher.nothing());
                }
            }

            const system = new AfterTestSystem();
            expect(system.getAfter()).toContain('OtherSystem');
        });
    });

    describe('@InSet', () => {
        it('应该设置系统所属的集合', () => {
            @ECSSystem('InSetTestSystem')
            @InSet('CoreSystems')
            class InSetTestSystem extends EntitySystem {
                constructor() {
                    super(Matcher.nothing());
                }
            }

            const system = new InSetTestSystem();
            expect(system.getSets()).toContain('CoreSystems');
        });
    });

    describe('组合使用', () => {
        it('应该支持组合多个装饰器', () => {
            @ECSSystem('CombinedSystem')
            @Stage('update')
            @After('InputSystem')
            @Before('RenderSystem')
            @InSet('CoreSystems')
            class CombinedSystem extends EntitySystem {
                constructor() {
                    super(Matcher.nothing());
                }
            }

            const system = new CombinedSystem();
            expect(system.getStage()).toBe('update');
            expect(system.getAfter()).toContain('InputSystem');
            expect(system.getBefore()).toContain('RenderSystem');
            expect(system.getSets()).toContain('CoreSystems');
        });
    });
});

describe('Fluent API 调度配置', () => {
    it('应该支持 stage() 方法', () => {
        @ECSSystem('FluentStageSystem')
        class FluentStageSystem extends EntitySystem {
            constructor() {
                super(Matcher.nothing());
                this.stage('postUpdate');
            }
        }

        const system = new FluentStageSystem();
        expect(system.getStage()).toBe('postUpdate');
    });

    it('应该支持链式调用', () => {
        @ECSSystem('FluentChainSystem')
        class FluentChainSystem extends EntitySystem {
            constructor() {
                super(Matcher.nothing());
                this.stage('update')
                    .after('SystemA')
                    .before('SystemB')
                    .inSet('CoreSystems');
            }
        }

        const system = new FluentChainSystem();
        expect(system.getStage()).toBe('update');
        expect(system.getAfter()).toContain('SystemA');
        expect(system.getBefore()).toContain('SystemB');
        expect(system.getSets()).toContain('CoreSystems');
    });
});

describe('CycleDependencyError', () => {
    it('应该包含循环节点信息', () => {
        const error = new CycleDependencyError(['SystemA', 'SystemB', 'SystemA']);
        expect(error.message).toContain('SystemA');
        expect(error.message).toContain('SystemB');
        expect(error.involvedNodes).toEqual(['SystemA', 'SystemB', 'SystemA']);
    });

    it('应该是 Error 的实例', () => {
        const error = new CycleDependencyError(['SystemA']);
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('CycleDependencyError');
    });
});
