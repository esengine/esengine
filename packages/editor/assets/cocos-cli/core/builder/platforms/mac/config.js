'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const native_common_1 = require("../native-common");
const utils_1 = require("./utils");
const config = {
    ...native_common_1.commonOptions,
    displayName: 'Mac',
    platformType: 'MAC',
    doc: 'editor/publish/mac/build-example-mac.html',
    commonOptions: {
        polyfills: {
            hidden: true,
        },
        useBuiltinServer: {
            hidden: false,
        },
        nativeCodeBundleMode: {
            default: 'wasm',
        },
    },
    verifyRuleMap: {
        packageName: {
            func: (value) => {
                if (!(0, utils_1.checkPackageNameValidity)(value)) {
                    return false;
                }
                return true;
            },
            message: 'i18n:mac.error.packageNameRuleMessage',
        },
        targetVersion: {
            func: (value) => {
                if (!/^\d+(\.\d+){1,2}$/.test(value)) {
                    return false;
                }
                return true;
            },
            message: 'i18n:mac.error.targetVersionError',
        },
        executableName: {
            func: (str) => {
                // allow empty string
                return /^[0-9a-zA-Z_-]*$/.test(str);
            },
            message: 'Invalid executable name specified',
        },
    },
    options: {
        ...native_common_1.baseNativeCommonOptions,
        executableName: {
            label: 'i18n:mac.options.executable_name',
            default: '',
            type: 'string',
            verifyRules: ['executableName'],
        },
        packageName: {
            label: 'i18n:mac.options.package_name',
            description: 'i18n:mac.options.package_name_hint',
            verifyRules: ['packageName', 'required'],
            default: '',
            type: 'string',
        },
        renderBackEnd: {
            label: 'i18n:mac.options.render_back_end',
            type: 'object',
            default: {
                metal: true,
            },
            properties: {
                metal: {
                    label: 'Metal',
                    type: 'boolean',
                    default: true,
                },
            },
        },
        targetVersion: {
            label: 'i18n:mac.options.targetVersion',
            default: '10.14',
            type: 'string',
            verifyRules: ['required', 'targetVersion'],
        },
        supportM1: {
            label: 'Support Apple Silicon',
            description: 'Support Apple Silicon',
            default: false,
            type: 'boolean'
        },
        skipUpdateXcodeProject: {
            label: 'i18n:mac.options.skipUpdateXcodeProject',
            default: false,
            type: 'boolean'
        },
    },
    hooks: './hooks',
};
exports.default = config;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci9wbGF0Zm9ybXMvbWFjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBR2Isb0RBQTBFO0FBQzFFLG1DQUFtRDtBQUVuRCxNQUFNLE1BQU0sR0FBK0I7SUFDdkMsR0FBRyw2QkFBYTtJQUNoQixXQUFXLEVBQUUsS0FBSztJQUNsQixZQUFZLEVBQUUsS0FBSztJQUNuQixHQUFHLEVBQUUsMkNBQTJDO0lBQ2hELGFBQWEsRUFBRTtRQUNYLFNBQVMsRUFBRTtZQUNQLE1BQU0sRUFBRSxJQUFJO1NBQ2Y7UUFDRCxnQkFBZ0IsRUFBRTtZQUNkLE1BQU0sRUFBRSxLQUFLO1NBQ2hCO1FBQ0Qsb0JBQW9CLEVBQUU7WUFDbEIsT0FBTyxFQUFFLE1BQU07U0FDbEI7S0FDSjtJQUNELGFBQWEsRUFBRTtRQUNYLFdBQVcsRUFBRTtZQUNULElBQUksRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO2dCQUNwQixJQUFJLENBQUMsSUFBQSxnQ0FBd0IsRUFBQyxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUNuQyxPQUFPLEtBQUssQ0FBQztnQkFDakIsQ0FBQztnQkFDRCxPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsT0FBTyxFQUFFLHVDQUF1QztTQUNuRDtRQUNELGFBQWEsRUFBRTtZQUNYLElBQUksRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO2dCQUNwQixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7b0JBQ25DLE9BQU8sS0FBSyxDQUFDO2dCQUNqQixDQUFDO2dCQUNELE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUM7WUFDRCxPQUFPLEVBQUUsbUNBQW1DO1NBQy9DO1FBQ0QsY0FBYyxFQUFFO1lBQ1osSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ1YscUJBQXFCO2dCQUNyQixPQUFPLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQ0QsT0FBTyxFQUFFLG1DQUFtQztTQUMvQztLQUNKO0lBQ0QsT0FBTyxFQUFFO1FBQ0wsR0FBRyx1Q0FBdUI7UUFDMUIsY0FBYyxFQUFFO1lBQ1osS0FBSyxFQUFFLGtDQUFrQztZQUN6QyxPQUFPLEVBQUUsRUFBRTtZQUNYLElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7U0FDbEM7UUFDRCxXQUFXLEVBQUU7WUFDVCxLQUFLLEVBQUUsK0JBQStCO1lBQ3RDLFdBQVcsRUFBRSxvQ0FBb0M7WUFDakQsV0FBVyxFQUFFLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQztZQUN4QyxPQUFPLEVBQUUsRUFBRTtZQUNYLElBQUksRUFBRSxRQUFRO1NBQ2pCO1FBQ0QsYUFBYSxFQUFFO1lBQ1gsS0FBSyxFQUFFLGtDQUFrQztZQUN6QyxJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRTtnQkFDTCxLQUFLLEVBQUUsSUFBSTthQUNkO1lBQ0QsVUFBVSxFQUFFO2dCQUNSLEtBQUssRUFBRTtvQkFDSCxLQUFLLEVBQUUsT0FBTztvQkFDZCxJQUFJLEVBQUUsU0FBUztvQkFDZixPQUFPLEVBQUUsSUFBSTtpQkFDaEI7YUFDSjtTQUNKO1FBQ0QsYUFBYSxFQUFFO1lBQ1gsS0FBSyxFQUFFLGdDQUFnQztZQUN2QyxPQUFPLEVBQUUsT0FBTztZQUNoQixJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUM7U0FDN0M7UUFDRCxTQUFTLEVBQUU7WUFDUCxLQUFLLEVBQUUsdUJBQXVCO1lBQzlCLFdBQVcsRUFBRSx1QkFBdUI7WUFDcEMsT0FBTyxFQUFFLEtBQUs7WUFDZCxJQUFJLEVBQUUsU0FBUztTQUNsQjtRQUNELHNCQUFzQixFQUFFO1lBQ3BCLEtBQUssRUFBRSx5Q0FBeUM7WUFDaEQsT0FBTyxFQUFFLEtBQUs7WUFDZCxJQUFJLEVBQUUsU0FBUztTQUNsQjtLQUNKO0lBQ0QsS0FBSyxFQUFFLFNBQVM7Q0FDbkIsQ0FBQztBQUVGLGtCQUFlLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCB7IElQbGF0Zm9ybUJ1aWxkUGx1Z2luQ29uZmlnIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IGNvbW1vbk9wdGlvbnMsIGJhc2VOYXRpdmVDb21tb25PcHRpb25zIH0gZnJvbSAnLi4vbmF0aXZlLWNvbW1vbic7XHJcbmltcG9ydCB7IGNoZWNrUGFja2FnZU5hbWVWYWxpZGl0eSB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuY29uc3QgY29uZmlnOiBJUGxhdGZvcm1CdWlsZFBsdWdpbkNvbmZpZyA9IHtcclxuICAgIC4uLmNvbW1vbk9wdGlvbnMsXHJcbiAgICBkaXNwbGF5TmFtZTogJ01hYycsXHJcbiAgICBwbGF0Zm9ybVR5cGU6ICdNQUMnLFxyXG4gICAgZG9jOiAnZWRpdG9yL3B1Ymxpc2gvbWFjL2J1aWxkLWV4YW1wbGUtbWFjLmh0bWwnLFxyXG4gICAgY29tbW9uT3B0aW9uczoge1xyXG4gICAgICAgIHBvbHlmaWxsczoge1xyXG4gICAgICAgICAgICBoaWRkZW46IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB1c2VCdWlsdGluU2VydmVyOiB7XHJcbiAgICAgICAgICAgIGhpZGRlbjogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBuYXRpdmVDb2RlQnVuZGxlTW9kZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiAnd2FzbScsXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB2ZXJpZnlSdWxlTWFwOiB7XHJcbiAgICAgICAgcGFja2FnZU5hbWU6IHtcclxuICAgICAgICAgICAgZnVuYzogKHZhbHVlOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghY2hlY2tQYWNrYWdlTmFtZVZhbGlkaXR5KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnaTE4bjptYWMuZXJyb3IucGFja2FnZU5hbWVSdWxlTWVzc2FnZScsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0YXJnZXRWZXJzaW9uOiB7XHJcbiAgICAgICAgICAgIGZ1bmM6ICh2YWx1ZTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIS9eXFxkKyhcXC5cXGQrKXsxLDJ9JC8udGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbWVzc2FnZTogJ2kxOG46bWFjLmVycm9yLnRhcmdldFZlcnNpb25FcnJvcicsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBleGVjdXRhYmxlTmFtZToge1xyXG4gICAgICAgICAgICBmdW5jOiAoc3RyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBhbGxvdyBlbXB0eSBzdHJpbmdcclxuICAgICAgICAgICAgICAgIHJldHVybiAvXlswLTlhLXpBLVpfLV0qJC8udGVzdChzdHIpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBleGVjdXRhYmxlIG5hbWUgc3BlY2lmaWVkJyxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAuLi5iYXNlTmF0aXZlQ29tbW9uT3B0aW9ucyxcclxuICAgICAgICBleGVjdXRhYmxlTmFtZToge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46bWFjLm9wdGlvbnMuZXhlY3V0YWJsZV9uYW1lJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogJycsXHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgICB2ZXJpZnlSdWxlczogWydleGVjdXRhYmxlTmFtZSddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGFja2FnZU5hbWU6IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOm1hYy5vcHRpb25zLnBhY2thZ2VfbmFtZScsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnaTE4bjptYWMub3B0aW9ucy5wYWNrYWdlX25hbWVfaGludCcsXHJcbiAgICAgICAgICAgIHZlcmlmeVJ1bGVzOiBbJ3BhY2thZ2VOYW1lJywgJ3JlcXVpcmVkJ10sXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcnLFxyXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbmRlckJhY2tFbmQ6IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOm1hYy5vcHRpb25zLnJlbmRlcl9iYWNrX2VuZCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICBtZXRhbDogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgbWV0YWw6IHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ01ldGFsJyxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0YXJnZXRWZXJzaW9uOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjptYWMub3B0aW9ucy50YXJnZXRWZXJzaW9uJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogJzEwLjE0JyxcclxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgICAgIHZlcmlmeVJ1bGVzOiBbJ3JlcXVpcmVkJywgJ3RhcmdldFZlcnNpb24nXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1cHBvcnRNMToge1xyXG4gICAgICAgICAgICBsYWJlbDogJ1N1cHBvcnQgQXBwbGUgU2lsaWNvbicsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU3VwcG9ydCBBcHBsZSBTaWxpY29uJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2tpcFVwZGF0ZVhjb2RlUHJvamVjdDoge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46bWFjLm9wdGlvbnMuc2tpcFVwZGF0ZVhjb2RlUHJvamVjdCcsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGhvb2tzOiAnLi9ob29rcycsXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjb25maWc7Il19