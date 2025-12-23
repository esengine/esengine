/**
 * Trace FBXLoader Output
 * 追踪 FBXLoader 输出
 *
 * Load the FBX with actual FBXLoader and compare with expected values
 */

import { readFileSync } from 'fs';
import { FBXLoader } from '../packages/asset-system/dist/index.js';

const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';

// Suppress console.log temporarily to hide FBXLoader debug output
const originalLog = console.log;
let suppressLogs = true;
console.log = (...args) => {
    if (!suppressLogs) originalLog(...args);
};

originalLog(`=== Trace FBXLoader Output: ${filePath} ===\n`);

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

try {
    const asset = await loader.parse(content, context);

    console.log(`Meshes: ${asset.meshes?.length || 0}`);
    console.log(`Nodes: ${asset.nodes?.length || 0}`);
    console.log(`Animations: ${asset.animations?.length || 0}`);

    if (asset.skeleton) {
        console.log(`Skeleton joints: ${asset.skeleton.joints.length}`);
        console.log(`Root joint index: ${asset.skeleton.rootJointIndex}`);

        // Check first few joints
        console.log(`\nFirst 3 skeleton joints:`);
        for (let i = 0; i < 3 && i < asset.skeleton.joints.length; i++) {
            const joint = asset.skeleton.joints[i];
            console.log(`  Joint[${i}] "${joint.name}":`);
            console.log(`    nodeIndex: ${joint.nodeIndex}`);
            console.log(`    parentIndex: ${joint.parentIndex}`);

            // Check inverseBindMatrix
            const ibm = joint.inverseBindMatrix;
            if (ibm) {
                console.log(`    inverseBindMatrix diagonal: [${ibm[0].toFixed(4)}, ${ibm[5].toFixed(4)}, ${ibm[10].toFixed(4)}, ${ibm[15].toFixed(4)}]`);
                console.log(`    inverseBindMatrix last row: [${ibm[12].toFixed(4)}, ${ibm[13].toFixed(4)}, ${ibm[14].toFixed(4)}, ${ibm[15].toFixed(4)}]`);
            }
        }

        // Check corresponding nodes
        console.log(`\nCorresponding nodes:`);
        for (let i = 0; i < 3 && i < asset.skeleton.joints.length; i++) {
            const joint = asset.skeleton.joints[i];
            const node = asset.nodes?.[joint.nodeIndex];
            if (node) {
                console.log(`  Node[${joint.nodeIndex}] "${node.name}":`);
                console.log(`    position: [${node.transform.position.map(v => v.toFixed(4)).join(', ')}]`);
                console.log(`    rotation: [${node.transform.rotation.map(v => v.toFixed(4)).join(', ')}]`);
                console.log(`    scale: [${node.transform.scale.map(v => v.toFixed(4)).join(', ')}]`);
            }
        }
    } else {
        console.log(`No skeleton data!`);
    }

    // Check animation channels
    if (asset.animations && asset.animations.length > 0) {
        const clip = asset.animations[0];
        console.log(`\nAnimation "${clip.name}":`);
        console.log(`  Duration: ${clip.duration}s`);
        console.log(`  Channels: ${clip.channels.length}`);
        console.log(`  Samplers: ${clip.samplers.length}`);

        // Find channels targeting first few skeleton joints
        if (asset.skeleton) {
            console.log(`\nChannels for first 3 joints:`);
            for (let i = 0; i < 3 && i < asset.skeleton.joints.length; i++) {
                const joint = asset.skeleton.joints[i];
                const channels = clip.channels.filter(c => c.target.nodeIndex === joint.nodeIndex);
                console.log(`  Joint[${i}] nodeIndex=${joint.nodeIndex}: ${channels.length} channels`);
                channels.forEach(c => {
                    const sampler = clip.samplers[c.samplerIndex];
                    console.log(`    - ${c.target.path}: ${sampler.input.length} keyframes, first value at t=0:`);
                    if (c.target.path === 'rotation') {
                        const q = [sampler.output[0], sampler.output[1], sampler.output[2], sampler.output[3]];
                        console.log(`      quaternion: [${q.map(v => v.toFixed(4)).join(', ')}]`);
                    } else {
                        const v = [sampler.output[0], sampler.output[1], sampler.output[2]];
                        console.log(`      vec3: [${v.map(v => v.toFixed(4)).join(', ')}]`);
                    }
                });
            }
        }
    }

    // Now test bone matrix calculation
    if (asset.skeleton && asset.animations && asset.animations.length > 0) {
        console.log(`\n=== TESTING BONE MATRIX CALCULATION ===`);

        const skeleton = asset.skeleton;
        const nodes = asset.nodes;
        const clip = asset.animations[0];

        // Sample animation at t=0
        function sampleAnimation(clip, time) {
            const nodeTransforms = new Map();

            for (const channel of clip.channels) {
                const sampler = clip.samplers[channel.samplerIndex];
                if (!sampler) continue;

                const nodeIndex = channel.target.nodeIndex;
                const path = channel.target.path;

                // Get first keyframe value (t=0)
                let value;
                if (path === 'rotation') {
                    value = [sampler.output[0], sampler.output[1], sampler.output[2], sampler.output[3]];
                } else {
                    value = [sampler.output[0], sampler.output[1], sampler.output[2]];
                }

                let transform = nodeTransforms.get(nodeIndex);
                if (!transform) {
                    transform = {};
                    nodeTransforms.set(nodeIndex, transform);
                }

                if (path === 'translation') transform.position = value;
                else if (path === 'rotation') transform.rotation = value;
                else if (path === 'scale') transform.scale = value;
            }

            return nodeTransforms;
        }

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

        const animTransforms = sampleAnimation(clip, 0);
        console.log(`Sampled ${animTransforms.size} node transforms at t=0`);

        // Calculate bone matrices
        const { joints } = skeleton;
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

            // Get animated or default transform
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

        // Count identity matrices
        let identityCount = 0;
        let maxDiff = 0;
        const id = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

        for (let i = 0; i < boneCount; i++) {
            const sm = skinMatrices[i];
            let diff = 0;
            for (let j = 0; j < 16; j++) {
                diff = Math.max(diff, Math.abs(sm[j] - id[j]));
            }
            if (diff < 0.001) identityCount++;
            if (diff > maxDiff) maxDiff = diff;
        }

        console.log(`\nAt t=0 with animation data:`);
        console.log(`  Identity matrices: ${identityCount}/${boneCount}`);
        console.log(`  Max diff from identity: ${maxDiff.toFixed(4)}`);

        if (identityCount !== boneCount) {
            console.log(`\n⚠️ NOT all skin matrices are identity at bind pose!`);

            // Show first problematic joint
            for (let i = 0; i < boneCount; i++) {
                const sm = skinMatrices[i];
                let diff = 0;
                for (let j = 0; j < 16; j++) {
                    diff = Math.max(diff, Math.abs(sm[j] - id[j]));
                }
                if (diff >= 0.001) {
                    const joint = joints[i];
                    const node = nodes[joint.nodeIndex];
                    const animT = animTransforms.get(joint.nodeIndex);
                    console.log(`\n  First non-identity: Joint[${i}] "${joint.name}"`);
                    console.log(`    nodeIndex: ${joint.nodeIndex}`);
                    console.log(`    parentIndex: ${joint.parentIndex}`);
                    console.log(`    animTransform exists: ${!!animT}`);
                    if (animT) {
                        console.log(`    animTransform.rotation: [${animT.rotation?.map(v => v.toFixed(4)).join(', ') || 'null'}]`);
                    }
                    console.log(`    node.transform.rotation: [${node.transform.rotation.map(v => v.toFixed(4)).join(', ')}]`);
                    break;
                }
            }
        } else {
            console.log(`\n✅ All skin matrices are identity at bind pose!`);
        }
    }

} catch (error) {
    console.error('Error:', error);
}

console.log('\nDone!');
