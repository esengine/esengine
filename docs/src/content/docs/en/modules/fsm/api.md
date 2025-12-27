---
title: "API Reference"
description: "Complete FSM API documentation"
---

## createStateMachine

```typescript
function createStateMachine<TContext = unknown>(
    config: StateMachineConfig<TContext>
): StateMachine<TContext>
```

### Configuration

```typescript
interface StateMachineConfig<TContext> {
    initial: string;
    context?: TContext;
    states: Record<string, StateDefinition<TContext>>;
    onTransition?: (from: string, to: string, event: string) => void;
}
```

## StateMachine Instance

### Properties

```typescript
// Current state
fsm.current: string

// Context object
fsm.context: TContext

// Get state definition
fsm.getState(name: string): StateDefinition | undefined

// Check if in specific state
fsm.is(state: string): boolean
```

### Methods

```typescript
// Send event to trigger transition
fsm.send(event: string): boolean

// Force transition (no guards, no event matching)
fsm.transitionTo(state: string): void

// Update current state (call onUpdate if exists)
fsm.update(dt: number): void

// Reset to initial state
fsm.reset(): void
```

## State Definition

```typescript
interface StateDefinition<TContext> {
    // Called on entering state
    onEnter?: (context: TContext) => void;

    // Called on exiting state
    onExit?: (context: TContext) => void;

    // Called on each update
    onUpdate?: (dt: number, context: TContext) => void;

    // Valid transitions from this state
    transitions: Record<string, string | TransitionConfig>;
}
```

## Transition Configuration

```typescript
interface TransitionConfig {
    target: string;
    guard?: (context: TContext) => boolean;
    action?: (context: TContext) => void;
}
```

## Complete Example

```typescript
interface PlayerContext {
    health: number;
    stamina: number;
    isGrounded: boolean;
}

const playerFSM = createStateMachine<PlayerContext>({
    initial: 'idle',
    context: {
        health: 100,
        stamina: 100,
        isGrounded: true
    },
    states: {
        idle: {
            onEnter: (ctx) => console.log('Idle'),
            onUpdate: (dt, ctx) => {
                ctx.stamina = Math.min(100, ctx.stamina + dt * 10);
            },
            transitions: {
                move: 'walking',
                jump: {
                    target: 'jumping',
                    guard: (ctx) => ctx.isGrounded && ctx.stamina >= 20
                },
                attack: {
                    target: 'attacking',
                    guard: (ctx) => ctx.stamina >= 30
                }
            }
        },
        walking: {
            onUpdate: (dt, ctx) => {
                ctx.stamina = Math.max(0, ctx.stamina - dt * 5);
            },
            transitions: {
                stop: 'idle',
                jump: {
                    target: 'jumping',
                    guard: (ctx) => ctx.isGrounded
                }
            }
        },
        jumping: {
            onEnter: (ctx) => {
                ctx.isGrounded = false;
                ctx.stamina -= 20;
            },
            transitions: {
                land: {
                    target: 'idle',
                    action: (ctx) => { ctx.isGrounded = true; }
                }
            }
        },
        attacking: {
            onEnter: (ctx) => {
                ctx.stamina -= 30;
            },
            transitions: {
                finish: 'idle'
            }
        }
    },
    onTransition: (from, to, event) => {
        console.log(`${from} -> ${to} (${event})`);
    }
});
```
