/**
 * @zh 编译器注册表
 * @en Compiler Registry
 */

import { BaseRegistry, createRegistryToken } from './BaseRegistry';
import type { ICompiler } from './ICompiler';

/**
 * @zh 编译器注册表
 * @en Compiler Registry
 */
export class CompilerRegistry extends BaseRegistry<ICompiler> {
    constructor() {
        super('CompilerRegistry');
    }

    protected getItemKey(item: ICompiler): string {
        return item.id;
    }

    protected override getItemDisplayName(item: ICompiler): string {
        return `${item.name} (${item.id})`;
    }
}

/** @zh 编译器注册表服务标识符 @en Compiler registry service identifier */
export const ICompilerRegistry = createRegistryToken<CompilerRegistry>('CompilerRegistry');
