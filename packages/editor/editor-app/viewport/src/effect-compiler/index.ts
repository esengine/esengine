/**
 * @zh Effect 编译器入口 - 基于 cces-cli 的 effect-compiler
 * @en Effect compiler entry - based on cces-cli effect-compiler
 */

// @ts-ignore - CommonJS module
import * as shdcLib from './shdc-lib.js';
import type { EffectAsset } from 'cc';

const _buildEffect = shdcLib.buildEffect;
const _addChunk = shdcLib.addChunk;
const options = shdcLib.options;

/**
 * @zh 编译后的 Effect 信息
 * @en Compiled effect info
 */
export interface IEffectInfo {
  name: string;
  techniques: EffectAsset.ITechniqueInfo[];
  shaders: EffectAsset.IShaderInfo[];
  dependencies: string[];
  editor?: {
    hide?: boolean;
    inspector?: string;
  };
}

/**
 * @zh 编译 Effect 文件
 * @en Compile effect file
 *
 * @param name - @zh Effect 名称 @en Effect name
 * @param content - @zh Effect 文件内容 @en Effect file content
 * @returns @zh 编译后的 Effect 信息 @en Compiled effect info
 */
export function buildEffect(name: string, content: string): IEffectInfo | null {
  try {
    return _buildEffect(name, content) as IEffectInfo;
  } catch (error) {
    console.error('[effect-compiler] Failed to compile effect:', name, error);
    return null;
  }
}

/**
 * @zh 添加 Shader Chunk（头文件）
 * @en Add shader chunk (header file)
 *
 * @param name - @zh Chunk 名称 @en Chunk name
 * @param content - @zh Chunk 内容 @en Chunk content
 */
export function addChunk(name: string, content: string): void {
  _addChunk(name, content);
}

/**
 * @zh 编译器选项
 * @en Compiler options
 */
export const compilerOptions = options as {
  throwOnError: boolean;
  throwOnWarning: boolean;
  noSource: boolean;
  skipParserTest: boolean;
  chunkSearchFn: (names: string[]) => { name?: string; content?: string };
  getAlternativeChunkPaths: (path: string) => string[];
};

/**
 * @zh 配置 Chunk 搜索函数
 * @en Configure chunk search function
 */
export function setChunkSearchFn(
  fn: (names: string[]) => { name?: string; content?: string }
): void {
  compilerOptions.chunkSearchFn = fn;
}
