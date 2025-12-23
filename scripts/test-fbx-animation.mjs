/**
 * FBX Animation Pipeline Test Script
 * 完整模拟 FBX 动画管线：解析 -> 采样 -> 骨骼矩阵计算
 */

import { readFileSync } from 'fs';
import pako from 'pako';

const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';
console.log(`=== FBX Animation Pipeline Test ===\n`);
console.log(`File: ${filePath}\n`);

// ===== FBX Parser =====
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
        const typeCode = String.fromCharCode(buffer[offset++]);
        switch (typeCode) {
            case 'Y': properties.push(view.getInt16(offset, true)); offset += 2; break;
            case 'C': properties.push(buffer[offset++] !== 0); break;
            case 'I': properties.push(view.getInt32(offset, true)); offset += 4; break;
            case 'F': properties.push(view.getFloat32(offset, true)); offset += 4; break;
            case 'D': properties.push(view.getFloat64(offset, true)); offset += 8; break;
            case 'L': properties.push(view.getBigInt64(offset, true)); offset += 8; break;
            case 'S': case 'R': {
                const len = view.getUint32(offset, true); offset += 4;
                properties.push(typeCode === 'S' ? new TextDecoder().decode(buffer.slice(offset, offset + len)) : buffer.slice(offset, offset + len));
                offset += len;
                break;
            }
            case 'f': case 'd': case 'l': case 'i': case 'b': {
                const arrayLen = view.getUint32(offset, true);
                const encoding = view.getUint32(offset + 4, true);
                const compressedLen = view.getUint32(offset + 8, true);
                offset += 12;
                const elemSize = typeCode === 'd' || typeCode === 'l' ? 8 : 4;
                let dataView = view;
                let dataOffset = offset;
                if (encoding === 1) {
                    const decompressed = pako.inflate(buffer.slice(offset, offset + compressedLen));
                    dataView = new DataView(decompressed.buffer, decompressed.byteOffset, decompressed.byteLength);
                    dataOffset = 0;
                    offset += compressedLen;
                } else {
                    offset += arrayLen * elemSize;
                }
                const arr = [];
                for (let i = 0; i < arrayLen; i++) {
                    if (typeCode === 'd') arr.push(dataView.getFloat64(dataOffset + i * 8, true));
                    else if (typeCode === 'f') arr.push(dataView.getFloat32(dataOffset + i * 4, true));
                    else if (typeCode === 'l') arr.push(dataView.getBigInt64(dataOffset + i * 8, true));
                    else if (typeCode === 'i') arr.push(dataView.getInt32(dataOffset + i * 4, true));
                }
                properties.push({ type: typeCode, data: arr });
                break;
            }
            default: offset = propsEnd;
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
    type: c.properties[0]?.split?.('\0')[0] || c.properties[0],
    fromId: c.properties[1],
    toId: c.properties[2],
    property: c.properties[3]?.split?.('\0')[0]
}));

// Parse Models
const models = [];
const modelIdToIndex = new Map();
for (const node of objectsNode.children) {
    if (node.name === 'Model') {
        const id = node.properties[0];
        const name = node.properties[1]?.split?.('\0')[0] || 'Model';
        const type = node.properties[2]?.split?.('\0')[0] || '';

        // Parse properties
        let position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], preRotation = null;
        const props70 = node.children.find(c => c.name === 'Properties70');
        if (props70) {
            for (const p of props70.children) {
                if (p.name === 'P') {
                    const propName = p.properties[0]?.split?.('\0')[0];
                    if (propName === 'Lcl Translation') position = [p.properties[4], p.properties[5], p.properties[6]];
                    else if (propName === 'Lcl Rotation') rotation = [p.properties[4], p.properties[5], p.properties[6]];
                    else if (propName === 'Lcl Scaling') scale = [p.properties[4], p.properties[5], p.properties[6]];
                    else if (propName === 'PreRotation') preRotation = [p.properties[4], p.properties[5], p.properties[6]];
                }
            }
        }

        modelIdToIndex.set(id, models.length);
        models.push({ id, name, type, position, rotation, scale, preRotation });
    }
}

