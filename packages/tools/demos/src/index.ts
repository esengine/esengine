/**
 * ESEngine Module Demos - Run all demos to verify documentation
 */

import { runTimerDemo } from './timer.demo.js';
import { runFSMDemo } from './fsm.demo.js';
import { runPathfindingDemo } from './pathfinding.demo.js';
import { runProcgenDemo } from './procgen.demo.js';
import { runSpatialDemo } from './spatial.demo.js';

async function runAllDemos(): Promise<void> {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║           ESEngine Module Documentation Tests             ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');

    const demos = [
        { name: 'Timer', fn: runTimerDemo },
        { name: 'FSM', fn: runFSMDemo },
        { name: 'Pathfinding', fn: runPathfindingDemo },
        { name: 'Procgen', fn: runProcgenDemo },
        { name: 'Spatial', fn: runSpatialDemo },
    ];

    const results: { name: string; passed: boolean; error?: string }[] = [];

    for (const demo of demos) {
        try {
            await demo.fn();
            results.push({ name: demo.name, passed: true });
        } catch (error) {
            results.push({
                name: demo.name,
                passed: false,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    // Summary
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                      Summary                              ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');

    let allPassed = true;
    for (const result of results) {
        if (result.passed) {
            console.log(`  ✓ ${result.name}: PASSED`);
        } else {
            console.log(`  ✗ ${result.name}: FAILED - ${result.error}`);
            allPassed = false;
        }
    }

    console.log('\n');
    if (allPassed) {
        console.log('  ══════════════════════════════════════');
        console.log('     ALL DOCUMENTATION TESTS PASSED ✓');
        console.log('  ══════════════════════════════════════');
    } else {
        console.log('  ══════════════════════════════════════');
        console.log('     SOME TESTS FAILED ✗');
        console.log('  ══════════════════════════════════════');
        process.exit(1);
    }
    console.log('\n');
}

runAllDemos().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
