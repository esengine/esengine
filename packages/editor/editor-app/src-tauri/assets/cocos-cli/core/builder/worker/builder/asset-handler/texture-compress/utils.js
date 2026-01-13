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
exports.changeSuffix = changeSuffix;
exports.getSuffix = getSuffix;
exports.changeInfoToLabel = changeInfoToLabel;
exports.roundToPowerOfTwo = roundToPowerOfTwo;
exports.checkCompressOptions = checkCompressOptions;
const Path = __importStar(require("path"));
const i18n_1 = __importDefault(require("../../../../../base/i18n"));
function changeSuffix(path, suffix) {
    return Path.join(Path.dirname(path), Path.basename(path, Path.extname(path)) + suffix);
}
function getSuffix(formatInfo, suffix) {
    const PixelFormat = cc.Texture2D.PixelFormat;
    if (formatInfo.formatSuffix && PixelFormat[formatInfo.formatSuffix]) {
        suffix += `@${PixelFormat[formatInfo.formatSuffix]}`;
    }
    return suffix;
}
// 谷歌统计的通用数据格式
function changeInfoToLabel(info) {
    return Object.keys(info).map((key) => `${key}:${info[key]}`).join(',');
}
function roundToPowerOfTwo(value) {
    let powers = 2;
    while (value > powers) {
        powers *= 2;
    }
    return powers;
}
/**
 * 根据当前图片是否带有透明通道过滤掉同类型的不推荐的格式
 * 如果同类型图片只有一种配置，则不作过滤处理
 * @param compressOptions
 * @param hasAlpha
 */
