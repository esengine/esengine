/**
 * Check PreRotation in FBX
 * 检查 FBX 中的 PreRotation
 */

import { readFileSync } from 'fs';
import pako from 'pako';
const { inflate } = pako;

const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';

console.log(`=== Checking PreRotation: ${filePath} ===\n`);

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

// Parse Models and check for PreRotation
const modelsWithPreRot = [];
const modelsWithoutPreRot = [];

for (const n of objectsNode.children) {
    if (n.name !== 'Model') continue;

    const modelName = n.properties[1]?.split?.('\0')[0] || 'Model';
    let hasPreRotation = false;
    let preRotation = null;
    let lclRotation = null;

    for (const child of n.children) {
        if (child.name === 'Properties70') {
            for (const prop of child.children) {
                if (prop.properties[0] === 'PreRotation') {
                    hasPreRotation = true;
                    preRotation = [prop.properties[4], prop.properties[5], prop.properties[6]];
                }
                if (prop.properties[0] === 'Lcl Rotation') {
                    lclRotation = [prop.properties[4], prop.properties[5], prop.properties[6]];
                }
            }
        }
    }

    if (hasPreRotation) {
        modelsWithPreRot.push({ name: modelName, preRotation, lclRotation });
    } else {
        modelsWithoutPreRot.push({ name: modelName, lclRotation });
    }
}

console.log(`Models WITH PreRotation: ${modelsWithPreRot.length}`);
console.log(`Models WITHOUT PreRotation: ${modelsWithoutPreRot.length}`);

if (modelsWithPreRot.length > 0) {
    console.log(`\nFirst 5 models with PreRotation:`);
    modelsWithPreRot.slice(0, 5).forEach(m => {
        console.log(`  "${m.name}":`);
        console.log(`    PreRotation: [${m.preRotation.map(v => v.toFixed(2)).join(', ')}]`);
        console.log(`    LclRotation: [${m.lclRotation?.map(v => v.toFixed(2)).join(', ') || 'none'}]`);
    });
}

// Check if bones have PreRotation (bones typically have "Bone" in name)
const boneModels = modelsWithPreRot.filter(m => m.name.includes('Bone'));
console.log(`\nBone models with PreRotation: ${boneModels.length}`);

if (boneModels.length > 0) {
    console.log(`\n⚠️ This FBX has bones with PreRotation!`);
    console.log(`PreRotation MUST be applied when building world matrices.`);
}

console.log('\nDone!');
