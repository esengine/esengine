/**
 * Debug Runtime Animation Flow
 * 调试运行时动画流程
 *
 * This script mimics exactly what ModelPreview3D does when rendering
 * and outputs detailed debug info at each step.
 */

import { readFileSync } from 'fs';
import pako from 'pako';
const { inflate } = pako;

const FBX_TIME_SECOND = 46186158000n;
const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';

console.log(`=== Debug Runtime Animation: ${filePath} ===\n`);

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

// Parse Models with their transforms
const models = objectsNode.children
    .filter(n => n.name === 'Model')
    .map(n => {
        const position = [0, 0, 0];
        const rotation = [0, 0, 0];
        const scale = [1, 1, 1];
        const preRotation = null;

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
            position,
            rotation,
            scale,
            preRotation
        };
    });

console.log(`Models: ${models.length}`);

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

// Build cluster to bone mapping
const clusterToBone = new Map();
for (const conn of connections) {
    if (conn.type === 'OO') {
        const cluster = clusters.find(c => c.id === conn.toId);
        if (cluster) {
            clusterToBone.set(cluster.id, conn.fromId);
        }
    }
}

// Build model ID to index
const modelToIndex = new Map();
models.forEach((m, i) => modelToIndex.set(m.id, i));

// Build parent relationships
const modelParent = new Map();
for (const conn of connections) {
    if (conn.type === 'OO') {
        if (modelToIndex.has(conn.fromId) && modelToIndex.has(conn.toId)) {
            modelParent.set(conn.fromId, conn.toId);
        }
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

// Create transform matrix from position, rotation (quaternion), scale
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

// Invert matrix
function invertMatrix4(m) {
    const out = new Float32Array(16);
    const m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
    const m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
    const m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];
    const m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];

    const b00 = m00 * m11 - m01 * m10;
    const b01 = m00 * m12 - m02 * m10;
    const b02 = m00 * m13 - m03 * m10;
    const b03 = m01 * m12 - m02 * m11;
    const b04 = m01 * m13 - m03 * m11;
    const b05 = m02 * m13 - m03 * m12;
    const b06 = m20 * m31 - m21 * m30;
    const b07 = m20 * m32 - m22 * m30;
    const b08 = m20 * m33 - m23 * m30;
    const b09 = m21 * m32 - m22 * m31;
    const b10 = m21 * m33 - m23 * m31;
    const b11 = m22 * m33 - m23 * m32;

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (Math.abs(det) < 1e-8) return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);

    det = 1.0 / det;

    out[0] = (m11 * b11 - m12 * b10 + m13 * b09) * det;
    out[1] = (m02 * b10 - m01 * b11 - m03 * b09) * det;
    out[2] = (m31 * b05 - m32 * b04 + m33 * b03) * det;
    out[3] = (m22 * b04 - m21 * b05 - m23 * b03) * det;
    out[4] = (m12 * b08 - m10 * b11 - m13 * b07) * det;
    out[5] = (m00 * b11 - m02 * b08 + m03 * b07) * det;
    out[6] = (m32 * b02 - m30 * b05 - m33 * b01) * det;
    out[7] = (m20 * b05 - m22 * b02 + m23 * b01) * det;
    out[8] = (m10 * b10 - m11 * b08 + m13 * b06) * det;
    out[9] = (m01 * b08 - m00 * b10 - m03 * b06) * det;
    out[10] = (m30 * b04 - m31 * b02 + m33 * b00) * det;
    out[11] = (m21 * b02 - m20 * b04 - m23 * b00) * det;
    out[12] = (m11 * b07 - m10 * b09 - m12 * b06) * det;
    out[13] = (m00 * b09 - m01 * b07 + m02 * b06) * det;
    out[14] = (m31 * b01 - m30 * b03 - m32 * b00) * det;
    out[15] = (m20 * b03 - m21 * b01 + m22 * b00) * det;

    return out;
}

// Multiply matrices
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

// Build skeleton (simulating FBXLoader.buildSkeletonData)
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

    const inverseBindMatrix = cluster.transformLink
        ? invertMatrix4(cluster.transformLink)
        : identity();

    joints.push({
        name: model.name,
        nodeIndex,
        parentIndex: -1,
        inverseBindMatrix
    });
}

