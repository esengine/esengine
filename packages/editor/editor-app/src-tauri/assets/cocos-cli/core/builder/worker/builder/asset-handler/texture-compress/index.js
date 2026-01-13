"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextureCompress = void 0;
exports.previewCompressImage = previewCompressImage;
exports.queryCompressCache = queryCompressCache;
exports.queryAllCompressConfig = queryAllCompressConfig;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const minimaps_1 = require("./minimaps");
const compress_tool_1 = require("./compress-tool");
const cc_1 = require("cc");
const asset_library_1 = require("../../manager/asset-library");
const utils_1 = require("./utils");
const stream_1 = require("stream");
const os_1 = require("os");
const numCPUs = (0, os_1.cpus)().length;
const sharp_1 = __importDefault(require("sharp"));
const lodash_1 = __importDefault(require("lodash"));
const utils_2 = require("../../../../share/utils");
const console_1 = require("../../../../../base/console");
const plugin_1 = require("../../../../manager/plugin");
const texture_compress_1 = require("../../../../share/texture-compress");
const builder_config_1 = __importDefault(require("../../../../share/builder-config"));
class TextureCompress extends stream_1.EventEmitter {
    _taskMap = {};
    platform;
    static overwriteFormats = {};
    static _presetIdToCompressOption = {};
    static allTextureCompressConfig;
    static userCompressConfig;
    static compressCacheDir = (0, path_1.join)(builder_config_1.default.projectRoot, 'temp', 'builder', 'CompressTexture');
    static storedCompressInfo = {};
    static storedCompressInfoPath = (0, path_1.join)(TextureCompress.compressCacheDir, 'compress-info.json');
    static enableMipMaps = false;
    _waitingCompressQueue = new Set();
    _compressAssetLen = 0;
    _compressExecuteInfo = null;
    textureCompress;
    constructor(platform, textureCompress) {
        super();
        this.platform = platform;
        this.textureCompress = textureCompress ?? true;
    }
    static async initCommonOptions() {
        TextureCompress.allTextureCompressConfig = await queryAllCompressConfig();
        if ((0, fs_extra_1.existsSync)(TextureCompress.storedCompressInfoPath)) {
            TextureCompress.storedCompressInfo = (0, fs_extra_1.readJsonSync)(TextureCompress.storedCompressInfoPath);
        }
        else {
            TextureCompress.storedCompressInfo = {};
        }
        TextureCompress.enableMipMaps = !!(await builder_config_1.default.getProject('textureCompressConfig.genMipmaps'));
    }
    async init() {
        await this.updateUserConfig();
    }
    /**
     * 更新缓存的纹理压缩项目配置
     */
    async updateUserConfig() {
        await TextureCompress.initCommonOptions();
        // 查询纹理压缩配置等
        TextureCompress.userCompressConfig = await builder_config_1.default.getProject('textureCompressConfig');
        const { customConfigs } = TextureCompress.userCompressConfig;
        // 收集目前已有配置内会覆盖现有格式的配置集合
        const overwriteFormats = {};
        if (customConfigs && Object.values(customConfigs).length) {
            Object.values(customConfigs).forEach((formatConfig) => {
                if (formatConfig.overwrite) {
                    overwriteFormats[formatConfig.format] = formatConfig.id;
                    console.debug(`compress format (${formatConfig.format}) will be overwritten by custom compress ${formatConfig.id}(${formatConfig.name})`);
                }
            });
        }
        TextureCompress.overwriteFormats = overwriteFormats;
        TextureCompress._presetIdToCompressOption = {};
    }
    static queryTextureCompressCache(uuid) {
        return TextureCompress.storedCompressInfo[uuid];
    }
    /**
     * 根据资源信息返回资源的纹理压缩任务，无压缩任务的返回 null
     * @param assetInfo
     * @returns IImageTaskInfo | null
     */
    addTask(uuid, task) {
        if (this._taskMap[uuid]) {
            Object.assign(this._taskMap[uuid], task);
        }
        else {
            this._taskMap[uuid] = task;
        }
        return this._taskMap[uuid];
    }
    /**
     * 根据 Image 信息添加资源的压缩任务
     * @param assetInfo （不支持自动图集）
     * @returns
     */
    addTaskWithAssetInfo(assetInfo) {
        if (this._taskMap[assetInfo.uuid]) {
            return this._taskMap[assetInfo.uuid];
        }
        // 自动图集无法直接通过 assetInfo 获取到正确的压缩任务
        if (assetInfo.meta.importer === 'auto-atlas') {
            return;
        }
        const task = this.genTaskInfoFromAssetInfo(assetInfo);
        if (!task) {
            return;
        }
        this._taskMap[assetInfo.uuid] = task;
        return task;
    }
    /**
     * 根据图集或者 Image 资源信息返回资源的纹理压缩任务，无压缩任务的返回 null
     */
    genTaskInfoFromAssetInfo(assetInfo) {
        if (this._taskMap[assetInfo.uuid]) {
            return this._taskMap[assetInfo.uuid];
        }
        const compressSettings = assetInfo.meta.userData.compressSettings;
        if (!compressSettings || !compressSettings.useCompressTexture) {
            return null;
        }
        // 判断资源是否存在
        let extName = assetInfo.extname;
        if (!assetInfo.meta.files.includes(extName)) {
            // HACK 此处假定了每张图导入后如果改了后缀一定是转成 png / jpg 等，但目前没有好的方式得知这个信息
            extName = assetInfo.meta.files.find((fileExtName) => ['.png', '.jpg'].includes(fileExtName)) || '.png';
        }
        const src = assetInfo.library + extName;
        if (assetInfo.meta.importer !== 'auto-atlas' && !src) {
            console.warn(`genTaskInfoFromAssetInfo failed ! Image asset does not exist: ${assetInfo.source}`);
            return;
        }
        const compressOptions = this.getCompressOptions(compressSettings.presetId);
        if (!compressOptions) {
            return;
        }
        return {
            src,
            presetId: compressSettings.presetId,
            compressOptions,
            hasAlpha: assetInfo.meta.userData.hasAlpha,
            mtime: asset_library_1.buildAssetLibrary.getAssetProperty(assetInfo, 'mtime'),
            hasMipmaps: TextureCompress.enableMipMaps ? (0, minimaps_1.checkHasMipMaps)(assetInfo.meta) : false,
            dest: [],
            suffix: [],
        };
    }
    /**
     * 根据纹理压缩配置 id 获取对应的纹理压缩选项
     * @param presetId
     * @returns Record<string, number | string> | null
     */
    getCompressOptions(presetId) {
        if (TextureCompress._presetIdToCompressOption[presetId]) {
            return TextureCompress._presetIdToCompressOption[presetId];
        }
        const { userPreset, defaultConfig, customConfigs } = TextureCompress.userCompressConfig;
        const { platformConfig, customFormats } = TextureCompress.allTextureCompressConfig;
        if (!platformConfig[this.platform]) {
            return null;
        }
        const textureCompressConfig = platformConfig[this.platform].textureCompressConfig;
        if (!textureCompressConfig) {
            return null;
        }
        const platformType = textureCompressConfig.platformType;
        const config = userPreset[presetId] || defaultConfig[presetId] || defaultConfig.default;
        if (!config || (!config.options[platformType] && (!config.overwrite || !config.overwrite[this.platform]))) {
            console.debug(`Invalid compress task: ${JSON.stringify(config)}`);
            return null;
        }
        let compressOptions = {};
        if (config.overwrite && config.overwrite[this.platform]) {
            compressOptions = config.overwrite[this.platform];
        }
        else {
            const support = textureCompressConfig.support;
            // const suffixMap: Record<string, string> = {};
            Object.keys(config.options[platformType]).forEach((format) => {
                const formats = [...support.rgba, ...support.rgb];
                if (formats.includes(format) || Object.keys(customFormats).includes(format)) {
                    compressOptions[format] = JSON.parse(JSON.stringify(config.options[platformType][format]));
                    // suffixMap[format] = textureFormatConfigs[formatsInfo[format].formatType].suffix;
                }
            });
        }
        // 收集目前已有配置内会覆盖现有格式的配置集合
        const overwriteFormats = {};
        if (customConfigs && Object.values(customConfigs).length) {
            Object.values(customConfigs).forEach((formatConfig) => {
                if (formatConfig.overwrite) {
                    overwriteFormats[formatConfig.format] = formatConfig.id;
                    console.debug(`compress format (${formatConfig.format}) will be overwritten by custom compress ${formatConfig.id}(${formatConfig.name})`);
                }
            });
        }
        Object.keys(overwriteFormats).forEach((format) => {
            if (compressOptions[format]) {
                compressOptions[overwriteFormats[format]] = compressOptions[format];
                delete compressOptions[format];
            }
        });
        if (!Object.keys(compressOptions).length) {
            return null;
        }
        TextureCompress._presetIdToCompressOption[presetId] = compressOptions;
        return compressOptions;
    }
    /**
     * 查询某个指定 uuid 资源的纹理压缩任务
     * @param uuid
     * @returns
     */
    queryTask(uuid) {
        return this._taskMap[uuid];
    }
    removeTask(uuid) {
        delete this._taskMap[uuid];
    }
    /**
     * 执行所有纹理压缩任务，支持限定任务，否则将执行收集的所有纹理压缩任务
     */
    async run(taskMap = this._taskMap) {
        const { customConfigs } = TextureCompress.userCompressConfig;
        // 1. 整理纹理压缩任务
        const compressQueue = await this.sortImageTask(taskMap);
        console.debug(`Num of all image compress task ${Object.keys(taskMap).length}, really: ${this._compressAssetLen}, configTasks: ${compressQueue.length}`);
        if (!compressQueue.length) {
            console.debug('No image need to compress');
            return;
        }
        const compressQueueCopy = JSON.parse(JSON.stringify(compressQueue));
        // 2. 优先执行构建自定义纹理压缩钩子函数，此流程会修改 compressQueueCopy 内的任务数量，需要深拷贝
        const customHandlerInfos = plugin_1.pluginManager.getAssetHandlers('compressTextures');
        if (customHandlerInfos.pkgNameOrder.length) {
            this.emit('update-progress', 'start compress custom compress hooks...');
            console_1.newConsole.trackTimeStart('builder:custom-compress-texture');
            await this.customCompressImage(compressQueueCopy, customHandlerInfos);
            await console_1.newConsole.trackTimeEnd('builder:custom-compress-texture', { output: true });
            console.debug(`custom compress ${compressQueue.length - compressQueueCopy.length} / ${compressQueue.length}`);
        }
        if (compressQueueCopy.length) {
            this._waitingCompressQueue = new Set(compressQueueCopy);
            console_1.newConsole.trackTimeStart('builder:compress-texture');
            // 5. 处理实际需要压缩的纹理任务
            await this.executeCompressQueue();
            const time = await console_1.newConsole.trackTimeEnd('builder:compress-texture', { output: true });
            console.debug(`builder:compress-texture: ${(0, utils_2.formatMSTime)(time)}`);
        }
        // 6. 填充压缩后的路径到 info 内
        await Promise.all(compressQueue.map(async (config) => {
            if ((0, fs_extra_1.existsSync)(config.dest)) {
                taskMap[config.uuid].dest.push(config.dest);
                taskMap[config.uuid].suffix.push(config.suffix);
            }
            else {
                console.error(`texture compress task width asset ${config.uuid}, format: ${config.format} failed!`);
            }
        }));
        // 存储纹理压缩缓存信息
        await (0, fs_extra_1.outputJSON)(TextureCompress.storedCompressInfoPath, TextureCompress.storedCompressInfo);
        console.debug(`Num of sorted image asset: ${Object.keys(taskMap).length}`);
        return taskMap;
    }
    /**
     * 筛选整理压缩任务中缓存失效的实际需要压缩的任务队列
     * @param taskMap
     * @returns
     */
    async sortImageTask(taskMap) {
        const compressQueue = [];
        const { textureFormatConfigs, formatsInfo } = TextureCompress.allTextureCompressConfig;
        const { customConfigs } = TextureCompress.userCompressConfig;
        // 记录格式的压缩数量
        const collectFormatNum = {};
        for (const uuid of Object.keys(taskMap)) {
            const info = taskMap[uuid];
            const compressOptions = info.compressOptions;
            let mipmapFiles = [];
            if (info.hasMipmaps && TextureCompress.enableMipMaps) {
                try {
                    // TODO mipmap file 需要缓存机制管理
                    const files = await (0, minimaps_1.genMipmapFiles)(info.src, asset_library_1.buildAssetLibrary.getAssetTempDirByUuid(uuid));
                    if (!files.length) {
                        continue;
                    }
                    mipmapFiles = files;
                }
                catch (error) {
                    if (error instanceof Error) {
                        error.message = `{asset(${uuid})}` + error.message;
                    }
                    console.warn(error);
                    continue;
                }
            }
            const formats = Object.keys(compressOptions);
            const assetCustomConfigs = {};
            formats.forEach((format) => customConfigs[format] && (assetCustomConfigs[format] = customConfigs[format]));
            const newCompressInfo = { option: { mtime: info.mtime, src: info.src, compressOptions }, mipmapFiles, customConfigs: assetCustomConfigs };
            const dirty = !lodash_1.default.isEqual(TextureCompress.storedCompressInfo[uuid] && TextureCompress.storedCompressInfo[uuid].option, newCompressInfo.option);
            info.dest = [];
            info.dirty = dirty;
            info.suffix = [];
            let hasCompressConfig = false;
            Object.keys(compressOptions).forEach((format) => {
                let realFormat = format;
                if (TextureCompress.userCompressConfig.customConfigs[format]) {
                    realFormat = TextureCompress.userCompressConfig.customConfigs[format].format;
                }
                const formatType = formatsInfo[realFormat]?.formatType;
                if (!formatType) {
                    console.error(`Invalid format ${format}`);
                    return;
                }
                const cacheDest = (0, path_1.join)(TextureCompress.compressCacheDir, uuid.substr(0, 2), uuid + textureFormatConfigs[formatType].suffix);
                if (this.textureCompress && !dirty && (0, fs_extra_1.existsSync)(cacheDest)) {
                    info.dest.push(cacheDest);
                    info.suffix.push((0, utils_1.getSuffix)(formatsInfo[realFormat], textureFormatConfigs[formatType].suffix));
                    console.debug(`Use cache compress image of {Asset(${uuid})} ({link(${cacheDest})})`);
                    return;
                }
                info.dirty = true;
                if (TextureCompress.userCompressConfig.customConfigs[format]) {
                    // [自定义纹理压缩统计] 1.收集统计所需数据（自定义配置被使用次数）
                    increaseCustomCompressNum(TextureCompress.userCompressConfig.customConfigs[format]);
                }
                hasCompressConfig = true;
                compressQueue.push({
                    format,
                    src: info.src,
                    dest: cacheDest,
                    compressOptions: compressOptions[format],
                    customConfig: customConfigs[format],
                    uuid,
                    mipmapFiles,
                    suffix: (0, utils_1.getSuffix)(formatsInfo[realFormat], textureFormatConfigs[formatType].suffix),
                    formatType,
                });
                collectFormatNum[formatType] = (collectFormatNum[formatType] || 0) + 1;
            });
            if (hasCompressConfig) {
                this._compressAssetLen++;
            }
            newCompressInfo.dest = info.dest;
            TextureCompress.storedCompressInfo[uuid] = newCompressInfo;
        }
        console.debug(`sort compress task ${JSON.stringify(collectFormatNum)}`);
        return compressQueue;
    }
    executeCompressQueue() {
        if (!this._waitingCompressQueue.size) {
            return;
        }
        return new Promise((resolve, reject) => {
            try {
                this._compressExecuteInfo = {
                    reject,
                    resolve,
                    state: 'progress',
                    busyFormatType: {},
                    busyAsset: new Set(),
                    complete: 0,
                    total: this._waitingCompressQueue.size,
                    childProcess: 0,
                };
                this.emit('update-progress', `start compress task 0 / ${this._waitingCompressQueue.size}`);
                // 由于资源文件并发会有权限问题，压缩任务至多并发数 <= 压缩任务里的总资源数量
                for (let i = 0; i < this._compressAssetLen; i++) {
                    const nextTask = this._getNextTask();
                    nextTask && (this._compressImage(nextTask).catch((error) => {
                        reject(error);
                    }));
                }
            }
            catch (error) {
                reject(error);
            }
        });
    }
    _getNextTask() {
        for (const task of this._waitingCompressQueue.values()) {
            // TODO 小优化，其实加了核心数限制后，有可能遇到下一次获取任务时拿到了因为 busyAsset 导致延后的 sharp 任务，此时其实可以连续启动两个任务
            if (this._checkTaskCanExecute(task)) {
                return task;
            }
        }
        return null;
    }
    _checkTaskCanExecute(taskConfig) {
        const { busyAsset, busyFormatType } = this._compressExecuteInfo;
        if (busyAsset.has(taskConfig.uuid)) {
            return false;
        }
        if (busyFormatType[taskConfig.formatType] && !TextureCompress.allTextureCompressConfig.textureFormatConfigs[taskConfig.formatType].parallelism) {
            // 检查当前格式是否支持并行
            return false;
        }
        return true;
    }
    async _compressImage(config) {
        const { busyAsset, busyFormatType, total, childProcess } = this._compressExecuteInfo;
        const useChildProcess = TextureCompress.allTextureCompressConfig.textureFormatConfigs[config.formatType].childProcess;
        if (useChildProcess) {
            if (childProcess > numCPUs) {
                console.debug(`${config.formatType} wait for child process ${childProcess}`);
                // 超过最大进程数，需要等待
                return;
            }
            this._compressExecuteInfo.childProcess++;
        }
        let oldValue = busyFormatType[config.formatType];
        if (oldValue && oldValue > 0) {
            if (!TextureCompress.allTextureCompressConfig.textureFormatConfigs[config.formatType].parallelism) {
                return;
            }
            busyFormatType[config.formatType] = ++oldValue;
        }
        else {
            busyFormatType[config.formatType] = 1;
        }
        busyAsset.add(config.uuid);
        this.emit('update-progress', `execute compress task ${this._compressExecuteInfo.complete}/${total}, ${busyAsset.size} in progress`);
        this._waitingCompressQueue.delete(config);
        try {
            await this.compressImageByConfig(config);
        }
        catch (error) {
            console.error(error);
        }
        useChildProcess && (this._compressExecuteInfo.childProcess--);
        busyAsset.delete(config.uuid);
        busyFormatType[config.formatType] = --busyFormatType[config.formatType];
        this._compressExecuteInfo.complete++;
        await this._step();
    }
    /**
     * 检查压缩任务是否已经完成，如未完成，则继续执行剩下的任务
     * @returns
     */
    async _step() {
        if (this._waitingCompressQueue.size) {
            const nextTask = this._getNextTask();
            nextTask && this._compressImage(nextTask);
            return;
        }
        // 进入检查任务是否全部完成
        const { busyAsset, resolve } = this._compressExecuteInfo;
        if (!busyAsset.size) {
            return resolve();
        }
    }
    async customCompressImage(compressQueue, infos) {
        for (let i = 0; i < infos.pkgNameOrder.length; i++) {
            const pkgName = infos.pkgNameOrder[i];
            const handler = infos.handles[pkgName];
            if (!handler) {
                continue;
            }
            try {
                console.debug(`Start custom compress(${pkgName})`);
                // 实际需要压缩的纹理任务
                await handler(compressQueue);
            }
            catch (error) {
                console.error(error);
                console.error(`Custom Compress (${pkgName}) failed!`);
            }
        }
    }
    async compressImageByConfig(optionItem) {
        const { dest } = optionItem;
        let src = optionItem.src;
        await (0, fs_extra_1.ensureDir)((0, path_1.dirname)(dest));
        try {
            if (optionItem.compressOptions.quality === 100 && (0, path_1.extname)(optionItem.src).endsWith(optionItem.format)) {
                console.log(`${optionItem.format} with quality is 100, will copy the image from ${optionItem.src} to ${optionItem.dest}`);
                await (0, fs_extra_1.copy)(optionItem.src, optionItem.dest, { overwrite: true });
                return;
            }
        }
        catch (error) {
            console.warn(error);
        }
        if ((0, path_1.extname)(src) === '.webp') {
            const image = (0, sharp_1.default)(src);
            src = src.replace('webp', 'png');
            await image.toFile(src);
        }
        let compressFunc;
        // 自定义压缩流程
        if (optionItem.customConfig) {
            try {
                console.debug(`start custom compress config ${optionItem.format}(${optionItem.customConfig.name})`);
                await (0, compress_tool_1.compressCustomFormat)({
                    ...optionItem,
                    src,
                });
                console.debug('Custom compress config', `${optionItem.format}(${optionItem.customConfig.name})`, 'sucess');
                return;
            }
            catch (error) {
                console.warn(`Compress {asset(${optionItem.uuid})} with custom config failed!`);
                console.warn(error);
                // 自定义纹理压缩失败后，回退成默认的压缩格式
                compressFunc = (0, compress_tool_1.getCompressFunc)(optionItem.customConfig.format);
                if (!compressFunc) {
                    console.warn(`Invalid format ${optionItem.customConfig.format}`);
                    return;
                }
            }
        }
        compressFunc = compressFunc || (0, compress_tool_1.getCompressFunc)(optionItem.format);
        if (!compressFunc) {
            console.warn(`Invalid format ${optionItem.format}`);
            return;
        }
        // 正常压缩流程
        await compressFunc({
            ...optionItem,
            src,
        });
        // 依赖第三方工具的纹理压缩格式才需要依赖构建生成
        if (TextureCompress.enableMipMaps) {
            try {
                const files = await (0, minimaps_1.compressMipmapFiles)({
                    ...optionItem,
                    src,
                }, compressFunc);
                if (files.length) {
                    files.splice(0, 0, (0, fs_extra_1.readFileSync)(optionItem.dest));
                    const data = cc_1.ImageAsset.mergeCompressedTextureMips(files);
                    await (0, fs_extra_1.outputFile)(optionItem.dest, data);
                }
            }
            catch (error) {
                console.error(error);
                await (0, fs_extra_1.remove)(optionItem.dest);
                console.error(`Generate {asset(${optionItem.uuid})} compress texture mipmap files failed!`);
            }
        }
        try {
            // 注意： 需要使用 optionItem.src 判断，src 变量可能被修改
            if ((0, path_1.extname)(optionItem.src).endsWith(optionItem.format)) {
                const srcState = await (0, fs_extra_1.stat)(optionItem.src);
                const destState = await (0, fs_extra_1.stat)(optionItem.dest);
                if (destState.size > srcState.size) {
                    console.log(`The compressed image(${optionItem.dest}) size(${destState.size}) is larger than the original image(${optionItem.src}) size(${srcState.size}), and the original image will be used. To ignore this protection mechanism, please configure it in Project Settings -> Texture Compression Configuration.`);
                    await (0, fs_extra_1.copy)(optionItem.src, optionItem.dest, { overwrite: true });
                }
            }
        }
        catch (error) {
            console.warn(error);
        }
    }
}
exports.TextureCompress = TextureCompress;
async function previewCompressImage(assetUuid, platform = 'web-mobile') {
    const defaultCompressManager = new TextureCompress(platform, true);
    await defaultCompressManager.init();
    const assetInfo = asset_library_1.buildAssetLibrary.getAsset(assetUuid);
    const task = defaultCompressManager.addTaskWithAssetInfo(assetInfo);
    if (!task) {
        return;
    }
    await defaultCompressManager.run();
    return task;
}
async function queryCompressCache(uuid) {
    await TextureCompress.initCommonOptions();
    return TextureCompress.queryTextureCompressCache(uuid);
}
function increaseCustomCompressNum(config) {
    if (!config) {
        return;
    }
    if (!config.num) {
        config.num = 0;
    }
    config.num++;
}
async function queryAllCompressConfig() {
    const customConfig = await builder_config_1.default.getProject('textureCompressConfig.customConfigs');
    const customFormats = {};
    if (customConfig && Object.keys(customConfig).length) {
        for (const config of Object.values(customConfig)) {
            customFormats[config.id] = {
                ...texture_compress_1.formatsInfo[config.format],
                displayName: config.name,
                value: config.id,
                custom: true,
            };
        }
    }
    return {
        defaultSupport: texture_compress_1.defaultSupport,
        configGroups: texture_compress_1.configGroups,
        textureFormatConfigs: texture_compress_1.textureFormatConfigs,
        formatsInfo: {
            ...texture_compress_1.formatsInfo,
            ...customFormats,
        },
        customFormats,
        platformConfig: plugin_1.pluginManager.getTexturePlatformConfigs(),
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL2Fzc2V0LWhhbmRsZXIvdGV4dHVyZS1jb21wcmVzcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFtbUJBLG9EQVVDO0FBRUQsZ0RBR0M7QUFhRCx3REF5QkM7QUF4cEJELHVDQUEwSztBQUMxSywrQkFBd0Q7QUFDeEQseUNBQWtGO0FBQ2xGLG1EQUF3RTtBQUN4RSwyQkFBZ0M7QUFDaEMsK0RBQWdFO0FBQ2hFLG1DQUF1RDtBQUN2RCxtQ0FBc0M7QUFHdEMsMkJBQTBCO0FBQzFCLE1BQU0sT0FBTyxHQUFHLElBQUEsU0FBSSxHQUFFLENBQUMsTUFBTSxDQUFDO0FBQzlCLGtEQUEwQjtBQUMxQixvREFBNEI7QUFDNUIsbURBQXVEO0FBQ3ZELHlEQUF5RDtBQUl6RCx1REFBMkQ7QUFDM0QseUVBQXFIO0FBQ3JILHNGQUE2RDtBQXlCN0QsTUFBYSxlQUFnQixTQUFRLHFCQUFZO0lBQzdDLFFBQVEsR0FBbUMsRUFBRSxDQUFDO0lBQzlDLFFBQVEsQ0FBUztJQUVqQixNQUFNLENBQUMsZ0JBQWdCLEdBQTJCLEVBQUUsQ0FBQztJQUNyRCxNQUFNLENBQUMseUJBQXlCLEdBQW9FLEVBQUUsQ0FBQztJQUN2RyxNQUFNLENBQUMsd0JBQXdCLENBQTJCO0lBQzFELE1BQU0sQ0FBQyxrQkFBa0IsQ0FBcUI7SUFDOUMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUEsV0FBSSxFQUFDLHdCQUFhLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUNoRyxNQUFNLENBQUMsa0JBQWtCLEdBQXNDLEVBQUUsQ0FBQztJQUNsRSxNQUFNLENBQUMsc0JBQXNCLEdBQUcsSUFBQSxXQUFJLEVBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLG9CQUFvQixD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LENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHO2dCQUN2QixHQUFHLDhCQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDN0IsV0FBVyxFQUFFLE1BQU0sQ0FBQyxJQUFJO2dCQUN4QixLQUFLLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQ2hCLE1BQU0sRUFBRSxJQUFJO2FBQ2YsQ0FBQztRQUNOLENBQUM7SUFDTCxDQUFDO0lBRUQsT0FBTztRQUNILGNBQWMsRUFBZCxpQ0FBYztRQUNkLFlBQVksRUFBWiwrQkFBWTtRQUNaLG9CQUFvQixFQUFwQix1Q0FBb0I7UUFDcEIsV0FBVyxFQUFFO1lBQ1QsR0FBRyw4QkFBVztZQUNkLEdBQUcsYUFBYTtTQUNuQjtRQUNELGFBQWE7UUFDYixjQUFjLEVBQUUsc0JBQWEsQ0FBQyx5QkFBeUIsRUFBRTtLQUM1RCxDQUFDO0FBQ04sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNvcHlTeW5jLCBlbnN1cmVEaXJTeW5jLCBvdXRwdXRGaWxlLCByZWFkRmlsZVN5bmMsIHJlYWRKc29uU3luYywgcmVtb3ZlLCBzdGF0LCBleGlzdHNTeW5jLCBvdXRwdXRKU09OU3luYywgY29weSwgZW5zdXJlRGlyLCBleGlzdHMsIG91dHB1dEpTT04gfSBmcm9tICdmcy1leHRyYSc7XHJcbmltcG9ydCB7IGJhc2VuYW1lLCBkaXJuYW1lLCBleHRuYW1lLCBqb2luIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGNoZWNrSGFzTWlwTWFwcywgY29tcHJlc3NNaXBtYXBGaWxlcywgZ2VuTWlwbWFwRmlsZXMgfSBmcm9tICcuL21pbmltYXBzJztcclxuaW1wb3J0IHsgY29tcHJlc3NDdXN0b21Gb3JtYXQsIGdldENvbXByZXNzRnVuYyB9IGZyb20gJy4vY29tcHJlc3MtdG9vbCc7XHJcbmltcG9ydCB7IEltYWdlQXNzZXQgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IGJ1aWxkQXNzZXRMaWJyYXJ5IH0gZnJvbSAnLi4vLi4vbWFuYWdlci9hc3NldC1saWJyYXJ5JztcclxuaW1wb3J0IHsgY2hhbmdlSW5mb1RvTGFiZWwsIGdldFN1ZmZpeCB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdzdHJlYW0nO1xyXG5cclxuaW1wb3J0IHsgQXNzZXQsIFZpcnR1YWxBc3NldCB9IGZyb20gJ0Bjb2Nvcy9hc3NldC1kYi9saWJzL2Fzc2V0JztcclxuaW1wb3J0IHsgY3B1cyB9IGZyb20gJ29zJztcclxuY29uc3QgbnVtQ1BVcyA9IGNwdXMoKS5sZW5ndGg7XHJcbmltcG9ydCBTaGFycCBmcm9tICdzaGFycCc7XHJcbmltcG9ydCBMb2Rhc2ggZnJvbSAnbG9kYXNoJztcclxuaW1wb3J0IHsgZm9ybWF0TVNUaW1lIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2hhcmUvdXRpbHMnO1xyXG5pbXBvcnQgeyBuZXdDb25zb2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vYmFzZS9jb25zb2xlJztcclxuaW1wb3J0IHsgSUN1c3RvbUNvbmZpZywgSVRleHR1cmVDb21wcmVzc0Zvcm1hdFR5cGUsIEFsbFRleHR1cmVDb21wcmVzc0NvbmZpZywgVXNlckNvbXByZXNzQ29uZmlnLCBJQ29tcHJlc3NDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9AdHlwZXMnO1xyXG5pbXBvcnQgeyBJQnVpbGRBc3NldEhhbmRsZXJJbmZvIH0gZnJvbSAnLi4vLi4vLi4vLi4vQHR5cGVzL3ByaXZhdGUnO1xyXG5pbXBvcnQgeyBJSW1hZ2VUYXNrSW5mbywgSVRleHR1cmVGb3JtYXRJbmZvIH0gZnJvbSAnLi4vLi4vLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IHBsdWdpbk1hbmFnZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9tYW5hZ2VyL3BsdWdpbic7XHJcbmltcG9ydCB7IGNvbmZpZ0dyb3VwcywgZGVmYXVsdFN1cHBvcnQsIGZvcm1hdHNJbmZvLCB0ZXh0dXJlRm9ybWF0Q29uZmlncyB9IGZyb20gJy4uLy4uLy4uLy4uL3NoYXJlL3RleHR1cmUtY29tcHJlc3MnO1xyXG5pbXBvcnQgYnVpbGRlckNvbmZpZyBmcm9tICcuLi8uLi8uLi8uLi9zaGFyZS9idWlsZGVyLWNvbmZpZyc7XHJcbmludGVyZmFjZSBDb21wcmVzc0NhY2hlSW5mbyB7XHJcbiAgICBvcHRpb246IHtcclxuICAgICAgICBtdGltZTogbnVtYmVyIHwgc3RyaW5nO1xyXG4gICAgICAgIHNyYzogc3RyaW5nO1xyXG4gICAgICAgIGNvbXByZXNzT3B0aW9uczogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgbnVtYmVyPj47XHJcbiAgICB9O1xyXG4gICAgbWlwbWFwRmlsZXM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xyXG4gICAgY3VzdG9tQ29uZmlnczogUmVjb3JkPHN0cmluZywgSUN1c3RvbUNvbmZpZz47XHJcbiAgICBkZXN0Pzogc3RyaW5nW107XHJcbn1cclxuXHJcbmludGVyZmFjZSBDb21wcmVzc0V4ZWN1dGVJbmZvIHtcclxuICAgIC8vIOWtmOWCqOW9k+WJjeacieWcqOaJp+ihjOWOi+e8qeS7u+WKoeagvOW8j+eahOWFt+S9k+S7u+WKoeaVsOmHjyDvvIzmlrnkvr/liqDplIFcclxuICAgIGJ1c3lGb3JtYXRUeXBlOiBQYXJ0aWFsPFJlY29yZDxJVGV4dHVyZUNvbXByZXNzRm9ybWF0VHlwZSB8IHN0cmluZywgbnVtYmVyPj47XHJcbiAgICAvLyDlrZjlgqjlvZPliY3mnInlnKjmiafooYzljovnvKnku7vliqHnmoTotYTmupAgdXVpZCDvvIzmlrnkvr/liqDplIFcclxuICAgIGJ1c3lBc3NldDogU2V0PHN0cmluZz47XHJcbiAgICByZXNvbHZlOiBGdW5jdGlvbjtcclxuICAgIHJlamVjdDogRnVuY3Rpb247XHJcbiAgICBzdGF0ZTogJ3Byb2dyZXNzJyB8ICdzdWNjZXNzJyB8ICdmYWlsZWQnO1xyXG4gICAgY29tcGxldGU6IG51bWJlcjtcclxuICAgIHRvdGFsOiBudW1iZXI7XHJcbiAgICBjaGlsZFByb2Nlc3M6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFRleHR1cmVDb21wcmVzcyBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcbiAgICBfdGFza01hcDogUmVjb3JkPHN0cmluZywgSUltYWdlVGFza0luZm8+ID0ge307XHJcbiAgICBwbGF0Zm9ybTogc3RyaW5nO1xyXG5cclxuICAgIHN0YXRpYyBvdmVyd3JpdGVGb3JtYXRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XHJcbiAgICBzdGF0aWMgX3ByZXNldElkVG9Db21wcmVzc09wdGlvbjogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgbnVtYmVyIHwgc3RyaW5nPj4+ID0ge307XHJcbiAgICBzdGF0aWMgYWxsVGV4dHVyZUNvbXByZXNzQ29uZmlnOiBBbGxUZXh0dXJlQ29tcHJlc3NDb25maWc7XHJcbiAgICBzdGF0aWMgdXNlckNvbXByZXNzQ29uZmlnOiBVc2VyQ29tcHJlc3NDb25maWc7XHJcbiAgICBzdGF0aWMgY29tcHJlc3NDYWNoZURpciA9IGpvaW4oYnVpbGRlckNvbmZpZy5wcm9qZWN0Um9vdCwgJ3RlbXAnLCAnYnVpbGRlcicsICdDb21wcmVzc1RleHR1cmUnKTtcclxuICAgIHN0YXRpYyBzdG9yZWRDb21wcmVzc0luZm86IFJlY29yZDxzdHJpbmcsIENvbXByZXNzQ2FjaGVJbmZvPiA9IHt9O1xyXG4gICAgc3RhdGljIHN0b3JlZENvbXByZXNzSW5mb1BhdGggPSBqb2luKFRleHR1cmVDb21wcmVzcy5jb21wcmVzc0NhY2hlRGlyLCAnY29tcHJlc3MtaW5mby5qc29uJyk7XHJcbiAgICBzdGF0aWMgZW5hYmxlTWlwTWFwcyA9IGZhbHNlO1xyXG5cclxuICAgIF93YWl0aW5nQ29tcHJlc3NRdWV1ZTogU2V0PElDb21wcmVzc0NvbmZpZz4gPSBuZXcgU2V0KCk7XHJcbiAgICBfY29tcHJlc3NBc3NldExlbiA9IDA7XHJcbiAgICBfY29tcHJlc3NFeGVjdXRlSW5mbzogQ29tcHJlc3NFeGVjdXRlSW5mbyB8IG51bGwgPSBudWxsO1xyXG4gICAgdGV4dHVyZUNvbXByZXNzOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBsYXRmb3JtOiBzdHJpbmcsIHRleHR1cmVDb21wcmVzcz86IGJvb2xlYW4pIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucGxhdGZvcm0gPSBwbGF0Zm9ybTtcclxuICAgICAgICB0aGlzLnRleHR1cmVDb21wcmVzcyA9IHRleHR1cmVDb21wcmVzcyA/PyB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBpbml0Q29tbW9uT3B0aW9ucygpIHtcclxuICAgICAgICBUZXh0dXJlQ29tcHJlc3MuYWxsVGV4dHVyZUNvbXByZXNzQ29uZmlnID0gYXdhaXQgcXVlcnlBbGxDb21wcmVzc0NvbmZpZygpO1xyXG4gICAgICAgIGlmIChleGlzdHNTeW5jKFRleHR1cmVDb21wcmVzcy5zdG9yZWRDb21wcmVzc0luZm9QYXRoKSkge1xyXG4gICAgICAgICAgICBUZXh0dXJlQ29tcHJlc3Muc3RvcmVkQ29tcHJlc3NJbmZvID0gcmVhZEpzb25TeW5jKFRleHR1cmVDb21wcmVzcy5zdG9yZWRDb21wcmVzc0luZm9QYXRoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBUZXh0dXJlQ29tcHJlc3Muc3RvcmVkQ29tcHJlc3NJbmZvID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFRleHR1cmVDb21wcmVzcy5lbmFibGVNaXBNYXBzID0gISEoYXdhaXQgYnVpbGRlckNvbmZpZy5nZXRQcm9qZWN0PGJvb2xlYW4+KCd0ZXh0dXJlQ29tcHJlc3NDb25maWcuZ2VuTWlwbWFwcycpKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBpbml0KCkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMudXBkYXRlVXNlckNvbmZpZygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pu05paw57yT5a2Y55qE57q555CG5Y6L57yp6aG555uu6YWN572uXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHVwZGF0ZVVzZXJDb25maWcoKSB7XHJcbiAgICAgICAgYXdhaXQgVGV4dHVyZUNvbXByZXNzLmluaXRDb21tb25PcHRpb25zKCk7XHJcbiAgICAgICAgLy8g5p+l6K+i57q555CG5Y6L57yp6YWN572u562JXHJcbiAgICAgICAgVGV4dHVyZUNvbXByZXNzLnVzZXJDb21wcmVzc0NvbmZpZyA9IGF3YWl0IGJ1aWxkZXJDb25maWcuZ2V0UHJvamVjdDxVc2VyQ29tcHJlc3NDb25maWc+KCd0ZXh0dXJlQ29tcHJlc3NDb25maWcnKSBhcyBVc2VyQ29tcHJlc3NDb25maWc7XHJcbiAgICAgICAgY29uc3QgeyBjdXN0b21Db25maWdzIH0gPSBUZXh0dXJlQ29tcHJlc3MudXNlckNvbXByZXNzQ29uZmlnO1xyXG4gICAgICAgIC8vIOaUtumbhuebruWJjeW3suaciemFjee9ruWGheS8muimhueblueOsOacieagvOW8j+eahOmFjee9rumbhuWQiFxyXG4gICAgICAgIGNvbnN0IG92ZXJ3cml0ZUZvcm1hdHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuICAgICAgICBpZiAoY3VzdG9tQ29uZmlncyAmJiBPYmplY3QudmFsdWVzKGN1c3RvbUNvbmZpZ3MpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBPYmplY3QudmFsdWVzKGN1c3RvbUNvbmZpZ3MgYXMgUmVjb3JkPHN0cmluZywgSUN1c3RvbUNvbmZpZz4pLmZvckVhY2goKGZvcm1hdENvbmZpZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZvcm1hdENvbmZpZy5vdmVyd3JpdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBvdmVyd3JpdGVGb3JtYXRzW2Zvcm1hdENvbmZpZy5mb3JtYXRdID0gZm9ybWF0Q29uZmlnLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYGNvbXByZXNzIGZvcm1hdCAoJHtmb3JtYXRDb25maWcuZm9ybWF0fSkgd2lsbCBiZSBvdmVyd3JpdHRlbiBieSBjdXN0b20gY29tcHJlc3MgJHtmb3JtYXRDb25maWcuaWR9KCR7Zm9ybWF0Q29uZmlnLm5hbWV9KWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgVGV4dHVyZUNvbXByZXNzLm92ZXJ3cml0ZUZvcm1hdHMgPSBvdmVyd3JpdGVGb3JtYXRzO1xyXG4gICAgICAgIFRleHR1cmVDb21wcmVzcy5fcHJlc2V0SWRUb0NvbXByZXNzT3B0aW9uID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHF1ZXJ5VGV4dHVyZUNvbXByZXNzQ2FjaGUodXVpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIFRleHR1cmVDb21wcmVzcy5zdG9yZWRDb21wcmVzc0luZm9bdXVpZF07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja7otYTmupDkv6Hmga/ov5Tlm57otYTmupDnmoTnurnnkIbljovnvKnku7vliqHvvIzml6DljovnvKnku7vliqHnmoTov5Tlm54gbnVsbFxyXG4gICAgICogQHBhcmFtIGFzc2V0SW5mbyBcclxuICAgICAqIEByZXR1cm5zIElJbWFnZVRhc2tJbmZvIHwgbnVsbFxyXG4gICAgICovXHJcbiAgICBhZGRUYXNrKHV1aWQ6IHN0cmluZywgdGFzazogSUltYWdlVGFza0luZm8pIHtcclxuICAgICAgICBpZiAodGhpcy5fdGFza01hcFt1dWlkXSkge1xyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuX3Rhc2tNYXBbdXVpZF0sIHRhc2spO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Rhc2tNYXBbdXVpZF0gPSB0YXNrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fdGFza01hcFt1dWlkXTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5qC55o2uIEltYWdlIOS/oeaBr+a3u+WKoOi1hOa6kOeahOWOi+e8qeS7u+WKoVxyXG4gICAgICogQHBhcmFtIGFzc2V0SW5mbyDvvIjkuI3mlK/mjIHoh6rliqjlm77pm4bvvIlcclxuICAgICAqIEByZXR1cm5zIFxyXG4gICAgICovXHJcbiAgICBhZGRUYXNrV2l0aEFzc2V0SW5mbyhhc3NldEluZm86IEFzc2V0IHwgVmlydHVhbEFzc2V0KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3Rhc2tNYXBbYXNzZXRJbmZvLnV1aWRdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl90YXNrTWFwW2Fzc2V0SW5mby51dWlkXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g6Ieq5Yqo5Zu+6ZuG5peg5rOV55u05o6l6YCa6L+HIGFzc2V0SW5mbyDojrflj5bliLDmraPnoa7nmoTljovnvKnku7vliqFcclxuICAgICAgICBpZiAoYXNzZXRJbmZvLm1ldGEuaW1wb3J0ZXIgPT09ICdhdXRvLWF0bGFzJykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRhc2sgPSB0aGlzLmdlblRhc2tJbmZvRnJvbUFzc2V0SW5mbyhhc3NldEluZm8pO1xyXG4gICAgICAgIGlmICghdGFzaykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3Rhc2tNYXBbYXNzZXRJbmZvLnV1aWRdID0gdGFzaztcclxuICAgICAgICByZXR1cm4gdGFzaztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOagueaNruWbvumbhuaIluiAhSBJbWFnZSDotYTmupDkv6Hmga/ov5Tlm57otYTmupDnmoTnurnnkIbljovnvKnku7vliqHvvIzml6DljovnvKnku7vliqHnmoTov5Tlm54gbnVsbFxyXG4gICAgICovXHJcbiAgICBnZW5UYXNrSW5mb0Zyb21Bc3NldEluZm8oYXNzZXRJbmZvOiBBc3NldCB8IFZpcnR1YWxBc3NldCkge1xyXG4gICAgICAgIGlmICh0aGlzLl90YXNrTWFwW2Fzc2V0SW5mby51dWlkXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdGFza01hcFthc3NldEluZm8udXVpZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNvbXByZXNzU2V0dGluZ3MgPSBhc3NldEluZm8ubWV0YS51c2VyRGF0YS5jb21wcmVzc1NldHRpbmdzO1xyXG4gICAgICAgIGlmICghY29tcHJlc3NTZXR0aW5ncyB8fCAhY29tcHJlc3NTZXR0aW5ncy51c2VDb21wcmVzc1RleHR1cmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyDliKTmlq3otYTmupDmmK/lkKblrZjlnKhcclxuICAgICAgICBsZXQgZXh0TmFtZSA9IChhc3NldEluZm8gYXMgQXNzZXQpLmV4dG5hbWU7XHJcbiAgICAgICAgaWYgKCFhc3NldEluZm8ubWV0YS5maWxlcy5pbmNsdWRlcyhleHROYW1lKSkge1xyXG4gICAgICAgICAgICAvLyBIQUNLIOatpOWkhOWBh+WumuS6huavj+W8oOWbvuWvvOWFpeWQjuWmguaenOaUueS6huWQjue8gOS4gOWumuaYr+i9rOaIkCBwbmcgLyBqcGcg562J77yM5L2G55uu5YmN5rKh5pyJ5aW955qE5pa55byP5b6X55+l6L+Z5Liq5L+h5oGvXHJcbiAgICAgICAgICAgIGV4dE5hbWUgPSBhc3NldEluZm8ubWV0YS5maWxlcy5maW5kKChmaWxlRXh0TmFtZSkgPT4gWycucG5nJywgJy5qcGcnXS5pbmNsdWRlcyhmaWxlRXh0TmFtZSkpIHx8ICcucG5nJztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc3JjID0gYXNzZXRJbmZvLmxpYnJhcnkgKyBleHROYW1lO1xyXG4gICAgICAgIGlmIChhc3NldEluZm8ubWV0YS5pbXBvcnRlciAhPT0gJ2F1dG8tYXRsYXMnICYmICFzcmMpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBnZW5UYXNrSW5mb0Zyb21Bc3NldEluZm8gZmFpbGVkICEgSW1hZ2UgYXNzZXQgZG9lcyBub3QgZXhpc3Q6ICR7YXNzZXRJbmZvLnNvdXJjZX1gKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY29tcHJlc3NPcHRpb25zID0gdGhpcy5nZXRDb21wcmVzc09wdGlvbnMoY29tcHJlc3NTZXR0aW5ncy5wcmVzZXRJZCk7XHJcbiAgICAgICAgaWYgKCFjb21wcmVzc09wdGlvbnMpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzcmMsXHJcbiAgICAgICAgICAgIHByZXNldElkOiBjb21wcmVzc1NldHRpbmdzLnByZXNldElkLFxyXG4gICAgICAgICAgICBjb21wcmVzc09wdGlvbnMsXHJcbiAgICAgICAgICAgIGhhc0FscGhhOiBhc3NldEluZm8ubWV0YS51c2VyRGF0YS5oYXNBbHBoYSxcclxuICAgICAgICAgICAgbXRpbWU6IGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEFzc2V0UHJvcGVydHkoYXNzZXRJbmZvLCAnbXRpbWUnKSxcclxuICAgICAgICAgICAgaGFzTWlwbWFwczogVGV4dHVyZUNvbXByZXNzLmVuYWJsZU1pcE1hcHMgPyBjaGVja0hhc01pcE1hcHMoYXNzZXRJbmZvLm1ldGEpIDogZmFsc2UsXHJcbiAgICAgICAgICAgIGRlc3Q6IFtdLFxyXG4gICAgICAgICAgICBzdWZmaXg6IFtdLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmoLnmja7nurnnkIbljovnvKnphY3nva4gaWQg6I635Y+W5a+55bqU55qE57q555CG5Y6L57yp6YCJ6aG5XHJcbiAgICAgKiBAcGFyYW0gcHJlc2V0SWQgXHJcbiAgICAgKiBAcmV0dXJucyBSZWNvcmQ8c3RyaW5nLCBudW1iZXIgfCBzdHJpbmc+IHwgbnVsbFxyXG4gICAgICovXHJcbiAgICBnZXRDb21wcmVzc09wdGlvbnMocHJlc2V0SWQ6IHN0cmluZyk6IChSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBudW1iZXIgfCBzdHJpbmc+PikgfCBudWxsIHtcclxuICAgICAgICBpZiAoVGV4dHVyZUNvbXByZXNzLl9wcmVzZXRJZFRvQ29tcHJlc3NPcHRpb25bcHJlc2V0SWRdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBUZXh0dXJlQ29tcHJlc3MuX3ByZXNldElkVG9Db21wcmVzc09wdGlvbltwcmVzZXRJZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHsgdXNlclByZXNldCwgZGVmYXVsdENvbmZpZywgY3VzdG9tQ29uZmlncyB9ID0gVGV4dHVyZUNvbXByZXNzLnVzZXJDb21wcmVzc0NvbmZpZztcclxuICAgICAgICBjb25zdCB7IHBsYXRmb3JtQ29uZmlnLCBjdXN0b21Gb3JtYXRzIH0gPSBUZXh0dXJlQ29tcHJlc3MuYWxsVGV4dHVyZUNvbXByZXNzQ29uZmlnO1xyXG5cclxuICAgICAgICBpZiAoIXBsYXRmb3JtQ29uZmlnW3RoaXMucGxhdGZvcm1dKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0ZXh0dXJlQ29tcHJlc3NDb25maWcgPSBwbGF0Zm9ybUNvbmZpZ1t0aGlzLnBsYXRmb3JtXS50ZXh0dXJlQ29tcHJlc3NDb25maWc7XHJcbiAgICAgICAgaWYgKCF0ZXh0dXJlQ29tcHJlc3NDb25maWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHBsYXRmb3JtVHlwZSA9IHRleHR1cmVDb21wcmVzc0NvbmZpZy5wbGF0Zm9ybVR5cGU7XHJcbiAgICAgICAgY29uc3QgY29uZmlnID0gdXNlclByZXNldFtwcmVzZXRJZF0gfHwgZGVmYXVsdENvbmZpZ1twcmVzZXRJZF0gfHwgZGVmYXVsdENvbmZpZy5kZWZhdWx0O1xyXG4gICAgICAgIGlmICghY29uZmlnIHx8ICghY29uZmlnLm9wdGlvbnNbcGxhdGZvcm1UeXBlXSAmJiAoIWNvbmZpZy5vdmVyd3JpdGUgfHwgIWNvbmZpZy5vdmVyd3JpdGVbdGhpcy5wbGF0Zm9ybV0pKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBJbnZhbGlkIGNvbXByZXNzIHRhc2s6ICR7SlNPTi5zdHJpbmdpZnkoY29uZmlnKX1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBjb21wcmVzc09wdGlvbnM6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIG51bWJlciB8IHN0cmluZz4+ID0ge307XHJcbiAgICAgICAgaWYgKGNvbmZpZy5vdmVyd3JpdGUgJiYgY29uZmlnLm92ZXJ3cml0ZVt0aGlzLnBsYXRmb3JtXSkge1xyXG4gICAgICAgICAgICBjb21wcmVzc09wdGlvbnMgPSBjb25maWcub3ZlcndyaXRlW3RoaXMucGxhdGZvcm1dO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN1cHBvcnQgPSB0ZXh0dXJlQ29tcHJlc3NDb25maWcuc3VwcG9ydDtcclxuICAgICAgICAgICAgLy8gY29uc3Qgc3VmZml4TWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNvbmZpZy5vcHRpb25zW3BsYXRmb3JtVHlwZV0pLmZvckVhY2goKGZvcm1hdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybWF0czogc3RyaW5nW10gPSBbLi4uc3VwcG9ydC5yZ2JhLCAuLi5zdXBwb3J0LnJnYl07XHJcbiAgICAgICAgICAgICAgICBpZiAoZm9ybWF0cy5pbmNsdWRlcyhmb3JtYXQpIHx8IE9iamVjdC5rZXlzKGN1c3RvbUZvcm1hdHMpLmluY2x1ZGVzKGZvcm1hdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb21wcmVzc09wdGlvbnNbZm9ybWF0XSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY29uZmlnLm9wdGlvbnNbcGxhdGZvcm1UeXBlXVtmb3JtYXRdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gc3VmZml4TWFwW2Zvcm1hdF0gPSB0ZXh0dXJlRm9ybWF0Q29uZmlnc1tmb3JtYXRzSW5mb1tmb3JtYXRdLmZvcm1hdFR5cGVdLnN1ZmZpeDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOaUtumbhuebruWJjeW3suaciemFjee9ruWGheS8muimhueblueOsOacieagvOW8j+eahOmFjee9rumbhuWQiFxyXG4gICAgICAgIGNvbnN0IG92ZXJ3cml0ZUZvcm1hdHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuICAgICAgICBpZiAoY3VzdG9tQ29uZmlncyAmJiBPYmplY3QudmFsdWVzKGN1c3RvbUNvbmZpZ3MpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBPYmplY3QudmFsdWVzKGN1c3RvbUNvbmZpZ3MgYXMgUmVjb3JkPHN0cmluZywgSUN1c3RvbUNvbmZpZz4pLmZvckVhY2goKGZvcm1hdENvbmZpZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZvcm1hdENvbmZpZy5vdmVyd3JpdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBvdmVyd3JpdGVGb3JtYXRzW2Zvcm1hdENvbmZpZy5mb3JtYXRdID0gZm9ybWF0Q29uZmlnLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYGNvbXByZXNzIGZvcm1hdCAoJHtmb3JtYXRDb25maWcuZm9ybWF0fSkgd2lsbCBiZSBvdmVyd3JpdHRlbiBieSBjdXN0b20gY29tcHJlc3MgJHtmb3JtYXRDb25maWcuaWR9KCR7Zm9ybWF0Q29uZmlnLm5hbWV9KWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgT2JqZWN0LmtleXMob3ZlcndyaXRlRm9ybWF0cykuZm9yRWFjaCgoZm9ybWF0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjb21wcmVzc09wdGlvbnNbZm9ybWF0XSkge1xyXG4gICAgICAgICAgICAgICAgY29tcHJlc3NPcHRpb25zW292ZXJ3cml0ZUZvcm1hdHNbZm9ybWF0XV0gPSBjb21wcmVzc09wdGlvbnNbZm9ybWF0XTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBjb21wcmVzc09wdGlvbnNbZm9ybWF0XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoIU9iamVjdC5rZXlzKGNvbXByZXNzT3B0aW9ucykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBUZXh0dXJlQ29tcHJlc3MuX3ByZXNldElkVG9Db21wcmVzc09wdGlvbltwcmVzZXRJZF0gPSBjb21wcmVzc09wdGlvbnM7XHJcbiAgICAgICAgcmV0dXJuIGNvbXByZXNzT3B0aW9ucztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOafpeivouafkOS4quaMh+WumiB1dWlkIOi1hOa6kOeahOe6ueeQhuWOi+e8qeS7u+WKoVxyXG4gICAgICogQHBhcmFtIHV1aWQgXHJcbiAgICAgKiBAcmV0dXJucyBcclxuICAgICAqL1xyXG4gICAgcXVlcnlUYXNrKHV1aWQ6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl90YXNrTWFwW3V1aWRdO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZVRhc2sodXVpZDogc3RyaW5nKSB7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuX3Rhc2tNYXBbdXVpZF07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmiafooYzmiYDmnInnurnnkIbljovnvKnku7vliqHvvIzmlK/mjIHpmZDlrprku7vliqHvvIzlkKbliJnlsIbmiafooYzmlLbpm4bnmoTmiYDmnInnurnnkIbljovnvKnku7vliqFcclxuICAgICAqL1xyXG4gICAgYXN5bmMgcnVuKHRhc2tNYXAgPSB0aGlzLl90YXNrTWFwKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IHsgY3VzdG9tQ29uZmlncyB9ID0gVGV4dHVyZUNvbXByZXNzLnVzZXJDb21wcmVzc0NvbmZpZztcclxuICAgICAgICAvLyAxLiDmlbTnkIbnurnnkIbljovnvKnku7vliqFcclxuICAgICAgICBjb25zdCBjb21wcmVzc1F1ZXVlID0gYXdhaXQgdGhpcy5zb3J0SW1hZ2VUYXNrKHRhc2tNYXApO1xyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoYE51bSBvZiBhbGwgaW1hZ2UgY29tcHJlc3MgdGFzayAke09iamVjdC5rZXlzKHRhc2tNYXApLmxlbmd0aH0sIHJlYWxseTogJHt0aGlzLl9jb21wcmVzc0Fzc2V0TGVufSwgY29uZmlnVGFza3M6ICR7Y29tcHJlc3NRdWV1ZS5sZW5ndGh9YCk7XHJcblxyXG4gICAgICAgIGlmICghY29tcHJlc3NRdWV1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnTm8gaW1hZ2UgbmVlZCB0byBjb21wcmVzcycpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNvbXByZXNzUXVldWVDb3B5ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb21wcmVzc1F1ZXVlKSk7XHJcbiAgICAgICAgLy8gMi4g5LyY5YWI5omn6KGM5p6E5bu66Ieq5a6a5LmJ57q555CG5Y6L57yp6ZKp5a2Q5Ye95pWw77yM5q2k5rWB56iL5Lya5L+u5pS5IGNvbXByZXNzUXVldWVDb3B5IOWGheeahOS7u+WKoeaVsOmHj++8jOmcgOimgea3seaLt+i0nVxyXG4gICAgICAgIGNvbnN0IGN1c3RvbUhhbmRsZXJJbmZvczogSUJ1aWxkQXNzZXRIYW5kbGVySW5mbyA9IHBsdWdpbk1hbmFnZXIuZ2V0QXNzZXRIYW5kbGVycygnY29tcHJlc3NUZXh0dXJlcycpO1xyXG4gICAgICAgIGlmIChjdXN0b21IYW5kbGVySW5mb3MucGtnTmFtZU9yZGVyLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZS1wcm9ncmVzcycsICdzdGFydCBjb21wcmVzcyBjdXN0b20gY29tcHJlc3MgaG9va3MuLi4nKTtcclxuICAgICAgICAgICAgbmV3Q29uc29sZS50cmFja1RpbWVTdGFydCgnYnVpbGRlcjpjdXN0b20tY29tcHJlc3MtdGV4dHVyZScpO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmN1c3RvbUNvbXByZXNzSW1hZ2UoY29tcHJlc3NRdWV1ZUNvcHksIGN1c3RvbUhhbmRsZXJJbmZvcyk7XHJcbiAgICAgICAgICAgIGF3YWl0IG5ld0NvbnNvbGUudHJhY2tUaW1lRW5kKCdidWlsZGVyOmN1c3RvbS1jb21wcmVzcy10ZXh0dXJlJywgeyBvdXRwdXQ6IHRydWUgfSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYGN1c3RvbSBjb21wcmVzcyAke2NvbXByZXNzUXVldWUubGVuZ3RoIC0gY29tcHJlc3NRdWV1ZUNvcHkubGVuZ3RofSAvICR7Y29tcHJlc3NRdWV1ZS5sZW5ndGh9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY29tcHJlc3NRdWV1ZUNvcHkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3dhaXRpbmdDb21wcmVzc1F1ZXVlID0gbmV3IFNldChjb21wcmVzc1F1ZXVlQ29weSk7XHJcblxyXG4gICAgICAgICAgICBuZXdDb25zb2xlLnRyYWNrVGltZVN0YXJ0KCdidWlsZGVyOmNvbXByZXNzLXRleHR1cmUnKTtcclxuICAgICAgICAgICAgLy8gNS4g5aSE55CG5a6e6ZmF6ZyA6KaB5Y6L57yp55qE57q555CG5Lu75YqhXHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZXhlY3V0ZUNvbXByZXNzUXVldWUoKTtcclxuICAgICAgICAgICAgY29uc3QgdGltZSA9IGF3YWl0IG5ld0NvbnNvbGUudHJhY2tUaW1lRW5kKCdidWlsZGVyOmNvbXByZXNzLXRleHR1cmUnLCB7IG91dHB1dDogdHJ1ZSB9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYGJ1aWxkZXI6Y29tcHJlc3MtdGV4dHVyZTogJHtmb3JtYXRNU1RpbWUodGltZSl9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyA2LiDloavlhYXljovnvKnlkI7nmoTot6/lvoTliLAgaW5mbyDlhoVcclxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChjb21wcmVzc1F1ZXVlLm1hcChhc3luYyAoY29uZmlnKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChleGlzdHNTeW5jKGNvbmZpZy5kZXN0KSkge1xyXG4gICAgICAgICAgICAgICAgdGFza01hcFtjb25maWcudXVpZF0uZGVzdC5wdXNoKGNvbmZpZy5kZXN0KTtcclxuICAgICAgICAgICAgICAgIHRhc2tNYXBbY29uZmlnLnV1aWRdLnN1ZmZpeC5wdXNoKGNvbmZpZy5zdWZmaXgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgdGV4dHVyZSBjb21wcmVzcyB0YXNrIHdpZHRoIGFzc2V0ICR7Y29uZmlnLnV1aWR9LCBmb3JtYXQ6ICR7Y29uZmlnLmZvcm1hdH0gZmFpbGVkIWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAvLyDlrZjlgqjnurnnkIbljovnvKnnvJPlrZjkv6Hmga9cclxuICAgICAgICBhd2FpdCBvdXRwdXRKU09OKFRleHR1cmVDb21wcmVzcy5zdG9yZWRDb21wcmVzc0luZm9QYXRoLCBUZXh0dXJlQ29tcHJlc3Muc3RvcmVkQ29tcHJlc3NJbmZvKTtcclxuICAgICAgICBjb25zb2xlLmRlYnVnKGBOdW0gb2Ygc29ydGVkIGltYWdlIGFzc2V0OiAke09iamVjdC5rZXlzKHRhc2tNYXApLmxlbmd0aH1gKTtcclxuICAgICAgICByZXR1cm4gdGFza01hcDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOetm+mAieaVtOeQhuWOi+e8qeS7u+WKoeS4ree8k+WtmOWkseaViOeahOWunumZhemcgOimgeWOi+e8qeeahOS7u+WKoemYn+WIl1xyXG4gICAgICogQHBhcmFtIHRhc2tNYXAgXHJcbiAgICAgKiBAcmV0dXJucyBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBhc3luYyBzb3J0SW1hZ2VUYXNrKHRhc2tNYXA6IFJlY29yZDxzdHJpbmcsIElJbWFnZVRhc2tJbmZvPikge1xyXG4gICAgICAgIGNvbnN0IGNvbXByZXNzUXVldWU6IElDb21wcmVzc0NvbmZpZ1tdID0gW107XHJcbiAgICAgICAgY29uc3QgeyB0ZXh0dXJlRm9ybWF0Q29uZmlncywgZm9ybWF0c0luZm8gfSA9IFRleHR1cmVDb21wcmVzcy5hbGxUZXh0dXJlQ29tcHJlc3NDb25maWc7XHJcbiAgICAgICAgY29uc3QgeyBjdXN0b21Db25maWdzIH0gPSBUZXh0dXJlQ29tcHJlc3MudXNlckNvbXByZXNzQ29uZmlnO1xyXG4gICAgICAgIC8vIOiusOW9leagvOW8j+eahOWOi+e8qeaVsOmHj1xyXG4gICAgICAgIGNvbnN0IGNvbGxlY3RGb3JtYXROdW06IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCB1dWlkIG9mIE9iamVjdC5rZXlzKHRhc2tNYXApKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSB0YXNrTWFwW3V1aWRdO1xyXG4gICAgICAgICAgICBjb25zdCBjb21wcmVzc09wdGlvbnMgPSBpbmZvLmNvbXByZXNzT3B0aW9ucztcclxuICAgICAgICAgICAgbGV0IG1pcG1hcEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBpZiAoaW5mby5oYXNNaXBtYXBzICYmIFRleHR1cmVDb21wcmVzcy5lbmFibGVNaXBNYXBzKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gbWlwbWFwIGZpbGUg6ZyA6KaB57yT5a2Y5py65Yi2566h55CGXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBhd2FpdCBnZW5NaXBtYXBGaWxlcyhpbmZvLnNyYywgYnVpbGRBc3NldExpYnJhcnkuZ2V0QXNzZXRUZW1wRGlyQnlVdWlkKHV1aWQpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWZpbGVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbWlwbWFwRmlsZXMgPSBmaWxlcztcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IubWVzc2FnZSA9IGB7YXNzZXQoJHt1dWlkfSl9YCArIGVycm9yLm1lc3NhZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZm9ybWF0cyA9IE9iamVjdC5rZXlzKGNvbXByZXNzT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGFzc2V0Q3VzdG9tQ29uZmlnczogUmVjb3JkPHN0cmluZywgSUN1c3RvbUNvbmZpZz4gPSB7fTtcclxuICAgICAgICAgICAgZm9ybWF0cy5mb3JFYWNoKChmb3JtYXQpID0+IGN1c3RvbUNvbmZpZ3NbZm9ybWF0XSAmJiAoYXNzZXRDdXN0b21Db25maWdzW2Zvcm1hdF0gPSBjdXN0b21Db25maWdzW2Zvcm1hdF0pKTtcclxuICAgICAgICAgICAgY29uc3QgbmV3Q29tcHJlc3NJbmZvOiBDb21wcmVzc0NhY2hlSW5mbyA9IHsgb3B0aW9uOiB7IG10aW1lOiBpbmZvLm10aW1lLCBzcmM6IGluZm8uc3JjLCBjb21wcmVzc09wdGlvbnMgfSwgbWlwbWFwRmlsZXMsIGN1c3RvbUNvbmZpZ3M6IGFzc2V0Q3VzdG9tQ29uZmlncyB9O1xyXG4gICAgICAgICAgICBjb25zdCBkaXJ0eSA9ICFMb2Rhc2guaXNFcXVhbChUZXh0dXJlQ29tcHJlc3Muc3RvcmVkQ29tcHJlc3NJbmZvW3V1aWRdICYmIFRleHR1cmVDb21wcmVzcy5zdG9yZWRDb21wcmVzc0luZm9bdXVpZF0ub3B0aW9uLCBuZXdDb21wcmVzc0luZm8ub3B0aW9uKTtcclxuICAgICAgICAgICAgaW5mby5kZXN0ID0gW107XHJcbiAgICAgICAgICAgIGluZm8uZGlydHkgPSBkaXJ0eTtcclxuICAgICAgICAgICAgaW5mby5zdWZmaXggPSBbXTtcclxuICAgICAgICAgICAgbGV0IGhhc0NvbXByZXNzQ29uZmlnID0gZmFsc2U7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNvbXByZXNzT3B0aW9ucykuZm9yRWFjaCgoZm9ybWF0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVhbEZvcm1hdCA9IGZvcm1hdDtcclxuICAgICAgICAgICAgICAgIGlmIChUZXh0dXJlQ29tcHJlc3MudXNlckNvbXByZXNzQ29uZmlnLmN1c3RvbUNvbmZpZ3NbZm9ybWF0XSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlYWxGb3JtYXQgPSBUZXh0dXJlQ29tcHJlc3MudXNlckNvbXByZXNzQ29uZmlnLmN1c3RvbUNvbmZpZ3NbZm9ybWF0XS5mb3JtYXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmb3JtYXRUeXBlID0gZm9ybWF0c0luZm9bcmVhbEZvcm1hdF0/LmZvcm1hdFR5cGUhO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmb3JtYXRUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgSW52YWxpZCBmb3JtYXQgJHtmb3JtYXR9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FjaGVEZXN0ID0gam9pbihUZXh0dXJlQ29tcHJlc3MuY29tcHJlc3NDYWNoZURpciwgdXVpZC5zdWJzdHIoMCwgMiksIHV1aWQgKyB0ZXh0dXJlRm9ybWF0Q29uZmlnc1tmb3JtYXRUeXBlXS5zdWZmaXgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudGV4dHVyZUNvbXByZXNzICYmICFkaXJ0eSAmJiBleGlzdHNTeW5jKGNhY2hlRGVzdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbmZvLmRlc3QhLnB1c2goY2FjaGVEZXN0KTtcclxuICAgICAgICAgICAgICAgICAgICBpbmZvLnN1ZmZpeC5wdXNoKGdldFN1ZmZpeChmb3JtYXRzSW5mb1tyZWFsRm9ybWF0XSwgdGV4dHVyZUZvcm1hdENvbmZpZ3NbZm9ybWF0VHlwZV0uc3VmZml4KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgVXNlIGNhY2hlIGNvbXByZXNzIGltYWdlIG9mIHtBc3NldCgke3V1aWR9KX0gKHtsaW5rKCR7Y2FjaGVEZXN0fSl9KWApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluZm8uZGlydHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKFRleHR1cmVDb21wcmVzcy51c2VyQ29tcHJlc3NDb25maWcuY3VzdG9tQ29uZmlnc1tmb3JtYXRdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gW+iHquWumuS5iee6ueeQhuWOi+e8qee7n+iuoV0gMS7mlLbpm4bnu5/orqHmiYDpnIDmlbDmja7vvIjoh6rlrprkuYnphY3nva7ooqvkvb/nlKjmrKHmlbDvvIlcclxuICAgICAgICAgICAgICAgICAgICBpbmNyZWFzZUN1c3RvbUNvbXByZXNzTnVtKFRleHR1cmVDb21wcmVzcy51c2VyQ29tcHJlc3NDb25maWcuY3VzdG9tQ29uZmlnc1tmb3JtYXRdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGhhc0NvbXByZXNzQ29uZmlnID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGNvbXByZXNzUXVldWUucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0LFxyXG4gICAgICAgICAgICAgICAgICAgIHNyYzogaW5mby5zcmMsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzdDogY2FjaGVEZXN0LFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbXByZXNzT3B0aW9uczogY29tcHJlc3NPcHRpb25zW2Zvcm1hdF0sXHJcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tQ29uZmlnOiBjdXN0b21Db25maWdzW2Zvcm1hdF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdXVpZCxcclxuICAgICAgICAgICAgICAgICAgICBtaXBtYXBGaWxlcyxcclxuICAgICAgICAgICAgICAgICAgICBzdWZmaXg6IGdldFN1ZmZpeChmb3JtYXRzSW5mb1tyZWFsRm9ybWF0XSwgdGV4dHVyZUZvcm1hdENvbmZpZ3NbZm9ybWF0VHlwZV0uc3VmZml4KSxcclxuICAgICAgICAgICAgICAgICAgICBmb3JtYXRUeXBlLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjb2xsZWN0Rm9ybWF0TnVtW2Zvcm1hdFR5cGVdID0gKGNvbGxlY3RGb3JtYXROdW1bZm9ybWF0VHlwZV0gfHwgMCkgKyAxO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKGhhc0NvbXByZXNzQ29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb21wcmVzc0Fzc2V0TGVuKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV3Q29tcHJlc3NJbmZvLmRlc3QgPSBpbmZvLmRlc3Q7XHJcbiAgICAgICAgICAgIFRleHR1cmVDb21wcmVzcy5zdG9yZWRDb21wcmVzc0luZm9bdXVpZF0gPSBuZXdDb21wcmVzc0luZm87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoYHNvcnQgY29tcHJlc3MgdGFzayAke0pTT04uc3RyaW5naWZ5KGNvbGxlY3RGb3JtYXROdW0pfWApO1xyXG4gICAgICAgIHJldHVybiBjb21wcmVzc1F1ZXVlO1xyXG4gICAgfVxyXG5cclxuICAgIGV4ZWN1dGVDb21wcmVzc1F1ZXVlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fd2FpdGluZ0NvbXByZXNzUXVldWUuc2l6ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jb21wcmVzc0V4ZWN1dGVJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCxcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiAncHJvZ3Jlc3MnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJ1c3lGb3JtYXRUeXBlOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICBidXN5QXNzZXQ6IG5ldyBTZXQoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICB0b3RhbDogdGhpcy5fd2FpdGluZ0NvbXByZXNzUXVldWUuc2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3M6IDAsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUtcHJvZ3Jlc3MnLCBgc3RhcnQgY29tcHJlc3MgdGFzayAwIC8gJHt0aGlzLl93YWl0aW5nQ29tcHJlc3NRdWV1ZS5zaXplfWApO1xyXG4gICAgICAgICAgICAgICAgLy8g55Sx5LqO6LWE5rqQ5paH5Lu25bm25Y+R5Lya5pyJ5p2D6ZmQ6Zeu6aKY77yM5Y6L57yp5Lu75Yqh6Iez5aSa5bm25Y+R5pWwIDw9IOWOi+e8qeS7u+WKoemHjOeahOaAu+i1hOa6kOaVsOmHj1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9jb21wcmVzc0Fzc2V0TGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0VGFzayA9IHRoaXMuX2dldE5leHRUYXNrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dFRhc2sgJiYgKHRoaXMuX2NvbXByZXNzSW1hZ2UobmV4dFRhc2spLmNhdGNoKChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfZ2V0TmV4dFRhc2soKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIHRoaXMuX3dhaXRpbmdDb21wcmVzc1F1ZXVlLnZhbHVlcygpKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE8g5bCP5LyY5YyW77yM5YW25a6e5Yqg5LqG5qC45b+D5pWw6ZmQ5Yi25ZCO77yM5pyJ5Y+v6IO96YGH5Yiw5LiL5LiA5qyh6I635Y+W5Lu75Yqh5pe25ou/5Yiw5LqG5Zug5Li6IGJ1c3lBc3NldCDlr7zoh7Tlu7blkI7nmoQgc2hhcnAg5Lu75Yqh77yM5q2k5pe25YW25a6e5Y+v5Lul6L+e57ut5ZCv5Yqo5Lik5Liq5Lu75YqhXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9jaGVja1Rhc2tDYW5FeGVjdXRlKHRhc2spKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFzaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBfY2hlY2tUYXNrQ2FuRXhlY3V0ZSh0YXNrQ29uZmlnOiBJQ29tcHJlc3NDb25maWcpIHtcclxuICAgICAgICBjb25zdCB7IGJ1c3lBc3NldCwgYnVzeUZvcm1hdFR5cGUgfSA9IHRoaXMuX2NvbXByZXNzRXhlY3V0ZUluZm8hO1xyXG4gICAgICAgIGlmIChidXN5QXNzZXQuaGFzKHRhc2tDb25maWcudXVpZCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYnVzeUZvcm1hdFR5cGVbdGFza0NvbmZpZy5mb3JtYXRUeXBlXSAmJiAhVGV4dHVyZUNvbXByZXNzLmFsbFRleHR1cmVDb21wcmVzc0NvbmZpZy50ZXh0dXJlRm9ybWF0Q29uZmlnc1t0YXNrQ29uZmlnLmZvcm1hdFR5cGVdLnBhcmFsbGVsaXNtKSB7XHJcbiAgICAgICAgICAgIC8vIOajgOafpeW9k+WJjeagvOW8j+aYr+WQpuaUr+aMgeW5tuihjFxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIF9jb21wcmVzc0ltYWdlKGNvbmZpZzogSUNvbXByZXNzQ29uZmlnKSB7XHJcbiAgICAgICAgY29uc3QgeyBidXN5QXNzZXQsIGJ1c3lGb3JtYXRUeXBlLCB0b3RhbCwgY2hpbGRQcm9jZXNzIH0gPSB0aGlzLl9jb21wcmVzc0V4ZWN1dGVJbmZvITtcclxuICAgICAgICBjb25zdCB1c2VDaGlsZFByb2Nlc3MgPSBUZXh0dXJlQ29tcHJlc3MuYWxsVGV4dHVyZUNvbXByZXNzQ29uZmlnLnRleHR1cmVGb3JtYXRDb25maWdzW2NvbmZpZy5mb3JtYXRUeXBlXS5jaGlsZFByb2Nlc3M7XHJcbiAgICAgICAgaWYgKHVzZUNoaWxkUHJvY2Vzcykge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGRQcm9jZXNzID4gbnVtQ1BVcykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhgJHtjb25maWcuZm9ybWF0VHlwZX0gd2FpdCBmb3IgY2hpbGQgcHJvY2VzcyAke2NoaWxkUHJvY2Vzc31gKTtcclxuICAgICAgICAgICAgICAgIC8vIOi2hei/h+acgOWkp+i/m+eoi+aVsO+8jOmcgOimgeetieW+hVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbXByZXNzRXhlY3V0ZUluZm8hLmNoaWxkUHJvY2VzcysrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgb2xkVmFsdWUgPSBidXN5Rm9ybWF0VHlwZVtjb25maWcuZm9ybWF0VHlwZV07XHJcbiAgICAgICAgaWYgKG9sZFZhbHVlICYmIG9sZFZhbHVlID4gMCkge1xyXG4gICAgICAgICAgICBpZiAoIVRleHR1cmVDb21wcmVzcy5hbGxUZXh0dXJlQ29tcHJlc3NDb25maWcudGV4dHVyZUZvcm1hdENvbmZpZ3NbY29uZmlnLmZvcm1hdFR5cGVdLnBhcmFsbGVsaXNtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnVzeUZvcm1hdFR5cGVbY29uZmlnLmZvcm1hdFR5cGVdID0gKytvbGRWYWx1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBidXN5Rm9ybWF0VHlwZVtjb25maWcuZm9ybWF0VHlwZV0gPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBidXN5QXNzZXQuYWRkKGNvbmZpZy51dWlkKTtcclxuICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZS1wcm9ncmVzcycsIGBleGVjdXRlIGNvbXByZXNzIHRhc2sgJHt0aGlzLl9jb21wcmVzc0V4ZWN1dGVJbmZvIS5jb21wbGV0ZX0vJHt0b3RhbH0sICR7YnVzeUFzc2V0LnNpemV9IGluIHByb2dyZXNzYCk7XHJcbiAgICAgICAgdGhpcy5fd2FpdGluZ0NvbXByZXNzUXVldWUuZGVsZXRlKGNvbmZpZyk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5jb21wcmVzc0ltYWdlQnlDb25maWcoY29uZmlnKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdXNlQ2hpbGRQcm9jZXNzICYmICh0aGlzLl9jb21wcmVzc0V4ZWN1dGVJbmZvIS5jaGlsZFByb2Nlc3MtLSk7XHJcbiAgICAgICAgYnVzeUFzc2V0LmRlbGV0ZShjb25maWcudXVpZCk7XHJcbiAgICAgICAgYnVzeUZvcm1hdFR5cGVbY29uZmlnLmZvcm1hdFR5cGVdID0gLS1idXN5Rm9ybWF0VHlwZVtjb25maWcuZm9ybWF0VHlwZV0hO1xyXG4gICAgICAgIHRoaXMuX2NvbXByZXNzRXhlY3V0ZUluZm8hLmNvbXBsZXRlKys7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5fc3RlcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5qOA5p+l5Y6L57yp5Lu75Yqh5piv5ZCm5bey57uP5a6M5oiQ77yM5aaC5pyq5a6M5oiQ77yM5YiZ57un57ut5omn6KGM5Ymp5LiL55qE5Lu75YqhXHJcbiAgICAgKiBAcmV0dXJucyBcclxuICAgICAqL1xyXG4gICAgYXN5bmMgX3N0ZXAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3dhaXRpbmdDb21wcmVzc1F1ZXVlLnNpemUpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV4dFRhc2sgPSB0aGlzLl9nZXROZXh0VGFzaygpO1xyXG4gICAgICAgICAgICBuZXh0VGFzayAmJiB0aGlzLl9jb21wcmVzc0ltYWdlKG5leHRUYXNrKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g6L+b5YWl5qOA5p+l5Lu75Yqh5piv5ZCm5YWo6YOo5a6M5oiQXHJcbiAgICAgICAgY29uc3QgeyBidXN5QXNzZXQsIHJlc29sdmUgfSA9IHRoaXMuX2NvbXByZXNzRXhlY3V0ZUluZm8hO1xyXG4gICAgICAgIGlmICghYnVzeUFzc2V0LnNpemUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhc3luYyBjdXN0b21Db21wcmVzc0ltYWdlKGNvbXByZXNzUXVldWU6IElDb21wcmVzc0NvbmZpZ1tdLCBpbmZvczogSUJ1aWxkQXNzZXRIYW5kbGVySW5mbykge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5mb3MucGtnTmFtZU9yZGVyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBrZ05hbWUgPSBpbmZvcy5wa2dOYW1lT3JkZXJbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSBpbmZvcy5oYW5kbGVzW3BrZ05hbWVdO1xyXG4gICAgICAgICAgICBpZiAoIWhhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKGBTdGFydCBjdXN0b20gY29tcHJlc3MoJHtwa2dOYW1lfSlgKTtcclxuICAgICAgICAgICAgICAgIC8vIOWunumZhemcgOimgeWOi+e8qeeahOe6ueeQhuS7u+WKoVxyXG4gICAgICAgICAgICAgICAgYXdhaXQgaGFuZGxlcihjb21wcmVzc1F1ZXVlKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgQ3VzdG9tIENvbXByZXNzICgke3BrZ05hbWV9KSBmYWlsZWQhYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgY29tcHJlc3NJbWFnZUJ5Q29uZmlnKG9wdGlvbkl0ZW06IElDb21wcmVzc0NvbmZpZykge1xyXG4gICAgICAgIGNvbnN0IHsgZGVzdCB9ID0gb3B0aW9uSXRlbTtcclxuICAgICAgICBsZXQgc3JjID0gb3B0aW9uSXRlbS5zcmM7XHJcbiAgICAgICAgYXdhaXQgZW5zdXJlRGlyKGRpcm5hbWUoZGVzdCkpO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAob3B0aW9uSXRlbS5jb21wcmVzc09wdGlvbnMucXVhbGl0eSA9PT0gMTAwICYmIGV4dG5hbWUob3B0aW9uSXRlbS5zcmMpLmVuZHNXaXRoKG9wdGlvbkl0ZW0uZm9ybWF0KSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7b3B0aW9uSXRlbS5mb3JtYXR9IHdpdGggcXVhbGl0eSBpcyAxMDAsIHdpbGwgY29weSB0aGUgaW1hZ2UgZnJvbSAke29wdGlvbkl0ZW0uc3JjfSB0byAke29wdGlvbkl0ZW0uZGVzdH1gKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IGNvcHkob3B0aW9uSXRlbS5zcmMsIG9wdGlvbkl0ZW0uZGVzdCwgeyBvdmVyd3JpdGU6IHRydWUgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZXh0bmFtZShzcmMpID09PSAnLndlYnAnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gU2hhcnAoc3JjKTtcclxuICAgICAgICAgICAgc3JjID0gc3JjLnJlcGxhY2UoJ3dlYnAnLCAncG5nJyk7XHJcbiAgICAgICAgICAgIGF3YWl0IGltYWdlLnRvRmlsZShzcmMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY29tcHJlc3NGdW5jOiAoKG9wdGlvbjogSUNvbXByZXNzQ29uZmlnKSA9PiBQcm9taXNlPHZvaWQ+KSB8IHVuZGVmaW5lZDtcclxuICAgICAgICAvLyDoh6rlrprkuYnljovnvKnmtYHnqItcclxuICAgICAgICBpZiAob3B0aW9uSXRlbS5jdXN0b21Db25maWcpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoYHN0YXJ0IGN1c3RvbSBjb21wcmVzcyBjb25maWcgJHtvcHRpb25JdGVtLmZvcm1hdH0oJHtvcHRpb25JdGVtLmN1c3RvbUNvbmZpZyEubmFtZX0pYCk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCBjb21wcmVzc0N1c3RvbUZvcm1hdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4ub3B0aW9uSXRlbSxcclxuICAgICAgICAgICAgICAgICAgICBzcmMsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ0N1c3RvbSBjb21wcmVzcyBjb25maWcnLCBgJHtvcHRpb25JdGVtLmZvcm1hdH0oJHtvcHRpb25JdGVtLmN1c3RvbUNvbmZpZyEubmFtZX0pYCwgJ3N1Y2VzcycpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBDb21wcmVzcyB7YXNzZXQoJHtvcHRpb25JdGVtLnV1aWR9KX0gd2l0aCBjdXN0b20gY29uZmlnIGZhaWxlZCFgKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAvLyDoh6rlrprkuYnnurnnkIbljovnvKnlpLHotKXlkI7vvIzlm57pgIDmiJDpu5jorqTnmoTljovnvKnmoLzlvI9cclxuICAgICAgICAgICAgICAgIGNvbXByZXNzRnVuYyA9IGdldENvbXByZXNzRnVuYyhvcHRpb25JdGVtLmN1c3RvbUNvbmZpZyEuZm9ybWF0KTtcclxuICAgICAgICAgICAgICAgIGlmICghY29tcHJlc3NGdW5jKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBJbnZhbGlkIGZvcm1hdCAke29wdGlvbkl0ZW0uY3VzdG9tQ29uZmlnIS5mb3JtYXR9YCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbXByZXNzRnVuYyA9IGNvbXByZXNzRnVuYyB8fCBnZXRDb21wcmVzc0Z1bmMob3B0aW9uSXRlbS5mb3JtYXQpO1xyXG4gICAgICAgIGlmICghY29tcHJlc3NGdW5jKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgSW52YWxpZCBmb3JtYXQgJHtvcHRpb25JdGVtLmZvcm1hdH1gKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDmraPluLjljovnvKnmtYHnqItcclxuICAgICAgICBhd2FpdCBjb21wcmVzc0Z1bmMoe1xyXG4gICAgICAgICAgICAuLi5vcHRpb25JdGVtLFxyXG4gICAgICAgICAgICBzcmMsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIOS+nei1luesrOS4ieaWueW3peWFt+eahOe6ueeQhuWOi+e8qeagvOW8j+aJjemcgOimgeS+nei1luaehOW7uueUn+aIkFxyXG4gICAgICAgIGlmIChUZXh0dXJlQ29tcHJlc3MuZW5hYmxlTWlwTWFwcykge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBhd2FpdCBjb21wcmVzc01pcG1hcEZpbGVzKHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5vcHRpb25JdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgIHNyYyxcclxuICAgICAgICAgICAgICAgIH0sIGNvbXByZXNzRnVuYyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmlsZXMuc3BsaWNlKDAsIDAsIHJlYWRGaWxlU3luYyhvcHRpb25JdGVtLmRlc3QpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gSW1hZ2VBc3NldC5tZXJnZUNvbXByZXNzZWRUZXh0dXJlTWlwcyhmaWxlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgb3V0cHV0RmlsZShvcHRpb25JdGVtLmRlc3QsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgcmVtb3ZlKG9wdGlvbkl0ZW0uZGVzdCk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBHZW5lcmF0ZSB7YXNzZXQoJHtvcHRpb25JdGVtLnV1aWR9KX0gY29tcHJlc3MgdGV4dHVyZSBtaXBtYXAgZmlsZXMgZmFpbGVkIWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyDms6jmhI/vvJog6ZyA6KaB5L2/55SoIG9wdGlvbkl0ZW0uc3JjIOWIpOaWre+8jHNyYyDlj5jph4/lj6/og73ooqvkv67mlLlcclxuICAgICAgICAgICAgaWYgKGV4dG5hbWUob3B0aW9uSXRlbS5zcmMpLmVuZHNXaXRoKG9wdGlvbkl0ZW0uZm9ybWF0KSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3JjU3RhdGUgPSBhd2FpdCBzdGF0KG9wdGlvbkl0ZW0uc3JjKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRlc3RTdGF0ZSA9IGF3YWl0IHN0YXQob3B0aW9uSXRlbS5kZXN0KTtcclxuICAgICAgICAgICAgICAgIGlmIChkZXN0U3RhdGUuc2l6ZSA+IHNyY1N0YXRlLnNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVGhlIGNvbXByZXNzZWQgaW1hZ2UoJHtvcHRpb25JdGVtLmRlc3R9KSBzaXplKCR7ZGVzdFN0YXRlLnNpemV9KSBpcyBsYXJnZXIgdGhhbiB0aGUgb3JpZ2luYWwgaW1hZ2UoJHtvcHRpb25JdGVtLnNyY30pIHNpemUoJHtzcmNTdGF0ZS5zaXplfSksIGFuZCB0aGUgb3JpZ2luYWwgaW1hZ2Ugd2lsbCBiZSB1c2VkLiBUbyBpZ25vcmUgdGhpcyBwcm90ZWN0aW9uIG1lY2hhbmlzbSwgcGxlYXNlIGNvbmZpZ3VyZSBpdCBpbiBQcm9qZWN0IFNldHRpbmdzIC0+IFRleHR1cmUgQ29tcHJlc3Npb24gQ29uZmlndXJhdGlvbi5gKTtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBjb3B5KG9wdGlvbkl0ZW0uc3JjLCBvcHRpb25JdGVtLmRlc3QsIHsgb3ZlcndyaXRlOiB0cnVlIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJldmlld0NvbXByZXNzSW1hZ2UoYXNzZXRVdWlkOiBzdHJpbmcsIHBsYXRmb3JtID0gJ3dlYi1tb2JpbGUnKSB7XHJcbiAgICBjb25zdCBkZWZhdWx0Q29tcHJlc3NNYW5hZ2VyID0gbmV3IFRleHR1cmVDb21wcmVzcyhwbGF0Zm9ybSwgdHJ1ZSk7XHJcbiAgICBhd2FpdCBkZWZhdWx0Q29tcHJlc3NNYW5hZ2VyLmluaXQoKTtcclxuICAgIGNvbnN0IGFzc2V0SW5mbyA9IGJ1aWxkQXNzZXRMaWJyYXJ5LmdldEFzc2V0KGFzc2V0VXVpZCk7XHJcbiAgICBjb25zdCB0YXNrID0gZGVmYXVsdENvbXByZXNzTWFuYWdlci5hZGRUYXNrV2l0aEFzc2V0SW5mbyhhc3NldEluZm8pO1xyXG4gICAgaWYgKCF0YXNrKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgYXdhaXQgZGVmYXVsdENvbXByZXNzTWFuYWdlci5ydW4oKTtcclxuICAgIHJldHVybiB0YXNrO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcXVlcnlDb21wcmVzc0NhY2hlKHV1aWQ6IHN0cmluZykge1xyXG4gICAgYXdhaXQgVGV4dHVyZUNvbXByZXNzLmluaXRDb21tb25PcHRpb25zKCk7XHJcbiAgICByZXR1cm4gVGV4dHVyZUNvbXByZXNzLnF1ZXJ5VGV4dHVyZUNvbXByZXNzQ2FjaGUodXVpZCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluY3JlYXNlQ3VzdG9tQ29tcHJlc3NOdW0oY29uZmlnOiBJQ3VzdG9tQ29uZmlnKSB7XHJcbiAgICBpZiAoIWNvbmZpZykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICghY29uZmlnLm51bSkge1xyXG4gICAgICAgIGNvbmZpZy5udW0gPSAwO1xyXG4gICAgfVxyXG4gICAgY29uZmlnLm51bSsrO1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHF1ZXJ5QWxsQ29tcHJlc3NDb25maWcoKTogUHJvbWlzZTxBbGxUZXh0dXJlQ29tcHJlc3NDb25maWc+IHtcclxuICAgIGNvbnN0IGN1c3RvbUNvbmZpZzogUmVjb3JkPHN0cmluZywgSUN1c3RvbUNvbmZpZz4gPSBhd2FpdCBidWlsZGVyQ29uZmlnLmdldFByb2plY3QoJ3RleHR1cmVDb21wcmVzc0NvbmZpZy5jdXN0b21Db25maWdzJyk7XHJcbiAgICBjb25zdCBjdXN0b21Gb3JtYXRzOiBSZWNvcmQ8c3RyaW5nLCBJVGV4dHVyZUZvcm1hdEluZm8+ID0ge307XHJcbiAgICBpZiAoY3VzdG9tQ29uZmlnICYmIE9iamVjdC5rZXlzKGN1c3RvbUNvbmZpZykubGVuZ3RoKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBjb25maWcgb2YgT2JqZWN0LnZhbHVlcyhjdXN0b21Db25maWcpKSB7XHJcbiAgICAgICAgICAgIGN1c3RvbUZvcm1hdHNbY29uZmlnLmlkXSA9IHtcclxuICAgICAgICAgICAgICAgIC4uLmZvcm1hdHNJbmZvW2NvbmZpZy5mb3JtYXRdLFxyXG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IGNvbmZpZy5uYW1lLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNvbmZpZy5pZCxcclxuICAgICAgICAgICAgICAgIGN1c3RvbTogdHJ1ZSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBkZWZhdWx0U3VwcG9ydCxcclxuICAgICAgICBjb25maWdHcm91cHMsXHJcbiAgICAgICAgdGV4dHVyZUZvcm1hdENvbmZpZ3MsXHJcbiAgICAgICAgZm9ybWF0c0luZm86IHtcclxuICAgICAgICAgICAgLi4uZm9ybWF0c0luZm8sXHJcbiAgICAgICAgICAgIC4uLmN1c3RvbUZvcm1hdHMsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjdXN0b21Gb3JtYXRzLFxyXG4gICAgICAgIHBsYXRmb3JtQ29uZmlnOiBwbHVnaW5NYW5hZ2VyLmdldFRleHR1cmVQbGF0Zm9ybUNvbmZpZ3MoKSxcclxuICAgIH07XHJcbn0iXX0=