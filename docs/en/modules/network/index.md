# Network System

`@esengine/network` provides a TSRPC-based client-server network synchronization solution for multiplayer games, including entity synchronization, input handling, and state interpolation.

## Overview

The network module consists of three packages:

| Package | Description |
|---------|-------------|
| `@esengine/network` | Client-side ECS plugin |
| `@esengine/network-protocols` | Shared protocol definitions |
| `@esengine/network-server` | Server-side implementation |

## Installation

```bash
# Client
npm install @esengine/network

# Server
npm install @esengine/network-server
```

## Quick Start

### Client

```typescript
import { World } from '@esengine/ecs-framework';
import {
    NetworkPlugin,
    NetworkIdentity,
    NetworkTransform
} from '@esengine/network';

// Create World and install network plugin
const world = new World();
const networkPlugin = new NetworkPlugin({
    serverUrl: 'ws://localhost:3000'
});
networkPlugin.install(world.services);

// Register prefab factory
networkPlugin.registerPrefab('player', (netId, ownerId) => {
    const entity = world.createEntity(`player_${netId}`);
    entity.addComponent(new NetworkIdentity(netId, ownerId));
    entity.addComponent(new NetworkTransform());
    // Add other components...
    return entity;
});

// Connect to server
await networkPlugin.connect('PlayerName');
console.log('Connected! Client ID:', networkPlugin.localPlayerId);

// Disconnect
networkPlugin.disconnect();
```

### Server

```typescript
import { GameServer } from '@esengine/network-server';

const server = new GameServer({
    port: 3000,
    roomConfig: {
        maxPlayers: 16,
        tickRate: 20
    }
});

await server.start();
```

## Core Concepts

### Architecture

```
Client                              Server
┌────────────────┐                ┌────────────────┐
│ NetworkPlugin  │◄──── WS ────► │  GameServer    │
│ ├─ Service     │                │  ├─ Room       │
│ ├─ SyncSystem  │                │  └─ Players    │
│ ├─ SpawnSystem │                └────────────────┘
│ └─ InputSystem │
└────────────────┘
```

### Components

#### NetworkIdentity

Network identity component, required for every networked entity:

```typescript
class NetworkIdentity extends Component {
    netId: number;           // Network unique ID
    ownerId: number;         // Owner client ID
    bIsLocalPlayer: boolean; // Whether local player
    bHasAuthority: boolean;  // Whether has control authority
}
```

#### NetworkTransform

Network transform component for position and rotation sync:

```typescript
class NetworkTransform extends Component {
    position: { x: number; y: number };
    rotation: number;
    velocity: { x: number; y: number };
}
```

### Systems

#### NetworkSyncSystem

Handles server state synchronization and interpolation:

- Receives server state snapshots
- Stores states in snapshot buffer
- Performs interpolation for remote entities

#### NetworkSpawnSystem

Handles network entity spawning and despawning:

- Listens for Spawn/Despawn messages
- Creates entities using registered prefab factories
- Manages networked entity lifecycle

#### NetworkInputSystem

Handles local player input sending:

- Collects local player input
- Sends input to server
- Supports movement and action inputs

## API Reference

### NetworkPlugin

```typescript
class NetworkPlugin {
    constructor(config: INetworkPluginConfig);

    // Install plugin
    install(services: ServiceContainer): void;

    // Connect to server
    connect(playerName: string, roomId?: string): Promise<void>;

    // Disconnect
    disconnect(): void;

    // Register prefab factory
    registerPrefab(prefab: string, factory: PrefabFactory): void;

    // Properties
    readonly localPlayerId: number | null;
    readonly isConnected: boolean;
}
```

**Configuration:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `serverUrl` | `string` | Yes | WebSocket server URL |

### NetworkService

Network service managing WebSocket connections:

```typescript
class NetworkService {
    // Connection state
    readonly state: ENetworkState;
    readonly isConnected: boolean;
    readonly clientId: number | null;
    readonly roomId: string | null;

    // Connection control
    connect(serverUrl: string): Promise<void>;
    disconnect(): void;

    // Join room
    join(playerName: string, roomId?: string): Promise<ResJoin>;

    // Send input
    sendInput(input: IPlayerInput): void;

    // Event callbacks
    setCallbacks(callbacks: Partial<INetworkCallbacks>): void;
}
```

**Network state enum:**

```typescript
enum ENetworkState {
    Disconnected = 'disconnected',
    Connecting = 'connecting',
    Connected = 'connected',
    Joining = 'joining',
    Joined = 'joined'
}
```

