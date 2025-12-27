---
title: "Examples"
description: "Character FSM, AI behavior, ECS integration"
---

## Character State Machine

```typescript
interface CharacterContext {
    health: number;
    stamina: number;
    isGrounded: boolean;
    velocity: { x: number; y: number };
}

const characterFSM = createStateMachine<CharacterContext>({
    initial: 'idle',
    context: {
        health: 100,
        stamina: 100,
        isGrounded: true,
        velocity: { x: 0, y: 0 }
    },
    states: {
        idle: {
            onEnter: (ctx) => {
                ctx.velocity.x = 0;
            },
            onUpdate: (dt, ctx) => {
                // Recover stamina
                ctx.stamina = Math.min(100, ctx.stamina + dt * 10);
            },
            transitions: {
                move: 'running',
                jump: { target: 'jumping', guard: ctx => ctx.isGrounded },
                hurt: 'hit',
                die: { target: 'dead', guard: ctx => ctx.health <= 0 }
            }
        },
        running: {
            onUpdate: (dt, ctx) => {
                ctx.stamina = Math.max(0, ctx.stamina - dt * 5);
            },
            transitions: {
                stop: 'idle',
                jump: { target: 'jumping', guard: ctx => ctx.isGrounded },
                hurt: 'hit',
                exhaust: { target: 'idle', guard: ctx => ctx.stamina <= 0 }
            }
        },
        jumping: {
            onEnter: (ctx) => {
                ctx.velocity.y = -10;
                ctx.isGrounded = false;
                ctx.stamina -= 20;
            },
            transitions: {
                land: { target: 'idle', action: ctx => { ctx.isGrounded = true; } },
                hurt: 'hit'
            }
        },
        hit: {
            onEnter: (ctx) => {
                // Play hit animation
            },
            transitions: {
                recover: 'idle',
                die: { target: 'dead', guard: ctx => ctx.health <= 0 }
            }
        },
        dead: {
            onEnter: (ctx) => {
                ctx.velocity = { x: 0, y: 0 };
                // Play death animation
            },
            transitions: {
                respawn: {
                    target: 'idle',
                    action: (ctx) => {
                        ctx.health = 100;
                        ctx.stamina = 100;
                    }
                }
            }
        }
    }
});
```

## ECS Integration

```typescript
import { System } from '@esengine/ecs-framework';
import { createStateMachine } from '@esengine/fsm';

// FSM Component
class FSMComponent extends Component {
    fsm: StateMachine<any>;
}

// FSM System
class FSMSystem extends System {
    query = this.world.query([FSMComponent]);

    update(dt: number): void {
        for (const entity of this.query.entities) {
            const fsm = entity.getComponent(FSMComponent).fsm;
            fsm.update(dt);
        }
    }
}

// Usage
const entity = world.createEntity();
const fsmComp = entity.addComponent(FSMComponent);
fsmComp.fsm = createStateMachine({
    initial: 'patrol',
    states: {
        patrol: { /* ... */ },
        chase: { /* ... */ },
        attack: { /* ... */ }
    }
});
```

## AI Behavior Example

```typescript
interface EnemyAIContext {
    entity: Entity;
    target: Entity | null;
    alertLevel: number;
    lastKnownPosition: { x: number; y: number } | null;
}

const enemyAI = createStateMachine<EnemyAIContext>({
    initial: 'patrol',
    context: {
        entity: enemyEntity,
        target: null,
        alertLevel: 0,
        lastKnownPosition: null
    },
    states: {
        patrol: {
            onUpdate: (dt, ctx) => {
                // Patrol logic
                if (detectPlayer(ctx.entity)) {
                    ctx.target = player;
                    ctx.alertLevel = 100;
                }
            },
            transitions: {
                detect: { target: 'chase', guard: ctx => ctx.target !== null }
            }
        },
        chase: {
            onUpdate: (dt, ctx) => {
                if (ctx.target) {
                    moveToward(ctx.entity, ctx.target.position);
                    ctx.lastKnownPosition = { ...ctx.target.position };

                    if (distanceTo(ctx.entity, ctx.target) < 2) {
                        ctx.entity.fsm.send('inRange');
                    }
                }
                ctx.alertLevel -= dt * 10;
            },
            transitions: {
                inRange: 'attack',
                lostTarget: {
                    target: 'search',
                    guard: ctx => !canSee(ctx.entity, ctx.target)
                },
                giveUp: {
                    target: 'patrol',
                    guard: ctx => ctx.alertLevel <= 0
                }
            }
        },
        attack: {
            onEnter: (ctx) => {
                performAttack(ctx.entity);
            },
            transitions: {
                cooldown: 'chase',
                targetDead: {
                    target: 'patrol',
                    guard: ctx => ctx.target?.getComponent(Health)?.value <= 0
                }
            }
        },
        search: {
            onUpdate: (dt, ctx) => {
                if (ctx.lastKnownPosition) {
                    moveToward(ctx.entity, ctx.lastKnownPosition);
                }
                ctx.alertLevel -= dt * 5;
            },
            transitions: {
                found: { target: 'chase', guard: ctx => canSee(ctx.entity, ctx.target) },
                giveUp: { target: 'patrol', guard: ctx => ctx.alertLevel <= 0 }
            }
        }
    }
});
```

## Animation State Machine

```typescript
const animationFSM = createStateMachine({
    initial: 'idle',
    states: {
        idle: {
            onEnter: () => playAnimation('idle', { loop: true }),
            transitions: {
                walk: 'walking',
                run: 'running',
                jump: 'jumping'
            }
        },
        walking: {
            onEnter: () => playAnimation('walk', { loop: true }),
            transitions: {
                stop: 'idle',
                run: 'running',
                jump: 'jumping'
            }
        },
        running: {
            onEnter: () => playAnimation('run', { loop: true }),
            transitions: {
                stop: 'idle',
                walk: 'walking',
                jump: 'jumping'
            }
        },
        jumping: {
            onEnter: () => playAnimation('jump', { loop: false }),
            transitions: {
                land: 'landing'
            }
        },
        landing: {
            onEnter: () => playAnimation('land', { loop: false }),
            transitions: {
                complete: 'idle'
            }
        }
    }
});
```
