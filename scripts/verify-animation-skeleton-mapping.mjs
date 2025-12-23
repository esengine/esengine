/**
 * Verify Animation-Skeleton Mapping
 * 验证动画通道和骨骼关节的 nodeIndex 映射关系
 *
 * This script simulates the exact data flow from FBXLoader to ModelPreview3D
 * 此脚本模拟 FBXLoader 到 ModelPreview3D 的完整数据流
 */

import { readFileSync } from 'fs';
import pako from 'pako';
const { inflate } = pako;

const FBX_TIME_SECOND = 46186158000n;
const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';

console.log(`=== Analyzing: ${filePath} ===\n`);

const buffer = readFileSync(filePath);
const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
const version = view.getUint32(23, true);
const is64Bit = version >= 7500;

let offset = 27;

function readNode() {
    const startOffset = offset;
    let endOffset, numProperties, propertyListLen, nameLen;

    if (is64Bit) {
        endOffset = Number(view.getBigUint64(offset, true));
        numProperties = Number(view.getBigUint64(offset + 8, true));
        propertyListLen = Number(view.getBigUint64(offset + 16, true));
        nameLen = view.getUint8(offset + 24);
        offset += 25;
    } else {
        endOffset = view.getUint32(offset, true);
        numProperties = view.getUint32(offset + 4, true);
        propertyListLen = view.getUint32(offset + 8, true);
        nameLen = view.getUint8(offset + 12);
        offset += 13;
    }

    if (endOffset === 0) return null;

    const name = new TextDecoder().decode(buffer.slice(offset, offset + nameLen));
    offset += nameLen;

    const properties = [];
    const propsEnd = offset + propertyListLen;

    while (offset < propsEnd) {
        const typeCode = String.fromCharCode(buffer[offset]);
        offset++;

        switch (typeCode) {
            case 'Y':
                properties.push(view.getInt16(offset, true));
                offset += 2;
                break;
            case 'C':
                properties.push(buffer[offset] !== 0);
                offset += 1;
                break;
            case 'I':
                properties.push(view.getInt32(offset, true));
                offset += 4;
                break;
            case 'F':
                properties.push(view.getFloat32(offset, true));
                offset += 4;
                break;
            case 'D':
                properties.push(view.getFloat64(offset, true));
                offset += 8;
                break;
            case 'L':
                properties.push(view.getBigInt64(offset, true));
                offset += 8;
                break;
            case 'S':
            case 'R':
                const strLen = view.getUint32(offset, true);
                offset += 4;
                if (typeCode === 'S') {
                    properties.push(new TextDecoder().decode(buffer.slice(offset, offset + strLen)));
                } else {
                    properties.push(buffer.slice(offset, offset + strLen));
                }
                offset += strLen;
                break;
            case 'f':
            case 'd':
            case 'l':
            case 'i':
            case 'b':
                const arrayLen = view.getUint32(offset, true);
                const encoding = view.getUint32(offset + 4, true);
                const compressedLen = view.getUint32(offset + 8, true);
                offset += 12;

                if (encoding === 0) {
                    const elemSize = typeCode === 'd' || typeCode === 'l' ? 8 : 4;
                    const arr = [];
                    for (let i = 0; i < arrayLen; i++) {
                        if (typeCode === 'd') arr.push(view.getFloat64(offset + i * 8, true));
                        else if (typeCode === 'f') arr.push(view.getFloat32(offset + i * 4, true));
                        else if (typeCode === 'l') arr.push(view.getBigInt64(offset + i * 8, true));
                        else if (typeCode === 'i') arr.push(view.getInt32(offset + i * 4, true));
                    }
                    properties.push({ type: typeCode, data: arr });
                    offset += arrayLen * elemSize;
                } else {
                    const compData = buffer.slice(offset, offset + compressedLen);
                    try {
                        const decompressed = inflate(compData);
                        const elemSize = typeCode === 'd' || typeCode === 'l' ? 8 : 4;
                        const dataView = new DataView(decompressed.buffer, decompressed.byteOffset, decompressed.byteLength);
                        const arr = [];
                        for (let i = 0; i < arrayLen; i++) {
                            if (typeCode === 'd') arr.push(dataView.getFloat64(i * 8, true));
                            else if (typeCode === 'f') arr.push(dataView.getFloat32(i * 4, true));
                            else if (typeCode === 'l') arr.push(dataView.getBigInt64(i * 8, true));
                            else if (typeCode === 'i') arr.push(dataView.getInt32(i * 4, true));
                        }
                        properties.push({ type: typeCode, data: arr });
                    } catch (e) {
                        properties.push({ type: typeCode, compressed: true, len: arrayLen });
                    }
                    offset += compressedLen;
                }
                break;
            default:
                offset = propsEnd;
        }
    }

    const children = [];
    while (offset < endOffset) {
        const child = readNode();
        if (child) children.push(child);
        else break;
    }

    offset = endOffset;
    return { name, properties, children };
}

