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
exports.compressJpgAndPng = compressJpgAndPng;
exports.compressWebp = compressWebp;
exports.compressPVR = compressPVR;
exports.compressEtc = compressEtc;
exports.compressAstc = compressAstc;
exports.getCompressFunc = getCompressFunc;
exports.compressCustomFormat = compressCustomFormat;
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const Path = __importStar(require("path"));
const utils_1 = require("./utils");
const utils_2 = require("../../utils");
const i18n_1 = __importDefault(require("../../../../../base/i18n"));
const global_1 = require("../../../../../../global");
const utils_3 = __importDefault(require("../../../../../base/utils"));
const builder_config_1 = __importDefault(require("../../../../share/builder-config"));
const Sharp = require('sharp');
/**
 * 压缩 jpg png
 * @param {string} option 参数
 * @param {object} format 图片格式类型以及对应质量
 */
async function compressJpgAndPng(option) {
    return new Promise((resolve, reject) => {
        let img = Sharp(option.src);
        if (option.format === 'png') {
            img = img.png({
                quality: option.compressOptions.quality || 100,
            });
        }
        else {
            img = img.jpeg({
                quality: option.compressOptions.quality || 100,
            });
        }
        // 工具可能不会自动生成输出目录文件夹
        (0, fs_extra_1.ensureDirSync)((0, path_1.dirname)(option.dest));
        img.toFile(option.dest)
            .then(() => {
            resolve();
        })
            .catch((err) => {
            reject(err);
        });
    });
}
/**
 * 压缩 webp 格式图片
 * @param {string} option
 * @param {object} format
 */
async function compressWebp(option) {
    const { src, dest, format, compressOptions } = option;
    // 工具可能不会自动生成输出目录文件夹
    (0, fs_extra_1.ensureDirSync)((0, path_1.dirname)(dest));
    console.debug('start compress webp', src, dest, format);
    let webpTool = Path.join(global_1.GlobalPaths.staticDir, 'tools/libwebp_darwin/bin/cwebp');
    if (process.platform === 'win32') {
        webpTool = Path.join(global_1.GlobalPaths.staticDir, 'libwebp_win32/bin/cwebp.exe');
    }
    const args = [src, '-o', dest, '-q', String(compressOptions.quality), '-quiet', '-exact'];
    console.debug(`webp compress command : ${webpTool} ${args.join(' ')}`);
    await (0, utils_2.quickSpawn)(webpTool, args, {
        prefix: '[compress webp]',
    });
    console.log('compress webp success ' + `{link(${dest})}`);
}
/**
 * 压缩 pvr 类型图片
 * @param {*} option
 * @param {*} format
 */
async function compressPVR(option) {
    console.debug('start compress pvr', option);
    let src = option.src;
    if (option.format.endsWith('rgb_a')) {
        const tempDest = Path.join(builder_config_1.default.projectTempDir, 'builder', 'CompressTexture', 'pvr_alpha', option.uuid + Path.extname(src));
        await createAlphaAtlas(src, tempDest);
        src = tempDest;
    }
    const { dest, format, compressOptions } = option;
    builder_config_1.default;
    // 工具可能不会自动生成输出目录文件夹
    (0, fs_extra_1.ensureDirSync)((0, path_1.dirname)(dest));
    // https://github.com/cocos/cocos-editor/pull/1046
    // PVR 升级的已知问题：ios 上似乎会出现渲染效果异常？？暂不确定
    // https://docs.imgtec.com/tools-manuals/pvrtextool-manual/html/topics/cli/command-line-options.html#encode-format-desc
    let pvrTool = Path.join(global_1.GlobalPaths.staticDir, 'tools/PVRTexTool_darwin/PVRTexToolCLI');
    if (process.platform === 'win32') {
        pvrTool = Path.join(global_1.GlobalPaths.staticDir, 'tools/PVRTexTool_win32/PVRTexToolCLI.exe');
    }
    const compressFormatMap = {
        pvrtc_4bits_rgba: 'PVRTC1_4',
        pvrtc_4bits_rgb: 'PVRTC1_4_RGB',
        pvrtc_4bits_rgb_a: 'PVRTC1_4_RGB',
        pvrtc_2bits_rgba: 'PVRTC1_2',
        pvrtc_2bits_rgb: 'PVRTC1_2_RGB',
        pvrtc_2bits_rgb_a: 'PVRTC1_2_RGB',
    };
    // 根据 option.format 转换格式
    const compressFormat = compressFormatMap[format];
    if (!compressFormat) {
        console.error(`Invalid pvr compress format ${format}`);
        return;
    }
    const quality = 'pvrtc' + compressOptions.quality;
    const pvrOpts = [
        '-i',
        src,
        '-o',
        dest,
        // xx 的扩张方式是采用拉伸的方式对图片进行重置的
        // '-square', '+',
        // '-pot', '+',
        // xxcanvas 的扩张方式是采用留白的方式对图片进行重置的
        // 因为 sprite frame 的 rect 也是按照像素来存储的，所以用留白的方式更友好
        '-squarecanvas',
        '+',
        '-potcanvas',
        '+',
        '-q',
        quality,
        '-f',
        `${compressFormat},UBN,lRGB`,
    ];
    console.debug(`pvrtc compress command :  ${pvrTool} ${pvrOpts.join(' ')}`);
    // 目前 pvrtc 生成图片会默认输出到 stderr 内，需要使用 debug 输出 stderr
    await (0, utils_2.quickSpawn)(pvrTool, pvrOpts, {
        downGradeWaring: true,
        downGradeLog: true,
        // 这个工具的默认输出都在 stderr 里
        ignoreError: true,
        downGradeError: true,
        prefix: '[compress pvrtc]',
    });
    if ((0, fs_extra_1.existsSync)(dest)) {
        console.log('compress pvrtc success ' + `{link(${dest})}`);
    }
    else {
        console.error(i18n_1.default.t('builder.error.texture_compress_failed', {
            type: format,
            asset: `{asset(${option.uuid})}`,
            toolsPath: `{file(${pvrTool})}`,
            toolHomePage: 'https://developer.imaginationtech.com/pvrtextool/',
        }));
    }
}
/**
 * 压缩 etc 类型图片
 * @param option
 * @param format
 */
