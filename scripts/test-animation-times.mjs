/**
 * Test Animation at Different Times
 * 测试不同时间点的动画
 *
 * Verify animation is producing different bone matrices at different times
 */

import { readFileSync } from 'fs';

const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';
console.log(`Testing animation at different times: ${filePath}\n`);

// Matrix math utilities
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
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

function slerpQuaternion(q1, q2, t) {
    let dot = q1[0] * q2[0] + q1[1] * q2[1] + q1[2] * q2[2] + q1[3] * q2[3];
    if (dot < 0) {
        q2 = [-q2[0], -q2[1], -q2[2], -q2[3]];
        dot = -dot;
    }
    if (dot > 0.9995) {
        const result = [
            q1[0] + t * (q2[0] - q1[0]),
            q1[1] + t * (q2[1] - q1[1]),
            q1[2] + t * (q2[2] - q1[2]),
            q1[3] + t * (q2[3] - q1[3])
        ];
        const len = Math.sqrt(result[0] * result[0] + result[1] * result[1] + result[2] * result[2] + result[3] * result[3]);
        return [result[0] / len, result[1] / len, result[2] / len, result[3] / len];
    }
    const theta0 = Math.acos(dot);
    const theta = theta0 * t;
    const sinTheta = Math.sin(theta);
    const sinTheta0 = Math.sin(theta0);
    const s0 = Math.cos(theta) - dot * sinTheta / sinTheta0;
    const s1 = sinTheta / sinTheta0;
    return [
        s0 * q1[0] + s1 * q2[0],
        s0 * q1[1] + s1 * q2[1],
        s0 * q1[2] + s1 * q2[2],
        s0 * q1[3] + s1 * q2[3]
    ];
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
        const q0 = [output[i0 * 4], output[i0 * 4 + 1], output[i0 * 4 + 2], output[i0 * 4 + 3]];
        const q1 = [output[i1 * 4], output[i1 * 4 + 1], output[i1 * 4 + 2], output[i1 * 4 + 3]];
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

function sampleAnimation(clip, time, nodes) {
    const nodeTransforms = new Map();
    for (const channel of clip.channels) {
        const sampler = clip.samplers[channel.samplerIndex];
        if (!sampler) continue;

        const nodeIndex = channel.target.nodeIndex;
        const path = channel.target.path;
        const value = sampleSampler(sampler, time, path);
        if (!value) continue;

        if (!nodeTransforms.has(nodeIndex)) {
            nodeTransforms.set(nodeIndex, {});
        }
        const t = nodeTransforms.get(nodeIndex);
        if (path === 'translation') t.position = value;
        else if (path === 'rotation') t.rotation = value;
        else if (path === 'scale') t.scale = value;
    }
    return nodeTransforms;
}

function calculateBoneMatrices(skeleton, nodes, animTransforms) {
    const { joints } = skeleton;
    const boneCount = joints.length;
    const localMatrices = new Array(boneCount);
    const worldMatrices = new Array(boneCount);
    const skinMatrices = new Array(boneCount);

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

    for (let i = 0; i < boneCount; i++) addJoint(i);

    for (const jointIndex of processingOrder) {
        const joint = joints[jointIndex];
        const node = nodes[joint.nodeIndex];

        if (!node) {
            localMatrices[jointIndex] = identity();
            worldMatrices[jointIndex] = identity();
            skinMatrices[jointIndex] = identity();
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

function matrixDifference(a, b) {
    let maxDiff = 0;
    for (let i = 0; i < 16; i++) {
        maxDiff = Math.max(maxDiff, Math.abs(a[i] - b[i]));
    }
    return maxDiff;
}

async function main() {
    const { FBXLoader } = await import('../packages/asset-system/dist/index.js');

    const binaryData = readFileSync(filePath);
    const loader = new FBXLoader();

    const context = {
        metadata: {
            path: filePath,
            name: filePath.split(/[\\/]/).pop(),
            type: 'model/fbx',
            guid: '',
            size: binaryData.length,
            hash: '',
            dependencies: [],
            lastModified: Date.now(),
            importerVersion: '1.0.0',
            labels: [],
            tags: [],
            version: 1
        },
        loadDependency: async () => null
    };

    const content = {
        type: 'binary',
        binary: binaryData.buffer
    };

    const asset = await loader.parse(content, context);

    if (!asset.skeleton || !asset.animations?.length) {
        console.log('No skeleton or animation data!');
        return;
    }

    const clip = asset.animations[0];
    const nodes = asset.nodes;
    const skeleton = asset.skeleton;

    console.log(`Animation: "${clip.name}", duration: ${clip.duration}s`);
    console.log(`Joints: ${skeleton.joints.length}`);

    // Test at different times
    const times = [0, clip.duration * 0.25, clip.duration * 0.5, clip.duration * 0.75, clip.duration];

    let prevMatrices = null;
    for (const time of times) {
        const animTransforms = sampleAnimation(clip, time, nodes);
        const skinMatrices = calculateBoneMatrices(skeleton, nodes, animTransforms);

        if (prevMatrices) {
            // Count how many bones changed
            let changedCount = 0;
            let maxChange = 0;
            for (let i = 0; i < skinMatrices.length; i++) {
                const diff = matrixDifference(skinMatrices[i], prevMatrices[i]);
                if (diff > 0.001) {
                    changedCount++;
                    maxChange = Math.max(maxChange, diff);
                }
            }
            console.log(`t=${time.toFixed(2)}s: ${changedCount}/${skinMatrices.length} bones changed, maxChange=${maxChange.toFixed(4)}`);
        } else {
            // Check identity at t=0
            let identityCount = 0;
            const id = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            for (const m of skinMatrices) {
                let isId = true;
                for (let i = 0; i < 16; i++) {
                    if (Math.abs(m[i] - id[i]) > 0.01) {
                        isId = false;
                        break;
                    }
                }
                if (isId) identityCount++;
            }
            console.log(`t=${time.toFixed(2)}s (bind pose): ${identityCount}/${skinMatrices.length} identity matrices`);
        }

        prevMatrices = skinMatrices.map(m => new Float32Array(m));
    }

    // Show specific bone at different times
    const testJointIndex = 5; // Pick a bone that should animate
    const joint = skeleton.joints[testJointIndex];
    console.log(`\n=== Joint[${testJointIndex}] "${joint.name}" at different times ===`);

    for (const time of times) {
        const animTransforms = sampleAnimation(clip, time, nodes);
        const nodeTransform = animTransforms.get(joint.nodeIndex);

        if (nodeTransform?.rotation) {
            const rot = nodeTransform.rotation;
            console.log(`t=${time.toFixed(2)}s: rotation=[${rot.map(v => v.toFixed(4)).join(', ')}]`);
        } else {
            console.log(`t=${time.toFixed(2)}s: using node.transform (no animation data)`);
        }
    }

    console.log('\nDone!');
}

main().catch(console.error);
