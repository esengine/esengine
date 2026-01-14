"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EffectHandler = exports.autoGenEffectBinInfo = void 0;
exports.afterImport = afterImport;
exports.recompileAllEffects = recompileAllEffects;
const asset_db_1 = require("@cocos/asset-db");
const cc_1 = require("cc");
const custom_pipeline_1 = require("cc/editor/custom-pipeline");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const effect_compiler_1 = require("../../effect-compiler");
const utils_1 = require("../utils");
const zlib_1 = __importDefault(require("zlib"));
const asset_config_1 = __importDefault(require("../../asset-config"));
// 当某个头文件请求没找到，尝试把这个请求看成相对当前 effect 的路径，返回实际头文件路径再尝试找一下
const closure = { root: '', dir: '' };
effect_compiler_1.options.throwOnWarning = true; // be more strict on the user input for now
effect_compiler_1.options.skipParserTest = true; // we are guaranteed to have GL backend test here, so parser tests are not really that helpful anyways
effect_compiler_1.options.getAlternativeChunkPaths = (path) => {
    return [(0, path_1.relative)(closure.root, (0, path_1.resolve)(closure.dir, path)).replace(/\\/g, '/')];
};
// 依然没有找到时，可能是依赖头文件还没有注册，尝试去每个 DB 搜一遍
effect_compiler_1.options.chunkSearchFn = (names) => {
    const res = { name: undefined, content: undefined };
    (0, asset_db_1.forEach)((db) => {
        if (res.content !== undefined) {
            return;
        }
        for (let i = 0; i < names.length; i++) {
            // user input path first
            const name = names[i];
            const file = (0, path_1.resolve)(db.options.target, 'chunks', name + '.chunk');
            if (!(0, fs_extra_1.existsSync)(file)) {
                continue;
            }
            res.name = name;
            res.content = (0, fs_extra_1.readFileSync)(file, { encoding: 'utf-8' });
            break;
        }
    });
    return res;
};
exports.autoGenEffectBinInfo = {
    // 是否要在导入 effect 后自动重新生成 effect.bin
    autoGenEffectBin: false,
    waitingGenEffectBin: false,
    waitingGenEffectBinTimmer: null,
    effectBinPath: (0, path_1.join)(asset_config_1.default.data.tempRoot, 'effect/effect.bin'),
};
exports.EffectHandler = {
    // Handler 的名字，用于指定 Handler as 等
    name: 'effect',
    // 引擎内对应的类型
    assetType: 'cc.EffectAsset',
    createInfo: {
        generateMenuInfo() {
            return [
                {
                    label: 'i18n:ENGINE.assets.newEffect',
                    fullFileName: 'effect.effect',
                    template: `db://internal/default_file_content/${exports.EffectHandler.name}/default.effect`,
                    group: 'effect',
                    name: 'default',
                },
                {
                    label: 'i18n:ENGINE.assets.newSurfaceEffect',
                    fullFileName: 'surface-effect.effect',
                    template: `db://internal/default_file_content/${exports.EffectHandler.name}/effect-surface.effect`,
                    group: 'effect',
                    name: 'surface',
                },
            ];
        },
    },
    open: utils_1.openCode,
    customOperationMap: {
        /**
         * 编译 effect
         * @param name - 用于自定义 buildEffect 后 Effect 的名字
         * @param effectContent - 用于自定义 effect 内容
         * @return { IEffectInfo | null }
         */
        'build-effect': {
            async operator(name, effectContent) {
                try {
                    return (0, effect_compiler_1.buildEffect)(name, effectContent);
                }
                catch (e) {
                    console.error(e);
                    return null;
                }
            },
        },
        /**
         * 添加着色器片段
         * @param name - 着色器片段的名字
         * @param content - 着色器片段具体内容
         */
        'add-chunk': {
            async operator(name, content) {
                (0, effect_compiler_1.addChunk)(name, content);
            },
        },
    },
    importer: {
        // 版本号如果变更，则会强制重新导入
        version: '1.7.1',
        /**
         * 实际导入流程
         * 需要自己控制是否生成、拷贝文件
         * @param asset
         */
        async import(asset) {
            try {
                if (asset instanceof asset_db_1.Asset) {
                    await generateEffectAsset(asset, asset.source, asset.source);
                }
                else {
                    await generateEffectAsset(asset, asset.parent.source, asset.parent.getFilePath('.effect'));
                }
                return true;
            }
            catch (err) {
                console.error(err);
                return false;
            }
        },
    },
};
exports.default = exports.EffectHandler;
/**
 * 在 library 里生成对应的 effectAsset 对象
 * @param asset 资源数据
 * @param sourceFile
 */
