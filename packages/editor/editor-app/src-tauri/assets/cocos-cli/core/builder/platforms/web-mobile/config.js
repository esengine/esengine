'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const global_1 = require("../../../../global");
const PLATFORM = 'web-mobile';
const buildTemplateDir = (0, path_1.join)(global_1.GlobalPaths.staticDir, `build-templates/${PLATFORM}`);
const config = {
    displayName: 'i18n:web-mobile.title',
    platformType: 'HTML5',
    doc: 'editor/publish/publish-web.html',
    hooks: './hooks',
    textureCompressConfig: {
        platformType: 'web',
        support: {
            rgb: [
                'etc2_rgb',
                'etc1_rgb',
                'pvrtc_4bits_rgb',
                'pvrtc_2bits_rgb',
                'astc_4x4',
                'astc_5x5',
                'astc_6x6',
                'astc_8x8',
                'astc_10x5',
                'astc_10x10',
                'astc_12x12',
            ],
            rgba: [
                'etc2_rgba',
                'etc1_rgb_a',
                'pvrtc_4bits_rgb_a',
                'pvrtc_4bits_rgba',
                'pvrtc_2bits_rgb_a',
                'pvrtc_2bits_rgba',
                'astc_4x4',
                'astc_5x5',
                'astc_6x6',
                'astc_8x8',
                'astc_10x5',
                'astc_10x10',
                'astc_12x12',
            ],
        },
    },
    assetBundleConfig: {
        supportedCompressionTypes: ['none', 'merge_dep', 'merge_all_json'],
        platformType: 'web',
    },
    commonOptions: {
        polyfills: {
            default: {
                asyncFunctions: true,
            },
        },
        nativeCodeBundleMode: {
            default: 'both',
        },
        overwriteProjectSettings: {
            default: {
                includeModules: {
                    'gfx-webgl2': 'on',
                },
            },
        },
    },
    options: {
        useWebGPU: {
            label: 'WEBGPU',
            type: 'boolean',
            default: false,
            description: 'i18n:web-mobile.tips.webgpu',
            experiment: true,
        },
        orientation: {
            label: 'i18n:web-mobile.options.orientation',
            default: 'auto',
            type: 'enum',
            items: ['auto', 'landscape', 'portrait'],
        },
        embedWebDebugger: {
            label: 'i18n:web-mobile.options.web_debugger',
            type: 'boolean',
            default: false,
        },
    },
    buildTemplateConfig: {
        templates: ['index.ejs'].map((url) => {
            return {
                path: (0, path_1.join)(buildTemplateDir, url),
                destUrl: url,
            };
        }),
        version: '1.0.0',
    },
    customBuildStages: [{
            hook: 'run',
            name: 'run',
            requiredBuildOptions: false,
        }],
};
exports.default = config;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci9wbGF0Zm9ybXMvd2ViLW1vYmlsZS9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLCtCQUE0QjtBQUU1QiwrQ0FBaUQ7QUFFakQsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDO0FBRTlCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSxXQUFJLEVBQUMsb0JBQVcsQ0FBQyxTQUFTLEVBQUUsbUJBQW1CLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFFcEYsTUFBTSxNQUFNLEdBQStCO0lBQ3ZDLFdBQVcsRUFBRSx1QkFBdUI7SUFDcEMsWUFBWSxFQUFFLE9BQU87SUFDckIsR0FBRyxFQUFFLGlDQUFpQztJQUN0QyxLQUFLLEVBQUUsU0FBUztJQUNoQixxQkFBcUIsRUFBRTtRQUNuQixZQUFZLEVBQUUsS0FBSztRQUNuQixPQUFPLEVBQUU7WUFDTCxHQUFHLEVBQUU7Z0JBQ0QsVUFBVTtnQkFDVixVQUFVO2dCQUNWLGlCQUFpQjtnQkFDakIsaUJBQWlCO2dCQUNqQixVQUFVO2dCQUNWLFVBQVU7Z0JBQ1YsVUFBVTtnQkFDVixVQUFVO2dCQUNWLFdBQVc7Z0JBQ1gsWUFBWTtnQkFDWixZQUFZO2FBQ2Y7WUFDRCxJQUFJLEVBQUU7Z0JBQ0YsV0FBVztnQkFDWCxZQUFZO2dCQUNaLG1CQUFtQjtnQkFDbkIsa0JBQWtCO2dCQUNsQixtQkFBbUI7Z0JBQ25CLGtCQUFrQjtnQkFDbEIsVUFBVTtnQkFDVixVQUFVO2dCQUNWLFVBQVU7Z0JBQ1YsVUFBVTtnQkFDVixXQUFXO2dCQUNYLFlBQVk7Z0JBQ1osWUFBWTthQUNmO1NBQ0o7S0FDSjtJQUNELGlCQUFpQixFQUFFO1FBQ2YseUJBQXlCLEVBQUUsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixDQUFDO1FBQ2xFLFlBQVksRUFBRSxLQUFLO0tBQ3RCO0lBQ0QsYUFBYSxFQUFFO1FBQ1gsU0FBUyxFQUFFO1lBQ1AsT0FBTyxFQUFFO2dCQUNMLGNBQWMsRUFBRSxJQUFJO2FBQ3ZCO1NBQ0o7UUFDRCxvQkFBb0IsRUFBRTtZQUNsQixPQUFPLEVBQUUsTUFBTTtTQUNsQjtRQUNELHdCQUF3QixFQUFFO1lBQ3RCLE9BQU8sRUFBRTtnQkFDTCxjQUFjLEVBQUU7b0JBQ1osWUFBWSxFQUFFLElBQUk7aUJBQ3JCO2FBQ0o7U0FDSjtLQUNKO0lBQ0QsT0FBTyxFQUFFO1FBQ0wsU0FBUyxFQUFFO1lBQ1AsS0FBSyxFQUFFLFFBQVE7WUFDZixJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxLQUFLO1lBQ2QsV0FBVyxFQUFFLDZCQUE2QjtZQUMxQyxVQUFVLEVBQUUsSUFBSTtTQUNuQjtRQUNELFdBQVcsRUFBRTtZQUNULEtBQUssRUFBRSxxQ0FBcUM7WUFDNUMsT0FBTyxFQUFFLE1BQU07WUFDZixJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDO1NBQzNDO1FBQ0QsZ0JBQWdCLEVBQUU7WUFDZCxLQUFLLEVBQUUsc0NBQXNDO1lBQzdDLElBQUksRUFBRSxTQUFTO1lBQ2YsT0FBTyxFQUFFLEtBQUs7U0FDakI7S0FDSjtJQUNELG1CQUFtQixFQUFFO1FBQ2pCLFNBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ2pDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLElBQUEsV0FBSSxFQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQztnQkFDakMsT0FBTyxFQUFFLEdBQUc7YUFDZixDQUFDO1FBQ04sQ0FBQyxDQUFDO1FBQ0YsT0FBTyxFQUFFLE9BQU87S0FDbkI7SUFDRCxpQkFBaUIsRUFBRSxDQUFDO1lBQ2hCLElBQUksRUFBRSxLQUFLO1lBQ1gsSUFBSSxFQUFFLEtBQUs7WUFDWCxvQkFBb0IsRUFBRSxLQUFLO1NBQzlCLENBQUM7Q0FDTCxDQUFDO0FBRUYsa0JBQWUsTUFBTSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBJUGxhdGZvcm1CdWlsZFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBHbG9iYWxQYXRocyB9IGZyb20gJy4uLy4uLy4uLy4uL2dsb2JhbCc7XHJcblxyXG5jb25zdCBQTEFURk9STSA9ICd3ZWItbW9iaWxlJztcclxuXHJcbmNvbnN0IGJ1aWxkVGVtcGxhdGVEaXIgPSBqb2luKEdsb2JhbFBhdGhzLnN0YXRpY0RpciwgYGJ1aWxkLXRlbXBsYXRlcy8ke1BMQVRGT1JNfWApO1xyXG5cclxuY29uc3QgY29uZmlnOiBJUGxhdGZvcm1CdWlsZFBsdWdpbkNvbmZpZyA9IHtcclxuICAgIGRpc3BsYXlOYW1lOiAnaTE4bjp3ZWItbW9iaWxlLnRpdGxlJyxcclxuICAgIHBsYXRmb3JtVHlwZTogJ0hUTUw1JyxcclxuICAgIGRvYzogJ2VkaXRvci9wdWJsaXNoL3B1Ymxpc2gtd2ViLmh0bWwnLFxyXG4gICAgaG9va3M6ICcuL2hvb2tzJyxcclxuICAgIHRleHR1cmVDb21wcmVzc0NvbmZpZzoge1xyXG4gICAgICAgIHBsYXRmb3JtVHlwZTogJ3dlYicsXHJcbiAgICAgICAgc3VwcG9ydDoge1xyXG4gICAgICAgICAgICByZ2I6IFtcclxuICAgICAgICAgICAgICAgICdldGMyX3JnYicsXHJcbiAgICAgICAgICAgICAgICAnZXRjMV9yZ2InLFxyXG4gICAgICAgICAgICAgICAgJ3B2cnRjXzRiaXRzX3JnYicsXHJcbiAgICAgICAgICAgICAgICAncHZydGNfMmJpdHNfcmdiJyxcclxuICAgICAgICAgICAgICAgICdhc3RjXzR4NCcsXHJcbiAgICAgICAgICAgICAgICAnYXN0Y181eDUnLFxyXG4gICAgICAgICAgICAgICAgJ2FzdGNfNng2JyxcclxuICAgICAgICAgICAgICAgICdhc3RjXzh4OCcsXHJcbiAgICAgICAgICAgICAgICAnYXN0Y18xMHg1JyxcclxuICAgICAgICAgICAgICAgICdhc3RjXzEweDEwJyxcclxuICAgICAgICAgICAgICAgICdhc3RjXzEyeDEyJyxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgcmdiYTogW1xyXG4gICAgICAgICAgICAgICAgJ2V0YzJfcmdiYScsXHJcbiAgICAgICAgICAgICAgICAnZXRjMV9yZ2JfYScsXHJcbiAgICAgICAgICAgICAgICAncHZydGNfNGJpdHNfcmdiX2EnLFxyXG4gICAgICAgICAgICAgICAgJ3B2cnRjXzRiaXRzX3JnYmEnLFxyXG4gICAgICAgICAgICAgICAgJ3B2cnRjXzJiaXRzX3JnYl9hJyxcclxuICAgICAgICAgICAgICAgICdwdnJ0Y18yYml0c19yZ2JhJyxcclxuICAgICAgICAgICAgICAgICdhc3RjXzR4NCcsXHJcbiAgICAgICAgICAgICAgICAnYXN0Y181eDUnLFxyXG4gICAgICAgICAgICAgICAgJ2FzdGNfNng2JyxcclxuICAgICAgICAgICAgICAgICdhc3RjXzh4OCcsXHJcbiAgICAgICAgICAgICAgICAnYXN0Y18xMHg1JyxcclxuICAgICAgICAgICAgICAgICdhc3RjXzEweDEwJyxcclxuICAgICAgICAgICAgICAgICdhc3RjXzEyeDEyJyxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGFzc2V0QnVuZGxlQ29uZmlnOiB7XHJcbiAgICAgICAgc3VwcG9ydGVkQ29tcHJlc3Npb25UeXBlczogWydub25lJywgJ21lcmdlX2RlcCcsICdtZXJnZV9hbGxfanNvbiddLFxyXG4gICAgICAgIHBsYXRmb3JtVHlwZTogJ3dlYicsXHJcbiAgICB9LFxyXG4gICAgY29tbW9uT3B0aW9uczoge1xyXG4gICAgICAgIHBvbHlmaWxsczoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICBhc3luY0Z1bmN0aW9uczogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG5hdGl2ZUNvZGVCdW5kbGVNb2RlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6ICdib3RoJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG92ZXJ3cml0ZVByb2plY3RTZXR0aW5nczoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgICBpbmNsdWRlTW9kdWxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgICdnZngtd2ViZ2wyJzogJ29uJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgdXNlV2ViR1BVOiB7XHJcbiAgICAgICAgICAgIGxhYmVsOiAnV0VCR1BVJyxcclxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdpMThuOndlYi1tb2JpbGUudGlwcy53ZWJncHUnLFxyXG4gICAgICAgICAgICBleHBlcmltZW50OiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3JpZW50YXRpb246IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOndlYi1tb2JpbGUub3B0aW9ucy5vcmllbnRhdGlvbicsXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6ICdhdXRvJyxcclxuICAgICAgICAgICAgdHlwZTogJ2VudW0nLFxyXG4gICAgICAgICAgICBpdGVtczogWydhdXRvJywgJ2xhbmRzY2FwZScsICdwb3J0cmFpdCddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW1iZWRXZWJEZWJ1Z2dlcjoge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46d2ViLW1vYmlsZS5vcHRpb25zLndlYl9kZWJ1Z2dlcicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBidWlsZFRlbXBsYXRlQ29uZmlnOiB7XHJcbiAgICAgICAgdGVtcGxhdGVzOiBbJ2luZGV4LmVqcyddLm1hcCgodXJsKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBwYXRoOiBqb2luKGJ1aWxkVGVtcGxhdGVEaXIsIHVybCksXHJcbiAgICAgICAgICAgICAgICBkZXN0VXJsOiB1cmwsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgdmVyc2lvbjogJzEuMC4wJyxcclxuICAgIH0sXHJcbiAgICBjdXN0b21CdWlsZFN0YWdlczogW3tcclxuICAgICAgICBob29rOiAncnVuJyxcclxuICAgICAgICBuYW1lOiAncnVuJyxcclxuICAgICAgICByZXF1aXJlZEJ1aWxkT3B0aW9uczogZmFsc2UsXHJcbiAgICB9XSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNvbmZpZzsiXX0=