// Parse Deformers (Clusters)
const clusters = [];
for (const node of objectsNode.children) {
    if (node.name === 'Deformer' && node.properties[2]?.split?.('\0')[0] === 'Cluster') {
        const id = node.properties[0];
        const name = node.properties[1]?.split?.('\0')[0] || 'Cluster';
        let transformLink = null;
        for (const child of node.children) {
            if (child.name === 'TransformLink') {
                const arr = child.properties[0]?.data || child.properties[0];
                if (arr && arr.length === 16) {
                    transformLink = new Float32Array(arr);
                }
            }
        }
        clusters.push({ id, name, transformLink });
    }
}

// Build cluster -> bone mapping
// In FBX, Model (bone) -> Cluster connection means the cluster deforms that bone
const clusterToBone = new Map();
for (const conn of connections) {
    if (conn.type === 'OO') {
        // Try: cluster is fromId, bone is toId
        let cluster = clusters.find(c => c.id === conn.fromId);
        let boneModel = cluster ? models.find(m => m.id === conn.toId) : null;

        // Also try: bone is fromId, cluster is toId (reversed)
        if (!cluster || !boneModel) {
            cluster = clusters.find(c => c.id === conn.toId);
            boneModel = cluster ? models.find(m => m.id === conn.fromId) : null;
        }

        if (cluster && boneModel && boneModel.type === 'LimbNode') {
            clusterToBone.set(cluster.id, {
                clusterId: cluster.id,
                boneModelId: boneModel.id,
                boneModelIndex: modelIdToIndex.get(boneModel.id),
                boneName: boneModel.name
            });
        }
    }
}
console.log(`Cluster -> Bone mappings: ${clusterToBone.size}`);
if (clusterToBone.size === 0) {
    console.log(`WARNING: No cluster-bone mappings found! Checking connection types...`);
    // Debug: show some cluster-related connections
    let count = 0;
    for (const conn of connections) {
        const isClusterFrom = clusters.some(c => c.id === conn.fromId);
        const isClusterTo = clusters.some(c => c.id === conn.toId);
        if (isClusterFrom || isClusterTo) {
            if (count++ < 10) {
                console.log(`  [${conn.type}] ${conn.fromId} -> ${conn.toId} (prop: ${conn.property || 'none'})`);
            }
        }
    }
}

// Parse AnimationCurveNodes and Curves
const curveNodes = new Map();
const curves = new Map();

for (const node of objectsNode.children) {
    if (node.name === 'AnimationCurveNode') {
        const id = node.properties[0];
        const name = node.properties[1]?.split?.('\0')[0] || '';
        curveNodes.set(id, { id, name, attribute: name, targetModelId: null, curves: [] });
    }
    if (node.name === 'AnimationCurve') {
        const id = node.properties[0];
        let keyTimes = [], keyValues = [];
        for (const child of node.children) {
            if (child.name === 'KeyTime') {
                const arr = child.properties[0]?.data || child.properties[0];
                keyTimes = arr.map(t => Number(t) / 46186158000);
            }
            if (child.name === 'KeyValueFloat') {
                keyValues = child.properties[0]?.data || child.properties[0];
            }
        }
        curves.set(id, { id, keyTimes, keyValues, componentIndex: 0 });
    }
}

// Link curves to curveNodes and curveNodes to models
for (const conn of connections) {
    if (conn.type === 'OP') {
        const curveNode = curveNodes.get(conn.fromId);
        if (curveNode && conn.property?.includes('Lcl')) {
            curveNode.targetModelId = conn.toId;
            if (conn.property.includes('Translation')) curveNode.attribute = 'T';
            else if (conn.property.includes('Rotation')) curveNode.attribute = 'R';
            else if (conn.property.includes('Scaling')) curveNode.attribute = 'S';
        }
    }
    if (conn.type === 'OP' || conn.type === 'OO') {
        const curve = curves.get(conn.fromId);
        const curveNode = curveNodes.get(conn.toId);
        if (curve && curveNode) {
            if (conn.property === 'd|X') curve.componentIndex = 0;
            else if (conn.property === 'd|Y') curve.componentIndex = 1;
            else if (conn.property === 'd|Z') curve.componentIndex = 2;
            curveNode.curves.push(curve);
        }
    }
}

