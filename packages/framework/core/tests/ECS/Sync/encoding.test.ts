import { BinaryWriter } from '../../../src/ECS/Sync/encoding/BinaryWriter';
import { BinaryReader } from '../../../src/ECS/Sync/encoding/BinaryReader';
import { Component } from '../../../src/ECS/Component';
import { ECSComponent } from '../../../src/ECS/Decorators';
import { Scene } from '../../../src/ECS/Scene';
import { sync, initChangeTracker, clearChanges } from '../../../src/ECS/Sync/decorators';
import {
    encodeSnapshot,
    encodeSpawn,
    encodeDespawn,
    encodeDespawnBatch
} from '../../../src/ECS/Sync/encoding/Encoder';
import {
    decodeSnapshot,
    decodeSpawn,
    processDespawn
} from '../../../src/ECS/Sync/encoding/Decoder';
import { SyncOperation } from '../../../src/ECS/Sync/types';

@ECSComponent('EncodingTest_PlayerComponent')
class PlayerComponent extends Component {
    @sync("string") name: string = "";
    @sync("uint16") score: number = 0;
    @sync("float32") x: number = 0;
    @sync("float32") y: number = 0;
}

@ECSComponent('EncodingTest_AllTypesComponent')
class AllTypesComponent extends Component {
    @sync("boolean") boolField: boolean = false;
    @sync("int8") int8Field: number = 0;
    @sync("uint8") uint8Field: number = 0;
    @sync("int16") int16Field: number = 0;
    @sync("uint16") uint16Field: number = 0;
    @sync("int32") int32Field: number = 0;
    @sync("uint32") uint32Field: number = 0;
    @sync("float32") float32Field: number = 0;
    @sync("float64") float64Field: number = 0;
    @sync("string") stringField: string = "";
}

