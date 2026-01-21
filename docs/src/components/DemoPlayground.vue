<template>
    <div class="demo-playground" :class="{ 'editor-collapsed': !showEditor, 'fullscreen': isFullscreen }" ref="container">
        <!-- 顶部工具栏 -->
        <div class="demo-toolbar">
            <div class="toolbar-left">
                <span class="demo-title">{{ title }}</span>
                <span class="demo-lang">TS</span>
            </div>

            <!-- 场景切换按钮（可选） -->
            <div class="scene-buttons" v-if="isRunning && scenes.length > 0">
                <button
                    v-for="scene in scenes"
                    :key="scene.id"
                    :class="['scene-btn', { active: currentScene === scene.id }]"
                    @click="switchScene(scene.id)"
                    :title="scene.name"
                >
                    {{ scene.id }}
                </button>
            </div>

            <div class="toolbar-right">
                <!-- 播放控制 -->
                <div class="play-controls" v-if="isRunning">
                    <button @click="togglePause" class="btn-icon" :title="isPaused ? 'Resume' : 'Pause'">
                        <Play v-if="isPaused" :size="14" />
                        <Pause v-else :size="14" />
                    </button>
                    <button @click="restartDemo" class="btn-icon" title="Restart">
                        <RotateCcw :size="14" />
                    </button>
                </div>

                <!-- 主要操作按钮 -->
                <button @click="runCode" class="btn-primary" :disabled="isRunning || isCompiling">
                    <Play :size="14" />
                    <span>{{ isCompiling ? 'Compiling...' : (isRunning ? 'Running' : 'Run') }}</span>
                </button>
                <button @click="stopDemo" class="btn-danger" v-if="isRunning">
                    <Square :size="14" />
                    <span>Stop</span>
                </button>
                <button @click="resetCode" class="btn-secondary">
                    <RotateCcw :size="14" />
                    <span>Reset</span>
                </button>

                <!-- 编辑器折叠 -->
                <button @click="toggleEditor" class="btn-icon" :title="showEditor ? 'Hide Editor' : 'Show Editor'">
                    <PanelLeftClose v-if="showEditor" :size="14" />
                    <PanelLeft v-else :size="14" />
                </button>

                <!-- 全屏 -->
                <button @click="toggleFullscreen" class="btn-icon" title="Fullscreen">
                    <Minimize v-if="isFullscreen" :size="14" />
                    <Maximize v-else :size="14" />
                </button>
            </div>
        </div>

        <!-- 主内容区 -->
        <div class="demo-content">
            <!-- 编辑器区域 -->
            <div class="demo-editor" v-show="showEditor">
                <iframe ref="editorFrame" class="editor-iframe"></iframe>
            </div>

            <!-- 预览区域 -->
            <div class="demo-preview">
                <!-- 参数面板（可选） -->
                <div class="params-panel" v-if="isRunning && showParams && paramList.length > 0">
                    <div class="params-header">
                        <span>Parameters</span>
                        <button @click="showParams = false" class="btn-close">×</button>
                    </div>
                    <div class="param-item" v-for="param in paramList" :key="param.id">
                        <div class="param-row">
                            <label :title="param.desc">{{ param.label }}</label>
                            <input
                                type="range"
                                :min="param.min"
                                :max="param.max"
                                :step="param.step"
                                v-model.number="param.value"
                                @input="updateParam(param)"
                            />
                            <span class="param-value">{{ param.value }}</span>
                        </div>
                        <div class="param-desc" v-if="param.desc">{{ param.desc }}</div>
                    </div>
                </div>

                <!-- 参数面板开关 -->
                <button
                    v-if="isRunning && !showParams && paramList.length > 0"
                    @click="showParams = true"
                    class="btn-show-params"
                    title="Show Parameters"
                >
                    <Settings :size="16" />
                </button>

                <!-- Canvas -->
                <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>

                <!-- 编译错误 -->
                <div v-if="compileError" class="compile-error">{{ compileError }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, reactive, computed } from 'vue';
import { Play, Pause, RotateCcw, Square, PanelLeftClose, PanelLeft, Maximize, Minimize, Settings } from 'lucide-vue-next';

// 类型定义
interface SceneConfig {
    id: string;
    label: string;
    name: string;
}

interface ParamConfig {
    id: string;
    label: string;
    desc?: string;
    value: number;
    min: number;
    max: number;
    step: number;
}

const props = defineProps<{
    title?: string;
    code: string;
    canvasWidth?: number;
    canvasHeight?: number;
    // 可选：场景配置
    scenes?: SceneConfig[];
    // 可选：参数配置
    params?: ParamConfig[];
}>();