async function generateEffectAsset(asset, assetSourceFile, effectSourceFile) {
    const target = asset._assetDB.options.target;
    closure.root = (0, path_1.join)(target, 'chunks');
    closure.dir = (0, path_1.dirname)(assetSourceFile);
    const path = (0, path_1.relative)((0, path_1.join)(target, 'effects'), closure.dir).replace(/\\/g, '/');
    const name = path + (path.length ? '/' : '') + (0, path_1.basename)(effectSourceFile, (0, path_1.extname)(effectSourceFile));
    const content = (0, fs_extra_1.readFileSync)(effectSourceFile, { encoding: 'utf-8' });
    const effect = (0, effect_compiler_1.buildEffect)(name, content);
    // 记录 effect 的头文件依赖
    (0, asset_db_1.forEach)((db) => {
        for (const header of effect.dependencies) {
            asset.depend((0, path_1.resolve)(db.options.target, 'chunks', header + '.chunk'));
        }
    });
    const result = new cc_1.EffectAsset();
    Object.assign(result, effect);
    // 引擎数据结构不变，保留 hideInEditor 属性
    if (effect.editor && effect.editor.hide) {
        result.hideInEditor = true;
    }
    // 添加 meta 文件中的 combinations
    if (asset.userData) {
        if (asset.userData.combinations) {
            result.combinations = asset.userData.combinations;
        }
        if (effect.editor) {
            asset.userData.editor = effect.editor;
        }
        else {
            // 已存在的需要清空
            asset.userData.editor = undefined;
        }
    }
    const serializeJSON = EditorExtends.serialize(result);
    await asset.saveToLibrary('.json', serializeJSON);
    const depends = (0, utils_1.getDependUUIDList)(serializeJSON);
    asset.setData('depends', depends);
    exports.autoGenEffectBinInfo.waitingGenEffectBin = true;
    if (asset._assetDB.flag.started && exports.autoGenEffectBinInfo.autoGenEffectBin) {
        // 导入 500ms 后自动重新编译所有 effect
        exports.autoGenEffectBinInfo.waitingGenEffectBinTimmer && clearTimeout(exports.autoGenEffectBinInfo.waitingGenEffectBinTimmer);
        exports.autoGenEffectBinInfo.waitingGenEffectBinTimmer = setTimeout(() => {
            afterImport();
        }, 500);
    }
}
function _rebuildDescriptorHierarchy(effectArray) {
    const effects = [];
    for (const effectAsset of effectArray) {
        // 临时文件路径
        const tempFile = (0, path_1.join)(effectAsset.temp, 'materialxxx.json');
        // 这个 temp 文件夹在资源重新导入的时候，会被清空
        // 所以判断我们的缓存是否存在，就可以知道这个资源有没有被修改，需不需要重新计算
        if ((0, fs_extra_1.existsSync)(tempFile)) {
            // 跳过之前已经计算的 effect
            continue;
        }
        effects.push(effectAsset);
    }
    return effects;
}
async function buildCustomLayout(currEffectArray, lgData) {
    // 收集所有 Descriptor 的 Visibility 信息
    const visg = new custom_pipeline_1.VisibilityGraph();
    for (const effectAsset of currEffectArray) {
        const libraryFile = effectAsset.library + '.json';
        const json = await (0, fs_extra_1.readJSON)(libraryFile);
        // @ts-ignore TS2339
        const effect = cc.deserialize(json);
        // 合并所有 effect 的 visibility 信息
        visg.mergeEffect(effect);
    }
    const lgInfo = new custom_pipeline_1.LayoutGraphInfo(visg);
    for (const effectAsset of currEffectArray) {
        // 导入后的 effectAsset json，引擎类型序列化后的数据
        const libraryFile = effectAsset.library + '.json';
        const json = await (0, fs_extra_1.readJSON)(libraryFile);
        // @ts-ignore TS2339
        const effect = cc.deserialize(json);
        // 添加 effect
        lgInfo.addEffect(effect);
    }
    if (lgInfo.build()) {
        console.error('build failed');
    }
    (0, custom_pipeline_1.buildLayoutGraphData)(lgInfo.lg, lgData);
}
/**
 * source/contributions/asset-db-hook
 * effect 导入器比较特殊，单独增加了一个在所有 effect 导入完成后的钩子
 * 这个函数名字是固定的，如果需要修改，需要一同修改 cocos-editor 仓库里的 asset-db 插件代码
 * @param effectArray
 * @param force 强制重编
 */
async function afterImport(force) {
    const effectList = [];
    (0, asset_db_1.forEach)((database) => {
        database.path2asset.forEach((asset) => {
            if (asset.meta.importer === 'effect') {
                effectList.push(asset);
            }
        });
    });
    if (!effectList.length) {
        console.debug('no effect to compile');
        return;
    }
    await recompileAllEffects(effectList, force);
}
function forceRecompileEffects(file) {
    const data = (0, fs_extra_1.readFileSync)(file, { encoding: 'binary' });
    const effect = Buffer.from(data, 'binary');
    if (effect.length < 8) {
        console.error('effect.bin size is too small');
        return true;
    }
    // Read header
    const numVertices = effect.readUint32LE();
    // Check if engine supports compressed effect
    const isEngineSupportCompressedEffect = !!custom_pipeline_1.getLayoutGraphDataVersion;
    const isBinaryCompressed = numVertices === 0xffffffff;
    //------------------------------------------------------------------
    // Engine does not support compressed effect
    //------------------------------------------------------------------
    if (!isEngineSupportCompressedEffect) {
        // 1. Binary is compressed, need to recompile
        // 2. Binary is uncompressed, no need to recompile
        return isBinaryCompressed;
    }
    //------------------------------------------------------------------
    // Engine supports compressed effect
    //------------------------------------------------------------------
    // 3. Binary is uncompressed (Incompatible)
    if (!isBinaryCompressed) {
        return true;
    }
    // Check binary version
    // 4. Engine compressed, Binary compressed (Compatible)
    const requiredVersion = (0, custom_pipeline_1.getLayoutGraphDataVersion)();
    const binaryVersion = effect.readUint32LE(4);
    // a) Version is different
    if (binaryVersion < requiredVersion) {
        return true;
    }
    else if (binaryVersion > requiredVersion) {
        console.debug(`effect.bin version ${binaryVersion} is newer than required version ${requiredVersion}`);
        return true;
    }
    // b) Version is the same
    return false;
}
/**
 * 编译所有的 effect
 * 调用入口：source/contributions/asset-db-script
 * 调用入口：this.afterImport
 * @param effectArray
 * @param force 强制重编
 */
