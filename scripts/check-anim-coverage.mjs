/**
 * Check Animation Coverage
 * 检查动画覆盖范围
 *
 * Verify if animation provides data for all skeleton joints
 */

import { readFileSync } from 'fs';
import pako from 'pako';
const { inflate } = pako;

const FBX_TIME_SECOND = 46186158000n;
const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';

console.log(`=== Check Animation Coverage: ${filePath} ===\n`);

const buffer = readFileSync(filePath);
const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
const version = view.getUint32(23, true);
const is64Bit = version >= 7500;

let offset = 27;

function readNode() {
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
            case 'Y': properties.push(view.getInt16(offset, true)); offset += 2; break;
            case 'C': properties.push(buffer[offset] !== 0); offset += 1; break;
            case 'I': properties.push(view.getInt32(offset, true)); offset += 4; break;
            case 'F': properties.push(view.getFloat32(offset, true)); offset += 4; break;
            case 'D': properties.push(view.getFloat64(offset, true)); offset += 8; break;
            case 'L': properties.push(view.getBigInt64(offset, true)); offset += 8; break;
            case 'S':
            case 'R':
                const strLen = view.getUint32(offset, true); offset += 4;
                if (typeCode === 'S') {
                    properties.push(new TextDecoder().decode(buffer.slice(offset, offset + strLen)));
                } else {
                    properties.push(buffer.slice(offset, offset + strLen));
                }
                offset += strLen;
                break;
            case 'f': case 'd': case 'l': case 'i': case 'b':
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

// Parse Models
const models = objectsNode.children
    .filter(n => n.name === 'Model')
    .map(n => ({
        id: n.properties[0],
        name: n.properties[1]?.split?.('\0')[0] || 'Model'
    }));

// Parse Clusters
const clusters = objectsNode.children
    .filter(n => n.name === 'Deformer' && n.properties[2]?.split?.('\0')[0] === 'Cluster')
    .map(n => ({
        id: n.properties[0],
        name: n.properties[1]?.split?.('\0')[0] || 'Cluster'
    }));

// Build cluster to bone mapping
const clusterToBone = new Map();
for (const conn of connections) {
    if (conn.type === 'OO') {
        const cluster = clusters.find(c => c.id === conn.toId);
        if (cluster) clusterToBone.set(cluster.id, conn.fromId);
    }
}

// Build model ID to index
const modelToIndex = new Map();
models.forEach((m, i) => modelToIndex.set(m.id, i));

// Build skeleton joints
const joints = [];
const boneModelIds = new Set();
for (const cluster of clusters) {
    const boneModelId = clusterToBone.get(cluster.id);
    if (!boneModelId) continue;

    const nodeIndex = modelToIndex.get(boneModelId);
    if (nodeIndex === undefined) continue;

    boneModelIds.add(boneModelId);
    joints.push({
        name: models[nodeIndex].name,
        nodeIndex,
        boneModelId
    });
}

console.log(`Skeleton joints: ${joints.length}`);
console.log(`Joint nodeIndices: ${[...new Set(joints.map(j => j.nodeIndex))].length} unique`);

// Parse AnimationCurveNodes and find which models they target
const curveNodes = objectsNode.children
    .filter(n => n.name === 'AnimationCurveNode')
    .map(n => ({
        id: n.properties[0],
        name: n.properties[1]?.split?.('\0')[0] || ''
    }));

// Build curveNode to model mapping (from OP connections)
const curveNodeToModel = new Map();
for (const conn of connections) {
    if (conn.type === 'OP' && conn.property?.includes('Lcl')) {
        const cn = curveNodes.find(c => c.id === conn.fromId);
        if (cn) {
            curveNodeToModel.set(cn.id, { modelId: conn.toId, property: conn.property });
        }
    }
}

// Find which joints have animation
const jointsWithAnimation = new Set();
const jointsWithTranslation = new Set();
const jointsWithRotation = new Set();
const jointsWithScale = new Set();

for (const [cnId, target] of curveNodeToModel) {
    const nodeIndex = modelToIndex.get(target.modelId);
    if (nodeIndex === undefined) continue;

    // Check if this node is a bone
    const joint = joints.find(j => j.nodeIndex === nodeIndex);
    if (joint) {
        jointsWithAnimation.add(nodeIndex);
        if (target.property.includes('Translation')) {
            jointsWithTranslation.add(nodeIndex);
        } else if (target.property.includes('Rotation')) {
            jointsWithRotation.add(nodeIndex);
        } else if (target.property.includes('Scaling')) {
            jointsWithScale.add(nodeIndex);
        }
    }
}

console.log(`\n=== ANIMATION COVERAGE ===`);
console.log(`Joints with ANY animation: ${jointsWithAnimation.size}/${joints.length}`);
console.log(`Joints with Translation: ${jointsWithTranslation.size}/${joints.length}`);
console.log(`Joints with Rotation: ${jointsWithRotation.size}/${joints.length}`);
console.log(`Joints with Scale: ${jointsWithScale.size}/${joints.length}`);

const jointsWithoutAnimation = joints.filter(j => !jointsWithAnimation.has(j.nodeIndex));
if (jointsWithoutAnimation.length > 0) {
    console.log(`\n⚠️ Joints WITHOUT animation (${jointsWithoutAnimation.length}):`);
    jointsWithoutAnimation.slice(0, 10).forEach(j => {
        console.log(`  nodeIndex=${j.nodeIndex}, name="${j.name}"`);
    });

    if (jointsWithoutAnimation.length > 10) {
        console.log(`  ... and ${jointsWithoutAnimation.length - 10} more`);
    }

    console.log(`\nThese joints will fall back to node.transform, which may cause issues!`);
} else {
    console.log(`\n✅ All joints have animation data!`);
}

console.log('\nDone!');
