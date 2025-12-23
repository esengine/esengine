/**
 * Compare TransformLink vs Calculated World Matrix
 * 比较 TransformLink 和计算的世界矩阵
 *
 * The issue: node.transform gives LOCAL transforms, but TransformLink is WORLD matrix.
 * When we build worldMatrix from hierarchy, it might not equal TransformLink.
 */

import { readFileSync } from 'fs';
import pako from 'pako';
const { inflate } = pako;

const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';

console.log(`=== Comparing World Matrix: ${filePath} ===\n`);

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

// Parse Models with Lcl transforms
const models = objectsNode.children
    .filter(n => n.name === 'Model')
    .map(n => {
        const position = [0, 0, 0];
        const rotation = [0, 0, 0];
        const scale = [1, 1, 1];

        for (const child of n.children) {
            if (child.name === 'Properties70') {
                for (const prop of child.children) {
                    if (prop.properties[0] === 'Lcl Translation') {
                        position[0] = prop.properties[4];
                        position[1] = prop.properties[5];
                        position[2] = prop.properties[6];
                    } else if (prop.properties[0] === 'Lcl Rotation') {
                        rotation[0] = prop.properties[4];
                        rotation[1] = prop.properties[5];
                        rotation[2] = prop.properties[6];
                    } else if (prop.properties[0] === 'Lcl Scaling') {
                        scale[0] = prop.properties[4];
                        scale[1] = prop.properties[5];
                        scale[2] = prop.properties[6];
                    }
                }
            }
        }

        return {
            id: n.properties[0],
            name: n.properties[1]?.split?.('\0')[0] || 'Model',
            position, rotation, scale
        };
    });

// Parse Clusters with TransformLink
const clusters = objectsNode.children
    .filter(n => n.name === 'Deformer' && n.properties[2]?.split?.('\0')[0] === 'Cluster')
    .map(n => {
        const cluster = {
            id: n.properties[0],
            name: n.properties[1]?.split?.('\0')[0] || 'Cluster',
            transformLink: null
        };

        for (const child of n.children) {
            if (child.name === 'TransformLink') {
                const data = child.properties[0]?.data;
                if (data && data.length === 16) {
                    cluster.transformLink = new Float32Array(data);
                }
            }
        }

        return cluster;
    });

// Build mappings
const clusterToBone = new Map();
for (const conn of connections) {
    if (conn.type === 'OO') {
        const cluster = clusters.find(c => c.id === conn.toId);
        if (cluster) clusterToBone.set(cluster.id, conn.fromId);
    }
}

const modelToIndex = new Map();
const modelById = new Map();
models.forEach((m, i) => {
    modelToIndex.set(m.id, i);
    modelById.set(m.id, m);
});

const modelParent = new Map();
for (const conn of connections) {
    if (conn.type === 'OO' && modelToIndex.has(conn.fromId) && modelToIndex.has(conn.toId)) {
        modelParent.set(conn.fromId, conn.toId);
    }
}

// Euler to quaternion (XYZ intrinsic)
function eulerToQuaternion(x, y, z) {
    const cx = Math.cos(x / 2), sx = Math.sin(x / 2);
    const cy = Math.cos(y / 2), sy = Math.sin(y / 2);
    const cz = Math.cos(z / 2), sz = Math.sin(z / 2);
    return [
        sx * cy * cz - cx * sy * sz,
        cx * sy * cz + sx * cy * sz,
        cx * cy * sz - sx * sy * cz,
        cx * cy * cz + sx * sy * sz
    ];
}

function createTransformMatrix(position, rotation, scale) {
    const [qx, qy, qz, qw] = rotation;
    const [sx, sy, sz] = scale;
    const xx = qx * qx, xy = qx * qy, xz = qx * qz, xw = qx * qw;
    const yy = qy * qy, yz = qy * qz, yw = qy * qw;
    const zz = qz * qz, zw = qz * qw;

    return new Float32Array([
        (1 - 2 * (yy + zz)) * sx, 2 * (xy + zw) * sx, 2 * (xz - yw) * sx, 0,
        2 * (xy - zw) * sy, (1 - 2 * (xx + zz)) * sy, 2 * (yz + xw) * sy, 0,
        2 * (xz + yw) * sz, 2 * (yz - xw) * sz, (1 - 2 * (xx + yy)) * sz, 0,
        position[0], position[1], position[2], 1
    ]);
}

