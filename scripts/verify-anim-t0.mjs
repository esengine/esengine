/**
 * Verify Animation at t=0
 * 验证 t=0 时的动画值
 *
 * Check if animation values at t=0 produce correct bind pose
 */

import { readFileSync } from 'fs';
import pako from 'pako';
const { inflate } = pako;

const FBX_TIME_SECOND = 46186158000n;
const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';

console.log(`=== Verify Animation at t=0: ${filePath} ===\n`);

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

// Parse Models with PreRotation
const models = objectsNode.children
    .filter(n => n.name === 'Model')
    .map(n => {
        const position = [0, 0, 0];
        const rotation = [0, 0, 0];
        const scale = [1, 1, 1];
        let preRotation = null;

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
                    } else if (prop.properties[0] === 'PreRotation') {
                        preRotation = [prop.properties[4], prop.properties[5], prop.properties[6]];
                    }
                }
            }
        }

        return {
            id: n.properties[0],
            name: n.properties[1]?.split?.('\0')[0] || 'Model',
            position, rotation, scale, preRotation
        };
    });

const modelToIndex = new Map();
const modelById = new Map();
models.forEach((m, i) => {
    modelToIndex.set(m.id, i);
    modelById.set(m.id, m);
});

// Parse AnimationCurves
const animCurves = objectsNode.children
    .filter(n => n.name === 'AnimationCurve')
    .map(n => {
        const keyTimeNode = n.children.find(c => c.name === 'KeyTime');
        const keyValueNode = n.children.find(c => c.name === 'KeyValueFloat');

        const keyTimes = keyTimeNode?.properties[0]?.data?.map(t => Number(t) / Number(FBX_TIME_SECOND)) || [];
        const keyValues = keyValueNode?.properties[0]?.data || [];

        return {
            id: n.properties[0],
            keyTimes,
            keyValues
        };
    });

// Parse AnimationCurveNodes
const curveNodes = objectsNode.children
    .filter(n => n.name === 'AnimationCurveNode')
    .map(n => ({
        id: n.properties[0],
        name: n.properties[1]?.split?.('\0')[0] || ''
    }));

// Build curveNode to model mapping
const curveNodeToModel = new Map();
for (const conn of connections) {
    if (conn.type === 'OP' && conn.property?.includes('Lcl')) {
        const cn = curveNodes.find(c => c.id === conn.fromId);
        if (cn) {
            curveNodeToModel.set(cn.id, { modelId: conn.toId, property: conn.property });
        }
    }
}

// Build curveNode to curves mapping
const curveNodeToCurves = new Map();
for (const conn of connections) {
    if (conn.type === 'OP' && (conn.property === 'd|X' || conn.property === 'd|Y' || conn.property === 'd|Z')) {
        const curve = animCurves.find(c => c.id === conn.fromId);
        const cn = curveNodes.find(c => c.id === conn.toId);
        if (curve && cn) {
            if (!curveNodeToCurves.has(cn.id)) {
                curveNodeToCurves.set(cn.id, { x: null, y: null, z: null });
            }
            const curves = curveNodeToCurves.get(cn.id);
            if (conn.property === 'd|X') curves.x = curve;
            if (conn.property === 'd|Y') curves.y = curve;
            if (conn.property === 'd|Z') curves.z = curve;
        }
    }
}

// Sample animation at t=0
console.log(`=== SAMPLING ANIMATION AT t=0 ===\n`);

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

function multiplyQuaternion(a, b) {
    const [ax, ay, az, aw] = a;
    const [bx, by, bz, bw] = b;
    return [
        aw * bx + ax * bw + ay * bz - az * by,
        aw * by - ax * bz + ay * bw + az * bx,
        aw * bz + ax * by - ay * bx + az * bw,
        aw * bw - ax * bx - ay * by - az * bz
    ];
}

function sampleCurveAtT0(curve) {
    if (!curve || !curve.keyValues || curve.keyValues.length === 0) return 0;
    return curve.keyValues[0]; // Value at first keyframe (t=0)
}

// For each curveNode, sample at t=0
const sampledTransforms = new Map();

for (const [cnId, target] of curveNodeToModel) {
    const nodeIndex = modelToIndex.get(target.modelId);
    if (nodeIndex === undefined) continue;

    const curves = curveNodeToCurves.get(cnId);
    if (!curves) continue;

    const model = modelById.get(target.modelId);

    if (!sampledTransforms.has(nodeIndex)) {
        sampledTransforms.set(nodeIndex, {
            position: null,
            rotation: null,
            scale: null
        });
    }
    const transform = sampledTransforms.get(nodeIndex);

    if (target.property.includes('Translation')) {
        transform.position = [
            sampleCurveAtT0(curves.x),
            sampleCurveAtT0(curves.y),
            sampleCurveAtT0(curves.z)
        ];
    } else if (target.property.includes('Rotation')) {
        // Get rotation in degrees
        const rx = sampleCurveAtT0(curves.x);
        const ry = sampleCurveAtT0(curves.y);
        const rz = sampleCurveAtT0(curves.z);

        // Convert to radians
        const rxRad = rx * Math.PI / 180;
        const ryRad = ry * Math.PI / 180;
        const rzRad = rz * Math.PI / 180;

        // Apply PreRotation if model has it
        let quat;
        if (model?.preRotation) {
            const preRx = model.preRotation[0] * Math.PI / 180;
            const preRy = model.preRotation[1] * Math.PI / 180;
            const preRz = model.preRotation[2] * Math.PI / 180;
            const preQuat = eulerToQuaternion(preRx, preRy, preRz);
            const lclQuat = eulerToQuaternion(rxRad, ryRad, rzRad);
            quat = multiplyQuaternion(preQuat, lclQuat);
        } else {
            quat = eulerToQuaternion(rxRad, ryRad, rzRad);
        }

        transform.rotation = quat;
    } else if (target.property.includes('Scaling')) {
        transform.scale = [
            sampleCurveAtT0(curves.x) || 1,
            sampleCurveAtT0(curves.y) || 1,
            sampleCurveAtT0(curves.z) || 1
        ];
    }
}

// Compare with node.transform for first joint
const firstJointNodeIndex = 1; // Bone001 is at index 1

const sampledT = sampledTransforms.get(firstJointNodeIndex);
const model = models[firstJointNodeIndex];

console.log(`First bone: "${model.name}" (nodeIndex=${firstJointNodeIndex})`);
console.log(`\nnode.transform (from Lcl*):`);
console.log(`  position: [${model.position.join(', ')}]`);
console.log(`  rotation: [${model.rotation.join(', ')}] (degrees)`);
console.log(`  scale: [${model.scale.join(', ')}]`);
if (model.preRotation) {
    console.log(`  preRotation: [${model.preRotation.join(', ')}] (degrees)`);
}

console.log(`\nAnimation at t=0:`);
if (sampledT) {
    console.log(`  position: [${sampledT.position?.join(', ') || 'null'}]`);
    console.log(`  rotation: [${sampledT.rotation?.map(v => v.toFixed(4)).join(', ') || 'null'}]`);
    console.log(`  scale: [${sampledT.scale?.join(', ') || 'null'}]`);
} else {
    console.log(`  No animation data!`);
}

// Now build quaternion from node.transform for comparison
const nodeRotRad = model.rotation.map(v => v * Math.PI / 180);
let nodeQuat;
if (model.preRotation) {
    const preRad = model.preRotation.map(v => v * Math.PI / 180);
    const preQuat = eulerToQuaternion(preRad[0], preRad[1], preRad[2]);
    const lclQuat = eulerToQuaternion(nodeRotRad[0], nodeRotRad[1], nodeRotRad[2]);
    nodeQuat = multiplyQuaternion(preQuat, lclQuat);
} else {
    nodeQuat = eulerToQuaternion(nodeRotRad[0], nodeRotRad[1], nodeRotRad[2]);
}

console.log(`\nnode.transform rotation as quaternion: [${nodeQuat.map(v => v.toFixed(4)).join(', ')}]`);
if (sampledT?.rotation) {
    console.log(`animation rotation quaternion: [${sampledT.rotation.map(v => v.toFixed(4)).join(', ')}]`);

    // Check if they match
    const match = nodeQuat.every((v, i) => Math.abs(v - sampledT.rotation[i]) < 0.001);
    console.log(`\nDo they match? ${match ? 'YES ✅' : 'NO ❌'}`);
}

console.log('\nDone!');