describe('BinaryWriter/BinaryReader - 二进制读写器测试', () => {
    describe('基本数值类型', () => {
        test('writeUint8/readUint8', () => {
            const writer = new BinaryWriter();
            writer.writeUint8(0);
            writer.writeUint8(127);
            writer.writeUint8(255);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readUint8()).toBe(0);
            expect(reader.readUint8()).toBe(127);
            expect(reader.readUint8()).toBe(255);
        });

        test('writeInt8/readInt8', () => {
            const writer = new BinaryWriter();
            writer.writeInt8(-128);
            writer.writeInt8(0);
            writer.writeInt8(127);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readInt8()).toBe(-128);
            expect(reader.readInt8()).toBe(0);
            expect(reader.readInt8()).toBe(127);
        });

        test('writeBoolean/readBoolean', () => {
            const writer = new BinaryWriter();
            writer.writeBoolean(true);
            writer.writeBoolean(false);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readBoolean()).toBe(true);
            expect(reader.readBoolean()).toBe(false);
        });

        test('writeUint16/readUint16', () => {
            const writer = new BinaryWriter();
            writer.writeUint16(0);
            writer.writeUint16(32767);
            writer.writeUint16(65535);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readUint16()).toBe(0);
            expect(reader.readUint16()).toBe(32767);
            expect(reader.readUint16()).toBe(65535);
        });

        test('writeInt16/readInt16', () => {
            const writer = new BinaryWriter();
            writer.writeInt16(-32768);
            writer.writeInt16(0);
            writer.writeInt16(32767);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readInt16()).toBe(-32768);
            expect(reader.readInt16()).toBe(0);
            expect(reader.readInt16()).toBe(32767);
        });

        test('writeUint32/readUint32', () => {
            const writer = new BinaryWriter();
            writer.writeUint32(0);
            writer.writeUint32(2147483647);
            writer.writeUint32(4294967295);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readUint32()).toBe(0);
            expect(reader.readUint32()).toBe(2147483647);
            expect(reader.readUint32()).toBe(4294967295);
        });

        test('writeInt32/readInt32', () => {
            const writer = new BinaryWriter();
            writer.writeInt32(-2147483648);
            writer.writeInt32(0);
            writer.writeInt32(2147483647);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readInt32()).toBe(-2147483648);
            expect(reader.readInt32()).toBe(0);
            expect(reader.readInt32()).toBe(2147483647);
        });

        test('writeFloat32/readFloat32', () => {
            const writer = new BinaryWriter();
            writer.writeFloat32(0);
            writer.writeFloat32(3.14);
            writer.writeFloat32(-100.5);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readFloat32()).toBe(0);
            expect(reader.readFloat32()).toBeCloseTo(3.14, 5);
            expect(reader.readFloat32()).toBeCloseTo(-100.5, 5);
        });

        test('writeFloat64/readFloat64', () => {
            const writer = new BinaryWriter();
            writer.writeFloat64(0);
            writer.writeFloat64(Math.PI);
            writer.writeFloat64(-1e100);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readFloat64()).toBe(0);
            expect(reader.readFloat64()).toBe(Math.PI);
            expect(reader.readFloat64()).toBe(-1e100);
        });
    });

    describe('变长整数 (Varint)', () => {
        test('小值 (1字节)', () => {
            const writer = new BinaryWriter();
            writer.writeVarint(0);
            writer.writeVarint(127);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readVarint()).toBe(0);
            expect(reader.readVarint()).toBe(127);
        });

        test('中等值 (2字节)', () => {
            const writer = new BinaryWriter();
            writer.writeVarint(128);
            writer.writeVarint(16383);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readVarint()).toBe(128);
            expect(reader.readVarint()).toBe(16383);
        });

        test('大值 (多字节)', () => {
            const writer = new BinaryWriter();
            writer.writeVarint(16384);
            writer.writeVarint(1000000);
            writer.writeVarint(2147483647);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readVarint()).toBe(16384);
            expect(reader.readVarint()).toBe(1000000);
            expect(reader.readVarint()).toBe(2147483647);
        });
    });

    describe('字符串', () => {
        test('空字符串', () => {
            const writer = new BinaryWriter();
            writer.writeString("");

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readString()).toBe("");
        });

        test('ASCII 字符串', () => {
            const writer = new BinaryWriter();
            writer.writeString("Hello, World!");

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readString()).toBe("Hello, World!");
        });

        test('Unicode 字符串', () => {
            const writer = new BinaryWriter();
            writer.writeString("你好世界");
            writer.writeString("日本語テスト");
            writer.writeString("emoji: 🎮🎯");

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readString()).toBe("你好世界");
            expect(reader.readString()).toBe("日本語テスト");
            expect(reader.readString()).toBe("emoji: 🎮🎯");
        });

        test('混合字符串', () => {
            const writer = new BinaryWriter();
            writer.writeString("Player_玩家_プレイヤー");

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.readString()).toBe("Player_玩家_プレイヤー");
        });
    });

    describe('字节数组', () => {
        test('writeBytes/readBytes', () => {
            const writer = new BinaryWriter();
            const data = new Uint8Array([1, 2, 3, 4, 5]);
            writer.writeBytes(data);

            const reader = new BinaryReader(writer.toUint8Array());
            const result = reader.readBytes(5);
            expect(Array.from(result)).toEqual([1, 2, 3, 4, 5]);
        });
    });

    describe('BinaryReader 辅助方法', () => {
        test('remaining 应该返回剩余字节数', () => {
            const writer = new BinaryWriter();
            writer.writeUint32(100);
            writer.writeUint32(200);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.remaining).toBe(8);

            reader.readUint32();
            expect(reader.remaining).toBe(4);
        });

        test('hasMore 应该正确判断', () => {
            const writer = new BinaryWriter();
            writer.writeUint8(1);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.hasMore()).toBe(true);

            reader.readUint8();
            expect(reader.hasMore()).toBe(false);
        });

        test('peekUint8 不应该移动读取位置', () => {
            const writer = new BinaryWriter();
            writer.writeUint8(42);
            writer.writeUint8(99);

            const reader = new BinaryReader(writer.toUint8Array());
            expect(reader.peekUint8()).toBe(42);
            expect(reader.peekUint8()).toBe(42);
            expect(reader.offset).toBe(0);
        });

        test('skip 应该跳过指定字节', () => {
            const writer = new BinaryWriter();
            writer.writeUint8(1);
            writer.writeUint8(2);
            writer.writeUint8(3);

            const reader = new BinaryReader(writer.toUint8Array());
            reader.skip(2);
            expect(reader.readUint8()).toBe(3);
        });

        test('读取超出范围应该抛出错误', () => {
            const reader = new BinaryReader(new Uint8Array([1, 2]));

            expect(() => reader.readUint32()).toThrow();
        });
    });

    describe('BinaryWriter 自动扩容', () => {
        test('应该自动扩容', () => {
            const writer = new BinaryWriter(4);

            for (let i = 0; i < 100; i++) {
                writer.writeUint32(i);
            }

            expect(writer.offset).toBe(400);

            const reader = new BinaryReader(writer.toUint8Array());
            for (let i = 0; i < 100; i++) {
                expect(reader.readUint32()).toBe(i);
            }
        });

        test('reset 应该清空数据但保留缓冲区', () => {
            const writer = new BinaryWriter();
            writer.writeUint32(100);
            writer.writeUint32(200);

            expect(writer.offset).toBe(8);

            writer.reset();

            expect(writer.offset).toBe(0);
            expect(writer.toUint8Array().length).toBe(0);
        });
    });
});