async function compressEtc(option) {
    const { dest, format, compressOptions, uuid } = option;
    console.debug('start compress etc', option.src, dest, format);
    let src = option.src;
    // 工具可能不会自动生成输出目录文件夹
    (0, fs_extra_1.ensureDirSync)((0, path_1.dirname)(dest));
    if (format.endsWith('rgb_a')) {
        // 理论上同一资源的 alpha 贴图可以复用，且应该走 getAssetTempDirByUuid 使用缓存即可，但由于这个工具需要单独可以走测试例试，所以暂时先不走通用地址
        // 理论上 etc 和 pvr 的 alpha 贴图也可以复用，但由于可能存在并发的权限问题，暂不复用
        // NOTE: 注意，这里的图片名称必须和 dest 保持一致，因为此压缩工具压缩出来的结果无法改变图片名称
        const tempDest = Path.join(builder_config_1.default.projectTempDir, 'builder', 'CompressTexture', 'etc_alpha', uuid, Path.basename(dest, Path.extname(dest)) + Path.extname(src));
        await createAlphaAtlas(src, tempDest);
        src = tempDest;
    }
    let etcTool = Path.join(global_1.GlobalPaths.staticDir, 'tools/mali_darwin/etcpack');
    if (process.platform === 'win32') {
        etcTool = Path.join(global_1.GlobalPaths.staticDir, 'tools/mali_win32/etcpack.exe');
    }
    const toolDir = Path.dirname(etcTool);
    etcTool = '.' + Path.sep + Path.basename(etcTool);
    const compressFormatMap = {
        etc1_rgb: {
            etcFormat: 'etc1',
            compressFormat: 'RGB',
        },
        etc1_rgb_a: {
            etcFormat: 'etc1',
            compressFormat: 'RGB',
        },
        etc2_rgba: {
            etcFormat: 'etc2',
            compressFormat: 'RGBA',
        },
        etc2_rgb: {
            etcFormat: 'etc2',
            compressFormat: 'RGB',
        },
    };
    const { etcFormat, compressFormat } = compressFormatMap[format];
    const args = [Path.normalize(src), Path.dirname(dest), '-c', etcFormat, '-s', compressOptions.quality];
    // windows 中需要进入到 toolDir 去执行命令才能成功
    const cwd = toolDir;
    const env = Object.assign({}, process.env);
    // convert 是 imagemagick 中的一个工具
    // etcpack 中应该是以 'convert' 而不是 './convert' 来调用工具的，所以需要将 toolDir 加到环境变量中
    // toolDir 需要放在前面，以防止系统找到用户自己安装的 imagemagick 版本
    env.PATH = toolDir + ':' + env.PATH;
    const opts = {
        cwd: cwd,
        env: env,
        prefix: '[compress etc]',
    };
    if (etcFormat === 'etc2') {
        args.push('-f', compressFormat);
    }
    console.debug(`etc compress command :  ${etcTool} ${args.join(' ')}`);
    await (0, utils_2.quickSpawn)(etcTool, args, opts);
    if ((0, fs_extra_1.existsSync)(dest)) {
        console.log('compress etc success ' + `{link(${dest})}`);
    }
    else {
        console.error(i18n_1.default.t('builder.error.texture_compress_failed', {
            type: format,
            asset: `{asset(${uuid})}`,
            toolsPath: `{file(${etcTool})}`,
            toolHomePage: 'https://imagemagick.org/script/command-line-processing.php',
        }));
    }
}
/**
 * 压缩 astc 类型图片
 * @param format
 */
async function compressAstc(option) {
    const { src, dest, format, compressOptions } = option;
    console.debug('start compress astc', src, dest, format);
    // 工具可能不会自动生成输出目录文件夹
    (0, fs_extra_1.ensureDirSync)((0, path_1.dirname)(dest));
    // 参考：https://github.com/cocos-creator/3d-tasks/issues/6855
    // https://github.com/ARM-software/astc-encoder
    let astcTool = Path.join(global_1.GlobalPaths.staticDir, 'tools/astc-encoder/astcenc');
    if (process.platform === 'win32') {
        astcTool = Path.join(global_1.GlobalPaths.staticDir, 'tools/astc-encoder/astcenc.exe');
    }
    const compressFormatMap = {
        astc_4x4: '4x4',
        astc_5x5: '5x5',
        astc_6x6: '6x6',
        astc_8x8: '8x8',
        astc_10x5: '10x5',
        astc_10x10: '10x10',
        astc_12x12: '12x12',
    };
    const compressFormat = compressFormatMap[format];
    if (compressOptions.quality === 'veryfast') {
        compressOptions.quality = 'fastest';
    }
    const astcOpts = ['-cl', src, dest, compressFormat, `-${compressOptions.quality}`];
    console.debug(`astc compressed command: ${Path.basename(astcTool)} ${astcOpts.join(' ')}`);
    await (0, utils_2.quickSpawn)(astcTool, astcOpts, {
        prefix: '[compress astc]',
    });
    // 目前有遇到偶现的在机子上生成 astc 失败，但是没有错误输出的情况，需要做一次检查错误提示
    if ((0, fs_extra_1.existsSync)(dest)) {
        console.log('Compress astc success ' + `{link(${dest})}`);
    }
    else {
        console.error(i18n_1.default.t('builder.error.texture_compress_failed', {
            type: format,
            asset: `{asset(${option.uuid})}`,
            toolsPath: `{file(${astcTool})}`,
            toolHomePage: 'https://github.com/ARM-software/astc-encoder',
        }));
    }
}
/**
 * 根据图片类型获取压缩函数
 * @param format
 */