const title = props.title ?? 'Demo';
const canvasWidth = props.canvasWidth ?? 600;
const canvasHeight = props.canvasHeight ?? 400;

// 场景列表（如果没有传入则为空数组）
const scenes = computed(() => props.scenes ?? []);

// 参数列表（响应式副本）
const paramList = reactive<ParamConfig[]>([]);

// 初始化参数
function initParams() {
    paramList.length = 0;
    if (props.params) {
        props.params.forEach(p => {
            paramList.push({ ...p });
        });
    }
}

// Refs
const container = ref<HTMLDivElement | null>(null);
const editorFrame = ref<HTMLIFrameElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);

// State
const isRunning = ref(false);
const isCompiling = ref(false);
const isPaused = ref(false);
const compileError = ref('');
const currentCode = ref(props.code);
const showEditor = ref(true);
const isFullscreen = ref(false);
const showParams = ref(true);
const currentScene = ref('');

let babelLoaded = false;

// 加载 Babel
async function loadBabel(): Promise<void> {
    if (babelLoaded || (window as any).Babel) {
        babelLoaded = true;
        return;
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@babel/standalone@7.23.0/babel.min.js';
        script.onload = () => {
            babelLoaded = true;
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// 编译 TypeScript
function compileTypeScript(code: string): string {
    const Babel = (window as any).Babel;
    if (!Babel) throw new Error('Babel not loaded');

    const result = Babel.transform(code, {
        presets: ['typescript'],
        plugins: [
            ['proposal-decorators', { legacy: true }],
            ['proposal-class-properties', { loose: true }]
        ],
        filename: 'demo.ts'
    });

    return result.code;
}

// Monaco Editor HTML
const editorHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: content-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #1e1e1e; }
        #editor { width: 100%; height: 100%; }
    </style>
</head>
<body>
    <div id="editor"></div>
    <script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js"><\/script>
    <script>
        require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
        require(['vs/editor/editor.main'], function () {
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                allowNonTsExtensions: true,
                strict: false
            });
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: true,
                noSyntaxValidation: false
            });
            window.editor = monaco.editor.create(document.getElementById('editor'), {
                value: '',
                language: 'typescript',
                theme: 'vs-dark',
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                folding: true
            });
            window.editor.onDidChangeModelContent(function() {
                window.parent.postMessage({ type: 'codeChange', code: window.editor.getValue() }, '*');
            });
            window.parent.postMessage({ type: 'editorReady' }, '*');
        });
        window.addEventListener('message', function(e) {
            if (e.data.type === 'setCode' && window.editor) window.editor.setValue(e.data.code);
            if (e.data.type === 'getCode' && window.editor) {
                window.parent.postMessage({ type: 'codeValue', code: window.editor.getValue() }, '*');
            }
        });
    <\/script>
