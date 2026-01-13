"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAssetWithFilterConfig = checkAssetWithFilterConfig;
exports.matchFilterConfig = matchFilterConfig;
exports.filterAssetWithBundleConfig = filterAssetWithBundleConfig;
const minimatch_1 = __importDefault(require("minimatch"));
function checkAssetWithFilterConfig(assetInfo, bundleFilterConfig) {
    if (!bundleFilterConfig || !bundleFilterConfig.length) {
        return true;
    }
    // 排除规则，只要有一个符合规则的 match = false
    const includeConfigs = bundleFilterConfig.filter((config) => config.range === 'include');
    const allMatch = !includeConfigs.length || includeConfigs.some(config => matchFilterConfig(assetInfo, config));
    if (!allMatch) {
        return false;
    }
    const excludeConfigs = bundleFilterConfig.filter((config) => config.range === 'exclude');
    if (!excludeConfigs.length) {
        return allMatch;
    }
    return !excludeConfigs.some((config) => matchFilterConfig(assetInfo, config));
}
/**
 * 返回资源是否匹配当前规则的布尔值
 * @param assetInfo
 * @param config
 * @returns
 */
function matchFilterConfig(assetInfo, config) {
    // 默认情况和异常下资源都是通过过滤的，include 就匹配，exclude 就不匹配
    const matchDefault = config.range === 'include';
    let match = matchDefault;
    if (config.type === 'asset' && config.assets) {
        if (!config.assets.length) {
            match = matchDefault;
        }
        else {
            match = config.assets.includes(assetInfo.uuid);
        }
    }
    else if (config.type === 'url' && config.patchOption) {
        if (!config.patchOption.value) {
            match = matchDefault;
        }
        else {
            switch (config.patchOption.patchType) {
                case 'beginWith':
                    match = (new RegExp(`^${config.patchOption.value}`, 'i')).test(assetInfo.url);
                    break;
                case 'endWith':
                    match = (new RegExp(`${config.patchOption.value}$`, 'i')).test(assetInfo.url);
                    break;
                case 'contain':
                    match = (new RegExp(config.patchOption.value, 'i')).test(assetInfo.url);
                    break;
                case 'glob':
                    match = (0, minimatch_1.default)(assetInfo.url, config.patchOption.value, {
                        nocase: true,
                    });
                    break;
            }
        }
    }
    return match;
}
function filterAssetWithBundleConfig(assets, bundleFilterConfig) {
    return assets.filter((assetInfo) => checkAssetWithFilterConfig(assetInfo, bundleFilterConfig));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci93b3JrZXIvYnVpbGRlci91dGlscy9idW5kbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFLQSxnRUFpQkM7QUFRRCw4Q0FpQ0M7QUFFRCxrRUFFQztBQWxFRCwwREFBa0M7QUFJbEMsU0FBZ0IsMEJBQTBCLENBQUMsU0FBNEMsRUFBRSxrQkFBeUM7SUFDOUgsSUFBSSxDQUFDLGtCQUFrQixJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDcEQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELGdDQUFnQztJQUNoQyxNQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUM7SUFDekYsTUFBTSxRQUFRLEdBQUcsQ0FBQyxjQUFjLENBQUMsTUFBTSxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUMvRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDWixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0QsTUFBTSxjQUFjLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDO0lBQ3pGLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDekIsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUVELE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNsRixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixpQkFBaUIsQ0FBQyxTQUE0QyxFQUFFLE1BQTBCO0lBQ3RHLDZDQUE2QztJQUM3QyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQztJQUNoRCxJQUFJLEtBQUssR0FBRyxZQUFZLENBQUM7SUFDekIsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLE9BQU8sSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDeEIsS0FBSyxHQUFHLFlBQVksQ0FBQztRQUN6QixDQUFDO2FBQU0sQ0FBQztZQUNKLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkQsQ0FBQztJQUNMLENBQUM7U0FBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssS0FBSyxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM1QixLQUFLLEdBQUcsWUFBWSxDQUFDO1FBQ3pCLENBQUM7YUFBTSxDQUFDO1lBQ0osUUFBUSxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNuQyxLQUFLLFdBQVc7b0JBQ1osS0FBSyxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDOUUsTUFBTTtnQkFDVixLQUFLLFNBQVM7b0JBQ1YsS0FBSyxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDOUUsTUFBTTtnQkFDVixLQUFLLFNBQVM7b0JBQ1YsS0FBSyxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN4RSxNQUFNO2dCQUNWLEtBQUssTUFBTTtvQkFDUCxLQUFLLEdBQUcsSUFBQSxtQkFBUyxFQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUU7d0JBQ3ZELE1BQU0sRUFBRSxJQUFJO3FCQUNmLENBQUMsQ0FBQztvQkFDSCxNQUFNO1lBQ2QsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQztBQUVELFNBQWdCLDJCQUEyQixDQUFDLE1BQTZDLEVBQUUsa0JBQXlDO0lBQ2hJLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsMEJBQTBCLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQztBQUNuRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSUFzc2V0SW5mbyB9IGZyb20gJy4uLy4uLy4uLy4uL2Fzc2V0cy9AdHlwZXMvcHJvdGVjdGVkJztcclxuaW1wb3J0IG1pbmltYXRjaCBmcm9tICdtaW5pbWF0Y2gnO1xyXG5pbXBvcnQgeyBBc3NldCwgVmlydHVhbEFzc2V0IH0gZnJvbSAnQGNvY29zL2Fzc2V0LWRiJztcclxuaW1wb3J0IHsgQnVuZGxlRmlsdGVyQ29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vQHR5cGVzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja0Fzc2V0V2l0aEZpbHRlckNvbmZpZyhhc3NldEluZm86IEFzc2V0IHwgVmlydHVhbEFzc2V0IHwgSUFzc2V0SW5mbywgYnVuZGxlRmlsdGVyQ29uZmlnPzogQnVuZGxlRmlsdGVyQ29uZmlnW10pOiBib29sZWFuIHtcclxuICAgIGlmICghYnVuZGxlRmlsdGVyQ29uZmlnIHx8ICFidW5kbGVGaWx0ZXJDb25maWcubGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g5o6S6Zmk6KeE5YiZ77yM5Y+q6KaB5pyJ5LiA5Liq56ym5ZCI6KeE5YiZ55qEIG1hdGNoID0gZmFsc2VcclxuICAgIGNvbnN0IGluY2x1ZGVDb25maWdzID0gYnVuZGxlRmlsdGVyQ29uZmlnLmZpbHRlcigoY29uZmlnKSA9PiBjb25maWcucmFuZ2UgPT09ICdpbmNsdWRlJyk7XHJcbiAgICBjb25zdCBhbGxNYXRjaCA9ICFpbmNsdWRlQ29uZmlncy5sZW5ndGggfHwgaW5jbHVkZUNvbmZpZ3Muc29tZShjb25maWcgPT4gbWF0Y2hGaWx0ZXJDb25maWcoYXNzZXRJbmZvLCBjb25maWcpKTtcclxuICAgIGlmICghYWxsTWF0Y2gpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBjb25zdCBleGNsdWRlQ29uZmlncyA9IGJ1bmRsZUZpbHRlckNvbmZpZy5maWx0ZXIoKGNvbmZpZykgPT4gY29uZmlnLnJhbmdlID09PSAnZXhjbHVkZScpO1xyXG4gICAgaWYgKCFleGNsdWRlQ29uZmlncy5sZW5ndGgpIHtcclxuICAgICAgICByZXR1cm4gYWxsTWF0Y2g7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuICFleGNsdWRlQ29uZmlncy5zb21lKChjb25maWcpID0+IG1hdGNoRmlsdGVyQ29uZmlnKGFzc2V0SW5mbywgY29uZmlnKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDov5Tlm57otYTmupDmmK/lkKbljLnphY3lvZPliY3op4TliJnnmoTluIPlsJTlgLxcclxuICogQHBhcmFtIGFzc2V0SW5mbyBcclxuICogQHBhcmFtIGNvbmZpZyBcclxuICogQHJldHVybnMgXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWF0Y2hGaWx0ZXJDb25maWcoYXNzZXRJbmZvOiBBc3NldCB8IFZpcnR1YWxBc3NldCB8IElBc3NldEluZm8sIGNvbmZpZzogQnVuZGxlRmlsdGVyQ29uZmlnKSB7XHJcbiAgICAvLyDpu5jorqTmg4XlhrXlkozlvILluLjkuIvotYTmupDpg73mmK/pgJrov4fov4fmu6TnmoTvvIxpbmNsdWRlIOWwseWMuemFje+8jGV4Y2x1ZGUg5bCx5LiN5Yy56YWNXHJcbiAgICBjb25zdCBtYXRjaERlZmF1bHQgPSBjb25maWcucmFuZ2UgPT09ICdpbmNsdWRlJztcclxuICAgIGxldCBtYXRjaCA9IG1hdGNoRGVmYXVsdDtcclxuICAgIGlmIChjb25maWcudHlwZSA9PT0gJ2Fzc2V0JyAmJiBjb25maWcuYXNzZXRzKSB7XHJcbiAgICAgICAgaWYgKCFjb25maWcuYXNzZXRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBtYXRjaCA9IG1hdGNoRGVmYXVsdDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBtYXRjaCA9IGNvbmZpZy5hc3NldHMuaW5jbHVkZXMoYXNzZXRJbmZvLnV1aWQpO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoY29uZmlnLnR5cGUgPT09ICd1cmwnICYmIGNvbmZpZy5wYXRjaE9wdGlvbikge1xyXG4gICAgICAgIGlmICghY29uZmlnLnBhdGNoT3B0aW9uLnZhbHVlKSB7XHJcbiAgICAgICAgICAgIG1hdGNoID0gbWF0Y2hEZWZhdWx0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoY29uZmlnLnBhdGNoT3B0aW9uLnBhdGNoVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnYmVnaW5XaXRoJzpcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IChuZXcgUmVnRXhwKGBeJHtjb25maWcucGF0Y2hPcHRpb24udmFsdWV9YCwgJ2knKSkudGVzdChhc3NldEluZm8udXJsKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2VuZFdpdGgnOlxyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gKG5ldyBSZWdFeHAoYCR7Y29uZmlnLnBhdGNoT3B0aW9uLnZhbHVlfSRgLCAnaScpKS50ZXN0KGFzc2V0SW5mby51cmwpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY29udGFpbic6XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSAobmV3IFJlZ0V4cChjb25maWcucGF0Y2hPcHRpb24udmFsdWUsICdpJykpLnRlc3QoYXNzZXRJbmZvLnVybCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdnbG9iJzpcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IG1pbmltYXRjaChhc3NldEluZm8udXJsLCBjb25maWcucGF0Y2hPcHRpb24udmFsdWUsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9jYXNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1hdGNoO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyQXNzZXRXaXRoQnVuZGxlQ29uZmlnKGFzc2V0czogKEFzc2V0IHwgVmlydHVhbEFzc2V0IHwgSUFzc2V0SW5mbylbXSwgYnVuZGxlRmlsdGVyQ29uZmlnPzogQnVuZGxlRmlsdGVyQ29uZmlnW10pIHtcclxuICAgIHJldHVybiBhc3NldHMuZmlsdGVyKChhc3NldEluZm8pID0+IGNoZWNrQXNzZXRXaXRoRmlsdGVyQ29uZmlnKGFzc2V0SW5mbywgYnVuZGxlRmlsdGVyQ29uZmlnKSk7XHJcbn1cclxuIl19