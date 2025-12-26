export class SettingsService {
    private static _instance: SettingsService;
    private _settings: Map<string, any> = new Map();
    private _storageKey = 'editor-settings';

    private constructor() {
        this._loadSettings();
    }

    public static getInstance(): SettingsService {
        if (!SettingsService._instance) {
            SettingsService._instance = new SettingsService();
        }
        return SettingsService._instance;
    }

    private _loadSettings(): void {
        try {
            const stored = localStorage.getItem(this._storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this._settings = new Map(Object.entries(data));
            }
        } catch (error) {
            console.error('[SettingsService] Failed to load settings:', error);
        }
    }

    private _saveSettings(): void {
        try {
            const data = Object.fromEntries(this._settings);
            localStorage.setItem(this._storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('[SettingsService] Failed to save settings:', error);
        }
    }

    public get<T>(key: string, defaultValue: T): T {
        if (this._settings.has(key)) {
            return this._settings.get(key) as T;
        }
        return defaultValue;
    }

    public set<T>(key: string, value: T): void {
        this._settings.set(key, value);
        this._saveSettings();
    }

    public has(key: string): boolean {
        return this._settings.has(key);
    }

    public delete(key: string): void {
        this._settings.delete(key);
        this._saveSettings();
    }

    public clear(): void {
        this._settings.clear();
        this._saveSettings();
    }

    public getAll(): Record<string, any> {
        return Object.fromEntries(this._settings);
    }

    public getRecentProjects(): string[] {
        return this.get<string[]>('recentProjects', []);
    }

    public addRecentProject(projectPath: string): void {
        // 规范化路径，防止双重转义 | Normalize path to prevent double escaping
        const normalizedPath = projectPath.replace(/\\\\/g, '\\');
        const recentProjects = this.getRecentProjects();
        const filtered = recentProjects.filter((p) => p !== normalizedPath);
        const updated = [normalizedPath, ...filtered].slice(0, 10);
        this.set('recentProjects', updated);
    }

    public removeRecentProject(projectPath: string): void {
        const recentProjects = this.getRecentProjects();
        const filtered = recentProjects.filter((p) => p !== projectPath);
        this.set('recentProjects', filtered);
    }

    public clearRecentProjects(): void {
        this.set('recentProjects', []);
    }

    // ==================== Script Editor Settings ====================

    /**
     * 支持的脚本编辑器类型
     * Supported script editor types
     *
     * 使用 nameKey 作为翻译键，如果没有 nameKey 则使用 name 作为显示名称
     * Use nameKey as translation key, fallback to name if no nameKey
     */
    public static readonly SCRIPT_EDITORS = [
        { id: 'system', name: 'System Default', nameKey: 'settings.scriptEditor.systemDefault', command: '' },
        { id: 'vscode', name: 'Visual Studio Code', command: 'code' },
        { id: 'cursor', name: 'Cursor', command: 'cursor' },
        { id: 'webstorm', name: 'WebStorm', command: 'webstorm' },
        { id: 'sublime', name: 'Sublime Text', command: 'subl' },
        { id: 'custom', name: 'Custom', nameKey: 'settings.scriptEditor.custom', command: '' }
    ];

    /**
     * 获取脚本编辑器设置
     * Get script editor setting
     */
    public getScriptEditor(): string {
        return this.get<string>('editor.scriptEditor', 'system');
    }

    /**
     * 设置脚本编辑器
     * Set script editor
     */
    public setScriptEditor(editorId: string): void {
        this.set('editor.scriptEditor', editorId);
    }

    /**
     * 获取自定义脚本编辑器命令
     * Get custom script editor command
     */
    public getCustomScriptEditorCommand(): string {
        return this.get<string>('editor.customScriptEditorCommand', '');
    }

    /**
     * 设置自定义脚本编辑器命令
     * Set custom script editor command
     */
    public setCustomScriptEditorCommand(command: string): void {
        this.set('editor.customScriptEditorCommand', command);
    }

    /**
     * 获取当前脚本编辑器的命令
     * Get current script editor command
     */
    public getScriptEditorCommand(): string {
        const editorId = this.getScriptEditor();
        if (editorId === 'custom') {
            return this.getCustomScriptEditorCommand();
        }
        const editor = SettingsService.SCRIPT_EDITORS.find(e => e.id === editorId);
        return editor?.command || '';
    }
}
