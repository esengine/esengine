/**
 * Test Animation at t=0
 * 测试 t=0 时的动画值
 *
 * Compare animation values at t=0 with node.transform
 */

import { readFileSync } from 'fs';

const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';
console.log(`Testing animation at t=0: ${filePath}\n`);

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

    if (!asset.animations || asset.animations.length === 0) {
        console.log('No animation data!');
        return;
    }

    const clip = asset.animations[0];
    const nodes = asset.nodes;
    const skeleton = asset.skeleton;

    console.log(`Animation: "${clip.name}", duration: ${clip.duration}s`);
    console.log(`Channels: ${clip.channels.length}, Samplers: ${clip.samplers.length}`);

    // Sample animation at t=0
    function sampleAtT0(sampler, componentCount) {
        if (!sampler.output || sampler.output.length === 0) return null;
        const result = [];
        for (let i = 0; i < componentCount; i++) {
            result.push(sampler.output[i]);
        }
        return result;
    }

    // Get animated transforms at t=0
    const animTransforms = new Map();
    for (const channel of clip.channels) {
        const sampler = clip.samplers[channel.samplerIndex];
        if (!sampler) continue;

        const nodeIndex = channel.target.nodeIndex;
        const path = channel.target.path;

        let value;
        if (path === 'rotation') {
            value = sampleAtT0(sampler, 4);
        } else {
            value = sampleAtT0(sampler, 3);
        }
        if (!value) continue;

        if (!animTransforms.has(nodeIndex)) {
            animTransforms.set(nodeIndex, {});
        }
        const t = animTransforms.get(nodeIndex);
        if (path === 'translation') t.position = value;
        else if (path === 'rotation') t.rotation = value;
        else if (path === 'scale') t.scale = value;
    }

    console.log(`\nAnimated node count at t=0: ${animTransforms.size}`);

    // Compare with node.transform for first few skeleton joints
    if (skeleton) {
        console.log(`\n=== COMPARING ANIMATION vs NODE.TRANSFORM ===\n`);

        let matchCount = 0;
        let mismatchCount = 0;
        const mismatches = [];

        for (let i = 0; i < skeleton.joints.length; i++) {
            const joint = skeleton.joints[i];
            const node = nodes[joint.nodeIndex];
            const animT = animTransforms.get(joint.nodeIndex);

            if (!node || !animT) continue;

            // Compare rotation (most important)
            const nodeRot = node.transform.rotation;
            const animRot = animT.rotation;

            if (animRot) {
                const rotMatch = nodeRot.every((v, idx) => Math.abs(v - animRot[idx]) < 0.001);
                if (rotMatch) {
                    matchCount++;
                } else {
                    mismatchCount++;
                    mismatches.push({ jointIndex: i, name: joint.name, nodeRot, animRot });
                }
            }
        }

        console.log(`Rotation matches: ${matchCount}/${matchCount + mismatchCount}`);

        if (mismatches.length > 0) {
            console.log(`\n❌ MISMATCHES found!`);
            console.log(`First 5 mismatches:`);
            for (let i = 0; i < 5 && i < mismatches.length; i++) {
                const m = mismatches[i];
                console.log(`\n  Joint[${m.jointIndex}] "${m.name}":`);
                console.log(`    node.rotation: [${m.nodeRot.map(v => v.toFixed(4)).join(', ')}]`);
                console.log(`    anim.rotation: [${m.animRot.map(v => v.toFixed(4)).join(', ')}]`);
            }
        } else {
            console.log(`\n✅ All rotations match at t=0!`);
        }
    }

    console.log('\nDone!');
}

main().catch(console.error);
