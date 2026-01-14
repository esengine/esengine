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
exports.BaseConfiguration = void 0;
const utils = __importStar(require("./utils"));
const interface_1 = require("./interface");
const events_1 = require("events");
/**
 * 抽象配置类实现
 */
class BaseConfiguration extends events_1.EventEmitter {
    moduleName;
    defaultConfigs;
    configs = {};
    constructor(moduleName, defaultConfigs) {
        super();
        this.moduleName = moduleName;
        this.defaultConfigs = defaultConfigs;
    }
    getDefaultConfig() {
        return this.defaultConfigs || {};
    }
    getAll(scope = 'project') {
        if (scope === 'default') {
            return this.getDefaultConfig();
        }
        return this.configs;
    }
    async get(key, scope) {
        if (key === undefined) {
            return utils.deepMerge(this.getDefaultConfig(), this.configs);
        }
        const projectConfig = utils.getByDotPath(this.configs, key);
        const hasProjectValue = projectConfig !== undefined;
        // 根据作用域决定返回策略
        if (scope === 'project') {
            if (!hasProjectValue) {
                throw new Error(`[Configuration] 通过 ${this.moduleName}.${key} 获取配置失败`);
            }
            return projectConfig;
        }
        const defaultConfig = utils.getByDotPath(this.getDefaultConfig(), key);
        const hasDefaultValue = defaultConfig !== undefined;
        if (scope === 'default') {
            if (!hasDefaultValue) {
                throw new Error(`[Configuration] 通过 ${this.moduleName}.${key} 获取配置失败`);
            }
            return defaultConfig;
        }
        // 如果项目配置和默认配置都不存在，抛出错误
        if (!hasProjectValue && !hasDefaultValue) {
            throw new Error(`[Configuration] 通过 ${this.moduleName}.${key} 获取配置失败`);
        }
        return utils.deepMerge(defaultConfig, projectConfig);
    }
    async set(key, value, scope = 'project') {
        if (scope === 'default') {
            utils.setByDotPath(this.defaultConfigs, key, value);
        }
        else {
            utils.setByDotPath(this.configs, key, value);
            await this.save();
        }
        return true;
    }
    async remove(key, scope = 'project') {
        let removed = false;
        if (scope === 'default') {
            // 从默认配置中移除
            if (this.defaultConfigs) {
                removed = utils.removeByDotPath(this.defaultConfigs, key);
            }
        }
        else {
            // 从项目配置中移除
            removed = utils.removeByDotPath(this.configs, key);
            if (removed) {
                await this.save();
            }
        }
        return removed;
    }
    async save() {
        this.emit(interface_1.MessageType.Save, this);
        return true;
    }
}
exports.BaseConfiguration = BaseConfiguration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvY29uZmlndXJhdGlvbi9zY3JpcHQvY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUFpQztBQUNqQywyQ0FBOEQ7QUFDOUQsbUNBQXNDO0FBb0R0Qzs7R0FFRztBQUNILE1BQWEsaUJBQWtCLFNBQVEscUJBQVk7SUFJM0I7SUFDRztJQUpiLE9BQU8sR0FBd0IsRUFBRSxDQUFDO0lBRTVDLFlBQ29CLFVBQWtCLEVBQ2YsY0FBb0M7UUFFdkQsS0FBSyxFQUFFLENBQUM7UUFIUSxlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQ2YsbUJBQWMsR0FBZCxjQUFjLENBQXNCO0lBRzNELENBQUM7SUFFTSxnQkFBZ0I7UUFDbkIsT0FBTyxJQUFJLENBQUMsY0FBYyxJQUFJLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRU0sTUFBTSxDQUFDLFFBQTRCLFNBQVM7UUFDL0MsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDdEIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNuQyxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFJLEdBQVksRUFBRSxLQUEwQjtRQUN4RCxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUNwQixPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFDRCxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDNUQsTUFBTSxlQUFlLEdBQUcsYUFBYSxLQUFLLFNBQVMsQ0FBQztRQUVwRCxjQUFjO1FBQ2QsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixJQUFJLENBQUMsVUFBVSxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUM7WUFDM0UsQ0FBQztZQUNELE9BQVEsYUFBbUIsQ0FBQztRQUNoQyxDQUFDO1FBRUQsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN2RSxNQUFNLGVBQWUsR0FBRyxhQUFhLEtBQUssU0FBUyxDQUFDO1FBRXBELElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLFVBQVUsSUFBSSxHQUFHLFNBQVMsQ0FBQyxDQUFDO1lBQzNFLENBQUM7WUFDRCxPQUFRLGFBQW1CLENBQUM7UUFDaEMsQ0FBQztRQUVELHVCQUF1QjtRQUN2QixJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDdkMsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLFVBQVUsSUFBSSxHQUFHLFNBQVMsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFFRCxPQUFRLEtBQUssQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBTyxDQUFDO0lBQ2hFLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFJLEdBQVcsRUFBRSxLQUFRLEVBQUUsUUFBNEIsU0FBUztRQUM1RSxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUN0QixLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hELENBQUM7YUFBTSxDQUFDO1lBQ0osS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM3QyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBVyxFQUFFLFFBQTRCLFNBQVM7UUFDbEUsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBRXBCLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3RCLFdBQVc7WUFDWCxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDdEIsT0FBTyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUM5RCxDQUFDO1FBQ0wsQ0FBQzthQUFNLENBQUM7WUFDSixXQUFXO1lBQ1gsT0FBTyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNuRCxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNWLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3RCLENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVNLEtBQUssQ0FBQyxJQUFJO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNsQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUF2RkQsOENBdUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25TY29wZSwgTWVzc2FnZVR5cGUgfSBmcm9tICcuL2ludGVyZmFjZSc7XHJcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XHJcblxyXG50eXBlIEV2ZW50RW1pdHRlck1ldGhvZHMgPSBQaWNrPEV2ZW50RW1pdHRlciwgJ29uJyB8ICdvZmYnIHwgJ29uY2UnIHwgJ2VtaXQnPjtcclxuXHJcbi8qKlxyXG4gKiDphY3nva7ln7rnsbvmjqXlj6NcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUJhc2VDb25maWd1cmF0aW9uIGV4dGVuZHMgRXZlbnRFbWl0dGVyTWV0aG9kcyB7XHJcbiAgICAvKipcclxuICAgICAqIOaooeWdl+WQjVxyXG4gICAgICovXHJcbiAgICBtb2R1bGVOYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpu5jorqTphY3nva7mlbDmja5cclxuICAgICAqL1xyXG4gICAgZ2V0RGVmYXVsdENvbmZpZygpOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W6YWN572u5YC8XHJcbiAgICAgKiBAcGFyYW0ga2V5IOmFjee9rumUruWQje+8jOaUr+aMgeeCueWPt+WIhumalOeahOW1jOWll+i3r+W+hFxyXG4gICAgICogQHBhcmFtIHNjb3BlIOmFjee9ruS9nOeUqOWfn++8jOS4jeaMh+WumuaXtuaMieS8mOWFiOe6p+afpeaJvlxyXG4gICAgICovXHJcbiAgICBnZXQ8VD4oa2V5Pzogc3RyaW5nLCBzY29wZT86IENvbmZpZ3VyYXRpb25TY29wZSk6IFByb21pc2U8VD47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmjIflrprojIPlm7TnmoTmiYDmnInphY3nva7vvIzpu5jorqTmmK8gcHJvamVjdFxyXG4gICAgICogQHBhcmFtIHNjb3BlXHJcbiAgICAgKi9cclxuICAgIGdldEFsbChzY29wZT86IENvbmZpZ3VyYXRpb25TY29wZSk6IFJlY29yZDxzdHJpbmcsIGFueT4gfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorr7nva7phY3nva7lgLxcclxuICAgICAqIEBwYXJhbSBrZXkg6YWN572u6ZSu5ZCN77yM5pSv5oyB54K55Y+35YiG6ZqU55qE5bWM5aWX6Lev5b6EXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUg5paw55qE6YWN572u5YC8XHJcbiAgICAgKiBAcGFyYW0gc2NvcGUg6YWN572u5L2c55So5Z+f77yM6buY6K6k5Li6ICdwcm9qZWN0J1xyXG4gICAgICovXHJcbiAgICBzZXQ8VD4oa2V5OiBzdHJpbmcsIHZhbHVlOiBULCBzY29wZT86IENvbmZpZ3VyYXRpb25TY29wZSk6IFByb21pc2U8Ym9vbGVhbj47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnp7vpmaTphY3nva7lgLxcclxuICAgICAqIEBwYXJhbSBrZXkg6YWN572u6ZSu5ZCN77yM5pSv5oyB54K55Y+35YiG6ZqU55qE5bWM5aWX6Lev5b6EXHJcbiAgICAgKiBAcGFyYW0gc2NvcGUg6YWN572u5L2c55So5Z+f77yM6buY6K6k5Li6ICdwcm9qZWN0J1xyXG4gICAgICovXHJcbiAgICByZW1vdmUoa2V5OiBzdHJpbmcsIHNjb3BlPzogQ29uZmlndXJhdGlvblNjb3BlKTogUHJvbWlzZTxib29sZWFuPjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOS/neWtmOmFjee9rlxyXG4gICAgICovXHJcbiAgICBzYXZlKCk6IFByb21pc2U8Ym9vbGVhbj47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDmir3osaHphY3nva7nsbvlrp7njrBcclxuICovXHJcbmV4cG9ydCBjbGFzcyBCYXNlQ29uZmlndXJhdGlvbiBleHRlbmRzIEV2ZW50RW1pdHRlciBpbXBsZW1lbnRzIElCYXNlQ29uZmlndXJhdGlvbiB7XHJcbiAgICBwcm90ZWN0ZWQgY29uZmlnczogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBtb2R1bGVOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IGRlZmF1bHRDb25maWdzPzogUmVjb3JkPHN0cmluZywgYW55PlxyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0RGVmYXVsdENvbmZpZygpOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kZWZhdWx0Q29uZmlncyB8fCB7fTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0QWxsKHNjb3BlOiBDb25maWd1cmF0aW9uU2NvcGUgPSAncHJvamVjdCcpOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBpZiAoc2NvcGUgPT09ICdkZWZhdWx0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREZWZhdWx0Q29uZmlnKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZ3M7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGdldDxUPihrZXk/OiBzdHJpbmcsIHNjb3BlPzogQ29uZmlndXJhdGlvblNjb3BlKTogUHJvbWlzZTxUPiB7XHJcbiAgICAgICAgaWYgKGtleSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1dGlscy5kZWVwTWVyZ2UodGhpcy5nZXREZWZhdWx0Q29uZmlnKCksIHRoaXMuY29uZmlncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByb2plY3RDb25maWcgPSB1dGlscy5nZXRCeURvdFBhdGgodGhpcy5jb25maWdzLCBrZXkpO1xyXG4gICAgICAgIGNvbnN0IGhhc1Byb2plY3RWYWx1ZSA9IHByb2plY3RDb25maWcgIT09IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgLy8g5qC55o2u5L2c55So5Z+f5Yaz5a6a6L+U5Zue562W55WlXHJcbiAgICAgICAgaWYgKHNjb3BlID09PSAncHJvamVjdCcpIHtcclxuICAgICAgICAgICAgaWYgKCFoYXNQcm9qZWN0VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgW0NvbmZpZ3VyYXRpb25dIOmAmui/hyAke3RoaXMubW9kdWxlTmFtZX0uJHtrZXl9IOiOt+WPlumFjee9ruWksei0pWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAocHJvamVjdENvbmZpZyBhcyBUKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRDb25maWcgPSB1dGlscy5nZXRCeURvdFBhdGgodGhpcy5nZXREZWZhdWx0Q29uZmlnKCksIGtleSk7XHJcbiAgICAgICAgY29uc3QgaGFzRGVmYXVsdFZhbHVlID0gZGVmYXVsdENvbmZpZyAhPT0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBpZiAoc2NvcGUgPT09ICdkZWZhdWx0Jykge1xyXG4gICAgICAgICAgICBpZiAoIWhhc0RlZmF1bHRWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBbQ29uZmlndXJhdGlvbl0g6YCa6L+HICR7dGhpcy5tb2R1bGVOYW1lfS4ke2tleX0g6I635Y+W6YWN572u5aSx6LSlYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIChkZWZhdWx0Q29uZmlnIGFzIFQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5aaC5p6c6aG555uu6YWN572u5ZKM6buY6K6k6YWN572u6YO95LiN5a2Y5Zyo77yM5oqb5Ye66ZSZ6K+vXHJcbiAgICAgICAgaWYgKCFoYXNQcm9qZWN0VmFsdWUgJiYgIWhhc0RlZmF1bHRWYWx1ZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFtDb25maWd1cmF0aW9uXSDpgJrov4cgJHt0aGlzLm1vZHVsZU5hbWV9LiR7a2V5fSDojrflj5bphY3nva7lpLHotKVgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAodXRpbHMuZGVlcE1lcmdlKGRlZmF1bHRDb25maWcsIHByb2plY3RDb25maWcpIGFzIFQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBzZXQ8VD4oa2V5OiBzdHJpbmcsIHZhbHVlOiBULCBzY29wZTogQ29uZmlndXJhdGlvblNjb3BlID0gJ3Byb2plY3QnKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgaWYgKHNjb3BlID09PSAnZGVmYXVsdCcpIHtcclxuICAgICAgICAgICAgdXRpbHMuc2V0QnlEb3RQYXRoKHRoaXMuZGVmYXVsdENvbmZpZ3MsIGtleSwgdmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHV0aWxzLnNldEJ5RG90UGF0aCh0aGlzLmNvbmZpZ3MsIGtleSwgdmFsdWUpO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNhdmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIHJlbW92ZShrZXk6IHN0cmluZywgc2NvcGU6IENvbmZpZ3VyYXRpb25TY29wZSA9ICdwcm9qZWN0Jyk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgIGxldCByZW1vdmVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChzY29wZSA9PT0gJ2RlZmF1bHQnKSB7XHJcbiAgICAgICAgICAgIC8vIOS7jum7mOiupOmFjee9ruS4reenu+mZpFxyXG4gICAgICAgICAgICBpZiAodGhpcy5kZWZhdWx0Q29uZmlncykge1xyXG4gICAgICAgICAgICAgICAgcmVtb3ZlZCA9IHV0aWxzLnJlbW92ZUJ5RG90UGF0aCh0aGlzLmRlZmF1bHRDb25maWdzLCBrZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8g5LuO6aG555uu6YWN572u5Lit56e76ZmkXHJcbiAgICAgICAgICAgIHJlbW92ZWQgPSB1dGlscy5yZW1vdmVCeURvdFBhdGgodGhpcy5jb25maWdzLCBrZXkpO1xyXG4gICAgICAgICAgICBpZiAocmVtb3ZlZCkge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZW1vdmVkO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBzYXZlKCkge1xyXG4gICAgICAgIHRoaXMuZW1pdChNZXNzYWdlVHlwZS5TYXZlLCB0aGlzKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG4iXX0=