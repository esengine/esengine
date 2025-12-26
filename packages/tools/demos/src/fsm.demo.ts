/**
 * FSM Module Demo - Tests APIs from docs/modules/fsm/index.md
 */

import { createStateMachine } from '@esengine/fsm';

function assert(condition: boolean, message: string): void {
    if (!condition) throw new Error(`FAILED: ${message}`);
    console.log(`  ✓ ${message}`);
}

function section(name: string): void {
    console.log(`\n▶ ${name}`);
}

type PlayerState = 'idle' | 'walk' | 'run' | 'jump';

export async function runFSMDemo(): Promise<void> {
    console.log('═══════════════════════════════════════');
    console.log('        FSM Module Demo');
    console.log('═══════════════════════════════════════');

    // 1. Basic Creation
    section('1. createStateMachine()');
    const fsm = createStateMachine<PlayerState>('idle');
    assert(fsm !== null, 'State machine created');
    assert(fsm.current === 'idle', 'Initial state is idle');

    // 2. Define States
    section('2. defineState()');
    let enterCalled = false;
    let exitCalled = false;
    let updateCalled = false;

    fsm.defineState('idle', {
        onEnter: () => { enterCalled = true; },
        onExit: () => { exitCalled = true; },
        onUpdate: () => { updateCalled = true; }
    });
    fsm.defineState('walk', {});
    fsm.defineState('run', {});
    fsm.defineState('jump', {});

    assert(fsm.hasState('idle'), 'hasState() returns true');
    assert(fsm.hasState('walk'), 'walk state exists');

    // 3. Manual Transition
    section('3. transition()');
    fsm.transition('walk');
    assert(fsm.current === 'walk', 'Transitioned to walk');
    assert(exitCalled, 'onExit called on idle');
    assert(fsm.previous === 'idle', 'previous is idle');

    // 4. State with Context
    section('4. Context Support');
    interface Context {
        speed: number;
        isMoving: boolean;
    }
    const fsmCtx = createStateMachine<PlayerState, Context>('idle', {
        context: { speed: 0, isMoving: false }
    });
    fsmCtx.defineState('idle', {
        onEnter: (ctx) => { ctx.speed = 0; }
    });
    fsmCtx.defineState('walk', {
        onEnter: (ctx) => { ctx.speed = 100; }
    });

    fsmCtx.transition('walk');
    assert(fsmCtx.context.speed === 100, 'Context updated on enter');

    // 5. Transition Conditions
    section('5. defineTransition() with conditions');
    const fsmTrans = createStateMachine<PlayerState, Context>('idle', {
        context: { speed: 0, isMoving: false }
    });
    fsmTrans.defineState('idle', {});
    fsmTrans.defineState('walk', {});

    fsmTrans.defineTransition('idle', 'walk', (ctx) => ctx.isMoving);

    fsmTrans.evaluateTransitions();
    assert(fsmTrans.current === 'idle', 'No transition when condition false');

    fsmTrans.context.isMoving = true;
    fsmTrans.evaluateTransitions();
    assert(fsmTrans.current === 'walk', 'Transitions when condition true');

    // 6. Transition Priority
    section('6. Transition Priority');
    const fsmPri = createStateMachine<'a' | 'b' | 'c'>('a');
    fsmPri.defineState('a', {});
    fsmPri.defineState('b', {});
    fsmPri.defineState('c', {});

    fsmPri.defineTransition('a', 'b', () => true, 1);
    fsmPri.defineTransition('a', 'c', () => true, 10);

    fsmPri.evaluateTransitions();
    assert(fsmPri.current === 'c', 'Higher priority (10) wins');

    // 7. Update
    section('7. update()');
    const fsmUpdate = createStateMachine<PlayerState>('idle');
    let updateCount = 0;
    fsmUpdate.defineState('idle', {
        onUpdate: () => { updateCount++; }
    });
    fsmUpdate.update(16);
    fsmUpdate.update(16);
    assert(updateCount === 2, 'onUpdate called on each update');

    // 8. Event Listeners
    section('8. Event Listeners');
    const fsmEvents = createStateMachine<PlayerState>('idle');
    fsmEvents.defineState('idle', {});
    fsmEvents.defineState('walk', {});

    let enterEvent = false;
    let exitEvent = false;
    let changeEvent = false;

    fsmEvents.onEnter('walk', () => { enterEvent = true; });
    fsmEvents.onExit('idle', () => { exitEvent = true; });
    fsmEvents.onChange(() => { changeEvent = true; });

    fsmEvents.transition('walk');
    assert(enterEvent, 'onEnter listener called');
    assert(exitEvent, 'onExit listener called');
    assert(changeEvent, 'onChange listener called');

    // 9. getStates / getTransitionsFrom
    section('9. Query Methods');
    const states = fsmEvents.getStates();
    assert(states.length >= 2, 'getStates() returns states');

    // 10. canTransition
    section('10. canTransition()');
    const fsmCan = createStateMachine<PlayerState, Context>('idle', {
        context: { speed: 0, isMoving: false }
    });
    fsmCan.defineState('idle', {});
    fsmCan.defineState('walk', {});
    fsmCan.defineTransition('idle', 'walk', (ctx) => ctx.isMoving);

    assert(!fsmCan.canTransition('walk'), 'Cannot transition when condition false');
    fsmCan.context.isMoving = true;
    assert(fsmCan.canTransition('walk'), 'Can transition when condition true');

    // 11. Reset
    section('11. reset()');
    fsmCan.transition('walk');
    fsmCan.reset('idle');
    assert(fsmCan.current === 'idle', 'Reset to idle');

    // 12. History
    section('12. getHistory()');
    const fsmHist = createStateMachine<PlayerState>('idle', { enableHistory: true });
    fsmHist.defineState('idle', {});
    fsmHist.defineState('walk', {});
    fsmHist.defineState('run', {});

    fsmHist.transition('walk');
    fsmHist.transition('run');

    const history = fsmHist.getHistory();
    assert(history.length >= 2, 'History recorded');

    console.log('\n═══════════════════════════════════════');
    console.log('  FSM Demo: ALL TESTS PASSED ✓');
    console.log('═══════════════════════════════════════\n');
}

runFSMDemo().catch(console.error);
