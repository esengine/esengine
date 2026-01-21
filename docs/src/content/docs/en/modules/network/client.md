---
title: "Client Usage"
description: "NetworkPlugin, components and systems client-side guide"
---

## NetworkPlugin

NetworkPlugin is the core entry point for client-side networking, providing type-safe network communication based on `@esengine/rpc`.

### Basic Usage

```typescript
import { Core } from '@esengine/ecs-framework';
import { NetworkPlugin } from '@esengine/network';

// Create and install plugin
const networkPlugin = new NetworkPlugin();
await Core.installPlugin(networkPlugin);

// Connect to server
const success = await networkPlugin.connect({
    url: 'ws://localhost:3000',
    playerName: 'PlayerName',
    roomId: 'room-1'  // optional
});

// Disconnect
await networkPlugin.disconnect();
```

### Properties and Methods

```typescript
class NetworkPlugin {
    readonly name: string;
    readonly version: string;

    // Accessors
    get networkService(): GameNetworkService;
    get syncSystem(): NetworkSyncSystem;
    get spawnSystem(): NetworkSpawnSystem;
    get inputSystem(): NetworkInputSystem;
    get localPlayerId(): number;
    get isConnected(): boolean;

    // Connect to server
    connect(options: {
        url: string;
        playerName: string;
        roomId?: string;
    }): Promise<boolean>;

    // Disconnect
    disconnect(): Promise<void>;

    // Register prefab factory
    registerPrefab(prefabType: string, factory: PrefabFactory): void;

    // Send input
    sendMoveInput(x: number, y: number): void;
    sendActionInput(action: string): void;
}
```

## Components

### NetworkIdentity

Network identity component, required for every networked entity:

```typescript
class NetworkIdentity extends Component {
    netId: number;           // Network unique ID
    ownerId: number;         // Owner client ID
    bIsLocalPlayer: boolean; // Whether local player
    bHasAuthority: boolean;  // Whether has control authority
}
```

**Usage Example:**

```typescript
networkPlugin.registerPrefab('player', (scene, spawn) => {
    const entity = scene.createEntity(`player_${spawn.netId}`);

    const identity = entity.addComponent(new NetworkIdentity());
    identity.netId = spawn.netId;
    identity.ownerId = spawn.ownerId;
    identity.bIsLocalPlayer = spawn.ownerId === networkPlugin.localPlayerId;

    return entity;
});
```

### NetworkTransform

Network transform component for position and rotation sync:

```typescript
class NetworkTransform extends Component {
    position: { x: number; y: number };
    rotation: number;
    velocity: { x: number; y: number };
}
```

## Systems

### NetworkSyncSystem

Handles server state synchronization and interpolation:

- Receives server state snapshots
- Stores states in snapshot buffer
- Interpolates remote entities for smooth movement

### NetworkSpawnSystem

Handles network entity spawning and despawning:

- Listens for Spawn/Despawn messages
- Creates entities using registered prefab factories
- Manages network entity lifecycle

### NetworkInputSystem

Handles local player input network sending:

```typescript
class NetworkInputSystem extends EntitySystem {
    addMoveInput(x: number, y: number): void;
    addActionInput(action: string): void;
    clearInput(): void;
}
```

**Usage Example:**

```typescript
// Method 1: Via NetworkPlugin (recommended)
networkPlugin.sendMoveInput(0, 1);
networkPlugin.sendActionInput('jump');

// Method 2: Use inputSystem directly
const inputSystem = networkPlugin.inputSystem;
inputSystem.addMoveInput(0, 1);
inputSystem.addActionInput('jump');
```

## Prefab Factory

Prefab factories are used to create network entities:

```typescript
type PrefabFactory = (scene: Scene, spawn: SpawnData) => Entity;
```

**Complete Example:**

```typescript
// Register player prefab
networkPlugin.registerPrefab('player', (scene, spawn) => {
    const entity = scene.createEntity(`player_${spawn.netId}`);

    const identity = entity.addComponent(new NetworkIdentity());
    identity.netId = spawn.netId;
    identity.ownerId = spawn.ownerId;
    identity.bIsLocalPlayer = spawn.ownerId === networkPlugin.localPlayerId;

    entity.addComponent(new NetworkTransform());

    // Add input component for local player
    if (identity.bIsLocalPlayer) {
        entity.addComponent(new LocalInputComponent());
    }

    return entity;
});

// Register enemy prefab
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

## Handling Input

Create a custom input handling system:

```typescript
import { EntitySystem, Matcher, Entity } from '@esengine/ecs-framework';
import { NetworkPlugin, NetworkIdentity } from '@esengine/network';

class LocalInputHandler extends EntitySystem {
    private _networkPlugin: NetworkPlugin | null = null;

    constructor() {
        super(Matcher.empty().all(NetworkIdentity, LocalInputComponent));
    }

    protected onAddedToScene(): void {
        this._networkPlugin = Core.getPlugin(NetworkPlugin);
    }

    protected processEntity(entity: Entity, dt: number): void {
        if (!this._networkPlugin) return;

        const identity = entity.getComponent(NetworkIdentity)!;
        if (!identity.bIsLocalPlayer) return;

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

## Connection State Monitoring

Use `GameNetworkService` chainable API to listen for messages:

```typescript
const { networkService } = networkPlugin;

// Listen to state sync
networkService.onSync((data) => {
    console.log('Received sync data:', data.entities.length, 'entities');
});

// Listen to entity spawn
networkService.onSpawn((data) => {
    console.log('Entity spawned:', data.prefab, 'netId:', data.netId);
});

// Listen to entity despawn
networkService.onDespawn((data) => {
    console.log('Entity despawned:', data.netId);
});

// Set callbacks via connection options
await networkPlugin.connect({
    url: 'ws://localhost:3000',
    playerName: 'Player1',
    onConnect: () => console.log('Connected'),
    onDisconnect: (reason) => console.log('Disconnected:', reason),
    onError: (error) => console.error('Network error:', error)
});
```

## Best Practices

1. **Authority Check**: Use `bHasAuthority` to check if you have permission to modify an entity

2. **Local Player Identification**: Use `bIsLocalPlayer` to distinguish local and remote players

3. **Prefab Management**: Register corresponding prefab factories for each network entity type

4. **Input Sending**: Recommend using `NetworkPlugin.sendMoveInput()` and `sendActionInput()` methods
