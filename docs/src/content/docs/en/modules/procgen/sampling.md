---
title: "Sampling Utilities"
description: "Weighted random, shuffle, and sampling functions"
---

## Weighted Random API

### WeightedRandom

Precomputed cumulative weights for efficient selection:

```typescript
import { createWeightedRandom } from '@esengine/procgen';

const selector = createWeightedRandom([
    { value: 'apple',  weight: 5 },
    { value: 'banana', weight: 3 },
    { value: 'cherry', weight: 2 }
]);

// Use with seeded random
const result = selector.pick(rng);

// Use with Math.random
const result2 = selector.pickRandom();

// Get probability
console.log(selector.getProbability(0)); // 0.5 (5/10)
console.log(selector.size);              // 3
console.log(selector.totalWeight);       // 10
```

### Convenience Functions

```typescript
import { weightedPick, weightedPickFromMap } from '@esengine/procgen';

// Pick from array
const item = weightedPick([
    { value: 'a', weight: 1 },
    { value: 'b', weight: 2 }
], rng);

// Pick from object
const item2 = weightedPickFromMap({
    'common': 60,
    'rare': 30,
    'epic': 10
}, rng);
```

## Shuffle API

### shuffle / shuffleCopy

Fisher-Yates shuffle algorithm:

```typescript
import { shuffle, shuffleCopy } from '@esengine/procgen';

const arr = [1, 2, 3, 4, 5];

// In-place shuffle
shuffle(arr, rng);

// Create shuffled copy (original unchanged)
const shuffled = shuffleCopy(arr, rng);
```

### pickOne

Randomly select one element:

```typescript
import { pickOne } from '@esengine/procgen';

const items = ['a', 'b', 'c', 'd'];
const item = pickOne(items, rng);
```

## Sampling API

### sample / sampleWithReplacement

```typescript
import { sample, sampleWithReplacement } from '@esengine/procgen';

const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Sample 3 unique elements
const unique = sample(arr, 3, rng);

// Sample 5 (with possible repeats)
const withRep = sampleWithReplacement(arr, 5, rng);
```

### randomIntegers

Generate random integer array within range:

```typescript
import { randomIntegers } from '@esengine/procgen';

// 5 unique random integers from 1-100
const nums = randomIntegers(1, 100, 5, rng);
```

### weightedSample

Sample by weight (no replacement):

```typescript
import { weightedSample } from '@esengine/procgen';

const items = ['A', 'B', 'C', 'D', 'E'];
const weights = [10, 8, 6, 4, 2];

// Select 3 by weight
const selected = weightedSample(items, weights, 3, rng);
```

## Performance Tips

```typescript
// Good: Create once, use many times
const selector = createWeightedRandom(items);
for (let i = 0; i < 1000; i++) {
    selector.pick(rng);
}

// Bad: Create every time
for (let i = 0; i < 1000; i++) {
    weightedPick(items, rng);
}
```
