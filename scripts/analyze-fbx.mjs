/**
 * FBX Animation Analysis Script
 * 分析 FBX 文件的动画数据
 */

import { readFileSync } from 'fs';

const FBX_TIME_SECOND = 46186158000n;

// Read FBX file
const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';
console.log(`Analyzing: ${filePath}`);

const buffer = readFileSync(filePath);
const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

// Check header
const magic = new TextDecoder().decode(buffer.slice(0, 21));
console.log(`Header: "${magic}"`);

const version = view.getUint32(23, true);
console.log(`FBX Version: ${version}`);

// Simple FBX parser for animation data
let offset = 27; // After header

function readNode(is64Bit) {
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
            case 'Y': // Int16
                properties.push(view.getInt16(offset, true));
                offset += 2;
                break;
            case 'C': // Bool
                properties.push(buffer[offset] !== 0);
                offset += 1;
                break;
            case 'I': // Int32
                properties.push(view.getInt32(offset, true));
                offset += 4;
                break;
            case 'F': // Float
                properties.push(view.getFloat32(offset, true));
                offset += 4;
                break;
            case 'D': // Double
                properties.push(view.getFloat64(offset, true));
                offset += 8;
                break;
            case 'L': // Int64
                properties.push(view.getBigInt64(offset, true));
                offset += 8;
                break;
            case 'S': // String
            case 'R': // Raw binary
                const strLen = view.getUint32(offset, true);
                offset += 4;
                if (typeCode === 'S') {
                    properties.push(new TextDecoder().decode(buffer.slice(offset, offset + strLen)));
                } else {
                    properties.push(buffer.slice(offset, offset + strLen));
                }
                offset += strLen;
                break;
            case 'f': // Float array
            case 'd': // Double array
            case 'l': // Long array
            case 'i': // Int array
            case 'b': // Bool array
                const arrayLen = view.getUint32(offset, true);
                const encoding = view.getUint32(offset + 4, true);
                const compressedLen = view.getUint32(offset + 8, true);
                offset += 12;

                if (encoding === 0) {
                    // Uncompressed
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
                    // Compressed - skip for now
                    properties.push({ type: typeCode, compressed: true, len: arrayLen });
                    offset += compressedLen;
                }
                break;
            default:
                console.log(`Unknown type: ${typeCode} at offset ${offset - 1}`);
                offset = propsEnd;
        }
    }

    // Read children
    const children = [];
    while (offset < endOffset) {
        const child = readNode(is64Bit);
        if (child) children.push(child);
        else break;
    }

    offset = endOffset;

    return { name, properties, children };
}

// Parse root nodes
const is64Bit = version >= 7500;
const rootNodes = [];

while (offset < buffer.length - 100) {
    const node = readNode(is64Bit);
    if (node) {
        rootNodes.push(node);
    } else {
        break;
    }
}

console.log(`Root nodes: ${rootNodes.map(n => n.name).join(', ')}`);

// Find Objects node
const objectsNode = rootNodes.find(n => n.name === 'Objects');
if (!objectsNode) {
    console.log('No Objects node found!');
    process.exit(1);
}

// Find animation curves
const animCurves = objectsNode.children.filter(n => n.name === 'AnimationCurve');
const animCurveNodes = objectsNode.children.filter(n => n.name === 'AnimationCurveNode');

console.log(`\nAnimation data:`);
console.log(`  AnimationCurve nodes: ${animCurves.length}`);
console.log(`  AnimationCurveNode nodes: ${animCurveNodes.length}`);

// Analyze first few animation curves with actual data
console.log(`\nFirst 10 AnimationCurves with varying values:`);
let count = 0;
for (const curve of animCurves) {
    if (count >= 10) break;

    // Find KeyTime and KeyValueFloat
    let keyTimes = null;
    let keyValues = null;

    for (const child of curve.children) {
        if (child.name === 'KeyTime') {
            keyTimes = child.properties[0];
        } else if (child.name === 'KeyValueFloat') {
            keyValues = child.properties[0];
        }
    }

    if (keyValues?.data) {
        const values = keyValues.data;
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Only show curves with varying values
        if (Math.abs(max - min) > 0.001) {
            const id = curve.properties[0];
            const name = curve.properties[1]?.split?.('\0')[0] || 'AnimationCurve';
            console.log(`  Curve ${id}: ${values.length} keyframes, range: ${min.toFixed(4)} - ${max.toFixed(4)}`);
            console.log(`    First 5 values: ${values.slice(0, 5).map(v => v.toFixed(4)).join(', ')}`);
            console.log(`    Last 5 values: ${values.slice(-5).map(v => v.toFixed(4)).join(', ')}`);
            count++;
        }
    }
}

// Find Connections node
const connectionsNode = rootNodes.find(n => n.name === 'Connections');
if (connectionsNode) {
    // Find connections with d|X, d|Y, d|Z properties
    const curveConnections = connectionsNode.children.filter(c => {
        const prop = c.properties[3];
        return prop === 'd|X' || prop === 'd|Y' || prop === 'd|Z';
    });
    console.log(`\nCurve connections (d|X/Y/Z): ${curveConnections.length}`);

    // Show first 10
    console.log(`First 10 curve connections:`);
    for (let i = 0; i < Math.min(10, curveConnections.length); i++) {
        const c = curveConnections[i];
        console.log(`  ${c.properties[1]} -> ${c.properties[2]}, prop: ${c.properties[3]}`);
    }
}

// Find AnimationCurveNodes and their connections
console.log(`\nAnimationCurveNode analysis:`);
const curveNodesByAttr = { T: 0, R: 0, S: 0, other: 0 };
for (const cn of animCurveNodes) {
    const name = cn.properties[1]?.split?.('\0')[0] || '';
    if (name === 'T') curveNodesByAttr.T++;
    else if (name === 'R') curveNodesByAttr.R++;
    else if (name === 'S') curveNodesByAttr.S++;
    else curveNodesByAttr.other++;
}
console.log(`  Translation (T): ${curveNodesByAttr.T}`);
console.log(`  Rotation (R): ${curveNodesByAttr.R}`);
console.log(`  Scale (S): ${curveNodesByAttr.S}`);
console.log(`  Other: ${curveNodesByAttr.other}`);

console.log('\nDone!');
