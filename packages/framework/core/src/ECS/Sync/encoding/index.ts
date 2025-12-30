/**
 * @zh 二进制编解码模块
 * @en Binary encoding/decoding module
 *
 * @zh 提供 ECS Component 状态的二进制序列化和反序列化功能
 * @en Provides binary serialization and deserialization for ECS Component state
 */

// Variable-length integer encoding
export {
    varintSize,
    encodeVarint,
    decodeVarint,
    zigzagEncode,
    zigzagDecode,
    encodeSignedVarint,
    decodeSignedVarint
} from './varint';

// Binary writer/reader
export { BinaryWriter } from './BinaryWriter';
export { BinaryReader } from './BinaryReader';

// Encoder
export {
    encodeComponentFull,
    encodeComponentDelta,
    encodeEntity,
    encodeSnapshot,
    encodeSpawn,
    encodeDespawn,
    encodeDespawnBatch
} from './Encoder';

// Decoder
export {
    decodeComponent,
    decodeEntity,
    decodeSnapshot,
    decodeSpawn,
    decodeDespawn,
    processDespawn
} from './Decoder';

export type {
    DecodeEntityResult,
    DecodeSnapshotResult,
    DecodeSpawnResult,
    DecodeDespawnResult
} from './Decoder';
