"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeMesh = optimizeMesh;
exports.clusterizeMesh = clusterizeMesh;
exports.getDefaultSimplifyOptions = getDefaultSimplifyOptions;
exports.simplifyMesh = simplifyMesh;
exports.compressMesh = compressMesh;
exports.encodeMesh = encodeMesh;
exports.quantizeMesh = quantizeMesh;
exports.deflateMesh = deflateMesh;
const cc_1 = require("cc");
const meshopt_encoder_1 = __importDefault(require("meshopt_encoder"));
const zlib_1 = __importDefault(require("zlib"));
const gltf_converter_1 = require("../utils/gltf-converter");
let inited = false;
async function tryInitMeshOpt() {
    if (!inited) {
        return meshopt_encoder_1.default.init().then(() => {
            console.log('MeshOpt init success');
            inited = true;
        });
    }
    else {
        return Promise.resolve();
    }
}
function getOffset(attributes, attributeIndex) {
    let result = 0;
    for (let i = 0; i < attributeIndex; ++i) {
        const attribute = attributes[i];
        result += cc_1.gfx.FormatInfos[attribute.format].size;
    }
    return result;
}
const overdrawThreshold = 3.0;
async function optimizeMesh(mesh, options) {
    await tryInitMeshOpt();
    if (!options) {
        return mesh;
    }
    if (!(options.overdraw || options.vertexCache || options.vertexFetch)) {
        console.warn('No optimization option is enabled, return the original mesh');
        return mesh;
    }
    const bufferBlob = new gltf_converter_1.BufferBlob();
    bufferBlob.setNextAlignment(0);
    const struct = JSON.parse(JSON.stringify(mesh.struct));
    for (let i = 0; i < struct.primitives.length; ++i) {
        const primitive = struct.primitives[i];
        if (primitive.primitiveMode === cc_1.gfx.PrimitiveMode.POINT_LIST || primitive.indexView === undefined) {
            console.warn('Only triangle list is supported.');
            // no need to optimize point list, or un-indexed mesh, just dump
            // * generate index buffer for un-indexed mesh, maybe later
            for (let j = 0; j < primitive.vertexBundelIndices.length; ++j) {
                const bundle = struct.vertexBundles[primitive.vertexBundelIndices[j]];
                const view = bundle.view;
                const buffer = new Uint8Array(mesh.data.buffer, view.offset, view.length);
                bufferBlob.setNextAlignment(view.stride);
                const newView = {
                    offset: bufferBlob.getLength(),
                    length: buffer.byteLength,
                    count: view.count,
                    stride: view.stride,
                };
                bundle.view = newView;
                bufferBlob.addBuffer(buffer);
            }
            continue;
        }
        // find vertex bundle with position attribute
        const indexView = primitive.indexView;
        const vertexCount = struct.vertexBundles[primitive.vertexBundelIndices[0]].view.count;
        const newIndex = new Uint8Array(indexView.count * Uint32Array.BYTES_PER_ELEMENT);
        // convert index to 32bit
        if (indexView.stride === 2) {
            const indexBuffer16 = new Uint16Array(mesh.data.buffer, indexView.offset, indexView.count);
            const indexBuffer32 = new Uint32Array(newIndex.buffer, 0, indexView.count);
            for (let j = 0; j < indexView.count; ++j) {
                indexBuffer32[j] = indexBuffer16[j];
            }
        }
        else if (indexView.stride === 4) {
            newIndex.set(new Uint8Array(mesh.data.buffer, indexView.offset, indexView.count * Uint32Array.BYTES_PER_ELEMENT));
        }
        if (options.vertexCache) {
            meshopt_encoder_1.default.optimizer.optimizeVertexCache(newIndex, newIndex, indexView.count, vertexCount);
        }
        if (options.overdraw) {
            const positionBundleIndex = primitive.vertexBundelIndices.findIndex((bundleIndex) => {
                const bundle = struct.vertexBundles[bundleIndex];
                const attributes = bundle.attributes;
                const posIndex = attributes.findIndex((attr) => attr.name === cc_1.gfx.AttributeName.ATTR_POSITION);
                return posIndex >= 0;
            });
            if (positionBundleIndex < 0) {
                console.warn('No position attribute found, overdraw optimization is not supported.');
            }
            else {
                const bundle = struct.vertexBundles[primitive.vertexBundelIndices[positionBundleIndex]];
                const view = bundle.view;
                const attributes = bundle.attributes;
                const posIndex = attributes.findIndex((attr) => attr.name === cc_1.gfx.AttributeName.ATTR_POSITION);
                const positionOffset = getOffset(attributes, posIndex);
                const vertexBuffer = new Uint8Array(mesh.data.buffer, view.offset, view.length);
                meshopt_encoder_1.default.optimizer.optimizeOverdraw(newIndex, newIndex, indexView.count, vertexBuffer.subarray(positionOffset), vertexCount, view.stride, overdrawThreshold);
            }
        }
        const needOptimizeFetch = options.vertexCache || options.overdraw || options.vertexFetch;
        if (!needOptimizeFetch) {
            if (primitive.vertexBundelIndices.length === 1) {
                // simple optimization
                const bundle = struct.vertexBundles[primitive.vertexBundelIndices[0]];
                const view = bundle.view;
                const vertexBuffer = new Uint8Array(mesh.data.buffer, view.offset, view.length);
                const newBuffer = new Uint8Array(view.count * view.stride);
                meshopt_encoder_1.default.optimizer.optimizeVertexFetch(newBuffer, newIndex, indexView.count, vertexBuffer, view.count, view.stride);
                bufferBlob.setNextAlignment(view.stride);
                const newView = {
                    offset: bufferBlob.getLength(),
                    length: newBuffer.byteLength,
                    count: view.count,
                    stride: view.stride,
                };
                bundle.view = newView;
                bufferBlob.addBuffer(newBuffer);
            }
            else if (primitive.vertexBundelIndices.length > 1) {
                const remapBuffer = new ArrayBuffer(indexView.count * Uint32Array.BYTES_PER_ELEMENT);
                const totalVertex = meshopt_encoder_1.default.optimizer.optimizeVertexFetchRemap(remapBuffer, newIndex, indexView.count, vertexCount);
                meshopt_encoder_1.default.optimizer.optimizeRemapIndex(newIndex, newIndex, indexView.count, remapBuffer);
                for (let j = 0; j < primitive.vertexBundelIndices.length; ++j) {
                    const bundle = struct.vertexBundles[primitive.vertexBundelIndices[j]];
                    const view = bundle.view;
                    const buffer = new Uint8Array(mesh.data.buffer, view.offset, view.length);
                    const newBuffer = new Uint8Array(totalVertex * view.stride);
                    meshopt_encoder_1.default.optimizer.optimizeRemapVertex(newBuffer, buffer, totalVertex, view.stride, remapBuffer);
                    bufferBlob.setNextAlignment(view.stride);
                    const newView = {
                        offset: bufferBlob.getLength(),
                        length: newBuffer.byteLength,
                        count: totalVertex,
                        stride: view.stride,
                    };
                    bundle.view = newView;
                    bufferBlob.addBuffer(newBuffer);
                }
            }
        }
        else {
            // dump vertex buffer, leave un-optimized
            for (let j = 0; j < primitive.vertexBundelIndices.length; ++j) {
                const bundle = struct.vertexBundles[primitive.vertexBundelIndices[j]];
                const view = bundle.view;
                const buffer = new Uint8Array(mesh.data.buffer, view.offset, view.length);
                bufferBlob.setNextAlignment(view.stride);
                const newView = {
                    offset: bufferBlob.getLength(),
                    length: buffer.byteLength,
                    count: view.count,
                    stride: view.stride,
                };
                bundle.view = newView;
                bufferBlob.addBuffer(buffer);
            }
        }
        bufferBlob.setNextAlignment(Uint32Array.BYTES_PER_ELEMENT);
        const newIndexView = {
            offset: bufferBlob.getLength(),
            length: newIndex.byteLength,
            count: indexView.count,
            stride: Uint32Array.BYTES_PER_ELEMENT,
        };
        primitive.indexView = newIndexView;
        bufferBlob.addBuffer(newIndex);
    }
    const newMesh = new cc_1.Mesh();
    newMesh.reset({
        struct,
        data: bufferBlob.getCombined(),
    });
    const hash = newMesh.hash;
    return newMesh;
}
const maxTriangleCount = 124; // nvidia recommends 126, rounded down to a multiple of 4
const maxVertexCount = 64; // nvidia recommends 64
const coneWeight = 0.5; // should be 0 unless cone culling is used during runtime
async function clusterizeMesh(mesh, options) {
    await tryInitMeshOpt();
    if (!options) {
        return mesh;
    }
    // 'mesh' and 'options' are not used in this function, so we can remove them
    const struct = mesh.struct;
    const primitives = mesh.struct.primitives;
    const vertexBundles = mesh.struct.vertexBundles;
    const meshlets = [];
    const meshletVertices = [];
    const meshletTriangles = [];
    let meshletsOffset = 0;
    let meshletVerticesOffset = 0;
    let meshletTrianglesOffset = 0;
    primitives.forEach((primitive, idx) => {
        if (!primitive.indexView) {
            console.warn(`Submesh ${idx} has no index buffer, meshlet optimization is not supported.`);
            return;
        }
        if (primitive.vertexBundelIndices.length === 1) {
            // estimates meshlet count
            const indexView = primitive.indexView;
            const indexCount = indexView.count;
            const vertexView = vertexBundles[primitive.vertexBundelIndices[0]].view;
            const vertexCount = vertexView.count;
            const maxMeshletCount = meshopt_encoder_1.default.optimizer.buildMeshLetsBound(indexCount, maxVertexCount, maxTriangleCount);
            // allocates meshlet buffer, the type is encoder.Meshlet
            const meshlet_data = new Uint8Array(maxMeshletCount * Uint32Array.BYTES_PER_ELEMENT * 4 /* 4 arguments */);
            const meshlet_vertices = new Uint8Array(maxMeshletCount * maxVertexCount * Uint32Array.BYTES_PER_ELEMENT);
            const meshlet_triangles = new Uint8Array(maxMeshletCount * maxTriangleCount * Uint32Array.BYTES_PER_ELEMENT * 3 /* triangles */);
            // scan meshlet
            const attrs = vertexBundles[primitive.vertexBundelIndices[0]].attributes;
            const indexOfPosition = attrs.findIndex((attr) => attr.name === cc_1.gfx.AttributeName.ATTR_POSITION);
            const positionOffset = getOffset(attrs, indexOfPosition);
            const vertexBufferAtPos = new Uint8Array(mesh.data.buffer, vertexView.offset + positionOffset, vertexView.length - positionOffset);
            let meshletCount = 0;
            if (indexView.stride === 4) {
                //!! support 32bit index
                const indexBuffer32 = new Uint32Array(mesh.data.buffer, indexView.offset, indexCount);
                // meshletCount = encoder.optimizer.buildMeshLetsScan(meshlet_data, meshlet_vertices, meshlet_triangles, indexBuffer32, indexCount, vertexCount, maxVertexCount, maxTriangleCount);
                meshletCount = meshopt_encoder_1.default.optimizer.buildMeshLets(meshlet_data, meshlet_vertices, meshlet_triangles, indexBuffer32, indexCount, vertexBufferAtPos, vertexCount, vertexView.stride, maxVertexCount, maxTriangleCount, coneWeight);
            }
            else if (indexView.stride === 2) {
                //!! 16 bit index
                const indexBuffer16 = new Uint16Array(mesh.data.buffer, indexView.offset, indexCount);
                const indexBuffer32 = new Uint32Array(indexCount);
                for (let i = 0; i < indexCount; ++i) {
                    indexBuffer32[i] = indexBuffer16[i];
                }
                // meshletCount = encoder.optimizer.buildMeshLetsScan(meshlet_data, meshlet_vertices, meshlet_triangles, indexBuffer32, indexCount, vertexCount, maxVertexCount, maxTriangleCount);
                meshletCount = meshopt_encoder_1.default.optimizer.buildMeshLets(meshlet_data, meshlet_vertices, meshlet_triangles, indexBuffer32, indexCount, vertexBufferAtPos, vertexCount, vertexView.stride, maxVertexCount, maxTriangleCount, coneWeight);
            }
            else {
                console.warn(`Submesh ${idx} has unsupported index stride, meshlet optimization is not supported.`);
                return;
            }
            // TODO: should shrink meshlet buffer size
            // calculate meshlet cone cluster
            if (options?.coneCluster) {
                // TODO: implement cone cluster, cone cluster should be constructed in a buffer
                const coneSize = 48; // 12 + 4 + 12 + 12 + 4 + 3 + 1
                const coneBuffer = new Uint8Array(coneSize * meshletCount);
                const vertexOffset = 0;
                const triangleOffset = 0;
                for (let i = 0; i < meshletCount; ++i) {
                    // const meshletVerticesView = new Uint8Array(meshlet_vertices.buffer, vertexOffset );
                    // const bound = encoder.optimizer.computeMeshLetsBound(meshlet_vertices, meshlet_triangles, i, vertexCount, vertexView.stride);
                }
            }
            meshlets.push(meshlet_data);
            meshletVertices.push(meshlet_vertices);
            meshletTriangles.push(meshlet_triangles);
            meshletsOffset += meshlet_data.byteLength;
            meshletVerticesOffset += meshlet_vertices.byteLength;
            meshletTrianglesOffset += meshlet_triangles.byteLength;
            primitive.cluster = {
                clusterView: {
                    offset: meshletsOffset,
                    length: meshlet_data.byteLength,
                    count: meshletCount,
                    stride: Uint32Array.BYTES_PER_ELEMENT * 4,
                },
                vertexView: {
                    offset: meshletVerticesOffset,
                    length: meshlet_vertices.byteLength,
                    count: vertexCount, // TODO fix
                    stride: Uint32Array.BYTES_PER_ELEMENT,
                },
                triangleView: {
                    offset: meshletTrianglesOffset,
                    length: meshlet_triangles.byteLength,
                    count: indexCount, // TODO fix
                    stride: Uint32Array.BYTES_PER_ELEMENT * 3,
                },
            };
        }
        else if (primitive.vertexBundelIndices.length > 1) {
            console.warn(`Submesh ${idx} has more than one vertex bundle, cache optimization is not supported.`);
        }
        else {
            console.warn(`Submesh ${idx} has no vertex bundle, cache optimization is not supported.`);
        }
    });
    if (meshlets.length > 0) {
        // summary meshlet buffer size
        const meshletDataSize = meshlets.reduce((acc, cur) => acc + cur.byteLength, 0);
        const meshletVerticesSize = meshletVertices.reduce((acc, cur) => acc + cur.byteLength, 0);
        const meshletTrianglesSize = meshletTriangles.reduce((acc, cur) => acc + cur.byteLength, 0);
        // allocates new mesh buffer
        const newMeshData = new Uint8Array(mesh.data.byteLength + meshletDataSize + meshletVerticesSize + meshletTrianglesSize);
        // copy original mesh data
        newMeshData.set(mesh.data);
        // copy meshlet data
        let offset = mesh.data.byteLength;
        meshlets.forEach((meshlet) => {
            newMeshData.set(meshlet, offset);
            offset += meshlet.byteLength;
        });
        // copy meshlet vertices
        meshletVertices.forEach((meshlet) => {
            newMeshData.set(meshlet, offset);
            offset += meshlet.byteLength;
        });
        // copy meshlet triangles
        meshletTriangles.forEach((meshlet) => {
            newMeshData.set(meshlet, offset);
            offset += meshlet.byteLength;
        });
        // create new bufferViews for meshlet data
        primitives.forEach((primitive, idx) => {
            if (primitive.cluster) {
                primitive.cluster.clusterView.offset += mesh.data.byteLength;
                primitive.cluster.vertexView.offset += mesh.data.byteLength + meshletDataSize;
                primitive.cluster.triangleView.offset += mesh.data.byteLength + meshletDataSize + meshletVerticesSize;
            }
        });
        const newMesh = new cc_1.Mesh();
        newMesh.reset({
            struct,
            data: newMeshData,
        });
        newMesh.struct.cluster = true;
        const hash = newMesh.hash;
        return newMesh;
    }
    return mesh; // return the original mesh for now
}
function getDefaultSimplifyOptions() {
    return {
        enable: true,
        targetRatio: 0.5,
        autoErrorRatio: true,
        lockBoundary: true,
    };
}
async function simplifyMesh(mesh, options) {
    await tryInitMeshOpt();
    if (!(options && options.targetRatio)) {
        return mesh;
    }
    const suitable = mesh.struct.primitives.every((primitive) => {
        return primitive.primitiveMode === cc_1.gfx.PrimitiveMode.TRIANGLE_LIST || primitive.primitiveMode === cc_1.gfx.PrimitiveMode.POINT_LIST;
    });
    if (!suitable) {
        console.warn('Only triangle list and point list are supported.');
        return mesh;
    }
    if (mesh.struct.compressed) {
        console.warn('Compressed mesh is not supported.');
        return mesh;
    }
    if (mesh.struct.cluster) {
        console.warn('Mesh cluster is not supported.');
        return mesh;
    }
    if (mesh.struct.quantized) {
        console.warn('Quantized mesh is not supported.');
        return mesh;
    }
    const simplify_option = options.lockBoundary ? 1 : 0;
    const target_ratio = options.targetRatio;
    const auto_error_rate = 1.0 - Math.pow(0.9, -Math.log10(target_ratio));
    const target_error = options.autoErrorRate ? auto_error_rate : options.errorRate || auto_error_rate;
    const bufferBlob = new gltf_converter_1.BufferBlob();
    bufferBlob.setNextAlignment(0);
    // per primitive
    const struct = JSON.parse(JSON.stringify(mesh.struct));
    const primitives = struct.primitives;
    for (let i = 0; i < primitives.length; ++i) {
        const primitive = primitives[i];
        if (primitive.primitiveMode === cc_1.gfx.PrimitiveMode.TRIANGLE_LIST && primitive.indexView) {
            // ! for primitive without index buffer, we should generate one
            const indexView = primitive.indexView;
            let indexBuffer;
            let newIndex = new Uint8Array(indexView.count * Uint32Array.BYTES_PER_ELEMENT);
            let indexCount = indexView.count;
            if (indexView.stride === 2) {
                indexBuffer = new Uint8Array(newIndex.buffer, 0, indexView.count * Uint32Array.BYTES_PER_ELEMENT);
                const indexBuffer16 = new Uint16Array(mesh.data.buffer, indexView.offset, indexView.count);
                const indexBuffer32 = new Uint32Array(indexBuffer.buffer, 0, indexView.count);
                for (let j = 0; j < indexView.count; ++j) {
                    indexBuffer32[j] = indexBuffer16[j];
                }
            }
            else if (indexView.stride === 4) {
                indexBuffer = new Uint8Array(mesh.data.buffer, indexView.offset, indexView.count * Uint32Array.BYTES_PER_ELEMENT);
            }
            else {
                console.warn(`Submesh ${i} has unsupported index stride, simplify optimization is not supported.`);
                return mesh;
            }
            const positionBundleIndex = primitive.vertexBundelIndices.findIndex((bundleIndex) => {
                const bundle = struct.vertexBundles[bundleIndex];
                const attributes = bundle.attributes;
                const posIndex = attributes.findIndex((attr) => attr.name === cc_1.gfx.AttributeName.ATTR_POSITION);
                return posIndex >= 0;
            });
            if (positionBundleIndex < 0) {
                console.warn('No position attribute found, simplify optimization is not supported.');
                return mesh;
            }
            else {
                // proceed to simplify
                const bundle = struct.vertexBundles[primitive.vertexBundelIndices[positionBundleIndex]];
                const view = bundle.view;
                const attributes = bundle.attributes;
                const posIndex = attributes.findIndex((attr) => attr.name === cc_1.gfx.AttributeName.ATTR_POSITION);
                const positionOffset = getOffset(attributes, posIndex);
                const vertexBuffer = new Uint8Array(mesh.data.buffer, view.offset, view.length);
                const target_index_count = Math.floor((indexView.count * target_ratio) / 3) * 3;
                const result_error = 0;
                indexCount = meshopt_encoder_1.default.optimizer.simplify(newIndex, indexBuffer, indexView.count, vertexBuffer.subarray(positionOffset), view.count, view.stride, target_index_count, target_error, simplify_option, result_error);
                newIndex = new Uint8Array(newIndex.buffer, 0, indexCount * Uint32Array.BYTES_PER_ELEMENT); // shrink buffer size
                // optimize vertex fetch
                if (primitive.vertexBundelIndices.length === 1) {
                    // simple optimization
                    let vertexCount = indexCount < view.count ? indexCount : view.count;
                    let destVertexBuffer = new Uint8Array(view.count * view.stride);
                    vertexCount = meshopt_encoder_1.default.optimizer.optimizeVertexFetch(destVertexBuffer, newIndex, indexCount, vertexBuffer, view.count, view.stride);
                    destVertexBuffer = new Uint8Array(destVertexBuffer.buffer, 0, vertexCount * view.stride); // shrink buffer size
                    bufferBlob.setNextAlignment(view.stride);
                    const newView = {
                        offset: bufferBlob.getLength(),
                        length: destVertexBuffer.byteLength,
                        count: vertexCount,
                        stride: view.stride,
                    };
                    bundle.view = newView;
                    bufferBlob.addBuffer(destVertexBuffer);
                }
                else {
                    const remapBuffer = new Uint8Array(indexCount * Uint32Array.BYTES_PER_ELEMENT);
                    const totalVertex = meshopt_encoder_1.default.optimizer.optimizeVertexFetchRemap(remapBuffer, newIndex, indexCount, view.count);
                    meshopt_encoder_1.default.optimizer.optimizeRemapIndex(newIndex, newIndex, indexCount, remapBuffer);
                    for (let j = 0; j < primitive.vertexBundelIndices.length; ++j) {
                        const bundle = struct.vertexBundles[primitive.vertexBundelIndices[j]];
                        const view = bundle.view;
                        const buffer = new Uint8Array(mesh.data.buffer, view.offset, view.length);
                        const newBuffer = new Uint8Array(totalVertex * view.stride);
                        meshopt_encoder_1.default.optimizer.optimizeRemapVertex(newBuffer, buffer, totalVertex, view.stride, remapBuffer);
                        bufferBlob.setNextAlignment(view.stride);
                        const newView = {
                            offset: bufferBlob.getLength(),
                            length: newBuffer.byteLength,
                            count: totalVertex,
                            stride: view.stride,
                        };
                        bundle.view = newView;
                        bufferBlob.addBuffer(newBuffer);
                    }
                }
            }
            // dump new index buffer
            bufferBlob.setNextAlignment(Uint32Array.BYTES_PER_ELEMENT);
            const newIndexView = {
                offset: bufferBlob.getLength(),
                length: newIndex.byteLength,
                count: indexCount,
                stride: Uint32Array.BYTES_PER_ELEMENT,
            };
            primitive.indexView = newIndexView;
            bufferBlob.addBuffer(newIndex);
        }
        else if (primitive.primitiveMode === cc_1.gfx.PrimitiveMode.POINT_LIST) {
            if (primitive.vertexBundelIndices.length === 1) {
                const bundle = struct.vertexBundles[primitive.vertexBundelIndices[0]];
                const view = bundle.view;
                const attributes = bundle.attributes;
                const posIndex = attributes.findIndex((attr) => attr.name === cc_1.gfx.AttributeName.ATTR_POSITION);
                const positionOffset = getOffset(attributes, posIndex);
                const vertexBuffer = new Uint8Array(mesh.data.buffer, view.offset, view.length);
                const target_vertex_count = Math.floor((view.count * target_ratio) / 3) * 3;
                let destBuffer = new Uint8Array(target_vertex_count * view.stride);
                const vertexCount = meshopt_encoder_1.default.optimizer.simplifyPoints(destBuffer, vertexBuffer.subarray(positionOffset), view.count, view.stride, target_vertex_count);
                destBuffer = new Uint8Array(destBuffer.buffer, 0, vertexCount * view.stride); // shrink buffer size
                bufferBlob.setNextAlignment(view.stride);
                const newView = {
                    offset: bufferBlob.getLength(),
                    length: destBuffer.byteLength,
                    count: vertexCount,
                    stride: view.stride,
                };
                bundle.view = newView;
                bufferBlob.addBuffer(destBuffer);
            }
            else if (primitive.vertexBundelIndices.length > 1) {
                console.warn(`Submesh ${i} has more than one vertex bundle, which is not supported.`);
                return mesh;
            }
        }
        else {
            // not supported, should just dump
            for (let j = 0; j < primitive.vertexBundelIndices.length; ++j) {
                const bundle = struct.vertexBundles[primitive.vertexBundelIndices[j]];
                const view = bundle.view;
                const buffer = new Uint8Array(mesh.data.buffer, view.offset, view.length);
                bufferBlob.setNextAlignment(view.stride);
                const newView = {
                    offset: bufferBlob.getLength(),
                    length: buffer.byteLength,
                    count: view.count,
                    stride: view.stride,
                };
                bundle.view = newView;
                bufferBlob.addBuffer(buffer);
            }
            if (primitive.indexView) {
                const view = primitive.indexView;
                const buffer = new Uint8Array(mesh.data.buffer, view.offset, view.length);
                bufferBlob.setNextAlignment(Uint32Array.BYTES_PER_ELEMENT);
                const newView = {
                    offset: bufferBlob.getLength(),
                    length: buffer.byteLength,
                    count: view.count,
                    stride: Uint32Array.BYTES_PER_ELEMENT,
                };
                primitive.indexView = newView;
                bufferBlob.addBuffer(buffer);
            }
        }
    }
    const newMesh = new cc_1.Mesh();
    newMesh.reset({
        struct,
        data: bufferBlob.getCombined(),
    });
    const hash = newMesh.hash;
    return newMesh;
}
async function compressMesh(mesh, options) {
    await tryInitMeshOpt();
    // 'mesh' and 'options' are not used in this function, so we can remove them
    if (!options) {
        console.warn('Mesh compression is not enabled, original mesh will be returned.');
        return mesh;
    }
    if (options?.quantize) {
        mesh = await quantizeMesh(mesh);
    }
    if (options?.encode) {
        mesh = await encodeMesh(mesh);
    }
    if (options?.compress) {
        mesh = await deflateMesh(mesh);
    }
    return mesh; // return the original mesh for now
}
async function encodeMesh(mesh) {
    await tryInitMeshOpt();
    if (mesh.struct.encoded) {
        return mesh;
    }
    const struct = JSON.parse(JSON.stringify(mesh.struct));
    const bufferBlob = new gltf_converter_1.BufferBlob();
    bufferBlob.setNextAlignment(0);
    for (const bundle of struct.vertexBundles) {
        const view = bundle.view;
        const buffer = new Uint8Array(mesh.data.buffer, view.offset, view.length);
        const bound = meshopt_encoder_1.default.optimizer.encodeVertexBufferBound(view.count, view.stride);
        let destBuffer = new Uint8Array(bound);
        const length = meshopt_encoder_1.default.optimizer.encodeVertexBuffer(destBuffer, bound, buffer, view.count, view.stride);
        destBuffer = new Uint8Array(destBuffer.buffer, 0, length);
        bufferBlob.setNextAlignment(view.stride);
        const newView = {
            offset: bufferBlob.getLength(),
            length: destBuffer.byteLength,
            count: view.count,
            stride: view.stride,
        };
        bundle.view = newView;
        bufferBlob.addBuffer(destBuffer);
    }
    for (const primitive of struct.primitives) {
        if (primitive.indexView === undefined) {
            continue;
        }
        const view = primitive.indexView;
        let buffer = new Uint8Array();
        // convert index to 32bit
        if (view.stride === 2) {
            const indexBuffer16 = new Uint16Array(mesh.data.buffer, view.offset, view.count);
            const indexBuffer32 = new Uint32Array(view.count * Uint32Array.BYTES_PER_ELEMENT);
            for (let j = 0; j < view.count; ++j) {
                indexBuffer32[j] = indexBuffer16[j];
            }
            buffer = new Uint8Array(indexBuffer32.buffer, 0, view.count * Uint32Array.BYTES_PER_ELEMENT);
        }
        else if (view.stride === 4) {
            buffer = new Uint8Array(mesh.data.buffer, view.offset, view.count * Uint32Array.BYTES_PER_ELEMENT);
        }
        const bound = meshopt_encoder_1.default.optimizer.encodeIndexBufferBound(view.count, view.count);
        let destBuffer = new Uint8Array(bound);
        const length = meshopt_encoder_1.default.optimizer.encodeIndexBuffer(destBuffer, bound, buffer, view.count);
        destBuffer = new Uint8Array(destBuffer.buffer, 0, length);
        bufferBlob.setNextAlignment(Uint32Array.BYTES_PER_ELEMENT);
        const newView = {
            offset: bufferBlob.getLength(),
            length: destBuffer.byteLength,
            count: view.count,
            stride: Uint32Array.BYTES_PER_ELEMENT,
        };
        primitive.indexView = newView;
        bufferBlob.addBuffer(destBuffer);
    }
    const newMesh = new cc_1.Mesh();
    newMesh.reset({
        struct,
        data: bufferBlob.getCombined(),
    });
    newMesh.struct.encoded = true;
    const hash = newMesh.hash;
    return newMesh;
}
const quantizeConfiguration = new Map([
    [cc_1.gfx.AttributeName.ATTR_POSITION, { enum: 0, size: 6, format: cc_1.gfx.Format.RGB16F, origin: cc_1.gfx.Format.RGB32F }], // 8 for position
    [cc_1.gfx.AttributeName.ATTR_NORMAL, { enum: 1, size: 6, format: cc_1.gfx.Format.RGB16F, origin: cc_1.gfx.Format.RGB32F }], // 4 for normal
    [cc_1.gfx.AttributeName.ATTR_TANGENT, { enum: 2, size: 8, format: cc_1.gfx.Format.RGBA16F, origin: cc_1.gfx.Format.RGBA32F }], // 4 for tangent
    [cc_1.gfx.AttributeName.ATTR_BITANGENT, { enum: 2, size: 8, format: cc_1.gfx.Format.RGBA16F, origin: cc_1.gfx.Format.RGBA32F }], // 4 for tangent
    [cc_1.gfx.AttributeName.ATTR_COLOR, { enum: 3, size: 4, format: cc_1.gfx.Format.RGBA8, origin: cc_1.gfx.Format.RGBA32F }], // 4 for color, 1b each channel
    [cc_1.gfx.AttributeName.ATTR_COLOR1, { enum: 3, size: 4, format: cc_1.gfx.Format.RGBA8, origin: cc_1.gfx.Format.RGBA32F }], // 4 for joints,
    [cc_1.gfx.AttributeName.ATTR_COLOR2, { enum: 3, size: 4, format: cc_1.gfx.Format.RGBA8, origin: cc_1.gfx.Format.RGBA32F }], // 4 for joints,
    [cc_1.gfx.AttributeName.ATTR_JOINTS, { enum: 4, size: 16, format: cc_1.gfx.Format.RGBA32F, origin: cc_1.gfx.Format.RGBA32F }], // 4 for joints,
    [cc_1.gfx.AttributeName.ATTR_WEIGHTS, { enum: 5, size: 16, format: cc_1.gfx.Format.RGBA32F, origin: cc_1.gfx.Format.RGBA32F }], // 4 for weights,
    [cc_1.gfx.AttributeName.ATTR_TEX_COORD, { enum: 6, size: 4, format: cc_1.gfx.Format.RG16F, origin: cc_1.gfx.Format.RG32F }], // 4 for uv, 2b each channel
    [cc_1.gfx.AttributeName.ATTR_TEX_COORD1, { enum: 6, size: 4, format: cc_1.gfx.Format.RG16F, origin: cc_1.gfx.Format.RG32F }], // 4 for uv1, 2b each channel
    [cc_1.gfx.AttributeName.ATTR_TEX_COORD2, { enum: 6, size: 4, format: cc_1.gfx.Format.RG16F, origin: cc_1.gfx.Format.RG32F }], // 4 for uv2, 2b each channel
    [cc_1.gfx.AttributeName.ATTR_TEX_COORD3, { enum: 6, size: 4, format: cc_1.gfx.Format.RG16F, origin: cc_1.gfx.Format.RG32F }], // 4 for uv3, 2b each channel
    [cc_1.gfx.AttributeName.ATTR_TEX_COORD4, { enum: 6, size: 4, format: cc_1.gfx.Format.RG16F, origin: cc_1.gfx.Format.RG32F }], // 4 for uv4, 2b each channel
    [cc_1.gfx.AttributeName.ATTR_TEX_COORD5, { enum: 6, size: 4, format: cc_1.gfx.Format.RG16F, origin: cc_1.gfx.Format.RG32F }], // 4 for uv5, 2b each channel
    [cc_1.gfx.AttributeName.ATTR_TEX_COORD6, { enum: 6, size: 4, format: cc_1.gfx.Format.RG16F, origin: cc_1.gfx.Format.RG32F }], // 4 for uv6, 2b each channel
    [cc_1.gfx.AttributeName.ATTR_TEX_COORD7, { enum: 6, size: 4, format: cc_1.gfx.Format.RG16F, origin: cc_1.gfx.Format.RG32F }], // 4 for uv7, 2b each channel
    [cc_1.gfx.AttributeName.ATTR_TEX_COORD8, { enum: 6, size: 4, format: cc_1.gfx.Format.RG16F, origin: cc_1.gfx.Format.RG32F }], // 4 for uv8, 2b each channel
    [cc_1.gfx.AttributeName.ATTR_BATCH_ID, { enum: 7, size: 4, format: cc_1.gfx.Format.R32F, origin: cc_1.gfx.Format.R32F }], // 4 for batch id
    [cc_1.gfx.AttributeName.ATTR_BATCH_UV, { enum: 8, size: 8, format: cc_1.gfx.Format.RG32F, origin: cc_1.gfx.Format.RG32F }], // 4 for batch uv
]);
function quantizeSize(attributes) {
    let size = 0;
    for (let i = 0; i < attributes.length; ++i) {
        const attribute = attributes[i];
        const name = attribute.name;
        const conf = quantizeConfiguration.get(name);
        if (conf !== undefined) {
            size += conf.size;
            if (conf.origin !== attribute.format) {
                console.warn(`Attribute ${name} has different format from origin, quantization may not work.`);
                return undefined;
            }
            attribute.format = conf.format;
        }
        else {
            console.log(`Attribute ${name} is not supported for quantization.`);
            return undefined;
        }
    }
    return size;
}
function mapAttribute(attributes) {
    return attributes.map((attribute) => {
        const name = attribute.name;
        const conf = quantizeConfiguration.get(name);
        if (conf === undefined) {
            console.error(`Attribute ${name} is not supported for quantization.`);
        }
        return conf.enum;
    });
}
async function quantizeMesh(mesh) {
    if (mesh.struct.quantized) {
        return mesh;
    }
    const bufferBlob = new gltf_converter_1.BufferBlob();
    bufferBlob.setNextAlignment(0);
    const struct = JSON.parse(JSON.stringify(mesh.struct));
    for (let i = 0; i < struct.vertexBundles.length; ++i) {
        const bundle = struct.vertexBundles[i];
        const view = bundle.view;
        const attributes = JSON.parse(JSON.stringify(bundle.attributes));
        const quantizedSize = quantizeSize(attributes);
        if (!quantizedSize) {
            return mesh;
        }
        const vertexBuffer = new Uint8Array(mesh.data.buffer, view.offset, view.length);
        const attrEnums = mapAttribute(attributes);
        const newBuffer = new Uint8Array(quantizedSize * view.count);
        meshopt_encoder_1.default.optimizer.quantizeMesh(newBuffer, newBuffer.byteLength, vertexBuffer, view.count, view.stride, Uint32Array.from(attrEnums), attrEnums.length);
        bufferBlob.setNextAlignment(quantizedSize);
        const newView = {
            offset: bufferBlob.getLength(),
            length: newBuffer.byteLength,
            count: view.count,
            stride: quantizedSize,
        };
        bundle.view = newView;
        bundle.attributes = attributes;
        bufferBlob.addBuffer(newBuffer);
    }
    // dump index buffer
    for (let i = 0; i < struct.primitives.length; ++i) {
        const primitive = struct.primitives[i];
        if (primitive.indexView === undefined) {
            continue;
        }
        const view = primitive.indexView;
        const buffer = new Uint8Array(mesh.data.buffer, view.offset, view.length);
        bufferBlob.setNextAlignment(view.stride);
        const newView = {
            offset: bufferBlob.getLength(),
            length: buffer.byteLength,
            count: view.count,
            stride: view.stride,
        };
        primitive.indexView = newView;
        bufferBlob.addBuffer(buffer);
    }
    const newMesh = new cc_1.Mesh();
    newMesh.reset({
        struct,
        data: bufferBlob.getCombined(),
    });
    newMesh.struct.quantized = true;
    const hash = newMesh.hash;
    return newMesh;
}
async function deflateMesh(mesh) {
    if (mesh.struct.compressed) {
        return mesh;
    }
    function compress(buffer) {
        const compressed = zlib_1.default.deflateSync(buffer);
        return compressed;
    }
    const data = compress(mesh.data);
    const struct = JSON.parse(JSON.stringify(mesh.struct));
    struct.compressed = true;
    const newMesh = new cc_1.Mesh();
    newMesh.reset({
        struct,
        data,
    });
    const hash = newMesh.hash;
    return newMesh;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzaE9wdGltaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy9nbHRmL21lc2hPcHRpbWl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUErQkEsb0NBaU1DO0FBTUQsd0NBNExDO0FBRUQsOERBT0M7QUFFRCxvQ0FpUEM7QUFFRCxvQ0FzQkM7QUFFRCxnQ0FzRkM7QUFpRUQsb0NBdUVDO0FBRUQsa0NBdUJDO0FBLzZCRCwyQkFBK0I7QUFDL0Isc0VBQXNDO0FBR3RDLGdEQUF3QjtBQUN4Qiw0REFBcUQ7QUFFckQsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBRW5CLEtBQUssVUFBVSxjQUFjO0lBQ3pCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNWLE9BQU8seUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNwQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztTQUFNLENBQUM7UUFDSixPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM3QixDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLFVBQTJCLEVBQUUsY0FBc0I7SUFDbEUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3RDLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxNQUFNLElBQUksUUFBRyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3JELENBQUM7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SSxDQUFDLFFBQUcsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxRQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLGVBQWU7SUFDNUgsQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxnQkFBZ0I7SUFDaEksQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxnQkFBZ0I7SUFDbEksQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSwrQkFBK0I7SUFDM0ksQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxnQkFBZ0I7SUFDN0gsQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxnQkFBZ0I7SUFDN0gsQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxnQkFBZ0I7SUFDaEksQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxpQkFBaUI7SUFDbEksQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSw0QkFBNEI7SUFDMUksQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSw2QkFBNkI7SUFDNUksQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSw2QkFBNkI7SUFDNUksQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSw2QkFBNkI7SUFDNUksQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSw2QkFBNkI7SUFDNUksQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSw2QkFBNkI7SUFDNUksQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSw2QkFBNkI7SUFDNUksQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSw2QkFBNkI7SUFDNUksQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSw2QkFBNkI7SUFDNUksQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxpQkFBaUI7SUFDNUgsQ0FBQyxRQUFHLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsUUFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxpQkFBaUI7Q0FDakksQ0FBQyxDQUFDO0FBRUgsU0FBUyxZQUFZLENBQUMsVUFBMkI7SUFDN0MsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBRWIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN6QyxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztRQUM1QixNQUFNLElBQUksR0FBRyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDckIsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDbEIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksK0RBQStELENBQUMsQ0FBQztnQkFDL0YsT0FBTyxTQUFTLENBQUM7WUFDckIsQ0FBQztZQUNELFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNuQyxDQUFDO2FBQU0sQ0FBQztZQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLHFDQUFxQyxDQUFDLENBQUM7WUFDcEUsT0FBTyxTQUFTLENBQUM7UUFDckIsQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsVUFBMkI7SUFDN0MsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUU7UUFDaEMsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztRQUM1QixNQUFNLElBQUksR0FBRyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDckIsT0FBTyxDQUFDLEtBQUssQ0FBQyxhQUFhLElBQUkscUNBQXFDLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBQ0QsT0FBTyxJQUFLLENBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVNLEtBQUssVUFBVSxZQUFZLENBQUMsSUFBVTtJQUN6QyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDeEIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUNELE1BQU0sVUFBVSxHQUFHLElBQUksMkJBQVUsRUFBRSxDQUFDO0lBQ3BDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUvQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFpQixDQUFDO0lBRXZFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ25ELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN6QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFvQixDQUFDO1FBQ3BGLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDakIsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELE1BQU0sWUFBWSxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWhGLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzQyxNQUFNLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdELHlCQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FDMUIsU0FBbUMsRUFDbkMsU0FBUyxDQUFDLFVBQVUsRUFDcEIsWUFBc0MsRUFDdEMsSUFBSSxDQUFDLEtBQUssRUFDVixJQUFJLENBQUMsTUFBTSxFQUNYLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUEyQixFQUNyRCxTQUFTLENBQUMsTUFBTSxDQUNuQixDQUFDO1FBQ0YsVUFBVSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzNDLE1BQU0sT0FBTyxHQUFxQjtZQUM5QixNQUFNLEVBQUUsVUFBVSxDQUFDLFNBQVMsRUFBRTtZQUM5QixNQUFNLEVBQUUsU0FBUyxDQUFDLFVBQVU7WUFDNUIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLE1BQU0sRUFBRSxhQUFhO1NBQ3hCLENBQUM7UUFDRixNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUN0QixNQUFNLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUMvQixVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxvQkFBb0I7SUFDcEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDaEQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QyxJQUFJLFNBQVMsQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDcEMsU0FBUztRQUNiLENBQUM7UUFDRCxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFFLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekMsTUFBTSxPQUFPLEdBQXFCO1lBQzlCLE1BQU0sRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFO1lBQzlCLE1BQU0sRUFBRSxNQUFNLENBQUMsVUFBVTtZQUN6QixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1NBQ3RCLENBQUM7UUFDRixTQUFTLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztRQUM5QixVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLFNBQUksRUFBRSxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDVixNQUFNO1FBQ04sSUFBSSxFQUFFLFVBQVUsQ0FBQyxXQUFXLEVBQUU7S0FDakMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ2hDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFFMUIsT0FBTyxPQUFPLENBQUM7QUFDbkIsQ0FBQztBQUVNLEtBQUssVUFBVSxXQUFXLENBQUMsSUFBVTtJQUN4QyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDekIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFNBQVMsUUFBUSxDQUFDLE1BQWtCO1FBQ2hDLE1BQU0sVUFBVSxHQUFHLGNBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUMsT0FBTyxVQUF3QixDQUFDO0lBQ3BDLENBQUM7SUFFRCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUV2RCxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUV6QixNQUFNLE9BQU8sR0FBRyxJQUFJLFNBQUksRUFBRSxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDVixNQUFNO1FBQ04sSUFBSTtLQUNQLENBQUMsQ0FBQztJQUNILE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFFMUIsT0FBTyxPQUFPLENBQUM7QUFDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lc2gsIGdmeCB9IGZyb20gJ2NjJztcclxuaW1wb3J0IGVuY29kZXIgZnJvbSAnbWVzaG9wdF9lbmNvZGVyJztcclxuaW1wb3J0IHsgTWVzaENvbXByZXNzT3B0aW9ucywgTWVzaE9wdGltaXplT3B0aW9ucywgTWVzaFNpbXBsaWZ5T3B0aW9ucywgTWVzaENsdXN0ZXJPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3VzZXJEYXRhcyc7XHJcbmltcG9ydCB7IG1lcmdlTWVzaGVzIH0gZnJvbSAnLi9tZXNoVXRpbHMnO1xyXG5pbXBvcnQgemxpYiBmcm9tICd6bGliJztcclxuaW1wb3J0IHsgQnVmZmVyQmxvYiB9IGZyb20gJy4uL3V0aWxzL2dsdGYtY29udmVydGVyJztcclxuXHJcbmxldCBpbml0ZWQgPSBmYWxzZTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHRyeUluaXRNZXNoT3B0KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgaWYgKCFpbml0ZWQpIHtcclxuICAgICAgICByZXR1cm4gZW5jb2Rlci5pbml0KCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdNZXNoT3B0IGluaXQgc3VjY2VzcycpO1xyXG4gICAgICAgICAgICBpbml0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE9mZnNldChhdHRyaWJ1dGVzOiBnZnguQXR0cmlidXRlW10sIGF0dHJpYnV0ZUluZGV4OiBudW1iZXIpIHtcclxuICAgIGxldCByZXN1bHQgPSAwO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRyaWJ1dGVJbmRleDsgKytpKSB7XHJcbiAgICAgICAgY29uc3QgYXR0cmlidXRlID0gYXR0cmlidXRlc1tpXTtcclxuICAgICAgICByZXN1bHQgKz0gZ2Z4LkZvcm1hdEluZm9zW2F0dHJpYnV0ZS5mb3JtYXRdLnNpemU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5jb25zdCBvdmVyZHJhd1RocmVzaG9sZCA9IDMuMDtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcHRpbWl6ZU1lc2gobWVzaDogTWVzaCwgb3B0aW9ucz86IE1lc2hPcHRpbWl6ZU9wdGlvbnMpOiBQcm9taXNlPE1lc2g+IHtcclxuICAgIGF3YWl0IHRyeUluaXRNZXNoT3B0KCk7XHJcblxyXG4gICAgaWYgKCFvcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIG1lc2g7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCEob3B0aW9ucy5vdmVyZHJhdyB8fCBvcHRpb25zLnZlcnRleENhY2hlIHx8IG9wdGlvbnMudmVydGV4RmV0Y2gpKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdObyBvcHRpbWl6YXRpb24gb3B0aW9uIGlzIGVuYWJsZWQsIHJldHVybiB0aGUgb3JpZ2luYWwgbWVzaCcpO1xyXG4gICAgICAgIHJldHVybiBtZXNoO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJ1ZmZlckJsb2IgPSBuZXcgQnVmZmVyQmxvYigpO1xyXG4gICAgYnVmZmVyQmxvYi5zZXROZXh0QWxpZ25tZW50KDApO1xyXG5cclxuICAgIGNvbnN0IHN0cnVjdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobWVzaC5zdHJ1Y3QpKSBhcyBNZXNoLklTdHJ1Y3Q7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJ1Y3QucHJpbWl0aXZlcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIGNvbnN0IHByaW1pdGl2ZSA9IHN0cnVjdC5wcmltaXRpdmVzW2ldO1xyXG4gICAgICAgIGlmIChwcmltaXRpdmUucHJpbWl0aXZlTW9kZSA9PT0gZ2Z4LlByaW1pdGl2ZU1vZGUuUE9JTlRfTElTVCB8fCBwcmltaXRpdmUuaW5kZXhWaWV3ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdPbmx5IHRyaWFuZ2xlIGxpc3QgaXMgc3VwcG9ydGVkLicpO1xyXG4gICAgICAgICAgICAvLyBubyBuZWVkIHRvIG9wdGltaXplIHBvaW50IGxpc3QsIG9yIHVuLWluZGV4ZWQgbWVzaCwganVzdCBkdW1wXHJcbiAgICAgICAgICAgIC8vICogZ2VuZXJhdGUgaW5kZXggYnVmZmVyIGZvciB1bi1pbmRleGVkIG1lc2gsIG1heWJlIGxhdGVyXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcHJpbWl0aXZlLnZlcnRleEJ1bmRlbEluZGljZXMubGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1bmRsZSA9IHN0cnVjdC52ZXJ0ZXhCdW5kbGVzW3ByaW1pdGl2ZS52ZXJ0ZXhCdW5kZWxJbmRpY2VzW2pdXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZpZXcgPSBidW5kbGUudmlldztcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG1lc2guZGF0YS5idWZmZXIsIHZpZXcub2Zmc2V0LCB2aWV3Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBidWZmZXJCbG9iLnNldE5leHRBbGlnbm1lbnQodmlldy5zdHJpZGUpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VmlldzogTWVzaC5JQnVmZmVyVmlldyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IGJ1ZmZlckJsb2IuZ2V0TGVuZ3RoKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBidWZmZXIuYnl0ZUxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogdmlldy5jb3VudCxcclxuICAgICAgICAgICAgICAgICAgICBzdHJpZGU6IHZpZXcuc3RyaWRlLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGJ1bmRsZS52aWV3ID0gbmV3VmlldztcclxuICAgICAgICAgICAgICAgIGJ1ZmZlckJsb2IuYWRkQnVmZmVyKGJ1ZmZlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBmaW5kIHZlcnRleCBidW5kbGUgd2l0aCBwb3NpdGlvbiBhdHRyaWJ1dGVcclxuICAgICAgICBjb25zdCBpbmRleFZpZXcgPSBwcmltaXRpdmUuaW5kZXhWaWV3O1xyXG4gICAgICAgIGNvbnN0IHZlcnRleENvdW50ID0gc3RydWN0LnZlcnRleEJ1bmRsZXNbcHJpbWl0aXZlLnZlcnRleEJ1bmRlbEluZGljZXNbMF1dLnZpZXcuY291bnQ7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld0luZGV4ID0gbmV3IFVpbnQ4QXJyYXkoaW5kZXhWaWV3LmNvdW50ICogVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpO1xyXG4gICAgICAgIC8vIGNvbnZlcnQgaW5kZXggdG8gMzJiaXRcclxuICAgICAgICBpZiAoaW5kZXhWaWV3LnN0cmlkZSA9PT0gMikge1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleEJ1ZmZlcjE2ID0gbmV3IFVpbnQxNkFycmF5KG1lc2guZGF0YS5idWZmZXIsIGluZGV4Vmlldy5vZmZzZXQsIGluZGV4Vmlldy5jb3VudCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4QnVmZmVyMzIgPSBuZXcgVWludDMyQXJyYXkobmV3SW5kZXguYnVmZmVyLCAwLCBpbmRleFZpZXcuY291bnQpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGluZGV4Vmlldy5jb3VudDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleEJ1ZmZlcjMyW2pdID0gaW5kZXhCdWZmZXIxNltqXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoaW5kZXhWaWV3LnN0cmlkZSA9PT0gNCkge1xyXG4gICAgICAgICAgICBuZXdJbmRleC5zZXQobmV3IFVpbnQ4QXJyYXkobWVzaC5kYXRhLmJ1ZmZlciwgaW5kZXhWaWV3Lm9mZnNldCwgaW5kZXhWaWV3LmNvdW50ICogVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLnZlcnRleENhY2hlKSB7XHJcbiAgICAgICAgICAgIGVuY29kZXIub3B0aW1pemVyLm9wdGltaXplVmVydGV4Q2FjaGUoXHJcbiAgICAgICAgICAgICAgICBuZXdJbmRleCBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyLFxyXG4gICAgICAgICAgICAgICAgbmV3SW5kZXggYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgICAgIGluZGV4Vmlldy5jb3VudCxcclxuICAgICAgICAgICAgICAgIHZlcnRleENvdW50LFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMub3ZlcmRyYXcpIHtcclxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb25CdW5kbGVJbmRleCA9IHByaW1pdGl2ZS52ZXJ0ZXhCdW5kZWxJbmRpY2VzLmZpbmRJbmRleCgoYnVuZGxlSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1bmRsZSA9IHN0cnVjdC52ZXJ0ZXhCdW5kbGVzW2J1bmRsZUluZGV4XTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBidW5kbGUuYXR0cmlidXRlcztcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBvc0luZGV4ID0gYXR0cmlidXRlcy5maW5kSW5kZXgoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9QT1NJVElPTik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcG9zSW5kZXggPj0gMDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChwb3NpdGlvbkJ1bmRsZUluZGV4IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdObyBwb3NpdGlvbiBhdHRyaWJ1dGUgZm91bmQsIG92ZXJkcmF3IG9wdGltaXphdGlvbiBpcyBub3Qgc3VwcG9ydGVkLicpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYnVuZGxlID0gc3RydWN0LnZlcnRleEJ1bmRsZXNbcHJpbWl0aXZlLnZlcnRleEJ1bmRlbEluZGljZXNbcG9zaXRpb25CdW5kbGVJbmRleF1dO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmlldyA9IGJ1bmRsZS52aWV3O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IGJ1bmRsZS5hdHRyaWJ1dGVzO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcG9zSW5kZXggPSBhdHRyaWJ1dGVzLmZpbmRJbmRleCgoYXR0cikgPT4gYXR0ci5uYW1lID09PSBnZnguQXR0cmlidXRlTmFtZS5BVFRSX1BPU0lUSU9OKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uT2Zmc2V0ID0gZ2V0T2Zmc2V0KGF0dHJpYnV0ZXMsIHBvc0luZGV4KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZlcnRleEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG1lc2guZGF0YS5idWZmZXIsIHZpZXcub2Zmc2V0LCB2aWV3Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBlbmNvZGVyLm9wdGltaXplci5vcHRpbWl6ZU92ZXJkcmF3KFxyXG4gICAgICAgICAgICAgICAgICAgIG5ld0luZGV4IGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3SW5kZXggYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgICAgICAgICBpbmRleFZpZXcuY291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdmVydGV4QnVmZmVyLnN1YmFycmF5KHBvc2l0aW9uT2Zmc2V0KSBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIHZlcnRleENvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHZpZXcuc3RyaWRlLFxyXG4gICAgICAgICAgICAgICAgICAgIG92ZXJkcmF3VGhyZXNob2xkLFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbmVlZE9wdGltaXplRmV0Y2ggPSBvcHRpb25zLnZlcnRleENhY2hlIHx8IG9wdGlvbnMub3ZlcmRyYXcgfHwgb3B0aW9ucy52ZXJ0ZXhGZXRjaDtcclxuXHJcbiAgICAgICAgaWYgKCFuZWVkT3B0aW1pemVGZXRjaCkge1xyXG4gICAgICAgICAgICBpZiAocHJpbWl0aXZlLnZlcnRleEJ1bmRlbEluZGljZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBzaW1wbGUgb3B0aW1pemF0aW9uXHJcbiAgICAgICAgICAgICAgICBjb25zdCBidW5kbGUgPSBzdHJ1Y3QudmVydGV4QnVuZGxlc1twcmltaXRpdmUudmVydGV4QnVuZGVsSW5kaWNlc1swXV07XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2aWV3ID0gYnVuZGxlLnZpZXc7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2ZXJ0ZXhCdWZmZXIgPSBuZXcgVWludDhBcnJheShtZXNoLmRhdGEuYnVmZmVyLCB2aWV3Lm9mZnNldCwgdmlldy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkodmlldy5jb3VudCAqIHZpZXcuc3RyaWRlKTtcclxuICAgICAgICAgICAgICAgIGVuY29kZXIub3B0aW1pemVyLm9wdGltaXplVmVydGV4RmV0Y2goXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3QnVmZmVyIGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3SW5kZXggYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgICAgICAgICBpbmRleFZpZXcuY291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdmVydGV4QnVmZmVyIGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgdmlldy5jb3VudCxcclxuICAgICAgICAgICAgICAgICAgICB2aWV3LnN0cmlkZSxcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBidWZmZXJCbG9iLnNldE5leHRBbGlnbm1lbnQodmlldy5zdHJpZGUpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VmlldzogTWVzaC5JQnVmZmVyVmlldyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IGJ1ZmZlckJsb2IuZ2V0TGVuZ3RoKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBuZXdCdWZmZXIuYnl0ZUxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogdmlldy5jb3VudCxcclxuICAgICAgICAgICAgICAgICAgICBzdHJpZGU6IHZpZXcuc3RyaWRlLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGJ1bmRsZS52aWV3ID0gbmV3VmlldztcclxuICAgICAgICAgICAgICAgIGJ1ZmZlckJsb2IuYWRkQnVmZmVyKG5ld0J1ZmZlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJpbWl0aXZlLnZlcnRleEJ1bmRlbEluZGljZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVtYXBCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoaW5kZXhWaWV3LmNvdW50ICogVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdG90YWxWZXJ0ZXggPSBlbmNvZGVyLm9wdGltaXplci5vcHRpbWl6ZVZlcnRleEZldGNoUmVtYXAoXHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYXBCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3SW5kZXggYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgICAgICAgICBpbmRleFZpZXcuY291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdmVydGV4Q291bnQsXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgZW5jb2Rlci5vcHRpbWl6ZXIub3B0aW1pemVSZW1hcEluZGV4KFxyXG4gICAgICAgICAgICAgICAgICAgIG5ld0luZGV4IGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3SW5kZXggYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgICAgICAgICBpbmRleFZpZXcuY291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYXBCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBwcmltaXRpdmUudmVydGV4QnVuZGVsSW5kaWNlcy5sZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1bmRsZSA9IHN0cnVjdC52ZXJ0ZXhCdW5kbGVzW3ByaW1pdGl2ZS52ZXJ0ZXhCdW5kZWxJbmRpY2VzW2pdXTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB2aWV3ID0gYnVuZGxlLnZpZXc7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkobWVzaC5kYXRhLmJ1ZmZlciwgdmlldy5vZmZzZXQsIHZpZXcubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdCdWZmZXIgPSBuZXcgVWludDhBcnJheSh0b3RhbFZlcnRleCAqIHZpZXcuc3RyaWRlKTtcclxuICAgICAgICAgICAgICAgICAgICBlbmNvZGVyLm9wdGltaXplci5vcHRpbWl6ZVJlbWFwVmVydGV4KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdCdWZmZXIgYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyIGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsVmVydGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3LnN0cmlkZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtYXBCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICBidWZmZXJCbG9iLnNldE5leHRBbGlnbm1lbnQodmlldy5zdHJpZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1ZpZXc6IE1lc2guSUJ1ZmZlclZpZXcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogYnVmZmVyQmxvYi5nZXRMZW5ndGgoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBuZXdCdWZmZXIuYnl0ZUxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IHRvdGFsVmVydGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpZGU6IHZpZXcuc3RyaWRlLFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgYnVuZGxlLnZpZXcgPSBuZXdWaWV3O1xyXG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlckJsb2IuYWRkQnVmZmVyKG5ld0J1ZmZlcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBkdW1wIHZlcnRleCBidWZmZXIsIGxlYXZlIHVuLW9wdGltaXplZFxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHByaW1pdGl2ZS52ZXJ0ZXhCdW5kZWxJbmRpY2VzLmxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBidW5kbGUgPSBzdHJ1Y3QudmVydGV4QnVuZGxlc1twcmltaXRpdmUudmVydGV4QnVuZGVsSW5kaWNlc1tqXV07XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2aWV3ID0gYnVuZGxlLnZpZXc7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBidWZmZXIgPSBuZXcgVWludDhBcnJheShtZXNoLmRhdGEuYnVmZmVyLCB2aWV3Lm9mZnNldCwgdmlldy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgYnVmZmVyQmxvYi5zZXROZXh0QWxpZ25tZW50KHZpZXcuc3RyaWRlKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1ZpZXc6IE1lc2guSUJ1ZmZlclZpZXcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiBidWZmZXJCbG9iLmdldExlbmd0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogYnVmZmVyLmJ5dGVMZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IHZpZXcuY291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RyaWRlOiB2aWV3LnN0cmlkZSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBidW5kbGUudmlldyA9IG5ld1ZpZXc7XHJcbiAgICAgICAgICAgICAgICBidWZmZXJCbG9iLmFkZEJ1ZmZlcihidWZmZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBidWZmZXJCbG9iLnNldE5leHRBbGlnbm1lbnQoVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpO1xyXG4gICAgICAgIGNvbnN0IG5ld0luZGV4VmlldzogTWVzaC5JQnVmZmVyVmlldyA9IHtcclxuICAgICAgICAgICAgb2Zmc2V0OiBidWZmZXJCbG9iLmdldExlbmd0aCgpLFxyXG4gICAgICAgICAgICBsZW5ndGg6IG5ld0luZGV4LmJ5dGVMZW5ndGgsXHJcbiAgICAgICAgICAgIGNvdW50OiBpbmRleFZpZXcuY291bnQsXHJcbiAgICAgICAgICAgIHN0cmlkZTogVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBwcmltaXRpdmUuaW5kZXhWaWV3ID0gbmV3SW5kZXhWaWV3O1xyXG4gICAgICAgIGJ1ZmZlckJsb2IuYWRkQnVmZmVyKG5ld0luZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuZXdNZXNoID0gbmV3IE1lc2goKTtcclxuICAgIG5ld01lc2gucmVzZXQoe1xyXG4gICAgICAgIHN0cnVjdCxcclxuICAgICAgICBkYXRhOiBidWZmZXJCbG9iLmdldENvbWJpbmVkKCksXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGhhc2ggPSBuZXdNZXNoLmhhc2g7XHJcblxyXG4gICAgcmV0dXJuIG5ld01lc2g7XHJcbn1cclxuXHJcbmNvbnN0IG1heFRyaWFuZ2xlQ291bnQgPSAxMjQ7IC8vIG52aWRpYSByZWNvbW1lbmRzIDEyNiwgcm91bmRlZCBkb3duIHRvIGEgbXVsdGlwbGUgb2YgNFxyXG5jb25zdCBtYXhWZXJ0ZXhDb3VudCA9IDY0OyAvLyBudmlkaWEgcmVjb21tZW5kcyA2NFxyXG5jb25zdCBjb25lV2VpZ2h0ID0gMC41OyAvLyBzaG91bGQgYmUgMCB1bmxlc3MgY29uZSBjdWxsaW5nIGlzIHVzZWQgZHVyaW5nIHJ1bnRpbWVcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbHVzdGVyaXplTWVzaChtZXNoOiBNZXNoLCBvcHRpb25zPzogTWVzaENsdXN0ZXJPcHRpb25zKTogUHJvbWlzZTxNZXNoPiB7XHJcbiAgICBhd2FpdCB0cnlJbml0TWVzaE9wdCgpO1xyXG5cclxuICAgIGlmICghb3B0aW9ucykge1xyXG4gICAgICAgIHJldHVybiBtZXNoO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICdtZXNoJyBhbmQgJ29wdGlvbnMnIGFyZSBub3QgdXNlZCBpbiB0aGlzIGZ1bmN0aW9uLCBzbyB3ZSBjYW4gcmVtb3ZlIHRoZW1cclxuICAgIGNvbnN0IHN0cnVjdCA9IG1lc2guc3RydWN0O1xyXG4gICAgY29uc3QgcHJpbWl0aXZlcyA9IG1lc2guc3RydWN0LnByaW1pdGl2ZXM7XHJcbiAgICBjb25zdCB2ZXJ0ZXhCdW5kbGVzID0gbWVzaC5zdHJ1Y3QudmVydGV4QnVuZGxlcztcclxuICAgIGNvbnN0IG1lc2hsZXRzOiBVaW50OEFycmF5W10gPSBbXTtcclxuICAgIGNvbnN0IG1lc2hsZXRWZXJ0aWNlczogVWludDhBcnJheVtdID0gW107XHJcbiAgICBjb25zdCBtZXNobGV0VHJpYW5nbGVzOiBVaW50OEFycmF5W10gPSBbXTtcclxuXHJcbiAgICBsZXQgbWVzaGxldHNPZmZzZXQgPSAwO1xyXG4gICAgbGV0IG1lc2hsZXRWZXJ0aWNlc09mZnNldCA9IDA7XHJcbiAgICBsZXQgbWVzaGxldFRyaWFuZ2xlc09mZnNldCA9IDA7XHJcblxyXG4gICAgcHJpbWl0aXZlcy5mb3JFYWNoKChwcmltaXRpdmUsIGlkeCkgPT4ge1xyXG4gICAgICAgIGlmICghcHJpbWl0aXZlLmluZGV4Vmlldykge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFN1Ym1lc2ggJHtpZHh9IGhhcyBubyBpbmRleCBidWZmZXIsIG1lc2hsZXQgb3B0aW1pemF0aW9uIGlzIG5vdCBzdXBwb3J0ZWQuYCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwcmltaXRpdmUudmVydGV4QnVuZGVsSW5kaWNlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgLy8gZXN0aW1hdGVzIG1lc2hsZXQgY291bnRcclxuICAgICAgICAgICAgY29uc3QgaW5kZXhWaWV3ID0gcHJpbWl0aXZlLmluZGV4VmlldztcclxuICAgICAgICAgICAgY29uc3QgaW5kZXhDb3VudCA9IGluZGV4Vmlldy5jb3VudDtcclxuICAgICAgICAgICAgY29uc3QgdmVydGV4VmlldyA9IHZlcnRleEJ1bmRsZXNbcHJpbWl0aXZlLnZlcnRleEJ1bmRlbEluZGljZXNbMF1dLnZpZXc7XHJcbiAgICAgICAgICAgIGNvbnN0IHZlcnRleENvdW50ID0gdmVydGV4Vmlldy5jb3VudDtcclxuICAgICAgICAgICAgY29uc3QgbWF4TWVzaGxldENvdW50ID0gZW5jb2Rlci5vcHRpbWl6ZXIuYnVpbGRNZXNoTGV0c0JvdW5kKGluZGV4Q291bnQsIG1heFZlcnRleENvdW50LCBtYXhUcmlhbmdsZUNvdW50KTtcclxuICAgICAgICAgICAgLy8gYWxsb2NhdGVzIG1lc2hsZXQgYnVmZmVyLCB0aGUgdHlwZSBpcyBlbmNvZGVyLk1lc2hsZXRcclxuICAgICAgICAgICAgY29uc3QgbWVzaGxldF9kYXRhID0gbmV3IFVpbnQ4QXJyYXkobWF4TWVzaGxldENvdW50ICogVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQgKiA0IC8qIDQgYXJndW1lbnRzICovKTtcclxuICAgICAgICAgICAgY29uc3QgbWVzaGxldF92ZXJ0aWNlcyA9IG5ldyBVaW50OEFycmF5KG1heE1lc2hsZXRDb3VudCAqIG1heFZlcnRleENvdW50ICogVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpO1xyXG4gICAgICAgICAgICBjb25zdCBtZXNobGV0X3RyaWFuZ2xlcyA9IG5ldyBVaW50OEFycmF5KFxyXG4gICAgICAgICAgICAgICAgbWF4TWVzaGxldENvdW50ICogbWF4VHJpYW5nbGVDb3VudCAqIFVpbnQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UICogMyAvKiB0cmlhbmdsZXMgKi8sXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIC8vIHNjYW4gbWVzaGxldFxyXG4gICAgICAgICAgICBjb25zdCBhdHRycyA9IHZlcnRleEJ1bmRsZXNbcHJpbWl0aXZlLnZlcnRleEJ1bmRlbEluZGljZXNbMF1dLmF0dHJpYnV0ZXM7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4T2ZQb3NpdGlvbiA9IGF0dHJzLmZpbmRJbmRleCgoYXR0cikgPT4gYXR0ci5uYW1lID09PSBnZnguQXR0cmlidXRlTmFtZS5BVFRSX1BPU0lUSU9OKTtcclxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb25PZmZzZXQgPSBnZXRPZmZzZXQoYXR0cnMsIGluZGV4T2ZQb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGNvbnN0IHZlcnRleEJ1ZmZlckF0UG9zID0gbmV3IFVpbnQ4QXJyYXkoXHJcbiAgICAgICAgICAgICAgICBtZXNoLmRhdGEuYnVmZmVyLFxyXG4gICAgICAgICAgICAgICAgdmVydGV4Vmlldy5vZmZzZXQgKyBwb3NpdGlvbk9mZnNldCxcclxuICAgICAgICAgICAgICAgIHZlcnRleFZpZXcubGVuZ3RoIC0gcG9zaXRpb25PZmZzZXQsXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBsZXQgbWVzaGxldENvdW50ID0gMDtcclxuICAgICAgICAgICAgaWYgKGluZGV4Vmlldy5zdHJpZGUgPT09IDQpIHtcclxuICAgICAgICAgICAgICAgIC8vISEgc3VwcG9ydCAzMmJpdCBpbmRleFxyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXhCdWZmZXIzMiA9IG5ldyBVaW50MzJBcnJheShtZXNoLmRhdGEuYnVmZmVyLCBpbmRleFZpZXcub2Zmc2V0LCBpbmRleENvdW50KTtcclxuICAgICAgICAgICAgICAgIC8vIG1lc2hsZXRDb3VudCA9IGVuY29kZXIub3B0aW1pemVyLmJ1aWxkTWVzaExldHNTY2FuKG1lc2hsZXRfZGF0YSwgbWVzaGxldF92ZXJ0aWNlcywgbWVzaGxldF90cmlhbmdsZXMsIGluZGV4QnVmZmVyMzIsIGluZGV4Q291bnQsIHZlcnRleENvdW50LCBtYXhWZXJ0ZXhDb3VudCwgbWF4VHJpYW5nbGVDb3VudCk7XHJcbiAgICAgICAgICAgICAgICBtZXNobGV0Q291bnQgPSBlbmNvZGVyLm9wdGltaXplci5idWlsZE1lc2hMZXRzKFxyXG4gICAgICAgICAgICAgICAgICAgIG1lc2hsZXRfZGF0YSBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1lc2hsZXRfdmVydGljZXMgYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgICAgICAgICBtZXNobGV0X3RyaWFuZ2xlcyBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4QnVmZmVyMzIgYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgICAgICAgICBpbmRleENvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHZlcnRleEJ1ZmZlckF0UG9zIGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgdmVydGV4Q291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdmVydGV4Vmlldy5zdHJpZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4VmVydGV4Q291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF4VHJpYW5nbGVDb3VudCxcclxuICAgICAgICAgICAgICAgICAgICBjb25lV2VpZ2h0LFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRleFZpZXcuc3RyaWRlID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyEhIDE2IGJpdCBpbmRleFxyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXhCdWZmZXIxNiA9IG5ldyBVaW50MTZBcnJheShtZXNoLmRhdGEuYnVmZmVyLCBpbmRleFZpZXcub2Zmc2V0LCBpbmRleENvdW50KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4QnVmZmVyMzIgPSBuZXcgVWludDMyQXJyYXkoaW5kZXhDb3VudCk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZGV4Q291bnQ7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4QnVmZmVyMzJbaV0gPSBpbmRleEJ1ZmZlcjE2W2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gbWVzaGxldENvdW50ID0gZW5jb2Rlci5vcHRpbWl6ZXIuYnVpbGRNZXNoTGV0c1NjYW4obWVzaGxldF9kYXRhLCBtZXNobGV0X3ZlcnRpY2VzLCBtZXNobGV0X3RyaWFuZ2xlcywgaW5kZXhCdWZmZXIzMiwgaW5kZXhDb3VudCwgdmVydGV4Q291bnQsIG1heFZlcnRleENvdW50LCBtYXhUcmlhbmdsZUNvdW50KTtcclxuICAgICAgICAgICAgICAgIG1lc2hsZXRDb3VudCA9IGVuY29kZXIub3B0aW1pemVyLmJ1aWxkTWVzaExldHMoXHJcbiAgICAgICAgICAgICAgICAgICAgbWVzaGxldF9kYXRhIGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgbWVzaGxldF92ZXJ0aWNlcyBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIG1lc2hsZXRfdHJpYW5nbGVzIGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhCdWZmZXIzMiBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4Q291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgdmVydGV4QnVmZmVyQXRQb3MgYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgICAgICAgICB2ZXJ0ZXhDb3VudCxcclxuICAgICAgICAgICAgICAgICAgICB2ZXJ0ZXhWaWV3LnN0cmlkZSxcclxuICAgICAgICAgICAgICAgICAgICBtYXhWZXJ0ZXhDb3VudCxcclxuICAgICAgICAgICAgICAgICAgICBtYXhUcmlhbmdsZUNvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbmVXZWlnaHQsXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBTdWJtZXNoICR7aWR4fSBoYXMgdW5zdXBwb3J0ZWQgaW5kZXggc3RyaWRlLCBtZXNobGV0IG9wdGltaXphdGlvbiBpcyBub3Qgc3VwcG9ydGVkLmApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHNob3VsZCBzaHJpbmsgbWVzaGxldCBidWZmZXIgc2l6ZVxyXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgbWVzaGxldCBjb25lIGNsdXN0ZXJcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnM/LmNvbmVDbHVzdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBpbXBsZW1lbnQgY29uZSBjbHVzdGVyLCBjb25lIGNsdXN0ZXIgc2hvdWxkIGJlIGNvbnN0cnVjdGVkIGluIGEgYnVmZmVyXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb25lU2l6ZSA9IDQ4OyAvLyAxMiArIDQgKyAxMiArIDEyICsgNCArIDMgKyAxXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb25lQnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoY29uZVNpemUgKiBtZXNobGV0Q291bnQpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmVydGV4T2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRyaWFuZ2xlT2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWVzaGxldENvdW50OyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zdCBtZXNobGV0VmVydGljZXNWaWV3ID0gbmV3IFVpbnQ4QXJyYXkobWVzaGxldF92ZXJ0aWNlcy5idWZmZXIsIHZlcnRleE9mZnNldCApO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGJvdW5kID0gZW5jb2Rlci5vcHRpbWl6ZXIuY29tcHV0ZU1lc2hMZXRzQm91bmQobWVzaGxldF92ZXJ0aWNlcywgbWVzaGxldF90cmlhbmdsZXMsIGksIHZlcnRleENvdW50LCB2ZXJ0ZXhWaWV3LnN0cmlkZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG1lc2hsZXRzLnB1c2gobWVzaGxldF9kYXRhKTtcclxuICAgICAgICAgICAgbWVzaGxldFZlcnRpY2VzLnB1c2gobWVzaGxldF92ZXJ0aWNlcyk7XHJcbiAgICAgICAgICAgIG1lc2hsZXRUcmlhbmdsZXMucHVzaChtZXNobGV0X3RyaWFuZ2xlcyk7XHJcblxyXG4gICAgICAgICAgICBtZXNobGV0c09mZnNldCArPSBtZXNobGV0X2RhdGEuYnl0ZUxlbmd0aDtcclxuICAgICAgICAgICAgbWVzaGxldFZlcnRpY2VzT2Zmc2V0ICs9IG1lc2hsZXRfdmVydGljZXMuYnl0ZUxlbmd0aDtcclxuICAgICAgICAgICAgbWVzaGxldFRyaWFuZ2xlc09mZnNldCArPSBtZXNobGV0X3RyaWFuZ2xlcy5ieXRlTGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgcHJpbWl0aXZlLmNsdXN0ZXIgPSB7XHJcbiAgICAgICAgICAgICAgICBjbHVzdGVyVmlldzoge1xyXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogbWVzaGxldHNPZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBtZXNobGV0X2RhdGEuYnl0ZUxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogbWVzaGxldENvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0cmlkZTogVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQgKiA0LFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHZlcnRleFZpZXc6IHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IG1lc2hsZXRWZXJ0aWNlc09mZnNldCxcclxuICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IG1lc2hsZXRfdmVydGljZXMuYnl0ZUxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogdmVydGV4Q291bnQsIC8vIFRPRE8gZml4XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyaWRlOiBVaW50MzJBcnJheS5CWVRFU19QRVJfRUxFTUVOVCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB0cmlhbmdsZVZpZXc6IHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IG1lc2hsZXRUcmlhbmdsZXNPZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBtZXNobGV0X3RyaWFuZ2xlcy5ieXRlTGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50OiBpbmRleENvdW50LCAvLyBUT0RPIGZpeFxyXG4gICAgICAgICAgICAgICAgICAgIHN0cmlkZTogVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQgKiAzLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHByaW1pdGl2ZS52ZXJ0ZXhCdW5kZWxJbmRpY2VzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBTdWJtZXNoICR7aWR4fSBoYXMgbW9yZSB0aGFuIG9uZSB2ZXJ0ZXggYnVuZGxlLCBjYWNoZSBvcHRpbWl6YXRpb24gaXMgbm90IHN1cHBvcnRlZC5gKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFN1Ym1lc2ggJHtpZHh9IGhhcyBubyB2ZXJ0ZXggYnVuZGxlLCBjYWNoZSBvcHRpbWl6YXRpb24gaXMgbm90IHN1cHBvcnRlZC5gKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAobWVzaGxldHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIC8vIHN1bW1hcnkgbWVzaGxldCBidWZmZXIgc2l6ZVxyXG4gICAgICAgIGNvbnN0IG1lc2hsZXREYXRhU2l6ZSA9IG1lc2hsZXRzLnJlZHVjZSgoYWNjLCBjdXIpID0+IGFjYyArIGN1ci5ieXRlTGVuZ3RoLCAwKTtcclxuICAgICAgICBjb25zdCBtZXNobGV0VmVydGljZXNTaXplID0gbWVzaGxldFZlcnRpY2VzLnJlZHVjZSgoYWNjLCBjdXIpID0+IGFjYyArIGN1ci5ieXRlTGVuZ3RoLCAwKTtcclxuICAgICAgICBjb25zdCBtZXNobGV0VHJpYW5nbGVzU2l6ZSA9IG1lc2hsZXRUcmlhbmdsZXMucmVkdWNlKChhY2MsIGN1cikgPT4gYWNjICsgY3VyLmJ5dGVMZW5ndGgsIDApO1xyXG5cclxuICAgICAgICAvLyBhbGxvY2F0ZXMgbmV3IG1lc2ggYnVmZmVyXHJcbiAgICAgICAgY29uc3QgbmV3TWVzaERhdGEgPSBuZXcgVWludDhBcnJheShtZXNoLmRhdGEuYnl0ZUxlbmd0aCArIG1lc2hsZXREYXRhU2l6ZSArIG1lc2hsZXRWZXJ0aWNlc1NpemUgKyBtZXNobGV0VHJpYW5nbGVzU2l6ZSk7XHJcbiAgICAgICAgLy8gY29weSBvcmlnaW5hbCBtZXNoIGRhdGFcclxuICAgICAgICBuZXdNZXNoRGF0YS5zZXQobWVzaC5kYXRhKTtcclxuICAgICAgICAvLyBjb3B5IG1lc2hsZXQgZGF0YVxyXG4gICAgICAgIGxldCBvZmZzZXQgPSBtZXNoLmRhdGEuYnl0ZUxlbmd0aDtcclxuICAgICAgICBtZXNobGV0cy5mb3JFYWNoKChtZXNobGV0KSA9PiB7XHJcbiAgICAgICAgICAgIG5ld01lc2hEYXRhLnNldChtZXNobGV0LCBvZmZzZXQpO1xyXG4gICAgICAgICAgICBvZmZzZXQgKz0gbWVzaGxldC5ieXRlTGVuZ3RoO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIGNvcHkgbWVzaGxldCB2ZXJ0aWNlc1xyXG4gICAgICAgIG1lc2hsZXRWZXJ0aWNlcy5mb3JFYWNoKChtZXNobGV0KSA9PiB7XHJcbiAgICAgICAgICAgIG5ld01lc2hEYXRhLnNldChtZXNobGV0LCBvZmZzZXQpO1xyXG4gICAgICAgICAgICBvZmZzZXQgKz0gbWVzaGxldC5ieXRlTGVuZ3RoO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIGNvcHkgbWVzaGxldCB0cmlhbmdsZXNcclxuICAgICAgICBtZXNobGV0VHJpYW5nbGVzLmZvckVhY2goKG1lc2hsZXQpID0+IHtcclxuICAgICAgICAgICAgbmV3TWVzaERhdGEuc2V0KG1lc2hsZXQsIG9mZnNldCk7XHJcbiAgICAgICAgICAgIG9mZnNldCArPSBtZXNobGV0LmJ5dGVMZW5ndGg7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gY3JlYXRlIG5ldyBidWZmZXJWaWV3cyBmb3IgbWVzaGxldCBkYXRhXHJcbiAgICAgICAgcHJpbWl0aXZlcy5mb3JFYWNoKChwcmltaXRpdmUsIGlkeCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocHJpbWl0aXZlLmNsdXN0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHByaW1pdGl2ZS5jbHVzdGVyLmNsdXN0ZXJWaWV3Lm9mZnNldCArPSBtZXNoLmRhdGEuYnl0ZUxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHByaW1pdGl2ZS5jbHVzdGVyLnZlcnRleFZpZXcub2Zmc2V0ICs9IG1lc2guZGF0YS5ieXRlTGVuZ3RoICsgbWVzaGxldERhdGFTaXplO1xyXG4gICAgICAgICAgICAgICAgcHJpbWl0aXZlLmNsdXN0ZXIudHJpYW5nbGVWaWV3Lm9mZnNldCArPSBtZXNoLmRhdGEuYnl0ZUxlbmd0aCArIG1lc2hsZXREYXRhU2l6ZSArIG1lc2hsZXRWZXJ0aWNlc1NpemU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgbmV3TWVzaCA9IG5ldyBNZXNoKCk7XHJcblxyXG4gICAgICAgIG5ld01lc2gucmVzZXQoe1xyXG4gICAgICAgICAgICBzdHJ1Y3QsXHJcbiAgICAgICAgICAgIGRhdGE6IG5ld01lc2hEYXRhLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG5ld01lc2guc3RydWN0LmNsdXN0ZXIgPSB0cnVlO1xyXG4gICAgICAgIGNvbnN0IGhhc2ggPSBuZXdNZXNoLmhhc2g7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXdNZXNoO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBtZXNoOyAvLyByZXR1cm4gdGhlIG9yaWdpbmFsIG1lc2ggZm9yIG5vd1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdFNpbXBsaWZ5T3B0aW9ucygpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZW5hYmxlOiB0cnVlLFxyXG4gICAgICAgIHRhcmdldFJhdGlvOiAwLjUsXHJcbiAgICAgICAgYXV0b0Vycm9yUmF0aW86IHRydWUsXHJcbiAgICAgICAgbG9ja0JvdW5kYXJ5OiB0cnVlLFxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNpbXBsaWZ5TWVzaChtZXNoOiBNZXNoLCBvcHRpb25zPzogTWVzaFNpbXBsaWZ5T3B0aW9ucyk6IFByb21pc2U8TWVzaD4ge1xyXG4gICAgYXdhaXQgdHJ5SW5pdE1lc2hPcHQoKTtcclxuXHJcbiAgICBpZiAoIShvcHRpb25zICYmIG9wdGlvbnMudGFyZ2V0UmF0aW8pKSB7XHJcbiAgICAgICAgcmV0dXJuIG1lc2g7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3VpdGFibGUgPSBtZXNoLnN0cnVjdC5wcmltaXRpdmVzLmV2ZXJ5KChwcmltaXRpdmUpID0+IHtcclxuICAgICAgICByZXR1cm4gcHJpbWl0aXZlLnByaW1pdGl2ZU1vZGUgPT09IGdmeC5QcmltaXRpdmVNb2RlLlRSSUFOR0xFX0xJU1QgfHwgcHJpbWl0aXZlLnByaW1pdGl2ZU1vZGUgPT09IGdmeC5QcmltaXRpdmVNb2RlLlBPSU5UX0xJU1Q7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXN1aXRhYmxlKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdPbmx5IHRyaWFuZ2xlIGxpc3QgYW5kIHBvaW50IGxpc3QgYXJlIHN1cHBvcnRlZC4nKTtcclxuICAgICAgICByZXR1cm4gbWVzaDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobWVzaC5zdHJ1Y3QuY29tcHJlc3NlZCkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignQ29tcHJlc3NlZCBtZXNoIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XHJcbiAgICAgICAgcmV0dXJuIG1lc2g7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1lc2guc3RydWN0LmNsdXN0ZXIpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ01lc2ggY2x1c3RlciBpcyBub3Qgc3VwcG9ydGVkLicpO1xyXG4gICAgICAgIHJldHVybiBtZXNoO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtZXNoLnN0cnVjdC5xdWFudGl6ZWQpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ1F1YW50aXplZCBtZXNoIGlzIG5vdCBzdXBwb3J0ZWQuJyk7XHJcbiAgICAgICAgcmV0dXJuIG1lc2g7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2ltcGxpZnlfb3B0aW9uID0gb3B0aW9ucy5sb2NrQm91bmRhcnkgPyAxIDogMDtcclxuICAgIGNvbnN0IHRhcmdldF9yYXRpbyA9IG9wdGlvbnMudGFyZ2V0UmF0aW87XHJcbiAgICBjb25zdCBhdXRvX2Vycm9yX3JhdGUgPSAxLjAgLSBNYXRoLnBvdygwLjksIC1NYXRoLmxvZzEwKHRhcmdldF9yYXRpbykpO1xyXG4gICAgY29uc3QgdGFyZ2V0X2Vycm9yID0gb3B0aW9ucy5hdXRvRXJyb3JSYXRlID8gYXV0b19lcnJvcl9yYXRlIDogb3B0aW9ucy5lcnJvclJhdGUgfHwgYXV0b19lcnJvcl9yYXRlO1xyXG5cclxuICAgIGNvbnN0IGJ1ZmZlckJsb2IgPSBuZXcgQnVmZmVyQmxvYigpO1xyXG4gICAgYnVmZmVyQmxvYi5zZXROZXh0QWxpZ25tZW50KDApO1xyXG5cclxuICAgIC8vIHBlciBwcmltaXRpdmVcclxuICAgIGNvbnN0IHN0cnVjdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkobWVzaC5zdHJ1Y3QpKSBhcyBNZXNoLklTdHJ1Y3Q7XHJcbiAgICBjb25zdCBwcmltaXRpdmVzID0gc3RydWN0LnByaW1pdGl2ZXM7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmltaXRpdmVzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgY29uc3QgcHJpbWl0aXZlID0gcHJpbWl0aXZlc1tpXTtcclxuICAgICAgICBpZiAocHJpbWl0aXZlLnByaW1pdGl2ZU1vZGUgPT09IGdmeC5QcmltaXRpdmVNb2RlLlRSSUFOR0xFX0xJU1QgJiYgcHJpbWl0aXZlLmluZGV4Vmlldykge1xyXG4gICAgICAgICAgICAvLyAhIGZvciBwcmltaXRpdmUgd2l0aG91dCBpbmRleCBidWZmZXIsIHdlIHNob3VsZCBnZW5lcmF0ZSBvbmVcclxuICAgICAgICAgICAgY29uc3QgaW5kZXhWaWV3ID0gcHJpbWl0aXZlLmluZGV4VmlldztcclxuICAgICAgICAgICAgbGV0IGluZGV4QnVmZmVyO1xyXG4gICAgICAgICAgICBsZXQgbmV3SW5kZXggPSBuZXcgVWludDhBcnJheShpbmRleFZpZXcuY291bnQgKiBVaW50MzJBcnJheS5CWVRFU19QRVJfRUxFTUVOVCk7XHJcbiAgICAgICAgICAgIGxldCBpbmRleENvdW50ID0gaW5kZXhWaWV3LmNvdW50O1xyXG4gICAgICAgICAgICBpZiAoaW5kZXhWaWV3LnN0cmlkZSA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgaW5kZXhCdWZmZXIgPSBuZXcgVWludDhBcnJheShuZXdJbmRleC5idWZmZXIsIDAsIGluZGV4Vmlldy5jb3VudCAqIFVpbnQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4QnVmZmVyMTYgPSBuZXcgVWludDE2QXJyYXkobWVzaC5kYXRhLmJ1ZmZlciwgaW5kZXhWaWV3Lm9mZnNldCwgaW5kZXhWaWV3LmNvdW50KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4QnVmZmVyMzIgPSBuZXcgVWludDMyQXJyYXkoaW5kZXhCdWZmZXIuYnVmZmVyLCAwLCBpbmRleFZpZXcuY291bnQpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBpbmRleFZpZXcuY291bnQ7ICsraikge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4QnVmZmVyMzJbal0gPSBpbmRleEJ1ZmZlcjE2W2pdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGluZGV4Vmlldy5zdHJpZGUgPT09IDQpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkobWVzaC5kYXRhLmJ1ZmZlciwgaW5kZXhWaWV3Lm9mZnNldCwgaW5kZXhWaWV3LmNvdW50ICogVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBTdWJtZXNoICR7aX0gaGFzIHVuc3VwcG9ydGVkIGluZGV4IHN0cmlkZSwgc2ltcGxpZnkgb3B0aW1pemF0aW9uIGlzIG5vdCBzdXBwb3J0ZWQuYCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzaDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb25CdW5kbGVJbmRleCA9IHByaW1pdGl2ZS52ZXJ0ZXhCdW5kZWxJbmRpY2VzLmZpbmRJbmRleCgoYnVuZGxlSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1bmRsZSA9IHN0cnVjdC52ZXJ0ZXhCdW5kbGVzW2J1bmRsZUluZGV4XTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBidW5kbGUuYXR0cmlidXRlcztcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBvc0luZGV4ID0gYXR0cmlidXRlcy5maW5kSW5kZXgoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9QT1NJVElPTik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcG9zSW5kZXggPj0gMDtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAocG9zaXRpb25CdW5kbGVJbmRleCA8IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignTm8gcG9zaXRpb24gYXR0cmlidXRlIGZvdW5kLCBzaW1wbGlmeSBvcHRpbWl6YXRpb24gaXMgbm90IHN1cHBvcnRlZC4nKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBtZXNoO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gcHJvY2VlZCB0byBzaW1wbGlmeVxyXG4gICAgICAgICAgICAgICAgY29uc3QgYnVuZGxlID0gc3RydWN0LnZlcnRleEJ1bmRsZXNbcHJpbWl0aXZlLnZlcnRleEJ1bmRlbEluZGljZXNbcG9zaXRpb25CdW5kbGVJbmRleF1dO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmlldyA9IGJ1bmRsZS52aWV3O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IGJ1bmRsZS5hdHRyaWJ1dGVzO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcG9zSW5kZXggPSBhdHRyaWJ1dGVzLmZpbmRJbmRleCgoYXR0cikgPT4gYXR0ci5uYW1lID09PSBnZnguQXR0cmlidXRlTmFtZS5BVFRSX1BPU0lUSU9OKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uT2Zmc2V0ID0gZ2V0T2Zmc2V0KGF0dHJpYnV0ZXMsIHBvc0luZGV4KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZlcnRleEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG1lc2guZGF0YS5idWZmZXIsIHZpZXcub2Zmc2V0LCB2aWV3Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRfaW5kZXhfY291bnQgPSBNYXRoLmZsb29yKChpbmRleFZpZXcuY291bnQgKiB0YXJnZXRfcmF0aW8pIC8gMykgKiAzO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0X2Vycm9yID0gMDtcclxuICAgICAgICAgICAgICAgIGluZGV4Q291bnQgPSBlbmNvZGVyLm9wdGltaXplci5zaW1wbGlmeShcclxuICAgICAgICAgICAgICAgICAgICBuZXdJbmRleCBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4QnVmZmVyIGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhWaWV3LmNvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHZlcnRleEJ1ZmZlci5zdWJhcnJheShwb3NpdGlvbk9mZnNldCkgYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgICAgICAgICB2aWV3LmNvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHZpZXcuc3RyaWRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldF9pbmRleF9jb3VudCxcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRfZXJyb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgc2ltcGxpZnlfb3B0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdF9lcnJvcixcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBuZXdJbmRleCA9IG5ldyBVaW50OEFycmF5KG5ld0luZGV4LmJ1ZmZlciwgMCwgaW5kZXhDb3VudCAqIFVpbnQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UKTsgLy8gc2hyaW5rIGJ1ZmZlciBzaXplXHJcbiAgICAgICAgICAgICAgICAvLyBvcHRpbWl6ZSB2ZXJ0ZXggZmV0Y2hcclxuICAgICAgICAgICAgICAgIGlmIChwcmltaXRpdmUudmVydGV4QnVuZGVsSW5kaWNlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBzaW1wbGUgb3B0aW1pemF0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZlcnRleENvdW50ID0gaW5kZXhDb3VudCA8IHZpZXcuY291bnQgPyBpbmRleENvdW50IDogdmlldy5jb3VudDtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGVzdFZlcnRleEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KHZpZXcuY291bnQgKiB2aWV3LnN0cmlkZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmVydGV4Q291bnQgPSBlbmNvZGVyLm9wdGltaXplci5vcHRpbWl6ZVZlcnRleEZldGNoKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0VmVydGV4QnVmZmVyIGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0luZGV4IGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Q291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlcnRleEJ1ZmZlciBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3LmNvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3LnN0cmlkZSxcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlc3RWZXJ0ZXhCdWZmZXIgPSBuZXcgVWludDhBcnJheShkZXN0VmVydGV4QnVmZmVyLmJ1ZmZlciwgMCwgdmVydGV4Q291bnQgKiB2aWV3LnN0cmlkZSk7IC8vIHNocmluayBidWZmZXIgc2l6ZVxyXG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlckJsb2Iuc2V0TmV4dEFsaWdubWVudCh2aWV3LnN0cmlkZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3VmlldzogTWVzaC5JQnVmZmVyVmlldyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiBidWZmZXJCbG9iLmdldExlbmd0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IGRlc3RWZXJ0ZXhCdWZmZXIuYnl0ZUxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IHZlcnRleENvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpZGU6IHZpZXcuc3RyaWRlLFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgYnVuZGxlLnZpZXcgPSBuZXdWaWV3O1xyXG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlckJsb2IuYWRkQnVmZmVyKGRlc3RWZXJ0ZXhCdWZmZXIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZW1hcEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGluZGV4Q291bnQgKiBVaW50MzJBcnJheS5CWVRFU19QRVJfRUxFTUVOVCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdG90YWxWZXJ0ZXggPSBlbmNvZGVyLm9wdGltaXplci5vcHRpbWl6ZVZlcnRleEZldGNoUmVtYXAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFwQnVmZmVyIGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0luZGV4IGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Q291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuY291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICBlbmNvZGVyLm9wdGltaXplci5vcHRpbWl6ZVJlbWFwSW5kZXgoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0luZGV4IGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0luZGV4IGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Q291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFwQnVmZmVyIGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHByaW1pdGl2ZS52ZXJ0ZXhCdW5kZWxJbmRpY2VzLmxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ1bmRsZSA9IHN0cnVjdC52ZXJ0ZXhCdW5kbGVzW3ByaW1pdGl2ZS52ZXJ0ZXhCdW5kZWxJbmRpY2VzW2pdXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmlldyA9IGJ1bmRsZS52aWV3O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBidWZmZXIgPSBuZXcgVWludDhBcnJheShtZXNoLmRhdGEuYnVmZmVyLCB2aWV3Lm9mZnNldCwgdmlldy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdCdWZmZXIgPSBuZXcgVWludDhBcnJheSh0b3RhbFZlcnRleCAqIHZpZXcuc3RyaWRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2Rlci5vcHRpbWl6ZXIub3B0aW1pemVSZW1hcFZlcnRleChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0J1ZmZlciBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyIGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFZlcnRleCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuc3RyaWRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtYXBCdWZmZXIgYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyQmxvYi5zZXROZXh0QWxpZ25tZW50KHZpZXcuc3RyaWRlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3VmlldzogTWVzaC5JQnVmZmVyVmlldyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogYnVmZmVyQmxvYi5nZXRMZW5ndGgoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aDogbmV3QnVmZmVyLmJ5dGVMZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogdG90YWxWZXJ0ZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpZGU6IHZpZXcuc3RyaWRlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBidW5kbGUudmlldyA9IG5ld1ZpZXc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlckJsb2IuYWRkQnVmZmVyKG5ld0J1ZmZlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGR1bXAgbmV3IGluZGV4IGJ1ZmZlclxyXG4gICAgICAgICAgICBidWZmZXJCbG9iLnNldE5leHRBbGlnbm1lbnQoVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpO1xyXG4gICAgICAgICAgICBjb25zdCBuZXdJbmRleFZpZXc6IE1lc2guSUJ1ZmZlclZpZXcgPSB7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IGJ1ZmZlckJsb2IuZ2V0TGVuZ3RoKCksXHJcbiAgICAgICAgICAgICAgICBsZW5ndGg6IG5ld0luZGV4LmJ5dGVMZW5ndGgsXHJcbiAgICAgICAgICAgICAgICBjb3VudDogaW5kZXhDb3VudCxcclxuICAgICAgICAgICAgICAgIHN0cmlkZTogVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHByaW1pdGl2ZS5pbmRleFZpZXcgPSBuZXdJbmRleFZpZXc7XHJcbiAgICAgICAgICAgIGJ1ZmZlckJsb2IuYWRkQnVmZmVyKG5ld0luZGV4KTtcclxuICAgICAgICB9IGVsc2UgaWYgKHByaW1pdGl2ZS5wcmltaXRpdmVNb2RlID09PSBnZnguUHJpbWl0aXZlTW9kZS5QT0lOVF9MSVNUKSB7XHJcbiAgICAgICAgICAgIGlmIChwcmltaXRpdmUudmVydGV4QnVuZGVsSW5kaWNlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1bmRsZSA9IHN0cnVjdC52ZXJ0ZXhCdW5kbGVzW3ByaW1pdGl2ZS52ZXJ0ZXhCdW5kZWxJbmRpY2VzWzBdXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZpZXcgPSBidW5kbGUudmlldztcclxuICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBidW5kbGUuYXR0cmlidXRlcztcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBvc0luZGV4ID0gYXR0cmlidXRlcy5maW5kSW5kZXgoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9QT1NJVElPTik7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwb3NpdGlvbk9mZnNldCA9IGdldE9mZnNldChhdHRyaWJ1dGVzLCBwb3NJbmRleCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2ZXJ0ZXhCdWZmZXIgPSBuZXcgVWludDhBcnJheShtZXNoLmRhdGEuYnVmZmVyLCB2aWV3Lm9mZnNldCwgdmlldy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldF92ZXJ0ZXhfY291bnQgPSBNYXRoLmZsb29yKCh2aWV3LmNvdW50ICogdGFyZ2V0X3JhdGlvKSAvIDMpICogMztcclxuICAgICAgICAgICAgICAgIGxldCBkZXN0QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkodGFyZ2V0X3ZlcnRleF9jb3VudCAqIHZpZXcuc3RyaWRlKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZlcnRleENvdW50ID0gZW5jb2Rlci5vcHRpbWl6ZXIuc2ltcGxpZnlQb2ludHMoXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzdEJ1ZmZlciBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIHZlcnRleEJ1ZmZlci5zdWJhcnJheShwb3NpdGlvbk9mZnNldCkgYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgICAgICAgICB2aWV3LmNvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHZpZXcuc3RyaWRlLFxyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldF92ZXJ0ZXhfY291bnQsXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgZGVzdEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRlc3RCdWZmZXIuYnVmZmVyLCAwLCB2ZXJ0ZXhDb3VudCAqIHZpZXcuc3RyaWRlKTsgLy8gc2hyaW5rIGJ1ZmZlciBzaXplXHJcbiAgICAgICAgICAgICAgICBidWZmZXJCbG9iLnNldE5leHRBbGlnbm1lbnQodmlldy5zdHJpZGUpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VmlldzogTWVzaC5JQnVmZmVyVmlldyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IGJ1ZmZlckJsb2IuZ2V0TGVuZ3RoKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBkZXN0QnVmZmVyLmJ5dGVMZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IHZlcnRleENvdW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0cmlkZTogdmlldy5zdHJpZGUsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgYnVuZGxlLnZpZXcgPSBuZXdWaWV3O1xyXG4gICAgICAgICAgICAgICAgYnVmZmVyQmxvYi5hZGRCdWZmZXIoZGVzdEJ1ZmZlcik7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJpbWl0aXZlLnZlcnRleEJ1bmRlbEluZGljZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBTdWJtZXNoICR7aX0gaGFzIG1vcmUgdGhhbiBvbmUgdmVydGV4IGJ1bmRsZSwgd2hpY2ggaXMgbm90IHN1cHBvcnRlZC5gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBtZXNoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gbm90IHN1cHBvcnRlZCwgc2hvdWxkIGp1c3QgZHVtcFxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHByaW1pdGl2ZS52ZXJ0ZXhCdW5kZWxJbmRpY2VzLmxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBidW5kbGUgPSBzdHJ1Y3QudmVydGV4QnVuZGxlc1twcmltaXRpdmUudmVydGV4QnVuZGVsSW5kaWNlc1tqXV07XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2aWV3ID0gYnVuZGxlLnZpZXc7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBidWZmZXIgPSBuZXcgVWludDhBcnJheShtZXNoLmRhdGEuYnVmZmVyLCB2aWV3Lm9mZnNldCwgdmlldy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgYnVmZmVyQmxvYi5zZXROZXh0QWxpZ25tZW50KHZpZXcuc3RyaWRlKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1ZpZXc6IE1lc2guSUJ1ZmZlclZpZXcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiBidWZmZXJCbG9iLmdldExlbmd0aCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogYnVmZmVyLmJ5dGVMZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IHZpZXcuY291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RyaWRlOiB2aWV3LnN0cmlkZSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBidW5kbGUudmlldyA9IG5ld1ZpZXc7XHJcbiAgICAgICAgICAgICAgICBidWZmZXJCbG9iLmFkZEJ1ZmZlcihidWZmZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwcmltaXRpdmUuaW5kZXhWaWV3KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2aWV3ID0gcHJpbWl0aXZlLmluZGV4VmlldztcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG1lc2guZGF0YS5idWZmZXIsIHZpZXcub2Zmc2V0LCB2aWV3Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBidWZmZXJCbG9iLnNldE5leHRBbGlnbm1lbnQoVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VmlldzogTWVzaC5JQnVmZmVyVmlldyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IGJ1ZmZlckJsb2IuZ2V0TGVuZ3RoKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBidWZmZXIuYnl0ZUxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogdmlldy5jb3VudCxcclxuICAgICAgICAgICAgICAgICAgICBzdHJpZGU6IFVpbnQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5ULFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHByaW1pdGl2ZS5pbmRleFZpZXcgPSBuZXdWaWV3O1xyXG4gICAgICAgICAgICAgICAgYnVmZmVyQmxvYi5hZGRCdWZmZXIoYnVmZmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuZXdNZXNoID0gbmV3IE1lc2goKTtcclxuICAgIG5ld01lc2gucmVzZXQoe1xyXG4gICAgICAgIHN0cnVjdCxcclxuICAgICAgICBkYXRhOiBidWZmZXJCbG9iLmdldENvbWJpbmVkKCksXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGhhc2ggPSBuZXdNZXNoLmhhc2g7XHJcblxyXG4gICAgcmV0dXJuIG5ld01lc2g7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21wcmVzc01lc2gobWVzaDogTWVzaCwgb3B0aW9ucz86IE1lc2hDb21wcmVzc09wdGlvbnMpOiBQcm9taXNlPE1lc2g+IHtcclxuICAgIGF3YWl0IHRyeUluaXRNZXNoT3B0KCk7XHJcblxyXG4gICAgLy8gJ21lc2gnIGFuZCAnb3B0aW9ucycgYXJlIG5vdCB1c2VkIGluIHRoaXMgZnVuY3Rpb24sIHNvIHdlIGNhbiByZW1vdmUgdGhlbVxyXG4gICAgaWYgKCFvcHRpb25zKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdNZXNoIGNvbXByZXNzaW9uIGlzIG5vdCBlbmFibGVkLCBvcmlnaW5hbCBtZXNoIHdpbGwgYmUgcmV0dXJuZWQuJyk7XHJcbiAgICAgICAgcmV0dXJuIG1lc2g7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9wdGlvbnM/LnF1YW50aXplKSB7XHJcbiAgICAgICAgbWVzaCA9IGF3YWl0IHF1YW50aXplTWVzaChtZXNoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3B0aW9ucz8uZW5jb2RlKSB7XHJcbiAgICAgICAgbWVzaCA9IGF3YWl0IGVuY29kZU1lc2gobWVzaCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9wdGlvbnM/LmNvbXByZXNzKSB7XHJcbiAgICAgICAgbWVzaCA9IGF3YWl0IGRlZmxhdGVNZXNoKG1lc2gpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBtZXNoOyAvLyByZXR1cm4gdGhlIG9yaWdpbmFsIG1lc2ggZm9yIG5vd1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jb2RlTWVzaChtZXNoOiBNZXNoKTogUHJvbWlzZTxNZXNoPiB7XHJcbiAgICBhd2FpdCB0cnlJbml0TWVzaE9wdCgpO1xyXG5cclxuICAgIGlmIChtZXNoLnN0cnVjdC5lbmNvZGVkKSB7XHJcbiAgICAgICAgcmV0dXJuIG1lc2g7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3RydWN0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShtZXNoLnN0cnVjdCkpIGFzIE1lc2guSVN0cnVjdDtcclxuXHJcbiAgICBjb25zdCBidWZmZXJCbG9iID0gbmV3IEJ1ZmZlckJsb2IoKTtcclxuICAgIGJ1ZmZlckJsb2Iuc2V0TmV4dEFsaWdubWVudCgwKTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGJ1bmRsZSBvZiBzdHJ1Y3QudmVydGV4QnVuZGxlcykge1xyXG4gICAgICAgIGNvbnN0IHZpZXcgPSBidW5kbGUudmlldztcclxuICAgICAgICBjb25zdCBidWZmZXIgPSBuZXcgVWludDhBcnJheShtZXNoLmRhdGEuYnVmZmVyLCB2aWV3Lm9mZnNldCwgdmlldy5sZW5ndGgpO1xyXG4gICAgICAgIGNvbnN0IGJvdW5kID0gZW5jb2Rlci5vcHRpbWl6ZXIuZW5jb2RlVmVydGV4QnVmZmVyQm91bmQodmlldy5jb3VudCwgdmlldy5zdHJpZGUpO1xyXG4gICAgICAgIGxldCBkZXN0QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYm91bmQpO1xyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGVuY29kZXIub3B0aW1pemVyLmVuY29kZVZlcnRleEJ1ZmZlcihcclxuICAgICAgICAgICAgZGVzdEJ1ZmZlciBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyLFxyXG4gICAgICAgICAgICBib3VuZCxcclxuICAgICAgICAgICAgYnVmZmVyIGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgIHZpZXcuY291bnQsXHJcbiAgICAgICAgICAgIHZpZXcuc3RyaWRlLFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgZGVzdEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRlc3RCdWZmZXIuYnVmZmVyLCAwLCBsZW5ndGgpO1xyXG5cclxuICAgICAgICBidWZmZXJCbG9iLnNldE5leHRBbGlnbm1lbnQodmlldy5zdHJpZGUpO1xyXG4gICAgICAgIGNvbnN0IG5ld1ZpZXc6IE1lc2guSUJ1ZmZlclZpZXcgPSB7XHJcbiAgICAgICAgICAgIG9mZnNldDogYnVmZmVyQmxvYi5nZXRMZW5ndGgoKSxcclxuICAgICAgICAgICAgbGVuZ3RoOiBkZXN0QnVmZmVyLmJ5dGVMZW5ndGgsXHJcbiAgICAgICAgICAgIGNvdW50OiB2aWV3LmNvdW50LFxyXG4gICAgICAgICAgICBzdHJpZGU6IHZpZXcuc3RyaWRlLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgYnVuZGxlLnZpZXcgPSBuZXdWaWV3O1xyXG4gICAgICAgIGJ1ZmZlckJsb2IuYWRkQnVmZmVyKGRlc3RCdWZmZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAoY29uc3QgcHJpbWl0aXZlIG9mIHN0cnVjdC5wcmltaXRpdmVzKSB7XHJcbiAgICAgICAgaWYgKHByaW1pdGl2ZS5pbmRleFZpZXcgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXcgPSBwcmltaXRpdmUuaW5kZXhWaWV3O1xyXG4gICAgICAgIGxldCBidWZmZXI6IFVpbnQ4QXJyYXkgPSBuZXcgVWludDhBcnJheSgpO1xyXG4gICAgICAgIC8vIGNvbnZlcnQgaW5kZXggdG8gMzJiaXRcclxuICAgICAgICBpZiAodmlldy5zdHJpZGUgPT09IDIpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXhCdWZmZXIxNiA9IG5ldyBVaW50MTZBcnJheShtZXNoLmRhdGEuYnVmZmVyLCB2aWV3Lm9mZnNldCwgdmlldy5jb3VudCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4QnVmZmVyMzIgPSBuZXcgVWludDMyQXJyYXkodmlldy5jb3VudCAqIFVpbnQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB2aWV3LmNvdW50OyArK2opIHtcclxuICAgICAgICAgICAgICAgIGluZGV4QnVmZmVyMzJbal0gPSBpbmRleEJ1ZmZlcjE2W2pdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGluZGV4QnVmZmVyMzIuYnVmZmVyLCAwLCB2aWV3LmNvdW50ICogVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodmlldy5zdHJpZGUgPT09IDQpIHtcclxuICAgICAgICAgICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkobWVzaC5kYXRhLmJ1ZmZlciwgdmlldy5vZmZzZXQsIHZpZXcuY291bnQgKiBVaW50MzJBcnJheS5CWVRFU19QRVJfRUxFTUVOVCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBib3VuZCA9IGVuY29kZXIub3B0aW1pemVyLmVuY29kZUluZGV4QnVmZmVyQm91bmQodmlldy5jb3VudCwgdmlldy5jb3VudCk7XHJcbiAgICAgICAgbGV0IGRlc3RCdWZmZXIgPSBuZXcgVWludDhBcnJheShib3VuZCk7XHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gZW5jb2Rlci5vcHRpbWl6ZXIuZW5jb2RlSW5kZXhCdWZmZXIoXHJcbiAgICAgICAgICAgIGRlc3RCdWZmZXIgYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgYm91bmQsXHJcbiAgICAgICAgICAgIGJ1ZmZlciBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyLFxyXG4gICAgICAgICAgICB2aWV3LmNvdW50LFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgZGVzdEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRlc3RCdWZmZXIuYnVmZmVyLCAwLCBsZW5ndGgpO1xyXG5cclxuICAgICAgICBidWZmZXJCbG9iLnNldE5leHRBbGlnbm1lbnQoVWludDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQpO1xyXG4gICAgICAgIGNvbnN0IG5ld1ZpZXc6IE1lc2guSUJ1ZmZlclZpZXcgPSB7XHJcbiAgICAgICAgICAgIG9mZnNldDogYnVmZmVyQmxvYi5nZXRMZW5ndGgoKSxcclxuICAgICAgICAgICAgbGVuZ3RoOiBkZXN0QnVmZmVyLmJ5dGVMZW5ndGgsXHJcbiAgICAgICAgICAgIGNvdW50OiB2aWV3LmNvdW50LFxyXG4gICAgICAgICAgICBzdHJpZGU6IFVpbnQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5ULFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcHJpbWl0aXZlLmluZGV4VmlldyA9IG5ld1ZpZXc7XHJcbiAgICAgICAgYnVmZmVyQmxvYi5hZGRCdWZmZXIoZGVzdEJ1ZmZlcik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbmV3TWVzaCA9IG5ldyBNZXNoKCk7XHJcbiAgICBuZXdNZXNoLnJlc2V0KHtcclxuICAgICAgICBzdHJ1Y3QsXHJcbiAgICAgICAgZGF0YTogYnVmZmVyQmxvYi5nZXRDb21iaW5lZCgpLFxyXG4gICAgfSk7XHJcbiAgICBuZXdNZXNoLnN0cnVjdC5lbmNvZGVkID0gdHJ1ZTtcclxuICAgIGNvbnN0IGhhc2ggPSBuZXdNZXNoLmhhc2g7XHJcblxyXG4gICAgcmV0dXJuIG5ld01lc2g7XHJcbn1cclxuXHJcbmludGVyZmFjZSBBdHRyaWJ1dGVDb25maWd1cmUge1xyXG4gICAgZW51bTogbnVtYmVyO1xyXG4gICAgc2l6ZTogbnVtYmVyO1xyXG4gICAgZm9ybWF0OiBnZnguRm9ybWF0O1xyXG4gICAgb3JpZ2luOiBnZnguRm9ybWF0O1xyXG59XHJcblxyXG5jb25zdCBxdWFudGl6ZUNvbmZpZ3VyYXRpb24gPSBuZXcgTWFwPHN0cmluZywgQXR0cmlidXRlQ29uZmlndXJlPihbXHJcbiAgICBbZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9QT1NJVElPTiwgeyBlbnVtOiAwLCBzaXplOiA2LCBmb3JtYXQ6IGdmeC5Gb3JtYXQuUkdCMTZGLCBvcmlnaW46IGdmeC5Gb3JtYXQuUkdCMzJGIH1dLCAvLyA4IGZvciBwb3NpdGlvblxyXG4gICAgW2dmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfTk9STUFMLCB7IGVudW06IDEsIHNpemU6IDYsIGZvcm1hdDogZ2Z4LkZvcm1hdC5SR0IxNkYsIG9yaWdpbjogZ2Z4LkZvcm1hdC5SR0IzMkYgfV0sIC8vIDQgZm9yIG5vcm1hbFxyXG4gICAgW2dmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfVEFOR0VOVCwgeyBlbnVtOiAyLCBzaXplOiA4LCBmb3JtYXQ6IGdmeC5Gb3JtYXQuUkdCQTE2Riwgb3JpZ2luOiBnZnguRm9ybWF0LlJHQkEzMkYgfV0sIC8vIDQgZm9yIHRhbmdlbnRcclxuICAgIFtnZnguQXR0cmlidXRlTmFtZS5BVFRSX0JJVEFOR0VOVCwgeyBlbnVtOiAyLCBzaXplOiA4LCBmb3JtYXQ6IGdmeC5Gb3JtYXQuUkdCQTE2Riwgb3JpZ2luOiBnZnguRm9ybWF0LlJHQkEzMkYgfV0sIC8vIDQgZm9yIHRhbmdlbnRcclxuICAgIFtnZnguQXR0cmlidXRlTmFtZS5BVFRSX0NPTE9SLCB7IGVudW06IDMsIHNpemU6IDQsIGZvcm1hdDogZ2Z4LkZvcm1hdC5SR0JBOCwgb3JpZ2luOiBnZnguRm9ybWF0LlJHQkEzMkYgfV0sIC8vIDQgZm9yIGNvbG9yLCAxYiBlYWNoIGNoYW5uZWxcclxuICAgIFtnZnguQXR0cmlidXRlTmFtZS5BVFRSX0NPTE9SMSwgeyBlbnVtOiAzLCBzaXplOiA0LCBmb3JtYXQ6IGdmeC5Gb3JtYXQuUkdCQTgsIG9yaWdpbjogZ2Z4LkZvcm1hdC5SR0JBMzJGIH1dLCAvLyA0IGZvciBqb2ludHMsXHJcbiAgICBbZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9DT0xPUjIsIHsgZW51bTogMywgc2l6ZTogNCwgZm9ybWF0OiBnZnguRm9ybWF0LlJHQkE4LCBvcmlnaW46IGdmeC5Gb3JtYXQuUkdCQTMyRiB9XSwgLy8gNCBmb3Igam9pbnRzLFxyXG4gICAgW2dmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfSk9JTlRTLCB7IGVudW06IDQsIHNpemU6IDE2LCBmb3JtYXQ6IGdmeC5Gb3JtYXQuUkdCQTMyRiwgb3JpZ2luOiBnZnguRm9ybWF0LlJHQkEzMkYgfV0sIC8vIDQgZm9yIGpvaW50cyxcclxuICAgIFtnZnguQXR0cmlidXRlTmFtZS5BVFRSX1dFSUdIVFMsIHsgZW51bTogNSwgc2l6ZTogMTYsIGZvcm1hdDogZ2Z4LkZvcm1hdC5SR0JBMzJGLCBvcmlnaW46IGdmeC5Gb3JtYXQuUkdCQTMyRiB9XSwgLy8gNCBmb3Igd2VpZ2h0cyxcclxuICAgIFtnZnguQXR0cmlidXRlTmFtZS5BVFRSX1RFWF9DT09SRCwgeyBlbnVtOiA2LCBzaXplOiA0LCBmb3JtYXQ6IGdmeC5Gb3JtYXQuUkcxNkYsIG9yaWdpbjogZ2Z4LkZvcm1hdC5SRzMyRiB9XSwgLy8gNCBmb3IgdXYsIDJiIGVhY2ggY2hhbm5lbFxyXG4gICAgW2dmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfVEVYX0NPT1JEMSwgeyBlbnVtOiA2LCBzaXplOiA0LCBmb3JtYXQ6IGdmeC5Gb3JtYXQuUkcxNkYsIG9yaWdpbjogZ2Z4LkZvcm1hdC5SRzMyRiB9XSwgLy8gNCBmb3IgdXYxLCAyYiBlYWNoIGNoYW5uZWxcclxuICAgIFtnZnguQXR0cmlidXRlTmFtZS5BVFRSX1RFWF9DT09SRDIsIHsgZW51bTogNiwgc2l6ZTogNCwgZm9ybWF0OiBnZnguRm9ybWF0LlJHMTZGLCBvcmlnaW46IGdmeC5Gb3JtYXQuUkczMkYgfV0sIC8vIDQgZm9yIHV2MiwgMmIgZWFjaCBjaGFubmVsXHJcbiAgICBbZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9URVhfQ09PUkQzLCB7IGVudW06IDYsIHNpemU6IDQsIGZvcm1hdDogZ2Z4LkZvcm1hdC5SRzE2Riwgb3JpZ2luOiBnZnguRm9ybWF0LlJHMzJGIH1dLCAvLyA0IGZvciB1djMsIDJiIGVhY2ggY2hhbm5lbFxyXG4gICAgW2dmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfVEVYX0NPT1JENCwgeyBlbnVtOiA2LCBzaXplOiA0LCBmb3JtYXQ6IGdmeC5Gb3JtYXQuUkcxNkYsIG9yaWdpbjogZ2Z4LkZvcm1hdC5SRzMyRiB9XSwgLy8gNCBmb3IgdXY0LCAyYiBlYWNoIGNoYW5uZWxcclxuICAgIFtnZnguQXR0cmlidXRlTmFtZS5BVFRSX1RFWF9DT09SRDUsIHsgZW51bTogNiwgc2l6ZTogNCwgZm9ybWF0OiBnZnguRm9ybWF0LlJHMTZGLCBvcmlnaW46IGdmeC5Gb3JtYXQuUkczMkYgfV0sIC8vIDQgZm9yIHV2NSwgMmIgZWFjaCBjaGFubmVsXHJcbiAgICBbZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9URVhfQ09PUkQ2LCB7IGVudW06IDYsIHNpemU6IDQsIGZvcm1hdDogZ2Z4LkZvcm1hdC5SRzE2Riwgb3JpZ2luOiBnZnguRm9ybWF0LlJHMzJGIH1dLCAvLyA0IGZvciB1djYsIDJiIGVhY2ggY2hhbm5lbFxyXG4gICAgW2dmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfVEVYX0NPT1JENywgeyBlbnVtOiA2LCBzaXplOiA0LCBmb3JtYXQ6IGdmeC5Gb3JtYXQuUkcxNkYsIG9yaWdpbjogZ2Z4LkZvcm1hdC5SRzMyRiB9XSwgLy8gNCBmb3IgdXY3LCAyYiBlYWNoIGNoYW5uZWxcclxuICAgIFtnZnguQXR0cmlidXRlTmFtZS5BVFRSX1RFWF9DT09SRDgsIHsgZW51bTogNiwgc2l6ZTogNCwgZm9ybWF0OiBnZnguRm9ybWF0LlJHMTZGLCBvcmlnaW46IGdmeC5Gb3JtYXQuUkczMkYgfV0sIC8vIDQgZm9yIHV2OCwgMmIgZWFjaCBjaGFubmVsXHJcbiAgICBbZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9CQVRDSF9JRCwgeyBlbnVtOiA3LCBzaXplOiA0LCBmb3JtYXQ6IGdmeC5Gb3JtYXQuUjMyRiwgb3JpZ2luOiBnZnguRm9ybWF0LlIzMkYgfV0sIC8vIDQgZm9yIGJhdGNoIGlkXHJcbiAgICBbZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9CQVRDSF9VViwgeyBlbnVtOiA4LCBzaXplOiA4LCBmb3JtYXQ6IGdmeC5Gb3JtYXQuUkczMkYsIG9yaWdpbjogZ2Z4LkZvcm1hdC5SRzMyRiB9XSwgLy8gNCBmb3IgYmF0Y2ggdXZcclxuXSk7XHJcblxyXG5mdW5jdGlvbiBxdWFudGl6ZVNpemUoYXR0cmlidXRlczogZ2Z4LkF0dHJpYnV0ZVtdKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcclxuICAgIGxldCBzaXplID0gMDtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJpYnV0ZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2ldO1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBhdHRyaWJ1dGUubmFtZTtcclxuICAgICAgICBjb25zdCBjb25mID0gcXVhbnRpemVDb25maWd1cmF0aW9uLmdldChuYW1lKTtcclxuICAgICAgICBpZiAoY29uZiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHNpemUgKz0gY29uZi5zaXplO1xyXG4gICAgICAgICAgICBpZiAoY29uZi5vcmlnaW4gIT09IGF0dHJpYnV0ZS5mb3JtYXQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgQXR0cmlidXRlICR7bmFtZX0gaGFzIGRpZmZlcmVudCBmb3JtYXQgZnJvbSBvcmlnaW4sIHF1YW50aXphdGlvbiBtYXkgbm90IHdvcmsuYCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZS5mb3JtYXQgPSBjb25mLmZvcm1hdDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQXR0cmlidXRlICR7bmFtZX0gaXMgbm90IHN1cHBvcnRlZCBmb3IgcXVhbnRpemF0aW9uLmApO1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBzaXplO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYXBBdHRyaWJ1dGUoYXR0cmlidXRlczogZ2Z4LkF0dHJpYnV0ZVtdKTogbnVtYmVyW10ge1xyXG4gICAgcmV0dXJuIGF0dHJpYnV0ZXMubWFwKChhdHRyaWJ1dGUpID0+IHtcclxuICAgICAgICBjb25zdCBuYW1lID0gYXR0cmlidXRlLm5hbWU7XHJcbiAgICAgICAgY29uc3QgY29uZiA9IHF1YW50aXplQ29uZmlndXJhdGlvbi5nZXQobmFtZSk7XHJcbiAgICAgICAgaWYgKGNvbmYgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBBdHRyaWJ1dGUgJHtuYW1lfSBpcyBub3Qgc3VwcG9ydGVkIGZvciBxdWFudGl6YXRpb24uYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb25mIS5lbnVtO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBxdWFudGl6ZU1lc2gobWVzaDogTWVzaCk6IFByb21pc2U8TWVzaD4ge1xyXG4gICAgaWYgKG1lc2guc3RydWN0LnF1YW50aXplZCkge1xyXG4gICAgICAgIHJldHVybiBtZXNoO1xyXG4gICAgfVxyXG4gICAgY29uc3QgYnVmZmVyQmxvYiA9IG5ldyBCdWZmZXJCbG9iKCk7XHJcbiAgICBidWZmZXJCbG9iLnNldE5leHRBbGlnbm1lbnQoMCk7XHJcblxyXG4gICAgY29uc3Qgc3RydWN0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShtZXNoLnN0cnVjdCkpIGFzIE1lc2guSVN0cnVjdDtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cnVjdC52ZXJ0ZXhCdW5kbGVzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgY29uc3QgYnVuZGxlID0gc3RydWN0LnZlcnRleEJ1bmRsZXNbaV07XHJcbiAgICAgICAgY29uc3QgdmlldyA9IGJ1bmRsZS52aWV3O1xyXG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGJ1bmRsZS5hdHRyaWJ1dGVzKSkgYXMgZ2Z4LkF0dHJpYnV0ZVtdO1xyXG4gICAgICAgIGNvbnN0IHF1YW50aXplZFNpemUgPSBxdWFudGl6ZVNpemUoYXR0cmlidXRlcyk7XHJcbiAgICAgICAgaWYgKCFxdWFudGl6ZWRTaXplKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtZXNoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdmVydGV4QnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkobWVzaC5kYXRhLmJ1ZmZlciwgdmlldy5vZmZzZXQsIHZpZXcubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgY29uc3QgYXR0ckVudW1zID0gbWFwQXR0cmlidXRlKGF0dHJpYnV0ZXMpO1xyXG4gICAgICAgIGNvbnN0IG5ld0J1ZmZlciA9IG5ldyBVaW50OEFycmF5KHF1YW50aXplZFNpemUgKiB2aWV3LmNvdW50KTtcclxuICAgICAgICBlbmNvZGVyLm9wdGltaXplci5xdWFudGl6ZU1lc2goXHJcbiAgICAgICAgICAgIG5ld0J1ZmZlciBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyLFxyXG4gICAgICAgICAgICBuZXdCdWZmZXIuYnl0ZUxlbmd0aCxcclxuICAgICAgICAgICAgdmVydGV4QnVmZmVyIGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIsXHJcbiAgICAgICAgICAgIHZpZXcuY291bnQsXHJcbiAgICAgICAgICAgIHZpZXcuc3RyaWRlLFxyXG4gICAgICAgICAgICBVaW50MzJBcnJheS5mcm9tKGF0dHJFbnVtcykgYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgYXR0ckVudW1zLmxlbmd0aCxcclxuICAgICAgICApO1xyXG4gICAgICAgIGJ1ZmZlckJsb2Iuc2V0TmV4dEFsaWdubWVudChxdWFudGl6ZWRTaXplKTtcclxuICAgICAgICBjb25zdCBuZXdWaWV3OiBNZXNoLklCdWZmZXJWaWV3ID0ge1xyXG4gICAgICAgICAgICBvZmZzZXQ6IGJ1ZmZlckJsb2IuZ2V0TGVuZ3RoKCksXHJcbiAgICAgICAgICAgIGxlbmd0aDogbmV3QnVmZmVyLmJ5dGVMZW5ndGgsXHJcbiAgICAgICAgICAgIGNvdW50OiB2aWV3LmNvdW50LFxyXG4gICAgICAgICAgICBzdHJpZGU6IHF1YW50aXplZFNpemUsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBidW5kbGUudmlldyA9IG5ld1ZpZXc7XHJcbiAgICAgICAgYnVuZGxlLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xyXG4gICAgICAgIGJ1ZmZlckJsb2IuYWRkQnVmZmVyKG5ld0J1ZmZlcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZHVtcCBpbmRleCBidWZmZXJcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RydWN0LnByaW1pdGl2ZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICBjb25zdCBwcmltaXRpdmUgPSBzdHJ1Y3QucHJpbWl0aXZlc1tpXTtcclxuICAgICAgICBpZiAocHJpbWl0aXZlLmluZGV4VmlldyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB2aWV3ID0gcHJpbWl0aXZlLmluZGV4VmlldztcclxuICAgICAgICBjb25zdCBidWZmZXIgPSBuZXcgVWludDhBcnJheShtZXNoLmRhdGEuYnVmZmVyLCB2aWV3Lm9mZnNldCwgdmlldy5sZW5ndGgpO1xyXG4gICAgICAgIGJ1ZmZlckJsb2Iuc2V0TmV4dEFsaWdubWVudCh2aWV3LnN0cmlkZSk7XHJcbiAgICAgICAgY29uc3QgbmV3VmlldzogTWVzaC5JQnVmZmVyVmlldyA9IHtcclxuICAgICAgICAgICAgb2Zmc2V0OiBidWZmZXJCbG9iLmdldExlbmd0aCgpLFxyXG4gICAgICAgICAgICBsZW5ndGg6IGJ1ZmZlci5ieXRlTGVuZ3RoLFxyXG4gICAgICAgICAgICBjb3VudDogdmlldy5jb3VudCxcclxuICAgICAgICAgICAgc3RyaWRlOiB2aWV3LnN0cmlkZSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHByaW1pdGl2ZS5pbmRleFZpZXcgPSBuZXdWaWV3O1xyXG4gICAgICAgIGJ1ZmZlckJsb2IuYWRkQnVmZmVyKGJ1ZmZlcik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbmV3TWVzaCA9IG5ldyBNZXNoKCk7XHJcbiAgICBuZXdNZXNoLnJlc2V0KHtcclxuICAgICAgICBzdHJ1Y3QsXHJcbiAgICAgICAgZGF0YTogYnVmZmVyQmxvYi5nZXRDb21iaW5lZCgpLFxyXG4gICAgfSk7XHJcbiAgICBuZXdNZXNoLnN0cnVjdC5xdWFudGl6ZWQgPSB0cnVlO1xyXG4gICAgY29uc3QgaGFzaCA9IG5ld01lc2guaGFzaDtcclxuXHJcbiAgICByZXR1cm4gbmV3TWVzaDtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlZmxhdGVNZXNoKG1lc2g6IE1lc2gpOiBQcm9taXNlPE1lc2g+IHtcclxuICAgIGlmIChtZXNoLnN0cnVjdC5jb21wcmVzc2VkKSB7XHJcbiAgICAgICAgcmV0dXJuIG1lc2g7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY29tcHJlc3MoYnVmZmVyOiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XHJcbiAgICAgICAgY29uc3QgY29tcHJlc3NlZCA9IHpsaWIuZGVmbGF0ZVN5bmMoYnVmZmVyKTtcclxuICAgICAgICByZXR1cm4gY29tcHJlc3NlZCBhcyBVaW50OEFycmF5O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRhdGEgPSBjb21wcmVzcyhtZXNoLmRhdGEpO1xyXG4gICAgY29uc3Qgc3RydWN0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShtZXNoLnN0cnVjdCkpO1xyXG5cclxuICAgIHN0cnVjdC5jb21wcmVzc2VkID0gdHJ1ZTtcclxuXHJcbiAgICBjb25zdCBuZXdNZXNoID0gbmV3IE1lc2goKTtcclxuICAgIG5ld01lc2gucmVzZXQoe1xyXG4gICAgICAgIHN0cnVjdCxcclxuICAgICAgICBkYXRhLFxyXG4gICAgfSk7XHJcbiAgICBjb25zdCBoYXNoID0gbmV3TWVzaC5oYXNoO1xyXG5cclxuICAgIHJldHVybiBuZXdNZXNoO1xyXG59XHJcbiJdfQ==