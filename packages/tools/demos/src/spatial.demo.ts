/**
 * Spatial Module Demo - Tests APIs from docs/modules/spatial/index.md
 */

import {
    createGridSpatialIndex,
    createGridAOI,
    createBounds,
    createBoundsFromCenter,
    createBoundsFromCircle,
    isPointInBounds,
    boundsIntersect,
    distance,
    distanceSquared
} from '@esengine/spatial';

function assert(condition: boolean, message: string): void {
    if (!condition) throw new Error(`FAILED: ${message}`);
    console.log(`  ✓ ${message}`);
}

function section(name: string): void {
    console.log(`\n▶ ${name}`);
}

interface Entity {
    id: number;
    type: string;
}

export async function runSpatialDemo(): Promise<void> {
    console.log('═══════════════════════════════════════');
    console.log('       Spatial Module Demo');
    console.log('═══════════════════════════════════════');

    // 1. Create Spatial Index
    section('1. createGridSpatialIndex()');
    const spatial = createGridSpatialIndex<Entity>(100);
    assert(spatial !== null, 'Spatial index created');
    assert(spatial.count === 0, 'Initially empty');

    // 2. Insert
    section('2. insert()');
    const player: Entity = { id: 1, type: 'player' };
    const enemy1: Entity = { id: 2, type: 'enemy' };
    const enemy2: Entity = { id: 3, type: 'enemy' };

    spatial.insert(player, { x: 100, y: 200 });
    spatial.insert(enemy1, { x: 150, y: 250 });
    spatial.insert(enemy2, { x: 500, y: 600 });

    assert(spatial.count === 3, 'Count is 3');

    // 3. findInRadius
    section('3. findInRadius()');
    const nearby = spatial.findInRadius({ x: 100, y: 200 }, 100);
    assert(nearby.length === 2, `Found ${nearby.length} entities in radius`);
    assert(nearby.includes(player), 'Found player');
    assert(nearby.includes(enemy1), 'Found enemy1');
    assert(!nearby.includes(enemy2), 'enemy2 is too far');

    // 4. findInRadius with filter
    section('4. findInRadius() with filter');
    const enemies = spatial.findInRadius(
        { x: 100, y: 200 },
        100,
        (e) => e.type === 'enemy'
    );
    assert(enemies.length === 1, 'Found 1 enemy');
    assert(enemies[0] === enemy1, 'Found enemy1');

    // 5. findNearest
    section('5. findNearest()');
    const nearest = spatial.findNearest({ x: 100, y: 200 });
    assert(nearest === player || nearest === enemy1, 'Found nearest entity');

    const nearestEnemy = spatial.findNearest(
        { x: 100, y: 200 },
        undefined,
        (e) => e.type === 'enemy'
    );
    assert(nearestEnemy === enemy1, 'Found nearest enemy');

    // 6. findKNearest
    section('6. findKNearest()');
    const k2 = spatial.findKNearest({ x: 100, y: 200 }, 2, 1000);
    assert(k2.length === 2, 'Found 2 nearest');

    // 7. Update position
    section('7. update()');
    spatial.update(player, { x: 400, y: 400 });
    const afterMove = spatial.findInRadius({ x: 100, y: 200 }, 100);
    assert(!afterMove.includes(player), 'Player moved away');

    // 8. Remove
    section('8. remove()');
    spatial.remove(enemy2);
    assert(spatial.count === 2, 'Count is 2 after remove');

    // 9. findInRect
    section('9. findInRect()');
    const bounds = createBounds(0, 0, 200, 300);
    spatial.update(player, { x: 100, y: 200 });
    const inRect = spatial.findInRect(bounds);
    assert(inRect.length >= 1, `Found ${inRect.length} in rect`);

    // 10. Raycast
    section('10. raycast()');
    spatial.update(player, { x: 100, y: 0 });
    spatial.update(enemy1, { x: 100, y: 200 });

    const hits = spatial.raycast(
        { x: 100, y: -100 },
        { x: 0, y: 1 },
        500
    );
    assert(hits.length >= 1, `Raycast hit ${hits.length} entities`);

    // 11. raycastFirst
    section('11. raycastFirst()');
    const firstHit = spatial.raycastFirst(
        { x: 100, y: -100 },
        { x: 0, y: 1 },
        500
    );
    if (firstHit) {
        assert(firstHit.target !== null, 'Hit has target');
        assert(firstHit.distance >= 0, `Hit distance: ${firstHit.distance.toFixed(1)}`);
    }

    // 12. Clear
    section('12. clear()');
    spatial.clear();
    assert(spatial.count === 0, 'Cleared');

    // =========================================================================
    // AOI Tests
    // =========================================================================

    // 13. Create AOI
    section('13. createGridAOI()');
    const aoi = createGridAOI<Entity>(100);
    assert(aoi !== null, 'AOI created');

    // 14. Add Observers
    section('14. addObserver()');
    const p1: Entity = { id: 1, type: 'player' };
    const p2: Entity = { id: 2, type: 'player' };

    aoi.addObserver(p1, { x: 100, y: 100 }, { viewRange: 200 });
    aoi.addObserver(p2, { x: 150, y: 150 }, { viewRange: 200 });

    // Note: After adding p2, p2 can see p1, but p1's visibility isn't auto-updated
    // We need to trigger an update for p1 to detect p2
    aoi.updatePosition(p1, { x: 100, y: 100 });

    // 15. getEntitiesInView
    section('15. getEntitiesInView()');
    const visible = aoi.getEntitiesInView(p1);
    assert(visible.includes(p2), 'p1 can see p2');

    // 16. canSee
    section('16. canSee()');
    assert(aoi.canSee(p1, p2), 'p1 can see p2');

    // 17. updatePosition
    section('17. updatePosition()');
    aoi.updatePosition(p2, { x: 1000, y: 1000 });
    // Refresh p1's visibility (implementation requires explicit update for distant moves)
    aoi.updatePosition(p1, { x: 100, y: 100 });
    assert(!aoi.canSee(p1, p2), 'p1 cannot see p2 after move');

    // 18. getObserversOf
    section('18. getObserversOf()');
    aoi.updatePosition(p2, { x: 120, y: 120 });
    aoi.updatePosition(p1, { x: 100, y: 100 }); // Refresh p1's visibility
    const observers = aoi.getObserversOf(p2);
    assert(observers.includes(p1), 'p1 observes p2');

    // 19. Event Listener
    section('19. addListener()');
    let eventCount = 0;
    aoi.addListener((event) => {
        eventCount++;
    });
    aoi.updatePosition(p2, { x: 2000, y: 2000 }); // Should trigger exit
    aoi.updatePosition(p1, { x: 100, y: 100 });   // Refresh p1
    aoi.updatePosition(p2, { x: 130, y: 130 });   // Should trigger enter
    aoi.updatePosition(p1, { x: 100, y: 100 });   // Refresh p1
    assert(eventCount >= 1, `Events triggered: ${eventCount}`);

    // 20. updateViewRange
    section('20. updateViewRange()');
    aoi.updateViewRange(p1, 50);
    aoi.updatePosition(p2, { x: 200, y: 200 });
    aoi.updatePosition(p1, { x: 100, y: 100 }); // Refresh p1's visibility with new range
    assert(!aoi.canSee(p1, p2), 'Cannot see after view range reduced');

    // 21. removeObserver
    section('21. removeObserver()');
    aoi.removeObserver(p2);
    const afterRemove = aoi.getEntitiesInView(p1);
    assert(!afterRemove.includes(p2), 'p2 removed from AOI');

    // =========================================================================
    // Utility Functions
    // =========================================================================

    // 22. Bounds Creation
    section('22. Bounds Creation');
    const b1 = createBounds(0, 0, 100, 100);
    assert(b1.minX === 0 && b1.maxX === 100, 'createBounds works');

    const b2 = createBoundsFromCenter({ x: 50, y: 50 }, 100, 100);
    assert(b2.minX === 0 && b2.maxX === 100, 'createBoundsFromCenter works');

    const b3 = createBoundsFromCircle({ x: 50, y: 50 }, 50);
    assert(b3.minX === 0 && b3.maxX === 100, 'createBoundsFromCircle works');

    // 23. Point in Bounds
    section('23. isPointInBounds()');
    assert(isPointInBounds({ x: 50, y: 50 }, b1), 'Point inside');
    assert(!isPointInBounds({ x: 150, y: 150 }, b1), 'Point outside');

    // 24. Bounds Intersect
    section('24. boundsIntersect()');
    const ba = createBounds(0, 0, 100, 100);
    const bb = createBounds(50, 50, 150, 150);
    const bc = createBounds(200, 200, 300, 300);
    assert(boundsIntersect(ba, bb), 'Overlapping bounds intersect');
    assert(!boundsIntersect(ba, bc), 'Separate bounds do not intersect');

    // 25. Distance
    section('25. distance() / distanceSquared()');
    const d = distance({ x: 0, y: 0 }, { x: 3, y: 4 });
    assert(Math.abs(d - 5) < 0.001, `Distance: ${d}`);

    const dsq = distanceSquared({ x: 0, y: 0 }, { x: 3, y: 4 });
    assert(dsq === 25, `Distance squared: ${dsq}`);

    console.log('\n═══════════════════════════════════════');
    console.log('  Spatial Demo: ALL TESTS PASSED ✓');
    console.log('═══════════════════════════════════════\n');
}

runSpatialDemo().catch(console.error);
