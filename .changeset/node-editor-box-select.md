---
"@esengine/node-editor": minor
---

feat(node-editor): add box selection and variable node error states

- Add box selection: drag on empty canvas to select multiple nodes
- Support Ctrl+drag for additive selection (add to existing selection)
- Add error state styling for invalid variable references (red border, warning icon)
- Support dynamic node title via `data.displayTitle`
- Support hiding inputs via `data.hiddenInputs` array
