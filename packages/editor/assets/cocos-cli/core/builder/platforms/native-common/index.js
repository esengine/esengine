'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonOptions = exports.baseNativeCommonOptions = void 0;
const path_1 = require("path");
const utils_1 = __importDefault(require("../../../base/utils"));
const customBuildStages = [{
        name: 'make',
        hook: 'make',
        displayName: 'i18n:native.options.make',
    }, {
        name: 'run',
        displayName: 'i18n:native.options.run',
        hook: 'run',
    }];
exports.baseNativeCommonOptions = {
    hotModuleReload: {
        label: 'Hot Module Reload',
        type: 'boolean',
        default: false,
        experiment: true,
    },
    serverMode: {
        label: 'Server Mode',
        type: 'boolean',
        default: false,
    },
    netMode: {
        label: 'NetMode',
        type: 'enum',
        default: 0,
        items: [
            { label: 'Client', value: 0 },
            { label: 'Host Server', value: 1 },
            { label: 'Listen Server', value: 2 },
        ],
    },
    encrypted: {
        label: 'i18n:native.options.encrypted',
        type: 'boolean',
        default: false,
    },
    xxteaKey: {
        label: 'i18n:native.options.xxtea_key',
        type: 'string',
        default: utils_1.default.UUID.generate().substr(0, 16),
    },
    compressZip: {
        label: 'i18n:native.options.compress_zip',
        type: 'boolean',
        default: false,
    },
    JobSystem: {
        label: 'Job System',
        type: 'enum',
        default: 'none',
        items: [
            { label: 'None', value: 'none' },
            { label: 'TaskFlow', value: 'taskFlow' },
            { label: 'TBB', value: 'tbb' },
        ],
        verifyRules: [],
    },
};
exports.commonOptions = {
    doc: 'editor/publish/native-options.html',
    hooks: './hooks',
    priority: 2,
    assetBundleConfig: {
        supportedCompressionTypes: ['none', 'merge_dep', 'merge_all_json'],
        platformType: 'native',
    },
    buildTemplateConfig: {
        templates: [{
                path: (0, path_1.join)(__dirname, '../../../../../resources/3d/engine/templates/native/index.ejs'),
                destUrl: 'index.ejs',
            }],
        version: '1.0.0',
        dirname: 'native',
        displayName: 'i18n:native.title',
    },
    customBuildStages,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3BsYXRmb3Jtcy9uYXRpdmUtY29tbW9uL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7O0FBRWIsK0JBQTRCO0FBRzVCLGdFQUF3QztBQUV4QyxNQUFNLGlCQUFpQixHQUFzQixDQUFDO1FBQzFDLElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLE1BQU07UUFDWixXQUFXLEVBQUUsMEJBQTBCO0tBQzFDLEVBQUU7UUFDQyxJQUFJLEVBQUUsS0FBSztRQUNYLFdBQVcsRUFBRSx5QkFBeUI7UUFDdEMsSUFBSSxFQUFFLEtBQUs7S0FDZCxDQUFDLENBQUM7QUFFVSxRQUFBLHVCQUF1QixHQUFvQjtJQUNwRCxlQUFlLEVBQUU7UUFDYixLQUFLLEVBQUUsbUJBQW1CO1FBQzFCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7UUFDZCxVQUFVLEVBQUUsSUFBSTtLQUNuQjtJQUNELFVBQVUsRUFBRTtRQUNSLEtBQUssRUFBRSxhQUFhO1FBQ3BCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEtBQUs7S0FDakI7SUFDRCxPQUFPLEVBQUU7UUFDTCxLQUFLLEVBQUUsU0FBUztRQUNoQixJQUFJLEVBQUUsTUFBTTtRQUNaLE9BQU8sRUFBRSxDQUFDO1FBQ1YsS0FBSyxFQUFFO1lBQ0gsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7WUFDN0IsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7WUFDbEMsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUU7U0FDdkM7S0FDSjtJQUNELFNBQVMsRUFBRTtRQUNQLEtBQUssRUFBRSwrQkFBK0I7UUFDdEMsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztLQUNqQjtJQUNELFFBQVEsRUFBRTtRQUNOLEtBQUssRUFBRSwrQkFBK0I7UUFDdEMsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsZUFBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztLQUMvQztJQUNELFdBQVcsRUFBRTtRQUNULEtBQUssRUFBRSxrQ0FBa0M7UUFDekMsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztLQUNqQjtJQUNELFNBQVMsRUFBRTtRQUNQLEtBQUssRUFBRSxZQUFZO1FBQ25CLElBQUksRUFBRSxNQUFNO1FBQ1osT0FBTyxFQUFFLE1BQU07UUFDZixLQUFLLEVBQUU7WUFDSCxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRTtZQUNoQyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRTtZQUN4QyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTtTQUNqQztRQUNELFdBQVcsRUFBRSxFQUFFO0tBQ2xCO0NBQ0osQ0FBQztBQUVXLFFBQUEsYUFBYSxHQUErRztJQUNqSSxHQUFHLEVBQUUsb0NBQW9DO0lBQzdDLEtBQUssRUFBRSxTQUFTO0lBQ2hCLFFBQVEsRUFBRSxDQUFDO0lBQ1gsaUJBQWlCLEVBQUU7UUFDZix5QkFBeUIsRUFBRSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLENBQUM7UUFDbEUsWUFBWSxFQUFFLFFBQVE7S0FDekI7SUFDRCxtQkFBbUIsRUFBRTtRQUNqQixTQUFTLEVBQUUsQ0FBQztnQkFDUixJQUFJLEVBQUUsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLCtEQUErRCxDQUFDO2dCQUN0RixPQUFPLEVBQUUsV0FBVzthQUN2QixDQUFDO1FBQ0YsT0FBTyxFQUFFLE9BQU87UUFDaEIsT0FBTyxFQUFFLFFBQVE7UUFDakIsV0FBVyxFQUFFLG1CQUFtQjtLQUNuQztJQUNELGlCQUFpQjtDQUNwQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBJRGlzcGxheU9wdGlvbnMgfSBmcm9tICcuLi8uLi9AdHlwZXMnO1xyXG5pbXBvcnQgeyBJQnVpbGRTdGFnZUl0ZW0sIElJbnRlcm5hbEJ1aWxkUGx1Z2luQ29uZmlnLCBJUGxhdGZvcm1CdWlsZFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vYmFzZS91dGlscyc7XHJcblxyXG5jb25zdCBjdXN0b21CdWlsZFN0YWdlczogSUJ1aWxkU3RhZ2VJdGVtW10gPSBbe1xyXG4gICAgbmFtZTogJ21ha2UnLFxyXG4gICAgaG9vazogJ21ha2UnLFxyXG4gICAgZGlzcGxheU5hbWU6ICdpMThuOm5hdGl2ZS5vcHRpb25zLm1ha2UnLFxyXG59LCB7XHJcbiAgICBuYW1lOiAncnVuJyxcclxuICAgIGRpc3BsYXlOYW1lOiAnaTE4bjpuYXRpdmUub3B0aW9ucy5ydW4nLFxyXG4gICAgaG9vazogJ3J1bicsXHJcbn1dO1xyXG5cclxuZXhwb3J0IGNvbnN0IGJhc2VOYXRpdmVDb21tb25PcHRpb25zOiBJRGlzcGxheU9wdGlvbnMgPSB7XHJcbiAgICBob3RNb2R1bGVSZWxvYWQ6IHtcclxuICAgICAgICBsYWJlbDogJ0hvdCBNb2R1bGUgUmVsb2FkJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICAgICAgZXhwZXJpbWVudDogdHJ1ZSxcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXJNb2RlOiB7XHJcbiAgICAgICAgbGFiZWw6ICdTZXJ2ZXIgTW9kZScsXHJcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgfSxcclxuICAgIG5ldE1vZGU6IHtcclxuICAgICAgICBsYWJlbDogJ05ldE1vZGUnLFxyXG4gICAgICAgIHR5cGU6ICdlbnVtJyxcclxuICAgICAgICBkZWZhdWx0OiAwLFxyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgIHsgbGFiZWw6ICdDbGllbnQnLCB2YWx1ZTogMCB9LFxyXG4gICAgICAgICAgICB7IGxhYmVsOiAnSG9zdCBTZXJ2ZXInLCB2YWx1ZTogMSB9LFxyXG4gICAgICAgICAgICB7IGxhYmVsOiAnTGlzdGVuIFNlcnZlcicsIHZhbHVlOiAyIH0sXHJcbiAgICAgICAgXSxcclxuICAgIH0sXHJcbiAgICBlbmNyeXB0ZWQ6IHtcclxuICAgICAgICBsYWJlbDogJ2kxOG46bmF0aXZlLm9wdGlvbnMuZW5jcnlwdGVkJyxcclxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXHJcbiAgICB9LFxyXG4gICAgeHh0ZWFLZXk6IHtcclxuICAgICAgICBsYWJlbDogJ2kxOG46bmF0aXZlLm9wdGlvbnMueHh0ZWFfa2V5JyxcclxuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICBkZWZhdWx0OiBVdGlscy5VVUlELmdlbmVyYXRlKCkuc3Vic3RyKDAsIDE2KSxcclxuICAgIH0sXHJcbiAgICBjb21wcmVzc1ppcDoge1xyXG4gICAgICAgIGxhYmVsOiAnaTE4bjpuYXRpdmUub3B0aW9ucy5jb21wcmVzc196aXAnLFxyXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgIH0sXHJcbiAgICBKb2JTeXN0ZW06IHtcclxuICAgICAgICBsYWJlbDogJ0pvYiBTeXN0ZW0nLFxyXG4gICAgICAgIHR5cGU6ICdlbnVtJyxcclxuICAgICAgICBkZWZhdWx0OiAnbm9uZScsXHJcbiAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgeyBsYWJlbDogJ05vbmUnLCB2YWx1ZTogJ25vbmUnIH0sXHJcbiAgICAgICAgICAgIHsgbGFiZWw6ICdUYXNrRmxvdycsIHZhbHVlOiAndGFza0Zsb3cnIH0sXHJcbiAgICAgICAgICAgIHsgbGFiZWw6ICdUQkInLCB2YWx1ZTogJ3RiYicgfSxcclxuICAgICAgICBdLFxyXG4gICAgICAgIHZlcmlmeVJ1bGVzOiBbXSxcclxuICAgIH0sXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgY29tbW9uT3B0aW9uczogSUludGVybmFsQnVpbGRQbHVnaW5Db25maWcgJiBQaWNrPElQbGF0Zm9ybUJ1aWxkUGx1Z2luQ29uZmlnLCAnYXNzZXRCdW5kbGVDb25maWcnIHwgJ2J1aWxkVGVtcGxhdGVDb25maWcnPiA9IHtcclxuICAgICAgICBkb2M6ICdlZGl0b3IvcHVibGlzaC9uYXRpdmUtb3B0aW9ucy5odG1sJyxcclxuICAgIGhvb2tzOiAnLi9ob29rcycsXHJcbiAgICBwcmlvcml0eTogMixcclxuICAgIGFzc2V0QnVuZGxlQ29uZmlnOiB7XHJcbiAgICAgICAgc3VwcG9ydGVkQ29tcHJlc3Npb25UeXBlczogWydub25lJywgJ21lcmdlX2RlcCcsICdtZXJnZV9hbGxfanNvbiddLFxyXG4gICAgICAgIHBsYXRmb3JtVHlwZTogJ25hdGl2ZScsXHJcbiAgICB9LFxyXG4gICAgYnVpbGRUZW1wbGF0ZUNvbmZpZzoge1xyXG4gICAgICAgIHRlbXBsYXRlczogW3tcclxuICAgICAgICAgICAgcGF0aDogam9pbihfX2Rpcm5hbWUsICcuLi8uLi8uLi8uLi8uLi9yZXNvdXJjZXMvM2QvZW5naW5lL3RlbXBsYXRlcy9uYXRpdmUvaW5kZXguZWpzJyksXHJcbiAgICAgICAgICAgIGRlc3RVcmw6ICdpbmRleC5lanMnLFxyXG4gICAgICAgIH1dLFxyXG4gICAgICAgIHZlcnNpb246ICcxLjAuMCcsXHJcbiAgICAgICAgZGlybmFtZTogJ25hdGl2ZScsXHJcbiAgICAgICAgZGlzcGxheU5hbWU6ICdpMThuOm5hdGl2ZS50aXRsZScsXHJcbiAgICB9LFxyXG4gICAgY3VzdG9tQnVpbGRTdGFnZXMsXHJcbn07XHJcbiJdfQ==