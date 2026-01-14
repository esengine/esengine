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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GltfHandler = void 0;
exports.migrateMeshOptimizerOption = migrateMeshOptimizerOption;
exports.migrateFbxMatchMeshNames = migrateFbxMatchMeshNames;
exports.migrateMeshSimplifyOption = migrateMeshSimplifyOption;
const asset_db_1 = require("@cocos/asset-db");
const assert_1 = require("assert");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const urijs_1 = __importDefault(require("urijs"));
const url_1 = __importDefault(require("url"));
const asset_finder_1 = require("./gltf/asset-finder");
const material_1 = require("./gltf/material");
const reader_manager_1 = require("./gltf/reader-manager");
const uri_utils_1 = require("./utils/uri-utils");
const cc_1 = require("cc");
const resolve_glTF_image_path_1 = require("./utils/resolve-glTF-image-path");
const serialize_library_1 = require("./utils/serialize-library");
const original_animation_1 = require("./gltf/original-animation");
const path_1 = require("path");
const utils_1 = require("../utils");
const meshSimplify_1 = require("./gltf/meshSimplify");
const utils_2 = require("./image/utils");
const query_1 = __importDefault(require("../../manager/query"));
const asset_config_1 = __importDefault(require("../../asset-config"));
const lodash = require('lodash');
// const ajv = new Ajv({
//     errorDataPath: '',
// });
// const schemaFile = path.join(__dirname, '..', '..', '..', 'dist', 'meta-schemas', 'glTF.meta.json');
// const schema = fs.readJSONSync(schemaFile);
// const metaValidator = ajv.compile(schema);
exports.GltfHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'gltf',
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '2.3.14',
        versionCode: 3,
        /**
         * 实际导入流程
         * 需要自己控制是否生成、拷贝文件
         *
         * 返回是否导入成功的 boolean
         * 如果返回 false，则下次启动还会重新导入
         * @param asset
         */
        async import(asset) {
            await validateMeta(asset);
            return await importSubAssets(asset, this.version);
        },
        async afterSubAssetsImport(asset) {
            await reader_manager_1.glTfReaderManager.delete(asset);
        },
    },
};
exports.default = exports.GltfHandler;
async function validateMeta(asset) {
    // asset.meta.userData.imageMetas ??= [];
    // const metaValidation = await metaValidator(asset.meta.userData);
    // if (!metaValidation) {
    //     if (Object.keys(asset.meta.userData).length !== 0) {
    //         console.debug(
    //             'Meta file of asset ' +
    //             asset.source +
    //             ' is damaged: \n' +
    //             (metaValidator.errors || []).map((error) => error.message) +
    //             '\nA default meta file is patched.',
    //         );
    //     }
    const defaultMeta = {
        imageMetas: [],
        legacyFbxImporter: false,
        allowMeshDataAccess: true,
        addVertexColor: false,
        generateLightmapUVNode: false,
        meshOptimizer: {
            enable: false,
            algorithm: 'simplify',
            simplifyOptions: (0, meshSimplify_1.getDefaultSimplifyOptions)(),
        },
        lods: {
            enable: false,
            hasBuiltinLOD: false,
            options: [],
        },
    };
    // TODO 由于目前资源界面编辑的部分默认值是自行编写的，很容易出现此类默认值有缺失的情况，补齐即可
    asset.meta.userData = lodash.defaultsDeep(asset.meta.userData, defaultMeta);
}
async function importSubAssets(asset, importVersion) {
    // Create the converter
    reader_manager_1.glTfReaderManager.delete(asset);
    const gltfConverter = await reader_manager_1.glTfReaderManager.getOrCreate(asset, importVersion, true);
    await adjustMeta(asset, gltfConverter);
    const userData = asset.userData;
    const gltfAssetFinder = new asset_finder_1.DefaultGltfAssetFinder(userData.assetFinder);
    // 导入 glTF 网格。
    const meshUUIDs = await importMeshes(asset, gltfConverter);
    gltfAssetFinder.set('meshes', meshUUIDs);
    // 保存所有原始动画（未分割）
    await saveOriginalAnimations(asset, gltfConverter, true);
    // 导入 glTF 动画。
    const { animationImportSettings } = userData;
    if (animationImportSettings) {
        for (const animationSetting of animationImportSettings) {
            for (const split of animationSetting.splits) {
                const { previousId, name, from, to, fps, ...remain } = split;
                const subAsset = await asset.createSubAsset(`${name}.animation`, 'gltf-animation', {
                    id: previousId,
                });
                split.previousId = subAsset._id;
                const subAssetUserData = subAsset.userData;
                subAssetUserData.gltfIndex = animationImportSettings.indexOf(animationSetting);
                Object.assign(subAssetUserData, remain);
                subAssetUserData.sample = fps ?? animationSetting.fps;
                subAssetUserData.span = {
                    from,
                    to,
                };
            }
        }
    }
    // 导入 glTF 皮肤。
    const skinUUIDs = await importSkins(asset, gltfConverter);
    gltfAssetFinder.set('skeletons', skinUUIDs);
    // 导入 glTF 图像。
    await importImages(asset, gltfConverter);
    // 导入 glTF 贴图。
    const textureUUIDs = await importTextures(asset, gltfConverter);
    gltfAssetFinder.set('textures', textureUUIDs);
    // 导入 glTF 材质。
    const materialUUIDs = await importMaterials(asset, gltfConverter, gltfAssetFinder);
    gltfAssetFinder.set('materials', materialUUIDs);
    // 导入 glTF 场景。
    const sceneUUIDs = await importScenes(asset, gltfConverter);
    gltfAssetFinder.set('scenes', sceneUUIDs);
    // 第一次导入，设置是否 fbx 自带 lod，是否开启
    if (sceneUUIDs.length && (!userData.lods || !userData.lods.options || !userData.lods.options.length)) {
        const assetMeta = query_1.default.queryAssetMeta(sceneUUIDs[gltfConverter.gltf.scene || 0]);
        if (assetMeta) {
            // 获取节点信息
            const sceneNode = gltfConverter.createScene(assetMeta.userData.gltfIndex || 0, gltfAssetFinder);
            const builtinLODsOption = await loadLODs(userData, sceneNode, gltfConverter);
            const hasLODs = builtinLODsOption.length > 0;
            userData.lods = {
                enable: hasLODs,
                hasBuiltinLOD: hasLODs,
                options: hasLODs ? builtinLODsOption : await generateDefaultLODsOption(),
            };
        }
    }
    if (userData.dumpMaterials && !materialUUIDs.every((uuid) => uuid !== null)) {
        console.debug('Waiting for dependency materials...');
        return false;
    }
    // 保存 AssetFinder。
    userData.assetFinder = gltfAssetFinder.serialize();
    return true;
}
async function adjustMeta(asset, glTFConverter) {
    const meta = asset.userData;
    const glTFImages = glTFConverter.gltf.images;
    if (!glTFImages) {
        meta.imageMetas = [];
    }
    else {
        const oldImageMetas = meta.imageMetas;
        const imageMetas = glTFImages.map((glTFImage, index) => {
            const imageMeta = {};
            if (glTFImage.name) {
                // If the image has name, we find old remap according the name.
                imageMeta.name = glTFImage.name;
                if (oldImageMetas) {
                    const oldImageMeta = oldImageMetas.find((remap) => remap.remap && remap.name && remap.name === imageMeta.name);
                    if (oldImageMeta) {
                        imageMeta.remap = oldImageMeta.remap;
                    }
                }
            }
            else if (oldImageMetas &&
                glTFImages.length === oldImageMetas.length &&
                !oldImageMetas[index].name &&
                oldImageMetas[index].remap) {
                // Otherwise, if the remaps count are same, and the corresponding old remap also has no name,
                // we can suppose they are for the same image.
                imageMeta.remap = oldImageMetas[index].remap;
            }
            return imageMeta;
        });
        meta.imageMetas = imageMetas;
    }
    const glTFAnimations = glTFConverter.gltf.animations;
    if (!glTFAnimations) {
        delete meta.animationImportSettings;
    }
    else {
        // 尝试从旧的动画设置中读取数据。
        const oldAnimationImportSettings = meta.animationImportSettings || [];
        const splitNames = makeUniqueSubAssetNames(asset.basename, glTFAnimations, 'animations', '');
        const newAnimationImportSettings = glTFAnimations.map((gltfAnimation, animationIndex) => {
            const duration = glTFConverter.getAnimationDuration(animationIndex);
            const splitName = gltfAnimation.name || splitNames[animationIndex];
            let defaultSplitName = splitName;
            if (glTFAnimations.length === 1) {
                const baseNameNoExt = path.basename(asset.basename, path.extname(asset.basename));
                const parts = baseNameNoExt.split('@');
                if (parts.length > 1) {
                    defaultSplitName = parts[parts.length - 1];
                }
            }
            const animationSetting = {
                name: splitName,
                duration,
                fps: 30,
                splits: [
                    {
                        name: defaultSplitName,
                        from: 0,
                        to: duration,
                        wrapMode: cc_1.AnimationClip.WrapMode.Loop,
                    },
                ],
            };
            let oldAnimationSetting = oldAnimationImportSettings.find((oldImportSetting) => oldImportSetting.name === animationSetting.name);
            if (!oldAnimationSetting && oldAnimationImportSettings.length === gltfAnimation.length) {
                oldAnimationSetting = oldAnimationImportSettings[animationIndex];
            }
            if (oldAnimationSetting) {
                animationSetting.fps = oldAnimationSetting.fps;
                const tryAdjust = (oldTime) => {
                    if (oldTime === oldAnimationSetting.duration) {
                        // A little opt.
                        return duration;
                    }
                    else {
                        // It should not exceed the new duration.
                        return Math.min(oldTime, duration);
                    }
                };
                animationSetting.splits = oldAnimationSetting.splits.map((split) => {
                    // We are trying to adjust the previous split
                    // to ensure the split range always falling in new range [0, duration].
                    return {
                        ...split,
                        from: tryAdjust(split.from),
                        to: tryAdjust(split.to),
                        wrapMode: split.wrapMode ?? cc_1.AnimationClip.WrapMode.Loop,
                    };
                });
            }
            return animationSetting;
        });
        meta.animationImportSettings = newAnimationImportSettings;
    }
}
async function importMeshes(asset, glTFConverter) {
    const glTFMeshes = glTFConverter.gltf.meshes;
    if (glTFMeshes === undefined) {
        return [];
    }
    const assetNames = makeUniqueSubAssetNames(asset.basename, glTFMeshes, 'meshes', '.mesh');
    const meshArray = [];
    for (let index = 0; index < glTFMeshes.length; index++) {
        const glTFMesh = glTFMeshes[index];
        const subAsset = await asset.createSubAsset(assetNames[index], 'gltf-mesh');
        subAsset.userData.gltfIndex = index;
        meshArray.push(subAsset.uuid);
    }
    // 添加新的 mesh 子资源
    const userData = asset.userData;
    if (userData.lods && !userData.lods.hasBuiltinLOD && userData.lods.enable) {
        for (let index = 0; index < assetNames.length; index++) {
            const lodsOption = userData.lods.options;
            // LOD0 不需要生成处理
            for (let keyIndex = 1; keyIndex < lodsOption.length; keyIndex++) {
                // 新 mesh 子资源名称
                const newSubAssetName = assetNames[index].split('.mesh')[0] + `LOD${keyIndex}.mesh`;
                const newSubAsset = await asset.createSubAsset(newSubAssetName, 'gltf-mesh');
                // 记录一些新 mesh 子资源数据
                newSubAsset.userData.gltfIndex = index;
                newSubAsset.userData.lodLevel = keyIndex;
                newSubAsset.userData.lodOptions = {
                    faceCount: lodsOption[keyIndex].faceCount,
                };
                meshArray.push(newSubAsset.uuid);
            }
        }
    }
    return meshArray;
}
async function importSkins(asset, glTFConverter) {
    const glTFSkins = glTFConverter.gltf.skins;
    if (glTFSkins === undefined) {
        return [];
    }
    const assetNames = makeUniqueSubAssetNames(asset.basename, glTFSkins, 'skeletons', '.skeleton');
    const skinArray = new Array(glTFSkins.length);
    for (let index = 0; index < glTFSkins.length; index++) {
        const glTFSkin = glTFSkins[index];
        const subAsset = await asset.createSubAsset(assetNames[index], 'gltf-skeleton');
        subAsset.userData.gltfIndex = index;
        skinArray[index] = subAsset.uuid;
    }
    return skinArray;
}
async function importImages(asset, glTFConverter) {
    const glTFImages = glTFConverter.gltf.images;
    if (glTFImages === undefined) {
        return;
    }
    const userData = asset.userData;
    const fbxMissingImageUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const isProducedByFBX2glTF = () => {
        const generator = glTFConverter.gltf.asset.generator;
        return generator?.includes('FBX2glTF');
    };
    const isFBX2glTFSourceMissingImageUri = (uri) => {
        return isProducedByFBX2glTF() && uri === fbxMissingImageUri;
    };
    const isProducedByFbxGlTfConv = () => {
        const generator = glTFConverter.gltf.asset.generator;
        return generator?.includes('FBX-glTF-conv');
    };
    const isFBXGlTfConvMissingImageUri = (uri) => {
        return isProducedByFbxGlTfConv() && uri === fbxMissingImageUri;
    };
    const imageNames = makeUniqueSubAssetNames(asset.basename, glTFImages, 'images', '.image');
    for (let index = 0; index < glTFImages.length; ++index) {
        const glTFImage = glTFImages[index];
        const imageMeta = userData.imageMetas[index];
        const vendorURI = glTFImage.uri;
        let isResolveNeeded = false;
        // If isResolvedNeeded is `true`, the resolve algorithm will take this parameter.
        // There may be `isResolveNeeded && !imagePath`, see below.
        let imagePath;
        // We will not create sub-asset-Handler if:
        // - `uri` field is relative or is file URL, and
        // - the resolved absolute file path, after the image lookup rules applied is inside the project.
        // In such cases, we directly use this location instead of create the image asset.
        if (vendorURI && (isFBX2glTFSourceMissingImageUri(vendorURI) || isFBXGlTfConvMissingImageUri(vendorURI))) {
            // Note, if the glTF is converted from FBX by FBX2glTF
            // and there are missing textures, the FBX2glTF will assign a constant data-uri as uri of image.
            // We capture these cases and try resolve the image according the glTF image asset name
            // using our own algorithm.
            isResolveNeeded = true;
        }
        else if (vendorURI && !vendorURI.startsWith('data:')) {
            // Note: should not be `asset.source`, which may be path to fbx.
            const glTFFilePath = glTFConverter.path;
            const baseURI = url_1.default.pathToFileURL(glTFFilePath).toString();
            try {
                let normalizedURI = new urijs_1.default(vendorURI);
                normalizedURI = normalizedURI.absoluteTo(baseURI);
                (0, uri_utils_1.convertsEncodedSeparatorsInURI)(normalizedURI);
                if (normalizedURI.scheme() === 'file') {
                    imagePath = url_1.default.fileURLToPath(normalizedURI.toString());
                    isResolveNeeded = true;
                }
            }
            catch { }
        }
        let resolved = '';
        if (isResolveNeeded) {
            const resolveJail = asset._assetDB.options.target;
            const resolvedImagePath = await (0, resolve_glTF_image_path_1.resolveGlTfImagePath)(glTFImage.name, imagePath, path.dirname(asset.source), glTFImage.extras, resolveJail);
            if (resolvedImagePath) {
                const dbURL = (0, asset_db_1.queryUrl)(resolvedImagePath);
                if (dbURL) {
                    // In asset database, use it.
                    imageMeta.uri = dbURL;
                }
                else {
                    // This is happened usually when
                    // - 1. Model file contains absolute URL point to an out-of-project location;
                    // - 2. Model file contains relative URL but resolved to an out-of-project location;
                    // - 3. FBX model file and its reference images are converted using FBX2glTF to a temporary path.
                    // This location may be only able accessed by current-user.
                    // 1 & 2 hurts if project are shared by multi-user.
                    const relativeFromTmpDir = (0, path_1.relative)(asset_config_1.default.data.tempRoot, resolvedImagePath);
                    if (!(0, path_1.isAbsolute)(relativeFromTmpDir) && !relativeFromTmpDir.startsWith(`..${path_1.sep}`)) {
                        resolved = resolvedImagePath;
                    }
                    else {
                        console.warn(`In model file ${asset.source},` +
                            `the image ${glTFImage.name} is resolved to ${resolvedImagePath},` +
                            'which is a location out of asset directory.' +
                            'This can cause problem as your project migrated.');
                    }
                }
            }
        }
        if (!imageMeta.uri) {
            const subAsset = await asset.createSubAsset(imageNames[index], 'gltf-embeded-image');
            subAsset.userData.gltfIndex = index;
            imageMeta.uri = subAsset.uuid;
            if (resolved) {
                subAsset.getSwapSpace().resolved = resolved;
            }
            else {
                if (glTFImage.uri === fbxMissingImageUri) {
                    glTFConverter.fbxMissingImagesId.push(index);
                }
            }
        }
    }
}
async function importTextures(asset, glTFConverter) {
    const glTFTextures = glTFConverter.gltf.textures;
    if (glTFTextures === undefined) {
        return [];
    }
    const assetNames = makeUniqueSubAssetNames(asset.basename, glTFTextures, 'textures', '.texture');
    const textureArray = new Array(glTFTextures.length);
    for (let index = 0; index < glTFTextures.length; index++) {
        const glTFTexture = glTFTextures[index];
        const name = assetNames[index];
        const subAsset = await asset.createSubAsset(name, 'texture');
        const defaultTextureUserdata = (0, utils_2.makeDefaultTexture2DAssetUserData)();
        // 这里只是设置一个默认值，如果用户修改过，或者已经生成过数据，我们需要尽量保持存储在用户 meta 里的数据
        glTFConverter.getTextureParameters(glTFTexture, defaultTextureUserdata);
        const textureUserdata = subAsset.userData;
        subAsset.assignUserData(defaultTextureUserdata);
        if (glTFTexture.source !== undefined) {
            const imageMeta = asset.userData.imageMetas[glTFTexture.source];
            const imageURI = imageMeta.remap || imageMeta.uri;
            if (!imageURI) {
                delete textureUserdata.imageUuidOrDatabaseUri;
                delete textureUserdata.isUuid;
            }
            else {
                const isUuid = !imageURI.startsWith('db://');
                textureUserdata.isUuid = isUuid;
                textureUserdata.imageUuidOrDatabaseUri = imageURI;
                if (!isUuid) {
                    const imagePath = (0, asset_db_1.queryPath)(textureUserdata.imageUuidOrDatabaseUri);
                    if (!imagePath) {
                        throw new assert_1.AssertionError({
                            message: `${textureUserdata.imageUuidOrDatabaseUri} is not found in asset-db.`,
                        });
                    }
                    subAsset.depend(imagePath);
                }
            }
        }
        textureArray[index] = subAsset.uuid;
    }
    return textureArray;
}
async function importMaterials(asset, glTFConverter, assetFinder) {
    const glTFMaterials = glTFConverter.gltf.materials;
    if (glTFMaterials === undefined) {
        return [];
    }
    const { dumpMaterials } = asset.userData;
    const assetNames = makeUniqueSubAssetNames(asset.basename, glTFMaterials, 'materials', dumpMaterials ? '.mtl' : '.material');
    const materialArray = new Array(glTFMaterials.length);
    for (let index = 0; index < glTFMaterials.length; index++) {
        // const glTFMaterial = glTFMaterials[index];
        if (dumpMaterials) {
            materialArray[index] = await (0, material_1.dumpMaterial)(asset, assetFinder, glTFConverter, index, assetNames[index]);
        }
        else {
            const subAsset = await asset.createSubAsset(assetNames[index], 'gltf-material');
            subAsset.userData.gltfIndex = index;
            materialArray[index] = subAsset.uuid;
        }
    }
    return materialArray;
}
async function importScenes(asset, glTFConverter) {
    const glTFScenes = glTFConverter.gltf.scenes;
    if (glTFScenes === undefined) {
        return [];
    }
    let id = '';
    if (asset.uuid2recycle) {
        for (const cID in asset.uuid2recycle) {
            const item = asset.uuid2recycle[cID];
            if (item.importer === 'gltf-scene' && 'id' in item) {
                id = cID;
            }
        }
    }
    const assetNames = makeUniqueSubAssetNames(asset.basename, glTFScenes, 'scenes', '.prefab');
    const sceneArray = new Array(glTFScenes.length);
    for (let index = 0; index < glTFScenes.length; index++) {
        const subAsset = await asset.createSubAsset(assetNames[index], 'gltf-scene', {
            id,
        });
        subAsset.userData.gltfIndex = index;
        sceneArray[index] = subAsset.uuid;
    }
    return sceneArray;
}
async function saveOriginalAnimations(asset, glTFConverter, compress) {
    const glTFAnimations = glTFConverter.gltf.animations;
    if (!glTFAnimations) {
        return;
    }
    await Promise.all(glTFAnimations.map(async (_, iAnimation) => {
        const animation = glTFConverter.createAnimation(iAnimation);
        // if (compress) {
        //     compressAnimationClip(animation);
        // }
        const { data, extension } = (0, serialize_library_1.serializeForLibrary)(animation);
        const libraryPath = (0, original_animation_1.getOriginalAnimationLibraryPath)(iAnimation);
        // @ts-expect-error
        await asset.saveToLibrary(libraryPath, data);
        const depends = (0, utils_1.getDependUUIDList)(data);
        asset.setData('depends', depends);
    }));
}
// lod 配置最多层级
const maxLodLevel = 7;
// 默认 lod 层级的
const defaultLODsOptions = {
    screenRatio: 0,
    faceCount: 0,
};
// 递归查询节点下所有 mesh 的减面数
async function deepFindMeshRenderer(node, glTFConverter, lodLevel, generateLightmapUVNode) {
    const meshRenderers = node.getComponents(cc_1.MeshRenderer);
    let meshRendererTriangleCount = 0;
    if (meshRenderers && meshRenderers.length > 0) {
        for (const meshRenderer of meshRenderers) {
            if (meshRenderer.mesh && meshRenderer.mesh.uuid) {
                let meshTriangleCount = 0;
                const meshMeta = query_1.default.queryAssetMeta(meshRenderer.mesh.uuid);
                // 如果 fbx 自身含有 lod，meshMeta 里记录相应的 lod 层级
                meshMeta.userData.lodLevel = lodLevel;
                // 获取 mesh 面数
                const mesh = glTFConverter.createMesh(meshMeta.userData.gltfIndex, generateLightmapUVNode);
                mesh.struct.primitives?.forEach((subMesh) => {
                    if (subMesh && subMesh.indexView) {
                        meshTriangleCount += subMesh.indexView.count;
                    }
                });
                meshRendererTriangleCount += meshTriangleCount / 3;
            }
        }
    }
    if (node.children && node.children.length > 0) {
        for (const childNode of node.children) {
            const childCount = await deepFindMeshRenderer(childNode, glTFConverter, lodLevel, generateLightmapUVNode);
            return meshRendererTriangleCount + childCount;
        }
    }
    return meshRendererTriangleCount;
}
async function loadLODs(gltfUserData, sceneNode, gltfConverter) {
    const LODsOptionArr = [];
    const triangleCounts = [];
    // 获取模型以 LOD# 结尾的节点，计算 lod 层级节点下的所有 mesh 的减面数总和
    for (const child of sceneNode.children) {
        const lodArr = /LOD(\d+)$/i.exec(child.name);
        if (lodArr && lodArr.length > 1) {
            const index = parseInt(lodArr[1], 10);
            // 只取 7 层
            if (index <= maxLodLevel) {
                LODsOptionArr[index] = LODsOptionArr[index] || Object.assign({}, defaultLODsOptions);
                triangleCounts[index] =
                    (triangleCounts[index] || 0) +
                        (await deepFindMeshRenderer(child, gltfConverter, index, gltfUserData.generateLightmapUVNode));
            }
        }
    }
    if (LODsOptionArr.length > 0) {
        const maxLod = Math.max(...Object.keys(LODsOptionArr).map((key) => +key));
        // 屏占比从 0.25 逐级减半
        let screenRatio = 0.25;
        for (let index = 0; index < maxLod; index++) {
            // 填充 LOD 层级，maxLod 层级肯定存在
            if (!LODsOptionArr[index]) {
                console.debug(`No mesh name are ending with LOD${index}`);
                LODsOptionArr[index] = Object.assign({}, defaultLODsOptions);
            }
            // 计算 screenRatio faceCount
            LODsOptionArr[index].screenRatio = screenRatio;
            screenRatio /= 2;
            // 每个层级 triangle 和 LOD0 的比值
            if (triangleCounts[0] !== 0) {
                LODsOptionArr[index].faceCount = triangleCounts[index] / triangleCounts[0];
            }
        }
        // screenRatio 最后一层小于 1%，以计算结果为准。如果大于1，则用 1% 作为最后一个层级的屏占比
        LODsOptionArr[maxLod].screenRatio = screenRatio < 0.01 ? screenRatio : 0.01;
        LODsOptionArr[maxLod].faceCount = triangleCounts[0] ? triangleCounts[maxLod] / triangleCounts[0] : 0;
    }
    return LODsOptionArr;
}
async function generateDefaultLODsOption() {
    const LODsOptionArr = [];
    // 生成默认 screenRatio faceCount
    const defaultScreenRatioArr = [0.25, 0.125, 0.01], defaultFaceCountArr = [1, 0.25, 0.1];
    for (let index = 0; index < 3; index++) {
        LODsOptionArr[index] = {
            screenRatio: defaultScreenRatioArr[index],
            faceCount: defaultFaceCountArr[index],
        };
    }
    return LODsOptionArr;
}
/**
 * 为glTF子资源数组中的所有子资源生成在子资源数组中独一无二的名字，这个名字可用作EditorAsset的名称以及文件系统上的文件名。
 * @param gltfFileBaseName glTF文件名，不含扩展名部分。
 * @param assetsArray glTF子资源数组。
 * @param extension 附加的扩展名。该扩展名将作为后缀附加到结果名字上。
 * @param options.preferedFileBaseName 尽可能地使用glTF文件本身的名字而不是glTF子资源本身的名称来生成结果。
 */
