/**
 * 3D Model Preview Component
 * 3D 模型预览组件
 *
 * A lightweight WebGL-based 3D model renderer for animation preview.
 * 基于 WebGL 的轻量级 3D 模型渲染器，用于动画预览。
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type {
    IGLTFAsset,
    IGLTFAnimationClip,
    IMeshData,
    IAnimationSampler,
    IAnimationChannel,
    IGLTFNode,
    ISkeletonData
} from '@esengine/asset-system';

interface ModelPreview3DProps {
    /** GLTF/FBX asset data | GLTF/FBX 资产数据 */
    asset: IGLTFAsset;
    /** Current animation clip | 当前动画片段 */
    animationClip?: IGLTFAnimationClip | null;
    /** Current playback time in seconds | 当前播放时间（秒） */
    currentTime: number;
    /** Preview size | 预览尺寸 */
    width?: number;
    height?: number;
}

/** Maximum bones supported | 支持的最大骨骼数 */
const MAX_BONES = 128;

/** Shader sources | 着色器源码 */
const VERTEX_SHADER = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTexCoord;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;

    varying vec3 vNormal;
    varying vec2 vTexCoord;
    varying vec3 vPosition;

    void main() {
        vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
        vPosition = worldPosition.xyz;
        vNormal = uNormalMatrix * aNormal;
        vTexCoord = aTexCoord;
        gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
    }
`;

/** Skinned mesh vertex shader with bone transforms | 带骨骼变换的蒙皮网格顶点着色器 */
const SKINNED_VERTEX_SHADER = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTexCoord;
    attribute vec4 aJoints;   // Bone indices (4 influences per vertex)
    attribute vec4 aWeights;  // Bone weights (must sum to 1.0)

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat3 uNormalMatrix;
    uniform mat4 uBoneMatrices[${MAX_BONES}];
    uniform bool uUseSkinning;

    varying vec3 vNormal;
    varying vec2 vTexCoord;
    varying vec3 vPosition;

    void main() {
        vec4 skinnedPosition;
        vec3 skinnedNormal;

        if (uUseSkinning && aWeights.x > 0.0) {
            // Calculate skinned position and normal
            mat4 skinMatrix =
                uBoneMatrices[int(aJoints.x)] * aWeights.x +
                uBoneMatrices[int(aJoints.y)] * aWeights.y +
                uBoneMatrices[int(aJoints.z)] * aWeights.z +
                uBoneMatrices[int(aJoints.w)] * aWeights.w;

            skinnedPosition = skinMatrix * vec4(aPosition, 1.0);
            skinnedNormal = mat3(skinMatrix) * aNormal;
        } else {
            skinnedPosition = vec4(aPosition, 1.0);
            skinnedNormal = aNormal;
        }

        vec4 worldPosition = uModelMatrix * skinnedPosition;
        vPosition = worldPosition.xyz;
        vNormal = uNormalMatrix * skinnedNormal;
        vTexCoord = aTexCoord;
        gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
    }
`;

const FRAGMENT_SHADER = `
    precision mediump float;

    varying vec3 vNormal;
    varying vec2 vTexCoord;
    varying vec3 vPosition;

    uniform vec3 uLightDirection;
    uniform vec3 uLightColor;
    uniform vec3 uAmbientColor;
    uniform vec4 uBaseColor;
    uniform bool uHasTexture;
    uniform sampler2D uTexture;

    void main() {
        vec3 normal = normalize(vNormal);
        float diffuse = max(dot(normal, -uLightDirection), 0.0);

        vec4 baseColor = uBaseColor;
        if (uHasTexture) {
            baseColor = texture2D(uTexture, vTexCoord);
        }

        vec3 lighting = uAmbientColor + uLightColor * diffuse;
        gl_FragColor = vec4(baseColor.rgb * lighting, baseColor.a);
    }
`;

/** Simple grid shader (no derivatives) | 简单网格着色器（无导数函数） */
const GRID_VERTEX_SHADER = `
    attribute vec3 aPosition;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
        gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
    }
`;

const GRID_FRAGMENT_SHADER = `
    precision mediump float;
    uniform vec4 uColor;

    void main() {
        gl_FragColor = uColor;
    }
`;

/**
 * Compile shader | 编译着色器
 */