**Callbacks interface:**

```typescript
interface INetworkCallbacks {
    onConnected?: () => void;
    onDisconnected?: () => void;
    onJoined?: (clientId: number, roomId: string) => void;
    onSync?: (msg: MsgSync) => void;
    onSpawn?: (msg: MsgSpawn) => void;
    onDespawn?: (msg: MsgDespawn) => void;
}
```

### Prefab Factory

```typescript
type PrefabFactory = (netId: number, ownerId: number) => Entity;
```

Register prefab factories for network entity creation:

```typescript
networkPlugin.registerPrefab('enemy', (netId, ownerId) => {
    const entity = world.createEntity(`enemy_${netId}`);
    entity.addComponent(new NetworkIdentity(netId, ownerId));
    entity.addComponent(new NetworkTransform());
    entity.addComponent(new EnemyComponent());
    return entity;
});
```

### Input System

#### NetworkInputSystem

```typescript
class NetworkInputSystem extends EntitySystem {
    // Add movement input
    addMoveInput(x: number, y: number): void;

    // Add action input
    addActionInput(action: string): void;

    // Clear input
    clearInput(): void;
}
```

Usage example:

```typescript
const inputSystem = world.getSystem(NetworkInputSystem);

// Handle keyboard input
if (keyboard.isPressed('W')) {
    inputSystem.addMoveInput(0, 1);
}
if (keyboard.isPressed('Space')) {
    inputSystem.addActionInput('jump');
}
```

## State Synchronization

### Snapshot Buffer

Stores server state snapshots for interpolation:

```typescript
import { createSnapshotBuffer, type IStateSnapshot } from '@esengine/network';

const buffer = createSnapshotBuffer<IStateSnapshot>({
    maxSnapshots: 30,          // Max snapshots
    interpolationDelay: 100    // Interpolation delay (ms)
});

// Add snapshot
buffer.addSnapshot({
    time: serverTime,
    entities: states
});

// Get interpolated state
const interpolated = buffer.getInterpolatedState(clientTime);
```

### Transform Interpolators

#### Linear Interpolator

```typescript
import { createTransformInterpolator } from '@esengine/network';

const interpolator = createTransformInterpolator();

// Add state
interpolator.addState(time, { x: 0, y: 0, rotation: 0 });

// Get interpolated result
const state = interpolator.getInterpolatedState(currentTime);
```

#### Hermite Interpolator

Uses Hermite splines for smoother interpolation:

```typescript
import { createHermiteTransformInterpolator } from '@esengine/network';

const interpolator = createHermiteTransformInterpolator({
    bufferSize: 10
});

// Add state with velocity
interpolator.addState(time, {
    x: 100,
    y: 200,
    rotation: 0,
    vx: 5,
    vy: 0
});

// Get smooth interpolated result
const state = interpolator.getInterpolatedState(currentTime);
```

### Client Prediction

Implement client-side prediction with server reconciliation:

```typescript
import { createClientPrediction } from '@esengine/network';

const prediction = createClientPrediction({
    maxPredictedInputs: 60,
    reconciliationThreshold: 0.1
});

// Predict input
const seq = prediction.predict(inputState, currentState, (state, input) => {
    // Apply input to state
    return applyInput(state, input);
});

// Server reconciliation
const corrected = prediction.reconcile(
    serverState,
    serverSeq,
    (state, input) => applyInput(state, input)
);
```

## Server Side

### GameServer

```typescript
import { GameServer } from '@esengine/network-server';

const server = new GameServer({
    port: 3000,
    roomConfig: {
        maxPlayers: 16,    // Max players per room
        tickRate: 20       // Sync rate (Hz)
    }
});

// Start server
await server.start();

// Get room
const room = server.getOrCreateRoom('room-id');

// Stop server
await server.stop();
```

### Room

```typescript
class Room {
    readonly id: string;
    readonly playerCount: number;
    readonly isFull: boolean;

    // Add player
    addPlayer(name: string, connection: Connection): IPlayer | null;

    // Remove player
    removePlayer(clientId: number): void;

    // Get player
    getPlayer(clientId: number): IPlayer | undefined;

    // Handle input
    handleInput(clientId: number, input: IPlayerInput): void;

    // Destroy room
    destroy(): void;
}
```

**Player interface:**

```typescript
interface IPlayer {
    clientId: number;        // Client ID
    name: string;            // Player name
    connection: Connection;  // Connection object
    netId: number;           // Network entity ID
}
```

## Protocol Types

### Message Types

