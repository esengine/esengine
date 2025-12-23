/**
 * FBX Animation-Skeleton Debug Script
 * 调试 FBX 动画和骨骼的对应关系
 */

import { readFileSync } from 'fs';
import pako from 'pako';
const { inflate } = pako;

const FBX_TIME_SECOND = 46186158000n;
const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';

console.log(`=== Analyzing: ${filePath} ===\n`);

const buffer = readFileSync(filePath);
const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

// Parse FBX header
const version = view.getUint32(23, true);
console.log(`FBX Version: ${version}`);
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

    // Read properties
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
                    // Compressed - decompress with pako
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

    // Read children
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

console.log(`Root nodes: ${rootNodes.map(n => n.name).join(', ')}\n`);

// Find Objects and Connections
const objectsNode = rootNodes.find(n => n.name === 'Objects');
const connectionsNode = rootNodes.find(n => n.name === 'Connections');

if (!objectsNode || !connectionsNode) {
    console.log('Missing Objects or Connections node!');
    process.exit(1);
}

// Parse all connections
const connections = connectionsNode.children.map(c => ({
    type: c.properties[0].split('\0')[0],
    fromId: c.properties[1],
    toId: c.properties[2],
    property: c.properties[3]?.split?.('\0')[0]
}));

// Find Models (bones are usually LimbNode type)
const models = objectsNode.children
    .filter(n => n.name === 'Model')
    .map(n => ({
        id: n.properties[0],
        name: n.properties[1]?.split?.('\0')[0] || 'Model',
        type: n.properties[2]?.split?.('\0')[0] || ''
    }));

console.log(`=== MODELS (${models.length}) ===`);
models.forEach((m, i) => {
    console.log(`  [${i}] ID=${m.id}, name="${m.name}", type="${m.type}"`);
});

// Find AnimationCurveNodes
const curveNodes = objectsNode.children
    .filter(n => n.name === 'AnimationCurveNode')
    .map(n => {
        const id = n.properties[0];
        const name = n.properties[1]?.split?.('\0')[0] || '';
        return { id, name };
    });

console.log(`\n=== ANIMATION CURVE NODES (${curveNodes.length}) ===`);

// Find which models each AnimationCurveNode targets
const curveNodeTargets = new Map();
for (const conn of connections) {
    if (conn.type === 'OP' && conn.property?.includes('Lcl')) {
        // AnimationCurveNode -> Model connection
        const curveNode = curveNodes.find(cn => cn.id === conn.fromId);
        const model = models.find(m => m.id === conn.toId);
        if (curveNode && model) {
            const modelIndex = models.indexOf(model);
            if (!curveNodeTargets.has(conn.toId)) {
                curveNodeTargets.set(conn.toId, {
                    modelId: conn.toId,
                    modelIndex,
                    modelName: model.name,
                    properties: []
                });
            }
            curveNodeTargets.get(conn.toId).properties.push({
                curveNodeId: curveNode.id,
                curveNodeName: curveNode.name,
                property: conn.property
            });
        }
    }
}

console.log(`Animation targets ${curveNodeTargets.size} models:`);
for (const [modelId, info] of curveNodeTargets) {
    console.log(`  Model[${info.modelIndex}] "${info.modelName}" ID=${modelId}:`);
    for (const p of info.properties) {
        console.log(`    - ${p.property} (CurveNode: ${p.curveNodeName})`);
    }
}

// Find Deformers (Clusters)
const clusters = objectsNode.children
    .filter(n => n.name === 'Deformer' && n.properties[2]?.split?.('\0')[0] === 'Cluster')
    .map(n => ({
        id: n.properties[0],
        name: n.properties[1]?.split?.('\0')[0] || 'Cluster'
    }));

console.log(`\n=== CLUSTERS (Skin Deformers) (${clusters.length}) ===`);

// Find which models each Cluster is linked to (via Cluster -> Model connection)
const clusterToBone = new Map();

// First, let's see all connections involving clusters
console.log(`\nAll connections involving clusters (first 20):`);
let clusterConnCount = 0;
for (const conn of connections) {
    const clusterAsFrom = clusters.find(c => c.id === conn.fromId);
    const clusterAsTo = clusters.find(c => c.id === conn.toId);
    if (clusterAsFrom || clusterAsTo) {
        if (clusterConnCount < 20) {
            const fromName = clusterAsFrom?.name || models.find(m => m.id === conn.fromId)?.name || `ID=${conn.fromId}`;
            const toName = clusterAsTo?.name || models.find(m => m.id === conn.toId)?.name || `ID=${conn.toId}`;
            console.log(`  [${conn.type}] ${fromName} -> ${toName} (prop: ${conn.property || 'none'})`);
        }
        clusterConnCount++;
    }
}
console.log(`Total cluster connections: ${clusterConnCount}`);

// Try both directions for Cluster <-> Model connections
for (const conn of connections) {
    if (conn.type === 'OO') {
        // Cluster -> Model
        const clusterFrom = clusters.find(c => c.id === conn.fromId);
        const modelTo = models.find(m => m.id === conn.toId);
        if (clusterFrom && modelTo) {
            clusterToBone.set(clusterFrom.id, {
                clusterId: clusterFrom.id,
                clusterName: clusterFrom.name,
                boneModelId: conn.toId,
                boneModelIndex: models.indexOf(modelTo),
                boneModelName: modelTo.name
            });
        }

        // Model -> Cluster (reversed)
        const modelFrom = models.find(m => m.id === conn.fromId);
        const clusterTo = clusters.find(c => c.id === conn.toId);
        if (modelFrom && clusterTo) {
            clusterToBone.set(clusterTo.id, {
                clusterId: clusterTo.id,
                clusterName: clusterTo.name,
                boneModelId: conn.fromId,
                boneModelIndex: models.indexOf(modelFrom),
                boneModelName: modelFrom.name
            });
        }
    }
}

console.log(`Cluster -> Bone mappings (${clusterToBone.size}):`);
for (const [clusterId, info] of clusterToBone) {
    const hasAnimation = curveNodeTargets.has(info.boneModelId);
    console.log(`  Cluster "${info.clusterName}" -> Model[${info.boneModelIndex}] "${info.boneModelName}" ${hasAnimation ? '✓ HAS ANIMATION' : '✗ NO ANIMATION'}`);
}

// Summary
console.log(`\n=== SUMMARY ===`);
const animatedModels = [...curveNodeTargets.keys()];
const boneModels = [...clusterToBone.values()].map(b => b.boneModelId);

const bonesWithAnimation = boneModels.filter(id => curveNodeTargets.has(id));
const bonesWithoutAnimation = boneModels.filter(id => !curveNodeTargets.has(id));

console.log(`Total animated models: ${animatedModels.length}`);
console.log(`Total bone models: ${boneModels.length}`);
console.log(`Bones WITH animation: ${bonesWithAnimation.length}`);
console.log(`Bones WITHOUT animation: ${bonesWithoutAnimation.length}`);

if (bonesWithoutAnimation.length > 0) {
    console.log(`\nBones missing animation:`);
    for (const id of bonesWithoutAnimation.slice(0, 10)) {
        const info = [...clusterToBone.values()].find(b => b.boneModelId === id);
        console.log(`  - Model[${info.boneModelIndex}] "${info.boneModelName}"`);
    }
    if (bonesWithoutAnimation.length > 10) {
        console.log(`  ... and ${bonesWithoutAnimation.length - 10} more`);
    }
}

console.log('\nDone!');
