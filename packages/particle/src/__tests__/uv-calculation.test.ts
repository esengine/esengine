/**
 * UV 计算测试
 * UV Calculation Test
 *
 * 用于验证 TextureSheetAnimation 的 UV 坐标计算是否正确
 * Used to verify TextureSheetAnimation UV coordinate calculation
 */

/**
 * 模拟 ParticleRenderDataProvider 中的 UV 计算
 * Simulate UV calculation from ParticleRenderDataProvider
 */
function calculateUV(frame: number, tilesX: number, tilesY: number) {
    const col = frame % tilesX;
    const row = Math.floor(frame / tilesX);
    const uWidth = 1 / tilesX;
    const vHeight = 1 / tilesY;

    const u0 = col * uWidth;
    const u1 = (col + 1) * uWidth;
    const v0 = row * vHeight;
    const v1 = (row + 1) * vHeight;

    return { u0, v0, u1, v1, col, row };
}

/**
 * 测试 4x4 spritesheet (16帧)
 *
 * 预期布局（标准 spritesheet，从左上角开始）：
 * ┌────┬────┬────┬────┐
 * │ 0  │ 1  │ 2  │ 3  │  row=0, v: 0.00 - 0.25
 * ├────┼────┼────┼────┤
 * │ 4  │ 5  │ 6  │ 7  │  row=1, v: 0.25 - 0.50
 * ├────┼────┼────┼────┤
 * │ 8  │ 9  │ 10 │ 11 │  row=2, v: 0.50 - 0.75
 * ├────┼────┼────┼────┤
 * │ 12 │ 13 │ 14 │ 15 │  row=3, v: 0.75 - 1.00
 * └────┴────┴────┴────┘
 */
function test4x4Spritesheet() {
    console.log('=== 4x4 Spritesheet UV Test ===\n');

    const tilesX = 4;
    const tilesY = 4;

    console.log('Expected layout (standard spritesheet, top-left origin):');
    console.log('Frame 0 should be at TOP-LEFT (v: 0.00-0.25)');
    console.log('Frame 12 should be at BOTTOM-LEFT (v: 0.75-1.00)\n');

    // 测试关键帧
    const testFrames = [0, 1, 4, 5, 12, 15];

    for (const frame of testFrames) {
        const uv = calculateUV(frame, tilesX, tilesY);
        console.log(`Frame ${frame.toString().padStart(2)}: col=${uv.col}, row=${uv.row}`);
        console.log(`         UV: [${uv.u0.toFixed(2)}, ${uv.v0.toFixed(2)}, ${uv.u1.toFixed(2)}, ${uv.v1.toFixed(2)}]`);
        console.log('');
    }
}

/**
 * 测试 2x2 spritesheet (4帧) - 最简单的情况
 */
function test2x2Spritesheet() {
    console.log('=== 2x2 Spritesheet UV Test ===\n');

    const tilesX = 2;
    const tilesY = 2;

    console.log('Layout:');
    console.log('┌─────┬─────┐');
    console.log('│  0  │  1  │  v: 0.0 - 0.5');
    console.log('├─────┼─────┤');
    console.log('│  2  │  3  │  v: 0.5 - 1.0');
    console.log('└─────┴─────┘\n');

    for (let frame = 0; frame < 4; frame++) {
        const uv = calculateUV(frame, tilesX, tilesY);
        console.log(`Frame ${frame}: col=${uv.col}, row=${uv.row}`);
        console.log(`       UV: [${uv.u0.toFixed(2)}, ${uv.v0.toFixed(2)}, ${uv.u1.toFixed(2)}, ${uv.v1.toFixed(2)}]`);
    }
    console.log('');
}

/**
 * WebGL 纹理坐标系说明
 */
function explainWebGLTextureCoords() {
    console.log('=== WebGL Texture Coordinate System ===\n');

    console.log('Without UNPACK_FLIP_Y_WEBGL:');
    console.log('- Image row 0 (top of image file) -> stored at texture row 0');
    console.log('- Texture coordinate V=0 samples texture row 0');
    console.log('- Therefore: V=0 = image top, V=1 = image bottom');
    console.log('');

    console.log('sprite_batch.rs vertex mapping:');
    console.log('- Vertex 0 (top-left on screen, high Y) uses tex_coords[0] = [u0, v0]');
    console.log('- Vertex 2 (bottom-right on screen, low Y) uses tex_coords[2] = [u1, v1]');
    console.log('');

    console.log('Expected behavior:');
    console.log('- Frame 0 UV [0, 0, 0.25, 0.25] should show TOP-LEFT quarter of spritesheet');
    console.log('- If frame 0 shows BOTTOM-LEFT, the image is being rendered upside down');
    console.log('');
}

/**
 * 诊断当前问题
 */
function diagnoseIssue() {
    console.log('=== Diagnosis ===\n');

    console.log('If TextureSheetAnimation shows wrong frames, check:');
    console.log('');
    console.log('1. Is frame 0 showing the TOP-LEFT of the spritesheet?');
    console.log('   - YES: UV calculation is correct');
    console.log('   - NO (shows bottom-left): Image is flipped vertically in WebGL');
    console.log('');
    console.log('2. Are frames playing in wrong ORDER (e.g., 3,2,1,0 instead of 0,1,2,3)?');
    console.log('   - Check animation frame index calculation');
    console.log('');
    console.log('3. Is the spritesheet itself laid out correctly?');
    console.log('   - Frame 0 should be at TOP-LEFT of the image file');
    console.log('');
}

// 运行所有测试
export function runUVTests() {
    explainWebGLTextureCoords();
    test2x2Spritesheet();
    test4x4Spritesheet();
    diagnoseIssue();
}

// 如果直接运行此文件
if (typeof window !== 'undefined') {
    runUVTests();
}

export { calculateUV, test2x2Spritesheet, test4x4Spritesheet };