function checkCompressOptions(compressOptions, hasAlpha, uuid) {
    const etcArr = Object.keys(compressOptions).filter((format) => format.startsWith('etc'));
    const pvrArr = Object.keys(compressOptions).filter((format) => format.startsWith('pvr'));
    if (etcArr.length > 1) {
        const invalidFormats = etcArr.filter((format) => (hasAlpha ? format.endsWith('rgb') : !format.endsWith('rgb')));
        invalidFormats.forEach((format) => delete compressOptions[format]);
    }
    if (pvrArr.length > 1) {
        const invalidFormats = pvrArr.filter((format) => (hasAlpha ? format.endsWith('rgb') : !format.endsWith('rgb')));
        invalidFormats.forEach((format) => delete compressOptions[format]);
    }
    else if (!hasAlpha && pvrArr[0] && pvrArr[0].endsWith('rgb_a')) {
        // 不带透明度的图压缩成 rgb_a 需要过滤掉报警告，否则压缩后会失败报错
        // https://github.com/cocos-creator/3d-tasks/issues/5298
        delete compressOptions[pvrArr[0]];
        console.warn(i18n_1.default.t('builder.warn.compress_rgb_a', {
            uuid: `{asset(${uuid})}`,
        }));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL2Fzc2V0LWhhbmRsZXIvdGV4dHVyZS1jb21wcmVzcy91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlBLG9DQUVDO0FBRUQsOEJBTUM7QUFHRCw4Q0FFQztBQUVELDhDQU9DO0FBUUQsb0RBa0JDO0FBdERELDJDQUE2QjtBQUM3QixvRUFBNEM7QUFHNUMsU0FBZ0IsWUFBWSxDQUFDLElBQVksRUFBRSxNQUFjO0lBQ3JELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztBQUMzRixDQUFDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLFVBQThCLEVBQUUsTUFBYztJQUNwRSxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztJQUM3QyxJQUFJLFVBQVUsQ0FBQyxZQUFZLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO1FBQ2xFLE1BQU0sSUFBSSxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztJQUN6RCxDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQztBQUVELGNBQWM7QUFDZCxTQUFnQixpQkFBaUIsQ0FBQyxJQUF5QjtJQUN2RCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzRSxDQUFDO0FBRUQsU0FBZ0IsaUJBQWlCLENBQUMsS0FBYTtJQUMzQyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDZixPQUFPLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQztRQUNwQixNQUFNLElBQUksQ0FBQyxDQUFDO0lBQ2hCLENBQUM7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxlQUFvQyxFQUFFLFFBQWlCLEVBQUUsSUFBWTtJQUN0RyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDekYsSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hILGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE9BQU8sZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUNELElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNwQixNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoSCxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxPQUFPLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7U0FBTSxJQUFJLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDL0QsdUNBQXVDO1FBQ3ZDLHdEQUF3RDtRQUN4RCxPQUFPLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQUksQ0FBQyxDQUFDLENBQUMsNkJBQTZCLEVBQUU7WUFDL0MsSUFBSSxFQUFFLFVBQVUsSUFBSSxJQUFJO1NBQzNCLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBQYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgaTE4biBmcm9tICcuLi8uLi8uLi8uLi8uLi9iYXNlL2kxOG4nO1xyXG5pbXBvcnQgeyBJVGV4dHVyZUZvcm1hdEluZm8gfSBmcm9tICcuLi8uLi8uLi8uLi9AdHlwZXMnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNoYW5nZVN1ZmZpeChwYXRoOiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gUGF0aC5qb2luKFBhdGguZGlybmFtZShwYXRoKSwgUGF0aC5iYXNlbmFtZShwYXRoLCBQYXRoLmV4dG5hbWUocGF0aCkpICsgc3VmZml4KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFN1ZmZpeChmb3JtYXRJbmZvOiBJVGV4dHVyZUZvcm1hdEluZm8sIHN1ZmZpeDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBQaXhlbEZvcm1hdCA9IGNjLlRleHR1cmUyRC5QaXhlbEZvcm1hdDtcclxuICAgIGlmIChmb3JtYXRJbmZvLmZvcm1hdFN1ZmZpeCAmJiBQaXhlbEZvcm1hdFtmb3JtYXRJbmZvLmZvcm1hdFN1ZmZpeF0pIHtcclxuICAgICAgICBzdWZmaXggKz0gYEAke1BpeGVsRm9ybWF0W2Zvcm1hdEluZm8uZm9ybWF0U3VmZml4XX1gO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN1ZmZpeDtcclxufVxyXG5cclxuLy8g6LC35q2M57uf6K6h55qE6YCa55So5pWw5o2u5qC85byPXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGFuZ2VJbmZvVG9MYWJlbChpbmZvOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoaW5mbykubWFwKChrZXkpID0+IGAke2tleX06JHtpbmZvW2tleV19YCkuam9pbignLCcpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcm91bmRUb1Bvd2VyT2ZUd28odmFsdWU6IG51bWJlcikge1xyXG4gICAgbGV0IHBvd2VycyA9IDI7XHJcbiAgICB3aGlsZSAodmFsdWUgPiBwb3dlcnMpIHtcclxuICAgICAgICBwb3dlcnMgKj0gMjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcG93ZXJzO1xyXG59XHJcblxyXG4vKipcclxuICog5qC55o2u5b2T5YmN5Zu+54mH5piv5ZCm5bim5pyJ6YCP5piO6YCa6YGT6L+H5ruk5o6J5ZCM57G75Z6L55qE5LiN5o6o6I2Q55qE5qC85byPXHJcbiAqIOWmguaenOWQjOexu+Wei+WbvueJh+WPquacieS4gOenjemFjee9ru+8jOWImeS4jeS9nOi/h+a7pOWkhOeQhlxyXG4gKiBAcGFyYW0gY29tcHJlc3NPcHRpb25zXHJcbiAqIEBwYXJhbSBoYXNBbHBoYVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQ29tcHJlc3NPcHRpb25zKGNvbXByZXNzT3B0aW9uczogUmVjb3JkPHN0cmluZywgYW55PiwgaGFzQWxwaGE6IGJvb2xlYW4sIHV1aWQ6IHN0cmluZykge1xyXG4gICAgY29uc3QgZXRjQXJyID0gT2JqZWN0LmtleXMoY29tcHJlc3NPcHRpb25zKS5maWx0ZXIoKGZvcm1hdCkgPT4gZm9ybWF0LnN0YXJ0c1dpdGgoJ2V0YycpKTtcclxuICAgIGNvbnN0IHB2ckFyciA9IE9iamVjdC5rZXlzKGNvbXByZXNzT3B0aW9ucykuZmlsdGVyKChmb3JtYXQpID0+IGZvcm1hdC5zdGFydHNXaXRoKCdwdnInKSk7XHJcbiAgICBpZiAoZXRjQXJyLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBjb25zdCBpbnZhbGlkRm9ybWF0cyA9IGV0Y0Fyci5maWx0ZXIoKGZvcm1hdCkgPT4gKGhhc0FscGhhID8gZm9ybWF0LmVuZHNXaXRoKCdyZ2InKSA6ICFmb3JtYXQuZW5kc1dpdGgoJ3JnYicpKSk7XHJcbiAgICAgICAgaW52YWxpZEZvcm1hdHMuZm9yRWFjaCgoZm9ybWF0KSA9PiBkZWxldGUgY29tcHJlc3NPcHRpb25zW2Zvcm1hdF0pO1xyXG4gICAgfVxyXG4gICAgaWYgKHB2ckFyci5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgY29uc3QgaW52YWxpZEZvcm1hdHMgPSBwdnJBcnIuZmlsdGVyKChmb3JtYXQpID0+IChoYXNBbHBoYSA/IGZvcm1hdC5lbmRzV2l0aCgncmdiJykgOiAhZm9ybWF0LmVuZHNXaXRoKCdyZ2InKSkpO1xyXG4gICAgICAgIGludmFsaWRGb3JtYXRzLmZvckVhY2goKGZvcm1hdCkgPT4gZGVsZXRlIGNvbXByZXNzT3B0aW9uc1tmb3JtYXRdKTtcclxuICAgIH0gZWxzZSBpZiAoIWhhc0FscGhhICYmIHB2ckFyclswXSAmJiBwdnJBcnJbMF0uZW5kc1dpdGgoJ3JnYl9hJykpIHtcclxuICAgICAgICAvLyDkuI3luKbpgI/mmI7luqbnmoTlm77ljovnvKnmiJAgcmdiX2Eg6ZyA6KaB6L+H5ruk5o6J5oql6K2m5ZGK77yM5ZCm5YiZ5Y6L57yp5ZCO5Lya5aSx6LSl5oql6ZSZXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2NvY29zLWNyZWF0b3IvM2QtdGFza3MvaXNzdWVzLzUyOThcclxuICAgICAgICBkZWxldGUgY29tcHJlc3NPcHRpb25zW3B2ckFyclswXV07XHJcbiAgICAgICAgY29uc29sZS53YXJuKGkxOG4udCgnYnVpbGRlci53YXJuLmNvbXByZXNzX3JnYl9hJywge1xyXG4gICAgICAgICAgICB1dWlkOiBge2Fzc2V0KCR7dXVpZH0pfWAsXHJcbiAgICAgICAgfSkpO1xyXG4gICAgfVxyXG59Il19