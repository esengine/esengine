'use strict';
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
exports.format = exports.parse = exports.delimiter = exports.sep = exports.extname = exports.basename = exports.dirname = exports.relative = exports.isAbsolute = exports.resolve = exports.resolveToUrl = exports.resolveToRaw = exports.unregister = exports.register = void 0;
exports.basenameNoExt = basenameNoExt;
exports.slash = slash;
exports.stripSep = stripSep;
exports.stripExt = stripExt;
exports.contains = contains;
exports.normalize = normalize;
const Path = __importStar(require("path"));
const path_1 = require("path");
/**
 * 返回一个不含扩展名的文件名
 * @param path
 */
function basenameNoExt(path) {
    return Path.basename(path, Path.extname(path));
}
/**
 * 将 \ 统一换成 /
 * @param path
 */
function slash(path) {
    return path.replace(/\\/g, '/');
}
/**
 * 去除路径最后的斜杆，返回一个不带斜杆的路径
 * @param path
 */
function stripSep(path) {
    path = Path.normalize(path);
    let i;
    for (i = path.length - 1; i >= 0; --i) {
        if (path[i] !== Path.sep) {
            break;
        }
    }
    return path.substring(0, i + 1);
}
/**
 * 删除一个路径的扩展名
 * @param path
 */
function stripExt(path) {
    const extname = Path.extname(path);
    return path.substring(0, path.length - extname.length);
}
/**
 * 判断路径 pathA 是否包含 pathB
 * pathA = foo/bar,         pathB = foo/bar/foobar, return true
 * pathA = foo/bar,         pathB = foo/bar,        return true
 * pathA = foo/bar/foobar,  pathB = foo/bar,        return false
 * pathA = foo/bar/foobar,  pathB = foobar/bar/foo, return false
 * @param pathA
 * @param pathB
 */
function contains(pathA, pathB) {
    pathA = stripSep(pathA);
    pathB = stripSep(pathB);
    if (process.platform === 'win32') {
        pathA = pathA.toLowerCase();
        pathB = pathB.toLowerCase();
    }
    //
    if (pathA === pathB) {
        return true;
    }
    // never compare files
    if (Path.dirname(pathA) === Path.dirname(pathB)) {
        return false;
    }
    if (pathA.length < pathB.length && pathB.indexOf(pathA + Path.sep) === 0) {
        return true;
    }
    return false;
}
/**
 * 格式化路径
 * 如果是 Windows 平台，需要将盘符转成小写进行判断
 * @param path
 */
