/**
 * Test FBXLoader Bind Pose
 * 测试 FBXLoader 绑定姿势
 *
 * Verify: worldMatrix * inverseBindMatrix = Identity at bind pose
 */

import { readFileSync } from 'fs';

const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';
console.log(`Testing bind pose: ${filePath}\n`);

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

function isIdentity(m, tolerance = 0.01) {
    const id = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    for (let i = 0; i < 16; i++) {
        if (Math.abs(m[i] - id[i]) > tolerance) return false;
    }
    return true;
}

function maxDiffFromIdentity(m) {
    const id = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    let maxDiff = 0;
    for (let i = 0; i < 16; i++) {
        maxDiff = Math.max(maxDiff, Math.abs(m[i] - id[i]));
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

    if (!asset.skeleton) {
        console.log('No skeleton data!');
        return;
    }

    const { joints, rootJointIndex } = asset.skeleton;
    const nodes = asset.nodes;

    console.log(`Skeleton: ${joints.length} joints, rootJointIndex=${rootJointIndex}`);

    // Build parent index map (node hierarchy)
    const nodeParentMap = new Map();
    for (const node of nodes) {
        if (node.children) {
            for (const childIdx of node.children) {
                nodeParentMap.set(childIdx, nodes.indexOf(node));
            }
        }
    }

    // Calculate world matrices for each joint using node.transform hierarchy
    const worldMatrices = new Array(joints.length);

    // Processing order: root first, then children
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

    for (let i = 0; i < joints.length; i++) addJoint(i);

    for (const jointIndex of processingOrder) {
        const joint = joints[jointIndex];
        const node = nodes[joint.nodeIndex];

        if (!node) {
            worldMatrices[jointIndex] = identity();
            continue;
        }

        const { position, rotation, scale } = node.transform;
        const localMatrix = createTransformMatrix(position, rotation, scale);

        if (joint.parentIndex >= 0) {
            worldMatrices[jointIndex] = multiplyMatrices(
                worldMatrices[joint.parentIndex],
                localMatrix
            );
        } else {
            worldMatrices[jointIndex] = localMatrix;
        }
    }

    // Calculate skin matrices and check if they are identity
    let identityCount = 0;
    let nonIdentityJoints = [];

    for (let i = 0; i < joints.length; i++) {
        const joint = joints[i];
        const skinMatrix = multiplyMatrices(worldMatrices[i], joint.inverseBindMatrix);

        if (isIdentity(skinMatrix)) {
            identityCount++;
        } else {
            const diff = maxDiffFromIdentity(skinMatrix);
            nonIdentityJoints.push({ index: i, name: joint.name, diff, skinMatrix });
        }
    }

    console.log(`\n=== BIND POSE VERIFICATION ===`);
    console.log(`Identity skin matrices: ${identityCount}/${joints.length}`);

    if (nonIdentityJoints.length > 0) {
        console.log(`\n❌ NOT at bind pose! ${nonIdentityJoints.length} joints have non-identity skin matrices.`);

        // Show first 3 problematic joints
        nonIdentityJoints.sort((a, b) => b.diff - a.diff);
        console.log(`\nTop 3 worst joints:`);
        for (let i = 0; i < 3 && i < nonIdentityJoints.length; i++) {
            const { index, name, diff, skinMatrix } = nonIdentityJoints[i];
            console.log(`  Joint[${index}] "${name}": maxDiff=${diff.toFixed(4)}`);
            console.log(`    skinMatrix diagonal: [${skinMatrix[0].toFixed(2)}, ${skinMatrix[5].toFixed(2)}, ${skinMatrix[10].toFixed(2)}, ${skinMatrix[15].toFixed(2)}]`);
            console.log(`    skinMatrix translation: [${skinMatrix[12].toFixed(2)}, ${skinMatrix[13].toFixed(2)}, ${skinMatrix[14].toFixed(2)}]`);
        }

        console.log(`\n=== ANALYSIS ===`);
        console.log(`The skin matrix should be Identity at bind pose (t=0).`);
        console.log(`This means: worldMatrix * inverseBindMatrix = Identity`);
        console.log(`If not identity, the mesh will appear deformed at rest.`);
    } else {
        console.log(`\n✅ All skin matrices are identity at bind pose!`);
    }

    console.log('\nDone!');
}

main().catch(console.error);
