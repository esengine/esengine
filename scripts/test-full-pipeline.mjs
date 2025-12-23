/**
 * Test Full Animation Pipeline
 * 测试完整的动画管道
 *
 * This script exactly mimics what ModelPreview3D does:
 * 1. Parse FBX data (like FBXLoader)
 * 2. Sample animation (like sampleAnimation)
 * 3. Calculate bone matrices (like calculateBoneMatrices)
 * 4. Output visual verification data
 */

import { readFileSync } from 'fs';
import pako from 'pako';
const { inflate } = pako;

const FBX_TIME_SECOND = 46186158000n;
const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';

console.log(`=== Full Pipeline Test: ${filePath} ===\n`);

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

// ============ STEP 1: Parse Models (like FBXLoader) ============

// FBX uses XYZ Euler order (same as test-fbx-animation.mjs)
// FBX 使用 XYZ 欧拉角顺序
function eulerToQuaternion(rx, ry, rz) {
    const cx = Math.cos(rx / 2), sx = Math.sin(rx / 2);
    const cy = Math.cos(ry / 2), sy = Math.sin(ry / 2);
    const cz = Math.cos(rz / 2), sz = Math.sin(rz / 2);
    return [
        sx * cy * cz - cx * sy * sz,
        cx * sy * cz + sx * cy * sz,
        cx * cy * sz - sx * sy * cz,
        cx * cy * cz + sx * sy * sz
    ];
}

function multiplyQuaternion(a, b) {
    return [
        a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
        a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
        a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
        a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
    ];
}

const modelNodes = objectsNode.children.filter(n => n.name === 'Model');
const models = modelNodes.map(n => {
    const id = n.properties[0];
    const name = n.properties[1]?.split?.('\0')[0] || 'Model';
    const type = n.properties[2]?.split?.('\0')[0] || '';

    let position = [0, 0, 0];
    let rotation = [0, 0, 0];
    let scale = [1, 1, 1];
    let preRotation = null;

    // Parse Properties70
    const props = n.children.find(c => c.name === 'Properties70');
    if (props) {
        for (const p of props.children) {
            if (p.name === 'P') {
                const propName = p.properties[0]?.split?.('\0')[0];
                if (propName === 'Lcl Translation') {
                    position = [p.properties[4], p.properties[5], p.properties[6]];
                } else if (propName === 'Lcl Rotation') {
                    rotation = [p.properties[4], p.properties[5], p.properties[6]];
                } else if (propName === 'Lcl Scaling') {
                    scale = [p.properties[4], p.properties[5], p.properties[6]];
                } else if (propName === 'PreRotation') {
                    preRotation = [p.properties[4], p.properties[5], p.properties[6]];
                }
            }
        }
    }

    return { id, name, type, position, rotation, scale, preRotation };
});

const modelToIndex = new Map();
models.forEach((m, i) => modelToIndex.set(m.id, i));

// Build nodes array (like FBXLoader line 244)
const nodes = models.map(model => {
    let quat;
    if (model.preRotation) {
        const preRx = model.preRotation[0] * Math.PI / 180;
        const preRy = model.preRotation[1] * Math.PI / 180;
        const preRz = model.preRotation[2] * Math.PI / 180;
        const preQuat = eulerToQuaternion(preRx, preRy, preRz);

        const rx = model.rotation[0] * Math.PI / 180;
        const ry = model.rotation[1] * Math.PI / 180;
        const rz = model.rotation[2] * Math.PI / 180;
        const lclQuat = eulerToQuaternion(rx, ry, rz);

        quat = multiplyQuaternion(preQuat, lclQuat);
    } else {
        const rx = model.rotation[0] * Math.PI / 180;
        const ry = model.rotation[1] * Math.PI / 180;
        const rz = model.rotation[2] * Math.PI / 180;
        quat = eulerToQuaternion(rx, ry, rz);
    }

    return {
        name: model.name,
        children: [],
        transform: {
            position: model.position,
            rotation: quat,
            scale: model.scale
        }
    };
});

