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
exports.configurationRegistry = exports.ConfigurationRegistry = void 0;
const console_1 = require("../../base/console");
const utils = __importStar(require("./utils"));
const config_1 = require("./config");
const events_1 = require("events");
const interface_1 = require("./interface");
/**
 * 配置注册器实现类
 */
class ConfigurationRegistry extends events_1.EventEmitter {
    instances = {};
    /**
     * 获取所有配置实例
     */
    getInstances() {
        return this.instances;
    }
    /**
     * 通过模块名获取配置实例
     * @param moduleName
     */
    getInstance(moduleName) {
        const instance = this.instances[moduleName];
        if (!instance) {
            console.warn(`[Configuration] 获取配置实例错误，${moduleName} 未注册配置。`);
            return undefined;
        }
        return instance;
    }
    async register(moduleName, configOrInstance) {
        if (!utils.isValidConfigKey(moduleName)) {
            throw new Error('[Configuration] 注册配置失败：模块名不能为空。');
        }
        // 检查配置是否已存在
        const existingInstance = this.instances[moduleName];
        const exists = existingInstance !== undefined;
        if (exists) {
            console_1.newConsole.warn(`[Configuration] 配置项 "${moduleName}" 已存在，跳过注册。`);
            return existingInstance;
        }
        let instance;
        // 判断第二个参数是配置对象还是配置实例
        if (configOrInstance && 'moduleName' in configOrInstance && typeof configOrInstance.get === 'function') {
            // 是配置实例
            instance = configOrInstance;
            // 验证实例的模块名是否匹配
            if (instance.moduleName !== moduleName) {
                throw new Error(`[Configuration] 注册配置失败：配置实例的模块名 "${instance.moduleName}" 与注册的模块名 "${moduleName}" 不匹配。`);
            }
        }
        else {
            // 是配置对象或 undefined
            instance = new config_1.BaseConfiguration(moduleName, configOrInstance);
        }
        this.instances[moduleName] = instance;
        this.emit(interface_1.MessageType.Registry, instance);
        return instance;
    }
    async unregister(moduleName) {
        this.emit(interface_1.MessageType.UnRegistry, this.instances[moduleName]);
        delete this.instances[moduleName];
    }
}
exports.ConfigurationRegistry = ConfigurationRegistry;
/**
 * 默认配置注册器实例
 */
