/**
 * @zh 编解码器模块
 * @en Codec Module
 */

export type { Codec } from './types'
export { json } from './json'
export { msgpack } from './msgpack'
export { textEncode, textDecode } from './polyfill'
