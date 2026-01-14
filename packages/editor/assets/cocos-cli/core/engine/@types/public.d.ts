
export interface EngineInfo {
    typescript: {
        type: 'builtin' | 'custom'; // 当前使用的引擎类型（内置或自定义)
        builtin: string, // 内置引擎地址
        path: string; // 当前使用的 ts 引擎路径
    },
    native: {
        type: 'builtin' | 'custom'; // 当前使用的引擎类型（内置或自定义)
        builtin: string, // 内置引擎地址
        path: string; // 当前使用的原生引擎路径
    },
    tmpDir: string;
    version: string;
}

export * from './config';
export * from './modules';