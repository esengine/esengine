/**
 * Verify Mesh Skinning Data
 * 验证网格蒙皮数据
 *
 * Check if joints/weights arrays in the mesh are correctly mapped
 * to skeleton joint indices.
 */

import { readFileSync } from 'fs';
import pako from 'pako';
const { inflate } = pako;

const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';

console.log(`=== Verifying Mesh Skinning Data: ${filePath} ===\n`);

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

// Parse Geometries
const geometries = objectsNode.children
    .filter(n => n.name === 'Geometry')
    .map(n => {
        const verticesNode = n.children.find(c => c.name === 'Vertices');
        const vertices = verticesNode?.properties[0]?.data || [];
        return {
            id: n.properties[0],
            name: n.properties[1]?.split?.('\0')[0] || 'Geometry',
            vertexCount: vertices.length / 3
        };
    });

console.log(`Found ${geometries.length} geometries`);
geometries.forEach(g => {
    console.log(`  Geometry: "${g.name}", ${g.vertexCount} vertices`);
});

// Parse Deformers (Skin and Cluster)
const deformers = objectsNode.children
    .filter(n => n.name === 'Deformer')
    .map(n => {
        const deformer = {
            id: n.properties[0],
            name: n.properties[1]?.split?.('\0')[0] || '',
            type: n.properties[2]?.split?.('\0')[0] || ''
        };

        if (deformer.type === 'Cluster') {
            const indexesNode = n.children.find(c => c.name === 'Indexes');
            const weightsNode = n.children.find(c => c.name === 'Weights');
            deformer.indexes = indexesNode?.properties[0]?.data || [];
            deformer.weights = weightsNode?.properties[0]?.data || [];
        }

        return deformer;
    });

const skins = deformers.filter(d => d.type === 'Skin');
const clusters = deformers.filter(d => d.type === 'Cluster');

console.log(`\nFound ${skins.length} skins, ${clusters.length} clusters`);

// Build cluster-to-skeleton-joint mapping (same as FBXLoader)
// First, find which bone each cluster is connected to
const clusterToBone = new Map();
for (const conn of connections) {
    if (conn.type === 'OO') {
        const cluster = clusters.find(c => c.id === conn.toId);
        if (cluster) {
            clusterToBone.set(cluster.id, conn.fromId);
        }
    }
}

// Build skeleton joints (same order as FBXLoader)
const joints = [];
const clusterToJointIndex = new Map();

for (const cluster of clusters) {
    const boneModelId = clusterToBone.get(cluster.id);
    if (!boneModelId) continue;

    const jointIndex = joints.length;
    clusterToJointIndex.set(cluster.id, jointIndex);
    joints.push({
        name: cluster.name,
        clusterId: cluster.id,
        boneModelId
    });
}

console.log(`\nBuilt ${joints.length} skeleton joints`);
console.log(`First 5 joints:`);
joints.slice(0, 5).forEach((j, i) => {
    console.log(`  Joint[${i}] name="${j.name}"`);
});

// Build Skin -> Clusters mapping
const skinClusters = new Map();
for (const conn of connections) {
    if (conn.type === 'OO') {
        const skin = skins.find(s => s.id === conn.toId);
        const cluster = clusters.find(c => c.id === conn.fromId);
        if (skin && cluster) {
            if (!skinClusters.has(skin.id)) {
                skinClusters.set(skin.id, []);
            }
            skinClusters.get(skin.id).push(cluster);
        }
    }
}

// Build Geometry -> Skin mapping
const geometrySkin = new Map();
for (const conn of connections) {
    if (conn.type === 'OO') {
        const geom = geometries.find(g => g.id === conn.toId);
        const skin = skins.find(s => s.id === conn.fromId);
        if (geom && skin) {
            geometrySkin.set(geom.id, skin.id);
        }
    }
}

// Now simulate buildSkinningData
console.log(`\n=== SIMULATING buildSkinningData ===`);

