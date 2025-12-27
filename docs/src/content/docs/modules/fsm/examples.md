---
title: "实际示例"
description: "角色状态机、ECS 集成"
---

## 角色状态机

```typescript
import { createStateMachine } from '@esengine/fsm';

type CharacterState = 'idle' | 'walk' | 'run' | 'jump' | 'fall' | 'attack';

interface CharacterContext {
    velocity: { x: number; y: number };
    isGrounded: boolean;
    isAttacking: boolean;
    speed: number;
}

const characterFSM = createStateMachine<CharacterState, CharacterContext>('idle', {
    context: {
        velocity: { x: 0, y: 0 },
        isGrounded: true,
        isAttacking: false,
        speed: 0
    }
});

// 定义状态
characterFSM.defineState('idle', {
    onEnter: (ctx) => {
        ctx.speed = 0;
    },
    onUpdate: (ctx, dt) => {
        // 播放待机动画
    }
});

characterFSM.defineState('walk', {
    onEnter: (ctx) => {
        ctx.speed = 100;
    }
});

characterFSM.defineState('run', {
    onEnter: (ctx) => {
        ctx.speed = 200;
    }
});

characterFSM.defineState('jump', {
    onEnter: (ctx) => {
        ctx.velocity.y = -300;
        ctx.isGrounded = false;
    }
});

// 定义转换
characterFSM.defineTransition('idle', 'walk', (ctx) => Math.abs(ctx.velocity.x) > 0);
characterFSM.defineTransition('walk', 'idle', (ctx) => ctx.velocity.x === 0);
characterFSM.defineTransition('walk', 'run', (ctx) => Math.abs(ctx.velocity.x) > 150);
characterFSM.defineTransition('run', 'walk', (ctx) => Math.abs(ctx.velocity.x) <= 150);

// 跳跃有最高优先级
characterFSM.defineTransition('idle', 'jump', (ctx) => !ctx.isGrounded, 10);
characterFSM.defineTransition('walk', 'jump', (ctx) => !ctx.isGrounded, 10);
characterFSM.defineTransition('run', 'jump', (ctx) => !ctx.isGrounded, 10);

characterFSM.defineTransition('jump', 'fall', (ctx) => ctx.velocity.y > 0);
characterFSM.defineTransition('fall', 'idle', (ctx) => ctx.isGrounded);

// 游戏循环中使用
function gameUpdate(dt: number) {
    // 更新上下文
    characterFSM.context.velocity.x = getInputVelocity();
    characterFSM.context.isGrounded = checkGrounded();

    // 评估状态转换
    characterFSM.evaluateTransitions();

    // 更新当前状态
    characterFSM.update(dt);
}
```

## 与 ECS 集成

```typescript
import { Component, EntitySystem, Matcher } from '@esengine/ecs-framework';
import { createStateMachine, type IStateMachine } from '@esengine/fsm';

// 状态机组件
class FSMComponent extends Component {
    fsm: IStateMachine<string>;

    constructor(initialState: string) {
        super();
        this.fsm = createStateMachine(initialState);
    }
}

// 状态机系统
class FSMSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(FSMComponent));
    }

    protected processEntity(entity: Entity, dt: number): void {
        const fsmComp = entity.getComponent(FSMComponent);
        fsmComp.fsm.evaluateTransitions();
        fsmComp.fsm.update(dt);
    }
}
```

## AI 行为状态机

```typescript
type AIState = 'patrol' | 'chase' | 'attack' | 'flee' | 'dead';

interface AIContext {
    health: number;
    target: Entity | null;
    distanceToTarget: number;
    attackRange: number;
    sightRange: number;
}

const aiFSM = createStateMachine<AIState, AIContext>('patrol', {
    context: {
        health: 100,
        target: null,
        distanceToTarget: Infinity,
        attackRange: 50,
        sightRange: 200
    }
});

// 巡逻状态
aiFSM.defineState('patrol', {
    onEnter: () => console.log('开始巡逻'),
    onUpdate: (ctx, dt) => {
        // 沿巡逻路径移动
    }
});

// 追击状态
aiFSM.defineState('chase', {
    onEnter: () => console.log('发现目标，开始追击'),
    onUpdate: (ctx, dt) => {
        // 向目标移动
    }
});

// 攻击状态
aiFSM.defineState('attack', {
    onEnter: () => console.log('进入攻击范围'),
    onUpdate: (ctx, dt) => {
        // 执行攻击
    }
});

// 逃跑状态
aiFSM.defineState('flee', {
    onEnter: () => console.log('血量过低，逃跑'),
    onUpdate: (ctx, dt) => {
        // 远离目标
    }
});

// 转换规则
aiFSM.defineTransition('patrol', 'chase',
    (ctx) => ctx.target !== null && ctx.distanceToTarget < ctx.sightRange);
aiFSM.defineTransition('chase', 'attack',
    (ctx) => ctx.distanceToTarget < ctx.attackRange);
aiFSM.defineTransition('attack', 'chase',
    (ctx) => ctx.distanceToTarget >= ctx.attackRange);
aiFSM.defineTransition('chase', 'patrol',
    (ctx) => ctx.target === null || ctx.distanceToTarget > ctx.sightRange);

// 逃跑优先级最高
aiFSM.defineTransition('patrol', 'flee', (ctx) => ctx.health < 20, 100);
aiFSM.defineTransition('chase', 'flee', (ctx) => ctx.health < 20, 100);
aiFSM.defineTransition('attack', 'flee', (ctx) => ctx.health < 20, 100);

aiFSM.defineTransition('flee', 'patrol', (ctx) => ctx.health >= 20);
```

## 动画状态机

```typescript
type AnimState = 'idle' | 'walk' | 'run' | 'jump_up' | 'jump_down' | 'land';

interface AnimContext {
    animator: Animator;
    velocityX: number;
    velocityY: number;
    isGrounded: boolean;
}

const animFSM = createStateMachine<AnimState, AnimContext>('idle', {
    context: { animator: null!, velocityX: 0, velocityY: 0, isGrounded: true }
});

animFSM.defineState('idle', {
    onEnter: (ctx) => ctx.animator.play('idle')
});

animFSM.defineState('walk', {
    onEnter: (ctx) => ctx.animator.play('walk')
});

animFSM.defineState('run', {
    onEnter: (ctx) => ctx.animator.play('run')
});

animFSM.defineState('jump_up', {
    onEnter: (ctx) => ctx.animator.play('jump_up')
});

animFSM.defineState('jump_down', {
    onEnter: (ctx) => ctx.animator.play('jump_down')
});

animFSM.defineState('land', {
    onEnter: (ctx) => ctx.animator.play('land')
});

// 设置转换（略）
```
