'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const global_1 = require("../../../../global");
const PLATFORM = 'web-desktop';
const buildTemplateDir = (0, path_1.join)(global_1.GlobalPaths.staticDir, `build-templates/${PLATFORM}`);
const config = {
    displayName: 'i18n:web-desktop.title',
    platformType: 'HTML5',
    doc: 'editor/publish/publish-web.html',
    options: {
        useWebGPU: {
            label: 'WEBGPU',
            type: 'boolean',
            default: false,
            description: 'i18n:web-desktop.tips.webgpu',
            experiment: true,
        },
        resolution: {
            type: 'object',
            label: 'i18n:web-desktop.options.resolution',
            properties: {
                designWidth: {
                    label: 'i18n:web-desktop.options.design_width',
                    type: 'number',
                    default: 1280,
                },
                designHeight: {
                    label: 'i18n:web-desktop.options.design_height',
                    type: 'number',
                    default: 960,
                },
            },
            default: {
                designWidth: 1280,
                designHeight: 960,
            },
        },
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
    hooks: './hooks',
    textureCompressConfig: {
        platformType: 'web',
        support: {
            rgb: [],
            rgba: [],
        },
    },
    assetBundleConfig: {
        supportedCompressionTypes: ['none', 'merge_dep', 'merge_all_json'],
        platformType: 'web',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci9wbGF0Zm9ybXMvd2ViLWRlc2t0b3AvY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYiwrQkFBNEI7QUFFNUIsK0NBQWlEO0FBQ2pELE1BQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQztBQUMvQixNQUFNLGdCQUFnQixHQUFHLElBQUEsV0FBSSxFQUFDLG9CQUFXLENBQUMsU0FBUyxFQUFFLG1CQUFtQixRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBRXBGLE1BQU0sTUFBTSxHQUErQjtJQUN2QyxXQUFXLEVBQUUsd0JBQXdCO0lBQ3JDLFlBQVksRUFBRSxPQUFPO0lBQ3JCLEdBQUcsRUFBRSxpQ0FBaUM7SUFDdEMsT0FBTyxFQUFFO1FBQ0wsU0FBUyxFQUFFO1lBQ1AsS0FBSyxFQUFFLFFBQVE7WUFDZixJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxLQUFLO1lBQ2QsV0FBVyxFQUFFLDhCQUE4QjtZQUMzQyxVQUFVLEVBQUUsSUFBSTtTQUNuQjtRQUNELFVBQVUsRUFBRTtZQUNSLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLHFDQUFxQztZQUM1QyxVQUFVLEVBQUU7Z0JBQ1IsV0FBVyxFQUFFO29CQUNULEtBQUssRUFBRSx1Q0FBdUM7b0JBQzlDLElBQUksRUFBRSxRQUFRO29CQUNkLE9BQU8sRUFBRSxJQUFJO2lCQUNoQjtnQkFDRCxZQUFZLEVBQUU7b0JBQ1YsS0FBSyxFQUFFLHdDQUF3QztvQkFDL0MsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsT0FBTyxFQUFFLEdBQUc7aUJBQ2Y7YUFDSjtZQUNELE9BQU8sRUFBRTtnQkFDTCxXQUFXLEVBQUUsSUFBSTtnQkFDakIsWUFBWSxFQUFFLEdBQUc7YUFDcEI7U0FDSjtLQUNKO0lBQ0QsYUFBYSxFQUFFO1FBQ1gsU0FBUyxFQUFFO1lBQ1AsT0FBTyxFQUFFO2dCQUNMLGNBQWMsRUFBRSxJQUFJO2FBQ3ZCO1NBQ0o7UUFDRCxvQkFBb0IsRUFBRTtZQUNsQixPQUFPLEVBQUUsTUFBTTtTQUNsQjtRQUNELHdCQUF3QixFQUFFO1lBQ3RCLE9BQU8sRUFBRTtnQkFDTCxjQUFjLEVBQUU7b0JBQ1osWUFBWSxFQUFFLElBQUk7aUJBQ3JCO2FBQ0o7U0FDSjtLQUNKO0lBQ0QsS0FBSyxFQUFFLFNBQVM7SUFDaEIscUJBQXFCLEVBQUU7UUFDbkIsWUFBWSxFQUFFLEtBQUs7UUFDbkIsT0FBTyxFQUFFO1lBQ0wsR0FBRyxFQUFFLEVBQUU7WUFDUCxJQUFJLEVBQUUsRUFBRTtTQUNYO0tBQ0o7SUFDRCxpQkFBaUIsRUFBRTtRQUNmLHlCQUF5QixFQUFFLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQztRQUNsRSxZQUFZLEVBQUUsS0FBSztLQUN0QjtJQUNELG1CQUFtQixFQUFFO1FBQ2pCLFNBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ2pDLE9BQU87Z0JBQ0gsSUFBSSxFQUFFLElBQUEsV0FBSSxFQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQztnQkFDakMsT0FBTyxFQUFFLEdBQUc7YUFDZixDQUFDO1FBQ04sQ0FBQyxDQUFDO1FBQ0YsT0FBTyxFQUFFLE9BQU87S0FDbkI7SUFDRCxpQkFBaUIsRUFBRSxDQUFDO1lBQ2hCLElBQUksRUFBRSxLQUFLO1lBQ1gsSUFBSSxFQUFFLEtBQUs7WUFDWCxvQkFBb0IsRUFBRSxLQUFLO1NBQzlCLENBQUM7Q0FDTCxDQUFDO0FBRUYsa0JBQWUsTUFBTSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBJUGxhdGZvcm1CdWlsZFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBHbG9iYWxQYXRocyB9IGZyb20gJy4uLy4uLy4uLy4uL2dsb2JhbCc7XHJcbmNvbnN0IFBMQVRGT1JNID0gJ3dlYi1kZXNrdG9wJztcclxuY29uc3QgYnVpbGRUZW1wbGF0ZURpciA9IGpvaW4oR2xvYmFsUGF0aHMuc3RhdGljRGlyLCBgYnVpbGQtdGVtcGxhdGVzLyR7UExBVEZPUk19YCk7XHJcblxyXG5jb25zdCBjb25maWc6IElQbGF0Zm9ybUJ1aWxkUGx1Z2luQ29uZmlnID0ge1xyXG4gICAgZGlzcGxheU5hbWU6ICdpMThuOndlYi1kZXNrdG9wLnRpdGxlJyxcclxuICAgIHBsYXRmb3JtVHlwZTogJ0hUTUw1JyxcclxuICAgIGRvYzogJ2VkaXRvci9wdWJsaXNoL3B1Ymxpc2gtd2ViLmh0bWwnLFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICAgIHVzZVdlYkdQVToge1xyXG4gICAgICAgICAgICBsYWJlbDogJ1dFQkdQVScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnaTE4bjp3ZWItZGVza3RvcC50aXBzLndlYmdwdScsXHJcbiAgICAgICAgICAgIGV4cGVyaW1lbnQ6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXNvbHV0aW9uOiB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46d2ViLWRlc2t0b3Aub3B0aW9ucy5yZXNvbHV0aW9uJyxcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgZGVzaWduV2lkdGg6IHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ2kxOG46d2ViLWRlc2t0b3Aub3B0aW9ucy5kZXNpZ25fd2lkdGgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IDEyODAsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGVzaWduSGVpZ2h0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdpMThuOndlYi1kZXNrdG9wLm9wdGlvbnMuZGVzaWduX2hlaWdodCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogOTYwLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgZGVzaWduV2lkdGg6IDEyODAsXHJcbiAgICAgICAgICAgICAgICBkZXNpZ25IZWlnaHQ6IDk2MCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGNvbW1vbk9wdGlvbnM6IHtcclxuICAgICAgICBwb2x5ZmlsbHM6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgYXN5bmNGdW5jdGlvbnM6IHRydWUsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBuYXRpdmVDb2RlQnVuZGxlTW9kZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiAnYm90aCcsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvdmVyd3JpdGVQcm9qZWN0U2V0dGluZ3M6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgICAgICAgICAgaW5jbHVkZU1vZHVsZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAnZ2Z4LXdlYmdsMic6ICdvbicsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgaG9va3M6ICcuL2hvb2tzJyxcclxuICAgIHRleHR1cmVDb21wcmVzc0NvbmZpZzoge1xyXG4gICAgICAgIHBsYXRmb3JtVHlwZTogJ3dlYicsXHJcbiAgICAgICAgc3VwcG9ydDoge1xyXG4gICAgICAgICAgICByZ2I6IFtdLFxyXG4gICAgICAgICAgICByZ2JhOiBbXSxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGFzc2V0QnVuZGxlQ29uZmlnOiB7XHJcbiAgICAgICAgc3VwcG9ydGVkQ29tcHJlc3Npb25UeXBlczogWydub25lJywgJ21lcmdlX2RlcCcsICdtZXJnZV9hbGxfanNvbiddLFxyXG4gICAgICAgIHBsYXRmb3JtVHlwZTogJ3dlYicsXHJcbiAgICB9LFxyXG4gICAgYnVpbGRUZW1wbGF0ZUNvbmZpZzoge1xyXG4gICAgICAgIHRlbXBsYXRlczogWydpbmRleC5lanMnXS5tYXAoKHVybCkgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcGF0aDogam9pbihidWlsZFRlbXBsYXRlRGlyLCB1cmwpLFxyXG4gICAgICAgICAgICAgICAgZGVzdFVybDogdXJsLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIHZlcnNpb246ICcxLjAuMCcsXHJcbiAgICB9LFxyXG4gICAgY3VzdG9tQnVpbGRTdGFnZXM6IFt7XHJcbiAgICAgICAgaG9vazogJ3J1bicsXHJcbiAgICAgICAgbmFtZTogJ3J1bicsXHJcbiAgICAgICAgcmVxdWlyZWRCdWlsZE9wdGlvbnM6IGZhbHNlLFxyXG4gICAgfV0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjb25maWc7Il19