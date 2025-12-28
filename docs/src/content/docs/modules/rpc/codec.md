---
title: "RPC 编解码器"
description: "RPC 通信的序列化编解码器"
---

编解码器负责 RPC 消息的序列化和反序列化。内置两种编解码器。

## 内置编解码器

### JSON 编解码器（默认）

人类可读，兼容性好：

```typescript
import { json } from '@esengine/rpc/codec';

const client = new RpcClient(protocol, url, {
    codec: json(),
});
```

**优点：**
- 人类可读（方便调试）
- 无额外依赖
- 浏览器普遍支持

**缺点：**
- 消息体积较大
- 序列化速度较慢

### MessagePack 编解码器

二进制格式，更高效：

```typescript
import { msgpack } from '@esengine/rpc/codec';

const client = new RpcClient(protocol, url, {
    codec: msgpack(),
});
```

**优点：**
- 消息体积更小（约小30-50%）
- 序列化速度更快
- 原生支持二进制数据

**缺点：**
- 不可读
- 需要 msgpack 库

## 编解码器接口

```typescript
interface Codec {
    /**
     * 将数据包编码为传输格式
     */
    encode(packet: unknown): string | Uint8Array;

    /**
     * 将传输格式解码为数据包
     */
    decode(data: string | Uint8Array): unknown;
}
```

## 自定义编解码器

为特殊需求创建自己的编解码器：

```typescript
import type { Codec } from '@esengine/rpc/codec';

// 示例：压缩 JSON 编解码器
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

// 使用自定义编解码器
const client = new RpcClient(protocol, url, {
    codec: compressedJson(),
});
```

## Protocol Buffers 编解码器

对于生产级游戏，考虑使用 Protocol Buffers：

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

## 客户端与服务器匹配

客户端和服务器必须使用相同的编解码器：

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

## 性能对比

| 编解码器 | 编码速度 | 解码速度 | 体积 |
|----------|----------|----------|------|
| JSON | 中等 | 中等 | 大 |
| MessagePack | 快 | 快 | 小 |
| Protobuf | 最快 | 最快 | 最小 |

对于大多数游戏，MessagePack 提供了良好的平衡。对于高性能需求使用 Protobuf。

## 文本编码工具

为自定义编解码器提供工具函数：

```typescript
import { textEncode, textDecode } from '@esengine/rpc/codec';

// 在所有平台上工作（浏览器、Node.js、微信）
const bytes = textEncode('Hello');  // Uint8Array
const text = textDecode(bytes);     // 'Hello'
```