// ===== Build Animation Clips =====
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

function sampleCurve(curve, time) {
    const { keyTimes, keyValues } = curve;
    if (!keyTimes.length) return 0;
    if (time <= keyTimes[0]) return keyValues[0];
    if (time >= keyTimes[keyTimes.length - 1]) return keyValues[keyValues.length - 1];

    for (let i = 0; i < keyTimes.length - 1; i++) {
        if (time >= keyTimes[i] && time <= keyTimes[i + 1]) {
            const t = (time - keyTimes[i]) / (keyTimes[i + 1] - keyTimes[i]);
            return keyValues[i] + (keyValues[i + 1] - keyValues[i]) * t;
        }
    }
    return keyValues[keyValues.length - 1];
}

// Build animation samplers
const animationSamplers = [];
const animationChannels = [];

for (const [id, cn] of curveNodes) {
    if (!cn.targetModelId || cn.curves.length === 0) continue;

    const nodeIndex = modelIdToIndex.get(cn.targetModelId);
    if (nodeIndex === undefined) continue;

    const xCurve = cn.curves.find(c => c.componentIndex === 0);
    const yCurve = cn.curves.find(c => c.componentIndex === 1);
    const zCurve = cn.curves.find(c => c.componentIndex === 2);

    const refCurve = [xCurve, yCurve, zCurve].filter(Boolean).reduce((a, b) =>
        a.keyTimes.length > b.keyTimes.length ? a : b);

    const keyCount = refCurve.keyTimes.length;
    const input = refCurve.keyTimes;

    // Get model for PreRotation
    const model = models[nodeIndex];
    let preRotQuat = null;
    if (model?.preRotation) {
        const [prx, pry, prz] = model.preRotation.map(v => v * Math.PI / 180);
        preRotQuat = eulerToQuaternion(prx, pry, prz);
    }

    let output, path;
    if (cn.attribute === 'R') {
        path = 'rotation';
        output = new Float32Array(keyCount * 4);
        for (let i = 0; i < keyCount; i++) {
            const t = input[i];
            const rx = (xCurve ? sampleCurve(xCurve, t) : 0) * Math.PI / 180;
            const ry = (yCurve ? sampleCurve(yCurve, t) : 0) * Math.PI / 180;
            const rz = (zCurve ? sampleCurve(zCurve, t) : 0) * Math.PI / 180;
            let q = eulerToQuaternion(rx, ry, rz);
            if (preRotQuat) q = multiplyQuaternion(preRotQuat, q);
            output[i * 4] = q[0]; output[i * 4 + 1] = q[1];
            output[i * 4 + 2] = q[2]; output[i * 4 + 3] = q[3];
        }
    } else if (cn.attribute === 'T') {
        path = 'translation';
        output = new Float32Array(keyCount * 3);
        for (let i = 0; i < keyCount; i++) {
            const t = input[i];
            output[i * 3] = xCurve ? sampleCurve(xCurve, t) : 0;
            output[i * 3 + 1] = yCurve ? sampleCurve(yCurve, t) : 0;
            output[i * 3 + 2] = zCurve ? sampleCurve(zCurve, t) : 0;
        }
    } else {
        path = 'scale';
        output = new Float32Array(keyCount * 3);
        for (let i = 0; i < keyCount; i++) {
            const t = input[i];
            output[i * 3] = xCurve ? sampleCurve(xCurve, t) : 1;
            output[i * 3 + 1] = yCurve ? sampleCurve(yCurve, t) : 1;
            output[i * 3 + 2] = zCurve ? sampleCurve(zCurve, t) : 1;
        }
    }

    const samplerIndex = animationSamplers.length;
    animationSamplers.push({ input: Float32Array.from(input), output });
    animationChannels.push({ samplerIndex, target: { nodeIndex, path } });
}

const duration = Math.max(...animationSamplers.map(s => s.input[s.input.length - 1] || 0));

