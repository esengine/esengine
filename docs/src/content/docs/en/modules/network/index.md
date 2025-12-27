---
title: "Network System"
---

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

## Quick Setup with CLI

We recommend using ESEngine CLI to quickly create a complete game server project:

```bash
# Create project directory
mkdir my-game-server && cd my-game-server
npm init -y

# Initialize Node.js server with CLI
npx @esengine/cli init -p nodejs
```

The CLI will generate the following project structure:

```
my-game-server/
├── src/
│   ├── index.ts                    # Entry point
│   ├── server/
│   │   └── GameServer.ts           # Network server configuration
│   └── game/
│       ├── Game.ts                 # ECS game class
│       ├── scenes/
│       │   └── MainScene.ts        # Main scene
│       ├── components/             # ECS components
│       │   ├── PositionComponent.ts
│       │   └── VelocityComponent.ts
│       └── systems/                # ECS systems
│           └── MovementSystem.ts
├── tsconfig.json
├── package.json
└── README.md
```

Start the server:

```bash
# Development mode (hot reload)
npm run dev

# Production mode
npm run start
```

## Quick Start

### Client

```typescript
import { Core, Scene } from '@esengine/ecs-framework';
import {
    NetworkPlugin,
    NetworkIdentity,
    NetworkTransform
} from '@esengine/network';

// Define game scene
class GameScene extends Scene {
    initialize(): void {
        this.name = 'Game';
        // Network systems are automatically added by NetworkPlugin
    }
}

// Initialize Core
Core.create({ debug: false });
const scene = new GameScene();
Core.setScene(scene);

// Install network plugin
const networkPlugin = new NetworkPlugin();
await Core.installPlugin(networkPlugin);

// Register prefab factory
networkPlugin.registerPrefab('player', (scene, spawn) => {
    const entity = scene.createEntity(`player_${spawn.netId}`);

    const identity = entity.addComponent(new NetworkIdentity());
    identity.netId = spawn.netId;
    identity.ownerId = spawn.ownerId;
    identity.isLocalPlayer = spawn.ownerId === networkPlugin.networkService.localClientId;

    entity.addComponent(new NetworkTransform());
    return entity;
});

// Connect to server
const success = await networkPlugin.connect('ws://localhost:3000', 'PlayerName');
if (success) {
    console.log('Connected!');
}

// Game loop
function gameLoop(dt: number) {
    Core.update(dt);
}

// Disconnect
await networkPlugin.disconnect();
```

### Server

After creating a server project with CLI, the generated code already configures GameServer:

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
console.log('Server started on ws://localhost:3000');
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
type PrefabFactory = (scene: Scene, spawn: MsgSpawn) => Entity;
```

Register prefab factories for network entity creation:

```typescript
networkPlugin.registerPrefab('enemy', (scene, spawn) => {
    const entity = scene.createEntity(`enemy_${spawn.netId}`);

    const identity = entity.addComponent(new NetworkIdentity());
    identity.netId = spawn.netId;
    identity.ownerId = spawn.ownerId;

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
// Send input via NetworkPlugin (recommended)
networkPlugin.sendMoveInput(0, 1);      // Movement
networkPlugin.sendActionInput('jump');  // Action

// Or use inputSystem directly
const inputSystem = networkPlugin.inputSystem;
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
import { Core, Scene, EntitySystem, Matcher, Entity } from '@esengine/ecs-framework';
import {
    NetworkPlugin,
    NetworkIdentity,
    NetworkTransform
} from '@esengine/network';

// Define game scene
class GameScene extends Scene {
    initialize(): void {
        this.name = 'MultiplayerGame';
        // Network systems are automatically added by NetworkPlugin
        // Add custom systems
        this.addSystem(new LocalInputHandler());
    }
}

// Initialize
async function initGame() {
    Core.create({ debug: false });

    const scene = new GameScene();
    Core.setScene(scene);

    // Install network plugin
    const networkPlugin = new NetworkPlugin();
    await Core.installPlugin(networkPlugin);

    // Register player prefab
    networkPlugin.registerPrefab('player', (scene, spawn) => {
        const entity = scene.createEntity(`player_${spawn.netId}`);

        const identity = entity.addComponent(new NetworkIdentity());
        identity.netId = spawn.netId;
        identity.ownerId = spawn.ownerId;
        identity.isLocalPlayer = spawn.ownerId === networkPlugin.networkService.localClientId;

        entity.addComponent(new NetworkTransform());

        // If local player, add input marker
        if (identity.isLocalPlayer) {
            entity.addComponent(new LocalInputComponent());
        }

        return entity;
    });

    // Connect to server
    const success = await networkPlugin.connect('ws://localhost:3000', 'Player1');
    if (success) {
        console.log('Connected!');
    } else {
        console.error('Connection failed');
    }

    return networkPlugin;
}

// Game loop
function gameLoop(deltaTime: number) {
    Core.update(deltaTime);
}

initGame();
```

### Handling Input

```typescript
class LocalInputHandler extends EntitySystem {
    private _networkPlugin: NetworkPlugin | null = null;

    constructor() {
        super(Matcher.empty().all(NetworkIdentity, LocalInputComponent));
    }

    protected onAddedToScene(): void {
        // Get NetworkPlugin reference
        this._networkPlugin = Core.getPlugin(NetworkPlugin);
    }

    protected processEntity(entity: Entity, dt: number): void {
        if (!this._networkPlugin) return;

        const identity = entity.getComponent(NetworkIdentity)!;
        if (!identity.isLocalPlayer) return;

        // Read keyboard input
        let moveX = 0;
        let moveY = 0;

        if (keyboard.isPressed('A')) moveX -= 1;
        if (keyboard.isPressed('D')) moveX += 1;
        if (keyboard.isPressed('W')) moveY += 1;
        if (keyboard.isPressed('S')) moveY -= 1;

        if (moveX !== 0 || moveY !== 0) {
            this._networkPlugin.sendMoveInput(moveX, moveY);
        }

        if (keyboard.isJustPressed('Space')) {
            this._networkPlugin.sendActionInput('jump');
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
