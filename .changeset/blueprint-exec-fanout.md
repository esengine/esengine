---
"@esengine/blueprint": patch
---

Fix exec flow control: an exec output pin wired to several nodes now runs all of them.

- `BlueprintVM` followed only the *first* connection on an exec output pin, so fanning `Event Begin Play` (or any exec pin) out to N nodes silently executed one of them and dropped the rest, with no error. Every connection is now followed in connection order, and each branch runs its whole downstream chain before the next branch starts — the same semantics as `Sequence`. A `Delay` or an error in one branch no longer prevents its sibling branches from running.
- `Sequence` fired one `Then` pin per trigger instead of all of them in order, and `then3` never fired at all. It now triggers every connected `Then` pin in order on a single execution, via the new `ExecutionResult.nextExecs`.
- Stateful flow nodes (`Sequence`, `Do Once`, `Flip Flop`, `Gate`, `For Loop`) kept their state as executor instance fields. Executors are registered as one shared instance per node type, so all nodes of the same type — across every blueprint on every entity — shared one counter: a second `Do Once` in the same graph could never fire. State now lives per node on the execution context via `ExecutionContext.getNodeState()`, and is reset when the blueprint restarts.
- The VM now records the exec input pin a node was entered through, so `Do Once`'s `Reset` and `Gate`'s `Open` / `Close` / `Toggle` pins work — they read `_lastInputPin`, which nothing had ever written.
