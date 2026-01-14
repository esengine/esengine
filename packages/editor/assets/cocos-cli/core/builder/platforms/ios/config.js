'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const native_common_1 = require("../native-common");
const utils_1 = require("./utils");
const astcTypes = ['astc_4x4', 'astc_5x5', 'astc_6x6', 'astc_8x8', 'astc_10x5', 'astc_10x10', 'astc_12x12'];
const config = {
    ...native_common_1.commonOptions,
    displayName: 'iOS',
    platformType: 'IOS',
    doc: 'editor/publish/ios/build-example-ios.html',
    verifyRuleMap: {
        packageName: {
            func: (value) => {
                if (!(0, utils_1.checkPackageNameValidity)(value)) {
                    return false;
                }
                return true;
            },
            message: 'i18n:ios.tips.packageNameRuleMessage',
        },
        executableName: {
            func: (str) => {
                // allow empty string
                return /^[0-9a-zA-Z_-]*$/.test(str);
            },
            message: 'Invalid executable name specified',
        },
    },
    commonOptions: {
        polyfills: {
            hidden: true,
        },
        useBuiltinServer: {
            hidden: false,
        }
    },
    options: {
        executableName: {
            label: 'i18n:ios.options.executable_name',
            default: '',
            type: 'string',
            verifyRules: ['executableName'],
        },
        packageName: {
            label: 'i18n:ios.options.package_name',
            description: 'i18n:ios.options.package_name_hint',
            type: 'string',
            verifyRules: ['required', 'packageName'],
            default: '',
        },
        renderBackEnd: {
            label: 'i18n:ios.options.render_back_end',
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
        skipUpdateXcodeProject: {
            label: 'i18n:ios.options.skipUpdateXcodeProject',
            default: false,
            type: 'boolean'
        },
        orientation: {
            type: 'object',
            default: {
                portrait: false,
                upsideDown: false,
                landscapeRight: true,
                landscapeLeft: true,
            },
            properties: {}
        },
        osTarget: {
            type: 'object',
            default: {
                iphoneos: false,
                simulator: true,
            },
            properties: {}
        },
        targetVersion: {
            default: '12.0',
            type: 'string'
        },
    },
    hooks: './hooks',
    textureCompressConfig: {
        platformType: 'ios',
        support: {
            rgb: ['pvrtc_4bits_rgb', 'pvrtc_2bits_rgb', 'etc2_rgb', 'etc1_rgb', ...astcTypes],
            rgba: ['pvrtc_4bits_rgb_a', 'pvrtc_4bits_rgba', 'pvrtc_2bits_rgb_a', 'pvrtc_2bits_rgba', 'etc2_rgba', 'etc1_rgb_a', ...astcTypes],
        },
    },
};
exports.default = config;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci9wbGF0Zm9ybXMvaW9zL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBR2Isb0RBQTBFO0FBQzFFLG1DQUFtRDtBQUVuRCxNQUFNLFNBQVMsR0FBMkIsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztBQUVwSSxNQUFNLE1BQU0sR0FBK0I7SUFDdkMsR0FBRyw2QkFBYTtJQUNoQixXQUFXLEVBQUUsS0FBSztJQUNsQixZQUFZLEVBQUUsS0FBSztJQUNuQixHQUFHLEVBQUUsMkNBQTJDO0lBQ2hELGFBQWEsRUFBRTtRQUNYLFdBQVcsRUFBRTtZQUNULElBQUksRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO2dCQUNwQixJQUFJLENBQUMsSUFBQSxnQ0FBd0IsRUFBQyxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUNuQyxPQUFPLEtBQUssQ0FBQztnQkFDakIsQ0FBQztnQkFDRCxPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDO1lBQ0QsT0FBTyxFQUFFLHNDQUFzQztTQUNsRDtRQUNELGNBQWMsRUFBRTtZQUNaLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNWLHFCQUFxQjtnQkFDckIsT0FBTyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEMsQ0FBQztZQUNELE9BQU8sRUFBRSxtQ0FBbUM7U0FDL0M7S0FDSjtJQUNELGFBQWEsRUFBRTtRQUNYLFNBQVMsRUFBRTtZQUNQLE1BQU0sRUFBRSxJQUFJO1NBQ2Y7UUFDRCxnQkFBZ0IsRUFBRTtZQUNkLE1BQU0sRUFBRSxLQUFLO1NBQ2hCO0tBQ0o7SUFDRCxPQUFPLEVBQUU7UUFDTCxjQUFjLEVBQUU7WUFDWixLQUFLLEVBQUUsa0NBQWtDO1lBQ3pDLE9BQU8sRUFBRSxFQUFFO1lBQ1gsSUFBSSxFQUFFLFFBQVE7WUFDZCxXQUFXLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztTQUNsQztRQUNELFdBQVcsRUFBRTtZQUNULEtBQUssRUFBRSwrQkFBK0I7WUFDdEMsV0FBVyxFQUFFLG9DQUFvQztZQUNqRCxJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUM7WUFDeEMsT0FBTyxFQUFFLEVBQUU7U0FDZDtRQUNELGFBQWEsRUFBRTtZQUNYLEtBQUssRUFBRSxrQ0FBa0M7WUFDekMsSUFBSSxFQUFFLFFBQVE7WUFDZCxPQUFPLEVBQUU7Z0JBQ0wsS0FBSyxFQUFFLElBQUk7YUFDZDtZQUNELFVBQVUsRUFBRTtnQkFDUixLQUFLLEVBQUU7b0JBQ0gsS0FBSyxFQUFFLE9BQU87b0JBQ2QsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsT0FBTyxFQUFFLElBQUk7aUJBQ2hCO2FBQ0o7U0FDSjtRQUNELHNCQUFzQixFQUFFO1lBQ3BCLEtBQUssRUFBRSx5Q0FBeUM7WUFDaEQsT0FBTyxFQUFFLEtBQUs7WUFDZCxJQUFJLEVBQUUsU0FBUztTQUNsQjtRQUNELFdBQVcsRUFBRTtZQUNULElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFO2dCQUNMLFFBQVEsRUFBRSxLQUFLO2dCQUNmLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixjQUFjLEVBQUUsSUFBSTtnQkFDcEIsYUFBYSxFQUFFLElBQUk7YUFDdEI7WUFDRCxVQUFVLEVBQUUsRUFFWDtTQUNKO1FBQ0QsUUFBUSxFQUFFO1lBQ04sSUFBSSxFQUFFLFFBQVE7WUFDZCxPQUFPLEVBQUU7Z0JBQ0wsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsU0FBUyxFQUFFLElBQUk7YUFDbEI7WUFDRCxVQUFVLEVBQUUsRUFFWDtTQUNKO1FBQ0QsYUFBYSxFQUFFO1lBQ1gsT0FBTyxFQUFFLE1BQU07WUFDZixJQUFJLEVBQUUsUUFBUTtTQUNqQjtLQUNKO0lBQ0QsS0FBSyxFQUFFLFNBQVM7SUFDaEIscUJBQXFCLEVBQUU7UUFDbkIsWUFBWSxFQUFFLEtBQUs7UUFDbkIsT0FBTyxFQUFFO1lBQ0wsR0FBRyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxHQUFHLFNBQVMsQ0FBQztZQUNqRixJQUFJLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSxrQkFBa0IsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLEdBQUcsU0FBUyxDQUFDO1NBQ3BJO0tBQ0o7Q0FDSixDQUFDO0FBRUYsa0JBQWUsTUFBTSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgSVBsYXRmb3JtQnVpbGRQbHVnaW5Db25maWcsIElUZXh0dXJlQ29tcHJlc3NUeXBlIH0gZnJvbSAnLi4vLi4vQHR5cGVzL3Byb3RlY3RlZCc7XHJcbmltcG9ydCB7IGNvbW1vbk9wdGlvbnMsIGJhc2VOYXRpdmVDb21tb25PcHRpb25zIH0gZnJvbSAnLi4vbmF0aXZlLWNvbW1vbic7XHJcbmltcG9ydCB7IGNoZWNrUGFja2FnZU5hbWVWYWxpZGl0eSB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuY29uc3QgYXN0Y1R5cGVzOiBJVGV4dHVyZUNvbXByZXNzVHlwZVtdID0gWydhc3RjXzR4NCcsICdhc3RjXzV4NScsICdhc3RjXzZ4NicsICdhc3RjXzh4OCcsICdhc3RjXzEweDUnLCAnYXN0Y18xMHgxMCcsICdhc3RjXzEyeDEyJ107XHJcblxyXG5jb25zdCBjb25maWc6IElQbGF0Zm9ybUJ1aWxkUGx1Z2luQ29uZmlnID0ge1xyXG4gICAgLi4uY29tbW9uT3B0aW9ucyxcclxuICAgIGRpc3BsYXlOYW1lOiAnaU9TJyxcclxuICAgIHBsYXRmb3JtVHlwZTogJ0lPUycsXHJcbiAgICBkb2M6ICdlZGl0b3IvcHVibGlzaC9pb3MvYnVpbGQtZXhhbXBsZS1pb3MuaHRtbCcsXHJcbiAgICB2ZXJpZnlSdWxlTWFwOiB7XHJcbiAgICAgICAgcGFja2FnZU5hbWU6IHtcclxuICAgICAgICAgICAgZnVuYzogKHZhbHVlOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghY2hlY2tQYWNrYWdlTmFtZVZhbGlkaXR5KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnaTE4bjppb3MudGlwcy5wYWNrYWdlTmFtZVJ1bGVNZXNzYWdlJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4ZWN1dGFibGVOYW1lOiB7XHJcbiAgICAgICAgICAgIGZ1bmM6IChzdHIpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIGFsbG93IGVtcHR5IHN0cmluZ1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIC9eWzAtOWEtekEtWl8tXSokLy50ZXN0KHN0cik7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIGV4ZWN1dGFibGUgbmFtZSBzcGVjaWZpZWQnLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgY29tbW9uT3B0aW9uczoge1xyXG4gICAgICAgIHBvbHlmaWxsczoge1xyXG4gICAgICAgICAgICBoaWRkZW46IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB1c2VCdWlsdGluU2VydmVyOiB7XHJcbiAgICAgICAgICAgIGhpZGRlbjogZmFsc2UsXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgICBleGVjdXRhYmxlTmFtZToge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46aW9zLm9wdGlvbnMuZXhlY3V0YWJsZV9uYW1lJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogJycsXHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgICB2ZXJpZnlSdWxlczogWydleGVjdXRhYmxlTmFtZSddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGFja2FnZU5hbWU6IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOmlvcy5vcHRpb25zLnBhY2thZ2VfbmFtZScsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnaTE4bjppb3Mub3B0aW9ucy5wYWNrYWdlX25hbWVfaGludCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgICB2ZXJpZnlSdWxlczogWydyZXF1aXJlZCcsICdwYWNrYWdlTmFtZSddLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbmRlckJhY2tFbmQ6IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOmlvcy5vcHRpb25zLnJlbmRlcl9iYWNrX2VuZCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICBtZXRhbDogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgbWV0YWw6IHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ01ldGFsJyxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBza2lwVXBkYXRlWGNvZGVQcm9qZWN0OiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjppb3Mub3B0aW9ucy5za2lwVXBkYXRlWGNvZGVQcm9qZWN0JyxcclxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3JpZW50YXRpb246IHtcclxuICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgIHBvcnRyYWl0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHVwc2lkZURvd246IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbGFuZHNjYXBlUmlnaHQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBsYW5kc2NhcGVMZWZ0OiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3NUYXJnZXQ6IHtcclxuICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgIGlwaG9uZW9zOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHNpbXVsYXRvcjogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFyZ2V0VmVyc2lvbjoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiAnMTIuMCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBob29rczogJy4vaG9va3MnLFxyXG4gICAgdGV4dHVyZUNvbXByZXNzQ29uZmlnOiB7XHJcbiAgICAgICAgcGxhdGZvcm1UeXBlOiAnaW9zJyxcclxuICAgICAgICBzdXBwb3J0OiB7XHJcbiAgICAgICAgICAgIHJnYjogWydwdnJ0Y180Yml0c19yZ2InLCAncHZydGNfMmJpdHNfcmdiJywgJ2V0YzJfcmdiJywgJ2V0YzFfcmdiJywgLi4uYXN0Y1R5cGVzXSxcclxuICAgICAgICAgICAgcmdiYTogWydwdnJ0Y180Yml0c19yZ2JfYScsICdwdnJ0Y180Yml0c19yZ2JhJywgJ3B2cnRjXzJiaXRzX3JnYl9hJywgJ3B2cnRjXzJiaXRzX3JnYmEnLCAnZXRjMl9yZ2JhJywgJ2V0YzFfcmdiX2EnLCAuLi5hc3RjVHlwZXNdLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY29uZmlnOyJdfQ==