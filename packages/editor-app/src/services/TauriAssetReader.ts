/**
 * Tauri Asset Reader
 * Tauri 资产读取器
 *
 * Implements IAssetReader for Tauri/editor environment.
 * 为 Tauri/编辑器环境实现 IAssetReader。
 */

import { invoke } from '@tauri-apps/api/core';
import type { IAssetReader } from '@esengine/asset-system';

/** Blob URL cache to avoid re-reading files | Blob URL 缓存避免重复读取文件 */
const blobUrlCache = new Map<string, string>();

/**
 * Asset reader implementation for Tauri.
 * Tauri 的资产读取器实现。
 *
 * Uses Tauri backend commands to read files and creates Blob URLs for images.
 * This approach works reliably with WebGL/Canvas without protocol restrictions.
 *
 * 使用 Tauri 后端命令读取文件，并为图片创建 Blob URL。
 * 这种方法在 WebGL/Canvas 中可靠工作，没有协议限制。
 */
export class TauriAssetReader implements IAssetReader {
    /**
     * Read file as text.
     * 读取文件为文本。
     */
    async readText(absolutePath: string): Promise<string> {
        return await invoke<string>('read_file_content', { path: absolutePath });
    }

    /**
     * Read file as binary.
     * 读取文件为二进制。
     */
    async readBinary(absolutePath: string): Promise<ArrayBuffer> {
        const bytes = await invoke<number[]>('read_binary_file', { filePath: absolutePath });
        return new Uint8Array(bytes).buffer;
    }

    /**
     * Load image from file via backend.
     * 通过后端从文件加载图片。
     *
     * Reads binary data via Tauri backend and creates a Blob URL.
     * This bypasses browser protocol restrictions (asset://, file://).
     *
     * 通过 Tauri 后端读取二进制数据并创建 Blob URL。
     * 这绕过了浏览器协议限制。
     */
    async loadImage(absolutePath: string): Promise<HTMLImageElement> {
        // Return cached if available
        let blobUrl = blobUrlCache.get(absolutePath);

        if (!blobUrl) {
            // Read binary via backend
            const bytes = await invoke<number[]>('read_binary_file', { filePath: absolutePath });
            const data = new Uint8Array(bytes);

            // Determine MIME type from extension
            const ext = absolutePath.toLowerCase().split('.').pop();
            let mimeType = 'image/png';
            if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
            else if (ext === 'gif') mimeType = 'image/gif';
            else if (ext === 'webp') mimeType = 'image/webp';

            // Create Blob URL
            const blob = new Blob([data], { type: mimeType });
            blobUrl = URL.createObjectURL(blob);
            blobUrlCache.set(absolutePath, blobUrl);
        }

        // Load image from Blob URL
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Failed to load image: ${absolutePath}`));
            image.src = blobUrl!;
        });
    }

    /**
     * Get Blob URL for a file (for engine texture loading).
     * 获取文件的 Blob URL（用于引擎纹理加载）。
     */
    async getBlobUrl(absolutePath: string): Promise<string> {
        let blobUrl = blobUrlCache.get(absolutePath);

        if (!blobUrl) {
            const bytes = await invoke<number[]>('read_binary_file', { filePath: absolutePath });
            const data = new Uint8Array(bytes);

            const ext = absolutePath.toLowerCase().split('.').pop();
            let mimeType = 'image/png';
            if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
            else if (ext === 'gif') mimeType = 'image/gif';
            else if (ext === 'webp') mimeType = 'image/webp';

            const blob = new Blob([data], { type: mimeType });
            blobUrl = URL.createObjectURL(blob);
            blobUrlCache.set(absolutePath, blobUrl);
        }

        return blobUrl;
    }

    /**
     * Load audio from file.
     * 从文件加载音频。
     */
    async loadAudio(absolutePath: string): Promise<AudioBuffer> {
        const binary = await this.readBinary(absolutePath);
        const audioContext = new AudioContext();
        return await audioContext.decodeAudioData(binary);
    }

    /**
     * Check if file exists.
     * 检查文件是否存在。
     */
    async exists(absolutePath: string): Promise<boolean> {
        try {
            await invoke('read_file_content', { path: absolutePath });
            return true;
        } catch {
            return false;
        }
    }
}
