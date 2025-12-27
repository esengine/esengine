---
title: "实际示例"
description: "技能冷却、DOT 效果、BUFF 系统等场景"
---

## 技能冷却系统

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

        // 检查冷却
        if (!this.timerService.isCooldownReady(skillId)) {
            const remaining = this.timerService.getCooldownRemaining(skillId);
            console.log(`技能 ${skillId} 冷却中，剩余 ${remaining}ms`);
            return false;
        }

        // 使用技能
        this.executeSkill(skill);

        // 开始冷却
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

## 延迟和定时效果

```typescript
class EffectSystem {
    private timerService: ITimerService;

    constructor(timerService: ITimerService) {
        this.timerService = timerService;
    }

    // 延迟爆炸
    scheduleExplosion(position: { x: number; y: number }, delay: number): void {
        this.timerService.schedule(`explosion_${Date.now()}`, delay, () => {
            this.createExplosion(position);
        });
    }

    // DOT 伤害（每秒造成伤害）
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

    // BUFF 效果（持续一段时间）
    applyBuff(target: Entity, buffId: string, duration: number): void {
        target.addBuff(buffId);

        this.timerService.schedule(`buff_expire_${buffId}`, duration, () => {
            target.removeBuff(buffId);
        });
    }
}
```

## 技能连击系统

```typescript
class ComboSystem {
    private timerService: ITimerService;
    private comboCount = 0;
    private comboWindowId = 'combo_window';

    constructor(timerService: ITimerService) {
        this.timerService = timerService;
    }

    onAttack(): void {
        // 增加连击计数
        this.comboCount++;

        // 取消之前的连击窗口
        this.timerService.cancelById(this.comboWindowId);

        // 开启新的连击窗口（2秒内无操作则重置）
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

## 自动保存系统

```typescript
class AutoSaveSystem {
    private timerService: ITimerService;

    constructor(timerService: ITimerService) {
        this.timerService = timerService;
        this.startAutoSave();
    }

    private startAutoSave(): void {
        // 每 5 分钟自动保存
        this.timerService.scheduleRepeating('autosave', 5 * 60 * 1000, () => {
            this.saveGame();
            console.log('Game auto-saved');
        });
    }

    private saveGame(): void {
        // 保存逻辑
    }

    stopAutoSave(): void {
        this.timerService.cancelById('autosave');
    }
}
```

## 技能蓄力系统

```typescript
class ChargeSkillSystem {
    private timerService: ITimerService;
    private chargeStartTime = 0;
    private maxChargeTime = 3000; // 3秒最大蓄力

    constructor(timerService: ITimerService) {
        this.timerService = timerService;
    }

    startCharge(): void {
        this.chargeStartTime = performance.now();

        // 蓄力满时自动释放
        this.timerService.schedule('charge_complete', this.maxChargeTime, () => {
            this.releaseSkill();
        });
    }

    releaseSkill(): void {
        this.timerService.cancelById('charge_complete');

        const chargeTime = performance.now() - this.chargeStartTime;
        const chargePercent = Math.min(chargeTime / this.maxChargeTime, 1);

        const damage = 100 + chargePercent * 200; // 100-300 伤害
        console.log(`Release skill with ${damage} damage (${(chargePercent * 100).toFixed(0)}% charge)`);
    }
}
```

## 任务计时器

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

        // 显示剩余时间的 UI 更新
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
        // 更新 UI
    }
}
```
