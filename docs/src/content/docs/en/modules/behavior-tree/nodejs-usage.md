---
title: "Node.js Server Usage"
description: "Using behavior trees in server-side applications"
---

## Use Cases

- Game server AI (NPCs, enemies)
- Chatbots and conversational AI
- Task automation and workflows
- Decision-making systems

## Setup

```bash
npm install @esengine/behavior-tree @esengine/ecs-framework
```

## Basic Server Setup

```typescript
import { Core, Scene } from '@esengine/ecs-framework';
import { BehaviorTreePlugin, BehaviorTreeBuilder, BehaviorTreeStarter } from '@esengine/behavior-tree';

async function initializeAI() {
    Core.create();
    const plugin = new BehaviorTreePlugin();
    await Core.installPlugin(plugin);

    const scene = new Scene();
    plugin.setupScene(scene);
    Core.setScene(scene);

    return scene;
}

// Game loop
function startGameLoop(scene: Scene) {
    const TICK_RATE = 20; // 20 ticks per second
    const TICK_INTERVAL = 1000 / TICK_RATE;

    setInterval(() => {
        scene.update(TICK_INTERVAL);
    }, TICK_INTERVAL);
}
```

## NPC AI Example

```typescript
const npcAI = BehaviorTreeBuilder.create('NPCAI')
    .defineBlackboardVariable('playerId', null)
    .defineBlackboardVariable('questState', 'idle')

    .selector('MainBehavior')
        // Handle combat
        .sequence('Combat')
            .condition('isUnderAttack')
            .action('defendSelf')
        .end()

        // Handle quests
        .sequence('QuestInteraction')
            .condition('playerNearby')
            .action('checkQuestState')
            .selector('QuestActions')
                .sequence('GiveQuest')
                    .blackboardCompare('questState', 'idle', 'equals')
                    .action('offerQuest')
                .end()
                .sequence('CompleteQuest')
                    .blackboardCompare('questState', 'complete', 'equals')
                    .action('giveReward')
                .end()
            .end()
        .end()

        // Default idle
        .action('idle')
    .end()
    .build();
```

## Chatbot Example

```typescript
const chatbotAI = BehaviorTreeBuilder.create('ChatbotAI')
    .defineBlackboardVariable('userInput', '')
    .defineBlackboardVariable('context', {})

    .selector('ProcessInput')
        // Handle greetings
        .sequence('Greeting')
            .condition('isGreeting')
            .action('respondWithGreeting')
        .end()

        // Handle questions
        .sequence('Question')
            .condition('isQuestion')
            .action('searchKnowledgeBase')
            .action('generateAnswer')
        .end()

        // Handle commands
        .sequence('Command')
            .condition('isCommand')
            .action('executeCommand')
        .end()

        // Fallback
        .action('respondWithFallback')
    .end()
    .build();

// Process message
function handleMessage(userId: string, message: string) {
    const entity = getOrCreateUserEntity(userId);
    const runtime = entity.getComponent(BehaviorTreeRuntimeComponent);

    runtime.setBlackboardValue('userInput', message);
    scene.update(0); // Process immediately

    return runtime.getBlackboardValue('response');
}
```

## Server Integration

### Express.js

```typescript
import express from 'express';

const app = express();
app.use(express.json());

app.post('/api/ai/process', (req, res) => {
    const { entityId, action, data } = req.body;

    const entity = scene.findEntityById(entityId);
    if (!entity) {
        return res.status(404).json({ error: 'Entity not found' });
    }

    const runtime = entity.getComponent(BehaviorTreeRuntimeComponent);
    runtime.setBlackboardValue('action', action);
    runtime.setBlackboardValue('data', data);

    scene.update(0);

    const result = runtime.getBlackboardValue('result');
    res.json({ result });
});
```

### WebSocket

```typescript
import { WebSocket } from 'ws';

wss.on('connection', (ws) => {
    const entity = scene.createEntity('Player');
    BehaviorTreeStarter.start(entity, playerAI);

    ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        const runtime = entity.getComponent(BehaviorTreeRuntimeComponent);
        runtime.setBlackboardValue('input', message);
    });

    ws.on('close', () => {
        entity.destroy();
    });
});
```

## Performance Tips

1. **Batch updates** - Process multiple entities per tick
2. **Adjust tick rate** - Use lower rates for less time-critical AI
3. **Pool entities** - Reuse entities instead of creating/destroying
4. **Profile** - Monitor CPU usage and optimize hot paths
