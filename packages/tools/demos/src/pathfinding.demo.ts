/**
 * Pathfinding Module Demo - Tests APIs from docs/modules/pathfinding/index.md
 */

import {
    createGridMap,
    createAStarPathfinder,
    createLineOfSightSmoother,
    createCatmullRomSmoother,
    manhattanDistance,
    octileDistance
} from '@esengine/pathfinding';

function assert(condition: boolean, message: string): void {
    if (!condition) throw new Error(`FAILED: ${message}`);
    console.log(`  ✓ ${message}`);
}

function section(name: string): void {
    console.log(`\n▶ ${name}`);
}

export async function runPathfindingDemo(): Promise<void> {
    console.log('═══════════════════════════════════════');
    console.log('     Pathfinding Module Demo');
    console.log('═══════════════════════════════════════');

    // 1. Create Grid Map
    section('1. createGridMap()');
    const grid = createGridMap(20, 20);
    assert(grid !== null, 'Grid created');
    assert(grid.width === 20, 'Width is 20');
    assert(grid.height === 20, 'Height is 20');

    // 2. Walkability
    section('2. setWalkable() / isWalkable()');
    assert(grid.isWalkable(5, 5), 'Initially walkable');
    grid.setWalkable(5, 5, false);
    assert(!grid.isWalkable(5, 5), 'Set to not walkable');
    grid.setWalkable(5, 5, true);
    assert(grid.isWalkable(5, 5), 'Restored to walkable');

    // 3. Set Obstacles
    section('3. Setting Obstacles');
    grid.setWalkable(5, 5, false);
    grid.setWalkable(5, 6, false);
    grid.setWalkable(5, 7, false);
    assert(!grid.isWalkable(5, 6), 'Obstacle set');

    // 4. Create Pathfinder
    section('4. createAStarPathfinder()');
    const pathfinder = createAStarPathfinder(grid);
    assert(pathfinder !== null, 'Pathfinder created');

    // 5. Find Path
    section('5. findPath()');
    const result = pathfinder.findPath(0, 0, 15, 15);
    assert(result.found, 'Path found');
    assert(result.path.length > 0, `Path has ${result.path.length} points`);
    assert(result.cost > 0, `Path cost: ${result.cost.toFixed(2)}`);
    assert(result.nodesSearched > 0, `Searched ${result.nodesSearched} nodes`);

    // 6. Path Blocked
    section('6. Path Blocked');
    // Create a wall
    for (let y = 0; y < 20; y++) {
        grid.setWalkable(10, y, false);
    }
    const blocked = pathfinder.findPath(0, 0, 15, 15);
    assert(!blocked.found, 'No path when fully blocked');

    // Clear wall
    for (let y = 0; y < 20; y++) {
        grid.setWalkable(10, y, true);
    }

    // 7. Movement Cost
    section('7. setCost()');
    const gridCost = createGridMap(10, 10);
    gridCost.setCost(5, 5, 10); // High cost tile
    const costResult = createAStarPathfinder(gridCost).findPath(0, 0, 9, 9);
    assert(costResult.found, 'Path found with cost');

    // 8. Heuristics
    section('8. Heuristic Functions');
    const d1 = manhattanDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
    assert(d1 === 7, `Manhattan distance: ${d1}`);

    const d2 = octileDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
    assert(d2 > 0, `Octile distance: ${d2.toFixed(2)}`);

    // 9. Grid Options
    section('9. Grid Options');
    const gridOpts = createGridMap(10, 10, {
        allowDiagonal: false,
        heuristic: manhattanDistance
    });
    assert(gridOpts !== null, 'Grid with options created');

    // 10. Path Smoothing - Line of Sight
    section('10. Line of Sight Smoother');
    const gridSmooth = createGridMap(20, 20);
    const pf = createAStarPathfinder(gridSmooth);
    const rawPath = pf.findPath(0, 0, 10, 10);

    const losSmoother = createLineOfSightSmoother();
    const smoothed = losSmoother.smooth(rawPath.path, gridSmooth);
    assert(smoothed.length <= rawPath.path.length, `Smoothed: ${rawPath.path.length} -> ${smoothed.length} points`);

    // 11. Catmull-Rom Smoother
    section('11. Catmull-Rom Smoother');
    const crSmoother = createCatmullRomSmoother(5, 0.5);
    const curved = crSmoother.smooth(rawPath.path, gridSmooth);
    assert(curved.length >= rawPath.path.length, `Curved path has ${curved.length} points`);

    // 12. loadFromArray
    section('12. loadFromArray()');
    const gridArr = createGridMap(5, 3);
    gridArr.loadFromArray([
        [0, 0, 0, 1, 0],
        [0, 1, 0, 1, 0],
        [0, 1, 0, 0, 0]
    ]);
    assert(!gridArr.isWalkable(3, 0), 'Loaded obstacle at (3,0)');
    assert(!gridArr.isWalkable(1, 1), 'Loaded obstacle at (1,1)');
    assert(gridArr.isWalkable(0, 0), 'Loaded walkable at (0,0)');

    // 13. loadFromString
    section('13. loadFromString()');
    const gridStr = createGridMap(5, 3);
    gridStr.loadFromString(`
.....
.#.#.
.#...
`);
    assert(!gridStr.isWalkable(1, 1), 'Loaded # as obstacle');
    assert(gridStr.isWalkable(0, 0), 'Loaded . as walkable');

    // 14. setRectWalkable
    section('14. setRectWalkable()');
    const gridRect = createGridMap(10, 10);
    gridRect.setRectWalkable(2, 2, 4, 4, false);
    assert(!gridRect.isWalkable(3, 3), 'Rect set as obstacle');
    assert(gridRect.isWalkable(0, 0), 'Outside rect is walkable');

    // 15. Pathfinder Options
    section('15. Pathfinder Options');
    const limitedResult = pathfinder.findPath(0, 0, 15, 15, {
        maxNodes: 100,
        heuristicWeight: 1.5
    });
    assert(limitedResult !== null, 'findPath with options works');

    // 16. Reset Grid
    section('16. reset()');
    grid.reset();
    assert(grid.isWalkable(5, 5), 'Grid reset - all walkable');

    console.log('\n═══════════════════════════════════════');
    console.log('  Pathfinding Demo: ALL TESTS PASSED ✓');
    console.log('═══════════════════════════════════════\n');
}

runPathfindingDemo().catch(console.error);
