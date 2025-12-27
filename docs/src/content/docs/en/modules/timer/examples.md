---
title: "Examples"
description: "Skill cooldowns, DOT effects, buff systems and more"
---

## Skill Cooldown System

```typescript
import { createTimerService, type ITimerService } from '@esengine/timer';

class SkillSystem {
    private timerService: ITimerService;
    private skills: Map<string, SkillData> = new Map();

    constructor() {
        this.timerService = createTimerService();
    }

    registerSkill(id: string, data: SkillData): void {
        this.skills.set(id, data);
    }

    useSkill(skillId: string): boolean {
        const skill = this.skills.get(skillId);
        if (!skill) return false;

        // Check cooldown
        if (!this.timerService.isCooldownReady(skillId)) {
            const remaining = this.timerService.getCooldownRemaining(skillId);
            console.log(`Skill ${skillId} on cooldown, ${remaining}ms remaining`);
            return false;
        }

        // Use skill
        this.executeSkill(skill);

        // Start cooldown
        this.timerService.startCooldown(skillId, skill.cooldown);
        return true;
    }

    getSkillCooldownProgress(skillId: string): number {
        return this.timerService.getCooldownProgress(skillId);
    }

    update(dt: number): void {
        this.timerService.update(dt);
    }
}

interface SkillData {
    cooldown: number;
    // ... other properties
}
```

## Delayed and Timed Effects

```typescript
class EffectSystem {
    private timerService: ITimerService;

    constructor(timerService: ITimerService) {
        this.timerService = timerService;
    }

    // Delayed explosion
    scheduleExplosion(position: { x: number; y: number }, delay: number): void {
        this.timerService.schedule(`explosion_${Date.now()}`, delay, () => {
            this.createExplosion(position);
        });
    }

    // DOT damage (damage every second)
    applyDOT(target: Entity, damage: number, duration: number): void {
        const dotId = `dot_${target.id}_${Date.now()}`;
        let elapsed = 0;

        this.timerService.scheduleRepeating(dotId, 1000, () => {
            elapsed += 1000;
            target.takeDamage(damage);

            if (elapsed >= duration) {
                this.timerService.cancelById(dotId);
            }
        });
    }

    // BUFF effect (lasts for a duration)
    applyBuff(target: Entity, buffId: string, duration: number): void {
        target.addBuff(buffId);

        this.timerService.schedule(`buff_expire_${buffId}`, duration, () => {
            target.removeBuff(buffId);
        });
    }
}
```

## Combo System

```typescript
class ComboSystem {
    private timerService: ITimerService;
    private comboCount = 0;
    private comboWindowId = 'combo_window';

    constructor(timerService: ITimerService) {
        this.timerService = timerService;
    }

    onAttack(): void {
        // Increase combo count
        this.comboCount++;

        // Cancel previous combo window
        this.timerService.cancelById(this.comboWindowId);

        // Start new combo window (reset if no action within 2 seconds)
        this.timerService.schedule(this.comboWindowId, 2000, () => {
            this.comboCount = 0;
            console.log('Combo reset');
        });

        console.log(`Combo: ${this.comboCount}x`);
    }

    getComboMultiplier(): number {
        return 1 + this.comboCount * 0.1;
    }
}
```

## Auto-Save System

```typescript
class AutoSaveSystem {
    private timerService: ITimerService;

    constructor(timerService: ITimerService) {
        this.timerService = timerService;
        this.startAutoSave();
    }

    private startAutoSave(): void {
        // Auto-save every 5 minutes
        this.timerService.scheduleRepeating('autosave', 5 * 60 * 1000, () => {
            this.saveGame();
            console.log('Game auto-saved');
        });
    }

    private saveGame(): void {
        // Save logic
    }

    stopAutoSave(): void {
        this.timerService.cancelById('autosave');
    }
}
```

## Charge Skill System

```typescript
class ChargeSkillSystem {
    private timerService: ITimerService;
    private chargeStartTime = 0;
    private maxChargeTime = 3000; // 3 seconds max charge

    constructor(timerService: ITimerService) {
        this.timerService = timerService;
    }

    startCharge(): void {
        this.chargeStartTime = performance.now();

        // Auto-release when fully charged
        this.timerService.schedule('charge_complete', this.maxChargeTime, () => {
            this.releaseSkill();
        });
    }

    releaseSkill(): void {
        this.timerService.cancelById('charge_complete');

        const chargeTime = performance.now() - this.chargeStartTime;
        const chargePercent = Math.min(chargeTime / this.maxChargeTime, 1);

        const damage = 100 + chargePercent * 200; // 100-300 damage
        console.log(`Release skill with ${damage} damage (${(chargePercent * 100).toFixed(0)}% charge)`);
    }
}
```

## Quest Timer

```typescript
class QuestTimerSystem {
    private timerService: ITimerService;

    constructor(timerService: ITimerService) {
        this.timerService = timerService;
    }

    startTimedQuest(questId: string, timeLimit: number): void {
        this.timerService.schedule(`quest_${questId}_timeout`, timeLimit, () => {
            this.failQuest(questId);
        });

        // UI update for remaining time
        this.timerService.scheduleRepeating(`quest_${questId}_tick`, 1000, () => {
            const info = this.timerService.getTimerInfo(`quest_${questId}_timeout`);
            if (info) {
                this.updateQuestTimerUI(questId, info.remaining);
            }
        });
    }

    completeQuest(questId: string): void {
        this.timerService.cancelById(`quest_${questId}_timeout`);
        this.timerService.cancelById(`quest_${questId}_tick`);
        console.log(`Quest ${questId} completed!`);
    }

    private failQuest(questId: string): void {
        this.timerService.cancelById(`quest_${questId}_tick`);
        console.log(`Quest ${questId} failed - time's up!`);
    }

    private updateQuestTimerUI(questId: string, remaining: number): void {
        // Update UI
    }
}
```
