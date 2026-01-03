---
"@esengine/node-editor": minor
---

feat(node-editor): 添加 Shadow DOM 样式注入支持 | Add Shadow DOM style injection support

**@esengine/node-editor**

- 新增 `nodeEditorCssText` 导出，包含所有编辑器样式的 CSS 文本 | Added `nodeEditorCssText` export containing all editor styles as CSS text
- 新增 `injectNodeEditorStyles(root)` 函数，支持将样式注入到 Shadow DOM | Added `injectNodeEditorStyles(root)` function for injecting styles into Shadow DOM
- 支持在 Cocos Creator 等使用 Shadow DOM 的环境中使用 | Support usage in Shadow DOM environments like Cocos Creator
