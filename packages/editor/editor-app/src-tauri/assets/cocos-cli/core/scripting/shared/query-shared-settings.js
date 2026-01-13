"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scriptConfig = void 0;
exports.getDefaultSharedSettings = getDefaultSharedSettings;
exports.querySharedSettings = querySharedSettings;
const fs_extra_1 = __importDefault(require("fs-extra"));
const url_1 = require("url");
const fs_1 = require("fs");
const configuration_1 = require("../../configuration");
const utils_1 = __importDefault(require("../../base/utils"));
function getDefaultSharedSettings() {
    return {
        useDefineForClassFields: true,
        allowDeclareFields: true,
        loose: false,
        guessCommonJsExports: false,
        exportsConditions: [],
        preserveSymlinks: false,
        importMap: '',
        previewBrowserslistConfigFile: '',
        updateAutoUpdateImportConfig: false,
    };
}
class ScriptConfig {
    _config = getDefaultSharedSettings();
    /**
     * 持有的可双向绑定的配置管理实例
     * TODO 目前没有防护没有 init 的情况
     */
    _configInstance;
    _init = false;
    async init() {
        if (this._init) {
            return;
        }
        this._configInstance = await configuration_1.configurationRegistry.register('script', getDefaultSharedSettings());
        this._init = true;
    }
    getProject(path, scope) {
        return this._configInstance.get(path, scope);
    }
    setProject(path, value, scope) {
        return this._configInstance.set(path, value, scope);
    }
}
exports.scriptConfig = new ScriptConfig();
async function querySharedSettings(logger) {
    const { useDefineForClassFields, allowDeclareFields, loose, guessCommonJsExports, exportsConditions, importMap: importMapFile, preserveSymlinks, } = await exports.scriptConfig.getProject();
    let importMap;
    // ui-file 可能因为清空产生 project:// 这样的数据，应视为空字符串一样的处理逻辑
    if (importMapFile && importMapFile !== 'project://') {
        const importMapFilePath = utils_1.default.Path.resolveToRaw(importMapFile);
        if (importMapFilePath && (0, fs_1.existsSync)(importMapFilePath)) {
            try {
                const importMapJson = await fs_extra_1.default.readJson(importMapFilePath, { encoding: 'utf8' });
                if (!verifyImportMapJson(importMapJson)) {
                    logger.error('Ill-formed import map.');
                }
                else {
                    importMap = {
                        json: importMapJson,
                        url: (0, url_1.pathToFileURL)(importMapFilePath).href,
                    };
                }
            }
            catch (err) {
                logger.error(`Failed to load import map at ${importMapFile}: ${err}`);
            }
        }
        else {
            logger.warn(`Import map file not found in: ${importMapFilePath || importMapFile}`);
        }
    }
    return {
        useDefineForClassFields: useDefineForClassFields ?? true,
        allowDeclareFields: allowDeclareFields ?? true,
        loose: loose ?? false,
        exportsConditions: exportsConditions ?? [],
        guessCommonJsExports: guessCommonJsExports ?? false,
        importMap,
        preserveSymlinks: preserveSymlinks ?? false,
    };
}
/**
 * Verify the unknown input value is allowed shape of an import map.
 * This is not parse.
 * @param input
 * @param logger
 * @returns
 */
