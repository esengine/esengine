# @esengine/node-editor

## 1.2.1

### Patch Changes

- [#433](https://github.com/esengine/esengine/pull/433) [`2e84942`](https://github.com/esengine/esengine/commit/2e84942ea14c5326620398add05840fa8bea16f8) Thanks [@esengine](https://github.com/esengine)! - fix(node-editor): 修复节点收缩后连线不显示的问题
    - 节点收缩时，连线会连接到节点头部（输入引脚在左侧，输出引脚在右侧）
    - 展开后连线会自动恢复到正确位置

## 1.2.0

### Minor Changes

- [#430](https://github.com/esengine/esengine/pull/430) [`caf3be7`](https://github.com/esengine/esengine/commit/caf3be72cdcc730492c63abe5f1715893f3579ac) Thanks [@esengine](https://github.com/esengine)! - feat(node-editor): 添加 Shadow DOM 样式注入支持 | Add Shadow DOM style injection support

    **@esengine/node-editor**
    - 新增 `nodeEditorCssText` 导出，包含所有编辑器样式的 CSS 文本 | Added `nodeEditorCssText` export containing all editor styles as CSS text
    - 新增 `injectNodeEditorStyles(root)` 函数，支持将样式注入到 Shadow DOM | Added `injectNodeEditorStyles(root)` function for injecting styles into Shadow DOM
    - 支持在 Cocos Creator 等使用 Shadow DOM 的环境中使用 | Support usage in Shadow DOM environments like Cocos Creator

## 1.1.0

### Minor Changes

- [#426](https://github.com/esengine/esengine/pull/426) [`6970394`](https://github.com/esengine/esengine/commit/6970394717ab8f743b0a41e248e3404a3b6fc7dc) Thanks [@esengine](https://github.com/esengine)! - feat: 独立发布节点编辑器 | Standalone node editor release
    - 移动到 packages/devtools 目录 | Move to packages/devtools directory
    - 清理依赖，使包可独立使用 | Clean dependencies for standalone use
    - 可用于 Cocos Creator / LayaAir 插件开发 | Available for Cocos/Laya plugin development