// Set parent indices
for (const cluster of clusters) {
    const boneModelId = clusterToBone.get(cluster.id);
    if (!boneModelId) continue;

    const jointIndex = boneModelIdToJointIndex.get(boneModelId);
    if (jointIndex === undefined) continue;

    let parentModelId = modelParent.get(boneModelId);
    while (parentModelId) {
        const parentJointIndex = boneModelIdToJointIndex.get(parentModelId);
        if (parentJointIndex !== undefined) {
            joints[jointIndex].parentIndex = parentJointIndex;
            break;
        }
        parentModelId = modelParent.get(parentModelId);
    }
}

console.log(`Skeleton joints: ${joints.length}`);

// Build nodes (simulating FBXLoader node building)
const nodes = models.map(model => {
    const rx = model.rotation[0] * Math.PI / 180;
    const ry = model.rotation[1] * Math.PI / 180;
    const rz = model.rotation[2] * Math.PI / 180;
    const quat = eulerToQuaternion(rx, ry, rz);

    return {
        name: model.name,
        transform: {
            position: model.position,
            rotation: quat,
            scale: model.scale
        }
    };
});

console.log(`\n=== KEY DEBUG INFO ===`);

// Check a specific joint
const jointToDebug = 0;
const joint = joints[jointToDebug];
const node = nodes[joint.nodeIndex];

console.log(`\nJoint[${jointToDebug}] "${joint.name}":`);
console.log(`  nodeIndex: ${joint.nodeIndex}`);
console.log(`  parentIndex: ${joint.parentIndex}`);
console.log(`  node.transform.position: [${node.transform.position.join(', ')}]`);
console.log(`  node.transform.rotation: [${node.transform.rotation.map(v => v.toFixed(4)).join(', ')}]`);
console.log(`  node.transform.scale: [${node.transform.scale.join(', ')}]`);

// Create local matrix from node transform
const localMatrix = createTransformMatrix(
    node.transform.position,
    node.transform.rotation,
    node.transform.scale
);
console.log(`\n  localMatrix (from node.transform):`);
console.log(`    [${localMatrix.slice(0, 4).map(v => v.toFixed(4)).join(', ')}]`);
console.log(`    [${localMatrix.slice(4, 8).map(v => v.toFixed(4)).join(', ')}]`);
console.log(`    [${localMatrix.slice(8, 12).map(v => v.toFixed(4)).join(', ')}]`);
console.log(`    [${localMatrix.slice(12, 16).map(v => v.toFixed(4)).join(', ')}]`);

// Show inverseBindMatrix
console.log(`\n  inverseBindMatrix:`);
console.log(`    [${joint.inverseBindMatrix.slice(0, 4).map(v => v.toFixed(4)).join(', ')}]`);
console.log(`    [${joint.inverseBindMatrix.slice(4, 8).map(v => v.toFixed(4)).join(', ')}]`);
console.log(`    [${joint.inverseBindMatrix.slice(8, 12).map(v => v.toFixed(4)).join(', ')}]`);
console.log(`    [${joint.inverseBindMatrix.slice(12, 16).map(v => v.toFixed(4)).join(', ')}]`);

// Calculate skinMatrix = worldMatrix * inverseBindMatrix (for root, worldMatrix = localMatrix)
const skinMatrix = multiplyMatrices(localMatrix, joint.inverseBindMatrix);
console.log(`\n  skinMatrix = worldMatrix * IBM (should be near identity at bind pose):`);
console.log(`    [${skinMatrix.slice(0, 4).map(v => v.toFixed(4)).join(', ')}]`);
console.log(`    [${skinMatrix.slice(4, 8).map(v => v.toFixed(4)).join(', ')}]`);
console.log(`    [${skinMatrix.slice(8, 12).map(v => v.toFixed(4)).join(', ')}]`);
console.log(`    [${skinMatrix.slice(12, 16).map(v => v.toFixed(4)).join(', ')}]`);

