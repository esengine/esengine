# State Machine (FSM)

`@esengine/fsm` provides a type-safe finite state machine implementation for characters, AI, or any scenario requiring state management.

## Installation

```bash
npm install @esengine/fsm
```

## Quick Start

```typescript
import { createStateMachine } from '@esengine/fsm';

// Define state types
type PlayerState = 'idle' | 'walk' | 'run' | 'jump';

// Create state machine
const fsm = createStateMachine<PlayerState>('idle');

// Define states with callbacks
fsm.defineState('idle', {
    onEnter: (ctx, from) => console.log(`Entered idle from ${from}`),
    onExit: (ctx, to) => console.log(`Exiting idle to ${to}`),
    onUpdate: (ctx, dt) => { /* Update every frame */ }
});

fsm.defineState('walk', {
    onEnter: () => console.log('Started walking')
});

// Manual transition
fsm.transition('walk');

console.log(fsm.current); // 'walk'
```

## Core Concepts

### State Configuration

Each state can be configured with the following callbacks:

```typescript
interface StateConfig<TState, TContext> {
    name: TState;                                    // State name
    onEnter?: (context: TContext, from: TState | null) => void;  // Enter callback
    onExit?: (context: TContext, to: TState) => void;            // Exit callback
    onUpdate?: (context: TContext, deltaTime: number) => void;   // Update callback
    tags?: string[];                                 // State tags
    metadata?: Record<string, unknown>;              // Metadata
}
```

### Transition Conditions

Define conditional state transitions:

```typescript
interface Context {
    isMoving: boolean;
    isRunning: boolean;
    isGrounded: boolean;
}

const fsm = createStateMachine<PlayerState, Context>('idle', {
    context: { isMoving: false, isRunning: false, isGrounded: true }
});

// Define transition conditions
fsm.defineTransition('idle', 'walk', (ctx) => ctx.isMoving);
fsm.defineTransition('walk', 'run', (ctx) => ctx.isRunning);
fsm.defineTransition('walk', 'idle', (ctx) => !ctx.isMoving);

// Automatically evaluate and execute matching transitions
fsm.evaluateTransitions();
```

### Transition Priority

When multiple transitions are valid, higher priority executes first:

```typescript
// Higher priority number = higher priority
fsm.defineTransition('idle', 'attack', (ctx) => ctx.isAttacking, 10);
fsm.defineTransition('idle', 'walk', (ctx) => ctx.isMoving, 1);

// If both conditions are met, 'attack' (priority 10) is tried first
```

## API Reference

### createStateMachine

```typescript
function createStateMachine<TState extends string, TContext = unknown>(
    initialState: TState,
    options?: StateMachineOptions<TContext>
): IStateMachine<TState, TContext>
```

**Parameters:**
- `initialState` - Initial state
- `options.context` - Context object, accessible in callbacks
- `options.maxHistorySize` - Maximum history entries (default 100)
- `options.enableHistory` - Enable history tracking (default true)

### State Machine Properties

| Property | Type | Description |
|----------|------|-------------|
| `current` | `TState` | Current state |
| `previous` | `TState \| null` | Previous state |
| `context` | `TContext` | Context object |
| `isTransitioning` | `boolean` | Whether currently transitioning |
| `currentStateDuration` | `number` | Current state duration (ms) |

### State Machine Methods

#### State Definition

```typescript
// Define state
fsm.defineState('idle', {
    onEnter: (ctx, from) => {},
    onExit: (ctx, to) => {},
    onUpdate: (ctx, dt) => {}
});

// Check if state exists
fsm.hasState('idle'); // true

// Get state configuration
fsm.getStateConfig('idle');

// Get all states
fsm.getStates(); // ['idle', 'walk', ...]
```

#### Transition Operations

```typescript
// Define transition
fsm.defineTransition('idle', 'walk', condition, priority);

// Remove transition
fsm.removeTransition('idle', 'walk');

// Get transitions from state
fsm.getTransitionsFrom('idle');

// Check if transition is possible
fsm.canTransition('walk'); // true/false

// Manual transition
fsm.transition('walk');

// Force transition (ignore conditions)
fsm.transition('walk', true);

// Auto-evaluate transition conditions
fsm.evaluateTransitions();
```

#### Lifecycle

```typescript
// Update state machine (calls current state's onUpdate)
fsm.update(deltaTime);

// Reset state machine
fsm.reset(); // Reset to current state
fsm.reset('idle'); // Reset to specified state
```

#### Event Listeners

```typescript
// Listen to entering specific state
const unsubscribe = fsm.onEnter('walk', (from) => {
    console.log(`Entered walk from ${from}`);
});

// Listen to exiting specific state
fsm.onExit('walk', (to) => {
    console.log(`Exiting walk to ${to}`);
});

// Listen to any state change
fsm.onChange((event) => {
    console.log(`${event.from} -> ${event.to} at ${event.timestamp}`);
});

// Unsubscribe
unsubscribe();
```

#### Debugging

```typescript
// Get state history
const history = fsm.getHistory();
// [{ from: 'idle', to: 'walk', timestamp: 1234567890 }, ...]

// Clear history
fsm.clearHistory();

// Get debug info
const info = fsm.getDebugInfo();
// { current, previous, duration, stateCount, transitionCount, historySize }
```

## Practical Examples

### Character State Machine

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

// Define states
characterFSM.defineState('idle', {
    onEnter: (ctx) => { ctx.speed = 0; }
});

characterFSM.defineState('walk', {
    onEnter: (ctx) => { ctx.speed = 100; }
});

characterFSM.defineState('run', {
    onEnter: (ctx) => { ctx.speed = 200; }
});

// Define transitions
characterFSM.defineTransition('idle', 'walk', (ctx) => Math.abs(ctx.velocity.x) > 0);
characterFSM.defineTransition('walk', 'idle', (ctx) => ctx.velocity.x === 0);
characterFSM.defineTransition('walk', 'run', (ctx) => Math.abs(ctx.velocity.x) > 150);

// Jump has highest priority
characterFSM.defineTransition('idle', 'jump', (ctx) => !ctx.isGrounded, 10);
characterFSM.defineTransition('walk', 'jump', (ctx) => !ctx.isGrounded, 10);

// Game loop usage
function gameUpdate(dt: number) {
    // Update context
    characterFSM.context.velocity.x = getInputVelocity();
    characterFSM.context.isGrounded = checkGrounded();

    // Evaluate transitions
    characterFSM.evaluateTransitions();

    // Update current state
    characterFSM.update(dt);
}
```

### ECS Integration

```typescript
import { Component, EntitySystem, Matcher } from '@esengine/ecs-framework';
import { createStateMachine, type IStateMachine } from '@esengine/fsm';

// State machine component
class FSMComponent extends Component {
    fsm: IStateMachine<string>;

    constructor(initialState: string) {
        super();
        this.fsm = createStateMachine(initialState);
    }
}

// State machine system
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

## Blueprint Nodes

The FSM module provides blueprint nodes for visual scripting:

- `GetCurrentState` - Get current state
- `TransitionTo` - Transition to specified state
- `CanTransition` - Check if transition is possible
- `IsInState` - Check if in specified state
- `WasInState` - Check if was ever in specified state
- `GetStateDuration` - Get state duration
- `EvaluateTransitions` - Evaluate transition conditions
- `ResetStateMachine` - Reset state machine