for (const [geomId, skinId] of geometrySkin) {
    const geom = geometries.find(g => g.id === geomId);
    const clusterList = skinClusters.get(skinId);

    if (!geom || !clusterList || clusterList.length === 0) continue;

    console.log(`\nProcessing geometry "${geom.name}" with ${clusterList.length} clusters`);

    const vertexCount = geom.vertexCount;
    const joints4 = new Uint8Array(vertexCount * 4);
    const weights4 = new Float32Array(vertexCount * 4);

    // Temporary storage for per-vertex influences
    const vertexInfluences = [];
    for (let i = 0; i < vertexCount; i++) {
        vertexInfluences.push([]);
    }

    // Collect influences from each cluster
    for (const cluster of clusterList) {
        if (!cluster.indexes || !cluster.weights) continue;

        const jointIndex = clusterToJointIndex.get(cluster.id);
        if (jointIndex === undefined) {
            console.warn(`  WARNING: Cluster ${cluster.id} not found in skeleton`);
            continue;
        }

        for (let i = 0; i < cluster.indexes.length; i++) {
            const vertexIndex = cluster.indexes[i];
            const weight = cluster.weights[i];
            if (vertexIndex < vertexCount && weight > 0.001) {
                vertexInfluences[vertexIndex].push({
                    joint: jointIndex,
                    weight
                });
            }
        }
    }

    // Convert to fixed 4-influence format and normalize
    let maxJointIndex = 0;
    let totalInfluences = 0;
    let verticesWithInfluences = 0;

    for (let v = 0; v < vertexCount; v++) {
        const influences = vertexInfluences[v];
        if (influences.length === 0) continue;

        verticesWithInfluences++;
        totalInfluences += influences.length;

        // Sort by weight descending
        influences.sort((a, b) => b.weight - a.weight);

        // Take top 4 influences
        let totalWeight = 0;
        for (let i = 0; i < 4 && i < influences.length; i++) {
            joints4[v * 4 + i] = influences[i].joint;
            weights4[v * 4 + i] = influences[i].weight;
            totalWeight += influences[i].weight;
            if (influences[i].joint > maxJointIndex) {
                maxJointIndex = influences[i].joint;
            }
        }

        // Normalize weights
        if (totalWeight > 0) {
            for (let i = 0; i < 4; i++) {
                weights4[v * 4 + i] /= totalWeight;
            }
        }
    }

    console.log(`  Vertices with skinning: ${verticesWithInfluences}/${vertexCount}`);
    console.log(`  Max joint index used: ${maxJointIndex}`);
    console.log(`  Total skeleton joints: ${joints.length}`);
    console.log(`  Avg influences per vertex: ${(totalInfluences / verticesWithInfluences).toFixed(2)}`);

    // Check if max joint index exceeds skeleton size
    if (maxJointIndex >= joints.length) {
        console.log(`  ⚠️ ERROR: Max joint index (${maxJointIndex}) >= skeleton size (${joints.length})`);
    } else {
        console.log(`  ✅ Joint indices are within valid range`);
    }

    // Sample some vertex data
    console.log(`\n  Sample vertex skinning data (first 5 skinned vertices):`);
    let sampleCount = 0;
    for (let v = 0; v < vertexCount && sampleCount < 5; v++) {
        const w0 = weights4[v * 4];
        if (w0 > 0) {
            const j0 = joints4[v * 4];
            const j1 = joints4[v * 4 + 1];
            const j2 = joints4[v * 4 + 2];
            const j3 = joints4[v * 4 + 3];
            const w1 = weights4[v * 4 + 1];
            const w2 = weights4[v * 4 + 2];
            const w3 = weights4[v * 4 + 3];
            console.log(`    Vertex[${v}]: joints=[${j0},${j1},${j2},${j3}], weights=[${w0.toFixed(3)},${w1.toFixed(3)},${w2.toFixed(3)},${w3.toFixed(3)}]`);
            sampleCount++;
        }
    }

    // Check weight normalization
    let badWeights = 0;
    for (let v = 0; v < vertexCount; v++) {
        const sum = weights4[v * 4] + weights4[v * 4 + 1] + weights4[v * 4 + 2] + weights4[v * 4 + 3];
        if (sum > 0 && Math.abs(sum - 1.0) > 0.01) {
            badWeights++;
        }
    }
    console.log(`\n  Weight normalization check: ${badWeights} vertices with bad weights`);
}

console.log('\nDone!');
