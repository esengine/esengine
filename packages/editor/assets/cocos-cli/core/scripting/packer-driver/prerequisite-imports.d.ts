/**
 * 模块 `'cce:/internal/x/prerequisite-imports'` 的 URL。
 */
export declare const prerequisiteImportsModURL = "cce:/internal/x/prerequisite-imports";
/**
 * 生成模块 `'cce:/internal/x/prerequisite-imports'`。
 * 这个模块用于导入所有需要加载的项目模块。
 * @param prerequisiteImports 需要导入的项目模块。必须是 URL。
 */
export declare function makePrerequisiteImportsMod(prerequisiteImports: string[]): string;
/**
 * 生成模块 `'cce:/internal/x/prerequisite-imports'`。
 * 这个模块用于导入所有需要加载的项目模块。
 * 与 `makePrerequisiteImportsMod` 不同，这样生成的模块会尝试导入每个项目模块，即使它们其中的一个或多个发生了异常。
 * @param prerequisiteImports 需要导入的项目模块。必须是 URL。
 */
export declare function makeTentativePrerequisiteImports(prerequisiteImports: string[]): string;
