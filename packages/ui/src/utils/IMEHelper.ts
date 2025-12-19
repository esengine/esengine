/**
 * IME 输入法辅助服务
 * IME (Input Method Editor) Helper Service
 *
 * 使用隐藏的 <input> 元素接收 IME 输入，支持中文/日文/韩文等需要输入法的语言。
 * Uses a hidden <input> element to receive IME input, supporting Chinese/Japanese/Korean
 * and other languages that require input methods.
 *
 * @example
 * ```typescript
 * const imeHelper = new IMEHelper();
 * imeHelper.onCompositionEnd = (text) => {
 *     inputField.insertText(text);
 * };
 * imeHelper.focus();
 * ```
 */
export class IMEHelper {
    private hiddenInput: HTMLInputElement;
    private canvas: HTMLCanvasElement | null = null;

    // ===== 状态 State =====

    /**
     * 是否正在进行 IME 组合
     * Whether IME composition is in progress
     */
    public isComposing: boolean = false;

    /**
     * 当前组合中的文本
     * Current composition text
     */
    public compositionText: string = '';

    // ===== 回调 Callbacks =====

    /**
     * 组合开始回调
     * Composition start callback
     */
    onCompositionStart?: () => void;

    /**
     * 组合更新回调（用户输入拼音等）
     * Composition update callback (user typing pinyin, etc.)
     */
    onCompositionUpdate?: (text: string) => void;

    /**
     * 组合结束回调（用户选择了候选字）
     * Composition end callback (user selected a candidate)
     */
    onCompositionEnd?: (text: string) => void;

    /**
     * 直接输入回调（非 IME 输入）
     * Direct input callback (non-IME input)
     */
    onInput?: (text: string) => void;

    constructor() {
        this.hiddenInput = this.createHiddenInput();
        this.bindEvents();
    }

    /**
     * 创建隐藏的 input 元素
     * Create hidden input element
     */
    private createHiddenInput(): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = '__esengine_ime_input__';
        input.autocomplete = 'off';
        input.autocapitalize = 'off';
        input.spellcheck = false;
        // 使用样式隐藏但保持可聚焦
        // Hide but keep focusable
        input.style.cssText = `
            position: absolute;
            left: 0px;
            top: 0px;
            width: 1px;
            height: 1px;
            opacity: 0;
            pointer-events: none;
            z-index: -1;
            border: none;
            outline: none;
            padding: 0;
            margin: 0;
            background: transparent;
            font-size: 16px;
        `;
        document.body.appendChild(input);
        return input;
    }

    /**
     * 绑定事件
     * Bind events
     */
    private bindEvents(): void {
        // 组合开始 | Composition start
        this.hiddenInput.addEventListener('compositionstart', (_e) => {
            this.isComposing = true;
            this.compositionText = '';
            this.onCompositionStart?.();
        });

        // 组合更新 | Composition update
        this.hiddenInput.addEventListener('compositionupdate', (e) => {
            this.compositionText = e.data || '';
            this.onCompositionUpdate?.(this.compositionText);
        });

        // 组合结束 | Composition end
        this.hiddenInput.addEventListener('compositionend', (e) => {
            this.isComposing = false;
            const text = e.data || '';
            this.compositionText = '';
            this.onCompositionEnd?.(text);
            // 清空 input 值以便下次输入
            // Clear input value for next input
            this.hiddenInput.value = '';
        });

        // 直接输入（非 IME）| Direct input (non-IME)
        this.hiddenInput.addEventListener('input', (e) => {
            // 组合过程中不处理 input 事件
            // Don't handle input event during composition
            if (this.isComposing) return;

            const input = e.target as HTMLInputElement;
            if (input.value) {
                this.onInput?.(input.value);
                // 清空以便下次输入
                // Clear for next input
                input.value = '';
            }
        });

        // 阻止默认键盘行为（由 UIInputSystem 处理）
        // Prevent default keyboard behavior (handled by UIInputSystem)
        this.hiddenInput.addEventListener('keydown', (e) => {
            // 允许 IME 相关的键
            // Allow IME-related keys
            if (this.isComposing) return;

            // 阻止非 IME 的默认行为（如 Backspace、Enter 等）
            // Prevent non-IME default behavior (like Backspace, Enter, etc.)
            const specialKeys = ['Backspace', 'Delete', 'Enter', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
            if (specialKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                // 这些键由 UIInputSystem 处理，不需要在这里处理
                // These keys are handled by UIInputSystem, no need to handle here
                return;
            }
        });
    }

    /**
     * 设置关联的 Canvas 元素
     * Set associated canvas element
     */
    setCanvas(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
    }

    /**
     * 更新隐藏 input 的位置（让 IME 候选窗口出现在正确位置）
     * Update hidden input position (so IME candidate window appears in correct position)
     *
     * @param screenX - 屏幕 X 坐标 | Screen X coordinate
     * @param screenY - 屏幕 Y 坐标 | Screen Y coordinate
     */
    updatePosition(screenX: number, screenY: number): void {
        this.hiddenInput.style.left = `${screenX}px`;
        this.hiddenInput.style.top = `${screenY}px`;
    }

    /**
     * 聚焦隐藏的 input 元素
     * Focus the hidden input element
     */
    focus(): void {
        this.hiddenInput.value = '';
        this.isComposing = false;
        this.compositionText = '';
        this.hiddenInput.focus();
    }

    /**
     * 取消聚焦
     * Blur the hidden input element
     */
    blur(): void {
        this.hiddenInput.blur();
        this.isComposing = false;
        this.compositionText = '';
    }

    /**
     * 检查是否已聚焦
     * Check if focused
     */
    isFocused(): boolean {
        return document.activeElement === this.hiddenInput;
    }

    /**
     * 释放资源
     * Dispose resources
     */
    dispose(): void {
        this.hiddenInput.remove();
        this.onCompositionStart = undefined;
        this.onCompositionUpdate = undefined;
        this.onCompositionEnd = undefined;
        this.onInput = undefined;
    }
}

// ===== 全局单例 Global Singleton =====

let globalIMEHelper: IMEHelper | null = null;

/**
 * 获取全局 IME 辅助服务实例
 * Get global IME helper instance
 */
export function getIMEHelper(): IMEHelper {
    if (!globalIMEHelper) {
        globalIMEHelper = new IMEHelper();
    }
    return globalIMEHelper;
}

/**
 * 销毁全局 IME 辅助服务实例
 * Dispose global IME helper instance
 */
export function disposeIMEHelper(): void {
    if (globalIMEHelper) {
        globalIMEHelper.dispose();
        globalIMEHelper = null;
    }
}
