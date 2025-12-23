/**
 * Compare InverseBindMatrix calculation
 * 比较逆绑定矩阵计算
 *
 * This script compares the IBM calculated in test script vs FBXLoader's method
 */

import { readFileSync } from 'fs';
import pako from 'pako';
const { inflate } = pako;

const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';

console.log(`=== Analyzing: ${filePath} ===\n`);

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

// Find first Cluster deformer
const clusterNodes = objectsNode.children.filter(n =>
    n.name === 'Deformer' && n.properties[2]?.split?.('\0')[0] === 'Cluster'
);

console.log(`Found ${clusterNodes.length} clusters\n`);

// Parse TransformLink from first cluster
const firstCluster = clusterNodes[0];
const clusterName = firstCluster.properties[1]?.split?.('\0')[0] || 'Cluster';

console.log(`First cluster: "${clusterName}"`);

// Find TransformLink child node
const transformLinkNode = firstCluster.children.find(c => c.name === 'TransformLink');
if (!transformLinkNode) {
    console.log('ERROR: No TransformLink found!');
    process.exit(1);
}

const transformLinkData = transformLinkNode.properties[0];
if (!transformLinkData?.data || transformLinkData.data.length !== 16) {
    console.log('ERROR: TransformLink data is not 16 doubles!');
    console.log('Got:', transformLinkData);
    process.exit(1);
}

// FBX stores matrices in row-major order
// WebGL expects column-major order
const tlRaw = transformLinkData.data;
console.log('\n=== TransformLink Raw Data (FBX row-major) ===');
console.log(`Row 0: ${tlRaw.slice(0, 4).map(v => v.toFixed(6)).join(', ')}`);
console.log(`Row 1: ${tlRaw.slice(4, 8).map(v => v.toFixed(6)).join(', ')}`);
console.log(`Row 2: ${tlRaw.slice(8, 12).map(v => v.toFixed(6)).join(', ')}`);
console.log(`Row 3: ${tlRaw.slice(12, 16).map(v => v.toFixed(6)).join(', ')}`);

// Convert to column-major for WebGL
const tlColMajor = new Float32Array([
    tlRaw[0], tlRaw[4], tlRaw[8], tlRaw[12],
    tlRaw[1], tlRaw[5], tlRaw[9], tlRaw[13],
    tlRaw[2], tlRaw[6], tlRaw[10], tlRaw[14],
    tlRaw[3], tlRaw[7], tlRaw[11], tlRaw[15]
]);

console.log('\n=== TransformLink (WebGL column-major) ===');
console.log(`Col 0: ${Array.from(tlColMajor.slice(0, 4)).map(v => v.toFixed(6)).join(', ')}`);
console.log(`Col 1: ${Array.from(tlColMajor.slice(4, 8)).map(v => v.toFixed(6)).join(', ')}`);
console.log(`Col 2: ${Array.from(tlColMajor.slice(8, 12)).map(v => v.toFixed(6)).join(', ')}`);
console.log(`Col 3: ${Array.from(tlColMajor.slice(12, 16)).map(v => v.toFixed(6)).join(', ')}`);

// Invert the matrix (this is what FBXLoader does)
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
        console.log('WARNING: Matrix is singular!');
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

// FBXLoader does: inverseBindMatrix = invertMatrix4(TransformLink)
// But does FBXLoader expect TransformLink in row-major or column-major?

// Let's check what FBXLoader does with the raw TransformLink data
// Looking at FBXLoader.ts line 1045-1070, it reads TransformLink:
// cluster.transformLink = new Float32Array(transformLinkData.data);
// So it stores the raw FBX row-major data directly

// Then at line 1707-1709:
// const inverseBindMatrix = cluster.transformLink
//     ? this.invertMatrix4(cluster.transformLink)
//     : this.createIdentityMatrix();

// The question is: does invertMatrix4 expect row-major or column-major input?
// Looking at the invertMatrix4 function, it uses standard column-major notation
// So if it receives row-major data, the result will be wrong!

console.log('\n=== PROBLEM ANALYSIS ===');
console.log('FBXLoader stores TransformLink as raw FBX data (row-major)');
console.log('But invertMatrix4() expects column-major input (WebGL convention)');
console.log('This mismatch could cause incorrect inverse bind matrices!\n');

// Test: invert the raw row-major data (what FBXLoader currently does)
const ibmWrong = invertMatrix4(new Float32Array(tlRaw));
console.log('=== IBM from Row-Major Input (CURRENT - possibly wrong) ===');
console.log(`Col 0: ${Array.from(ibmWrong.slice(0, 4)).map(v => v.toFixed(6)).join(', ')}`);
console.log(`Col 1: ${Array.from(ibmWrong.slice(4, 8)).map(v => v.toFixed(6)).join(', ')}`);
console.log(`Col 2: ${Array.from(ibmWrong.slice(8, 12)).map(v => v.toFixed(6)).join(', ')}`);
console.log(`Col 3: ${Array.from(ibmWrong.slice(12, 16)).map(v => v.toFixed(6)).join(', ')}`);

// Test: invert the transposed (column-major) data (correct approach)
const ibmCorrect = invertMatrix4(tlColMajor);
console.log('\n=== IBM from Column-Major Input (CORRECT) ===');
console.log(`Col 0: ${Array.from(ibmCorrect.slice(0, 4)).map(v => v.toFixed(6)).join(', ')}`);
console.log(`Col 1: ${Array.from(ibmCorrect.slice(4, 8)).map(v => v.toFixed(6)).join(', ')}`);
console.log(`Col 2: ${Array.from(ibmCorrect.slice(8, 12)).map(v => v.toFixed(6)).join(', ')}`);
console.log(`Col 3: ${Array.from(ibmCorrect.slice(12, 16)).map(v => v.toFixed(6)).join(', ')}`);

// Verify by checking M * M^-1 = I
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

console.log('\n=== VERIFICATION: TransformLink * IBM should = Identity ===');
const verify1 = multiplyMatrices(tlColMajor, ibmCorrect);
console.log('Using column-major TransformLink * correct IBM:');
console.log(`Diagonal: ${verify1[0].toFixed(4)}, ${verify1[5].toFixed(4)}, ${verify1[10].toFixed(4)}, ${verify1[15].toFixed(4)}`);

const verify2 = multiplyMatrices(new Float32Array(tlRaw), ibmWrong);
console.log('Using row-major TransformLink * wrong IBM:');
console.log(`Diagonal: ${verify2[0].toFixed(4)}, ${verify2[5].toFixed(4)}, ${verify2[10].toFixed(4)}, ${verify2[15].toFixed(4)}`);

console.log('\nDone!');
