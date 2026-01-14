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
exports.glTfReaderManager = void 0;
exports.getFbxFilePath = getFbxFilePath;
exports.getGltfFilePath = getGltfFilePath;
exports.getOptimizerPath = getOptimizerPath;
const utils_1 = require("../../utils");
const gltf_converter_1 = require("../utils/gltf-converter");
const validation_1 = require("./validation");
const fs_extra_1 = __importStar(require("fs-extra"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const global_1 = require("../../../../../global");
const asset_config_1 = __importDefault(require("../../../asset-config"));
const fbx_converter_1 = require("../utils/fbx-converter");
const model_convert_routine_1 = require("../utils/model-convert-routine");
const fbx_to_gltf_1 = require("./fbx-to-gltf");
class GlTfReaderManager {
    _map = new Map();
    /**
     *
     * @param asset
     * @param injectBufferDependencies 是否当创建 glTF 转换器的时候同时注入 glTF asset 对其引用的 buffer 文件的依赖。
     */
    async getOrCreate(asset, importVersion, injectBufferDependencies = false) {
        let result = this._map.get(asset.uuid);
        if (!result) {
            const { converter, referencedBufferFiles } = await createGlTfReader(asset, importVersion);
            result = converter;
            this._map.set(asset.uuid, result);
            if (injectBufferDependencies) {
                for (const referencedBufferFile of referencedBufferFiles) {
                    asset.depend(referencedBufferFile);
                }
            }
        }
        return result;
    }
    delete(asset) {
        this._map.delete(asset.uuid);
    }
}
exports.glTfReaderManager = new GlTfReaderManager();
async function getFbxFilePath(asset, importerVersion) {
    const userData = asset.userData;
    if (typeof userData.fbx?.smartMaterialEnabled === 'undefined') {
        (userData.fbx ??= {}).smartMaterialEnabled = await asset_config_1.default.getProject('fbx.material.smart') ?? false;
    }
    let outGLTFFile;
    if (userData.legacyFbxImporter) {
        outGLTFFile = await (0, fbx_to_gltf_1.fbxToGlTf)(asset, asset._assetDB, importerVersion);
    }
    else {
        const options = {};
        options.unitConversion = userData.fbx?.unitConversion;
        options.animationBakeRate = userData.fbx?.animationBakeRate;
        options.preferLocalTimeSpan = userData.fbx?.preferLocalTimeSpan;
        options.smartMaterialEnabled = userData.fbx?.smartMaterialEnabled ?? false;
        options.matchMeshNames = userData.fbx?.matchMeshNames ?? true;
        const fbxConverter = (0, fbx_converter_1.createFbxConverter)(options);
        const converted = await (0, model_convert_routine_1.modelConvertRoutine)('fbx.FBX-glTF-conv', asset, asset._assetDB, importerVersion, fbxConverter);
        if (!converted) {
            throw new Error(`Failed to import ${asset.source}`);
        }
        outGLTFFile = converted;
    }
    if (!userData.meshSimplify || !userData.meshSimplify.enable) {
        return outGLTFFile;
    }
    return await getOptimizerPath(asset, outGLTFFile, importerVersion, userData.meshSimplify);
}
async function getGltfFilePath(asset, importerVersion) {
    const userData = asset.userData;
    if (!userData.meshSimplify || !userData.meshSimplify.enable) {
        return asset.source;
    }
    return await getOptimizerPath(asset, asset.source, importerVersion, userData.meshSimplify);
}
function getOptimizerPath(asset, source, importerVersion, options) {
    if (options.algorithm === 'gltfpack' && options.gltfpackOptions) {
        return _getOptimizerPath(asset, source, importerVersion, options.gltfpackOptions);
    }
    // 新的减面库直接在 mesh 子资源上处理
    return source;
}
/**
 * gltfpackOptions
 * @param asset
 * @param source
 * @param options
 * @returns
 */
async function _getOptimizerPath(asset, source, importerVersion, options = {}) {
    const tmpDirDir = asset._assetDB.options.temp;
    const tmpDir = path_1.default.join(tmpDirDir, `gltfpack-${asset.uuid}`);
    fs_extra_1.default.ensureDirSync(tmpDir);
    const out = path_1.default.join(tmpDir, 'out.gltf');
    const statusPath = path_1.default.join(tmpDir, 'status.json');
    const expectedStatus = {
        mtimeMs: (await (0, fs_extra_1.stat)(asset.source)).mtimeMs,
        version: importerVersion,
        options: JSON.stringify(options),
    };
    if ((0, fs_extra_1.existsSync)(out) && (0, fs_extra_1.existsSync)(statusPath)) {
        try {
            const json = await (0, fs_extra_1.readJSON)(statusPath);
            if (json.mtimeMs === expectedStatus.mtimeMs &&
                json.version === expectedStatus.version &&
                json.options === expectedStatus.options) {
                return out;
            }
        }
        catch (error) { }
    }
    return new Promise((resolve) => {
        try {
            const cmd = path_1.default.join(global_1.GlobalPaths.workspace, 'node_modules/gltfpack/bin/gltfpack.js');
            const args = [
                '-i',
                source, // 输入 GLTF
                '-o',
                out, // 输出 GLTF
            ];
            const cVlaue = options.c;
            if (cVlaue === '1') {
                args.push('-c');
            }
            else if (cVlaue === '2') {
                args.push('-cc');
            }
            // textures
            if (options.te) {
                args.push('-te');
            } // 主缓冲
            if (options.tb) {
                args.push('-tb');
            } //
            if (options.tc) {
                args.push('-tc');
            }
            if (options.tq !== 50 && options.tq !== undefined) {
                args.push('-tq');
                args.push(options.tq);
            }
            if (options.tu) {
                args.push('-tu');
            }
            // simplification
            if (options.si !== 1 && options.si !== undefined) {
                args.push('-si');
                args.push(options.si);
            }
            if (options.sa) {
                args.push('-sa');
            }
            // vertices
            if (options.vp !== 14 && options.vp !== undefined) {
                args.push('-vp');
                args.push(options.vp);
            }
            if (options.vt !== 12 && options.vt !== undefined) {
                args.push('-vt');
                args.push(options.vt);
            }
            if (options.vn !== 8 && options.vn !== undefined) {
                args.push('-vn');
                args.push(options.vn);
            }
            // animation
            if (options.at !== 16 && options.at !== undefined) {
                args.push('-at');
                args.push(options.at);
            }
            if (options.ar !== 12 && options.ar !== undefined) {
                args.push('-ar');
                args.push(options.ar);
            }
            if (options.as !== 16 && options.as !== undefined) {
                args.push('-as');
                args.push(options.as);
            }
            if (options.af !== 30 && options.af !== undefined) {
                args.push('-af');
                args.push(options.af);
            }
            if (options.ac) {
                args.push('-ac');
            }
            // scene
            if (options.kn) {
                args.push('-kn');
            }
            if (options.ke) {
                args.push('-ke');
            }
            // miscellaneous
            if (options.cf) {
                args.push('-cf');
            }
            if (options.noq || options.noq === undefined) {
                args.push('-noq');
            }
            if (options.v || options.v === undefined) {
                args.push('-v');
            }
            // if (options.h) { args.push'-h'; }
            const child = (0, child_process_1.fork)(cmd, args);
            child.on('exit', async (code) => {
                // if (error) { console.error(`Error: ${error}`); }
                // if (stderr) { console.error(`Error: ${stderr}`); }
                // if (stdout) { console.log(`${stdout}`); }
                await fs_extra_1.default.writeFile(statusPath, JSON.stringify(expectedStatus, undefined, 2));
                resolve(out);
            });
        }
        catch (error) {
            console.error(error);
            resolve(source);
        }
    });
}
async function createGlTfReader(asset, importVersion) {
    let getFileFun;
    if (asset.meta.importer === 'fbx') {
        getFileFun = getFbxFilePath;
    }
    else {
        getFileFun = getGltfFilePath;
    }
    const glTfFilePath = await getFileFun(asset, importVersion);
    const isConvertedGlTf = glTfFilePath !== asset.source; // TODO: Better solution?
    // Validate.
    const userData = asset.userData;
    const skipValidation = userData.skipValidation === undefined ? true : userData.skipValidation;
    if (!skipValidation) {
        await (0, validation_1.validateGlTf)(glTfFilePath, asset.source);
    }
    // Create.
    const { glTF, buffers } = await (0, gltf_converter_1.readGltf)(glTfFilePath);
    const referencedBufferFiles = [];
    const loadedBuffers = await Promise.all(buffers.map(async (buffer) => {
        if (Buffer.isBuffer(buffer)) {
            return buffer;
        }
        else {
            if (!isConvertedGlTf) {
                // TODO: Better solution?
                referencedBufferFiles.push(buffer);
            }
            return await fs_extra_1.default.readFile(buffer);
        }
    }));
    function getRepOfGlTFResource(group, index) {
        if (!Array.isArray(glTF[group])) {
            return '';
        }
        else {
            let groupNameI18NKey;
            switch (group) {
                case 'meshes':
                    groupNameI18NKey = 'importer.gltf.gltf_asset_group_mesh';
                    break;
                case 'animations':
                    groupNameI18NKey = 'importer.gltf.gltf_asset_group_animation';
                    break;
                case 'nodes':
                    groupNameI18NKey = 'importer.gltf.gltf_asset_group_node';
                    break;
                case 'skins':
                    groupNameI18NKey = 'importer.gltf.gltf_asset_group_skin';
                    break;
                case 'samplers':
                    groupNameI18NKey = 'importer.gltf.gltf_asset_group_sampler';
                    break;
                default:
                    groupNameI18NKey = group;
                    break;
            }
            const asset = glTF[group][index];
            if (typeof asset.name === 'string' && asset.name) {
                return (0, utils_1.i18nTranslate)('importer.gltf.gltf_asset', {
                    group: (0, utils_1.i18nTranslate)(groupNameI18NKey),
                    name: asset.name,
                    index,
                });
            }
            else {
                return (0, utils_1.i18nTranslate)('importer.gltf.gltf_asset_no_name', {
                    group: (0, utils_1.i18nTranslate)(groupNameI18NKey),
                    index,
                });
            }
        }
    }
    const logger = (level, error, args) => {
        let message;
        switch (error) {
            case gltf_converter_1.GltfConverter.ConverterError.UnsupportedAlphaMode: {
                const tArgs = args;
                message = (0, utils_1.i18nTranslate)('importer.gltf.unsupported_alpha_mode', {
                    material: getRepOfGlTFResource('materials', tArgs.material),
                    mode: tArgs.mode,
                });
                break;
            }
            case gltf_converter_1.GltfConverter.ConverterError.UnsupportedTextureParameter: {
                const tArgs = args;
                message = (0, utils_1.i18nTranslate)('importer.gltf.unsupported_texture_parameter', {
                    sampler: '',
                    texture: getRepOfGlTFResource('textures', tArgs.texture),
                    type: (0, utils_1.i18nTranslate)(tArgs.type === 'minFilter'
                        ? 'importer.gltf.texture_parameter_min_filter'
                        : tArgs.type === 'magFilter'
                            ? 'importer.gltf.texture_parameter_mag_filter'
                            : 'importer.texture.wrap_mode'),
                    value: '',
                });
                break;
            }
            case gltf_converter_1.GltfConverter.ConverterError.UnsupportedChannelPath: {
                const tArgs = args;
                message = (0, utils_1.i18nTranslate)('importer.gltf.unsupported_channel_path', {
                    animation: getRepOfGlTFResource('animations', tArgs.animation),
                    channel: tArgs.channel,
                    path: tArgs.path,
                });
                break;
            }
            case gltf_converter_1.GltfConverter.ConverterError.ReferenceSkinInDifferentScene: {
                const tArgs = args;
                message = (0, utils_1.i18nTranslate)('importer.gltf.reference_skin_in_different_scene', {
                    node: getRepOfGlTFResource('nodes', tArgs.node),
                    skin: getRepOfGlTFResource('skins', tArgs.skin),
                });
                break;
            }
            case gltf_converter_1.GltfConverter.ConverterError.DisallowCubicSplineChannelSplit: {
                const tArgs = args;
                message = (0, utils_1.i18nTranslate)('importer.gltf.disallow_cubic_spline_channel_split', {
                    animation: getRepOfGlTFResource('animations', tArgs.animation),
                    channel: tArgs.channel,
                });
                break;
            }
            case gltf_converter_1.GltfConverter.ConverterError.FailedToCalculateTangents: {
                const tArgs = args;
                message = (0, utils_1.i18nTranslate)(tArgs.reason === 'normal'
                    ? 'importer.gltf.failed_to_calculate_tangents_due_to_lack_of_normals'
                    : 'importer.gltf.failed_to_calculate_tangents_due_to_lack_of_uvs', {
                    mesh: getRepOfGlTFResource('meshes', tArgs.mesh),
                    primitive: tArgs.primitive,
                });
                break;
            }
            case gltf_converter_1.GltfConverter.ConverterError.EmptyMorph: {
                const tArgs = args;
                message = (0, utils_1.i18nTranslate)('importer.gltf.empty_morph', {
                    mesh: getRepOfGlTFResource('meshes', tArgs.mesh),
                    primitive: tArgs.primitive,
                });
                break;
            }
            case gltf_converter_1.GltfConverter.ConverterError.UnsupportedExtension: {
                const tArgs = args;
                message = (0, utils_1.i18nTranslate)('importer.gltf.unsupported_extension', {
                    name: tArgs.name,
                    // required, // 是否在 glTF 里被标记为“必需”
                });
                break;
            }
        }
        const link = (0, utils_1.linkToAssetTarget)(asset.uuid);
        switch (level) {
            case gltf_converter_1.GltfConverter.LogLevel.Info:
            default:
                console.log(message, link);
                break;
            case gltf_converter_1.GltfConverter.LogLevel.Warning:
                console.warn(message, link);
                break;
            case gltf_converter_1.GltfConverter.LogLevel.Error:
                console.error(message, link);
                break;
            case gltf_converter_1.GltfConverter.LogLevel.Debug:
                console.debug(message, link);
                break;
        }
    };
    const converter = new gltf_converter_1.GltfConverter(glTF, loadedBuffers, glTfFilePath, {
        logger,
        userData: asset.userData,
        promoteSingleRootNode: asset.userData?.promoteSingleRootNode ?? false,
        generateLightmapUVNode: asset.userData?.generateLightmapUVNode ?? false,
    });
    return { converter, referencedBufferFiles };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZGVyLW1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9hc3NldHMvYXNzZXQtaGFuZGxlci9hc3NldHMvZ2x0Zi9yZWFkZXItbWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE2Q0Esd0NBMkJDO0FBQ0QsMENBTUM7QUFFRCw0Q0FPQztBQXRGRCx1Q0FBK0Q7QUFDL0QsNERBQWtFO0FBQ2xFLDZDQUE0QztBQUM1QyxxREFBMEQ7QUFDMUQsaURBQXFDO0FBQ3JDLGdEQUF3QjtBQUN4QixrREFBb0Q7QUFDcEQseUVBQWdEO0FBQ2hELDBEQUE0RDtBQUM1RCwwRUFBcUU7QUFDckUsK0NBQTBDO0FBRzFDLE1BQU0saUJBQWlCO0lBQ1gsSUFBSSxHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO0lBRWhEOzs7O09BSUc7SUFDSSxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQVksRUFBRSxhQUFxQixFQUFFLHdCQUF3QixHQUFHLEtBQUs7UUFDMUYsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNWLE1BQU0sRUFBRSxTQUFTLEVBQUUscUJBQXFCLEVBQUUsR0FBRyxNQUFNLGdCQUFnQixDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQztZQUMxRixNQUFNLEdBQUcsU0FBUyxDQUFDO1lBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEMsSUFBSSx3QkFBd0IsRUFBRSxDQUFDO2dCQUMzQixLQUFLLE1BQU0sb0JBQW9CLElBQUkscUJBQXFCLEVBQUUsQ0FBQztvQkFDdkQsS0FBSyxDQUFDLE1B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MUIsQ0FBQztZQUNELElBQUksT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksT0FBTyxDQUFDLEVBQUUsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDMUIsQ0FBQztZQUNELElBQUksT0FBTyxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLEVBQUUsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDMUIsQ0FBQztZQUVELFlBQVk7WUFDWixJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLENBQUM7WUFDRCxJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLENBQUM7WUFDRCxJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ2hELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FB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LE1BQU07UUFDZCxDQUFDO0lBQ0wsQ0FBQyxDQUFDO0lBRUYsTUFBTSxTQUFTLEdBQUcsSUFBSSw4QkFBYSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFO1FBQ25FLE1BQU07UUFDTixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQXdCO1FBQ3hDLHFCQUFxQixFQUFHLEtBQUssQ0FBQyxRQUF5QixFQUFFLHFCQUFxQixJQUFJLEtBQUs7UUFDdkYsc0JBQXNCLEVBQUcsS0FBSyxDQUFDLFFBQXlCLEVBQUUsc0JBQXNCLElBQUksS0FBSztLQUM1RixDQUFDLENBQUM7SUFFSCxPQUFPLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFLENBQUM7QUFDaEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFzc2V0IH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IHsgR2x0ZnBhY2tPcHRpb25zLCBHbFRGVXNlckRhdGEsIE1lc2hPcHRpbWl6ZXJPcHRpb24gfSBmcm9tICcuLi8uLi8uLi9AdHlwZXMvdXNlckRhdGFzJztcclxuaW1wb3J0IHsgaTE4blRyYW5zbGF0ZSwgbGlua1RvQXNzZXRUYXJnZXQgfSBmcm9tICcuLi8uLi91dGlscyc7XHJcbmltcG9ydCB7IEdsdGZDb252ZXJ0ZXIsIHJlYWRHbHRmIH0gZnJvbSAnLi4vdXRpbHMvZ2x0Zi1jb252ZXJ0ZXInO1xyXG5pbXBvcnQgeyB2YWxpZGF0ZUdsVGYgfSBmcm9tICcuL3ZhbGlkYXRpb24nO1xyXG5pbXBvcnQgZnMsIHsgZXhpc3RzU3luYywgcmVhZEpTT04sIHN0YXQgfSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCB7IGZvcmsgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IEdsb2JhbFBhdGhzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vZ2xvYmFsJztcclxuaW1wb3J0IGFzc2V0Q29uZmlnIGZyb20gJy4uLy4uLy4uL2Fzc2V0LWNvbmZpZyc7XHJcbmltcG9ydCB7IGNyZWF0ZUZieENvbnZlcnRlciB9IGZyb20gJy4uL3V0aWxzL2ZieC1jb252ZXJ0ZXInO1xyXG5pbXBvcnQgeyBtb2RlbENvbnZlcnRSb3V0aW5lIH0gZnJvbSAnLi4vdXRpbHMvbW9kZWwtY29udmVydC1yb3V0aW5lJztcclxuaW1wb3J0IHsgZmJ4VG9HbFRmIH0gZnJvbSAnLi9mYngtdG8tZ2x0Zic7XHJcbmltcG9ydCB7IEkxOG5LZXlzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vaTE4bi90eXBlcy9nZW5lcmF0ZWQnO1xyXG5cclxuY2xhc3MgR2xUZlJlYWRlck1hbmFnZXIge1xyXG4gICAgcHJpdmF0ZSBfbWFwID0gbmV3IE1hcDxzdHJpbmcsIEdsdGZDb252ZXJ0ZXI+KCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGFzc2V0XHJcbiAgICAgKiBAcGFyYW0gaW5qZWN0QnVmZmVyRGVwZW5kZW5jaWVzIOaYr+WQpuW9k+WIm+W7uiBnbFRGIOi9rOaNouWZqOeahOaXtuWAmeWQjOaXtuazqOWFpSBnbFRGIGFzc2V0IOWvueWFtuW8leeUqOeahCBidWZmZXIg5paH5Lu255qE5L6d6LWW44CCXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhc3luYyBnZXRPckNyZWF0ZShhc3NldDogQXNzZXQsIGltcG9ydFZlcnNpb246IHN0cmluZywgaW5qZWN0QnVmZmVyRGVwZW5kZW5jaWVzID0gZmFsc2UpIHtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy5fbWFwLmdldChhc3NldC51dWlkKTtcclxuICAgICAgICBpZiAoIXJlc3VsdCkge1xyXG4gICAgICAgICAgICBjb25zdCB7IGNvbnZlcnRlciwgcmVmZXJlbmNlZEJ1ZmZlckZpbGVzIH0gPSBhd2FpdCBjcmVhdGVHbFRmUmVhZGVyKGFzc2V0LCBpbXBvcnRWZXJzaW9uKTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gY29udmVydGVyO1xyXG4gICAgICAgICAgICB0aGlzLl9tYXAuc2V0KGFzc2V0LnV1aWQsIHJlc3VsdCk7XHJcbiAgICAgICAgICAgIGlmIChpbmplY3RCdWZmZXJEZXBlbmRlbmNpZXMpIHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcmVmZXJlbmNlZEJ1ZmZlckZpbGUgb2YgcmVmZXJlbmNlZEJ1ZmZlckZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXNzZXQuZGVwZW5kKHJlZmVyZW5jZWRCdWZmZXJGaWxlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZWxldGUoYXNzZXQ6IEFzc2V0KSB7XHJcbiAgICAgICAgdGhpcy5fbWFwLmRlbGV0ZShhc3NldC51dWlkKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGdsVGZSZWFkZXJNYW5hZ2VyID0gbmV3IEdsVGZSZWFkZXJNYW5hZ2VyKCk7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RmJ4RmlsZVBhdGgoYXNzZXQ6IEFzc2V0LCBpbXBvcnRlclZlcnNpb246IHN0cmluZywpIHtcclxuICAgIGNvbnN0IHVzZXJEYXRhID0gYXNzZXQudXNlckRhdGEgYXMgR2xURlVzZXJEYXRhO1xyXG4gICAgaWYgKHR5cGVvZiB1c2VyRGF0YS5mYng/LnNtYXJ0TWF0ZXJpYWxFbmFibGVkID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICh1c2VyRGF0YS5mYnggPz89IHt9KS5zbWFydE1hdGVyaWFsRW5hYmxlZCA9IGF3YWl0IGFzc2V0Q29uZmlnLmdldFByb2plY3Q8Ym9vbGVhbj4oJ2ZieC5tYXRlcmlhbC5zbWFydCcpID8/IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgbGV0IG91dEdMVEZGaWxlOiBzdHJpbmc7XHJcbiAgICBpZiAodXNlckRhdGEubGVnYWN5RmJ4SW1wb3J0ZXIpIHtcclxuICAgICAgICBvdXRHTFRGRmlsZSA9IGF3YWl0IGZieFRvR2xUZihhc3NldCwgYXNzZXQuX2Fzc2V0REIsIGltcG9ydGVyVmVyc2lvbik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IFBhcmFtZXRlcnM8dHlwZW9mIGNyZWF0ZUZieENvbnZlcnRlcj5bMF0gPSB7fTtcclxuICAgICAgICBvcHRpb25zLnVuaXRDb252ZXJzaW9uID0gdXNlckRhdGEuZmJ4Py51bml0Q29udmVyc2lvbjtcclxuICAgICAgICBvcHRpb25zLmFuaW1hdGlvbkJha2VSYXRlID0gdXNlckRhdGEuZmJ4Py5hbmltYXRpb25CYWtlUmF0ZTtcclxuICAgICAgICBvcHRpb25zLnByZWZlckxvY2FsVGltZVNwYW4gPSB1c2VyRGF0YS5mYng/LnByZWZlckxvY2FsVGltZVNwYW47XHJcbiAgICAgICAgb3B0aW9ucy5zbWFydE1hdGVyaWFsRW5hYmxlZCA9IHVzZXJEYXRhLmZieD8uc21hcnRNYXRlcmlhbEVuYWJsZWQgPz8gZmFsc2U7XHJcbiAgICAgICAgb3B0aW9ucy5tYXRjaE1lc2hOYW1lcyA9IHVzZXJEYXRhLmZieD8ubWF0Y2hNZXNoTmFtZXMgPz8gdHJ1ZTtcclxuICAgICAgICBjb25zdCBmYnhDb252ZXJ0ZXIgPSBjcmVhdGVGYnhDb252ZXJ0ZXIob3B0aW9ucyk7XHJcbiAgICAgICAgY29uc3QgY29udmVydGVkID0gYXdhaXQgbW9kZWxDb252ZXJ0Um91dGluZSgnZmJ4LkZCWC1nbFRGLWNvbnYnLCBhc3NldCwgYXNzZXQuX2Fzc2V0REIsIGltcG9ydGVyVmVyc2lvbiwgZmJ4Q29udmVydGVyKTtcclxuICAgICAgICBpZiAoIWNvbnZlcnRlZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBpbXBvcnQgJHthc3NldC5zb3VyY2V9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG91dEdMVEZGaWxlID0gY29udmVydGVkO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdXNlckRhdGEubWVzaFNpbXBsaWZ5IHx8ICF1c2VyRGF0YS5tZXNoU2ltcGxpZnkuZW5hYmxlKSB7XHJcbiAgICAgICAgcmV0dXJuIG91dEdMVEZGaWxlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGF3YWl0IGdldE9wdGltaXplclBhdGgoYXNzZXQsIG91dEdMVEZGaWxlLCBpbXBvcnRlclZlcnNpb24sIHVzZXJEYXRhLm1lc2hTaW1wbGlmeSk7XHJcbn1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEdsdGZGaWxlUGF0aChhc3NldDogQXNzZXQsIGltcG9ydGVyVmVyc2lvbjogc3RyaW5nKSB7XHJcbiAgICBjb25zdCB1c2VyRGF0YSA9IGFzc2V0LnVzZXJEYXRhIGFzIEdsVEZVc2VyRGF0YTtcclxuICAgIGlmICghdXNlckRhdGEubWVzaFNpbXBsaWZ5IHx8ICF1c2VyRGF0YS5tZXNoU2ltcGxpZnkuZW5hYmxlKSB7XHJcbiAgICAgICAgcmV0dXJuIGFzc2V0LnNvdXJjZTtcclxuICAgIH1cclxuICAgIHJldHVybiBhd2FpdCBnZXRPcHRpbWl6ZXJQYXRoKGFzc2V0LCBhc3NldC5zb3VyY2UsIGltcG9ydGVyVmVyc2lvbiwgdXNlckRhdGEubWVzaFNpbXBsaWZ5KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldE9wdGltaXplclBhdGgoYXNzZXQ6IEFzc2V0LCBzb3VyY2U6IHN0cmluZywgaW1wb3J0ZXJWZXJzaW9uOiBzdHJpbmcsIG9wdGlvbnM6IE1lc2hPcHRpbWl6ZXJPcHRpb24pIHtcclxuICAgIGlmIChvcHRpb25zLmFsZ29yaXRobSA9PT0gJ2dsdGZwYWNrJyAmJiBvcHRpb25zLmdsdGZwYWNrT3B0aW9ucykge1xyXG4gICAgICAgIHJldHVybiBfZ2V0T3B0aW1pemVyUGF0aChhc3NldCwgc291cmNlLCBpbXBvcnRlclZlcnNpb24sIG9wdGlvbnMuZ2x0ZnBhY2tPcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyDmlrDnmoTlh4/pnaLlupPnm7TmjqXlnKggbWVzaCDlrZDotYTmupDkuIrlpITnkIZcclxuICAgIHJldHVybiBzb3VyY2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBnbHRmcGFja09wdGlvbnNcclxuICogQHBhcmFtIGFzc2V0XHJcbiAqIEBwYXJhbSBzb3VyY2VcclxuICogQHBhcmFtIG9wdGlvbnNcclxuICogQHJldHVybnNcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIF9nZXRPcHRpbWl6ZXJQYXRoKGFzc2V0OiBBc3NldCwgc291cmNlOiBzdHJpbmcsIGltcG9ydGVyVmVyc2lvbjogc3RyaW5nLCBvcHRpb25zOiBHbHRmcGFja09wdGlvbnMgPSB7fSk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICBjb25zdCB0bXBEaXJEaXIgPSBhc3NldC5fYXNzZXREQi5vcHRpb25zLnRlbXA7XHJcbiAgICBjb25zdCB0bXBEaXIgPSBwYXRoLmpvaW4odG1wRGlyRGlyLCBgZ2x0ZnBhY2stJHthc3NldC51dWlkfWApO1xyXG4gICAgZnMuZW5zdXJlRGlyU3luYyh0bXBEaXIpO1xyXG5cclxuICAgIGNvbnN0IG91dCA9IHBhdGguam9pbih0bXBEaXIsICdvdXQuZ2x0ZicpO1xyXG4gICAgY29uc3Qgc3RhdHVzUGF0aCA9IHBhdGguam9pbih0bXBEaXIsICdzdGF0dXMuanNvbicpO1xyXG5cclxuICAgIGNvbnN0IGV4cGVjdGVkU3RhdHVzID0ge1xyXG4gICAgICAgIG10aW1lTXM6IChhd2FpdCBzdGF0KGFzc2V0LnNvdXJjZSkpLm10aW1lTXMsXHJcbiAgICAgICAgdmVyc2lvbjogaW1wb3J0ZXJWZXJzaW9uLFxyXG4gICAgICAgIG9wdGlvbnM6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpLFxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoZXhpc3RzU3luYyhvdXQpICYmIGV4aXN0c1N5bmMoc3RhdHVzUGF0aCkpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBqc29uID0gYXdhaXQgcmVhZEpTT04oc3RhdHVzUGF0aCk7XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgIGpzb24ubXRpbWVNcyA9PT0gZXhwZWN0ZWRTdGF0dXMubXRpbWVNcyAmJlxyXG4gICAgICAgICAgICAgICAganNvbi52ZXJzaW9uID09PSBleHBlY3RlZFN0YXR1cy52ZXJzaW9uICYmXHJcbiAgICAgICAgICAgICAgICBqc29uLm9wdGlvbnMgPT09IGV4cGVjdGVkU3RhdHVzLm9wdGlvbnNcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHsgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNtZCA9IHBhdGguam9pbihHbG9iYWxQYXRocy53b3Jrc3BhY2UsICdub2RlX21vZHVsZXMvZ2x0ZnBhY2svYmluL2dsdGZwYWNrLmpzJyk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBhcmdzID0gW1xyXG4gICAgICAgICAgICAgICAgJy1pJyxcclxuICAgICAgICAgICAgICAgIHNvdXJjZSwgLy8g6L6T5YWlIEdMVEZcclxuICAgICAgICAgICAgICAgICctbycsXHJcbiAgICAgICAgICAgICAgICBvdXQsIC8vIOi+k+WHuiBHTFRGXHJcbiAgICAgICAgICAgIF07XHJcblxyXG4gICAgICAgICAgICBjb25zdCBjVmxhdWUgPSBvcHRpb25zLmM7XHJcbiAgICAgICAgICAgIGlmIChjVmxhdWUgPT09ICcxJykge1xyXG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKCctYycpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNWbGF1ZSA9PT0gJzInKSB7XHJcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goJy1jYycpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyB0ZXh0dXJlc1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50ZSkge1xyXG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKCctdGUnKTtcclxuICAgICAgICAgICAgfSAvLyDkuLvnvJPlhrJcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudGIpIHtcclxuICAgICAgICAgICAgICAgIGFyZ3MucHVzaCgnLXRiJyk7XHJcbiAgICAgICAgICAgIH0gLy9cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudGMpIHtcclxuICAgICAgICAgICAgICAgIGFyZ3MucHVzaCgnLXRjJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudHEgIT09IDUwICYmIG9wdGlvbnMudHEgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKCctdHEnKTtcclxuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChvcHRpb25zLnRxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50dSkge1xyXG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKCctdHUnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gc2ltcGxpZmljYXRpb25cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2kgIT09IDEgJiYgb3B0aW9ucy5zaSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goJy1zaScpO1xyXG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKG9wdGlvbnMuc2kpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNhKSB7XHJcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goJy1zYScpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyB2ZXJ0aWNlc1xyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy52cCAhPT0gMTQgJiYgb3B0aW9ucy52cCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goJy12cCcpO1xyXG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKG9wdGlvbnMudnApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnZ0ICE9PSAxMiAmJiBvcHRpb25zLnZ0ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGFyZ3MucHVzaCgnLXZ0Jyk7XHJcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2gob3B0aW9ucy52dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMudm4gIT09IDggJiYgb3B0aW9ucy52biAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goJy12bicpO1xyXG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKG9wdGlvbnMudm4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhbmltYXRpb25cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYXQgIT09IDE2ICYmIG9wdGlvbnMuYXQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKCctYXQnKTtcclxuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChvcHRpb25zLmF0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hciAhPT0gMTIgJiYgb3B0aW9ucy5hciAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goJy1hcicpO1xyXG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKG9wdGlvbnMuYXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmFzICE9PSAxNiAmJiBvcHRpb25zLmFzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGFyZ3MucHVzaCgnLWFzJyk7XHJcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2gob3B0aW9ucy5hcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWYgIT09IDMwICYmIG9wdGlvbnMuYWYgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKCctYWYnKTtcclxuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChvcHRpb25zLmFmKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hYykge1xyXG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKCctYWMnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gc2NlbmVcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMua24pIHtcclxuICAgICAgICAgICAgICAgIGFyZ3MucHVzaCgnLWtuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMua2UpIHtcclxuICAgICAgICAgICAgICAgIGFyZ3MucHVzaCgnLWtlJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIG1pc2NlbGxhbmVvdXNcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuY2YpIHtcclxuICAgICAgICAgICAgICAgIGFyZ3MucHVzaCgnLWNmJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMubm9xIHx8IG9wdGlvbnMubm9xID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGFyZ3MucHVzaCgnLW5vcScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnYgfHwgb3B0aW9ucy52ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGFyZ3MucHVzaCgnLXYnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBpZiAob3B0aW9ucy5oKSB7IGFyZ3MucHVzaCctaCc7IH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gZm9yayhjbWQsIGFyZ3MpO1xyXG4gICAgICAgICAgICBjaGlsZC5vbignZXhpdCcsIGFzeW5jIChjb2RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiAoZXJyb3IpIHsgY29uc29sZS5lcnJvcihgRXJyb3I6ICR7ZXJyb3J9YCk7IH1cclxuICAgICAgICAgICAgICAgIC8vIGlmIChzdGRlcnIpIHsgY29uc29sZS5lcnJvcihgRXJyb3I6ICR7c3RkZXJyfWApOyB9XHJcbiAgICAgICAgICAgICAgICAvLyBpZiAoc3Rkb3V0KSB7IGNvbnNvbGUubG9nKGAke3N0ZG91dH1gKTsgfVxyXG5cclxuICAgICAgICAgICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShzdGF0dXNQYXRoLCBKU09OLnN0cmluZ2lmeShleHBlY3RlZFN0YXR1cywgdW5kZWZpbmVkLCAyKSk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKG91dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICByZXNvbHZlKHNvdXJjZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlR2xUZlJlYWRlcihhc3NldDogQXNzZXQsIGltcG9ydFZlcnNpb246IHN0cmluZykge1xyXG4gICAgbGV0IGdldEZpbGVGdW46IEZ1bmN0aW9uO1xyXG4gICAgaWYgKGFzc2V0Lm1ldGEuaW1wb3J0ZXIgPT09ICdmYngnKSB7XHJcbiAgICAgICAgZ2V0RmlsZUZ1biA9IGdldEZieEZpbGVQYXRoO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBnZXRGaWxlRnVuID0gZ2V0R2x0ZkZpbGVQYXRoO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGdsVGZGaWxlUGF0aDogc3RyaW5nID0gYXdhaXQgZ2V0RmlsZUZ1bihhc3NldCwgaW1wb3J0VmVyc2lvbik7XHJcblxyXG4gICAgY29uc3QgaXNDb252ZXJ0ZWRHbFRmID0gZ2xUZkZpbGVQYXRoICE9PSBhc3NldC5zb3VyY2U7IC8vIFRPRE86IEJldHRlciBzb2x1dGlvbj9cclxuXHJcbiAgICAvLyBWYWxpZGF0ZS5cclxuICAgIGNvbnN0IHVzZXJEYXRhID0gYXNzZXQudXNlckRhdGEgYXMgR2xURlVzZXJEYXRhO1xyXG4gICAgY29uc3Qgc2tpcFZhbGlkYXRpb24gPSB1c2VyRGF0YS5za2lwVmFsaWRhdGlvbiA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IHVzZXJEYXRhLnNraXBWYWxpZGF0aW9uO1xyXG4gICAgaWYgKCFza2lwVmFsaWRhdGlvbikge1xyXG4gICAgICAgIGF3YWl0IHZhbGlkYXRlR2xUZihnbFRmRmlsZVBhdGgsIGFzc2V0LnNvdXJjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlLlxyXG4gICAgY29uc3QgeyBnbFRGLCBidWZmZXJzIH0gPSBhd2FpdCByZWFkR2x0ZihnbFRmRmlsZVBhdGgpO1xyXG5cclxuICAgIGNvbnN0IHJlZmVyZW5jZWRCdWZmZXJGaWxlczogc3RyaW5nW10gPSBbXTtcclxuICAgIGNvbnN0IGxvYWRlZEJ1ZmZlcnMgPSBhd2FpdCBQcm9taXNlLmFsbChcclxuICAgICAgICBidWZmZXJzLm1hcChhc3luYyAoYnVmZmVyKTogUHJvbWlzZTxCdWZmZXI+ID0+IHtcclxuICAgICAgICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihidWZmZXIpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVmZmVyO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpc0NvbnZlcnRlZEdsVGYpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBCZXR0ZXIgc29sdXRpb24/XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlZEJ1ZmZlckZpbGVzLnB1c2goYnVmZmVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBmcy5yZWFkRmlsZShidWZmZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldFJlcE9mR2xURlJlc291cmNlKGdyb3VwOiBzdHJpbmcsIGluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoZ2xURltncm91cF0pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgZ3JvdXBOYW1lSTE4TktleTogSTE4bktleXM7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ21lc2hlcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBOYW1lSTE4TktleSA9ICdpbXBvcnRlci5nbHRmLmdsdGZfYXNzZXRfZ3JvdXBfbWVzaCc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdhbmltYXRpb25zJzpcclxuICAgICAgICAgICAgICAgICAgICBncm91cE5hbWVJMThOS2V5ID0gJ2ltcG9ydGVyLmdsdGYuZ2x0Zl9hc3NldF9ncm91cF9hbmltYXRpb24nO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbm9kZXMnOlxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwTmFtZUkxOE5LZXkgPSAnaW1wb3J0ZXIuZ2x0Zi5nbHRmX2Fzc2V0X2dyb3VwX25vZGUnO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc2tpbnMnOlxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwTmFtZUkxOE5LZXkgPSAnaW1wb3J0ZXIuZ2x0Zi5nbHRmX2Fzc2V0X2dyb3VwX3NraW4nO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc2FtcGxlcnMnOlxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwTmFtZUkxOE5LZXkgPSAnaW1wb3J0ZXIuZ2x0Zi5nbHRmX2Fzc2V0X2dyb3VwX3NhbXBsZXInO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBncm91cE5hbWVJMThOS2V5ID0gZ3JvdXAgYXMgSTE4bktleXM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgYXNzZXQgPSBnbFRGW2dyb3VwXVtpbmRleF07XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXNzZXQubmFtZSA9PT0gJ3N0cmluZycgJiYgYXNzZXQubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGkxOG5UcmFuc2xhdGUoJ2ltcG9ydGVyLmdsdGYuZ2x0Zl9hc3NldCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBncm91cDogaTE4blRyYW5zbGF0ZShncm91cE5hbWVJMThOS2V5KSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBhc3NldC5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4LFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaTE4blRyYW5zbGF0ZSgnaW1wb3J0ZXIuZ2x0Zi5nbHRmX2Fzc2V0X25vX25hbWUnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXA6IGkxOG5UcmFuc2xhdGUoZ3JvdXBOYW1lSTE4TktleSksXHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXgsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsb2dnZXI6IEdsdGZDb252ZXJ0ZXIuTG9nZ2VyID0gKGxldmVsLCBlcnJvciwgYXJncykgPT4ge1xyXG4gICAgICAgIGxldCBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgc3dpdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjYXNlIEdsdGZDb252ZXJ0ZXIuQ29udmVydGVyRXJyb3IuVW5zdXBwb3J0ZWRBbHBoYU1vZGU6IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRBcmdzID0gYXJncyBhcyBHbHRmQ29udmVydGVyLkNvbnZlcnRlckVycm9yQXJndW1lbnRGb3JtYXRbR2x0ZkNvbnZlcnRlci5Db252ZXJ0ZXJFcnJvci5VbnN1cHBvcnRlZEFscGhhTW9kZV07XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gaTE4blRyYW5zbGF0ZSgnaW1wb3J0ZXIuZ2x0Zi51bnN1cHBvcnRlZF9hbHBoYV9tb2RlJywge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGVyaWFsOiBnZXRSZXBPZkdsVEZSZXNvdXJjZSgnbWF0ZXJpYWxzJywgdEFyZ3MubWF0ZXJpYWwpLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IHRBcmdzLm1vZGUsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkNvbnZlcnRlci5Db252ZXJ0ZXJFcnJvci5VbnN1cHBvcnRlZFRleHR1cmVQYXJhbWV0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRBcmdzID0gYXJncyBhcyBHbHRmQ29udmVydGVyLkNvbnZlcnRlckVycm9yQXJndW1lbnRGb3JtYXRbR2x0ZkNvbnZlcnRlci5Db252ZXJ0ZXJFcnJvci5VbnN1cHBvcnRlZFRleHR1cmVQYXJhbWV0ZXJdO1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGkxOG5UcmFuc2xhdGUoJ2ltcG9ydGVyLmdsdGYudW5zdXBwb3J0ZWRfdGV4dHVyZV9wYXJhbWV0ZXInLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2FtcGxlcjogJycsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dHVyZTogZ2V0UmVwT2ZHbFRGUmVzb3VyY2UoJ3RleHR1cmVzJywgdEFyZ3MudGV4dHVyZSksXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaTE4blRyYW5zbGF0ZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgdEFyZ3MudHlwZSA9PT0gJ21pbkZpbHRlcidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2ltcG9ydGVyLmdsdGYudGV4dHVyZV9wYXJhbWV0ZXJfbWluX2ZpbHRlcicgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0QXJncy50eXBlID09PSAnbWFnRmlsdGVyJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2ltcG9ydGVyLmdsdGYudGV4dHVyZV9wYXJhbWV0ZXJfbWFnX2ZpbHRlcidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdpbXBvcnRlci50ZXh0dXJlLndyYXBfbW9kZScsXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkNvbnZlcnRlci5Db252ZXJ0ZXJFcnJvci5VbnN1cHBvcnRlZENoYW5uZWxQYXRoOiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0QXJncyA9IGFyZ3MgYXMgR2x0ZkNvbnZlcnRlci5Db252ZXJ0ZXJFcnJvckFyZ3VtZW50Rm9ybWF0W0dsdGZDb252ZXJ0ZXIuQ29udmVydGVyRXJyb3IuVW5zdXBwb3J0ZWRDaGFubmVsUGF0aF07XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gaTE4blRyYW5zbGF0ZSgnaW1wb3J0ZXIuZ2x0Zi51bnN1cHBvcnRlZF9jaGFubmVsX3BhdGgnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBnZXRSZXBPZkdsVEZSZXNvdXJjZSgnYW5pbWF0aW9ucycsIHRBcmdzLmFuaW1hdGlvbiksXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbDogdEFyZ3MuY2hhbm5lbCxcclxuICAgICAgICAgICAgICAgICAgICBwYXRoOiB0QXJncy5wYXRoLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlIEdsdGZDb252ZXJ0ZXIuQ29udmVydGVyRXJyb3IuUmVmZXJlbmNlU2tpbkluRGlmZmVyZW50U2NlbmU6IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRBcmdzID1cclxuICAgICAgICAgICAgICAgICAgICBhcmdzIGFzIEdsdGZDb252ZXJ0ZXIuQ29udmVydGVyRXJyb3JBcmd1bWVudEZvcm1hdFtHbHRmQ29udmVydGVyLkNvbnZlcnRlckVycm9yLlJlZmVyZW5jZVNraW5JbkRpZmZlcmVudFNjZW5lXTtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBpMThuVHJhbnNsYXRlKCdpbXBvcnRlci5nbHRmLnJlZmVyZW5jZV9za2luX2luX2RpZmZlcmVudF9zY2VuZScsIHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlOiBnZXRSZXBPZkdsVEZSZXNvdXJjZSgnbm9kZXMnLCB0QXJncy5ub2RlKSxcclxuICAgICAgICAgICAgICAgICAgICBza2luOiBnZXRSZXBPZkdsVEZSZXNvdXJjZSgnc2tpbnMnLCB0QXJncy5za2luKSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBHbHRmQ29udmVydGVyLkNvbnZlcnRlckVycm9yLkRpc2FsbG93Q3ViaWNTcGxpbmVDaGFubmVsU3BsaXQ6IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRBcmdzID1cclxuICAgICAgICAgICAgICAgICAgICBhcmdzIGFzIEdsdGZDb252ZXJ0ZXIuQ29udmVydGVyRXJyb3JBcmd1bWVudEZvcm1hdFtHbHRmQ29udmVydGVyLkNvbnZlcnRlckVycm9yLkRpc2FsbG93Q3ViaWNTcGxpbmVDaGFubmVsU3BsaXRdO1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGkxOG5UcmFuc2xhdGUoJ2ltcG9ydGVyLmdsdGYuZGlzYWxsb3dfY3ViaWNfc3BsaW5lX2NoYW5uZWxfc3BsaXQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBnZXRSZXBPZkdsVEZSZXNvdXJjZSgnYW5pbWF0aW9ucycsIHRBcmdzLmFuaW1hdGlvbiksXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbm5lbDogdEFyZ3MuY2hhbm5lbCxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSBHbHRmQ29udmVydGVyLkNvbnZlcnRlckVycm9yLkZhaWxlZFRvQ2FsY3VsYXRlVGFuZ2VudHM6IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRBcmdzID0gYXJncyBhcyBHbHRmQ29udmVydGVyLkNvbnZlcnRlckVycm9yQXJndW1lbnRGb3JtYXRbR2x0ZkNvbnZlcnRlci5Db252ZXJ0ZXJFcnJvci5GYWlsZWRUb0NhbGN1bGF0ZVRhbmdlbnRzXTtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBpMThuVHJhbnNsYXRlKFxyXG4gICAgICAgICAgICAgICAgICAgIHRBcmdzLnJlYXNvbiA9PT0gJ25vcm1hbCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyAnaW1wb3J0ZXIuZ2x0Zi5mYWlsZWRfdG9fY2FsY3VsYXRlX3RhbmdlbnRzX2R1ZV90b19sYWNrX29mX25vcm1hbHMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogJ2ltcG9ydGVyLmdsdGYuZmFpbGVkX3RvX2NhbGN1bGF0ZV90YW5nZW50c19kdWVfdG9fbGFja19vZl91dnMnLFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzaDogZ2V0UmVwT2ZHbFRGUmVzb3VyY2UoJ21lc2hlcycsIHRBcmdzLm1lc2gpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltaXRpdmU6IHRBcmdzLnByaW1pdGl2ZSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkNvbnZlcnRlci5Db252ZXJ0ZXJFcnJvci5FbXB0eU1vcnBoOiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0QXJncyA9IGFyZ3MgYXMgR2x0ZkNvbnZlcnRlci5Db252ZXJ0ZXJFcnJvckFyZ3VtZW50Rm9ybWF0W0dsdGZDb252ZXJ0ZXIuQ29udmVydGVyRXJyb3IuRW1wdHlNb3JwaF07XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gaTE4blRyYW5zbGF0ZSgnaW1wb3J0ZXIuZ2x0Zi5lbXB0eV9tb3JwaCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBtZXNoOiBnZXRSZXBPZkdsVEZSZXNvdXJjZSgnbWVzaGVzJywgdEFyZ3MubWVzaCksXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpbWl0aXZlOiB0QXJncy5wcmltaXRpdmUsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkNvbnZlcnRlci5Db252ZXJ0ZXJFcnJvci5VbnN1cHBvcnRlZEV4dGVuc2lvbjoge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdEFyZ3MgPSBhcmdzIGFzIEdsdGZDb252ZXJ0ZXIuQ29udmVydGVyRXJyb3JBcmd1bWVudEZvcm1hdFtHbHRmQ29udmVydGVyLkNvbnZlcnRlckVycm9yLlVuc3VwcG9ydGVkRXh0ZW5zaW9uXTtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBpMThuVHJhbnNsYXRlKCdpbXBvcnRlci5nbHRmLnVuc3VwcG9ydGVkX2V4dGVuc2lvbicsIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0QXJncy5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlcXVpcmVkLCAvLyDmmK/lkKblnKggZ2xURiDph4zooqvmoIforrDkuLrigJzlv4XpnIDigJ1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxpbmsgPSBsaW5rVG9Bc3NldFRhcmdldChhc3NldC51dWlkKTtcclxuICAgICAgICBzd2l0Y2ggKGxldmVsKSB7XHJcbiAgICAgICAgICAgIGNhc2UgR2x0ZkNvbnZlcnRlci5Mb2dMZXZlbC5JbmZvOlxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobWVzc2FnZSwgbGluayk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBHbHRmQ29udmVydGVyLkxvZ0xldmVsLldhcm5pbmc6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4obWVzc2FnZSwgbGluayk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBHbHRmQ29udmVydGVyLkxvZ0xldmVsLkVycm9yOlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihtZXNzYWdlLCBsaW5rKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEdsdGZDb252ZXJ0ZXIuTG9nTGV2ZWwuRGVidWc6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKG1lc3NhZ2UsIGxpbmspO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBjb252ZXJ0ZXIgPSBuZXcgR2x0ZkNvbnZlcnRlcihnbFRGLCBsb2FkZWRCdWZmZXJzLCBnbFRmRmlsZVBhdGgsIHtcclxuICAgICAgICBsb2dnZXIsXHJcbiAgICAgICAgdXNlckRhdGE6IGFzc2V0LnVzZXJEYXRhIGFzIEdsVEZVc2VyRGF0YSxcclxuICAgICAgICBwcm9tb3RlU2luZ2xlUm9vdE5vZGU6IChhc3NldC51c2VyRGF0YSBhcyBHbFRGVXNlckRhdGEpPy5wcm9tb3RlU2luZ2xlUm9vdE5vZGUgPz8gZmFsc2UsXHJcbiAgICAgICAgZ2VuZXJhdGVMaWdodG1hcFVWTm9kZTogKGFzc2V0LnVzZXJEYXRhIGFzIEdsVEZVc2VyRGF0YSk/LmdlbmVyYXRlTGlnaHRtYXBVVk5vZGUgPz8gZmFsc2UsXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4geyBjb252ZXJ0ZXIsIHJlZmVyZW5jZWRCdWZmZXJGaWxlcyB9O1xyXG59XHJcbiJdfQ==