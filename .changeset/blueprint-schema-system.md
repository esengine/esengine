---
"@esengine/blueprint": minor
---

feat(blueprint): add Schema type system and @BlueprintArray decorator

- Add `Schema` fluent API for defining complex data types:
  - Primitive types: `Schema.float()`, `Schema.int()`, `Schema.string()`, `Schema.boolean()`, `Schema.vector2()`, `Schema.vector3()`
  - Composite types: `Schema.object()`, `Schema.array()`, `Schema.enum()`, `Schema.ref()`
  - Support for constraints: `min`, `max`, `step`, `defaultValue`, `placeholder`, etc.

- Add `@BlueprintArray` decorator for array properties:
  - `itemSchema`: Define schema for array items using Schema API
  - `reorderable`: Allow drag-and-drop reordering
  - `exposeElementPorts`: Create individual ports for each array element
  - `portNameTemplate`: Custom naming for element ports (e.g., "Waypoint {index1}")

- Update documentation with examples and usage guide
