/**
 * 执行静态编译检查
 * @param projectPath 项目路径
 * @param showOutput 是否显示输出信息（默认 true）
 * @returns 返回对象，包含检查结果和错误信息。passed 为 true 表示检查通过（没有 assets 相关错误），false 表示有错误
 */
export declare function runStaticCompileCheck(projectPath: string, showOutput?: boolean): Promise<{
    passed: boolean;
    errorMessage?: string;
}>;