// Parse root nodes
const rootNodes = [];
while (offset < buffer.length - 100) {
    const node = readNode();
    if (node) rootNodes.push(node);
    else break;
}

const objectsNode = rootNodes.find(n => n.name === 'Objects');
const connectionsNode = rootNodes.find(n => n.name === 'Connections');

// Parse connections
const connections = connectionsNode.children.map(c => ({
    type: c.properties[0].split('\0')[0],
    fromId: c.properties[1],
    toId: c.properties[2],
    property: c.properties[3]?.split?.('\0')[0]
}));

// Parse Models (this creates the 'models' array - same as in FBXLoader)
const models = objectsNode.children
    .filter(n => n.name === 'Model')
    .map(n => ({
        id: n.properties[0],
        name: n.properties[1]?.split?.('\0')[0] || 'Model',
        type: n.properties[2]?.split?.('\0')[0] || ''
    }));

// Build modelToIndex (simulating FBXLoader line 237-240)
const modelToIndex = new Map();
models.forEach((model, index) => {
    modelToIndex.set(model.id, index);
});

console.log(`Total models: ${models.length}`);
console.log(`First 10 models:`);
models.slice(0, 10).forEach((m, i) => {
    console.log(`  [${i}] ID=${m.id}, name="${m.name}", type="${m.type}"`);
});

// Parse Clusters
const clusters = objectsNode.children
    .filter(n => n.name === 'Deformer' && n.properties[2]?.split?.('\0')[0] === 'Cluster')
    .map(n => ({
        id: n.properties[0],
        name: n.properties[1]?.split?.('\0')[0] || 'Cluster'
    }));

// Build cluster to bone mapping (simulating FBXLoader line 1658-1670)
const clusterToBone = new Map();
for (const conn of connections) {
    if (conn.type === 'OO') {
        const cluster = clusters.find(c => c.id === conn.toId);
        if (cluster) {
            clusterToBone.set(cluster.id, conn.fromId);
        }
    }
}

// Build skeleton joints (simulating FBXLoader line 1682-1717)
const joints = [];
const boneModelIdToJointIndex = new Map();

for (const cluster of clusters) {
    const boneModelId = clusterToBone.get(cluster.id);
    if (!boneModelId) continue;

    const nodeIndex = modelToIndex.get(boneModelId);
    if (nodeIndex === undefined) continue;

    const model = models[nodeIndex];
    const jointIndex = joints.length;
    boneModelIdToJointIndex.set(boneModelId, jointIndex);

    joints.push({
        name: model.name,
        nodeIndex,  // This is model index in models array
        boneModelId
    });
}

console.log(`\n=== SKELETON JOINTS (${joints.length}) ===`);
console.log(`First 10 joints:`);
joints.slice(0, 10).forEach((j, i) => {
    console.log(`  Joint[${i}] nodeIndex=${j.nodeIndex}, name="${j.name}"`);
});

// Parse AnimationCurveNodes
const curveNodes = objectsNode.children
    .filter(n => n.name === 'AnimationCurveNode')
    .map(n => ({
        id: n.properties[0],
        name: n.properties[1]?.split?.('\0')[0] || ''
    }));

// Build animation channel targets (simulating FBXLoader line 1337-1443)
// For each curveNode, find which model it targets
const curveNodeToModel = new Map();
for (const conn of connections) {
    if (conn.type === 'OP' && conn.property?.includes('Lcl')) {
        const curveNode = curveNodes.find(cn => cn.id === conn.fromId);
        if (curveNode) {
            curveNodeToModel.set(curveNode.id, conn.toId);
        }
    }
}