console.log(`=== Animation Data ===`);
console.log(`Channels: ${animationChannels.length}`);
console.log(`Duration: ${duration.toFixed(2)}s`);

// ===== Build Skeleton =====
const joints = [];
const boneModelIdToJointIndex = new Map();

for (const cluster of clusters) {
    const boneInfo = clusterToBone.get(cluster.id);
    if (!boneInfo) continue;

    const nodeIndex = boneInfo.boneModelIndex;
    const model = models[nodeIndex];

    const jointIndex = joints.length;
    boneModelIdToJointIndex.set(boneInfo.boneModelId, jointIndex);

    // Invert TransformLink for inverseBindMatrix
    let inverseBindMatrix = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
    if (cluster.transformLink) {
        inverseBindMatrix = invertMatrix4(cluster.transformLink);
    }

    joints.push({
        name: model?.name || `Joint_${jointIndex}`,
        nodeIndex,
        parentIndex: -1,
        inverseBindMatrix
    });
}

// Set parent indices
const modelParentMap = new Map();
for (const conn of connections) {
    if (conn.type === 'OO') {
        const childIdx = modelIdToIndex.get(conn.fromId);
        const parentIdx = modelIdToIndex.get(conn.toId);
        if (childIdx !== undefined && parentIdx !== undefined) {
            // fromId (child) -> toId (parent)
            const childModel = models[childIdx];
            const parentModel = models[parentIdx];
            if (childModel && parentModel) {
                modelParentMap.set(conn.fromId, conn.toId);
            }
        }
    }
}

for (let i = 0; i < joints.length; i++) {
    const joint = joints[i];
    const boneModelId = [...boneModelIdToJointIndex.entries()].find(([k, v]) => v === i)?.[0];
    if (!boneModelId) continue;

    let parentModelId = modelParentMap.get(boneModelId);
    while (parentModelId) {
        const parentJointIdx = boneModelIdToJointIndex.get(parentModelId);
        if (parentJointIdx !== undefined) {
            joint.parentIndex = parentJointIdx;
            break;
        }
        parentModelId = modelParentMap.get(parentModelId);
    }
}

console.log(`\n=== Skeleton ===`);
console.log(`Joints: ${joints.length}`);
console.log(`First 5 joints:`);
for (let i = 0; i < Math.min(5, joints.length); i++) {
    const j = joints[i];
    console.log(`  [${i}] "${j.name}" nodeIndex=${j.nodeIndex}, parent=${j.parentIndex}`);
}

// Check animation channel targets vs skeleton joint nodeIndices
const animChannelNodeIndices = new Set(animationChannels.map(c => c.target.nodeIndex));
const jointNodeIndices = new Set(joints.map(j => j.nodeIndex));

console.log(`\n=== Animation vs Skeleton Mapping ===`);
console.log(`Animation channel target nodes: ${animChannelNodeIndices.size}`);
console.log(`Skeleton joint nodes: ${jointNodeIndices.size}`);

// Find intersection
const intersection = [...jointNodeIndices].filter(idx => animChannelNodeIndices.has(idx));
console.log(`Joints with animation: ${intersection.length}/${joints.length}`);

// Find joints without animation
const jointsWithoutAnim = joints.filter(j => !animChannelNodeIndices.has(j.nodeIndex));
if (jointsWithoutAnim.length > 0) {
    console.log(`Joints WITHOUT animation:`);
    for (const j of jointsWithoutAnim.slice(0, 5)) {
        console.log(`  "${j.name}" nodeIndex=${j.nodeIndex}`);
    }
}

// ===== Test Animation Sampling =====
console.log(`\n=== Animation Sampling Test ===`);

