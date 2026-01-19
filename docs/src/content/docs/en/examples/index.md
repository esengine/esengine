---
title: "Examples"
description: "ESEngine example projects and demos"
---

Explore example projects to learn ESEngine best practices.

## Pathfinding Demos

### [A* Pathfinding Demo](/en/examples/astar-pathfinding-demo/)
Grid-based A* pathfinding visualization:
- Maze generation, random obstacles, room layouts, spiral maps
- Incremental pathfinding with time-slicing
- ECS architecture demonstration

### [Multi-Agent Pathfinding Demo](/en/examples/multi-agent-pathfinding-demo/)
Multiple agents pathfinding simultaneously with avoidance:
- A* pathfinding + ORCA avoidance combined
- Multiple scenario presets (swap, gather, scatter, patrol)
- PathfindingSystem and LocalAvoidanceSystem cooperation

### [ORCA Local Avoidance Demo](/en/examples/orca-avoidance-demo/)
Interactive multi-agent collision avoidance using ORCA algorithm:
- KDTree spatial indexing for efficient neighbor queries
- Linear programming solver for velocity optimization
- Multiple scenario presets (circle swap, crossroads, funnel)
- Support for 50-500 agents with real-time parameter adjustment

## System Demos

### [Worker System Demo](/en/examples/worker-system-demo/)
Demonstrates how to use Web Workers for parallel processing, offloading heavy computations from the main thread.

## External Examples

### [Lawn Mower Demo](https://github.com/esengine/lawn-mower-demo)
A complete game demo showcasing ESEngine features including:
- Entity-Component-System architecture
- Behavior tree AI
- Scene management
- Platform adaptation