function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('[ModelPreview3D] Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/**
 * Create shader program | 创建着色器程序
 */
function createProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string): WebGLProgram | null {
    const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
    const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);

    if (!vertShader || !fragShader) return null;

    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('[ModelPreview3D] Program link error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);

    return program;
}

/**
 * Create perspective projection matrix | 创建透视投影矩阵
 */
function perspective(fov: number, aspect: number, near: number, far: number): Float32Array {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);

    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, 2 * far * near * nf, 0
    ]);
}

/**
 * Create look-at view matrix | 创建观察矩阵
 */
function lookAt(eye: number[], center: number[], up: number[]): Float32Array {
    const zAxis = normalizeVec([eye[0] - center[0], eye[1] - center[1], eye[2] - center[2]]);
    const xAxis = normalizeVec(cross(up, zAxis));
    const yAxis = cross(zAxis, xAxis);

    return new Float32Array([
        xAxis[0], yAxis[0], zAxis[0], 0,
        xAxis[1], yAxis[1], zAxis[1], 0,
        xAxis[2], yAxis[2], zAxis[2], 0,
        -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1
    ]);
}

function normalizeVec(v: number[]): number[] {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
}

function cross(a: number[], b: number[]): number[] {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

function dot(a: number[], b: number[]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Create identity matrix | 创建单位矩阵
 */
function identity(): Float32Array {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

/**
 * Spherical Linear Interpolation for quaternions
 * 四元数球面线性插值
 *
 * Properly handles the "shortest path" by checking dot product sign.
 * 通过检查点积符号正确处理"最短路径"。
 */
function slerpQuaternion(q0: number[], q1: number[], t: number): number[] {
    let [x0, y0, z0, w0] = q0;
    let [x1, y1, z1, w1] = q1;

    // Compute dot product | 计算点积
    let cosHalfTheta = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1;

    // If dot is negative, negate one quaternion to take shorter path
    // 如果点积为负，取反一个四元数以走较短路径
    if (cosHalfTheta < 0) {
        x1 = -x1;
        y1 = -y1;
        z1 = -z1;
        w1 = -w1;
        cosHalfTheta = -cosHalfTheta;
    }

    // If quaternions are very close, use linear interpolation
    // 如果四元数非常接近，使用线性插值
    const DOT_THRESHOLD = 0.9995;
    if (cosHalfTheta > DOT_THRESHOLD) {
        const result = [
            x0 + t * (x1 - x0),
            y0 + t * (y1 - y0),
            z0 + t * (z1 - z0),
            w0 + t * (w1 - w0)
        ];
        // Normalize | 归一化
        const len = Math.sqrt(result[0] ** 2 + result[1] ** 2 + result[2] ** 2 + result[3] ** 2);
        return [result[0] / len, result[1] / len, result[2] / len, result[3] / len];
    }

    // SLERP formula | SLERP 公式
    const theta0 = Math.acos(cosHalfTheta);
    const theta = theta0 * t;
    const sinTheta = Math.sin(theta);
    const sinTheta0 = Math.sin(theta0);

    const s0 = Math.cos(theta) - cosHalfTheta * sinTheta / sinTheta0;
    const s1 = sinTheta / sinTheta0;

    return [
        s0 * x0 + s1 * x1,
        s0 * y0 + s1 * y1,
        s0 * z0 + s1 * z1,
        s0 * w0 + s1 * w1
    ];
}

/**
 * Extract normal matrix from model matrix | 从模型矩阵提取法线矩阵
 */
function normalMatrix(modelMatrix: Float32Array): Float32Array {
    return new Float32Array([
        modelMatrix[0], modelMatrix[1], modelMatrix[2],
        modelMatrix[4], modelMatrix[5], modelMatrix[6],
        modelMatrix[8], modelMatrix[9], modelMatrix[10]
    ]);
}

/**
 * Calculate bounding box of meshes | 计算网格的包围盒
 * Note: IMeshData has vertices directly, not primitives
 */
function calculateBounds(meshes: IMeshData[]): { min: number[]; max: number[]; center: number[]; size: number } {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (const mesh of meshes) {
        // IMeshData has vertices directly as Float32Array
        const vertices = mesh.vertices;
        if (!vertices || vertices.length === 0) continue;

        // Vertices are interleaved or separate - assume 3 floats per vertex
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];

            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            minZ = Math.min(minZ, z);
            maxZ = Math.max(maxZ, z);
        }
    }

    if (!isFinite(minX)) {
        return { min: [0, 0, 0], max: [1, 1, 1], center: [0, 0.5, 0], size: 1 };
    }

    const center = [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];
    const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;

    return { min: [minX, minY, minZ], max: [maxX, maxY, maxZ], center, size };
}

/**
 * Sample animation at a given time | 在指定时间采样动画
 */
function sampleAnimation(
    clip: IGLTFAnimationClip,
    time: number,
    nodes: IGLTFNode[]
): Map<number, { position?: number[]; rotation?: number[]; scale?: number[] }> {
    const nodeTransforms = new Map<number, { position?: number[]; rotation?: number[]; scale?: number[] }>();

    for (const channel of clip.channels) {
        const sampler = clip.samplers[channel.samplerIndex];
        if (!sampler) continue;

        const nodeIndex = channel.target.nodeIndex;
        const path = channel.target.path;

        // Sample the animation
        const value = sampleSampler(sampler, time, path);
        if (!value) continue;

        let transform = nodeTransforms.get(nodeIndex);
        if (!transform) {
            transform = {};
            nodeTransforms.set(nodeIndex, transform);
        }

        if (path === 'translation') {
            transform.position = value;
        } else if (path === 'rotation') {
            transform.rotation = value;
        } else if (path === 'scale') {
            transform.scale = value;
        }
    }

    return nodeTransforms;
}

/**
 * Sample a single animation sampler | 采样单个动画采样器
 */
function sampleSampler(
    sampler: IAnimationSampler,
    time: number,
    path: string
): number[] | null {
    const input = sampler.input;
    const output = sampler.output;

    if (!input || !output || input.length === 0) return null;

    // Clamp time to animation range
    const minTime = input[0];
    const maxTime = input[input.length - 1];
    time = Math.max(minTime, Math.min(maxTime, time));

    // Find keyframes
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

    // Calculate interpolation factor
    const t0 = input[i0];
    const t1 = input[i1];
    const t = t1 > t0 ? (time - t0) / (t1 - t0) : 0;

    // Get component count based on path
    const componentCount = path === 'rotation' ? 4 : 3;

    // Handle rotation with SLERP (Spherical Linear Interpolation)
    // 使用 SLERP（球面线性插值）处理旋转
    if (path === 'rotation') {
        const q0 = [
            output[i0 * 4], output[i0 * 4 + 1],
            output[i0 * 4 + 2], output[i0 * 4 + 3]
        ];
        const q1 = [
            output[i1 * 4], output[i1 * 4 + 1],
            output[i1 * 4 + 2], output[i1 * 4 + 3]
        ];

        if (sampler.interpolation === 'STEP') {
            return q0;
        }

        return slerpQuaternion(q0, q1, t);
    }

    // Linear interpolation for position/scale
    // 位置/缩放使用线性插值
    const result: number[] = [];
    for (let c = 0; c < componentCount; c++) {
        const v0 = output[i0 * componentCount + c];
        const v1 = output[i1 * componentCount + c];

        if (sampler.interpolation === 'STEP') {
            result.push(v0);
        } else {
            result.push(v0 + (v1 - v0) * t);
        }
    }

    return result;
}

/**
 * Create transformation matrix from position, rotation (quaternion), scale
 * 从位置、旋转（四元数）、缩放创建变换矩阵
 */
function createTransformMatrix(
    position: number[],
    rotation: number[],
    scale: number[]
): Float32Array {
    const [qx, qy, qz, qw] = rotation;
    const [sx, sy, sz] = scale;

    // Quaternion to rotation matrix
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

/**
 * Multiply two 4x4 matrices | 4x4 矩阵乘法
 */
function multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
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

/**
 * Build skeleton hierarchy and calculate bone world matrices
 * 构建骨骼层级并计算骨骼世界矩阵
 *
 * @param skeleton - Skeleton data | 骨骼数据
 * @param nodes - Scene nodes | 场景节点
 * @param animTransforms - Animated transforms by node index | 按节点索引的动画变换
 * @returns Array of bone world matrices | 骨骼世界矩阵数组
 */
function calculateBoneMatrices(
    skeleton: ISkeletonData,
    nodes: IGLTFNode[],
    animTransforms: Map<number, { position?: number[]; rotation?: number[]; scale?: number[] }>
): Float32Array[] {
    const { joints } = skeleton;
    const boneCount = joints.length;

    // Local transforms for each joint | 每个关节的局部变换
    const localMatrices = new Array<Float32Array>(boneCount);
    // World transforms for each joint | 每个关节的世界变换
    const worldMatrices = new Array<Float32Array>(boneCount);
    // Final skin matrices | 最终蒙皮矩阵
    const skinMatrices = new Array<Float32Array>(boneCount);

    // Build processing order (parents before children) | 构建处理顺序（父节点在子节点之前）
    const processed = new Set<number>();
    const processingOrder: number[] = [];

    function addJoint(jointIndex: number) {
        if (processed.has(jointIndex)) return;

        const joint = joints[jointIndex];
        // Process parent first | 先处理父节点
        if (joint.parentIndex >= 0 && !processed.has(joint.parentIndex)) {
            addJoint(joint.parentIndex);
        }

        processingOrder.push(jointIndex);
        processed.add(jointIndex);
    }

    for (let i = 0; i < boneCount; i++) {
        addJoint(i);
    }

    // Calculate transforms | 计算变换
    for (const jointIndex of processingOrder) {
        const joint = joints[jointIndex];
        const node = nodes[joint.nodeIndex];

        if (!node) {
            localMatrices[jointIndex] = identity();
            worldMatrices[jointIndex] = identity();
            skinMatrices[jointIndex] = identity();
            continue;
        }

        // Get animated or default transform | 获取动画或默认变换
        const animTransform = animTransforms.get(joint.nodeIndex);
        const pos = animTransform?.position || node.transform.position;
        const rot = animTransform?.rotation || node.transform.rotation;
        const scl = animTransform?.scale || node.transform.scale;


        // Create local matrix | 创建局部矩阵
        localMatrices[jointIndex] = createTransformMatrix(pos, rot, scl);

        // Calculate world matrix | 计算世界矩阵
        if (joint.parentIndex >= 0) {
            worldMatrices[jointIndex] = multiplyMatrices(
                worldMatrices[joint.parentIndex],
                localMatrices[jointIndex]
            );
        } else {
            worldMatrices[jointIndex] = localMatrices[jointIndex];
        }

        // Calculate skin matrix = worldMatrix * inverseBindMatrix | 计算蒙皮矩阵
        skinMatrices[jointIndex] = multiplyMatrices(
            worldMatrices[jointIndex],
            joint.inverseBindMatrix
        );
    }

    return skinMatrices;
}

export const ModelPreview3D: React.FC<ModelPreview3DProps> = ({
    asset,
    animationClip,
    currentTime,
    width = 280,
    height = 200
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const skinnedProgramRef = useRef<WebGLProgram | null>(null);
    const gridProgramRef = useRef<WebGLProgram | null>(null);
    const buffersRef = useRef<Map<string, WebGLBuffer>>(new Map());
    const gridBufferRef = useRef<WebGLBuffer | null>(null);
    const hasSkinningRef = useRef<boolean>(false);

    // Camera state
    const [cameraRotation, setCameraRotation] = useState({ theta: 0.5, phi: 0.4 });
    const [cameraDistance, setCameraDistance] = useState(3);
    const isDraggingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });
    const boundsRef = useRef<{ center: number[]; size: number }>({ center: [0, 0, 0], size: 1 });

    // Initialize WebGL | 初始化 WebGL
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl', {
            antialias: true,
            alpha: true,
            depth: true
        });

        if (!gl) {
            console.error('[ModelPreview3D] WebGL not supported');
            return;
        }

        glRef.current = gl;

        // Create shader programs
        programRef.current = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
        skinnedProgramRef.current = createProgram(gl, SKINNED_VERTEX_SHADER, FRAGMENT_SHADER);
        gridProgramRef.current = createProgram(gl, GRID_VERTEX_SHADER, GRID_FRAGMENT_SHADER);

        // Create grid buffer - simple line grid
        const gridSize = 5;
        const gridStep = 1;
        const gridVertices: number[] = [];

        for (let i = -gridSize; i <= gridSize; i += gridStep) {
            // X axis lines
            gridVertices.push(-gridSize, 0, i);
            gridVertices.push(gridSize, 0, i);
            // Z axis lines
            gridVertices.push(i, 0, -gridSize);
            gridVertices.push(i, 0, gridSize);
        }

        const gridBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridVertices), gl.STATIC_DRAW);
        gridBufferRef.current = gridBuffer;

        // Store grid line count
        buffersRef.current.set('gridLineCount', (gridVertices.length / 3) as any);

        // Enable depth test and blending
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        return () => {
            buffersRef.current.forEach((buffer) => {
                if (typeof buffer === 'object') gl.deleteBuffer(buffer);
            });
            buffersRef.current.clear();
            if (gridBufferRef.current) gl.deleteBuffer(gridBufferRef.current);
            if (programRef.current) gl.deleteProgram(programRef.current);
            if (skinnedProgramRef.current) gl.deleteProgram(skinnedProgramRef.current);
            if (gridProgramRef.current) gl.deleteProgram(gridProgramRef.current);
        };
    }, []);

    // Upload mesh data | 上传网格数据
    useEffect(() => {
        const gl = glRef.current;
        if (!gl || !asset.meshes || asset.meshes.length === 0) return;

        // Calculate bounds for camera framing
        const bounds = calculateBounds(asset.meshes);
        boundsRef.current = { center: bounds.center, size: bounds.size };
        setCameraDistance(bounds.size * 2.5);

        // Clear old mesh buffers (keep grid line count)
        const gridLineCount = buffersRef.current.get('gridLineCount');
        buffersRef.current.forEach((buffer, key) => {
            if (key !== 'gridLineCount' && typeof buffer === 'object') {
                gl.deleteBuffer(buffer);
            }
        });
        buffersRef.current.clear();
        if (gridLineCount) buffersRef.current.set('gridLineCount', gridLineCount);

        // Create buffers for each mesh
        // IMeshData has: vertices, indices, normals, uvs directly
        let meshIndex = 0;
        for (const mesh of asset.meshes) {
            const vertices = mesh.vertices;
            const normals = mesh.normals;
            const uvs = mesh.uvs;
            const indices = mesh.indices;

            if (!vertices || vertices.length === 0) continue;

            // Position buffer
            const posBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            buffersRef.current.set(`pos_${meshIndex}`, posBuffer!);

            // Normal buffer
            if (normals && normals.length > 0) {
                const normBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
                buffersRef.current.set(`norm_${meshIndex}`, normBuffer!);
            }

            // UV buffer
            if (uvs && uvs.length > 0) {
                const uvBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
                buffersRef.current.set(`uv_${meshIndex}`, uvBuffer!);
            }

            // Index buffer
            if (indices && indices.length > 0) {
                const idxBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
                // Handle both Uint16Array and Uint32Array
                if (indices instanceof Uint32Array) {
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
                    buffersRef.current.set(`idxType_${meshIndex}`, gl.UNSIGNED_INT as any);
                } else {
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
                    buffersRef.current.set(`idxType_${meshIndex}`, gl.UNSIGNED_SHORT as any);
                }
                buffersRef.current.set(`idx_${meshIndex}`, idxBuffer!);
                buffersRef.current.set(`count_${meshIndex}`, indices.length as any);
            } else {
                buffersRef.current.set(`count_${meshIndex}`, (vertices.length / 3) as any);
            }

            // Skinning: Joints buffer (bone indices per vertex)
            // 蒙皮：关节缓冲区（每顶点的骨骼索引）
            const joints = (mesh as any).joints;
            if (joints && joints.length > 0) {
                const jointsBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, jointsBuffer);
                // Convert to float for WebGL 1.0 compatibility
                const jointsFloat = new Float32Array(joints.length);
                for (let j = 0; j < joints.length; j++) {
                    jointsFloat[j] = joints[j];
                }
                gl.bufferData(gl.ARRAY_BUFFER, jointsFloat, gl.STATIC_DRAW);
                buffersRef.current.set(`joints_${meshIndex}`, jointsBuffer!);
            }

            // Skinning: Weights buffer (bone weights per vertex)
            // 蒙皮：权重缓冲区（每顶点的骨骼权重）
            const weights = (mesh as any).weights;
            if (weights && weights.length > 0) {
                const weightsBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, weightsBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, weights, gl.STATIC_DRAW);
                buffersRef.current.set(`weights_${meshIndex}`, weightsBuffer!);
            }

            meshIndex++;
        }

        // Check if any mesh has skinning data | 检查是否有蒙皮数据
        hasSkinningRef.current = asset.meshes.some((m: any) => m.joints && m.weights);
        const firstMesh = asset.meshes[0] as any;

        // Find unique joint indices used in mesh | 查找网格中使用的唯一关节索引
        let maxJointIndex = -1;
        const usedJoints = new Set<number>();
        if (firstMesh?.joints) {
            for (let i = 0; i < firstMesh.joints.length; i++) {
                const jIdx = firstMesh.joints[i];
                usedJoints.add(jIdx);
                if (jIdx > maxJointIndex) maxJointIndex = jIdx;
            }
        }

        buffersRef.current.set('meshCount', meshIndex as any);
    }, [asset.meshes]);

    // Render scene | 渲染场景
    useEffect(() => {
        const gl = glRef.current;
        const program = programRef.current;
        const gridProgram = gridProgramRef.current;
        if (!gl || !program || !gridProgram) return;

        const { center, size } = boundsRef.current;

        // Calculate camera position
        const camX = center[0] + cameraDistance * Math.sin(cameraRotation.theta) * Math.cos(cameraRotation.phi);
        const camY = center[1] + cameraDistance * Math.sin(cameraRotation.phi);
        const camZ = center[2] + cameraDistance * Math.cos(cameraRotation.theta) * Math.cos(cameraRotation.phi);

        // Setup matrices
        const projectionMatrix = perspective(Math.PI / 4, width / height, 0.1, size * 10);
        const viewMatrix = lookAt([camX, camY, camZ], center, [0, 1, 0]);
        let modelMatrix = identity();

        // Calculate bone matrices for skeletal animation | 计算骨骼动画的骨骼矩阵
        let boneMatrices: Float32Array[] | null = null;

        if (animationClip && asset.nodes) {
            const nodeTransforms = sampleAnimation(animationClip, currentTime, asset.nodes);

            // If we have skeleton data, calculate full bone matrices | 如果有骨骼数据，计算完整骨骼矩阵
            if (asset.skeleton && asset.skeleton.joints.length > 0) {
                boneMatrices = calculateBoneMatrices(asset.skeleton, asset.nodes, nodeTransforms);

                // Fallback: if no GPU skinning, apply root bone transform to model
                // 回退：如果没有 GPU 蒙皮，将根骨骼变换应用到模型
                if (!hasSkinningRef.current && boneMatrices.length > 0) {
                    // Find the hip/root bone - usually first few bones
                    // 查找臀部/根骨骼 - 通常是前几个骨骼
                    const rootJoint = asset.skeleton.joints[asset.skeleton.rootJointIndex];
                    if (rootJoint) {
                        const rootTransform = nodeTransforms.get(rootJoint.nodeIndex);
                        if (rootTransform) {
                            const pos = rootTransform.position || [0, 0, 0];
                            const rot = rootTransform.rotation || [0, 0, 0, 1];
                            const scl = rootTransform.scale || [1, 1, 1];
                            modelMatrix = createTransformMatrix(pos, rot, scl);
                        }
                    }
                }

            } else {
                // For non-skeletal animation, build node hierarchy and apply transforms
                // 对于非骨骼动画，构建节点层级并应用变换
                const nodeWorldMatrices = new Map<number, Float32Array>();

                // Calculate world matrices for all nodes | 计算所有节点的世界矩阵
                function calculateNodeWorldMatrix(nodeIndex: number): Float32Array {
                    if (nodeWorldMatrices.has(nodeIndex)) {
                        return nodeWorldMatrices.get(nodeIndex)!;
                    }

                    const node = asset.nodes![nodeIndex];
                    if (!node) {
                        const mat = identity();
                        nodeWorldMatrices.set(nodeIndex, mat);
                        return mat;
                    }

                    // Get animated or default transform | 获取动画或默认变换
                    const animTransform = nodeTransforms.get(nodeIndex);
                    const pos = animTransform?.position || node.transform.position;
                    const rot = animTransform?.rotation || node.transform.rotation;
                    const scl = animTransform?.scale || node.transform.scale;

                    const localMatrix = createTransformMatrix(pos, rot, scl);

                    // Find parent node | 查找父节点
                    let parentIndex = -1;
                    for (let i = 0; i < asset.nodes!.length; i++) {
                        if (asset.nodes![i].children.includes(nodeIndex)) {
                            parentIndex = i;
                            break;
                        }
                    }

                    let worldMatrix: Float32Array;
                    if (parentIndex >= 0) {
                        const parentWorld = calculateNodeWorldMatrix(parentIndex);
                        worldMatrix = multiplyMatrices(parentWorld, localMatrix);
                    } else {
                        worldMatrix = localMatrix;
                    }

                    nodeWorldMatrices.set(nodeIndex, worldMatrix);
                    return worldMatrix;
                }

                // Find node with mesh and get its world matrix | 查找带网格的节点并获取其世界矩阵
                for (let i = 0; i < asset.nodes.length; i++) {
                    const node = asset.nodes[i];
                    if (node.meshIndex !== undefined && node.meshIndex >= 0) {
                        modelMatrix = calculateNodeWorldMatrix(i);
                        break;
                    }
                }

            }
        }

        const normMatrix = normalMatrix(modelMatrix);

        // Clear
        gl.viewport(0, 0, width, height);
        gl.clearColor(0.15, 0.15, 0.18, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Draw grid
        gl.useProgram(gridProgram);
        gl.uniformMatrix4fv(gl.getUniformLocation(gridProgram, 'uViewMatrix'), false, viewMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(gridProgram, 'uProjectionMatrix'), false, projectionMatrix);
        gl.uniform4f(gl.getUniformLocation(gridProgram, 'uColor'), 0.4, 0.4, 0.4, 0.5);

        const gridPosLoc = gl.getAttribLocation(gridProgram, 'aPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, gridBufferRef.current);
        gl.enableVertexAttribArray(gridPosLoc);
        gl.vertexAttribPointer(gridPosLoc, 3, gl.FLOAT, false, 0, 0);

        const gridLineCount = buffersRef.current.get('gridLineCount') as unknown as number || 0;
        gl.drawArrays(gl.LINES, 0, gridLineCount);

        // Select shader based on skinning | 根据蒙皮选择着色器
        const useSkinning = hasSkinningRef.current && boneMatrices && boneMatrices.length > 0;
        const skinnedProgram = skinnedProgramRef.current;
        const activeProgram = useSkinning && skinnedProgram ? skinnedProgram : program;

        gl.useProgram(activeProgram);

        // Set uniforms
        gl.uniformMatrix4fv(gl.getUniformLocation(activeProgram, 'uModelMatrix'), false, modelMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(activeProgram, 'uViewMatrix'), false, viewMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(activeProgram, 'uProjectionMatrix'), false, projectionMatrix);
        gl.uniformMatrix3fv(gl.getUniformLocation(activeProgram, 'uNormalMatrix'), false, normMatrix);

        // Lighting
        gl.uniform3f(gl.getUniformLocation(activeProgram, 'uLightDirection'), 0.5, -0.7, 0.5);
        gl.uniform3f(gl.getUniformLocation(activeProgram, 'uLightColor'), 0.8, 0.8, 0.8);
        gl.uniform3f(gl.getUniformLocation(activeProgram, 'uAmbientColor'), 0.3, 0.3, 0.35);
        gl.uniform4f(gl.getUniformLocation(activeProgram, 'uBaseColor'), 0.7, 0.7, 0.75, 1.0);
        gl.uniform1i(gl.getUniformLocation(activeProgram, 'uHasTexture'), 0);

        // Upload bone matrices if skinning | 如果蒙皮则上传骨骼矩阵
        if (useSkinning && skinnedProgram) {
            gl.uniform1i(gl.getUniformLocation(skinnedProgram, 'uUseSkinning'), 1);

            // Upload bone matrices (limited to MAX_BONES)
            const boneCount = Math.min(boneMatrices!.length, MAX_BONES);
            for (let b = 0; b < boneCount; b++) {
                const loc = gl.getUniformLocation(skinnedProgram, `uBoneMatrices[${b}]`);
                if (loc) {
                    gl.uniformMatrix4fv(loc, false, boneMatrices![b]);
                }
            }
        }

        // Get attribute locations
        const posLoc = gl.getAttribLocation(activeProgram, 'aPosition');
        const normLoc = gl.getAttribLocation(activeProgram, 'aNormal');
        const texLoc = gl.getAttribLocation(activeProgram, 'aTexCoord');
        const jointsLoc = useSkinning ? gl.getAttribLocation(activeProgram, 'aJoints') : -1;
        const weightsLoc = useSkinning ? gl.getAttribLocation(activeProgram, 'aWeights') : -1;

        // Draw each mesh
        const meshCount = buffersRef.current.get('meshCount') as unknown as number || 0;
        for (let i = 0; i < meshCount; i++) {
            const posBuffer = buffersRef.current.get(`pos_${i}`);
            const normBuffer = buffersRef.current.get(`norm_${i}`);
            const uvBuffer = buffersRef.current.get(`uv_${i}`);
            const idxBuffer = buffersRef.current.get(`idx_${i}`);
            const jointsBuffer = buffersRef.current.get(`joints_${i}`);
            const weightsBuffer = buffersRef.current.get(`weights_${i}`);
            const count = buffersRef.current.get(`count_${i}`) as unknown as number;
            const idxType = buffersRef.current.get(`idxType_${i}`) as unknown as number;

            if (!posBuffer || typeof posBuffer !== 'object') continue;

            // Position
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

            // Normal
            if (normBuffer && typeof normBuffer === 'object' && normLoc >= 0) {
                gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
                gl.enableVertexAttribArray(normLoc);
                gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);
            } else if (normLoc >= 0) {
                gl.disableVertexAttribArray(normLoc);
                gl.vertexAttrib3f(normLoc, 0, 1, 0);
            }

            // TexCoord
            if (uvBuffer && typeof uvBuffer === 'object' && texLoc >= 0) {
                gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
                gl.enableVertexAttribArray(texLoc);
                gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
            } else if (texLoc >= 0) {
                gl.disableVertexAttribArray(texLoc);
                gl.vertexAttrib2f(texLoc, 0, 0);
            }

            // Skinning attributes | 蒙皮属性
            if (useSkinning && jointsLoc >= 0) {
                if (jointsBuffer && typeof jointsBuffer === 'object') {
                    gl.bindBuffer(gl.ARRAY_BUFFER, jointsBuffer);
                    gl.enableVertexAttribArray(jointsLoc);
                    gl.vertexAttribPointer(jointsLoc, 4, gl.FLOAT, false, 0, 0);
                } else {
                    gl.disableVertexAttribArray(jointsLoc);
                    gl.vertexAttrib4f(jointsLoc, 0, 0, 0, 0);
                }
            }

            if (useSkinning && weightsLoc >= 0) {
                if (weightsBuffer && typeof weightsBuffer === 'object') {
                    gl.bindBuffer(gl.ARRAY_BUFFER, weightsBuffer);
                    gl.enableVertexAttribArray(weightsLoc);
                    gl.vertexAttribPointer(weightsLoc, 4, gl.FLOAT, false, 0, 0);
                } else {
                    gl.disableVertexAttribArray(weightsLoc);
                    gl.vertexAttrib4f(weightsLoc, 0, 0, 0, 0);
                }
            }

            // Draw
            if (idxBuffer && typeof idxBuffer === 'object') {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
                // Check for OES_element_index_uint extension for Uint32 indices
                if (idxType === gl.UNSIGNED_INT) {
                    const ext = gl.getExtension('OES_element_index_uint');
                    if (ext) {
                        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, 0);
                    }
                } else {
                    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
                }
            } else {
                gl.drawArrays(gl.TRIANGLES, 0, count);
            }
        }
    }, [asset.meshes, asset.nodes, asset.skeleton, cameraRotation, cameraDistance, width, height, currentTime, animationClip]);

    // Mouse handlers for camera orbit | 鼠标处理器用于相机旋转
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;

        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };

        setCameraRotation(prev => ({
            theta: prev.theta - dx * 0.01,
            phi: Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, prev.phi + dy * 0.01))
        }));
    }, []);

    const handleMouseUp = useCallback(() => {
        isDraggingRef.current = false;
    }, []);

    // Use non-passive wheel listener to prevent scroll propagation
    // 使用非 passive 滚轮监听器以阻止滚动穿透
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setCameraDistance(prev => Math.max(0.5, Math.min(50, prev + e.deltaY * 0.01 * (prev * 0.5))));
        };

        // Add with { passive: false } to allow preventDefault
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, []);

    return (
        <div className="model-preview-3d" style={{ position: 'relative' }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                    width: '100%',
                    height: `${height}px`,
                    borderRadius: '4px',
                    cursor: isDraggingRef.current ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
            <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.5)',
                pointerEvents: 'none'
            }}>
                拖拽旋转 | 滚轮缩放
            </div>
        </div>
    );
};

export default ModelPreview3D;