describe('Encoder/Decoder - 实体编解码测试', () => {
    let scene: Scene;

    // Components are auto-registered via @ECSComponent decorator

    beforeEach(() => {
        scene = new Scene();
    });

    describe('encodeSnapshot/decodeSnapshot', () => {
        test('应该编码和解码单个实体', () => {
            const entity = scene.createEntity('Player1');
            const comp = entity.addComponent(new PlayerComponent());
            comp.name = "TestPlayer";
            comp.score = 100;
            comp.x = 10.5;
            comp.y = 20.5;
            initChangeTracker(comp);

            const data = encodeSnapshot([entity], SyncOperation.FULL);

            const targetScene = new Scene();
            const result = decodeSnapshot(targetScene, data);

            expect(result.operation).toBe(SyncOperation.FULL);
            expect(result.entities.length).toBe(1);
            expect(result.entities[0].isNew).toBe(true);

            const decodedEntity = targetScene.entities.buffer[0];
            expect(decodedEntity).toBeDefined();

            const decodedComp = decodedEntity!.getComponent(PlayerComponent);
            expect(decodedComp).not.toBeNull();
            expect(decodedComp!.name).toBe("TestPlayer");
            expect(decodedComp!.score).toBe(100);
            expect(decodedComp!.x).toBeCloseTo(10.5, 5);
            expect(decodedComp!.y).toBeCloseTo(20.5, 5);
        });

        test('应该编码和解码多个实体', () => {
            const entity1 = scene.createEntity('Player1');
            const comp1 = entity1.addComponent(new PlayerComponent());
            comp1.name = "Player1";
            comp1.score = 50;
            initChangeTracker(comp1);

            const entity2 = scene.createEntity('Player2');
            const comp2 = entity2.addComponent(new PlayerComponent());
            comp2.name = "Player2";
            comp2.score = 100;
            initChangeTracker(comp2);

            const data = encodeSnapshot([entity1, entity2], SyncOperation.FULL);

            const targetScene = new Scene();
            const result = decodeSnapshot(targetScene, data);

            expect(result.entities.length).toBe(2);
        });

        test('DELTA 操作应该只编码变更的字段', () => {
            const entity = scene.createEntity('Player1');
            const comp = entity.addComponent(new PlayerComponent());
            comp.name = "TestPlayer";
            comp.score = 0;
            initChangeTracker(comp);
            clearChanges(comp);

            comp.score = 200;

            const deltaData = encodeSnapshot([entity], SyncOperation.DELTA);

            expect(deltaData[0]).toBe(SyncOperation.DELTA);
            expect(deltaData.length).toBeLessThan(50);
        });
    });

    describe('encodeSpawn/decodeSpawn', () => {
        test('应该编码和解码实体生成', () => {
            const entity = scene.createEntity('SpawnedEntity');
            const comp = entity.addComponent(new PlayerComponent());
            comp.name = "SpawnedPlayer";
            comp.score = 50;
            comp.x = 100;
            comp.y = 200;
            initChangeTracker(comp);

            const data = encodeSpawn(entity, 'Player');

            const targetScene = new Scene();
            const result = decodeSpawn(targetScene, data);

            expect(result).not.toBeNull();
            expect(result!.prefabType).toBe('Player');
            expect(result!.componentTypes).toContain('EncodingTest_PlayerComponent');

            const decodedComp = result!.entity.getComponent(PlayerComponent);
            expect(decodedComp!.name).toBe("SpawnedPlayer");
            expect(decodedComp!.score).toBe(50);
        });

        test('没有 prefabType 应该也能工作', () => {
            const entity = scene.createEntity('Entity');
            const comp = entity.addComponent(new PlayerComponent());
            initChangeTracker(comp);

            const data = encodeSpawn(entity);

            const targetScene = new Scene();
            const result = decodeSpawn(targetScene, data);

            expect(result!.prefabType).toBe('');
        });
    });

    describe('encodeDespawn/processDespawn', () => {
        test('应该编码和处理单个实体销毁', () => {
            const targetScene = new Scene();
            const entity = targetScene.createEntity('ToBeDestroyed');
            const entityId = entity.id;

            const data = encodeDespawn(entityId);

            expect(data[0]).toBe(SyncOperation.DESPAWN);

            const removedIds = processDespawn(targetScene, data);

            expect(removedIds).toContain(entityId);
        });

        test('应该编码和处理批量实体销毁', () => {
            const targetScene = new Scene();
            const entity1 = targetScene.createEntity('Entity1');
            const entity2 = targetScene.createEntity('Entity2');
            const entity3 = targetScene.createEntity('Entity3');

            const data = encodeDespawnBatch([entity1.id, entity2.id, entity3.id]);

            expect(data[0]).toBe(SyncOperation.DESPAWN);

            const removedIds = processDespawn(targetScene, data);

            expect(removedIds.length).toBe(3);
            expect(removedIds).toContain(entity1.id);
            expect(removedIds).toContain(entity2.id);
            expect(removedIds).toContain(entity3.id);
        });
    });

    describe('所有同步类型编解码', () => {
        test('应该正确编解码所有类型', () => {
            const entity = scene.createEntity('AllTypes');
            const comp = entity.addComponent(new AllTypesComponent());
            comp.boolField = true;
            comp.int8Field = -100;
            comp.uint8Field = 200;
            comp.int16Field = -30000;
            comp.uint16Field = 60000;
            comp.int32Field = -2000000000;
            comp.uint32Field = 4000000000;
            comp.float32Field = 3.14159;
            comp.float64Field = Math.PI;
            comp.stringField = "测试字符串";
            initChangeTracker(comp);

            const data = encodeSnapshot([entity], SyncOperation.FULL);

            const targetScene = new Scene();
            decodeSnapshot(targetScene, data);

            const decodedEntity = targetScene.entities.buffer[0];
            const decodedComp = decodedEntity!.getComponent(AllTypesComponent);

            expect(decodedComp!.boolField).toBe(true);
            expect(decodedComp!.int8Field).toBe(-100);
            expect(decodedComp!.uint8Field).toBe(200);
            expect(decodedComp!.int16Field).toBe(-30000);
            expect(decodedComp!.uint16Field).toBe(60000);
            expect(decodedComp!.int32Field).toBe(-2000000000);
            expect(decodedComp!.uint32Field).toBe(4000000000);
            expect(decodedComp!.float32Field).toBeCloseTo(3.14159, 4);
            expect(decodedComp!.float64Field).toBe(Math.PI);
            expect(decodedComp!.stringField).toBe("测试字符串");
        });
    });

    describe('边界情况', () => {
        test('空实体列表应该能编码', () => {
            const data = encodeSnapshot([], SyncOperation.FULL);

            const targetScene = new Scene();
            const result = decodeSnapshot(targetScene, data);

            expect(result.entities.length).toBe(0);
        });

        test('entityMap 应该正确跟踪实体', () => {
            const entity = scene.createEntity('Tracked');
            const comp = entity.addComponent(new PlayerComponent());
            comp.name = "TrackedPlayer";
            initChangeTracker(comp);

            const data = encodeSnapshot([entity], SyncOperation.FULL);

            const targetScene = new Scene();
            const entityMap = new Map();
            decodeSnapshot(targetScene, data, entityMap);

            expect(entityMap.size).toBe(1);
        });
    });
});
