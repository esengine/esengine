---
"@esengine/server": minor
"@esengine/rpc": patch
"@esengine/ecs-framework": patch
---

## @esengine/server

### New Features

- **Room Discovery APIs**: Built-in `ListRooms` and `GetRoomInfo` RPC APIs for querying available rooms with metadata
- **Session-based Reconnection**: `Room.reconnectGracePeriod` config + `ReconnectRoom` API + `Player.sessionToken` for seamless reconnect within grace period
- **Broadcast Exclude**: `broadcast(type, data, { exclude: player })` option to skip specific players
- **Room Metadata**: `Room.metadata` property visible in `ListRooms`/`GetRoomInfo` responses
- **JoinRoom Player Data**: `playerData` parameter in `JoinRoom` API to set initial `Player.data`
- **Duplicate Join Policy**: `duplicateJoinPolicy: 'auto-leave' | 'reject'` server config
- **Server Port**: `server.port` readonly property exposes actual listening port (supports `port: 0` auto-assignment)
- **Authenticate API**: Built-in `Authenticate` RPC API for client-side JWT/Session auth via `TestClient.authenticate(token)`
- **Player Connection State**: `Player.connected` getter, `send()`/`sendBinary()` no-op when disconnected
- **Room Lifecycle Hooks**: `onPlayerDisconnected()` and `onPlayerReconnected()` lifecycle methods

### TestClient Improvements

- `roomMessages` getter: auto-unwrapped room messages
- `binaryMessages` getter: parsed WebSocket binary frames
- `hasReceivedRoomMessage(type)` / `getRoomMessagesOfType<T>(type)` helpers
- `reconnectRoom(sessionToken?)` method
- `authenticate(token)` method
- `connect(query?)` supports URL query params

### Bug Fixes

- `server.stop()` no longer blocks when HTTP server has keep-alive connections
- ECSRoom auto-initializes `Core.create()` if not already created
- JWT provider ESM compatibility with `jsonwebtoken` CJS package
- `withAuth` injects `authenticate` onto original server for built-in API access

### Breaking Changes

- `broadcastExcept()` is deprecated in favor of `broadcast(type, data, { exclude })` (still works but shows deprecation)

## @esengine/rpc

### Bug Fixes

- Fix member delimiter semicolons for stricter linting

## @esengine/ecs-framework

### New Features

- Standalone profiler entry point: `@esengine/ecs-framework/profiler` for tree-shaking

### Bug Fixes

- `World.createScene()` uses function overloads instead of unsafe `as unknown as T` cast
- Eliminated `as any` type assertions across ECS core, Debug, Profiler, Sync, Serialization modules
- `IScene.sceneData` typed as `Map<string, unknown>` instead of `Map<string, any>`
- `IPathfindingMap` interface adds optional `width`/`height` for grid-based pathfinders
- `ChunkStreamingSystem` prevents concurrent `processLoads` race condition
