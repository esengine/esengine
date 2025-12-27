---
title: "Client Usage"
description: "NetworkPlugin, components and systems client-side guide"
---

## NetworkPlugin

NetworkPlugin is the core entry point for client-side networking.

### Basic Usage

```typescript
import { Core } from '@esengine/ecs-framework';
import { NetworkPlugin } from '@esengine/network';

// Create and install plugin
const networkPlugin = new NetworkPlugin();
await Core.installPlugin(networkPlugin);

// Connect to server
const success = await networkPlugin.connect('ws://localhost:3000', 'PlayerName');

// Disconnect
await networkPlugin.disconnect();
```

### Properties and Methods

```typescript
class NetworkPlugin {
    readonly name: string;
    readonly version: string;

    // Accessors
    get networkService(): NetworkService;
    get syncSystem(): NetworkSyncSystem;
    get spawnSystem(): NetworkSpawnSystem;
    get inputSystem(): NetworkInputSystem;
    get isConnected(): boolean;

    // Connect to server
    connect(serverUrl: string, playerName: string, roomId?: string): Promise<boolean>;

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

Handles server state synchronization and interpolation.

### NetworkSpawnSystem

Handles network entity spawning and despawning.

### NetworkInputSystem

Handles local player input sending:

```typescript
// Via NetworkPlugin (recommended)
networkPlugin.sendMoveInput(0, 1);
networkPlugin.sendActionInput('jump');

// Or use inputSystem directly
networkPlugin.inputSystem.addMoveInput(0, 1);
```

## Prefab Factory

```typescript
networkPlugin.registerPrefab('player', (scene, spawn) => {
    const entity = scene.createEntity(`player_${spawn.netId}`);

    const identity = entity.addComponent(new NetworkIdentity());
    identity.netId = spawn.netId;
    identity.ownerId = spawn.ownerId;
    identity.bIsLocalPlayer = spawn.ownerId === networkPlugin.networkService.clientId;

    entity.addComponent(new NetworkTransform());

    if (identity.bIsLocalPlayer) {
        entity.addComponent(new LocalInputComponent());
    }

    return entity;
});
```

## Connection State Monitoring

```typescript
networkPlugin.networkService.setCallbacks({
    onConnected: (clientId, roomId) => {
        console.log(`Connected: client ${clientId}, room ${roomId}`);
    },
    onDisconnected: () => {
        console.log('Disconnected');
    },
    onError: (error) => {
        console.error('Network error:', error);
    }
});
```
