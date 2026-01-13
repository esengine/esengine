import { CommonResultType } from '../base/schema-base';
import { TCompileTarget, TCompileResult, TScriptInfoResult, TLoaderContext } from './schema';
export declare class ScriptingApi {
    /**
     * @zh 编译脚本
     * @en Compile Scripts
     */
    compileScripts(target?: TCompileTarget): Promise<CommonResultType<TCompileResult>>;
    /**
     * @zh 查询脚本信息
     * @en Query Script Info
     */
    queryScriptInfo(uuid: string): Promise<CommonResultType<TScriptInfoResult>>;
    /**
     * @zh 获取脚本加载器上下文
     * @en Get Script Loader Context
     */
    getLoaderContext(target?: TCompileTarget): Promise<CommonResultType<TLoaderContext>>;
    /**
     * @zh 触发脚本编译
     * @en Trigger Script Compilation
     */
    triggerCompile(): Promise<CommonResultType<boolean>>;
    /**
     * @zh 检查编译状态
     * @en Check Compilation Status
     */
    isReady(target?: TCompileTarget): Promise<CommonResultType<boolean>>;
    /**
     * @zh 构建脚本包
     * @en Build script bundle
     *
     * 从加载器上下文构建可执行的脚本包
     * Build an executable script bundle from the loader context
     */
    private buildScriptBundle;
}
