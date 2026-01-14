"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultBundleConfig = exports.BundlePlatformTypes = exports.BundlecompressionTypeMap = exports.BuiltinBundleName = exports.BundleCompressionTypes = void 0;
exports.getBundleDefaultName = getBundleDefaultName;
exports.transformPlatformSettings = transformPlatformSettings;
exports.checkRemoteDisabled = checkRemoteDisabled;
exports.getInvalidRemote = getInvalidRemote;
const path_1 = require("path");
var BundleCompressionTypes;
(function (BundleCompressionTypes) {
    BundleCompressionTypes["NONE"] = "none";
    BundleCompressionTypes["MERGE_DEP"] = "merge_dep";
    BundleCompressionTypes["MERGE_ALL_JSON"] = "merge_all_json";
    BundleCompressionTypes["SUBPACKAGE"] = "subpackage";
    BundleCompressionTypes["ZIP"] = "zip";
})(BundleCompressionTypes || (exports.BundleCompressionTypes = BundleCompressionTypes = {}));
var BuiltinBundleName;
(function (BuiltinBundleName) {
    BuiltinBundleName["RESOURCES"] = "resources";
    BuiltinBundleName["MAIN"] = "main";
    BuiltinBundleName["START_SCENE"] = "start-scene";
    BuiltinBundleName["INTERNAL"] = "internal";
})(BuiltinBundleName || (exports.BuiltinBundleName = BuiltinBundleName = {}));
function getBundleDefaultName(assetInfo) {
    return (0, path_1.basename)(assetInfo.source).replace(/[^a-zA-Z0-9_-]/g, '_');
}
exports.BundlecompressionTypeMap = {
    [BundleCompressionTypes.NONE]: 'i18n:builder.asset_bundle.none',
    [BundleCompressionTypes.SUBPACKAGE]: 'i18n:builder.asset_bundle.subpackage',
    [BundleCompressionTypes.MERGE_DEP]: 'i18n:builder.asset_bundle.merge_dep',
    [BundleCompressionTypes.MERGE_ALL_JSON]: 'i18n:builder.asset_bundle.merge_all_json',
    [BundleCompressionTypes.ZIP]: 'i18n:builder.asset_bundle.zip',
};
exports.BundlePlatformTypes = {
    native: {
        icon: 'mobile',
        displayName: 'i18n:builder.asset_bundle.native',
    },
    web: {
        icon: 'html5',
        displayName: 'i18n:builder.asset_bundle.web',
    },
    miniGame: {
        icon: 'mini-game',
        displayName: 'i18n:builder.asset_bundle.minigame',
    },
};
exports.DefaultBundleConfig = {
    displayName: 'i18n:builder.asset_bundle.defaultConfig',
    configs: {
        native: {
            preferredOptions: {
                isRemote: false,
                compressionType: 'merge_dep',
            },
        },
        web: {
            preferredOptions: {
                isRemote: false,
                compressionType: 'merge_dep',
            },
            fallbackOptions: {
                compressionType: 'merge_dep',
            },
        },
        miniGame: {
            fallbackOptions: {
                isRemote: false,
                compressionType: 'merge_dep',
            },
            configMode: 'fallback',
        },
    },
};
function transformPlatformSettings(config, platformConfigs) {
    const res = {};
    Object.keys(platformConfigs).forEach((platform) => {
        const option = getValidOption(platform, config, platformConfigs);
        option.isRemote = getInvalidRemote(option.compressionType || 'merge_dep', option.isRemote);
        option.compressionType = option.compressionType || BundleCompressionTypes.MERGE_DEP;
        res[platform] = option;
    });
    return res;
}
function getValidOption(platform, config, platformConfigs) {
    const mode = config.configMode || (platformConfigs[platform].platformType === 'miniGame' ? 'fallback' : 'auto');
    // mode 为 fallback 时， 优先使用回退选项
    if (mode === 'fallback' && config.fallbackOptions) {
        return {
            ...config.preferredOptions,
            compressionType: config.fallbackOptions.compressionType,
            isRemote: config.fallbackOptions.isRemote ?? false,
        };
    }
    // 有针对平台的设置，优先使用平台设置
    if (config.overwriteSettings && config.overwriteSettings[platform]) {
        return config.overwriteSettings[platform];
    }
    const support = platformConfigs[platform].supportOptions.compressionType;
    if (mode === 'overwrite' && (!config.overwriteSettings || !config.overwriteSettings[platform])) {
        return {
            compressionType: BundleCompressionTypes.MERGE_DEP,
            isRemote: false,
        };
    }
    // 偏好设置的选项，平台都支持，直接使用
    if (config.preferredOptions && support.includes(config.preferredOptions.compressionType)) {
        return config.preferredOptions;
    }
    // 有回退选项时，优先使用回退选项
    if (config.fallbackOptions) {
        return {
            ...config.preferredOptions,
            compressionType: config.fallbackOptions.compressionType,
        };
    }
    // 无回退选项时，使用替换偏好设置内平台不支持的选项
    return {
        ...config.preferredOptions,
    };
}
function checkRemoteDisabled(compressionType) {
    return compressionType === BundleCompressionTypes.SUBPACKAGE || compressionType === BundleCompressionTypes.ZIP;
}
function getInvalidRemote(compressionType, isRemote) {
    if (compressionType === BundleCompressionTypes.SUBPACKAGE) {
        return false;
    }
    else if (compressionType === BundleCompressionTypes.ZIP) {
        return true;
    }
    return isRemote ?? false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci9zaGFyZS9idW5kbGUtdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBb0JBLG9EQUVDO0FBcURELDhEQVNDO0FBMkNELGtEQUVDO0FBRUQsNENBUUM7QUEzSUQsK0JBQWdDO0FBS2hDLElBQVksc0JBTVg7QUFORCxXQUFZLHNCQUFzQjtJQUM5Qix1Q0FBYSxDQUFBO0lBQ2IsaURBQXVCLENBQUE7SUFDdkIsMkRBQWlDLENBQUE7SUFDakMsbURBQXlCLENBQUE7SUFDekIscUNBQVcsQ0FBQTtBQUNmLENBQUMsRUFOVyxzQkFBc0Isc0NBQXRCLHNCQUFzQixRQU1qQztBQUVELElBQVksaUJBS1g7QUFMRCxXQUFZLGlCQUFpQjtJQUN6Qiw0Q0FBdUIsQ0FBQTtJQUN2QixrQ0FBYSxDQUFBO0lBQ2IsZ0RBQTJCLENBQUE7SUFDM0IsMENBQXFCLENBQUE7QUFDekIsQ0FBQyxFQUxXLGlCQUFpQixpQ0FBakIsaUJBQWlCLFFBSzVCO0FBRUQsU0FBZ0Isb0JBQW9CLENBQUMsU0FBaUI7SUFDbEQsT0FBTyxJQUFBLGVBQVEsRUFBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3RFLENBQUM7QUFFWSxRQUFBLHdCQUF3QixHQUFHO0lBQ3BDLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEVBQUUsZ0NBQWdDO0lBQy9ELENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLEVBQUUsc0NBQXNDO0lBQzNFLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLEVBQUUscUNBQXFDO0lBQ3pFLENBQUMsc0JBQXNCLENBQUMsY0FBYyxDQUFDLEVBQUUsMENBQTBDO0lBQ25GLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLEVBQUUsK0JBQStCO0NBQ2hFLENBQUM7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QUFFLENBQUM7UUFDN0YsT0FBTztZQUNILGVBQWUsRUFBRSxzQkFBc0IsQ0FBQyxTQUFTO1lBQ2pELFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUM7SUFDTixDQUFDO0lBRUQscUJBQXFCO0lBQ3JCLElBQUksTUFBTSxDQUFDLGdCQUFnQixJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7UUFDdkYsT0FBTyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7SUFDbkMsQ0FBQztJQUVELGtCQUFrQjtJQUNsQixJQUFJLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN6QixPQUFPO1lBQ0gsR0FBRyxNQUFNLENBQUMsZ0JBQWdCO1lBQzFCLGVBQWUsRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLGVBQWU7U0FDMUQsQ0FBQztJQUNOLENBQUM7SUFFRCwyQkFBMkI7SUFDM0IsT0FBTztRQUNILEdBQUcsTUFBTSxDQUFDLGdCQUFnQjtLQUM3QixDQUFDO0FBQ04sQ0FBQztBQUVELFNBQWdCLG1CQUFtQixDQUFDLGVBQXNDO0lBQ3RFLE9BQU8sZUFBZSxLQUFLLHNCQUFzQixDQUFDLFVBQVUsSUFBSSxlQUFlLEtBQUssc0JBQXNCLENBQUMsR0FBRyxDQUFDO0FBQ25ILENBQUM7QUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxlQUFzQyxFQUFFLFFBQWtCO0lBQ3ZGLElBQUksZUFBZSxLQUFLLHNCQUFzQixDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3hELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7U0FBTSxJQUFJLGVBQWUsS0FBSyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN4RCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsT0FBTyxRQUFRLElBQUksS0FBSyxDQUFDO0FBQzdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiYXNlbmFtZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBJQXNzZXQgfSBmcm9tICcuLi8uLi9hc3NldHMvQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IEJ1bmRsZUNvbXByZXNzaW9uVHlwZSwgTWFrZVJlcXVpcmVkIH0gZnJvbSAnLi4vQHR5cGVzJztcclxuaW1wb3J0IHsgUGxhdGZvcm1CdW5kbGVDb25maWcsIElQbGF0Zm9ybUluZm8sIEJ1bmRsZVJlbmRlckNvbmZpZywgQ3VzdG9tQnVuZGxlQ29uZmlnLCBDdXN0b21CdW5kbGVDb25maWdJdGVtLCBCdW5kbGVDb25maWdJdGVtIH0gZnJvbSAnLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcblxyXG5leHBvcnQgZW51bSBCdW5kbGVDb21wcmVzc2lvblR5cGVzIHtcclxuICAgIE5PTkUgPSAnbm9uZScsXHJcbiAgICBNRVJHRV9ERVAgPSAnbWVyZ2VfZGVwJyxcclxuICAgIE1FUkdFX0FMTF9KU09OID0gJ21lcmdlX2FsbF9qc29uJyxcclxuICAgIFNVQlBBQ0tBR0UgPSAnc3VicGFja2FnZScsXHJcbiAgICBaSVAgPSAnemlwJyxcclxufVxyXG5cclxuZXhwb3J0IGVudW0gQnVpbHRpbkJ1bmRsZU5hbWUge1xyXG4gICAgUkVTT1VSQ0VTID0gJ3Jlc291cmNlcycsXHJcbiAgICBNQUlOID0gJ21haW4nLFxyXG4gICAgU1RBUlRfU0NFTkUgPSAnc3RhcnQtc2NlbmUnLFxyXG4gICAgSU5URVJOQUwgPSAnaW50ZXJuYWwnLFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QnVuZGxlRGVmYXVsdE5hbWUoYXNzZXRJbmZvOiBJQXNzZXQpIHtcclxuICAgIHJldHVybiBiYXNlbmFtZShhc3NldEluZm8uc291cmNlKS5yZXBsYWNlKC9bXmEtekEtWjAtOV8tXS9nLCAnXycpO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgQnVuZGxlY29tcHJlc3Npb25UeXBlTWFwID0ge1xyXG4gICAgW0J1bmRsZUNvbXByZXNzaW9uVHlwZXMuTk9ORV06ICdpMThuOmJ1aWxkZXIuYXNzZXRfYnVuZGxlLm5vbmUnLFxyXG4gICAgW0J1bmRsZUNvbXByZXNzaW9uVHlwZXMuU1VCUEFDS0FHRV06ICdpMThuOmJ1aWxkZXIuYXNzZXRfYnVuZGxlLnN1YnBhY2thZ2UnLFxyXG4gICAgW0J1bmRsZUNvbXByZXNzaW9uVHlwZXMuTUVSR0VfREVQXTogJ2kxOG46YnVpbGRlci5hc3NldF9idW5kbGUubWVyZ2VfZGVwJyxcclxuICAgIFtCdW5kbGVDb21wcmVzc2lvblR5cGVzLk1FUkdFX0FMTF9KU09OXTogJ2kxOG46YnVpbGRlci5hc3NldF9idW5kbGUubWVyZ2VfYWxsX2pzb24nLFxyXG4gICAgW0J1bmRsZUNvbXByZXNzaW9uVHlwZXMuWklQXTogJ2kxOG46YnVpbGRlci5hc3NldF9idW5kbGUuemlwJyxcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBCdW5kbGVQbGF0Zm9ybVR5cGVzID0ge1xyXG4gICAgbmF0aXZlOiB7XHJcbiAgICAgICAgaWNvbjogJ21vYmlsZScsXHJcbiAgICAgICAgZGlzcGxheU5hbWU6ICdpMThuOmJ1aWxkZXIuYXNzZXRfYnVuZGxlLm5hdGl2ZScsXHJcbiAgICB9LFxyXG4gICAgd2ViOiB7XHJcbiAgICAgICAgaWNvbjogJ2h0bWw1JyxcclxuICAgICAgICBkaXNwbGF5TmFtZTogJ2kxOG46YnVpbGRlci5hc3NldF9idW5kbGUud2ViJyxcclxuICAgIH0sXHJcbiAgICBtaW5pR2FtZToge1xyXG4gICAgICAgIGljb246ICdtaW5pLWdhbWUnLFxyXG4gICAgICAgIGRpc3BsYXlOYW1lOiAnaTE4bjpidWlsZGVyLmFzc2V0X2J1bmRsZS5taW5pZ2FtZScsXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IERlZmF1bHRCdW5kbGVDb25maWc6IEN1c3RvbUJ1bmRsZUNvbmZpZyA9IHtcclxuICAgIGRpc3BsYXlOYW1lOiAnaTE4bjpidWlsZGVyLmFzc2V0X2J1bmRsZS5kZWZhdWx0Q29uZmlnJyxcclxuICAgIGNvbmZpZ3M6IHtcclxuICAgICAgICBuYXRpdmU6IHtcclxuICAgICAgICAgICAgcHJlZmVycmVkT3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgaXNSZW1vdGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY29tcHJlc3Npb25UeXBlOiAnbWVyZ2VfZGVwJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHdlYjoge1xyXG4gICAgICAgICAgICBwcmVmZXJyZWRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBpc1JlbW90ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjb21wcmVzc2lvblR5cGU6ICdtZXJnZV9kZXAnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWxsYmFja09wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGNvbXByZXNzaW9uVHlwZTogJ21lcmdlX2RlcCcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtaW5pR2FtZToge1xyXG4gICAgICAgICAgICBmYWxsYmFja09wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGlzUmVtb3RlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNvbXByZXNzaW9uVHlwZTogJ21lcmdlX2RlcCcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNvbmZpZ01vZGU6ICdmYWxsYmFjaycsXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtUGxhdGZvcm1TZXR0aW5ncyhjb25maWc6IEN1c3RvbUJ1bmRsZUNvbmZpZ0l0ZW0sIHBsYXRmb3JtQ29uZmlnczogUmVjb3JkPHN0cmluZywgUGxhdGZvcm1CdW5kbGVDb25maWc+KSB7XHJcbiAgICBjb25zdCByZXM6IFJlY29yZDxzdHJpbmcsIFJlcXVpcmVkPEJ1bmRsZUNvbmZpZ0l0ZW0+PiA9IHt9O1xyXG4gICAgT2JqZWN0LmtleXMocGxhdGZvcm1Db25maWdzKS5mb3JFYWNoKChwbGF0Zm9ybSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IGdldFZhbGlkT3B0aW9uKHBsYXRmb3JtLCBjb25maWcsIHBsYXRmb3JtQ29uZmlncyk7XHJcbiAgICAgICAgb3B0aW9uLmlzUmVtb3RlID0gZ2V0SW52YWxpZFJlbW90ZShvcHRpb24uY29tcHJlc3Npb25UeXBlIHx8ICdtZXJnZV9kZXAnLCBvcHRpb24uaXNSZW1vdGUpO1xyXG4gICAgICAgIG9wdGlvbi5jb21wcmVzc2lvblR5cGUgPSBvcHRpb24uY29tcHJlc3Npb25UeXBlIHx8IEJ1bmRsZUNvbXByZXNzaW9uVHlwZXMuTUVSR0VfREVQO1xyXG4gICAgICAgIHJlc1twbGF0Zm9ybV0gPSBvcHRpb24gYXMgUmVxdWlyZWQ8QnVuZGxlQ29uZmlnSXRlbT47XHJcbiAgICB9KTtcclxuICAgIHJldHVybiByZXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFZhbGlkT3B0aW9uKHBsYXRmb3JtOiBzdHJpbmcsIGNvbmZpZzogQ3VzdG9tQnVuZGxlQ29uZmlnSXRlbSwgcGxhdGZvcm1Db25maWdzOiBSZWNvcmQ8c3RyaW5nLCBQbGF0Zm9ybUJ1bmRsZUNvbmZpZz4pOiBQYXJ0aWFsPEJ1bmRsZUNvbmZpZ0l0ZW0+IHtcclxuICAgIGNvbnN0IG1vZGUgPSBjb25maWcuY29uZmlnTW9kZSB8fCAocGxhdGZvcm1Db25maWdzW3BsYXRmb3JtXS5wbGF0Zm9ybVR5cGUgPT09ICdtaW5pR2FtZScgPyAnZmFsbGJhY2snIDogJ2F1dG8nKTtcclxuICAgIC8vIG1vZGUg5Li6IGZhbGxiYWNrIOaXtu+8jCDkvJjlhYjkvb/nlKjlm57pgIDpgInpoblcclxuICAgIGlmIChtb2RlID09PSAnZmFsbGJhY2snICYmIGNvbmZpZy5mYWxsYmFja09wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAuLi5jb25maWcucHJlZmVycmVkT3B0aW9ucyxcclxuICAgICAgICAgICAgY29tcHJlc3Npb25UeXBlOiBjb25maWcuZmFsbGJhY2tPcHRpb25zLmNvbXByZXNzaW9uVHlwZSxcclxuICAgICAgICAgICAgaXNSZW1vdGU6IGNvbmZpZy5mYWxsYmFja09wdGlvbnMuaXNSZW1vdGUgPz8gZmFsc2UsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIC8vIOaciemSiOWvueW5s+WPsOeahOiuvue9ru+8jOS8mOWFiOS9v+eUqOW5s+WPsOiuvue9rlxyXG4gICAgaWYgKGNvbmZpZy5vdmVyd3JpdGVTZXR0aW5ncyAmJiBjb25maWcub3ZlcndyaXRlU2V0dGluZ3NbcGxhdGZvcm1dKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5vdmVyd3JpdGVTZXR0aW5nc1twbGF0Zm9ybV07XHJcbiAgICB9XHJcbiAgICBjb25zdCBzdXBwb3J0ID0gcGxhdGZvcm1Db25maWdzW3BsYXRmb3JtXS5zdXBwb3J0T3B0aW9ucy5jb21wcmVzc2lvblR5cGU7XHJcbiAgICBpZiAobW9kZSA9PT0gJ292ZXJ3cml0ZScgJiYgKCFjb25maWcub3ZlcndyaXRlU2V0dGluZ3MgfHwgIWNvbmZpZy5vdmVyd3JpdGVTZXR0aW5nc1twbGF0Zm9ybV0pKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY29tcHJlc3Npb25UeXBlOiBCdW5kbGVDb21wcmVzc2lvblR5cGVzLk1FUkdFX0RFUCxcclxuICAgICAgICAgICAgaXNSZW1vdGU6IGZhbHNlLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5YGP5aW96K6+572u55qE6YCJ6aG577yM5bmz5Y+w6YO95pSv5oyB77yM55u05o6l5L2/55SoXHJcbiAgICBpZiAoY29uZmlnLnByZWZlcnJlZE9wdGlvbnMgJiYgc3VwcG9ydC5pbmNsdWRlcyhjb25maWcucHJlZmVycmVkT3B0aW9ucy5jb21wcmVzc2lvblR5cGUpKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5wcmVmZXJyZWRPcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOacieWbnumAgOmAiemhueaXtu+8jOS8mOWFiOS9v+eUqOWbnumAgOmAiemhuVxyXG4gICAgaWYgKGNvbmZpZy5mYWxsYmFja09wdGlvbnMpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAuLi5jb25maWcucHJlZmVycmVkT3B0aW9ucyxcclxuICAgICAgICAgICAgY29tcHJlc3Npb25UeXBlOiBjb25maWcuZmFsbGJhY2tPcHRpb25zLmNvbXByZXNzaW9uVHlwZSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOaXoOWbnumAgOmAiemhueaXtu+8jOS9v+eUqOabv+aNouWBj+Wlveiuvue9ruWGheW5s+WPsOS4jeaUr+aMgeeahOmAiemhuVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICAuLi5jb25maWcucHJlZmVycmVkT3B0aW9ucyxcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja1JlbW90ZURpc2FibGVkKGNvbXByZXNzaW9uVHlwZTogQnVuZGxlQ29tcHJlc3Npb25UeXBlKSB7XHJcbiAgICByZXR1cm4gY29tcHJlc3Npb25UeXBlID09PSBCdW5kbGVDb21wcmVzc2lvblR5cGVzLlNVQlBBQ0tBR0UgfHwgY29tcHJlc3Npb25UeXBlID09PSBCdW5kbGVDb21wcmVzc2lvblR5cGVzLlpJUDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEludmFsaWRSZW1vdGUoY29tcHJlc3Npb25UeXBlOiBCdW5kbGVDb21wcmVzc2lvblR5cGUsIGlzUmVtb3RlPzogYm9vbGVhbik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKGNvbXByZXNzaW9uVHlwZSA9PT0gQnVuZGxlQ29tcHJlc3Npb25UeXBlcy5TVUJQQUNLQUdFKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIGlmIChjb21wcmVzc2lvblR5cGUgPT09IEJ1bmRsZUNvbXByZXNzaW9uVHlwZXMuWklQKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGlzUmVtb3RlID8/IGZhbHNlO1xyXG59Il19