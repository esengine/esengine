/**
 * Debug Animation Channels Building
 */

import { readFileSync } from 'fs';
import pako from 'pako';
const { inflate } = pako;

const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';

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

// Parse AnimationCurveNodes
const animCurveNodes = objectsNode.children.filter(n => n.name === 'AnimationCurveNode');

console.log(`AnimationCurveNodes count: ${animCurveNodes.length}`);
console.log(`First 3 AnimationCurveNodes:`);
animCurveNodes.slice(0, 3).forEach((cn, i) => {
    console.log(`  [${i}] properties:`, cn.properties);
    console.log(`      id type: ${typeof cn.properties[0]}`);
    console.log(`      id value: ${cn.properties[0]}`);
});

// Parse connections
const connections = connectionsNode.children.map(c => ({
    type: c.properties[0].split('\0')[0],
    fromId: c.properties[1],
    toId: c.properties[2],
    property: c.properties[3]?.split?.('\0')[0]
}));

console.log(`\nConnections count: ${connections.length}`);

// Find OP connections with Lcl property
const lclConnections = connections.filter(c => c.type === 'OP' && c.property?.includes('Lcl'));
console.log(`OP connections with Lcl: ${lclConnections.length}`);
console.log(`First 3 Lcl connections:`);
lclConnections.slice(0, 3).forEach((c, i) => {
    console.log(`  [${i}] fromId=${c.fromId} (type: ${typeof c.fromId}), toId=${c.toId}, prop=${c.property}`);
});

// Check if any AnimationCurveNode id matches connection fromId
console.log(`\nChecking AnimationCurveNode ID matches:`);
const cnIds = new Set(animCurveNodes.map(cn => cn.properties[0]));
const lclFromIds = lclConnections.map(c => c.fromId);

let matchCount = 0;
for (const fromId of lclFromIds) {
    // Check different ID formats
    const matchesDirect = cnIds.has(fromId);
    const matchesBigInt = cnIds.has(BigInt(fromId));

    if (matchesDirect || matchesBigInt) {
        matchCount++;
    }
}

console.log(`Matches found: ${matchCount}/${lclConnections.length}`);

// The issue might be that animCurveNodes doesn't have an 'id' property
// Let's check how we should reference them
console.log(`\nAnimationCurveNode structure check:`);
const firstCN = animCurveNodes[0];
if (firstCN) {
    console.log(`  Has 'id' property: ${'id' in firstCN}`);
    console.log(`  properties[0] type: ${typeof firstCN.properties[0]}`);
    console.log(`  properties[0] value: ${firstCN.properties[0]}`);
}

// The fix: we need to use cn.properties[0] as the ID, not cn.id
// Let's verify by creating a proper map
const curveNodeMap = new Map();
for (const cn of animCurveNodes) {
    curveNodeMap.set(cn.properties[0], cn);
}

console.log(`\nBuilt curveNodeMap with ${curveNodeMap.size} entries`);

// Now check matches
let matchCount2 = 0;
for (const conn of lclConnections) {
    if (curveNodeMap.has(conn.fromId)) {
        matchCount2++;
    }
}
console.log(`Matches using proper lookup: ${matchCount2}/${lclConnections.length}`);

console.log('\nDone!');
