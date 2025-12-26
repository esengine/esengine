/**
 * Timer Module Demo - Tests APIs from docs/modules/timer/index.md
 */

import { createTimerService } from '@esengine/timer';

function assert(condition: boolean, message: string): void {
    if (!condition) throw new Error(`FAILED: ${message}`);
    console.log(`  ✓ ${message}`);
}

function section(name: string): void {
    console.log(`\n▶ ${name}`);
}

export async function runTimerDemo(): Promise<void> {
    console.log('═══════════════════════════════════════');
    console.log('       Timer Module Demo');
    console.log('═══════════════════════════════════════');

    // 1. Basic Creation
    section('1. createTimerService()');
    const timerService = createTimerService();
    assert(timerService !== null, 'Service created');
    assert(timerService.activeTimerCount === 0, 'Initial timer count is 0');
    assert(timerService.activeCooldownCount === 0, 'Initial cooldown count is 0');

    // 2. One-shot Timer
    section('2. schedule() - One-shot Timer');
    let fired = false;
    const handle = timerService.schedule('test', 100, () => { fired = true; });
    assert(handle.id === 'test', 'Handle.id correct');
    assert(handle.isValid === true, 'Handle.isValid is true');
    assert(timerService.hasTimer('test'), 'hasTimer() returns true');

    timerService.update(50);
    assert(!fired, 'Timer not fired at 50ms');
    timerService.update(60);
    assert(fired, 'Timer fired after 110ms');
    assert(!timerService.hasTimer('test'), 'Timer removed after firing');

    // 3. Repeating Timer
    section('3. scheduleRepeating()');
    let count = 0;
    timerService.scheduleRepeating('repeat', 50, () => { count++; });
    timerService.update(50);
    assert(count === 1, 'Fires once at 50ms');
    timerService.update(50);
    assert(count === 2, 'Fires twice at 100ms');
    timerService.cancelById('repeat');
    timerService.update(100);
    assert(count === 2, 'Stopped after cancel');

    // 4. Timer Cancellation
    section('4. cancel()');
    let cancelled = false;
    const h = timerService.schedule('cancel', 1000, () => { cancelled = true; });
    h.cancel();
    assert(!h.isValid, 'Handle invalid after cancel');
    timerService.update(2000);
    assert(!cancelled, 'Cancelled timer does not fire');

    // 5. Timer Info
    section('5. getTimerInfo()');
    timerService.schedule('info', 500, () => {});
    const info = timerService.getTimerInfo('info');
    assert(info !== null, 'Returns info object');
    assert(info!.id === 'info', 'Info.id correct');
    assert(info!.repeating === false, 'Info.repeating is false');
    timerService.cancelById('info');

    // 6. Cooldown System
    section('6. Cooldown API');
    timerService.startCooldown('skill', 200);
    assert(!timerService.isCooldownReady('skill'), 'Not ready initially');
    assert(timerService.isOnCooldown('skill'), 'isOnCooldown true');

    timerService.update(100);
    const progress = timerService.getCooldownProgress('skill');
    assert(progress >= 0.4 && progress <= 0.6, `Progress ~0.5 (got ${progress.toFixed(2)})`);

    timerService.update(150);
    assert(timerService.isCooldownReady('skill'), 'Ready after duration');

    // 7. Cooldown Info
    section('7. getCooldownInfo()');
    timerService.startCooldown('cd', 300);
    timerService.update(150);
    const cdInfo = timerService.getCooldownInfo('cd');
    assert(cdInfo !== null, 'Returns cooldown info');
    assert(cdInfo!.duration === 300, 'Duration is 300');
    assert(!cdInfo!.isReady, 'isReady is false');

    // 8. Reset Cooldown
    section('8. resetCooldown()');
    timerService.startCooldown('reset', 500);
    timerService.update(100);
    timerService.resetCooldown('reset');
    assert(timerService.isCooldownReady('reset'), 'Ready after reset');

    // 9. Clear All
    section('9. clear()');
    timerService.schedule('t1', 1000, () => {});
    timerService.startCooldown('c1', 1000);
    timerService.clear();
    assert(timerService.activeTimerCount === 0, 'Timers cleared');
    assert(timerService.activeCooldownCount === 0, 'Cooldowns cleared');

    // 10. Config Options
    section('10. Config Options');
    const limited = createTimerService({ maxTimers: 2, maxCooldowns: 1 });
    assert(limited !== null, 'Created with config');

    console.log('\n═══════════════════════════════════════');
    console.log('  Timer Demo: ALL TESTS PASSED ✓');
    console.log('═══════════════════════════════════════\n');
}

runTimerDemo().catch(console.error);
