/**
 * @zh Effect 编译服务 - 使用 JS 编译器编译 .effect 文件
 * @en Effect compilation service - compile .effect files using JS compiler
 */

import { buildEffect, addChunk, setChunkSearchFn, type IEffectInfo } from './effect-compiler/index';
import { getCC, type CC, type EffectAsset } from './types';

/**
 * @zh Chunk 文件缓存
 * @en Chunk file cache
 */
const chunkCache = new Map<string, string>();

/**
 * @zh 已编译的 effect 缓存
 * @en Compiled effect cache
 */
const effectCache = new Map<string, IEffectInfo>();

/**
 * @zh 初始化 effect 服务
 * @en Initialize effect service
 */
export function initEffectService(): void {
  setChunkSearchFn((names: string[]) => {
    for (const name of names) {
      const content = chunkCache.get(name);
      if (content) {
        return { name, content };
      }
    }
    return { name: undefined, content: undefined };
  });
}

/**
 * @zh 添加 chunk 文件到缓存
 * @en Add chunk file to cache
 *
 * @param name - @zh Chunk 名称（不含 .chunk 后缀）@en Chunk name (without .chunk extension)
 * @param content - @zh Chunk 内容 @en Chunk content
 */
export function registerChunk(name: string, content: string): void {
  chunkCache.set(name, content);
  addChunk(name, content);
}

/**
 * @zh 批量注册 chunks
 * @en Register multiple chunks
 *
 * @param chunks - @zh Chunk 名称到内容的映射 @en Map of chunk name to content
 */
export function registerChunks(chunks: Record<string, string>): void {
  for (const [name, content] of Object.entries(chunks)) {
    registerChunk(name, content);
  }
}

/**
 * @zh 编译 effect 文件
 * @en Compile effect file
 *
 * @param name - @zh Effect 名称 @en Effect name
 * @param content - @zh Effect 文件内容 @en Effect file content
 * @returns @zh 编译后的 Effect 信息 @en Compiled effect info
 */
export function compileEffect(name: string, content: string): IEffectInfo | null {
  const cached = effectCache.get(name);
  if (cached) {
    return cached;
  }

  const effectInfo = buildEffect(name, content);
  if (effectInfo) {
    effectCache.set(name, effectInfo);
  }
  return effectInfo;
}

/**
 * @zh 编译并注册 effect 到 ccesengine
 * @en Compile and register effect to ccesengine
 *
 * @param name - @zh Effect 名称 @en Effect name
 * @param content - @zh Effect 文件内容 @en Effect file content
 * @returns @zh 注册后的 EffectAsset @en Registered EffectAsset
 */
export function compileAndRegisterEffect(name: string, content: string): EffectAsset | null {
  const cc = getCC();
  if (!cc) {
    console.error('[EffectService] ccesengine not available');
    return null;
  }

  const effectInfo = compileEffect(name, content);
  if (!effectInfo) {
    console.error('[EffectService] Failed to compile effect:', name);
    return null;
  }

  const effect = new cc.EffectAsset();
  effect.name = effectInfo.name;
  effect.techniques = effectInfo.techniques;
  effect.shaders = effectInfo.shaders;
  effect.combinations = [];
  effect.hideInEditor = effectInfo.editor?.hide ?? false;
  effect.onLoaded();

  return effect;
}

/**
 * @zh 批量编译并注册 effects
 * @en Compile and register multiple effects
 *
 * @param effects - @zh Effect 名称到内容的映射 @en Map of effect name to content
 * @returns @zh 成功注册的数量 @en Number of successfully registered effects
 */
export function compileAndRegisterEffects(effects: Record<string, string>): number {
  let successCount = 0;

  for (const [name, content] of Object.entries(effects)) {
    const result = compileAndRegisterEffect(name, content);
    if (result) {
      successCount++;
    }
  }

  return successCount;
}

/**
 * @zh 获取已注册的 effect 名称列表
 * @en Get list of registered effect names
 */
export function getRegisteredEffectNames(): string[] {
  const cc = getCC();
  if (!cc) return [];

  const EffectAssetClass = cc.EffectAsset as typeof cc.EffectAsset & {
    _effects: Record<string, EffectAsset>;
  };

  return Object.keys(EffectAssetClass._effects || {});
}

/**
 * @zh 清除缓存
 * @en Clear cache
 */
export function clearCache(): void {
  chunkCache.clear();
  effectCache.clear();
}

export const effectService = {
  init: initEffectService,
  registerChunk,
  registerChunks,
  compileEffect,
  compileAndRegister: compileAndRegisterEffect,
  compileAndRegisterEffects,
  getRegisteredEffectNames,
  clearCache,
};
