---
"@esengine/node-editor": patch
---

fix(node-editor): 修复节点收缩后连线不显示的问题

- 节点收缩时，连线会连接到节点头部（输入引脚在左侧，输出引脚在右侧）
- 展开后连线会自动恢复到正确位置