function normalize(path) {
    path = Path.normalize(path);
    if (process.platform === 'win32') {
        if (/^[a-z]/.test(path[0]) && !/electron.asar/.test(path)) {
            path = path[0].toUpperCase() + path.substr(1);
        }
    }
    return path;
}
class FileUrlManager {
    static urlMap = {};
    /**
     * 注册某个协议信息
     * @param protocol
     * @param protocolInfo
     */
    register(protocol, protocolInfo) {
        if (!FileUrlManager.urlMap) {
            FileUrlManager.urlMap = {};
        }
        if (FileUrlManager.urlMap[protocol] || protocol === 'file') {
            console.warn(`[UI-File] Register protocol(${protocol}) failed! protocol(${protocol}) has exist!`);
            return false;
        }
        FileUrlManager.urlMap[protocol] = protocolInfo;
        return true;
    }
    /**
     * 反注册某个协议信息
     * @param protocol 协议头
     */
    unregister(protocol) {
        delete FileUrlManager.urlMap[protocol];
        return true;
    }
    getAllFileProtocol() {
        return Object.keys(FileUrlManager.urlMap).map((protocol) => {
            return {
                protocol,
                label: FileUrlManager.urlMap[protocol].label,
                path: FileUrlManager.urlMap[protocol].path,
            };
        });
    }
    // 转成未处理过的（不带协议）
    resolveToRaw(url) {
        const matchInfo = url.match(/^([a-zA-z]*):\/\/(.*)$/);
        if (matchInfo) {
            const relPath = matchInfo[2].replace(/\\/g, '/');
            const info = this.getProtocalInfo(matchInfo[1]);
            if (info) {
                return (0, path_1.join)(info.path, relPath);
            }
        }
        return url;
    }
    // 转成带协议的地址格式
    resolveToUrl(raw, protocol) {
        if (!raw || !(0, exports.isAbsolute)(raw) || !protocol) {
            return '';
        }
        const info = this.getProtocalInfo(protocol);
        if (!info) {
            return '';
        }
        return info.protocol + '://' + (0, exports.relative)(info.path, raw).replace(/\\/g, '/');
    }
    getProtocalInfo(protocol) {
        if (!FileUrlManager.urlMap[protocol]) {
            return undefined;
        }
        return {
            protocol,
            ...FileUrlManager.urlMap[protocol],
        };
    }
}
const fileUrlManager = new FileUrlManager();
// 使用 bind 绑定 this 上下文
exports.register = fileUrlManager.register.bind(fileUrlManager);
exports.unregister = fileUrlManager.unregister.bind(fileUrlManager);
exports.resolveToRaw = fileUrlManager.resolveToRaw.bind(fileUrlManager);
exports.resolveToUrl = fileUrlManager.resolveToUrl.bind(fileUrlManager);
exports.resolve = Path.resolve;
exports.isAbsolute = Path.isAbsolute;
exports.relative = Path.relative;
exports.dirname = Path.dirname;
exports.basename = Path.basename;
exports.extname = Path.extname;
exports.sep = Path.sep;
exports.delimiter = Path.delimiter;
exports.parse = Path.parse;
exports.format = Path.format;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL2Jhc2UvdXRpbHMvcGF0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVNiLHNDQUVDO0FBTUQsc0JBRUM7QUFNRCw0QkFTQztBQU1ELDRCQUdDO0FBV0QsNEJBd0JDO0FBT0QsOEJBUUM7QUEzRkQsMkNBQTZCO0FBQzdCLCtCQUE0QjtBQUU1Qjs7O0dBR0c7QUFDSCxTQUFnQixhQUFhLENBQUMsSUFBWTtJQUN0QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNuRCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFDLElBQVk7SUFDOUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsUUFBUSxDQUFDLElBQVk7SUFDakMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsSUFBSSxDQUFDLENBQUM7SUFDTixLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDcEMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLE1BQU07UUFDVixDQUFDO0lBQ0wsQ0FBQztJQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixRQUFRLENBQUMsSUFBWTtJQUNqQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25DLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0QsQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsU0FBZ0IsUUFBUSxDQUFDLEtBQWEsRUFBRSxLQUFhO0lBQ2pELEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEIsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUV4QixJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTyxFQUFFLENBQUM7UUFDL0IsS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM1QixLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxFQUFFO0lBQ0YsSUFBSSxLQUFLLEtBQUssS0FBSyxFQUFFLENBQUM7UUFDbEIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELHNCQUFzQjtJQUN0QixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQzlDLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDdkUsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsU0FBUyxDQUFDLElBQVk7SUFDbEMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRSxDQUFDO1FBQy9CLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUN4RCxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBR0QsTUFBTSxjQUFjO0lBQ2hCLE1BQU0sQ0FBQyxNQUFNLEdBQXlDLEVBRXJELENBQUM7SUFFRjs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLFFBQWdCLEVBQUUsWUFBa0M7UUFDekQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN6QixjQUFjLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUMvQixDQUFDO1FBQ0QsSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsS0FBSyxNQUFNLEVBQUUsQ0FBQztZQUN6RCxPQUFPLENBQUMsSUFBSSxDQUFDLCtCQUErQixRQUFRLHNCQUFzQixRQUFRLGNBQWMsQ0FBQyxDQUFDO1lBQ2xHLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFDRCxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFlBQVksQ0FBQztRQUMvQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsVUFBVSxDQUFDLFFBQWdCO1FBQ3ZCLE9BQU8sY0FBYyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2QyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsa0JBQWtCO1FBQ2QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUN2RCxPQUFPO2dCQUNILFFBQVE7Z0JBQ1IsS0FBSyxFQUFFLGNBQWMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSztnQkFDNUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSTthQUM3QyxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLFlBQVksQ0FBQyxHQUFXO1FBQ3BCLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN0RCxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ1osTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDakQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRCxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNQLE9BQU8sSUFBQSxXQUFJLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNwQyxDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVELGFBQWE7SUFDYixZQUFZLENBQUMsR0FBVyxFQUFFLFFBQWdCO1FBQ3RDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFBLGtCQUFVLEVBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN4QyxPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFDRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNSLE9BQU8sRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLEdBQUcsSUFBQSxnQkFBUSxFQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBRUQsZUFBZSxDQUFDLFFBQWdCO1FBQzVCLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDbkMsT0FBTyxTQUFTLENBQUM7UUFDckIsQ0FBQztRQUNELE9BQU87WUFDSCxRQUFRO1lBQ1IsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztTQUNyQyxDQUFDO0lBQ04sQ0FBQzs7QUFHTCxNQUFNLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBTTVDLHNCQUFzQjtBQUNULFFBQUEsUUFBUSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3hELFFBQUEsVUFBVSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzVELFFBQUEsWUFBWSxHQUFHLGNBQWMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ2hFLFFBQUEsWUFBWSxHQUFHLGNBQWMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ2hFLFFBQUEsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDdkIsUUFBQSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztBQUM3QixRQUFBLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQ3pCLFFBQUEsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDdkIsUUFBQSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUN6QixRQUFBLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3ZCLFFBQUEsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDZixRQUFBLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQzNCLFFBQUEsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbkIsUUFBQSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCAqIGFzIFBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcclxuXHJcbi8qKlxyXG4gKiDov5Tlm57kuIDkuKrkuI3lkKvmianlsZXlkI3nmoTmlofku7blkI1cclxuICogQHBhcmFtIHBhdGhcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBiYXNlbmFtZU5vRXh0KHBhdGg6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIFBhdGguYmFzZW5hbWUocGF0aCwgUGF0aC5leHRuYW1lKHBhdGgpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWwhiBcXCDnu5/kuIDmjaLmiJAgL1xyXG4gKiBAcGFyYW0gcGF0aFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHNsYXNoKHBhdGg6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xyXG59XHJcblxyXG4vKipcclxuICog5Y676Zmk6Lev5b6E5pyA5ZCO55qE5pac5p2G77yM6L+U5Zue5LiA5Liq5LiN5bim5pac5p2G55qE6Lev5b6EXHJcbiAqIEBwYXJhbSBwYXRoXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBTZXAocGF0aDogc3RyaW5nKSB7XHJcbiAgICBwYXRoID0gUGF0aC5ub3JtYWxpemUocGF0aCk7XHJcbiAgICBsZXQgaTtcclxuICAgIGZvciAoaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcclxuICAgICAgICBpZiAocGF0aFtpXSAhPT0gUGF0aC5zZXApIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhdGguc3Vic3RyaW5nKDAsIGkgKyAxKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWIoOmZpOS4gOS4qui3r+W+hOeahOaJqeWxleWQjVxyXG4gKiBAcGFyYW0gcGF0aFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwRXh0KHBhdGg6IHN0cmluZykge1xyXG4gICAgY29uc3QgZXh0bmFtZSA9IFBhdGguZXh0bmFtZShwYXRoKTtcclxuICAgIHJldHVybiBwYXRoLnN1YnN0cmluZygwLCBwYXRoLmxlbmd0aCAtIGV4dG5hbWUubGVuZ3RoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIOWIpOaWrei3r+W+hCBwYXRoQSDmmK/lkKbljIXlkKsgcGF0aEJcclxuICogcGF0aEEgPSBmb28vYmFyLCAgICAgICAgIHBhdGhCID0gZm9vL2Jhci9mb29iYXIsIHJldHVybiB0cnVlXHJcbiAqIHBhdGhBID0gZm9vL2JhciwgICAgICAgICBwYXRoQiA9IGZvby9iYXIsICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gKiBwYXRoQSA9IGZvby9iYXIvZm9vYmFyLCAgcGF0aEIgPSBmb28vYmFyLCAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAqIHBhdGhBID0gZm9vL2Jhci9mb29iYXIsICBwYXRoQiA9IGZvb2Jhci9iYXIvZm9vLCByZXR1cm4gZmFsc2VcclxuICogQHBhcmFtIHBhdGhBXHJcbiAqIEBwYXJhbSBwYXRoQlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zKHBhdGhBOiBzdHJpbmcsIHBhdGhCOiBzdHJpbmcpIHtcclxuICAgIHBhdGhBID0gc3RyaXBTZXAocGF0aEEpO1xyXG4gICAgcGF0aEIgPSBzdHJpcFNlcChwYXRoQik7XHJcblxyXG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHtcclxuICAgICAgICBwYXRoQSA9IHBhdGhBLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgcGF0aEIgPSBwYXRoQi50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vXHJcbiAgICBpZiAocGF0aEEgPT09IHBhdGhCKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbmV2ZXIgY29tcGFyZSBmaWxlc1xyXG4gICAgaWYgKFBhdGguZGlybmFtZShwYXRoQSkgPT09IFBhdGguZGlybmFtZShwYXRoQikpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHBhdGhBLmxlbmd0aCA8IHBhdGhCLmxlbmd0aCAmJiBwYXRoQi5pbmRleE9mKHBhdGhBICsgUGF0aC5zZXApID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG4vKipcclxuICog5qC85byP5YyW6Lev5b6EXHJcbiAqIOWmguaenOaYryBXaW5kb3dzIOW5s+WPsO+8jOmcgOimgeWwhuebmOespui9rOaIkOWwj+WGmei/m+ihjOWIpOaWrVxyXG4gKiBAcGFyYW0gcGF0aCBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUocGF0aDogc3RyaW5nKSB7XHJcbiAgICBwYXRoID0gUGF0aC5ub3JtYWxpemUocGF0aCk7XHJcbiAgICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykge1xyXG4gICAgICAgIGlmICgvXlthLXpdLy50ZXN0KHBhdGhbMF0pICYmICEvZWxlY3Ryb24uYXNhci8udGVzdChwYXRoKSkge1xyXG4gICAgICAgICAgICBwYXRoID0gcGF0aFswXS50b1VwcGVyQ2FzZSgpICsgcGF0aC5zdWJzdHIoMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhdGg7XHJcbn1cclxuXHJcblxyXG5jbGFzcyBGaWxlVXJsTWFuYWdlciB7XHJcbiAgICBzdGF0aWMgdXJsTWFwOiBSZWNvcmQ8c3RyaW5nLCBSZWdpc3RlclByb3RvY29sSW5mbz4gPSB7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOazqOWGjOafkOS4quWNj+iuruS/oeaBr1xyXG4gICAgICogQHBhcmFtIHByb3RvY29sXHJcbiAgICAgKiBAcGFyYW0gcHJvdG9jb2xJbmZvXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdGVyKHByb3RvY29sOiBzdHJpbmcsIHByb3RvY29sSW5mbzogUmVnaXN0ZXJQcm90b2NvbEluZm8pIHtcclxuICAgICAgICBpZiAoIUZpbGVVcmxNYW5hZ2VyLnVybE1hcCkge1xyXG4gICAgICAgICAgICBGaWxlVXJsTWFuYWdlci51cmxNYXAgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKEZpbGVVcmxNYW5hZ2VyLnVybE1hcFtwcm90b2NvbF0gfHwgcHJvdG9jb2wgPT09ICdmaWxlJykge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtVSS1GaWxlXSBSZWdpc3RlciBwcm90b2NvbCgke3Byb3RvY29sfSkgZmFpbGVkISBwcm90b2NvbCgke3Byb3RvY29sfSkgaGFzIGV4aXN0IWApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEZpbGVVcmxNYW5hZ2VyLnVybE1hcFtwcm90b2NvbF0gPSBwcm90b2NvbEluZm87XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlj43ms6jlhozmn5DkuKrljY/orq7kv6Hmga9cclxuICAgICAqIEBwYXJhbSBwcm90b2NvbCDljY/orq7lpLRcclxuICAgICAqL1xyXG4gICAgdW5yZWdpc3Rlcihwcm90b2NvbDogc3RyaW5nKSB7XHJcbiAgICAgICAgZGVsZXRlIEZpbGVVcmxNYW5hZ2VyLnVybE1hcFtwcm90b2NvbF07XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QWxsRmlsZVByb3RvY29sKCkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhGaWxlVXJsTWFuYWdlci51cmxNYXApLm1hcCgocHJvdG9jb2wpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHByb3RvY29sLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6IEZpbGVVcmxNYW5hZ2VyLnVybE1hcFtwcm90b2NvbF0ubGFiZWwsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBGaWxlVXJsTWFuYWdlci51cmxNYXBbcHJvdG9jb2xdLnBhdGgsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g6L2s5oiQ5pyq5aSE55CG6L+H55qE77yI5LiN5bim5Y2P6K6u77yJXHJcbiAgICByZXNvbHZlVG9SYXcodXJsOiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBtYXRjaEluZm8gPSB1cmwubWF0Y2goL14oW2EtekEtel0qKTpcXC9cXC8oLiopJC8pO1xyXG4gICAgICAgIGlmIChtYXRjaEluZm8pIHtcclxuICAgICAgICAgICAgY29uc3QgcmVsUGF0aCA9IG1hdGNoSW5mb1syXS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSB0aGlzLmdldFByb3RvY2FsSW5mbyhtYXRjaEluZm9bMV0pO1xyXG4gICAgICAgICAgICBpZiAoaW5mbykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGpvaW4oaW5mby5wYXRoLCByZWxQYXRoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdXJsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOi9rOaIkOW4puWNj+iurueahOWcsOWdgOagvOW8j1xyXG4gICAgcmVzb2x2ZVRvVXJsKHJhdzogc3RyaW5nLCBwcm90b2NvbDogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFyYXcgfHwgIWlzQWJzb2x1dGUocmF3KSB8fCAhcHJvdG9jb2wpIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbmZvID0gdGhpcy5nZXRQcm90b2NhbEluZm8ocHJvdG9jb2wpO1xyXG4gICAgICAgIGlmICghaW5mbykge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbmZvLnByb3RvY29sICsgJzovLycgKyByZWxhdGl2ZShpbmZvLnBhdGgsIHJhdykucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFByb3RvY2FsSW5mbyhwcm90b2NvbDogc3RyaW5nKTogUHJvdG9jb2xJbmZvIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBpZiAoIUZpbGVVcmxNYW5hZ2VyLnVybE1hcFtwcm90b2NvbF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcHJvdG9jb2wsXHJcbiAgICAgICAgICAgIC4uLkZpbGVVcmxNYW5hZ2VyLnVybE1hcFtwcm90b2NvbF0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgZmlsZVVybE1hbmFnZXIgPSBuZXcgRmlsZVVybE1hbmFnZXIoKTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUHJvdG9jb2xJbmZvIGV4dGVuZHMgUmVnaXN0ZXJQcm90b2NvbEluZm8ge1xyXG4gICAgcHJvdG9jb2w6IHN0cmluZztcclxufVxyXG5cclxuLy8g5L2/55SoIGJpbmQg57uR5a6aIHRoaXMg5LiK5LiL5paHXHJcbmV4cG9ydCBjb25zdCByZWdpc3RlciA9IGZpbGVVcmxNYW5hZ2VyLnJlZ2lzdGVyLmJpbmQoZmlsZVVybE1hbmFnZXIpO1xyXG5leHBvcnQgY29uc3QgdW5yZWdpc3RlciA9IGZpbGVVcmxNYW5hZ2VyLnVucmVnaXN0ZXIuYmluZChmaWxlVXJsTWFuYWdlcik7XHJcbmV4cG9ydCBjb25zdCByZXNvbHZlVG9SYXcgPSBmaWxlVXJsTWFuYWdlci5yZXNvbHZlVG9SYXcuYmluZChmaWxlVXJsTWFuYWdlcik7XHJcbmV4cG9ydCBjb25zdCByZXNvbHZlVG9VcmwgPSBmaWxlVXJsTWFuYWdlci5yZXNvbHZlVG9VcmwuYmluZChmaWxlVXJsTWFuYWdlcik7XHJcbmV4cG9ydCBjb25zdCByZXNvbHZlID0gUGF0aC5yZXNvbHZlO1xyXG5leHBvcnQgY29uc3QgaXNBYnNvbHV0ZSA9IFBhdGguaXNBYnNvbHV0ZTtcclxuZXhwb3J0IGNvbnN0IHJlbGF0aXZlID0gUGF0aC5yZWxhdGl2ZTtcclxuZXhwb3J0IGNvbnN0IGRpcm5hbWUgPSBQYXRoLmRpcm5hbWU7XHJcbmV4cG9ydCBjb25zdCBiYXNlbmFtZSA9IFBhdGguYmFzZW5hbWU7XHJcbmV4cG9ydCBjb25zdCBleHRuYW1lID0gUGF0aC5leHRuYW1lO1xyXG5leHBvcnQgY29uc3Qgc2VwID0gUGF0aC5zZXA7XHJcbmV4cG9ydCBjb25zdCBkZWxpbWl0ZXIgPSBQYXRoLmRlbGltaXRlcjtcclxuZXhwb3J0IGNvbnN0IHBhcnNlID0gUGF0aC5wYXJzZTtcclxuZXhwb3J0IGNvbnN0IGZvcm1hdCA9IFBhdGguZm9ybWF0O1xyXG5leHBvcnQgaW50ZXJmYWNlIFJlZ2lzdGVyUHJvdG9jb2xJbmZvIHtcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZztcclxuICAgIHBhdGg6IHN0cmluZzsgLy8g5LiO6L2s5o2iIGhhbmRsZXJzIOS6jOmAieS4gFxyXG4gICAgaW52YWxpZEluZm8/OiBzdHJpbmc7IC8vIOS4jeespuWQiOW9k+WJjeWNj+iuruWktOaXtueahOaWh+acrOaPkOekulxyXG4gICAgLy8g6Ieq5a6a5LmJ5Y2P6K6u6L2s5o2iXHJcbiAgICAvLyBoYW5kbGVycz86IHtcclxuICAgIC8vICAgICBmaWxlVG9Vcmw6IChwYXRoOiBzdHJpbmcpID0+IHN0cmluZztcclxuICAgIC8vICAgICB1cmxUb0ZpbGU6IChwYXRoOiBzdHJpbmcpID0+IHN0cmluZztcclxuICAgIC8vIH1cclxufVxyXG5cclxuXHJcbiJdfQ==