function getCompressFunc(format) {
    const start = format.slice(0, 3);
    switch (start) {
        case 'jpg':
        case 'png':
            return compressJpgAndPng;
        case 'pvr':
            return compressPVR;
        case 'etc':
            return compressEtc;
        case 'web':
            return compressWebp;
        case 'ast':
            return compressAstc;
    }
}
function patchCommand(command, options) {
    return new Function('options', 'with(options){ return String.raw`' + command + '`}')(options);
}
async function compressCustomFormat(config) {
    const { src, dest, compressOptions } = config;
    const { command, path } = config.customConfig;
    const rawPath = utils_3.default.Path.resolveToRaw(path);
    const toolDir = Path.dirname(rawPath);
    const opts = {
        cwd: toolDir,
        prefix: '[custom compress]',
    };
    const newCommand = patchCommand(command, {
        ...compressOptions,
        src,
        dest,
    });
    const params = newCommand.split(' ').filter((val) => !!val);
    console.debug(`custom compress command : ${rawPath} ${newCommand}`);
    await (0, utils_2.quickSpawn)(rawPath, params, opts);
}
// 为 pvr 创建一张 rgb atlas 贴图
// 贴图的上半部分存原图的 rgb 值，下半部存原图的 alpha 值
async function createAlphaAtlas(src, dest) {
    const image = new Sharp(src);
    const metaData = await image.metadata();
    const width = metaData.width;
    const height = metaData.height;
    // pvr 格式需要长宽为 2 的次幂，并且需要为正方形
    // 要正确计算出下半部分的起始值需要提前算好正方形 2 次幂的值
    const resizedWidth = (0, utils_1.roundToPowerOfTwo)(width);
    let resizedHeight = (0, utils_1.roundToPowerOfTwo)(height);
    if (resizedHeight < resizedWidth / 2) {
        resizedHeight = resizedWidth / 2;
    }
    const inputData = await image.raw().toBuffer();
    const channels = 3;
    const rgbPixel = 0x000000;
    const outputSize = width * 2 * resizedHeight * channels;
    const outputData = Buffer.alloc(outputSize, rgbPixel);
    let outputIndex;
    let outputAlphaIndex;
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            // 设置 rgb 值到上半部分
            const index = row * width + col;
            const inputIndex = index * 4;
            outputIndex = index * 3;
            outputData[outputIndex] = inputData[inputIndex];
            outputData[outputIndex + 1] = inputData[inputIndex + 1];
            outputData[outputIndex + 2] = inputData[inputIndex + 2];
            // 设置 alpha 值到下半部分
            outputAlphaIndex = ((row + resizedHeight) * width + col) * 3;
            const alpha = inputIndex + 3;
            outputData[outputAlphaIndex] = inputData[alpha];
            outputData[outputAlphaIndex + 1] = inputData[alpha];
            outputData[outputAlphaIndex + 2] = inputData[alpha];
        }
    }
    const opts = { raw: { width, height: resizedHeight * 2, channels } };
    (0, fs_extra_1.ensureDirSync)(Path.dirname(dest));
    await Sharp(outputData, opts).toFile(dest);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcHJlc3MtdG9vbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb3JlL2J1aWxkZXIvd29ya2VyL2J1aWxkZXIvYXNzZXQtaGFuZGxlci90ZXh0dXJlLWNvbXByZXNzL2NvbXByZXNzLXRvb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkEsOENBc0JDO0FBT0Qsb0NBZUM7QUFPRCxrQ0FnRkM7QUFPRCxrQ0E2RUM7QUFNRCxvQ0ErQ0M7QUFNRCwwQ0FlQztBQU1ELG9EQWtCQztBQTFVRCx1Q0FBcUQ7QUFDckQsK0JBQStCO0FBQy9CLDJDQUE2QjtBQUM3QixtQ0FBNEM7QUFDNUMsdUNBQXlDO0FBQ3pDLG9FQUE0QztBQUU1QyxxREFBdUQ7QUFDdkQsc0VBQThDO0FBQzlDLHNGQUE2RDtBQUM3RCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFL0I7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxNQUF1QjtJQUMzRCxPQUFPLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3pDLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQzFCLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO2dCQUNWLE9BQU8sRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLE9BQU8sSUFBSSxHQUFHO2FBQ2pELENBQUMsQ0FBQztRQUNQLENBQUM7YUFBTSxDQUFDO1lBQ0osR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ1gsT0FBTyxFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsT0FBTyxJQUFJLEdBQUc7YUFDakQsQ0FB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RyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEQsQ0FBQztJQUNMLENBQUM7SUFDRCxNQUFNLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsYUFBYSxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDO0lBQ3JFLElBQUEsd0JBQWEsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbEMsTUFBTSxLQUFLLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhpc3RzU3luYywgZW5zdXJlRGlyU3luYyB9IGZyb20gJ2ZzLWV4dHJhJztcclxuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgKiBhcyBQYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyByb3VuZFRvUG93ZXJPZlR3byB9IGZyb20gJy4vdXRpbHMnO1xyXG5pbXBvcnQgeyBxdWlja1NwYXduIH0gZnJvbSAnLi4vLi4vdXRpbHMnO1xyXG5pbXBvcnQgaTE4biBmcm9tICcuLi8uLi8uLi8uLi8uLi9iYXNlL2kxOG4nO1xyXG5pbXBvcnQgeyBJQ29tcHJlc3NDb25maWcsIElUZXh0dXJlQ29tcHJlc3NUeXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4vQHR5cGVzJztcclxuaW1wb3J0IHsgR2xvYmFsUGF0aHMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi8uLi9nbG9iYWwnO1xyXG5pbXBvcnQgdXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYmFzZS91dGlscyc7XHJcbmltcG9ydCBidWlsZGVyQ29uZmlnIGZyb20gJy4uLy4uLy4uLy4uL3NoYXJlL2J1aWxkZXItY29uZmlnJztcclxuY29uc3QgU2hhcnAgPSByZXF1aXJlKCdzaGFycCcpO1xyXG5cclxuLyoqXHJcbiAqIOWOi+e8qSBqcGcgcG5nXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb24g5Y+C5pWwXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBmb3JtYXQg5Zu+54mH5qC85byP57G75Z6L5Lul5Y+K5a+55bqU6LSo6YePXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29tcHJlc3NKcGdBbmRQbmcob3B0aW9uOiBJQ29tcHJlc3NDb25maWcpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgbGV0IGltZyA9IFNoYXJwKG9wdGlvbi5zcmMpO1xyXG4gICAgICAgIGlmIChvcHRpb24uZm9ybWF0ID09PSAncG5nJykge1xyXG4gICAgICAgICAgICBpbWcgPSBpbWcucG5nKHtcclxuICAgICAgICAgICAgICAgIHF1YWxpdHk6IG9wdGlvbi5jb21wcmVzc09wdGlvbnMucXVhbGl0eSB8fCAxMDAsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGltZyA9IGltZy5qcGVnKHtcclxuICAgICAgICAgICAgICAgIHF1YWxpdHk6IG9wdGlvbi5jb21wcmVzc09wdGlvbnMucXVhbGl0eSB8fCAxMDAsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDlt6Xlhbflj6/og73kuI3kvJroh6rliqjnlJ/miJDovpPlh7rnm67lvZXmlofku7blpLlcclxuICAgICAgICBlbnN1cmVEaXJTeW5jKGRpcm5hbWUob3B0aW9uLmRlc3QpKTtcclxuICAgICAgICBpbWcudG9GaWxlKG9wdGlvbi5kZXN0KVxyXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyOiBFcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDljovnvKkgd2VicCDmoLzlvI/lm77niYdcclxuICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvblxyXG4gKiBAcGFyYW0ge29iamVjdH0gZm9ybWF0XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29tcHJlc3NXZWJwKG9wdGlvbjogSUNvbXByZXNzQ29uZmlnKSB7XHJcbiAgICBjb25zdCB7IHNyYywgZGVzdCwgZm9ybWF0LCBjb21wcmVzc09wdGlvbnMgfSA9IG9wdGlvbjtcclxuICAgIC8vIOW3peWFt+WPr+iDveS4jeS8muiHquWKqOeUn+aIkOi+k+WHuuebruW9leaWh+S7tuWkuVxyXG4gICAgZW5zdXJlRGlyU3luYyhkaXJuYW1lKGRlc3QpKTtcclxuICAgIGNvbnNvbGUuZGVidWcoJ3N0YXJ0IGNvbXByZXNzIHdlYnAnLCBzcmMsIGRlc3QsIGZvcm1hdCk7XHJcbiAgICBsZXQgd2VicFRvb2wgPSBQYXRoLmpvaW4oR2xvYmFsUGF0aHMuc3RhdGljRGlyLCAndG9vbHMvbGlid2VicF9kYXJ3aW4vYmluL2N3ZWJwJyk7XHJcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xyXG4gICAgICAgIHdlYnBUb29sID0gUGF0aC5qb2luKEdsb2JhbFBhdGhzLnN0YXRpY0RpciwgJ2xpYndlYnBfd2luMzIvYmluL2N3ZWJwLmV4ZScpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgYXJncyA9IFtzcmMsICctbycsIGRlc3QsICctcScsIFN0cmluZyhjb21wcmVzc09wdGlvbnMucXVhbGl0eSksICctcXVpZXQnLCAnLWV4YWN0J107XHJcbiAgICBjb25zb2xlLmRlYnVnKGB3ZWJwIGNvbXByZXNzIGNvbW1hbmQgOiAke3dlYnBUb29sfSAke2FyZ3Muam9pbignICcpfWApO1xyXG4gICAgYXdhaXQgcXVpY2tTcGF3bih3ZWJwVG9vbCwgYXJncywge1xyXG4gICAgICAgIHByZWZpeDogJ1tjb21wcmVzcyB3ZWJwXScsXHJcbiAgICB9KTtcclxuICAgIGNvbnNvbGUubG9nKCdjb21wcmVzcyB3ZWJwIHN1Y2Nlc3MgJyArIGB7bGluaygke2Rlc3R9KX1gKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWOi+e8qSBwdnIg57G75Z6L5Zu+54mHXHJcbiAqIEBwYXJhbSB7Kn0gb3B0aW9uXHJcbiAqIEBwYXJhbSB7Kn0gZm9ybWF0XHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29tcHJlc3NQVlIob3B0aW9uOiBJQ29tcHJlc3NDb25maWcpIHtcclxuICAgIGNvbnNvbGUuZGVidWcoJ3N0YXJ0IGNvbXByZXNzIHB2cicsIG9wdGlvbik7XHJcbiAgICBsZXQgc3JjID0gb3B0aW9uLnNyYztcclxuICAgIGlmIChvcHRpb24uZm9ybWF0LmVuZHNXaXRoKCdyZ2JfYScpKSB7XHJcbiAgICAgICAgY29uc3QgdGVtcERlc3QgPSBQYXRoLmpvaW4oYnVpbGRlckNvbmZpZy5wcm9qZWN0VGVtcERpciwgJ2J1aWxkZXInLCAnQ29tcHJlc3NUZXh0dXJlJywgJ3B2cl9hbHBoYScsIG9wdGlvbi51dWlkICsgUGF0aC5leHRuYW1lKHNyYykpO1xyXG4gICAgICAgIGF3YWl0IGNyZWF0ZUFscGhhQXRsYXMoc3JjLCB0ZW1wRGVzdCk7XHJcbiAgICAgICAgc3JjID0gdGVtcERlc3Q7XHJcbiAgICB9XHJcbiAgICBjb25zdCB7IGRlc3QsIGZvcm1hdCwgY29tcHJlc3NPcHRpb25zIH0gPSBvcHRpb247YnVpbGRlckNvbmZpZztcclxuICAgIC8vIOW3peWFt+WPr+iDveS4jeS8muiHquWKqOeUn+aIkOi+k+WHuuebruW9leaWh+S7tuWkuVxyXG4gICAgZW5zdXJlRGlyU3luYyhkaXJuYW1lKGRlc3QpKTtcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9jb2Nvcy9jb2Nvcy1lZGl0b3IvcHVsbC8xMDQ2XHJcbiAgICAvLyBQVlIg5Y2H57qn55qE5bey55+l6Zeu6aKY77yaaW9zIOS4iuS8vOS5juS8muWHuueOsOa4suafk+aViOaenOW8guW4uO+8n++8n+aaguS4jeehruWumlxyXG4gICAgLy8gaHR0cHM6Ly9kb2NzLmltZ3RlYy5jb20vdG9vbHMtbWFudWFscy9wdnJ0ZXh0b29sLW1hbnVhbC9odG1sL3RvcGljcy9jbGkvY29tbWFuZC1saW5lLW9wdGlvbnMuaHRtbCNlbmNvZGUtZm9ybWF0LWRlc2NcclxuICAgIGxldCBwdnJUb29sID0gUGF0aC5qb2luKEdsb2JhbFBhdGhzLnN0YXRpY0RpciwgJ3Rvb2xzL1BWUlRleFRvb2xfZGFyd2luL1BWUlRleFRvb2xDTEknKTtcclxuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XHJcbiAgICAgICAgcHZyVG9vbCA9IFBhdGguam9pbihHbG9iYWxQYXRocy5zdGF0aWNEaXIsICd0b29scy9QVlJUZXhUb29sX3dpbjMyL1BWUlRleFRvb2xDTEkuZXhlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY29tcHJlc3NGb3JtYXRNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgcHZydGNfNGJpdHNfcmdiYTogJ1BWUlRDMV80JyxcclxuICAgICAgICBwdnJ0Y180Yml0c19yZ2I6ICdQVlJUQzFfNF9SR0InLFxyXG4gICAgICAgIHB2cnRjXzRiaXRzX3JnYl9hOiAnUFZSVEMxXzRfUkdCJyxcclxuICAgICAgICBwdnJ0Y18yYml0c19yZ2JhOiAnUFZSVEMxXzInLFxyXG4gICAgICAgIHB2cnRjXzJiaXRzX3JnYjogJ1BWUlRDMV8yX1JHQicsXHJcbiAgICAgICAgcHZydGNfMmJpdHNfcmdiX2E6ICdQVlJUQzFfMl9SR0InLFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyDmoLnmja4gb3B0aW9uLmZvcm1hdCDovazmjaLmoLzlvI9cclxuICAgIGNvbnN0IGNvbXByZXNzRm9ybWF0ID0gY29tcHJlc3NGb3JtYXRNYXBbZm9ybWF0XTtcclxuICAgIGlmICghY29tcHJlc3NGb3JtYXQpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBJbnZhbGlkIHB2ciBjb21wcmVzcyBmb3JtYXQgJHtmb3JtYXR9YCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHF1YWxpdHkgPSAncHZydGMnICsgY29tcHJlc3NPcHRpb25zLnF1YWxpdHk7XHJcbiAgICBjb25zdCBwdnJPcHRzID0gW1xyXG4gICAgICAgICctaScsXHJcbiAgICAgICAgc3JjLFxyXG4gICAgICAgICctbycsXHJcbiAgICAgICAgZGVzdCxcclxuXHJcbiAgICAgICAgLy8geHgg55qE5omp5byg5pa55byP5piv6YeH55So5ouJ5Ly455qE5pa55byP5a+55Zu+54mH6L+b6KGM6YeN572u55qEXHJcbiAgICAgICAgLy8gJy1zcXVhcmUnLCAnKycsXHJcbiAgICAgICAgLy8gJy1wb3QnLCAnKycsXHJcblxyXG4gICAgICAgIC8vIHh4Y2FudmFzIOeahOaJqeW8oOaWueW8j+aYr+mHh+eUqOeVmeeZveeahOaWueW8j+WvueWbvueJh+i/m+ihjOmHjee9rueahFxyXG4gICAgICAgIC8vIOWboOS4uiBzcHJpdGUgZnJhbWUg55qEIHJlY3Qg5Lmf5piv5oyJ54Wn5YOP57Sg5p2l5a2Y5YKo55qE77yM5omA5Lul55So55WZ55m955qE5pa55byP5pu05Y+L5aW9XHJcbiAgICAgICAgJy1zcXVhcmVjYW52YXMnLFxyXG4gICAgICAgICcrJyxcclxuICAgICAgICAnLXBvdGNhbnZhcycsXHJcbiAgICAgICAgJysnLFxyXG5cclxuICAgICAgICAnLXEnLFxyXG4gICAgICAgIHF1YWxpdHksXHJcbiAgICAgICAgJy1mJyxcclxuICAgICAgICBgJHtjb21wcmVzc0Zvcm1hdH0sVUJOLGxSR0JgLFxyXG4gICAgXTtcclxuXHJcbiAgICBjb25zb2xlLmRlYnVnKGBwdnJ0YyBjb21wcmVzcyBjb21tYW5kIDogICR7cHZyVG9vbH0gJHtwdnJPcHRzLmpvaW4oJyAnKX1gKTtcclxuXHJcbiAgICAvLyDnm67liY0gcHZydGMg55Sf5oiQ5Zu+54mH5Lya6buY6K6k6L6T5Ye65YiwIHN0ZGVyciDlhoXvvIzpnIDopoHkvb/nlKggZGVidWcg6L6T5Ye6IHN0ZGVyclxyXG4gICAgYXdhaXQgcXVpY2tTcGF3bihwdnJUb29sLCBwdnJPcHRzLCB7XHJcbiAgICAgICAgZG93bkdyYWRlV2FyaW5nOiB0cnVlLFxyXG4gICAgICAgIGRvd25HcmFkZUxvZzogdHJ1ZSxcclxuICAgICAgICAvLyDov5nkuKrlt6XlhbfnmoTpu5jorqTovpPlh7rpg73lnKggc3RkZXJyIOmHjFxyXG4gICAgICAgIGlnbm9yZUVycm9yOiB0cnVlLFxyXG4gICAgICAgIGRvd25HcmFkZUVycm9yOiB0cnVlLFxyXG4gICAgICAgIHByZWZpeDogJ1tjb21wcmVzcyBwdnJ0Y10nLFxyXG4gICAgfSk7XHJcbiAgICBpZiAoZXhpc3RzU3luYyhkZXN0KSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdjb21wcmVzcyBwdnJ0YyBzdWNjZXNzICcgKyBge2xpbmsoJHtkZXN0fSl9YCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoaTE4bi50KCdidWlsZGVyLmVycm9yLnRleHR1cmVfY29tcHJlc3NfZmFpbGVkJywge1xyXG4gICAgICAgICAgICB0eXBlOiBmb3JtYXQsXHJcbiAgICAgICAgICAgIGFzc2V0OiBge2Fzc2V0KCR7b3B0aW9uLnV1aWR9KX1gLFxyXG4gICAgICAgICAgICB0b29sc1BhdGg6IGB7ZmlsZSgke3B2clRvb2x9KX1gLFxyXG4gICAgICAgICAgICB0b29sSG9tZVBhZ2U6ICdodHRwczovL2RldmVsb3Blci5pbWFnaW5hdGlvbnRlY2guY29tL3B2cnRleHRvb2wvJyxcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDljovnvKkgZXRjIOexu+Wei+WbvueJh1xyXG4gKiBAcGFyYW0gb3B0aW9uXHJcbiAqIEBwYXJhbSBmb3JtYXRcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21wcmVzc0V0YyhvcHRpb246IElDb21wcmVzc0NvbmZpZykge1xyXG4gICAgY29uc3QgeyBkZXN0LCBmb3JtYXQsIGNvbXByZXNzT3B0aW9ucywgdXVpZCB9ID0gb3B0aW9uO1xyXG4gICAgY29uc29sZS5kZWJ1Zygnc3RhcnQgY29tcHJlc3MgZXRjJywgb3B0aW9uLnNyYywgZGVzdCwgZm9ybWF0KTtcclxuICAgIGxldCBzcmMgPSBvcHRpb24uc3JjO1xyXG4gICAgLy8g5bel5YW35Y+v6IO95LiN5Lya6Ieq5Yqo55Sf5oiQ6L6T5Ye655uu5b2V5paH5Lu25aS5XHJcbiAgICBlbnN1cmVEaXJTeW5jKGRpcm5hbWUoZGVzdCkpO1xyXG4gICAgaWYgKGZvcm1hdC5lbmRzV2l0aCgncmdiX2EnKSkge1xyXG4gICAgICAgIC8vIOeQhuiuuuS4iuWQjOS4gOi1hOa6kOeahCBhbHBoYSDotLTlm77lj6/ku6XlpI3nlKjvvIzkuJTlupTor6XotbAgZ2V0QXNzZXRUZW1wRGlyQnlVdWlkIOS9v+eUqOe8k+WtmOWNs+WPr++8jOS9hueUseS6jui/meS4quW3peWFt+mcgOimgeWNleeLrOWPr+S7pei1sOa1i+ivleS+i+ivle+8jOaJgOS7peaaguaXtuWFiOS4jei1sOmAmueUqOWcsOWdgFxyXG4gICAgICAgIC8vIOeQhuiuuuS4iiBldGMg5ZKMIHB2ciDnmoQgYWxwaGEg6LS05Zu+5Lmf5Y+v5Lul5aSN55So77yM5L2G55Sx5LqO5Y+v6IO95a2Y5Zyo5bm25Y+R55qE5p2D6ZmQ6Zeu6aKY77yM5pqC5LiN5aSN55SoXHJcbiAgICAgICAgLy8gTk9URTog5rOo5oSP77yM6L+Z6YeM55qE5Zu+54mH5ZCN56ew5b+F6aG75ZKMIGRlc3Qg5L+d5oyB5LiA6Ie077yM5Zug5Li65q2k5Y6L57yp5bel5YW35Y6L57yp5Ye65p2l55qE57uT5p6c5peg5rOV5pS55Y+Y5Zu+54mH5ZCN56ewXHJcbiAgICAgICAgY29uc3QgdGVtcERlc3QgPSBQYXRoLmpvaW4oYnVpbGRlckNvbmZpZy5wcm9qZWN0VGVtcERpciwgJ2J1aWxkZXInLCAnQ29tcHJlc3NUZXh0dXJlJywgJ2V0Y19hbHBoYScsIHV1aWQsIFBhdGguYmFzZW5hbWUoZGVzdCwgUGF0aC5leHRuYW1lKGRlc3QpKSArIFBhdGguZXh0bmFtZShzcmMpKTtcclxuICAgICAgICBhd2FpdCBjcmVhdGVBbHBoYUF0bGFzKHNyYywgdGVtcERlc3QpO1xyXG4gICAgICAgIHNyYyA9IHRlbXBEZXN0O1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBldGNUb29sID0gUGF0aC5qb2luKEdsb2JhbFBhdGhzLnN0YXRpY0RpciwgJ3Rvb2xzL21hbGlfZGFyd2luL2V0Y3BhY2snKTtcclxuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKSB7XHJcbiAgICAgICAgZXRjVG9vbCA9IFBhdGguam9pbihHbG9iYWxQYXRocy5zdGF0aWNEaXIsICd0b29scy9tYWxpX3dpbjMyL2V0Y3BhY2suZXhlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdG9vbERpciA9IFBhdGguZGlybmFtZShldGNUb29sKTtcclxuICAgIGV0Y1Rvb2wgPSAnLicgKyBQYXRoLnNlcCArIFBhdGguYmFzZW5hbWUoZXRjVG9vbCk7XHJcblxyXG4gICAgY29uc3QgY29tcHJlc3NGb3JtYXRNYXA6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7XHJcbiAgICAgICAgZXRjMV9yZ2I6IHtcclxuICAgICAgICAgICAgZXRjRm9ybWF0OiAnZXRjMScsXHJcbiAgICAgICAgICAgIGNvbXByZXNzRm9ybWF0OiAnUkdCJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV0YzFfcmdiX2E6IHtcclxuICAgICAgICAgICAgZXRjRm9ybWF0OiAnZXRjMScsXHJcbiAgICAgICAgICAgIGNvbXByZXNzRm9ybWF0OiAnUkdCJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV0YzJfcmdiYToge1xyXG4gICAgICAgICAgICBldGNGb3JtYXQ6ICdldGMyJyxcclxuICAgICAgICAgICAgY29tcHJlc3NGb3JtYXQ6ICdSR0JBJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV0YzJfcmdiOiB7XHJcbiAgICAgICAgICAgIGV0Y0Zvcm1hdDogJ2V0YzInLFxyXG4gICAgICAgICAgICBjb21wcmVzc0Zvcm1hdDogJ1JHQicsXHJcbiAgICAgICAgfSxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgeyBldGNGb3JtYXQsIGNvbXByZXNzRm9ybWF0IH0gPSBjb21wcmVzc0Zvcm1hdE1hcFtmb3JtYXRdO1xyXG5cclxuICAgIGNvbnN0IGFyZ3MgPSBbUGF0aC5ub3JtYWxpemUoc3JjKSwgUGF0aC5kaXJuYW1lKGRlc3QpLCAnLWMnLCBldGNGb3JtYXQsICctcycsIGNvbXByZXNzT3B0aW9ucy5xdWFsaXR5XTtcclxuXHJcbiAgICAvLyB3aW5kb3dzIOS4remcgOimgei/m+WFpeWIsCB0b29sRGlyIOWOu+aJp+ihjOWRveS7pOaJjeiDveaIkOWKn1xyXG4gICAgY29uc3QgY3dkID0gdG9vbERpcjtcclxuXHJcbiAgICBjb25zdCBlbnYgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9jZXNzLmVudik7XHJcbiAgICAvLyBjb252ZXJ0IOaYryBpbWFnZW1hZ2ljayDkuK3nmoTkuIDkuKrlt6XlhbdcclxuICAgIC8vIGV0Y3BhY2sg5Lit5bqU6K+l5piv5LulICdjb252ZXJ0JyDogIzkuI3mmK8gJy4vY29udmVydCcg5p2l6LCD55So5bel5YW355qE77yM5omA5Lul6ZyA6KaB5bCGIHRvb2xEaXIg5Yqg5Yiw546v5aKD5Y+Y6YeP5LitXHJcbiAgICAvLyB0b29sRGlyIOmcgOimgeaUvuWcqOWJjemdou+8jOS7pemYsuatouezu+e7n+aJvuWIsOeUqOaIt+iHquW3seWuieijheeahCBpbWFnZW1hZ2ljayDniYjmnKxcclxuICAgIGVudi5QQVRIID0gdG9vbERpciArICc6JyArIGVudi5QQVRIO1xyXG5cclxuICAgIGNvbnN0IG9wdHMgPSB7XHJcbiAgICAgICAgY3dkOiBjd2QsXHJcbiAgICAgICAgZW52OiBlbnYsXHJcbiAgICAgICAgcHJlZml4OiAnW2NvbXByZXNzIGV0Y10nLFxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoZXRjRm9ybWF0ID09PSAnZXRjMicpIHtcclxuICAgICAgICBhcmdzLnB1c2goJy1mJywgY29tcHJlc3NGb3JtYXQpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnNvbGUuZGVidWcoYGV0YyBjb21wcmVzcyBjb21tYW5kIDogICR7ZXRjVG9vbH0gJHthcmdzLmpvaW4oJyAnKX1gKTtcclxuICAgIGF3YWl0IHF1aWNrU3Bhd24oZXRjVG9vbCwgYXJncywgb3B0cyk7XHJcbiAgICBpZiAoZXhpc3RzU3luYyhkZXN0KSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdjb21wcmVzcyBldGMgc3VjY2VzcyAnICsgYHtsaW5rKCR7ZGVzdH0pfWApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGkxOG4udCgnYnVpbGRlci5lcnJvci50ZXh0dXJlX2NvbXByZXNzX2ZhaWxlZCcsIHtcclxuICAgICAgICAgICAgdHlwZTogZm9ybWF0LFxyXG4gICAgICAgICAgICBhc3NldDogYHthc3NldCgke3V1aWR9KX1gLFxyXG4gICAgICAgICAgICB0b29sc1BhdGg6IGB7ZmlsZSgke2V0Y1Rvb2x9KX1gLFxyXG4gICAgICAgICAgICB0b29sSG9tZVBhZ2U6ICdodHRwczovL2ltYWdlbWFnaWNrLm9yZy9zY3JpcHQvY29tbWFuZC1saW5lLXByb2Nlc3NpbmcucGhwJyxcclxuICAgICAgICB9KSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDljovnvKkgYXN0YyDnsbvlnovlm77niYdcclxuICogQHBhcmFtIGZvcm1hdFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbXByZXNzQXN0YyhvcHRpb246IElDb21wcmVzc0NvbmZpZykge1xyXG5cclxuICAgIGNvbnN0IHsgc3JjLCBkZXN0LCBmb3JtYXQsIGNvbXByZXNzT3B0aW9ucyB9ID0gb3B0aW9uO1xyXG4gICAgY29uc29sZS5kZWJ1Zygnc3RhcnQgY29tcHJlc3MgYXN0YycsIHNyYywgZGVzdCwgZm9ybWF0KTtcclxuICAgIC8vIOW3peWFt+WPr+iDveS4jeS8muiHquWKqOeUn+aIkOi+k+WHuuebruW9leaWh+S7tuWkuVxyXG4gICAgZW5zdXJlRGlyU3luYyhkaXJuYW1lKGRlc3QpKTtcclxuICAgIC8vIOWPguiAg++8mmh0dHBzOi8vZ2l0aHViLmNvbS9jb2Nvcy1jcmVhdG9yLzNkLXRhc2tzL2lzc3Vlcy82ODU1XHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vQVJNLXNvZnR3YXJlL2FzdGMtZW5jb2RlclxyXG4gICAgbGV0IGFzdGNUb29sID0gUGF0aC5qb2luKEdsb2JhbFBhdGhzLnN0YXRpY0RpciwgJ3Rvb2xzL2FzdGMtZW5jb2Rlci9hc3RjZW5jJyk7XHJcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xyXG4gICAgICAgIGFzdGNUb29sID0gUGF0aC5qb2luKEdsb2JhbFBhdGhzLnN0YXRpY0RpciwgJ3Rvb2xzL2FzdGMtZW5jb2Rlci9hc3RjZW5jLmV4ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvbXByZXNzRm9ybWF0TWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgIGFzdGNfNHg0OiAnNHg0JyxcclxuICAgICAgICBhc3RjXzV4NTogJzV4NScsXHJcbiAgICAgICAgYXN0Y182eDY6ICc2eDYnLFxyXG4gICAgICAgIGFzdGNfOHg4OiAnOHg4JyxcclxuICAgICAgICBhc3RjXzEweDU6ICcxMHg1JyxcclxuICAgICAgICBhc3RjXzEweDEwOiAnMTB4MTAnLFxyXG4gICAgICAgIGFzdGNfMTJ4MTI6ICcxMngxMicsXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGNvbXByZXNzRm9ybWF0ID0gY29tcHJlc3NGb3JtYXRNYXBbZm9ybWF0XTtcclxuXHJcbiAgICBpZiAoY29tcHJlc3NPcHRpb25zLnF1YWxpdHkgPT09ICd2ZXJ5ZmFzdCcpIHtcclxuICAgICAgICBjb21wcmVzc09wdGlvbnMucXVhbGl0eSA9ICdmYXN0ZXN0JztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhc3RjT3B0cyA9IFsnLWNsJywgc3JjLCBkZXN0LCBjb21wcmVzc0Zvcm1hdCwgYC0ke2NvbXByZXNzT3B0aW9ucy5xdWFsaXR5fWBdO1xyXG5cclxuICAgIGNvbnNvbGUuZGVidWcoYGFzdGMgY29tcHJlc3NlZCBjb21tYW5kOiAke1BhdGguYmFzZW5hbWUoYXN0Y1Rvb2wpfSAke2FzdGNPcHRzLmpvaW4oJyAnKX1gKTtcclxuXHJcbiAgICBhd2FpdCBxdWlja1NwYXduKGFzdGNUb29sLCBhc3RjT3B0cywge1xyXG4gICAgICAgIHByZWZpeDogJ1tjb21wcmVzcyBhc3RjXScsXHJcbiAgICB9KTtcclxuICAgIC8vIOebruWJjeaciemBh+WIsOWBtueOsOeahOWcqOacuuWtkOS4iueUn+aIkCBhc3RjIOWksei0pe+8jOS9huaYr+ayoeaciemUmeivr+i+k+WHuueahOaDheWGte+8jOmcgOimgeWBmuS4gOasoeajgOafpemUmeivr+aPkOekulxyXG4gICAgaWYgKGV4aXN0c1N5bmMoZGVzdCkpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnQ29tcHJlc3MgYXN0YyBzdWNjZXNzICcgKyBge2xpbmsoJHtkZXN0fSl9YCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoaTE4bi50KCdidWlsZGVyLmVycm9yLnRleHR1cmVfY29tcHJlc3NfZmFpbGVkJywge1xyXG4gICAgICAgICAgICB0eXBlOiBmb3JtYXQsXHJcbiAgICAgICAgICAgIGFzc2V0OiBge2Fzc2V0KCR7b3B0aW9uLnV1aWR9KX1gLFxyXG4gICAgICAgICAgICB0b29sc1BhdGg6IGB7ZmlsZSgke2FzdGNUb29sfSl9YCxcclxuICAgICAgICAgICAgdG9vbEhvbWVQYWdlOiAnaHR0cHM6Ly9naXRodWIuY29tL0FSTS1zb2Z0d2FyZS9hc3RjLWVuY29kZXInLFxyXG4gICAgICAgIH0pKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIOagueaNruWbvueJh+exu+Wei+iOt+WPluWOi+e8qeWHveaVsFxyXG4gKiBAcGFyYW0gZm9ybWF0XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcHJlc3NGdW5jKGZvcm1hdDogSVRleHR1cmVDb21wcmVzc1R5cGUpIHtcclxuICAgIGNvbnN0IHN0YXJ0ID0gZm9ybWF0LnNsaWNlKDAsIDMpO1xyXG4gICAgc3dpdGNoIChzdGFydCkge1xyXG4gICAgICAgIGNhc2UgJ2pwZyc6XHJcbiAgICAgICAgY2FzZSAncG5nJzpcclxuICAgICAgICAgICAgcmV0dXJuIGNvbXByZXNzSnBnQW5kUG5nO1xyXG4gICAgICAgIGNhc2UgJ3B2cic6XHJcbiAgICAgICAgICAgIHJldHVybiBjb21wcmVzc1BWUjtcclxuICAgICAgICBjYXNlICdldGMnOlxyXG4gICAgICAgICAgICByZXR1cm4gY29tcHJlc3NFdGM7XHJcbiAgICAgICAgY2FzZSAnd2ViJzpcclxuICAgICAgICAgICAgcmV0dXJuIGNvbXByZXNzV2VicDtcclxuICAgICAgICBjYXNlICdhc3QnOlxyXG4gICAgICAgICAgICByZXR1cm4gY29tcHJlc3NBc3RjO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBwYXRjaENvbW1hbmQoY29tbWFuZDogc3RyaW5nLCBvcHRpb25zOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIG5ldyBGdW5jdGlvbignb3B0aW9ucycsICd3aXRoKG9wdGlvbnMpeyByZXR1cm4gU3RyaW5nLnJhd2AnICsgY29tbWFuZCArICdgfScpKG9wdGlvbnMpO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29tcHJlc3NDdXN0b21Gb3JtYXQoY29uZmlnOiBJQ29tcHJlc3NDb25maWcpIHtcclxuICAgIGNvbnN0IHsgc3JjLCBkZXN0LCBjb21wcmVzc09wdGlvbnMgfSA9IGNvbmZpZztcclxuICAgIGNvbnN0IHsgY29tbWFuZCwgcGF0aCB9ID0gY29uZmlnLmN1c3RvbUNvbmZpZyE7XHJcbiAgICBjb25zdCByYXdQYXRoID0gdXRpbHMuUGF0aC5yZXNvbHZlVG9SYXcocGF0aCk7XHJcbiAgICBjb25zdCB0b29sRGlyID0gUGF0aC5kaXJuYW1lKHJhd1BhdGgpO1xyXG4gICAgY29uc3Qgb3B0cyA9IHtcclxuICAgICAgICBjd2Q6IHRvb2xEaXIsXHJcbiAgICAgICAgcHJlZml4OiAnW2N1c3RvbSBjb21wcmVzc10nLFxyXG4gICAgfTtcclxuICAgIGNvbnN0IG5ld0NvbW1hbmQgPSBwYXRjaENvbW1hbmQoY29tbWFuZCwge1xyXG4gICAgICAgIC4uLmNvbXByZXNzT3B0aW9ucyxcclxuICAgICAgICBzcmMsXHJcbiAgICAgICAgZGVzdCxcclxuICAgIH0pO1xyXG4gICAgY29uc3QgcGFyYW1zID0gbmV3Q29tbWFuZC5zcGxpdCgnICcpLmZpbHRlcigodmFsKSA9PiAhIXZhbCk7XHJcbiAgICBjb25zb2xlLmRlYnVnKGBjdXN0b20gY29tcHJlc3MgY29tbWFuZCA6ICR7cmF3UGF0aH0gJHtuZXdDb21tYW5kfWApO1xyXG4gICAgYXdhaXQgcXVpY2tTcGF3bihyYXdQYXRoLCBwYXJhbXMsIG9wdHMpO1xyXG5cclxufVxyXG5cclxuLy8g5Li6IHB2ciDliJvlu7rkuIDlvKAgcmdiIGF0bGFzIOi0tOWbvlxyXG4vLyDotLTlm77nmoTkuIrljYrpg6jliIblrZjljp/lm77nmoQgcmdiIOWAvO+8jOS4i+WNiumDqOWtmOWOn+WbvueahCBhbHBoYSDlgLxcclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlQWxwaGFBdGxhcyhzcmM6IHN0cmluZywgZGVzdDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBpbWFnZSA9IG5ldyBTaGFycChzcmMpO1xyXG4gICAgY29uc3QgbWV0YURhdGEgPSBhd2FpdCBpbWFnZS5tZXRhZGF0YSgpO1xyXG4gICAgY29uc3Qgd2lkdGggPSBtZXRhRGF0YS53aWR0aDtcclxuICAgIGNvbnN0IGhlaWdodCA9IG1ldGFEYXRhLmhlaWdodDtcclxuXHJcbiAgICAvLyBwdnIg5qC85byP6ZyA6KaB6ZW/5a695Li6IDIg55qE5qyh5bmC77yM5bm25LiU6ZyA6KaB5Li65q2j5pa55b2iXHJcbiAgICAvLyDopoHmraPnoa7orqHnrpflh7rkuIvljYrpg6jliIbnmoTotbflp4vlgLzpnIDopoHmj5DliY3nrpflpb3mraPmlrnlvaIgMiDmrKHluYLnmoTlgLxcclxuICAgIGNvbnN0IHJlc2l6ZWRXaWR0aCA9IHJvdW5kVG9Qb3dlck9mVHdvKHdpZHRoKTtcclxuICAgIGxldCByZXNpemVkSGVpZ2h0ID0gcm91bmRUb1Bvd2VyT2ZUd28oaGVpZ2h0KTtcclxuXHJcbiAgICBpZiAocmVzaXplZEhlaWdodCA8IHJlc2l6ZWRXaWR0aCAvIDIpIHtcclxuICAgICAgICByZXNpemVkSGVpZ2h0ID0gcmVzaXplZFdpZHRoIC8gMjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpbnB1dERhdGEgPSBhd2FpdCBpbWFnZS5yYXcoKS50b0J1ZmZlcigpO1xyXG4gICAgY29uc3QgY2hhbm5lbHMgPSAzO1xyXG4gICAgY29uc3QgcmdiUGl4ZWwgPSAweDAwMDAwMDtcclxuICAgIGNvbnN0IG91dHB1dFNpemUgPSB3aWR0aCAqIDIgKiByZXNpemVkSGVpZ2h0ICogY2hhbm5lbHM7XHJcbiAgICBjb25zdCBvdXRwdXREYXRhID0gQnVmZmVyLmFsbG9jKG91dHB1dFNpemUsIHJnYlBpeGVsKTtcclxuXHJcbiAgICBsZXQgb3V0cHV0SW5kZXg7XHJcbiAgICBsZXQgb3V0cHV0QWxwaGFJbmRleDtcclxuICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IGhlaWdodDsgcm93KyspIHtcclxuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCB3aWR0aDsgY29sKyspIHtcclxuICAgICAgICAgICAgLy8g6K6+572uIHJnYiDlgLzliLDkuIrljYrpg6jliIZcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByb3cgKiB3aWR0aCArIGNvbDtcclxuICAgICAgICAgICAgY29uc3QgaW5wdXRJbmRleCA9IGluZGV4ICogNDtcclxuICAgICAgICAgICAgb3V0cHV0SW5kZXggPSBpbmRleCAqIDM7XHJcbiAgICAgICAgICAgIG91dHB1dERhdGFbb3V0cHV0SW5kZXhdID0gaW5wdXREYXRhW2lucHV0SW5kZXhdO1xyXG4gICAgICAgICAgICBvdXRwdXREYXRhW291dHB1dEluZGV4ICsgMV0gPSBpbnB1dERhdGFbaW5wdXRJbmRleCArIDFdO1xyXG4gICAgICAgICAgICBvdXRwdXREYXRhW291dHB1dEluZGV4ICsgMl0gPSBpbnB1dERhdGFbaW5wdXRJbmRleCArIDJdO1xyXG5cclxuICAgICAgICAgICAgLy8g6K6+572uIGFscGhhIOWAvOWIsOS4i+WNiumDqOWIhlxyXG4gICAgICAgICAgICBvdXRwdXRBbHBoYUluZGV4ID0gKChyb3cgKyByZXNpemVkSGVpZ2h0KSAqIHdpZHRoICsgY29sKSAqIDM7XHJcbiAgICAgICAgICAgIGNvbnN0IGFscGhhID0gaW5wdXRJbmRleCArIDM7XHJcbiAgICAgICAgICAgIG91dHB1dERhdGFbb3V0cHV0QWxwaGFJbmRleF0gPSBpbnB1dERhdGFbYWxwaGFdO1xyXG4gICAgICAgICAgICBvdXRwdXREYXRhW291dHB1dEFscGhhSW5kZXggKyAxXSA9IGlucHV0RGF0YVthbHBoYV07XHJcbiAgICAgICAgICAgIG91dHB1dERhdGFbb3V0cHV0QWxwaGFJbmRleCArIDJdID0gaW5wdXREYXRhW2FscGhhXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCBvcHRzID0geyByYXc6IHsgd2lkdGgsIGhlaWdodDogcmVzaXplZEhlaWdodCAqIDIsIGNoYW5uZWxzIH0gfTtcclxuICAgIGVuc3VyZURpclN5bmMoUGF0aC5kaXJuYW1lKGRlc3QpKTtcclxuICAgIGF3YWl0IFNoYXJwKG91dHB1dERhdGEsIG9wdHMpLnRvRmlsZShkZXN0KTtcclxufVxyXG4iXX0=