// Check if skinMatrix is identity
function isNearIdentity(m, tol = 0.001) {
    const id = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    for (let i = 0; i < 16; i++) {
        if (Math.abs(m[i] - id[i]) > tol) return false;
    }
    return true;
}

console.log(`\n  Is skinMatrix near identity? ${isNearIdentity(skinMatrix) ? 'YES ✅' : 'NO ❌'}`);

// Now simulate what happens when no animation is playing
// In ModelPreview3D, when there's no animTransform for a joint, it uses node.transform
console.log(`\n=== SIMULATING ModelPreview3D calculateBoneMatrices (no animation) ===`);

// This is what ModelPreview3D does:
// 1. For each joint, get animTransform or fall back to node.transform
// 2. Create localMatrix from pos/rot/scale
// 3. Calculate worldMatrix = parent.worldMatrix * localMatrix
// 4. Calculate skinMatrix = worldMatrix * inverseBindMatrix

const worldMatrices = new Array(joints.length);
const skinMatrices = new Array(joints.length);

// Build processing order
const processingOrder = [];
const processed = new Set();

function addJoint(jointIndex) {
    if (processed.has(jointIndex)) return;
    const joint = joints[jointIndex];
    if (joint.parentIndex >= 0 && !processed.has(joint.parentIndex)) {
        addJoint(joint.parentIndex);
    }
    processingOrder.push(jointIndex);
    processed.add(jointIndex);
}

for (let i = 0; i < joints.length; i++) {
    addJoint(i);
}

for (const jointIndex of processingOrder) {
    const joint = joints[jointIndex];
    const node = nodes[joint.nodeIndex];

    const pos = node.transform.position;
    const rot = node.transform.rotation;
    const scl = node.transform.scale;

    const localMatrix = createTransformMatrix(pos, rot, scl);

    if (joint.parentIndex >= 0) {
        worldMatrices[jointIndex] = multiplyMatrices(worldMatrices[joint.parentIndex], localMatrix);
    } else {
        worldMatrices[jointIndex] = localMatrix;
    }

    skinMatrices[jointIndex] = multiplyMatrices(worldMatrices[jointIndex], joint.inverseBindMatrix);
}

// Count how many are near identity
let identityCount = 0;
let maxDiff = 0;

for (let i = 0; i < joints.length; i++) {
    const sm = skinMatrices[i];
    const id = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    let diff = 0;
    for (let j = 0; j < 16; j++) {
        diff = Math.max(diff, Math.abs(sm[j] - id[j]));
    }
    if (diff < 0.001) identityCount++;
    if (diff > maxDiff) maxDiff = diff;
}

console.log(`\nAt bind pose (no animation):`);
console.log(`  Identity matrices: ${identityCount}/${joints.length}`);
console.log(`  Max diff from identity: ${maxDiff.toFixed(6)}`);

if (identityCount !== joints.length) {
    console.log(`\n  ⚠️ WARNING: Not all skin matrices are identity at bind pose!`);
    console.log(`  This suggests the node.transform doesn't match the TransformLink.`);

    // Show first non-identity matrix
    for (let i = 0; i < joints.length; i++) {
        const sm = skinMatrices[i];
        const id = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
        let diff = 0;
        for (let j = 0; j < 16; j++) {
            diff = Math.max(diff, Math.abs(sm[j] - id[j]));
        }
        if (diff >= 0.001) {
            const joint = joints[i];
            const node = nodes[joint.nodeIndex];
            console.log(`\n  First non-identity: Joint[${i}] "${joint.name}"`);
            console.log(`    node.transform: pos=[${node.transform.position.join(',')}]`);
            console.log(`    skinMatrix:`);
            console.log(`      [${sm.slice(0, 4).map(v => v.toFixed(4)).join(', ')}]`);
            console.log(`      [${sm.slice(4, 8).map(v => v.toFixed(4)).join(', ')}]`);
            console.log(`      [${sm.slice(8, 12).map(v => v.toFixed(4)).join(', ')}]`);
            console.log(`      [${sm.slice(12, 16).map(v => v.toFixed(4)).join(', ')}]`);
            break;
        }
    }
} else {
    console.log(`  ✅ All skin matrices are identity - bind pose is correct!`);
}

console.log('\nDone!');
