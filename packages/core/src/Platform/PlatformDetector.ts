import type { PlatformDetectionResult } from './IPlatformAdapter';
import { getGlobalWithMiniGame, type IGlobalThisWithMiniGame } from '../Types';

/**
 * @zh 平台检测器 - 自动检测当前运行环境并返回对应的平台信息
 * @en Platform Detector - Automatically detect the current runtime environment
 */
export class PlatformDetector {
    private static readonly miniGameGlobals: IGlobalThisWithMiniGame = getGlobalWithMiniGame();
    /**
     * 检测当前平台
     */
    public static detect(): PlatformDetectionResult {
        const features: string[] = [];
        let platform: PlatformDetectionResult['platform'] = 'unknown';
        let confident = false;
        let adapterClass: string | undefined;

        // 检查全局对象和API
        if (typeof globalThis !== 'undefined') {
            features.push('globalThis');
        }

        if (typeof window !== 'undefined') {
            features.push('window');
        }

        if (typeof self !== 'undefined') {
            features.push('self');
        }

        // 检测Node.js环境（优先级最高，因为Node.js可能包含全局对象模拟）
        if (this.isNodeJS()) {
            platform = 'nodejs';
            confident = true;
            adapterClass = 'NodeAdapter';
            features.push('nodejs', 'process', 'require');
        }
        // 检测微信小游戏环境
        else if (this.isWeChatMiniGame()) {
            platform = 'wechat-minigame';
            confident = true;
            adapterClass = 'WeChatMiniGameAdapter';
            features.push('wx', 'wechat-minigame');
        }
        // 检测字节跳动小游戏环境
        else if (this.isByteDanceMiniGame()) {
            platform = 'bytedance-minigame';
            confident = true;
            adapterClass = 'ByteDanceMiniGameAdapter';
            features.push('tt', 'bytedance-minigame');
        }
        // 检测支付宝小游戏环境
        else if (this.isAlipayMiniGame()) {
            platform = 'alipay-minigame';
            confident = true;
            adapterClass = 'AlipayMiniGameAdapter';
            features.push('my', 'alipay-minigame');
        }
        // 检测百度小游戏环境
        else if (this.isBaiduMiniGame()) {
            platform = 'baidu-minigame';
            confident = true;
            adapterClass = 'BaiduMiniGameAdapter';
            features.push('swan', 'baidu-minigame');
        }
        // 检测浏览器环境
        else if (this.isBrowser()) {
            platform = 'browser';
            confident = true;
            adapterClass = 'BrowserAdapter';
            features.push('browser');
        }

        // 添加功能检测特征
        if (typeof Worker !== 'undefined') {
            features.push('Worker');
        }

        if (typeof SharedArrayBuffer !== 'undefined') {
            features.push('SharedArrayBuffer');
        }

        if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) {
            features.push('hardwareConcurrency');
        }

        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            features.push('performance.now');
        }

        if (typeof Blob !== 'undefined') {
            features.push('Blob');
        }

        if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
            features.push('URL.createObjectURL');
        }

        return {
            platform,
            confident,
            features,
            ...(adapterClass && { adapterClass })
        };
    }

    /**
     * @zh 检测是否为微信小游戏环境
     * @en Check if running in WeChat Mini Game environment
     */
    private static isWeChatMiniGame(): boolean {
        const wx = this.miniGameGlobals.wx;
        if (wx) {
            return !!(wx.getSystemInfo && wx.createCanvas && wx.createImage);
        }
        return false;
    }

    /**
     * @zh 检测是否为字节跳动小游戏环境
     * @en Check if running in ByteDance Mini Game environment
     */
    private static isByteDanceMiniGame(): boolean {
        const tt = this.miniGameGlobals.tt;
        if (tt) {
            return !!(tt.getSystemInfo && tt.createCanvas && tt.createImage);
        }
        return false;
    }

    /**
     * 检测是否为Node.js环境
     */
    private static isNodeJS(): boolean {
        try {
            // 检查Node.js特有的全局对象和模块
            return !!(
                typeof process !== 'undefined' &&
                process.versions &&
                process.versions.node &&
                typeof require !== 'undefined' &&
                typeof module !== 'undefined' &&
                typeof exports !== 'undefined' &&
                // 确保不是在浏览器环境中的Node.js模拟
                typeof window === 'undefined' &&
                typeof document === 'undefined'
            );
        } catch {
            return false;
        }
    }

    /**
     * @zh 检测是否为支付宝小游戏环境
     * @en Check if running in Alipay Mini Game environment
     */
    private static isAlipayMiniGame(): boolean {
        const my = this.miniGameGlobals.my;
        if (my) {
            return !!(my.getSystemInfo && my.createCanvas);
        }
        return false;
    }

    /**
     * @zh 检测是否为百度小游戏环境
     * @en Check if running in Baidu Mini Game environment
     */
    private static isBaiduMiniGame(): boolean {
        const swan = this.miniGameGlobals.swan;
        if (swan) {
            return !!(swan.getSystemInfo && swan.createCanvas);
        }
        return false;
    }

    /**
     * 检测是否为浏览器环境
     */
    private static isBrowser(): boolean {
        // 检查浏览器特有的对象和API
        return typeof window !== 'undefined' &&
               typeof document !== 'undefined' &&
               typeof navigator !== 'undefined' &&
               window.location !== undefined;
    }

    /**
     * 检测是否在 Tauri 桌面环境中运行
     * Check if running in Tauri desktop environment
     *
     * 同时支持 Tauri v1 (__TAURI__) 和 v2 (__TAURI_INTERNALS__)
     * Supports both Tauri v1 (__TAURI__) and v2 (__TAURI_INTERNALS__)
     */
    public static isTauriEnvironment(): boolean {
        if (typeof window === 'undefined') {
            return false;
        }
        // Tauri v1 uses __TAURI__, Tauri v2 uses __TAURI_INTERNALS__
        return '__TAURI__' in window || '__TAURI_INTERNALS__' in window;
    }

    /**
     * 检测是否在编辑器环境中运行
     * Check if running in editor environment
     *
     * 包括 Tauri 桌面应用或带 __ESENGINE_EDITOR__ 标记的环境
     * Includes Tauri desktop app or environments marked with __ESENGINE_EDITOR__
     */
    public static isEditorEnvironment(): boolean {
        if (typeof window === 'undefined') {
            return false;
        }

        // Tauri desktop app | Tauri 桌面应用
        if (this.isTauriEnvironment()) {
            return true;
        }

        // Editor marker | 编辑器标记
        if ('__ESENGINE_EDITOR__' in window) {
            return true;
        }

        return false;
    }

    /**
     * @zh 获取详细的环境信息（用于调试）
     * @en Get detailed environment information for debugging
     */
    public static getDetailedInfo(): Record<string, unknown> {
        const info: Record<string, unknown> = {};
        const globals = this.miniGameGlobals;

        info['userAgent'] = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
        info['platform'] = typeof navigator !== 'undefined' ? navigator.platform : 'unknown';

        info['globalObjects'] = {
            window: typeof window !== 'undefined',
            document: typeof document !== 'undefined',
            navigator: typeof navigator !== 'undefined',
            wx: globals.wx !== undefined,
            tt: globals.tt !== undefined,
            my: globals.my !== undefined,
            swan: globals.swan !== undefined
        };

        info['workerSupport'] = {
            Worker: typeof Worker !== 'undefined',
            SharedWorker: typeof SharedWorker !== 'undefined',
            ServiceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
            SharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
            crossOriginIsolated: typeof self !== 'undefined' ? self.crossOriginIsolated : false
        };

        info['performance'] = {
            performanceNow: typeof performance !== 'undefined' && typeof performance.now === 'function',
            hardwareConcurrency: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined
        };

        info['apiSupport'] = {
            Blob: typeof Blob !== 'undefined',
            URL: typeof URL !== 'undefined',
            createObjectURL: typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function',
            ArrayBuffer: typeof ArrayBuffer !== 'undefined',
            TypedArrays: typeof Float32Array !== 'undefined'
        };

        return info;
    }
}
