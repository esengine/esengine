/**
 * @zh 文件路由加载器
 * @en File-based router loader
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { ApiDefinition, MsgDefinition, LoadedApiHandler, LoadedMsgHandler } from '../types/index.js'

/**
 * @zh 将文件名转换为 API/消息名称
 * @en Convert filename to API/message name
 *
 * @example
 * 'join.ts' -> 'Join'
 * 'spawn-agent.ts' -> 'SpawnAgent'
 * 'save_blueprint.ts' -> 'SaveBlueprint'
 */
function fileNameToHandlerName(fileName: string): string {
    const baseName = fileName.replace(/\.(ts|js|mts|mjs)$/, '')

    return baseName
        .split(/[-_]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
}

/**
 * @zh 扫描目录获取所有处理器文件
 * @en Scan directory for all handler files
 */
function scanDirectory(dir: string): string[] {
    if (!fs.existsSync(dir)) {
        return []
    }

    const files: string[] = []
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
        if (entry.isFile() && /\.(ts|js|mts|mjs)$/.test(entry.name)) {
            // 跳过 index 和下划线开头的文件
            if (entry.name.startsWith('_') || entry.name.startsWith('index.')) {
                continue
            }
            files.push(path.join(dir, entry.name))
        }
    }

    return files
}

/**
 * @zh 加载 API 处理器
 * @en Load API handlers
 */
export async function loadApiHandlers(apiDir: string): Promise<LoadedApiHandler[]> {
    const files = scanDirectory(apiDir)
    const handlers: LoadedApiHandler[] = []

    for (const filePath of files) {
        try {
            const fileUrl = pathToFileURL(filePath).href
            const module = await import(fileUrl)
            const definition = module.default as ApiDefinition<unknown, unknown, unknown>

            if (definition && typeof definition.handler === 'function') {
                const name = fileNameToHandlerName(path.basename(filePath))
                handlers.push({
                    name,
                    path: filePath,
                    definition,
                })
            }
        } catch (err) {
            console.warn(`[Server] Failed to load API handler: ${filePath}`, err)
        }
    }

    return handlers
}

/**
 * @zh 加载消息处理器
 * @en Load message handlers
 */
export async function loadMsgHandlers(msgDir: string): Promise<LoadedMsgHandler[]> {
    const files = scanDirectory(msgDir)
    const handlers: LoadedMsgHandler[] = []

    for (const filePath of files) {
        try {
            const fileUrl = pathToFileURL(filePath).href
            const module = await import(fileUrl)
            const definition = module.default as MsgDefinition<unknown, unknown>

            if (definition && typeof definition.handler === 'function') {
                const name = fileNameToHandlerName(path.basename(filePath))
                handlers.push({
                    name,
                    path: filePath,
                    definition,
                })
            }
        } catch (err) {
            console.warn(`[Server] Failed to load msg handler: ${filePath}`, err)
        }
    }

    return handlers
}
