---
"@esengine/node-editor": minor
"@esengine/blueprint": minor
---

feat(node-editor): add visual group box for organizing nodes

- Add NodeGroup model with dynamic bounds calculation based on node pin counts
- Add GroupNodeComponent for rendering group boxes behind nodes
- Groups automatically resize to wrap contained nodes
- Dragging group header moves all nodes inside together
- Support group serialization/deserialization
- Export `estimateNodeHeight` and `NodeBounds` for accurate size calculation

feat(blueprint): add comprehensive math and logic nodes

Math nodes:
- Modulo, Abs, Min, Max, Power, Sqrt
- Floor, Ceil, Round, Sign, Negate
- Sin, Cos, Tan, Asin, Acos, Atan, Atan2
- DegToRad, RadToDeg, Lerp, InverseLerp
- Clamp, Wrap, RandomRange, RandomInt

Logic nodes:
- Equal, NotEqual, GreaterThan, GreaterThanOrEqual
- LessThan, LessThanOrEqual, InRange
- AND, OR, NOT, XOR, NAND
- IsNull, Select (ternary)
