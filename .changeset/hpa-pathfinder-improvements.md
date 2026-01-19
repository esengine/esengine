---
"@esengine/pathfinding": minor
---

feat(pathfinding): improve HPA* algorithm with lazy intra-edges and better entrance node distribution

- **Lazy Intra-Edges**: Delay intra-cluster path computation until first query, reducing preprocessing time from ~68s to ~52ms on large maps
- **Entrance Node Distribution**: Fix path quality issue by distributing entrance nodes evenly across wide cluster boundaries instead of only placing at extremes
- **Path Quality**: HPA* now produces near-optimal paths (ratio ~1.0 vs A*) on open maps, previously had significant detours
