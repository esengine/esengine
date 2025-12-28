---
title: "RPC Codecs"
description: "Serialization codecs for RPC communication"
---

Codecs handle serialization and deserialization of RPC messages. Two built-in codecs are available.

## Built-in Codecs

### JSON Codec (Default)

Human-readable, widely compatible:

```typescript
import { json } from '@esengine/rpc/codec';

const client = new RpcClient(protocol, url, {
    codec: json(),
});
```

**Pros:**
- Human-readable (easy debugging)
- No additional dependencies
- Universal browser support

**Cons:**
- Larger message size
- Slower serialization

### MessagePack Codec

Binary format, more efficient:

```typescript
import { msgpack } from '@esengine/rpc/codec';

const client = new RpcClient(protocol, url, {
    codec: msgpack(),
});
```

**Pros:**
- Smaller message size (~30-50% smaller)
- Faster serialization
- Supports binary data natively

**Cons:**
- Not human-readable
- Requires msgpack library

## Codec Interface

```typescript
interface Codec {
    /**
     * Encode packet to wire format
     */
    encode(packet: unknown): string | Uint8Array;

    /**
     * Decode wire format to packet
     */
    decode(data: string | Uint8Array): unknown;
}
```

## Custom Codec

Create your own codec for special needs:

```typescript
import type { Codec } from '@esengine/rpc/codec';

// Example: Compressed JSON codec
const compressedJson: () => Codec = () => ({
    encode(packet: unknown): Uint8Array {
        const json = JSON.stringify(packet);
        return compress(new TextEncoder().encode(json));
    },

    decode(data: string | Uint8Array): unknown {
        const bytes = typeof data === 'string'
            ? new TextEncoder().encode(data)
            : data;
        const decompressed = decompress(bytes);
        return JSON.parse(new TextDecoder().decode(decompressed));
    },
});

// Use custom codec
const client = new RpcClient(protocol, url, {
    codec: compressedJson(),
});
```

## Protocol Buffers Codec

For production games, consider Protocol Buffers:

```typescript
import type { Codec } from '@esengine/rpc/codec';

const protobuf = (schema: ProtobufSchema): Codec => ({
    encode(packet: unknown): Uint8Array {
        return schema.Packet.encode(packet).finish();
    },

    decode(data: string | Uint8Array): unknown {
        const bytes = typeof data === 'string'
            ? new TextEncoder().encode(data)
            : data;
        return schema.Packet.decode(bytes);
    },
});
```

## Matching Client and Server

Both client and server must use the same codec:

```typescript
// shared/codec.ts
import { msgpack } from '@esengine/rpc/codec';
export const gameCodec = msgpack();

// client.ts
import { gameCodec } from './shared/codec';
const client = new RpcClient(protocol, url, { codec: gameCodec });

// server.ts
import { gameCodec } from './shared/codec';
const server = serve(protocol, {
    port: 3000,
    codec: gameCodec,
    api: { /* ... */ },
});
```

## Performance Comparison

| Codec | Encode Speed | Decode Speed | Size |
|-------|-------------|--------------|------|
| JSON | Medium | Medium | Large |
| MessagePack | Fast | Fast | Small |
| Protobuf | Fastest | Fastest | Smallest |

For most games, MessagePack provides a good balance. Use Protobuf for high-performance requirements.

## Text Encoding Utilities

For custom codecs, utilities are provided:

```typescript
import { textEncode, textDecode } from '@esengine/rpc/codec';

// Works on all platforms (browser, Node.js, WeChat)
const bytes = textEncode('Hello');  // Uint8Array
const text = textDecode(bytes);     // 'Hello'
```
