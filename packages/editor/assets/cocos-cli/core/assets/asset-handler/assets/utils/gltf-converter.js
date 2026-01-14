"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlTfConformanceError = exports.BufferBlob = exports.GltfConverter = void 0;
exports.isFilesystemPath = isFilesystemPath;
exports.getPathFromRoot = getPathFromRoot;
exports.getWorldTransformUntilRoot = getWorldTransformUntilRoot;
exports.doCreateSocket = doCreateSocket;
exports.readGltf = readGltf;
exports.isDataUri = isDataUri;
const DataURI = __importStar(require("@cocos/data-uri"));
const cc = __importStar(require("cc"));
const cc_1 = require("cc");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const interface_1 = require("../../../@types/interface");
const texture_base_1 = require("../texture-base");
const base64_1 = require("./base64");
const glTF_constants_1 = require("./glTF.constants");
const khr_draco_mesh_compression_1 = require("./khr-draco-mesh-compression");
const pp_geometry_1 = require("./pp-geometry");
const extras_1 = require("@cocos/fbx-gltf-conv/lib/extras");
const exotic_animation_1 = require("cc/editor/exotic-animation");
const glTF_animation_utils_1 = require("./glTF-animation-utils");
const color_utils_1 = require("cc/editor/color-utils");
function isFilesystemPath(uriInfo) {
    return !uriInfo.isDataUri;
}
function getPathFromRoot(target, root) {
    let node = target;
    let path = '';
    while (node !== null && node !== root) {
        path = `${node.name}/${path}`;
        node = node.parent;
    }
    return path.slice(0, -1);
}
function getWorldTransformUntilRoot(target, root, outPos, outRot, outScale) {
    cc_1.Vec3.set(outPos, 0, 0, 0);
    cc_1.Quat.set(outRot, 0, 0, 0, 1);
    cc_1.Vec3.set(outScale, 1, 1, 1);
    while (target !== root) {
        cc_1.Vec3.multiply(outPos, outPos, target.scale);
        cc_1.Vec3.transformQuat(outPos, outPos, target.rotation);
        cc_1.Vec3.add(outPos, outPos, target.position);
        cc_1.Quat.multiply(outRot, target.rotation, outRot);
        cc_1.Vec3.multiply(outScale, target.scale, outScale);
        target = target.parent;
    }
}
var GltfAssetKind;
(function (GltfAssetKind) {
    GltfAssetKind[GltfAssetKind["Node"] = 0] = "Node";
    GltfAssetKind[GltfAssetKind["Mesh"] = 1] = "Mesh";
    GltfAssetKind[GltfAssetKind["Texture"] = 2] = "Texture";
    GltfAssetKind[GltfAssetKind["Skin"] = 3] = "Skin";
    GltfAssetKind[GltfAssetKind["Animation"] = 4] = "Animation";
    GltfAssetKind[GltfAssetKind["Image"] = 5] = "Image";
    GltfAssetKind[GltfAssetKind["Material"] = 6] = "Material";
    GltfAssetKind[GltfAssetKind["Scene"] = 7] = "Scene";
})(GltfAssetKind || (GltfAssetKind = {}));
const qt = new cc_1.Quat();
const v3a = new cc_1.Vec3();
const v3b = new cc_1.Vec3();
const v3Min = new cc_1.Vec3();
const v3Max = new cc_1.Vec3();
function doCreateSocket(sceneNode, out, model) {
    const path = getPathFromRoot(model.parent, sceneNode);
    if (model.parent === sceneNode) {
        return;
    }
    let socket = out.find((s) => s.path === path);
    if (!socket) {
        const target = new cc.Node();
        target.name = `${model.parent.name} Socket`;
        target.parent = sceneNode;
        getWorldTransformUntilRoot(model.parent, sceneNode, v3a, qt, v3b);
        target.setPosition(v3a);
        target.setRotation(qt);
        target.setScale(v3b);
        socket = new cc.SkeletalAnimation.Socket(path, target);
        out.push(socket);
    }
    model.parent = socket.target;
}
const skinRootNotCalculated = -2;
const skinRootAbsent = -1;
const supportedExtensions = new Set([
    // Sort please
    'KHR_draco_mesh_compression',
    'KHR_materials_pbrSpecularGlossiness',
    'KHR_materials_unlit',
    'KHR_texture_transform',
]);
var AppId;
(function (AppId) {
    AppId[AppId["UNKNOWN"] = 0] = "UNKNOWN";
    AppId[AppId["ADSK_3DS_MAX"] = 1] = "ADSK_3DS_MAX";
    AppId[AppId["CINEMA4D"] = 3] = "CINEMA4D";
    AppId[AppId["MAYA"] = 5] = "MAYA";
})(AppId || (AppId = {}));
class GltfConverter {
    _gltf;
    _buffers;
    _gltfFilePath;
    get gltf() {
        return this._gltf;
    }
    get path() {
        return this._gltfFilePath;
    }
    get processedMeshes() {
        return this._processedMeshes;
    }
    get fbxMissingImagesId() {
        return this._fbxMissingImagesId;
    }
    static _defaultLogger = (level, error, args) => {
        const message = JSON.stringify({ error, arguments: args }, undefined, 4);
        switch (level) {
            case GltfConverter.LogLevel.Info:
                console.log(message);
                break;
            case GltfConverter.LogLevel.Warning:
                console.warn(message);
                break;
            case GltfConverter.LogLevel.Error:
                console.error(message);
                break;
            case GltfConverter.LogLevel.Debug:
                console.debug(message);
                break;
        }
    };
    _promotedRootNodes = [];
    _nodePathTable;
    /**
     * The parent index of each node.
     */
    _parents = [];
    /**
     * The root node of each skin.
     */
    _skinRoots = [];
    _logger;
    _processedMeshes = [];
    _socketMappings = new Map();
    _fbxMissingImagesId = [];
    constructor(_gltf, _buffers, _gltfFilePath, options) {
        this._gltf = _gltf;
        this._buffers = _buffers;
        this._gltfFilePath = _gltfFilePath;
        options = options || {};
        this._logger = options.logger || GltfConverter._defaultLogger;
        this._gltf.extensionsRequired?.forEach((extensionRequired) => this._warnIfExtensionNotSupported(extensionRequired, true));
        this._gltf.extensionsUsed?.forEach((extensionUsed) => {
            if (!this._gltf.extensionsRequired?.includes(extensionUsed)) {
                // We've warned it before.
                this._warnIfExtensionNotSupported(extensionUsed, false);
            }
        });
        if (options.promoteSingleRootNode) {
            this._promoteSingleRootNodes();
        }
        // SubAsset importers are NOT guaranteed to be executed in-order
        // so all the interdependent data should be created right here
        // We require the scene graph is a disjoint union of strict trees.
        // This is also the requirement in glTf 2.0.
        if (this._gltf.nodes !== undefined) {
            this._parents = new Array(this._gltf.nodes.length).fill(-1);
            this._gltf.nodes.forEach((node, iNode) => {
                if (node.children !== undefined) {
                    for (const iChildNode of node.children) {
                        this._parents[iChildNode] = iNode;
                    }
                }
            });
        }
        if (this._gltf.skins) {
            this._skinRoots = new Array(this._gltf.skins.length).fill(skinRootNotCalculated);
        }
        this._nodePathTable = this._createNodePathTable();
        const userData = options.userData || {};
        if (this._gltf.meshes) {
            // split the meshes
            const normals = userData.normals ?? interface_1.NormalImportSetting.require;
            const tangents = userData.tangents ?? interface_1.TangentImportSetting.require;
            const morphNormals = userData.morphNormals ?? interface_1.NormalImportSetting.exclude;
            for (let i = 0; i < this._gltf.meshes.length; i++) {
                const gltfMesh = this._gltf.meshes[i];
                const minPosition = new cc_1.Vec3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
                const maxPosition = new cc_1.Vec3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
                const { geometries, materialIndices, jointMaps } = pp_geometry_1.PPGeometry.skinningProcess(gltfMesh.primitives.map((gltfPrimitive, primitiveIndex) => {
                    const ppGeometry = this._readPrimitive(gltfPrimitive, i, primitiveIndex);
                    // If there are more than 4 joints, we should reduce it
                    // since our engine currently can process only up to 4 joints.
                    ppGeometry.reduceJointInfluences();
                    this._applySettings(ppGeometry, normals, tangents, morphNormals, primitiveIndex, i);
                    this._readBounds(gltfPrimitive, v3Min, v3Max);
                    cc_1.Vec3.min(minPosition, minPosition, v3Min);
                    cc_1.Vec3.max(maxPosition, maxPosition, v3Max);
                    ppGeometry.sanityCheck();
                    return ppGeometry;
                }), userData.disableMeshSplit === false ? false : true);
                this._processedMeshes.push({ geometries, materialIndices, jointMaps, minPosition, maxPosition });
            }
        }
        if (this._gltf.nodes && this._gltf.skins) {
            const nodes = this._gltf.nodes;
            const candidates = [];
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.mesh !== undefined && node.skin === undefined) {
                    candidates.push(i);
                }
            }
            for (let i = 0; i < candidates.length; i++) {
                const candidate = candidates[i];
                if (candidates.some((node) => this._isAncestorOf(node, candidate))) {
                    candidates[i] = candidates[candidates.length - 1];
                    candidates.length--;
                    i--;
                }
            }
            for (let i = 0; i < candidates.length; i++) {
                const node = candidates[i];
                const parent = nodes[this._getParent(node)];
                if (parent) {
                    this._socketMappings.set(this._getNodePath(node), parent.name + ' Socket/' + nodes[node].name);
                }
            }
        }
    }
    createMesh(iGltfMesh, bGenerateLightmapUV = false, bAddVertexColor = false) {
        const processedMesh = this._processedMeshes[iGltfMesh];
        const glTFMesh = this._gltf.meshes[iGltfMesh];
        const bufferBlob = new BufferBlob();
        const vertexBundles = new Array();
        const primitives = processedMesh.geometries.map((ppGeometry, primitiveIndex) => {
            const { vertexCount, vertexStride, formats, vertexBuffer } = interleaveVertices(ppGeometry, bGenerateLightmapUV, bAddVertexColor);
            bufferBlob.setNextAlignment(0);
            vertexBundles.push({
                view: {
                    offset: bufferBlob.getLength(),
                    length: vertexBuffer.byteLength,
                    count: vertexCount,
                    stride: vertexStride,
                },
                attributes: formats,
            });
            bufferBlob.addBuffer(vertexBuffer);
            const primitive = {
                primitiveMode: ppGeometry.primitiveMode,
                jointMapIndex: ppGeometry.jointMapIndex,
                vertexBundelIndices: [primitiveIndex],
            };
            if (ppGeometry.indices !== undefined) {
                const indices = ppGeometry.indices;
                bufferBlob.setNextAlignment(indices.BYTES_PER_ELEMENT);
                primitive.indexView = {
                    offset: bufferBlob.getLength(),
                    length: indices.byteLength,
                    count: indices.length,
                    stride: indices.BYTES_PER_ELEMENT,
                };
                bufferBlob.addBuffer(indices.buffer);
            }
            return primitive;
        });
        const meshStruct = {
            primitives,
            vertexBundles,
            minPosition: processedMesh.minPosition,
            maxPosition: processedMesh.maxPosition,
            jointMaps: processedMesh.jointMaps,
        };
        const exportMorph = true;
        if (exportMorph) {
            const subMeshMorphs = processedMesh.geometries.map((ppGeometry) => {
                let nTargets = 0;
                const attributes = [];
                ppGeometry.forEachAttribute((attribute) => {
                    if (!attribute.morphs) {
                        return;
                    }
                    if (nTargets === 0) {
                        nTargets = attribute.morphs.length;
                    }
                    else if (nTargets !== attribute.morphs.length) {
                        throw new Error('Bad morph...');
                    }
                    attributes.push(attribute);
                });
                if (nTargets === 0) {
                    return null;
                }
                const targets = new Array(nTargets);
                for (let iTarget = 0; iTarget < nTargets; ++iTarget) {
                    targets[iTarget] = {
                        displacements: attributes.map((attribute) => {
                            const attributeMorph = attribute.morphs[iTarget];
                            // Align as requirement of corresponding typed array.
                            bufferBlob.setNextAlignment(attributeMorph.BYTES_PER_ELEMENT);
                            const offset = bufferBlob.getLength();
                            bufferBlob.addBuffer(attributeMorph.buffer);
                            return {
                                offset,
                                length: attributeMorph.byteLength,
                                stride: attributeMorph.BYTES_PER_ELEMENT,
                                count: attributeMorph.length,
                            };
                        }),
                    };
                }
                return {
                    attributes: attributes.map((attribute) => (0, pp_geometry_1.getGfxAttributeName)(attribute)), // TODO
                    targets,
                };
            });
            const firstNonNullSubMeshMorph = subMeshMorphs.find((subMeshMorph) => subMeshMorph !== null);
            if (firstNonNullSubMeshMorph) {
                assertGlTFConformance(subMeshMorphs.every((subMeshMorph) => !subMeshMorph || subMeshMorph.targets.length === firstNonNullSubMeshMorph.targets.length), 'glTF expects that every primitive has same number of targets');
                if (subMeshMorphs.length !== 0) {
                    assertGlTFConformance(glTFMesh.weights === undefined || glTFMesh.weights.length === firstNonNullSubMeshMorph.targets.length, 'Number of "weights" mismatch number of morph targets');
                }
                meshStruct.morph = {
                    subMeshMorphs,
                    weights: glTFMesh.weights,
                };
                // https://github.com/KhronosGroup/glTF/pull/1631
                // > Implementation note: A significant number of authoring and client implementations associate names with morph targets.
                // > While the glTF 2.0 specification currently does not provide a way to specify names,
                // > most tools use an array of strings, mesh.extras.targetNames, for this purpose.
                // > The targetNames array and all primitive targets arrays must have the same length.
                if (typeof glTFMesh.extras === 'object' && Array.isArray(glTFMesh.extras.targetNames)) {
                    const targetNames = glTFMesh.extras.targetNames;
                    if (targetNames.length === firstNonNullSubMeshMorph.targets.length &&
                        targetNames.every((elem) => typeof elem === 'string')) {
                        meshStruct.morph.targetNames = targetNames.slice();
                    }
                }
            }
        }
        const mesh = new cc.Mesh();
        mesh.name = this._getGltfXXName(GltfAssetKind.Mesh, iGltfMesh);
        mesh.assign(meshStruct, bufferBlob.getCombined());
        mesh.hash; // serialize hashes
        return mesh;
    }
    createSkeleton(iGltfSkin, sortMap) {
        const gltfSkin = this._gltf.skins[iGltfSkin];
        const skeleton = new cc.Skeleton();
        skeleton.name = this._getGltfXXName(GltfAssetKind.Skin, iGltfSkin);
        // @ts-ignore TS2551
        skeleton._joints = gltfSkin.joints.map((j) => this._mapToSocketPath(this._getNodePath(j)));
        if (gltfSkin.inverseBindMatrices !== undefined) {
            const inverseBindMatricesAccessor = this._gltf.accessors[gltfSkin.inverseBindMatrices];
            if (inverseBindMatricesAccessor.componentType !== glTF_constants_1.GltfAccessorComponentType.FLOAT || inverseBindMatricesAccessor.type !== 'MAT4') {
                throw new Error('The inverse bind matrix should be floating-point 4x4 matrix.');
            }
            const bindposes = new Array(gltfSkin.joints.length);
            const data = new Float32Array(bindposes.length * 16);
            this._readAccessor(inverseBindMatricesAccessor, createDataViewFromTypedArray(data));
            assertGlTFConformance(data.length === 16 * bindposes.length, 'Wrong data in bind-poses accessor.');
            for (let i = 0; i < bindposes.length; ++i) {
                bindposes[i] = new cc_1.Mat4(data[16 * i + 0], data[16 * i + 1], data[16 * i + 2], data[16 * i + 3], data[16 * i + 4], data[16 * i + 5], data[16 * i + 6], data[16 * i + 7], data[16 * i + 8], data[16 * i + 9], data[16 * i + 10], data[16 * i + 11], data[16 * i + 12], data[16 * i + 13], data[16 * i + 14], data[16 * i + 15]);
            }
            // @ts-ignore TS2551
            skeleton._bindposes = bindposes;
        }
        skeleton.hash; // serialize hashes
        return skeleton;
    }
    getAnimationDuration(iGltfAnimation) {
        const gltfAnimation = this._gltf.animations[iGltfAnimation];
        let duration = 0;
        gltfAnimation.channels.forEach((gltfChannel) => {
            const targetNode = gltfChannel.target.node;
            if (targetNode === undefined) {
                // When node isn't defined, channel should be ignored.
                return;
            }
            const sampler = gltfAnimation.samplers[gltfChannel.sampler];
            const inputAccessor = this._gltf.accessors[sampler.input];
            const channelDuration = inputAccessor.max !== undefined && inputAccessor.max.length === 1 ? Math.fround(inputAccessor.max[0]) : 0;
            duration = Math.max(channelDuration, duration);
        });
        return duration;
    }
    createAnimation(iGltfAnimation) {
        const gltfAnimation = this._gltf.animations[iGltfAnimation];
        const glTFTrsAnimationData = new glTF_animation_utils_1.GlTFTrsAnimationData();
        const getJointCurveData = (node) => {
            const path = this._mapToSocketPath(this._getNodePath(node));
            return glTFTrsAnimationData.addNodeAnimation(path);
        };
        let duration = 0;
        const keys = new Array();
        const keysMap = new Map();
        const getKeysIndex = (iInputAccessor) => {
            let i = keysMap.get(iInputAccessor);
            if (i === undefined) {
                const inputAccessor = this._gltf.accessors[iInputAccessor];
                const inputs = this._readAccessorIntoArray(inputAccessor);
                i = keys.length;
                keys.push(inputs);
                keysMap.set(iInputAccessor, i);
            }
            return i;
        };
        const tracks = [];
        gltfAnimation.channels.forEach((gltfChannel) => {
            const targetNode = gltfChannel.target.node;
            if (targetNode === undefined) {
                // When node isn't defined, channel should be ignored.
                return;
            }
            const jointCurveData = getJointCurveData(targetNode);
            const sampler = gltfAnimation.samplers[gltfChannel.sampler];
            const iKeys = getKeysIndex(sampler.input);
            if (gltfChannel.target.path === 'weights') {
                tracks.push(...this._glTFWeightChannelToTracks(gltfAnimation, gltfChannel, keys[iKeys]));
            }
            else {
                this._gltfChannelToCurveData(gltfAnimation, gltfChannel, jointCurveData, keys[iKeys]);
            }
            const inputAccessor = this._gltf.accessors[sampler.input];
            const channelDuration = inputAccessor.max !== undefined && inputAccessor.max.length === 1 ? Math.fround(inputAccessor.max[0]) : 0;
            duration = Math.max(channelDuration, duration);
        });
        if (this._gltf.nodes) {
            const standaloneInput = new Float32Array([0.0]);
            const r = new cc_1.Quat();
            const t = new cc_1.Vec3();
            const s = new cc_1.Vec3();
            this._gltf.nodes.forEach((node, nodeIndex) => {
                if (this._promotedRootNodes.includes(nodeIndex)) {
                    // Promoted root nodes should not have animations.
                    return;
                }
                const jointCurveData = getJointCurveData(nodeIndex);
                let m;
                if (node.matrix) {
                    m = this._readNodeMatrix(node.matrix);
                    cc_1.Mat4.toRTS(m, r, t, s);
                }
                if (!jointCurveData.position) {
                    const v = new cc_1.Vec3();
                    if (node.translation) {
                        cc_1.Vec3.set(v, node.translation[0], node.translation[1], node.translation[2]);
                    }
                    else if (m) {
                        cc_1.Vec3.copy(v, t);
                    }
                    jointCurveData.setConstantPosition(v);
                }
                if (!jointCurveData.scale) {
                    const v = new cc_1.Vec3(1, 1, 1);
                    if (node.scale) {
                        cc_1.Vec3.set(v, node.scale[0], node.scale[1], node.scale[2]);
                    }
                    else if (m) {
                        cc_1.Vec3.copy(v, s);
                    }
                    jointCurveData.setConstantScale(v);
                }
                if (!jointCurveData.rotation) {
                    const v = new cc_1.Quat();
                    if (node.rotation) {
                        this._getNodeRotation(node.rotation, v);
                    }
                    else if (m) {
                        cc_1.Quat.copy(v, r);
                    }
                    jointCurveData.setConstantRotation(v);
                }
            });
        }
        const exoticAnimation = glTFTrsAnimationData.createExotic();
        const animationClip = new cc.AnimationClip();
        animationClip.name = this._getGltfXXName(GltfAssetKind.Animation, iGltfAnimation);
        animationClip.wrapMode = cc.AnimationClip.WrapMode.Loop;
        animationClip.duration = duration;
        animationClip.sample = 30;
        animationClip.hash; // serialize hashes
        animationClip.enableTrsBlending = true;
        tracks.forEach((track) => animationClip.addTrack(track));
        animationClip[exotic_animation_1.exoticAnimationTag] = exoticAnimation;
        return animationClip;
    }
    createMaterial(iGltfMaterial, gltfAssetFinder, effectGetter, options) {
        const useVertexColors = options.useVertexColors ?? true;
        const depthWriteInAlphaModeBlend = options.depthWriteInAlphaModeBlend ?? false;
        const smartMaterialEnabled = options.smartMaterialEnabled ?? false;
        const gltfMaterial = this._gltf.materials[iGltfMaterial];
        const isUnlit = (gltfMaterial.extensions && gltfMaterial.extensions.KHR_materials_unlit) !== undefined;
        const documentExtras = this._gltf.extras;
        // Transfer dcc default material attributes.
        if (smartMaterialEnabled) {
            let appName = '';
            if (typeof documentExtras === 'object' && documentExtras && 'FBX-glTF-conv' in documentExtras) {
                const fbxExtras = documentExtras['FBX-glTF-conv'];
                // ["FBX-glTF-conv"].fbxFileHeaderInfo.sceneInfo.original.applicationName
                if (typeof fbxExtras.fbxFileHeaderInfo !== 'undefined') {
                    if (typeof fbxExtras.fbxFileHeaderInfo.sceneInfo !== 'undefined') {
                        appName = fbxExtras.fbxFileHeaderInfo.sceneInfo.original.applicationName;
                    }
                    const APP_NAME_REGEX_BLENDER = /Blender/;
                    const APP_NAME_REGEX_MAYA = /Maya/;
                    const APP_NAME_REGEX_3DSMAX = /Max/;
                    const APP_NAME_REGEX_CINEMA4D = /Cinema/;
                    const APP_NAME_REGEX_MIXAMO = /mixamo/;
                    const rawData = gltfMaterial.extras['FBX-glTF-conv'].raw;
                    // debugger;
                    if (APP_NAME_REGEX_BLENDER.test(appName) || APP_NAME_REGEX_MIXAMO.test(appName)) {
                        if (rawData.type === 'phong') {
                            return this._convertBlenderPBRMaterial(gltfMaterial, iGltfMaterial, gltfAssetFinder, effectGetter);
                        }
                    }
                    else if (APP_NAME_REGEX_MAYA.test(appName)) {
                        if (rawData.type === 'phong' || rawData.type === 'lambert') {
                            return this._convertPhongMaterial(iGltfMaterial, gltfAssetFinder, effectGetter, AppId.MAYA, rawData.properties);
                        }
                        else if (rawData.properties.Maya) {
                            if (rawData.properties.Maya.value.TypeId.value === 1398031443) {
                                return this._convertMayaStandardSurface(iGltfMaterial, gltfAssetFinder, effectGetter, rawData.properties.Maya.value);
                            }
                        }
                    }
                    else if (APP_NAME_REGEX_3DSMAX.test(appName)) {
                        if (rawData.type === 'phong' || rawData.type === 'lambert') {
                            return this._convertPhongMaterial(iGltfMaterial, gltfAssetFinder, effectGetter, AppId.ADSK_3DS_MAX, rawData.properties);
                        }
                        if (rawData.properties['3dsMax'].value.ORIGINAL_MTL) {
                            if (rawData.properties['3dsMax'].value.ORIGINAL_MTL.value === 'PHYSICAL_MTL') {
                                return this._convertMaxPhysicalMaterial(iGltfMaterial, gltfAssetFinder, effectGetter, rawData.properties['3dsMax'].value.Parameters.value);
                            }
                        }
                    }
                    else if (APP_NAME_REGEX_CINEMA4D.test(appName)) {
                        if (rawData.type === 'phong' || rawData.type === 'lambert') {
                            return this._convertPhongMaterial(iGltfMaterial, gltfAssetFinder, effectGetter, AppId.CINEMA4D, rawData.properties);
                        }
                    }
                    if (rawData.type === 'phong' || rawData.type === 'lambert') {
                        return this._convertPhongMaterial(iGltfMaterial, gltfAssetFinder, effectGetter, AppId.UNKNOWN, rawData.properties);
                    }
                }
                else {
                    console.debug('Failed to read fbx header info, default material was used');
                }
            }
            else {
                console.debug('Failed to read fbx info.');
            }
        }
        else {
            const physicalMaterial = (() => {
                if (!(0, extras_1.hasOriginalMaterialExtras)(gltfMaterial.extras)) {
                    return null;
                }
                const { originalMaterial } = gltfMaterial.extras['FBX-glTF-conv'];
                if ((0, extras_1.isAdsk3dsMaxPhysicalMaterial)(originalMaterial)) {
                    return this._convertAdskPhysicalMaterial(gltfMaterial, iGltfMaterial, gltfAssetFinder, effectGetter, originalMaterial);
                }
                else {
                    return null;
                }
            })();
            if (physicalMaterial) {
                return physicalMaterial;
            }
        }
        const material = new cc.Material();
        material.name = this._getGltfXXName(GltfAssetKind.Material, iGltfMaterial);
        // @ts-ignore TS2445
        material._effectAsset = effectGetter(`db://internal/effects/${isUnlit ? 'builtin-unlit' : 'builtin-standard'}.effect`);
        const defines = {};
        const props = {};
        const states = {
            rasterizerState: {},
            blendState: { targets: [{}] },
            depthStencilState: {},
        };
        if (this._gltf.meshes) {
            for (let i = 0; i < this._gltf.meshes.length; i++) {
                const mesh = this._gltf.meshes[i];
                for (let j = 0; j < mesh.primitives.length; j++) {
                    const prim = mesh.primitives[j];
                    if (prim.material === iGltfMaterial) {
                        if (prim.attributes["COLOR_0" /* GltfSemanticName.COLOR_0 */] && useVertexColors) {
                            defines['USE_VERTEX_COLOR'] = true;
                        }
                        if (prim.attributes["TEXCOORD_1" /* GltfSemanticName.TEXCOORD_1 */]) {
                            defines['HAS_SECOND_UV'] = true;
                        }
                    }
                }
            }
        }
        // gltf Materials: https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Archived/KHR_materials_pbrSpecularGlossiness/README.md
        let hasPbrMetallicRoughness = false;
        if (gltfMaterial.pbrMetallicRoughness) {
            const pbrMetallicRoughness = gltfMaterial.pbrMetallicRoughness;
            if (pbrMetallicRoughness.baseColorTexture !== undefined) {
                hasPbrMetallicRoughness = true;
                const mainTexture = gltfAssetFinder.find('textures', pbrMetallicRoughness.baseColorTexture.index, cc.Texture2D);
                defines[isUnlit ? 'USE_TEXTURE' : 'USE_ALBEDO_MAP'] = mainTexture ? true : false;
                props['mainTexture'] = mainTexture;
                if (pbrMetallicRoughness.baseColorTexture.texCoord) {
                    defines['ALBEDO_UV'] = 'v_uv1';
                }
                if (pbrMetallicRoughness.baseColorTexture.extensions !== undefined) {
                    if (pbrMetallicRoughness.baseColorTexture.extensions.KHR_texture_transform) {
                        props['tilingOffset'] = this._khrTextureTransformToTiling(pbrMetallicRoughness.baseColorTexture.extensions.KHR_texture_transform);
                    }
                }
            }
            if (pbrMetallicRoughness.baseColorFactor) {
                hasPbrMetallicRoughness = true;
                const c = pbrMetallicRoughness.baseColorFactor;
                if (isUnlit) {
                    props['mainColor'] = new cc_1.Vec4(c[0], c[1], c[2], 1);
                }
                else {
                    props['albedoScale'] = new cc_1.Vec3(c[0], c[1], c[2]);
                }
            }
            if (pbrMetallicRoughness.metallicRoughnessTexture !== undefined) {
                hasPbrMetallicRoughness = true;
                defines['USE_PBR_MAP'] = true;
                props['pbrMap'] = gltfAssetFinder.find('textures', pbrMetallicRoughness.metallicRoughnessTexture.index, cc.Texture2D);
                props['metallic'] = 1;
                props['roughness'] = 1;
            }
            if (pbrMetallicRoughness.metallicFactor !== undefined) {
                hasPbrMetallicRoughness = true;
                props['metallic'] = pbrMetallicRoughness.metallicFactor;
            }
            if (pbrMetallicRoughness.roughnessFactor !== undefined) {
                hasPbrMetallicRoughness = true;
                props['roughness'] = pbrMetallicRoughness.roughnessFactor;
            }
        }
        if (!hasPbrMetallicRoughness) {
            if (gltfMaterial.extensions?.KHR_materials_pbrSpecularGlossiness) {
                return this._convertGltfPbrSpecularGlossiness(gltfMaterial, iGltfMaterial, gltfAssetFinder, effectGetter, depthWriteInAlphaModeBlend);
            }
        }
        if (gltfMaterial.normalTexture !== undefined) {
            const pbrNormalTexture = gltfMaterial.normalTexture;
            if (pbrNormalTexture.index !== undefined) {
                defines['USE_NORMAL_MAP'] = true;
                props['normalMap'] = gltfAssetFinder.find('textures', pbrNormalTexture.index, cc.Texture2D);
                if (pbrNormalTexture.scale !== undefined) {
                    props['normalStrenth'] = pbrNormalTexture.scale;
                }
            }
        }
        props['occlusion'] = 0.0;
        if (gltfMaterial.occlusionTexture) {
            const pbrOcclusionTexture = gltfMaterial.occlusionTexture;
            if (pbrOcclusionTexture.index !== undefined) {
                defines['USE_OCCLUSION_MAP'] = true;
                props['occlusionMap'] = gltfAssetFinder.find('textures', pbrOcclusionTexture.index, cc.Texture2D);
                if (pbrOcclusionTexture.strength !== undefined) {
                    props['occlusion'] = pbrOcclusionTexture.strength;
                }
            }
        }
        if (gltfMaterial.emissiveTexture !== undefined) {
            defines['USE_EMISSIVE_MAP'] = true;
            if (gltfMaterial.emissiveTexture.texCoord) {
                defines['EMISSIVE_UV'] = 'v_uv1';
            }
            props['emissiveMap'] = gltfAssetFinder.find('textures', gltfMaterial.emissiveTexture.index, cc.Texture2D);
        }
        if (gltfMaterial.emissiveFactor !== undefined) {
            const v = gltfMaterial.emissiveFactor;
            props['emissive'] = this._normalizeArrayToCocosColor(v)[1];
        }
        if (gltfMaterial.doubleSided) {
            states.rasterizerState.cullMode = cc_1.gfx.CullMode.NONE;
        }
        switch (gltfMaterial.alphaMode) {
            case 'BLEND': {
                const blendState = states.blendState.targets[0];
                blendState.blend = true;
                blendState.blendSrc = cc_1.gfx.BlendFactor.SRC_ALPHA;
                blendState.blendDst = cc_1.gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
                blendState.blendDstAlpha = cc_1.gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
                states.depthStencilState.depthWrite = depthWriteInAlphaModeBlend;
                break;
            }
            case 'MASK': {
                const alphaCutoff = gltfMaterial.alphaCutoff === undefined ? 0.5 : gltfMaterial.alphaCutoff;
                defines['USE_ALPHA_TEST'] = true;
                props['alphaThreshold'] = alphaCutoff;
                break;
            }
            case 'OPAQUE':
            case undefined:
                break;
            default:
                this._logger(GltfConverter.LogLevel.Warning, GltfConverter.ConverterError.UnsupportedAlphaMode, {
                    mode: gltfMaterial.alphaMode,
                    material: iGltfMaterial,
                });
                break;
        }
        // @ts-ignore TS2445
        material._defines = [defines];
        // @ts-ignore TS2445
        material._props = [props];
        // @ts-ignore TS2445
        material._states = [states];
        return material;
    }
    getTextureParameters(gltfTexture, userData) {
        const convertWrapMode = (gltfWrapMode) => {
            if (gltfWrapMode === undefined) {
                gltfWrapMode = glTF_constants_1.GltfWrapMode.__DEFAULT;
            }
            switch (gltfWrapMode) {
                case glTF_constants_1.GltfWrapMode.CLAMP_TO_EDGE:
                    return 'clamp-to-edge';
                case glTF_constants_1.GltfWrapMode.MIRRORED_REPEAT:
                    return 'mirrored-repeat';
                case glTF_constants_1.GltfWrapMode.REPEAT:
                    return 'repeat';
                default:
                    this._logger(GltfConverter.LogLevel.Warning, GltfConverter.ConverterError.UnsupportedTextureParameter, {
                        type: 'wrapMode',
                        value: gltfWrapMode,
                        fallback: glTF_constants_1.GltfWrapMode.REPEAT,
                        sampler: gltfTexture.sampler,
                        texture: this._gltf.textures.indexOf(gltfTexture),
                    });
                    return 'repeat';
            }
        };
        const convertMagFilter = (gltfFilter) => {
            switch (gltfFilter) {
                case glTF_constants_1.GltfTextureMagFilter.NEAREST:
                    return 'nearest';
                case glTF_constants_1.GltfTextureMagFilter.LINEAR:
                    return 'linear';
                default:
                    this._logger(GltfConverter.LogLevel.Warning, GltfConverter.ConverterError.UnsupportedTextureParameter, {
                        type: 'magFilter',
                        value: gltfFilter,
                        fallback: glTF_constants_1.GltfTextureMagFilter.LINEAR,
                        sampler: gltfTexture.sampler,
                        texture: this._gltf.textures.indexOf(gltfTexture),
                    });
                    return 'linear';
            }
        };
        // Also convert mip filter.
        const convertMinFilter = (gltfFilter) => {
            switch (gltfFilter) {
                case glTF_constants_1.GltfTextureMinFilter.NEAREST:
                    return ['nearest', 'none'];
                case glTF_constants_1.GltfTextureMinFilter.LINEAR:
                    return ['linear', 'none'];
                case glTF_constants_1.GltfTextureMinFilter.NEAREST_MIPMAP_NEAREST:
                    return ['nearest', 'nearest'];
                case glTF_constants_1.GltfTextureMinFilter.LINEAR_MIPMAP_NEAREST:
                    return ['linear', 'nearest'];
                case glTF_constants_1.GltfTextureMinFilter.NEAREST_MIPMAP_LINEAR:
                    return ['nearest', 'linear'];
                case glTF_constants_1.GltfTextureMinFilter.LINEAR_MIPMAP_LINEAR:
                    return ['linear', 'linear'];
                default:
                    this._logger(GltfConverter.LogLevel.Warning, GltfConverter.ConverterError.UnsupportedTextureParameter, {
                        type: 'minFilter',
                        value: gltfFilter,
                        fallback: glTF_constants_1.GltfTextureMinFilter.LINEAR,
                        sampler: gltfTexture.sampler,
                        texture: this._gltf.textures.indexOf(gltfTexture),
                    });
                    return ['linear', 'none'];
            }
        };
        if (gltfTexture.sampler === undefined) {
            userData.wrapModeS = 'repeat';
            userData.wrapModeT = 'repeat';
        }
        else {
            const gltfSampler = this._gltf.samplers[gltfTexture.sampler];
            userData.wrapModeS = convertWrapMode(gltfSampler.wrapS);
            userData.wrapModeT = convertWrapMode(gltfSampler.wrapT);
            userData.magfilter = gltfSampler.magFilter === undefined ? texture_base_1.defaultMagFilter : convertMagFilter(gltfSampler.magFilter);
            userData.minfilter = texture_base_1.defaultMinFilter;
            if (gltfSampler.minFilter !== undefined) {
                const [min, mip] = convertMinFilter(gltfSampler.minFilter);
                userData.minfilter = min;
                userData.mipfilter = mip;
            }
        }
    }
    createScene(iGltfScene, gltfAssetFinder, withTransform = true) {
        const scene = this._getSceneNode(iGltfScene, gltfAssetFinder, withTransform);
        // update skinning root to animation root node
        scene.getComponentsInChildren(cc.SkinnedMeshRenderer).forEach((comp) => (comp.skinningRoot = scene));
        return scene;
    }
    createSockets(sceneNode) {
        const sockets = [];
        for (const pair of this._socketMappings) {
            const node = sceneNode.getChildByPath(pair[0]);
            doCreateSocket(sceneNode, sockets, node);
        }
        return sockets;
    }
    readImageInBufferView(bufferView) {
        return this._readBufferView(bufferView);
    }
    _warnIfExtensionNotSupported(name, required) {
        if (!supportedExtensions.has(name)) {
            this._logger(GltfConverter.LogLevel.Warning, GltfConverter.ConverterError.UnsupportedExtension, {
                name,
                required,
            });
        }
    }
    _promoteSingleRootNodes() {
        if (this._gltf.nodes === undefined || this._gltf.scenes === undefined) {
            return;
        }
        for (const glTFScene of this._gltf.scenes) {
            if (glTFScene.nodes !== undefined && glTFScene.nodes.length === 1) {
                // If it's the only root node in the scene.
                // We would promote it to the prefab's root(i.e the skinning root).
                // So we cannot include it as part of the joint path or animation target path.
                const rootNodeIndex = glTFScene.nodes[0];
                // We can't perform this operation if the root participates in skinning, or--
                if (this._gltf.skins && this._gltf.skins.some((skin) => skin.joints.includes(rootNodeIndex))) {
                    continue;
                }
                // animation.
                if (this._gltf.animations &&
                    this._gltf.animations.some((animation) => animation.channels.some((channel) => channel.target.node === rootNodeIndex))) {
                    continue;
                }
                this._promotedRootNodes.push(rootNodeIndex);
            }
        }
    }
    _getNodeRotation(rotation, out) {
        cc_1.Quat.set(out, rotation[0], rotation[1], rotation[2], rotation[3]);
        cc_1.Quat.normalize(out, out);
        return out;
    }
    _gltfChannelToCurveData(gltfAnimation, gltfChannel, jointCurveData, input) {
        let propName;
        if (gltfChannel.target.path === glTF_constants_1.GltfAnimationChannelTargetPath.translation) {
            propName = 'position';
        }
        else if (gltfChannel.target.path === glTF_constants_1.GltfAnimationChannelTargetPath.rotation) {
            propName = 'rotation';
        }
        else if (gltfChannel.target.path === glTF_constants_1.GltfAnimationChannelTargetPath.scale) {
            propName = 'scale';
        }
        else {
            this._logger(GltfConverter.LogLevel.Error, GltfConverter.ConverterError.UnsupportedChannelPath, {
                channel: gltfAnimation.channels.indexOf(gltfChannel),
                animation: this._gltf.animations.indexOf(gltfAnimation),
                path: gltfChannel.target.path,
            });
            return;
        }
        const gltfSampler = gltfAnimation.samplers[gltfChannel.sampler];
        const interpolation = gltfSampler.interpolation ?? glTF_constants_1.GlTfAnimationInterpolation.LINEAR;
        switch (interpolation) {
            case glTF_constants_1.GlTfAnimationInterpolation.STEP:
            case glTF_constants_1.GlTfAnimationInterpolation.LINEAR:
            case glTF_constants_1.GlTfAnimationInterpolation.CUBIC_SPLINE:
                break;
            default:
                return;
        }
        const output = this._readAccessorIntoArrayAndNormalizeAsFloat(this._gltf.accessors[gltfSampler.output]);
        jointCurveData[propName] = new glTF_animation_utils_1.GlTFTrsTrackData(interpolation, input, output);
    }
    _glTFWeightChannelToTracks(gltfAnimation, gltfChannel, times) {
        const gltfSampler = gltfAnimation.samplers[gltfChannel.sampler];
        const outputs = this._readAccessorIntoArrayAndNormalizeAsFloat(this._gltf.accessors[gltfSampler.output]);
        const targetNode = this._gltf.nodes[gltfChannel.target.node];
        const targetProcessedMesh = this._processedMeshes[targetNode.mesh];
        const tracks = new Array();
        const nSubMeshes = targetProcessedMesh.geometries.length;
        let nTarget = 0;
        for (let iSubMesh = 0; iSubMesh < nSubMeshes; ++iSubMesh) {
            const geometry = targetProcessedMesh.geometries[iSubMesh];
            if (!geometry.hasAttribute(pp_geometry_1.PPGeometry.StdSemantics.position)) {
                continue;
            }
            const { morphs } = geometry.getAttribute(pp_geometry_1.PPGeometry.StdSemantics.position);
            if (!morphs) {
                continue;
            }
            nTarget = morphs.length;
            break;
        }
        if (nTarget === 0) {
            console.debug(`Morph animation in ${gltfAnimation.name} on node ${this._gltf.nodes[gltfChannel.target.node]}` +
                'is going to be ignored due to lack of morph information in mesh.');
            return [];
        }
        const track = new exotic_animation_1.RealArrayTrack();
        tracks.push(track);
        track.path = new cc.animation.TrackPath()
            .toHierarchy(this._mapToSocketPath(this._getNodePath(gltfChannel.target.node)))
            .toComponent(cc.js.getClassName(cc.MeshRenderer));
        track.proxy = new cc.animation.MorphWeightsAllValueProxy();
        track.elementCount = nTarget;
        for (let iTarget = 0; iTarget < nTarget; ++iTarget) {
            const { curve } = track.channels()[iTarget];
            const frameValues = Array.from({ length: times.length }, (_, index) => {
                const value = outputs[nTarget * index + iTarget];
                const keyframeValue = { value, interpolationMode: cc.RealInterpolationMode.LINEAR };
                return keyframeValue;
            });
            curve.assignSorted(Array.from(times), frameValues);
        }
        return tracks;
    }
    _getParent(node) {
        return this._parents[node];
    }
    _getRootParent(node) {
        for (let parent = node; parent >= 0; parent = this._getParent(node)) {
            node = parent;
        }
        return node;
    }
    _commonRoot(nodes) {
        let minPathLen = Infinity;
        const paths = nodes.map((node) => {
            const path = [];
            let curNode = node;
            while (curNode >= 0) {
                path.unshift(curNode);
                curNode = this._getParent(curNode);
            }
            minPathLen = Math.min(minPathLen, path.length);
            return path;
        });
        if (paths.length === 0) {
            return -1;
        }
        const commonPath = [];
        for (let i = 0; i < minPathLen; ++i) {
            const n = paths[0][i];
            if (paths.every((path) => path[i] === n)) {
                commonPath.push(n);
            }
            else {
                break;
            }
        }
        if (commonPath.length === 0) {
            return -1;
        }
        return commonPath[commonPath.length - 1];
    }
    _getSkinRoot(skin) {
        let result = this._skinRoots[skin];
        if (result === skinRootNotCalculated) {
            result = this._commonRoot(this._gltf.skins[skin].joints);
            this._skinRoots[skin] = result;
        }
        return result;
    }
    _readPrimitive(glTFPrimitive, meshIndex, primitiveIndex) {
        let decodedDracoGeometry = null;
        if (glTFPrimitive.extensions) {
            for (const extensionName of Object.keys(glTFPrimitive.extensions)) {
                const extension = glTFPrimitive.extensions[extensionName];
                switch (extensionName) {
                    case 'KHR_draco_mesh_compression':
                        decodedDracoGeometry = this._decodeDracoGeometry(glTFPrimitive, extension);
                        break;
                }
            }
        }
        const primitiveMode = this._getPrimitiveMode(glTFPrimitive.mode === undefined ? glTF_constants_1.GltfPrimitiveMode.__DEFAULT : glTFPrimitive.mode);
        let indices;
        if (glTFPrimitive.indices !== undefined) {
            let data;
            if (decodedDracoGeometry && decodedDracoGeometry.indices) {
                data = decodedDracoGeometry.indices;
            }
            else {
                const indicesAccessor = this._gltf.accessors[glTFPrimitive.indices];
                data = this._readAccessorIntoArray(indicesAccessor);
            }
            indices = data;
        }
        if (!("POSITION" /* GltfSemanticName.POSITION */ in glTFPrimitive.attributes)) {
            throw new Error('The primitive doesn\'t contains positions.');
        }
        // TODO: mismatch in glTF-sample-module:Monster-Draco?
        const nVertices = decodedDracoGeometry
            ? decodedDracoGeometry.vertices["POSITION" /* GltfSemanticName.POSITION */].length / 3
            : this._gltf.accessors[glTFPrimitive.attributes["POSITION" /* GltfSemanticName.POSITION */]].count;
        const ppGeometry = new pp_geometry_1.PPGeometry(nVertices, primitiveMode, indices);
        for (const attributeName of Object.getOwnPropertyNames(glTFPrimitive.attributes)) {
            const attributeAccessor = this._gltf.accessors[glTFPrimitive.attributes[attributeName]];
            let data;
            if (decodedDracoGeometry && attributeName in decodedDracoGeometry.vertices) {
                const dracoDecodedAttribute = decodedDracoGeometry.vertices[attributeName];
                data = dracoDecodedAttribute;
            }
            else {
                const plainAttribute = this._readAccessorIntoArray(attributeAccessor);
                data = plainAttribute;
            }
            const semantic = glTFAttributeNameToPP(attributeName);
            const components = this._getComponentsPerAttribute(attributeAccessor.type);
            ppGeometry.setAttribute(semantic, data, components);
        }
        if (glTFPrimitive.targets) {
            const attributes = Object.getOwnPropertyNames(glTFPrimitive.targets[0]);
            for (const attribute of attributes) {
                // Check if the morph-attributes are valid.
                const semantic = glTFAttributeNameToPP(attribute);
                if (!pp_geometry_1.PPGeometry.isStdSemantic(semantic) ||
                    ![pp_geometry_1.PPGeometry.StdSemantics.position, pp_geometry_1.PPGeometry.StdSemantics.normal, pp_geometry_1.PPGeometry.StdSemantics.tangent].includes(semantic)) {
                    throw new Error(`Only position, normal, tangent attribute are morph-able, but provide ${attribute}`);
                }
                assertGlTFConformance(ppGeometry.hasAttribute(semantic), `Primitive do not have attribute ${attribute} for morph.`);
                const ppAttribute = ppGeometry.getAttribute(semantic);
                ppAttribute.morphs = new Array(glTFPrimitive.targets.length);
                for (let iTarget = 0; iTarget < glTFPrimitive.targets.length; ++iTarget) {
                    const morphTarget = glTFPrimitive.targets[iTarget];
                    // All targets shall have same morph-attributes.
                    assertGlTFConformance(attribute in morphTarget, 'Morph attributes in all target must be same.');
                    // Extracts the displacements.
                    const attributeAccessor = this._gltf.accessors[morphTarget[attribute]];
                    const morphDisplacement = this._readAccessorIntoArray(attributeAccessor);
                    ppAttribute.morphs[iTarget] = morphDisplacement;
                    // const mainData = ppGeometry.getAttribute(semantic).data;
                    // assertGlTFConformance(ppGeometry.length === data.length,
                    //     `Count of morph attribute ${targetAttribute} mismatch which in primitive.`);
                }
            }
            // If all targets are zero, which means no any displacement, we exclude it from morphing.
            // Should we?
            // Edit: in cocos/3d-tasks#11585 we can see that
            // in mesh 0 there are 11 primitives, 8 of them have empty morph data.
            // So I decide to silence the warning and leave it as `verbose`.
            let nonEmptyMorph = false;
            ppGeometry.forEachAttribute((attribute) => {
                if (!nonEmptyMorph &&
                    attribute.morphs &&
                    attribute.morphs.some((displacement) => displacement.some((v) => v !== 0))) {
                    nonEmptyMorph = true;
                }
            });
            if (!nonEmptyMorph) {
                this._logger(GltfConverter.LogLevel.Debug, GltfConverter.ConverterError.EmptyMorph, {
                    mesh: meshIndex,
                    primitive: primitiveIndex,
                });
            }
        }
        return ppGeometry;
    }
    _decodeDracoGeometry(glTFPrimitive, extension) {
        const bufferView = this._gltf.bufferViews[extension.bufferView];
        const buffer = this._buffers[bufferView.buffer];
        const bufferViewOffset = bufferView.byteOffset === undefined ? 0 : bufferView.byteOffset;
        const compressedData = buffer.slice(bufferViewOffset, bufferViewOffset + bufferView.byteLength);
        const options = {
            buffer: new Int8Array(compressedData),
            attributes: {},
        };
        if (glTFPrimitive.indices !== undefined) {
            options.indices = this._getAttributeBaseTypeStorage(this._gltf.accessors[glTFPrimitive.indices].componentType);
        }
        for (const attributeName of Object.keys(extension.attributes)) {
            if (attributeName in glTFPrimitive.attributes) {
                const accessor = this._gltf.accessors[glTFPrimitive.attributes[attributeName]];
                options.attributes[attributeName] = {
                    uniqueId: extension.attributes[attributeName],
                    storageConstructor: this._getAttributeBaseTypeStorage(accessor.componentType),
                    components: this._getComponentsPerAttribute(accessor.type),
                };
            }
        }
        return (0, khr_draco_mesh_compression_1.decodeDracoGeometry)(options);
    }
    _readBounds(glTFPrimitive, minPosition, maxPosition) {
        // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#accessors-bounds
        // > JavaScript client implementations should convert JSON-parsed floating-point doubles to single precision,
        // > when componentType is 5126 (FLOAT).
        const iPositionAccessor = glTFPrimitive.attributes["POSITION" /* GltfSemanticName.POSITION */];
        if (iPositionAccessor !== undefined) {
            const positionAccessor = this._gltf.accessors[iPositionAccessor];
            if (positionAccessor.min) {
                if (positionAccessor.componentType === glTF_constants_1.GltfAccessorComponentType.FLOAT) {
                    minPosition.x = Math.fround(positionAccessor.min[0]);
                    minPosition.y = Math.fround(positionAccessor.min[1]);
                    minPosition.z = Math.fround(positionAccessor.min[2]);
                }
                else {
                    minPosition.x = positionAccessor.min[0];
                    minPosition.y = positionAccessor.min[1];
                    minPosition.z = positionAccessor.min[2];
                }
            }
            if (positionAccessor.max) {
                if (positionAccessor.componentType === glTF_constants_1.GltfAccessorComponentType.FLOAT) {
                    maxPosition.x = Math.fround(positionAccessor.max[0]);
                    maxPosition.y = Math.fround(positionAccessor.max[1]);
                    maxPosition.z = Math.fround(positionAccessor.max[2]);
                }
                else {
                    maxPosition.x = positionAccessor.max[0];
                    maxPosition.y = positionAccessor.max[1];
                    maxPosition.z = positionAccessor.max[2];
                }
            }
        }
    }
    _applySettings(ppGeometry, normalImportSetting, tangentImportSetting, morphNormalsImportSetting, primitiveIndex, meshIndex) {
        if (normalImportSetting === interface_1.NormalImportSetting.recalculate ||
            (normalImportSetting === interface_1.NormalImportSetting.require && !ppGeometry.hasAttribute(pp_geometry_1.PPGeometry.StdSemantics.normal))) {
            const normals = ppGeometry.calculateNormals();
            ppGeometry.setAttribute(pp_geometry_1.PPGeometry.StdSemantics.normal, normals, 3);
        }
        else if (normalImportSetting === interface_1.NormalImportSetting.exclude && ppGeometry.hasAttribute(pp_geometry_1.PPGeometry.StdSemantics.normal)) {
            ppGeometry.deleteAttribute(pp_geometry_1.PPGeometry.StdSemantics.normal);
        }
        if (tangentImportSetting === interface_1.TangentImportSetting.recalculate ||
            (tangentImportSetting === interface_1.TangentImportSetting.require && !ppGeometry.hasAttribute(pp_geometry_1.PPGeometry.StdSemantics.tangent))) {
            if (!ppGeometry.hasAttribute(pp_geometry_1.PPGeometry.StdSemantics.normal)) {
                this._logger(GltfConverter.LogLevel.Warning, GltfConverter.ConverterError.FailedToCalculateTangents, {
                    reason: 'normal',
                    primitive: primitiveIndex,
                    mesh: meshIndex,
                });
            }
            else if (!ppGeometry.hasAttribute(pp_geometry_1.PPGeometry.StdSemantics.texcoord)) {
                this._logger(GltfConverter.LogLevel.Debug, GltfConverter.ConverterError.FailedToCalculateTangents, {
                    reason: 'uv',
                    primitive: primitiveIndex,
                    mesh: meshIndex,
                });
            }
            else {
                const tangents = ppGeometry.calculateTangents();
                ppGeometry.setAttribute(pp_geometry_1.PPGeometry.StdSemantics.tangent, tangents, 4);
            }
        }
        else if (tangentImportSetting === interface_1.TangentImportSetting.exclude && ppGeometry.hasAttribute(pp_geometry_1.PPGeometry.StdSemantics.tangent)) {
            ppGeometry.deleteAttribute(pp_geometry_1.PPGeometry.StdSemantics.tangent);
        }
        if (morphNormalsImportSetting === interface_1.NormalImportSetting.exclude && ppGeometry.hasAttribute(pp_geometry_1.PPGeometry.StdSemantics.normal)) {
            const normalAttribute = ppGeometry.getAttribute(pp_geometry_1.PPGeometry.StdSemantics.normal);
            normalAttribute.morphs = null;
        }
    }
    _readBufferView(bufferView) {
        const buffer = this._buffers[bufferView.buffer];
        return Buffer.from(buffer.buffer, buffer.byteOffset + (bufferView.byteOffset || 0), bufferView.byteLength);
    }
    _readAccessorIntoArray(gltfAccessor) {
        const storageConstructor = this._getAttributeBaseTypeStorage(gltfAccessor.componentType);
        const result = new storageConstructor(gltfAccessor.count * this._getComponentsPerAttribute(gltfAccessor.type));
        this._readAccessor(gltfAccessor, createDataViewFromTypedArray(result));
        if (gltfAccessor.sparse !== undefined) {
            this._applyDeviation(gltfAccessor, result);
        }
        return result;
    }
    _readAccessorIntoArrayAndNormalizeAsFloat(gltfAccessor) {
        let outputs = this._readAccessorIntoArray(gltfAccessor);
        if (!(outputs instanceof Float32Array)) {
            const normalizedOutput = new Float32Array(outputs.length);
            const normalize = (() => {
                if (outputs instanceof Int8Array) {
                    return (value) => {
                        return Math.max(value / 127.0, -1.0);
                    };
                }
                else if (outputs instanceof Uint8Array) {
                    return (value) => {
                        return value / 255.0;
                    };
                }
                else if (outputs instanceof Int16Array) {
                    return (value) => {
                        return Math.max(value / 32767.0, -1.0);
                    };
                }
                else if (outputs instanceof Uint16Array) {
                    return (value) => {
                        return value / 65535.0;
                    };
                }
                else {
                    return (value) => {
                        return value;
                    };
                }
            })();
            for (let i = 0; i < outputs.length; ++i) {
                normalizedOutput[i] = normalize(outputs[i]); // Do normalize.
            }
            outputs = normalizedOutput;
        }
        return outputs;
    }
    _getSceneNode(iGltfScene, gltfAssetFinder, withTransform = true) {
        const sceneName = this._getGltfXXName(GltfAssetKind.Scene, iGltfScene);
        const gltfScene = this._gltf.scenes[iGltfScene];
        let sceneNode;
        if (!gltfScene.nodes || gltfScene.nodes.length === 0) {
            sceneNode = new cc.Node(sceneName);
        }
        else {
            const glTFSceneRootNodes = gltfScene.nodes;
            const mapping = new Array(this._gltf.nodes.length).fill(null);
            if (gltfScene.nodes.length === 1 && this._promotedRootNodes.includes(gltfScene.nodes[0])) {
                const promotedRootNode = gltfScene.nodes[0];
                sceneNode = this._createEmptyNodeRecursive(promotedRootNode, mapping, withTransform);
            }
            else {
                sceneNode = new cc.Node(sceneName);
                for (const node of gltfScene.nodes) {
                    const root = this._createEmptyNodeRecursive(node, mapping, withTransform);
                    root.parent = sceneNode;
                }
            }
            mapping.forEach((node, iGltfNode) => {
                this._setupNode(iGltfNode, mapping, gltfAssetFinder, sceneNode, glTFSceneRootNodes);
            });
        }
        return sceneNode;
    }
    _createEmptyNodeRecursive(iGltfNode, mapping, withTransform = true) {
        const gltfNode = this._gltf.nodes[iGltfNode];
        const result = this._createEmptyNode(iGltfNode, withTransform);
        if (gltfNode.children !== undefined) {
            for (const child of gltfNode.children) {
                const childResult = this._createEmptyNodeRecursive(child, mapping, withTransform);
                childResult.parent = result;
            }
        }
        mapping[iGltfNode] = result;
        return result;
    }
    _setupNode(iGltfNode, mapping, gltfAssetFinder, sceneNode, glTFSceneRootNodes) {
        const node = mapping[iGltfNode];
        if (node === null) {
            return;
        }
        const gltfNode = this._gltf.nodes[iGltfNode];
        if (gltfNode.mesh !== undefined) {
            let modelComponent = null;
            if (gltfNode.skin === undefined) {
                modelComponent = node.addComponent(cc.MeshRenderer);
            }
            else {
                const skinningModelComponent = node.addComponent(cc.SkinnedMeshRenderer);
                const skeleton = gltfAssetFinder.find('skeletons', gltfNode.skin, cc.Skeleton);
                if (skeleton) {
                    skinningModelComponent.skeleton = skeleton;
                }
                const skinRoot = mapping[this._getSkinRoot(gltfNode.skin)];
                if (skinRoot === null) {
                    // They do not have common root.
                    // This may be caused by root parent nodes of them are different but they are all under same scene.
                    const glTFSkin = this.gltf.skins[gltfNode.skin];
                    const isUnderSameScene = glTFSkin.joints.every((joint) => glTFSceneRootNodes.includes(this._getRootParent(joint)));
                    if (isUnderSameScene) {
                        skinningModelComponent.skinningRoot = sceneNode;
                    }
                    else {
                        this._logger(GltfConverter.LogLevel.Error, GltfConverter.ConverterError.ReferenceSkinInDifferentScene, {
                            node: iGltfNode,
                            skin: gltfNode.skin,
                        });
                    }
                }
                else {
                    // assign a temporary root
                    skinningModelComponent.skinningRoot = skinRoot;
                }
                modelComponent = skinningModelComponent;
            }
            const mesh = gltfAssetFinder.find('meshes', gltfNode.mesh, cc.Mesh);
            if (mesh) {
                // @ts-ignore TS2445
                modelComponent._mesh = mesh;
            }
            const gltfMesh = this.gltf.meshes[gltfNode.mesh];
            const processedMesh = this._processedMeshes[gltfNode.mesh];
            const materials = processedMesh.materialIndices.map((idx) => {
                const gltfPrimitive = gltfMesh.primitives[idx];
                if (gltfPrimitive.material === undefined) {
                    return null;
                }
                else {
                    const material = gltfAssetFinder.find('materials', gltfPrimitive.material, cc.Material);
                    if (material) {
                        return material;
                    }
                }
                return null;
            });
            // @ts-ignore TS2445
            modelComponent._materials = materials;
        }
    }
    _createEmptyNode(iGltfNode, withTransform = true) {
        const gltfNode = this._gltf.nodes[iGltfNode];
        const nodeName = this._getGltfXXName(GltfAssetKind.Node, iGltfNode);
        const node = new cc.Node(nodeName);
        if (!withTransform) {
            return node;
        }
        if (gltfNode.translation) {
            node.setPosition(gltfNode.translation[0], gltfNode.translation[1], gltfNode.translation[2]);
        }
        if (gltfNode.rotation) {
            node.setRotation(this._getNodeRotation(gltfNode.rotation, new cc_1.Quat()));
        }
        if (gltfNode.scale) {
            node.setScale(gltfNode.scale[0], gltfNode.scale[1], gltfNode.scale[2]);
        }
        if (gltfNode.matrix) {
            const ns = gltfNode.matrix;
            const m = this._readNodeMatrix(ns);
            const t = new cc_1.Vec3();
            const r = new cc_1.Quat();
            const s = new cc_1.Vec3();
            cc_1.Mat4.toRTS(m, r, t, s);
            node.setPosition(t);
            node.setRotation(r);
            node.setScale(s);
        }
        return node;
    }
    _readNodeMatrix(ns) {
        return new cc_1.Mat4(ns[0], ns[1], ns[2], ns[3], ns[4], ns[5], ns[6], ns[7], ns[8], ns[9], ns[10], ns[11], ns[12], ns[13], ns[14], ns[15]);
    }
    _getNodePath(node) {
        return this._nodePathTable[node];
    }
    _isAncestorOf(parent, child) {
        if (parent !== child) {
            while (child >= 0) {
                if (child === parent) {
                    return true;
                }
                child = this._getParent(child);
            }
        }
        return false;
    }
    _mapToSocketPath(path) {
        for (const pair of this._socketMappings) {
            if (path !== pair[0] && !path.startsWith(pair[0] + '/')) {
                continue;
            }
            return pair[1] + path.slice(pair[0].length);
        }
        return path;
    }
    _createNodePathTable() {
        if (this._gltf.nodes === undefined) {
            return [];
        }
        const parentTable = new Array(this._gltf.nodes.length).fill(-1);
        this._gltf.nodes.forEach((gltfNode, nodeIndex) => {
            if (gltfNode.children) {
                gltfNode.children.forEach((iChildNode) => {
                    parentTable[iChildNode] = nodeIndex;
                });
                const names = gltfNode.children.map((iChildNode) => {
                    const childNode = this._gltf.nodes[iChildNode];
                    let name = childNode.name;
                    if (typeof name !== 'string' || name.length === 0) {
                        name = null;
                    }
                    return name;
                });
                const uniqueNames = makeUniqueNames(names, uniqueChildNodeNameGenerator);
                uniqueNames.forEach((uniqueName, iUniqueName) => {
                    this._gltf.nodes[gltfNode.children[iUniqueName]].name = uniqueName;
                });
            }
        });
        const nodeNames = new Array(this._gltf.nodes.length).fill('');
        for (let iNode = 0; iNode < nodeNames.length; ++iNode) {
            nodeNames[iNode] = this._getGltfXXName(GltfAssetKind.Node, iNode);
        }
        const result = new Array(this._gltf.nodes.length).fill('');
        this._gltf.nodes.forEach((gltfNode, nodeIndex) => {
            const segments = [];
            for (let i = nodeIndex; i >= 0; i = parentTable[i]) {
                // Promoted node is not part of node path
                if (!this._promotedRootNodes.includes(i)) {
                    segments.unshift(nodeNames[i]);
                }
            }
            result[nodeIndex] = segments.join('/');
        });
        return result;
    }
    /**
     * Note, if `bufferView` property is not defined, this method will do nothing.
     * So you should ensure that the data area of `outputBuffer` is filled with `0`s.
     * @param gltfAccessor
     * @param outputBuffer
     * @param outputStride
     */
    _readAccessor(gltfAccessor, outputBuffer, outputStride = 0) {
        // When not defined, accessor must be initialized with zeros.
        if (gltfAccessor.bufferView === undefined) {
            return;
        }
        const gltfBufferView = this._gltf.bufferViews[gltfAccessor.bufferView];
        const componentsPerAttribute = this._getComponentsPerAttribute(gltfAccessor.type);
        const bytesPerElement = this._getBytesPerComponent(gltfAccessor.componentType);
        if (outputStride === 0) {
            outputStride = componentsPerAttribute * bytesPerElement;
        }
        const inputStartOffset = (gltfAccessor.byteOffset !== undefined ? gltfAccessor.byteOffset : 0) +
            (gltfBufferView.byteOffset !== undefined ? gltfBufferView.byteOffset : 0);
        const inputBuffer = createDataViewFromBuffer(this._buffers[gltfBufferView.buffer], inputStartOffset);
        const inputStride = gltfBufferView.byteStride !== undefined ? gltfBufferView.byteStride : componentsPerAttribute * bytesPerElement;
        const componentReader = this._getComponentReader(gltfAccessor.componentType);
        const componentWriter = this._getComponentWriter(gltfAccessor.componentType);
        for (let iAttribute = 0; iAttribute < gltfAccessor.count; ++iAttribute) {
            const i = createDataViewFromTypedArray(inputBuffer, inputStride * iAttribute);
            const o = createDataViewFromTypedArray(outputBuffer, outputStride * iAttribute);
            for (let iComponent = 0; iComponent < componentsPerAttribute; ++iComponent) {
                const componentBytesOffset = bytesPerElement * iComponent;
                const value = componentReader(i, componentBytesOffset);
                componentWriter(o, componentBytesOffset, value);
            }
        }
    }
    _applyDeviation(glTFAccessor, baseValues) {
        const { sparse } = glTFAccessor;
        // Sparse indices
        const indicesBufferView = this._gltf.bufferViews[sparse.indices.bufferView];
        const indicesBuffer = this._buffers[indicesBufferView.buffer];
        const indicesSc = this._getAttributeBaseTypeStorage(sparse.indices.componentType);
        const sparseIndices = new indicesSc(indicesBuffer.buffer, indicesBuffer.byteOffset + (indicesBufferView.byteOffset || 0) + (sparse.indices.byteOffset || 0), sparse.count);
        // Sparse values
        const valuesBufferView = this._gltf.bufferViews[sparse.values.bufferView];
        const valuesBuffer = this._buffers[valuesBufferView.buffer];
        const valuesSc = this._getAttributeBaseTypeStorage(glTFAccessor.componentType);
        const sparseValues = new valuesSc(valuesBuffer.buffer, valuesBuffer.byteOffset + (valuesBufferView.byteOffset || 0) + (sparse.values.byteOffset || 0));
        const components = this._getComponentsPerAttribute(glTFAccessor.type);
        for (let iComponent = 0; iComponent < components; ++iComponent) {
            for (let iSparseIndex = 0; iSparseIndex < sparseIndices.length; ++iSparseIndex) {
                const sparseIndex = sparseIndices[iSparseIndex];
                baseValues[components * sparseIndex + iComponent] = sparseValues[components * iSparseIndex + iComponent];
            }
        }
    }
    _getPrimitiveMode(mode) {
        if (mode === undefined) {
            mode = glTF_constants_1.GltfPrimitiveMode.__DEFAULT;
        }
        switch (mode) {
            case glTF_constants_1.GltfPrimitiveMode.POINTS:
                return cc_1.gfx.PrimitiveMode.POINT_LIST;
            case glTF_constants_1.GltfPrimitiveMode.LINES:
                return cc_1.gfx.PrimitiveMode.LINE_LIST;
            case glTF_constants_1.GltfPrimitiveMode.LINE_LOOP:
                return cc_1.gfx.PrimitiveMode.LINE_LOOP;
            case glTF_constants_1.GltfPrimitiveMode.LINE_STRIP:
                return cc_1.gfx.PrimitiveMode.LINE_STRIP;
            case glTF_constants_1.GltfPrimitiveMode.TRIANGLES:
                return cc_1.gfx.PrimitiveMode.TRIANGLE_LIST;
            case glTF_constants_1.GltfPrimitiveMode.TRIANGLE_STRIP:
                return cc_1.gfx.PrimitiveMode.TRIANGLE_STRIP;
            case glTF_constants_1.GltfPrimitiveMode.TRIANGLE_FAN:
                return cc_1.gfx.PrimitiveMode.TRIANGLE_FAN;
            default:
                throw new Error(`Unrecognized primitive mode: ${mode}.`);
        }
    }
    _getAttributeBaseTypeStorage(componentType) {
        switch (componentType) {
            case glTF_constants_1.GltfAccessorComponentType.BYTE:
                return Int8Array;
            case glTF_constants_1.GltfAccessorComponentType.UNSIGNED_BYTE:
                return Uint8Array;
            case glTF_constants_1.GltfAccessorComponentType.SHORT:
                return Int16Array;
            case glTF_constants_1.GltfAccessorComponentType.UNSIGNED_SHORT:
                return Uint16Array;
            case glTF_constants_1.GltfAccessorComponentType.UNSIGNED_INT:
                return Uint32Array;
            case glTF_constants_1.GltfAccessorComponentType.FLOAT:
                return Float32Array;
            default:
                throw new Error(`Unrecognized component type: ${componentType}`);
        }
    }
    _getComponentsPerAttribute(type) {
        return (0, glTF_constants_1.getGltfAccessorTypeComponents)(type);
    }
    _getBytesPerComponent(componentType) {
        switch (componentType) {
            case glTF_constants_1.GltfAccessorComponentType.BYTE:
            case glTF_constants_1.GltfAccessorComponentType.UNSIGNED_BYTE:
                return 1;
            case glTF_constants_1.GltfAccessorComponentType.SHORT:
            case glTF_constants_1.GltfAccessorComponentType.UNSIGNED_SHORT:
                return 2;
            case glTF_constants_1.GltfAccessorComponentType.UNSIGNED_INT:
            case glTF_constants_1.GltfAccessorComponentType.FLOAT:
                return 4;
            default:
                throw new Error(`Unrecognized component type: ${componentType}`);
        }
    }
    _getComponentReader(componentType) {
        switch (componentType) {
            case glTF_constants_1.GltfAccessorComponentType.BYTE:
                return (buffer, offset) => buffer.getInt8(offset);
            case glTF_constants_1.GltfAccessorComponentType.UNSIGNED_BYTE:
                return (buffer, offset) => buffer.getUint8(offset);
            case glTF_constants_1.GltfAccessorComponentType.SHORT:
                return (buffer, offset) => buffer.getInt16(offset, DataViewUseLittleEndian);
            case glTF_constants_1.GltfAccessorComponentType.UNSIGNED_SHORT:
                return (buffer, offset) => buffer.getUint16(offset, DataViewUseLittleEndian);
            case glTF_constants_1.GltfAccessorComponentType.UNSIGNED_INT:
                return (buffer, offset) => buffer.getUint32(offset, DataViewUseLittleEndian);
            case glTF_constants_1.GltfAccessorComponentType.FLOAT:
                return (buffer, offset) => buffer.getFloat32(offset, DataViewUseLittleEndian);
            default:
                throw new Error(`Unrecognized component type: ${componentType}`);
        }
    }
    _getComponentWriter(componentType) {
        switch (componentType) {
            case glTF_constants_1.GltfAccessorComponentType.BYTE:
                return (buffer, offset, value) => buffer.setInt8(offset, value);
            case glTF_constants_1.GltfAccessorComponentType.UNSIGNED_BYTE:
                return (buffer, offset, value) => buffer.setUint8(offset, value);
            case glTF_constants_1.GltfAccessorComponentType.SHORT:
                return (buffer, offset, value) => buffer.setInt16(offset, value, DataViewUseLittleEndian);
            case glTF_constants_1.GltfAccessorComponentType.UNSIGNED_SHORT:
                return (buffer, offset, value) => buffer.setUint16(offset, value, DataViewUseLittleEndian);
            case glTF_constants_1.GltfAccessorComponentType.UNSIGNED_INT:
                return (buffer, offset, value) => buffer.setUint32(offset, value, DataViewUseLittleEndian);
            case glTF_constants_1.GltfAccessorComponentType.FLOAT:
                return (buffer, offset, value) => buffer.setFloat32(offset, value, DataViewUseLittleEndian);
            default:
                throw new Error(`Unrecognized component type: ${componentType}`);
        }
    }
    _getGltfXXName(assetKind, index) {
        const assetsArrayName = {
            [GltfAssetKind.Animation]: 'animations',
            [GltfAssetKind.Image]: 'images',
            [GltfAssetKind.Material]: 'materials',
            [GltfAssetKind.Node]: 'nodes',
            [GltfAssetKind.Skin]: 'skins',
            [GltfAssetKind.Texture]: 'textures',
            [GltfAssetKind.Scene]: 'scenes',
        };
        const assets = this._gltf[assetsArrayName[assetKind]];
        if (!assets) {
            return '';
        }
        const asset = assets[index];
        if (typeof asset.name === 'string') {
            return asset.name;
        }
        else {
            return `${GltfAssetKind[assetKind]}-${index}`;
        }
    }
    /**
     * Normalize a number array if max value is greater than 1,returns the max value and the normalized array.
     * @param orgArray
     * @private
     */
    _normalizeArrayToCocosColor(orgArray) {
        let factor = 1;
        if (Math.max(...orgArray) > 1) {
            factor = Math.max(...orgArray);
        }
        const normalizeArray = orgArray.map((v) => (0, color_utils_1.linearToSrgb8Bit)(v / factor));
        if (normalizeArray.length === 3) {
            normalizeArray.push(255);
        }
        const color = new cc.Color(normalizeArray[0], normalizeArray[1], normalizeArray[2], normalizeArray[3]);
        return [factor, color];
    }
    _convertAdskPhysicalMaterial(_glTFMaterial, glTFMaterialIndex, glTFAssetFinder, effectGetter, originalMaterial) {
        const defines = {};
        const properties = {};
        const states = {
            rasterizerState: {},
            blendState: { targets: [{}] },
            depthStencilState: {},
        };
        const { Parameters: physicalParams } = originalMaterial.properties['3dsMax'];
        // Note: You should support every thing in `physicalParams` optional
        const pBaseColor = physicalParams.base_color ?? extras_1.ADSK_3DS_MAX_PHYSICAL_MATERIAL_DEFAULT_PARAMETERS.base_color;
        properties['mainColor'] = cc.Vec4.set(new cc.Color(), pBaseColor[0], pBaseColor[1], pBaseColor[2], pBaseColor[3]);
        const pBaseWeight = physicalParams.basic_weight ?? extras_1.ADSK_3DS_MAX_PHYSICAL_MATERIAL_DEFAULT_PARAMETERS.basic_weight;
        properties['albedoScale'] = new cc.Vec3(pBaseWeight, pBaseWeight, pBaseWeight);
        const pBaseColorMapOn = physicalParams.base_color_map_on ?? extras_1.ADSK_3DS_MAX_PHYSICAL_MATERIAL_DEFAULT_PARAMETERS.base_color_map_on;
        const pBaseColorMap = physicalParams.base_color_map;
        if (pBaseColorMapOn && pBaseColorMap) {
            defines['USE_ALBEDO_MAP'] = true;
            properties['mainTexture'] = glTFAssetFinder.find('textures', pBaseColorMap.index, cc.Texture2D) ?? undefined;
            if (pBaseColorMap.texCoord === 1) {
                defines['ALBEDO_UV'] = 'v_uv1';
            }
            if (hasKHRTextureTransformExtension(pBaseColorMap)) {
                properties['tilingOffset'] = this._khrTextureTransformToTiling(pBaseColorMap.extensions.KHR_texture_transform);
            }
        }
        const pMetalness = physicalParams.metalness ?? extras_1.ADSK_3DS_MAX_PHYSICAL_MATERIAL_DEFAULT_PARAMETERS.metalness;
        properties['metallic'] = pMetalness;
        const pRoughness = physicalParams.roughness ?? extras_1.ADSK_3DS_MAX_PHYSICAL_MATERIAL_DEFAULT_PARAMETERS.roughness;
        const pInvRoughness = physicalParams.roughness_inv ?? extras_1.ADSK_3DS_MAX_PHYSICAL_MATERIAL_DEFAULT_PARAMETERS.roughness_inv;
        properties['roughness'] = pInvRoughness ? 1.0 - pRoughness : pRoughness;
        const pMetalnessMapOn = physicalParams.metalness_map_on ?? extras_1.ADSK_3DS_MAX_PHYSICAL_MATERIAL_DEFAULT_PARAMETERS.metalness_map_on;
        const pMetalnessMap = physicalParams.metalness_map;
        const pRoughnessMapOn = physicalParams.roughness_map_on ?? extras_1.ADSK_3DS_MAX_PHYSICAL_MATERIAL_DEFAULT_PARAMETERS.roughness_map_on;
        const pRoughnessMap = physicalParams.roughness_map;
        if (pMetalnessMapOn && pMetalnessMap) {
            // TODO
            // defines.USE_METALLIC_ROUGHNESS_MAP = true;
            // properties.metallicRoughnessMap;
        }
        if (pRoughnessMapOn && pRoughnessMap) {
            // TODO: apply inv?
        }
        // TODO: bump map & bump map on?
        // const pBumpMap = physicalParams.bump_map;
        // if (pBumpMap) {
        // }
        const pEmission = physicalParams.emission ?? extras_1.ADSK_3DS_MAX_PHYSICAL_MATERIAL_DEFAULT_PARAMETERS.emission;
        // TODO: emissive scale
        // properties['emissiveScale'] = new Vec4(pEmission, pEmission, pEmission, 1.0);
        const pEmissiveColor = physicalParams.emit_color ?? extras_1.ADSK_3DS_MAX_PHYSICAL_MATERIAL_DEFAULT_PARAMETERS.emit_color;
        properties['emissive'] = new cc_1.Vec4(pEmissiveColor[0] * pEmission, pEmissiveColor[1] * pEmission, pEmissiveColor[2] * pEmission, pEmissiveColor[3] * pEmission);
        // const pEmissionMapOn = physicalParams.emission_map_on ?? ADSK_3DS_MAX_PHYSICAL_MATERIAL_DEFAULT_PARAMETERS.emission_map_on;
        // const pEmissionMap = physicalParams.emission_map;
        // We do not support emission (factor) map
        // if ((pEmissionMapOn && pEmissionMap)) {
        // }
        const pEmissiveColorMapOn = physicalParams.emit_color_map_on ?? extras_1.ADSK_3DS_MAX_PHYSICAL_MATERIAL_DEFAULT_PARAMETERS.emit_color_map_on;
        const pEmissiveColorMap = physicalParams.emit_color_map;
        if (pEmissiveColorMapOn && pEmissiveColorMap) {
            defines['USE_EMISSIVE_MAP'] = true;
            properties['emissiveMap'] = glTFAssetFinder.find('textures', pEmissiveColorMap.index, cc.Texture2D) ?? undefined;
            if (pEmissiveColorMap.texCoord === 1) {
                defines['EMISSIVE_UV'] = 'v_uv1';
            }
        }
        // TODO:
        // defines['USE_OCCLUSION_MAP'] = true;
        // properties['occlusionMap'];
        // properties['occlusion'];
        const material = new cc.Material();
        material.name = this._getGltfXXName(GltfAssetKind.Material, glTFMaterialIndex);
        // @ts-ignore TS2445
        material._effectAsset = effectGetter('db://internal/effects/builtin-standard.effect');
        // @ts-ignore TS2445
        material._defines = [defines];
        // @ts-ignore TS2445
        material._props = [properties];
        // @ts-ignore TS2445
        material._states = [states];
        return material;
    }
    _convertMaxPhysicalMaterial(glTFMaterialIndex, glTFAssetFinder, effectGetter, physicalMaterial) {
        const defines = {};
        const properties = {};
        const states = {
            rasterizerState: {},
            blendState: { targets: [{}] },
            depthStencilState: {},
        };
        if (physicalMaterial.base_color_map && !this.fbxMissingImagesId.includes(physicalMaterial.base_color_map.value.index)) {
            defines['USE_ALBEDO_MAP'] = true;
            properties['mainTexture'] =
                glTFAssetFinder.find('textures', physicalMaterial.base_color_map.value.index, cc.Texture2D) ?? undefined;
        }
        properties['mainColor'] = this._normalizeArrayToCocosColor(physicalMaterial.base_color.value)[1];
        if (physicalMaterial.base_weight_map && !this.fbxMissingImagesId.includes(physicalMaterial.base_weight_map.value.index)) {
            defines['USE_WEIGHT_MAP'] = true;
            properties['baseWeightMap'] =
                glTFAssetFinder.find('textures', physicalMaterial.base_weight_map.value.index, cc.Texture2D) ?? undefined;
        }
        properties['albedoScale'] = physicalMaterial.base_weight.value;
        if (physicalMaterial.metalness_map && !this.fbxMissingImagesId.includes(physicalMaterial.metalness_map.value.index)) {
            defines['USE_METALLIC_MAP'] = true;
            properties['metallicMap'] =
                glTFAssetFinder.find('textures', physicalMaterial.metalness_map.value.index, cc.Texture2D) ?? undefined;
        }
        properties['metallic'] = physicalMaterial.metalness.value;
        if (physicalMaterial.roughness_map && !this.fbxMissingImagesId.includes(physicalMaterial.roughness_map.value.index)) {
            defines['USE_ROUGHNESS_MAP'] = true;
            properties['roughnessMap'] =
                glTFAssetFinder.find('textures', physicalMaterial.roughness_map.value.index, cc.Texture2D) ?? undefined;
        }
        properties['roughness'] = physicalMaterial.roughness.value;
        if (physicalMaterial.bump_map && !this.fbxMissingImagesId.includes(physicalMaterial.bump_map.value.index)) {
            defines['USE_NORMAL_MAP'] = true;
            properties['normalMap'] = glTFAssetFinder.find('textures', physicalMaterial.bump_map.value.index, cc.Texture2D) ?? undefined;
        }
        if (physicalMaterial.emission_map && !this.fbxMissingImagesId.includes(physicalMaterial.emission_map.value.index)) {
            defines['USE_EMISSIVESCALE_MAP'] = true;
            properties['emissiveScaleMap'] =
                glTFAssetFinder.find('textures', physicalMaterial.emission_map.value.index, cc.Texture2D) ?? undefined;
        }
        properties['emissiveScale'] = physicalMaterial.emission.value;
        if (physicalMaterial.emit_color_map && !this.fbxMissingImagesId.includes(physicalMaterial.emit_color_map.value.index)) {
            defines['USE_EMISSIVE_MAP'] = true;
            properties['emissiveMap'] =
                glTFAssetFinder.find('textures', physicalMaterial.emit_color_map.value.index, cc.Texture2D) ?? undefined;
        }
        properties['emissive'] = this._normalizeArrayToCocosColor(physicalMaterial.emit_color.value)[1];
        // set alphaSource default value.
        properties['alphaSource'] = 1;
        let tech = 0;
        if (physicalMaterial.cutout_map) {
            tech = 1;
            defines['USE_ALPHA_TEST'] = false;
            defines['USE_OPACITY_MAP'] = true;
            properties['alphaSourceMap'] =
                glTFAssetFinder.find('textures', physicalMaterial.cutout_map.value.index, cc.Texture2D) ?? undefined;
        }
        const material = new cc.Material();
        material.name = this._getGltfXXName(GltfAssetKind.Material, glTFMaterialIndex);
        // @ts-ignore TS2445
        material._effectAsset = effectGetter('db://internal/effects/util/dcc/imported-metallic-roughness.effect');
        // @ts-ignore TS2445
        material._defines = [defines];
        // @ts-ignore TS2445
        material._props = [properties];
        // @ts-ignore TS2445
        material._states = [states];
        setTechniqueIndex(material, tech);
        return material;
    }
    _convertMayaStandardSurface(glTFMaterialIndex, glTFAssetFinder, effectGetter, mayaStandardSurface) {
        const defines = {};
        const properties = {};
        const states = {
            rasterizerState: {},
            blendState: { targets: [{}] },
            depthStencilState: {},
        };
        if (mayaStandardSurface.base.texture && !this.fbxMissingImagesId.includes(mayaStandardSurface.base.texture.index)) {
            defines['USE_WEIGHT_MAP'] = true;
            properties['baseWeightMap'] =
                glTFAssetFinder.find('textures', mayaStandardSurface.base.texture.index, cc.Texture2D) ?? undefined;
        }
        properties['albedoScale'] = mayaStandardSurface.base.value;
        if (mayaStandardSurface.baseColor.texture && !this.fbxMissingImagesId.includes(mayaStandardSurface.baseColor.texture.index)) {
            defines['USE_ALBEDO_MAP'] = true;
            properties['mainTexture'] =
                glTFAssetFinder.find('textures', mayaStandardSurface.baseColor.texture.index, cc.Texture2D) ?? undefined;
        }
        properties['mainColor'] = this._normalizeArrayToCocosColor(mayaStandardSurface.baseColor.value)[1];
        if (mayaStandardSurface.metalness.texture && !this.fbxMissingImagesId.includes(mayaStandardSurface.metalness.texture.index)) {
            defines['USE_METALLIC_MAP'] = true;
            properties['metallicMap'] =
                glTFAssetFinder.find('textures', mayaStandardSurface.metalness.texture.index, cc.Texture2D) ?? undefined;
        }
        properties['metallic'] = mayaStandardSurface.metalness.value;
        if (mayaStandardSurface.specularRoughness.texture &&
            !this.fbxMissingImagesId.includes(mayaStandardSurface.specularRoughness.texture.index)) {
            defines['USE_ROUGHNESS_MAP'] = true;
            properties['roughnessMap'] =
                glTFAssetFinder.find('textures', mayaStandardSurface.specularRoughness.texture.index, cc.Texture2D) ?? undefined;
        }
        properties['roughness'] = mayaStandardSurface.specularRoughness.value;
        properties['specularIntensity'] = Math.max(...mayaStandardSurface.specularColor.value) * 0.5;
        if (mayaStandardSurface.normalCamera.texture !== undefined &&
            !this.fbxMissingImagesId.includes(mayaStandardSurface.normalCamera.texture.index)) {
            defines['USE_NORMAL_MAP'] = true;
            properties['normalMap'] =
                glTFAssetFinder.find('textures', mayaStandardSurface.normalCamera.texture.index, cc.Texture2D) ?? undefined;
        }
        if (mayaStandardSurface.emission.texture !== undefined &&
            !this.fbxMissingImagesId.includes(mayaStandardSurface.emission.texture.index)) {
            defines['USE_EMISSIVESCALE_MAP'] = true;
            properties['emissiveScaleMap'] =
                glTFAssetFinder.find('textures', mayaStandardSurface.emission.texture.index, cc.Texture2D) ?? undefined;
        }
        properties['emissiveScale'] = mayaStandardSurface.emission.value;
        if (mayaStandardSurface.emissionColor.texture !== undefined &&
            !this.fbxMissingImagesId.includes(mayaStandardSurface.emissionColor.texture.index)) {
            defines['USE_EMISSIVE_MAP'] = true;
            properties['emissiveMap'] =
                glTFAssetFinder.find('textures', mayaStandardSurface.emissionColor.texture.index, cc.Texture2D) ?? undefined;
        }
        properties['emissive'] = this._normalizeArrayToCocosColor(mayaStandardSurface.emissionColor.value)[1];
        if (mayaStandardSurface.opacity.texture && !this.fbxMissingImagesId.includes(mayaStandardSurface.opacity.texture.index)) {
            defines['USE_ALPHA_TEST'] = false;
            defines['USE_OPACITY_MAP'] = true;
            properties['alphaSourceMap'] =
                glTFAssetFinder.find('textures', mayaStandardSurface.opacity.texture.index, cc.Texture2D) ?? undefined;
        }
        else if (Math.max(...mayaStandardSurface.opacity.value) < 0.99) {
            properties['alphaSource'] = Math.max(...mayaStandardSurface.opacity.value);
        }
        const material = new cc.Material();
        material.name = this._getGltfXXName(GltfAssetKind.Material, glTFMaterialIndex);
        // @ts-ignore TS2445(GltfAssetKind.Material
        material._effectAsset = effectGetter('db://internal/effects/util/dcc/imported-metallic-roughness.effect');
        // @ts-ignore TS2445
        material._defines = [defines];
        // @ts-ignore TS2445
        material._props = [properties];
        // @ts-ignore TS2445
        material._states = [states];
        return material;
    }
    _convertPhongMaterial(glTFMaterialIndex, glTFAssetFinder, effectGetter, appID, phongMat) {
        const defines = {};
        const properties = {};
        const states = {
            rasterizerState: {},
            blendState: { targets: [{}] },
            depthStencilState: {},
        };
        let tech = 0;
        let alphaValue = 255;
        if (phongMat.transparentColor.texture !== undefined && !this.fbxMissingImagesId.includes(phongMat.transparentColor.texture.index)) {
            defines['USE_ALPHA_TEST'] = false;
            defines['USE_TRANSPARENCY_MAP'] = true;
            properties['transparencyMap'] =
                glTFAssetFinder.find('textures', phongMat.transparentColor.texture.index, cc.Texture2D) ?? undefined;
            tech = 1;
        }
        else if (phongMat.transparencyFactor) {
            const theColor = (phongMat.transparentColor.value[0] + phongMat.transparentColor.value[1] + phongMat.transparentColor.value[2]) / 3.0;
            if (!(phongMat.transparentColor.value[0] === phongMat.transparentColor.value[1] &&
                phongMat.transparentColor.value[0] === phongMat.transparentColor.value[2])) {
                console.warn(`Material ${this._getGltfXXName(GltfAssetKind.Material, glTFMaterialIndex)} : Transparent color property is not supported, average value would be used.`);
            }
            const transparencyValue = phongMat.transparencyFactor.value * theColor;
            if (transparencyValue !== 0) {
                tech = 1;
                alphaValue = (0, color_utils_1.linearToSrgb8Bit)(1 - phongMat.transparencyFactor.value * theColor);
            }
        }
        if (phongMat.diffuse) {
            const diffuseColor = this._normalizeArrayToCocosColor(phongMat.diffuse.value);
            properties['albedoScale'] = phongMat.diffuseFactor.value * diffuseColor[0];
            diffuseColor[1].a = alphaValue;
            properties['mainColor'] = diffuseColor[1]; //use srgb input color
            if (phongMat.diffuse.texture !== undefined && !this.fbxMissingImagesId.includes(phongMat.diffuse.texture.index)) {
                defines['USE_ALBEDO_MAP'] = true;
                properties['mainTexture'] = glTFAssetFinder.find('textures', phongMat.diffuse.texture.index, cc.Texture2D) ?? undefined;
            }
        }
        if (phongMat.specular) {
            const specularColor = this._normalizeArrayToCocosColor(phongMat.specular.value);
            properties['specularFactor'] = phongMat.specularFactor.value * specularColor[0];
            properties['specularColor'] = specularColor[1]; // phong_mat.specular.value;
            if (phongMat.specular.texture !== undefined && !this.fbxMissingImagesId.includes(phongMat.specular.texture.index)) {
                defines['USE_SPECULAR_MAP'] = true;
                properties['specularMap'] = glTFAssetFinder.find('textures', phongMat.specular.texture.index, cc.Texture2D) ?? undefined;
            }
        }
        if (phongMat.normalMap?.texture !== undefined && !this.fbxMissingImagesId.includes(phongMat.normalMap.texture.index)) {
            defines['USE_NORMAL_MAP'] = true;
            properties['normalMap'] = glTFAssetFinder.find('textures', phongMat.normalMap.texture.index, cc.Texture2D) ?? undefined;
        }
        else if (phongMat.bump?.texture !== undefined) {
            defines['USE_NORMAL_MAP'] = true;
            properties['normalMap'] = glTFAssetFinder.find('textures', phongMat.bump.texture.index, cc.Texture2D) ?? undefined;
        }
        if (phongMat.shininess) {
            properties['shininessExponent'] = phongMat.shininess.value;
            if (phongMat.shininess.texture !== undefined && !this.fbxMissingImagesId.includes(phongMat.shininess.texture.index)) {
                defines['USE_SHININESS_MAP'] = true;
                properties['shininessExponentMap'] =
                    glTFAssetFinder.find('textures', phongMat.shininess.texture.index, cc.Texture2D) ?? undefined;
            }
        }
        if (phongMat.emissive) {
            const emissiveColor = this._normalizeArrayToCocosColor(phongMat.emissive.value);
            properties['emissiveScale'] = phongMat.emissiveFactor.value * emissiveColor[0];
            properties['emissive'] = emissiveColor[1];
            if (phongMat.emissive.texture !== undefined && !this.fbxMissingImagesId.includes(phongMat.emissive.texture.index)) {
                defines['USE_EMISSIVE_MAP'] = true;
                properties['emissiveMap'] = glTFAssetFinder.find('textures', phongMat.emissive.texture.index, cc.Texture2D) ?? undefined;
            }
            if (phongMat.emissiveFactor.texture !== undefined && !this.fbxMissingImagesId.includes(phongMat.emissiveFactor.texture.index)) {
                defines['USE_EMISSIVESCALE_MAP'] = true;
                properties['emissiveScaleMap'] =
                    glTFAssetFinder.find('textures', phongMat.emissiveFactor.texture.index, cc.Texture2D) ?? undefined;
            }
        }
        defines['DCC_APP_NAME'] = appID;
        const material = new cc.Material();
        material.name = this._getGltfXXName(GltfAssetKind.Material, glTFMaterialIndex);
        setTechniqueIndex(material, tech);
        // @ts-ignore TS2445
        material._effectAsset = effectGetter('db://internal/effects/util/dcc/imported-specular-glossiness.effect');
        // @ts-ignore TS2445
        material._defines = [defines];
        // @ts-ignore TS2445
        material._props = [properties];
        // @ts-ignore TS2445
        material._states = [states];
        return material;
    }
    _convertBlenderPBRMaterial(glTFMaterial, glTFMaterialIndex, glTFAssetFinder, effectGetter) {
        const defines = {};
        const properties = {};
        const states = {
            rasterizerState: {},
            blendState: { targets: [{}] },
            depthStencilState: {},
        };
        const phongMaterialContainer = glTFMaterial.extras['FBX-glTF-conv'].raw.properties;
        defines['DCC_APP_NAME'] = 2;
        defines['HAS_EXPORTED_METALLIC'] = true;
        // base color
        if (phongMaterialContainer.diffuse) {
            const diffuseColor = this._normalizeArrayToCocosColor(phongMaterialContainer.diffuse.value);
            properties['mainColor'] = diffuseColor[1]; // phong_mat.diffuse.value;
            if (phongMaterialContainer.diffuse.texture !== undefined &&
                !this.fbxMissingImagesId.includes(phongMaterialContainer.diffuse.texture.index)) {
                defines['USE_ALBEDO_MAP'] = true;
                properties['mainTexture'] =
                    glTFAssetFinder.find('textures', phongMaterialContainer.diffuse.texture.index, cc.Texture2D) ?? undefined;
            }
        }
        // normal
        if (phongMaterialContainer.bump?.texture !== undefined &&
            !this.fbxMissingImagesId.includes(phongMaterialContainer.bump.texture.index)) {
            defines['USE_NORMAL_MAP'] = true;
            properties['normalMap'] =
                glTFAssetFinder.find('textures', phongMaterialContainer.bump.texture.index, cc.Texture2D) ?? undefined;
        }
        // roughness
        if (phongMaterialContainer.shininess) {
            properties['shininessExponent'] = phongMaterialContainer.shininess.value;
            if (phongMaterialContainer.shininess.texture !== undefined &&
                !this.fbxMissingImagesId.includes(phongMaterialContainer.shininess.texture.index)) {
                // roughness map
                defines['USE_SHININESS_MAP'] = true;
                properties['shininessExponentMap'] =
                    glTFAssetFinder.find('textures', phongMaterialContainer.shininess.texture.index, cc.Texture2D) ?? undefined;
            }
        }
        if (phongMaterialContainer.emissive) {
            const emissiveColor = this._normalizeArrayToCocosColor(phongMaterialContainer.emissive.value);
            properties['emissiveScale'] = phongMaterialContainer.emissiveFactor.value * emissiveColor[0];
            properties['emissive'] = emissiveColor[1];
            if (phongMaterialContainer.emissive.texture !== undefined &&
                !this.fbxMissingImagesId.includes(phongMaterialContainer.emissive.texture.index)) {
                defines['USE_EMISSIVE_MAP'] = true;
                properties['emissiveMap'] =
                    glTFAssetFinder.find('textures', phongMaterialContainer.emissive.texture.index, cc.Texture2D) ?? undefined;
            }
            if (phongMaterialContainer.emissiveFactor.texture !== undefined &&
                !this.fbxMissingImagesId.includes(phongMaterialContainer.emissiveFactor.texture.index)) {
                defines['USE_EMISSIVESCALE_MAP'] = true;
                properties['emissiveScaleMap'] =
                    glTFAssetFinder.find('textures', phongMaterialContainer.emissiveFactor.texture.index, cc.Texture2D) ?? undefined;
            }
        }
        // metallic
        if (phongMaterialContainer.reflectionFactor) {
            properties['metallic'] = phongMaterialContainer.reflectionFactor.value;
            if (phongMaterialContainer.reflectionFactor.texture !== undefined &&
                !this.fbxMissingImagesId.includes(phongMaterialContainer.reflectionFactor.texture.index)) {
                defines['USE_METALLIC_MAP'] = true;
                properties['metallicMap'] =
                    glTFAssetFinder.find('textures', phongMaterialContainer.reflectionFactor.texture.index, cc.Texture2D) ?? undefined;
            }
        }
        // specular
        if (phongMaterialContainer.specularFactor) {
            if (phongMaterialContainer.specularFactor.texture !== undefined &&
                !this.fbxMissingImagesId.includes(phongMaterialContainer.specularFactor.texture.index)) {
                defines['USE_SPECULAR_MAP'] = true;
                properties['specularMap'] =
                    glTFAssetFinder.find('textures', phongMaterialContainer.specularFactor.texture.index, cc.Texture2D) ?? undefined;
            }
            else {
                properties['specularFactor'] = phongMaterialContainer.specularFactor.value;
            }
        }
        if (phongMaterialContainer.transparencyFactor) {
            if (phongMaterialContainer.transparencyFactor.texture !== undefined &&
                !this.fbxMissingImagesId.includes(phongMaterialContainer.transparencyFactor.texture.index)) {
                defines['USE_ALPHA_TEST'] = false;
                defines['USE_TRANSPARENCY_MAP'] = true;
                properties['transparencyMap'] =
                    glTFAssetFinder.find('textures', phongMaterialContainer.transparencyFactor.texture.index, cc.Texture2D) ?? undefined;
            }
            else {
                properties['transparencyFactor'] = phongMaterialContainer.transparencyFactor.value;
            }
        }
        const material = new cc.Material();
        material.name = this._getGltfXXName(GltfAssetKind.Material, glTFMaterialIndex);
        // @ts-ignore TS2445
        material._effectAsset = effectGetter('db://internal/effects/util/dcc/imported-specular-glossiness.effect');
        // @ts-ignore TS2445
        material._defines = [defines];
        // @ts-ignore TS2445
        material._props = [properties];
        // @ts-ignore TS2445
        material._states = [states];
        return material;
    }
    _convertGltfPbrSpecularGlossiness(glTFMaterial, glTFMaterialIndex, glTFAssetFinder, effectGetter, depthWriteInAlphaModeBlend) {
        const defines = {};
        const properties = {};
        const states = {
            rasterizerState: {},
            blendState: { targets: [{}] },
            depthStencilState: {},
        };
        const gltfSpecularGlossiness = glTFMaterial.extensions.KHR_materials_pbrSpecularGlossiness;
        defines['DCC_APP_NAME'] = 4;
        // base color
        if (gltfSpecularGlossiness.diffuseFactor) {
            const diffuseColor = this._normalizeArrayToCocosColor(gltfSpecularGlossiness.diffuseFactor);
            properties['mainColor'] = diffuseColor[1]; // phong_mat.diffuse.value;
        }
        if (gltfSpecularGlossiness.diffuseTexture !== undefined) {
            defines['USE_ALBEDO_MAP'] = true;
            properties['mainTexture'] =
                glTFAssetFinder.find('textures', gltfSpecularGlossiness.diffuseTexture.index, cc.Texture2D) ?? undefined;
        }
        // specular
        if (gltfSpecularGlossiness.specularFactor) {
            const specularColor = this._normalizeArrayToCocosColor(gltfSpecularGlossiness.specularFactor);
            properties['specularColor'] = specularColor[1];
        }
        // glossiness
        if (gltfSpecularGlossiness.glossinessFactor) {
            defines['HAS_EXPORTED_GLOSSINESS'] = true;
            properties['glossiness'] = gltfSpecularGlossiness.glossinessFactor;
        }
        if (gltfSpecularGlossiness.specularGlossinessTexture !== undefined) {
            defines['HAS_EXPORTED_GLOSSINESS'] = true;
            defines['USE_SPECULAR_GLOSSINESS_MAP'] = true;
            properties['specularGlossinessMap'] =
                glTFAssetFinder.find('textures', gltfSpecularGlossiness.specularGlossinessTexture.index, cc.Texture2D) ?? undefined;
        }
        if (glTFMaterial.normalTexture !== undefined) {
            const pbrNormalTexture = glTFMaterial.normalTexture;
            if (pbrNormalTexture.index !== undefined) {
                defines['USE_NORMAL_MAP'] = true;
                properties['normalMap'] = glTFAssetFinder.find('textures', pbrNormalTexture.index, cc.Texture2D);
            }
        }
        if (glTFMaterial.emissiveTexture !== undefined) {
            defines['USE_EMISSIVE_MAP'] = true;
            if (glTFMaterial.emissiveTexture.texCoord) {
                defines['EMISSIVE_UV'] = 'v_uv1';
            }
            properties['emissiveMap'] = glTFAssetFinder.find('textures', glTFMaterial.emissiveTexture.index, cc.Texture2D);
        }
        if (glTFMaterial.emissiveFactor !== undefined) {
            const v = glTFMaterial.emissiveFactor;
            properties['emissive'] = this._normalizeArrayToCocosColor(v)[1];
        }
        if (glTFMaterial.doubleSided) {
            states.rasterizerState.cullMode = cc_1.gfx.CullMode.NONE;
        }
        switch (glTFMaterial.alphaMode) {
            case 'BLEND': {
                const blendState = states.blendState.targets[0];
                blendState.blend = true;
                blendState.blendSrc = cc_1.gfx.BlendFactor.SRC_ALPHA;
                blendState.blendDst = cc_1.gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
                blendState.blendDstAlpha = cc_1.gfx.BlendFactor.ONE_MINUS_SRC_ALPHA;
                states.depthStencilState.depthWrite = depthWriteInAlphaModeBlend;
                break;
            }
            case 'MASK': {
                const alphaCutoff = glTFMaterial.alphaCutoff === undefined ? 0.5 : glTFMaterial.alphaCutoff;
                defines['USE_ALPHA_TEST'] = true;
                properties['alphaThreshold'] = alphaCutoff;
                break;
            }
            case 'OPAQUE':
            case undefined:
                break;
            default:
                this._logger(GltfConverter.LogLevel.Warning, GltfConverter.ConverterError.UnsupportedAlphaMode, {
                    mode: glTFMaterial.alphaMode,
                    material: glTFMaterialIndex,
                });
                break;
        }
        const material = new cc.Material();
        material.name = this._getGltfXXName(GltfAssetKind.Material, glTFMaterialIndex);
        // @ts-ignore TS2445
        material._effectAsset = effectGetter('db://internal/effects/util/dcc/imported-specular-glossiness.effect');
        // @ts-ignore TS2445
        material._defines = [defines];
        // @ts-ignore TS2445
        material._props = [properties];
        // @ts-ignore TS2445
        material._states = [states];
        return material;
    }
    _khrTextureTransformToTiling(khrTextureTransform) {
        const result = new cc_1.Vec4(1, 1, 0, 0);
        if (khrTextureTransform.scale) {
            result.x = khrTextureTransform.scale[0];
            result.y = khrTextureTransform.scale[1];
        }
        if (khrTextureTransform.offset) {
            result.z = khrTextureTransform.offset[0];
            result.w = khrTextureTransform.offset[1];
        }
        return result;
    }
}
exports.GltfConverter = GltfConverter;
function hasKHRTextureTransformExtension(obj) {
    const { extensions } = obj;
    return (typeof extensions === 'object' &&
        extensions !== null &&
        typeof extensions['KHR_texture_transform'] === 'object');
}
function setTechniqueIndex(material, index) {
    // @ts-expect-error TODO: fix type
    material._techIdx = index;
}
(function (GltfConverter) {
    let LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["Info"] = 0] = "Info";
        LogLevel[LogLevel["Warning"] = 1] = "Warning";
        LogLevel[LogLevel["Error"] = 2] = "Error";
        LogLevel[LogLevel["Debug"] = 3] = "Debug";
    })(LogLevel = GltfConverter.LogLevel || (GltfConverter.LogLevel = {}));
    let ConverterError;
    (function (ConverterError) {
        /**
         * glTf requires that skin joints must exists in same scene as node references it.
         */
        ConverterError[ConverterError["ReferenceSkinInDifferentScene"] = 0] = "ReferenceSkinInDifferentScene";
        /**
         * Specified alpha mode is not supported currently.
         */
        ConverterError[ConverterError["UnsupportedAlphaMode"] = 1] = "UnsupportedAlphaMode";
        /**
         * Unsupported texture parameter.
         */
        ConverterError[ConverterError["UnsupportedTextureParameter"] = 2] = "UnsupportedTextureParameter";
        /**
         * Unsupported channel path.
         */
        ConverterError[ConverterError["UnsupportedChannelPath"] = 3] = "UnsupportedChannelPath";
        ConverterError[ConverterError["DisallowCubicSplineChannelSplit"] = 4] = "DisallowCubicSplineChannelSplit";
        ConverterError[ConverterError["FailedToCalculateTangents"] = 5] = "FailedToCalculateTangents";
        /**
         * All targets of the specified sub-mesh are zero-displaced.
         */
        ConverterError[ConverterError["EmptyMorph"] = 6] = "EmptyMorph";
        ConverterError[ConverterError["UnsupportedExtension"] = 7] = "UnsupportedExtension";
    })(ConverterError = GltfConverter.ConverterError || (GltfConverter.ConverterError = {}));
})(GltfConverter || (exports.GltfConverter = GltfConverter = {}));
async function readGltf(gltfFilePath) {
    return path.extname(gltfFilePath) === '.glb' ? await readGlb(gltfFilePath) : await readGltfJson(gltfFilePath);
}
async function readGltfJson(path) {
    const glTF = (await fs.readJSON(path));
    const resolvedBuffers = !glTF.buffers
        ? []
        : glTF.buffers.map((glTFBuffer) => {
            if (glTFBuffer.uri) {
                return resolveBufferUri(path, glTFBuffer.uri);
            }
            else {
                return Buffer.alloc(0);
            }
        });
    return { glTF, buffers: resolvedBuffers };
}
async function readGlb(path) {
    const badGLBFormat = () => {
        throw new Error('Bad glb format.');
    };
    const glb = await fs.readFile(path);
    if (glb.length < 12) {
        return badGLBFormat();
    }
    const magic = glb.readUInt32LE(0);
    if (magic !== 0x46546c67) {
        return badGLBFormat();
    }
    const ChunkTypeJson = 0x4e4f534a;
    const ChunkTypeBin = 0x004e4942;
    const version = glb.readUInt32LE(4);
    const length = glb.readUInt32LE(8);
    let glTF;
    let embeddedBinaryBuffer;
    for (let iChunk = 0, offset = 12; offset + 8 <= glb.length; ++iChunk) {
        const chunkLength = glb.readUInt32LE(offset);
        offset += 4;
        const chunkType = glb.readUInt32LE(offset);
        offset += 4;
        if (offset + chunkLength > glb.length) {
            return badGLBFormat();
        }
        const payload = Buffer.from(glb.buffer, offset, chunkLength);
        offset += chunkLength;
        if (iChunk === 0) {
            if (chunkType !== ChunkTypeJson) {
                return badGLBFormat();
            }
            const glTFJson = new TextDecoder('utf-8').decode(payload);
            glTF = JSON.parse(glTFJson);
        }
        else if (chunkType === ChunkTypeBin) {
            // TODO: Should we copy?
            // embeddedBinaryBuffer = payload.slice();
            embeddedBinaryBuffer = payload;
        }
    }
    if (!glTF) {
        return badGLBFormat();
    }
    else {
        const resolvedBuffers = !glTF.buffers
            ? []
            : glTF.buffers.map((glTFBuffer, glTFBufferIndex) => {
                if (glTFBuffer.uri) {
                    return resolveBufferUri(path, glTFBuffer.uri);
                }
                else if (glTFBufferIndex === 0 && embeddedBinaryBuffer) {
                    return embeddedBinaryBuffer;
                }
                else {
                    return Buffer.alloc(0);
                }
            });
        return { glTF, buffers: resolvedBuffers };
    }
}
function resolveBufferUri(glTFFilePath, uri) {
    const dataURI = DataURI.parse(uri);
    if (!dataURI) {
        const bufferPath = path.resolve(path.dirname(glTFFilePath), uri);
        return bufferPath;
    }
    else {
        return Buffer.from(resolveBufferDataURI(dataURI));
    }
}
function isDataUri(uri) {
    return uri.startsWith('data:');
}
class BufferBlob {
    _arrayBufferOrPaddings = [];
    _length = 0;
    setNextAlignment(align) {
        if (align !== 0) {
            const remainder = this._length % align;
            if (remainder !== 0) {
                const padding = align - remainder;
                this._arrayBufferOrPaddings.push(padding);
                this._length += padding;
            }
        }
    }
    addBuffer(arrayBuffer) {
        const result = this._length;
        this._arrayBufferOrPaddings.push(arrayBuffer);
        this._length += arrayBuffer.byteLength;
        return result;
    }
    getLength() {
        return this._length;
    }
    getCombined() {
        const result = new Uint8Array(this._length);
        let counter = 0;
        this._arrayBufferOrPaddings.forEach((arrayBufferOrPadding) => {
            if (typeof arrayBufferOrPadding === 'number') {
                counter += arrayBufferOrPadding;
            }
            else {
                result.set(new Uint8Array(arrayBufferOrPadding), counter);
                counter += arrayBufferOrPadding.byteLength;
            }
        });
        return result;
    }
}
exports.BufferBlob = BufferBlob;
function createDataViewFromBuffer(buffer, offset = 0) {
    return new DataView(buffer.buffer, buffer.byteOffset + offset);
}
function createDataViewFromTypedArray(typedArray, offset = 0) {
    return new DataView(typedArray.buffer, typedArray.byteOffset + offset);
}
const DataViewUseLittleEndian = true;
function uniqueChildNodeNameGenerator(original, last, index, count) {
    const postfix = count === 0 ? '' : `-${count}`;
    return `${original || ''}(__autogen ${index}${postfix})`;
}
function makeUniqueNames(names, generator) {
    const uniqueNames = new Array(names.length).fill('');
    for (let i = 0; i < names.length; ++i) {
        let name = names[i];
        let count = 0;
        while (true) {
            const isUnique = () => uniqueNames.every((uniqueName, index) => {
                return index === i || name !== uniqueName;
            });
            if (name === null || !isUnique()) {
                name = generator(names[i], name, i, count++);
            }
            else {
                uniqueNames[i] = name;
                break;
            }
        }
    }
    return uniqueNames;
}
function resolveBufferDataURI(uri) {
    // https://github.com/KhronosGroup/glTF/issues/944
    if (!uri.base64 ||
        !uri.mediaType ||
        !(uri.mediaType.value === 'application/octet-stream' || uri.mediaType.value === 'application/gltf-buffer')) {
        throw new Error(`Cannot understand data uri(base64: ${uri.base64}, mediaType: ${uri.mediaType}) for buffer.`);
    }
    return (0, base64_1.decodeBase64ToArrayBuffer)(uri.data);
}
class DynamicArrayBuffer {
    get arrayBuffer() {
        return this._arrayBuffer;
    }
    _size = 0;
    _arrayBuffer;
    constructor(reserve) {
        this._arrayBuffer = new ArrayBuffer(Math.max(reserve || 0, 4));
    }
    grow(growSize) {
        const szBeforeGrow = this._size;
        if (growSize) {
            const cap = this._arrayBuffer.byteLength;
            const space = cap - szBeforeGrow;
            const req = space - growSize;
            if (req < 0) {
                // assert(cap >= 4)
                const newCap = (cap + -req) * 1.5;
                const newArrayBuffer = new ArrayBuffer(newCap);
                new Uint8Array(newArrayBuffer, 0, cap).set(new Uint8Array(this._arrayBuffer));
                this._arrayBuffer = newArrayBuffer;
            }
            this._size += growSize;
        }
        return szBeforeGrow;
    }
    shrink() {
        return this._arrayBuffer.slice(0, this._size);
    }
}
function getDataviewWritterOfTypedArray(typedArray, littleEndian) {
    switch (typedArray.constructor) {
        case Int8Array:
            return (dataView, byteOffset, value) => dataView.setInt8(byteOffset, value);
        case Uint8Array:
            return (dataView, byteOffset, value) => dataView.setUint8(byteOffset, value);
        case Int16Array:
            return (dataView, byteOffset, value) => dataView.setInt16(byteOffset, value, littleEndian);
        case Uint16Array:
            return (dataView, byteOffset, value) => dataView.setUint16(byteOffset, value, littleEndian);
        case Int32Array:
            return (dataView, byteOffset, value) => dataView.setInt32(byteOffset, value, littleEndian);
        case Uint32Array:
            return (dataView, byteOffset, value) => dataView.setUint32(byteOffset, value, littleEndian);
        case Float32Array:
            return (dataView, byteOffset, value) => dataView.setFloat32(byteOffset, value, littleEndian);
        default:
            throw new Error('Bad storage constructor.');
    }
}
function interleaveVertices(ppGeometry, bGenerateUV = false, bAddVertexColor = false) {
    const vertexCount = ppGeometry.vertexCount;
    let hasUV1 = false;
    let hasColor = false;
    const validAttributes = [];
    for (const attribute of ppGeometry.attributes()) {
        let gfxAttributeName;
        try {
            gfxAttributeName = (0, pp_geometry_1.getGfxAttributeName)(attribute);
            if (gfxAttributeName === cc_1.gfx.AttributeName.ATTR_TEX_COORD1) {
                hasUV1 = true;
            }
            if (gfxAttributeName === cc_1.gfx.AttributeName.ATTR_COLOR) {
                hasColor = true;
            }
        }
        catch (err) {
            console.error(err);
            continue;
        }
        validAttributes.push([gfxAttributeName, attribute]);
    }
    if (bAddVertexColor && !hasColor) {
        const fillColor = new cc_1.Vec4(1, 1, 1, 1);
        const colorData = new Float32Array(vertexCount * 4);
        for (let i = 0; i < vertexCount; ++i) {
            colorData[i * 4 + 0] = fillColor.x;
            colorData[i * 4 + 1] = fillColor.y;
            colorData[i * 4 + 2] = fillColor.z;
            colorData[i * 4 + 3] = fillColor.w;
        }
        validAttributes.push(['a_color', new pp_geometry_1.PPGeometry.Attribute(pp_geometry_1.PPGeometry.StdSemantics.color, colorData, 4)]);
    }
    if (bGenerateUV && !hasUV1) {
        validAttributes.push([
            'a_texCoord1',
            new pp_geometry_1.PPGeometry.Attribute(pp_geometry_1.PPGeometry.StdSemantics.texcoord, new Float32Array(vertexCount * 2), 2),
        ]);
    }
    let vertexStride = 0;
    for (const [_, attribute] of validAttributes) {
        vertexStride += attribute.data.BYTES_PER_ELEMENT * attribute.components;
    }
    const vertexBuffer = new ArrayBuffer(vertexCount * vertexStride);
    const vertexBufferView = new DataView(vertexBuffer);
    let currentByteOffset = 0;
    const formats = [];
    for (const [gfxAttributeName, attribute] of validAttributes) {
        const attributeData = attribute.data;
        const dataviewWritter = getDataviewWritterOfTypedArray(attributeData, DataViewUseLittleEndian);
        for (let iVertex = 0; iVertex < vertexCount; ++iVertex) {
            const offset1 = currentByteOffset + vertexStride * iVertex;
            for (let iComponent = 0; iComponent < attribute.components; ++iComponent) {
                const value = attributeData[attribute.components * iVertex + iComponent];
                dataviewWritter(vertexBufferView, offset1 + attributeData.BYTES_PER_ELEMENT * iComponent, value);
            }
        }
        currentByteOffset += attribute.data.BYTES_PER_ELEMENT * attribute.components;
        formats.push({
            name: gfxAttributeName,
            format: attribute.getGFXFormat(),
            isNormalized: attribute.isNormalized,
        });
    }
    return {
        vertexCount,
        vertexStride,
        formats,
        vertexBuffer,
    };
}
const glTFAttributeNameToPP = (() => {
    return (attributeName) => {
        if (attributeName.startsWith('_')) {
            // Application-specific semantics must start with an underscore
            return attributeName;
        }
        const attributeNameRegexMatches = /([a-zA-Z]+)(?:_(\d+))?/g.exec(attributeName);
        if (!attributeNameRegexMatches) {
            return attributeName;
        }
        const attributeBaseName = attributeNameRegexMatches[1];
        let stdSemantic;
        const set = parseInt(attributeNameRegexMatches[2] || '0');
        switch (attributeBaseName) {
            case 'POSITION':
                stdSemantic = pp_geometry_1.PPGeometry.StdSemantics.position;
                break;
            case 'NORMAL':
                stdSemantic = pp_geometry_1.PPGeometry.StdSemantics.normal;
                break;
            case 'TANGENT':
                stdSemantic = pp_geometry_1.PPGeometry.StdSemantics.tangent;
                break;
            case 'COLOR':
                stdSemantic = pp_geometry_1.PPGeometry.StdSemantics.color;
                break;
            case 'TEXCOORD':
                stdSemantic = pp_geometry_1.PPGeometry.StdSemantics.texcoord;
                break;
            case 'JOINTS':
                stdSemantic = pp_geometry_1.PPGeometry.StdSemantics.joints;
                break;
            case 'WEIGHTS':
                stdSemantic = pp_geometry_1.PPGeometry.StdSemantics.weights;
                break;
        }
        if (stdSemantic === undefined) {
            return attributeName;
        }
        else {
            return pp_geometry_1.PPGeometry.StdSemantics.set(stdSemantic, set);
        }
    };
})();
class GlTfConformanceError extends Error {
}
exports.GlTfConformanceError = GlTfConformanceError;
function assertGlTFConformance(expr, message) {
    if (!expr) {
        throw new GlTfConformanceError(`glTF non-conformance error: ${message}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2x0Zi1jb252ZXJ0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvdXRpbHMvZ2x0Zi1jb252ZXJ0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUVBLDRDQUVDO0FBWUQsMENBUUM7QUFFRCxnRUFZQztBQWdGRCx3Q0FrQkM7QUE2b0ZELDRCQUVDO0FBd0ZELDhCQUVDO0FBcDdGRCx5REFBMkM7QUFDM0MsdUNBQXlCO0FBQ3pCLDJCQUE4RDtBQUM5RCw2Q0FBK0I7QUFDL0IsMkNBQTZCO0FBaUI3Qix5REFBc0Y7QUFDdEYsa0RBQXFFO0FBQ3JFLHFDQUFxRDtBQUNyRCxxREFTMEI7QUFDMUIsNkVBS3NDO0FBQ3RDLCtDQUFzRjtBQUN0Riw0REFNeUM7QUFDekMsaUVBQWdGO0FBQ2hGLGlFQUFnRjtBQUdoRix1REFBeUQ7QUFpQnpELFNBQWdCLGdCQUFnQixDQUFDLE9BQXlCO0lBQ3RELE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQzlCLENBQUM7QUFZRCxTQUFnQixlQUFlLENBQUMsTUFBc0IsRUFBRSxJQUFhO0lBQ2pFLElBQUksSUFBSSxHQUFtQixNQUFNLENBQUM7SUFDbEMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2QsT0FBTyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUNwQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzlCLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUVELFNBQWdCLDBCQUEw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QztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuXHJcbmltcG9ydCAqIGFzIERhdGFVUkkgZnJvbSAnQGNvY29zL2RhdGEtdXJpJztcclxuaW1wb3J0ICogYXMgY2MgZnJvbSAnY2MnO1xyXG5pbXBvcnQgeyBNYXQ0LCBRdWF0LCBWZWMzLCBWZWM0LCBnZngsIENvbnN0cnVjdG9yIH0gZnJvbSAnY2MnO1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7XHJcbiAgICBBY2Nlc3NvcixcclxuICAgIEFuaW1hdGlvbixcclxuICAgIEFuaW1hdGlvbkNoYW5uZWwsXHJcbiAgICBCdWZmZXJWaWV3LFxyXG4gICAgR2xUZixcclxuICAgIEltYWdlLFxyXG4gICAgTWF0ZXJpYWwsXHJcbiAgICBNZXNoLFxyXG4gICAgTWVzaFByaW1pdGl2ZSxcclxuICAgIE5vZGUsXHJcbiAgICBTY2VuZSxcclxuICAgIFNraW4sXHJcbiAgICBUZXh0dXJlLFxyXG59IGZyb20gJy4uLy4uLy4uL0B0eXBlcy9nbFRGJztcclxuaW1wb3J0IHsgR2xURlVzZXJEYXRhIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3VzZXJEYXRhcyc7XHJcbmltcG9ydCB7IE5vcm1hbEltcG9ydFNldHRpbmcsIFRhbmdlbnRJbXBvcnRTZXR0aW5nIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL2ludGVyZmFjZSc7XHJcbmltcG9ydCB7IGRlZmF1bHRNYWdGaWx0ZXIsIGRlZmF1bHRNaW5GaWx0ZXIgfSBmcm9tICcuLi90ZXh0dXJlLWJhc2UnO1xyXG5pbXBvcnQgeyBkZWNvZGVCYXNlNjRUb0FycmF5QnVmZmVyIH0gZnJvbSAnLi9iYXNlNjQnO1xyXG5pbXBvcnQge1xyXG4gICAgZ2V0R2x0ZkFjY2Vzc29yVHlwZUNvbXBvbmVudHMsXHJcbiAgICBHbHRmQWNjZXNzb3JDb21wb25lbnRUeXBlLFxyXG4gICAgR2x0ZkFuaW1hdGlvbkNoYW5uZWxUYXJnZXRQYXRoLFxyXG4gICAgR2xUZkFuaW1hdGlvbkludGVycG9sYXRpb24sXHJcbiAgICBHbHRmUHJpbWl0aXZlTW9kZSxcclxuICAgIEdsdGZUZXh0dXJlTWFnRmlsdGVyLFxyXG4gICAgR2x0ZlRleHR1cmVNaW5GaWx0ZXIsXHJcbiAgICBHbHRmV3JhcE1vZGUsXHJcbn0gZnJvbSAnLi9nbFRGLmNvbnN0YW50cyc7XHJcbmltcG9ydCB7XHJcbiAgICBEZWNvZGVkRHJhY29HZW9tZXRyeSxcclxuICAgIGRlY29kZURyYWNvR2VvbWV0cnksXHJcbiAgICBEZWNvZGVEcmFjb0dlb21ldHJ5T3B0aW9ucyxcclxuICAgIEtIUkRyYWNvTWVzaENvbXByZXNzaW9uLFxyXG59IGZyb20gJy4va2hyLWRyYWNvLW1lc2gtY29tcHJlc3Npb24nO1xyXG5pbXBvcnQgeyBQUEdlb21ldHJ5LCBQUEdlb21ldHJ5VHlwZWRBcnJheSwgZ2V0R2Z4QXR0cmlidXRlTmFtZSB9IGZyb20gJy4vcHAtZ2VvbWV0cnknO1xyXG5pbXBvcnQge1xyXG4gICAgQWRzazNkc01heFBoeXNpY2FsTWF0ZXJpYWxQcm9wZXJ0aWVzLFxyXG4gICAgQURTS18zRFNfTUFYX1BIWVNJQ0FMX01BVEVSSUFMX0RFRkFVTFRfUEFSQU1FVEVSUyxcclxuICAgIGhhc09yaWdpbmFsTWF0ZXJpYWxFeHRyYXMsXHJcbiAgICBpc0Fkc2szZHNNYXhQaHlzaWNhbE1hdGVyaWFsLFxyXG4gICAgT3JpZ2luYWxNYXRlcmlhbCxcclxufSBmcm9tICdAY29jb3MvZmJ4LWdsdGYtY29udi9saWIvZXh0cmFzJztcclxuaW1wb3J0IHsgZXhvdGljQW5pbWF0aW9uVGFnLCBSZWFsQXJyYXlUcmFjayB9IGZyb20gJ2NjL2VkaXRvci9leG90aWMtYW5pbWF0aW9uJztcclxuaW1wb3J0IHsgR2xURlRyc0FuaW1hdGlvbkRhdGEsIEdsVEZUcnNUcmFja0RhdGEgfSBmcm9tICcuL2dsVEYtYW5pbWF0aW9uLXV0aWxzJztcclxuaW1wb3J0IHsgTWF4UGh5c2ljYWxNYXRlcmlhbCwgTWF5YVN0YW5kYXJkU3VyZmFjZSB9IGZyb20gJy4vbWF0ZXJpYWwtaW50ZXJmYWNlJztcclxuaW1wb3J0IHsgRG9jdW1lbnRFeHRyYSwgRmJ4U3VyZmFjZUxhbWJlcnRQcm9wZXJ0aWVzLCBGYnhTdXJmYWNlUGhvbmdQcm9wZXJ0aWVzIH0gZnJvbSAnQGNvY29zL2ZieC1nbHRmLWNvbnYvdHlwZXMvRkJYLWdsVEYtY29udi1leHRyYXMnO1xyXG5pbXBvcnQgeyBsaW5lYXJUb1NyZ2I4Qml0IH0gZnJvbSAnY2MvZWRpdG9yL2NvbG9yLXV0aWxzJztcclxuaW1wb3J0IHsgRmlsdGVyLCBUZXh0dXJlQmFzZUFzc2V0VXNlckRhdGEsIFdyYXBNb2RlIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzL3VzZXJEYXRhcyc7XHJcblxyXG50eXBlIEZsb2F0QXJyYXkgPSBGbG9hdDMyQXJyYXkgfCBGbG9hdDY0QXJyYXk7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEdsdGZJbWFnZVBhdGhJbmZvIHtcclxuICAgIGlzRGF0YVVyaTogYm9vbGVhbjtcclxuICAgIGZ1bGxQYXRoOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgR2x0ZkltYWdlRGF0YVVSSUluZm8ge1xyXG4gICAgaXNEYXRhVXJpOiBib29sZWFuO1xyXG4gICAgZGF0YVVSSTogRGF0YVVSSS5EYXRhVVJJO1xyXG59XHJcblxyXG5leHBvcnQgdHlwZSBHbHRmSW1hZ2VVcmlJbmZvID0gR2x0ZkltYWdlUGF0aEluZm8gfCBHbHRmSW1hZ2VEYXRhVVJJSW5mbztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0ZpbGVzeXN0ZW1QYXRoKHVyaUluZm86IEdsdGZJbWFnZVVyaUluZm8pOiB1cmlJbmZvIGlzIEdsdGZJbWFnZVBhdGhJbmZvIHtcclxuICAgIHJldHVybiAhdXJpSW5mby5pc0RhdGFVcmk7XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIEdsdGZBc3NldEZpbmRlcktpbmQgPSAnbWVzaGVzJyB8ICdhbmltYXRpb25zJyB8ICdza2VsZXRvbnMnIHwgJ3RleHR1cmVzJyB8ICdtYXRlcmlhbHMnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJR2x0ZkFzc2V0RmluZGVyIHtcclxuICAgIGZpbmQ8VCBleHRlbmRzIGNjLkFzc2V0PihraW5kOiBHbHRmQXNzZXRGaW5kZXJLaW5kLCBpbmRleDogbnVtYmVyLCB0eXBlOiBDb25zdHJ1Y3RvcjxUPik6IFQgfCBudWxsO1xyXG59XHJcblxyXG5leHBvcnQgdHlwZSBBc3NldExvYWRlciA9ICh1dWlkOiBzdHJpbmcpID0+IGNjLkFzc2V0O1xyXG5cclxuZXhwb3J0IHR5cGUgR2x0ZlN1YkFzc2V0ID0gTm9kZSB8IE1lc2ggfCBUZXh0dXJlIHwgU2tpbiB8IEFuaW1hdGlvbiB8IEltYWdlIHwgTWF0ZXJpYWwgfCBTY2VuZTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXRoRnJvbVJvb3QodGFyZ2V0OiBjYy5Ob2RlIHwgbnVsbCwgcm9vdDogY2MuTm9kZSkge1xyXG4gICAgbGV0IG5vZGU6IGNjLk5vZGUgfCBudWxsID0gdGFyZ2V0O1xyXG4gICAgbGV0IHBhdGggPSAnJztcclxuICAgIHdoaWxlIChub2RlICE9PSBudWxsICYmIG5vZGUgIT09IHJvb3QpIHtcclxuICAgICAgICBwYXRoID0gYCR7bm9kZS5uYW1lfS8ke3BhdGh9YDtcclxuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGF0aC5zbGljZSgwLCAtMSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRXb3JsZFRyYW5zZm9ybVVudGlsUm9vdCh0YXJnZXQ6IGNjLk5vZGUsIHJvb3Q6IGNjLk5vZGUsIG91dFBvczogVmVjMywgb3V0Um90OiBRdWF0LCBvdXRTY2FsZTogVmVjMykge1xyXG4gICAgVmVjMy5zZXQob3V0UG9zLCAwLCAwLCAwKTtcclxuICAgIFF1YXQuc2V0KG91dFJvdCwgMCwgMCwgMCwgMSk7XHJcbiAgICBWZWMzLnNldChvdXRTY2FsZSwgMSwgMSwgMSk7XHJcbiAgICB3aGlsZSAodGFyZ2V0ICE9PSByb290KSB7XHJcbiAgICAgICAgVmVjMy5tdWx0aXBseShvdXRQb3MsIG91dFBvcywgdGFyZ2V0LnNjYWxlKTtcclxuICAgICAgICBWZWMzLnRyYW5zZm9ybVF1YXQob3V0UG9zLCBvdXRQb3MsIHRhcmdldC5yb3RhdGlvbik7XHJcbiAgICAgICAgVmVjMy5hZGQob3V0UG9zLCBvdXRQb3MsIHRhcmdldC5wb3NpdGlvbik7XHJcbiAgICAgICAgUXVhdC5tdWx0aXBseShvdXRSb3QsIHRhcmdldC5yb3RhdGlvbiwgb3V0Um90KTtcclxuICAgICAgICBWZWMzLm11bHRpcGx5KG91dFNjYWxlLCB0YXJnZXQuc2NhbGUsIG91dFNjYWxlKTtcclxuICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50ITtcclxuICAgIH1cclxufVxyXG5cclxuZW51bSBHbHRmQXNzZXRLaW5kIHtcclxuICAgIE5vZGUsXHJcbiAgICBNZXNoLFxyXG4gICAgVGV4dHVyZSxcclxuICAgIFNraW4sXHJcbiAgICBBbmltYXRpb24sXHJcbiAgICBJbWFnZSxcclxuICAgIE1hdGVyaWFsLFxyXG4gICAgU2NlbmUsXHJcbn1cclxuXHJcbmNvbnN0IGVudW0gR2x0ZlNlbWFudGljTmFtZSB7XHJcbiAgICAvLyBmbG9hdFxyXG4gICAgLy8gdmVjM1xyXG4gICAgUE9TSVRJT04gPSAnUE9TSVRJT04nLFxyXG5cclxuICAgIC8vIGZsb2F0XHJcbiAgICAvLyB2ZWMzXHJcbiAgICBOT1JNQUwgPSAnTk9STUFMJyxcclxuXHJcbiAgICAvLyBmbG9hdFxyXG4gICAgLy8gdmVjNFxyXG4gICAgVEFOR0VOVCA9ICdUQU5HRU5UJyxcclxuXHJcbiAgICAvLyBmbG9hdC91bnNpZ25lZCBieXRlIG5vcm1hbGl6ZWQvdW5zaWduZWQgc2hvcnQgbm9ybWFsaXplZFxyXG4gICAgLy8gdmVjMlxyXG4gICAgVEVYQ09PUkRfMCA9ICdURVhDT09SRF8wJyxcclxuXHJcbiAgICAvLyBmbG9hdC91bnNpZ25lZCBieXRlIG5vcm1hbGl6ZWQvdW5zaWduZWQgc2hvcnQgbm9ybWFsaXplZFxyXG4gICAgLy8gdmVjMlxyXG4gICAgVEVYQ09PUkRfMSA9ICdURVhDT09SRF8xJyxcclxuXHJcbiAgICAvLyBmbG9hdC91bnNpZ25lZCBieXRlIG5vcm1hbGl6ZWQvdW5zaWduZWQgc2hvcnQgbm9ybWFsaXplZFxyXG4gICAgLy8gdmVjMy92ZWM0XHJcbiAgICBDT0xPUl8wID0gJ0NPTE9SXzAnLFxyXG5cclxuICAgIC8vIHVuc2dpZW5kIGJ5dGUvdW5zaWduZWQgc2hvcnRcclxuICAgIC8vIHZlYzRcclxuICAgIEpPSU5UU18wID0gJ0pPSU5UU18wJyxcclxuXHJcbiAgICAvLyBmbG9hdC91bnNpZ25lZCBieXRlIG5vcm1hbGl6ZWQvdW5zaWduZWQgc2hvcnQgbm9ybWFsaXplZFxyXG4gICAgLy8gdmVjNFxyXG4gICAgV0VJR0hUU18wID0gJ1dFSUdIVFNfMCcsXHJcbn1cclxuXHJcbnR5cGUgQWNjZXNzb3JTdG9yYWdlQ29uc3RydWN0b3IgPVxyXG4gICAgfCB0eXBlb2YgSW50OEFycmF5XHJcbiAgICB8IHR5cGVvZiBVaW50OEFycmF5XHJcbiAgICB8IHR5cGVvZiBJbnQxNkFycmF5XHJcbiAgICB8IHR5cGVvZiBVaW50MTZBcnJheVxyXG4gICAgfCB0eXBlb2YgVWludDMyQXJyYXlcclxuICAgIHwgdHlwZW9mIEZsb2F0MzJBcnJheTtcclxuXHJcbnR5cGUgQWNjZXNzb3JTdG9yYWdlID0gSW50OEFycmF5IHwgVWludDhBcnJheSB8IEludDE2QXJyYXkgfCBVaW50MTZBcnJheSB8IFVpbnQzMkFycmF5IHwgRmxvYXQzMkFycmF5O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJTWVzaE9wdGlvbnMge1xyXG4gICAgbm9ybWFsczogTm9ybWFsSW1wb3J0U2V0dGluZztcclxuICAgIHRhbmdlbnRzOiBUYW5nZW50SW1wb3J0U2V0dGluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJR2x0ZlNlbWFudGljIHtcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIGJhc2VUeXBlOiBudW1iZXI7XHJcbiAgICB0eXBlOiBzdHJpbmc7XHJcbn1cclxuXHJcbmNvbnN0IHF0ID0gbmV3IFF1YXQoKTtcclxuY29uc3QgdjNhID0gbmV3IFZlYzMoKTtcclxuY29uc3QgdjNiID0gbmV3IFZlYzMoKTtcclxuY29uc3QgdjNNaW4gPSBuZXcgVmVjMygpO1xyXG5jb25zdCB2M01heCA9IG5ldyBWZWMzKCk7XHJcblxyXG50eXBlIEZpZWxkc1JlcXVpcmVkPFQsIEsgZXh0ZW5kcyBrZXlvZiBUPiA9IHtcclxuICAgIFtYIGluIEV4Y2x1ZGU8a2V5b2YgVCwgSz5dPzogVFtYXTtcclxufSAmIHtcclxuICAgIFtQIGluIEtdLT86IFRbUF07XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZG9DcmVhdGVTb2NrZXQoc2NlbmVOb2RlOiBjYy5Ob2RlLCBvdXQ6IGNjLlNvY2tldFtdLCBtb2RlbDogY2MuTm9kZSkge1xyXG4gICAgY29uc3QgcGF0aCA9IGdldFBhdGhGcm9tUm9vdChtb2RlbC5wYXJlbnQsIHNjZW5lTm9kZSk7XHJcbiAgICBpZiAobW9kZWwucGFyZW50ID09PSBzY2VuZU5vZGUpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBsZXQgc29ja2V0ID0gb3V0LmZpbmQoKHMpID0+IHMucGF0aCA9PT0gcGF0aCk7XHJcbiAgICBpZiAoIXNvY2tldCkge1xyXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IG5ldyBjYy5Ob2RlKCk7XHJcbiAgICAgICAgdGFyZ2V0Lm5hbWUgPSBgJHttb2RlbC5wYXJlbnQhLm5hbWV9IFNvY2tldGA7XHJcbiAgICAgICAgdGFyZ2V0LnBhcmVudCA9IHNjZW5lTm9kZTtcclxuICAgICAgICBnZXRXb3JsZFRyYW5zZm9ybVVudGlsUm9vdChtb2RlbC5wYXJlbnQhLCBzY2VuZU5vZGUsIHYzYSwgcXQsIHYzYik7XHJcbiAgICAgICAgdGFyZ2V0LnNldFBvc2l0aW9uKHYzYSk7XHJcbiAgICAgICAgdGFyZ2V0LnNldFJvdGF0aW9uKHF0KTtcclxuICAgICAgICB0YXJnZXQuc2V0U2NhbGUodjNiKTtcclxuICAgICAgICBzb2NrZXQgPSBuZXcgY2MuU2tlbGV0YWxBbmltYXRpb24uU29ja2V0KHBhdGgsIHRhcmdldCk7XHJcbiAgICAgICAgb3V0LnB1c2goc29ja2V0KTtcclxuICAgIH1cclxuICAgIG1vZGVsLnBhcmVudCA9IHNvY2tldC50YXJnZXQ7XHJcbn1cclxuXHJcbmludGVyZmFjZSBJUHJvY2Vzc2VkTWVzaCB7XHJcbiAgICBnZW9tZXRyaWVzOiBQUEdlb21ldHJ5W107XHJcbiAgICBtYXRlcmlhbEluZGljZXM6IG51bWJlcltdO1xyXG4gICAgam9pbnRNYXBzOiBudW1iZXJbXVtdO1xyXG4gICAgbWluUG9zaXRpb246IFZlYzM7XHJcbiAgICBtYXhQb3NpdGlvbjogVmVjMztcclxufVxyXG5cclxuY29uc3Qgc2tpblJvb3ROb3RDYWxjdWxhdGVkID0gLTI7XHJcbmNvbnN0IHNraW5Sb290QWJzZW50ID0gLTE7XHJcblxyXG5jb25zdCBzdXBwb3J0ZWRFeHRlbnNpb25zID0gbmV3IFNldDxzdHJpbmc+KFtcclxuICAgIC8vIFNvcnQgcGxlYXNlXHJcbiAgICAnS0hSX2RyYWNvX21lc2hfY29tcHJlc3Npb24nLFxyXG4gICAgJ0tIUl9tYXRlcmlhbHNfcGJyU3BlY3VsYXJHbG9zc2luZXNzJyxcclxuICAgICdLSFJfbWF0ZXJpYWxzX3VubGl0JyxcclxuICAgICdLSFJfdGV4dHVyZV90cmFuc2Zvcm0nLFxyXG5dKTtcclxuXHJcbmludGVyZmFjZSBDcmVhdG9yU3RkTWF0ZXJpYWxQcm9wZXJ0aWVzIHtcclxuICAgIG1haW5Db2xvcjogVmVjNCB8IGNjLkNvbG9yO1xyXG4gICAgYWxiZWRvU2NhbGU6IFZlYzM7XHJcbiAgICB0aWxpbmdPZmZzZXQ6IFZlYzQ7XHJcbiAgICBtYWluVGV4dHVyZTogY2MuVGV4dHVyZTJEIHwgbnVsbDtcclxuICAgIG1ldGFsbGljOiBudW1iZXI7XHJcbiAgICByb3VnaG5lc3M6IG51bWJlcjtcclxuICAgIHBick1hcDogY2MuVGV4dHVyZTJEIHwgbnVsbDtcclxuICAgIG5vcm1hbE1hcDogY2MuVGV4dHVyZTJEIHwgbnVsbDtcclxuICAgIG5vcm1hbFN0cmVudGg6IG51bWJlcjtcclxuICAgIGVtaXNzaXZlOiBWZWM0IHwgY2MuQ29sb3I7XHJcbiAgICBlbWlzc2l2ZVNjYWxlOiBWZWM0O1xyXG4gICAgZW1pc3NpdmVNYXA6IGNjLlRleHR1cmUyRCB8IG51bGw7XHJcbiAgICBvY2NsdXNpb25NYXA6IGNjLlRleHR1cmUyRCB8IG51bGw7XHJcbiAgICBvY2NsdXNpb246IG51bWJlcjtcclxuICAgIGFscGhhVGhyZXNob2xkOiBudW1iZXI7XHJcbn1cclxuXHJcbmludGVyZmFjZSBDcmVhdG9yUGhvbmdNYXRlcmlhbFByb3BlcnRpZXMge1xyXG4gICAgbWFpbkNvbG9yOiBWZWM0IHwgY2MuQ29sb3I7XHJcbiAgICBtYWluVGV4dHVyZTogY2MuVGV4dHVyZTJEIHwgbnVsbDtcclxuICAgIGFsYmVkb1NjYWxlOiBudW1iZXI7XHJcblxyXG4gICAgc3BlY3VsYXJGYWN0b3I6IG51bWJlcjtcclxuICAgIHNwZWN1bGFyQ29sb3I6IFZlYzQgfCBjYy5Db2xvcjtcclxuICAgIHNwZWN1bGFyTWFwOiBjYy5UZXh0dXJlMkQgfCBudWxsO1xyXG5cclxuICAgIG5vcm1hbE1hcDogY2MuVGV4dHVyZTJEIHwgbnVsbDtcclxuICAgIG5vcm1hbEZhY3RvcjogbnVtYmVyO1xyXG5cclxuICAgIGdsb3NzaW5lc3M6IG51bWJlcjtcclxuICAgIHNwZWN1bGFyR2xvc3NpbmVzc01hcDogY2MuVGV4dHVyZTJEIHwgbnVsbDtcclxuICAgIHNoaW5pbmVzc0V4cG9uZW50OiBudW1iZXI7XHJcbiAgICBzaGluaW5lc3NFeHBvbmVudE1hcDogY2MuVGV4dHVyZTJEIHwgbnVsbDtcclxuXHJcbiAgICB0cmFuc3BhcmVuY3lNYXA6IGNjLlRleHR1cmUyRCB8IG51bGw7XHJcbiAgICB0cmFuc3BhcmVudENvbG9yOiBWZWM0IHwgY2MuQ29sb3I7XHJcbiAgICB0cmFuc3BhcmVuY3lGYWN0b3I6IG51bWJlcjtcclxuXHJcbiAgICBlbWlzc2l2ZU1hcDogY2MuVGV4dHVyZTJEIHwgbnVsbDtcclxuICAgIGVtaXNzaXZlOiBWZWM0IHwgY2MuQ29sb3I7XHJcbiAgICBlbWlzc2l2ZVNjYWxlTWFwOiBjYy5UZXh0dXJlMkQgfCBudWxsO1xyXG4gICAgZW1pc3NpdmVTY2FsZTogbnVtYmVyO1xyXG5cclxuICAgIGFscGhhVGhyZXNob2xkOiBudW1iZXI7XHJcblxyXG4gICAgLy8gYmxlbmRlclxyXG4gICAgbWV0YWxsaWM6IG51bWJlcjtcclxuICAgIG1ldGFsbGljTWFwOiBjYy5UZXh0dXJlMkQgfCBudWxsO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQ3JlYXRvckRDQ01ldGFsbGljUm91Z2huZXNzTWF0ZXJpYWxEZWZpbmVzIHtcclxuICAgIEFMUEhBX1NPVVJDRV9JU19PUEFDSVRZOiBib29sZWFuO1xyXG4gICAgVVNFX1ZFUlRFWF9DT0xPUjogYm9vbGVhbjtcclxuICAgIFVTRV9OT1JNQUxfTUFQOiBib29sZWFuO1xyXG4gICAgSEFTX1NFQ09ORF9VVjogYm9vbGVhbjtcclxuICAgIFVTRV9UV09TSURFOiBib29sZWFuO1xyXG4gICAgVVNFX0FMQkVET19NQVA6IGJvb2xlYW47XHJcbiAgICBVU0VfV0VJR0hUX01BUDogYm9vbGVhbjtcclxuICAgIFVTRV9NRVRBTExJQ19NQVA6IGJvb2xlYW47XHJcbiAgICBVU0VfUk9VR0hORVNTX01BUDogYm9vbGVhbjtcclxuICAgIFVTRV9PQ0NMVVNJT05fTUFQOiBib29sZWFuO1xyXG4gICAgLy8gVVNFX1RSQU5TUEFSRU5DWV9NQVA6IGJvb2xlYW47XHJcbiAgICAvLyBVU0VfVFJBTlNQQVJFTkNZQ09MT1JfTUFQOiBib29sZWFuO1xyXG4gICAgVVNFX0VNSVNTSVZFU0NBTEVfTUFQOiBib29sZWFuO1xyXG4gICAgVVNFX0VNSVNTSVZFX01BUDogYm9vbGVhbjtcclxuICAgIFVTRV9FTUlTU0lPTl9DT0xPUl9NQVA6IGJvb2xlYW47XHJcbiAgICAvLyBVU0VfQ1VUT1VUX01BUDogYm9vbGVhbjtcclxuICAgIFVTRV9PUEFDSVRZX01BUDogYm9vbGVhbjtcclxuICAgIFVTRV9BTFBIQV9URVNUOiBib29sZWFuO1xyXG4gICAgRENDX0FQUF9OQU1FOiBudW1iZXI7XHJcbn1cclxuXHJcbmludGVyZmFjZSBDcmVhdG9yRENDTWV0YWxsaWNSb3VnaG5lc3NNYXRlcmlhbFByb3BlcnRpZXMge1xyXG4gICAgYWxiZWRvU2NhbGU6IG51bWJlcjtcclxuICAgIGFscGhhU291cmNlOiBudW1iZXI7XHJcbiAgICBhbHBoYVNvdXJjZU1hcDogY2MuVGV4dHVyZTJEIHwgbnVsbDtcclxuICAgIGJhc2VXZWlnaHRNYXA6IGNjLlRleHR1cmUyRCB8IG51bGw7XHJcbiAgICBlbWlzc2l2ZVNjYWxlOiBudW1iZXI7XHJcbiAgICBlbWlzc2l2ZVNjYWxlTWFwOiBjYy5UZXh0dXJlMkQgfCBudWxsO1xyXG4gICAgZW1pc3NpdmU6IGNjLlZlYzQgfCBjYy5Db2xvcjtcclxuICAgIGVtaXNzaXZlTWFwOiBjYy5UZXh0dXJlMkQgfCBudWxsO1xyXG4gICAgbWFpbkNvbG9yOiBjYy5WZWM0IHwgY2MuQ29sb3I7XHJcbiAgICBtYWluVGV4dHVyZTogY2MuQ29sb3IgfCBjYy5UZXh0dXJlMkQgfCBudWxsO1xyXG4gICAgbWV0YWxsaWM6IG51bWJlcjtcclxuICAgIG1ldGFsbGljTWFwOiBjYy5UZXh0dXJlMkQgfCBudWxsO1xyXG4gICAgbm9ybWFsTWFwOiBjYy5UZXh0dXJlMkQgfCBudWxsO1xyXG4gICAgbm9ybWFsU3RyZW5ndGg6IG51bWJlcjtcclxuICAgIG9jY2x1c2lvbjogbnVtYmVyO1xyXG4gICAgb2NjbHVzaW9uTWFwOiBjYy5UZXh0dXJlMkQgfCBudWxsO1xyXG4gICAgcm91Z2huZXNzOiBudW1iZXI7XHJcbiAgICByb3VnaG5lc3NNYXA6IGNjLlRleHR1cmUyRCB8IG51bGw7XHJcbiAgICBzcGVjdWxhckludGVuc2l0eTogbnVtYmVyO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQ3JlYXRvclN0ZE1hdGVyaWFsRGVmaW5lcyB7XHJcbiAgICBVU0VfVkVSVEVYX0NPTE9SOiBib29sZWFuO1xyXG4gICAgSEFTX1NFQ09ORF9VVjogYm9vbGVhbjtcclxuICAgIFVTRV9BTEJFRE9fTUFQOiBib29sZWFuO1xyXG4gICAgQUxCRURPX1VWOiBzdHJpbmc7XHJcbiAgICBVU0VfUEJSX01BUDogYm9vbGVhbjtcclxuICAgIFVTRV9OT1JNQUxfTUFQOiBib29sZWFuO1xyXG4gICAgVVNFX09DQ0xVU0lPTl9NQVA6IGJvb2xlYW47XHJcbiAgICBVU0VfRU1JU1NJVkVfTUFQOiBib29sZWFuO1xyXG4gICAgRU1JU1NJVkVfVVY6IHN0cmluZztcclxuICAgIFVTRV9BTFBIQV9URVNUOiBib29sZWFuO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQ3JlYXRvclBob25nTWF0ZXJpYWxEZWZpbmVzIHtcclxuICAgIFVTRV9WRVJURVhfQ09MT1I6IGJvb2xlYW47XHJcbiAgICBIQVNfU0VDT05EX1VWOiBib29sZWFuO1xyXG4gICAgVVNFX0FMQkVET19NQVA6IGJvb2xlYW47XHJcbiAgICBVU0VfU1BFQ1VMQVJfTUFQOiBib29sZWFuO1xyXG4gICAgQUxCRURPX1VWOiBzdHJpbmc7XHJcbiAgICBVU0VfU0hJTklORVNTX01BUDogYm9vbGVhbjtcclxuICAgIFVTRV9OT1JNQUxfTUFQOiBib29sZWFuO1xyXG4gICAgVVNFX09DQ0xVU0lPTl9NQVA6IGJvb2xlYW47XHJcbiAgICBVU0VfRU1JU1NJVkVTQ0FMRV9NQVA6IGJvb2xlYW47XHJcbiAgICBVU0VfRU1JU1NJVkVfTUFQOiBib29sZWFuO1xyXG4gICAgVVNFX0VNSVNTSVZFQ09MT1JfTUFQOiBib29sZWFuO1xyXG4gICAgRU1JU1NJVkVfVVY6IHN0cmluZztcclxuICAgIFVTRV9BTFBIQV9URVNUOiBib29sZWFuO1xyXG4gICAgVVNFX1RSQU5TUEFSRU5DWV9NQVA6IGJvb2xlYW47XHJcbiAgICBVU0VfVFJBTlNQQVJFTkNZQ09MT1JfTUFQOiBib29sZWFuO1xyXG5cclxuICAgIEhBU19FWFBPUlRFRF9HTE9TU0lORVNTOiBib29sZWFuO1xyXG4gICAgVVNFX1NQRUNVTEFSX0dMT1NTSU5FU1NfTUFQOiBib29sZWFuO1xyXG5cclxuICAgIERDQ19BUFBfTkFNRTogbnVtYmVyO1xyXG4gICAgSEFTX0VYUE9SVEVEX01FVEFMTElDOiBib29sZWFuO1xyXG4gICAgVVNFX01FVEFMTElDX01BUDogYm9vbGVhbjtcclxufVxyXG5cclxuaW50ZXJmYWNlIENyZWF0b3JVbmxpdE1hdGVyaWFsRGVmaW5lcyB7XHJcbiAgICBVU0VfVEVYVFVSRTogYm9vbGVhbjtcclxufVxyXG5cclxuaW50ZXJmYWNlIENyZWF0b3JVbmxpdE1hdGVyaWFsUHJvcGVydGllcyB7XHJcbiAgICBtYWluQ29sb3I6IFZlYzQ7XHJcbn1cclxuXHJcbnR5cGUgRmJ4U3VyZmFjZUxhbWJlcnRPclBob25nUHJvcGVydGllcyA9IHtcclxuICAgIFt4IGluIGtleW9mIEZieFN1cmZhY2VQaG9uZ1Byb3BlcnRpZXMgfCBrZXlvZiBGYnhTdXJmYWNlTGFtYmVydFByb3BlcnRpZXNdOiB4IGV4dGVuZHMga2V5b2YgRmJ4U3VyZmFjZUxhbWJlcnRQcm9wZXJ0aWVzXHJcbiAgICA/IEZieFN1cmZhY2VMYW1iZXJ0UHJvcGVydGllc1t4XVxyXG4gICAgOiBGYnhTdXJmYWNlUGhvbmdQcm9wZXJ0aWVzW3hdIHwgdW5kZWZpbmVkO1xyXG59O1xyXG5cclxuZW51bSBBcHBJZCB7XHJcbiAgICBVTktOT1dOID0gMCxcclxuICAgIEFEU0tfM0RTX01BWCA9IDEsXHJcbiAgICBDSU5FTUE0RCA9IDMsXHJcbiAgICBNQVlBID0gNSxcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdsdGZDb252ZXJ0ZXIge1xyXG4gICAgZ2V0IGdsdGYoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dsdGY7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHBhdGgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dsdGZGaWxlUGF0aDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgcHJvY2Vzc2VkTWVzaGVzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9jZXNzZWRNZXNoZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGZieE1pc3NpbmdJbWFnZXNJZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZmJ4TWlzc2luZ0ltYWdlc0lkO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9kZWZhdWx0TG9nZ2VyOiBHbHRmQ29udmVydGVyLkxvZ2dlciA9IChsZXZlbCwgZXJyb3IsIGFyZ3MpID0+IHtcclxuICAgICAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoeyBlcnJvciwgYXJndW1lbnRzOiBhcmdzIH0sIHVuZGVmaW5lZCwgNCk7XHJcbiAgICAgICAgc3dpdGNoIChsZXZlbCkge1xyXG4gICAgICAgICAgICBjYXNlIEdsdGZDb252ZXJ0ZXIuTG9nTGV2ZWwuSW5mbzpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkNvbnZlcnRlci5Mb2dMZXZlbC5XYXJuaW5nOlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkNvbnZlcnRlci5Mb2dMZXZlbC5FcnJvcjpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBHbHRmQ29udmVydGVyLkxvZ0xldmVsLkRlYnVnOlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBfcHJvbW90ZWRSb290Tm9kZXM6IG51bWJlcltdID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBfbm9kZVBhdGhUYWJsZTogc3RyaW5nW107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgcGFyZW50IGluZGV4IG9mIGVhY2ggbm9kZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfcGFyZW50czogbnVtYmVyW10gPSBbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSByb290IG5vZGUgb2YgZWFjaCBza2luLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9za2luUm9vdHM6IG51bWJlcltdID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBfbG9nZ2VyOiBHbHRmQ29udmVydGVyLkxvZ2dlcjtcclxuXHJcbiAgICBwcml2YXRlIF9wcm9jZXNzZWRNZXNoZXM6IElQcm9jZXNzZWRNZXNoW10gPSBbXTtcclxuXHJcbiAgICBwcml2YXRlIF9zb2NrZXRNYXBwaW5ncyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XHJcblxyXG4gICAgcHJpdmF0ZSBfZmJ4TWlzc2luZ0ltYWdlc0lkOiBudW1iZXJbXSA9IFtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2dsdGY6IEdsVGYsIHByaXZhdGUgX2J1ZmZlcnM6IEJ1ZmZlcltdLCBwcml2YXRlIF9nbHRmRmlsZVBhdGg6IHN0cmluZywgb3B0aW9ucz86IEdsdGZDb252ZXJ0ZXIuT3B0aW9ucykge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG4gICAgICAgIHRoaXMuX2xvZ2dlciA9IG9wdGlvbnMubG9nZ2VyIHx8IEdsdGZDb252ZXJ0ZXIuX2RlZmF1bHRMb2dnZXI7XHJcblxyXG4gICAgICAgIHRoaXMuX2dsdGYuZXh0ZW5zaW9uc1JlcXVpcmVkPy5mb3JFYWNoKChleHRlbnNpb25SZXF1aXJlZCkgPT4gdGhpcy5fd2FybklmRXh0ZW5zaW9uTm90U3VwcG9ydGVkKGV4dGVuc2lvblJlcXVpcmVkLCB0cnVlKSk7XHJcblxyXG4gICAgICAgIHRoaXMuX2dsdGYuZXh0ZW5zaW9uc1VzZWQ/LmZvckVhY2goKGV4dGVuc2lvblVzZWQpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9nbHRmLmV4dGVuc2lvbnNSZXF1aXJlZD8uaW5jbHVkZXMoZXh0ZW5zaW9uVXNlZCkpIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlJ3ZlIHdhcm5lZCBpdCBiZWZvcmUuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl93YXJuSWZFeHRlbnNpb25Ob3RTdXBwb3J0ZWQoZXh0ZW5zaW9uVXNlZCwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLnByb21vdGVTaW5nbGVSb290Tm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9wcm9tb3RlU2luZ2xlUm9vdE5vZGVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTdWJBc3NldCBpbXBvcnRlcnMgYXJlIE5PVCBndWFyYW50ZWVkIHRvIGJlIGV4ZWN1dGVkIGluLW9yZGVyXHJcbiAgICAgICAgLy8gc28gYWxsIHRoZSBpbnRlcmRlcGVuZGVudCBkYXRhIHNob3VsZCBiZSBjcmVhdGVkIHJpZ2h0IGhlcmVcclxuXHJcbiAgICAgICAgLy8gV2UgcmVxdWlyZSB0aGUgc2NlbmUgZ3JhcGggaXMgYSBkaXNqb2ludCB1bmlvbiBvZiBzdHJpY3QgdHJlZXMuXHJcbiAgICAgICAgLy8gVGhpcyBpcyBhbHNvIHRoZSByZXF1aXJlbWVudCBpbiBnbFRmIDIuMC5cclxuICAgICAgICBpZiAodGhpcy5fZ2x0Zi5ub2RlcyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudHMgPSBuZXcgQXJyYXkodGhpcy5fZ2x0Zi5ub2Rlcy5sZW5ndGgpLmZpbGwoLTEpO1xyXG4gICAgICAgICAgICB0aGlzLl9nbHRmLm5vZGVzLmZvckVhY2goKG5vZGUsIGlOb2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5jaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBpQ2hpbGROb2RlIG9mIG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGFyZW50c1tpQ2hpbGROb2RlXSA9IGlOb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fZ2x0Zi5za2lucykge1xyXG4gICAgICAgICAgICB0aGlzLl9za2luUm9vdHMgPSBuZXcgQXJyYXkodGhpcy5fZ2x0Zi5za2lucy5sZW5ndGgpLmZpbGwoc2tpblJvb3ROb3RDYWxjdWxhdGVkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX25vZGVQYXRoVGFibGUgPSB0aGlzLl9jcmVhdGVOb2RlUGF0aFRhYmxlKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVzZXJEYXRhID0gb3B0aW9ucy51c2VyRGF0YSB8fCAoe30gYXMgR2xURlVzZXJEYXRhKTtcclxuICAgICAgICBpZiAodGhpcy5fZ2x0Zi5tZXNoZXMpIHtcclxuICAgICAgICAgICAgLy8gc3BsaXQgdGhlIG1lc2hlc1xyXG4gICAgICAgICAgICBjb25zdCBub3JtYWxzID0gdXNlckRhdGEubm9ybWFscyA/PyBOb3JtYWxJbXBvcnRTZXR0aW5nLnJlcXVpcmU7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhbmdlbnRzID0gdXNlckRhdGEudGFuZ2VudHMgPz8gVGFuZ2VudEltcG9ydFNldHRpbmcucmVxdWlyZTtcclxuICAgICAgICAgICAgY29uc3QgbW9ycGhOb3JtYWxzID0gdXNlckRhdGEubW9ycGhOb3JtYWxzID8/IE5vcm1hbEltcG9ydFNldHRpbmcuZXhjbHVkZTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9nbHRmLm1lc2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2x0Zk1lc2ggPSB0aGlzLl9nbHRmLm1lc2hlc1tpXTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1pblBvc2l0aW9uID0gbmV3IFZlYzMoTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtYXhQb3NpdGlvbiA9IG5ldyBWZWMzKE51bWJlci5ORUdBVElWRV9JTkZJTklUWSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBnZW9tZXRyaWVzLCBtYXRlcmlhbEluZGljZXMsIGpvaW50TWFwcyB9ID0gUFBHZW9tZXRyeS5za2lubmluZ1Byb2Nlc3MoXHJcbiAgICAgICAgICAgICAgICAgICAgZ2x0Zk1lc2gucHJpbWl0aXZlcy5tYXAoKGdsdGZQcmltaXRpdmUsIHByaW1pdGl2ZUluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBwR2VvbWV0cnkgPSB0aGlzLl9yZWFkUHJpbWl0aXZlKGdsdGZQcmltaXRpdmUsIGksIHByaW1pdGl2ZUluZGV4KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFyZSBtb3JlIHRoYW4gNCBqb2ludHMsIHdlIHNob3VsZCByZWR1Y2UgaXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2Ugb3VyIGVuZ2luZSBjdXJyZW50bHkgY2FuIHByb2Nlc3Mgb25seSB1cCB0byA0IGpvaW50cy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcHBHZW9tZXRyeS5yZWR1Y2VKb2ludEluZmx1ZW5jZXMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2FwcGx5U2V0dGluZ3MocHBHZW9tZXRyeSwgbm9ybWFscywgdGFuZ2VudHMsIG1vcnBoTm9ybWFscywgcHJpbWl0aXZlSW5kZXgsIGkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZWFkQm91bmRzKGdsdGZQcmltaXRpdmUsIHYzTWluLCB2M01heCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFZlYzMubWluKG1pblBvc2l0aW9uLCBtaW5Qb3NpdGlvbiwgdjNNaW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBWZWMzLm1heChtYXhQb3NpdGlvbiwgbWF4UG9zaXRpb24sIHYzTWF4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHBHZW9tZXRyeS5zYW5pdHlDaGVjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHBHZW9tZXRyeTtcclxuICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YS5kaXNhYmxlTWVzaFNwbGl0ID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wcm9jZXNzZWRNZXNoZXMucHVzaCh7IGdlb21ldHJpZXMsIG1hdGVyaWFsSW5kaWNlcywgam9pbnRNYXBzLCBtaW5Qb3NpdGlvbiwgbWF4UG9zaXRpb24gfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2dsdGYubm9kZXMgJiYgdGhpcy5fZ2x0Zi5za2lucykge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlcyA9IHRoaXMuX2dsdGYubm9kZXM7XHJcbiAgICAgICAgICAgIGNvbnN0IGNhbmRpZGF0ZXM6IG51bWJlcltdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLm1lc2ggIT09IHVuZGVmaW5lZCAmJiBub2RlLnNraW4gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbmRpZGF0ZXMucHVzaChpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNhbmRpZGF0ZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbmRpZGF0ZSA9IGNhbmRpZGF0ZXNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FuZGlkYXRlcy5zb21lKChub2RlKSA9PiB0aGlzLl9pc0FuY2VzdG9yT2Yobm9kZSwgY2FuZGlkYXRlKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYW5kaWRhdGVzW2ldID0gY2FuZGlkYXRlc1tjYW5kaWRhdGVzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbmRpZGF0ZXMubGVuZ3RoLS07XHJcbiAgICAgICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2FuZGlkYXRlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IGNhbmRpZGF0ZXNbaV07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBub2Rlc1t0aGlzLl9nZXRQYXJlbnQobm9kZSldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NvY2tldE1hcHBpbmdzLnNldCh0aGlzLl9nZXROb2RlUGF0aChub2RlKSwgcGFyZW50Lm5hbWUgKyAnIFNvY2tldC8nICsgbm9kZXNbbm9kZV0ubmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNyZWF0ZU1lc2goaUdsdGZNZXNoOiBudW1iZXIsIGJHZW5lcmF0ZUxpZ2h0bWFwVVYgPSBmYWxzZSwgYkFkZFZlcnRleENvbG9yID0gZmFsc2UpIHtcclxuICAgICAgICBjb25zdCBwcm9jZXNzZWRNZXNoID0gdGhpcy5fcHJvY2Vzc2VkTWVzaGVzW2lHbHRmTWVzaF07XHJcbiAgICAgICAgY29uc3QgZ2xURk1lc2ggPSB0aGlzLl9nbHRmLm1lc2hlcyFbaUdsdGZNZXNoXTtcclxuICAgICAgICBjb25zdCBidWZmZXJCbG9iID0gbmV3IEJ1ZmZlckJsb2IoKTtcclxuICAgICAgICBjb25zdCB2ZXJ0ZXhCdW5kbGVzID0gbmV3IEFycmF5PGNjLk1lc2guSVZlcnRleEJ1bmRsZT4oKTtcclxuXHJcbiAgICAgICAgY29uc3QgcHJpbWl0aXZlcyA9IHByb2Nlc3NlZE1lc2guZ2VvbWV0cmllcy5tYXAoKHBwR2VvbWV0cnksIHByaW1pdGl2ZUluZGV4KTogY2MuTWVzaC5JU3ViTWVzaCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHsgdmVydGV4Q291bnQsIHZlcnRleFN0cmlkZSwgZm9ybWF0cywgdmVydGV4QnVmZmVyIH0gPSBpbnRlcmxlYXZlVmVydGljZXMoXHJcbiAgICAgICAgICAgICAgICBwcEdlb21ldHJ5LFxyXG4gICAgICAgICAgICAgICAgYkdlbmVyYXRlTGlnaHRtYXBVVixcclxuICAgICAgICAgICAgICAgIGJBZGRWZXJ0ZXhDb2xvcixcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIGJ1ZmZlckJsb2Iuc2V0TmV4dEFsaWdubWVudCgwKTtcclxuICAgICAgICAgICAgdmVydGV4QnVuZGxlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHZpZXc6IHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IGJ1ZmZlckJsb2IuZ2V0TGVuZ3RoKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiB2ZXJ0ZXhCdWZmZXIuYnl0ZUxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogdmVydGV4Q291bnQsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RyaWRlOiB2ZXJ0ZXhTdHJpZGUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogZm9ybWF0cyxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGJ1ZmZlckJsb2IuYWRkQnVmZmVyKHZlcnRleEJ1ZmZlcik7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBwcmltaXRpdmU6IGNjLk1lc2guSVN1Yk1lc2ggPSB7XHJcbiAgICAgICAgICAgICAgICBwcmltaXRpdmVNb2RlOiBwcEdlb21ldHJ5LnByaW1pdGl2ZU1vZGUsXHJcbiAgICAgICAgICAgICAgICBqb2ludE1hcEluZGV4OiBwcEdlb21ldHJ5LmpvaW50TWFwSW5kZXgsXHJcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhCdW5kZWxJbmRpY2VzOiBbcHJpbWl0aXZlSW5kZXhdLFxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgaWYgKHBwR2VvbWV0cnkuaW5kaWNlcyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRpY2VzID0gcHBHZW9tZXRyeS5pbmRpY2VzO1xyXG4gICAgICAgICAgICAgICAgYnVmZmVyQmxvYi5zZXROZXh0QWxpZ25tZW50KGluZGljZXMuQllURVNfUEVSX0VMRU1FTlQpO1xyXG4gICAgICAgICAgICAgICAgcHJpbWl0aXZlLmluZGV4VmlldyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IGJ1ZmZlckJsb2IuZ2V0TGVuZ3RoKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBpbmRpY2VzLmJ5dGVMZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IGluZGljZXMubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0cmlkZTogaW5kaWNlcy5CWVRFU19QRVJfRUxFTUVOVCxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBidWZmZXJCbG9iLmFkZEJ1ZmZlcihpbmRpY2VzLmJ1ZmZlciBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHByaW1pdGl2ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgbWVzaFN0cnVjdDogY2MuTWVzaC5JU3RydWN0ID0ge1xyXG4gICAgICAgICAgICBwcmltaXRpdmVzLFxyXG4gICAgICAgICAgICB2ZXJ0ZXhCdW5kbGVzLFxyXG4gICAgICAgICAgICBtaW5Qb3NpdGlvbjogcHJvY2Vzc2VkTWVzaC5taW5Qb3NpdGlvbixcclxuICAgICAgICAgICAgbWF4UG9zaXRpb246IHByb2Nlc3NlZE1lc2gubWF4UG9zaXRpb24sXHJcbiAgICAgICAgICAgIGpvaW50TWFwczogcHJvY2Vzc2VkTWVzaC5qb2ludE1hcHMsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgZXhwb3J0TW9ycGggPSB0cnVlO1xyXG4gICAgICAgIGlmIChleHBvcnRNb3JwaCkge1xyXG4gICAgICAgICAgICB0eXBlIFN1Yk1lc2hNb3JwaCA9IE5vbk51bGxhYmxlPGNjLk1lc2guSVN0cnVjdFsnbW9ycGgnXT5bJ3N1Yk1lc2hNb3JwaHMnXVswXTtcclxuICAgICAgICAgICAgdHlwZSBNb3JwaFRhcmdldCA9IE5vbk51bGxhYmxlPFN1Yk1lc2hNb3JwaD5bJ3RhcmdldHMnXVswXTtcclxuICAgICAgICAgICAgY29uc3Qgc3ViTWVzaE1vcnBocyA9IHByb2Nlc3NlZE1lc2guZ2VvbWV0cmllcy5tYXAoKHBwR2VvbWV0cnkpOiBTdWJNZXNoTW9ycGggPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG5UYXJnZXRzID0gMDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZXM6IFBQR2VvbWV0cnkuQXR0cmlidXRlW10gPSBbXTtcclxuICAgICAgICAgICAgICAgIHBwR2VvbWV0cnkuZm9yRWFjaEF0dHJpYnV0ZSgoYXR0cmlidXRlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGUubW9ycGhzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5UYXJnZXRzID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5UYXJnZXRzID0gYXR0cmlidXRlLm1vcnBocy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChuVGFyZ2V0cyAhPT0gYXR0cmlidXRlLm1vcnBocy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCYWQgbW9ycGguLi4nKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5wdXNoKGF0dHJpYnV0ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmIChuVGFyZ2V0cyA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0czogTW9ycGhUYXJnZXRbXSA9IG5ldyBBcnJheShuVGFyZ2V0cyk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpVGFyZ2V0ID0gMDsgaVRhcmdldCA8IG5UYXJnZXRzOyArK2lUYXJnZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRzW2lUYXJnZXRdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGFjZW1lbnRzOiBhdHRyaWJ1dGVzLm1hcCgoYXR0cmlidXRlKTogY2MuTWVzaC5JQnVmZmVyVmlldyA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVNb3JwaCA9IGF0dHJpYnV0ZS5tb3JwaHMhW2lUYXJnZXRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWxpZ24gYXMgcmVxdWlyZW1lbnQgb2YgY29ycmVzcG9uZGluZyB0eXBlZCBhcnJheS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlckJsb2Iuc2V0TmV4dEFsaWdubWVudChhdHRyaWJ1dGVNb3JwaC5CWVRFU19QRVJfRUxFTUVOVCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBidWZmZXJCbG9iLmdldExlbmd0aCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyQmxvYi5hZGRCdWZmZXIoYXR0cmlidXRlTW9ycGguYnVmZmVyIGFzIHVua25vd24gYXMgQXJyYXlCdWZmZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBhdHRyaWJ1dGVNb3JwaC5ieXRlTGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmlkZTogYXR0cmlidXRlTW9ycGguQllURVNfUEVSX0VMRU1FTlQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IGF0dHJpYnV0ZU1vcnBoLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXMubWFwKChhdHRyaWJ1dGUpID0+IGdldEdmeEF0dHJpYnV0ZU5hbWUoYXR0cmlidXRlKSBhcyBjYy5nZnguQXR0cmlidXRlTmFtZSksIC8vIFRPRE9cclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRzLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBmaXJzdE5vbk51bGxTdWJNZXNoTW9ycGggPSBzdWJNZXNoTW9ycGhzLmZpbmQoKHN1Yk1lc2hNb3JwaCkgPT4gc3ViTWVzaE1vcnBoICE9PSBudWxsKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmaXJzdE5vbk51bGxTdWJNZXNoTW9ycGgpIHtcclxuICAgICAgICAgICAgICAgIGFzc2VydEdsVEZDb25mb3JtYW5jZShcclxuICAgICAgICAgICAgICAgICAgICBzdWJNZXNoTW9ycGhzLmV2ZXJ5KFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoc3ViTWVzaE1vcnBoKSA9PiAhc3ViTWVzaE1vcnBoIHx8IHN1Yk1lc2hNb3JwaC50YXJnZXRzLmxlbmd0aCA9PT0gZmlyc3ROb25OdWxsU3ViTWVzaE1vcnBoLnRhcmdldHMubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgJ2dsVEYgZXhwZWN0cyB0aGF0IGV2ZXJ5IHByaW1pdGl2ZSBoYXMgc2FtZSBudW1iZXIgb2YgdGFyZ2V0cycsXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN1Yk1lc2hNb3JwaHMubGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0R2xURkNvbmZvcm1hbmNlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbFRGTWVzaC53ZWlnaHRzID09PSB1bmRlZmluZWQgfHwgZ2xURk1lc2gud2VpZ2h0cy5sZW5ndGggPT09IGZpcnN0Tm9uTnVsbFN1Yk1lc2hNb3JwaC50YXJnZXRzLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ051bWJlciBvZiBcIndlaWdodHNcIiBtaXNtYXRjaCBudW1iZXIgb2YgbW9ycGggdGFyZ2V0cycsXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBtZXNoU3RydWN0Lm1vcnBoID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHN1Yk1lc2hNb3JwaHMsXHJcbiAgICAgICAgICAgICAgICAgICAgd2VpZ2h0czogZ2xURk1lc2gud2VpZ2h0cyxcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL0tocm9ub3NHcm91cC9nbFRGL3B1bGwvMTYzMVxyXG4gICAgICAgICAgICAgICAgLy8gPiBJbXBsZW1lbnRhdGlvbiBub3RlOiBBIHNpZ25pZmljYW50IG51bWJlciBvZiBhdXRob3JpbmcgYW5kIGNsaWVudCBpbXBsZW1lbnRhdGlvbnMgYXNzb2NpYXRlIG5hbWVzIHdpdGggbW9ycGggdGFyZ2V0cy5cclxuICAgICAgICAgICAgICAgIC8vID4gV2hpbGUgdGhlIGdsVEYgMi4wIHNwZWNpZmljYXRpb24gY3VycmVudGx5IGRvZXMgbm90IHByb3ZpZGUgYSB3YXkgdG8gc3BlY2lmeSBuYW1lcyxcclxuICAgICAgICAgICAgICAgIC8vID4gbW9zdCB0b29scyB1c2UgYW4gYXJyYXkgb2Ygc3RyaW5ncywgbWVzaC5leHRyYXMudGFyZ2V0TmFtZXMsIGZvciB0aGlzIHB1cnBvc2UuXHJcbiAgICAgICAgICAgICAgICAvLyA+IFRoZSB0YXJnZXROYW1lcyBhcnJheSBhbmQgYWxsIHByaW1pdGl2ZSB0YXJnZXRzIGFycmF5cyBtdXN0IGhhdmUgdGhlIHNhbWUgbGVuZ3RoLlxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBnbFRGTWVzaC5leHRyYXMgPT09ICdvYmplY3QnICYmIEFycmF5LmlzQXJyYXkoZ2xURk1lc2guZXh0cmFzLnRhcmdldE5hbWVzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldE5hbWVzOiBzdHJpbmdbXSA9IGdsVEZNZXNoLmV4dHJhcy50YXJnZXROYW1lcztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE5hbWVzLmxlbmd0aCA9PT0gZmlyc3ROb25OdWxsU3ViTWVzaE1vcnBoLnRhcmdldHMubGVuZ3RoICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE5hbWVzLmV2ZXJ5KChlbGVtKSA9PiB0eXBlb2YgZWxlbSA9PT0gJ3N0cmluZycpXHJcbiAgICAgICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc2hTdHJ1Y3QubW9ycGgudGFyZ2V0TmFtZXMgPSB0YXJnZXROYW1lcy5zbGljZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbWVzaCA9IG5ldyBjYy5NZXNoKCk7XHJcbiAgICAgICAgbWVzaC5uYW1lID0gdGhpcy5fZ2V0R2x0ZlhYTmFtZShHbHRmQXNzZXRLaW5kLk1lc2gsIGlHbHRmTWVzaCk7XHJcbiAgICAgICAgbWVzaC5hc3NpZ24obWVzaFN0cnVjdCwgYnVmZmVyQmxvYi5nZXRDb21iaW5lZCgpKTtcclxuICAgICAgICBtZXNoLmhhc2g7IC8vIHNlcmlhbGl6ZSBoYXNoZXNcclxuICAgICAgICByZXR1cm4gbWVzaDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY3JlYXRlU2tlbGV0b24oaUdsdGZTa2luOiBudW1iZXIsIHNvcnRNYXA/OiBudW1iZXJbXSkge1xyXG4gICAgICAgIGNvbnN0IGdsdGZTa2luID0gdGhpcy5fZ2x0Zi5za2lucyFbaUdsdGZTa2luXTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2tlbGV0b24gPSBuZXcgY2MuU2tlbGV0b24oKTtcclxuICAgICAgICBza2VsZXRvbi5uYW1lID0gdGhpcy5fZ2V0R2x0ZlhYTmFtZShHbHRmQXNzZXRLaW5kLlNraW4sIGlHbHRmU2tpbik7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUUzI1NTFcclxuICAgICAgICBza2VsZXRvbi5fam9pbnRzID0gZ2x0ZlNraW4uam9pbnRzLm1hcCgoaikgPT4gdGhpcy5fbWFwVG9Tb2NrZXRQYXRoKHRoaXMuX2dldE5vZGVQYXRoKGopKSk7XHJcblxyXG4gICAgICAgIGlmIChnbHRmU2tpbi5pbnZlcnNlQmluZE1hdHJpY2VzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY29uc3QgaW52ZXJzZUJpbmRNYXRyaWNlc0FjY2Vzc29yID0gdGhpcy5fZ2x0Zi5hY2Nlc3NvcnMhW2dsdGZTa2luLmludmVyc2VCaW5kTWF0cmljZXNdO1xyXG4gICAgICAgICAgICBpZiAoaW52ZXJzZUJpbmRNYXRyaWNlc0FjY2Vzc29yLmNvbXBvbmVudFR5cGUgIT09IEdsdGZBY2Nlc3NvckNvbXBvbmVudFR5cGUuRkxPQVQgfHwgaW52ZXJzZUJpbmRNYXRyaWNlc0FjY2Vzc29yLnR5cGUgIT09ICdNQVQ0Jykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgaW52ZXJzZSBiaW5kIG1hdHJpeCBzaG91bGQgYmUgZmxvYXRpbmctcG9pbnQgNHg0IG1hdHJpeC4nKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgYmluZHBvc2VzOiBNYXQ0W10gPSBuZXcgQXJyYXkoZ2x0ZlNraW4uam9pbnRzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KGJpbmRwb3Nlcy5sZW5ndGggKiAxNik7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlYWRBY2Nlc3NvcihpbnZlcnNlQmluZE1hdHJpY2VzQWNjZXNzb3IsIGNyZWF0ZURhdGFWaWV3RnJvbVR5cGVkQXJyYXkoZGF0YSkpO1xyXG4gICAgICAgICAgICBhc3NlcnRHbFRGQ29uZm9ybWFuY2UoZGF0YS5sZW5ndGggPT09IDE2ICogYmluZHBvc2VzLmxlbmd0aCwgJ1dyb25nIGRhdGEgaW4gYmluZC1wb3NlcyBhY2Nlc3Nvci4nKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5kcG9zZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIGJpbmRwb3Nlc1tpXSA9IG5ldyBNYXQ0KFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbMTYgKiBpICsgMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVsxNiAqIGkgKyAxXSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhWzE2ICogaSArIDJdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbMTYgKiBpICsgM10sXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVsxNiAqIGkgKyA0XSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhWzE2ICogaSArIDVdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbMTYgKiBpICsgNl0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVsxNiAqIGkgKyA3XSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhWzE2ICogaSArIDhdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbMTYgKiBpICsgOV0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVsxNiAqIGkgKyAxMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVsxNiAqIGkgKyAxMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVsxNiAqIGkgKyAxMl0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVsxNiAqIGkgKyAxM10sXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVsxNiAqIGkgKyAxNF0sXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVsxNiAqIGkgKyAxNV0sXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNTUxXHJcbiAgICAgICAgICAgIHNrZWxldG9uLl9iaW5kcG9zZXMgPSBiaW5kcG9zZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBza2VsZXRvbi5oYXNoOyAvLyBzZXJpYWxpemUgaGFzaGVzXHJcbiAgICAgICAgcmV0dXJuIHNrZWxldG9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRBbmltYXRpb25EdXJhdGlvbihpR2x0ZkFuaW1hdGlvbjogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3QgZ2x0ZkFuaW1hdGlvbiA9IHRoaXMuX2dsdGYuYW5pbWF0aW9ucyFbaUdsdGZBbmltYXRpb25dO1xyXG4gICAgICAgIGxldCBkdXJhdGlvbiA9IDA7XHJcbiAgICAgICAgZ2x0ZkFuaW1hdGlvbi5jaGFubmVscy5mb3JFYWNoKChnbHRmQ2hhbm5lbCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXROb2RlID0gZ2x0ZkNoYW5uZWwudGFyZ2V0Lm5vZGU7XHJcbiAgICAgICAgICAgIGlmICh0YXJnZXROb2RlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIFdoZW4gbm9kZSBpc24ndCBkZWZpbmVkLCBjaGFubmVsIHNob3VsZCBiZSBpZ25vcmVkLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzYW1wbGVyID0gZ2x0ZkFuaW1hdGlvbi5zYW1wbGVyc1tnbHRmQ2hhbm5lbC5zYW1wbGVyXTtcclxuICAgICAgICAgICAgY29uc3QgaW5wdXRBY2Nlc3NvciA9IHRoaXMuX2dsdGYuYWNjZXNzb3JzIVtzYW1wbGVyLmlucHV0XTtcclxuICAgICAgICAgICAgY29uc3QgY2hhbm5lbER1cmF0aW9uID1cclxuICAgICAgICAgICAgICAgIGlucHV0QWNjZXNzb3IubWF4ICE9PSB1bmRlZmluZWQgJiYgaW5wdXRBY2Nlc3Nvci5tYXgubGVuZ3RoID09PSAxID8gTWF0aC5mcm91bmQoaW5wdXRBY2Nlc3Nvci5tYXhbMF0pIDogMDtcclxuICAgICAgICAgICAgZHVyYXRpb24gPSBNYXRoLm1heChjaGFubmVsRHVyYXRpb24sIGR1cmF0aW9uKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZHVyYXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNyZWF0ZUFuaW1hdGlvbihpR2x0ZkFuaW1hdGlvbjogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3QgZ2x0ZkFuaW1hdGlvbiA9IHRoaXMuX2dsdGYuYW5pbWF0aW9ucyFbaUdsdGZBbmltYXRpb25dO1xyXG5cclxuICAgICAgICBjb25zdCBnbFRGVHJzQW5pbWF0aW9uRGF0YSA9IG5ldyBHbFRGVHJzQW5pbWF0aW9uRGF0YSgpO1xyXG4gICAgICAgIGNvbnN0IGdldEpvaW50Q3VydmVEYXRhID0gKG5vZGU6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBwYXRoID0gdGhpcy5fbWFwVG9Tb2NrZXRQYXRoKHRoaXMuX2dldE5vZGVQYXRoKG5vZGUpKTtcclxuICAgICAgICAgICAgcmV0dXJuIGdsVEZUcnNBbmltYXRpb25EYXRhLmFkZE5vZGVBbmltYXRpb24ocGF0aCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGR1cmF0aW9uID0gMDtcclxuICAgICAgICBjb25zdCBrZXlzID0gbmV3IEFycmF5PEZsb2F0QXJyYXk+KCk7XHJcbiAgICAgICAgY29uc3Qga2V5c01hcCA9IG5ldyBNYXA8bnVtYmVyLCBudW1iZXI+KCk7XHJcbiAgICAgICAgY29uc3QgZ2V0S2V5c0luZGV4ID0gKGlJbnB1dEFjY2Vzc29yOiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgbGV0IGkgPSBrZXlzTWFwLmdldChpSW5wdXRBY2Nlc3Nvcik7XHJcbiAgICAgICAgICAgIGlmIChpID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0QWNjZXNzb3IgPSB0aGlzLl9nbHRmLmFjY2Vzc29ycyFbaUlucHV0QWNjZXNzb3JdO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXRzID0gdGhpcy5fcmVhZEFjY2Vzc29ySW50b0FycmF5KGlucHV0QWNjZXNzb3IpIGFzIEZsb2F0MzJBcnJheTtcclxuICAgICAgICAgICAgICAgIGkgPSBrZXlzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIGtleXMucHVzaChpbnB1dHMpO1xyXG4gICAgICAgICAgICAgICAga2V5c01hcC5zZXQoaUlucHV0QWNjZXNzb3IsIGkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IHRyYWNrczogY2MuYW5pbWF0aW9uLlRyYWNrW10gPSBbXTtcclxuXHJcbiAgICAgICAgZ2x0ZkFuaW1hdGlvbi5jaGFubmVscy5mb3JFYWNoKChnbHRmQ2hhbm5lbCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXROb2RlID0gZ2x0ZkNoYW5uZWwudGFyZ2V0Lm5vZGU7XHJcbiAgICAgICAgICAgIGlmICh0YXJnZXROb2RlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIFdoZW4gbm9kZSBpc24ndCBkZWZpbmVkLCBjaGFubmVsIHNob3VsZCBiZSBpZ25vcmVkLlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBqb2ludEN1cnZlRGF0YSA9IGdldEpvaW50Q3VydmVEYXRhKHRhcmdldE5vZGUpO1xyXG4gICAgICAgICAgICBjb25zdCBzYW1wbGVyID0gZ2x0ZkFuaW1hdGlvbi5zYW1wbGVyc1tnbHRmQ2hhbm5lbC5zYW1wbGVyXTtcclxuICAgICAgICAgICAgY29uc3QgaUtleXMgPSBnZXRLZXlzSW5kZXgoc2FtcGxlci5pbnB1dCk7XHJcbiAgICAgICAgICAgIGlmIChnbHRmQ2hhbm5lbC50YXJnZXQucGF0aCA9PT0gJ3dlaWdodHMnKSB7XHJcbiAgICAgICAgICAgICAgICB0cmFja3MucHVzaCguLi50aGlzLl9nbFRGV2VpZ2h0Q2hhbm5lbFRvVHJhY2tzKGdsdGZBbmltYXRpb24sIGdsdGZDaGFubmVsLCBrZXlzW2lLZXlzXSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZ2x0ZkNoYW5uZWxUb0N1cnZlRGF0YShnbHRmQW5pbWF0aW9uLCBnbHRmQ2hhbm5lbCwgam9pbnRDdXJ2ZURhdGEsIGtleXNbaUtleXNdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBpbnB1dEFjY2Vzc29yID0gdGhpcy5fZ2x0Zi5hY2Nlc3NvcnMhW3NhbXBsZXIuaW5wdXRdO1xyXG4gICAgICAgICAgICBjb25zdCBjaGFubmVsRHVyYXRpb24gPVxyXG4gICAgICAgICAgICAgICAgaW5wdXRBY2Nlc3Nvci5tYXggIT09IHVuZGVmaW5lZCAmJiBpbnB1dEFjY2Vzc29yLm1heC5sZW5ndGggPT09IDEgPyBNYXRoLmZyb3VuZChpbnB1dEFjY2Vzc29yLm1heFswXSkgOiAwO1xyXG4gICAgICAgICAgICBkdXJhdGlvbiA9IE1hdGgubWF4KGNoYW5uZWxEdXJhdGlvbiwgZHVyYXRpb24pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fZ2x0Zi5ub2Rlcykge1xyXG4gICAgICAgICAgICBjb25zdCBzdGFuZGFsb25lSW5wdXQgPSBuZXcgRmxvYXQzMkFycmF5KFswLjBdKTtcclxuICAgICAgICAgICAgY29uc3QgciA9IG5ldyBRdWF0KCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHQgPSBuZXcgVmVjMygpO1xyXG4gICAgICAgICAgICBjb25zdCBzID0gbmV3IFZlYzMoKTtcclxuICAgICAgICAgICAgdGhpcy5fZ2x0Zi5ub2Rlcy5mb3JFYWNoKChub2RlLCBub2RlSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9wcm9tb3RlZFJvb3ROb2Rlcy5pbmNsdWRlcyhub2RlSW5kZXgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJvbW90ZWQgcm9vdCBub2RlcyBzaG91bGQgbm90IGhhdmUgYW5pbWF0aW9ucy5cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBqb2ludEN1cnZlRGF0YSA9IGdldEpvaW50Q3VydmVEYXRhKG5vZGVJbmRleCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbTogTWF0NCB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLm1hdHJpeCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG0gPSB0aGlzLl9yZWFkTm9kZU1hdHJpeChub2RlLm1hdHJpeCk7XHJcbiAgICAgICAgICAgICAgICAgICAgTWF0NC50b1JUUyhtLCByLCB0LCBzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgham9pbnRDdXJ2ZURhdGEucG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB2ID0gbmV3IFZlYzMoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS50cmFuc2xhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBWZWMzLnNldCh2LCBub2RlLnRyYW5zbGF0aW9uWzBdLCBub2RlLnRyYW5zbGF0aW9uWzFdLCBub2RlLnRyYW5zbGF0aW9uWzJdKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVmVjMy5jb3B5KHYsIHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBqb2ludEN1cnZlRGF0YS5zZXRDb25zdGFudFBvc2l0aW9uKHYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFqb2ludEN1cnZlRGF0YS5zY2FsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBuZXcgVmVjMygxLCAxLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9kZS5zY2FsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBWZWMzLnNldCh2LCBub2RlLnNjYWxlWzBdLCBub2RlLnNjYWxlWzFdLCBub2RlLnNjYWxlWzJdKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgVmVjMy5jb3B5KHYsIHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBqb2ludEN1cnZlRGF0YS5zZXRDb25zdGFudFNjYWxlKHYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFqb2ludEN1cnZlRGF0YS5yb3RhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBuZXcgUXVhdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub2RlLnJvdGF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2dldE5vZGVSb3RhdGlvbihub2RlLnJvdGF0aW9uLCB2KTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgUXVhdC5jb3B5KHYsIHIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBqb2ludEN1cnZlRGF0YS5zZXRDb25zdGFudFJvdGF0aW9uKHYpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGV4b3RpY0FuaW1hdGlvbiA9IGdsVEZUcnNBbmltYXRpb25EYXRhLmNyZWF0ZUV4b3RpYygpO1xyXG5cclxuICAgICAgICBjb25zdCBhbmltYXRpb25DbGlwID0gbmV3IGNjLkFuaW1hdGlvbkNsaXAoKTtcclxuICAgICAgICBhbmltYXRpb25DbGlwLm5hbWUgPSB0aGlzLl9nZXRHbHRmWFhOYW1lKEdsdGZBc3NldEtpbmQuQW5pbWF0aW9uLCBpR2x0ZkFuaW1hdGlvbik7XHJcbiAgICAgICAgYW5pbWF0aW9uQ2xpcC53cmFwTW9kZSA9IGNjLkFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuTG9vcDtcclxuICAgICAgICBhbmltYXRpb25DbGlwLmR1cmF0aW9uID0gZHVyYXRpb247XHJcbiAgICAgICAgYW5pbWF0aW9uQ2xpcC5zYW1wbGUgPSAzMDtcclxuICAgICAgICBhbmltYXRpb25DbGlwLmhhc2g7IC8vIHNlcmlhbGl6ZSBoYXNoZXNcclxuICAgICAgICBhbmltYXRpb25DbGlwLmVuYWJsZVRyc0JsZW5kaW5nID0gdHJ1ZTtcclxuICAgICAgICB0cmFja3MuZm9yRWFjaCgodHJhY2spID0+IGFuaW1hdGlvbkNsaXAuYWRkVHJhY2sodHJhY2spKTtcclxuICAgICAgICBhbmltYXRpb25DbGlwW2V4b3RpY0FuaW1hdGlvblRhZ10gPSBleG90aWNBbmltYXRpb247XHJcbiAgICAgICAgcmV0dXJuIGFuaW1hdGlvbkNsaXA7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNyZWF0ZU1hdGVyaWFsKFxyXG4gICAgICAgIGlHbHRmTWF0ZXJpYWw6IG51bWJlcixcclxuICAgICAgICBnbHRmQXNzZXRGaW5kZXI6IElHbHRmQXNzZXRGaW5kZXIsXHJcbiAgICAgICAgZWZmZWN0R2V0dGVyOiAobmFtZTogc3RyaW5nKSA9PiBjYy5FZmZlY3RBc3NldCxcclxuICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgIHVzZVZlcnRleENvbG9ycz86IGJvb2xlYW47XHJcbiAgICAgICAgICAgIGRlcHRoV3JpdGVJbkFscGhhTW9kZUJsZW5kPzogYm9vbGVhbjtcclxuICAgICAgICAgICAgc21hcnRNYXRlcmlhbEVuYWJsZWQ/OiBib29sZWFuO1xyXG4gICAgICAgIH0sXHJcbiAgICApIHtcclxuICAgICAgICBjb25zdCB1c2VWZXJ0ZXhDb2xvcnMgPSBvcHRpb25zLnVzZVZlcnRleENvbG9ycyA/PyB0cnVlO1xyXG4gICAgICAgIGNvbnN0IGRlcHRoV3JpdGVJbkFscGhhTW9kZUJsZW5kID0gb3B0aW9ucy5kZXB0aFdyaXRlSW5BbHBoYU1vZGVCbGVuZCA/PyBmYWxzZTtcclxuICAgICAgICBjb25zdCBzbWFydE1hdGVyaWFsRW5hYmxlZCA9IG9wdGlvbnMuc21hcnRNYXRlcmlhbEVuYWJsZWQgPz8gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgZ2x0Zk1hdGVyaWFsID0gdGhpcy5fZ2x0Zi5tYXRlcmlhbHMhW2lHbHRmTWF0ZXJpYWxdO1xyXG4gICAgICAgIGNvbnN0IGlzVW5saXQgPSAoZ2x0Zk1hdGVyaWFsLmV4dGVuc2lvbnMgJiYgZ2x0Zk1hdGVyaWFsLmV4dGVuc2lvbnMuS0hSX21hdGVyaWFsc191bmxpdCkgIT09IHVuZGVmaW5lZDtcclxuICAgICAgICBjb25zdCBkb2N1bWVudEV4dHJhcyA9IHRoaXMuX2dsdGYuZXh0cmFzO1xyXG5cclxuICAgICAgICAvLyBUcmFuc2ZlciBkY2MgZGVmYXVsdCBtYXRlcmlhbCBhdHRyaWJ1dGVzLlxyXG4gICAgICAgIGlmIChzbWFydE1hdGVyaWFsRW5hYmxlZCkge1xyXG4gICAgICAgICAgICBsZXQgYXBwTmFtZSA9ICcnO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRvY3VtZW50RXh0cmFzID09PSAnb2JqZWN0JyAmJiBkb2N1bWVudEV4dHJhcyAmJiAnRkJYLWdsVEYtY29udicgaW4gZG9jdW1lbnRFeHRyYXMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZieEV4dHJhcyA9IGRvY3VtZW50RXh0cmFzWydGQlgtZ2xURi1jb252J10gYXMgRG9jdW1lbnRFeHRyYTtcclxuICAgICAgICAgICAgICAgIC8vIFtcIkZCWC1nbFRGLWNvbnZcIl0uZmJ4RmlsZUhlYWRlckluZm8uc2NlbmVJbmZvLm9yaWdpbmFsLmFwcGxpY2F0aW9uTmFtZVxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmYnhFeHRyYXMuZmJ4RmlsZUhlYWRlckluZm8gIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmYnhFeHRyYXMuZmJ4RmlsZUhlYWRlckluZm8uc2NlbmVJbmZvICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBOYW1lID0gZmJ4RXh0cmFzLmZieEZpbGVIZWFkZXJJbmZvLnNjZW5lSW5mby5vcmlnaW5hbC5hcHBsaWNhdGlvbk5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IEFQUF9OQU1FX1JFR0VYX0JMRU5ERVIgPSAvQmxlbmRlci87XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgQVBQX05BTUVfUkVHRVhfTUFZQSA9IC9NYXlhLztcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBBUFBfTkFNRV9SRUdFWF8zRFNNQVggPSAvTWF4LztcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBBUFBfTkFNRV9SRUdFWF9DSU5FTUE0RCA9IC9DaW5lbWEvO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IEFQUF9OQU1FX1JFR0VYX01JWEFNTyA9IC9taXhhbW8vO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhd0RhdGEgPSBnbHRmTWF0ZXJpYWwuZXh0cmFzWydGQlgtZ2xURi1jb252J10ucmF3O1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGRlYnVnZ2VyO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChBUFBfTkFNRV9SRUdFWF9CTEVOREVSLnRlc3QoYXBwTmFtZSkgfHwgQVBQX05BTUVfUkVHRVhfTUlYQU1PLnRlc3QoYXBwTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJhd0RhdGEudHlwZSA9PT0gJ3Bob25nJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnZlcnRCbGVuZGVyUEJSTWF0ZXJpYWwoZ2x0Zk1hdGVyaWFsLCBpR2x0Zk1hdGVyaWFsLCBnbHRmQXNzZXRGaW5kZXIsIGVmZmVjdEdldHRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKEFQUF9OQU1FX1JFR0VYX01BWUEudGVzdChhcHBOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmF3RGF0YS50eXBlID09PSAncGhvbmcnIHx8IHJhd0RhdGEudHlwZSA9PT0gJ2xhbWJlcnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY29udmVydFBob25nTWF0ZXJpYWwoaUdsdGZNYXRlcmlhbCwgZ2x0ZkFzc2V0RmluZGVyLCBlZmZlY3RHZXR0ZXIsIEFwcElkLk1BWUEsIHJhd0RhdGEucHJvcGVydGllcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmF3RGF0YS5wcm9wZXJ0aWVzLk1heWEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyYXdEYXRhLnByb3BlcnRpZXMuTWF5YS52YWx1ZS5UeXBlSWQudmFsdWUgPT09IDEzOTgwMzE0NDMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY29udmVydE1heWFTdGFuZGFyZFN1cmZhY2UoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlHbHRmTWF0ZXJpYWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsdGZBc3NldEZpbmRlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWZmZWN0R2V0dGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXdEYXRhLnByb3BlcnRpZXMuTWF5YS52YWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChBUFBfTkFNRV9SRUdFWF8zRFNNQVgudGVzdChhcHBOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmF3RGF0YS50eXBlID09PSAncGhvbmcnIHx8IHJhd0RhdGEudHlwZSA9PT0gJ2xhbWJlcnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY29udmVydFBob25nTWF0ZXJpYWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaUdsdGZNYXRlcmlhbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbHRmQXNzZXRGaW5kZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWZmZWN0R2V0dGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFwcElkLkFEU0tfM0RTX01BWCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXdEYXRhLnByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyYXdEYXRhLnByb3BlcnRpZXNbJzNkc01heCddLnZhbHVlLk9SSUdJTkFMX01UTCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJhd0RhdGEucHJvcGVydGllc1snM2RzTWF4J10udmFsdWUuT1JJR0lOQUxfTVRMLnZhbHVlID09PSAnUEhZU0lDQUxfTVRMJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb252ZXJ0TWF4UGh5c2ljYWxNYXRlcmlhbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaUdsdGZNYXRlcmlhbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2x0ZkFzc2V0RmluZGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZmZlY3RHZXR0ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhd0RhdGEucHJvcGVydGllc1snM2RzTWF4J10udmFsdWUuUGFyYW1ldGVycy52YWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChBUFBfTkFNRV9SRUdFWF9DSU5FTUE0RC50ZXN0KGFwcE5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyYXdEYXRhLnR5cGUgPT09ICdwaG9uZycgfHwgcmF3RGF0YS50eXBlID09PSAnbGFtYmVydCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb252ZXJ0UGhvbmdNYXRlcmlhbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpR2x0Zk1hdGVyaWFsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsdGZBc3NldEZpbmRlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZmZlY3RHZXR0ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQXBwSWQuQ0lORU1BNEQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF3RGF0YS5wcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmF3RGF0YS50eXBlID09PSAncGhvbmcnIHx8IHJhd0RhdGEudHlwZSA9PT0gJ2xhbWJlcnQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb252ZXJ0UGhvbmdNYXRlcmlhbChpR2x0Zk1hdGVyaWFsLCBnbHRmQXNzZXRGaW5kZXIsIGVmZmVjdEdldHRlciwgQXBwSWQuVU5LTk9XTiwgcmF3RGF0YS5wcm9wZXJ0aWVzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ0ZhaWxlZCB0byByZWFkIGZieCBoZWFkZXIgaW5mbywgZGVmYXVsdCBtYXRlcmlhbCB3YXMgdXNlZCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnRmFpbGVkIHRvIHJlYWQgZmJ4IGluZm8uJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBwaHlzaWNhbE1hdGVyaWFsID0gKCgpOiBjYy5NYXRlcmlhbCB8IG51bGwgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFoYXNPcmlnaW5hbE1hdGVyaWFsRXh0cmFzKGdsdGZNYXRlcmlhbC5leHRyYXMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7IG9yaWdpbmFsTWF0ZXJpYWwgfSA9IGdsdGZNYXRlcmlhbC5leHRyYXNbJ0ZCWC1nbFRGLWNvbnYnXTtcclxuICAgICAgICAgICAgICAgIGlmIChpc0Fkc2szZHNNYXhQaHlzaWNhbE1hdGVyaWFsKG9yaWdpbmFsTWF0ZXJpYWwpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnZlcnRBZHNrUGh5c2ljYWxNYXRlcmlhbChnbHRmTWF0ZXJpYWwsIGlHbHRmTWF0ZXJpYWwsIGdsdGZBc3NldEZpbmRlciwgZWZmZWN0R2V0dGVyLCBvcmlnaW5hbE1hdGVyaWFsKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCk7XHJcbiAgICAgICAgICAgIGlmIChwaHlzaWNhbE1hdGVyaWFsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGh5c2ljYWxNYXRlcmlhbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBtYXRlcmlhbCA9IG5ldyBjYy5NYXRlcmlhbCgpO1xyXG4gICAgICAgIG1hdGVyaWFsLm5hbWUgPSB0aGlzLl9nZXRHbHRmWFhOYW1lKEdsdGZBc3NldEtpbmQuTWF0ZXJpYWwsIGlHbHRmTWF0ZXJpYWwpO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNDQ1XHJcbiAgICAgICAgbWF0ZXJpYWwuX2VmZmVjdEFzc2V0ID0gZWZmZWN0R2V0dGVyKGBkYjovL2ludGVybmFsL2VmZmVjdHMvJHtpc1VubGl0ID8gJ2J1aWx0aW4tdW5saXQnIDogJ2J1aWx0aW4tc3RhbmRhcmQnfS5lZmZlY3RgKTtcclxuXHJcbiAgICAgICAgY29uc3QgZGVmaW5lczogUGFydGlhbDxDcmVhdG9yU3RkTWF0ZXJpYWxEZWZpbmVzICYgQ3JlYXRvclVubGl0TWF0ZXJpYWxEZWZpbmVzPiA9IHt9O1xyXG4gICAgICAgIGNvbnN0IHByb3BzOiBQYXJ0aWFsPENyZWF0b3JTdGRNYXRlcmlhbFByb3BlcnRpZXMgJiBDcmVhdG9yVW5saXRNYXRlcmlhbFByb3BlcnRpZXM+ID0ge307XHJcbiAgICAgICAgY29uc3Qgc3RhdGVzOiBjYy5NYXRlcmlhbFsnX3N0YXRlcyddWzBdID0ge1xyXG4gICAgICAgICAgICByYXN0ZXJpemVyU3RhdGU6IHt9LFxyXG4gICAgICAgICAgICBibGVuZFN0YXRlOiB7IHRhcmdldHM6IFt7fV0gfSxcclxuICAgICAgICAgICAgZGVwdGhTdGVuY2lsU3RhdGU6IHt9LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9nbHRmLm1lc2hlcykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2dsdGYubWVzaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNoID0gdGhpcy5fZ2x0Zi5tZXNoZXNbaV07XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG1lc2gucHJpbWl0aXZlcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByaW0gPSBtZXNoLnByaW1pdGl2ZXNbal07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByaW0ubWF0ZXJpYWwgPT09IGlHbHRmTWF0ZXJpYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByaW0uYXR0cmlidXRlc1tHbHRmU2VtYW50aWNOYW1lLkNPTE9SXzBdICYmIHVzZVZlcnRleENvbG9ycykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5lc1snVVNFX1ZFUlRFWF9DT0xPUiddID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJpbS5hdHRyaWJ1dGVzW0dsdGZTZW1hbnRpY05hbWUuVEVYQ09PUkRfMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluZXNbJ0hBU19TRUNPTkRfVVYnXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZ2x0ZiBNYXRlcmlhbHM6IGh0dHBzOi8vZ2l0aHViLmNvbS9LaHJvbm9zR3JvdXAvZ2xURi9ibG9iL21haW4vZXh0ZW5zaW9ucy8yLjAvQXJjaGl2ZWQvS0hSX21hdGVyaWFsc19wYnJTcGVjdWxhckdsb3NzaW5lc3MvUkVBRE1FLm1kXHJcbiAgICAgICAgbGV0IGhhc1Bick1ldGFsbGljUm91Z2huZXNzID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKGdsdGZNYXRlcmlhbC5wYnJNZXRhbGxpY1JvdWdobmVzcykge1xyXG4gICAgICAgICAgICBjb25zdCBwYnJNZXRhbGxpY1JvdWdobmVzcyA9IGdsdGZNYXRlcmlhbC5wYnJNZXRhbGxpY1JvdWdobmVzcztcclxuICAgICAgICAgICAgaWYgKHBick1ldGFsbGljUm91Z2huZXNzLmJhc2VDb2xvclRleHR1cmUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgaGFzUGJyTWV0YWxsaWNSb3VnaG5lc3MgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbWFpblRleHR1cmUgPSBnbHRmQXNzZXRGaW5kZXIuZmluZCgndGV4dHVyZXMnLCBwYnJNZXRhbGxpY1JvdWdobmVzcy5iYXNlQ29sb3JUZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpO1xyXG4gICAgICAgICAgICAgICAgZGVmaW5lc1tpc1VubGl0ID8gJ1VTRV9URVhUVVJFJyA6ICdVU0VfQUxCRURPX01BUCddID0gbWFpblRleHR1cmUgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBwcm9wc1snbWFpblRleHR1cmUnXSA9IG1haW5UZXh0dXJlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBick1ldGFsbGljUm91Z2huZXNzLmJhc2VDb2xvclRleHR1cmUudGV4Q29vcmQpIHtcclxuICAgICAgICAgICAgICAgICAgICBkZWZpbmVzWydBTEJFRE9fVVYnXSA9ICd2X3V2MSc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAocGJyTWV0YWxsaWNSb3VnaG5lc3MuYmFzZUNvbG9yVGV4dHVyZS5leHRlbnNpb25zICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGJyTWV0YWxsaWNSb3VnaG5lc3MuYmFzZUNvbG9yVGV4dHVyZS5leHRlbnNpb25zLktIUl90ZXh0dXJlX3RyYW5zZm9ybSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wc1sndGlsaW5nT2Zmc2V0J10gPSB0aGlzLl9raHJUZXh0dXJlVHJhbnNmb3JtVG9UaWxpbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYnJNZXRhbGxpY1JvdWdobmVzcy5iYXNlQ29sb3JUZXh0dXJlLmV4dGVuc2lvbnMuS0hSX3RleHR1cmVfdHJhbnNmb3JtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGJyTWV0YWxsaWNSb3VnaG5lc3MuYmFzZUNvbG9yRmFjdG9yKSB7XHJcbiAgICAgICAgICAgICAgICBoYXNQYnJNZXRhbGxpY1JvdWdobmVzcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjID0gcGJyTWV0YWxsaWNSb3VnaG5lc3MuYmFzZUNvbG9yRmFjdG9yO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzVW5saXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wc1snbWFpbkNvbG9yJ10gPSBuZXcgVmVjNChjWzBdLCBjWzFdLCBjWzJdLCAxKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcHNbJ2FsYmVkb1NjYWxlJ10gPSBuZXcgVmVjMyhjWzBdLCBjWzFdLCBjWzJdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGJyTWV0YWxsaWNSb3VnaG5lc3MubWV0YWxsaWNSb3VnaG5lc3NUZXh0dXJlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGhhc1Bick1ldGFsbGljUm91Z2huZXNzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGRlZmluZXNbJ1VTRV9QQlJfTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcHJvcHNbJ3Bick1hcCddID0gZ2x0ZkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgcGJyTWV0YWxsaWNSb3VnaG5lc3MubWV0YWxsaWNSb3VnaG5lc3NUZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpO1xyXG4gICAgICAgICAgICAgICAgcHJvcHNbJ21ldGFsbGljJ10gPSAxO1xyXG4gICAgICAgICAgICAgICAgcHJvcHNbJ3JvdWdobmVzcyddID0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGJyTWV0YWxsaWNSb3VnaG5lc3MubWV0YWxsaWNGYWN0b3IgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgaGFzUGJyTWV0YWxsaWNSb3VnaG5lc3MgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcHJvcHNbJ21ldGFsbGljJ10gPSBwYnJNZXRhbGxpY1JvdWdobmVzcy5tZXRhbGxpY0ZhY3RvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGJyTWV0YWxsaWNSb3VnaG5lc3Mucm91Z2huZXNzRmFjdG9yICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGhhc1Bick1ldGFsbGljUm91Z2huZXNzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHByb3BzWydyb3VnaG5lc3MnXSA9IHBick1ldGFsbGljUm91Z2huZXNzLnJvdWdobmVzc0ZhY3RvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWhhc1Bick1ldGFsbGljUm91Z2huZXNzKSB7XHJcbiAgICAgICAgICAgIGlmIChnbHRmTWF0ZXJpYWwuZXh0ZW5zaW9ucz8uS0hSX21hdGVyaWFsc19wYnJTcGVjdWxhckdsb3NzaW5lc3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb252ZXJ0R2x0ZlBiclNwZWN1bGFyR2xvc3NpbmVzcyhcclxuICAgICAgICAgICAgICAgICAgICBnbHRmTWF0ZXJpYWwsXHJcbiAgICAgICAgICAgICAgICAgICAgaUdsdGZNYXRlcmlhbCxcclxuICAgICAgICAgICAgICAgICAgICBnbHRmQXNzZXRGaW5kZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgZWZmZWN0R2V0dGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlcHRoV3JpdGVJbkFscGhhTW9kZUJsZW5kLFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZ2x0Zk1hdGVyaWFsLm5vcm1hbFRleHR1cmUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjb25zdCBwYnJOb3JtYWxUZXh0dXJlID0gZ2x0Zk1hdGVyaWFsLm5vcm1hbFRleHR1cmU7XHJcbiAgICAgICAgICAgIGlmIChwYnJOb3JtYWxUZXh0dXJlLmluZGV4ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGRlZmluZXNbJ1VTRV9OT1JNQUxfTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcHJvcHNbJ25vcm1hbE1hcCddID0gZ2x0ZkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgcGJyTm9ybWFsVGV4dHVyZS5pbmRleCwgY2MuVGV4dHVyZTJEKTtcclxuICAgICAgICAgICAgICAgIGlmIChwYnJOb3JtYWxUZXh0dXJlLnNjYWxlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wc1snbm9ybWFsU3RyZW50aCddID0gcGJyTm9ybWFsVGV4dHVyZS5zY2FsZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvcHNbJ29jY2x1c2lvbiddID0gMC4wO1xyXG4gICAgICAgIGlmIChnbHRmTWF0ZXJpYWwub2NjbHVzaW9uVGV4dHVyZSkge1xyXG4gICAgICAgICAgICBjb25zdCBwYnJPY2NsdXNpb25UZXh0dXJlID0gZ2x0Zk1hdGVyaWFsLm9jY2x1c2lvblRleHR1cmU7XHJcbiAgICAgICAgICAgIGlmIChwYnJPY2NsdXNpb25UZXh0dXJlLmluZGV4ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGRlZmluZXNbJ1VTRV9PQ0NMVVNJT05fTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcHJvcHNbJ29jY2x1c2lvbk1hcCddID0gZ2x0ZkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgcGJyT2NjbHVzaW9uVGV4dHVyZS5pbmRleCwgY2MuVGV4dHVyZTJEKTtcclxuICAgICAgICAgICAgICAgIGlmIChwYnJPY2NsdXNpb25UZXh0dXJlLnN0cmVuZ3RoICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wc1snb2NjbHVzaW9uJ10gPSBwYnJPY2NsdXNpb25UZXh0dXJlLnN0cmVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZ2x0Zk1hdGVyaWFsLmVtaXNzaXZlVGV4dHVyZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGRlZmluZXNbJ1VTRV9FTUlTU0lWRV9NQVAnXSA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmIChnbHRmTWF0ZXJpYWwuZW1pc3NpdmVUZXh0dXJlLnRleENvb3JkKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZpbmVzWydFTUlTU0lWRV9VViddID0gJ3ZfdXYxJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwcm9wc1snZW1pc3NpdmVNYXAnXSA9IGdsdGZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIGdsdGZNYXRlcmlhbC5lbWlzc2l2ZVRleHR1cmUuaW5kZXgsIGNjLlRleHR1cmUyRCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZ2x0Zk1hdGVyaWFsLmVtaXNzaXZlRmFjdG9yICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY29uc3QgdiA9IGdsdGZNYXRlcmlhbC5lbWlzc2l2ZUZhY3RvcjtcclxuICAgICAgICAgICAgcHJvcHNbJ2VtaXNzaXZlJ10gPSB0aGlzLl9ub3JtYWxpemVBcnJheVRvQ29jb3NDb2xvcih2KVsxXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChnbHRmTWF0ZXJpYWwuZG91YmxlU2lkZWQpIHtcclxuICAgICAgICAgICAgc3RhdGVzLnJhc3Rlcml6ZXJTdGF0ZSEuY3VsbE1vZGUgPSBnZnguQ3VsbE1vZGUuTk9ORTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN3aXRjaCAoZ2x0Zk1hdGVyaWFsLmFscGhhTW9kZSkge1xyXG4gICAgICAgICAgICBjYXNlICdCTEVORCc6IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJsZW5kU3RhdGUgPSBzdGF0ZXMuYmxlbmRTdGF0ZSEudGFyZ2V0cyFbMF07XHJcbiAgICAgICAgICAgICAgICBibGVuZFN0YXRlLmJsZW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJsZW5kU3RhdGUuYmxlbmRTcmMgPSBnZnguQmxlbmRGYWN0b3IuU1JDX0FMUEhBO1xyXG4gICAgICAgICAgICAgICAgYmxlbmRTdGF0ZS5ibGVuZERzdCA9IGdmeC5CbGVuZEZhY3Rvci5PTkVfTUlOVVNfU1JDX0FMUEhBO1xyXG4gICAgICAgICAgICAgICAgYmxlbmRTdGF0ZS5ibGVuZERzdEFscGhhID0gZ2Z4LkJsZW5kRmFjdG9yLk9ORV9NSU5VU19TUkNfQUxQSEE7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZXMuZGVwdGhTdGVuY2lsU3RhdGUhLmRlcHRoV3JpdGUgPSBkZXB0aFdyaXRlSW5BbHBoYU1vZGVCbGVuZDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ01BU0snOiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBhbHBoYUN1dG9mZiA9IGdsdGZNYXRlcmlhbC5hbHBoYUN1dG9mZiA9PT0gdW5kZWZpbmVkID8gMC41IDogZ2x0Zk1hdGVyaWFsLmFscGhhQ3V0b2ZmO1xyXG4gICAgICAgICAgICAgICAgZGVmaW5lc1snVVNFX0FMUEhBX1RFU1QnXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBwcm9wc1snYWxwaGFUaHJlc2hvbGQnXSA9IGFscGhhQ3V0b2ZmO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAnT1BBUVVFJzpcclxuICAgICAgICAgICAgY2FzZSB1bmRlZmluZWQ6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xvZ2dlcihHbHRmQ29udmVydGVyLkxvZ0xldmVsLldhcm5pbmcsIEdsdGZDb252ZXJ0ZXIuQ29udmVydGVyRXJyb3IuVW5zdXBwb3J0ZWRBbHBoYU1vZGUsIHtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiBnbHRmTWF0ZXJpYWwuYWxwaGFNb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hdGVyaWFsOiBpR2x0Zk1hdGVyaWFsLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNDQ1XHJcbiAgICAgICAgbWF0ZXJpYWwuX2RlZmluZXMgPSBbZGVmaW5lc107XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUUzI0NDVcclxuICAgICAgICBtYXRlcmlhbC5fcHJvcHMgPSBbcHJvcHNdO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNDQ1XHJcbiAgICAgICAgbWF0ZXJpYWwuX3N0YXRlcyA9IFtzdGF0ZXNdO1xyXG5cclxuICAgICAgICByZXR1cm4gbWF0ZXJpYWw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFRleHR1cmVQYXJhbWV0ZXJzKGdsdGZUZXh0dXJlOiBUZXh0dXJlLCB1c2VyRGF0YTogVGV4dHVyZUJhc2VBc3NldFVzZXJEYXRhKSB7XHJcbiAgICAgICAgY29uc3QgY29udmVydFdyYXBNb2RlID0gKGdsdGZXcmFwTW9kZT86IG51bWJlcik6IFdyYXBNb2RlID0+IHtcclxuICAgICAgICAgICAgaWYgKGdsdGZXcmFwTW9kZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBnbHRmV3JhcE1vZGUgPSBHbHRmV3JhcE1vZGUuX19ERUZBVUxUO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZ2x0ZldyYXBNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEdsdGZXcmFwTW9kZS5DTEFNUF9UT19FREdFOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnY2xhbXAtdG8tZWRnZSc7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEdsdGZXcmFwTW9kZS5NSVJST1JFRF9SRVBFQVQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdtaXJyb3JlZC1yZXBlYXQnO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBHbHRmV3JhcE1vZGUuUkVQRUFUOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAncmVwZWF0JztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9nZ2VyKEdsdGZDb252ZXJ0ZXIuTG9nTGV2ZWwuV2FybmluZywgR2x0ZkNvbnZlcnRlci5Db252ZXJ0ZXJFcnJvci5VbnN1cHBvcnRlZFRleHR1cmVQYXJhbWV0ZXIsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3dyYXBNb2RlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGdsdGZXcmFwTW9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsbGJhY2s6IEdsdGZXcmFwTW9kZS5SRVBFQVQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhbXBsZXI6IGdsdGZUZXh0dXJlLnNhbXBsZXIhLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlOiB0aGlzLl9nbHRmLnRleHR1cmVzIS5pbmRleE9mKGdsdGZUZXh0dXJlKSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3JlcGVhdCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBjb252ZXJ0TWFnRmlsdGVyID0gKGdsdGZGaWx0ZXI6IG51bWJlcik6IEZpbHRlciA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZ2x0ZkZpbHRlcikge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBHbHRmVGV4dHVyZU1hZ0ZpbHRlci5ORUFSRVNUOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnbmVhcmVzdCc7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEdsdGZUZXh0dXJlTWFnRmlsdGVyLkxJTkVBUjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2xpbmVhcic7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvZ2dlcihHbHRmQ29udmVydGVyLkxvZ0xldmVsLldhcm5pbmcsIEdsdGZDb252ZXJ0ZXIuQ29udmVydGVyRXJyb3IuVW5zdXBwb3J0ZWRUZXh0dXJlUGFyYW1ldGVyLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdtYWdGaWx0ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZ2x0ZkZpbHRlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsbGJhY2s6IEdsdGZUZXh0dXJlTWFnRmlsdGVyLkxJTkVBUixcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2FtcGxlcjogZ2x0ZlRleHR1cmUuc2FtcGxlciEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmU6IHRoaXMuX2dsdGYudGV4dHVyZXMhLmluZGV4T2YoZ2x0ZlRleHR1cmUpLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnbGluZWFyJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEFsc28gY29udmVydCBtaXAgZmlsdGVyLlxyXG4gICAgICAgIGNvbnN0IGNvbnZlcnRNaW5GaWx0ZXIgPSAoZ2x0ZkZpbHRlcjogbnVtYmVyKTogRmlsdGVyW10gPT4ge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGdsdGZGaWx0ZXIpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgR2x0ZlRleHR1cmVNaW5GaWx0ZXIuTkVBUkVTVDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWyduZWFyZXN0JywgJ25vbmUnXTtcclxuICAgICAgICAgICAgICAgIGNhc2UgR2x0ZlRleHR1cmVNaW5GaWx0ZXIuTElORUFSOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbJ2xpbmVhcicsICdub25lJ107XHJcbiAgICAgICAgICAgICAgICBjYXNlIEdsdGZUZXh0dXJlTWluRmlsdGVyLk5FQVJFU1RfTUlQTUFQX05FQVJFU1Q6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsnbmVhcmVzdCcsICduZWFyZXN0J107XHJcbiAgICAgICAgICAgICAgICBjYXNlIEdsdGZUZXh0dXJlTWluRmlsdGVyLkxJTkVBUl9NSVBNQVBfTkVBUkVTVDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWydsaW5lYXInLCAnbmVhcmVzdCddO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBHbHRmVGV4dHVyZU1pbkZpbHRlci5ORUFSRVNUX01JUE1BUF9MSU5FQVI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsnbmVhcmVzdCcsICdsaW5lYXInXTtcclxuICAgICAgICAgICAgICAgIGNhc2UgR2x0ZlRleHR1cmVNaW5GaWx0ZXIuTElORUFSX01JUE1BUF9MSU5FQVI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsnbGluZWFyJywgJ2xpbmVhciddO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2dnZXIoR2x0ZkNvbnZlcnRlci5Mb2dMZXZlbC5XYXJuaW5nLCBHbHRmQ29udmVydGVyLkNvbnZlcnRlckVycm9yLlVuc3VwcG9ydGVkVGV4dHVyZVBhcmFtZXRlciwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbWluRmlsdGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGdsdGZGaWx0ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhbGxiYWNrOiBHbHRmVGV4dHVyZU1pbkZpbHRlci5MSU5FQVIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhbXBsZXI6IGdsdGZUZXh0dXJlLnNhbXBsZXIhLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlOiB0aGlzLl9nbHRmLnRleHR1cmVzIS5pbmRleE9mKGdsdGZUZXh0dXJlKSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWydsaW5lYXInLCAnbm9uZSddO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKGdsdGZUZXh0dXJlLnNhbXBsZXIgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB1c2VyRGF0YS53cmFwTW9kZVMgPSAncmVwZWF0JztcclxuICAgICAgICAgICAgdXNlckRhdGEud3JhcE1vZGVUID0gJ3JlcGVhdCc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgZ2x0ZlNhbXBsZXIgPSB0aGlzLl9nbHRmLnNhbXBsZXJzIVtnbHRmVGV4dHVyZS5zYW1wbGVyXTtcclxuICAgICAgICAgICAgdXNlckRhdGEud3JhcE1vZGVTID0gY29udmVydFdyYXBNb2RlKGdsdGZTYW1wbGVyLndyYXBTKTtcclxuICAgICAgICAgICAgdXNlckRhdGEud3JhcE1vZGVUID0gY29udmVydFdyYXBNb2RlKGdsdGZTYW1wbGVyLndyYXBUKTtcclxuICAgICAgICAgICAgdXNlckRhdGEubWFnZmlsdGVyID0gZ2x0ZlNhbXBsZXIubWFnRmlsdGVyID09PSB1bmRlZmluZWQgPyBkZWZhdWx0TWFnRmlsdGVyIDogY29udmVydE1hZ0ZpbHRlcihnbHRmU2FtcGxlci5tYWdGaWx0ZXIpO1xyXG4gICAgICAgICAgICB1c2VyRGF0YS5taW5maWx0ZXIgPSBkZWZhdWx0TWluRmlsdGVyO1xyXG4gICAgICAgICAgICBpZiAoZ2x0ZlNhbXBsZXIubWluRmlsdGVyICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IFttaW4sIG1pcF0gPSBjb252ZXJ0TWluRmlsdGVyKGdsdGZTYW1wbGVyLm1pbkZpbHRlcik7XHJcbiAgICAgICAgICAgICAgICB1c2VyRGF0YS5taW5maWx0ZXIgPSBtaW47XHJcbiAgICAgICAgICAgICAgICB1c2VyRGF0YS5taXBmaWx0ZXIgPSBtaXA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNyZWF0ZVNjZW5lKGlHbHRmU2NlbmU6IG51bWJlciwgZ2x0ZkFzc2V0RmluZGVyOiBJR2x0ZkFzc2V0RmluZGVyLCB3aXRoVHJhbnNmb3JtID0gdHJ1ZSk6IGNjLk5vZGUge1xyXG4gICAgICAgIGNvbnN0IHNjZW5lID0gdGhpcy5fZ2V0U2NlbmVOb2RlKGlHbHRmU2NlbmUsIGdsdGZBc3NldEZpbmRlciwgd2l0aFRyYW5zZm9ybSk7XHJcbiAgICAgICAgLy8gdXBkYXRlIHNraW5uaW5nIHJvb3QgdG8gYW5pbWF0aW9uIHJvb3Qgbm9kZVxyXG4gICAgICAgIHNjZW5lLmdldENvbXBvbmVudHNJbkNoaWxkcmVuKGNjLlNraW5uZWRNZXNoUmVuZGVyZXIpLmZvckVhY2goKGNvbXApID0+IChjb21wLnNraW5uaW5nUm9vdCA9IHNjZW5lKSk7XHJcbiAgICAgICAgcmV0dXJuIHNjZW5lO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBjcmVhdGVTb2NrZXRzKHNjZW5lTm9kZTogY2MuTm9kZSkge1xyXG4gICAgICAgIGNvbnN0IHNvY2tldHM6IGNjLlNvY2tldFtdID0gW107XHJcbiAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHRoaXMuX3NvY2tldE1hcHBpbmdzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBzY2VuZU5vZGUuZ2V0Q2hpbGRCeVBhdGgocGFpclswXSkhO1xyXG4gICAgICAgICAgICBkb0NyZWF0ZVNvY2tldChzY2VuZU5vZGUsIHNvY2tldHMsIG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc29ja2V0cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVhZEltYWdlSW5CdWZmZXJWaWV3KGJ1ZmZlclZpZXc6IEJ1ZmZlclZpZXcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVhZEJ1ZmZlclZpZXcoYnVmZmVyVmlldyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfd2FybklmRXh0ZW5zaW9uTm90U3VwcG9ydGVkKG5hbWU6IHN0cmluZywgcmVxdWlyZWQ6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAoIXN1cHBvcnRlZEV4dGVuc2lvbnMuaGFzKG5hbWUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZ2dlcihHbHRmQ29udmVydGVyLkxvZ0xldmVsLldhcm5pbmcsIEdsdGZDb252ZXJ0ZXIuQ29udmVydGVyRXJyb3IuVW5zdXBwb3J0ZWRFeHRlbnNpb24sIHtcclxuICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICByZXF1aXJlZCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3Byb21vdGVTaW5nbGVSb290Tm9kZXMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2dsdGYubm9kZXMgPT09IHVuZGVmaW5lZCB8fCB0aGlzLl9nbHRmLnNjZW5lcyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChjb25zdCBnbFRGU2NlbmUgb2YgdGhpcy5fZ2x0Zi5zY2VuZXMpIHtcclxuICAgICAgICAgICAgaWYgKGdsVEZTY2VuZS5ub2RlcyAhPT0gdW5kZWZpbmVkICYmIGdsVEZTY2VuZS5ub2Rlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIGl0J3MgdGhlIG9ubHkgcm9vdCBub2RlIGluIHRoZSBzY2VuZS5cclxuICAgICAgICAgICAgICAgIC8vIFdlIHdvdWxkIHByb21vdGUgaXQgdG8gdGhlIHByZWZhYidzIHJvb3QoaS5lIHRoZSBza2lubmluZyByb290KS5cclxuICAgICAgICAgICAgICAgIC8vIFNvIHdlIGNhbm5vdCBpbmNsdWRlIGl0IGFzIHBhcnQgb2YgdGhlIGpvaW50IHBhdGggb3IgYW5pbWF0aW9uIHRhcmdldCBwYXRoLlxyXG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdE5vZGVJbmRleCA9IGdsVEZTY2VuZS5ub2Rlc1swXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBXZSBjYW4ndCBwZXJmb3JtIHRoaXMgb3BlcmF0aW9uIGlmIHRoZSByb290IHBhcnRpY2lwYXRlcyBpbiBza2lubmluZywgb3ItLVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2dsdGYuc2tpbnMgJiYgdGhpcy5fZ2x0Zi5za2lucy5zb21lKChza2luKSA9PiBza2luLmpvaW50cy5pbmNsdWRlcyhyb290Tm9kZUluZGV4KSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBhbmltYXRpb24uXHJcbiAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2x0Zi5hbmltYXRpb25zICYmXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZ2x0Zi5hbmltYXRpb25zLnNvbWUoKGFuaW1hdGlvbjogYW55KSA9PiBhbmltYXRpb24uY2hhbm5lbHMuc29tZSgoY2hhbm5lbDogYW55KSA9PiBjaGFubmVsLnRhcmdldC5ub2RlID09PSByb290Tm9kZUluZGV4KSlcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuX3Byb21vdGVkUm9vdE5vZGVzLnB1c2gocm9vdE5vZGVJbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0Tm9kZVJvdGF0aW9uKHJvdGF0aW9uOiBudW1iZXJbXSwgb3V0OiBRdWF0KSB7XHJcbiAgICAgICAgUXVhdC5zZXQob3V0LCByb3RhdGlvblswXSwgcm90YXRpb25bMV0sIHJvdGF0aW9uWzJdLCByb3RhdGlvblszXSk7XHJcbiAgICAgICAgUXVhdC5ub3JtYWxpemUob3V0LCBvdXQpO1xyXG4gICAgICAgIHJldHVybiBvdXQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2x0ZkNoYW5uZWxUb0N1cnZlRGF0YShcclxuICAgICAgICBnbHRmQW5pbWF0aW9uOiBBbmltYXRpb24sXHJcbiAgICAgICAgZ2x0ZkNoYW5uZWw6IEFuaW1hdGlvbkNoYW5uZWwsXHJcbiAgICAgICAgam9pbnRDdXJ2ZURhdGE6IFJldHVyblR5cGU8R2xURlRyc0FuaW1hdGlvbkRhdGFbJ2FkZE5vZGVBbmltYXRpb24nXT4sXHJcbiAgICAgICAgaW5wdXQ6IEZsb2F0QXJyYXksXHJcbiAgICApIHtcclxuICAgICAgICBsZXQgcHJvcE5hbWU6ICdwb3NpdGlvbicgfCAnc2NhbGUnIHwgJ3JvdGF0aW9uJztcclxuICAgICAgICBpZiAoZ2x0ZkNoYW5uZWwudGFyZ2V0LnBhdGggPT09IEdsdGZBbmltYXRpb25DaGFubmVsVGFyZ2V0UGF0aC50cmFuc2xhdGlvbikge1xyXG4gICAgICAgICAgICBwcm9wTmFtZSA9ICdwb3NpdGlvbic7XHJcbiAgICAgICAgfSBlbHNlIGlmIChnbHRmQ2hhbm5lbC50YXJnZXQucGF0aCA9PT0gR2x0ZkFuaW1hdGlvbkNoYW5uZWxUYXJnZXRQYXRoLnJvdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHByb3BOYW1lID0gJ3JvdGF0aW9uJztcclxuICAgICAgICB9IGVsc2UgaWYgKGdsdGZDaGFubmVsLnRhcmdldC5wYXRoID09PSBHbHRmQW5pbWF0aW9uQ2hhbm5lbFRhcmdldFBhdGguc2NhbGUpIHtcclxuICAgICAgICAgICAgcHJvcE5hbWUgPSAnc2NhbGUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2xvZ2dlcihHbHRmQ29udmVydGVyLkxvZ0xldmVsLkVycm9yLCBHbHRmQ29udmVydGVyLkNvbnZlcnRlckVycm9yLlVuc3VwcG9ydGVkQ2hhbm5lbFBhdGgsIHtcclxuICAgICAgICAgICAgICAgIGNoYW5uZWw6IGdsdGZBbmltYXRpb24uY2hhbm5lbHMuaW5kZXhPZihnbHRmQ2hhbm5lbCksXHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IHRoaXMuX2dsdGYuYW5pbWF0aW9ucyEuaW5kZXhPZihnbHRmQW5pbWF0aW9uKSxcclxuICAgICAgICAgICAgICAgIHBhdGg6IGdsdGZDaGFubmVsLnRhcmdldC5wYXRoLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZ2x0ZlNhbXBsZXIgPSBnbHRmQW5pbWF0aW9uLnNhbXBsZXJzW2dsdGZDaGFubmVsLnNhbXBsZXJdO1xyXG5cclxuICAgICAgICBjb25zdCBpbnRlcnBvbGF0aW9uID0gZ2x0ZlNhbXBsZXIuaW50ZXJwb2xhdGlvbiA/PyBHbFRmQW5pbWF0aW9uSW50ZXJwb2xhdGlvbi5MSU5FQVI7XHJcbiAgICAgICAgc3dpdGNoIChpbnRlcnBvbGF0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgR2xUZkFuaW1hdGlvbkludGVycG9sYXRpb24uU1RFUDpcclxuICAgICAgICAgICAgY2FzZSBHbFRmQW5pbWF0aW9uSW50ZXJwb2xhdGlvbi5MSU5FQVI6XHJcbiAgICAgICAgICAgIGNhc2UgR2xUZkFuaW1hdGlvbkludGVycG9sYXRpb24uQ1VCSUNfU1BMSU5FOlxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBvdXRwdXQgPSB0aGlzLl9yZWFkQWNjZXNzb3JJbnRvQXJyYXlBbmROb3JtYWxpemVBc0Zsb2F0KHRoaXMuX2dsdGYuYWNjZXNzb3JzIVtnbHRmU2FtcGxlci5vdXRwdXRdKTtcclxuXHJcbiAgICAgICAgam9pbnRDdXJ2ZURhdGFbcHJvcE5hbWVdID0gbmV3IEdsVEZUcnNUcmFja0RhdGEoaW50ZXJwb2xhdGlvbiwgaW5wdXQsIG91dHB1dCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2xURldlaWdodENoYW5uZWxUb1RyYWNrcyhnbHRmQW5pbWF0aW9uOiBBbmltYXRpb24sIGdsdGZDaGFubmVsOiBBbmltYXRpb25DaGFubmVsLCB0aW1lczogRmxvYXRBcnJheSk6IGNjLmFuaW1hdGlvbi5UcmFja1tdIHtcclxuICAgICAgICBjb25zdCBnbHRmU2FtcGxlciA9IGdsdGZBbmltYXRpb24uc2FtcGxlcnNbZ2x0ZkNoYW5uZWwuc2FtcGxlcl07XHJcbiAgICAgICAgY29uc3Qgb3V0cHV0cyA9IHRoaXMuX3JlYWRBY2Nlc3NvckludG9BcnJheUFuZE5vcm1hbGl6ZUFzRmxvYXQodGhpcy5fZ2x0Zi5hY2Nlc3NvcnMhW2dsdGZTYW1wbGVyLm91dHB1dF0pO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldE5vZGUgPSB0aGlzLl9nbHRmLm5vZGVzIVtnbHRmQ2hhbm5lbC50YXJnZXQubm9kZSFdO1xyXG4gICAgICAgIGNvbnN0IHRhcmdldFByb2Nlc3NlZE1lc2ggPSB0aGlzLl9wcm9jZXNzZWRNZXNoZXNbdGFyZ2V0Tm9kZS5tZXNoIV07XHJcbiAgICAgICAgY29uc3QgdHJhY2tzID0gbmV3IEFycmF5PGNjLmFuaW1hdGlvbi5UcmFjaz4oKTtcclxuICAgICAgICBjb25zdCBuU3ViTWVzaGVzID0gdGFyZ2V0UHJvY2Vzc2VkTWVzaC5nZW9tZXRyaWVzLmxlbmd0aDtcclxuICAgICAgICBsZXQgblRhcmdldCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaVN1Yk1lc2ggPSAwOyBpU3ViTWVzaCA8IG5TdWJNZXNoZXM7ICsraVN1Yk1lc2gpIHtcclxuICAgICAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSB0YXJnZXRQcm9jZXNzZWRNZXNoLmdlb21ldHJpZXNbaVN1Yk1lc2hdO1xyXG4gICAgICAgICAgICBpZiAoIWdlb21ldHJ5Lmhhc0F0dHJpYnV0ZShQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHsgbW9ycGhzIH0gPSBnZW9tZXRyeS5nZXRBdHRyaWJ1dGUoUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3MucG9zaXRpb24pO1xyXG4gICAgICAgICAgICBpZiAoIW1vcnBocykge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgblRhcmdldCA9IG1vcnBocy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoblRhcmdldCA9PT0gMCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKFxyXG4gICAgICAgICAgICAgICAgYE1vcnBoIGFuaW1hdGlvbiBpbiAke2dsdGZBbmltYXRpb24ubmFtZX0gb24gbm9kZSAke3RoaXMuX2dsdGYubm9kZXMhW2dsdGZDaGFubmVsLnRhcmdldC5ub2RlIV19YCArXHJcbiAgICAgICAgICAgICAgICAnaXMgZ29pbmcgdG8gYmUgaWdub3JlZCBkdWUgdG8gbGFjayBvZiBtb3JwaCBpbmZvcm1hdGlvbiBpbiBtZXNoLicsXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdHJhY2sgPSBuZXcgUmVhbEFycmF5VHJhY2soKTtcclxuICAgICAgICB0cmFja3MucHVzaCh0cmFjayk7XHJcbiAgICAgICAgdHJhY2sucGF0aCA9IG5ldyBjYy5hbmltYXRpb24uVHJhY2tQYXRoKClcclxuICAgICAgICAgICAgLnRvSGllcmFyY2h5KHRoaXMuX21hcFRvU29ja2V0UGF0aCh0aGlzLl9nZXROb2RlUGF0aChnbHRmQ2hhbm5lbC50YXJnZXQubm9kZSEpKSlcclxuICAgICAgICAgICAgLnRvQ29tcG9uZW50KGNjLmpzLmdldENsYXNzTmFtZShjYy5NZXNoUmVuZGVyZXIpKTtcclxuICAgICAgICB0cmFjay5wcm94eSA9IG5ldyBjYy5hbmltYXRpb24uTW9ycGhXZWlnaHRzQWxsVmFsdWVQcm94eSgpO1xyXG4gICAgICAgIHRyYWNrLmVsZW1lbnRDb3VudCA9IG5UYXJnZXQ7XHJcbiAgICAgICAgZm9yIChsZXQgaVRhcmdldCA9IDA7IGlUYXJnZXQgPCBuVGFyZ2V0OyArK2lUYXJnZXQpIHtcclxuICAgICAgICAgICAgY29uc3QgeyBjdXJ2ZSB9ID0gdHJhY2suY2hhbm5lbHMoKVtpVGFyZ2V0XTtcclxuICAgICAgICAgICAgY29uc3QgZnJhbWVWYWx1ZXM6IFBhcnRpYWw8Y2MuUmVhbEtleWZyYW1lVmFsdWU+W10gPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiB0aW1lcy5sZW5ndGggfSwgKF8sIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG91dHB1dHNbblRhcmdldCAqIGluZGV4ICsgaVRhcmdldF07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlmcmFtZVZhbHVlID0geyB2YWx1ZSwgaW50ZXJwb2xhdGlvbk1vZGU6IGNjLlJlYWxJbnRlcnBvbGF0aW9uTW9kZS5MSU5FQVIgfTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBrZXlmcmFtZVZhbHVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY3VydmUuYXNzaWduU29ydGVkKEFycmF5LmZyb20odGltZXMpLCBmcmFtZVZhbHVlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cmFja3M7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0UGFyZW50KG5vZGU6IG51bWJlcikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJlbnRzW25vZGVdO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFJvb3RQYXJlbnQobm9kZTogbnVtYmVyKSB7XHJcbiAgICAgICAgZm9yIChsZXQgcGFyZW50ID0gbm9kZTsgcGFyZW50ID49IDA7IHBhcmVudCA9IHRoaXMuX2dldFBhcmVudChub2RlKSkge1xyXG4gICAgICAgICAgICBub2RlID0gcGFyZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jb21tb25Sb290KG5vZGVzOiBudW1iZXJbXSkge1xyXG4gICAgICAgIGxldCBtaW5QYXRoTGVuID0gSW5maW5pdHk7XHJcbiAgICAgICAgY29uc3QgcGF0aHMgPSBub2Rlcy5tYXAoKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcGF0aDogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICAgICAgbGV0IGN1ck5vZGUgPSBub2RlO1xyXG4gICAgICAgICAgICB3aGlsZSAoY3VyTm9kZSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBwYXRoLnVuc2hpZnQoY3VyTm9kZSk7XHJcbiAgICAgICAgICAgICAgICBjdXJOb2RlID0gdGhpcy5fZ2V0UGFyZW50KGN1ck5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1pblBhdGhMZW4gPSBNYXRoLm1pbihtaW5QYXRoTGVuLCBwYXRoLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXRoO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChwYXRocy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY29tbW9uUGF0aDogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1pblBhdGhMZW47ICsraSkge1xyXG4gICAgICAgICAgICBjb25zdCBuID0gcGF0aHNbMF1baV07XHJcbiAgICAgICAgICAgIGlmIChwYXRocy5ldmVyeSgocGF0aCkgPT4gcGF0aFtpXSA9PT0gbikpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1vblBhdGgucHVzaChuKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29tbW9uUGF0aC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29tbW9uUGF0aFtjb21tb25QYXRoLmxlbmd0aCAtIDFdO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFNraW5Sb290KHNraW46IG51bWJlcikge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0aGlzLl9za2luUm9vdHNbc2tpbl07XHJcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gc2tpblJvb3ROb3RDYWxjdWxhdGVkKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuX2NvbW1vblJvb3QodGhpcy5fZ2x0Zi5za2lucyFbc2tpbl0uam9pbnRzKTtcclxuICAgICAgICAgICAgdGhpcy5fc2tpblJvb3RzW3NraW5dID0gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3JlYWRQcmltaXRpdmUoZ2xURlByaW1pdGl2ZTogTWVzaFByaW1pdGl2ZSwgbWVzaEluZGV4OiBudW1iZXIsIHByaW1pdGl2ZUluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgZGVjb2RlZERyYWNvR2VvbWV0cnk6IERlY29kZWREcmFjb0dlb21ldHJ5IHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgaWYgKGdsVEZQcmltaXRpdmUuZXh0ZW5zaW9ucykge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGV4dGVuc2lvbk5hbWUgb2YgT2JqZWN0LmtleXMoZ2xURlByaW1pdGl2ZS5leHRlbnNpb25zKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXh0ZW5zaW9uID0gZ2xURlByaW1pdGl2ZS5leHRlbnNpb25zW2V4dGVuc2lvbk5hbWVdO1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChleHRlbnNpb25OYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnS0hSX2RyYWNvX21lc2hfY29tcHJlc3Npb24nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNvZGVkRHJhY29HZW9tZXRyeSA9IHRoaXMuX2RlY29kZURyYWNvR2VvbWV0cnkoZ2xURlByaW1pdGl2ZSwgZXh0ZW5zaW9uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHByaW1pdGl2ZU1vZGUgPSB0aGlzLl9nZXRQcmltaXRpdmVNb2RlKGdsVEZQcmltaXRpdmUubW9kZSA9PT0gdW5kZWZpbmVkID8gR2x0ZlByaW1pdGl2ZU1vZGUuX19ERUZBVUxUIDogZ2xURlByaW1pdGl2ZS5tb2RlKTtcclxuXHJcbiAgICAgICAgbGV0IGluZGljZXM6IFBQR2VvbWV0cnlUeXBlZEFycmF5IHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIGlmIChnbFRGUHJpbWl0aXZlLmluZGljZXMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YTogUFBHZW9tZXRyeVR5cGVkQXJyYXk7XHJcbiAgICAgICAgICAgIGlmIChkZWNvZGVkRHJhY29HZW9tZXRyeSAmJiBkZWNvZGVkRHJhY29HZW9tZXRyeS5pbmRpY2VzKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gZGVjb2RlZERyYWNvR2VvbWV0cnkuaW5kaWNlcztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGljZXNBY2Nlc3NvciA9IHRoaXMuX2dsdGYuYWNjZXNzb3JzIVtnbFRGUHJpbWl0aXZlLmluZGljZXNdO1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHRoaXMuX3JlYWRBY2Nlc3NvckludG9BcnJheShpbmRpY2VzQWNjZXNzb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluZGljZXMgPSBkYXRhO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCEoR2x0ZlNlbWFudGljTmFtZS5QT1NJVElPTiBpbiBnbFRGUHJpbWl0aXZlLmF0dHJpYnV0ZXMpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHByaW1pdGl2ZSBkb2VzblxcJ3QgY29udGFpbnMgcG9zaXRpb25zLicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVE9ETzogbWlzbWF0Y2ggaW4gZ2xURi1zYW1wbGUtbW9kdWxlOk1vbnN0ZXItRHJhY28/XHJcbiAgICAgICAgY29uc3QgblZlcnRpY2VzID0gZGVjb2RlZERyYWNvR2VvbWV0cnlcclxuICAgICAgICAgICAgPyBkZWNvZGVkRHJhY29HZW9tZXRyeS52ZXJ0aWNlc1tHbHRmU2VtYW50aWNOYW1lLlBPU0lUSU9OXS5sZW5ndGggLyAzXHJcbiAgICAgICAgICAgIDogdGhpcy5fZ2x0Zi5hY2Nlc3NvcnMhW2dsVEZQcmltaXRpdmUuYXR0cmlidXRlc1tHbHRmU2VtYW50aWNOYW1lLlBPU0lUSU9OXV0uY291bnQ7XHJcblxyXG4gICAgICAgIGNvbnN0IHBwR2VvbWV0cnk6IFBQR2VvbWV0cnkgPSBuZXcgUFBHZW9tZXRyeShuVmVydGljZXMsIHByaW1pdGl2ZU1vZGUsIGluZGljZXMpO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZ2xURlByaW1pdGl2ZS5hdHRyaWJ1dGVzKSkge1xyXG4gICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVBY2Nlc3NvciA9IHRoaXMuX2dsdGYuYWNjZXNzb3JzIVtnbFRGUHJpbWl0aXZlLmF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV1dO1xyXG4gICAgICAgICAgICBsZXQgZGF0YTogUFBHZW9tZXRyeVR5cGVkQXJyYXk7XHJcbiAgICAgICAgICAgIGlmIChkZWNvZGVkRHJhY29HZW9tZXRyeSAmJiBhdHRyaWJ1dGVOYW1lIGluIGRlY29kZWREcmFjb0dlb21ldHJ5LnZlcnRpY2VzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkcmFjb0RlY29kZWRBdHRyaWJ1dGUgPSBkZWNvZGVkRHJhY29HZW9tZXRyeS52ZXJ0aWNlc1thdHRyaWJ1dGVOYW1lXTtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBkcmFjb0RlY29kZWRBdHRyaWJ1dGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwbGFpbkF0dHJpYnV0ZSA9IHRoaXMuX3JlYWRBY2Nlc3NvckludG9BcnJheShhdHRyaWJ1dGVBY2Nlc3Nvcik7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gcGxhaW5BdHRyaWJ1dGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3Qgc2VtYW50aWMgPSBnbFRGQXR0cmlidXRlTmFtZVRvUFAoYXR0cmlidXRlTmFtZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSB0aGlzLl9nZXRDb21wb25lbnRzUGVyQXR0cmlidXRlKGF0dHJpYnV0ZUFjY2Vzc29yLnR5cGUpO1xyXG4gICAgICAgICAgICBwcEdlb21ldHJ5LnNldEF0dHJpYnV0ZShzZW1hbnRpYywgZGF0YSwgY29tcG9uZW50cyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZ2xURlByaW1pdGl2ZS50YXJnZXRzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhnbFRGUHJpbWl0aXZlLnRhcmdldHNbMF0pO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBhdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgbW9ycGgtYXR0cmlidXRlcyBhcmUgdmFsaWQuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZW1hbnRpYyA9IGdsVEZBdHRyaWJ1dGVOYW1lVG9QUChhdHRyaWJ1dGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICAgICFQUEdlb21ldHJ5LmlzU3RkU2VtYW50aWMoc2VtYW50aWMpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgIVtQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5wb3NpdGlvbiwgUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3Mubm9ybWFsLCBQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy50YW5nZW50XS5pbmNsdWRlcyhzZW1hbnRpYylcclxuICAgICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgT25seSBwb3NpdGlvbiwgbm9ybWFsLCB0YW5nZW50IGF0dHJpYnV0ZSBhcmUgbW9ycGgtYWJsZSwgYnV0IHByb3ZpZGUgJHthdHRyaWJ1dGV9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYXNzZXJ0R2xURkNvbmZvcm1hbmNlKHBwR2VvbWV0cnkuaGFzQXR0cmlidXRlKHNlbWFudGljKSwgYFByaW1pdGl2ZSBkbyBub3QgaGF2ZSBhdHRyaWJ1dGUgJHthdHRyaWJ1dGV9IGZvciBtb3JwaC5gKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBwQXR0cmlidXRlID0gcHBHZW9tZXRyeS5nZXRBdHRyaWJ1dGUoc2VtYW50aWMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHBwQXR0cmlidXRlLm1vcnBocyA9IG5ldyBBcnJheShnbFRGUHJpbWl0aXZlLnRhcmdldHMubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGlUYXJnZXQgPSAwOyBpVGFyZ2V0IDwgZ2xURlByaW1pdGl2ZS50YXJnZXRzLmxlbmd0aDsgKytpVGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9ycGhUYXJnZXQgPSBnbFRGUHJpbWl0aXZlLnRhcmdldHNbaVRhcmdldF07XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQWxsIHRhcmdldHMgc2hhbGwgaGF2ZSBzYW1lIG1vcnBoLWF0dHJpYnV0ZXMuXHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0R2xURkNvbmZvcm1hbmNlKGF0dHJpYnV0ZSBpbiBtb3JwaFRhcmdldCwgJ01vcnBoIGF0dHJpYnV0ZXMgaW4gYWxsIHRhcmdldCBtdXN0IGJlIHNhbWUuJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXh0cmFjdHMgdGhlIGRpc3BsYWNlbWVudHMuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlQWNjZXNzb3IgPSB0aGlzLl9nbHRmLmFjY2Vzc29ycyFbbW9ycGhUYXJnZXRbYXR0cmlidXRlXV07XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9ycGhEaXNwbGFjZW1lbnQgPSB0aGlzLl9yZWFkQWNjZXNzb3JJbnRvQXJyYXkoYXR0cmlidXRlQWNjZXNzb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIHBwQXR0cmlidXRlLm1vcnBoc1tpVGFyZ2V0XSA9IG1vcnBoRGlzcGxhY2VtZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IG1haW5EYXRhID0gcHBHZW9tZXRyeS5nZXRBdHRyaWJ1dGUoc2VtYW50aWMpLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYXNzZXJ0R2xURkNvbmZvcm1hbmNlKHBwR2VvbWV0cnkubGVuZ3RoID09PSBkYXRhLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgYENvdW50IG9mIG1vcnBoIGF0dHJpYnV0ZSAke3RhcmdldEF0dHJpYnV0ZX0gbWlzbWF0Y2ggd2hpY2ggaW4gcHJpbWl0aXZlLmApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBhbGwgdGFyZ2V0cyBhcmUgemVybywgd2hpY2ggbWVhbnMgbm8gYW55IGRpc3BsYWNlbWVudCwgd2UgZXhjbHVkZSBpdCBmcm9tIG1vcnBoaW5nLlxyXG4gICAgICAgICAgICAvLyBTaG91bGQgd2U/XHJcbiAgICAgICAgICAgIC8vIEVkaXQ6IGluIGNvY29zLzNkLXRhc2tzIzExNTg1IHdlIGNhbiBzZWUgdGhhdFxyXG4gICAgICAgICAgICAvLyBpbiBtZXNoIDAgdGhlcmUgYXJlIDExIHByaW1pdGl2ZXMsIDggb2YgdGhlbSBoYXZlIGVtcHR5IG1vcnBoIGRhdGEuXHJcbiAgICAgICAgICAgIC8vIFNvIEkgZGVjaWRlIHRvIHNpbGVuY2UgdGhlIHdhcm5pbmcgYW5kIGxlYXZlIGl0IGFzIGB2ZXJib3NlYC5cclxuICAgICAgICAgICAgbGV0IG5vbkVtcHR5TW9ycGggPSBmYWxzZTtcclxuICAgICAgICAgICAgcHBHZW9tZXRyeS5mb3JFYWNoQXR0cmlidXRlKChhdHRyaWJ1dGUpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICAgICAhbm9uRW1wdHlNb3JwaCAmJlxyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZS5tb3JwaHMgJiZcclxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGUubW9ycGhzLnNvbWUoKGRpc3BsYWNlbWVudCkgPT4gZGlzcGxhY2VtZW50LnNvbWUoKHY6IG51bWJlcikgPT4gdiAhPT0gMCkpXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICBub25FbXB0eU1vcnBoID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICghbm9uRW1wdHlNb3JwaCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbG9nZ2VyKEdsdGZDb252ZXJ0ZXIuTG9nTGV2ZWwuRGVidWcsIEdsdGZDb252ZXJ0ZXIuQ29udmVydGVyRXJyb3IuRW1wdHlNb3JwaCwge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc2g6IG1lc2hJbmRleCxcclxuICAgICAgICAgICAgICAgICAgICBwcmltaXRpdmU6IHByaW1pdGl2ZUluZGV4LFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBwcEdlb21ldHJ5O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2RlY29kZURyYWNvR2VvbWV0cnkoZ2xURlByaW1pdGl2ZTogTWVzaFByaW1pdGl2ZSwgZXh0ZW5zaW9uOiBLSFJEcmFjb01lc2hDb21wcmVzc2lvbikge1xyXG4gICAgICAgIGNvbnN0IGJ1ZmZlclZpZXcgPSB0aGlzLl9nbHRmLmJ1ZmZlclZpZXdzIVtleHRlbnNpb24uYnVmZmVyVmlld107XHJcbiAgICAgICAgY29uc3QgYnVmZmVyID0gdGhpcy5fYnVmZmVyc1tidWZmZXJWaWV3LmJ1ZmZlcl07XHJcbiAgICAgICAgY29uc3QgYnVmZmVyVmlld09mZnNldCA9IGJ1ZmZlclZpZXcuYnl0ZU9mZnNldCA9PT0gdW5kZWZpbmVkID8gMCA6IGJ1ZmZlclZpZXcuYnl0ZU9mZnNldDtcclxuICAgICAgICBjb25zdCBjb21wcmVzc2VkRGF0YSA9IGJ1ZmZlci5zbGljZShidWZmZXJWaWV3T2Zmc2V0LCBidWZmZXJWaWV3T2Zmc2V0ICsgYnVmZmVyVmlldy5ieXRlTGVuZ3RoKTtcclxuICAgICAgICBjb25zdCBvcHRpb25zOiBEZWNvZGVEcmFjb0dlb21ldHJ5T3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgYnVmZmVyOiBuZXcgSW50OEFycmF5KGNvbXByZXNzZWREYXRhKSxcclxuICAgICAgICAgICAgYXR0cmlidXRlczoge30sXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoZ2xURlByaW1pdGl2ZS5pbmRpY2VzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5pbmRpY2VzID0gdGhpcy5fZ2V0QXR0cmlidXRlQmFzZVR5cGVTdG9yYWdlKHRoaXMuX2dsdGYuYWNjZXNzb3JzIVtnbFRGUHJpbWl0aXZlLmluZGljZXNdLmNvbXBvbmVudFR5cGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgb2YgT2JqZWN0LmtleXMoZXh0ZW5zaW9uLmF0dHJpYnV0ZXMpKSB7XHJcbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVOYW1lIGluIGdsVEZQcmltaXRpdmUuYXR0cmlidXRlcykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYWNjZXNzb3IgPSB0aGlzLl9nbHRmLmFjY2Vzc29ycyFbZ2xURlByaW1pdGl2ZS5hdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdXTtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMuYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICB1bmlxdWVJZDogZXh0ZW5zaW9uLmF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3RvcmFnZUNvbnN0cnVjdG9yOiB0aGlzLl9nZXRBdHRyaWJ1dGVCYXNlVHlwZVN0b3JhZ2UoYWNjZXNzb3IuY29tcG9uZW50VHlwZSksXHJcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50czogdGhpcy5fZ2V0Q29tcG9uZW50c1BlckF0dHJpYnV0ZShhY2Nlc3Nvci50eXBlKSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRlY29kZURyYWNvR2VvbWV0cnkob3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfcmVhZEJvdW5kcyhnbFRGUHJpbWl0aXZlOiBNZXNoUHJpbWl0aXZlLCBtaW5Qb3NpdGlvbjogVmVjMywgbWF4UG9zaXRpb246IFZlYzMpIHtcclxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vS2hyb25vc0dyb3VwL2dsVEYvdHJlZS9tYXN0ZXIvc3BlY2lmaWNhdGlvbi8yLjAjYWNjZXNzb3JzLWJvdW5kc1xyXG4gICAgICAgIC8vID4gSmF2YVNjcmlwdCBjbGllbnQgaW1wbGVtZW50YXRpb25zIHNob3VsZCBjb252ZXJ0IEpTT04tcGFyc2VkIGZsb2F0aW5nLXBvaW50IGRvdWJsZXMgdG8gc2luZ2xlIHByZWNpc2lvbixcclxuICAgICAgICAvLyA+IHdoZW4gY29tcG9uZW50VHlwZSBpcyA1MTI2IChGTE9BVCkuXHJcbiAgICAgICAgY29uc3QgaVBvc2l0aW9uQWNjZXNzb3IgPSBnbFRGUHJpbWl0aXZlLmF0dHJpYnV0ZXNbR2x0ZlNlbWFudGljTmFtZS5QT1NJVElPTl07XHJcbiAgICAgICAgaWYgKGlQb3NpdGlvbkFjY2Vzc29yICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb25BY2Nlc3NvciA9IHRoaXMuX2dsdGYuYWNjZXNzb3JzIVtpUG9zaXRpb25BY2Nlc3Nvcl07XHJcbiAgICAgICAgICAgIGlmIChwb3NpdGlvbkFjY2Vzc29yLm1pbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uQWNjZXNzb3IuY29tcG9uZW50VHlwZSA9PT0gR2x0ZkFjY2Vzc29yQ29tcG9uZW50VHlwZS5GTE9BVCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pblBvc2l0aW9uLnggPSBNYXRoLmZyb3VuZChwb3NpdGlvbkFjY2Vzc29yLm1pblswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWluUG9zaXRpb24ueSA9IE1hdGguZnJvdW5kKHBvc2l0aW9uQWNjZXNzb3IubWluWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICBtaW5Qb3NpdGlvbi56ID0gTWF0aC5mcm91bmQocG9zaXRpb25BY2Nlc3Nvci5taW5bMl0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW5Qb3NpdGlvbi54ID0gcG9zaXRpb25BY2Nlc3Nvci5taW5bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgbWluUG9zaXRpb24ueSA9IHBvc2l0aW9uQWNjZXNzb3IubWluWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIG1pblBvc2l0aW9uLnogPSBwb3NpdGlvbkFjY2Vzc29yLm1pblsyXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocG9zaXRpb25BY2Nlc3Nvci5tYXgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwb3NpdGlvbkFjY2Vzc29yLmNvbXBvbmVudFR5cGUgPT09IEdsdGZBY2Nlc3NvckNvbXBvbmVudFR5cGUuRkxPQVQpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXhQb3NpdGlvbi54ID0gTWF0aC5mcm91bmQocG9zaXRpb25BY2Nlc3Nvci5tYXhbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIG1heFBvc2l0aW9uLnkgPSBNYXRoLmZyb3VuZChwb3NpdGlvbkFjY2Vzc29yLm1heFsxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4UG9zaXRpb24ueiA9IE1hdGguZnJvdW5kKHBvc2l0aW9uQWNjZXNzb3IubWF4WzJdKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF4UG9zaXRpb24ueCA9IHBvc2l0aW9uQWNjZXNzb3IubWF4WzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIG1heFBvc2l0aW9uLnkgPSBwb3NpdGlvbkFjY2Vzc29yLm1heFsxXTtcclxuICAgICAgICAgICAgICAgICAgICBtYXhQb3NpdGlvbi56ID0gcG9zaXRpb25BY2Nlc3Nvci5tYXhbMl07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfYXBwbHlTZXR0aW5ncyhcclxuICAgICAgICBwcEdlb21ldHJ5OiBQUEdlb21ldHJ5LFxyXG4gICAgICAgIG5vcm1hbEltcG9ydFNldHRpbmc6IE5vcm1hbEltcG9ydFNldHRpbmcsXHJcbiAgICAgICAgdGFuZ2VudEltcG9ydFNldHRpbmc6IFRhbmdlbnRJbXBvcnRTZXR0aW5nLFxyXG4gICAgICAgIG1vcnBoTm9ybWFsc0ltcG9ydFNldHRpbmc6IE5vcm1hbEltcG9ydFNldHRpbmcuZXhjbHVkZSB8IE5vcm1hbEltcG9ydFNldHRpbmcub3B0aW9uYWwsXHJcbiAgICAgICAgcHJpbWl0aXZlSW5kZXg6IG51bWJlcixcclxuICAgICAgICBtZXNoSW5kZXg6IG51bWJlcixcclxuICAgICkge1xyXG4gICAgICAgIGlmIChcclxuICAgICAgICAgICAgbm9ybWFsSW1wb3J0U2V0dGluZyA9PT0gTm9ybWFsSW1wb3J0U2V0dGluZy5yZWNhbGN1bGF0ZSB8fFxyXG4gICAgICAgICAgICAobm9ybWFsSW1wb3J0U2V0dGluZyA9PT0gTm9ybWFsSW1wb3J0U2V0dGluZy5yZXF1aXJlICYmICFwcEdlb21ldHJ5Lmhhc0F0dHJpYnV0ZShQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5ub3JtYWwpKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBjb25zdCBub3JtYWxzID0gcHBHZW9tZXRyeS5jYWxjdWxhdGVOb3JtYWxzKCk7XHJcbiAgICAgICAgICAgIHBwR2VvbWV0cnkuc2V0QXR0cmlidXRlKFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzLm5vcm1hbCwgbm9ybWFscywgMyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChub3JtYWxJbXBvcnRTZXR0aW5nID09PSBOb3JtYWxJbXBvcnRTZXR0aW5nLmV4Y2x1ZGUgJiYgcHBHZW9tZXRyeS5oYXNBdHRyaWJ1dGUoUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3Mubm9ybWFsKSkge1xyXG4gICAgICAgICAgICBwcEdlb21ldHJ5LmRlbGV0ZUF0dHJpYnV0ZShQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5ub3JtYWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICB0YW5nZW50SW1wb3J0U2V0dGluZyA9PT0gVGFuZ2VudEltcG9ydFNldHRpbmcucmVjYWxjdWxhdGUgfHxcclxuICAgICAgICAgICAgKHRhbmdlbnRJbXBvcnRTZXR0aW5nID09PSBUYW5nZW50SW1wb3J0U2V0dGluZy5yZXF1aXJlICYmICFwcEdlb21ldHJ5Lmhhc0F0dHJpYnV0ZShQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy50YW5nZW50KSlcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgaWYgKCFwcEdlb21ldHJ5Lmhhc0F0dHJpYnV0ZShQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5ub3JtYWwpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2dnZXIoR2x0ZkNvbnZlcnRlci5Mb2dMZXZlbC5XYXJuaW5nLCBHbHRmQ29udmVydGVyLkNvbnZlcnRlckVycm9yLkZhaWxlZFRvQ2FsY3VsYXRlVGFuZ2VudHMsIHtcclxuICAgICAgICAgICAgICAgICAgICByZWFzb246ICdub3JtYWwnLFxyXG4gICAgICAgICAgICAgICAgICAgIHByaW1pdGl2ZTogcHJpbWl0aXZlSW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgbWVzaDogbWVzaEluZGV4LFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXBwR2VvbWV0cnkuaGFzQXR0cmlidXRlKFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzLnRleGNvb3JkKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbG9nZ2VyKEdsdGZDb252ZXJ0ZXIuTG9nTGV2ZWwuRGVidWcsIEdsdGZDb252ZXJ0ZXIuQ29udmVydGVyRXJyb3IuRmFpbGVkVG9DYWxjdWxhdGVUYW5nZW50cywge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlYXNvbjogJ3V2JyxcclxuICAgICAgICAgICAgICAgICAgICBwcmltaXRpdmU6IHByaW1pdGl2ZUluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgIG1lc2g6IG1lc2hJbmRleCxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFuZ2VudHMgPSBwcEdlb21ldHJ5LmNhbGN1bGF0ZVRhbmdlbnRzKCk7XHJcbiAgICAgICAgICAgICAgICBwcEdlb21ldHJ5LnNldEF0dHJpYnV0ZShQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy50YW5nZW50LCB0YW5nZW50cywgNCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHRhbmdlbnRJbXBvcnRTZXR0aW5nID09PSBUYW5nZW50SW1wb3J0U2V0dGluZy5leGNsdWRlICYmIHBwR2VvbWV0cnkuaGFzQXR0cmlidXRlKFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzLnRhbmdlbnQpKSB7XHJcbiAgICAgICAgICAgIHBwR2VvbWV0cnkuZGVsZXRlQXR0cmlidXRlKFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzLnRhbmdlbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1vcnBoTm9ybWFsc0ltcG9ydFNldHRpbmcgPT09IE5vcm1hbEltcG9ydFNldHRpbmcuZXhjbHVkZSAmJiBwcEdlb21ldHJ5Lmhhc0F0dHJpYnV0ZShQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5ub3JtYWwpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vcm1hbEF0dHJpYnV0ZSA9IHBwR2VvbWV0cnkuZ2V0QXR0cmlidXRlKFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzLm5vcm1hbCk7XHJcbiAgICAgICAgICAgIG5vcm1hbEF0dHJpYnV0ZS5tb3JwaHMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9yZWFkQnVmZmVyVmlldyhidWZmZXJWaWV3OiBCdWZmZXJWaWV3KSB7XHJcbiAgICAgICAgY29uc3QgYnVmZmVyID0gdGhpcy5fYnVmZmVyc1tidWZmZXJWaWV3LmJ1ZmZlcl07XHJcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKGJ1ZmZlci5idWZmZXIsIGJ1ZmZlci5ieXRlT2Zmc2V0ICsgKGJ1ZmZlclZpZXcuYnl0ZU9mZnNldCB8fCAwKSwgYnVmZmVyVmlldy5ieXRlTGVuZ3RoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9yZWFkQWNjZXNzb3JJbnRvQXJyYXkoZ2x0ZkFjY2Vzc29yOiBBY2Nlc3Nvcikge1xyXG4gICAgICAgIGNvbnN0IHN0b3JhZ2VDb25zdHJ1Y3RvciA9IHRoaXMuX2dldEF0dHJpYnV0ZUJhc2VUeXBlU3RvcmFnZShnbHRmQWNjZXNzb3IuY29tcG9uZW50VHlwZSk7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IHN0b3JhZ2VDb25zdHJ1Y3RvcihnbHRmQWNjZXNzb3IuY291bnQgKiB0aGlzLl9nZXRDb21wb25lbnRzUGVyQXR0cmlidXRlKGdsdGZBY2Nlc3Nvci50eXBlKSk7XHJcbiAgICAgICAgdGhpcy5fcmVhZEFjY2Vzc29yKGdsdGZBY2Nlc3NvciwgY3JlYXRlRGF0YVZpZXdGcm9tVHlwZWRBcnJheShyZXN1bHQpKTtcclxuICAgICAgICBpZiAoZ2x0ZkFjY2Vzc29yLnNwYXJzZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FwcGx5RGV2aWF0aW9uKGdsdGZBY2Nlc3NvciBhcyBGaWVsZHNSZXF1aXJlZDxBY2Nlc3NvciwgJ3NwYXJzZSc+LCByZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3JlYWRBY2Nlc3NvckludG9BcnJheUFuZE5vcm1hbGl6ZUFzRmxvYXQoZ2x0ZkFjY2Vzc29yOiBBY2Nlc3Nvcikge1xyXG4gICAgICAgIGxldCBvdXRwdXRzID0gdGhpcy5fcmVhZEFjY2Vzc29ySW50b0FycmF5KGdsdGZBY2Nlc3Nvcik7XHJcbiAgICAgICAgaWYgKCEob3V0cHV0cyBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkpIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZE91dHB1dCA9IG5ldyBGbG9hdDMyQXJyYXkob3V0cHV0cy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemUgPSAoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG91dHB1dHMgaW5zdGFuY2VvZiBJbnQ4QXJyYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHZhbHVlOiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KHZhbHVlIC8gMTI3LjAsIC0xLjApO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG91dHB1dHMgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZTogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAvIDI1NS4wO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG91dHB1dHMgaW5zdGFuY2VvZiBJbnQxNkFycmF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZTogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLm1heCh2YWx1ZSAvIDMyNzY3LjAsIC0xLjApO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG91dHB1dHMgaW5zdGFuY2VvZiBVaW50MTZBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAodmFsdWU6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgLyA2NTUzNS4wO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAodmFsdWU6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICBub3JtYWxpemVkT3V0cHV0W2ldID0gbm9ybWFsaXplKG91dHB1dHNbaV0pOyAvLyBEbyBub3JtYWxpemUuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3V0cHV0cyA9IG5vcm1hbGl6ZWRPdXRwdXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvdXRwdXRzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFNjZW5lTm9kZShpR2x0ZlNjZW5lOiBudW1iZXIsIGdsdGZBc3NldEZpbmRlcjogSUdsdGZBc3NldEZpbmRlciwgd2l0aFRyYW5zZm9ybSA9IHRydWUpIHtcclxuICAgICAgICBjb25zdCBzY2VuZU5hbWUgPSB0aGlzLl9nZXRHbHRmWFhOYW1lKEdsdGZBc3NldEtpbmQuU2NlbmUsIGlHbHRmU2NlbmUpO1xyXG4gICAgICAgIGNvbnN0IGdsdGZTY2VuZSA9IHRoaXMuX2dsdGYuc2NlbmVzIVtpR2x0ZlNjZW5lXTtcclxuXHJcbiAgICAgICAgbGV0IHNjZW5lTm9kZTogY2MuTm9kZTtcclxuICAgICAgICBpZiAoIWdsdGZTY2VuZS5ub2RlcyB8fCBnbHRmU2NlbmUubm9kZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHNjZW5lTm9kZSA9IG5ldyBjYy5Ob2RlKHNjZW5lTmFtZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgZ2xURlNjZW5lUm9vdE5vZGVzID0gZ2x0ZlNjZW5lLm5vZGVzO1xyXG4gICAgICAgICAgICBjb25zdCBtYXBwaW5nOiAoY2MuTm9kZSB8IG51bGwpW10gPSBuZXcgQXJyYXkodGhpcy5fZ2x0Zi5ub2RlcyEubGVuZ3RoKS5maWxsKG51bGwpO1xyXG4gICAgICAgICAgICBpZiAoZ2x0ZlNjZW5lLm5vZGVzLmxlbmd0aCA9PT0gMSAmJiB0aGlzLl9wcm9tb3RlZFJvb3ROb2Rlcy5pbmNsdWRlcyhnbHRmU2NlbmUubm9kZXNbMF0pKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9tb3RlZFJvb3ROb2RlID0gZ2x0ZlNjZW5lLm5vZGVzWzBdO1xyXG4gICAgICAgICAgICAgICAgc2NlbmVOb2RlID0gdGhpcy5fY3JlYXRlRW1wdHlOb2RlUmVjdXJzaXZlKHByb21vdGVkUm9vdE5vZGUsIG1hcHBpbmcsIHdpdGhUcmFuc2Zvcm0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2NlbmVOb2RlID0gbmV3IGNjLk5vZGUoc2NlbmVOYW1lKTtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiBnbHRmU2NlbmUubm9kZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByb290ID0gdGhpcy5fY3JlYXRlRW1wdHlOb2RlUmVjdXJzaXZlKG5vZGUsIG1hcHBpbmcsIHdpdGhUcmFuc2Zvcm0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJvb3QucGFyZW50ID0gc2NlbmVOb2RlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1hcHBpbmcuZm9yRWFjaCgobm9kZSwgaUdsdGZOb2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXR1cE5vZGUoaUdsdGZOb2RlLCBtYXBwaW5nLCBnbHRmQXNzZXRGaW5kZXIsIHNjZW5lTm9kZSwgZ2xURlNjZW5lUm9vdE5vZGVzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc2NlbmVOb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NyZWF0ZUVtcHR5Tm9kZVJlY3Vyc2l2ZShpR2x0Zk5vZGU6IG51bWJlciwgbWFwcGluZzogKGNjLk5vZGUgfCBudWxsKVtdLCB3aXRoVHJhbnNmb3JtID0gdHJ1ZSk6IGNjLk5vZGUge1xyXG4gICAgICAgIGNvbnN0IGdsdGZOb2RlID0gdGhpcy5fZ2x0Zi5ub2RlcyFbaUdsdGZOb2RlXTtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9jcmVhdGVFbXB0eU5vZGUoaUdsdGZOb2RlLCB3aXRoVHJhbnNmb3JtKTtcclxuICAgICAgICBpZiAoZ2x0Zk5vZGUuY2hpbGRyZW4gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGdsdGZOb2RlLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZFJlc3VsdCA9IHRoaXMuX2NyZWF0ZUVtcHR5Tm9kZVJlY3Vyc2l2ZShjaGlsZCwgbWFwcGluZywgd2l0aFRyYW5zZm9ybSk7XHJcbiAgICAgICAgICAgICAgICBjaGlsZFJlc3VsdC5wYXJlbnQgPSByZXN1bHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbWFwcGluZ1tpR2x0Zk5vZGVdID0gcmVzdWx0O1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfc2V0dXBOb2RlKFxyXG4gICAgICAgIGlHbHRmTm9kZTogbnVtYmVyLFxyXG4gICAgICAgIG1hcHBpbmc6IChjYy5Ob2RlIHwgbnVsbClbXSxcclxuICAgICAgICBnbHRmQXNzZXRGaW5kZXI6IElHbHRmQXNzZXRGaW5kZXIsXHJcbiAgICAgICAgc2NlbmVOb2RlOiBjYy5Ob2RlLFxyXG4gICAgICAgIGdsVEZTY2VuZVJvb3ROb2RlczogbnVtYmVyW10sXHJcbiAgICApIHtcclxuICAgICAgICBjb25zdCBub2RlID0gbWFwcGluZ1tpR2x0Zk5vZGVdO1xyXG4gICAgICAgIGlmIChub2RlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZ2x0Zk5vZGUgPSB0aGlzLl9nbHRmLm5vZGVzIVtpR2x0Zk5vZGVdO1xyXG4gICAgICAgIGlmIChnbHRmTm9kZS5tZXNoICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgbGV0IG1vZGVsQ29tcG9uZW50OiBjYy5NZXNoUmVuZGVyZXIgfCBudWxsID0gbnVsbDtcclxuICAgICAgICAgICAgaWYgKGdsdGZOb2RlLnNraW4gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbW9kZWxDb21wb25lbnQgPSBub2RlLmFkZENvbXBvbmVudChjYy5NZXNoUmVuZGVyZXIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2tpbm5pbmdNb2RlbENvbXBvbmVudCA9IG5vZGUuYWRkQ29tcG9uZW50KGNjLlNraW5uZWRNZXNoUmVuZGVyZXIpITtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNrZWxldG9uID0gZ2x0ZkFzc2V0RmluZGVyLmZpbmQoJ3NrZWxldG9ucycsIGdsdGZOb2RlLnNraW4sIGNjLlNrZWxldG9uKTtcclxuICAgICAgICAgICAgICAgIGlmIChza2VsZXRvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHNraW5uaW5nTW9kZWxDb21wb25lbnQuc2tlbGV0b24gPSBza2VsZXRvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IHNraW5Sb290ID0gbWFwcGluZ1t0aGlzLl9nZXRTa2luUm9vdChnbHRmTm9kZS5za2luKV07XHJcbiAgICAgICAgICAgICAgICBpZiAoc2tpblJvb3QgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGV5IGRvIG5vdCBoYXZlIGNvbW1vbiByb290LlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgbWF5IGJlIGNhdXNlZCBieSByb290IHBhcmVudCBub2RlcyBvZiB0aGVtIGFyZSBkaWZmZXJlbnQgYnV0IHRoZXkgYXJlIGFsbCB1bmRlciBzYW1lIHNjZW5lLlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdsVEZTa2luID0gdGhpcy5nbHRmLnNraW5zIVtnbHRmTm9kZS5za2luXTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpc1VuZGVyU2FtZVNjZW5lID0gZ2xURlNraW4uam9pbnRzLmV2ZXJ5KChqb2ludDogYW55KSA9PiBnbFRGU2NlbmVSb290Tm9kZXMuaW5jbHVkZXModGhpcy5fZ2V0Um9vdFBhcmVudChqb2ludCkpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNVbmRlclNhbWVTY2VuZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBza2lubmluZ01vZGVsQ29tcG9uZW50LnNraW5uaW5nUm9vdCA9IHNjZW5lTm9kZTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2dnZXIoR2x0ZkNvbnZlcnRlci5Mb2dMZXZlbC5FcnJvciwgR2x0ZkNvbnZlcnRlci5Db252ZXJ0ZXJFcnJvci5SZWZlcmVuY2VTa2luSW5EaWZmZXJlbnRTY2VuZSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZTogaUdsdGZOb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tpbjogZ2x0Zk5vZGUuc2tpbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gYSB0ZW1wb3Jhcnkgcm9vdFxyXG4gICAgICAgICAgICAgICAgICAgIHNraW5uaW5nTW9kZWxDb21wb25lbnQuc2tpbm5pbmdSb290ID0gc2tpblJvb3Q7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtb2RlbENvbXBvbmVudCA9IHNraW5uaW5nTW9kZWxDb21wb25lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbWVzaCA9IGdsdGZBc3NldEZpbmRlci5maW5kKCdtZXNoZXMnLCBnbHRmTm9kZS5tZXNoLCBjYy5NZXNoKTtcclxuICAgICAgICAgICAgaWYgKG1lc2gpIHtcclxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNDQ1XHJcbiAgICAgICAgICAgICAgICBtb2RlbENvbXBvbmVudC5fbWVzaCA9IG1lc2g7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZ2x0Zk1lc2ggPSB0aGlzLmdsdGYubWVzaGVzIVtnbHRmTm9kZS5tZXNoXTtcclxuICAgICAgICAgICAgY29uc3QgcHJvY2Vzc2VkTWVzaCA9IHRoaXMuX3Byb2Nlc3NlZE1lc2hlc1tnbHRmTm9kZS5tZXNoXTtcclxuICAgICAgICAgICAgY29uc3QgbWF0ZXJpYWxzID0gcHJvY2Vzc2VkTWVzaC5tYXRlcmlhbEluZGljZXMubWFwKChpZHgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGdsdGZQcmltaXRpdmUgPSBnbHRmTWVzaC5wcmltaXRpdmVzW2lkeF07XHJcbiAgICAgICAgICAgICAgICBpZiAoZ2x0ZlByaW1pdGl2ZS5tYXRlcmlhbCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGVyaWFsID0gZ2x0ZkFzc2V0RmluZGVyLmZpbmQoJ21hdGVyaWFscycsIGdsdGZQcmltaXRpdmUubWF0ZXJpYWwsIGNjLk1hdGVyaWFsKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWF0ZXJpYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGVyaWFsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSBUUzI0NDVcclxuICAgICAgICAgICAgbW9kZWxDb21wb25lbnQuX21hdGVyaWFscyA9IG1hdGVyaWFscztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY3JlYXRlRW1wdHlOb2RlKGlHbHRmTm9kZTogbnVtYmVyLCB3aXRoVHJhbnNmb3JtID0gdHJ1ZSkge1xyXG4gICAgICAgIGNvbnN0IGdsdGZOb2RlID0gdGhpcy5fZ2x0Zi5ub2RlcyFbaUdsdGZOb2RlXTtcclxuICAgICAgICBjb25zdCBub2RlTmFtZSA9IHRoaXMuX2dldEdsdGZYWE5hbWUoR2x0ZkFzc2V0S2luZC5Ob2RlLCBpR2x0Zk5vZGUpO1xyXG5cclxuICAgICAgICBjb25zdCBub2RlID0gbmV3IGNjLk5vZGUobm9kZU5hbWUpO1xyXG4gICAgICAgIGlmICghd2l0aFRyYW5zZm9ybSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChnbHRmTm9kZS50cmFuc2xhdGlvbikge1xyXG4gICAgICAgICAgICBub2RlLnNldFBvc2l0aW9uKGdsdGZOb2RlLnRyYW5zbGF0aW9uWzBdLCBnbHRmTm9kZS50cmFuc2xhdGlvblsxXSwgZ2x0Zk5vZGUudHJhbnNsYXRpb25bMl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZ2x0Zk5vZGUucm90YXRpb24pIHtcclxuICAgICAgICAgICAgbm9kZS5zZXRSb3RhdGlvbih0aGlzLl9nZXROb2RlUm90YXRpb24oZ2x0Zk5vZGUucm90YXRpb24sIG5ldyBRdWF0KCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGdsdGZOb2RlLnNjYWxlKSB7XHJcbiAgICAgICAgICAgIG5vZGUuc2V0U2NhbGUoZ2x0Zk5vZGUuc2NhbGVbMF0sIGdsdGZOb2RlLnNjYWxlWzFdLCBnbHRmTm9kZS5zY2FsZVsyXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChnbHRmTm9kZS5tYXRyaXgpIHtcclxuICAgICAgICAgICAgY29uc3QgbnMgPSBnbHRmTm9kZS5tYXRyaXg7XHJcbiAgICAgICAgICAgIGNvbnN0IG0gPSB0aGlzLl9yZWFkTm9kZU1hdHJpeChucyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHQgPSBuZXcgVmVjMygpO1xyXG4gICAgICAgICAgICBjb25zdCByID0gbmV3IFF1YXQoKTtcclxuICAgICAgICAgICAgY29uc3QgcyA9IG5ldyBWZWMzKCk7XHJcbiAgICAgICAgICAgIE1hdDQudG9SVFMobSwgciwgdCwgcyk7XHJcbiAgICAgICAgICAgIG5vZGUuc2V0UG9zaXRpb24odCk7XHJcbiAgICAgICAgICAgIG5vZGUuc2V0Um90YXRpb24ocik7XHJcbiAgICAgICAgICAgIG5vZGUuc2V0U2NhbGUocyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3JlYWROb2RlTWF0cml4KG5zOiBudW1iZXJbXSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTWF0NChcclxuICAgICAgICAgICAgbnNbMF0sXHJcbiAgICAgICAgICAgIG5zWzFdLFxyXG4gICAgICAgICAgICBuc1syXSxcclxuICAgICAgICAgICAgbnNbM10sXHJcbiAgICAgICAgICAgIG5zWzRdLFxyXG4gICAgICAgICAgICBuc1s1XSxcclxuICAgICAgICAgICAgbnNbNl0sXHJcbiAgICAgICAgICAgIG5zWzddLFxyXG4gICAgICAgICAgICBuc1s4XSxcclxuICAgICAgICAgICAgbnNbOV0sXHJcbiAgICAgICAgICAgIG5zWzEwXSxcclxuICAgICAgICAgICAgbnNbMTFdLFxyXG4gICAgICAgICAgICBuc1sxMl0sXHJcbiAgICAgICAgICAgIG5zWzEzXSxcclxuICAgICAgICAgICAgbnNbMTRdLFxyXG4gICAgICAgICAgICBuc1sxNV0sXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXROb2RlUGF0aChub2RlOiBudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbm9kZVBhdGhUYWJsZVtub2RlXTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pc0FuY2VzdG9yT2YocGFyZW50OiBudW1iZXIsIGNoaWxkOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAocGFyZW50ICE9PSBjaGlsZCkge1xyXG4gICAgICAgICAgICB3aGlsZSAoY2hpbGQgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkID09PSBwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNoaWxkID0gdGhpcy5fZ2V0UGFyZW50KGNoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfbWFwVG9Tb2NrZXRQYXRoKHBhdGg6IHN0cmluZykge1xyXG4gICAgICAgIGZvciAoY29uc3QgcGFpciBvZiB0aGlzLl9zb2NrZXRNYXBwaW5ncykge1xyXG4gICAgICAgICAgICBpZiAocGF0aCAhPT0gcGFpclswXSAmJiAhcGF0aC5zdGFydHNXaXRoKHBhaXJbMF0gKyAnLycpKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcGFpclsxXSArIHBhdGguc2xpY2UocGFpclswXS5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGF0aDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jcmVhdGVOb2RlUGF0aFRhYmxlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9nbHRmLm5vZGVzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGFyZW50VGFibGUgPSBuZXcgQXJyYXk8bnVtYmVyPih0aGlzLl9nbHRmLm5vZGVzLmxlbmd0aCkuZmlsbCgtMSk7XHJcbiAgICAgICAgdGhpcy5fZ2x0Zi5ub2Rlcy5mb3JFYWNoKChnbHRmTm9kZTogYW55LCBub2RlSW5kZXg6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZ2x0Zk5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgIGdsdGZOb2RlLmNoaWxkcmVuLmZvckVhY2goKGlDaGlsZE5vZGU6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudFRhYmxlW2lDaGlsZE5vZGVdID0gbm9kZUluZGV4O1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lcyA9IGdsdGZOb2RlLmNoaWxkcmVuLm1hcCgoaUNoaWxkTm9kZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGROb2RlID0gdGhpcy5fZ2x0Zi5ub2RlcyFbaUNoaWxkTm9kZV07XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBjaGlsZE5vZGUubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnIHx8IG5hbWUubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdW5pcXVlTmFtZXMgPSBtYWtlVW5pcXVlTmFtZXMobmFtZXMsIHVuaXF1ZUNoaWxkTm9kZU5hbWVHZW5lcmF0b3IpO1xyXG4gICAgICAgICAgICAgICAgdW5pcXVlTmFtZXMuZm9yRWFjaCgodW5pcXVlTmFtZSwgaVVuaXF1ZU5hbWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9nbHRmLm5vZGVzIVtnbHRmTm9kZS5jaGlsZHJlbiFbaVVuaXF1ZU5hbWVdXS5uYW1lID0gdW5pcXVlTmFtZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IG5vZGVOYW1lcyA9IG5ldyBBcnJheTxzdHJpbmc+KHRoaXMuX2dsdGYubm9kZXMubGVuZ3RoKS5maWxsKCcnKTtcclxuICAgICAgICBmb3IgKGxldCBpTm9kZSA9IDA7IGlOb2RlIDwgbm9kZU5hbWVzLmxlbmd0aDsgKytpTm9kZSkge1xyXG4gICAgICAgICAgICBub2RlTmFtZXNbaU5vZGVdID0gdGhpcy5fZ2V0R2x0ZlhYTmFtZShHbHRmQXNzZXRLaW5kLk5vZGUsIGlOb2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheTxzdHJpbmc+KHRoaXMuX2dsdGYubm9kZXMubGVuZ3RoKS5maWxsKCcnKTtcclxuICAgICAgICB0aGlzLl9nbHRmLm5vZGVzLmZvckVhY2goKGdsdGZOb2RlOiBhbnksIG5vZGVJbmRleDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlZ21lbnRzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gbm9kZUluZGV4OyBpID49IDA7IGkgPSBwYXJlbnRUYWJsZVtpXSkge1xyXG4gICAgICAgICAgICAgICAgLy8gUHJvbW90ZWQgbm9kZSBpcyBub3QgcGFydCBvZiBub2RlIHBhdGhcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fcHJvbW90ZWRSb290Tm9kZXMuaW5jbHVkZXMoaSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWdtZW50cy51bnNoaWZ0KG5vZGVOYW1lc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0W25vZGVJbmRleF0gPSBzZWdtZW50cy5qb2luKCcvJyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBOb3RlLCBpZiBgYnVmZmVyVmlld2AgcHJvcGVydHkgaXMgbm90IGRlZmluZWQsIHRoaXMgbWV0aG9kIHdpbGwgZG8gbm90aGluZy5cclxuICAgICAqIFNvIHlvdSBzaG91bGQgZW5zdXJlIHRoYXQgdGhlIGRhdGEgYXJlYSBvZiBgb3V0cHV0QnVmZmVyYCBpcyBmaWxsZWQgd2l0aCBgMGBzLlxyXG4gICAgICogQHBhcmFtIGdsdGZBY2Nlc3NvclxyXG4gICAgICogQHBhcmFtIG91dHB1dEJ1ZmZlclxyXG4gICAgICogQHBhcmFtIG91dHB1dFN0cmlkZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9yZWFkQWNjZXNzb3IoZ2x0ZkFjY2Vzc29yOiBBY2Nlc3Nvciwgb3V0cHV0QnVmZmVyOiBEYXRhVmlldywgb3V0cHV0U3RyaWRlID0gMCkge1xyXG4gICAgICAgIC8vIFdoZW4gbm90IGRlZmluZWQsIGFjY2Vzc29yIG11c3QgYmUgaW5pdGlhbGl6ZWQgd2l0aCB6ZXJvcy5cclxuICAgICAgICBpZiAoZ2x0ZkFjY2Vzc29yLmJ1ZmZlclZpZXcgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBnbHRmQnVmZmVyVmlldyA9IHRoaXMuX2dsdGYuYnVmZmVyVmlld3MhW2dsdGZBY2Nlc3Nvci5idWZmZXJWaWV3XTtcclxuXHJcbiAgICAgICAgY29uc3QgY29tcG9uZW50c1BlckF0dHJpYnV0ZSA9IHRoaXMuX2dldENvbXBvbmVudHNQZXJBdHRyaWJ1dGUoZ2x0ZkFjY2Vzc29yLnR5cGUpO1xyXG4gICAgICAgIGNvbnN0IGJ5dGVzUGVyRWxlbWVudCA9IHRoaXMuX2dldEJ5dGVzUGVyQ29tcG9uZW50KGdsdGZBY2Nlc3Nvci5jb21wb25lbnRUeXBlKTtcclxuXHJcbiAgICAgICAgaWYgKG91dHB1dFN0cmlkZSA9PT0gMCkge1xyXG4gICAgICAgICAgICBvdXRwdXRTdHJpZGUgPSBjb21wb25lbnRzUGVyQXR0cmlidXRlICogYnl0ZXNQZXJFbGVtZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaW5wdXRTdGFydE9mZnNldCA9XHJcbiAgICAgICAgICAgIChnbHRmQWNjZXNzb3IuYnl0ZU9mZnNldCAhPT0gdW5kZWZpbmVkID8gZ2x0ZkFjY2Vzc29yLmJ5dGVPZmZzZXQgOiAwKSArXHJcbiAgICAgICAgICAgIChnbHRmQnVmZmVyVmlldy5ieXRlT2Zmc2V0ICE9PSB1bmRlZmluZWQgPyBnbHRmQnVmZmVyVmlldy5ieXRlT2Zmc2V0IDogMCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGlucHV0QnVmZmVyID0gY3JlYXRlRGF0YVZpZXdGcm9tQnVmZmVyKHRoaXMuX2J1ZmZlcnNbZ2x0ZkJ1ZmZlclZpZXcuYnVmZmVyXSwgaW5wdXRTdGFydE9mZnNldCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGlucHV0U3RyaWRlID0gZ2x0ZkJ1ZmZlclZpZXcuYnl0ZVN0cmlkZSAhPT0gdW5kZWZpbmVkID8gZ2x0ZkJ1ZmZlclZpZXcuYnl0ZVN0cmlkZSA6IGNvbXBvbmVudHNQZXJBdHRyaWJ1dGUgKiBieXRlc1BlckVsZW1lbnQ7XHJcblxyXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudFJlYWRlciA9IHRoaXMuX2dldENvbXBvbmVudFJlYWRlcihnbHRmQWNjZXNzb3IuY29tcG9uZW50VHlwZSk7XHJcbiAgICAgICAgY29uc3QgY29tcG9uZW50V3JpdGVyID0gdGhpcy5fZ2V0Q29tcG9uZW50V3JpdGVyKGdsdGZBY2Nlc3Nvci5jb21wb25lbnRUeXBlKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaUF0dHJpYnV0ZSA9IDA7IGlBdHRyaWJ1dGUgPCBnbHRmQWNjZXNzb3IuY291bnQ7ICsraUF0dHJpYnV0ZSkge1xyXG4gICAgICAgICAgICBjb25zdCBpID0gY3JlYXRlRGF0YVZpZXdGcm9tVHlwZWRBcnJheShpbnB1dEJ1ZmZlciwgaW5wdXRTdHJpZGUgKiBpQXR0cmlidXRlKTtcclxuICAgICAgICAgICAgY29uc3QgbyA9IGNyZWF0ZURhdGFWaWV3RnJvbVR5cGVkQXJyYXkob3V0cHV0QnVmZmVyLCBvdXRwdXRTdHJpZGUgKiBpQXR0cmlidXRlKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaUNvbXBvbmVudCA9IDA7IGlDb21wb25lbnQgPCBjb21wb25lbnRzUGVyQXR0cmlidXRlOyArK2lDb21wb25lbnQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEJ5dGVzT2Zmc2V0ID0gYnl0ZXNQZXJFbGVtZW50ICogaUNvbXBvbmVudDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY29tcG9uZW50UmVhZGVyKGksIGNvbXBvbmVudEJ5dGVzT2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudFdyaXRlcihvLCBjb21wb25lbnRCeXRlc09mZnNldCwgdmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2FwcGx5RGV2aWF0aW9uKGdsVEZBY2Nlc3NvcjogRmllbGRzUmVxdWlyZWQ8QWNjZXNzb3IsICdzcGFyc2UnPiwgYmFzZVZhbHVlczogQWNjZXNzb3JTdG9yYWdlKSB7XHJcbiAgICAgICAgY29uc3QgeyBzcGFyc2UgfSA9IGdsVEZBY2Nlc3NvcjtcclxuXHJcbiAgICAgICAgLy8gU3BhcnNlIGluZGljZXNcclxuICAgICAgICBjb25zdCBpbmRpY2VzQnVmZmVyVmlldyA9IHRoaXMuX2dsdGYuYnVmZmVyVmlld3MhW3NwYXJzZS5pbmRpY2VzLmJ1ZmZlclZpZXddO1xyXG4gICAgICAgIGNvbnN0IGluZGljZXNCdWZmZXIgPSB0aGlzLl9idWZmZXJzW2luZGljZXNCdWZmZXJWaWV3LmJ1ZmZlcl07XHJcbiAgICAgICAgY29uc3QgaW5kaWNlc1NjID0gdGhpcy5fZ2V0QXR0cmlidXRlQmFzZVR5cGVTdG9yYWdlKHNwYXJzZS5pbmRpY2VzLmNvbXBvbmVudFR5cGUpO1xyXG4gICAgICAgIGNvbnN0IHNwYXJzZUluZGljZXMgPSBuZXcgaW5kaWNlc1NjKFxyXG4gICAgICAgICAgICBpbmRpY2VzQnVmZmVyLmJ1ZmZlciBhcyB1bmtub3duIGFzIEFycmF5QnVmZmVyLFxyXG4gICAgICAgICAgICBpbmRpY2VzQnVmZmVyLmJ5dGVPZmZzZXQgKyAoaW5kaWNlc0J1ZmZlclZpZXcuYnl0ZU9mZnNldCB8fCAwKSArIChzcGFyc2UuaW5kaWNlcy5ieXRlT2Zmc2V0IHx8IDApLFxyXG4gICAgICAgICAgICBzcGFyc2UuY291bnQsXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gU3BhcnNlIHZhbHVlc1xyXG4gICAgICAgIGNvbnN0IHZhbHVlc0J1ZmZlclZpZXcgPSB0aGlzLl9nbHRmLmJ1ZmZlclZpZXdzIVtzcGFyc2UudmFsdWVzLmJ1ZmZlclZpZXddO1xyXG4gICAgICAgIGNvbnN0IHZhbHVlc0J1ZmZlciA9IHRoaXMuX2J1ZmZlcnNbdmFsdWVzQnVmZmVyVmlldy5idWZmZXJdO1xyXG4gICAgICAgIGNvbnN0IHZhbHVlc1NjID0gdGhpcy5fZ2V0QXR0cmlidXRlQmFzZVR5cGVTdG9yYWdlKGdsVEZBY2Nlc3Nvci5jb21wb25lbnRUeXBlKTtcclxuICAgICAgICBjb25zdCBzcGFyc2VWYWx1ZXMgPSBuZXcgdmFsdWVzU2MoXHJcbiAgICAgICAgICAgIHZhbHVlc0J1ZmZlci5idWZmZXIgYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcixcclxuICAgICAgICAgICAgdmFsdWVzQnVmZmVyLmJ5dGVPZmZzZXQgKyAodmFsdWVzQnVmZmVyVmlldy5ieXRlT2Zmc2V0IHx8IDApICsgKHNwYXJzZS52YWx1ZXMuYnl0ZU9mZnNldCB8fCAwKSxcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBjb25zdCBjb21wb25lbnRzID0gdGhpcy5fZ2V0Q29tcG9uZW50c1BlckF0dHJpYnV0ZShnbFRGQWNjZXNzb3IudHlwZSk7XHJcbiAgICAgICAgZm9yIChsZXQgaUNvbXBvbmVudCA9IDA7IGlDb21wb25lbnQgPCBjb21wb25lbnRzOyArK2lDb21wb25lbnQpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaVNwYXJzZUluZGV4ID0gMDsgaVNwYXJzZUluZGV4IDwgc3BhcnNlSW5kaWNlcy5sZW5ndGg7ICsraVNwYXJzZUluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzcGFyc2VJbmRleCA9IHNwYXJzZUluZGljZXNbaVNwYXJzZUluZGV4XTtcclxuICAgICAgICAgICAgICAgIGJhc2VWYWx1ZXNbY29tcG9uZW50cyAqIHNwYXJzZUluZGV4ICsgaUNvbXBvbmVudF0gPSBzcGFyc2VWYWx1ZXNbY29tcG9uZW50cyAqIGlTcGFyc2VJbmRleCArIGlDb21wb25lbnRdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFByaW1pdGl2ZU1vZGUobW9kZTogbnVtYmVyIHwgdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgaWYgKG1vZGUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBtb2RlID0gR2x0ZlByaW1pdGl2ZU1vZGUuX19ERUZBVUxUO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzd2l0Y2ggKG1vZGUpIHtcclxuICAgICAgICAgICAgY2FzZSBHbHRmUHJpbWl0aXZlTW9kZS5QT0lOVFM6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2Z4LlByaW1pdGl2ZU1vZGUuUE9JTlRfTElTVDtcclxuICAgICAgICAgICAgY2FzZSBHbHRmUHJpbWl0aXZlTW9kZS5MSU5FUzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBnZnguUHJpbWl0aXZlTW9kZS5MSU5FX0xJU1Q7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZlByaW1pdGl2ZU1vZGUuTElORV9MT09QOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdmeC5QcmltaXRpdmVNb2RlLkxJTkVfTE9PUDtcclxuICAgICAgICAgICAgY2FzZSBHbHRmUHJpbWl0aXZlTW9kZS5MSU5FX1NUUklQOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdmeC5QcmltaXRpdmVNb2RlLkxJTkVfU1RSSVA7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZlByaW1pdGl2ZU1vZGUuVFJJQU5HTEVTOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdmeC5QcmltaXRpdmVNb2RlLlRSSUFOR0xFX0xJU1Q7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZlByaW1pdGl2ZU1vZGUuVFJJQU5HTEVfU1RSSVA6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2Z4LlByaW1pdGl2ZU1vZGUuVFJJQU5HTEVfU1RSSVA7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZlByaW1pdGl2ZU1vZGUuVFJJQU5HTEVfRkFOOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdmeC5QcmltaXRpdmVNb2RlLlRSSUFOR0xFX0ZBTjtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIHByaW1pdGl2ZSBtb2RlOiAke21vZGV9LmApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRBdHRyaWJ1dGVCYXNlVHlwZVN0b3JhZ2UoY29tcG9uZW50VHlwZTogbnVtYmVyKTogQWNjZXNzb3JTdG9yYWdlQ29uc3RydWN0b3Ige1xyXG4gICAgICAgIHN3aXRjaCAoY29tcG9uZW50VHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIEdsdGZBY2Nlc3NvckNvbXBvbmVudFR5cGUuQllURTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBJbnQ4QXJyYXk7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkFjY2Vzc29yQ29tcG9uZW50VHlwZS5VTlNJR05FRF9CWVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkFjY2Vzc29yQ29tcG9uZW50VHlwZS5TSE9SVDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBJbnQxNkFycmF5O1xyXG4gICAgICAgICAgICBjYXNlIEdsdGZBY2Nlc3NvckNvbXBvbmVudFR5cGUuVU5TSUdORURfU0hPUlQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gVWludDE2QXJyYXk7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkFjY2Vzc29yQ29tcG9uZW50VHlwZS5VTlNJR05FRF9JTlQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gVWludDMyQXJyYXk7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkFjY2Vzc29yQ29tcG9uZW50VHlwZS5GTE9BVDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBGbG9hdDMyQXJyYXk7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBjb21wb25lbnQgdHlwZTogJHtjb21wb25lbnRUeXBlfWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRDb21wb25lbnRzUGVyQXR0cmlidXRlKHR5cGU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBnZXRHbHRmQWNjZXNzb3JUeXBlQ29tcG9uZW50cyh0eXBlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9nZXRCeXRlc1BlckNvbXBvbmVudChjb21wb25lbnRUeXBlOiBudW1iZXIpIHtcclxuICAgICAgICBzd2l0Y2ggKGNvbXBvbmVudFR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBHbHRmQWNjZXNzb3JDb21wb25lbnRUeXBlLkJZVEU6XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkFjY2Vzc29yQ29tcG9uZW50VHlwZS5VTlNJR05FRF9CWVRFOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkFjY2Vzc29yQ29tcG9uZW50VHlwZS5TSE9SVDpcclxuICAgICAgICAgICAgY2FzZSBHbHRmQWNjZXNzb3JDb21wb25lbnRUeXBlLlVOU0lHTkVEX1NIT1JUOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkFjY2Vzc29yQ29tcG9uZW50VHlwZS5VTlNJR05FRF9JTlQ6XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkFjY2Vzc29yQ29tcG9uZW50VHlwZS5GTE9BVDpcclxuICAgICAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnJlY29nbml6ZWQgY29tcG9uZW50IHR5cGU6ICR7Y29tcG9uZW50VHlwZX1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0Q29tcG9uZW50UmVhZGVyKGNvbXBvbmVudFR5cGU6IG51bWJlcik6IChidWZmZXI6IERhdGFWaWV3LCBvZmZzZXQ6IG51bWJlcikgPT4gbnVtYmVyIHtcclxuICAgICAgICBzd2l0Y2ggKGNvbXBvbmVudFR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBHbHRmQWNjZXNzb3JDb21wb25lbnRUeXBlLkJZVEU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGJ1ZmZlciwgb2Zmc2V0KSA9PiBidWZmZXIuZ2V0SW50OChvZmZzZXQpO1xyXG4gICAgICAgICAgICBjYXNlIEdsdGZBY2Nlc3NvckNvbXBvbmVudFR5cGUuVU5TSUdORURfQllURTpcclxuICAgICAgICAgICAgICAgIHJldHVybiAoYnVmZmVyLCBvZmZzZXQpID0+IGJ1ZmZlci5nZXRVaW50OChvZmZzZXQpO1xyXG4gICAgICAgICAgICBjYXNlIEdsdGZBY2Nlc3NvckNvbXBvbmVudFR5cGUuU0hPUlQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGJ1ZmZlciwgb2Zmc2V0KSA9PiBidWZmZXIuZ2V0SW50MTYob2Zmc2V0LCBEYXRhVmlld1VzZUxpdHRsZUVuZGlhbik7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkFjY2Vzc29yQ29tcG9uZW50VHlwZS5VTlNJR05FRF9TSE9SVDpcclxuICAgICAgICAgICAgICAgIHJldHVybiAoYnVmZmVyLCBvZmZzZXQpID0+IGJ1ZmZlci5nZXRVaW50MTYob2Zmc2V0LCBEYXRhVmlld1VzZUxpdHRsZUVuZGlhbik7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkFjY2Vzc29yQ29tcG9uZW50VHlwZS5VTlNJR05FRF9JTlQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGJ1ZmZlciwgb2Zmc2V0KSA9PiBidWZmZXIuZ2V0VWludDMyKG9mZnNldCwgRGF0YVZpZXdVc2VMaXR0bGVFbmRpYW4pO1xyXG4gICAgICAgICAgICBjYXNlIEdsdGZBY2Nlc3NvckNvbXBvbmVudFR5cGUuRkxPQVQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGJ1ZmZlciwgb2Zmc2V0KSA9PiBidWZmZXIuZ2V0RmxvYXQzMihvZmZzZXQsIERhdGFWaWV3VXNlTGl0dGxlRW5kaWFuKTtcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIGNvbXBvbmVudCB0eXBlOiAke2NvbXBvbmVudFR5cGV9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldENvbXBvbmVudFdyaXRlcihjb21wb25lbnRUeXBlOiBudW1iZXIpOiAoYnVmZmVyOiBEYXRhVmlldywgb2Zmc2V0OiBudW1iZXIsIHZhbHVlOiBudW1iZXIpID0+IHZvaWQge1xyXG4gICAgICAgIHN3aXRjaCAoY29tcG9uZW50VHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIEdsdGZBY2Nlc3NvckNvbXBvbmVudFR5cGUuQllURTpcclxuICAgICAgICAgICAgICAgIHJldHVybiAoYnVmZmVyLCBvZmZzZXQsIHZhbHVlKSA9PiBidWZmZXIuc2V0SW50OChvZmZzZXQsIHZhbHVlKTtcclxuICAgICAgICAgICAgY2FzZSBHbHRmQWNjZXNzb3JDb21wb25lbnRUeXBlLlVOU0lHTkVEX0JZVEU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGJ1ZmZlciwgb2Zmc2V0LCB2YWx1ZSkgPT4gYnVmZmVyLnNldFVpbnQ4KG9mZnNldCwgdmFsdWUpO1xyXG4gICAgICAgICAgICBjYXNlIEdsdGZBY2Nlc3NvckNvbXBvbmVudFR5cGUuU0hPUlQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGJ1ZmZlciwgb2Zmc2V0LCB2YWx1ZSkgPT4gYnVmZmVyLnNldEludDE2KG9mZnNldCwgdmFsdWUsIERhdGFWaWV3VXNlTGl0dGxlRW5kaWFuKTtcclxuICAgICAgICAgICAgY2FzZSBHbHRmQWNjZXNzb3JDb21wb25lbnRUeXBlLlVOU0lHTkVEX1NIT1JUOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChidWZmZXIsIG9mZnNldCwgdmFsdWUpID0+IGJ1ZmZlci5zZXRVaW50MTYob2Zmc2V0LCB2YWx1ZSwgRGF0YVZpZXdVc2VMaXR0bGVFbmRpYW4pO1xyXG4gICAgICAgICAgICBjYXNlIEdsdGZBY2Nlc3NvckNvbXBvbmVudFR5cGUuVU5TSUdORURfSU5UOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChidWZmZXIsIG9mZnNldCwgdmFsdWUpID0+IGJ1ZmZlci5zZXRVaW50MzIob2Zmc2V0LCB2YWx1ZSwgRGF0YVZpZXdVc2VMaXR0bGVFbmRpYW4pO1xyXG4gICAgICAgICAgICBjYXNlIEdsdGZBY2Nlc3NvckNvbXBvbmVudFR5cGUuRkxPQVQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGJ1ZmZlciwgb2Zmc2V0LCB2YWx1ZSkgPT4gYnVmZmVyLnNldEZsb2F0MzIob2Zmc2V0LCB2YWx1ZSwgRGF0YVZpZXdVc2VMaXR0bGVFbmRpYW4pO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnJlY29nbml6ZWQgY29tcG9uZW50IHR5cGU6ICR7Y29tcG9uZW50VHlwZX1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZ2V0R2x0ZlhYTmFtZShhc3NldEtpbmQ6IEdsdGZBc3NldEtpbmQsIGluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCBhc3NldHNBcnJheU5hbWU6IHtcclxuICAgICAgICAgICAgW3g6IG51bWJlcl06IHN0cmluZztcclxuICAgICAgICB9ID0ge1xyXG4gICAgICAgICAgICBbR2x0ZkFzc2V0S2luZC5BbmltYXRpb25dOiAnYW5pbWF0aW9ucycsXHJcbiAgICAgICAgICAgIFtHbHRmQXNzZXRLaW5kLkltYWdlXTogJ2ltYWdlcycsXHJcbiAgICAgICAgICAgIFtHbHRmQXNzZXRLaW5kLk1hdGVyaWFsXTogJ21hdGVyaWFscycsXHJcbiAgICAgICAgICAgIFtHbHRmQXNzZXRLaW5kLk5vZGVdOiAnbm9kZXMnLFxyXG4gICAgICAgICAgICBbR2x0ZkFzc2V0S2luZC5Ta2luXTogJ3NraW5zJyxcclxuICAgICAgICAgICAgW0dsdGZBc3NldEtpbmQuVGV4dHVyZV06ICd0ZXh0dXJlcycsXHJcbiAgICAgICAgICAgIFtHbHRmQXNzZXRLaW5kLlNjZW5lXTogJ3NjZW5lcycsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc3QgYXNzZXRzID0gdGhpcy5fZ2x0Zlthc3NldHNBcnJheU5hbWVbYXNzZXRLaW5kXV07XHJcbiAgICAgICAgaWYgKCFhc3NldHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBhc3NldCA9IGFzc2V0c1tpbmRleF07XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhc3NldC5uYW1lID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICByZXR1cm4gYXNzZXQubmFtZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gYCR7R2x0ZkFzc2V0S2luZFthc3NldEtpbmRdfS0ke2luZGV4fWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTm9ybWFsaXplIGEgbnVtYmVyIGFycmF5IGlmIG1heCB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gMSxyZXR1cm5zIHRoZSBtYXggdmFsdWUgYW5kIHRoZSBub3JtYWxpemVkIGFycmF5LlxyXG4gICAgICogQHBhcmFtIG9yZ0FycmF5XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9ub3JtYWxpemVBcnJheVRvQ29jb3NDb2xvcihvcmdBcnJheTogbnVtYmVyW10pOiBbZmFjdG9yOiBudW1iZXIsIGNvbG9yOiBjYy5Db2xvcl0ge1xyXG4gICAgICAgIGxldCBmYWN0b3IgPSAxO1xyXG4gICAgICAgIGlmIChNYXRoLm1heCguLi5vcmdBcnJheSkgPiAxKSB7XHJcbiAgICAgICAgICAgIGZhY3RvciA9IE1hdGgubWF4KC4uLm9yZ0FycmF5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplQXJyYXkgPSBvcmdBcnJheS5tYXAoKHYpID0+IGxpbmVhclRvU3JnYjhCaXQodiAvIGZhY3RvcikpO1xyXG4gICAgICAgIGlmIChub3JtYWxpemVBcnJheS5sZW5ndGggPT09IDMpIHtcclxuICAgICAgICAgICAgbm9ybWFsaXplQXJyYXkucHVzaCgyNTUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjb2xvciA9IG5ldyBjYy5Db2xvcihub3JtYWxpemVBcnJheVswXSwgbm9ybWFsaXplQXJyYXlbMV0sIG5vcm1hbGl6ZUFycmF5WzJdLCBub3JtYWxpemVBcnJheVszXSk7XHJcbiAgICAgICAgcmV0dXJuIFtmYWN0b3IsIGNvbG9yXTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jb252ZXJ0QWRza1BoeXNpY2FsTWF0ZXJpYWwoXHJcbiAgICAgICAgX2dsVEZNYXRlcmlhbDogTWF0ZXJpYWwsXHJcbiAgICAgICAgZ2xURk1hdGVyaWFsSW5kZXg6IG51bWJlcixcclxuICAgICAgICBnbFRGQXNzZXRGaW5kZXI6IElHbHRmQXNzZXRGaW5kZXIsXHJcbiAgICAgICAgZWZmZWN0R2V0dGVyOiAobmFtZTogc3RyaW5nKSA9PiBjYy5FZmZlY3RBc3NldCxcclxuICAgICAgICBvcmlnaW5hbE1hdGVyaWFsOiB7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IEFkc2szZHNNYXhQaHlzaWNhbE1hdGVyaWFsUHJvcGVydGllcztcclxuICAgICAgICB9LFxyXG4gICAgKTogY2MuTWF0ZXJpYWwgfCBudWxsIHtcclxuICAgICAgICBjb25zdCBkZWZpbmVzOiBQYXJ0aWFsPENyZWF0b3JTdGRNYXRlcmlhbERlZmluZXM+ID0ge307XHJcbiAgICAgICAgY29uc3QgcHJvcGVydGllczogUGFydGlhbDxDcmVhdG9yU3RkTWF0ZXJpYWxQcm9wZXJ0aWVzPiA9IHt9O1xyXG4gICAgICAgIGNvbnN0IHN0YXRlczogY2MuTWF0ZXJpYWxbJ19zdGF0ZXMnXVswXSA9IHtcclxuICAgICAgICAgICAgcmFzdGVyaXplclN0YXRlOiB7fSxcclxuICAgICAgICAgICAgYmxlbmRTdGF0ZTogeyB0YXJnZXRzOiBbe31dIH0sXHJcbiAgICAgICAgICAgIGRlcHRoU3RlbmNpbFN0YXRlOiB7fSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCB7IFBhcmFtZXRlcnM6IHBoeXNpY2FsUGFyYW1zIH0gPSBvcmlnaW5hbE1hdGVyaWFsLnByb3BlcnRpZXNbJzNkc01heCddO1xyXG4gICAgICAgIC8vIE5vdGU6IFlvdSBzaG91bGQgc3VwcG9ydCBldmVyeSB0aGluZyBpbiBgcGh5c2ljYWxQYXJhbXNgIG9wdGlvbmFsXHJcblxyXG4gICAgICAgIGNvbnN0IHBCYXNlQ29sb3IgPSBwaHlzaWNhbFBhcmFtcy5iYXNlX2NvbG9yID8/IEFEU0tfM0RTX01BWF9QSFlTSUNBTF9NQVRFUklBTF9ERUZBVUxUX1BBUkFNRVRFUlMuYmFzZV9jb2xvcjtcclxuICAgICAgICBwcm9wZXJ0aWVzWydtYWluQ29sb3InXSA9IGNjLlZlYzQuc2V0KG5ldyBjYy5Db2xvcigpLCBwQmFzZUNvbG9yWzBdLCBwQmFzZUNvbG9yWzFdLCBwQmFzZUNvbG9yWzJdLCBwQmFzZUNvbG9yWzNdKTtcclxuXHJcbiAgICAgICAgY29uc3QgcEJhc2VXZWlnaHQgPSBwaHlzaWNhbFBhcmFtcy5iYXNpY193ZWlnaHQgPz8gQURTS18zRFNfTUFYX1BIWVNJQ0FMX01BVEVSSUFMX0RFRkFVTFRfUEFSQU1FVEVSUy5iYXNpY193ZWlnaHQ7XHJcbiAgICAgICAgcHJvcGVydGllc1snYWxiZWRvU2NhbGUnXSA9IG5ldyBjYy5WZWMzKHBCYXNlV2VpZ2h0LCBwQmFzZVdlaWdodCwgcEJhc2VXZWlnaHQpO1xyXG5cclxuICAgICAgICBjb25zdCBwQmFzZUNvbG9yTWFwT24gPSBwaHlzaWNhbFBhcmFtcy5iYXNlX2NvbG9yX21hcF9vbiA/PyBBRFNLXzNEU19NQVhfUEhZU0lDQUxfTUFURVJJQUxfREVGQVVMVF9QQVJBTUVURVJTLmJhc2VfY29sb3JfbWFwX29uO1xyXG4gICAgICAgIGNvbnN0IHBCYXNlQ29sb3JNYXAgPSBwaHlzaWNhbFBhcmFtcy5iYXNlX2NvbG9yX21hcDtcclxuICAgICAgICBpZiAocEJhc2VDb2xvck1hcE9uICYmIHBCYXNlQ29sb3JNYXApIHtcclxuICAgICAgICAgICAgZGVmaW5lc1snVVNFX0FMQkVET19NQVAnXSA9IHRydWU7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ21haW5UZXh0dXJlJ10gPSBnbFRGQXNzZXRGaW5kZXIuZmluZCgndGV4dHVyZXMnLCBwQmFzZUNvbG9yTWFwLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKHBCYXNlQ29sb3JNYXAudGV4Q29vcmQgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGRlZmluZXNbJ0FMQkVET19VViddID0gJ3ZfdXYxJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaGFzS0hSVGV4dHVyZVRyYW5zZm9ybUV4dGVuc2lvbihwQmFzZUNvbG9yTWFwKSkge1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllc1sndGlsaW5nT2Zmc2V0J10gPSB0aGlzLl9raHJUZXh0dXJlVHJhbnNmb3JtVG9UaWxpbmcocEJhc2VDb2xvck1hcC5leHRlbnNpb25zLktIUl90ZXh0dXJlX3RyYW5zZm9ybSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBNZXRhbG5lc3MgPSBwaHlzaWNhbFBhcmFtcy5tZXRhbG5lc3MgPz8gQURTS18zRFNfTUFYX1BIWVNJQ0FMX01BVEVSSUFMX0RFRkFVTFRfUEFSQU1FVEVSUy5tZXRhbG5lc3M7XHJcbiAgICAgICAgcHJvcGVydGllc1snbWV0YWxsaWMnXSA9IHBNZXRhbG5lc3M7XHJcbiAgICAgICAgY29uc3QgcFJvdWdobmVzcyA9IHBoeXNpY2FsUGFyYW1zLnJvdWdobmVzcyA/PyBBRFNLXzNEU19NQVhfUEhZU0lDQUxfTUFURVJJQUxfREVGQVVMVF9QQVJBTUVURVJTLnJvdWdobmVzcztcclxuICAgICAgICBjb25zdCBwSW52Um91Z2huZXNzID0gcGh5c2ljYWxQYXJhbXMucm91Z2huZXNzX2ludiA/PyBBRFNLXzNEU19NQVhfUEhZU0lDQUxfTUFURVJJQUxfREVGQVVMVF9QQVJBTUVURVJTLnJvdWdobmVzc19pbnY7XHJcbiAgICAgICAgcHJvcGVydGllc1sncm91Z2huZXNzJ10gPSBwSW52Um91Z2huZXNzID8gMS4wIC0gcFJvdWdobmVzcyA6IHBSb3VnaG5lc3M7XHJcbiAgICAgICAgY29uc3QgcE1ldGFsbmVzc01hcE9uID0gcGh5c2ljYWxQYXJhbXMubWV0YWxuZXNzX21hcF9vbiA/PyBBRFNLXzNEU19NQVhfUEhZU0lDQUxfTUFURVJJQUxfREVGQVVMVF9QQVJBTUVURVJTLm1ldGFsbmVzc19tYXBfb247XHJcbiAgICAgICAgY29uc3QgcE1ldGFsbmVzc01hcCA9IHBoeXNpY2FsUGFyYW1zLm1ldGFsbmVzc19tYXA7XHJcbiAgICAgICAgY29uc3QgcFJvdWdobmVzc01hcE9uID0gcGh5c2ljYWxQYXJhbXMucm91Z2huZXNzX21hcF9vbiA/PyBBRFNLXzNEU19NQVhfUEhZU0lDQUxfTUFURVJJQUxfREVGQVVMVF9QQVJBTUVURVJTLnJvdWdobmVzc19tYXBfb247XHJcbiAgICAgICAgY29uc3QgcFJvdWdobmVzc01hcCA9IHBoeXNpY2FsUGFyYW1zLnJvdWdobmVzc19tYXA7XHJcbiAgICAgICAgaWYgKHBNZXRhbG5lc3NNYXBPbiAmJiBwTWV0YWxuZXNzTWFwKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE9cclxuICAgICAgICAgICAgLy8gZGVmaW5lcy5VU0VfTUVUQUxMSUNfUk9VR0hORVNTX01BUCA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vIHByb3BlcnRpZXMubWV0YWxsaWNSb3VnaG5lc3NNYXA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwUm91Z2huZXNzTWFwT24gJiYgcFJvdWdobmVzc01hcCkge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBhcHBseSBpbnY/XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUT0RPOiBidW1wIG1hcCAmIGJ1bXAgbWFwIG9uP1xyXG4gICAgICAgIC8vIGNvbnN0IHBCdW1wTWFwID0gcGh5c2ljYWxQYXJhbXMuYnVtcF9tYXA7XHJcbiAgICAgICAgLy8gaWYgKHBCdW1wTWFwKSB7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICBjb25zdCBwRW1pc3Npb24gPSBwaHlzaWNhbFBhcmFtcy5lbWlzc2lvbiA/PyBBRFNLXzNEU19NQVhfUEhZU0lDQUxfTUFURVJJQUxfREVGQVVMVF9QQVJBTUVURVJTLmVtaXNzaW9uO1xyXG4gICAgICAgIC8vIFRPRE86IGVtaXNzaXZlIHNjYWxlXHJcbiAgICAgICAgLy8gcHJvcGVydGllc1snZW1pc3NpdmVTY2FsZSddID0gbmV3IFZlYzQocEVtaXNzaW9uLCBwRW1pc3Npb24sIHBFbWlzc2lvbiwgMS4wKTtcclxuXHJcbiAgICAgICAgY29uc3QgcEVtaXNzaXZlQ29sb3IgPSBwaHlzaWNhbFBhcmFtcy5lbWl0X2NvbG9yID8/IEFEU0tfM0RTX01BWF9QSFlTSUNBTF9NQVRFUklBTF9ERUZBVUxUX1BBUkFNRVRFUlMuZW1pdF9jb2xvcjtcclxuICAgICAgICBwcm9wZXJ0aWVzWydlbWlzc2l2ZSddID0gbmV3IFZlYzQoXHJcbiAgICAgICAgICAgIHBFbWlzc2l2ZUNvbG9yWzBdICogcEVtaXNzaW9uLFxyXG4gICAgICAgICAgICBwRW1pc3NpdmVDb2xvclsxXSAqIHBFbWlzc2lvbixcclxuICAgICAgICAgICAgcEVtaXNzaXZlQ29sb3JbMl0gKiBwRW1pc3Npb24sXHJcbiAgICAgICAgICAgIHBFbWlzc2l2ZUNvbG9yWzNdICogcEVtaXNzaW9uLFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIGNvbnN0IHBFbWlzc2lvbk1hcE9uID0gcGh5c2ljYWxQYXJhbXMuZW1pc3Npb25fbWFwX29uID8/IEFEU0tfM0RTX01BWF9QSFlTSUNBTF9NQVRFUklBTF9ERUZBVUxUX1BBUkFNRVRFUlMuZW1pc3Npb25fbWFwX29uO1xyXG4gICAgICAgIC8vIGNvbnN0IHBFbWlzc2lvbk1hcCA9IHBoeXNpY2FsUGFyYW1zLmVtaXNzaW9uX21hcDtcclxuICAgICAgICAvLyBXZSBkbyBub3Qgc3VwcG9ydCBlbWlzc2lvbiAoZmFjdG9yKSBtYXBcclxuICAgICAgICAvLyBpZiAoKHBFbWlzc2lvbk1hcE9uICYmIHBFbWlzc2lvbk1hcCkpIHtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBFbWlzc2l2ZUNvbG9yTWFwT24gPSBwaHlzaWNhbFBhcmFtcy5lbWl0X2NvbG9yX21hcF9vbiA/PyBBRFNLXzNEU19NQVhfUEhZU0lDQUxfTUFURVJJQUxfREVGQVVMVF9QQVJBTUVURVJTLmVtaXRfY29sb3JfbWFwX29uO1xyXG4gICAgICAgIGNvbnN0IHBFbWlzc2l2ZUNvbG9yTWFwID0gcGh5c2ljYWxQYXJhbXMuZW1pdF9jb2xvcl9tYXA7XHJcbiAgICAgICAgaWYgKHBFbWlzc2l2ZUNvbG9yTWFwT24gJiYgcEVtaXNzaXZlQ29sb3JNYXApIHtcclxuICAgICAgICAgICAgZGVmaW5lc1snVVNFX0VNSVNTSVZFX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snZW1pc3NpdmVNYXAnXSA9IGdsVEZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIHBFbWlzc2l2ZUNvbG9yTWFwLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKHBFbWlzc2l2ZUNvbG9yTWFwLnRleENvb3JkID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZpbmVzWydFTUlTU0lWRV9VViddID0gJ3ZfdXYxJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVE9ETzpcclxuICAgICAgICAvLyBkZWZpbmVzWydVU0VfT0NDTFVTSU9OX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAvLyBwcm9wZXJ0aWVzWydvY2NsdXNpb25NYXAnXTtcclxuICAgICAgICAvLyBwcm9wZXJ0aWVzWydvY2NsdXNpb24nXTtcclxuXHJcbiAgICAgICAgY29uc3QgbWF0ZXJpYWwgPSBuZXcgY2MuTWF0ZXJpYWwoKTtcclxuICAgICAgICBtYXRlcmlhbC5uYW1lID0gdGhpcy5fZ2V0R2x0ZlhYTmFtZShHbHRmQXNzZXRLaW5kLk1hdGVyaWFsLCBnbFRGTWF0ZXJpYWxJbmRleCk7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUUzI0NDVcclxuICAgICAgICBtYXRlcmlhbC5fZWZmZWN0QXNzZXQgPSBlZmZlY3RHZXR0ZXIoJ2RiOi8vaW50ZXJuYWwvZWZmZWN0cy9idWlsdGluLXN0YW5kYXJkLmVmZmVjdCcpO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNDQ1XHJcbiAgICAgICAgbWF0ZXJpYWwuX2RlZmluZXMgPSBbZGVmaW5lc107XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUUzI0NDVcclxuICAgICAgICBtYXRlcmlhbC5fcHJvcHMgPSBbcHJvcGVydGllc107XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUUzI0NDVcclxuICAgICAgICBtYXRlcmlhbC5fc3RhdGVzID0gW3N0YXRlc107XHJcbiAgICAgICAgcmV0dXJuIG1hdGVyaWFsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2NvbnZlcnRNYXhQaHlzaWNhbE1hdGVyaWFsKFxyXG4gICAgICAgIGdsVEZNYXRlcmlhbEluZGV4OiBudW1iZXIsXHJcbiAgICAgICAgZ2xURkFzc2V0RmluZGVyOiBJR2x0ZkFzc2V0RmluZGVyLFxyXG4gICAgICAgIGVmZmVjdEdldHRlcjogKG5hbWU6IHN0cmluZykgPT4gY2MuRWZmZWN0QXNzZXQsXHJcbiAgICAgICAgcGh5c2ljYWxNYXRlcmlhbDogTWF4UGh5c2ljYWxNYXRlcmlhbCxcclxuICAgICk6IGNjLk1hdGVyaWFsIHwgbnVsbCB7XHJcbiAgICAgICAgY29uc3QgZGVmaW5lczogUGFydGlhbDxDcmVhdG9yRENDTWV0YWxsaWNSb3VnaG5lc3NNYXRlcmlhbERlZmluZXM+ID0ge307XHJcbiAgICAgICAgY29uc3QgcHJvcGVydGllczogUGFydGlhbDxDcmVhdG9yRENDTWV0YWxsaWNSb3VnaG5lc3NNYXRlcmlhbFByb3BlcnRpZXM+ID0ge307XHJcbiAgICAgICAgY29uc3Qgc3RhdGVzOiBjYy5NYXRlcmlhbFsnX3N0YXRlcyddWzBdID0ge1xyXG4gICAgICAgICAgICByYXN0ZXJpemVyU3RhdGU6IHt9LFxyXG4gICAgICAgICAgICBibGVuZFN0YXRlOiB7IHRhcmdldHM6IFt7fV0gfSxcclxuICAgICAgICAgICAgZGVwdGhTdGVuY2lsU3RhdGU6IHt9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHBoeXNpY2FsTWF0ZXJpYWwuYmFzZV9jb2xvcl9tYXAgJiYgIXRoaXMuZmJ4TWlzc2luZ0ltYWdlc0lkLmluY2x1ZGVzKHBoeXNpY2FsTWF0ZXJpYWwuYmFzZV9jb2xvcl9tYXAudmFsdWUuaW5kZXgpKSB7XHJcbiAgICAgICAgICAgIGRlZmluZXNbJ1VTRV9BTEJFRE9fTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydtYWluVGV4dHVyZSddID1cclxuICAgICAgICAgICAgICAgIGdsVEZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIHBoeXNpY2FsTWF0ZXJpYWwuYmFzZV9jb2xvcl9tYXAudmFsdWUuaW5kZXgsIGNjLlRleHR1cmUyRCkgPz8gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm9wZXJ0aWVzWydtYWluQ29sb3InXSA9IHRoaXMuX25vcm1hbGl6ZUFycmF5VG9Db2Nvc0NvbG9yKHBoeXNpY2FsTWF0ZXJpYWwuYmFzZV9jb2xvci52YWx1ZSlbMV07XHJcblxyXG4gICAgICAgIGlmIChwaHlzaWNhbE1hdGVyaWFsLmJhc2Vfd2VpZ2h0X21hcCAmJiAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMocGh5c2ljYWxNYXRlcmlhbC5iYXNlX3dlaWdodF9tYXAudmFsdWUuaW5kZXgpKSB7XHJcbiAgICAgICAgICAgIGRlZmluZXNbJ1VTRV9XRUlHSFRfTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydiYXNlV2VpZ2h0TWFwJ10gPVxyXG4gICAgICAgICAgICAgICAgZ2xURkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgcGh5c2ljYWxNYXRlcmlhbC5iYXNlX3dlaWdodF9tYXAudmFsdWUuaW5kZXgsIGNjLlRleHR1cmUyRCkgPz8gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm9wZXJ0aWVzWydhbGJlZG9TY2FsZSddID0gcGh5c2ljYWxNYXRlcmlhbC5iYXNlX3dlaWdodC52YWx1ZTtcclxuXHJcbiAgICAgICAgaWYgKHBoeXNpY2FsTWF0ZXJpYWwubWV0YWxuZXNzX21hcCAmJiAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMocGh5c2ljYWxNYXRlcmlhbC5tZXRhbG5lc3NfbWFwLnZhbHVlLmluZGV4KSkge1xyXG4gICAgICAgICAgICBkZWZpbmVzWydVU0VfTUVUQUxMSUNfTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydtZXRhbGxpY01hcCddID1cclxuICAgICAgICAgICAgICAgIGdsVEZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIHBoeXNpY2FsTWF0ZXJpYWwubWV0YWxuZXNzX21hcC52YWx1ZS5pbmRleCwgY2MuVGV4dHVyZTJEKSA/PyB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3BlcnRpZXNbJ21ldGFsbGljJ10gPSBwaHlzaWNhbE1hdGVyaWFsLm1ldGFsbmVzcy52YWx1ZTtcclxuXHJcbiAgICAgICAgaWYgKHBoeXNpY2FsTWF0ZXJpYWwucm91Z2huZXNzX21hcCAmJiAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMocGh5c2ljYWxNYXRlcmlhbC5yb3VnaG5lc3NfbWFwLnZhbHVlLmluZGV4KSkge1xyXG4gICAgICAgICAgICBkZWZpbmVzWydVU0VfUk9VR0hORVNTX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgcHJvcGVydGllc1sncm91Z2huZXNzTWFwJ10gPVxyXG4gICAgICAgICAgICAgICAgZ2xURkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgcGh5c2ljYWxNYXRlcmlhbC5yb3VnaG5lc3NfbWFwLnZhbHVlLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvcGVydGllc1sncm91Z2huZXNzJ10gPSBwaHlzaWNhbE1hdGVyaWFsLnJvdWdobmVzcy52YWx1ZTtcclxuXHJcbiAgICAgICAgaWYgKHBoeXNpY2FsTWF0ZXJpYWwuYnVtcF9tYXAgJiYgIXRoaXMuZmJ4TWlzc2luZ0ltYWdlc0lkLmluY2x1ZGVzKHBoeXNpY2FsTWF0ZXJpYWwuYnVtcF9tYXAudmFsdWUuaW5kZXgpKSB7XHJcbiAgICAgICAgICAgIGRlZmluZXNbJ1VTRV9OT1JNQUxfTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydub3JtYWxNYXAnXSA9IGdsVEZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIHBoeXNpY2FsTWF0ZXJpYWwuYnVtcF9tYXAudmFsdWUuaW5kZXgsIGNjLlRleHR1cmUyRCkgPz8gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBoeXNpY2FsTWF0ZXJpYWwuZW1pc3Npb25fbWFwICYmICF0aGlzLmZieE1pc3NpbmdJbWFnZXNJZC5pbmNsdWRlcyhwaHlzaWNhbE1hdGVyaWFsLmVtaXNzaW9uX21hcC52YWx1ZS5pbmRleCkpIHtcclxuICAgICAgICAgICAgZGVmaW5lc1snVVNFX0VNSVNTSVZFU0NBTEVfTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydlbWlzc2l2ZVNjYWxlTWFwJ10gPVxyXG4gICAgICAgICAgICAgICAgZ2xURkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgcGh5c2ljYWxNYXRlcmlhbC5lbWlzc2lvbl9tYXAudmFsdWUuaW5kZXgsIGNjLlRleHR1cmUyRCkgPz8gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm9wZXJ0aWVzWydlbWlzc2l2ZVNjYWxlJ10gPSBwaHlzaWNhbE1hdGVyaWFsLmVtaXNzaW9uLnZhbHVlO1xyXG5cclxuICAgICAgICBpZiAocGh5c2ljYWxNYXRlcmlhbC5lbWl0X2NvbG9yX21hcCAmJiAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMocGh5c2ljYWxNYXRlcmlhbC5lbWl0X2NvbG9yX21hcC52YWx1ZS5pbmRleCkpIHtcclxuICAgICAgICAgICAgZGVmaW5lc1snVVNFX0VNSVNTSVZFX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snZW1pc3NpdmVNYXAnXSA9XHJcbiAgICAgICAgICAgICAgICBnbFRGQXNzZXRGaW5kZXIuZmluZCgndGV4dHVyZXMnLCBwaHlzaWNhbE1hdGVyaWFsLmVtaXRfY29sb3JfbWFwLnZhbHVlLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvcGVydGllc1snZW1pc3NpdmUnXSA9IHRoaXMuX25vcm1hbGl6ZUFycmF5VG9Db2Nvc0NvbG9yKHBoeXNpY2FsTWF0ZXJpYWwuZW1pdF9jb2xvci52YWx1ZSlbMV07XHJcblxyXG4gICAgICAgIC8vIHNldCBhbHBoYVNvdXJjZSBkZWZhdWx0IHZhbHVlLlxyXG4gICAgICAgIHByb3BlcnRpZXNbJ2FscGhhU291cmNlJ10gPSAxO1xyXG4gICAgICAgIGxldCB0ZWNoID0gMDtcclxuICAgICAgICBpZiAocGh5c2ljYWxNYXRlcmlhbC5jdXRvdXRfbWFwKSB7XHJcbiAgICAgICAgICAgIHRlY2ggPSAxO1xyXG4gICAgICAgICAgICBkZWZpbmVzWydVU0VfQUxQSEFfVEVTVCddID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRlZmluZXNbJ1VTRV9PUEFDSVRZX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snYWxwaGFTb3VyY2VNYXAnXSA9XHJcbiAgICAgICAgICAgICAgICBnbFRGQXNzZXRGaW5kZXIuZmluZCgndGV4dHVyZXMnLCBwaHlzaWNhbE1hdGVyaWFsLmN1dG91dF9tYXAudmFsdWUuaW5kZXgsIGNjLlRleHR1cmUyRCkgPz8gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbWF0ZXJpYWwgPSBuZXcgY2MuTWF0ZXJpYWwoKTtcclxuXHJcbiAgICAgICAgbWF0ZXJpYWwubmFtZSA9IHRoaXMuX2dldEdsdGZYWE5hbWUoR2x0ZkFzc2V0S2luZC5NYXRlcmlhbCwgZ2xURk1hdGVyaWFsSW5kZXgpO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNDQ1XHJcbiAgICAgICAgbWF0ZXJpYWwuX2VmZmVjdEFzc2V0ID0gZWZmZWN0R2V0dGVyKCdkYjovL2ludGVybmFsL2VmZmVjdHMvdXRpbC9kY2MvaW1wb3J0ZWQtbWV0YWxsaWMtcm91Z2huZXNzLmVmZmVjdCcpO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNDQ1XHJcbiAgICAgICAgbWF0ZXJpYWwuX2RlZmluZXMgPSBbZGVmaW5lc107XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUUzI0NDVcclxuICAgICAgICBtYXRlcmlhbC5fcHJvcHMgPSBbcHJvcGVydGllc107XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUUzI0NDVcclxuICAgICAgICBtYXRlcmlhbC5fc3RhdGVzID0gW3N0YXRlc107XHJcbiAgICAgICAgc2V0VGVjaG5pcXVlSW5kZXgobWF0ZXJpYWwsIHRlY2gpO1xyXG4gICAgICAgIHJldHVybiBtYXRlcmlhbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jb252ZXJ0TWF5YVN0YW5kYXJkU3VyZmFjZShcclxuICAgICAgICBnbFRGTWF0ZXJpYWxJbmRleDogbnVtYmVyLFxyXG4gICAgICAgIGdsVEZBc3NldEZpbmRlcjogSUdsdGZBc3NldEZpbmRlcixcclxuICAgICAgICBlZmZlY3RHZXR0ZXI6IChuYW1lOiBzdHJpbmcpID0+IGNjLkVmZmVjdEFzc2V0LFxyXG4gICAgICAgIG1heWFTdGFuZGFyZFN1cmZhY2U6IE1heWFTdGFuZGFyZFN1cmZhY2UsXHJcbiAgICApOiBjYy5NYXRlcmlhbCB8IG51bGwge1xyXG4gICAgICAgIGNvbnN0IGRlZmluZXM6IFBhcnRpYWw8Q3JlYXRvckRDQ01ldGFsbGljUm91Z2huZXNzTWF0ZXJpYWxEZWZpbmVzPiA9IHt9O1xyXG4gICAgICAgIGNvbnN0IHByb3BlcnRpZXM6IFBhcnRpYWw8Q3JlYXRvckRDQ01ldGFsbGljUm91Z2huZXNzTWF0ZXJpYWxQcm9wZXJ0aWVzPiA9IHt9O1xyXG4gICAgICAgIGNvbnN0IHN0YXRlczogY2MuTWF0ZXJpYWxbJ19zdGF0ZXMnXVswXSA9IHtcclxuICAgICAgICAgICAgcmFzdGVyaXplclN0YXRlOiB7fSxcclxuICAgICAgICAgICAgYmxlbmRTdGF0ZTogeyB0YXJnZXRzOiBbe31dIH0sXHJcbiAgICAgICAgICAgIGRlcHRoU3RlbmNpbFN0YXRlOiB7fSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChtYXlhU3RhbmRhcmRTdXJmYWNlLmJhc2UudGV4dHVyZSAmJiAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMobWF5YVN0YW5kYXJkU3VyZmFjZS5iYXNlLnRleHR1cmUuaW5kZXgpKSB7XHJcbiAgICAgICAgICAgIGRlZmluZXNbJ1VTRV9XRUlHSFRfTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydiYXNlV2VpZ2h0TWFwJ10gPVxyXG4gICAgICAgICAgICAgICAgZ2xURkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgbWF5YVN0YW5kYXJkU3VyZmFjZS5iYXNlLnRleHR1cmUuaW5kZXgsIGNjLlRleHR1cmUyRCkgPz8gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm9wZXJ0aWVzWydhbGJlZG9TY2FsZSddID0gbWF5YVN0YW5kYXJkU3VyZmFjZS5iYXNlLnZhbHVlO1xyXG5cclxuICAgICAgICBpZiAobWF5YVN0YW5kYXJkU3VyZmFjZS5iYXNlQ29sb3IudGV4dHVyZSAmJiAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMobWF5YVN0YW5kYXJkU3VyZmFjZS5iYXNlQ29sb3IudGV4dHVyZS5pbmRleCkpIHtcclxuICAgICAgICAgICAgZGVmaW5lc1snVVNFX0FMQkVET19NQVAnXSA9IHRydWU7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ21haW5UZXh0dXJlJ10gPVxyXG4gICAgICAgICAgICAgICAgZ2xURkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgbWF5YVN0YW5kYXJkU3VyZmFjZS5iYXNlQ29sb3IudGV4dHVyZS5pbmRleCwgY2MuVGV4dHVyZTJEKSA/PyB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3BlcnRpZXNbJ21haW5Db2xvciddID0gdGhpcy5fbm9ybWFsaXplQXJyYXlUb0NvY29zQ29sb3IobWF5YVN0YW5kYXJkU3VyZmFjZS5iYXNlQ29sb3IudmFsdWUpWzFdO1xyXG5cclxuICAgICAgICBpZiAobWF5YVN0YW5kYXJkU3VyZmFjZS5tZXRhbG5lc3MudGV4dHVyZSAmJiAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMobWF5YVN0YW5kYXJkU3VyZmFjZS5tZXRhbG5lc3MudGV4dHVyZS5pbmRleCkpIHtcclxuICAgICAgICAgICAgZGVmaW5lc1snVVNFX01FVEFMTElDX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snbWV0YWxsaWNNYXAnXSA9XHJcbiAgICAgICAgICAgICAgICBnbFRGQXNzZXRGaW5kZXIuZmluZCgndGV4dHVyZXMnLCBtYXlhU3RhbmRhcmRTdXJmYWNlLm1ldGFsbmVzcy50ZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvcGVydGllc1snbWV0YWxsaWMnXSA9IG1heWFTdGFuZGFyZFN1cmZhY2UubWV0YWxuZXNzLnZhbHVlO1xyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIG1heWFTdGFuZGFyZFN1cmZhY2Uuc3BlY3VsYXJSb3VnaG5lc3MudGV4dHVyZSAmJlxyXG4gICAgICAgICAgICAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMobWF5YVN0YW5kYXJkU3VyZmFjZS5zcGVjdWxhclJvdWdobmVzcy50ZXh0dXJlLmluZGV4KVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBkZWZpbmVzWydVU0VfUk9VR0hORVNTX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgcHJvcGVydGllc1sncm91Z2huZXNzTWFwJ10gPVxyXG4gICAgICAgICAgICAgICAgZ2xURkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgbWF5YVN0YW5kYXJkU3VyZmFjZS5zcGVjdWxhclJvdWdobmVzcy50ZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvcGVydGllc1sncm91Z2huZXNzJ10gPSBtYXlhU3RhbmRhcmRTdXJmYWNlLnNwZWN1bGFyUm91Z2huZXNzLnZhbHVlO1xyXG4gICAgICAgIHByb3BlcnRpZXNbJ3NwZWN1bGFySW50ZW5zaXR5J10gPSBNYXRoLm1heCguLi5tYXlhU3RhbmRhcmRTdXJmYWNlLnNwZWN1bGFyQ29sb3IudmFsdWUpICogMC41O1xyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIG1heWFTdGFuZGFyZFN1cmZhY2Uubm9ybWFsQ2FtZXJhLnRleHR1cmUgIT09IHVuZGVmaW5lZCAmJlxyXG4gICAgICAgICAgICAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMobWF5YVN0YW5kYXJkU3VyZmFjZS5ub3JtYWxDYW1lcmEudGV4dHVyZS5pbmRleClcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgZGVmaW5lc1snVVNFX05PUk1BTF9NQVAnXSA9IHRydWU7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ25vcm1hbE1hcCddID1cclxuICAgICAgICAgICAgICAgIGdsVEZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIG1heWFTdGFuZGFyZFN1cmZhY2Uubm9ybWFsQ2FtZXJhLnRleHR1cmUuaW5kZXgsIGNjLlRleHR1cmUyRCkgPz8gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICBtYXlhU3RhbmRhcmRTdXJmYWNlLmVtaXNzaW9uLnRleHR1cmUgIT09IHVuZGVmaW5lZCAmJlxyXG4gICAgICAgICAgICAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMobWF5YVN0YW5kYXJkU3VyZmFjZS5lbWlzc2lvbi50ZXh0dXJlLmluZGV4KVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBkZWZpbmVzWydVU0VfRU1JU1NJVkVTQ0FMRV9NQVAnXSA9IHRydWU7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ2VtaXNzaXZlU2NhbGVNYXAnXSA9XHJcbiAgICAgICAgICAgICAgICBnbFRGQXNzZXRGaW5kZXIuZmluZCgndGV4dHVyZXMnLCBtYXlhU3RhbmRhcmRTdXJmYWNlLmVtaXNzaW9uLnRleHR1cmUuaW5kZXgsIGNjLlRleHR1cmUyRCkgPz8gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm9wZXJ0aWVzWydlbWlzc2l2ZVNjYWxlJ10gPSBtYXlhU3RhbmRhcmRTdXJmYWNlLmVtaXNzaW9uLnZhbHVlO1xyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIG1heWFTdGFuZGFyZFN1cmZhY2UuZW1pc3Npb25Db2xvci50ZXh0dXJlICE9PSB1bmRlZmluZWQgJiZcclxuICAgICAgICAgICAgIXRoaXMuZmJ4TWlzc2luZ0ltYWdlc0lkLmluY2x1ZGVzKG1heWFTdGFuZGFyZFN1cmZhY2UuZW1pc3Npb25Db2xvci50ZXh0dXJlLmluZGV4KVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgICBkZWZpbmVzWydVU0VfRU1JU1NJVkVfTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydlbWlzc2l2ZU1hcCddID1cclxuICAgICAgICAgICAgICAgIGdsVEZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIG1heWFTdGFuZGFyZFN1cmZhY2UuZW1pc3Npb25Db2xvci50ZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvcGVydGllc1snZW1pc3NpdmUnXSA9IHRoaXMuX25vcm1hbGl6ZUFycmF5VG9Db2Nvc0NvbG9yKG1heWFTdGFuZGFyZFN1cmZhY2UuZW1pc3Npb25Db2xvci52YWx1ZSlbMV07XHJcblxyXG4gICAgICAgIGlmIChtYXlhU3RhbmRhcmRTdXJmYWNlLm9wYWNpdHkudGV4dHVyZSAmJiAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMobWF5YVN0YW5kYXJkU3VyZmFjZS5vcGFjaXR5LnRleHR1cmUuaW5kZXgpKSB7XHJcbiAgICAgICAgICAgIGRlZmluZXNbJ1VTRV9BTFBIQV9URVNUJ10gPSBmYWxzZTtcclxuICAgICAgICAgICAgZGVmaW5lc1snVVNFX09QQUNJVFlfTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydhbHBoYVNvdXJjZU1hcCddID1cclxuICAgICAgICAgICAgICAgIGdsVEZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIG1heWFTdGFuZGFyZFN1cmZhY2Uub3BhY2l0eS50ZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICB9IGVsc2UgaWYgKE1hdGgubWF4KC4uLm1heWFTdGFuZGFyZFN1cmZhY2Uub3BhY2l0eS52YWx1ZSkgPCAwLjk5KSB7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ2FscGhhU291cmNlJ10gPSBNYXRoLm1heCguLi5tYXlhU3RhbmRhcmRTdXJmYWNlLm9wYWNpdHkudmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBtYXRlcmlhbCA9IG5ldyBjYy5NYXRlcmlhbCgpO1xyXG4gICAgICAgIG1hdGVyaWFsLm5hbWUgPSB0aGlzLl9nZXRHbHRmWFhOYW1lKEdsdGZBc3NldEtpbmQuTWF0ZXJpYWwsIGdsVEZNYXRlcmlhbEluZGV4KTtcclxuXHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUUzI0NDUoR2x0ZkFzc2V0S2luZC5NYXRlcmlhbFxyXG4gICAgICAgIG1hdGVyaWFsLl9lZmZlY3RBc3NldCA9IGVmZmVjdEdldHRlcignZGI6Ly9pbnRlcm5hbC9lZmZlY3RzL3V0aWwvZGNjL2ltcG9ydGVkLW1ldGFsbGljLXJvdWdobmVzcy5lZmZlY3QnKTtcclxuICAgICAgICAvLyBAdHMtaWdub3JlIFRTMjQ0NVxyXG4gICAgICAgIG1hdGVyaWFsLl9kZWZpbmVzID0gW2RlZmluZXNdO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNDQ1XHJcbiAgICAgICAgbWF0ZXJpYWwuX3Byb3BzID0gW3Byb3BlcnRpZXNdO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNDQ1XHJcbiAgICAgICAgbWF0ZXJpYWwuX3N0YXRlcyA9IFtzdGF0ZXNdO1xyXG4gICAgICAgIHJldHVybiBtYXRlcmlhbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jb252ZXJ0UGhvbmdNYXRlcmlhbChcclxuICAgICAgICBnbFRGTWF0ZXJpYWxJbmRleDogbnVtYmVyLFxyXG4gICAgICAgIGdsVEZBc3NldEZpbmRlcjogSUdsdGZBc3NldEZpbmRlcixcclxuICAgICAgICBlZmZlY3RHZXR0ZXI6IChuYW1lOiBzdHJpbmcpID0+IGNjLkVmZmVjdEFzc2V0LFxyXG4gICAgICAgIGFwcElEOiBBcHBJZCxcclxuICAgICAgICBwaG9uZ01hdDogRmJ4U3VyZmFjZUxhbWJlcnRPclBob25nUHJvcGVydGllcyxcclxuICAgICk6IGNjLk1hdGVyaWFsIHwgbnVsbCB7XHJcbiAgICAgICAgY29uc3QgZGVmaW5lczogUGFydGlhbDxDcmVhdG9yUGhvbmdNYXRlcmlhbERlZmluZXM+ID0ge307XHJcbiAgICAgICAgY29uc3QgcHJvcGVydGllczogUGFydGlhbDxDcmVhdG9yUGhvbmdNYXRlcmlhbFByb3BlcnRpZXM+ID0ge307XHJcbiAgICAgICAgY29uc3Qgc3RhdGVzOiBjYy5NYXRlcmlhbFsnX3N0YXRlcyddWzBdID0ge1xyXG4gICAgICAgICAgICByYXN0ZXJpemVyU3RhdGU6IHt9LFxyXG4gICAgICAgICAgICBibGVuZFN0YXRlOiB7IHRhcmdldHM6IFt7fV0gfSxcclxuICAgICAgICAgICAgZGVwdGhTdGVuY2lsU3RhdGU6IHt9LFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgbGV0IHRlY2ggPSAwO1xyXG4gICAgICAgIGxldCBhbHBoYVZhbHVlID0gMjU1O1xyXG4gICAgICAgIGlmIChwaG9uZ01hdC50cmFuc3BhcmVudENvbG9yLnRleHR1cmUgIT09IHVuZGVmaW5lZCAmJiAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMocGhvbmdNYXQudHJhbnNwYXJlbnRDb2xvci50ZXh0dXJlLmluZGV4KSkge1xyXG4gICAgICAgICAgICBkZWZpbmVzWydVU0VfQUxQSEFfVEVTVCddID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGRlZmluZXNbJ1VTRV9UUkFOU1BBUkVOQ1lfTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzWyd0cmFuc3BhcmVuY3lNYXAnXSA9XHJcbiAgICAgICAgICAgICAgICBnbFRGQXNzZXRGaW5kZXIuZmluZCgndGV4dHVyZXMnLCBwaG9uZ01hdC50cmFuc3BhcmVudENvbG9yLnRleHR1cmUuaW5kZXgsIGNjLlRleHR1cmUyRCkgPz8gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB0ZWNoID0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKHBob25nTWF0LnRyYW5zcGFyZW5jeUZhY3Rvcikge1xyXG4gICAgICAgICAgICBjb25zdCB0aGVDb2xvciA9XHJcbiAgICAgICAgICAgICAgICAocGhvbmdNYXQudHJhbnNwYXJlbnRDb2xvci52YWx1ZVswXSArIHBob25nTWF0LnRyYW5zcGFyZW50Q29sb3IudmFsdWVbMV0gKyBwaG9uZ01hdC50cmFuc3BhcmVudENvbG9yLnZhbHVlWzJdKSAvIDMuMDtcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgIShcclxuICAgICAgICAgICAgICAgICAgICBwaG9uZ01hdC50cmFuc3BhcmVudENvbG9yLnZhbHVlWzBdID09PSBwaG9uZ01hdC50cmFuc3BhcmVudENvbG9yLnZhbHVlWzFdICYmXHJcbiAgICAgICAgICAgICAgICAgICAgcGhvbmdNYXQudHJhbnNwYXJlbnRDb2xvci52YWx1ZVswXSA9PT0gcGhvbmdNYXQudHJhbnNwYXJlbnRDb2xvci52YWx1ZVsyXVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICAgICAgICBgTWF0ZXJpYWwgJHt0aGlzLl9nZXRHbHRmWFhOYW1lKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBHbHRmQXNzZXRLaW5kLk1hdGVyaWFsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbFRGTWF0ZXJpYWxJbmRleCxcclxuICAgICAgICAgICAgICAgICAgICApfSA6IFRyYW5zcGFyZW50IGNvbG9yIHByb3BlcnR5IGlzIG5vdCBzdXBwb3J0ZWQsIGF2ZXJhZ2UgdmFsdWUgd291bGQgYmUgdXNlZC5gLFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCB0cmFuc3BhcmVuY3lWYWx1ZSA9IHBob25nTWF0LnRyYW5zcGFyZW5jeUZhY3Rvci52YWx1ZSAqIHRoZUNvbG9yO1xyXG4gICAgICAgICAgICBpZiAodHJhbnNwYXJlbmN5VmFsdWUgIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRlY2ggPSAxO1xyXG4gICAgICAgICAgICAgICAgYWxwaGFWYWx1ZSA9IGxpbmVhclRvU3JnYjhCaXQoMSAtIHBob25nTWF0LnRyYW5zcGFyZW5jeUZhY3Rvci52YWx1ZSAqIHRoZUNvbG9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGhvbmdNYXQuZGlmZnVzZSkge1xyXG4gICAgICAgICAgICBjb25zdCBkaWZmdXNlQ29sb3IgPSB0aGlzLl9ub3JtYWxpemVBcnJheVRvQ29jb3NDb2xvcihwaG9uZ01hdC5kaWZmdXNlLnZhbHVlKTtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snYWxiZWRvU2NhbGUnXSA9IHBob25nTWF0LmRpZmZ1c2VGYWN0b3IudmFsdWUgKiBkaWZmdXNlQ29sb3JbMF07XHJcbiAgICAgICAgICAgIGRpZmZ1c2VDb2xvclsxXS5hID0gYWxwaGFWYWx1ZTtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snbWFpbkNvbG9yJ10gPSBkaWZmdXNlQ29sb3JbMV07IC8vdXNlIHNyZ2IgaW5wdXQgY29sb3JcclxuICAgICAgICAgICAgaWYgKHBob25nTWF0LmRpZmZ1c2UudGV4dHVyZSAhPT0gdW5kZWZpbmVkICYmICF0aGlzLmZieE1pc3NpbmdJbWFnZXNJZC5pbmNsdWRlcyhwaG9uZ01hdC5kaWZmdXNlLnRleHR1cmUuaW5kZXgpKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZpbmVzWydVU0VfQUxCRURPX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbJ21haW5UZXh0dXJlJ10gPSBnbFRGQXNzZXRGaW5kZXIuZmluZCgndGV4dHVyZXMnLCBwaG9uZ01hdC5kaWZmdXNlLnRleHR1cmUuaW5kZXgsIGNjLlRleHR1cmUyRCkgPz8gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwaG9uZ01hdC5zcGVjdWxhcikge1xyXG4gICAgICAgICAgICBjb25zdCBzcGVjdWxhckNvbG9yID0gdGhpcy5fbm9ybWFsaXplQXJyYXlUb0NvY29zQ29sb3IocGhvbmdNYXQuc3BlY3VsYXIudmFsdWUpO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydzcGVjdWxhckZhY3RvciddID0gcGhvbmdNYXQuc3BlY3VsYXJGYWN0b3IhLnZhbHVlICogc3BlY3VsYXJDb2xvclswXTtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snc3BlY3VsYXJDb2xvciddID0gc3BlY3VsYXJDb2xvclsxXTsgLy8gcGhvbmdfbWF0LnNwZWN1bGFyLnZhbHVlO1xyXG4gICAgICAgICAgICBpZiAocGhvbmdNYXQuc3BlY3VsYXIudGV4dHVyZSAhPT0gdW5kZWZpbmVkICYmICF0aGlzLmZieE1pc3NpbmdJbWFnZXNJZC5pbmNsdWRlcyhwaG9uZ01hdC5zcGVjdWxhci50ZXh0dXJlLmluZGV4KSkge1xyXG4gICAgICAgICAgICAgICAgZGVmaW5lc1snVVNFX1NQRUNVTEFSX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbJ3NwZWN1bGFyTWFwJ10gPSBnbFRGQXNzZXRGaW5kZXIuZmluZCgndGV4dHVyZXMnLCBwaG9uZ01hdC5zcGVjdWxhci50ZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGhvbmdNYXQubm9ybWFsTWFwPy50ZXh0dXJlICE9PSB1bmRlZmluZWQgJiYgIXRoaXMuZmJ4TWlzc2luZ0ltYWdlc0lkLmluY2x1ZGVzKHBob25nTWF0Lm5vcm1hbE1hcC50ZXh0dXJlLmluZGV4KSkge1xyXG4gICAgICAgICAgICBkZWZpbmVzWydVU0VfTk9STUFMX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snbm9ybWFsTWFwJ10gPSBnbFRGQXNzZXRGaW5kZXIuZmluZCgndGV4dHVyZXMnLCBwaG9uZ01hdC5ub3JtYWxNYXAudGV4dHVyZS5pbmRleCwgY2MuVGV4dHVyZTJEKSA/PyB1bmRlZmluZWQ7XHJcbiAgICAgICAgfSBlbHNlIGlmIChwaG9uZ01hdC5idW1wPy50ZXh0dXJlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZGVmaW5lc1snVVNFX05PUk1BTF9NQVAnXSA9IHRydWU7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ25vcm1hbE1hcCddID0gZ2xURkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgcGhvbmdNYXQuYnVtcC50ZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHBob25nTWF0LnNoaW5pbmVzcykge1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydzaGluaW5lc3NFeHBvbmVudCddID0gcGhvbmdNYXQuc2hpbmluZXNzLnZhbHVlO1xyXG4gICAgICAgICAgICBpZiAocGhvbmdNYXQuc2hpbmluZXNzLnRleHR1cmUgIT09IHVuZGVmaW5lZCAmJiAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMocGhvbmdNYXQuc2hpbmluZXNzLnRleHR1cmUuaW5kZXgpKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZpbmVzWydVU0VfU0hJTklORVNTX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbJ3NoaW5pbmVzc0V4cG9uZW50TWFwJ10gPVxyXG4gICAgICAgICAgICAgICAgICAgIGdsVEZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIHBob25nTWF0LnNoaW5pbmVzcy50ZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGhvbmdNYXQuZW1pc3NpdmUpIHtcclxuICAgICAgICAgICAgY29uc3QgZW1pc3NpdmVDb2xvciA9IHRoaXMuX25vcm1hbGl6ZUFycmF5VG9Db2Nvc0NvbG9yKHBob25nTWF0LmVtaXNzaXZlLnZhbHVlKTtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snZW1pc3NpdmVTY2FsZSddID0gcGhvbmdNYXQuZW1pc3NpdmVGYWN0b3IudmFsdWUgKiBlbWlzc2l2ZUNvbG9yWzBdO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydlbWlzc2l2ZSddID0gZW1pc3NpdmVDb2xvclsxXTtcclxuICAgICAgICAgICAgaWYgKHBob25nTWF0LmVtaXNzaXZlLnRleHR1cmUgIT09IHVuZGVmaW5lZCAmJiAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMocGhvbmdNYXQuZW1pc3NpdmUudGV4dHVyZS5pbmRleCkpIHtcclxuICAgICAgICAgICAgICAgIGRlZmluZXNbJ1VTRV9FTUlTU0lWRV9NQVAnXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzWydlbWlzc2l2ZU1hcCddID0gZ2xURkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgcGhvbmdNYXQuZW1pc3NpdmUudGV4dHVyZS5pbmRleCwgY2MuVGV4dHVyZTJEKSA/PyB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBob25nTWF0LmVtaXNzaXZlRmFjdG9yLnRleHR1cmUgIT09IHVuZGVmaW5lZCAmJiAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMocGhvbmdNYXQuZW1pc3NpdmVGYWN0b3IudGV4dHVyZS5pbmRleCkpIHtcclxuICAgICAgICAgICAgICAgIGRlZmluZXNbJ1VTRV9FTUlTU0lWRVNDQUxFX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbJ2VtaXNzaXZlU2NhbGVNYXAnXSA9XHJcbiAgICAgICAgICAgICAgICAgICAgZ2xURkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgcGhvbmdNYXQuZW1pc3NpdmVGYWN0b3IudGV4dHVyZS5pbmRleCwgY2MuVGV4dHVyZTJEKSA/PyB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRlZmluZXNbJ0RDQ19BUFBfTkFNRSddID0gYXBwSUQ7XHJcbiAgICAgICAgY29uc3QgbWF0ZXJpYWwgPSBuZXcgY2MuTWF0ZXJpYWwoKTtcclxuICAgICAgICBtYXRlcmlhbC5uYW1lID0gdGhpcy5fZ2V0R2x0ZlhYTmFtZShHbHRmQXNzZXRLaW5kLk1hdGVyaWFsLCBnbFRGTWF0ZXJpYWxJbmRleCk7XHJcbiAgICAgICAgc2V0VGVjaG5pcXVlSW5kZXgobWF0ZXJpYWwsIHRlY2gpO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNDQ1XHJcbiAgICAgICAgbWF0ZXJpYWwuX2VmZmVjdEFzc2V0ID0gZWZmZWN0R2V0dGVyKCdkYjovL2ludGVybmFsL2VmZmVjdHMvdXRpbC9kY2MvaW1wb3J0ZWQtc3BlY3VsYXItZ2xvc3NpbmVzcy5lZmZlY3QnKTtcclxuICAgICAgICAvLyBAdHMtaWdub3JlIFRTMjQ0NVxyXG4gICAgICAgIG1hdGVyaWFsLl9kZWZpbmVzID0gW2RlZmluZXNdO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNDQ1XHJcbiAgICAgICAgbWF0ZXJpYWwuX3Byb3BzID0gW3Byb3BlcnRpZXNdO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNDQ1XHJcbiAgICAgICAgbWF0ZXJpYWwuX3N0YXRlcyA9IFtzdGF0ZXNdO1xyXG4gICAgICAgIHJldHVybiBtYXRlcmlhbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jb252ZXJ0QmxlbmRlclBCUk1hdGVyaWFsKFxyXG4gICAgICAgIGdsVEZNYXRlcmlhbDogTWF0ZXJpYWwsXHJcbiAgICAgICAgZ2xURk1hdGVyaWFsSW5kZXg6IG51bWJlcixcclxuICAgICAgICBnbFRGQXNzZXRGaW5kZXI6IElHbHRmQXNzZXRGaW5kZXIsXHJcbiAgICAgICAgZWZmZWN0R2V0dGVyOiAobmFtZTogc3RyaW5nKSA9PiBjYy5FZmZlY3RBc3NldCxcclxuICAgICk6IGNjLk1hdGVyaWFsIHwgbnVsbCB7XHJcbiAgICAgICAgY29uc3QgZGVmaW5lczogUGFydGlhbDxDcmVhdG9yUGhvbmdNYXRlcmlhbERlZmluZXM+ID0ge307XHJcbiAgICAgICAgY29uc3QgcHJvcGVydGllczogUGFydGlhbDxDcmVhdG9yUGhvbmdNYXRlcmlhbFByb3BlcnRpZXM+ID0ge307XHJcbiAgICAgICAgY29uc3Qgc3RhdGVzOiBjYy5NYXRlcmlhbFsnX3N0YXRlcyddWzBdID0ge1xyXG4gICAgICAgICAgICByYXN0ZXJpemVyU3RhdGU6IHt9LFxyXG4gICAgICAgICAgICBibGVuZFN0YXRlOiB7IHRhcmdldHM6IFt7fV0gfSxcclxuICAgICAgICAgICAgZGVwdGhTdGVuY2lsU3RhdGU6IHt9LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGNvbnN0IHBob25nTWF0ZXJpYWxDb250YWluZXI6IEZieFN1cmZhY2VQaG9uZ1Byb3BlcnRpZXMgPSBnbFRGTWF0ZXJpYWwuZXh0cmFzWydGQlgtZ2xURi1jb252J10ucmF3LnByb3BlcnRpZXM7XHJcbiAgICAgICAgZGVmaW5lc1snRENDX0FQUF9OQU1FJ10gPSAyO1xyXG4gICAgICAgIGRlZmluZXNbJ0hBU19FWFBPUlRFRF9NRVRBTExJQyddID0gdHJ1ZTtcclxuICAgICAgICAvLyBiYXNlIGNvbG9yXHJcbiAgICAgICAgaWYgKHBob25nTWF0ZXJpYWxDb250YWluZXIuZGlmZnVzZSkge1xyXG4gICAgICAgICAgICBjb25zdCBkaWZmdXNlQ29sb3IgPSB0aGlzLl9ub3JtYWxpemVBcnJheVRvQ29jb3NDb2xvcihwaG9uZ01hdGVyaWFsQ29udGFpbmVyLmRpZmZ1c2UudmFsdWUpO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzWydtYWluQ29sb3InXSA9IGRpZmZ1c2VDb2xvclsxXTsgLy8gcGhvbmdfbWF0LmRpZmZ1c2UudmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIHBob25nTWF0ZXJpYWxDb250YWluZXIuZGlmZnVzZS50ZXh0dXJlICE9PSB1bmRlZmluZWQgJiZcclxuICAgICAgICAgICAgICAgICF0aGlzLmZieE1pc3NpbmdJbWFnZXNJZC5pbmNsdWRlcyhwaG9uZ01hdGVyaWFsQ29udGFpbmVyLmRpZmZ1c2UudGV4dHVyZS5pbmRleClcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZpbmVzWydVU0VfQUxCRURPX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbJ21haW5UZXh0dXJlJ10gPVxyXG4gICAgICAgICAgICAgICAgICAgIGdsVEZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIHBob25nTWF0ZXJpYWxDb250YWluZXIuZGlmZnVzZS50ZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBub3JtYWxcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIHBob25nTWF0ZXJpYWxDb250YWluZXIuYnVtcD8udGV4dHVyZSAhPT0gdW5kZWZpbmVkICYmXHJcbiAgICAgICAgICAgICF0aGlzLmZieE1pc3NpbmdJbWFnZXNJZC5pbmNsdWRlcyhwaG9uZ01hdGVyaWFsQ29udGFpbmVyLmJ1bXAudGV4dHVyZS5pbmRleClcclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgZGVmaW5lc1snVVNFX05PUk1BTF9NQVAnXSA9IHRydWU7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ25vcm1hbE1hcCddID1cclxuICAgICAgICAgICAgICAgIGdsVEZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIHBob25nTWF0ZXJpYWxDb250YWluZXIuYnVtcC50ZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcm91Z2huZXNzXHJcbiAgICAgICAgaWYgKHBob25nTWF0ZXJpYWxDb250YWluZXIuc2hpbmluZXNzKSB7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ3NoaW5pbmVzc0V4cG9uZW50J10gPSBwaG9uZ01hdGVyaWFsQ29udGFpbmVyLnNoaW5pbmVzcy52YWx1ZTtcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgcGhvbmdNYXRlcmlhbENvbnRhaW5lci5zaGluaW5lc3MudGV4dHVyZSAhPT0gdW5kZWZpbmVkICYmXHJcbiAgICAgICAgICAgICAgICAhdGhpcy5mYnhNaXNzaW5nSW1hZ2VzSWQuaW5jbHVkZXMocGhvbmdNYXRlcmlhbENvbnRhaW5lci5zaGluaW5lc3MudGV4dHVyZS5pbmRleClcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAvLyByb3VnaG5lc3MgbWFwXHJcbiAgICAgICAgICAgICAgICBkZWZpbmVzWydVU0VfU0hJTklORVNTX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbJ3NoaW5pbmVzc0V4cG9uZW50TWFwJ10gPVxyXG4gICAgICAgICAgICAgICAgICAgIGdsVEZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIHBob25nTWF0ZXJpYWxDb250YWluZXIuc2hpbmluZXNzLnRleHR1cmUuaW5kZXgsIGNjLlRleHR1cmUyRCkgPz8gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwaG9uZ01hdGVyaWFsQ29udGFpbmVyLmVtaXNzaXZlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVtaXNzaXZlQ29sb3IgPSB0aGlzLl9ub3JtYWxpemVBcnJheVRvQ29jb3NDb2xvcihwaG9uZ01hdGVyaWFsQ29udGFpbmVyLmVtaXNzaXZlLnZhbHVlKTtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snZW1pc3NpdmVTY2FsZSddID0gcGhvbmdNYXRlcmlhbENvbnRhaW5lci5lbWlzc2l2ZUZhY3Rvci52YWx1ZSAqIGVtaXNzaXZlQ29sb3JbMF07XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ2VtaXNzaXZlJ10gPSBlbWlzc2l2ZUNvbG9yWzFdO1xyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICBwaG9uZ01hdGVyaWFsQ29udGFpbmVyLmVtaXNzaXZlLnRleHR1cmUgIT09IHVuZGVmaW5lZCAmJlxyXG4gICAgICAgICAgICAgICAgIXRoaXMuZmJ4TWlzc2luZ0ltYWdlc0lkLmluY2x1ZGVzKHBob25nTWF0ZXJpYWxDb250YWluZXIuZW1pc3NpdmUudGV4dHVyZS5pbmRleClcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZpbmVzWydVU0VfRU1JU1NJVkVfTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllc1snZW1pc3NpdmVNYXAnXSA9XHJcbiAgICAgICAgICAgICAgICAgICAgZ2xURkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgcGhvbmdNYXRlcmlhbENvbnRhaW5lci5lbWlzc2l2ZS50ZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICBwaG9uZ01hdGVyaWFsQ29udGFpbmVyLmVtaXNzaXZlRmFjdG9yLnRleHR1cmUgIT09IHVuZGVmaW5lZCAmJlxyXG4gICAgICAgICAgICAgICAgIXRoaXMuZmJ4TWlzc2luZ0ltYWdlc0lkLmluY2x1ZGVzKHBob25nTWF0ZXJpYWxDb250YWluZXIuZW1pc3NpdmVGYWN0b3IudGV4dHVyZS5pbmRleClcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZpbmVzWydVU0VfRU1JU1NJVkVTQ0FMRV9NQVAnXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzWydlbWlzc2l2ZVNjYWxlTWFwJ10gPVxyXG4gICAgICAgICAgICAgICAgICAgIGdsVEZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIHBob25nTWF0ZXJpYWxDb250YWluZXIuZW1pc3NpdmVGYWN0b3IudGV4dHVyZS5pbmRleCwgY2MuVGV4dHVyZTJEKSA/PyB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gbWV0YWxsaWNcclxuICAgICAgICBpZiAocGhvbmdNYXRlcmlhbENvbnRhaW5lci5yZWZsZWN0aW9uRmFjdG9yKSB7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ21ldGFsbGljJ10gPSBwaG9uZ01hdGVyaWFsQ29udGFpbmVyLnJlZmxlY3Rpb25GYWN0b3IudmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIHBob25nTWF0ZXJpYWxDb250YWluZXIucmVmbGVjdGlvbkZhY3Rvci50ZXh0dXJlICE9PSB1bmRlZmluZWQgJiZcclxuICAgICAgICAgICAgICAgICF0aGlzLmZieE1pc3NpbmdJbWFnZXNJZC5pbmNsdWRlcyhwaG9uZ01hdGVyaWFsQ29udGFpbmVyLnJlZmxlY3Rpb25GYWN0b3IudGV4dHVyZS5pbmRleClcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICBkZWZpbmVzWydVU0VfTUVUQUxMSUNfTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllc1snbWV0YWxsaWNNYXAnXSA9XHJcbiAgICAgICAgICAgICAgICAgICAgZ2xURkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgcGhvbmdNYXRlcmlhbENvbnRhaW5lci5yZWZsZWN0aW9uRmFjdG9yLnRleHR1cmUuaW5kZXgsIGNjLlRleHR1cmUyRCkgPz8gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNwZWN1bGFyXHJcbiAgICAgICAgaWYgKHBob25nTWF0ZXJpYWxDb250YWluZXIuc3BlY3VsYXJGYWN0b3IpIHtcclxuICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgcGhvbmdNYXRlcmlhbENvbnRhaW5lci5zcGVjdWxhckZhY3Rvci50ZXh0dXJlICE9PSB1bmRlZmluZWQgJiZcclxuICAgICAgICAgICAgICAgICF0aGlzLmZieE1pc3NpbmdJbWFnZXNJZC5pbmNsdWRlcyhwaG9uZ01hdGVyaWFsQ29udGFpbmVyLnNwZWN1bGFyRmFjdG9yLnRleHR1cmUuaW5kZXgpXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgZGVmaW5lc1snVVNFX1NQRUNVTEFSX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbJ3NwZWN1bGFyTWFwJ10gPVxyXG4gICAgICAgICAgICAgICAgICAgIGdsVEZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIHBob25nTWF0ZXJpYWxDb250YWluZXIuc3BlY3VsYXJGYWN0b3IudGV4dHVyZS5pbmRleCwgY2MuVGV4dHVyZTJEKSA/PyB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzWydzcGVjdWxhckZhY3RvciddID0gcGhvbmdNYXRlcmlhbENvbnRhaW5lci5zcGVjdWxhckZhY3Rvci52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHBob25nTWF0ZXJpYWxDb250YWluZXIudHJhbnNwYXJlbmN5RmFjdG9yKSB7XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIHBob25nTWF0ZXJpYWxDb250YWluZXIudHJhbnNwYXJlbmN5RmFjdG9yLnRleHR1cmUgIT09IHVuZGVmaW5lZCAmJlxyXG4gICAgICAgICAgICAgICAgIXRoaXMuZmJ4TWlzc2luZ0ltYWdlc0lkLmluY2x1ZGVzKHBob25nTWF0ZXJpYWxDb250YWluZXIudHJhbnNwYXJlbmN5RmFjdG9yLnRleHR1cmUuaW5kZXgpXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgZGVmaW5lc1snVVNFX0FMUEhBX1RFU1QnXSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZGVmaW5lc1snVVNFX1RSQU5TUEFSRU5DWV9NQVAnXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzWyd0cmFuc3BhcmVuY3lNYXAnXSA9XHJcbiAgICAgICAgICAgICAgICAgICAgZ2xURkFzc2V0RmluZGVyLmZpbmQoJ3RleHR1cmVzJywgcGhvbmdNYXRlcmlhbENvbnRhaW5lci50cmFuc3BhcmVuY3lGYWN0b3IudGV4dHVyZS5pbmRleCwgY2MuVGV4dHVyZTJEKSA/PyB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzWyd0cmFuc3BhcmVuY3lGYWN0b3InXSA9IHBob25nTWF0ZXJpYWxDb250YWluZXIudHJhbnNwYXJlbmN5RmFjdG9yLnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG1hdGVyaWFsID0gbmV3IGNjLk1hdGVyaWFsKCk7XHJcbiAgICAgICAgbWF0ZXJpYWwubmFtZSA9IHRoaXMuX2dldEdsdGZYWE5hbWUoR2x0ZkFzc2V0S2luZC5NYXRlcmlhbCwgZ2xURk1hdGVyaWFsSW5kZXgpO1xyXG5cclxuICAgICAgICAvLyBAdHMtaWdub3JlIFRTMjQ0NVxyXG4gICAgICAgIG1hdGVyaWFsLl9lZmZlY3RBc3NldCA9IGVmZmVjdEdldHRlcignZGI6Ly9pbnRlcm5hbC9lZmZlY3RzL3V0aWwvZGNjL2ltcG9ydGVkLXNwZWN1bGFyLWdsb3NzaW5lc3MuZWZmZWN0Jyk7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUUzI0NDVcclxuICAgICAgICBtYXRlcmlhbC5fZGVmaW5lcyA9IFtkZWZpbmVzXTtcclxuICAgICAgICAvLyBAdHMtaWdub3JlIFRTMjQ0NVxyXG4gICAgICAgIG1hdGVyaWFsLl9wcm9wcyA9IFtwcm9wZXJ0aWVzXTtcclxuICAgICAgICAvLyBAdHMtaWdub3JlIFRTMjQ0NVxyXG4gICAgICAgIG1hdGVyaWFsLl9zdGF0ZXMgPSBbc3RhdGVzXTtcclxuICAgICAgICByZXR1cm4gbWF0ZXJpYWw7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIF9jb252ZXJ0R2x0ZlBiclNwZWN1bGFyR2xvc3NpbmVzcyhcclxuICAgICAgICBnbFRGTWF0ZXJpYWw6IE1hdGVyaWFsLFxyXG4gICAgICAgIGdsVEZNYXRlcmlhbEluZGV4OiBudW1iZXIsXHJcbiAgICAgICAgZ2xURkFzc2V0RmluZGVyOiBJR2x0ZkFzc2V0RmluZGVyLFxyXG4gICAgICAgIGVmZmVjdEdldHRlcjogKG5hbWU6IHN0cmluZykgPT4gY2MuRWZmZWN0QXNzZXQsXHJcbiAgICAgICAgZGVwdGhXcml0ZUluQWxwaGFNb2RlQmxlbmQ6IGJvb2xlYW4sXHJcbiAgICApOiBjYy5NYXRlcmlhbCB8IG51bGwge1xyXG4gICAgICAgIGNvbnN0IGRlZmluZXM6IFBhcnRpYWw8Q3JlYXRvclBob25nTWF0ZXJpYWxEZWZpbmVzPiA9IHt9O1xyXG4gICAgICAgIGNvbnN0IHByb3BlcnRpZXM6IFBhcnRpYWw8Q3JlYXRvclBob25nTWF0ZXJpYWxQcm9wZXJ0aWVzPiA9IHt9O1xyXG4gICAgICAgIGNvbnN0IHN0YXRlczogY2MuTWF0ZXJpYWxbJ19zdGF0ZXMnXVswXSA9IHtcclxuICAgICAgICAgICAgcmFzdGVyaXplclN0YXRlOiB7fSxcclxuICAgICAgICAgICAgYmxlbmRTdGF0ZTogeyB0YXJnZXRzOiBbe31dIH0sXHJcbiAgICAgICAgICAgIGRlcHRoU3RlbmNpbFN0YXRlOiB7fSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb25zdCBnbHRmU3BlY3VsYXJHbG9zc2luZXNzID0gZ2xURk1hdGVyaWFsLmV4dGVuc2lvbnMuS0hSX21hdGVyaWFsc19wYnJTcGVjdWxhckdsb3NzaW5lc3M7XHJcbiAgICAgICAgZGVmaW5lc1snRENDX0FQUF9OQU1FJ10gPSA0O1xyXG4gICAgICAgIC8vIGJhc2UgY29sb3JcclxuICAgICAgICBpZiAoZ2x0ZlNwZWN1bGFyR2xvc3NpbmVzcy5kaWZmdXNlRmFjdG9yKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRpZmZ1c2VDb2xvciA9IHRoaXMuX25vcm1hbGl6ZUFycmF5VG9Db2Nvc0NvbG9yKGdsdGZTcGVjdWxhckdsb3NzaW5lc3MuZGlmZnVzZUZhY3Rvcik7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ21haW5Db2xvciddID0gZGlmZnVzZUNvbG9yWzFdOyAvLyBwaG9uZ19tYXQuZGlmZnVzZS52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGdsdGZTcGVjdWxhckdsb3NzaW5lc3MuZGlmZnVzZVRleHR1cmUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBkZWZpbmVzWydVU0VfQUxCRURPX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snbWFpblRleHR1cmUnXSA9XHJcbiAgICAgICAgICAgICAgICBnbFRGQXNzZXRGaW5kZXIuZmluZCgndGV4dHVyZXMnLCBnbHRmU3BlY3VsYXJHbG9zc2luZXNzLmRpZmZ1c2VUZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpID8/IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc3BlY3VsYXJcclxuICAgICAgICBpZiAoZ2x0ZlNwZWN1bGFyR2xvc3NpbmVzcy5zcGVjdWxhckZhY3Rvcikge1xyXG4gICAgICAgICAgICBjb25zdCBzcGVjdWxhckNvbG9yID0gdGhpcy5fbm9ybWFsaXplQXJyYXlUb0NvY29zQ29sb3IoZ2x0ZlNwZWN1bGFyR2xvc3NpbmVzcy5zcGVjdWxhckZhY3Rvcik7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ3NwZWN1bGFyQ29sb3InXSA9IHNwZWN1bGFyQ29sb3JbMV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBnbG9zc2luZXNzXHJcbiAgICAgICAgaWYgKGdsdGZTcGVjdWxhckdsb3NzaW5lc3MuZ2xvc3NpbmVzc0ZhY3Rvcikge1xyXG4gICAgICAgICAgICBkZWZpbmVzWydIQVNfRVhQT1JURURfR0xPU1NJTkVTUyddID0gdHJ1ZTtcclxuICAgICAgICAgICAgcHJvcGVydGllc1snZ2xvc3NpbmVzcyddID0gZ2x0ZlNwZWN1bGFyR2xvc3NpbmVzcy5nbG9zc2luZXNzRmFjdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGdsdGZTcGVjdWxhckdsb3NzaW5lc3Muc3BlY3VsYXJHbG9zc2luZXNzVGV4dHVyZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGRlZmluZXNbJ0hBU19FWFBPUlRFRF9HTE9TU0lORVNTJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICBkZWZpbmVzWydVU0VfU1BFQ1VMQVJfR0xPU1NJTkVTU19NQVAnXSA9IHRydWU7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ3NwZWN1bGFyR2xvc3NpbmVzc01hcCddID1cclxuICAgICAgICAgICAgICAgIGdsVEZBc3NldEZpbmRlci5maW5kKCd0ZXh0dXJlcycsIGdsdGZTcGVjdWxhckdsb3NzaW5lc3Muc3BlY3VsYXJHbG9zc2luZXNzVGV4dHVyZS5pbmRleCwgY2MuVGV4dHVyZTJEKSA/PyB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZ2xURk1hdGVyaWFsLm5vcm1hbFRleHR1cmUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjb25zdCBwYnJOb3JtYWxUZXh0dXJlID0gZ2xURk1hdGVyaWFsLm5vcm1hbFRleHR1cmU7XHJcbiAgICAgICAgICAgIGlmIChwYnJOb3JtYWxUZXh0dXJlLmluZGV4ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGRlZmluZXNbJ1VTRV9OT1JNQUxfTUFQJ10gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllc1snbm9ybWFsTWFwJ10gPSBnbFRGQXNzZXRGaW5kZXIuZmluZCgndGV4dHVyZXMnLCBwYnJOb3JtYWxUZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChnbFRGTWF0ZXJpYWwuZW1pc3NpdmVUZXh0dXJlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZGVmaW5lc1snVVNFX0VNSVNTSVZFX01BUCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKGdsVEZNYXRlcmlhbC5lbWlzc2l2ZVRleHR1cmUudGV4Q29vcmQpIHtcclxuICAgICAgICAgICAgICAgIGRlZmluZXNbJ0VNSVNTSVZFX1VWJ10gPSAndl91djEnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ2VtaXNzaXZlTWFwJ10gPSBnbFRGQXNzZXRGaW5kZXIuZmluZCgndGV4dHVyZXMnLCBnbFRGTWF0ZXJpYWwuZW1pc3NpdmVUZXh0dXJlLmluZGV4LCBjYy5UZXh0dXJlMkQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGdsVEZNYXRlcmlhbC5lbWlzc2l2ZUZhY3RvciAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHYgPSBnbFRGTWF0ZXJpYWwuZW1pc3NpdmVGYWN0b3I7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXNbJ2VtaXNzaXZlJ10gPSB0aGlzLl9ub3JtYWxpemVBcnJheVRvQ29jb3NDb2xvcih2KVsxXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChnbFRGTWF0ZXJpYWwuZG91YmxlU2lkZWQpIHtcclxuICAgICAgICAgICAgc3RhdGVzLnJhc3Rlcml6ZXJTdGF0ZSEuY3VsbE1vZGUgPSBnZnguQ3VsbE1vZGUuTk9ORTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3dpdGNoIChnbFRGTWF0ZXJpYWwuYWxwaGFNb2RlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ0JMRU5EJzoge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYmxlbmRTdGF0ZSA9IHN0YXRlcy5ibGVuZFN0YXRlIS50YXJnZXRzIVswXTtcclxuICAgICAgICAgICAgICAgIGJsZW5kU3RhdGUuYmxlbmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYmxlbmRTdGF0ZS5ibGVuZFNyYyA9IGdmeC5CbGVuZEZhY3Rvci5TUkNfQUxQSEE7XHJcbiAgICAgICAgICAgICAgICBibGVuZFN0YXRlLmJsZW5kRHN0ID0gZ2Z4LkJsZW5kRmFjdG9yLk9ORV9NSU5VU19TUkNfQUxQSEE7XHJcbiAgICAgICAgICAgICAgICBibGVuZFN0YXRlLmJsZW5kRHN0QWxwaGEgPSBnZnguQmxlbmRGYWN0b3IuT05FX01JTlVTX1NSQ19BTFBIQTtcclxuICAgICAgICAgICAgICAgIHN0YXRlcy5kZXB0aFN0ZW5jaWxTdGF0ZSEuZGVwdGhXcml0ZSA9IGRlcHRoV3JpdGVJbkFscGhhTW9kZUJsZW5kO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAnTUFTSyc6IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFscGhhQ3V0b2ZmID0gZ2xURk1hdGVyaWFsLmFscGhhQ3V0b2ZmID09PSB1bmRlZmluZWQgPyAwLjUgOiBnbFRGTWF0ZXJpYWwuYWxwaGFDdXRvZmY7XHJcbiAgICAgICAgICAgICAgICBkZWZpbmVzWydVU0VfQUxQSEFfVEVTVCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbJ2FscGhhVGhyZXNob2xkJ10gPSBhbHBoYUN1dG9mZjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ09QQVFVRSc6XHJcbiAgICAgICAgICAgIGNhc2UgdW5kZWZpbmVkOlxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sb2dnZXIoR2x0ZkNvbnZlcnRlci5Mb2dMZXZlbC5XYXJuaW5nLCBHbHRmQ29udmVydGVyLkNvbnZlcnRlckVycm9yLlVuc3VwcG9ydGVkQWxwaGFNb2RlLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogZ2xURk1hdGVyaWFsLmFscGhhTW9kZSxcclxuICAgICAgICAgICAgICAgICAgICBtYXRlcmlhbDogZ2xURk1hdGVyaWFsSW5kZXgsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbWF0ZXJpYWwgPSBuZXcgY2MuTWF0ZXJpYWwoKTtcclxuICAgICAgICBtYXRlcmlhbC5uYW1lID0gdGhpcy5fZ2V0R2x0ZlhYTmFtZShHbHRmQXNzZXRLaW5kLk1hdGVyaWFsLCBnbFRGTWF0ZXJpYWxJbmRleCk7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUUzI0NDVcclxuICAgICAgICBtYXRlcmlhbC5fZWZmZWN0QXNzZXQgPSBlZmZlY3RHZXR0ZXIoJ2RiOi8vaW50ZXJuYWwvZWZmZWN0cy91dGlsL2RjYy9pbXBvcnRlZC1zcGVjdWxhci1nbG9zc2luZXNzLmVmZmVjdCcpO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyNDQ1XHJcbiAgICAgICAgbWF0ZXJpYWwuX2RlZmluZXMgPSBbZGVmaW5lc107XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUUzI0NDVcclxuICAgICAgICBtYXRlcmlhbC5fcHJvcHMgPSBbcHJvcGVydGllc107XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZSBUUzI0NDVcclxuICAgICAgICBtYXRlcmlhbC5fc3RhdGVzID0gW3N0YXRlc107XHJcbiAgICAgICAgcmV0dXJuIG1hdGVyaWFsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2toclRleHR1cmVUcmFuc2Zvcm1Ub1RpbGluZyhraHJUZXh0dXJlVHJhbnNmb3JtOiB7IHNjYWxlPzogW251bWJlciwgbnVtYmVyXTsgb2Zmc2V0PzogW251bWJlciwgbnVtYmVyXSB9KSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IFZlYzQoMSwgMSwgMCwgMCk7XHJcbiAgICAgICAgaWYgKGtoclRleHR1cmVUcmFuc2Zvcm0uc2NhbGUpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnggPSBraHJUZXh0dXJlVHJhbnNmb3JtLnNjYWxlWzBdO1xyXG4gICAgICAgICAgICByZXN1bHQueSA9IGtoclRleHR1cmVUcmFuc2Zvcm0uc2NhbGVbMV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChraHJUZXh0dXJlVHJhbnNmb3JtLm9mZnNldCkge1xyXG4gICAgICAgICAgICByZXN1bHQueiA9IGtoclRleHR1cmVUcmFuc2Zvcm0ub2Zmc2V0WzBdO1xyXG4gICAgICAgICAgICByZXN1bHQudyA9IGtoclRleHR1cmVUcmFuc2Zvcm0ub2Zmc2V0WzFdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59XHJcblxyXG5pbnRlcmZhY2UgS0hSVGV4dHVyZVRyYW5zZm9ybUV4dGVuc2lvbiB7XHJcbiAgICBzY2FsZT86IFtudW1iZXIsIG51bWJlcl07XHJcbiAgICBvZmZzZXQ/OiBbbnVtYmVyLCBudW1iZXJdO1xyXG59XHJcblxyXG5mdW5jdGlvbiBoYXNLSFJUZXh0dXJlVHJhbnNmb3JtRXh0ZW5zaW9uKG9iajogeyBleHRlbnNpb25zPzogdW5rbm93biB9KTogb2JqIGlzIHtcclxuICAgIGV4dGVuc2lvbnM6IHtcclxuICAgICAgICBLSFJfdGV4dHVyZV90cmFuc2Zvcm06IEtIUlRleHR1cmVUcmFuc2Zvcm1FeHRlbnNpb247XHJcbiAgICB9O1xyXG59IHtcclxuICAgIGNvbnN0IHsgZXh0ZW5zaW9ucyB9ID0gb2JqO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICB0eXBlb2YgZXh0ZW5zaW9ucyA9PT0gJ29iamVjdCcgJiZcclxuICAgICAgICBleHRlbnNpb25zICE9PSBudWxsICYmXHJcbiAgICAgICAgdHlwZW9mIChleHRlbnNpb25zIGFzIHsgS0hSX3RleHR1cmVfdHJhbnNmb3JtPzogdW5rbm93biB9KVsnS0hSX3RleHR1cmVfdHJhbnNmb3JtJ10gPT09ICdvYmplY3QnXHJcbiAgICApO1xyXG59XHJcbmZ1bmN0aW9uIHNldFRlY2huaXF1ZUluZGV4KG1hdGVyaWFsOiBjYy5NYXRlcmlhbCwgaW5kZXg6IG51bWJlcikge1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPOiBmaXggdHlwZVxyXG4gICAgbWF0ZXJpYWwuX3RlY2hJZHggPSBpbmRleDtcclxufVxyXG5leHBvcnQgbmFtZXNwYWNlIEdsdGZDb252ZXJ0ZXIge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBPcHRpb25zIHtcclxuICAgICAgICBsb2dnZXI/OiBMb2dnZXI7XHJcbiAgICAgICAgdXNlckRhdGE/OiBPbWl0PEdsVEZVc2VyRGF0YSwgJ2ltYWdlTWV0YXMnPjtcclxuICAgICAgICBwcm9tb3RlU2luZ2xlUm9vdE5vZGU/OiBib29sZWFuO1xyXG4gICAgICAgIGdlbmVyYXRlTGlnaHRtYXBVVk5vZGU/OiBib29sZWFuO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCB0eXBlIExvZ2dlciA9IDxFcnJvclR5cGUgZXh0ZW5kcyBDb252ZXJ0ZXJFcnJvcj4oXHJcbiAgICAgICAgbGV2ZWw6IExvZ0xldmVsLFxyXG4gICAgICAgIGVycm9yOiBFcnJvclR5cGUsXHJcbiAgICAgICAgYXJnczogQ29udmVydGVyRXJyb3JBcmd1bWVudEZvcm1hdFtFcnJvclR5cGVdLFxyXG4gICAgKSA9PiB2b2lkO1xyXG5cclxuICAgIGV4cG9ydCBlbnVtIExvZ0xldmVsIHtcclxuICAgICAgICBJbmZvLFxyXG4gICAgICAgIFdhcm5pbmcsXHJcbiAgICAgICAgRXJyb3IsXHJcbiAgICAgICAgRGVidWcsXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGVudW0gQ29udmVydGVyRXJyb3Ige1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGdsVGYgcmVxdWlyZXMgdGhhdCBza2luIGpvaW50cyBtdXN0IGV4aXN0cyBpbiBzYW1lIHNjZW5lIGFzIG5vZGUgcmVmZXJlbmNlcyBpdC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBSZWZlcmVuY2VTa2luSW5EaWZmZXJlbnRTY2VuZSxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3BlY2lmaWVkIGFscGhhIG1vZGUgaXMgbm90IHN1cHBvcnRlZCBjdXJyZW50bHkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgVW5zdXBwb3J0ZWRBbHBoYU1vZGUsXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVuc3VwcG9ydGVkIHRleHR1cmUgcGFyYW1ldGVyLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFVuc3VwcG9ydGVkVGV4dHVyZVBhcmFtZXRlcixcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVW5zdXBwb3J0ZWQgY2hhbm5lbCBwYXRoLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFVuc3VwcG9ydGVkQ2hhbm5lbFBhdGgsXHJcblxyXG4gICAgICAgIERpc2FsbG93Q3ViaWNTcGxpbmVDaGFubmVsU3BsaXQsXHJcblxyXG4gICAgICAgIEZhaWxlZFRvQ2FsY3VsYXRlVGFuZ2VudHMsXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFsbCB0YXJnZXRzIG9mIHRoZSBzcGVjaWZpZWQgc3ViLW1lc2ggYXJlIHplcm8tZGlzcGxhY2VkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEVtcHR5TW9ycGgsXHJcblxyXG4gICAgICAgIFVuc3VwcG9ydGVkRXh0ZW5zaW9uLFxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQ29udmVydGVyRXJyb3JBcmd1bWVudEZvcm1hdCB7XHJcbiAgICAgICAgW0NvbnZlcnRlckVycm9yLlVuc3VwcG9ydGVkRXh0ZW5zaW9uXToge1xyXG4gICAgICAgICAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgICAgIHJlcXVpcmVkPzogYm9vbGVhbjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBbQ29udmVydGVyRXJyb3IuUmVmZXJlbmNlU2tpbkluRGlmZmVyZW50U2NlbmVdOiB7XHJcbiAgICAgICAgICAgIHNraW46IG51bWJlcjtcclxuICAgICAgICAgICAgbm9kZTogbnVtYmVyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFtDb252ZXJ0ZXJFcnJvci5VbnN1cHBvcnRlZEFscGhhTW9kZV06IHtcclxuICAgICAgICAgICAgbW9kZTogc3RyaW5nO1xyXG4gICAgICAgICAgICBtYXRlcmlhbDogbnVtYmVyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIFtDb252ZXJ0ZXJFcnJvci5VbnN1cHBvcnRlZFRleHR1cmVQYXJhbWV0ZXJdOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdtaW5GaWx0ZXInIHwgJ21hZ0ZpbHRlcicgfCAnd3JhcE1vZGUnO1xyXG4gICAgICAgICAgICB2YWx1ZTogbnVtYmVyO1xyXG4gICAgICAgICAgICBmYWxsYmFjaz86IG51bWJlcjtcclxuICAgICAgICAgICAgdGV4dHVyZTogbnVtYmVyO1xyXG4gICAgICAgICAgICBzYW1wbGVyOiBudW1iZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgW0NvbnZlcnRlckVycm9yLlVuc3VwcG9ydGVkQ2hhbm5lbFBhdGhdOiB7XHJcbiAgICAgICAgICAgIGNoYW5uZWw6IG51bWJlcjtcclxuICAgICAgICAgICAgYW5pbWF0aW9uOiBudW1iZXI7XHJcbiAgICAgICAgICAgIHBhdGg6IHN0cmluZztcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBbQ29udmVydGVyRXJyb3IuRGlzYWxsb3dDdWJpY1NwbGluZUNoYW5uZWxTcGxpdF06IHtcclxuICAgICAgICAgICAgY2hhbm5lbDogbnVtYmVyO1xyXG4gICAgICAgICAgICBhbmltYXRpb246IG51bWJlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBbQ29udmVydGVyRXJyb3IuRmFpbGVkVG9DYWxjdWxhdGVUYW5nZW50c106IHtcclxuICAgICAgICAgICAgcmVhc29uOiAnbm9ybWFsJyB8ICd1dic7XHJcbiAgICAgICAgICAgIHByaW1pdGl2ZTogbnVtYmVyO1xyXG4gICAgICAgICAgICBtZXNoOiBudW1iZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgW0NvbnZlcnRlckVycm9yLkVtcHR5TW9ycGhdOiB7XHJcbiAgICAgICAgICAgIG1lc2g6IG51bWJlcjtcclxuICAgICAgICAgICAgcHJpbWl0aXZlOiBudW1iZXI7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuaW50ZXJmYWNlIFBhcnNlZEFuZEJ1ZmZlclJlc29sdmVkR2xUZiB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBwYXJzZWQgZ2xURiBkb2N1bWVudC5cclxuICAgICAqL1xyXG4gICAgZ2xURjogR2xUZjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJ1ZmZlcnMgb2YgdGhpcyBnbFRGIHJlZmVyZW5jZWQuXHJcbiAgICAgKi9cclxuICAgIGJ1ZmZlcnM6IFJlc29sdmVkQnVmZmVyW107XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFaXRoZXIgYnVmZmVyIGl0c2VsZiBvciBmdWxsIHBhdGggdG8gZXh0ZXJuYWwgYnVmZmVyIGZpbGUuXHJcbiAqL1xyXG50eXBlIFJlc29sdmVkQnVmZmVyID0gc3RyaW5nIHwgQnVmZmVyO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRHbHRmKGdsdGZGaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxQYXJzZWRBbmRCdWZmZXJSZXNvbHZlZEdsVGY+IHtcclxuICAgIHJldHVybiBwYXRoLmV4dG5hbWUoZ2x0ZkZpbGVQYXRoKSA9PT0gJy5nbGInID8gYXdhaXQgcmVhZEdsYihnbHRmRmlsZVBhdGgpIDogYXdhaXQgcmVhZEdsdGZKc29uKGdsdGZGaWxlUGF0aCk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlYWRHbHRmSnNvbihwYXRoOiBzdHJpbmcpOiBQcm9taXNlPFBhcnNlZEFuZEJ1ZmZlclJlc29sdmVkR2xUZj4ge1xyXG4gICAgY29uc3QgZ2xURiA9IChhd2FpdCBmcy5yZWFkSlNPTihwYXRoKSkgYXMgR2xUZjtcclxuICAgIGNvbnN0IHJlc29sdmVkQnVmZmVycyA9ICFnbFRGLmJ1ZmZlcnNcclxuICAgICAgICA/IFtdXHJcbiAgICAgICAgOiBnbFRGLmJ1ZmZlcnMubWFwKChnbFRGQnVmZmVyOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgaWYgKGdsVEZCdWZmZXIudXJpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZUJ1ZmZlclVyaShwYXRoLCBnbFRGQnVmZmVyLnVyaSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQnVmZmVyLmFsbG9jKDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICByZXR1cm4geyBnbFRGLCBidWZmZXJzOiByZXNvbHZlZEJ1ZmZlcnMgfTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVhZEdsYihwYXRoOiBzdHJpbmcpOiBQcm9taXNlPFBhcnNlZEFuZEJ1ZmZlclJlc29sdmVkR2xUZj4ge1xyXG4gICAgY29uc3QgYmFkR0xCRm9ybWF0ID0gKCk6IG5ldmVyID0+IHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JhZCBnbGIgZm9ybWF0LicpO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBnbGIgPSBhd2FpdCBmcy5yZWFkRmlsZShwYXRoKTtcclxuICAgIGlmIChnbGIubGVuZ3RoIDwgMTIpIHtcclxuICAgICAgICByZXR1cm4gYmFkR0xCRm9ybWF0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbWFnaWMgPSBnbGIucmVhZFVJbnQzMkxFKDApO1xyXG4gICAgaWYgKG1hZ2ljICE9PSAweDQ2NTQ2YzY3KSB7XHJcbiAgICAgICAgcmV0dXJuIGJhZEdMQkZvcm1hdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IENodW5rVHlwZUpzb24gPSAweDRlNGY1MzRhO1xyXG4gICAgY29uc3QgQ2h1bmtUeXBlQmluID0gMHgwMDRlNDk0MjtcclxuICAgIGNvbnN0IHZlcnNpb24gPSBnbGIucmVhZFVJbnQzMkxFKDQpO1xyXG4gICAgY29uc3QgbGVuZ3RoID0gZ2xiLnJlYWRVSW50MzJMRSg4KTtcclxuICAgIGxldCBnbFRGOiBHbFRmIHwgdW5kZWZpbmVkO1xyXG4gICAgbGV0IGVtYmVkZGVkQmluYXJ5QnVmZmVyOiBCdWZmZXIgfCB1bmRlZmluZWQ7XHJcbiAgICBmb3IgKGxldCBpQ2h1bmsgPSAwLCBvZmZzZXQgPSAxMjsgb2Zmc2V0ICsgOCA8PSBnbGIubGVuZ3RoOyArK2lDaHVuaykge1xyXG4gICAgICAgIGNvbnN0IGNodW5rTGVuZ3RoID0gZ2xiLnJlYWRVSW50MzJMRShvZmZzZXQpO1xyXG4gICAgICAgIG9mZnNldCArPSA0O1xyXG4gICAgICAgIGNvbnN0IGNodW5rVHlwZSA9IGdsYi5yZWFkVUludDMyTEUob2Zmc2V0KTtcclxuICAgICAgICBvZmZzZXQgKz0gNDtcclxuICAgICAgICBpZiAob2Zmc2V0ICsgY2h1bmtMZW5ndGggPiBnbGIubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYWRHTEJGb3JtYXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IEJ1ZmZlci5mcm9tKGdsYi5idWZmZXIsIG9mZnNldCwgY2h1bmtMZW5ndGgpO1xyXG4gICAgICAgIG9mZnNldCArPSBjaHVua0xlbmd0aDtcclxuICAgICAgICBpZiAoaUNodW5rID09PSAwKSB7XHJcbiAgICAgICAgICAgIGlmIChjaHVua1R5cGUgIT09IENodW5rVHlwZUpzb24pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBiYWRHTEJGb3JtYXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBnbFRGSnNvbiA9IG5ldyBUZXh0RGVjb2RlcigndXRmLTgnKS5kZWNvZGUocGF5bG9hZCk7XHJcbiAgICAgICAgICAgIGdsVEYgPSBKU09OLnBhcnNlKGdsVEZKc29uKSBhcyBHbFRmO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY2h1bmtUeXBlID09PSBDaHVua1R5cGVCaW4pIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogU2hvdWxkIHdlIGNvcHk/XHJcbiAgICAgICAgICAgIC8vIGVtYmVkZGVkQmluYXJ5QnVmZmVyID0gcGF5bG9hZC5zbGljZSgpO1xyXG4gICAgICAgICAgICBlbWJlZGRlZEJpbmFyeUJ1ZmZlciA9IHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghZ2xURikge1xyXG4gICAgICAgIHJldHVybiBiYWRHTEJGb3JtYXQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgcmVzb2x2ZWRCdWZmZXJzID0gIWdsVEYuYnVmZmVyc1xyXG4gICAgICAgICAgICA/IFtdXHJcbiAgICAgICAgICAgIDogZ2xURi5idWZmZXJzLm1hcCgoZ2xURkJ1ZmZlcjogYW55LCBnbFRGQnVmZmVySW5kZXg6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGdsVEZCdWZmZXIudXJpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVCdWZmZXJVcmkocGF0aCwgZ2xURkJ1ZmZlci51cmkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChnbFRGQnVmZmVySW5kZXggPT09IDAgJiYgZW1iZWRkZWRCaW5hcnlCdWZmZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW1iZWRkZWRCaW5hcnlCdWZmZXI7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCdWZmZXIuYWxsb2MoMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB7IGdsVEYsIGJ1ZmZlcnM6IHJlc29sdmVkQnVmZmVycyB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZXNvbHZlQnVmZmVyVXJpKGdsVEZGaWxlUGF0aDogc3RyaW5nLCB1cmk6IHN0cmluZyk6IFJlc29sdmVkQnVmZmVyIHtcclxuICAgIGNvbnN0IGRhdGFVUkkgPSBEYXRhVVJJLnBhcnNlKHVyaSk7XHJcbiAgICBpZiAoIWRhdGFVUkkpIHtcclxuICAgICAgICBjb25zdCBidWZmZXJQYXRoID0gcGF0aC5yZXNvbHZlKHBhdGguZGlybmFtZShnbFRGRmlsZVBhdGgpLCB1cmkpO1xyXG4gICAgICAgIHJldHVybiBidWZmZXJQYXRoO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20ocmVzb2x2ZUJ1ZmZlckRhdGFVUkkoZGF0YVVSSSkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNEYXRhVXJpKHVyaTogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gdXJpLnN0YXJ0c1dpdGgoJ2RhdGE6Jyk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBCdWZmZXJCbG9iIHtcclxuICAgIHByaXZhdGUgX2FycmF5QnVmZmVyT3JQYWRkaW5nczogKFVpbnQ4QXJyYXkgfCBBcnJheUJ1ZmZlciB8IG51bWJlcilbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBfbGVuZ3RoID0gMDtcclxuXHJcbiAgICBwdWJsaWMgc2V0TmV4dEFsaWdubWVudChhbGlnbjogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGFsaWduICE9PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlbWFpbmRlciA9IHRoaXMuX2xlbmd0aCAlIGFsaWduO1xyXG4gICAgICAgICAgICBpZiAocmVtYWluZGVyICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYWRkaW5nID0gYWxpZ24gLSByZW1haW5kZXI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hcnJheUJ1ZmZlck9yUGFkZGluZ3MucHVzaChwYWRkaW5nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xlbmd0aCArPSBwYWRkaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRCdWZmZXIoYXJyYXlCdWZmZXI6IEFycmF5QnVmZmVyIHwgVWludDhBcnJheSkge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2xlbmd0aDtcclxuICAgICAgICB0aGlzLl9hcnJheUJ1ZmZlck9yUGFkZGluZ3MucHVzaChhcnJheUJ1ZmZlcik7XHJcbiAgICAgICAgdGhpcy5fbGVuZ3RoICs9IGFycmF5QnVmZmVyLmJ5dGVMZW5ndGg7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TGVuZ3RoKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldENvbWJpbmVkKCkge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KHRoaXMuX2xlbmd0aCk7XHJcbiAgICAgICAgbGV0IGNvdW50ZXIgPSAwO1xyXG4gICAgICAgIHRoaXMuX2FycmF5QnVmZmVyT3JQYWRkaW5ncy5mb3JFYWNoKChhcnJheUJ1ZmZlck9yUGFkZGluZykgPT4ge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGFycmF5QnVmZmVyT3JQYWRkaW5nID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgY291bnRlciArPSBhcnJheUJ1ZmZlck9yUGFkZGluZztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5zZXQobmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXJPclBhZGRpbmcpLCBjb3VudGVyKTtcclxuICAgICAgICAgICAgICAgIGNvdW50ZXIgKz0gYXJyYXlCdWZmZXJPclBhZGRpbmcuYnl0ZUxlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZURhdGFWaWV3RnJvbUJ1ZmZlcihidWZmZXI6IEJ1ZmZlciwgb2Zmc2V0ID0gMCkge1xyXG4gICAgcmV0dXJuIG5ldyBEYXRhVmlldyhidWZmZXIuYnVmZmVyLCBidWZmZXIuYnl0ZU9mZnNldCArIG9mZnNldCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZURhdGFWaWV3RnJvbVR5cGVkQXJyYXkodHlwZWRBcnJheTogQXJyYXlCdWZmZXJWaWV3LCBvZmZzZXQgPSAwKSB7XHJcbiAgICByZXR1cm4gbmV3IERhdGFWaWV3KHR5cGVkQXJyYXkuYnVmZmVyLCB0eXBlZEFycmF5LmJ5dGVPZmZzZXQgKyBvZmZzZXQpO1xyXG59XHJcblxyXG5jb25zdCBEYXRhVmlld1VzZUxpdHRsZUVuZGlhbiA9IHRydWU7XHJcblxyXG50eXBlIFVuaXF1ZU5hbWVHZW5lcmF0b3IgPSAob3JpZ2luYWw6IHN0cmluZyB8IG51bGwsIGxhc3Q6IHN0cmluZyB8IG51bGwsIGluZGV4OiBudW1iZXIsIGNvdW50OiBudW1iZXIpID0+IHN0cmluZztcclxuXHJcbmZ1bmN0aW9uIHVuaXF1ZUNoaWxkTm9kZU5hbWVHZW5lcmF0b3Iob3JpZ2luYWw6IHN0cmluZyB8IG51bGwsIGxhc3Q6IHN0cmluZyB8IG51bGwsIGluZGV4OiBudW1iZXIsIGNvdW50OiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgcG9zdGZpeCA9IGNvdW50ID09PSAwID8gJycgOiBgLSR7Y291bnR9YDtcclxuICAgIHJldHVybiBgJHtvcmlnaW5hbCB8fCAnJ30oX19hdXRvZ2VuICR7aW5kZXh9JHtwb3N0Zml4fSlgO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYWtlVW5pcXVlTmFtZXMobmFtZXM6IChzdHJpbmcgfCBudWxsKVtdLCBnZW5lcmF0b3I6IFVuaXF1ZU5hbWVHZW5lcmF0b3IpOiBzdHJpbmdbXSB7XHJcbiAgICBjb25zdCB1bmlxdWVOYW1lcyA9IG5ldyBBcnJheShuYW1lcy5sZW5ndGgpLmZpbGwoJycpO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuYW1lcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIGxldCBuYW1lID0gbmFtZXNbaV07XHJcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcclxuXHJcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICAgICAgY29uc3QgaXNVbmlxdWUgPSAoKSA9PlxyXG4gICAgICAgICAgICAgICAgdW5pcXVlTmFtZXMuZXZlcnkoKHVuaXF1ZU5hbWUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4ID09PSBpIHx8IG5hbWUgIT09IHVuaXF1ZU5hbWU7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKG5hbWUgPT09IG51bGwgfHwgIWlzVW5pcXVlKCkpIHtcclxuICAgICAgICAgICAgICAgIG5hbWUgPSBnZW5lcmF0b3IobmFtZXNbaV0sIG5hbWUsIGksIGNvdW50KyspO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdW5pcXVlTmFtZXNbaV0gPSBuYW1lO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5pcXVlTmFtZXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc29sdmVCdWZmZXJEYXRhVVJJKHVyaTogRGF0YVVSSS5EYXRhVVJJKTogQXJyYXlCdWZmZXIge1xyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL0tocm9ub3NHcm91cC9nbFRGL2lzc3Vlcy85NDRcclxuICAgIGlmIChcclxuICAgICAgICAhdXJpLmJhc2U2NCB8fFxyXG4gICAgICAgICF1cmkubWVkaWFUeXBlIHx8XHJcbiAgICAgICAgISh1cmkubWVkaWFUeXBlLnZhbHVlID09PSAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyB8fCB1cmkubWVkaWFUeXBlLnZhbHVlID09PSAnYXBwbGljYXRpb24vZ2x0Zi1idWZmZXInKVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgdW5kZXJzdGFuZCBkYXRhIHVyaShiYXNlNjQ6ICR7dXJpLmJhc2U2NH0sIG1lZGlhVHlwZTogJHt1cmkubWVkaWFUeXBlfSkgZm9yIGJ1ZmZlci5gKTtcclxuICAgIH1cclxuICAgIHJldHVybiBkZWNvZGVCYXNlNjRUb0FycmF5QnVmZmVyKHVyaS5kYXRhKTtcclxufVxyXG5cclxuY2xhc3MgRHluYW1pY0FycmF5QnVmZmVyIHtcclxuICAgIGdldCBhcnJheUJ1ZmZlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYXJyYXlCdWZmZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfc2l6ZSA9IDA7XHJcbiAgICBwcml2YXRlIF9hcnJheUJ1ZmZlcjogQXJyYXlCdWZmZXI7XHJcbiAgICBjb25zdHJ1Y3RvcihyZXNlcnZlPzogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5fYXJyYXlCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoTWF0aC5tYXgocmVzZXJ2ZSB8fCAwLCA0KSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdyb3coZ3Jvd1NpemU6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IHN6QmVmb3JlR3JvdyA9IHRoaXMuX3NpemU7XHJcbiAgICAgICAgaWYgKGdyb3dTaXplKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNhcCA9IHRoaXMuX2FycmF5QnVmZmVyLmJ5dGVMZW5ndGg7XHJcbiAgICAgICAgICAgIGNvbnN0IHNwYWNlID0gY2FwIC0gc3pCZWZvcmVHcm93O1xyXG4gICAgICAgICAgICBjb25zdCByZXEgPSBzcGFjZSAtIGdyb3dTaXplO1xyXG4gICAgICAgICAgICBpZiAocmVxIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gYXNzZXJ0KGNhcCA+PSA0KVxyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3Q2FwID0gKGNhcCArIC1yZXEpICogMS41O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3QXJyYXlCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIobmV3Q2FwKTtcclxuICAgICAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KG5ld0FycmF5QnVmZmVyLCAwLCBjYXApLnNldChuZXcgVWludDhBcnJheSh0aGlzLl9hcnJheUJ1ZmZlcikpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYXJyYXlCdWZmZXIgPSBuZXdBcnJheUJ1ZmZlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9zaXplICs9IGdyb3dTaXplO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3pCZWZvcmVHcm93O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzaHJpbmsoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FycmF5QnVmZmVyLnNsaWNlKDAsIHRoaXMuX3NpemUpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXREYXRhdmlld1dyaXR0ZXJPZlR5cGVkQXJyYXkodHlwZWRBcnJheTogUFBHZW9tZXRyeVR5cGVkQXJyYXksIGxpdHRsZUVuZGlhbj86IGJvb2xlYW4pIHtcclxuICAgIHN3aXRjaCAodHlwZWRBcnJheS5jb25zdHJ1Y3Rvcikge1xyXG4gICAgICAgIGNhc2UgSW50OEFycmF5OlxyXG4gICAgICAgICAgICByZXR1cm4gKGRhdGFWaWV3OiBEYXRhVmlldywgYnl0ZU9mZnNldDogbnVtYmVyLCB2YWx1ZTogbnVtYmVyKSA9PiBkYXRhVmlldy5zZXRJbnQ4KGJ5dGVPZmZzZXQsIHZhbHVlKTtcclxuICAgICAgICBjYXNlIFVpbnQ4QXJyYXk6XHJcbiAgICAgICAgICAgIHJldHVybiAoZGF0YVZpZXc6IERhdGFWaWV3LCBieXRlT2Zmc2V0OiBudW1iZXIsIHZhbHVlOiBudW1iZXIpID0+IGRhdGFWaWV3LnNldFVpbnQ4KGJ5dGVPZmZzZXQsIHZhbHVlKTtcclxuICAgICAgICBjYXNlIEludDE2QXJyYXk6XHJcbiAgICAgICAgICAgIHJldHVybiAoZGF0YVZpZXc6IERhdGFWaWV3LCBieXRlT2Zmc2V0OiBudW1iZXIsIHZhbHVlOiBudW1iZXIpID0+IGRhdGFWaWV3LnNldEludDE2KGJ5dGVPZmZzZXQsIHZhbHVlLCBsaXR0bGVFbmRpYW4pO1xyXG4gICAgICAgIGNhc2UgVWludDE2QXJyYXk6XHJcbiAgICAgICAgICAgIHJldHVybiAoZGF0YVZpZXc6IERhdGFWaWV3LCBieXRlT2Zmc2V0OiBudW1iZXIsIHZhbHVlOiBudW1iZXIpID0+IGRhdGFWaWV3LnNldFVpbnQxNihieXRlT2Zmc2V0LCB2YWx1ZSwgbGl0dGxlRW5kaWFuKTtcclxuICAgICAgICBjYXNlIEludDMyQXJyYXk6XHJcbiAgICAgICAgICAgIHJldHVybiAoZGF0YVZpZXc6IERhdGFWaWV3LCBieXRlT2Zmc2V0OiBudW1iZXIsIHZhbHVlOiBudW1iZXIpID0+IGRhdGFWaWV3LnNldEludDMyKGJ5dGVPZmZzZXQsIHZhbHVlLCBsaXR0bGVFbmRpYW4pO1xyXG4gICAgICAgIGNhc2UgVWludDMyQXJyYXk6XHJcbiAgICAgICAgICAgIHJldHVybiAoZGF0YVZpZXc6IERhdGFWaWV3LCBieXRlT2Zmc2V0OiBudW1iZXIsIHZhbHVlOiBudW1iZXIpID0+IGRhdGFWaWV3LnNldFVpbnQzMihieXRlT2Zmc2V0LCB2YWx1ZSwgbGl0dGxlRW5kaWFuKTtcclxuICAgICAgICBjYXNlIEZsb2F0MzJBcnJheTpcclxuICAgICAgICAgICAgcmV0dXJuIChkYXRhVmlldzogRGF0YVZpZXcsIGJ5dGVPZmZzZXQ6IG51bWJlciwgdmFsdWU6IG51bWJlcikgPT4gZGF0YVZpZXcuc2V0RmxvYXQzMihieXRlT2Zmc2V0LCB2YWx1ZSwgbGl0dGxlRW5kaWFuKTtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JhZCBzdG9yYWdlIGNvbnN0cnVjdG9yLicpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbnRlcmxlYXZlVmVydGljZXMocHBHZW9tZXRyeTogUFBHZW9tZXRyeSwgYkdlbmVyYXRlVVYgPSBmYWxzZSwgYkFkZFZlcnRleENvbG9yID0gZmFsc2UpIHtcclxuICAgIGNvbnN0IHZlcnRleENvdW50ID0gcHBHZW9tZXRyeS52ZXJ0ZXhDb3VudDtcclxuICAgIGxldCBoYXNVVjEgPSBmYWxzZTtcclxuICAgIGxldCBoYXNDb2xvciA9IGZhbHNlO1xyXG4gICAgY29uc3QgdmFsaWRBdHRyaWJ1dGVzOiBBcnJheTxbc3RyaW5nLCBQUEdlb21ldHJ5LkF0dHJpYnV0ZV0+ID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBwcEdlb21ldHJ5LmF0dHJpYnV0ZXMoKSkge1xyXG4gICAgICAgIGxldCBnZnhBdHRyaWJ1dGVOYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZ2Z4QXR0cmlidXRlTmFtZSA9IGdldEdmeEF0dHJpYnV0ZU5hbWUoYXR0cmlidXRlKTtcclxuICAgICAgICAgICAgaWYgKGdmeEF0dHJpYnV0ZU5hbWUgPT09IGdmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfVEVYX0NPT1JEMSkge1xyXG4gICAgICAgICAgICAgICAgaGFzVVYxID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZ2Z4QXR0cmlidXRlTmFtZSA9PT0gZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9DT0xPUikge1xyXG4gICAgICAgICAgICAgICAgaGFzQ29sb3IgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhbGlkQXR0cmlidXRlcy5wdXNoKFtnZnhBdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVdKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYkFkZFZlcnRleENvbG9yICYmICFoYXNDb2xvcikge1xyXG4gICAgICAgIGNvbnN0IGZpbGxDb2xvciA9IG5ldyBWZWM0KDEsIDEsIDEsIDEpO1xyXG4gICAgICAgIGNvbnN0IGNvbG9yRGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkodmVydGV4Q291bnQgKiA0KTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRleENvdW50OyArK2kpIHtcclxuICAgICAgICAgICAgY29sb3JEYXRhW2kgKiA0ICsgMF0gPSBmaWxsQ29sb3IueDtcclxuICAgICAgICAgICAgY29sb3JEYXRhW2kgKiA0ICsgMV0gPSBmaWxsQ29sb3IueTtcclxuICAgICAgICAgICAgY29sb3JEYXRhW2kgKiA0ICsgMl0gPSBmaWxsQ29sb3IuejtcclxuICAgICAgICAgICAgY29sb3JEYXRhW2kgKiA0ICsgM10gPSBmaWxsQ29sb3IudztcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFsaWRBdHRyaWJ1dGVzLnB1c2goWydhX2NvbG9yJywgbmV3IFBQR2VvbWV0cnkuQXR0cmlidXRlKFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzLmNvbG9yLCBjb2xvckRhdGEsIDQpXSk7XHJcbiAgICB9XHJcbiAgICBpZiAoYkdlbmVyYXRlVVYgJiYgIWhhc1VWMSkge1xyXG4gICAgICAgIHZhbGlkQXR0cmlidXRlcy5wdXNoKFtcclxuICAgICAgICAgICAgJ2FfdGV4Q29vcmQxJyxcclxuICAgICAgICAgICAgbmV3IFBQR2VvbWV0cnkuQXR0cmlidXRlKFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzLnRleGNvb3JkLCBuZXcgRmxvYXQzMkFycmF5KHZlcnRleENvdW50ICogMiksIDIpLFxyXG4gICAgICAgIF0pO1xyXG4gICAgfVxyXG4gICAgbGV0IHZlcnRleFN0cmlkZSA9IDA7XHJcbiAgICBmb3IgKGNvbnN0IFtfLCBhdHRyaWJ1dGVdIG9mIHZhbGlkQXR0cmlidXRlcykge1xyXG4gICAgICAgIHZlcnRleFN0cmlkZSArPSBhdHRyaWJ1dGUuZGF0YS5CWVRFU19QRVJfRUxFTUVOVCAqIGF0dHJpYnV0ZS5jb21wb25lbnRzO1xyXG4gICAgfVxyXG4gICAgY29uc3QgdmVydGV4QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHZlcnRleENvdW50ICogdmVydGV4U3RyaWRlKTtcclxuICAgIGNvbnN0IHZlcnRleEJ1ZmZlclZpZXcgPSBuZXcgRGF0YVZpZXcodmVydGV4QnVmZmVyKTtcclxuICAgIGxldCBjdXJyZW50Qnl0ZU9mZnNldCA9IDA7XHJcbiAgICBjb25zdCBmb3JtYXRzOiBhbnlbXSA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBbZ2Z4QXR0cmlidXRlTmFtZSwgYXR0cmlidXRlXSBvZiB2YWxpZEF0dHJpYnV0ZXMpIHtcclxuICAgICAgICBjb25zdCBhdHRyaWJ1dGVEYXRhID0gYXR0cmlidXRlLmRhdGE7XHJcbiAgICAgICAgY29uc3QgZGF0YXZpZXdXcml0dGVyID0gZ2V0RGF0YXZpZXdXcml0dGVyT2ZUeXBlZEFycmF5KGF0dHJpYnV0ZURhdGEsIERhdGFWaWV3VXNlTGl0dGxlRW5kaWFuKTtcclxuICAgICAgICBmb3IgKGxldCBpVmVydGV4ID0gMDsgaVZlcnRleCA8IHZlcnRleENvdW50OyArK2lWZXJ0ZXgpIHtcclxuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0MSA9IGN1cnJlbnRCeXRlT2Zmc2V0ICsgdmVydGV4U3RyaWRlICogaVZlcnRleDtcclxuICAgICAgICAgICAgZm9yIChsZXQgaUNvbXBvbmVudCA9IDA7IGlDb21wb25lbnQgPCBhdHRyaWJ1dGUuY29tcG9uZW50czsgKytpQ29tcG9uZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGF0dHJpYnV0ZURhdGFbYXR0cmlidXRlLmNvbXBvbmVudHMgKiBpVmVydGV4ICsgaUNvbXBvbmVudF07XHJcbiAgICAgICAgICAgICAgICBkYXRhdmlld1dyaXR0ZXIodmVydGV4QnVmZmVyVmlldywgb2Zmc2V0MSArIGF0dHJpYnV0ZURhdGEuQllURVNfUEVSX0VMRU1FTlQgKiBpQ29tcG9uZW50LCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY3VycmVudEJ5dGVPZmZzZXQgKz0gYXR0cmlidXRlLmRhdGEuQllURVNfUEVSX0VMRU1FTlQgKiBhdHRyaWJ1dGUuY29tcG9uZW50cztcclxuICAgICAgICBmb3JtYXRzLnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lOiBnZnhBdHRyaWJ1dGVOYW1lLFxyXG4gICAgICAgICAgICBmb3JtYXQ6IGF0dHJpYnV0ZS5nZXRHRlhGb3JtYXQoKSxcclxuICAgICAgICAgICAgaXNOb3JtYWxpemVkOiBhdHRyaWJ1dGUuaXNOb3JtYWxpemVkLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdmVydGV4Q291bnQsXHJcbiAgICAgICAgdmVydGV4U3RyaWRlLFxyXG4gICAgICAgIGZvcm1hdHMsXHJcbiAgICAgICAgdmVydGV4QnVmZmVyLFxyXG4gICAgfTtcclxufVxyXG5cclxuY29uc3QgZ2xURkF0dHJpYnV0ZU5hbWVUb1BQID0gKCgpID0+IHtcclxuICAgIHJldHVybiAoYXR0cmlidXRlTmFtZTogc3RyaW5nKTogUFBHZW9tZXRyeS5TZW1hbnRpYyA9PiB7XHJcbiAgICAgICAgaWYgKGF0dHJpYnV0ZU5hbWUuc3RhcnRzV2l0aCgnXycpKSB7XHJcbiAgICAgICAgICAgIC8vIEFwcGxpY2F0aW9uLXNwZWNpZmljIHNlbWFudGljcyBtdXN0IHN0YXJ0IHdpdGggYW4gdW5kZXJzY29yZVxyXG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlTmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZU5hbWVSZWdleE1hdGNoZXMgPSAvKFthLXpBLVpdKykoPzpfKFxcZCspKT8vZy5leGVjKGF0dHJpYnV0ZU5hbWUpO1xyXG4gICAgICAgIGlmICghYXR0cmlidXRlTmFtZVJlZ2V4TWF0Y2hlcykge1xyXG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlTmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZUJhc2VOYW1lID0gYXR0cmlidXRlTmFtZVJlZ2V4TWF0Y2hlc1sxXTtcclxuICAgICAgICBsZXQgc3RkU2VtYW50aWM6IFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIGNvbnN0IHNldCA9IHBhcnNlSW50KGF0dHJpYnV0ZU5hbWVSZWdleE1hdGNoZXNbMl0gfHwgJzAnKTtcclxuICAgICAgICBzd2l0Y2ggKGF0dHJpYnV0ZUJhc2VOYW1lKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ1BPU0lUSU9OJzpcclxuICAgICAgICAgICAgICAgIHN0ZFNlbWFudGljID0gUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3MucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnTk9STUFMJzpcclxuICAgICAgICAgICAgICAgIHN0ZFNlbWFudGljID0gUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3Mubm9ybWFsO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ1RBTkdFTlQnOlxyXG4gICAgICAgICAgICAgICAgc3RkU2VtYW50aWMgPSBQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy50YW5nZW50O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ0NPTE9SJzpcclxuICAgICAgICAgICAgICAgIHN0ZFNlbWFudGljID0gUFBHZW9tZXRyeS5TdGRTZW1hbnRpY3MuY29sb3I7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnVEVYQ09PUkQnOlxyXG4gICAgICAgICAgICAgICAgc3RkU2VtYW50aWMgPSBQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy50ZXhjb29yZDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdKT0lOVFMnOlxyXG4gICAgICAgICAgICAgICAgc3RkU2VtYW50aWMgPSBQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5qb2ludHM7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnV0VJR0hUUyc6XHJcbiAgICAgICAgICAgICAgICBzdGRTZW1hbnRpYyA9IFBQR2VvbWV0cnkuU3RkU2VtYW50aWNzLndlaWdodHM7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzdGRTZW1hbnRpYyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhdHRyaWJ1dGVOYW1lO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBQUEdlb21ldHJ5LlN0ZFNlbWFudGljcy5zZXQoc3RkU2VtYW50aWMsIHNldCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSkoKTtcclxuXHJcbmV4cG9ydCBjbGFzcyBHbFRmQ29uZm9ybWFuY2VFcnJvciBleHRlbmRzIEVycm9yIHsgfVxyXG5cclxuZnVuY3Rpb24gYXNzZXJ0R2xURkNvbmZvcm1hbmNlKGV4cHI6IGJvb2xlYW4sIG1lc3NhZ2U6IHN0cmluZykge1xyXG4gICAgaWYgKCFleHByKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEdsVGZDb25mb3JtYW5jZUVycm9yKGBnbFRGIG5vbi1jb25mb3JtYW5jZSBlcnJvcjogJHttZXNzYWdlfWApO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==