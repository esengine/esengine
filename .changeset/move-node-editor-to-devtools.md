---
"@esengine/node-editor": patch
---

refactor: 移动到 packages/devtools 目录 | Move to packages/devtools directory

- 将 @esengine/node-editor 从 packages/editor/plugins 移动到 packages/devtools | Move from packages/editor/plugins to packages/devtools
- 清理依赖：移除未使用的 zustand，将 react 改为 peerDependencies | Clean dependencies: remove unused zustand, move react to peerDependencies
- 包现在是独立的，可用于 Cocos/Laya 插件 | Package is now standalone for use in Cocos/Laya plugins