// Build animation channels (simulating FBXLoader buildAnimations)
const animationChannels = [];
for (const curveNode of curveNodes) {
    const targetModelId = curveNodeToModel.get(curveNode.id);
    if (!targetModelId) continue;

    const nodeIndex = modelToIndex.get(targetModelId);
    if (nodeIndex === undefined) continue;

    animationChannels.push({
        curveNodeName: curveNode.name,
        targetModelId,
        nodeIndex,  // This should match joint.nodeIndex
        targetModelName: models[nodeIndex]?.name
    });
}

console.log(`\n=== ANIMATION CHANNELS (${animationChannels.length}) ===`);
const uniqueTargetIndices = [...new Set(animationChannels.map(c => c.nodeIndex))];
console.log(`Unique target nodeIndices: ${uniqueTargetIndices.length}`);
console.log(`First 10 channel targets:`);
animationChannels.slice(0, 10).forEach((c, i) => {
    console.log(`  Channel[${i}] nodeIndex=${c.nodeIndex}, target="${c.targetModelName}", type="${c.curveNodeName}"`);
});

// NOW THE KEY CHECK: Do animation channel nodeIndices match joint nodeIndices?
console.log(`\n=== CRITICAL CHECK: Animation-Skeleton Mapping ===`);

const jointNodeIndices = new Set(joints.map(j => j.nodeIndex));
const animNodeIndices = new Set(animationChannels.map(c => c.nodeIndex));

console.log(`Skeleton joint nodeIndices: ${jointNodeIndices.size}`);
console.log(`Animation target nodeIndices: ${animNodeIndices.size}`);

// Check intersection
const matchingIndices = [...jointNodeIndices].filter(idx => animNodeIndices.has(idx));
const jointsWithoutAnim = [...jointNodeIndices].filter(idx => !animNodeIndices.has(idx));
const animWithoutJoint = [...animNodeIndices].filter(idx => !jointNodeIndices.has(idx));

console.log(`\nJoints WITH matching animation: ${matchingIndices.length}/${joints.length}`);
console.log(`Joints WITHOUT animation: ${jointsWithoutAnim.length}`);
console.log(`Animation targets that are NOT joints: ${animWithoutJoint.length}`);

if (jointsWithoutAnim.length > 0) {
    console.log(`\n⚠️ WARNING: Some joints have no animation!`);
    console.log(`Missing animation for joints:`);
    jointsWithoutAnim.slice(0, 10).forEach(idx => {
        const joint = joints.find(j => j.nodeIndex === idx);
        console.log(`  nodeIndex=${idx}, name="${joint?.name}"`);
    });
}

if (animWithoutJoint.length > 0) {
    console.log(`\nAnimation targets that are not skeleton joints:`);
    animWithoutJoint.slice(0, 10).forEach(idx => {
        const model = models[idx];
        console.log(`  nodeIndex=${idx}, name="${model?.name}", type="${model?.type}"`);
    });
}

// Simulate ModelPreview3D's sampleAnimation lookup
console.log(`\n=== SIMULATING ModelPreview3D LOOKUP ===`);
console.log(`When ModelPreview3D calls: animTransforms.get(joint.nodeIndex)`);

// Create a mock animTransforms map (like sampleAnimation returns)
const mockAnimTransforms = new Map();
for (const channel of animationChannels) {
    if (!mockAnimTransforms.has(channel.nodeIndex)) {
        mockAnimTransforms.set(channel.nodeIndex, { hasData: true });
    }
}

let matchCount = 0;
let missCount = 0;
for (const joint of joints) {
    if (mockAnimTransforms.has(joint.nodeIndex)) {
        matchCount++;
    } else {
        missCount++;
        if (missCount <= 5) {
            console.log(`  ❌ Joint "${joint.name}" (nodeIndex=${joint.nodeIndex}) has NO animation data!`);
        }
    }
}

console.log(`\n✅ Joints with animation data: ${matchCount}/${joints.length}`);
console.log(`❌ Joints WITHOUT animation data: ${missCount}/${joints.length}`);

if (missCount === 0) {
    console.log(`\n🎉 All joints have matching animation data! The mapping is correct.`);
    console.log(`The issue must be elsewhere in the pipeline.`);
} else {
    console.log(`\n⚠️ PROBLEM FOUND: ${missCount} joints have no animation data!`);
    console.log(`This explains why the animation doesn't work correctly.`);
}

console.log('\nDone!');
