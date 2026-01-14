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
exports.parseMangleConfig = parseMangleConfig;
const fs = __importStar(require("fs-extra"));
function mergeConfigs(baseConfig, extendConfig) {
    return {
        mangleProtected: extendConfig.mangleProtected !== undefined ? extendConfig.mangleProtected : baseConfig.mangleProtected,
        mangleList: [...(baseConfig.mangleList || []), ...(extendConfig.mangleList || [])],
        dontMangleList: [...(baseConfig.dontMangleList || []), ...(extendConfig.dontMangleList || [])],
        extends: baseConfig.extends,
    };
}
function parseMangleConfig(filePath, platform) {
    if (!fs.existsSync(filePath)) {
        return undefined;
    }
    const configFile = fs.readJSONSync(filePath, 'utf-8');
    if (!configFile[platform]) {
        throw new Error(`Platform ${platform} not found in the configuration file.`);
    }
    let config = configFile[platform];
    while (config.extends) {
        const baseConfig = configFile[config.extends];
        if (!baseConfig) {
            throw new Error(`Base configuration ${config.extends} not found.`);
        }
        config = mergeConfigs(baseConfig, config);
    }
    return config;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFuZ2xlLWNvbmZpZy1wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL2Fzc2V0LWhhbmRsZXIvc2NyaXB0L21hbmdsZS1jb25maWctcGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JBLDhDQW9CQztBQTFDRCw2Q0FBK0I7QUFhL0IsU0FBUyxZQUFZLENBQUMsVUFBd0IsRUFBRSxZQUEwQjtJQUN0RSxPQUFPO1FBQ0gsZUFBZSxFQUFFLFlBQVksQ0FBQyxlQUFlLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsZUFBZTtRQUN2SCxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNsRixjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUM5RixPQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU87S0FDOUIsQ0FBQztBQUNOLENBQUM7QUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxRQUFnQixFQUFFLFFBQWdCO0lBQ2hFLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDM0IsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUNELE1BQU0sVUFBVSxHQUFlLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRWxFLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLFlBQVksUUFBUSx1Q0FBdUMsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFFRCxJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEMsT0FBTyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDcEIsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDZCxNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixNQUFNLENBQUMsT0FBTyxhQUFhLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBQ0QsTUFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE1hbmdsZUNvbmZpZyB7XHJcbiAgICBtYW5nbGVQcm90ZWN0ZWQ/OiBib29sZWFuO1xyXG4gICAgbWFuZ2xlTGlzdD86IHN0cmluZ1tdO1xyXG4gICAgZG9udE1hbmdsZUxpc3Q/OiBzdHJpbmdbXTtcclxuICAgIGV4dGVuZHM/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmludGVyZmFjZSBDb25maWdGaWxlIHtcclxuICAgIFtrZXk6IHN0cmluZ106IE1hbmdsZUNvbmZpZztcclxufVxyXG5cclxuZnVuY3Rpb24gbWVyZ2VDb25maWdzKGJhc2VDb25maWc6IE1hbmdsZUNvbmZpZywgZXh0ZW5kQ29uZmlnOiBNYW5nbGVDb25maWcpOiBNYW5nbGVDb25maWcge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBtYW5nbGVQcm90ZWN0ZWQ6IGV4dGVuZENvbmZpZy5tYW5nbGVQcm90ZWN0ZWQgIT09IHVuZGVmaW5lZCA/IGV4dGVuZENvbmZpZy5tYW5nbGVQcm90ZWN0ZWQgOiBiYXNlQ29uZmlnLm1hbmdsZVByb3RlY3RlZCxcclxuICAgICAgICBtYW5nbGVMaXN0OiBbLi4uKGJhc2VDb25maWcubWFuZ2xlTGlzdCB8fCBbXSksIC4uLihleHRlbmRDb25maWcubWFuZ2xlTGlzdCB8fCBbXSldLFxyXG4gICAgICAgIGRvbnRNYW5nbGVMaXN0OiBbLi4uKGJhc2VDb25maWcuZG9udE1hbmdsZUxpc3QgfHwgW10pLCAuLi4oZXh0ZW5kQ29uZmlnLmRvbnRNYW5nbGVMaXN0IHx8IFtdKV0sXHJcbiAgICAgICAgZXh0ZW5kczogYmFzZUNvbmZpZy5leHRlbmRzLFxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTWFuZ2xlQ29uZmlnKGZpbGVQYXRoOiBzdHJpbmcsIHBsYXRmb3JtOiBzdHJpbmcpOiBNYW5nbGVDb25maWcgfCB1bmRlZmluZWQge1xyXG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGZpbGVQYXRoKSkge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBjb25zdCBjb25maWdGaWxlOiBDb25maWdGaWxlID0gZnMucmVhZEpTT05TeW5jKGZpbGVQYXRoLCAndXRmLTgnKTtcclxuXHJcbiAgICBpZiAoIWNvbmZpZ0ZpbGVbcGxhdGZvcm1dKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQbGF0Zm9ybSAke3BsYXRmb3JtfSBub3QgZm91bmQgaW4gdGhlIGNvbmZpZ3VyYXRpb24gZmlsZS5gKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgY29uZmlnID0gY29uZmlnRmlsZVtwbGF0Zm9ybV07XHJcbiAgICB3aGlsZSAoY29uZmlnLmV4dGVuZHMpIHtcclxuICAgICAgICBjb25zdCBiYXNlQ29uZmlnID0gY29uZmlnRmlsZVtjb25maWcuZXh0ZW5kc107XHJcbiAgICAgICAgaWYgKCFiYXNlQ29uZmlnKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQmFzZSBjb25maWd1cmF0aW9uICR7Y29uZmlnLmV4dGVuZHN9IG5vdCBmb3VuZC5gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uZmlnID0gbWVyZ2VDb25maWdzKGJhc2VDb25maWcsIGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvbmZpZztcclxufVxyXG4iXX0=