// Build parent-child relationships
for (const conn of connections) {
    if (conn.type === 'OO') {
        const childIdx = modelToIndex.get(conn.fromId);
        const parentIdx = modelToIndex.get(conn.toId);
        if (childIdx !== undefined && parentIdx !== undefined) {
            nodes[parentIdx].children.push(childIdx);
        }
    }
}

console.log(`Built ${nodes.length} nodes`);

// ============ STEP 2: Parse Clusters and Build Skeleton ============

const clusterNodes = objectsNode.children.filter(n =>
    n.name === 'Deformer' && n.properties[2]?.split?.('\0')[0] === 'Cluster'
);

const clusters = clusterNodes.map(n => {
    const id = n.properties[0];
    const name = n.properties[1]?.split?.('\0')[0] || 'Cluster';
    let transformLink = null;

    for (const child of n.children) {
        if (child.name === 'TransformLink' && child.properties[0]?.data?.length === 16) {
            // Store as Float32Array directly (like FBXLoader)
            transformLink = new Float32Array(child.properties[0].data);
        }
    }

    return { id, name, transformLink };
});

// Find cluster to bone connections
const clusterToBone = new Map();
for (const conn of connections) {
    if (conn.type === 'OO') {
        const cluster = clusters.find(c => c.id === conn.toId);
        if (cluster) {
            clusterToBone.set(cluster.id, conn.fromId);
        }
    }
}

// Build skeleton (like FBXLoader buildSkeletonData)
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
    if (Math.abs(det) < 1e-8) {
        return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }
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

const joints = [];
const boneModelIdToJointIndex = new Map();
const modelParentMap = new Map();

for (const conn of connections) {
    if (conn.type === 'OO') {
        const childModel = models.find(m => m.id === conn.fromId);
        const parentModel = models.find(m => m.id === conn.toId);
        if (childModel && parentModel) {
            modelParentMap.set(conn.fromId, conn.toId);
        }
    }
}

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
        : new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

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

    let parentModelId = modelParentMap.get(boneModelId);
    while (parentModelId) {
        const parentJointIndex = boneModelIdToJointIndex.get(parentModelId);
        if (parentJointIndex !== undefined) {
            joints[jointIndex].parentIndex = parentJointIndex;
            break;
        }
        parentModelId = modelParentMap.get(parentModelId);
    }
}

console.log(`Built ${joints.length} skeleton joints`);

// ============ STEP 3: Parse Animation ============

const animCurves = objectsNode.children.filter(n => n.name === 'AnimationCurve');
const animCurveNodes = objectsNode.children.filter(n => n.name === 'AnimationCurveNode');

// Map curve ID to curve data
const curveMap = new Map();
for (const curve of animCurves) {
    const id = curve.properties[0];
    let keyTimes = null;
    let keyValues = null;

    for (const child of curve.children) {
        if (child.name === 'KeyTime') {
            const data = child.properties[0]?.data;
            if (data) {
                keyTimes = data.map(t => Number(t) / Number(FBX_TIME_SECOND));
            }
        } else if (child.name === 'KeyValueFloat') {
            keyValues = child.properties[0]?.data;
        }
    }

    if (keyTimes && keyValues) {
        curveMap.set(id, { keyTimes, keyValues });
    }
}

// Build curveNode map (ID is in properties[0], not .id)
const curveNodeMap = new Map();
for (const cn of animCurveNodes) {
    curveNodeMap.set(cn.properties[0], cn);
}

// Map curveNode to model and build animation channels
const curveNodeToModel = new Map();
const curveNodeToCurves = new Map();

for (const conn of connections) {
    if (conn.type === 'OP') {
        if (conn.property?.includes('Lcl')) {
            const curveNode = curveNodeMap.get(conn.fromId);
            if (curveNode) {
                curveNodeToModel.set(conn.fromId, conn.toId);
            }
        } else if (conn.property === 'd|X' || conn.property === 'd|Y' || conn.property === 'd|Z') {
            const curveNode = curveNodeMap.get(conn.toId);
            if (curveNode) {
                if (!curveNodeToCurves.has(conn.toId)) {
                    curveNodeToCurves.set(conn.toId, { x: null, y: null, z: null });
                }
                const curves = curveNodeToCurves.get(conn.toId);
                const curveData = curveMap.get(conn.fromId);
                if (curveData) {
                    if (conn.property === 'd|X') curves.x = curveData;
                    if (conn.property === 'd|Y') curves.y = curveData;
                    if (conn.property === 'd|Z') curves.z = curveData;
                }
            }
        }
    }
}

// Build animation channels
const channels = [];
const samplers = [];

for (const cn of animCurveNodes) {
    const cnId = cn.properties[0];  // ID is in properties[0]
    const targetModelId = curveNodeToModel.get(cnId);
    if (!targetModelId) continue;

    const nodeIndex = modelToIndex.get(targetModelId);
    if (nodeIndex === undefined) continue;

    const targetModel = models[nodeIndex];
    const curves = curveNodeToCurves.get(cnId);
    if (!curves) continue;

    // Attribute is in properties[1], but has null bytes
    const attr = cn.properties[1]?.split?.('\0')[0];
    if (!attr) continue;

    const xCurve = curves.x;
    const yCurve = curves.y;
    const zCurve = curves.z;

    if (!xCurve && !yCurve && !zCurve) continue;

    const refCurve = xCurve || yCurve || zCurve;
    const keyCount = refCurve.keyTimes.length;
    const input = new Float32Array(refCurve.keyTimes);

    let output;
    let path;

    if (attr === 'T') {
        path = 'translation';
        output = new Float32Array(keyCount * 3);
        for (let i = 0; i < keyCount; i++) {
            output[i * 3] = xCurve?.keyValues[i] ?? 0;
            output[i * 3 + 1] = yCurve?.keyValues[i] ?? 0;
            output[i * 3 + 2] = zCurve?.keyValues[i] ?? 0;
        }
    } else if (attr === 'R') {
        path = 'rotation';
        output = new Float32Array(keyCount * 4);

        let preRotQuat = null;
        if (targetModel.preRotation) {
            const preRx = targetModel.preRotation[0] * Math.PI / 180;
            const preRy = targetModel.preRotation[1] * Math.PI / 180;
            const preRz = targetModel.preRotation[2] * Math.PI / 180;
            preRotQuat = eulerToQuaternion(preRx, preRy, preRz);
        }

        for (let i = 0; i < keyCount; i++) {
            const rx = (xCurve?.keyValues[i] ?? 0) * Math.PI / 180;
            const ry = (yCurve?.keyValues[i] ?? 0) * Math.PI / 180;
            const rz = (zCurve?.keyValues[i] ?? 0) * Math.PI / 180;
            const lclQuat = eulerToQuaternion(rx, ry, rz);

            const finalQuat = preRotQuat
                ? multiplyQuaternion(preRotQuat, lclQuat)
                : lclQuat;

            output[i * 4] = finalQuat[0];
            output[i * 4 + 1] = finalQuat[1];
            output[i * 4 + 2] = finalQuat[2];
            output[i * 4 + 3] = finalQuat[3];
        }
    } else if (attr === 'S') {
        path = 'scale';
        output = new Float32Array(keyCount * 3);
        for (let i = 0; i < keyCount; i++) {
            output[i * 3] = xCurve?.keyValues[i] ?? 1;
            output[i * 3 + 1] = yCurve?.keyValues[i] ?? 1;
            output[i * 3 + 2] = zCurve?.keyValues[i] ?? 1;
        }
    } else {
        continue;
    }

    const samplerIndex = samplers.length;
    samplers.push({ input, output, interpolation: 'LINEAR' });
    channels.push({ samplerIndex, target: { nodeIndex, path } });
}

console.log(`Built ${channels.length} animation channels`);

// ============ STEP 4: Sample Animation (like ModelPreview3D sampleAnimation) ============

function slerpQuaternion(q0, q1, t) {
    let [x0, y0, z0, w0] = q0;
    let [x1, y1, z1, w1] = q1;

    let cosHalfTheta = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1;

    if (cosHalfTheta < 0) {
        x1 = -x1; y1 = -y1; z1 = -z1; w1 = -w1;
        cosHalfTheta = -cosHalfTheta;
    }

    if (cosHalfTheta > 0.9995) {
        const result = [
            x0 + t * (x1 - x0), y0 + t * (y1 - y0),
            z0 + t * (z1 - z0), w0 + t * (w1 - w0)
        ];
        const len = Math.sqrt(result[0]**2 + result[1]**2 + result[2]**2 + result[3]**2);
        return [result[0]/len, result[1]/len, result[2]/len, result[3]/len];
    }

    const theta0 = Math.acos(cosHalfTheta);
    const theta = theta0 * t;
    const sinTheta = Math.sin(theta);
    const sinTheta0 = Math.sin(theta0);

    const s0 = Math.cos(theta) - cosHalfTheta * sinTheta / sinTheta0;
    const s1 = sinTheta / sinTheta0;

    return [s0 * x0 + s1 * x1, s0 * y0 + s1 * y1, s0 * z0 + s1 * z1, s0 * w0 + s1 * w1];
}

function sampleSampler(sampler, time, path) {
    const input = sampler.input;
    const output = sampler.output;

    if (!input || !output || input.length === 0) return null;

    const minTime = input[0];
    const maxTime = input[input.length - 1];
    time = Math.max(minTime, Math.min(maxTime, time));

    let i0 = 0;
    for (let i = 0; i < input.length - 1; i++) {
        if (time >= input[i] && time <= input[i + 1]) {
            i0 = i;
            break;
        }
        if (time < input[i]) break;
        i0 = i;
    }
    const i1 = Math.min(i0 + 1, input.length - 1);

    const t0 = input[i0];
    const t1 = input[i1];
    const t = t1 > t0 ? (time - t0) / (t1 - t0) : 0;

    const componentCount = path === 'rotation' ? 4 : 3;

    if (path === 'rotation') {
        const q0 = [output[i0*4], output[i0*4+1], output[i0*4+2], output[i0*4+3]];
        const q1 = [output[i1*4], output[i1*4+1], output[i1*4+2], output[i1*4+3]];
        return slerpQuaternion(q0, q1, t);
    }

    const result = [];
    for (let c = 0; c < componentCount; c++) {
        const v0 = output[i0 * componentCount + c];
        const v1 = output[i1 * componentCount + c];
        result.push(v0 + (v1 - v0) * t);
    }
    return result;
}

function sampleAnimation(time) {
    const nodeTransforms = new Map();

    for (const channel of channels) {
        const sampler = samplers[channel.samplerIndex];
        const nodeIndex = channel.target.nodeIndex;
        const path = channel.target.path;

        const value = sampleSampler(sampler, time, path);
        if (!value) continue;

        if (!nodeTransforms.has(nodeIndex)) {
            nodeTransforms.set(nodeIndex, {});
        }

        const transform = nodeTransforms.get(nodeIndex);
        if (path === 'translation') transform.position = value;
        else if (path === 'rotation') transform.rotation = value;
        else if (path === 'scale') transform.scale = value;
    }

    return nodeTransforms;
}

// ============ STEP 5: Calculate Bone Matrices (like ModelPreview3D) ============

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

