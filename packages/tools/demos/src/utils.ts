/**
 * @zh Demo 测试工具函数
 * @en Demo test utility functions
 */

/**
 * @zh 断言条件为真，否则抛出错误
 * @en Assert condition is true, otherwise throw error
 */
export function assert(condition: boolean, message: string): void {
    if (!condition) throw new Error(`FAILED: ${message}`);
    console.log(`  ✓ ${message}`);
}

/**
 * @zh 打印测试章节标题
 * @en Print test section header
 */
export function section(name: string): void {
    console.log(`\n▶ ${name}`);
}

/**
 * @zh 打印 Demo 开始标题
 * @en Print demo start header
 */
export function demoHeader(name: string): void {
    console.log('═══════════════════════════════════════');
    console.log(`       ${name}`);
    console.log('═══════════════════════════════════════');
}

/**
 * @zh 打印 Demo 结束标题
 * @en Print demo end header
 */
export function demoFooter(name: string): void {
    console.log('\n═══════════════════════════════════════');
    console.log(`  ${name}: ALL TESTS PASSED ✓`);
    console.log('═══════════════════════════════════════\n');
}
