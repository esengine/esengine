"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatsInfo = exports.textureFormatConfigs = exports.configGroups = exports.defaultSupport = void 0;
exports.defaultSupport = Object.freeze({
    rgb: ['jpg', 'webp'],
    rgba: ['png', 'webp'],
});
exports.configGroups = {
    web: {
        defaultSupport: exports.defaultSupport,
        support: JSON.parse(JSON.stringify(exports.defaultSupport)),
        displayName: 'Web',
        icon: 'html5',
    },
    // pc: {
    //     support: JSON.parse(JSON.stringify(defaultSupport)),
    //     displayName: 'Mac & Windows',
    //     icon: 'desktop',
    // },
    ios: {
        defaultSupport: exports.defaultSupport,
        support: JSON.parse(JSON.stringify(exports.defaultSupport)),
        displayName: 'iOS',
        icon: 'ios',
    },
    miniGame: {
        defaultSupport: exports.defaultSupport,
        support: JSON.parse(JSON.stringify(exports.defaultSupport)),
        displayName: 'Mini Game',
        icon: 'mini-game',
        supportOverwrite: true,
    },
    android: {
        defaultSupport: exports.defaultSupport,
        support: JSON.parse(JSON.stringify(exports.defaultSupport)),
        displayName: 'Android',
        icon: 'android',
    },
    'harmonyos-next': {
        defaultSupport: exports.defaultSupport,
        support: JSON.parse(JSON.stringify(exports.defaultSupport)),
        displayName: 'HarmonyOS',
        icon: 'harmony-os',
    },
};
exports.textureFormatConfigs = {
    pvr: {
        displayName: 'PVRTC',
        options: {
            quality: {
                default: 'normal',
                type: 'enum',
                items: [{
                        value: 'fastest',
                        label: 'Fastest',
                    }, {
                        value: 'fast',
                        label: 'Fast',
                    }, {
                        value: 'normal',
                        label: 'Normal',
                    }, {
                        value: 'high',
                        label: 'High',
                    }, {
                        value: 'best',
                        label: 'Best',
                    }],
            },
        }, // 配置方式参考构建界面参数配置即可，后续这部分数据将会被记录下来
        formats: [{
                value: 'pvrtc_2bits_rgb',
                formatSuffix: 'RGB_PVRTC_2BPPV1',
                displayName: 'PVRTC 2bits RGB',
            }, {
                value: 'pvrtc_2bits_rgba',
                formatSuffix: 'RGBA_PVRTC_2BPPV1',
                displayName: 'PVRTC 2bits RGBA',
                alpha: true,
            }, {
                value: 'pvrtc_2bits_rgb_a',
                formatSuffix: 'RGB_A_PVRTC_2BPPV1',
                displayName: 'PVRTC 2bits RGB Separate A',
                alpha: true,
            }, {
                value: 'pvrtc_4bits_rgb',
                formatSuffix: 'RGB_PVRTC_4BPPV1',
                displayName: 'PVRTC 4bits RGB',
            }, {
                value: 'pvrtc_4bits_rgba',
                formatSuffix: 'RGBA_PVRTC_4BPPV1',
                displayName: 'PVRTC 4bits RGBA',
                alpha: true,
            }, {
                value: 'pvrtc_4bits_rgb_a',
                formatSuffix: 'RGB_A_PVRTC_4BPPV1',
                // 对应 cc.Texture2D.PixelFormat.RGB_A_PVRTC_4BPPV1 每一种格式都需要有引擎对应的格式字段，否则运行时也无法正常解析
                // 最终输出在序列化文件里，纹理图的格式后缀会命名为后缀 + 具体格式，例如：.pvr@RGB_A_PVRTC_4BPPV1
                displayName: 'PVRTC 4bits RGB Separate A', // 显示在纹理压缩配置界面的文本
                alpha: true, // 指定是否有透明度，也可以考虑直接使用 value 是否以 RGB_A 开头来判断
            }],
        suffix: '.pvr',
        parallelism: true,
        childProcess: true,
    },
    etc: {
        displayName: 'ETC',
        suffix: '.pkm',
        options: {
            quality: {
                default: 'fast',
                type: 'enum',
                items: [
                    {
                        value: 'slow',
                        label: 'Slow',
                    }, {
                        value: 'fast',
                        label: 'Fast',
                    }
                ],
            },
        },
        formats: [{
                value: 'etc1_rgb',
                formatSuffix: 'RGB_ETC1',
                displayName: 'ETC1 RGB',
            }, {
                value: 'etc1_rgb_a',
                formatSuffix: 'RGBA_ETC1',
                displayName: 'ETC1 RGB Separate A',
                alpha: true,
            }, {
                value: 'etc2_rgb',
                formatSuffix: 'RGB_ETC2',
                displayName: 'ETC2 RGB',
            }, {
                value: 'etc2_rgba',
                formatSuffix: 'RGBA_ETC2',
                displayName: 'ETC2 RGBA',
                alpha: true,
            }],
        parallelism: false,
        childProcess: true,
    },
    astc: {
        displayName: 'ASTC',
        suffix: '.astc',
        options: {
            quality: {
                default: 'medium',
                type: 'enum',
                items: [{
                        value: 'veryfast',
                        label: 'VeryFast',
                    }, {
                        value: 'fast',
                        label: 'Fast',
                    }, {
                        value: 'medium',
                        label: 'Medium',
                    }, {
                        value: 'thorough',
                        label: 'Thorough',
                    }, {
                        value: 'exhaustive',
                        label: 'Exhaustive',
                    }],
            },
        },
        formats: [{
                value: 'astc_4x4',
                formatSuffix: 'RGBA_ASTC_4x4',
                displayName: 'ASTC 4x4',
                alpha: true,
            }, {
                value: 'astc_5x5',
                formatSuffix: 'RGBA_ASTC_5x5',
                displayName: 'ASTC 5x5',
                alpha: true,
            }, {
                value: 'astc_6x6',
                formatSuffix: 'RGBA_ASTC_6x6',
                displayName: 'ASTC 6x6',
                alpha: true,
            }, {
                value: 'astc_8x8',
                formatSuffix: 'RGBA_ASTC_8x8',
                displayName: 'ASTC 8x8',
                alpha: true,
            }, {
                value: 'astc_10x5',
                formatSuffix: 'RGBA_ASTC_10x5',
                displayName: 'ASTC 10x5',
                alpha: true,
            }, {
                value: 'astc_10x10',
                formatSuffix: 'RGBA_ASTC_10x10',
                displayName: 'ASTC 10x10',
                alpha: true,
            }, {
                value: 'astc_12x12',
                formatSuffix: 'RGBA_ASTC_12x12',
                displayName: 'ASTC 12x12',
                alpha: true,
            }],
        parallelism: false,
        childProcess: true,
    },
    png: {
        displayName: 'PNG',
        suffix: '.png',
        options: {
            quality: {
                default: 80,
                type: 'number',
                step: 1,
                maximum: 100,
                minimum: 10,
            },
        },
        formats: [{
                displayName: 'PNG',
                value: 'png',
                alpha: true,
            }],
        parallelism: true,
    },
    jpg: {
        displayName: 'JPG',
        suffix: '.jpg',
        options: {
            quality: {
                default: 80,
                type: 'number',
                step: 1,
                maximum: 100,
                minimum: 10,
            },
        },
        formats: [{
                displayName: 'JPG',
                value: 'jpg',
                alpha: false,
            }],
        parallelism: true,
    },
    webp: {
        displayName: 'WEBP',
        suffix: '.webp',
        options: {
            quality: {
                default: 80,
                type: 'number',
                minimum: 10,
                maximum: 10,
                step: 1,
            },
        },
        formats: [{
                displayName: 'WEBP',
                value: 'webp',
                alpha: true,
            }],
        parallelism: true,
        childProcess: true,
    },
};
function getFormatsInfo(textureFormatConfig) {
    const formats = {};
    // @ts-ignore
    Object.keys(textureFormatConfig).forEach((key) => {
        const config = textureFormatConfig[key];
        if (config.formats) {
            config.formats.forEach((formatConfig) => {
                formats[formatConfig.value] = {
                    formatType: key,
                    ...formatConfig,
                };
            });
        }
        else {
            formats[key] = {
                displayName: config.displayName,
                value: key,
                formatType: key,
            };
        }
    });
    return formats;
}
exports.formatsInfo = getFormatsInfo(exports.textureFormatConfigs);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dHVyZS1jb21wcmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL2J1aWxkZXIvc2hhcmUvdGV4dHVyZS1jb21wcmVzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFYSxRQUFBLGNBQWMsR0FBbUIsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUN4RCxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDO0lBQ3BCLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUM7Q0FDeEIsQ0FBQyxDQUFDO0FBRVUsUUFBQSxZQUFZLEdBQWtCO0lBQ3ZDLEdBQUcsRUFBRTtRQUNELGNBQWMsRUFBZCxzQkFBYztRQUNkLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsc0JBQWMsQ0FBQyxDQUFDO1FBQ25ELFdBQVcsRUFBRSxLQUFLO1FBQ2xCLElBQUksRUFBRSxPQUFPO0tBQ2hCO0lBQ0QsUUFBUTtJQUNSLDJEQUEyRDtJQUMzRCxvQ0FBb0M7SUFDcEMsdUJBQXVCO0lBQ3ZCLEtBQUs7SUFDTCxHQUFHLEVBQUU7UUFDRCxjQUFjLEVBQWQsc0JBQWM7UUFDZCxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFjLENBQUMsQ0FBQztRQUNuRCxXQUFXLEVBQUUsS0FBSztRQUNsQixJQUFJLEVBQUUsS0FBSztLQUNkO0lBQ0QsUUFBUSxFQUFFO1FBQ04sY0FBYyxFQUFkLHNCQUFjO1FBQ2QsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBYyxDQUFDLENBQUM7UUFDbkQsV0FBVyxFQUFFLFdBQVc7UUFDeEIsSUFBSSxFQUFFLFdBQVc7UUFDakIsZ0JBQWdCLEVBQUUsSUFBSTtLQUN6QjtJQUNELE9BQU8sRUFBRTtRQUNMLGNBQWMsRUFBZCxzQkFBYztRQUNk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UUFDeEMsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtnQkFDcEMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRztvQkFDMUIsVUFBVSxFQUFFLEdBQUc7b0JBQ2YsR0FBRyxZQUFZO2lCQUNsQixDQUFDO1lBQ04sQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO2FBQU0sQ0FBQztZQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRztnQkFDWCxXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVc7Z0JBQy9CLEtBQUssRUFBRSxHQUFHO2dCQUNWLFVBQVUsRUFBRSxHQUFHO2FBQ2xCLENBQUM7UUFDTixDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLE9BQU8sQ0FBQztBQUNuQixDQUFDO0FBRVksUUFBQSxXQUFXLEdBQUcsY0FBYyxDQUFDLDRCQUFvQixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJU3VwcG9ydEZvcm1hdCwgSUNvbmZpZ0dyb3VwcywgSVRleHR1cmVDb21wcmVzc0Zvcm1hdFR5cGUsIElUZXh0dXJlRm9ybWF0Q29uZmlnLCBJVGV4dHVyZUNvbXByZXNzVHlwZSwgSVRleHR1cmVGb3JtYXRJbmZvLCBJQ3VzdG9tQ29uZmlnLCBBbGxUZXh0dXJlQ29tcHJlc3NDb25maWcgfSBmcm9tIFwiLi4vQHR5cGVzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgZGVmYXVsdFN1cHBvcnQ6IElTdXBwb3J0Rm9ybWF0ID0gT2JqZWN0LmZyZWV6ZSh7XHJcbiAgICByZ2I6IFsnanBnJywgJ3dlYnAnXSxcclxuICAgIHJnYmE6IFsncG5nJywgJ3dlYnAnXSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgY29uZmlnR3JvdXBzOiBJQ29uZmlnR3JvdXBzID0ge1xyXG4gICAgd2ViOiB7XHJcbiAgICAgICAgZGVmYXVsdFN1cHBvcnQsXHJcbiAgICAgICAgc3VwcG9ydDogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0U3VwcG9ydCkpLFxyXG4gICAgICAgIGRpc3BsYXlOYW1lOiAnV2ViJyxcclxuICAgICAgICBpY29uOiAnaHRtbDUnLFxyXG4gICAgfSxcclxuICAgIC8vIHBjOiB7XHJcbiAgICAvLyAgICAgc3VwcG9ydDogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0U3VwcG9ydCkpLFxyXG4gICAgLy8gICAgIGRpc3BsYXlOYW1lOiAnTWFjICYgV2luZG93cycsXHJcbiAgICAvLyAgICAgaWNvbjogJ2Rlc2t0b3AnLFxyXG4gICAgLy8gfSxcclxuICAgIGlvczoge1xyXG4gICAgICAgIGRlZmF1bHRTdXBwb3J0LFxyXG4gICAgICAgIHN1cHBvcnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFN1cHBvcnQpKSxcclxuICAgICAgICBkaXNwbGF5TmFtZTogJ2lPUycsXHJcbiAgICAgICAgaWNvbjogJ2lvcycsXHJcbiAgICB9LFxyXG4gICAgbWluaUdhbWU6IHtcclxuICAgICAgICBkZWZhdWx0U3VwcG9ydCxcclxuICAgICAgICBzdXBwb3J0OiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZmF1bHRTdXBwb3J0KSksXHJcbiAgICAgICAgZGlzcGxheU5hbWU6ICdNaW5pIEdhbWUnLFxyXG4gICAgICAgIGljb246ICdtaW5pLWdhbWUnLFxyXG4gICAgICAgIHN1cHBvcnRPdmVyd3JpdGU6IHRydWUsXHJcbiAgICB9LFxyXG4gICAgYW5kcm9pZDoge1xyXG4gICAgICAgIGRlZmF1bHRTdXBwb3J0LFxyXG4gICAgICAgIHN1cHBvcnQ6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmYXVsdFN1cHBvcnQpKSxcclxuICAgICAgICBkaXNwbGF5TmFtZTogJ0FuZHJvaWQnLFxyXG4gICAgICAgIGljb246ICdhbmRyb2lkJyxcclxuICAgIH0sXHJcbiAgICAnaGFybW9ueW9zLW5leHQnOiB7XHJcbiAgICAgICAgZGVmYXVsdFN1cHBvcnQsXHJcbiAgICAgICAgc3VwcG9ydDogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWZhdWx0U3VwcG9ydCkpLFxyXG4gICAgICAgIGRpc3BsYXlOYW1lOiAnSGFybW9ueU9TJyxcclxuICAgICAgICBpY29uOiAnaGFybW9ueS1vcycsXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHRleHR1cmVGb3JtYXRDb25maWdzOiBSZWNvcmQ8SVRleHR1cmVDb21wcmVzc0Zvcm1hdFR5cGUsIElUZXh0dXJlRm9ybWF0Q29uZmlnPiA9IHtcclxuICAgIHB2cjoge1xyXG4gICAgICAgIGRpc3BsYXlOYW1lOiAnUFZSVEMnLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgcXVhbGl0eToge1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogJ25vcm1hbCcsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnZW51bScsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogW3tcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ2Zhc3Rlc3QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnRmFzdGVzdCcsXHJcbiAgICAgICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdmYXN0JyxcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0Zhc3QnLFxyXG4gICAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnbm9ybWFsJyxcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ05vcm1hbCcsXHJcbiAgICAgICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdoaWdoJyxcclxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0hpZ2gnLFxyXG4gICAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnYmVzdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdCZXN0JyxcclxuICAgICAgICAgICAgICAgIH1dLFxyXG5cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LCAvLyDphY3nva7mlrnlvI/lj4LogIPmnoTlu7rnlYzpnaLlj4LmlbDphY3nva7ljbPlj6/vvIzlkI7nu63ov5npg6jliIbmlbDmja7lsIbkvJrooqvorrDlvZXkuIvmnaVcclxuICAgICAgICBmb3JtYXRzOiBbe1xyXG4gICAgICAgICAgICB2YWx1ZTogJ3B2cnRjXzJiaXRzX3JnYicsXHJcbiAgICAgICAgICAgIGZvcm1hdFN1ZmZpeDogJ1JHQl9QVlJUQ18yQlBQVjEnLFxyXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ1BWUlRDIDJiaXRzIFJHQicsXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICB2YWx1ZTogJ3B2cnRjXzJiaXRzX3JnYmEnLFxyXG4gICAgICAgICAgICBmb3JtYXRTdWZmaXg6ICdSR0JBX1BWUlRDXzJCUFBWMScsXHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnUFZSVEMgMmJpdHMgUkdCQScsXHJcbiAgICAgICAgICAgIGFscGhhOiB0cnVlLFxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgdmFsdWU6ICdwdnJ0Y18yYml0c19yZ2JfYScsXHJcbiAgICAgICAgICAgIGZvcm1hdFN1ZmZpeDogJ1JHQl9BX1BWUlRDXzJCUFBWMScsXHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnUFZSVEMgMmJpdHMgUkdCIFNlcGFyYXRlIEEnLFxyXG4gICAgICAgICAgICBhbHBoYTogdHJ1ZSxcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAncHZydGNfNGJpdHNfcmdiJyxcclxuICAgICAgICAgICAgZm9ybWF0U3VmZml4OiAnUkdCX1BWUlRDXzRCUFBWMScsXHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnUFZSVEMgNGJpdHMgUkdCJyxcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAncHZydGNfNGJpdHNfcmdiYScsXHJcbiAgICAgICAgICAgIGZvcm1hdFN1ZmZpeDogJ1JHQkFfUFZSVENfNEJQUFYxJyxcclxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdQVlJUQyA0Yml0cyBSR0JBJyxcclxuICAgICAgICAgICAgYWxwaGE6IHRydWUsXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICB2YWx1ZTogJ3B2cnRjXzRiaXRzX3JnYl9hJyxcclxuICAgICAgICAgICAgZm9ybWF0U3VmZml4OiAnUkdCX0FfUFZSVENfNEJQUFYxJyxcclxuXHJcbiAgICAgICAgICAgIC8vIOWvueW6lCBjYy5UZXh0dXJlMkQuUGl4ZWxGb3JtYXQuUkdCX0FfUFZSVENfNEJQUFYxIOavj+S4gOenjeagvOW8j+mDvemcgOimgeacieW8leaTjuWvueW6lOeahOagvOW8j+Wtl+aute+8jOWQpuWImei/kOihjOaXtuS5n+aXoOazleato+W4uOino+aekFxyXG4gICAgICAgICAgICAvLyDmnIDnu4jovpPlh7rlnKjluo/liJfljJbmlofku7bph4zvvIznurnnkIblm77nmoTmoLzlvI/lkI7nvIDkvJrlkb3lkI3kuLrlkI7nvIAgKyDlhbfkvZPmoLzlvI/vvIzkvovlpoLvvJoucHZyQFJHQl9BX1BWUlRDXzRCUFBWMVxyXG5cclxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdQVlJUQyA0Yml0cyBSR0IgU2VwYXJhdGUgQScsIC8vIOaYvuekuuWcqOe6ueeQhuWOi+e8qemFjee9rueVjOmdoueahOaWh+acrFxyXG4gICAgICAgICAgICBhbHBoYTogdHJ1ZSwgLy8g5oyH5a6a5piv5ZCm5pyJ6YCP5piO5bqm77yM5Lmf5Y+v5Lul6ICD6JmR55u05o6l5L2/55SoIHZhbHVlIOaYr+WQpuS7pSBSR0JfQSDlvIDlpLTmnaXliKTmlq1cclxuICAgICAgICB9XSxcclxuICAgICAgICBzdWZmaXg6ICcucHZyJyxcclxuICAgICAgICBwYXJhbGxlbGlzbTogdHJ1ZSxcclxuICAgICAgICBjaGlsZFByb2Nlc3M6IHRydWUsXHJcbiAgICB9LFxyXG4gICAgZXRjOiB7XHJcbiAgICAgICAgZGlzcGxheU5hbWU6ICdFVEMnLFxyXG4gICAgICAgIHN1ZmZpeDogJy5wa20nLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgcXVhbGl0eToge1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogJ2Zhc3QnLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2VudW0nLFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnc2xvdycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnU2xvdycsXHJcbiAgICAgICAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ2Zhc3QnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0Zhc3QnLFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JtYXRzOiBbe1xyXG4gICAgICAgICAgICB2YWx1ZTogJ2V0YzFfcmdiJyxcclxuICAgICAgICAgICAgZm9ybWF0U3VmZml4OiAnUkdCX0VUQzEnLFxyXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ0VUQzEgUkdCJyxcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAnZXRjMV9yZ2JfYScsXHJcbiAgICAgICAgICAgIGZvcm1hdFN1ZmZpeDogJ1JHQkFfRVRDMScsXHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnRVRDMSBSR0IgU2VwYXJhdGUgQScsXHJcbiAgICAgICAgICAgIGFscGhhOiB0cnVlLFxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgdmFsdWU6ICdldGMyX3JnYicsXHJcbiAgICAgICAgICAgIGZvcm1hdFN1ZmZpeDogJ1JHQl9FVEMyJyxcclxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdFVEMyIFJHQicsXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICB2YWx1ZTogJ2V0YzJfcmdiYScsXHJcbiAgICAgICAgICAgIGZvcm1hdFN1ZmZpeDogJ1JHQkFfRVRDMicsXHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnRVRDMiBSR0JBJyxcclxuICAgICAgICAgICAgYWxwaGE6IHRydWUsXHJcbiAgICAgICAgfV0sXHJcbiAgICAgICAgcGFyYWxsZWxpc206IGZhbHNlLFxyXG4gICAgICAgIGNoaWxkUHJvY2VzczogdHJ1ZSxcclxuICAgIH0sXHJcbiAgICBhc3RjOiB7XHJcbiAgICAgICAgZGlzcGxheU5hbWU6ICdBU1RDJyxcclxuICAgICAgICBzdWZmaXg6ICcuYXN0YycsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICBxdWFsaXR5OiB7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiAnbWVkaXVtJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdlbnVtJyxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAndmVyeWZhc3QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVmVyeUZhc3QnLFxyXG4gICAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnZmFzdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdGYXN0JyxcclxuICAgICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ21lZGl1bScsXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdNZWRpdW0nLFxyXG4gICAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAndGhvcm91Z2gnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVGhvcm91Z2gnLFxyXG4gICAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnZXhoYXVzdGl2ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdFeGhhdXN0aXZlJyxcclxuICAgICAgICAgICAgICAgIH1dLCBcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZvcm1hdHM6IFt7XHJcbiAgICAgICAgICAgIHZhbHVlOiAnYXN0Y180eDQnLFxyXG4gICAgICAgICAgICBmb3JtYXRTdWZmaXg6ICdSR0JBX0FTVENfNHg0JyxcclxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdBU1RDIDR4NCcsXHJcbiAgICAgICAgICAgIGFscGhhOiB0cnVlLFxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgdmFsdWU6ICdhc3RjXzV4NScsXHJcbiAgICAgICAgICAgIGZvcm1hdFN1ZmZpeDogJ1JHQkFfQVNUQ181eDUnLFxyXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ0FTVEMgNXg1JyxcclxuICAgICAgICAgICAgYWxwaGE6IHRydWUsXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICB2YWx1ZTogJ2FzdGNfNng2JyxcclxuICAgICAgICAgICAgZm9ybWF0U3VmZml4OiAnUkdCQV9BU1RDXzZ4NicsXHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQVNUQyA2eDYnLFxyXG4gICAgICAgICAgICBhbHBoYTogdHJ1ZSxcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAnYXN0Y184eDgnLFxyXG4gICAgICAgICAgICBmb3JtYXRTdWZmaXg6ICdSR0JBX0FTVENfOHg4JyxcclxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdBU1RDIDh4OCcsXHJcbiAgICAgICAgICAgIGFscGhhOiB0cnVlLFxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgdmFsdWU6ICdhc3RjXzEweDUnLFxyXG4gICAgICAgICAgICBmb3JtYXRTdWZmaXg6ICdSR0JBX0FTVENfMTB4NScsXHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQVNUQyAxMHg1JyxcclxuICAgICAgICAgICAgYWxwaGE6IHRydWUsXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICB2YWx1ZTogJ2FzdGNfMTB4MTAnLFxyXG4gICAgICAgICAgICBmb3JtYXRTdWZmaXg6ICdSR0JBX0FTVENfMTB4MTAnLFxyXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ0FTVEMgMTB4MTAnLFxyXG4gICAgICAgICAgICBhbHBoYTogdHJ1ZSxcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAnYXN0Y18xMngxMicsXHJcbiAgICAgICAgICAgIGZvcm1hdFN1ZmZpeDogJ1JHQkFfQVNUQ18xMngxMicsXHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnQVNUQyAxMngxMicsXHJcbiAgICAgICAgICAgIGFscGhhOiB0cnVlLFxyXG4gICAgICAgIH1dLFxyXG4gICAgICAgIHBhcmFsbGVsaXNtOiBmYWxzZSxcclxuICAgICAgICBjaGlsZFByb2Nlc3M6IHRydWUsXHJcbiAgICB9LFxyXG4gICAgcG5nOiB7XHJcbiAgICAgICAgZGlzcGxheU5hbWU6ICdQTkcnLFxyXG4gICAgICAgIHN1ZmZpeDogJy5wbmcnLFxyXG4gICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgcXVhbGl0eToge1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogODAsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgICAgICAgICAgIHN0ZXA6IDEsXHJcbiAgICAgICAgICAgICAgICBtYXhpbXVtOiAxMDAsXHJcbiAgICAgICAgICAgICAgICBtaW5pbXVtOiAxMCxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZvcm1hdHM6IFt7XHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAnUE5HJyxcclxuICAgICAgICAgICAgdmFsdWU6ICdwbmcnLFxyXG4gICAgICAgICAgICBhbHBoYTogdHJ1ZSxcclxuICAgICAgICB9XSxcclxuICAgICAgICBwYXJhbGxlbGlzbTogdHJ1ZSxcclxuICAgIH0sXHJcbiAgICBqcGc6IHtcclxuICAgICAgICBkaXNwbGF5TmFtZTogJ0pQRycsXHJcbiAgICAgICAgc3VmZml4OiAnLmpwZycsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICBxdWFsaXR5OiB7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiA4MCxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICAgICAgICAgICAgc3RlcDogMSxcclxuICAgICAgICAgICAgICAgIG1heGltdW06IDEwMCxcclxuICAgICAgICAgICAgICAgIG1pbmltdW06IDEwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZm9ybWF0czogW3tcclxuICAgICAgICAgICAgZGlzcGxheU5hbWU6ICdKUEcnLFxyXG4gICAgICAgICAgICB2YWx1ZTogJ2pwZycsXHJcbiAgICAgICAgICAgIGFscGhhOiBmYWxzZSxcclxuICAgICAgICB9XSxcclxuICAgICAgICBwYXJhbGxlbGlzbTogdHJ1ZSxcclxuICAgIH0sXHJcbiAgICB3ZWJwOiB7XHJcbiAgICAgICAgZGlzcGxheU5hbWU6ICdXRUJQJyxcclxuICAgICAgICBzdWZmaXg6ICcud2VicCcsXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICBxdWFsaXR5OiB7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiA4MCxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICAgICAgICAgICAgbWluaW11bTogMTAsXHJcbiAgICAgICAgICAgICAgICBtYXhpbXVtOiAxMCxcclxuICAgICAgICAgICAgICAgIHN0ZXA6IDEsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb3JtYXRzOiBbe1xyXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogJ1dFQlAnLFxyXG4gICAgICAgICAgICB2YWx1ZTogJ3dlYnAnLFxyXG4gICAgICAgICAgICBhbHBoYTogdHJ1ZSxcclxuICAgICAgICB9XSxcclxuICAgICAgICBwYXJhbGxlbGlzbTogdHJ1ZSxcclxuICAgICAgICBjaGlsZFByb2Nlc3M6IHRydWUsXHJcbiAgICB9LFxyXG59O1xyXG5cclxuZnVuY3Rpb24gZ2V0Rm9ybWF0c0luZm8odGV4dHVyZUZvcm1hdENvbmZpZzogUmVjb3JkPElUZXh0dXJlQ29tcHJlc3NUeXBlLCBJVGV4dHVyZUZvcm1hdENvbmZpZz4pIHtcclxuICAgIGNvbnN0IGZvcm1hdHM6IFJlY29yZDxzdHJpbmcsIElUZXh0dXJlRm9ybWF0SW5mbz4gPSB7fTtcclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIE9iamVjdC5rZXlzKHRleHR1cmVGb3JtYXRDb25maWcpLmZvckVhY2goKGtleTogSVRleHR1cmVDb21wcmVzc0Zvcm1hdFR5cGUpID0+IHtcclxuICAgICAgICBjb25zdCBjb25maWcgPSB0ZXh0dXJlRm9ybWF0Q29uZmlnW2tleV07XHJcbiAgICAgICAgaWYgKGNvbmZpZy5mb3JtYXRzKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5mb3JtYXRzLmZvckVhY2goKGZvcm1hdENvbmZpZykgPT4ge1xyXG4gICAgICAgICAgICAgICAgZm9ybWF0c1tmb3JtYXRDb25maWcudmFsdWVdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdFR5cGU6IGtleSxcclxuICAgICAgICAgICAgICAgICAgICAuLi5mb3JtYXRDb25maWcsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmb3JtYXRzW2tleV0gPSB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogY29uZmlnLmRpc3BsYXlOYW1lLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGtleSxcclxuICAgICAgICAgICAgICAgIGZvcm1hdFR5cGU6IGtleSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBmb3JtYXRzO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZm9ybWF0c0luZm8gPSBnZXRGb3JtYXRzSW5mbyh0ZXh0dXJlRm9ybWF0Q29uZmlncyk7XHJcbiJdfQ==