function slerpQuaternion(q0, q1, t) {
    let [x0, y0, z0, w0] = q0;
    let [x1, y1, z1, w1] = q1;
    let dot = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1;
    if (dot < 0) { x1 = -x1; y1 = -y1; z1 = -z1; w1 = -w1; dot = -dot; }
    if (dot > 0.9995) {
        const r = [x0 + t * (x1 - x0), y0 + t * (y1 - y0), z0 + t * (z1 - z0), w0 + t * (w1 - w0)];
        const len = Math.sqrt(r[0]**2 + r[1]**2 + r[2]**2 + r[3]**2);
        return [r[0]/len, r[1]/len, r[2]/len, r[3]/len];
    }
    const theta0 = Math.acos(dot);
    const theta = theta0 * t;
    const sinTheta = Math.sin(theta);
    const sinTheta0 = Math.sin(theta0);
    const s0 = Math.cos(theta) - dot * sinTheta / sinTheta0;
    const s1 = sinTheta / sinTheta0;
    return [s0*x0 + s1*x1, s0*y0 + s1*y1, s0*z0 + s1*z1, s0*w0 + s1*w1];
}

function sampleAnimation(time) {
    const transforms = new Map();
    for (const channel of animationChannels) {
        const sampler = animationSamplers[channel.samplerIndex];
        const { input, output } = sampler;
        const { nodeIndex, path } = channel.target;

        // Find keyframes
        let i0 = 0;
        for (let i = 0; i < input.length - 1; i++) {
            if (time >= input[i] && time <= input[i + 1]) { i0 = i; break; }
            if (time < input[i]) break;
            i0 = i;
        }
        const i1 = Math.min(i0 + 1, input.length - 1);
        const t = input[i1] > input[i0] ? (time - input[i0]) / (input[i1] - input[i0]) : 0;

        let value;
        if (path === 'rotation') {
            const q0 = [output[i0*4], output[i0*4+1], output[i0*4+2], output[i0*4+3]];
            const q1 = [output[i1*4], output[i1*4+1], output[i1*4+2], output[i1*4+3]];
            value = slerpQuaternion(q0, q1, t);
        } else {
            const count = path === 'rotation' ? 4 : 3;
            value = [];
            for (let c = 0; c < count; c++) {
                value.push(output[i0 * count + c] + (output[i1 * count + c] - output[i0 * count + c]) * t);
            }
        }

        if (!transforms.has(nodeIndex)) transforms.set(nodeIndex, {});
        transforms.get(nodeIndex)[path] = value;
    }
    return transforms;
}

// Check animation data at different times
const testTimes = [0, 0.5, 1.0, 1.5, 2.0];
for (const time of testTimes) {
    const transforms = sampleAnimation(time);

    // Count how many joints have animation
    let matchCount = 0;
    for (const joint of joints) {
        if (transforms.has(joint.nodeIndex)) matchCount++;
    }

    console.log(`\nt=${time.toFixed(1)}s: ${transforms.size} node transforms, ${matchCount}/${joints.length} joints have animation`);

    // Sample first 3 joints
    for (let i = 0; i < Math.min(3, joints.length); i++) {
        const j = joints[i];
        const t = transforms.get(j.nodeIndex);
        if (t) {
            const pos = t.translation ? `[${t.translation.map(v => v.toFixed(2)).join(',')}]` : 'none';
            const rot = t.rotation ? `[${t.rotation.map(v => v.toFixed(3)).join(',')}]` : 'none';
            console.log(`  Joint[${i}] "${j.name}": pos=${pos} rot=${rot}`);
        } else {
            console.log(`  Joint[${i}] "${j.name}": NO ANIMATION DATA`);
        }
    }
}

// ===== Check if animation changes over time =====
console.log(`\n=== Animation Value Changes ===`);

// Find a rotation channel and check value changes
const rotChannels = animationChannels.filter(c => c.target.path === 'rotation');
console.log(`Rotation channels: ${rotChannels.length}`);