async function recompileAllEffects(effectArray, force) {
    const file = exports.autoGenEffectBinInfo.effectBinPath;
    // 存在等待刷新的指令或者 effect.bin 不存在时，就重新生成
    if (force || exports.autoGenEffectBinInfo.waitingGenEffectBin || !(0, fs_extra_1.existsSync)(file) || forceRecompileEffects(file)) {
        // 仅编译导入正常的 effect
        effectArray = effectArray.filter((asset) => asset.imported);
        exports.autoGenEffectBinInfo.waitingGenEffectBin = false;
        exports.autoGenEffectBinInfo.waitingGenEffectBinTimmer && clearTimeout(exports.autoGenEffectBinInfo.waitingGenEffectBinTimmer);
        const lgData = new custom_pipeline_1.LayoutGraphData();
        await buildCustomLayout(effectArray, lgData);
        // 写入一个二进制文件
        // 记得做好缓存管理，如果没有变化尽量减少 io
        await (0, fs_extra_1.ensureDir)((0, path_1.dirname)(file));
        // Serialize data
        const binaryData = new custom_pipeline_1.BinaryOutputArchive();
        (0, custom_pipeline_1.saveLayoutGraphData)(binaryData, lgData);
        const isEngineSupportCompressedEffect = !!custom_pipeline_1.getLayoutGraphDataVersion;
        if (isEngineSupportCompressedEffect) {
            // Compress data
            const compressed = zlib_1.default.deflateSync(binaryData.buffer, {
                level: zlib_1.default.constants.Z_BEST_COMPRESSION,
            });
            // Pack data
            const packedData = Buffer.alloc(compressed.length + 8);
            const version = (0, custom_pipeline_1.getLayoutGraphDataVersion)();
            packedData.writeUint32LE(0xffffffff, 0); // graph null vertex descriptor
            packedData.writeUint32LE(version, 4); // version
            packedData.set(compressed, 8); // data
            // Write to file
            await (0, fs_extra_1.writeFile)(file, packedData);
        }
        else {
            await (0, fs_extra_1.writeFile)(file, binaryData.buffer);
        }
        console.debug('recompile effect.bin success');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL2VmZmVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUE2UUEsa0NBY0M7QUEyREQsa0RBd0NDO0FBNVhELDhDQUEwRDtBQUUxRCwyQkFBaUM7QUFDakMsK0RBUW1DO0FBQ25DLHVDQUFtRztBQUNuRywrQkFBMkU7QUFDM0UsMkRBQXVFO0FBRXZFLG9DQUF1RDtBQUN2RCxnREFBd0I7QUFDeEIsc0VBQTZDO0FBTTdDLHVEQUF1RDtBQUN2RCxNQUFNLE9BQU8sR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3RDLHlCQUFPLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxDQUFDLDJDQUEyQztBQUMxRSx5QkFBTyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsQ0FBQyxzR0FBc0c7QUFDckkseUJBQU8sQ0FBQyx3QkFBd0IsR0FBRyxDQUFDLElBQVksRUFBRSxFQUFFO0lBQ2hELE9BQU8sQ0FBQyxJQUFBLGVBQVEsRUFBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUEsY0FBTyxFQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEYsQ0FBQyxDQUFDO0FBQ0YscUNBQXFDO0FBQ3JDLHlCQUFPLENBQUMsYUFBYSxHQUFHLENBQUMsS0FBZSxFQUFFLEVBQUU7SUFDeEMsTUFBTSxHQUFHLEdBQWUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQztJQUNoRSxJQUFBLGtCQUFPLEVBQUMsQ0FBQyxFQUFXLEVBQUUsRUFBRTtRQUNwQixJQUFJLEdBQUcsQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFF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QUM7WUFDNUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQywrQkFBK0I7WUFDeEUsVUFBVSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVO1lBQ2hELFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTztZQUV0QyxnQkFBZ0I7WUFDaEIsTUFBTSxJQUFBLG9CQUFTLEVBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7YUFBTSxDQUFDO1lBQ0osTUFBTSxJQUFBLG9CQUFTLEVBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRUQsT0FBTyxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0lBQ2xELENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIFxyXG5cclxuaW1wb3J0IHsgQXNzZXQsIEFzc2V0REIsIGZvckVhY2ggfSBmcm9tICdAY29jb3MvYXNzZXQtZGInO1xyXG5pbXBvcnQgeyBBc3NldEhhbmRsZXIsIElBc3NldCB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBFZmZlY3RBc3NldCB9IGZyb20gJ2NjJztcclxuaW1wb3J0IHtcclxuICAgIEJpbmFyeU91dHB1dEFyY2hpdmUsXHJcbiAgICBMYXlvdXRHcmFwaERhdGEsXHJcbiAgICBzYXZlTGF5b3V0R3JhcGhEYXRhLFxyXG4gICAgVmlzaWJpbGl0eUdyYXBoLFxyXG4gICAgTGF5b3V0R3JhcGhJbmZvLFxyXG4gICAgYnVpbGRMYXlvdXRHcmFwaERhdGEsXHJcbiAgICBnZXRMYXlvdXRHcmFwaERhdGFWZXJzaW9uLFxyXG59IGZyb20gJ2NjL2VkaXRvci9jdXN0b20tcGlwZWxpbmUnO1xyXG5pbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMsIHdyaXRlRmlsZVN5bmMsIGVuc3VyZURpciwgcmVhZEpTT04sIHdyaXRlRmlsZSB9IGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgYmFzZW5hbWUsIGRpcm5hbWUsIGV4dG5hbWUsIGpvaW4sIHJlbGF0aXZlLCByZXNvbHZlIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGJ1aWxkRWZmZWN0LCBvcHRpb25zLCBhZGRDaHVuayB9IGZyb20gJy4uLy4uL2VmZmVjdC1jb21waWxlcic7XHJcblxyXG5pbXBvcnQgeyBnZXREZXBlbmRVVUlETGlzdCwgb3BlbkNvZGUgfSBmcm9tICcuLi91dGlscyc7XHJcbmltcG9ydCB6bGliIGZyb20gJ3psaWInO1xyXG5pbXBvcnQgYXNzZXRDb25maWcgZnJvbSAnLi4vLi4vYXNzZXQtY29uZmlnJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUNodW5rSW5mbyB7XHJcbiAgICBuYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICBjb250ZW50OiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbn1cclxuLy8g5b2T5p+Q5Liq5aS05paH5Lu26K+35rGC5rKh5om+5Yiw77yM5bCd6K+V5oqK6L+Z5Liq6K+35rGC55yL5oiQ55u45a+55b2T5YmNIGVmZmVjdCDnmoTot6/lvoTvvIzov5Tlm57lrp7pmYXlpLTmlofku7bot6/lvoTlho3lsJ3or5Xmib7kuIDkuItcclxuY29uc3QgY2xvc3VyZSA9IHsgcm9vdDogJycsIGRpcjogJycgfTtcclxub3B0aW9ucy50aHJvd09uV2FybmluZyA9IHRydWU7IC8vIGJlIG1vcmUgc3RyaWN0IG9uIHRoZSB1c2VyIGlucHV0IGZvciBub3dcclxub3B0aW9ucy5za2lwUGFyc2VyVGVzdCA9IHRydWU7IC8vIHdlIGFyZSBndWFyYW50ZWVkIHRvIGhhdmUgR0wgYmFja2VuZCB0ZXN0IGhlcmUsIHNvIHBhcnNlciB0ZXN0cyBhcmUgbm90IHJlYWxseSB0aGF0IGhlbHBmdWwgYW55d2F5c1xyXG5vcHRpb25zLmdldEFsdGVybmF0aXZlQ2h1bmtQYXRocyA9IChwYXRoOiBzdHJpbmcpID0+IHtcclxuICAgIHJldHVybiBbcmVsYXRpdmUoY2xvc3VyZS5yb290LCByZXNvbHZlKGNsb3N1cmUuZGlyLCBwYXRoKSkucmVwbGFjZSgvXFxcXC9nLCAnLycpXTtcclxufTtcclxuLy8g5L6d54S25rKh5pyJ5om+5Yiw5pe277yM5Y+v6IO95piv5L6d6LWW5aS05paH5Lu26L+Y5rKh5pyJ5rOo5YaM77yM5bCd6K+V5Y675q+P5LiqIERCIOaQnOS4gOmBjVxyXG5vcHRpb25zLmNodW5rU2VhcmNoRm4gPSAobmFtZXM6IHN0cmluZ1tdKSA9PiB7XHJcbiAgICBjb25zdCByZXM6IElDaHVua0luZm8gPSB7IG5hbWU6IHVuZGVmaW5lZCwgY29udGVudDogdW5kZWZpbmVkIH07XHJcbiAgICBmb3JFYWNoKChkYjogQXNzZXREQikgPT4ge1xyXG4gICAgICAgIGlmIChyZXMuY29udGVudCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuYW1lcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAvLyB1c2VyIGlucHV0IHBhdGggZmlyc3RcclxuICAgICAgICAgICAgY29uc3QgbmFtZSA9IG5hbWVzW2ldO1xyXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gcmVzb2x2ZShkYi5vcHRpb25zLnRhcmdldCwgJ2NodW5rcycsIG5hbWUgKyAnLmNodW5rJyk7XHJcbiAgICAgICAgICAgIGlmICghZXhpc3RzU3luYyhmaWxlKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICByZXMuY29udGVudCA9IHJlYWRGaWxlU3luYyhmaWxlLCB7IGVuY29kaW5nOiAndXRmLTgnIH0pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiByZXM7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgYXV0b0dlbkVmZmVjdEJpbkluZm86IHtcclxuICAgIGF1dG9HZW5FZmZlY3RCaW46IGJvb2xlYW47XHJcbiAgICB3YWl0aW5nR2VuRWZmZWN0QmluOiBib29sZWFuO1xyXG4gICAgd2FpdGluZ0dlbkVmZmVjdEJpblRpbW1lcjogTm9kZUpTLlRpbWVvdXQgfCBudWxsO1xyXG4gICAgZWZmZWN0QmluUGF0aDogc3RyaW5nO1xyXG59ID0ge1xyXG4gICAgLy8g5piv5ZCm6KaB5Zyo5a+85YWlIGVmZmVjdCDlkI7oh6rliqjph43mlrDnlJ/miJAgZWZmZWN0LmJpblxyXG4gICAgYXV0b0dlbkVmZmVjdEJpbjogZmFsc2UsXHJcbiAgICB3YWl0aW5nR2VuRWZmZWN0QmluOiBmYWxzZSxcclxuICAgIHdhaXRpbmdHZW5FZmZlY3RCaW5UaW1tZXI6IG51bGwsXHJcbiAgICBlZmZlY3RCaW5QYXRoOiBqb2luKGFzc2V0Q29uZmlnLmRhdGEudGVtcFJvb3QsICdlZmZlY3QvZWZmZWN0LmJpbicpLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IEVmZmVjdEhhbmRsZXI6IEFzc2V0SGFuZGxlciA9IHtcclxuICAgIC8vIEhhbmRsZXIg55qE5ZCN5a2X77yM55So5LqO5oyH5a6aIEhhbmRsZXIgYXMg562JXHJcbiAgICBuYW1lOiAnZWZmZWN0JyxcclxuXHJcbiAgICAvLyDlvJXmk47lhoXlr7nlupTnmoTnsbvlnotcclxuICAgIGFzc2V0VHlwZTogJ2NjLkVmZmVjdEFzc2V0JyxcclxuXHJcbiAgICBjcmVhdGVJbmZvOiB7XHJcbiAgICAgICAgZ2VuZXJhdGVNZW51SW5mbygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2kxOG46RU5HSU5FLmFzc2V0cy5uZXdFZmZlY3QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxGaWxlTmFtZTogJ2VmZmVjdC5lZmZlY3QnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBgZGI6Ly9pbnRlcm5hbC9kZWZhdWx0X2ZpbGVfY29udGVudC8ke0VmZmVjdEhhbmRsZXIubmFtZX0vZGVmYXVsdC5lZmZlY3RgLFxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwOiAnZWZmZWN0JyxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZGVmYXVsdCcsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnaTE4bjpFTkdJTkUuYXNzZXRzLm5ld1N1cmZhY2VFZmZlY3QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxGaWxlTmFtZTogJ3N1cmZhY2UtZWZmZWN0LmVmZmVjdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGBkYjovL2ludGVybmFsL2RlZmF1bHRfZmlsZV9jb250ZW50LyR7RWZmZWN0SGFuZGxlci5uYW1lfS9lZmZlY3Qtc3VyZmFjZS5lZmZlY3RgLFxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwOiAnZWZmZWN0JyxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc3VyZmFjZScsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIG9wZW46IG9wZW5Db2RlLFxyXG5cclxuICAgIGN1c3RvbU9wZXJhdGlvbk1hcDoge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIOe8luivkSBlZmZlY3RcclxuICAgICAgICAgKiBAcGFyYW0gbmFtZSAtIOeUqOS6juiHquWumuS5iSBidWlsZEVmZmVjdCDlkI4gRWZmZWN0IOeahOWQjeWtl1xyXG4gICAgICAgICAqIEBwYXJhbSBlZmZlY3RDb250ZW50IC0g55So5LqO6Ieq5a6a5LmJIGVmZmVjdCDlhoXlrrlcclxuICAgICAgICAgKiBAcmV0dXJuIHsgSUVmZmVjdEluZm8gfCBudWxsIH1cclxuICAgICAgICAgKi9cclxuICAgICAgICAnYnVpbGQtZWZmZWN0Jzoge1xyXG4gICAgICAgICAgICBhc3luYyBvcGVyYXRvcihuYW1lOiBzdHJpbmcsIGVmZmVjdENvbnRlbnQ6IHN0cmluZykge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRFZmZlY3QobmFtZSwgZWZmZWN0Q29udGVudCk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiDmt7vliqDnnYDoibLlmajniYfmrrVcclxuICAgICAgICAgKiBAcGFyYW0gbmFtZSAtIOedgOiJsuWZqOeJh+auteeahOWQjeWtl1xyXG4gICAgICAgICAqIEBwYXJhbSBjb250ZW50IC0g552A6Imy5Zmo54mH5q615YW35L2T5YaF5a65XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgJ2FkZC1jaHVuayc6IHtcclxuICAgICAgICAgICAgYXN5bmMgb3BlcmF0b3IobmFtZTogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgIGFkZENodW5rKG5hbWUsIGNvbnRlbnQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIGltcG9ydGVyOiB7XHJcbiAgICAgICAgLy8g54mI5pys5Y+35aaC5p6c5Y+Y5pu077yM5YiZ5Lya5by65Yi26YeN5paw5a+85YWlXHJcbiAgICAgICAgdmVyc2lvbjogJzEuNy4xJyxcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICog5a6e6ZmF5a+85YWl5rWB56iLXHJcbiAgICAgICAgICog6ZyA6KaB6Ieq5bex5o6n5Yi25piv5ZCm55Sf5oiQ44CB5ou36LSd5paH5Lu2XHJcbiAgICAgICAgICogQHBhcmFtIGFzc2V0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYXN5bmMgaW1wb3J0KGFzc2V0OiBJQXNzZXQpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGlmIChhc3NldCBpbnN0YW5jZW9mIEFzc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZ2VuZXJhdGVFZmZlY3RBc3NldChhc3NldCwgYXNzZXQuc291cmNlLCBhc3NldC5zb3VyY2UpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBnZW5lcmF0ZUVmZmVjdEFzc2V0KGFzc2V0LCBhc3NldC5wYXJlbnQhLnNvdXJjZSwgYXNzZXQucGFyZW50IS5nZXRGaWxlUGF0aCgnLmVmZmVjdCcpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRWZmZWN0SGFuZGxlcjtcclxuXHJcbi8qKlxyXG4gKiDlnKggbGlicmFyeSDph4znlJ/miJDlr7nlupTnmoQgZWZmZWN0QXNzZXQg5a+56LGhXHJcbiAqIEBwYXJhbSBhc3NldCDotYTmupDmlbDmja5cclxuICogQHBhcmFtIHNvdXJjZUZpbGVcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlRWZmZWN0QXNzZXQoYXNzZXQ6IElBc3NldCwgYXNzZXRTb3VyY2VGaWxlOiBzdHJpbmcsIGVmZmVjdFNvdXJjZUZpbGU6IHN0cmluZykge1xyXG4gICAgY29uc3QgdGFyZ2V0ID0gYXNzZXQuX2Fzc2V0REIub3B0aW9ucy50YXJnZXQ7XHJcbiAgICBjbG9zdXJlLnJvb3QgPSBqb2luKHRhcmdldCwgJ2NodW5rcycpO1xyXG4gICAgY2xvc3VyZS5kaXIgPSBkaXJuYW1lKGFzc2V0U291cmNlRmlsZSk7XHJcbiAgICBjb25zdCBwYXRoID0gcmVsYXRpdmUoam9pbih0YXJnZXQsICdlZmZlY3RzJyksIGNsb3N1cmUuZGlyKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcbiAgICBjb25zdCBuYW1lID0gcGF0aCArIChwYXRoLmxlbmd0aCA/ICcvJyA6ICcnKSArIGJhc2VuYW1lKGVmZmVjdFNvdXJjZUZpbGUsIGV4dG5hbWUoZWZmZWN0U291cmNlRmlsZSkpO1xyXG5cclxuICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZWZmZWN0U291cmNlRmlsZSwgeyBlbmNvZGluZzogJ3V0Zi04JyB9KTtcclxuICAgIGNvbnN0IGVmZmVjdCA9IGJ1aWxkRWZmZWN0KG5hbWUsIGNvbnRlbnQpO1xyXG5cclxuICAgIC8vIOiusOW9lSBlZmZlY3Qg55qE5aS05paH5Lu25L6d6LWWXHJcbiAgICBmb3JFYWNoKChkYjogQXNzZXREQikgPT4ge1xyXG4gICAgICAgIGZvciAoY29uc3QgaGVhZGVyIG9mIGVmZmVjdC5kZXBlbmRlbmNpZXMpIHtcclxuICAgICAgICAgICAgYXNzZXQuZGVwZW5kKHJlc29sdmUoZGIub3B0aW9ucy50YXJnZXQsICdjaHVua3MnLCBoZWFkZXIgKyAnLmNodW5rJykpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBFZmZlY3RBc3NldCgpO1xyXG4gICAgT2JqZWN0LmFzc2lnbihyZXN1bHQsIGVmZmVjdCk7XHJcblxyXG4gICAgLy8g5byV5pOO5pWw5o2u57uT5p6E5LiN5Y+Y77yM5L+d55WZIGhpZGVJbkVkaXRvciDlsZ7mgKdcclxuICAgIGlmIChlZmZlY3QuZWRpdG9yICYmIGVmZmVjdC5lZGl0b3IuaGlkZSkge1xyXG4gICAgICAgIHJlc3VsdC5oaWRlSW5FZGl0b3IgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOa3u+WKoCBtZXRhIOaWh+S7tuS4reeahCBjb21iaW5hdGlvbnNcclxuICAgIGlmIChhc3NldC51c2VyRGF0YSkge1xyXG4gICAgICAgIGlmIChhc3NldC51c2VyRGF0YS5jb21iaW5hdGlvbnMpIHtcclxuICAgICAgICAgICAgcmVzdWx0LmNvbWJpbmF0aW9ucyA9IGFzc2V0LnVzZXJEYXRhLmNvbWJpbmF0aW9ucztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlZmZlY3QuZWRpdG9yKSB7XHJcbiAgICAgICAgICAgIGFzc2V0LnVzZXJEYXRhLmVkaXRvciA9IGVmZmVjdC5lZGl0b3I7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8g5bey5a2Y5Zyo55qE6ZyA6KaB5riF56m6XHJcbiAgICAgICAgICAgIGFzc2V0LnVzZXJEYXRhLmVkaXRvciA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2VyaWFsaXplSlNPTiA9IEVkaXRvckV4dGVuZHMuc2VyaWFsaXplKHJlc3VsdCk7XHJcbiAgICBhd2FpdCBhc3NldC5zYXZlVG9MaWJyYXJ5KCcuanNvbicsIHNlcmlhbGl6ZUpTT04pO1xyXG5cclxuICAgIGNvbnN0IGRlcGVuZHMgPSBnZXREZXBlbmRVVUlETGlzdChzZXJpYWxpemVKU09OKTtcclxuICAgIGFzc2V0LnNldERhdGEoJ2RlcGVuZHMnLCBkZXBlbmRzKTtcclxuICAgIGF1dG9HZW5FZmZlY3RCaW5JbmZvLndhaXRpbmdHZW5FZmZlY3RCaW4gPSB0cnVlO1xyXG5cclxuICAgIGlmIChhc3NldC5fYXNzZXREQi5mbGFnLnN0YXJ0ZWQgJiYgYXV0b0dlbkVmZmVjdEJpbkluZm8uYXV0b0dlbkVmZmVjdEJpbikge1xyXG4gICAgICAgIC8vIOWvvOWFpSA1MDBtcyDlkI7oh6rliqjph43mlrDnvJbor5HmiYDmnIkgZWZmZWN0XHJcbiAgICAgICAgYXV0b0dlbkVmZmVjdEJpbkluZm8ud2FpdGluZ0dlbkVmZmVjdEJpblRpbW1lciAmJiBjbGVhclRpbWVvdXQoYXV0b0dlbkVmZmVjdEJpbkluZm8ud2FpdGluZ0dlbkVmZmVjdEJpblRpbW1lcik7XHJcbiAgICAgICAgYXV0b0dlbkVmZmVjdEJpbkluZm8ud2FpdGluZ0dlbkVmZmVjdEJpblRpbW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBhZnRlckltcG9ydCgpO1xyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWJ1aWxkRGVzY3JpcHRvckhpZXJhcmNoeShlZmZlY3RBcnJheTogQXNzZXRbXSkge1xyXG4gICAgY29uc3QgZWZmZWN0cyA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBlZmZlY3RBc3NldCBvZiBlZmZlY3RBcnJheSkge1xyXG4gICAgICAgIC8vIOS4tOaXtuaWh+S7tui3r+W+hFxyXG4gICAgICAgIGNvbnN0IHRlbXBGaWxlID0gam9pbihlZmZlY3RBc3NldC50ZW1wLCAnbWF0ZXJpYWx4eHguanNvbicpO1xyXG4gICAgICAgIC8vIOi/meS4qiB0ZW1wIOaWh+S7tuWkueWcqOi1hOa6kOmHjeaWsOWvvOWFpeeahOaXtuWAme+8jOS8muiiq+a4heepulxyXG4gICAgICAgIC8vIOaJgOS7peWIpOaWreaIkeS7rOeahOe8k+WtmOaYr+WQpuWtmOWcqO+8jOWwseWPr+S7peefpemBk+i/meS4qui1hOa6kOacieayoeacieiiq+S/ruaUue+8jOmcgOS4jemcgOimgemHjeaWsOiuoeeul1xyXG4gICAgICAgIGlmIChleGlzdHNTeW5jKHRlbXBGaWxlKSkge1xyXG4gICAgICAgICAgICAvLyDot7Pov4fkuYvliY3lt7Lnu4/orqHnrpfnmoQgZWZmZWN0XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlZmZlY3RzLnB1c2goZWZmZWN0QXNzZXQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVmZmVjdHM7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGJ1aWxkQ3VzdG9tTGF5b3V0KGN1cnJFZmZlY3RBcnJheTogQXNzZXRbXSwgbGdEYXRhOiBMYXlvdXRHcmFwaERhdGEpIHtcclxuICAgIC8vIOaUtumbhuaJgOaciSBEZXNjcmlwdG9yIOeahCBWaXNpYmlsaXR5IOS/oeaBr1xyXG4gICAgY29uc3QgdmlzZyA9IG5ldyBWaXNpYmlsaXR5R3JhcGgoKTtcclxuICAgIGZvciAoY29uc3QgZWZmZWN0QXNzZXQgb2YgY3VyckVmZmVjdEFycmF5KSB7XHJcbiAgICAgICAgY29uc3QgbGlicmFyeUZpbGUgPSBlZmZlY3RBc3NldC5saWJyYXJ5ICsgJy5qc29uJztcclxuICAgICAgICBjb25zdCBqc29uID0gYXdhaXQgcmVhZEpTT04obGlicmFyeUZpbGUpO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmUgVFMyMzM5XHJcbiAgICAgICAgY29uc3QgZWZmZWN0ID0gY2MuZGVzZXJpYWxpemUoanNvbikgYXMgRWZmZWN0QXNzZXQ7XHJcbiAgICAgICAgLy8g5ZCI5bm25omA5pyJIGVmZmVjdCDnmoQgdmlzaWJpbGl0eSDkv6Hmga9cclxuICAgICAgICB2aXNnLm1lcmdlRWZmZWN0KGVmZmVjdCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbGdJbmZvID0gbmV3IExheW91dEdyYXBoSW5mbyh2aXNnKTtcclxuICAgIGZvciAoY29uc3QgZWZmZWN0QXNzZXQgb2YgY3VyckVmZmVjdEFycmF5KSB7XHJcbiAgICAgICAgLy8g5a+85YWl5ZCO55qEIGVmZmVjdEFzc2V0IGpzb27vvIzlvJXmk47nsbvlnovluo/liJfljJblkI7nmoTmlbDmja5cclxuICAgICAgICBjb25zdCBsaWJyYXJ5RmlsZSA9IGVmZmVjdEFzc2V0LmxpYnJhcnkgKyAnLmpzb24nO1xyXG5cclxuICAgICAgICBjb25zdCBqc29uID0gYXdhaXQgcmVhZEpTT04obGlicmFyeUZpbGUpO1xyXG5cclxuICAgICAgICAvLyBAdHMtaWdub3JlIFRTMjMzOVxyXG4gICAgICAgIGNvbnN0IGVmZmVjdCA9IGNjLmRlc2VyaWFsaXplKGpzb24pIGFzIEVmZmVjdEFzc2V0O1xyXG5cclxuICAgICAgICAvLyDmt7vliqAgZWZmZWN0XHJcbiAgICAgICAgbGdJbmZvLmFkZEVmZmVjdChlZmZlY3QpO1xyXG4gICAgfVxyXG4gICAgaWYgKGxnSW5mby5idWlsZCgpKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignYnVpbGQgZmFpbGVkJyk7XHJcbiAgICB9XHJcbiAgICBidWlsZExheW91dEdyYXBoRGF0YShsZ0luZm8ubGcsIGxnRGF0YSk7XHJcbn1cclxuXHJcbi8qKiBcclxuICogc291cmNlL2NvbnRyaWJ1dGlvbnMvYXNzZXQtZGItaG9va1xyXG4gKiBlZmZlY3Qg5a+85YWl5Zmo5q+U6L6D54m55q6K77yM5Y2V54us5aKe5Yqg5LqG5LiA5Liq5Zyo5omA5pyJIGVmZmVjdCDlr7zlhaXlrozmiJDlkI7nmoTpkqnlrZBcclxuICog6L+Z5Liq5Ye95pWw5ZCN5a2X5piv5Zu65a6a55qE77yM5aaC5p6c6ZyA6KaB5L+u5pS577yM6ZyA6KaB5LiA5ZCM5L+u5pS5IGNvY29zLWVkaXRvciDku5PlupPph4znmoQgYXNzZXQtZGIg5o+S5Lu25Luj56CBXHJcbiAqIEBwYXJhbSBlZmZlY3RBcnJheVxyXG4gKiBAcGFyYW0gZm9yY2Ug5by65Yi26YeN57yWXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWZ0ZXJJbXBvcnQoZm9yY2U/OiBib29sZWFuKSB7XHJcbiAgICBjb25zdCBlZmZlY3RMaXN0OiBBc3NldFtdID0gW107XHJcbiAgICBmb3JFYWNoKChkYXRhYmFzZTogQXNzZXREQikgPT4ge1xyXG4gICAgICAgIGRhdGFiYXNlLnBhdGgyYXNzZXQuZm9yRWFjaCgoYXNzZXQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGFzc2V0Lm1ldGEuaW1wb3J0ZXIgPT09ICdlZmZlY3QnKSB7XHJcbiAgICAgICAgICAgICAgICBlZmZlY3RMaXN0LnB1c2goYXNzZXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIGlmICghZWZmZWN0TGlzdC5sZW5ndGgpIHtcclxuICAgICAgICBjb25zb2xlLmRlYnVnKCdubyBlZmZlY3QgdG8gY29tcGlsZScpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGF3YWl0IHJlY29tcGlsZUFsbEVmZmVjdHMoZWZmZWN0TGlzdCwgZm9yY2UpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmb3JjZVJlY29tcGlsZUVmZmVjdHMoZmlsZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBkYXRhID0gcmVhZEZpbGVTeW5jKGZpbGUsIHsgZW5jb2Rpbmc6ICdiaW5hcnknIH0pO1xyXG4gICAgY29uc3QgZWZmZWN0ID0gQnVmZmVyLmZyb20oZGF0YSwgJ2JpbmFyeScpO1xyXG5cclxuICAgIGlmIChlZmZlY3QubGVuZ3RoIDwgOCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ2VmZmVjdC5iaW4gc2l6ZSBpcyB0b28gc21hbGwnKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZWFkIGhlYWRlclxyXG4gICAgY29uc3QgbnVtVmVydGljZXMgPSBlZmZlY3QucmVhZFVpbnQzMkxFKCk7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgZW5naW5lIHN1cHBvcnRzIGNvbXByZXNzZWQgZWZmZWN0XHJcbiAgICBjb25zdCBpc0VuZ2luZVN1cHBvcnRDb21wcmVzc2VkRWZmZWN0ID0gISFnZXRMYXlvdXRHcmFwaERhdGFWZXJzaW9uO1xyXG4gICAgY29uc3QgaXNCaW5hcnlDb21wcmVzc2VkID0gbnVtVmVydGljZXMgPT09IDB4ZmZmZmZmZmY7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIEVuZ2luZSBkb2VzIG5vdCBzdXBwb3J0IGNvbXByZXNzZWQgZWZmZWN0XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgaWYgKCFpc0VuZ2luZVN1cHBvcnRDb21wcmVzc2VkRWZmZWN0KSB7XHJcbiAgICAgICAgLy8gMS4gQmluYXJ5IGlzIGNvbXByZXNzZWQsIG5lZWQgdG8gcmVjb21waWxlXHJcbiAgICAgICAgLy8gMi4gQmluYXJ5IGlzIHVuY29tcHJlc3NlZCwgbm8gbmVlZCB0byByZWNvbXBpbGVcclxuICAgICAgICByZXR1cm4gaXNCaW5hcnlDb21wcmVzc2VkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBFbmdpbmUgc3VwcG9ydHMgY29tcHJlc3NlZCBlZmZlY3RcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAzLiBCaW5hcnkgaXMgdW5jb21wcmVzc2VkIChJbmNvbXBhdGlibGUpXHJcbiAgICBpZiAoIWlzQmluYXJ5Q29tcHJlc3NlZCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGJpbmFyeSB2ZXJzaW9uXHJcbiAgICAvLyA0LiBFbmdpbmUgY29tcHJlc3NlZCwgQmluYXJ5IGNvbXByZXNzZWQgKENvbXBhdGlibGUpXHJcbiAgICBjb25zdCByZXF1aXJlZFZlcnNpb24gPSBnZXRMYXlvdXRHcmFwaERhdGFWZXJzaW9uKCk7XHJcbiAgICBjb25zdCBiaW5hcnlWZXJzaW9uID0gZWZmZWN0LnJlYWRVaW50MzJMRSg0KTtcclxuXHJcbiAgICAvLyBhKSBWZXJzaW9uIGlzIGRpZmZlcmVudFxyXG4gICAgaWYgKGJpbmFyeVZlcnNpb24gPCByZXF1aXJlZFZlcnNpb24pIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSBpZiAoYmluYXJ5VmVyc2lvbiA+IHJlcXVpcmVkVmVyc2lvbikge1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoYGVmZmVjdC5iaW4gdmVyc2lvbiAke2JpbmFyeVZlcnNpb259IGlzIG5ld2VyIHRoYW4gcmVxdWlyZWQgdmVyc2lvbiAke3JlcXVpcmVkVmVyc2lvbn1gKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBiKSBWZXJzaW9uIGlzIHRoZSBzYW1lXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDnvJbor5HmiYDmnInnmoQgZWZmZWN0XHJcbiAqIOiwg+eUqOWFpeWPo++8mnNvdXJjZS9jb250cmlidXRpb25zL2Fzc2V0LWRiLXNjcmlwdFxyXG4gKiDosIPnlKjlhaXlj6PvvJp0aGlzLmFmdGVySW1wb3J0XHJcbiAqIEBwYXJhbSBlZmZlY3RBcnJheVxyXG4gKiBAcGFyYW0gZm9yY2Ug5by65Yi26YeN57yWXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVjb21waWxlQWxsRWZmZWN0cyhlZmZlY3RBcnJheTogQXNzZXRbXSwgZm9yY2U/OiBib29sZWFuKSB7XHJcbiAgICBjb25zdCBmaWxlID0gYXV0b0dlbkVmZmVjdEJpbkluZm8uZWZmZWN0QmluUGF0aDtcclxuICAgIC8vIOWtmOWcqOetieW+heWIt+aWsOeahOaMh+S7pOaIluiAhSBlZmZlY3QuYmluIOS4jeWtmOWcqOaXtu+8jOWwsemHjeaWsOeUn+aIkFxyXG4gICAgaWYgKGZvcmNlIHx8IGF1dG9HZW5FZmZlY3RCaW5JbmZvLndhaXRpbmdHZW5FZmZlY3RCaW4gfHwgIWV4aXN0c1N5bmMoZmlsZSkgfHwgZm9yY2VSZWNvbXBpbGVFZmZlY3RzKGZpbGUpKSB7XHJcbiAgICAgICAgLy8g5LuF57yW6K+R5a+85YWl5q2j5bi455qEIGVmZmVjdFxyXG4gICAgICAgIGVmZmVjdEFycmF5ID0gZWZmZWN0QXJyYXkuZmlsdGVyKChhc3NldCkgPT4gYXNzZXQuaW1wb3J0ZWQpO1xyXG4gICAgICAgIGF1dG9HZW5FZmZlY3RCaW5JbmZvLndhaXRpbmdHZW5FZmZlY3RCaW4gPSBmYWxzZTtcclxuICAgICAgICBhdXRvR2VuRWZmZWN0QmluSW5mby53YWl0aW5nR2VuRWZmZWN0QmluVGltbWVyICYmIGNsZWFyVGltZW91dChhdXRvR2VuRWZmZWN0QmluSW5mby53YWl0aW5nR2VuRWZmZWN0QmluVGltbWVyKTtcclxuICAgICAgICBjb25zdCBsZ0RhdGEgPSBuZXcgTGF5b3V0R3JhcGhEYXRhKCk7XHJcbiAgICAgICAgYXdhaXQgYnVpbGRDdXN0b21MYXlvdXQoZWZmZWN0QXJyYXksIGxnRGF0YSk7XHJcbiAgICAgICAgLy8g5YaZ5YWl5LiA5Liq5LqM6L+b5Yi25paH5Lu2XHJcbiAgICAgICAgLy8g6K6w5b6X5YGa5aW957yT5a2Y566h55CG77yM5aaC5p6c5rKh5pyJ5Y+Y5YyW5bC96YeP5YeP5bCRIGlvXHJcbiAgICAgICAgYXdhaXQgZW5zdXJlRGlyKGRpcm5hbWUoZmlsZSkpO1xyXG5cclxuICAgICAgICAvLyBTZXJpYWxpemUgZGF0YVxyXG4gICAgICAgIGNvbnN0IGJpbmFyeURhdGEgPSBuZXcgQmluYXJ5T3V0cHV0QXJjaGl2ZSgpO1xyXG4gICAgICAgIHNhdmVMYXlvdXRHcmFwaERhdGEoYmluYXJ5RGF0YSwgbGdEYXRhKTtcclxuXHJcbiAgICAgICAgY29uc3QgaXNFbmdpbmVTdXBwb3J0Q29tcHJlc3NlZEVmZmVjdCA9ICEhZ2V0TGF5b3V0R3JhcGhEYXRhVmVyc2lvbjtcclxuICAgICAgICBpZiAoaXNFbmdpbmVTdXBwb3J0Q29tcHJlc3NlZEVmZmVjdCkge1xyXG4gICAgICAgICAgICAvLyBDb21wcmVzcyBkYXRhXHJcbiAgICAgICAgICAgIGNvbnN0IGNvbXByZXNzZWQgPSB6bGliLmRlZmxhdGVTeW5jKGJpbmFyeURhdGEuYnVmZmVyLCB7XHJcbiAgICAgICAgICAgICAgICBsZXZlbDogemxpYi5jb25zdGFudHMuWl9CRVNUX0NPTVBSRVNTSU9OLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIFBhY2sgZGF0YVxyXG4gICAgICAgICAgICBjb25zdCBwYWNrZWREYXRhID0gQnVmZmVyLmFsbG9jKGNvbXByZXNzZWQubGVuZ3RoICsgOCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHZlcnNpb24gPSBnZXRMYXlvdXRHcmFwaERhdGFWZXJzaW9uKCk7XHJcbiAgICAgICAgICAgIHBhY2tlZERhdGEud3JpdGVVaW50MzJMRSgweGZmZmZmZmZmLCAwKTsgLy8gZ3JhcGggbnVsbCB2ZXJ0ZXggZGVzY3JpcHRvclxyXG4gICAgICAgICAgICBwYWNrZWREYXRhLndyaXRlVWludDMyTEUodmVyc2lvbiwgNCk7IC8vIHZlcnNpb25cclxuICAgICAgICAgICAgcGFja2VkRGF0YS5zZXQoY29tcHJlc3NlZCwgOCk7IC8vIGRhdGFcclxuXHJcbiAgICAgICAgICAgIC8vIFdyaXRlIHRvIGZpbGVcclxuICAgICAgICAgICAgYXdhaXQgd3JpdGVGaWxlKGZpbGUsIHBhY2tlZERhdGEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHdyaXRlRmlsZShmaWxlLCBiaW5hcnlEYXRhLmJ1ZmZlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLmRlYnVnKCdyZWNvbXBpbGUgZWZmZWN0LmJpbiBzdWNjZXNzJyk7XHJcbiAgICB9XHJcbn1cclxuIl19