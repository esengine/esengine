/**
 * Check Bone Hierarchy
 * 检查骨骼层级
 *
 * Verify parent-child relationships for bones
 */

import { readFileSync } from 'fs';
import pako from 'pako';
const { inflate } = pako;

const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';

console.log(`=== Check Bone Hierarchy: ${filePath} ===\n`);

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
        name: n.properties[1]?.split?.('\0')[0] || 'Model',
        type: n.properties[2]?.split?.('\0')[0] || ''
    }));

// Build parent relationships from connections
const modelParent = new Map();
const modelChildren = new Map();

for (const conn of connections) {
    if (conn.type === 'OO') {
        const fromModel = models.find(m => m.id === conn.fromId);
        const toModel = models.find(m => m.id === conn.toId);
        if (fromModel && toModel) {
            modelParent.set(conn.fromId, conn.toId);
            if (!modelChildren.has(conn.toId)) {
                modelChildren.set(conn.toId, []);
            }
            modelChildren.get(conn.toId).push(conn.fromId);
        }
    }
}

// Find Bone001 and trace its parents
const bone001 = models.find(m => m.name === 'Bone001');
if (bone001) {
    console.log(`Bone001 (id=${bone001.id}):`);
    console.log(`  type: "${bone001.type}"`);

    // Trace parent chain
    let currentId = bone001.id;
    let depth = 0;
    while (currentId && depth < 10) {
        const parentId = modelParent.get(currentId);
        if (parentId) {
            const parent = models.find(m => m.id === parentId);
            console.log(`  Parent [${depth}]: "${parent?.name}" (id=${parentId}, type="${parent?.type}")`);
        } else {
            console.log(`  Parent [${depth}]: ROOT (no parent)`);
            break;
        }
        currentId = parentId;
        depth++;
    }
}

// Show first level hierarchy
console.log(`\n=== ROOT LEVEL MODELS ===`);
const rootModels = models.filter(m => !modelParent.has(m.id));
rootModels.forEach(m => {
    console.log(`"${m.name}" (type="${m.type}")`);
    const children = modelChildren.get(m.id) || [];
    children.slice(0, 5).forEach(cid => {
        const child = models.find(m => m.id === cid);
        console.log(`  └── "${child?.name}" (type="${child?.type}")`);
    });
    if (children.length > 5) {
        console.log(`  ... and ${children.length - 5} more children`);
    }
});

// Check if Bone001's parent has a transform that's not identity
const bone001Parent = modelParent.get(bone001?.id);
if (bone001Parent) {
    const parent = models.find(m => m.id === bone001Parent);
    console.log(`\n=== BONE001'S PARENT DETAILS ===`);
    console.log(`Parent: "${parent?.name}" (type="${parent?.type}")`);

    // Find this parent in FBX and get its transform
    for (const n of objectsNode.children) {
        if (n.name === 'Model' && n.properties[0] === bone001Parent) {
            let position = [0, 0, 0];
            let rotation = [0, 0, 0];
            let scale = [1, 1, 1];
            let preRotation = null;

            for (const child of n.children) {
                if (child.name === 'Properties70') {
                    for (const prop of child.children) {
                        if (prop.properties[0] === 'Lcl Translation') {
                            position = [prop.properties[4], prop.properties[5], prop.properties[6]];
                        } else if (prop.properties[0] === 'Lcl Rotation') {
                            rotation = [prop.properties[4], prop.properties[5], prop.properties[6]];
                        } else if (prop.properties[0] === 'Lcl Scaling') {
                            scale = [prop.properties[4], prop.properties[5], prop.properties[6]];
                        } else if (prop.properties[0] === 'PreRotation') {
                            preRotation = [prop.properties[4], prop.properties[5], prop.properties[6]];
                        }
                    }
                }
            }

            console.log(`  position: [${position.join(', ')}]`);
            console.log(`  rotation: [${rotation.join(', ')}]`);
            console.log(`  scale: [${scale.join(', ')}]`);
            if (preRotation) {
                console.log(`  preRotation: [${preRotation.join(', ')}]`);
            }

            // Check if parent has non-identity transform
            const hasNonIdentityTransform =
                position.some(v => Math.abs(v) > 0.001) ||
                rotation.some(v => Math.abs(v) > 0.001) ||
                scale.some(v => Math.abs(v - 1) > 0.001);

            if (hasNonIdentityTransform) {
                console.log(`\n⚠️ Parent has non-identity transform!`);
                console.log(`This transform MUST be included when calculating bone world matrices.`);
            } else {
                console.log(`\nParent has identity transform (no effect).`);
            }
        }
    }
}

console.log('\nDone!');