</body>
</html>
`;

onMounted(async () => {
    initParams();
    loadBabel().catch(console.error);

    if (editorFrame.value) {
        const frame = editorFrame.value;
        const doc = frame.contentDocument || frame.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(editorHtml);
            doc.close();
        }
    }

    window.addEventListener('message', handleMessage);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // 初始化默认场景
    if (scenes.value.length > 0) {
        currentScene.value = scenes.value[0].id;
    }
});

onUnmounted(() => {
    window.removeEventListener('message', handleMessage);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    stopDemo();
});

function handleMessage(e: MessageEvent) {
    if (e.data.type === 'editorReady') {
        editorFrame.value?.contentWindow?.postMessage({ type: 'setCode', code: props.code }, '*');
    }
    if (e.data.type === 'codeChange') {
        currentCode.value = e.data.code;
    }
}

function handleFullscreenChange() {
    isFullscreen.value = !!document.fullscreenElement;
}

function stopDemo() {
    if (canvas.value && (canvas.value as any).__cleanup) {
        (canvas.value as any).__cleanup();
    }
    (window as any).__demoScene = null;
    (window as any).__demoPaused = false;
    (window as any).__demoParams = null;
    isRunning.value = false;
    isPaused.value = false;
}

async function runCode() {
    if (!canvas.value) return;

    stopDemo();
    compileError.value = '';
    isCompiling.value = true;

    // 重置场景选择
    if (scenes.value.length > 0) {
        currentScene.value = scenes.value[0].id;
    }

    const ctx = canvas.value.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    try {
        await loadBabel();

        const ESEngine = (window as any).ESEngine;
        if (!ESEngine) throw new Error('ESEngine not loaded');

        let compiledCode: string;
        try {
            compiledCode = compileTypeScript(currentCode.value);
        } catch (e: any) {
            throw new Error(`Compile error: ${e.message}`);
        }

        isCompiling.value = false;
        isRunning.value = true;

        // 构建参数对象
        const initialParams: Record<string, number> = {};
        paramList.forEach(p => initialParams[p.id] = p.value);

        const wrappedCode = `
            (function(ESEngine, ctx, canvas, _requestAnimationFrame, _cancelAnimationFrame, __params) {
                // 暴露参数供外部修改
                window.__demoParams = __params;

                const requestAnimationFrame = function(cb) {
                    const id = _requestAnimationFrame(function(time) {
                        if (!window.__demoPaused) cb(time);
                        else _requestAnimationFrame(function loop(t) {
                            if (!window.__demoPaused) cb(t);
                            else _requestAnimationFrame(loop);
                        });
                    });
                    window.__lastAnimationId = id;
                    return id;
                };
                const cancelAnimationFrame = _cancelAnimationFrame;

                ${compiledCode}

                // 暴露场景供外部控制
                if (typeof demoScene !== 'undefined') {
                    window.__demoScene = demoScene;
                }
            })
        `;

        const fn = eval(wrappedCode);
        fn(ESEngine, ctx, canvas.value, requestAnimationFrame, cancelAnimationFrame, initialParams);

        (canvas.value as any).__cleanup = () => {
            if ((window as any).__lastAnimationId) {
                cancelAnimationFrame((window as any).__lastAnimationId);
                (window as any).__lastAnimationId = null;
            }
        };

    } catch (error: any) {
        console.error('Error:', error);
        compileError.value = error.message || String(error);
        ctx.fillStyle = '#ff4444';
        ctx.font = '14px monospace';
        ctx.fillText(`Error: ${error}`, 10, 30);
    }

    isCompiling.value = false;
}

function resetCode() {
    stopDemo();
    editorFrame.value?.contentWindow?.postMessage({ type: 'setCode', code: props.code }, '*');
    currentCode.value = props.code;

    // 重置参数
    initParams();

    if (canvas.value) {
        const ctx = canvas.value.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#16213e';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
    }
}

function togglePause() {
    isPaused.value = !isPaused.value;
    (window as any).__demoPaused = isPaused.value;
}

function restartDemo() {
    runCode();
}

function switchScene(sceneId: string) {
    currentScene.value = sceneId;
    const scene = (window as any).__demoScene;
    if (scene && typeof scene.loadScenario === 'function') {
        scene.loadScenario(sceneId);
    }
}

let paramUpdateTimer: ReturnType<typeof setTimeout> | null = null;

function updateParam(param: ParamConfig) {
    const demoParams = (window as any).__demoParams;
    if (demoParams) {
        demoParams[param.id] = param.value;
    }

    // 防抖：参数变化后延迟重载场景（避免拖动滑块时频繁重载）
    if (paramUpdateTimer) {
        clearTimeout(paramUpdateTimer);
    }
    paramUpdateTimer = setTimeout(() => {
        const scene = (window as any).__demoScene;
        if (scene && typeof scene.loadScenario === 'function' && currentScene.value) {
            scene.loadScenario(currentScene.value);
        }
    }, 300);
}

function toggleEditor() {
    showEditor.value = !showEditor.value;
}

function toggleFullscreen() {
    if (!container.value) return;

    if (!document.fullscreenElement) {
        container.value.requestFullscreen().catch(console.error);
    } else {
        document.exitFullscreen().catch(console.error);
    }
}

watch(() => props.code, (newCode) => {
    editorFrame.value?.contentWindow?.postMessage({ type: 'setCode', code: newCode }, '*');
});

watch(() => props.params, () => {
    initParams();
}, { deep: true });
</script>

<style scoped>
/* 重置所有按钮样式 */
.demo-toolbar button {
    all: unset;
    box-sizing: border-box;
}

.demo-playground {
    border: 1px solid #3b3b4f;
    border-radius: 8px;
    overflow: hidden;
    margin: 1.5rem 0;
    background: #1e1e1e;
}

.demo-playground.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    border-radius: 0;
    z-index: 9999;
}

/* 工具栏 */
.demo-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background: #252526;
    border-bottom: 1px solid #3b3b4f;
    gap: 1rem;
    flex-wrap: wrap;
}

.toolbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.demo-title {
    font-weight: 600;
    color: #cccccc;
    font-size: 13px;
    line-height: 26px;
}

.demo-lang {
    background: #3178c6;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
}

/* 场景按钮 */
.scene-buttons {
    display: flex;
    align-items: center;
    gap: 4px;
}

.scene-btn {
    all: unset;
    box-sizing: border-box;
    height: 26px;
    padding: 0 10px;
    border-radius: 4px;
    border: 1px solid #3b3b4f;
    background: #2d2d2d;
    color: #888;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    font-family: inherit;
    text-transform: capitalize;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.scene-btn:hover {
    background: #3c3c3c;
    color: #ccc;
    border-color: #4a4a5a;
}

.scene-btn.active {
    background: #0e639c;
    border-color: #0e639c;
    color: white;
}

/* 播放控制 */
.play-controls {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-right: 4px;
    padding-right: 8px;
    border-right: 1px solid #3b3b4f;
}

/* 主要按钮基础样式 */
.demo-toolbar button {
    height: 26px;
    padding: 0 12px;
    border-radius: 4px;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    font-family: inherit;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    white-space: nowrap;
}

.demo-toolbar button svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
}

/* 图标按钮 */
.demo-toolbar .btn-icon {
    width: 26px;
    padding: 0;
    border: 1px solid #3b3b4f;
    background: #2d2d2d;
    color: #888;
}

.demo-toolbar .btn-icon:hover {
    background: #3c3c3c;
    color: #ccc;
    border-color: #4a4a5a;
}

.btn-primary {
    background: #0e639c;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #1177bb;
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-danger {
    background: #c53030;
    color: white;
}

.btn-danger:hover {
    background: #e53e3e;
}

.btn-secondary {
    background: #2d2d2d;
    border-color: #3b3b4f;
    color: #ccc;
}

.btn-secondary:hover {
    background: #3c3c3c;
    border-color: #4a4a5a;
}

/* 内容区 */
.demo-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 500px;
}

.demo-playground.editor-collapsed .demo-content {
    grid-template-columns: 1fr;
    height: 550px;
}

.demo-playground.fullscreen .demo-content {
    height: calc(100vh - 50px);
}

.demo-editor {
    border-right: 1px solid #3b3b4f;
    height: 100%;
}

.editor-iframe {
    width: 100%;
    height: 100%;
    border: none;
}

/* 预览区 */
.demo-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #0d1117;
    padding: 1rem;
    overflow: hidden;
    position: relative;
}

.demo-preview canvas {
    border-radius: 4px;
    background: #16213e;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

/* 编辑器收起时 canvas 放大 */
.demo-playground.editor-collapsed .demo-preview {
    padding: 2rem;
}

.demo-playground.editor-collapsed .demo-preview canvas {
    transform: scale(1.3);
    transform-origin: center center;
}

/* 参数面板 */
.params-panel {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.85);
    border: 1px solid #3b3b4f;
    border-radius: 8px;
    padding: 0.75rem;
    min-width: 180px;
    z-index: 10;
}

.params-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #3b3b4f;
    color: #00d4ff;
    font-size: 0.8rem;
    font-weight: 600;
}

.btn-close {
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 16px;
    padding: 0;
    line-height: 1;
}

.btn-close:hover {
    color: #fff;
}

.param-item {
    margin-bottom: 0.75rem;
}

.param-item:last-child {
    margin-bottom: 0;
}

.param-row {
    display: grid;
    grid-template-columns: 60px 1fr 35px;
    align-items: center;
    gap: 0.5rem;
}

.param-desc {
    color: #666;
    font-size: 0.65rem;
    margin-top: 2px;
    padding-left: 2px;
    line-height: 1.3;
}

.param-row label {
    color: #888;
    font-size: 0.75rem;
}

.param-row input[type="range"] {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    background: #3b3b4f;
    border-radius: 2px;
    cursor: pointer;
}

.param-row input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #00d4ff;
    border-radius: 50%;
    cursor: pointer;
}

.param-value {
    color: #00d4ff;
    font-size: 0.75rem;
    font-family: monospace;
    text-align: right;
}

.btn-show-params {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid #3b3b4f;
    background: rgba(0, 0, 0, 0.7);
    color: #888;
    cursor: pointer;
    font-size: 16px;
    z-index: 10;
    transition: all 0.2s;
}

.btn-show-params:hover {
    background: rgba(0, 0, 0, 0.9);
    color: #00d4ff;
}

/* 错误提示 */
.compile-error {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(220, 38, 38, 0.9);
    color: white;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    font-family: monospace;
    white-space: pre-wrap;
    max-height: 100px;
    overflow-y: auto;
}

/* 响应式 */
@media (max-width: 900px) {
    .demo-content {
        grid-template-columns: 1fr;
        height: auto;
    }

    .demo-editor {
        border-right: none;
        border-bottom: 1px solid #3b3b4f;
        height: 350px;
    }

    .demo-preview {
        height: 400px;
    }

    .scene-buttons {
        display: none;
    }
}
</style>
