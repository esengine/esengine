"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// 加载指定语言下的所有 JSON 文件并合并为扁平结构
function loadLanguageResources(language) {
    const localesDir = path_1.default.join(__dirname, '../../static/i18n', language);
    const resources = {};
    try {
        if (fs_1.default.existsSync(localesDir)) {
            const files = fs_1.default.readdirSync(localesDir);
            const jsonFiles = files.filter(file => file.endsWith('.json'));
            for (const file of jsonFiles) {
                const filePath = path_1.default.join(localesDir, file);
                const data = fs_1.default.readFileSync(filePath, 'utf8');
                const parsed = JSON.parse(data);
                // 将文件名（去掉.json）作为前缀，合并到扁平结构中
                const namespace = file.replace('.json', '');
                // 递归合并对象，添加命名空间前缀
                function mergeWithPrefix(obj, prefix) {
                    for (const key in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, key)) {
                            const newKey = prefix ? `${prefix}.${key}` : key;
                            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                                mergeWithPrefix(obj[key], newKey);
                            }
                            else {
                                resources[newKey] = obj[key];
                            }
                        }
                    }
                }
                mergeWithPrefix(parsed, namespace);
            }
        }
    }
    catch (error) {
        console.error(`Load language resources failed (${language}):`, error);
    }
    return resources;
}
// 纯 Node.js 初始化 
i18next_1.default.init({
    // 基础配置
    lng: 'en',
    fallbackLng: 'en',
    // 资源数据 - 扁平结构，不使用命名空间
    resources: {
        en: {
            translation: loadLanguageResources('en')
        },
        zh: {
            translation: loadLanguageResources('zh')
        }
    },
    // 调试
    debug: process.env.NODE_ENV === 'development',
    // 插值配置 - 支持 {key} 格式（兼容旧版本）
    interpolation: {
        format: function (value, _format, _lng) {
            return value;
        },
        escapeValue: false, // React 已经做了转义
        formatSeparator: ',',
        unescapeSuffix: '',
        unescapePrefix: '',
        prefix: '{',
        suffix: '}'
    }
}, (err) => {
    if (err) {
        console.error('i18n 初始化失败:', err);
    }
});
exports.default = i18next_1.default;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaTE4bi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNEQUEyQjtBQUMzQiw0Q0FBb0I7QUFDcEIsZ0RBQXdCO0FBRXhCLDZCQUE2QjtBQUM3QixTQUFTLHFCQUFxQixDQUFDLFFBQWdCO0lBQzNDLE1BQU0sVUFBVSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZFLE1BQU0sU0FBUyxHQUF3QixFQUFFLENBQUM7SUFFMUMsSUFBSSxDQUFDO1FBQ0QsSUFBSSxZQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDNUIsTUFBTSxLQUFLLEdBQUcsWUFBRSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6QyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBRS9ELEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxFQUFFLENBQUM7Z0JBQzNCLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM3QyxNQUFNLElBQUksR0FBRyxZQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFaEMsNkJBQTZCO2dCQUM3QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFFNUMsa0JBQWtCO2dCQUNsQixTQUFTLGVBQWUsQ0FBQyxHQUFRLEVBQUUsTUFBYztvQkFDN0MsS0FBSyxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzt3QkFDcEIsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7NEJBQ2pELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQzs0QkFDakQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxRQUFRLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQ0FDaEYsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQzs0QkFDdEMsQ0FBQztpQ0FBTSxDQUFDO2dDQUNKLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQ2pDLENBQUM7d0JBQ0wsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7Z0JBRUQsZUFBZSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsUUFBUSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ3JCLENBQUM7QUFFRCxpQkFBaUI7QUFDakIsaUJBQUksQ0FBQyxJQUFJLENBQUM7SUFDTixPQUFPO0lBQ1AsR0FBRyxFQUFFLElBQUk7SUFDVCxXQUFXLEVBQUUsSUFBSTtJQUVqQixzQkFBc0I7SUFDdEIsU0FBUyxFQUFFO1FBQ1AsRUFBRSxFQUFFO1lBQ0EsV0FBVyxFQUFFLHFCQUFxQixDQUFDLElBQUksQ0FBQztTQUMzQztRQUNELEVBQUUsRUFBRTtZQUNBLFdBQVcsRUFBRSxxQkFBcUIsQ0FBQyxJQUFJLENBQUM7U0FDM0M7S0FDSjtJQUVELEtBQUs7SUFDTCxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssYUFBYTtJQUU3Qyw0QkFBNEI7SUFDNUIsYUFBYSxFQUFFO1FBQ1gsTUFBTSxFQUFFLFVBQVUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJO1lBQ2xDLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFDRCxXQUFXLEVBQUUsS0FBSyxFQUFFLGVBQWU7UUFDbkMsZUFBZSxFQUFFLEdBQUc7UUFDcEIsY0FBYyxFQUFFLEVBQUU7UUFDbEIsY0FBYyxFQUFFLEVBQUU7UUFDbEIsTUFBTSxFQUFFLEdBQUc7UUFDWCxNQUFNLEVBQUUsR0FBRztLQUNkO0NBRUosRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBQ1AsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQztBQUVILGtCQUFlLGlCQUFJLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaTE4biBmcm9tICdpMThuZXh0JztcclxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG4vLyDliqDovb3mjIflrpror63oqIDkuIvnmoTmiYDmnIkgSlNPTiDmlofku7blubblkIjlubbkuLrmiYHlubPnu5PmnoRcclxuZnVuY3Rpb24gbG9hZExhbmd1YWdlUmVzb3VyY2VzKGxhbmd1YWdlOiBzdHJpbmcpOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IHtcclxuICAgIGNvbnN0IGxvY2FsZXNEaXIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vc3RhdGljL2kxOG4nLCBsYW5ndWFnZSk7XHJcbiAgICBjb25zdCByZXNvdXJjZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGxvY2FsZXNEaXIpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMobG9jYWxlc0Rpcik7XHJcbiAgICAgICAgICAgIGNvbnN0IGpzb25GaWxlcyA9IGZpbGVzLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy5qc29uJykpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGpzb25GaWxlcykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4obG9jYWxlc0RpciwgZmlsZSk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmOCcpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShkYXRhKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyDlsIbmlofku7blkI3vvIjljrvmjokuanNvbu+8ieS9nOS4uuWJjee8gO+8jOWQiOW5tuWIsOaJgeW5s+e7k+aehOS4rVxyXG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZXNwYWNlID0gZmlsZS5yZXBsYWNlKCcuanNvbicsICcnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyDpgJLlvZLlkIjlubblr7nosaHvvIzmt7vliqDlkb3lkI3nqbrpl7TliY3nvIBcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG1lcmdlV2l0aFByZWZpeChvYmo6IGFueSwgcHJlZml4OiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9IHByZWZpeCA/IGAke3ByZWZpeH0uJHtrZXl9YCA6IGtleTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICdvYmplY3QnICYmIG9ialtrZXldICE9PSBudWxsICYmICFBcnJheS5pc0FycmF5KG9ialtrZXldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lcmdlV2l0aFByZWZpeChvYmpba2V5XSwgbmV3S2V5KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VzW25ld0tleV0gPSBvYmpba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBtZXJnZVdpdGhQcmVmaXgocGFyc2VkLCBuYW1lc3BhY2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGBMb2FkIGxhbmd1YWdlIHJlc291cmNlcyBmYWlsZWQgKCR7bGFuZ3VhZ2V9KTpgLCBlcnJvcik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc291cmNlcztcclxufVxyXG5cclxuLy8g57qvIE5vZGUuanMg5Yid5aeL5YyWIFxyXG5pMThuLmluaXQoe1xyXG4gICAgLy8g5Z+656GA6YWN572uXHJcbiAgICBsbmc6ICdlbicsXHJcbiAgICBmYWxsYmFja0xuZzogJ2VuJyxcclxuXHJcbiAgICAvLyDotYTmupDmlbDmja4gLSDmiYHlubPnu5PmnoTvvIzkuI3kvb/nlKjlkb3lkI3nqbrpl7RcclxuICAgIHJlc291cmNlczoge1xyXG4gICAgICAgIGVuOiB7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uOiBsb2FkTGFuZ3VhZ2VSZXNvdXJjZXMoJ2VuJylcclxuICAgICAgICB9LFxyXG4gICAgICAgIHpoOiB7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uOiBsb2FkTGFuZ3VhZ2VSZXNvdXJjZXMoJ3poJylcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIOiwg+ivlVxyXG4gICAgZGVidWc6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnLFxyXG5cclxuICAgIC8vIOaPkuWAvOmFjee9riAtIOaUr+aMgSB7a2V5fSDmoLzlvI/vvIjlhbzlrrnml6fniYjmnKzvvIlcclxuICAgIGludGVycG9sYXRpb246IHtcclxuICAgICAgICBmb3JtYXQ6IGZ1bmN0aW9uICh2YWx1ZSwgX2Zvcm1hdCwgX2xuZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlc2NhcGVWYWx1ZTogZmFsc2UsIC8vIFJlYWN0IOW3sue7j+WBmuS6hui9rOS5iVxyXG4gICAgICAgIGZvcm1hdFNlcGFyYXRvcjogJywnLFxyXG4gICAgICAgIHVuZXNjYXBlU3VmZml4OiAnJyxcclxuICAgICAgICB1bmVzY2FwZVByZWZpeDogJycsXHJcbiAgICAgICAgcHJlZml4OiAneycsXHJcbiAgICAgICAgc3VmZml4OiAnfSdcclxuICAgIH1cclxuXHJcbn0sIChlcnIpID0+IHtcclxuICAgIGlmIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdpMThuIOWIneWni+WMluWksei0pTonLCBlcnIpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGkxOG47Il19