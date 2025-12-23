/**
 * Simple FBX Test
 * 简单 FBX 测试
 */

import { readFileSync } from 'fs';

const filePath = process.argv[2] || 'F:\\MyProject4\\assets\\octopus.fbx';
console.log(`Testing: ${filePath}`);

async function main() {
    // Dynamic import to handle the module
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

    try {
        const asset = await loader.parse(content, context);

        console.log(`\nMeshes: ${asset.meshes?.length || 0}`);
        console.log(`Nodes: ${asset.nodes?.length || 0}`);
        console.log(`Skeleton joints: ${asset.skeleton?.joints?.length || 0}`);

        if (asset.skeleton && asset.skeleton.joints.length > 0) {
            console.log(`\nFirst 3 joints:`);
            for (let i = 0; i < 3 && i < asset.skeleton.joints.length; i++) {
                const joint = asset.skeleton.joints[i];
                const node = asset.nodes?.[joint.nodeIndex];
                console.log(`  [${i}] "${joint.name}" nodeIndex=${joint.nodeIndex}`);
                if (node) {
                    console.log(`       position: [${node.transform.position.map(v => v.toFixed(2)).join(', ')}]`);
                    console.log(`       rotation: [${node.transform.rotation.map(v => v.toFixed(4)).join(', ')}]`);
                }
            }
        }

        console.log('\nDone!');
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }
}

main();