if (rotChannels.length > 0) {
    // Find one with varying values
    for (const ch of rotChannels.slice(0, 5)) {
        const sampler = animationSamplers[ch.samplerIndex];
        const firstQ = [sampler.output[0], sampler.output[1], sampler.output[2], sampler.output[3]];
        const lastQ = [
            sampler.output[(sampler.input.length-1)*4],
            sampler.output[(sampler.input.length-1)*4+1],
            sampler.output[(sampler.input.length-1)*4+2],
            sampler.output[(sampler.input.length-1)*4+3]
        ];
        const diff = Math.abs(firstQ[0]-lastQ[0]) + Math.abs(firstQ[1]-lastQ[1]) +
                     Math.abs(firstQ[2]-lastQ[2]) + Math.abs(firstQ[3]-lastQ[3]);
        const nodeIdx = ch.target.nodeIndex;
        const model = models[nodeIdx];
        console.log(`  Node[${nodeIdx}] "${model?.name}": ${sampler.input.length} keyframes, diff=${diff.toFixed(4)}`);
        if (diff > 0.01) {
            console.log(`    First: [${firstQ.map(v=>v.toFixed(4)).join(', ')}]`);
            console.log(`    Last:  [${lastQ.map(v=>v.toFixed(4)).join(', ')}]`);
        }
    }
}

// ===== Calculate Bone Matrices =====
console.log(`\n=== Bone Matrix Test ===`);

// Test at t=0 (should be bind pose - identity matrices)
// 在 t=0 测试（应该是绑定姿势 - 单位矩阵）