function verifyImportMapJson(input) {
    if (typeof input !== 'object' || !input) {
        return false;
    }
    const verifySpecifierMap = (specifierMapInput) => {
        if (typeof specifierMapInput !== 'object' || !specifierMapInput) {
            return false;
        }
        for (const value of Object.values(specifierMapInput)) {
            if (typeof value !== 'string') {
                return false;
            }
        }
        return true;
    };
    if ('imports' in input) {
        if (!verifySpecifierMap(input.imports)) {
            return false;
        }
    }
    if ('scopes' in input) {
        for (const value of Object.values(input)) {
            if (!verifySpecifierMap(value)) {
                return false;
            }
        }
    }
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktc2hhcmVkLXNldHRpbmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvc2NyaXB0aW5nL3NoYXJlZC9xdWVyeS1zaGFyZWQtc2V0dGluZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBd0JBLDREQVlDO0FBK0JELGtEQTJDQztBQTVHRCx3REFBMEI7QUFDMUIsNkJBQW9DO0FBR3BDLDJCQUFnQztBQUNoQyx1REFBb0c7QUFDcEcsNkRBQXFDO0FBZ0JyQyxTQUFnQix3QkFBd0I7SUFDcEMsT0FBTztRQUNILHVCQUF1QixFQUFFLElBQUk7UUFDN0Isa0JBQWtCLEVBQUUsSUFBSTtRQUN4QixLQUFLLEVBQUUsS0FBSztRQUNaLG9CQUFvQixFQUFFLEtBQUs7UUFDM0IsaUJBQWlCLEVBQUUsRUFBRTtRQUNyQixnQkFBZ0IsRUFBRSxLQUFLO1FBQ3ZCLFNBQVMsRUFBRSxFQUFFO1FBQ2IsNkJBQTZCLEVBQUUsRUFBRTtRQUNqQyw0QkFBNEIsRUFBRSxLQUFLO0tBQ3RDLENBQUM7QUFDTixDQUFDO0FBRUQsTUFBTSxZQUFZO0lBQ04sT0FBTyxHQUF3Qix3QkFBd0IsRUFBRSxDQUFDO0lBQ2xFOzs7T0FHRztJQUNLLGVBQWUsQ0FBc0I7SUFFckMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUV0QixLQUFLLENBQUMsSUFBSTtRQUNOLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2IsT0FBTztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0scUNBQXFCLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSx3QkFBd0IsRUFBRSxDQUFDLENBQUM7UUFDbEcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQUVELFVBQVUsQ0FBSSxJQUFhLEVBQUUsS0FBMEI7UUFDbkQsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBSSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFZLEVBQUUsS0FBVSxFQUFFLEtBQTBCO1FBQzNELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4RCxDQUFDO0NBQ0o7QUFFWSxRQUFBLFlBQVksR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO0FBRXhDLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxNQUFjO0lBQ3BELE1BQU0sRUFDRix1QkFBdUIsRUFDdkIsa0JBQWtCLEVBQ2xCLEtBQUssRUFDTCxvQkFBb0IsRUFDcEIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFBRSxhQUFhLEVBQ3hCLGdCQUFnQixHQUNuQixHQUFHLE1BQU0sb0JBQVksQ0FBQyxVQUFVLEVBQXVCLENBQUM7SUFFekQsSUFBSSxTQUFzQyxDQUFDO0lBQzNDLG1EQUFtRDtJQUNuRCxJQUFJLGFBQWEsSUFBSSxhQUFhLEtBQUssWUFBWSxFQUFFLENBQUM7UUFDbEQsTUFBTSxpQkFBaUIsR0FBRyxlQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNqRSxJQUFJLGlCQUFpQixJQUFJLElBQUEsZUFBVSxFQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQztZQUNyRCxJQUFJLENBQUM7Z0JBQ0QsTUFBTSxhQUFhLEdBQUcsTUFBTSxrQkFBRSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBWSxDQUFDO2dCQUM1RixJQUFJLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztvQkFDdEMsTUFBTSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2dCQUMzQyxDQUFDO3FCQUFNLENBQUM7b0JBQ0osU0FBUyxHQUFHO3dCQUNSLElBQUksRUFBRSxhQUFhO3dCQUNuQixHQUFHLEVBQUUsSUFBQSxtQkFBYSxFQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSTtxQkFDN0MsQ0FBQztnQkFDTixDQUFDO1lBQ0wsQ0FBQztZQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Z0JBQ1gsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsYUFBYSxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDMUUsQ0FBQztRQUNMLENBQUM7YUFBTSxDQUFDO1lBQ0osTUFBTSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsaUJBQWlCLElBQUksYUFBYSxFQUFFLENBQUMsQ0FBQztRQUN2RixDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU87UUFDSCx1QkFBdUIsRUFBRSx1QkFBdUIsSUFBSSxJQUFJO1FBQ3hELGtCQUFrQixFQUFFLGtCQUFrQixJQUFJLElBQUk7UUFDOUMsS0FBSyxFQUFFLEtBQUssSUFBSSxLQUFLO1FBQ3JCLGlCQUFpQixFQUFFLGlCQUFpQixJQUFJLEVBQUU7UUFDMUMsb0JBQW9CLEVBQUUsb0JBQW9CLElBQUksS0FBSztRQUNuRCxTQUFTO1FBQ1QsZ0JBQWdCLEVBQUUsZ0JBQWdCLElBQUksS0FBSztLQUM5QyxDQUFDO0FBQ04sQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQVMsbUJBQW1CLENBQUMsS0FBYztJQUN2QyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3RDLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxNQUFNLGtCQUFrQixHQUFHLENBQUMsaUJBQTBCLEVBQStDLEVBQUU7UUFDbkcsSUFBSSxPQUFPLGlCQUFpQixLQUFLLFFBQVEsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDOUQsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUNELEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7WUFDbkQsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDNUIsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDLENBQUM7SUFFRixJQUFJLFNBQVMsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsa0JBQWtCLENBQUUsS0FBOEIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQy9ELE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7SUFDTCxDQUFDO0lBQ0QsSUFBSSxRQUFRLElBQUksS0FBSyxFQUFFLENBQUM7UUFDcEIsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzdCLE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuaW1wb3J0IHBzIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xyXG5pbXBvcnQgeyBwYXRoVG9GaWxlVVJMIH0gZnJvbSAndXJsJztcclxuaW1wb3J0IHR5cGUgeyBJbXBvcnRNYXAgfSBmcm9tICdAY29jb3MvY3JlYXRvci1wcm9ncmFtbWluZy1pbXBvcnQtbWFwcy9saWIvaW1wb3J0LW1hcCc7XHJcbmltcG9ydCB0eXBlIHsgTG9nZ2VyIH0gZnJvbSAnQGNvY29zL2NyZWF0b3ItcHJvZ3JhbW1pbmctY29tbW9uL2xpYi9sb2dnZXInO1xyXG5pbXBvcnQgeyBleGlzdHNTeW5jIH0gZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBjb25maWd1cmF0aW9uUmVnaXN0cnksIENvbmZpZ3VyYXRpb25TY29wZSwgSUJhc2VDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vLi4vY29uZmlndXJhdGlvbic7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9iYXNlL3V0aWxzJztcclxuaW1wb3J0IHsgU2NyaXB0UHJvamVjdENvbmZpZyB9IGZyb20gJy4uL0B0eXBlcy9jb25maWctZXhwb3J0JztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2hhcmVkU2V0dGluZ3MgZXh0ZW5kcyBQaWNrPFNjcmlwdFByb2plY3RDb25maWcsICd1c2VEZWZpbmVGb3JDbGFzc0ZpZWxkcycgfCAnYWxsb3dEZWNsYXJlRmllbGRzJyB8ICdsb29zZScgfCAnZ3Vlc3NDb21tb25Kc0V4cG9ydHMnIHwgJ2V4cG9ydHNDb25kaXRpb25zJz4ge1xyXG4gICAgdXNlRGVmaW5lRm9yQ2xhc3NGaWVsZHM6IGJvb2xlYW47XHJcbiAgICBhbGxvd0RlY2xhcmVGaWVsZHM6IGJvb2xlYW47XHJcbiAgICBsb29zZTogYm9vbGVhbjtcclxuICAgIGd1ZXNzQ29tbW9uSnNFeHBvcnRzOiBib29sZWFuO1xyXG4gICAgZXhwb3J0c0NvbmRpdGlvbnM6IHN0cmluZ1tdO1xyXG4gICAgaW1wb3J0TWFwPzoge1xyXG4gICAgICAgIGpzb246IEltcG9ydE1hcDtcclxuICAgICAgICB1cmw6IHN0cmluZztcclxuICAgIH07XHJcbiAgICBwcmVzZXJ2ZVN5bWxpbmtzOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdFNoYXJlZFNldHRpbmdzKCk6IFNjcmlwdFByb2plY3RDb25maWcge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB1c2VEZWZpbmVGb3JDbGFzc0ZpZWxkczogdHJ1ZSxcclxuICAgICAgICBhbGxvd0RlY2xhcmVGaWVsZHM6IHRydWUsXHJcbiAgICAgICAgbG9vc2U6IGZhbHNlLFxyXG4gICAgICAgIGd1ZXNzQ29tbW9uSnNFeHBvcnRzOiBmYWxzZSxcclxuICAgICAgICBleHBvcnRzQ29uZGl0aW9uczogW10sXHJcbiAgICAgICAgcHJlc2VydmVTeW1saW5rczogZmFsc2UsXHJcbiAgICAgICAgaW1wb3J0TWFwOiAnJyxcclxuICAgICAgICBwcmV2aWV3QnJvd3NlcnNsaXN0Q29uZmlnRmlsZTogJycsXHJcbiAgICAgICAgdXBkYXRlQXV0b1VwZGF0ZUltcG9ydENvbmZpZzogZmFsc2UsXHJcbiAgICB9O1xyXG59XHJcblxyXG5jbGFzcyBTY3JpcHRDb25maWcge1xyXG4gICAgcHJpdmF0ZSBfY29uZmlnOiBTY3JpcHRQcm9qZWN0Q29uZmlnID0gZ2V0RGVmYXVsdFNoYXJlZFNldHRpbmdzKCk7XHJcbiAgICAvKipcclxuICAgICAqIOaMgeacieeahOWPr+WPjOWQkee7keWumueahOmFjee9rueuoeeQhuWunuS+i1xyXG4gICAgICogVE9ETyDnm67liY3msqHmnInpmLLmiqTmsqHmnIkgaW5pdCDnmoTmg4XlhrVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfY29uZmlnSW5zdGFuY2UhOiBJQmFzZUNvbmZpZ3VyYXRpb247XHJcblxyXG4gICAgcHJpdmF0ZSBfaW5pdCA9IGZhbHNlO1xyXG5cclxuICAgIGFzeW5jIGluaXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2luaXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jb25maWdJbnN0YW5jZSA9IGF3YWl0IGNvbmZpZ3VyYXRpb25SZWdpc3RyeS5yZWdpc3Rlcignc2NyaXB0JywgZ2V0RGVmYXVsdFNoYXJlZFNldHRpbmdzKCkpO1xyXG4gICAgICAgIHRoaXMuX2luaXQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFByb2plY3Q8VD4ocGF0aD86IHN0cmluZywgc2NvcGU/OiBDb25maWd1cmF0aW9uU2NvcGUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnSW5zdGFuY2UuZ2V0PFQ+KHBhdGgsIHNjb3BlKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQcm9qZWN0KHBhdGg6IHN0cmluZywgdmFsdWU6IGFueSwgc2NvcGU/OiBDb25maWd1cmF0aW9uU2NvcGUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY29uZmlnSW5zdGFuY2Uuc2V0KHBhdGgsIHZhbHVlLCBzY29wZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBzY3JpcHRDb25maWcgPSBuZXcgU2NyaXB0Q29uZmlnKCk7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcXVlcnlTaGFyZWRTZXR0aW5ncyhsb2dnZXI6IExvZ2dlcik6IFByb21pc2U8U2hhcmVkU2V0dGluZ3M+IHtcclxuICAgIGNvbnN0IHtcclxuICAgICAgICB1c2VEZWZpbmVGb3JDbGFzc0ZpZWxkcyxcclxuICAgICAgICBhbGxvd0RlY2xhcmVGaWVsZHMsXHJcbiAgICAgICAgbG9vc2UsXHJcbiAgICAgICAgZ3Vlc3NDb21tb25Kc0V4cG9ydHMsXHJcbiAgICAgICAgZXhwb3J0c0NvbmRpdGlvbnMsXHJcbiAgICAgICAgaW1wb3J0TWFwOiBpbXBvcnRNYXBGaWxlLFxyXG4gICAgICAgIHByZXNlcnZlU3ltbGlua3MsXHJcbiAgICB9ID0gYXdhaXQgc2NyaXB0Q29uZmlnLmdldFByb2plY3Q8U2NyaXB0UHJvamVjdENvbmZpZz4oKTtcclxuXHJcbiAgICBsZXQgaW1wb3J0TWFwOiBTaGFyZWRTZXR0aW5nc1snaW1wb3J0TWFwJ107XHJcbiAgICAvLyB1aS1maWxlIOWPr+iDveWboOS4uua4heepuuS6p+eUnyBwcm9qZWN0Oi8vIOi/meagt+eahOaVsOaNru+8jOW6lOinhuS4uuepuuWtl+espuS4suS4gOagt+eahOWkhOeQhumAu+i+kVxyXG4gICAgaWYgKGltcG9ydE1hcEZpbGUgJiYgaW1wb3J0TWFwRmlsZSAhPT0gJ3Byb2plY3Q6Ly8nKSB7XHJcbiAgICAgICAgY29uc3QgaW1wb3J0TWFwRmlsZVBhdGggPSBVdGlscy5QYXRoLnJlc29sdmVUb1JhdyhpbXBvcnRNYXBGaWxlKTtcclxuICAgICAgICBpZiAoaW1wb3J0TWFwRmlsZVBhdGggJiYgZXhpc3RzU3luYyhpbXBvcnRNYXBGaWxlUGF0aCkpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGltcG9ydE1hcEpzb24gPSBhd2FpdCBmcy5yZWFkSnNvbihpbXBvcnRNYXBGaWxlUGF0aCwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pIGFzIHVua25vd247XHJcbiAgICAgICAgICAgICAgICBpZiAoIXZlcmlmeUltcG9ydE1hcEpzb24oaW1wb3J0TWFwSnNvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0lsbC1mb3JtZWQgaW1wb3J0IG1hcC4nKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1wb3J0TWFwID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBqc29uOiBpbXBvcnRNYXBKc29uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHBhdGhUb0ZpbGVVUkwoaW1wb3J0TWFwRmlsZVBhdGgpLmhyZWYsXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYEZhaWxlZCB0byBsb2FkIGltcG9ydCBtYXAgYXQgJHtpbXBvcnRNYXBGaWxlfTogJHtlcnJ9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsb2dnZXIud2FybihgSW1wb3J0IG1hcCBmaWxlIG5vdCBmb3VuZCBpbjogJHtpbXBvcnRNYXBGaWxlUGF0aCB8fCBpbXBvcnRNYXBGaWxlfWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHVzZURlZmluZUZvckNsYXNzRmllbGRzOiB1c2VEZWZpbmVGb3JDbGFzc0ZpZWxkcyA/PyB0cnVlLFxyXG4gICAgICAgIGFsbG93RGVjbGFyZUZpZWxkczogYWxsb3dEZWNsYXJlRmllbGRzID8/IHRydWUsXHJcbiAgICAgICAgbG9vc2U6IGxvb3NlID8/IGZhbHNlLFxyXG4gICAgICAgIGV4cG9ydHNDb25kaXRpb25zOiBleHBvcnRzQ29uZGl0aW9ucyA/PyBbXSxcclxuICAgICAgICBndWVzc0NvbW1vbkpzRXhwb3J0czogZ3Vlc3NDb21tb25Kc0V4cG9ydHMgPz8gZmFsc2UsXHJcbiAgICAgICAgaW1wb3J0TWFwLFxyXG4gICAgICAgIHByZXNlcnZlU3ltbGlua3M6IHByZXNlcnZlU3ltbGlua3MgPz8gZmFsc2UsXHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogVmVyaWZ5IHRoZSB1bmtub3duIGlucHV0IHZhbHVlIGlzIGFsbG93ZWQgc2hhcGUgb2YgYW4gaW1wb3J0IG1hcC5cclxuICogVGhpcyBpcyBub3QgcGFyc2UuXHJcbiAqIEBwYXJhbSBpbnB1dCBcclxuICogQHBhcmFtIGxvZ2dlciBcclxuICogQHJldHVybnMgXHJcbiAqL1xyXG5mdW5jdGlvbiB2ZXJpZnlJbXBvcnRNYXBKc29uKGlucHV0OiB1bmtub3duKTogaW5wdXQgaXMgSW1wb3J0TWFwIHtcclxuICAgIGlmICh0eXBlb2YgaW5wdXQgIT09ICdvYmplY3QnIHx8ICFpbnB1dCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2ZXJpZnlTcGVjaWZpZXJNYXAgPSAoc3BlY2lmaWVyTWFwSW5wdXQ6IHVua25vd24pOiBzcGVjaWZpZXJNYXBJbnB1dCBpcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIHNwZWNpZmllck1hcElucHV0ICE9PSAnb2JqZWN0JyB8fCAhc3BlY2lmaWVyTWFwSW5wdXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIE9iamVjdC52YWx1ZXMoc3BlY2lmaWVyTWFwSW5wdXQpKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIGlmICgnaW1wb3J0cycgaW4gaW5wdXQpIHtcclxuICAgICAgICBpZiAoIXZlcmlmeVNwZWNpZmllck1hcCgoaW5wdXQgYXMgeyBpbXBvcnRzOiB1bmtub3duIH0pLmltcG9ydHMpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoJ3Njb3BlcycgaW4gaW5wdXQpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIE9iamVjdC52YWx1ZXMoaW5wdXQpKSB7XHJcbiAgICAgICAgICAgIGlmICghdmVyaWZ5U3BlY2lmaWVyTWFwKHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbiJdfQ==