---
title: "Editor Guide"
description: "Visual behavior tree creation"
---

## Opening the Editor

The behavior tree editor provides a visual interface for creating and managing behavior trees.

## Creating a New Tree

1. Open the behavior tree editor
2. Click "New Behavior Tree"
3. Enter a name for your tree
4. Start adding nodes

## Node Operations

### Adding Nodes

- Drag nodes from the palette to the canvas
- Right-click on canvas to open context menu
- Use keyboard shortcuts for quick access

### Connecting Nodes

- Click and drag from a node's output port
- Drop on another node's input port
- Connections show execution flow

### Configuring Nodes

- Select a node to view its properties
- Configure parameters in the property panel
- Use bindings to connect to blackboard variables

## Blackboard Panel

The blackboard panel allows you to:

- Define variables used by the tree
- Set initial values
- Specify variable types

```
Variables:
  - health: number = 100
  - target: Entity = null
  - isAlert: boolean = false
```

## Saving and Loading

- **Save**: Ctrl+S or File → Save
- **Export**: Export as JSON for runtime use
- **Import**: Load existing tree files

## Debugging

- Use the play button to test execution
- Watch node status in real-time
- View blackboard values during execution

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+S | Save |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Delete | Remove selected |
| Ctrl+C | Copy |
| Ctrl+V | Paste |