function makeUniqueSubAssetNames(gltfFileBaseName, assetsArray, finderKind, extension) {
    const getBaseNameIfNoName = () => {
        switch (finderKind) {
            case 'animations':
                return 'UnnamedAnimation';
            case 'images':
                return 'UnnamedImage';
            case 'meshes':
                return 'UnnamedMesh';
            case 'materials':
                return 'UnnamedMaterial';
            case 'skeletons':
                return 'UnnamedSkeleton';
            case 'textures':
                return 'UnnamedTexture';
            default:
                return 'Unnamed';
        }
    };
    let names = assetsArray.map((asset) => {
        let unchecked;
        if (finderKind === 'scenes') {
            unchecked = gltfFileBaseName;
        }
        else if (typeof asset.name === 'string') {
            unchecked = asset.name;
        }
        else {
            unchecked = getBaseNameIfNoName();
        }
        return unchecked;
    });
    if (!isDifferWithEachOther(names)) {
        let tail = '-';
        while (true) {
            if (names.every((name) => !name.endsWith(tail))) {
                break;
            }
            tail += '-';
        }
        names = names.map((name, index) => name + `${tail}${index}`);
    }
    return names.map((name) => name + extension);
}
function isDifferWithEachOther(values) {
    if (values.length >= 2) {
        const sorted = values.slice().sort();
        for (let i = 0; i < sorted.length - 1; ++i) {
            if (sorted[i] === sorted[i + 1]) {
                return false;
            }
        }
    }
    return true;
}
async function migrateImageLocations(asset) {
    const oldMeta = asset.meta.userData;
    const imageMetas = [];
    if (oldMeta.imageLocations) {
        const { imageLocations } = oldMeta;
        for (const imageName of Object.keys(imageLocations)) {
            const imageLocation = imageLocations[imageName];
            if (imageLocation.targetDatabaseUrl) {
                imageMetas.push({
                    name: imageName,
                    remap: imageLocation.targetDatabaseUrl,
                });
            }
        }
        delete oldMeta.imageLocations;
    }
    asset.meta.userData.imageMetas = imageMetas;
    if (oldMeta.assetFinder && oldMeta.assetFinder.images) {
        delete oldMeta.assetFinder.images;
    }
}
async function migrateImageRemap(asset) {
    const oldMeta = asset.meta.userData;
    if (!oldMeta.imageMetas) {
        return;
    }
    for (const imageMeta of oldMeta.imageMetas) {
        const { remap } = imageMeta;
        if (!remap) {
            continue;
        }
        const uuid = (0, asset_db_1.queryUUID)(remap);
        if (!uuid) {
            continue;
        }
        else {
            imageMeta.remap = uuid;
        }
    }
}
/**
 * 如果使用了 dumpMaterial，并且生成目录带有 FBX
 * 就需要改名，并重新导入新的 material
 * @param asset gltf 资源
 */
async function migrateDumpMaterial(asset) {
    if (!asset.userData.dumpMaterials || asset.userData.materialDumpDir) {
        return;
    }
    const old = path.join(asset.source, `../Materials${asset.basename}.FBX`);
    const oldMeta = path.join(asset.source, `../Materials${asset.basename}.FBX.meta`);
    const current = path.join(asset.source, `../Materials${asset.basename}`);
    const currentMeta = path.join(asset.source, `../Materials${asset.basename}.meta`);
    if (fs.existsSync(old) && !fs.existsSync(current)) {
        fs.renameSync(old, current);
        if (fs.existsSync(oldMeta)) {
            fs.renameSync(oldMeta, currentMeta);
        }
        asset._assetDB.refresh(current);
    }
}
/**
 * 从 FBX 导入器 2.0 开始，新增了 `legacyFbxHandler` 字段用来确定是
 * 使用旧的 `FBX2glTF` 还是 `FBX-glTF-conv`。
 * 当低于 2.0 版本的资源迁移上来时，默认使用旧版本的。
 * 但是所有新资源的创建将使用新版本的。
 */
async function migrateFbxConverterSelector(asset) {
    if (asset.extname !== '.fbx') {
        return;
    }
    asset.userData.legacyFbxImporter = true;
}
/**
 * FBX 导入器 v1.0.0-alpha.12 开始引入了 `--unit-conversion` 选项，并且默认使用了 `geometry-level`，
 * 而之前使用的是 `hierarchy-level`。
 *
 * @param asset
 */
async function migrateFbxConverterUnitConversion(asset) {
    if (asset.extname !== '.fbx') {
        return;
    }
    const userData = asset.userData;
    if (userData.legacyFbxImporter) {
        return;
    }
    // @ts-ignore
    (userData.fbx ??= {}).unitConversion = 'hierarchy-level';
}
/**
 * FBX 导入器 v1.0.0-alpha.27 开始引入了 `--prefer-local-time-span` 选项，并且默认使用了 `true`，
 * 而之前使用的是 `false`。
 *
 * @param asset
 */
async function migrateFbxConverterPreferLocalTimeSpan(asset) {
    if (asset.extname !== '.fbx') {
        return;
    }
    const userData = asset.userData;
    if (userData.legacyFbxImporter) {
        return;
    }
    // @ts-ignore
    (userData.fbx ??= {}).preferLocalTimeSpan = false;
}
/**
 * FBX 导入器 3.5.1 引入了 `smartMaterialEnabled` 属性,这个属性在旧版本的资源中是默认关闭的.
 *
 * @param asset
 */
async function migrateSmartMaterialEnabled(asset) {
    if (asset.extname !== '.fbx') {
        return;
    }
    const userData = asset.userData;
    (userData.fbx ??= {}).smartMaterialEnabled = false;
}
/**
 * 在 3.6.x，glTF 也需要增加 `promoteSingleRootNode` 选项。所以我们把之前专属于 FBX 的直接迁移过来。
 * 见：https://github.com/cocos/cocos-engine/issues/11858
 */
async function migrateFBXPromoteSingleRootNode(asset) {
    if (asset.extname !== '.fbx') {
        return;
    }
    // 迁移前的 UserData 数据格式
    const userData = asset.userData;
    if (userData.fbx?.promoteSingleRootNode) {
        userData.promoteSingleRootNode = userData.fbx.promoteSingleRootNode;
        delete userData.fbx.promoteSingleRootNode;
    }
}
/**
 * 3.7.0 引入了新的减面算法，选项与之前完全不同，需要对字段存储做调整
 * @param asset
 */