exports.configurationRegistry = new ConfigurationRegistry();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29yZS9jb25maWd1cmF0aW9uL3NjcmlwdC9yZWdpc3RyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxnREFBZ0Q7QUFDaEQsK0NBQWlDO0FBQ2pDLHFDQUFpRTtBQUNqRSxtQ0FBc0M7QUFDdEMsMkNBQTBDO0FBd0MxQzs7R0FFRztBQUNILE1BQWEscUJBQXNCLFNBQVEscUJBQVk7SUFDM0MsU0FBUyxHQUF1QyxFQUFFLENBQUM7SUFFM0Q7O09BRUc7SUFDSSxZQUFZO1FBQ2YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxXQUFXLENBQUMsVUFBa0I7UUFDakMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDWixPQUFPLENBQUMsSUFBSSxDQUFDLDRCQUE0QixVQUFVLFNBQVMsQ0FBQyxDQUFDO1lBQzlELE9BQU8sU0FBUyxDQUFDO1FBQ3JCLENBQUM7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBa0JNLEtBQUssQ0FBQyxRQUFRLENBQStCLFVBQWtCLEVBQUUsZ0JBQTBDO1FBQzlHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELFlBQVk7UUFDWixNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDcEQsTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLEtBQUssU0FBUyxDQUFDO1FBRTlDLElBQUksTUFBTSxFQUFFLENBQUM7WUFDVCxvQkFBVSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsVUFBVSxhQUFhLENBQUMsQ0FBQztZQUNqRSxPQUFPLGdCQUFnQixDQUFDO1FBQzVCLENBQUM7UUFFRCxJQUFJLFFBQWdDLENBQUM7UUFFckMscUJBQXFCO1FBQ3JCLElBQUksZ0JBQWdCLElBQUksWUFBWSxJQUFJLGdCQUFnQixJQUFJLE9BQU8sZ0JBQWdCLENBQUMsR0FBRyxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ3JHLFFBQVE7WUFDUixRQUFRLEdBQUcsZ0JBQXFCLENBQUM7WUFDakMsZUFBZTtZQUNmLElBQUksUUFBUSxDQUFDLFVBQVUsS0FBSyxVQUFVLEVBQUUsQ0FBQztnQkFDckMsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsUUFBUSxDQUFDLFVBQVUsY0FBYyxVQUFVLFFBQVEsQ0FBQyxDQUFDO1lBQzdHLENBQUM7UUFDTCxDQUFDO2FBQU0sQ0FBQztZQUNKLG1CQUFtQjtZQUNuQixRQUFRLEdBQUcsSUFBSSwwQkFBaUIsQ0FBQyxVQUFVLEVBQUUsZ0JBQXVDLENBQUMsQ0FBQztRQUMxRixDQUFDO1FBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUM7UUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBVyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMxQyxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFrQjtRQUN0QyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUFXLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUM5RCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdEMsQ0FBQztDQUNKO0FBN0VELHNEQTZFQztBQUVEOztHQUVHO0FBQ1UsUUFBQSxxQkFBcUIsR0FBRyxJQUFJLHFCQUFxQixFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBuZXdDb25zb2xlIH0gZnJvbSAnLi4vLi4vYmFzZS9jb25zb2xlJztcclxuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscyc7XHJcbmltcG9ydCB7IElCYXNlQ29uZmlndXJhdGlvbiwgQmFzZUNvbmZpZ3VyYXRpb24gfSBmcm9tICcuL2NvbmZpZyc7XHJcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XHJcbmltcG9ydCB7IE1lc3NhZ2VUeXBlIH0gZnJvbSAnLi9pbnRlcmZhY2UnO1xyXG5cclxuLyoqXHJcbiAqIOmFjee9ruazqOWGjOWZqOaOpeWPo1xyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBJQ29uZmlndXJhdGlvblJlZ2lzdHJ5IHtcclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W5omA5pyJ6YWN572u5a6e5L6LXHJcbiAgICAgKi9cclxuICAgIGdldEluc3RhbmNlcygpOiBSZWNvcmQ8c3RyaW5nLCBJQmFzZUNvbmZpZ3VyYXRpb24+O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog6YCa6L+H5qih5Z2X5ZCN6I635Y+W6YWN572u5a6e5L6LXHJcbiAgICAgKiBAcGFyYW0gbW9kdWxlTmFtZVxyXG4gICAgICovXHJcbiAgICBnZXRJbnN0YW5jZShtb2R1bGVOYW1lOiBzdHJpbmcpOiBJQmFzZUNvbmZpZ3VyYXRpb24gfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jlhozphY3nva7vvIjkvb/nlKjpu5jorqTphY3nva7lr7nosaHvvIlcclxuICAgICAqIEBwYXJhbSBtb2R1bGVOYW1lIOaooeWdl+WQjVxyXG4gICAgICogQHBhcmFtIGRlZmF1bHRDb25maWcg6buY6K6k6YWN572u5a+56LGhXHJcbiAgICAgKiBAcmV0dXJucyDms6jlhozmiJDlip/ov5Tlm57phY3nva7lrp7kvovvvIzlpLHotKXov5Tlm54gbnVsbFxyXG4gICAgICovXHJcbiAgICByZWdpc3Rlcihtb2R1bGVOYW1lOiBzdHJpbmcsIGRlZmF1bHRDb25maWc/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxJQmFzZUNvbmZpZ3VyYXRpb24+O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog5rOo5YaM6YWN572u77yI5L2/55So6Ieq5a6a5LmJ6YWN572u5a6e5L6L77yJXHJcbiAgICAgKiBAcGFyYW0gbW9kdWxlTmFtZSDmqKHlnZflkI1cclxuICAgICAqIEBwYXJhbSBpbnN0YW5jZSDoh6rlrprkuYnphY3nva7lrp7kvotcclxuICAgICAqIEByZXR1cm5zIOazqOWGjOaIkOWKn+i/lOWbnumFjee9ruWunuS+i++8jOWksei0pei/lOWbniBudWxsXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdGVyPFQgZXh0ZW5kcyBJQmFzZUNvbmZpZ3VyYXRpb24+KG1vZHVsZU5hbWU6IHN0cmluZywgaW5zdGFuY2U6IFQpOiBQcm9taXNlPFQ+O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICog5Y+N5rOo5YaM6YWN572uXHJcbiAgICAgKiBAcGFyYW0gbW9kdWxlTmFtZVxyXG4gICAgICovXHJcbiAgICB1bnJlZ2lzdGVyKG1vZHVsZU5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDphY3nva7ms6jlhozlmajlrp7njrDnsbtcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb25maWd1cmF0aW9uUmVnaXN0cnkgZXh0ZW5kcyBFdmVudEVtaXR0ZXIgaW1wbGVtZW50cyBJQ29uZmlndXJhdGlvblJlZ2lzdHJ5IHtcclxuICAgIHByaXZhdGUgaW5zdGFuY2VzOiBSZWNvcmQ8c3RyaW5nLCBJQmFzZUNvbmZpZ3VyYXRpb24+ID0ge307XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bmiYDmnInphY3nva7lrp7kvotcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEluc3RhbmNlcygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbnN0YW5jZXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDpgJrov4fmqKHlnZflkI3ojrflj5bphY3nva7lrp7kvotcclxuICAgICAqIEBwYXJhbSBtb2R1bGVOYW1lXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRJbnN0YW5jZShtb2R1bGVOYW1lOiBzdHJpbmcpOiBJQmFzZUNvbmZpZ3VyYXRpb24gfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gdGhpcy5pbnN0YW5jZXNbbW9kdWxlTmFtZV07XHJcbiAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtDb25maWd1cmF0aW9uXSDojrflj5bphY3nva7lrp7kvovplJnor6/vvIwke21vZHVsZU5hbWV9IOacquazqOWGjOmFjee9ruOAgmApO1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDms6jlhozphY3nva7vvIjkvb/nlKjpu5jorqTphY3nva7lr7nosaHvvIlcclxuICAgICAqIEBwYXJhbSBtb2R1bGVOYW1lIOaooeWdl+WQjVxyXG4gICAgICogQHBhcmFtIGRlZmF1bHRDb25maWcg6buY6K6k6YWN572u5a+56LGhXHJcbiAgICAgKiBAcmV0dXJucyDms6jlhozmiJDlip/ov5Tlm57phY3nva7lrp7kvovvvIzlpLHotKXmiqXplJlcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFzeW5jIHJlZ2lzdGVyKG1vZHVsZU5hbWU6IHN0cmluZywgZGVmYXVsdENvbmZpZz86IFJlY29yZDxzdHJpbmcsIGFueT4pOiBQcm9taXNlPElCYXNlQ29uZmlndXJhdGlvbj47XHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICog5rOo5YaM6YWN572u77yI5L2/55So6Ieq5a6a5LmJ6YWN572u5a6e5L6L77yJXHJcbiAgICAgKiBAcGFyYW0gbW9kdWxlTmFtZSDmqKHlnZflkI1cclxuICAgICAqIEBwYXJhbSBpbnN0YW5jZSDoh6rlrprkuYnphY3nva7lrp7kvotcclxuICAgICAqIEByZXR1cm5zIOazqOWGjOaIkOWKn+i/lOWbnumFjee9ruWunuS+i++8jOWksei0peaKpemUmVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXN5bmMgcmVnaXN0ZXI8VCBleHRlbmRzIElCYXNlQ29uZmlndXJhdGlvbj4obW9kdWxlTmFtZTogc3RyaW5nLCBpbnN0YW5jZTogVCk6IFByb21pc2U8VD47XHJcbiAgICBcclxuICAgIHB1YmxpYyBhc3luYyByZWdpc3RlcjxUIGV4dGVuZHMgSUJhc2VDb25maWd1cmF0aW9uPihtb2R1bGVOYW1lOiBzdHJpbmcsIGNvbmZpZ09ySW5zdGFuY2U/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgVCk6IFByb21pc2U8SUJhc2VDb25maWd1cmF0aW9uIHwgVD4ge1xyXG4gICAgICAgIGlmICghdXRpbHMuaXNWYWxpZENvbmZpZ0tleShtb2R1bGVOYW1lKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1tDb25maWd1cmF0aW9uXSDms6jlhozphY3nva7lpLHotKXvvJrmqKHlnZflkI3kuI3og73kuLrnqbrjgIInKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8g5qOA5p+l6YWN572u5piv5ZCm5bey5a2Y5ZyoXHJcbiAgICAgICAgY29uc3QgZXhpc3RpbmdJbnN0YW5jZSA9IHRoaXMuaW5zdGFuY2VzW21vZHVsZU5hbWVdO1xyXG4gICAgICAgIGNvbnN0IGV4aXN0cyA9IGV4aXN0aW5nSW5zdGFuY2UgIT09IHVuZGVmaW5lZDtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoZXhpc3RzKSB7XHJcbiAgICAgICAgICAgIG5ld0NvbnNvbGUud2FybihgW0NvbmZpZ3VyYXRpb25dIOmFjee9rumhuSBcIiR7bW9kdWxlTmFtZX1cIiDlt7LlrZjlnKjvvIzot7Pov4fms6jlhozjgIJgKTtcclxuICAgICAgICAgICAgcmV0dXJuIGV4aXN0aW5nSW5zdGFuY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpbnN0YW5jZTogSUJhc2VDb25maWd1cmF0aW9uIHwgVDtcclxuICAgICAgICBcclxuICAgICAgICAvLyDliKTmlq3nrKzkuozkuKrlj4LmlbDmmK/phY3nva7lr7nosaHov5jmmK/phY3nva7lrp7kvotcclxuICAgICAgICBpZiAoY29uZmlnT3JJbnN0YW5jZSAmJiAnbW9kdWxlTmFtZScgaW4gY29uZmlnT3JJbnN0YW5jZSAmJiB0eXBlb2YgY29uZmlnT3JJbnN0YW5jZS5nZXQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgLy8g5piv6YWN572u5a6e5L6LXHJcbiAgICAgICAgICAgIGluc3RhbmNlID0gY29uZmlnT3JJbnN0YW5jZSBhcyBUO1xyXG4gICAgICAgICAgICAvLyDpqozor4Hlrp7kvovnmoTmqKHlnZflkI3mmK/lkKbljLnphY1cclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlLm1vZHVsZU5hbWUgIT09IG1vZHVsZU5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgW0NvbmZpZ3VyYXRpb25dIOazqOWGjOmFjee9ruWksei0pe+8mumFjee9ruWunuS+i+eahOaooeWdl+WQjSBcIiR7aW5zdGFuY2UubW9kdWxlTmFtZX1cIiDkuI7ms6jlhoznmoTmqKHlnZflkI0gXCIke21vZHVsZU5hbWV9XCIg5LiN5Yy56YWN44CCYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyDmmK/phY3nva7lr7nosaHmiJYgdW5kZWZpbmVkXHJcbiAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IEJhc2VDb25maWd1cmF0aW9uKG1vZHVsZU5hbWUsIGNvbmZpZ09ySW5zdGFuY2UgYXMgUmVjb3JkPHN0cmluZywgYW55Pik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuaW5zdGFuY2VzW21vZHVsZU5hbWVdID0gaW5zdGFuY2U7XHJcbiAgICAgICAgdGhpcy5lbWl0KE1lc3NhZ2VUeXBlLlJlZ2lzdHJ5LCBpbnN0YW5jZSk7XHJcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyB1bnJlZ2lzdGVyKG1vZHVsZU5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHRoaXMuZW1pdChNZXNzYWdlVHlwZS5VblJlZ2lzdHJ5LCB0aGlzLmluc3RhbmNlc1ttb2R1bGVOYW1lXSk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuaW5zdGFuY2VzW21vZHVsZU5hbWVdO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICog6buY6K6k6YWN572u5rOo5YaM5Zmo5a6e5L6LXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgY29uZmlndXJhdGlvblJlZ2lzdHJ5ID0gbmV3IENvbmZpZ3VyYXRpb25SZWdpc3RyeSgpO1xyXG4iXX0=