function calculateBoneMatrices(animTransforms) {
    const boneCount = joints.length;
    const localMatrices = new Array(boneCount);
    const worldMatrices = new Array(boneCount);
    const skinMatrices = new Array(boneCount);

    // Build processing order
    const processed = new Set();
    const processingOrder = [];

    function addJoint(jointIndex) {
        if (processed.has(jointIndex)) return;
        const joint = joints[jointIndex];
        if (joint.parentIndex >= 0 && !processed.has(joint.parentIndex)) {
            addJoint(joint.parentIndex);
        }
        processingOrder.push(jointIndex);
        processed.add(jointIndex);
    }

    for (let i = 0; i < boneCount; i++) {
        addJoint(i);
    }

    // Calculate transforms
    for (const jointIndex of processingOrder) {
        const joint = joints[jointIndex];
        const node = nodes[joint.nodeIndex];

        if (!node) {
            localMatrices[jointIndex] = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
            worldMatrices[jointIndex] = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
            skinMatrices[jointIndex] = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
            continue;
        }

        const animTransform = animTransforms.get(joint.nodeIndex);
        const pos = animTransform?.position || node.transform.position;
        const rot = animTransform?.rotation || node.transform.rotation;
        const scl = animTransform?.scale || node.transform.scale;

        localMatrices[jointIndex] = createTransformMatrix(pos, rot, scl);

        if (joint.parentIndex >= 0) {
            worldMatrices[jointIndex] = multiplyMatrices(
                worldMatrices[joint.parentIndex],
                localMatrices[jointIndex]
            );
        } else {
            worldMatrices[jointIndex] = localMatrices[jointIndex];
        }

        skinMatrices[jointIndex] = multiplyMatrices(
            worldMatrices[jointIndex],
            joint.inverseBindMatrix
        );
    }

    return skinMatrices;
}

// ============ STEP 6: Test at different times ============

function isIdentity(m) {
    const identity = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    let maxDiff = 0;
    for (let i = 0; i < 16; i++) {
        maxDiff = Math.max(maxDiff, Math.abs(m[i] - identity[i]));
    }
    return { isIdentity: maxDiff < 0.001, maxDiff };
}

console.log('\n=== BONE MATRIX TEST ===\n');

for (const time of [0.0, 0.5, 1.0, 2.0]) {
    const animTransforms = sampleAnimation(time);
    const skinMatrices = calculateBoneMatrices(animTransforms);

    let identityCount = 0;
    let maxDiff = 0;

    for (const m of skinMatrices) {
        const check = isIdentity(m);
        if (check.isIdentity) identityCount++;
        if (check.maxDiff > maxDiff) maxDiff = check.maxDiff;
    }

    console.log(`t=${time.toFixed(1)}s: Identity: ${identityCount}/${skinMatrices.length}, Max diff: ${maxDiff.toFixed(4)}`);

    // Show first non-identity matrix at t=1
    if (time === 1.0) {
        for (let i = 0; i < skinMatrices.length; i++) {
            const check = isIdentity(skinMatrices[i]);
            if (!check.isIdentity) {
                const m = skinMatrices[i];
                console.log(`\n  First non-identity matrix (joint ${i} "${joints[i].name}"):`);
                console.log(`    Col 0: ${m[0].toFixed(4)}, ${m[1].toFixed(4)}, ${m[2].toFixed(4)}, ${m[3].toFixed(4)}`);
                console.log(`    Col 1: ${m[4].toFixed(4)}, ${m[5].toFixed(4)}, ${m[6].toFixed(4)}, ${m[7].toFixed(4)}`);
                console.log(`    Col 2: ${m[8].toFixed(4)}, ${m[9].toFixed(4)}, ${m[10].toFixed(4)}, ${m[11].toFixed(4)}`);
                console.log(`    Col 3: ${m[12].toFixed(4)}, ${m[13].toFixed(4)}, ${m[14].toFixed(4)}, ${m[15].toFixed(4)}`);
                break;
            }
        }
    }
}

console.log('\n=== SUMMARY ===');
console.log('This script exactly mimics FBXLoader + ModelPreview3D pipeline.');
console.log('If t=0 shows identity matrices and t>0 shows non-identity,');
console.log('the algorithm is correct and the issue is elsewhere (React, GPU, etc.).');

console.log('\nDone!');
