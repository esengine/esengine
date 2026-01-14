/**
 * 取给定边界范围的值
 * Take the value of the given boundary range
 * @param {number} val
 * @param {number} min
 * @param {number} max
 */
export declare function clamp(val: number, min: number, max: number): number;
/**
 * 将给定的数值限制在0到1的范围内。
 * @param val 需要限制的数值。
 * @returns 返回限制后的数值，确保在0到1之间。
 */
export declare function clamp01(val: number): number;
/**
 * 加法函数
 * 入参：函数内部转化时会先转字符串再转数值，因而传入字符串或 number 均可
 * 返回值：arg1 加上 arg2 的精确结果
 * @param {number|string} arg1
 * @param {number|string} arg2
 */
export declare function add(arg1: number | string, arg2: number | string): number;
/**
 * 减法函数
 * 入参：函数内部转化时会先转字符串再转数值，因而传入字符串或 number 均可
 * 返回值：arg1 减 arg2的精确结果
 * @param {number|string} arg1
 * @param {number|string} arg2
 */
export declare function sub(arg1: number | string, arg2: number | string): number;
/**
 * 乘法函数
 * @param arg1
 * @param arg2
 * @returns
 */
export declare function multi(arg1: number | string, arg2: number | string): number;
/**
 * 除法函数
 * @param arg1
 * @param arg2
 * @returns
 */
export declare function divide(arg1: number | string, arg2: number | string): number;
/**
 * 保留小数点
 * @param val
 * @param num
 */
export declare function toFixed(val: number, num: number): number;
