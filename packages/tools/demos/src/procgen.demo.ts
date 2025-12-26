/**
 * Procgen Module Demo - Tests APIs from docs/modules/procgen/index.md
 */

import {
    createPerlinNoise,
    createSimplexNoise,
    createWorleyNoise,
    createFBM,
    createSeededRandom,
    createWeightedRandom,
    shuffle,
    shuffleCopy,
    pickOne,
    sample,
    sampleWithReplacement,
    weightedPick,
    weightedPickFromMap
} from '@esengine/procgen';

function assert(condition: boolean, message: string): void {
    if (!condition) throw new Error(`FAILED: ${message}`);
    console.log(`  ✓ ${message}`);
}

function section(name: string): void {
    console.log(`\n▶ ${name}`);
}

export async function runProcgenDemo(): Promise<void> {
    console.log('═══════════════════════════════════════');
    console.log('       Procgen Module Demo');
    console.log('═══════════════════════════════════════');

    // 1. Perlin Noise
    section('1. createPerlinNoise()');
    const perlin = createPerlinNoise(12345);
    assert(perlin !== null, 'Perlin noise created');

    const val2d = perlin.noise2D(0.5, 0.5);
    assert(val2d >= -1 && val2d <= 1, `2D noise value in [-1,1]: ${val2d.toFixed(3)}`);

    const val3d = perlin.noise3D(0.5, 0.5, 0.5);
    assert(val3d >= -1 && val3d <= 1, `3D noise value in [-1,1]: ${val3d.toFixed(3)}`);

    // 2. Simplex Noise
    section('2. createSimplexNoise()');
    const simplex = createSimplexNoise(12345);
    const sval = simplex.noise2D(0.5, 0.5);
    assert(sval >= -1 && sval <= 1, `Simplex value: ${sval.toFixed(3)}`);

    // 3. Worley Noise
    section('3. createWorleyNoise()');
    const worley = createWorleyNoise(12345);
    const wval = worley.noise2D(0.5, 0.5);
    assert(wval >= 0, `Worley distance: ${wval.toFixed(3)}`);

    // 4. FBM
    section('4. createFBM()');
    const fbm = createFBM(perlin, {
        octaves: 6,
        lacunarity: 2.0,
        persistence: 0.5
    });
    const fbmVal = fbm.noise2D(0.1, 0.1);
    assert(typeof fbmVal === 'number', `FBM value: ${fbmVal.toFixed(3)}`);

    const ridged = fbm.ridged2D(0.1, 0.1);
    assert(typeof ridged === 'number', `Ridged FBM: ${ridged.toFixed(3)}`);

    const turb = fbm.turbulence2D(0.1, 0.1);
    assert(turb >= 0, `Turbulence: ${turb.toFixed(3)}`);

    // 5. Seeded Random
    section('5. createSeededRandom()');
    const rng = createSeededRandom(42);
    assert(rng !== null, 'RNG created');

    const r1 = rng.next();
    assert(r1 >= 0 && r1 < 1, `next() in [0,1): ${r1.toFixed(3)}`);

    const r2 = rng.nextInt(1, 10);
    assert(r2 >= 1 && r2 <= 10, `nextInt(1,10): ${r2}`);

    const r3 = rng.nextFloat(0, 100);
    assert(r3 >= 0 && r3 < 100, `nextFloat(0,100): ${r3.toFixed(2)}`);

    const r4 = rng.nextBool();
    assert(typeof r4 === 'boolean', `nextBool(): ${r4}`);

    const r5 = rng.nextBool(0.9);
    assert(typeof r5 === 'boolean', `nextBool(0.9): ${r5}`);

    // 6. Deterministic
    section('6. Deterministic Sequences');
    const rng1 = createSeededRandom(42);
    const rng2 = createSeededRandom(42);
    const seq1 = [rng1.next(), rng1.next(), rng1.next()];
    const seq2 = [rng2.next(), rng2.next(), rng2.next()];
    assert(seq1[0] === seq2[0] && seq1[1] === seq2[1] && seq1[2] === seq2[2],
        'Same seed produces same sequence');

    // 7. Distributions
    section('7. Distribution Methods');
    const rngDist = createSeededRandom(42);

    const gauss = rngDist.nextGaussian();
    assert(typeof gauss === 'number', `nextGaussian(): ${gauss.toFixed(3)}`);

    const gauss2 = rngDist.nextGaussian(100, 15);
    assert(typeof gauss2 === 'number', `nextGaussian(100,15): ${gauss2.toFixed(1)}`);

    const exp = rngDist.nextExponential();
    assert(exp >= 0, `nextExponential(): ${exp.toFixed(3)}`);

    // 8. Geometry Methods
    section('8. Geometry Methods');
    const rngGeo = createSeededRandom(42);

    const pointCircle = rngGeo.nextPointInCircle(50);
    assert(pointCircle.x !== undefined && pointCircle.y !== undefined,
        `nextPointInCircle: (${pointCircle.x.toFixed(1)}, ${pointCircle.y.toFixed(1)})`);

    const pointOnCircle = rngGeo.nextPointOnCircle(50);
    const dist = Math.sqrt(pointOnCircle.x ** 2 + pointOnCircle.y ** 2);
    assert(Math.abs(dist - 50) < 0.01, `nextPointOnCircle radius ~50: ${dist.toFixed(2)}`);

    const dir = rngGeo.nextDirection2D();
    const len = Math.sqrt(dir.x ** 2 + dir.y ** 2);
    assert(Math.abs(len - 1) < 0.01, `nextDirection2D length ~1: ${len.toFixed(3)}`);

    // 9. Weighted Random
    section('9. createWeightedRandom()');
    const rngW = createSeededRandom(42);
    const loot = createWeightedRandom([
        { value: 'common', weight: 60 },
        { value: 'rare', weight: 30 },
        { value: 'epic', weight: 10 }
    ]);

    assert(loot.size === 3, 'Has 3 items');
    assert(loot.totalWeight === 100, 'Total weight is 100');
    assert(loot.getProbability(0) === 0.6, 'Common probability is 0.6');

    const picked = loot.pick(rngW);
    assert(['common', 'rare', 'epic'].includes(picked), `Picked: ${picked}`);

    // 10. Shuffle
    section('10. shuffle() / shuffleCopy()');
    const rngS = createSeededRandom(42);
    const arr = [1, 2, 3, 4, 5];
    const copy = shuffleCopy(arr, rngS);
    assert(copy.length === 5, 'Shuffled copy has same length');
    assert(arr[0] === 1, 'Original unchanged');

    shuffle(arr, rngS);
    assert(arr.length === 5, 'In-place shuffle preserves length');

    // 11. pickOne
    section('11. pickOne()');
    const rngP = createSeededRandom(42);
    const items = ['a', 'b', 'c', 'd'];
    const picked2 = pickOne(items, rngP);
    assert(items.includes(picked2), `Picked: ${picked2}`);

    // 12. sample
    section('12. sample() / sampleWithReplacement()');
    const rngSamp = createSeededRandom(42);
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const sampled = sample(nums, 3, rngSamp);
    assert(sampled.length === 3, 'Sampled 3 items');
    assert(new Set(sampled).size === 3, 'All unique');

    const withRep = sampleWithReplacement(nums, 5, rngSamp);
    assert(withRep.length === 5, 'Sampled 5 with replacement');

    // 13. weightedPick
    section('13. weightedPick() / weightedPickFromMap()');
    const rngWP = createSeededRandom(42);
    const item = weightedPick([
        { value: 'a', weight: 1 },
        { value: 'b', weight: 2 }
    ], rngWP);
    assert(['a', 'b'].includes(item), `weightedPick: ${item}`);

    const item2 = weightedPickFromMap({
        'common': 60,
        'rare': 30
    }, rngWP);
    assert(['common', 'rare'].includes(item2), `weightedPickFromMap: ${item2}`);

    // 14. Reset
    section('14. reset()');
    const rngReset = createSeededRandom(42);
    const first = rngReset.next();
    rngReset.next();
    rngReset.next();
    rngReset.reset();
    const afterReset = rngReset.next();
    assert(first === afterReset, 'Reset restores initial state');

    console.log('\n═══════════════════════════════════════');
    console.log('  Procgen Demo: ALL TESTS PASSED ✓');
    console.log('═══════════════════════════════════════\n');
}

runProcgenDemo().catch(console.error);
