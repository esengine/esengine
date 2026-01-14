'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const native_common_1 = require("../native-common");
const config = {
    ...native_common_1.commonOptions,
    displayName: 'Windows',
    platformType: 'WINDOWS',
    doc: 'editor/publish/windows/build-example-windows.html',
    commonOptions: {
        nativeCodeBundleMode: {
            default: 'wasm',
        },
    },
    verifyRuleMap: {
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
            label: 'i18n:windows.options.executable_name',
            type: 'string',
            default: '',
            verifyRules: ['executableName'],
        },
        renderBackEnd: {
            label: 'Render BackEnd',
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
        targetPlatform: {
            label: 'i18n:windows.options.targetPlatform',
            type: 'enum',
            items: ['x64', 'x86'],
            default: 'x64',
        },
    },
    hooks: './hooks',
};
exports.default = config;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYnVpbGRlci9wbGF0Zm9ybXMvd2luZG93cy9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUdiLG9EQUEwRTtBQUUxRSxNQUFNLE1BQU0sR0FBK0I7SUFDdkMsR0FBRyw2QkFBYTtJQUNoQixXQUFXLEVBQUUsU0FBUztJQUN0QixZQUFZLEVBQUUsU0FBUztJQUN2QixHQUFHLEVBQUUsbURBQW1EO0lBQ3hELGFBQWEsRUFBRTtRQUNYLG9CQUFvQixFQUFFO1lBQ2xCLE9BQU8sRUFBRSxNQUFNO1NBQ2xCO0tBQ0o7SUFDRCxhQUFhLEVBQUU7UUFDWCxjQUFjLEVBQUU7WUFDWixJQUFJLEVBQUUsQ0FBQyxHQUFXLEVBQUUsRUFBRTtnQkFDbEIscUJBQXFCO2dCQUNyQixPQUFPLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBQ0QsT0FBTyxFQUFFLG1DQUFtQztTQUMvQztLQUNKO0lBQ0QsT0FBTyxFQUFFO1FBQ0wsR0FBRyx1Q0FBdUI7UUFDMUIsY0FBYyxFQUFFO1lBQ1osS0FBSyxFQUFFLHNDQUFzQztZQUM3QyxJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRSxFQUFFO1lBQ1gsV0FBVyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7U0FDbEM7UUFDRCxhQUFhLEVBQUU7WUFDWCxLQUFLLEVBQUUsZ0JBQWdCO1lBQ3ZCLElBQUksRUFBRSxRQUFRO1lBQ2QsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixLQUFLLEVBQUUsUUFBUTtvQkFDZixJQUFJLEVBQUUsU0FBUztvQkFDZixPQUFPLEVBQUUsS0FBSztpQkFDakI7Z0JBQ0QsS0FBSyxFQUFFO29CQUNILEtBQUssRUFBRSxPQUFPO29CQUNkLElBQUksRUFBRSxTQUFTO29CQUNmLE9BQU8sRUFBRSxJQUFJO2lCQUNoQjtnQkFDRCxLQUFLLEVBQUU7b0JBQ0gsS0FBSyxFQUFFLE9BQU87b0JBQ2QsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsT0FBTyxFQUFFLElBQUk7aUJBQ2hCO2FBQ0o7WUFDRCxPQUFPLEVBQUU7Z0JBQ0wsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsS0FBSyxFQUFFLElBQUk7YUFDZDtTQUNKO1FBQ0QsY0FBYyxFQUFFO1lBQ1osS0FBSyxFQUFFLHFDQUFxQztZQUM1QyxJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7WUFDckIsT0FBTyxFQUFFLEtBQUs7U0FDakI7S0FDSjtJQUNELEtBQUssRUFBRSxTQUFTO0NBQ25CLENBQUM7QUFFRixrQkFBZSxNQUFNLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgeyBJUGxhdGZvcm1CdWlsZFBsdWdpbkNvbmZpZyB9IGZyb20gJy4uLy4uL0B0eXBlcy9wcm90ZWN0ZWQnO1xyXG5pbXBvcnQgeyBjb21tb25PcHRpb25zLCBiYXNlTmF0aXZlQ29tbW9uT3B0aW9ucyB9IGZyb20gJy4uL25hdGl2ZS1jb21tb24nO1xyXG5cclxuY29uc3QgY29uZmlnOiBJUGxhdGZvcm1CdWlsZFBsdWdpbkNvbmZpZyA9IHtcclxuICAgIC4uLmNvbW1vbk9wdGlvbnMsXHJcbiAgICBkaXNwbGF5TmFtZTogJ1dpbmRvd3MnLFxyXG4gICAgcGxhdGZvcm1UeXBlOiAnV0lORE9XUycsXHJcbiAgICBkb2M6ICdlZGl0b3IvcHVibGlzaC93aW5kb3dzL2J1aWxkLWV4YW1wbGUtd2luZG93cy5odG1sJyxcclxuICAgIGNvbW1vbk9wdGlvbnM6IHtcclxuICAgICAgICBuYXRpdmVDb2RlQnVuZGxlTW9kZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiAnd2FzbScsXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB2ZXJpZnlSdWxlTWFwOiB7XHJcbiAgICAgICAgZXhlY3V0YWJsZU5hbWU6IHtcclxuICAgICAgICAgICAgZnVuYzogKHN0cjogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBhbGxvdyBlbXB0eSBzdHJpbmdcclxuICAgICAgICAgICAgICAgIHJldHVybiAvXlswLTlhLXpBLVpfLV0qJC8udGVzdChzdHIpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBleGVjdXRhYmxlIG5hbWUgc3BlY2lmaWVkJyxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAuLi5iYXNlTmF0aXZlQ29tbW9uT3B0aW9ucyxcclxuICAgICAgICBleGVjdXRhYmxlTmFtZToge1xyXG4gICAgICAgICAgICBsYWJlbDogJ2kxOG46d2luZG93cy5vcHRpb25zLmV4ZWN1dGFibGVfbmFtZScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcclxuICAgICAgICAgICAgdmVyaWZ5UnVsZXM6IFsnZXhlY3V0YWJsZU5hbWUnXSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbmRlckJhY2tFbmQ6IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdSZW5kZXIgQmFja0VuZCcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgICB2dWxrYW46IHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1Z1bGthbicsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGdsZXMzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdHTEVTMycsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZ2xlczI6IHtcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0dMRVMyJyxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICAgICAgICAgIHZ1bGthbjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBnbGVzMzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGdsZXMyOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFyZ2V0UGxhdGZvcm06IHtcclxuICAgICAgICAgICAgbGFiZWw6ICdpMThuOndpbmRvd3Mub3B0aW9ucy50YXJnZXRQbGF0Zm9ybScsXHJcbiAgICAgICAgICAgIHR5cGU6ICdlbnVtJyxcclxuICAgICAgICAgICAgaXRlbXM6IFsneDY0JywgJ3g4NiddLFxyXG4gICAgICAgICAgICBkZWZhdWx0OiAneDY0JyxcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIGhvb2tzOiAnLi9ob29rcycsXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjb25maWc7Il19