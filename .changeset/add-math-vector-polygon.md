---
"@esengine/ecs-framework-math": minor
---

feat(math): add Polygon utility class and Vector2 static methods

### New Features

- **Polygon Class**: New utility class for polygon operations
  - `signedArea()` - Calculate signed area (positive for CCW)
  - `isCCW()` - Check if vertices are counter-clockwise
  - `ensureCCW()` - Ensure CCW ordering (required for ORCA obstacles)
  - `containsPoint()` - Point-in-polygon test
  - `isConvex()` - Check if polygon is convex
  - `centroid()` - Calculate polygon centroid
  - `bounds()` - Get axis-aligned bounding box
  - `perimeter()` - Calculate perimeter length

- **Vector2 Static Methods**: New methods for vector calculations
  - `Vector2.det(a, b)` - Determinant (2D cross product)
  - `Vector2.lengthSq(v)` - Squared length
  - `Vector2.len(v)` - Vector length
  - `Vector2.normalize(v)` - Normalize vector
  - `Vector2.distanceSq(a, b)` - Squared distance between points
  - `Vector2.perpLeft(v)` - Left perpendicular vector
  - `Vector2.perpRight(v)` - Right perpendicular vector

### Improvements

- Changed Vector2 method parameter types from `Vector2` to `IVector2` for better flexibility

### Usage

```typescript
import { Polygon, Vector2 } from '@esengine/ecs-framework-math';

// Polygon operations
const poly = new Polygon([
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 }
]);

if (!poly.isCCW()) {
  poly.ensureCCW(); // Required for ORCA obstacles
}

console.log(poly.isConvex()); // true
console.log(poly.containsPoint(5, 5)); // true

// Vector2 static methods
const a = { x: 1, y: 0 };
const b = { x: 0, y: 1 };
console.log(Vector2.det(a, b)); // 1 (cross product)
console.log(Vector2.len(a)); // 1
```