```typescript
// State sync message
interface MsgSync {
    time: number;
    entities: IEntityState[];
}

// Entity state
interface IEntityState {
    netId: number;
    pos?: Vec2;
    rot?: number;
}

// Spawn message
interface MsgSpawn {
    netId: number;
    ownerId: number;
    prefab: string;
    pos: Vec2;
    rot: number;
}

// Despawn message
interface MsgDespawn {
    netId: number;
}

// Input message
interface MsgInput {
    input: IPlayerInput;
}

// Player input
interface IPlayerInput {
    seq?: number;
    moveDir?: Vec2;
    actions?: string[];
}
```

### API Types

```typescript
// Join request
interface ReqJoin {
    playerName: string;
    roomId?: string;
}

// Join response
interface ResJoin {
    clientId: number;
    roomId: string;
    playerCount: number;
}
```

## Blueprint Nodes

The network module provides blueprint nodes for visual scripting:

- `IsLocalPlayer` - Check if entity is local player
- `IsServer` - Check if running on server
- `HasAuthority` - Check if has authority over entity
- `GetNetworkId` - Get entity's network ID
- `GetLocalPlayerId` - Get local player ID

## Service Tokens

For dependency injection:

```typescript
import {
    NetworkServiceToken,
    NetworkSyncSystemToken,
    NetworkSpawnSystemToken,
    NetworkInputSystemToken
} from '@esengine/network';

// Get service
const networkService = services.get(NetworkServiceToken);
```

## Practical Example

### Complete Multiplayer Client

```typescript
import { World, EntitySystem, Matcher } from '@esengine/ecs-framework';
import {
    NetworkPlugin,
    NetworkIdentity,
    NetworkTransform,
    NetworkInputSystem
} from '@esengine/network';

// Create game world
const world = new World();

// Configure network plugin
const networkPlugin = new NetworkPlugin({
    serverUrl: 'ws://localhost:3000'
});
networkPlugin.install(world.services);

// Register player prefab
networkPlugin.registerPrefab('player', (netId, ownerId) => {
    const entity = world.createEntity(`player_${netId}`);

    const identity = new NetworkIdentity(netId, ownerId);
    entity.addComponent(identity);
    entity.addComponent(new NetworkTransform());

    // If local player, add input component
    if (identity.bIsLocalPlayer) {
        entity.addComponent(new LocalInputComponent());
    }

    return entity;
});

// Connect to server
async function startGame() {
    try {
        await networkPlugin.connect('Player1');
        console.log('Connected! Player ID:', networkPlugin.localPlayerId);
    } catch (error) {
        console.error('Connection failed:', error);
    }
}

// Game loop
function gameLoop(deltaTime: number) {
    world.update(deltaTime);
}

startGame();
```

### Handling Input

```typescript
class LocalInputHandler extends EntitySystem {
    private _inputSystem: NetworkInputSystem;

    constructor() {
        super(Matcher.all(NetworkIdentity, LocalInputComponent));
    }

    protected onAddedToWorld(): void {
        this._inputSystem = this.world.getSystem(NetworkInputSystem);
    }

    protected processEntity(entity: Entity, dt: number): void {
        const identity = entity.getComponent(NetworkIdentity);
        if (!identity.bIsLocalPlayer) return;

        // Read keyboard input
        let moveX = 0;
        let moveY = 0;

        if (keyboard.isPressed('A')) moveX -= 1;
        if (keyboard.isPressed('D')) moveX += 1;
        if (keyboard.isPressed('W')) moveY += 1;
        if (keyboard.isPressed('S')) moveY -= 1;

        if (moveX !== 0 || moveY !== 0) {
            this._inputSystem.addMoveInput(moveX, moveY);
        }

        if (keyboard.isJustPressed('Space')) {
            this._inputSystem.addActionInput('jump');
        }
    }
}
```

## Best Practices

1. **Set appropriate sync rate**: Choose `tickRate` based on game type, action games typically need 20-60 Hz

2. **Use interpolation delay**: Set appropriate `interpolationDelay` to balance latency and smoothness

3. **Client prediction**: Use client-side prediction for local players to reduce input lag

4. **Prefab management**: Register prefab factories for each networked entity type

5. **Authority checks**: Use `bHasAuthority` to check entity control permissions

6. **Connection state**: Monitor connection state changes, handle reconnection

```typescript
networkService.setCallbacks({
    onConnected: () => console.log('Connected'),
    onDisconnected: () => {
        console.log('Disconnected');
        // Handle reconnection logic
    }
});
```