function migrateMeshOptimizerOption(asset) {
    const userData = asset.userData;
    // 使用过原来的减面算法，先保存数据，再移除旧数据
    if (!userData.meshOptimizer) {
        return;
    }
    userData.meshOptimizer = {
        algorithm: 'gltfpack',
        enable: true,
        // @ts-ignore
        gltfpackOptions: userData.meshOptimizerOptions || {},
    };
    // 直接移除旧数据
    // @ts-ignore
    delete userData.meshOptimizerOptions;
}
function migrateFbxMatchMeshNames(asset) {
    if (asset.extname !== '.fbx') {
        return;
    }
    const userData = asset.userData;
    (userData.fbx ??= {}).matchMeshNames = false;
}
/**
 * 3.8.1 引入了新的减面选项，需要对字段存储做调整
 */
function migrateMeshSimplifyOption(asset) {
    const userData = asset.userData;
    // 使用过原来的减面算法，先保存数据，再移除旧数据
    if (!userData.meshOptimizer) {
        return;
    }
    const optimizer = userData.meshOptimizer;
    const options = optimizer.simplifyOptions;
    userData.meshSimplify = {
        enable: optimizer.enable,
        targetRatio: options?.targetRatio || 1,
    };
    delete userData.meshOptimizer;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2x0Zi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2Fzc2V0cy9hc3NldC1oYW5kbGVyL2Fzc2V0cy9nbHRmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTA1QkEsZ0VBZUM7QUFFRCw0REFNQztBQUtELDhEQWdCQztBQXQ4QkQsOENBQXdFO0FBQ3hFLG1DQUF3QztBQUN4Qyw2Q0FBK0I7QUFDL0IsMkNBQTZCO0FBQzdCLGtEQUF3QjtBQUN4Qiw4Q0FBc0I7QUFFdEIsc0RBQTJFO0FBQzNFLDhDQUErQztBQUMvQywwREFBMEQ7QUFTMUQsaURBQW1FO0FBQ25FLDJCQUF1RDtBQUV2RCw2RUFBdUU7QUFDdkUsaUVBQWdFO0FBQ2hFLGtFQUE0RTtBQUM1RSwrQkFBaUQ7QUFFakQsb0NBQTZDO0FBQzdDLHNEQUFnRTtBQUdoRSx5Q0FBa0U7QUFFbEUsZ0VBQTZDO0FBQzdDLHNFQUE2QztBQUc3QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFakMsd0JBQXdCO0FBQ3hCLHlCQUF5QjtBQUN6QixNQUFNO0FBQ04sdUdBQXVHO0FBQ3ZHLDhDQUE4QztBQUM5Qyw2Q0FBNkM7QUFFaEMsUUFBQSxXQUFXLEdBQXFCO0lBQ3pDLGdDQUFnQztJQUNoQyxJQUFJLEVBQUUsTUFBTTtJQUVaLFFBQVEsRUFBRTtRQUNOLG1CQUFtQjtRQUNuQixPQUFPLEVBQUUsUUFBUTtRQUNqQixXQUFXLEVBQUUsQ0FBQztRQUVkOzs7Ozs7O1dBT0c7UUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQVk7WUFDckIsTUFBTSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUIsT0FBTyxNQUFNLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFDRCxLQUFLLENBQUMsb0JBQW9C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LENBQUMsb0JBQW9CLENBQUM7QUFDekMsQ0FBQztBQUVELFNBQWdCLHdCQUF3QixDQUFDLEtBQVk7SUFDakQsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLE1BQU0sRUFBRSxDQUFDO1FBQzNCLE9BQU87SUFDWCxDQUFDO0lBQ0QsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQXdCLENBQUM7SUFDaEQsQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7QUFDakQsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IseUJBQXlCLENBQUMsS0FBWTtJQUNsRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBd0IsQ0FBQztJQUNoRCwwQkFBMEI7SUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUMxQixPQUFPO0lBQ1gsQ0FBQztJQUVELE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUM7SUFDekMsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQztJQUUxQyxRQUFRLENBQUMsWUFBWSxHQUFHO1FBQ3BCLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTTtRQUN4QixXQUFXLEVBQUUsT0FBTyxFQUFFLFdBQVcsSUFBSSxDQUFDO0tBQ3pDLENBQUM7SUFFRixPQUFPLFFBQVEsQ0FBQyxhQUFhLENBQUM7QUFDbEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0LCBxdWVyeVBhdGgsIHF1ZXJ5VXJsLCBxdWVyeVVVSUQgfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgeyBBc3NlcnRpb25FcnJvciB9IGZyb20gJ2Fzc2VydCc7XHJcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IFVSSSBmcm9tICd1cmlqcyc7XHJcbmltcG9ydCBVUkwgZnJvbSAndXJsJztcclxuaW1wb3J0IHsgQW5pbWF0aW9uLCBNYXRlcmlhbCwgTWVzaCwgU2tpbiB9IGZyb20gJy4uLy4uL0B0eXBlcy9nbFRGJztcclxuaW1wb3J0IHsgRGVmYXVsdEdsdGZBc3NldEZpbmRlciwgTXlGaW5kZXJLaW5kIH0gZnJvbSAnLi9nbHRmL2Fzc2V0LWZpbmRlcic7XHJcbmltcG9ydCB7IGR1bXBNYXRlcmlhbCB9IGZyb20gJy4vZ2x0Zi9tYXRlcmlhbCc7XHJcbmltcG9ydCB7IGdsVGZSZWFkZXJNYW5hZ2VyIH0gZnJvbSAnLi9nbHRmL3JlYWRlci1tYW5hZ2VyJztcclxuaW1wb3J0IHsgR2x0ZkNvbnZlcnRlciwgR2x0ZlN1YkFzc2V0IH0gZnJvbSAnLi91dGlscy9nbHRmLWNvbnZlcnRlcic7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgQW5pbWF0aW9uSW1wb3J0U2V0dGluZyxcclxuICAgIEdsVEZVc2VyRGF0YSxcclxuICAgIEltYWdlTWV0YSxcclxuICAgIExPRHNPcHRpb24sXHJcbn0gZnJvbSAnLi4vLi4vQHR5cGVzL3VzZXJEYXRhcyc7XHJcbmltcG9ydCB7IGNvbnZlcnRzRW5jb2RlZFNlcGFyYXRvcnNJblVSSSB9IGZyb20gJy4vdXRpbHMvdXJpLXV0aWxzJztcclxuaW1wb3J0IHsgQW5pbWF0aW9uQ2xpcCwgTWVzaFJlbmRlcmVyLCBOb2RlIH0gZnJvbSAnY2MnO1xyXG5cclxuaW1wb3J0IHsgcmVzb2x2ZUdsVGZJbWFnZVBhdGggfSBmcm9tICcuL3V0aWxzL3Jlc29sdmUtZ2xURi1pbWFnZS1wYXRoJztcclxuaW1wb3J0IHsgc2VyaWFsaXplRm9yTGlicmFyeSB9IGZyb20gJy4vdXRpbHMvc2VyaWFsaXplLWxpYnJhcnknO1xyXG5pbXBvcnQgeyBnZXRPcmlnaW5hbEFuaW1hdGlvbkxpYnJhcnlQYXRoIH0gZnJvbSAnLi9nbHRmL29yaWdpbmFsLWFuaW1hdGlvbic7XHJcbmltcG9ydCB7IGlzQWJzb2x1dGUsIHJlbGF0aXZlLCBzZXAgfSBmcm9tICdwYXRoJztcclxuXHJcbmltcG9ydCB7IGdldERlcGVuZFVVSURMaXN0IH0gZnJvbSAnLi4vdXRpbHMnO1xyXG5pbXBvcnQgeyBnZXREZWZhdWx0U2ltcGxpZnlPcHRpb25zIH0gZnJvbSAnLi9nbHRmL21lc2hTaW1wbGlmeSc7XHJcbmltcG9ydCB7IEFzc2V0SGFuZGxlciwgQXNzZXRIYW5kbGVyQmFzZSB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBmb3JrIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XHJcbmltcG9ydCB7IG1ha2VEZWZhdWx0VGV4dHVyZTJEQXNzZXRVc2VyRGF0YSB9IGZyb20gJy4vaW1hZ2UvdXRpbHMnO1xyXG5pbXBvcnQgeyBUZXh0dXJlMkRBc3NldFVzZXJEYXRhLCBHbHRmQW5pbWF0aW9uQXNzZXRVc2VyRGF0YSB9IGZyb20gJy4uLy4uL0B0eXBlcy91c2VyRGF0YXMnO1xyXG5pbXBvcnQgYXNzZXRRdWVyeSBmcm9tICcuLi8uLi9tYW5hZ2VyL3F1ZXJ5JztcclxuaW1wb3J0IGFzc2V0Q29uZmlnIGZyb20gJy4uLy4uL2Fzc2V0LWNvbmZpZyc7XHJcbmltcG9ydCB7IEdsb2JhbFBhdGhzIH0gZnJvbSAnLi4vLi4vLi4vLi4vZ2xvYmFsJztcclxuXHJcbmNvbnN0IGxvZGFzaCA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xyXG5cclxuLy8gY29uc3QgYWp2ID0gbmV3IEFqdih7XHJcbi8vICAgICBlcnJvckRhdGFQYXRoOiAnJyxcclxuLy8gfSk7XHJcbi8vIGNvbnN0IHNjaGVtYUZpbGUgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnLi4nLCAnLi4nLCAnZGlzdCcsICdtZXRhLXNjaGVtYXMnLCAnZ2xURi5tZXRhLmpzb24nKTtcclxuLy8gY29uc3Qgc2NoZW1hID0gZnMucmVhZEpTT05TeW5jKHNjaGVtYUZpbGUpO1xyXG4vLyBjb25zdCBtZXRhVmFsaWRhdG9yID0gYWp2LmNvbXBpbGUoc2NoZW1hKTtcclxuXHJcbmV4cG9ydCBjb25zdCBHbHRmSGFuZGxlcjogQXNzZXRIYW5kbGVyQmFzZSA9IHtcclxuICAgIC8vIEhhbmRsZXIg55qE5ZCN5a2X77yM55So5LqO5oyH5a6aIEhhbmRsZXIgYXMg562JXHJcbiAgICBuYW1lOiAnZ2x0ZicsXHJcblxyXG4gICAgaW1wb3J0ZXI6IHtcclxuICAgICAgICAvLyDniYjmnKzlj7flpoLmnpzlj5jmm7TvvIzliJnkvJrlvLrliLbph43mlrDlr7zlhaVcclxuICAgICAgICB2ZXJzaW9uOiAnMi4zLjE0JyxcclxuICAgICAgICB2ZXJzaW9uQ29kZTogMyxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5a6e6ZmF5a+85YWl5rWB56iLXHJcbiAgICAgICAgICog6ZyA6KaB6Ieq5bex5o6n5Yi25piv5ZCm55Sf5oiQ44CB5ou36LSd5paH5Lu2XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiDov5Tlm57mmK/lkKblr7zlhaXmiJDlip/nmoQgYm9vbGVhblxyXG4gICAgICAgICAqIOWmguaenOi/lOWbniBmYWxzZe+8jOWImeS4i+asoeWQr+WKqOi/mOS8mumHjeaWsOWvvOWFpVxyXG4gICAgICAgICAqIEBwYXJhbSBhc3NldFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFzeW5jIGltcG9ydChhc3NldDogQXNzZXQpIHtcclxuICAgICAgICAgICAgYXdhaXQgdmFsaWRhdGVNZXRhKGFzc2V0KTtcclxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IGltcG9ydFN1YkFzc2V0cyhhc3NldCwgdGhpcy52ZXJzaW9uKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFzeW5jIGFmdGVyU3ViQXNzZXRzSW1wb3J0KGFzc2V0OiBBc3NldCkge1xyXG4gICAgICAgICAgICBhd2FpdCBnbFRmUmVhZGVyTWFuYWdlci5kZWxldGUoYXNzZXQpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG59O1xyXG5leHBvcnQgZGVmYXVsdCBHbHRmSGFuZGxlcjtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlTWV0YShhc3NldDogQXNzZXQpIHtcclxuICAgIC8vIGFzc2V0Lm1ldGEudXNlckRhdGEuaW1hZ2VNZXRhcyA/Pz0gW107XHJcbiAgICAvLyBjb25zdCBtZXRhVmFsaWRhdGlvbiA9IGF3YWl0IG1ldGFWYWxpZGF0b3IoYXNzZXQubWV0YS51c2VyRGF0YSk7XHJcbiAgICAvLyBpZiAoIW1ldGFWYWxpZGF0aW9uKSB7XHJcbiAgICAvLyAgICAgaWYgKE9iamVjdC5rZXlzKGFzc2V0Lm1ldGEudXNlckRhdGEpLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgLy8gICAgICAgICBjb25zb2xlLmRlYnVnKFxyXG4gICAgLy8gICAgICAgICAgICAgJ01ldGEgZmlsZSBvZiBhc3NldCAnICtcclxuICAgIC8vICAgICAgICAgICAgIGFzc2V0LnNvdXJjZSArXHJcbiAgICAvLyAgICAgICAgICAgICAnIGlzIGRhbWFnZWQ6IFxcbicgK1xyXG4gICAgLy8gICAgICAgICAgICAgKG1ldGFWYWxpZGF0b3IuZXJyb3JzIHx8IFtdKS5tYXAoKGVycm9yKSA9PiBlcnJvci5tZXNzYWdlKSArXHJcbiAgICAvLyAgICAgICAgICAgICAnXFxuQSBkZWZhdWx0IG1ldGEgZmlsZSBpcyBwYXRjaGVkLicsXHJcbiAgICAvLyAgICAgICAgICk7XHJcbiAgICAvLyAgICAgfVxyXG4gICAgY29uc3QgZGVmYXVsdE1ldGE6IEdsVEZVc2VyRGF0YSA9IHtcclxuICAgICAgICBpbWFnZU1ldGFzOiBbXSxcclxuICAgICAgICBsZWdhY3lGYnhJbXBvcnRlcjogZmFsc2UsXHJcbiAgICAgICAgYWxsb3dNZXNoRGF0YUFjY2VzczogdHJ1ZSxcclxuICAgICAgICBhZGRWZXJ0ZXhDb2xvcjogZmFsc2UsXHJcbiAgICAgICAgZ2VuZXJhdGVMaWdodG1hcFVWTm9kZTogZmFsc2UsXHJcbiAgICAgICAgbWVzaE9wdGltaXplcjoge1xyXG4gICAgICAgICAgICBlbmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBhbGdvcml0aG06ICdzaW1wbGlmeScsXHJcbiAgICAgICAgICAgIHNpbXBsaWZ5T3B0aW9uczogZ2V0RGVmYXVsdFNpbXBsaWZ5T3B0aW9ucygpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbG9kczoge1xyXG4gICAgICAgICAgICBlbmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBoYXNCdWlsdGluTE9EOiBmYWxzZSxcclxuICAgICAgICAgICAgb3B0aW9uczogW10sXHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcbiAgICAvLyBUT0RPIOeUseS6juebruWJjei1hOa6kOeVjOmdoue8lui+keeahOmDqOWIhum7mOiupOWAvOaYr+iHquihjOe8luWGmeeahO+8jOW+iOWuueaYk+WHuueOsOatpOexu+m7mOiupOWAvOaciee8uuWkseeahOaDheWGte+8jOihpem9kOWNs+WPr1xyXG4gICAgYXNzZXQubWV0YS51c2VyRGF0YSA9IGxvZGFzaC5kZWZhdWx0c0RlZXAoYXNzZXQubWV0YS51c2VyRGF0YSwgZGVmYXVsdE1ldGEpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBpbXBvcnRTdWJBc3NldHMoYXNzZXQ6IEFzc2V0LCBpbXBvcnRWZXJzaW9uOiBzdHJpbmcpIHtcclxuICAgIC8vIENyZWF0ZSB0aGUgY29udmVydGVyXHJcbiAgICBnbFRmUmVhZGVyTWFuYWdlci5kZWxldGUoYXNzZXQpO1xyXG4gICAgY29uc3QgZ2x0ZkNvbnZlcnRlciA9IGF3YWl0IGdsVGZSZWFkZXJNYW5hZ2VyLmdldE9yQ3JlYXRlKGFzc2V0LCBpbXBvcnRWZXJzaW9uLCB0cnVlKTtcclxuXHJcbiAgICBhd2FpdCBhZGp1c3RNZXRhKGFzc2V0LCBnbHRmQ29udmVydGVyKTtcclxuXHJcbiAgICBjb25zdCB1c2VyRGF0YSA9IGFzc2V0LnVzZXJEYXRhIGFzIEdsVEZVc2VyRGF0YTtcclxuXHJcbiAgICBjb25zdCBnbHRmQXNzZXRGaW5kZXIgPSBuZXcgRGVmYXVsdEdsdGZBc3NldEZpbmRlcih1c2VyRGF0YS5hc3NldEZpbmRlcik7XHJcblxyXG4gICAgLy8g5a+85YWlIGdsVEYg572R5qC844CCXHJcbiAgICBjb25zdCBtZXNoVVVJRHMgPSBhd2FpdCBpbXBvcnRNZXNoZXMoYXNzZXQsIGdsdGZDb252ZXJ0ZXIpO1xyXG4gICAgZ2x0ZkFzc2V0RmluZGVyLnNldCgnbWVzaGVzJywgbWVzaFVVSURzKTtcclxuXHJcbiAgICAvLyDkv53lrZjmiYDmnInljp/lp4vliqjnlLvvvIjmnKrliIblibLvvIlcclxuICAgIGF3YWl0IHNhdmVPcmlnaW5hbEFuaW1hdGlvbnMoYXNzZXQsIGdsdGZDb252ZXJ0ZXIsIHRydWUpO1xyXG5cclxuICAgIC8vIOWvvOWFpSBnbFRGIOWKqOeUu+OAglxyXG4gICAgY29uc3QgeyBhbmltYXRpb25JbXBvcnRTZXR0aW5ncyB9ID0gdXNlckRhdGE7XHJcbiAgICBpZiAoYW5pbWF0aW9uSW1wb3J0U2V0dGluZ3MpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGFuaW1hdGlvblNldHRpbmcgb2YgYW5pbWF0aW9uSW1wb3J0U2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBzcGxpdCBvZiBhbmltYXRpb25TZXR0aW5nLnNwbGl0cykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeyBwcmV2aW91c0lkLCBuYW1lLCBmcm9tLCB0bywgZnBzLCAuLi5yZW1haW4gfSA9IHNwbGl0O1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViQXNzZXQgPSBhd2FpdCBhc3NldC5jcmVhdGVTdWJBc3NldChgJHtuYW1lfS5hbmltYXRpb25gLCAnZ2x0Zi1hbmltYXRpb24nLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IHByZXZpb3VzSWQsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHNwbGl0LnByZXZpb3VzSWQgPSBzdWJBc3NldC5faWQ7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJBc3NldFVzZXJEYXRhID0gc3ViQXNzZXQudXNlckRhdGEgYXMgR2x0ZkFuaW1hdGlvbkFzc2V0VXNlckRhdGE7XHJcbiAgICAgICAgICAgICAgICBzdWJBc3NldFVzZXJEYXRhLmdsdGZJbmRleCA9IGFuaW1hdGlvbkltcG9ydFNldHRpbmdzLmluZGV4T2YoYW5pbWF0aW9uU2V0dGluZyk7XHJcbiAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHN1YkFzc2V0VXNlckRhdGEsIHJlbWFpbik7XHJcbiAgICAgICAgICAgICAgICBzdWJBc3NldFVzZXJEYXRhLnNhbXBsZSA9IGZwcyA/PyBhbmltYXRpb25TZXR0aW5nLmZwcztcclxuICAgICAgICAgICAgICAgIHN1YkFzc2V0VXNlckRhdGEuc3BhbiA9IHtcclxuICAgICAgICAgICAgICAgICAgICBmcm9tLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvLFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyDlr7zlhaUgZ2xURiDnmq7ogqTjgIJcclxuICAgIGNvbnN0IHNraW5VVUlEcyA9IGF3YWl0IGltcG9ydFNraW5zKGFzc2V0LCBnbHRmQ29udmVydGVyKTtcclxuICAgIGdsdGZBc3NldEZpbmRlci5zZXQoJ3NrZWxldG9ucycsIHNraW5VVUlEcyk7XHJcblxyXG4gICAgLy8g5a+85YWlIGdsVEYg5Zu+5YOP44CCXHJcbiAgICBhd2FpdCBpbXBvcnRJbWFnZXMoYXNzZXQsIGdsdGZDb252ZXJ0ZXIpO1xyXG5cclxuICAgIC8vIOWvvOWFpSBnbFRGIOi0tOWbvuOAglxyXG4gICAgY29uc3QgdGV4dHVyZVVVSURzID0gYXdhaXQgaW1wb3J0VGV4dHVyZXMoYXNzZXQsIGdsdGZDb252ZXJ0ZXIpO1xyXG4gICAgZ2x0ZkFzc2V0RmluZGVyLnNldCgndGV4dHVyZXMnLCB0ZXh0dXJlVVVJRHMpO1xyXG5cclxuICAgIC8vIOWvvOWFpSBnbFRGIOadkOi0qOOAglxyXG4gICAgY29uc3QgbWF0ZXJpYWxVVUlEcyA9IGF3YWl0IGltcG9ydE1hdGVyaWFscyhhc3NldCwgZ2x0ZkNvbnZlcnRlciwgZ2x0ZkFzc2V0RmluZGVyKTtcclxuICAgIGdsdGZBc3NldEZpbmRlci5zZXQoJ21hdGVyaWFscycsIG1hdGVyaWFsVVVJRHMpO1xyXG5cclxuICAgIC8vIOWvvOWFpSBnbFRGIOWcuuaZr+OAglxyXG4gICAgY29uc3Qgc2NlbmVVVUlEcyA9IGF3YWl0IGltcG9ydFNjZW5lcyhhc3NldCwgZ2x0ZkNvbnZlcnRlcik7XHJcbiAgICBnbHRmQXNzZXRGaW5kZXIuc2V0KCdzY2VuZXMnLCBzY2VuZVVVSURzKTtcclxuXHJcbiAgICAvLyDnrKzkuIDmrKHlr7zlhaXvvIzorr7nva7mmK/lkKYgZmJ4IOiHquW4piBsb2TvvIzmmK/lkKblvIDlkK9cclxuICAgIGlmIChzY2VuZVVVSURzLmxlbmd0aCAmJiAoIXVzZXJEYXRhLmxvZHMgfHwgIXVzZXJEYXRhLmxvZHMub3B0aW9ucyB8fCAhdXNlckRhdGEubG9kcy5vcHRpb25zLmxlbmd0aCkpIHtcclxuICAgICAgICBjb25zdCBhc3NldE1ldGEgPSBhc3NldFF1ZXJ5LnF1ZXJ5QXNzZXRNZXRhKHNjZW5lVVVJRHNbZ2x0ZkNvbnZlcnRlci5nbHRmLnNjZW5lIHx8IDBdKTtcclxuICAgICAgICBpZiAoYXNzZXRNZXRhKSB7XHJcbiAgICAgICAgICAgIC8vIOiOt+WPluiKgueCueS/oeaBr1xyXG4gICAgICAgICAgICBjb25zdCBzY2VuZU5vZGUgPSBnbHRmQ29udmVydGVyLmNyZWF0ZVNjZW5lKGFzc2V0TWV0YS51c2VyRGF0YS5nbHRmSW5kZXggfHwgMCwgZ2x0ZkFzc2V0RmluZGVyKTtcclxuICAgICAgICAgICAgY29uc3QgYnVpbHRpbkxPRHNPcHRpb24gPSBhd2FpdCBsb2FkTE9Ecyh1c2VyRGF0YSwgc2NlbmVOb2RlLCBnbHRmQ29udmVydGVyKTtcclxuICAgICAgICAgICAgY29uc3QgaGFzTE9EcyA9IGJ1aWx0aW5MT0RzT3B0aW9uLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgIHVzZXJEYXRhLmxvZHMgPSB7XHJcbiAgICAgICAgICAgICAgICBlbmFibGU6IGhhc0xPRHMsXHJcbiAgICAgICAgICAgICAgICBoYXNCdWlsdGluTE9EOiBoYXNMT0RzLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczogaGFzTE9EcyA/IGJ1aWx0aW5MT0RzT3B0aW9uIDogYXdhaXQgZ2VuZXJhdGVEZWZhdWx0TE9Ec09wdGlvbigpLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodXNlckRhdGEuZHVtcE1hdGVyaWFscyAmJiAhbWF0ZXJpYWxVVUlEcy5ldmVyeSgodXVpZCkgPT4gdXVpZCAhPT0gbnVsbCkpIHtcclxuICAgICAgICBjb25zb2xlLmRlYnVnKCdXYWl0aW5nIGZvciBkZXBlbmRlbmN5IG1hdGVyaWFscy4uLicpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIC8vIOS/neWtmCBBc3NldEZpbmRlcuOAglxyXG4gICAgdXNlckRhdGEuYXNzZXRGaW5kZXIgPSBnbHRmQXNzZXRGaW5kZXIuc2VyaWFsaXplKCk7XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGFkanVzdE1ldGEoYXNzZXQ6IEFzc2V0LCBnbFRGQ29udmVydGVyOiBHbHRmQ29udmVydGVyKSB7XHJcbiAgICBjb25zdCBtZXRhID0gYXNzZXQudXNlckRhdGEgYXMgR2xURlVzZXJEYXRhO1xyXG5cclxuICAgIGNvbnN0IGdsVEZJbWFnZXMgPSBnbFRGQ29udmVydGVyLmdsdGYuaW1hZ2VzO1xyXG4gICAgaWYgKCFnbFRGSW1hZ2VzKSB7XHJcbiAgICAgICAgbWV0YS5pbWFnZU1ldGFzID0gW107XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IG9sZEltYWdlTWV0YXMgPSBtZXRhLmltYWdlTWV0YXM7XHJcbiAgICAgICAgY29uc3QgaW1hZ2VNZXRhcyA9IGdsVEZJbWFnZXMubWFwKChnbFRGSW1hZ2U6IGFueSwgaW5kZXg6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpbWFnZU1ldGE6IEltYWdlTWV0YSA9IHt9O1xyXG4gICAgICAgICAgICBpZiAoZ2xURkltYWdlLm5hbWUpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBpbWFnZSBoYXMgbmFtZSwgd2UgZmluZCBvbGQgcmVtYXAgYWNjb3JkaW5nIHRoZSBuYW1lLlxyXG4gICAgICAgICAgICAgICAgaW1hZ2VNZXRhLm5hbWUgPSBnbFRGSW1hZ2UubmFtZTtcclxuICAgICAgICAgICAgICAgIGlmIChvbGRJbWFnZU1ldGFzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xkSW1hZ2VNZXRhID0gb2xkSW1hZ2VNZXRhcy5maW5kKChyZW1hcCkgPT4gcmVtYXAucmVtYXAgJiYgcmVtYXAubmFtZSAmJiByZW1hcC5uYW1lID09PSBpbWFnZU1ldGEubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9sZEltYWdlTWV0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZU1ldGEucmVtYXAgPSBvbGRJbWFnZU1ldGEucmVtYXA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgICAgICAgICAgb2xkSW1hZ2VNZXRhcyAmJlxyXG4gICAgICAgICAgICAgICAgZ2xURkltYWdlcy5sZW5ndGggPT09IG9sZEltYWdlTWV0YXMubGVuZ3RoICYmXHJcbiAgICAgICAgICAgICAgICAhb2xkSW1hZ2VNZXRhc1tpbmRleF0ubmFtZSAmJlxyXG4gICAgICAgICAgICAgICAgb2xkSW1hZ2VNZXRhc1tpbmRleF0ucmVtYXBcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIGlmIHRoZSByZW1hcHMgY291bnQgYXJlIHNhbWUsIGFuZCB0aGUgY29ycmVzcG9uZGluZyBvbGQgcmVtYXAgYWxzbyBoYXMgbm8gbmFtZSxcclxuICAgICAgICAgICAgICAgIC8vIHdlIGNhbiBzdXBwb3NlIHRoZXkgYXJlIGZvciB0aGUgc2FtZSBpbWFnZS5cclxuICAgICAgICAgICAgICAgIGltYWdlTWV0YS5yZW1hcCA9IG9sZEltYWdlTWV0YXNbaW5kZXhdLnJlbWFwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBpbWFnZU1ldGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbWV0YS5pbWFnZU1ldGFzID0gaW1hZ2VNZXRhcztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBnbFRGQW5pbWF0aW9ucyA9IGdsVEZDb252ZXJ0ZXIuZ2x0Zi5hbmltYXRpb25zO1xyXG4gICAgaWYgKCFnbFRGQW5pbWF0aW9ucykge1xyXG4gICAgICAgIGRlbGV0ZSBtZXRhLmFuaW1hdGlvbkltcG9ydFNldHRpbmdzO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyDlsJ3or5Xku47ml6fnmoTliqjnlLvorr7nva7kuK3or7vlj5bmlbDmja7jgIJcclxuICAgICAgICBjb25zdCBvbGRBbmltYXRpb25JbXBvcnRTZXR0aW5ncyA9IG1ldGEuYW5pbWF0aW9uSW1wb3J0U2V0dGluZ3MgfHwgW107XHJcbiAgICAgICAgY29uc3Qgc3BsaXROYW1lcyA9IG1ha2VVbmlxdWVTdWJBc3NldE5hbWVzKGFzc2V0LmJhc2VuYW1lLCBnbFRGQW5pbWF0aW9ucywgJ2FuaW1hdGlvbnMnLCAnJyk7XHJcbiAgICAgICAgY29uc3QgbmV3QW5pbWF0aW9uSW1wb3J0U2V0dGluZ3MgPSBnbFRGQW5pbWF0aW9ucy5tYXAoKGdsdGZBbmltYXRpb246IGFueSwgYW5pbWF0aW9uSW5kZXg6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9IGdsVEZDb252ZXJ0ZXIuZ2V0QW5pbWF0aW9uRHVyYXRpb24oYW5pbWF0aW9uSW5kZXgpO1xyXG4gICAgICAgICAgICBjb25zdCBzcGxpdE5hbWUgPSBnbHRmQW5pbWF0aW9uLm5hbWUgfHwgc3BsaXROYW1lc1thbmltYXRpb25JbmRleF07XHJcbiAgICAgICAgICAgIGxldCBkZWZhdWx0U3BsaXROYW1lID0gc3BsaXROYW1lO1xyXG4gICAgICAgICAgICBpZiAoZ2xURkFuaW1hdGlvbnMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBiYXNlTmFtZU5vRXh0ID0gcGF0aC5iYXNlbmFtZShhc3NldC5iYXNlbmFtZSwgcGF0aC5leHRuYW1lKGFzc2V0LmJhc2VuYW1lKSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0cyA9IGJhc2VOYW1lTm9FeHQuc3BsaXQoJ0AnKTtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFNwbGl0TmFtZSA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGFuaW1hdGlvblNldHRpbmc6IEFuaW1hdGlvbkltcG9ydFNldHRpbmcgPSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBzcGxpdE5hbWUsXHJcbiAgICAgICAgICAgICAgICBkdXJhdGlvbixcclxuICAgICAgICAgICAgICAgIGZwczogMzAsXHJcbiAgICAgICAgICAgICAgICBzcGxpdHM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGRlZmF1bHRTcGxpdE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBkdXJhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgd3JhcE1vZGU6IEFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuTG9vcCxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgbGV0IG9sZEFuaW1hdGlvblNldHRpbmcgPSBvbGRBbmltYXRpb25JbXBvcnRTZXR0aW5ncy5maW5kKFxyXG4gICAgICAgICAgICAgICAgKG9sZEltcG9ydFNldHRpbmcpID0+IG9sZEltcG9ydFNldHRpbmcubmFtZSA9PT0gYW5pbWF0aW9uU2V0dGluZy5uYW1lLFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAoIW9sZEFuaW1hdGlvblNldHRpbmcgJiYgb2xkQW5pbWF0aW9uSW1wb3J0U2V0dGluZ3MubGVuZ3RoID09PSBnbHRmQW5pbWF0aW9uLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgb2xkQW5pbWF0aW9uU2V0dGluZyA9IG9sZEFuaW1hdGlvbkltcG9ydFNldHRpbmdzW2FuaW1hdGlvbkluZGV4XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob2xkQW5pbWF0aW9uU2V0dGluZykge1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uU2V0dGluZy5mcHMgPSBvbGRBbmltYXRpb25TZXR0aW5nLmZwcztcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRyeUFkanVzdCA9IChvbGRUaW1lOiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAob2xkVGltZSA9PT0gb2xkQW5pbWF0aW9uU2V0dGluZyEuZHVyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQSBsaXR0bGUgb3B0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZHVyYXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSXQgc2hvdWxkIG5vdCBleGNlZWQgdGhlIG5ldyBkdXJhdGlvbi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWluKG9sZFRpbWUsIGR1cmF0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uU2V0dGluZy5zcGxpdHMgPSBvbGRBbmltYXRpb25TZXR0aW5nLnNwbGl0cy5tYXAoKHNwbGl0KTogQW5pbWF0aW9uSW1wb3J0U2V0dGluZ1snc3BsaXRzJ11bMF0gPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGFyZSB0cnlpbmcgdG8gYWRqdXN0IHRoZSBwcmV2aW91cyBzcGxpdFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvIGVuc3VyZSB0aGUgc3BsaXQgcmFuZ2UgYWx3YXlzIGZhbGxpbmcgaW4gbmV3IHJhbmdlIFswLCBkdXJhdGlvbl0uXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3BsaXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IHRyeUFkanVzdChzcGxpdC5mcm9tKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG86IHRyeUFkanVzdChzcGxpdC50byksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdyYXBNb2RlOiBzcGxpdC53cmFwTW9kZSA/PyBBbmltYXRpb25DbGlwLldyYXBNb2RlLkxvb3AsXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhbmltYXRpb25TZXR0aW5nO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1ldGEuYW5pbWF0aW9uSW1wb3J0U2V0dGluZ3MgPSBuZXdBbmltYXRpb25JbXBvcnRTZXR0aW5ncztcclxuICAgIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaW1wb3J0TWVzaGVzKGFzc2V0OiBBc3NldCwgZ2xURkNvbnZlcnRlcjogR2x0ZkNvbnZlcnRlcikge1xyXG4gICAgY29uc3QgZ2xURk1lc2hlcyA9IGdsVEZDb252ZXJ0ZXIuZ2x0Zi5tZXNoZXM7XHJcbiAgICBpZiAoZ2xURk1lc2hlcyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgY29uc3QgYXNzZXROYW1lcyA9IG1ha2VVbmlxdWVTdWJBc3NldE5hbWVzKGFzc2V0LmJhc2VuYW1lLCBnbFRGTWVzaGVzLCAnbWVzaGVzJywgJy5tZXNoJyk7XHJcbiAgICBjb25zdCBtZXNoQXJyYXkgPSBbXTtcclxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBnbFRGTWVzaGVzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIGNvbnN0IGdsVEZNZXNoID0gZ2xURk1lc2hlc1tpbmRleF07XHJcbiAgICAgICAgY29uc3Qgc3ViQXNzZXQgPSBhd2FpdCBhc3NldC5jcmVhdGVTdWJBc3NldChhc3NldE5hbWVzW2luZGV4XSwgJ2dsdGYtbWVzaCcpO1xyXG4gICAgICAgIHN1YkFzc2V0LnVzZXJEYXRhLmdsdGZJbmRleCA9IGluZGV4O1xyXG4gICAgICAgIG1lc2hBcnJheS5wdXNoKHN1YkFzc2V0LnV1aWQpO1xyXG4gICAgfVxyXG4gICAgLy8g5re75Yqg5paw55qEIG1lc2gg5a2Q6LWE5rqQXHJcbiAgICBjb25zdCB1c2VyRGF0YSA9IGFzc2V0LnVzZXJEYXRhIGFzIEdsVEZVc2VyRGF0YTtcclxuICAgIGlmICh1c2VyRGF0YS5sb2RzICYmICF1c2VyRGF0YS5sb2RzLmhhc0J1aWx0aW5MT0QgJiYgdXNlckRhdGEubG9kcy5lbmFibGUpIHtcclxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYXNzZXROYW1lcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgY29uc3QgbG9kc09wdGlvbiA9IHVzZXJEYXRhLmxvZHMub3B0aW9ucztcclxuICAgICAgICAgICAgLy8gTE9EMCDkuI3pnIDopoHnlJ/miJDlpITnkIZcclxuICAgICAgICAgICAgZm9yIChsZXQga2V5SW5kZXggPSAxOyBrZXlJbmRleCA8IGxvZHNPcHRpb24ubGVuZ3RoOyBrZXlJbmRleCsrKSB7XHJcbiAgICAgICAgICAgICAgICAvLyDmlrAgbWVzaCDlrZDotYTmupDlkI3np7BcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1N1YkFzc2V0TmFtZSA9IGFzc2V0TmFtZXNbaW5kZXhdLnNwbGl0KCcubWVzaCcpWzBdICsgYExPRCR7a2V5SW5kZXh9Lm1lc2hgO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3U3ViQXNzZXQgPSBhd2FpdCBhc3NldC5jcmVhdGVTdWJBc3NldChuZXdTdWJBc3NldE5hbWUsICdnbHRmLW1lc2gnKTtcclxuICAgICAgICAgICAgICAgIC8vIOiusOW9leS4gOS6m+aWsCBtZXNoIOWtkOi1hOa6kOaVsOaNrlxyXG4gICAgICAgICAgICAgICAgbmV3U3ViQXNzZXQudXNlckRhdGEuZ2x0ZkluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgICAgICAgICBuZXdTdWJBc3NldC51c2VyRGF0YS5sb2RMZXZlbCA9IGtleUluZGV4O1xyXG4gICAgICAgICAgICAgICAgbmV3U3ViQXNzZXQudXNlckRhdGEubG9kT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBmYWNlQ291bnQ6IGxvZHNPcHRpb25ba2V5SW5kZXhdLmZhY2VDb3VudCxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBtZXNoQXJyYXkucHVzaChuZXdTdWJBc3NldC51dWlkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBtZXNoQXJyYXk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGltcG9ydFNraW5zKGFzc2V0OiBBc3NldCwgZ2xURkNvbnZlcnRlcjogR2x0ZkNvbnZlcnRlcikge1xyXG4gICAgY29uc3QgZ2xURlNraW5zID0gZ2xURkNvbnZlcnRlci5nbHRmLnNraW5zO1xyXG4gICAgaWYgKGdsVEZTa2lucyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgY29uc3QgYXNzZXROYW1lcyA9IG1ha2VVbmlxdWVTdWJBc3NldE5hbWVzKGFzc2V0LmJhc2VuYW1lLCBnbFRGU2tpbnMsICdza2VsZXRvbnMnLCAnLnNrZWxldG9uJyk7XHJcbiAgICBjb25zdCBza2luQXJyYXkgPSBuZXcgQXJyYXkoZ2xURlNraW5zLmxlbmd0aCk7XHJcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZ2xURlNraW5zLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIGNvbnN0IGdsVEZTa2luID0gZ2xURlNraW5zW2luZGV4XTtcclxuICAgICAgICBjb25zdCBzdWJBc3NldCA9IGF3YWl0IGFzc2V0LmNyZWF0ZVN1YkFzc2V0KGFzc2V0TmFtZXNbaW5kZXhdLCAnZ2x0Zi1za2VsZXRvbicpO1xyXG4gICAgICAgIHN1YkFzc2V0LnVzZXJEYXRhLmdsdGZJbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHNraW5BcnJheVtpbmRleF0gPSBzdWJBc3NldC51dWlkO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNraW5BcnJheTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaW1wb3J0SW1hZ2VzKGFzc2V0OiBBc3NldCwgZ2xURkNvbnZlcnRlcjogR2x0ZkNvbnZlcnRlcikge1xyXG4gICAgY29uc3QgZ2xURkltYWdlcyA9IGdsVEZDb252ZXJ0ZXIuZ2x0Zi5pbWFnZXM7XHJcbiAgICBpZiAoZ2xURkltYWdlcyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHVzZXJEYXRhID0gYXNzZXQudXNlckRhdGEgYXMgR2xURlVzZXJEYXRhO1xyXG5cclxuICAgIGNvbnN0IGZieE1pc3NpbmdJbWFnZVVyaSA9XHJcbiAgICAgICAgJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQUVBQUFBQkNBWUFBQUFmRmNTSkFBQUFEVWxFUVZSNDJtUDgvNStoSGdBSGdnSi9QY2hJN3dBQUFBQkpSVTVFcmtKZ2dnPT0nO1xyXG5cclxuICAgIGNvbnN0IGlzUHJvZHVjZWRCeUZCWDJnbFRGID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGdlbmVyYXRvciA9IGdsVEZDb252ZXJ0ZXIuZ2x0Zi5hc3NldC5nZW5lcmF0b3I7XHJcbiAgICAgICAgcmV0dXJuIGdlbmVyYXRvcj8uaW5jbHVkZXMoJ0ZCWDJnbFRGJyk7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGlzRkJYMmdsVEZTb3VyY2VNaXNzaW5nSW1hZ2VVcmkgPSAodXJpOiBzdHJpbmcpID0+IHtcclxuICAgICAgICByZXR1cm4gaXNQcm9kdWNlZEJ5RkJYMmdsVEYoKSAmJiB1cmkgPT09IGZieE1pc3NpbmdJbWFnZVVyaTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgaXNQcm9kdWNlZEJ5RmJ4R2xUZkNvbnYgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZ2VuZXJhdG9yID0gZ2xURkNvbnZlcnRlci5nbHRmLmFzc2V0LmdlbmVyYXRvcjtcclxuICAgICAgICByZXR1cm4gZ2VuZXJhdG9yPy5pbmNsdWRlcygnRkJYLWdsVEYtY29udicpO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBpc0ZCWEdsVGZDb252TWlzc2luZ0ltYWdlVXJpID0gKHVyaTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGlzUHJvZHVjZWRCeUZieEdsVGZDb252KCkgJiYgdXJpID09PSBmYnhNaXNzaW5nSW1hZ2VVcmk7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGltYWdlTmFtZXMgPSBtYWtlVW5pcXVlU3ViQXNzZXROYW1lcyhhc3NldC5iYXNlbmFtZSwgZ2xURkltYWdlcywgJ2ltYWdlcycsICcuaW1hZ2UnKTtcclxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBnbFRGSW1hZ2VzLmxlbmd0aDsgKytpbmRleCkge1xyXG4gICAgICAgIGNvbnN0IGdsVEZJbWFnZSA9IGdsVEZJbWFnZXNbaW5kZXhdO1xyXG4gICAgICAgIGNvbnN0IGltYWdlTWV0YSA9IHVzZXJEYXRhLmltYWdlTWV0YXNbaW5kZXhdO1xyXG4gICAgICAgIGNvbnN0IHZlbmRvclVSSSA9IGdsVEZJbWFnZS51cmk7XHJcblxyXG4gICAgICAgIGxldCBpc1Jlc29sdmVOZWVkZWQgPSBmYWxzZTtcclxuICAgICAgICAvLyBJZiBpc1Jlc29sdmVkTmVlZGVkIGlzIGB0cnVlYCwgdGhlIHJlc29sdmUgYWxnb3JpdGhtIHdpbGwgdGFrZSB0aGlzIHBhcmFtZXRlci5cclxuICAgICAgICAvLyBUaGVyZSBtYXkgYmUgYGlzUmVzb2x2ZU5lZWRlZCAmJiAhaW1hZ2VQYXRoYCwgc2VlIGJlbG93LlxyXG4gICAgICAgIGxldCBpbWFnZVBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgLy8gV2Ugd2lsbCBub3QgY3JlYXRlIHN1Yi1hc3NldC1IYW5kbGVyIGlmOlxyXG4gICAgICAgIC8vIC0gYHVyaWAgZmllbGQgaXMgcmVsYXRpdmUgb3IgaXMgZmlsZSBVUkwsIGFuZFxyXG4gICAgICAgIC8vIC0gdGhlIHJlc29sdmVkIGFic29sdXRlIGZpbGUgcGF0aCwgYWZ0ZXIgdGhlIGltYWdlIGxvb2t1cCBydWxlcyBhcHBsaWVkIGlzIGluc2lkZSB0aGUgcHJvamVjdC5cclxuICAgICAgICAvLyBJbiBzdWNoIGNhc2VzLCB3ZSBkaXJlY3RseSB1c2UgdGhpcyBsb2NhdGlvbiBpbnN0ZWFkIG9mIGNyZWF0ZSB0aGUgaW1hZ2UgYXNzZXQuXHJcbiAgICAgICAgaWYgKHZlbmRvclVSSSAmJiAoaXNGQlgyZ2xURlNvdXJjZU1pc3NpbmdJbWFnZVVyaSh2ZW5kb3JVUkkpIHx8IGlzRkJYR2xUZkNvbnZNaXNzaW5nSW1hZ2VVcmkodmVuZG9yVVJJKSkpIHtcclxuICAgICAgICAgICAgLy8gTm90ZSwgaWYgdGhlIGdsVEYgaXMgY29udmVydGVkIGZyb20gRkJYIGJ5IEZCWDJnbFRGXHJcbiAgICAgICAgICAgIC8vIGFuZCB0aGVyZSBhcmUgbWlzc2luZyB0ZXh0dXJlcywgdGhlIEZCWDJnbFRGIHdpbGwgYXNzaWduIGEgY29uc3RhbnQgZGF0YS11cmkgYXMgdXJpIG9mIGltYWdlLlxyXG4gICAgICAgICAgICAvLyBXZSBjYXB0dXJlIHRoZXNlIGNhc2VzIGFuZCB0cnkgcmVzb2x2ZSB0aGUgaW1hZ2UgYWNjb3JkaW5nIHRoZSBnbFRGIGltYWdlIGFzc2V0IG5hbWVcclxuICAgICAgICAgICAgLy8gdXNpbmcgb3VyIG93biBhbGdvcml0aG0uXHJcbiAgICAgICAgICAgIGlzUmVzb2x2ZU5lZWRlZCA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh2ZW5kb3JVUkkgJiYgIXZlbmRvclVSSS5zdGFydHNXaXRoKCdkYXRhOicpKSB7XHJcbiAgICAgICAgICAgIC8vIE5vdGU6IHNob3VsZCBub3QgYmUgYGFzc2V0LnNvdXJjZWAsIHdoaWNoIG1heSBiZSBwYXRoIHRvIGZieC5cclxuICAgICAgICAgICAgY29uc3QgZ2xURkZpbGVQYXRoID0gZ2xURkNvbnZlcnRlci5wYXRoO1xyXG4gICAgICAgICAgICBjb25zdCBiYXNlVVJJID0gVVJMLnBhdGhUb0ZpbGVVUkwoZ2xURkZpbGVQYXRoKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG5vcm1hbGl6ZWRVUkkgPSBuZXcgVVJJKHZlbmRvclVSSSk7XHJcbiAgICAgICAgICAgICAgICBub3JtYWxpemVkVVJJID0gbm9ybWFsaXplZFVSSS5hYnNvbHV0ZVRvKGJhc2VVUkkpO1xyXG4gICAgICAgICAgICAgICAgY29udmVydHNFbmNvZGVkU2VwYXJhdG9yc0luVVJJKG5vcm1hbGl6ZWRVUkkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRVUkkuc2NoZW1lKCkgPT09ICdmaWxlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlUGF0aCA9IFVSTC5maWxlVVJMVG9QYXRoKG5vcm1hbGl6ZWRVUkkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNSZXNvbHZlTmVlZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCB7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCByZXNvbHZlZCA9ICcnO1xyXG4gICAgICAgIGlmIChpc1Jlc29sdmVOZWVkZWQpIHtcclxuICAgICAgICAgICAgY29uc3QgcmVzb2x2ZUphaWwgPSBhc3NldC5fYXNzZXREQi5vcHRpb25zLnRhcmdldDtcclxuICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRJbWFnZVBhdGggPSBhd2FpdCByZXNvbHZlR2xUZkltYWdlUGF0aChcclxuICAgICAgICAgICAgICAgIGdsVEZJbWFnZS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgaW1hZ2VQYXRoLFxyXG4gICAgICAgICAgICAgICAgcGF0aC5kaXJuYW1lKGFzc2V0LnNvdXJjZSksXHJcbiAgICAgICAgICAgICAgICBnbFRGSW1hZ2UuZXh0cmFzLFxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZUphaWwsXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGlmIChyZXNvbHZlZEltYWdlUGF0aCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGJVUkwgPSBxdWVyeVVybChyZXNvbHZlZEltYWdlUGF0aCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGJVUkwpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJbiBhc3NldCBkYXRhYmFzZSwgdXNlIGl0LlxyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlTWV0YS51cmkgPSBkYlVSTDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBoYXBwZW5lZCB1c3VhbGx5IHdoZW5cclxuICAgICAgICAgICAgICAgICAgICAvLyAtIDEuIE1vZGVsIGZpbGUgY29udGFpbnMgYWJzb2x1dGUgVVJMIHBvaW50IHRvIGFuIG91dC1vZi1wcm9qZWN0IGxvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIC0gMi4gTW9kZWwgZmlsZSBjb250YWlucyByZWxhdGl2ZSBVUkwgYnV0IHJlc29sdmVkIHRvIGFuIG91dC1vZi1wcm9qZWN0IGxvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIC0gMy4gRkJYIG1vZGVsIGZpbGUgYW5kIGl0cyByZWZlcmVuY2UgaW1hZ2VzIGFyZSBjb252ZXJ0ZWQgdXNpbmcgRkJYMmdsVEYgdG8gYSB0ZW1wb3JhcnkgcGF0aC5cclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGxvY2F0aW9uIG1heSBiZSBvbmx5IGFibGUgYWNjZXNzZWQgYnkgY3VycmVudC11c2VyLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIDEgJiAyIGh1cnRzIGlmIHByb2plY3QgYXJlIHNoYXJlZCBieSBtdWx0aS11c2VyLlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlRnJvbVRtcERpciA9IHJlbGF0aXZlKGFzc2V0Q29uZmlnLmRhdGEudGVtcFJvb3QsIHJlc29sdmVkSW1hZ2VQYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzQWJzb2x1dGUocmVsYXRpdmVGcm9tVG1wRGlyKSAmJiAhcmVsYXRpdmVGcm9tVG1wRGlyLnN0YXJ0c1dpdGgoYC4uJHtzZXB9YCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWQgPSByZXNvbHZlZEltYWdlUGF0aDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgSW4gbW9kZWwgZmlsZSAke2Fzc2V0LnNvdXJjZX0sYCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgdGhlIGltYWdlICR7Z2xURkltYWdlLm5hbWV9IGlzIHJlc29sdmVkIHRvICR7cmVzb2x2ZWRJbWFnZVBhdGh9LGAgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3doaWNoIGlzIGEgbG9jYXRpb24gb3V0IG9mIGFzc2V0IGRpcmVjdG9yeS4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdUaGlzIGNhbiBjYXVzZSBwcm9ibGVtIGFzIHlvdXIgcHJvamVjdCBtaWdyYXRlZC4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFpbWFnZU1ldGEudXJpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN1YkFzc2V0ID0gYXdhaXQgYXNzZXQuY3JlYXRlU3ViQXNzZXQoaW1hZ2VOYW1lc1tpbmRleF0sICdnbHRmLWVtYmVkZWQtaW1hZ2UnKTtcclxuICAgICAgICAgICAgc3ViQXNzZXQudXNlckRhdGEuZ2x0ZkluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgICAgIGltYWdlTWV0YS51cmkgPSBzdWJBc3NldC51dWlkO1xyXG4gICAgICAgICAgICBpZiAocmVzb2x2ZWQpIHtcclxuICAgICAgICAgICAgICAgIHN1YkFzc2V0LmdldFN3YXBTcGFjZTx7IHJlc29sdmVkPzogc3RyaW5nIH0+KCkucmVzb2x2ZWQgPSByZXNvbHZlZDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChnbFRGSW1hZ2UudXJpID09PSBmYnhNaXNzaW5nSW1hZ2VVcmkpIHtcclxuICAgICAgICAgICAgICAgICAgICBnbFRGQ29udmVydGVyLmZieE1pc3NpbmdJbWFnZXNJZC5wdXNoKGluZGV4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaW1wb3J0VGV4dHVyZXMoYXNzZXQ6IEFzc2V0LCBnbFRGQ29udmVydGVyOiBHbHRmQ29udmVydGVyKTogUHJvbWlzZTxBcnJheTxzdHJpbmcgfCBudWxsPj4ge1xyXG4gICAgY29uc3QgZ2xURlRleHR1cmVzID0gZ2xURkNvbnZlcnRlci5nbHRmLnRleHR1cmVzO1xyXG4gICAgaWYgKGdsVEZUZXh0dXJlcyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgY29uc3QgYXNzZXROYW1lcyA9IG1ha2VVbmlxdWVTdWJBc3NldE5hbWVzKGFzc2V0LmJhc2VuYW1lLCBnbFRGVGV4dHVyZXMsICd0ZXh0dXJlcycsICcudGV4dHVyZScpO1xyXG4gICAgY29uc3QgdGV4dHVyZUFycmF5ID0gbmV3IEFycmF5KGdsVEZUZXh0dXJlcy5sZW5ndGgpO1xyXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGdsVEZUZXh0dXJlcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICBjb25zdCBnbFRGVGV4dHVyZSA9IGdsVEZUZXh0dXJlc1tpbmRleF07XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGFzc2V0TmFtZXNbaW5kZXhdO1xyXG4gICAgICAgIGNvbnN0IHN1YkFzc2V0ID0gYXdhaXQgYXNzZXQuY3JlYXRlU3ViQXNzZXQobmFtZSwgJ3RleHR1cmUnKTtcclxuICAgICAgICBjb25zdCBkZWZhdWx0VGV4dHVyZVVzZXJkYXRhID0gbWFrZURlZmF1bHRUZXh0dXJlMkRBc3NldFVzZXJEYXRhKCk7XHJcbiAgICAgICAgLy8g6L+Z6YeM5Y+q5piv6K6+572u5LiA5Liq6buY6K6k5YC877yM5aaC5p6c55So5oi35L+u5pS56L+H77yM5oiW6ICF5bey57uP55Sf5oiQ6L+H5pWw5o2u77yM5oiR5Lus6ZyA6KaB5bC96YeP5L+d5oyB5a2Y5YKo5Zyo55So5oi3IG1ldGEg6YeM55qE5pWw5o2uXHJcbiAgICAgICAgZ2xURkNvbnZlcnRlci5nZXRUZXh0dXJlUGFyYW1ldGVycyhnbFRGVGV4dHVyZSwgZGVmYXVsdFRleHR1cmVVc2VyZGF0YSk7XHJcbiAgICAgICAgY29uc3QgdGV4dHVyZVVzZXJkYXRhID0gc3ViQXNzZXQudXNlckRhdGEgYXMgVGV4dHVyZTJEQXNzZXRVc2VyRGF0YTtcclxuICAgICAgICBzdWJBc3NldC5hc3NpZ25Vc2VyRGF0YShkZWZhdWx0VGV4dHVyZVVzZXJkYXRhKTtcclxuICAgICAgICBpZiAoZ2xURlRleHR1cmUuc291cmNlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2VNZXRhID0gKGFzc2V0LnVzZXJEYXRhIGFzIEdsVEZVc2VyRGF0YSkuaW1hZ2VNZXRhc1tnbFRGVGV4dHVyZS5zb3VyY2VdO1xyXG4gICAgICAgICAgICBjb25zdCBpbWFnZVVSSSA9IGltYWdlTWV0YS5yZW1hcCB8fCBpbWFnZU1ldGEudXJpO1xyXG4gICAgICAgICAgICBpZiAoIWltYWdlVVJJKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgdGV4dHVyZVVzZXJkYXRhLmltYWdlVXVpZE9yRGF0YWJhc2VVcmk7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgdGV4dHVyZVVzZXJkYXRhLmlzVXVpZDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlzVXVpZCA9ICFpbWFnZVVSSS5zdGFydHNXaXRoKCdkYjovLycpO1xyXG4gICAgICAgICAgICAgICAgdGV4dHVyZVVzZXJkYXRhLmlzVXVpZCA9IGlzVXVpZDtcclxuICAgICAgICAgICAgICAgIHRleHR1cmVVc2VyZGF0YS5pbWFnZVV1aWRPckRhdGFiYXNlVXJpID0gaW1hZ2VVUkk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWlzVXVpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlUGF0aCA9IHF1ZXJ5UGF0aCh0ZXh0dXJlVXNlcmRhdGEuaW1hZ2VVdWlkT3JEYXRhYmFzZVVyaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpbWFnZVBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFzc2VydGlvbkVycm9yKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGAke3RleHR1cmVVc2VyZGF0YS5pbWFnZVV1aWRPckRhdGFiYXNlVXJpfSBpcyBub3QgZm91bmQgaW4gYXNzZXQtZGIuYCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHN1YkFzc2V0LmRlcGVuZChpbWFnZVBhdGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRleHR1cmVBcnJheVtpbmRleF0gPSBzdWJBc3NldC51dWlkO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRleHR1cmVBcnJheTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaW1wb3J0TWF0ZXJpYWxzKFxyXG4gICAgYXNzZXQ6IEFzc2V0LFxyXG4gICAgZ2xURkNvbnZlcnRlcjogR2x0ZkNvbnZlcnRlcixcclxuICAgIGFzc2V0RmluZGVyOiBEZWZhdWx0R2x0ZkFzc2V0RmluZGVyLFxyXG4pOiBQcm9taXNlPEFycmF5PHN0cmluZyB8IG51bGw+PiB7XHJcbiAgICBjb25zdCBnbFRGTWF0ZXJpYWxzID0gZ2xURkNvbnZlcnRlci5nbHRmLm1hdGVyaWFscztcclxuICAgIGlmIChnbFRGTWF0ZXJpYWxzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICBjb25zdCB7IGR1bXBNYXRlcmlhbHMgfSA9IGFzc2V0LnVzZXJEYXRhIGFzIEdsVEZVc2VyRGF0YTtcclxuICAgIGNvbnN0IGFzc2V0TmFtZXMgPSBtYWtlVW5pcXVlU3ViQXNzZXROYW1lcyhhc3NldC5iYXNlbmFtZSwgZ2xURk1hdGVyaWFscywgJ21hdGVyaWFscycsIGR1bXBNYXRlcmlhbHMgPyAnLm10bCcgOiAnLm1hdGVyaWFsJyk7XHJcbiAgICBjb25zdCBtYXRlcmlhbEFycmF5ID0gbmV3IEFycmF5KGdsVEZNYXRlcmlhbHMubGVuZ3RoKTtcclxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBnbFRGTWF0ZXJpYWxzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgIC8vIGNvbnN0IGdsVEZNYXRlcmlhbCA9IGdsVEZNYXRlcmlhbHNbaW5kZXhdO1xyXG4gICAgICAgIGlmIChkdW1wTWF0ZXJpYWxzKSB7XHJcbiAgICAgICAgICAgIG1hdGVyaWFsQXJyYXlbaW5kZXhdID0gYXdhaXQgZHVtcE1hdGVyaWFsKGFzc2V0LCBhc3NldEZpbmRlciwgZ2xURkNvbnZlcnRlciwgaW5kZXgsIGFzc2V0TmFtZXNbaW5kZXhdKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBzdWJBc3NldCA9IGF3YWl0IGFzc2V0LmNyZWF0ZVN1YkFzc2V0KGFzc2V0TmFtZXNbaW5kZXhdLCAnZ2x0Zi1tYXRlcmlhbCcpO1xyXG4gICAgICAgICAgICBzdWJBc3NldC51c2VyRGF0YS5nbHRmSW5kZXggPSBpbmRleDtcclxuICAgICAgICAgICAgbWF0ZXJpYWxBcnJheVtpbmRleF0gPSBzdWJBc3NldC51dWlkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBtYXRlcmlhbEFycmF5O1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBpbXBvcnRTY2VuZXMoYXNzZXQ6IEFzc2V0LCBnbFRGQ29udmVydGVyOiBHbHRmQ29udmVydGVyKTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XHJcbiAgICBjb25zdCBnbFRGU2NlbmVzID0gZ2xURkNvbnZlcnRlci5nbHRmLnNjZW5lcztcclxuICAgIGlmIChnbFRGU2NlbmVzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICBsZXQgaWQgPSAnJztcclxuICAgIGlmIChhc3NldC51dWlkMnJlY3ljbGUpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGNJRCBpbiBhc3NldC51dWlkMnJlY3ljbGUpIHtcclxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGFzc2V0LnV1aWQycmVjeWNsZVtjSURdO1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5pbXBvcnRlciA9PT0gJ2dsdGYtc2NlbmUnICYmICdpZCcgaW4gaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaWQgPSBjSUQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCBhc3NldE5hbWVzID0gbWFrZVVuaXF1ZVN1YkFzc2V0TmFtZXMoYXNzZXQuYmFzZW5hbWUsIGdsVEZTY2VuZXMsICdzY2VuZXMnLCAnLnByZWZhYicpO1xyXG4gICAgY29uc3Qgc2NlbmVBcnJheSA9IG5ldyBBcnJheShnbFRGU2NlbmVzLmxlbmd0aCk7XHJcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZ2xURlNjZW5lcy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICBjb25zdCBzdWJBc3NldCA9IGF3YWl0IGFzc2V0LmNyZWF0ZVN1YkFzc2V0KGFzc2V0TmFtZXNbaW5kZXhdLCAnZ2x0Zi1zY2VuZScsIHtcclxuICAgICAgICAgICAgaWQsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc3ViQXNzZXQudXNlckRhdGEuZ2x0ZkluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgc2NlbmVBcnJheVtpbmRleF0gPSBzdWJBc3NldC51dWlkO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNjZW5lQXJyYXk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVPcmlnaW5hbEFuaW1hdGlvbnMoYXNzZXQ6IEFzc2V0LCBnbFRGQ29udmVydGVyOiBHbHRmQ29udmVydGVyLCBjb21wcmVzczogYm9vbGVhbikge1xyXG4gICAgY29uc3QgZ2xURkFuaW1hdGlvbnMgPSBnbFRGQ29udmVydGVyLmdsdGYuYW5pbWF0aW9ucztcclxuICAgIGlmICghZ2xURkFuaW1hdGlvbnMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBhd2FpdCBQcm9taXNlLmFsbChcclxuICAgICAgICBnbFRGQW5pbWF0aW9ucy5tYXAoYXN5bmMgKF86IGFueSwgaUFuaW1hdGlvbjogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFuaW1hdGlvbiA9IGdsVEZDb252ZXJ0ZXIuY3JlYXRlQW5pbWF0aW9uKGlBbmltYXRpb24pO1xyXG4gICAgICAgICAgICAvLyBpZiAoY29tcHJlc3MpIHtcclxuICAgICAgICAgICAgLy8gICAgIGNvbXByZXNzQW5pbWF0aW9uQ2xpcChhbmltYXRpb24pO1xyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIGNvbnN0IHsgZGF0YSwgZXh0ZW5zaW9uIH0gPSBzZXJpYWxpemVGb3JMaWJyYXJ5KGFuaW1hdGlvbik7XHJcbiAgICAgICAgICAgIGNvbnN0IGxpYnJhcnlQYXRoID0gZ2V0T3JpZ2luYWxBbmltYXRpb25MaWJyYXJ5UGF0aChpQW5pbWF0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgICAgICAgYXdhaXQgYXNzZXQuc2F2ZVRvTGlicmFyeShsaWJyYXJ5UGF0aCwgZGF0YSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRzID0gZ2V0RGVwZW5kVVVJRExpc3QoZGF0YSk7XHJcbiAgICAgICAgICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRzKTtcclxuICAgICAgICB9KSxcclxuICAgICk7XHJcbn1cclxuXHJcbnR5cGUgSW1wb3J0bGV0ID0gKGFzc2V0OiBNZXNoIHwgQW5pbWF0aW9uIHwgU2tpbiB8IE1hdGVyaWFsLCBpbmRleDogbnVtYmVyLCBuYW1lOiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nIHwgbnVsbD47XHJcblxyXG4vLyBsb2Qg6YWN572u5pyA5aSa5bGC57qnXHJcbmNvbnN0IG1heExvZExldmVsID0gNztcclxuXHJcbi8vIOm7mOiupCBsb2Qg5bGC57qn55qEXHJcbmNvbnN0IGRlZmF1bHRMT0RzT3B0aW9ucyA9IHtcclxuICAgIHNjcmVlblJhdGlvOiAwLFxyXG4gICAgZmFjZUNvdW50OiAwLFxyXG59O1xyXG5cclxuLy8g6YCS5b2S5p+l6K+i6IqC54K55LiL5omA5pyJIG1lc2gg55qE5YeP6Z2i5pWwXHJcbmFzeW5jIGZ1bmN0aW9uIGRlZXBGaW5kTWVzaFJlbmRlcmVyKG5vZGU6IE5vZGUsIGdsVEZDb252ZXJ0ZXI6IEdsdGZDb252ZXJ0ZXIsIGxvZExldmVsOiBudW1iZXIsIGdlbmVyYXRlTGlnaHRtYXBVVk5vZGU/OiBib29sZWFuKSB7XHJcbiAgICBjb25zdCBtZXNoUmVuZGVyZXJzID0gbm9kZS5nZXRDb21wb25lbnRzKE1lc2hSZW5kZXJlcik7XHJcbiAgICBsZXQgbWVzaFJlbmRlcmVyVHJpYW5nbGVDb3VudCA9IDA7XHJcbiAgICBpZiAobWVzaFJlbmRlcmVycyAmJiBtZXNoUmVuZGVyZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBmb3IgKGNvbnN0IG1lc2hSZW5kZXJlciBvZiBtZXNoUmVuZGVyZXJzKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNoUmVuZGVyZXIubWVzaCAmJiBtZXNoUmVuZGVyZXIubWVzaC51dWlkKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWVzaFRyaWFuZ2xlQ291bnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbWVzaE1ldGEgPSBhc3NldFF1ZXJ5LnF1ZXJ5QXNzZXRNZXRhKG1lc2hSZW5kZXJlci5tZXNoLnV1aWQpO1xyXG4gICAgICAgICAgICAgICAgLy8g5aaC5p6cIGZieCDoh6rouqvlkKvmnIkgbG9k77yMbWVzaE1ldGEg6YeM6K6w5b2V55u45bqU55qEIGxvZCDlsYLnuqdcclxuICAgICAgICAgICAgICAgIG1lc2hNZXRhIS51c2VyRGF0YS5sb2RMZXZlbCA9IGxvZExldmVsO1xyXG4gICAgICAgICAgICAgICAgLy8g6I635Y+WIG1lc2gg6Z2i5pWwXHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNoID0gZ2xURkNvbnZlcnRlci5jcmVhdGVNZXNoKG1lc2hNZXRhIS51c2VyRGF0YS5nbHRmSW5kZXgsIGdlbmVyYXRlTGlnaHRtYXBVVk5vZGUpO1xyXG4gICAgICAgICAgICAgICAgbWVzaC5zdHJ1Y3QucHJpbWl0aXZlcz8uZm9yRWFjaCgoc3ViTWVzaDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1Yk1lc2ggJiYgc3ViTWVzaC5pbmRleFZpZXcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzaFRyaWFuZ2xlQ291bnQgKz0gc3ViTWVzaC5pbmRleFZpZXcuY291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBtZXNoUmVuZGVyZXJUcmlhbmdsZUNvdW50ICs9IG1lc2hUcmlhbmdsZUNvdW50IC8gMztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChub2RlLmNoaWxkcmVuICYmIG5vZGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGZvciAoY29uc3QgY2hpbGROb2RlIG9mIG5vZGUuY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRDb3VudDogbnVtYmVyID0gYXdhaXQgZGVlcEZpbmRNZXNoUmVuZGVyZXIoY2hpbGROb2RlLCBnbFRGQ29udmVydGVyLCBsb2RMZXZlbCwgZ2VuZXJhdGVMaWdodG1hcFVWTm9kZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBtZXNoUmVuZGVyZXJUcmlhbmdsZUNvdW50ICsgY2hpbGRDb3VudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWVzaFJlbmRlcmVyVHJpYW5nbGVDb3VudDtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZExPRHMoZ2x0ZlVzZXJEYXRhOiBHbFRGVXNlckRhdGEsIHNjZW5lTm9kZTogTm9kZSwgZ2x0ZkNvbnZlcnRlcjogR2x0ZkNvbnZlcnRlcikge1xyXG4gICAgY29uc3QgTE9Ec09wdGlvbkFycjogTE9Ec09wdGlvbltdID0gW107XHJcbiAgICBjb25zdCB0cmlhbmdsZUNvdW50czogbnVtYmVyW10gPSBbXTtcclxuICAgIC8vIOiOt+WPluaooeWei+S7pSBMT0QjIOe7k+WwvueahOiKgueCue+8jOiuoeeulyBsb2Qg5bGC57qn6IqC54K55LiL55qE5omA5pyJIG1lc2gg55qE5YeP6Z2i5pWw5oC75ZKMXHJcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIHNjZW5lTm9kZS5jaGlsZHJlbikge1xyXG4gICAgICAgIGNvbnN0IGxvZEFyciA9IC9MT0QoXFxkKykkL2kuZXhlYyhjaGlsZC5uYW1lKTtcclxuICAgICAgICBpZiAobG9kQXJyICYmIGxvZEFyci5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gcGFyc2VJbnQobG9kQXJyWzFdLCAxMCk7XHJcbiAgICAgICAgICAgIC8vIOWPquWPliA3IOWxglxyXG4gICAgICAgICAgICBpZiAoaW5kZXggPD0gbWF4TG9kTGV2ZWwpIHtcclxuICAgICAgICAgICAgICAgIExPRHNPcHRpb25BcnJbaW5kZXhdID0gTE9Ec09wdGlvbkFycltpbmRleF0gfHwgT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdExPRHNPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIHRyaWFuZ2xlQ291bnRzW2luZGV4XSA9XHJcbiAgICAgICAgICAgICAgICAgICAgKHRyaWFuZ2xlQ291bnRzW2luZGV4XSB8fCAwKSArXHJcbiAgICAgICAgICAgICAgICAgICAgKGF3YWl0IGRlZXBGaW5kTWVzaFJlbmRlcmVyKGNoaWxkLCBnbHRmQ29udmVydGVyLCBpbmRleCwgZ2x0ZlVzZXJEYXRhLmdlbmVyYXRlTGlnaHRtYXBVVk5vZGUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoTE9Ec09wdGlvbkFyci5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgY29uc3QgbWF4TG9kID0gTWF0aC5tYXgoLi4uT2JqZWN0LmtleXMoTE9Ec09wdGlvbkFycikubWFwKChrZXk6IHN0cmluZykgPT4gK2tleSkpO1xyXG4gICAgICAgIC8vIOWxj+WNoOavlOS7jiAwLjI1IOmAkOe6p+WHj+WNilxyXG4gICAgICAgIGxldCBzY3JlZW5SYXRpbyA9IDAuMjU7XHJcbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG1heExvZDsgaW5kZXgrKykge1xyXG4gICAgICAgICAgICAvLyDloavlhYUgTE9EIOWxgue6p++8jG1heExvZCDlsYLnuqfogq/lrprlrZjlnKhcclxuICAgICAgICAgICAgaWYgKCFMT0RzT3B0aW9uQXJyW2luZGV4XSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgTm8gbWVzaCBuYW1lIGFyZSBlbmRpbmcgd2l0aCBMT0Qke2luZGV4fWApO1xyXG4gICAgICAgICAgICAgICAgTE9Ec09wdGlvbkFycltpbmRleF0gPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0TE9Ec09wdGlvbnMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDorqHnrpcgc2NyZWVuUmF0aW8gZmFjZUNvdW50XHJcbiAgICAgICAgICAgIExPRHNPcHRpb25BcnJbaW5kZXhdLnNjcmVlblJhdGlvID0gc2NyZWVuUmF0aW87XHJcbiAgICAgICAgICAgIHNjcmVlblJhdGlvIC89IDI7XHJcbiAgICAgICAgICAgIC8vIOavj+S4quWxgue6pyB0cmlhbmdsZSDlkowgTE9EMCDnmoTmr5TlgLxcclxuICAgICAgICAgICAgaWYgKHRyaWFuZ2xlQ291bnRzWzBdICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBMT0RzT3B0aW9uQXJyW2luZGV4XS5mYWNlQ291bnQgPSB0cmlhbmdsZUNvdW50c1tpbmRleF0gLyB0cmlhbmdsZUNvdW50c1swXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzY3JlZW5SYXRpbyDmnIDlkI7kuIDlsYLlsI/kuo4gMSXvvIzku6XorqHnrpfnu5PmnpzkuLrlh4bjgILlpoLmnpzlpKfkuo4x77yM5YiZ55SoIDElIOS9nOS4uuacgOWQjuS4gOS4quWxgue6p+eahOWxj+WNoOavlFxyXG4gICAgICAgIExPRHNPcHRpb25BcnJbbWF4TG9kXS5zY3JlZW5SYXRpbyA9IHNjcmVlblJhdGlvIDwgMC4wMSA/IHNjcmVlblJhdGlvIDogMC4wMTtcclxuICAgICAgICBMT0RzT3B0aW9uQXJyW21heExvZF0uZmFjZUNvdW50ID0gdHJpYW5nbGVDb3VudHNbMF0gPyB0cmlhbmdsZUNvdW50c1ttYXhMb2RdIC8gdHJpYW5nbGVDb3VudHNbMF0gOiAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBMT0RzT3B0aW9uQXJyO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZURlZmF1bHRMT0RzT3B0aW9uKCkge1xyXG4gICAgY29uc3QgTE9Ec09wdGlvbkFycjogTE9Ec09wdGlvbltdID0gW107XHJcbiAgICAvLyDnlJ/miJDpu5jorqQgc2NyZWVuUmF0aW8gZmFjZUNvdW50XHJcbiAgICBjb25zdCBkZWZhdWx0U2NyZWVuUmF0aW9BcnIgPSBbMC4yNSwgMC4xMjUsIDAuMDFdLFxyXG4gICAgICAgIGRlZmF1bHRGYWNlQ291bnRBcnIgPSBbMSwgMC4yNSwgMC4xXTtcclxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCAzOyBpbmRleCsrKSB7XHJcbiAgICAgICAgTE9Ec09wdGlvbkFycltpbmRleF0gPSB7XHJcbiAgICAgICAgICAgIHNjcmVlblJhdGlvOiBkZWZhdWx0U2NyZWVuUmF0aW9BcnJbaW5kZXhdLFxyXG4gICAgICAgICAgICBmYWNlQ291bnQ6IGRlZmF1bHRGYWNlQ291bnRBcnJbaW5kZXhdLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTE9Ec09wdGlvbkFycjtcclxufVxyXG5cclxuLyoqXHJcbiAqIOS4umdsVEblrZDotYTmupDmlbDnu4TkuK3nmoTmiYDmnInlrZDotYTmupDnlJ/miJDlnKjlrZDotYTmupDmlbDnu4TkuK3ni6zkuIDml6DkuoznmoTlkI3lrZfvvIzov5nkuKrlkI3lrZflj6/nlKjkvZxFZGl0b3JBc3NldOeahOWQjeensOS7peWPiuaWh+S7tuezu+e7n+S4iueahOaWh+S7tuWQjeOAglxyXG4gKiBAcGFyYW0gZ2x0ZkZpbGVCYXNlTmFtZSBnbFRG5paH5Lu25ZCN77yM5LiN5ZCr5omp5bGV5ZCN6YOo5YiG44CCXHJcbiAqIEBwYXJhbSBhc3NldHNBcnJheSBnbFRG5a2Q6LWE5rqQ5pWw57uE44CCXHJcbiAqIEBwYXJhbSBleHRlbnNpb24g6ZmE5Yqg55qE5omp5bGV5ZCN44CC6K+l5omp5bGV5ZCN5bCG5L2c5Li65ZCO57yA6ZmE5Yqg5Yiw57uT5p6c5ZCN5a2X5LiK44CCXHJcbiAqIEBwYXJhbSBvcHRpb25zLnByZWZlcmVkRmlsZUJhc2VOYW1lIOWwveWPr+iDveWcsOS9v+eUqGdsVEbmlofku7bmnKzouqvnmoTlkI3lrZfogIzkuI3mmK9nbFRG5a2Q6LWE5rqQ5pys6Lqr55qE5ZCN56ew5p2l55Sf5oiQ57uT5p6c44CCXHJcbiAqL1xyXG5mdW5jdGlvbiBtYWtlVW5pcXVlU3ViQXNzZXROYW1lcyhcclxuICAgIGdsdGZGaWxlQmFzZU5hbWU6IHN0cmluZyxcclxuICAgIGFzc2V0c0FycmF5OiBHbHRmU3ViQXNzZXRbXSxcclxuICAgIGZpbmRlcktpbmQ6IE15RmluZGVyS2luZCB8ICdpbWFnZXMnLFxyXG4gICAgZXh0ZW5zaW9uOiBzdHJpbmcsXHJcbikge1xyXG4gICAgY29uc3QgZ2V0QmFzZU5hbWVJZk5vTmFtZSA9ICgpID0+IHtcclxuICAgICAgICBzd2l0Y2ggKGZpbmRlcktpbmQpIHtcclxuICAgICAgICAgICAgY2FzZSAnYW5pbWF0aW9ucyc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1VubmFtZWRBbmltYXRpb24nO1xyXG4gICAgICAgICAgICBjYXNlICdpbWFnZXMnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdVbm5hbWVkSW1hZ2UnO1xyXG4gICAgICAgICAgICBjYXNlICdtZXNoZXMnOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdVbm5hbWVkTWVzaCc7XHJcbiAgICAgICAgICAgIGNhc2UgJ21hdGVyaWFscyc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1VubmFtZWRNYXRlcmlhbCc7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NrZWxldG9ucyc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1VubmFtZWRTa2VsZXRvbic7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RleHR1cmVzJzpcclxuICAgICAgICAgICAgICAgIHJldHVybiAnVW5uYW1lZFRleHR1cmUnO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICdVbm5hbWVkJztcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBuYW1lcyA9IGFzc2V0c0FycmF5Lm1hcCgoYXNzZXQpID0+IHtcclxuICAgICAgICBsZXQgdW5jaGVja2VkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKGZpbmRlcktpbmQgPT09ICdzY2VuZXMnKSB7XHJcbiAgICAgICAgICAgIHVuY2hlY2tlZCA9IGdsdGZGaWxlQmFzZU5hbWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYXNzZXQubmFtZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdW5jaGVja2VkID0gYXNzZXQubmFtZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB1bmNoZWNrZWQgPSBnZXRCYXNlTmFtZUlmTm9OYW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1bmNoZWNrZWQ7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIWlzRGlmZmVyV2l0aEVhY2hPdGhlcihuYW1lcyBhcyBzdHJpbmdbXSkpIHtcclxuICAgICAgICBsZXQgdGFpbCA9ICctJztcclxuXHJcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChuYW1lcy5ldmVyeSgobmFtZSkgPT4gIW5hbWUhLmVuZHNXaXRoKHRhaWwpKSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRhaWwgKz0gJy0nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBuYW1lcyA9IG5hbWVzLm1hcCgobmFtZSwgaW5kZXgpID0+IG5hbWUgKyBgJHt0YWlsfSR7aW5kZXh9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5hbWVzLm1hcCgobmFtZSkgPT4gbmFtZSArIGV4dGVuc2lvbik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzRGlmZmVyV2l0aEVhY2hPdGhlcih2YWx1ZXM6IHN0cmluZ1tdKSB7XHJcbiAgICBpZiAodmFsdWVzLmxlbmd0aCA+PSAyKSB7XHJcbiAgICAgICAgY29uc3Qgc29ydGVkID0gdmFsdWVzLnNsaWNlKCkuc29ydCgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc29ydGVkLmxlbmd0aCAtIDE7ICsraSkge1xyXG4gICAgICAgICAgICBpZiAoc29ydGVkW2ldID09PSBzb3J0ZWRbaSArIDFdKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbWlncmF0ZUltYWdlTG9jYXRpb25zKGFzc2V0OiBBc3NldCkge1xyXG4gICAgaW50ZXJmYWNlIEltYWdlRGV0YWlsIHtcclxuICAgICAgICB1dWlkT3JEYXRhYmFzZVVyaTogc3RyaW5nO1xyXG4gICAgICAgIGVtYmVkZWQ6IGJvb2xlYW47XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIE9sZE1ldGEge1xyXG4gICAgICAgIGltYWdlTG9jYXRpb25zPzogUmVjb3JkPFxyXG4gICAgICAgICAgICBzdHJpbmcsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vIOaooeWei+aWh+S7tuS4reivpeWbvueJh+eahOi3r+W+hOS/oeaBr+OAglxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQYXRoPzogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyDnlKjmiLforr7nva7nmoTlm77niYfot6/lvoTvvIxEYXRhYmFzZS11cmwg5b2i5byP44CCXHJcbiAgICAgICAgICAgICAgICB0YXJnZXREYXRhYmFzZVVybDogc3RyaW5nIHwgbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgID47XHJcblxyXG4gICAgICAgIGFzc2V0RmluZGVyPzoge1xyXG4gICAgICAgICAgICBpbWFnZXM/OiBBcnJheTxJbWFnZURldGFpbCB8IG51bGw+O1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgb2xkTWV0YSA9IGFzc2V0Lm1ldGEudXNlckRhdGEgYXMgT2xkTWV0YTtcclxuICAgIGNvbnN0IGltYWdlTWV0YXM6IEltYWdlTWV0YVtdID0gW107XHJcbiAgICBpZiAob2xkTWV0YS5pbWFnZUxvY2F0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IHsgaW1hZ2VMb2NhdGlvbnMgfSA9IG9sZE1ldGE7XHJcbiAgICAgICAgZm9yIChjb25zdCBpbWFnZU5hbWUgb2YgT2JqZWN0LmtleXMoaW1hZ2VMb2NhdGlvbnMpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlTG9jYXRpb24gPSBpbWFnZUxvY2F0aW9uc1tpbWFnZU5hbWVdO1xyXG4gICAgICAgICAgICBpZiAoaW1hZ2VMb2NhdGlvbi50YXJnZXREYXRhYmFzZVVybCkge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2VNZXRhcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBpbWFnZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcmVtYXA6IGltYWdlTG9jYXRpb24udGFyZ2V0RGF0YWJhc2VVcmwsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBkZWxldGUgb2xkTWV0YS5pbWFnZUxvY2F0aW9ucztcclxuICAgIH1cclxuICAgIChhc3NldC5tZXRhLnVzZXJEYXRhIGFzIEdsVEZVc2VyRGF0YSkuaW1hZ2VNZXRhcyA9IGltYWdlTWV0YXM7XHJcblxyXG4gICAgaWYgKG9sZE1ldGEuYXNzZXRGaW5kZXIgJiYgb2xkTWV0YS5hc3NldEZpbmRlci5pbWFnZXMpIHtcclxuICAgICAgICBkZWxldGUgb2xkTWV0YS5hc3NldEZpbmRlci5pbWFnZXM7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIG1pZ3JhdGVJbWFnZVJlbWFwKGFzc2V0OiBBc3NldCkge1xyXG4gICAgY29uc3Qgb2xkTWV0YSA9IGFzc2V0Lm1ldGEudXNlckRhdGEgYXMgR2xURlVzZXJEYXRhO1xyXG4gICAgaWYgKCFvbGRNZXRhLmltYWdlTWV0YXMpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBmb3IgKGNvbnN0IGltYWdlTWV0YSBvZiBvbGRNZXRhLmltYWdlTWV0YXMpIHtcclxuICAgICAgICBjb25zdCB7IHJlbWFwIH0gPSBpbWFnZU1ldGE7XHJcbiAgICAgICAgaWYgKCFyZW1hcCkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHV1aWQgPSBxdWVyeVVVSUQocmVtYXApO1xyXG4gICAgICAgIGlmICghdXVpZCkge1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpbWFnZU1ldGEucmVtYXAgPSB1dWlkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vKipcclxuICog5aaC5p6c5L2/55So5LqGIGR1bXBNYXRlcmlhbO+8jOW5tuS4lOeUn+aIkOebruW9leW4puaciSBGQlhcclxuICog5bCx6ZyA6KaB5pS55ZCN77yM5bm26YeN5paw5a+85YWl5paw55qEIG1hdGVyaWFsXHJcbiAqIEBwYXJhbSBhc3NldCBnbHRmIOi1hOa6kFxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gbWlncmF0ZUR1bXBNYXRlcmlhbChhc3NldDogQXNzZXQpIHtcclxuICAgIGlmICghYXNzZXQudXNlckRhdGEuZHVtcE1hdGVyaWFscyB8fCBhc3NldC51c2VyRGF0YS5tYXRlcmlhbER1bXBEaXIpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBvbGQgPSBwYXRoLmpvaW4oYXNzZXQuc291cmNlLCBgLi4vTWF0ZXJpYWxzJHthc3NldC5iYXNlbmFtZX0uRkJYYCk7XHJcbiAgICBjb25zdCBvbGRNZXRhID0gcGF0aC5qb2luKGFzc2V0LnNvdXJjZSwgYC4uL01hdGVyaWFscyR7YXNzZXQuYmFzZW5hbWV9LkZCWC5tZXRhYCk7XHJcbiAgICBjb25zdCBjdXJyZW50ID0gcGF0aC5qb2luKGFzc2V0LnNvdXJjZSwgYC4uL01hdGVyaWFscyR7YXNzZXQuYmFzZW5hbWV9YCk7XHJcbiAgICBjb25zdCBjdXJyZW50TWV0YSA9IHBhdGguam9pbihhc3NldC5zb3VyY2UsIGAuLi9NYXRlcmlhbHMke2Fzc2V0LmJhc2VuYW1lfS5tZXRhYCk7XHJcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhvbGQpICYmICFmcy5leGlzdHNTeW5jKGN1cnJlbnQpKSB7XHJcbiAgICAgICAgZnMucmVuYW1lU3luYyhvbGQsIGN1cnJlbnQpO1xyXG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKG9sZE1ldGEpKSB7XHJcbiAgICAgICAgICAgIGZzLnJlbmFtZVN5bmMob2xkTWV0YSwgY3VycmVudE1ldGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhc3NldC5fYXNzZXREQi5yZWZyZXNoKGN1cnJlbnQpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog5LuOIEZCWCDlr7zlhaXlmaggMi4wIOW8gOWni++8jOaWsOWinuS6hiBgbGVnYWN5RmJ4SGFuZGxlcmAg5a2X5q6155So5p2l56Gu5a6a5pivXHJcbiAqIOS9v+eUqOaXp+eahCBgRkJYMmdsVEZgIOi/mOaYryBgRkJYLWdsVEYtY29udmDjgIJcclxuICog5b2T5L2O5LqOIDIuMCDniYjmnKznmoTotYTmupDov4Hnp7vkuIrmnaXml7bvvIzpu5jorqTkvb/nlKjml6fniYjmnKznmoTjgIJcclxuICog5L2G5piv5omA5pyJ5paw6LWE5rqQ55qE5Yib5bu65bCG5L2/55So5paw54mI5pys55qE44CCXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBtaWdyYXRlRmJ4Q29udmVydGVyU2VsZWN0b3IoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICBpZiAoYXNzZXQuZXh0bmFtZSAhPT0gJy5mYngnKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgKGFzc2V0LnVzZXJEYXRhIGFzIEdsVEZVc2VyRGF0YSkubGVnYWN5RmJ4SW1wb3J0ZXIgPSB0cnVlO1xyXG59XHJcblxyXG4vKipcclxuICogRkJYIOWvvOWFpeWZqCB2MS4wLjAtYWxwaGEuMTIg5byA5aeL5byV5YWl5LqGIGAtLXVuaXQtY29udmVyc2lvbmAg6YCJ6aG577yM5bm25LiU6buY6K6k5L2/55So5LqGIGBnZW9tZXRyeS1sZXZlbGDvvIxcclxuICog6ICM5LmL5YmN5L2/55So55qE5pivIGBoaWVyYXJjaHktbGV2ZWxg44CCXHJcbiAqXHJcbiAqIEBwYXJhbSBhc3NldFxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gbWlncmF0ZUZieENvbnZlcnRlclVuaXRDb252ZXJzaW9uKGFzc2V0OiBBc3NldCkge1xyXG4gICAgaWYgKGFzc2V0LmV4dG5hbWUgIT09ICcuZmJ4Jykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHVzZXJEYXRhID0gYXNzZXQudXNlckRhdGEgYXMgR2xURlVzZXJEYXRhO1xyXG4gICAgaWYgKHVzZXJEYXRhLmxlZ2FjeUZieEltcG9ydGVyKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgKHVzZXJEYXRhLmZieCA/Pz0ge30pLnVuaXRDb252ZXJzaW9uID0gJ2hpZXJhcmNoeS1sZXZlbCc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGQlgg5a+85YWl5ZmoIHYxLjAuMC1hbHBoYS4yNyDlvIDlp4vlvJXlhaXkuoYgYC0tcHJlZmVyLWxvY2FsLXRpbWUtc3BhbmAg6YCJ6aG577yM5bm25LiU6buY6K6k5L2/55So5LqGIGB0cnVlYO+8jFxyXG4gKiDogIzkuYvliY3kvb/nlKjnmoTmmK8gYGZhbHNlYOOAglxyXG4gKlxyXG4gKiBAcGFyYW0gYXNzZXRcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIG1pZ3JhdGVGYnhDb252ZXJ0ZXJQcmVmZXJMb2NhbFRpbWVTcGFuKGFzc2V0OiBBc3NldCkge1xyXG4gICAgaWYgKGFzc2V0LmV4dG5hbWUgIT09ICcuZmJ4Jykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHVzZXJEYXRhID0gYXNzZXQudXNlckRhdGEgYXMgR2xURlVzZXJEYXRhO1xyXG4gICAgaWYgKHVzZXJEYXRhLmxlZ2FjeUZieEltcG9ydGVyKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgKHVzZXJEYXRhLmZieCA/Pz0ge30pLnByZWZlckxvY2FsVGltZVNwYW4gPSBmYWxzZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZCWCDlr7zlhaXlmaggMy41LjEg5byV5YWl5LqGIGBzbWFydE1hdGVyaWFsRW5hYmxlZGAg5bGe5oCnLOi/meS4quWxnuaAp+WcqOaXp+eJiOacrOeahOi1hOa6kOS4reaYr+m7mOiupOWFs+mXreeahC5cclxuICpcclxuICogQHBhcmFtIGFzc2V0XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBtaWdyYXRlU21hcnRNYXRlcmlhbEVuYWJsZWQoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICBpZiAoYXNzZXQuZXh0bmFtZSAhPT0gJy5mYngnKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgdXNlckRhdGEgPSBhc3NldC51c2VyRGF0YSBhcyBHbFRGVXNlckRhdGE7XHJcbiAgICAodXNlckRhdGEuZmJ4ID8/PSB7fSkuc21hcnRNYXRlcmlhbEVuYWJsZWQgPSBmYWxzZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWcqCAzLjYueO+8jGdsVEYg5Lmf6ZyA6KaB5aKe5YqgIGBwcm9tb3RlU2luZ2xlUm9vdE5vZGVgIOmAiemhueOAguaJgOS7peaIkeS7rOaKiuS5i+WJjeS4k+WxnuS6jiBGQlgg55qE55u05o6l6L+B56e76L+H5p2l44CCXHJcbiAqIOinge+8mmh0dHBzOi8vZ2l0aHViLmNvbS9jb2Nvcy9jb2Nvcy1lbmdpbmUvaXNzdWVzLzExODU4XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBtaWdyYXRlRkJYUHJvbW90ZVNpbmdsZVJvb3ROb2RlKGFzc2V0OiBBc3NldCkge1xyXG4gICAgaWYgKGFzc2V0LmV4dG5hbWUgIT09ICcuZmJ4Jykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIC8vIOi/geenu+WJjeeahCBVc2VyRGF0YSDmlbDmja7moLzlvI9cclxuICAgIGNvbnN0IHVzZXJEYXRhID0gYXNzZXQudXNlckRhdGEgYXMgT21pdDxHbFRGVXNlckRhdGEsICdmYngnPiAmIHtcclxuICAgICAgICBmYng/OiBOb25OdWxsYWJsZTxHbFRGVXNlckRhdGFbJ2ZieCddPiAmIHtcclxuICAgICAgICAgICAgcHJvbW90ZVNpbmdsZVJvb3ROb2RlPzogYm9vbGVhbjtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIGlmICh1c2VyRGF0YS5mYng/LnByb21vdGVTaW5nbGVSb290Tm9kZSkge1xyXG4gICAgICAgIHVzZXJEYXRhLnByb21vdGVTaW5nbGVSb290Tm9kZSA9IHVzZXJEYXRhLmZieC5wcm9tb3RlU2luZ2xlUm9vdE5vZGU7XHJcbiAgICAgICAgZGVsZXRlIHVzZXJEYXRhLmZieC5wcm9tb3RlU2luZ2xlUm9vdE5vZGU7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAzLjcuMCDlvJXlhaXkuobmlrDnmoTlh4/pnaLnrpfms5XvvIzpgInpobnkuI7kuYvliY3lrozlhajkuI3lkIzvvIzpnIDopoHlr7nlrZfmrrXlrZjlgqjlgZrosIPmlbRcclxuICogQHBhcmFtIGFzc2V0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWlncmF0ZU1lc2hPcHRpbWl6ZXJPcHRpb24oYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICBjb25zdCB1c2VyRGF0YSA9IGFzc2V0LnVzZXJEYXRhIGFzIEdsVEZVc2VyRGF0YTtcclxuICAgIC8vIOS9v+eUqOi/h+WOn+adpeeahOWHj+mdoueul+azle+8jOWFiOS/neWtmOaVsOaNru+8jOWGjeenu+mZpOaXp+aVsOaNrlxyXG4gICAgaWYgKCF1c2VyRGF0YS5tZXNoT3B0aW1pemVyKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdXNlckRhdGEubWVzaE9wdGltaXplciA9IHtcclxuICAgICAgICBhbGdvcml0aG06ICdnbHRmcGFjaycsXHJcbiAgICAgICAgZW5hYmxlOiB0cnVlLFxyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBnbHRmcGFja09wdGlvbnM6IHVzZXJEYXRhLm1lc2hPcHRpbWl6ZXJPcHRpb25zIHx8IHt9LFxyXG4gICAgfTtcclxuICAgIC8vIOebtOaOpeenu+mZpOaXp+aVsOaNrlxyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgZGVsZXRlIHVzZXJEYXRhLm1lc2hPcHRpbWl6ZXJPcHRpb25zO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWlncmF0ZUZieE1hdGNoTWVzaE5hbWVzKGFzc2V0OiBBc3NldCkge1xyXG4gICAgaWYgKGFzc2V0LmV4dG5hbWUgIT09ICcuZmJ4Jykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHVzZXJEYXRhID0gYXNzZXQudXNlckRhdGEgYXMgR2xURlVzZXJEYXRhO1xyXG4gICAgKHVzZXJEYXRhLmZieCA/Pz0ge30pLm1hdGNoTWVzaE5hbWVzID0gZmFsc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiAzLjguMSDlvJXlhaXkuobmlrDnmoTlh4/pnaLpgInpobnvvIzpnIDopoHlr7nlrZfmrrXlrZjlgqjlgZrosIPmlbRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBtaWdyYXRlTWVzaFNpbXBsaWZ5T3B0aW9uKGFzc2V0OiBBc3NldCkge1xyXG4gICAgY29uc3QgdXNlckRhdGEgPSBhc3NldC51c2VyRGF0YSBhcyBHbFRGVXNlckRhdGE7XHJcbiAgICAvLyDkvb/nlKjov4fljp/mnaXnmoTlh4/pnaLnrpfms5XvvIzlhYjkv53lrZjmlbDmja7vvIzlho3np7vpmaTml6fmlbDmja5cclxuICAgIGlmICghdXNlckRhdGEubWVzaE9wdGltaXplcikge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvcHRpbWl6ZXIgPSB1c2VyRGF0YS5tZXNoT3B0aW1pemVyO1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGltaXplci5zaW1wbGlmeU9wdGlvbnM7XHJcblxyXG4gICAgdXNlckRhdGEubWVzaFNpbXBsaWZ5ID0ge1xyXG4gICAgICAgIGVuYWJsZTogb3B0aW1pemVyLmVuYWJsZSxcclxuICAgICAgICB0YXJnZXRSYXRpbzogb3B0aW9ucz8udGFyZ2V0UmF0aW8gfHwgMSxcclxuICAgIH07XHJcblxyXG4gICAgZGVsZXRlIHVzZXJEYXRhLm1lc2hPcHRpbWl6ZXI7XHJcbn1cclxuIl19