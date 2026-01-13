'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const native_common_1 = require("../native-common");
const config = {
    ...native_common_1.commonOptions,
    displayName: 'Android',
    platformType: 'ANDROID',
    doc: 'editor/publish/android/build-example-android.html',
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
            func: (str) => {
                // refer: https://developer.android.com/studio/build/application-id.html
                return /^[a-zA-Z]\w*(\.[a-zA-Z]\w*)+$/.test(str);
            },
            message: 'Invalid package name specified',
        },
    },
    options: {
        ...native_common_1.baseNativeCommonOptions,
        packageName: {
            label: 'i18n:android.options.package_name',
            type: 'string',
            default: 'com.cocos.game',
            verifyRules: ['required', 'packageName'],
        },
        apiLevel: {
            label: 'i18n:android.options.apiLevel',
            type: 'number',
            default: 35,
            verifyRules: ['required'],
        },
        appABIs: {
            label: 'i18n:android.options.appABIs',
            type: 'array',
            default: ['arm64-v8a'],
            items: { type: 'string' },
        },
        resizeableActivity: {
            label: 'i18n:android.options.resizeable_activity',
            type: 'boolean',
            default: true,
        },
        maxAspectRatio: {
            label: 'i18n:android.options.max_aspect_ratio',
            type: 'string',
            default: '2.4',
        },
        orientation: {
            label: 'i18n:android.options.screen_orientation',
            type: 'object',
            properties: {
                portrait: {
                    label: 'i18n:android.options.portrait',
                    type: 'boolean',
                    default: false,
                },
                upsideDown: {
                    label: 'i18n:android.options.upsideDown',
                    type: 'boolean',
                    default: false,
                },
                landscapeRight: {
                    label: 'i18n:android.options.landscape_right',
                    type: 'boolean',
                    default: true,
                },
                landscapeLeft: {
                    label: 'i18n:android.options.landscape_left',
                    type: 'boolean',
                    default: true,
                },
            },
            default: {
                portrait: false,
                upsideDown: false,
                landscapeRight: true,
                landscapeLeft: true,
            },
        },
        useDebugKeystore: {
            label: 'i18n:android.KEYSTORE.use_debug_keystore',
            type: 'boolean',
            default: true,
        },
        keystorePath: {
            label: 'i18n:android.KEYSTORE.keystore_path',
            type: 'string',
            default: '',
        },
        keystorePassword: {
            label: 'i18n:android.KEYSTORE.keystore_password',
            type: 'string',
            default: '',
        },
        keystoreAlias: {
            label: 'i18n:android.KEYSTORE.keystore_alias',
            type: 'string',
            default: '',
        },
        keystoreAliasPassword: {
            label: 'i18n:android.KEYSTORE.keystore_alias_password',
            type: 'string',
            default: '',
        },
        appBundle: {
            label: 'i18n:android.options.app_bundle',
            type: 'boolean',
            default: false,
        },
        androidInstant: {
            label: 'i18n:android.options.google_play_instant',
            type: 'boolean',
            default: false,
        },
        inputSDK: {
            label: 'i18n:android.options.input_sdk',
            type: 'boolean',
            default: false,
        },
        remoteUrl: {
            label: 'i18n:android.options.remoteUrl',
            type: 'string',
            default: '',
        },
        swappy: {
            label: 'i18n:android.options.swappy',
            type: 'boolean',
            default: false,
            description: 'i18n:android.options.swappy_tips',
        },
        renderBackEnd: {
            label: 'i18n:android.options.render_back_end',
            type: 'object',
            properties: {
                vulkan: {
                    label: 'Vulkan',
                    type: 'boolean',
                    default: false,
                },
                gles3: {
                    label: 'GLES3',
                    type: 'boolean',
                    default: true,
                },
                gles2: {
                    label: 'GLES2',
                    type: 'boolean',
                    default: true,
                },
            },
            default: {
                vulkan: false,
                gles3: true,
                gles2: true,
            },
        },
    },
    textureCompressConfig: {
        platformType: 'android',
        support: {
            rgb: ['etc2_rgb', 'etc1_rgb', 'astc_4x4', 'astc_5x5', 'astc_6x6', 'astc_8x8', 'astc_10x5', 'astc_10x10', 'astc_12x12'],
            rgba: ['etc2_rgba', 'etc1_rgb_a', 'astc_4x4', 'astc_5x5', 'astc_6x6', 'astc_8x8', 'astc_10x5', 'astc_10x10', 'astc_12x12'],
        },
    },
    hooks: './hooks',
};
exports.default = config;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci9wbGF0Zm9ybXMvYW5kcm9pZC9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUdiLG9EQUEwRTtBQUUxRSxNQUFNLE1BQU0sR0FBK0I7SUFDdkMsR0FBRyw2QkFBYTtJQUNoQixXQUFXLEVBQUUsU0FBUztJQUN0QixZQUFZLEVBQUUsU0FBUztJQUN2QixHQUFHLEVBQUUsbURBQW1EO0lBQ3hELGFBQWEsRUFBRTtRQUNYLFNBQVMsRUFBRTtZQUNQLE1BQU0sRUFBRSxJQUFJO1NBQ2Y7UUFDRCxnQkFBZ0IsRUFBRTtZQUNkLE1BQU0sRUFBRSxLQUFLO1NBQ2hCO1FBQ0Qsb0JBQW9CLEVBQUU7WUFDbEIsT0FBTyxFQUFFLE1BQU07U0FDbEI7S0FDSjtJQUNELGFBQWEsRUFBRTtRQUNYLFdBQVcsRUFBRTtZQUNULElBQUksRUFBRSxDQUFDLEdBQVcsRUFBRSxFQUFFO2dCQUNsQix3RUFBd0U7Z0JBQ3hFLE9BQU8sK0JBQStCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JELENBQUM7WUFDRCxPQUFPLEVBQUUsZ0NBQWdDO1NBQzVDO0tBQ0o7SUFDRCxPQUFPLEVBQUU7UUFDTCxHQUFHLHVDQUF1QjtRQUMxQixXQUFXLEVBQUU7WUFDVCxLQUFLLEVBQUUsbUNBQW1DO1lBQzFDLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLGdCQUFnQjtZQUN6QixXQUFXLEVBQUUsQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDO1NBQzNDO1FBQ0QsUUFBUSxFQUFFO1lBQ04sS0FBSyxFQUFFLCtCQUErQjtZQUN0QyxJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRSxFQUFFO1lBQ1gsV0FBVyxFQUFFLENBQUMsVUFBVSxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxFQUFFO1lBQ0wsS0FBSyxFQUFF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Q2YsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsT0FBTyxFQUFFLEtBQUs7aUJBQ2pCO2dCQUNELEtBQUssRUFBRTtvQkFDSCxLQUFLLEVBQUUsT0FBTztvQkFDZCxJQUFJLEVBQUUsU0FBUztvQkFDZixPQUFPLEVBQUUsSUFBSTtpQkFDaEI7Z0JBQ0QsS0FBSyxFQUFFO29CQUNILEtBQUssRUFBRSxPQUFPO29CQUNkLElBQUksRUFBRSxTQUFTO29CQUNmLE9BQU8sRUFBRSxJQUFJO2lCQUNoQjthQUNKO1lBQ0QsT0FBTyxFQUFFO2dCQUNMLE1BQU0sRUFBRSxLQUFLO2dCQUNiLEtBQUssRUFBRSxJQUFJO2dCQUNYLEtBQUssRUFBRSxJQUFJO2FBQ2Q7U0FDSjtLQUNKO0lBQ0QscUJBQXFCLEVBQUU7UUFDbkIsWUFBWSxFQUFFLFNBQVM7UUFDdkIsT0FBTyxFQUFFO1lBQ0wsR0FBRyxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUM7WUFDdEgsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUM7U0FDN0g7S0FDSjtJQUNELEtBQUssRUFBRSxTQUFTO0NBQ25CLENBQUM7QUFFRixrQkFBZSxNQUFNLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBJUGxhdGZvcm1CdWlsZFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBjb21tb25PcHRpb25zLCBiYXNlTmF0aXZlQ29tbW9uT3B0aW9ucyB9IGZyb20gJy4uL25hdGl2ZS1jb21tb24nO1xyXG5cclxuY29uc3QgY29uZmlnOiBJUGxhdGZvcm1CdWlsZFBsdWdpbkNvbmZpZyA9IHtcclxuICAgIC4uLmNvbW1vbk9wdGlvbnMsXHJcbiAgICBkaXNwbGF5TmFtZTogJ0FuZHJvaWQnLFxyXG4gICAgcGxhdGZvcm1UeXBlOiAnQU5EUk9JRCcsXHJcbiAgICBkb2M6ICdlZGl0b3IvcHVibGlzaC9hbmRyb2lkL2J1aWxkLWV4YW1wbGUtYW5kcm9pZC5odG1sJyxcclxuICAgIGNvbW1vbk9wdGlvbnM6IHtcclxuICAgICAgICBwb2x5ZmlsbHM6IHtcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXNlQnVpbHRpblNlcnZlcjoge1xyXG4gICAgICAgICAgICBoaWRkZW46IGZhbHNlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbmF0aXZlQ29kZUJ1bmRsZU1vZGU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogJ3dhc20nLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgdmVyaWZ5UnVsZU1hcDoge1xyXG4gICAgICAgIHBhY2thZ2VOYW1lOiB7XHJcbiAgICAgICAgICAgIGZ1bmM6IChzdHI6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gcmVmZXI6IGh0dHBzOi8vZGV2ZWxvcGVyLmFuZHJvaWQuY29tL3N0dWRpby9idWlsZC9hcHBsaWNhdGlvbi1pZC5odG1sXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gL15bYS16QS1aXVxcdyooXFwuW2EtekEtWl1cXHcqKSskLy50ZXN0KHN0cik7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIHBhY2thZ2UgbmFtZSBzcGVjaWZpZWQnLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICAgIC4uLmJhc2VOYXRpdmVDb21tb25PcHRpb25zLFxyXG4gICAgICAgIHBhY2thZ2VOYW1lOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjphbmRyb2lkLm9wdGlvbnMucGFja2FnZV9uYW1lJyxcclxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6ICdjb20uY29jb3MuZ2FtZScsXHJcbiAgICAgICAgICAgIHZlcmlmeVJ1bGVzOiBbJ3JlcXVpcmVkJywgJ3BhY2thZ2VOYW1lJ10sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhcGlMZXZlbDoge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YW5kcm9pZC5vcHRpb25zLmFwaUxldmVsJyxcclxuICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IDM1LFxyXG4gICAgICAgICAgICB2ZXJpZnlSdWxlczogWydyZXF1aXJlZCddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYXBwQUJJczoge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YW5kcm9pZC5vcHRpb25zLmFwcEFCSXMnLFxyXG4gICAgICAgICAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiBbJ2FybTY0LXY4YSddLFxyXG4gICAgICAgICAgICBpdGVtczogeyB0eXBlOiAnc3RyaW5nJyB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVzaXplYWJsZUFjdGl2aXR5OiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjphbmRyb2lkLm9wdGlvbnMucmVzaXplYWJsZV9hY3Rpdml0eScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1heEFzcGVjdFJhdGlvOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjphbmRyb2lkLm9wdGlvbnMubWF4X2FzcGVjdF9yYXRpbycsXHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAnMi40JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9yaWVudGF0aW9uOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjphbmRyb2lkLm9wdGlvbnMuc2NyZWVuX29yaWVudGF0aW9uJyxcclxuICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgIHBvcnRyYWl0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdpMThuOmFuZHJvaWQub3B0aW9ucy5wb3J0cmFpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHVwc2lkZURvd246IHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2kxOG46YW5kcm9pZC5vcHRpb25zLnVwc2lkZURvd24nLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBsYW5kc2NhcGVSaWdodDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnaTE4bjphbmRyb2lkLm9wdGlvbnMubGFuZHNjYXBlX3JpZ2h0JyxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBsYW5kc2NhcGVMZWZ0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdpMThuOmFuZHJvaWQub3B0aW9ucy5sYW5kc2NhcGVfbGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICBwb3J0cmFpdDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB1cHNpZGVEb3duOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGxhbmRzY2FwZVJpZ2h0OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgbGFuZHNjYXBlTGVmdDogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVzZURlYnVnS2V5c3RvcmU6IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOmFuZHJvaWQuS0VZU1RPUkUudXNlX2RlYnVnX2tleXN0b3JlJyxcclxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAga2V5c3RvcmVQYXRoOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjphbmRyb2lkLktFWVNUT1JFLmtleXN0b3JlX3BhdGgnLFxyXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogJycsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBrZXlzdG9yZVBhc3N3b3JkOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjphbmRyb2lkLktFWVNUT1JFLmtleXN0b3JlX3Bhc3N3b3JkJyxcclxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6ICcnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAga2V5c3RvcmVBbGlhczoge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YW5kcm9pZC5LRVlTVE9SRS5rZXlzdG9yZV9hbGlhcycsXHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGtleXN0b3JlQWxpYXNQYXNzd29yZDoge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YW5kcm9pZC5LRVlTVE9SRS5rZXlzdG9yZV9hbGlhc19wYXNzd29yZCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFwcEJ1bmRsZToge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YW5kcm9pZC5vcHRpb25zLmFwcF9idW5kbGUnLFxyXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYW5kcm9pZEluc3RhbnQ6IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOmFuZHJvaWQub3B0aW9ucy5nb29nbGVfcGxheV9pbnN0YW50JyxcclxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlucHV0U0RLOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnaTE4bjphbmRyb2lkLm9wdGlvbnMuaW5wdXRfc2RrJyxcclxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbW90ZVVybDoge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YW5kcm9pZC5vcHRpb25zLnJlbW90ZVVybCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN3YXBweToge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YW5kcm9pZC5vcHRpb25zLnN3YXBweScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnaTE4bjphbmRyb2lkLm9wdGlvbnMuc3dhcHB5X3RpcHMnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVuZGVyQmFja0VuZDoge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46YW5kcm9pZC5vcHRpb25zLnJlbmRlcl9iYWNrX2VuZCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgICB2dWxrYW46IHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1Z1bGthbicsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGdsZXMzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdHTEVTMycsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZ2xlczI6IHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0dMRVMyJyxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgIHZ1bGthbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBnbGVzMzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGdsZXMyOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgdGV4dHVyZUNvbXByZXNzQ29uZmlnOiB7XHJcbiAgICAgICAgcGxhdGZvcm1UeXBlOiAnYW5kcm9pZCcsXHJcbiAgICAgICAgc3VwcG9ydDoge1xyXG4gICAgICAgICAgICByZ2I6IFsnZXRjMl9yZ2InLCAnZXRjMV9yZ2InLCAnYXN0Y180eDQnLCAnYXN0Y181eDUnLCAnYXN0Y182eDYnLCAnYXN0Y184eDgnLCAnYXN0Y18xMHg1JywgJ2FzdGNfMTB4MTAnLCAnYXN0Y18xMngxMiddLFxyXG4gICAgICAgICAgICByZ2JhOiBbJ2V0YzJfcmdiYScsICdldGMxX3JnYl9hJywgJ2FzdGNfNHg0JywgJ2FzdGNfNXg1JywgJ2FzdGNfNng2JywgJ2FzdGNfOHg4JywgJ2FzdGNfMTB4NScsICdhc3RjXzEweDEwJywgJ2FzdGNfMTJ4MTInXSxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGhvb2tzOiAnLi9ob29rcycsXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjb25maWc7XHJcblxyXG4iXX0=