function createTransformMatrix(pos, rot, scale) {
    const [qx, qy, qz, qw] = rot;
    const [sx, sy, sz] = scale;
    const xx = qx*qx, xy = qx*qy, xz = qx*qz, xw = qx*qw;
    const yy = qy*qy, yz = qy*qz, yw = qy*qw;
    const zz = qz*qz, zw = qz*qw;
    return new Float32Array([
        (1 - 2*(yy+zz))*sx, 2*(xy+zw)*sx, 2*(xz-yw)*sx, 0,
        2*(xy-zw)*sy, (1 - 2*(xx+zz))*sy, 2*(yz+xw)*sy, 0,
        2*(xz+yw)*sz, 2*(yz-xw)*sz, (1 - 2*(xx+yy))*sz, 0,
        pos[0], pos[1], pos[2], 1
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

function invertMatrix4(m) {
    const out = new Float32Array(16);
    const m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
    const m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
    const m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];
    const m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];

    const b00 = m00*m11 - m01*m10, b01 = m00*m12 - m02*m10;
    const b02 = m00*m13 - m03*m10, b03 = m01*m12 - m02*m11;
    const b04 = m01*m13 - m03*m11, b05 = m02*m13 - m03*m12;
    const b06 = m20*m31 - m21*m30, b07 = m20*m32 - m22*m30;
    const b08 = m20*m33 - m23*m30, b09 = m21*m32 - m22*m31;
    const b10 = m21*m33 - m23*m31, b11 = m22*m33 - m23*m32;

    let det = b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06;
    if (!det) return out;
    det = 1.0 / det;

    out[0] = (m11*b11 - m12*b10 + m13*b09) * det;
    out[1] = (m02*b10 - m01*b11 - m03*b09) * det;
    out[2] = (m31*b05 - m32*b04 + m33*b03) * det;
    out[3] = (m22*b04 - m21*b05 - m23*b03) * det;
    out[4] = (m12*b08 - m10*b11 - m13*b07) * det;
    out[5] = (m00*b11 - m02*b08 + m03*b07) * det;
    out[6] = (m32*b02 - m30*b05 - m33*b01) * det;
    out[7] = (m20*b05 - m22*b02 + m23*b01) * det;
    out[8] = (m10*b10 - m11*b08 + m13*b06) * det;
    out[9] = (m01*b08 - m00*b10 - m03*b06) * det;
    out[10] = (m30*b04 - m31*b02 + m33*b00) * det;
    out[11] = (m21*b02 - m20*b04 - m23*b00) * det;
    out[12] = (m11*b07 - m10*b09 - m12*b06) * det;
    out[13] = (m00*b09 - m01*b07 + m02*b06) * det;
    out[14] = (m31*b01 - m30*b03 - m32*b00) * det;
    out[15] = (m20*b03 - m21*b01 + m22*b00) * det;
    return out;
}

// Test multiple times including t=0 (bind pose)
const testTimesForMatrix = [0, 1.0, 7.5];

// Build node default transforms from models
const nodeTransforms = [];
for (const model of models) {
    const rx = model.rotation[0] * Math.PI / 180;
    const ry = model.rotation[1] * Math.PI / 180;
    const rz = model.rotation[2] * Math.PI / 180;
    let quat = eulerToQuaternion(rx, ry, rz);
    if (model.preRotation) {
        const prx = model.preRotation[0] * Math.PI / 180;
        const pry = model.preRotation[1] * Math.PI / 180;
        const prz = model.preRotation[2] * Math.PI / 180;
        const preQuat = eulerToQuaternion(prx, pry, prz);
        quat = multiplyQuaternion(preQuat, quat);
    }
    nodeTransforms.push({
        position: model.position,
        rotation: quat,
        scale: model.scale
    });
}

// Calculate bone matrices for different times
function calculateBoneMatrices(time) {
    const transforms = sampleAnimation(time);
    const localMatrices = [], worldMatrices = [], skinMatrices = [];
    const processed = new Set();
    const processingOrder = [];

    function addJoint(idx) {
        if (processed.has(idx)) return;
        if (joints[idx].parentIndex >= 0 && !processed.has(joints[idx].parentIndex)) {
            addJoint(joints[idx].parentIndex);
        }
        processingOrder.push(idx);
        processed.add(idx);
    }
    for (let i = 0; i < joints.length; i++) addJoint(i);

    for (const jointIdx of processingOrder) {
        const joint = joints[jointIdx];
        const nodeIdx = joint.nodeIndex;
        const node = nodeTransforms[nodeIdx];

        // Get animated or default transform
        const animT = transforms.get(nodeIdx);
        const pos = animT?.translation || node.position;
        const rot = animT?.rotation || node.rotation;
        const scl = animT?.scale || node.scale;

        localMatrices[jointIdx] = createTransformMatrix(pos, rot, scl);

        if (joint.parentIndex >= 0) {
            worldMatrices[jointIdx] = multiplyMatrices(worldMatrices[joint.parentIndex], localMatrices[jointIdx]);
        } else {
            worldMatrices[jointIdx] = localMatrices[jointIdx];
        }

        skinMatrices[jointIdx] = multiplyMatrices(worldMatrices[jointIdx], joint.inverseBindMatrix);
    }

    return skinMatrices;
}

// Test at multiple times
for (const time of testTimesForMatrix) {
    console.log(`\n--- t=${time.toFixed(1)}s ---`);
    const skinMatrices = calculateBoneMatrices(time);

    // Check skin matrices - how many are NOT identity?
    let nonIdentityCount = 0;
    let maxDiff = 0;
    for (let i = 0; i < skinMatrices.length; i++) {
        const m = skinMatrices[i];
        const diff = Math.abs(m[0]-1) + Math.abs(m[5]-1) + Math.abs(m[10]-1) + Math.abs(m[15]-1) +
                     Math.abs(m[1]) + Math.abs(m[2]) + Math.abs(m[3]) +
                     Math.abs(m[4]) + Math.abs(m[6]) + Math.abs(m[7]) +
                     Math.abs(m[8]) + Math.abs(m[9]) + Math.abs(m[11]) +
                     Math.abs(m[12]) + Math.abs(m[13]) + Math.abs(m[14]);
        if (diff > 0.001) {
            nonIdentityCount++;
            if (diff > maxDiff) maxDiff = diff;
        }
    }

    console.log(`  Non-identity: ${nonIdentityCount}/${skinMatrices.length}, max diff: ${maxDiff.toFixed(4)}`);
    if (time === 0) {
        console.log(`  (t=0 should have mostly identity matrices if bind pose is correct)`);
    }

    // Show first 3 skin matrices
    for (let i = 0; i < Math.min(3, skinMatrices.length); i++) {
        const m = skinMatrices[i];
        console.log(`  Joint[${i}] "${joints[i].name}":`);
        console.log(`    diagonal: [${m[0].toFixed(4)}, ${m[5].toFixed(4)}, ${m[10].toFixed(4)}, ${m[15].toFixed(4)}]`);
        console.log(`    translation: [${m[12].toFixed(4)}, ${m[13].toFixed(4)}, ${m[14].toFixed(4)}]`);
    }
}

console.log(`\n=== Done ===`);
