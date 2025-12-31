---
"@esengine/behavior-tree": patch
---

fix(behavior-tree): export NodeExecutorMetadata as value instead of type

Fixed the export of `NodeExecutorMetadata` decorator in `execution/index.ts`.
Previously it was exported as `export type { NodeExecutorMetadata }` which only
exported the type signature, not the actual function. This caused runtime errors
in Cocos Creator: "TypeError: (intermediate value) is not a function".

Changed to `export { NodeExecutorMetadata }` to properly export the decorator function.