function multiplyMatrices(a, b) {
    const result = new Float32Array(16);
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) {
                sum += a[row + k * 4] * b[k + col * 4];
            }
            result[row + col * 4] = sum;
        }
    }
    return result;
}

function identity() {
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
}

// Calculate world matrices from hierarchy
const worldMatrices = new Map();

function calculateWorldMatrix(modelId) {
    if (worldMatrices.has(modelId)) return worldMatrices.get(modelId);

    const model = modelById.get(modelId);
    if (!model) {
        const mat = identity();
        worldMatrices.set(modelId, mat);
        return mat;
    }

    const rx = model.rotation[0] * Math.PI / 180;
    const ry = model.rotation[1] * Math.PI / 180;
    const rz = model.rotation[2] * Math.PI / 180;
    const quat = eulerToQuaternion(rx, ry, rz);
    const localMatrix = createTransformMatrix(model.position, quat, model.scale);

    const parentId = modelParent.get(modelId);
    let worldMatrix;
    if (parentId) {
        const parentWorld = calculateWorldMatrix(parentId);
        worldMatrix = multiplyMatrices(parentWorld, localMatrix);
    } else {
        worldMatrix = localMatrix;
    }

    worldMatrices.set(modelId, worldMatrix);
    return worldMatrix;
}

console.log(`=== Comparing TransformLink vs Calculated World Matrix ===\n`);

let matchCount = 0;
let mismatchCount = 0;

for (const cluster of clusters) {
    const boneModelId = clusterToBone.get(cluster.id);
    if (!boneModelId || !cluster.transformLink) continue;

    const model = modelById.get(boneModelId);
    const calculatedWorld = calculateWorldMatrix(boneModelId);
    const transformLink = cluster.transformLink;

    // Compare
    let maxDiff = 0;
    for (let i = 0; i < 16; i++) {
        const diff = Math.abs(calculatedWorld[i] - transformLink[i]);
        if (diff > maxDiff) maxDiff = diff;
    }

    if (maxDiff < 0.01) {
        matchCount++;
    } else {
        mismatchCount++;
        if (mismatchCount <= 3) {
            console.log(`❌ MISMATCH: "${model?.name}" (maxDiff=${maxDiff.toFixed(4)})`);
            console.log(`   TransformLink:`);
            console.log(`     [${transformLink.slice(0, 4).map(v => v.toFixed(4)).join(', ')}]`);
            console.log(`     [${transformLink.slice(4, 8).map(v => v.toFixed(4)).join(', ')}]`);
            console.log(`     [${transformLink.slice(8, 12).map(v => v.toFixed(4)).join(', ')}]`);
            console.log(`     [${transformLink.slice(12, 16).map(v => v.toFixed(4)).join(', ')}]`);
            console.log(`   Calculated World:`);
            console.log(`     [${calculatedWorld.slice(0, 4).map(v => v.toFixed(4)).join(', ')}]`);
            console.log(`     [${calculatedWorld.slice(4, 8).map(v => v.toFixed(4)).join(', ')}]`);
            console.log(`     [${calculatedWorld.slice(8, 12).map(v => v.toFixed(4)).join(', ')}]`);
            console.log(`     [${calculatedWorld.slice(12, 16).map(v => v.toFixed(4)).join(', ')}]`);
            console.log('');
        }
    }
}

console.log(`\n=== RESULT ===`);
console.log(`Match: ${matchCount}`);
console.log(`Mismatch: ${mismatchCount}`);

if (mismatchCount > 0) {
    console.log(`\n⚠️ TransformLink does NOT match calculated world matrix!`);
    console.log(`This means Lcl Translation/Rotation/Scale don't build to the bind pose.`);
    console.log(`\nPossible reasons:`);
    console.log(`1. Missing PreRotation in the transform calculation`);
    console.log(`2. FBX hierarchy differs from the bone hierarchy`);
    console.log(`3. Some bones have additional transforms not captured`);
} else {
    console.log(`\n✅ All TransformLinks match calculated world matrices!`);
}

console.log('\nDone!');
