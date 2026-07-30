---
"@esengine/node-editor": minor
---

Unify pin connection multiplicity, and show execution order on fanned-out exec pins.

- Exec input pins could only hold one connection — a second wire replaced the first — so two execution flows could not converge on the same node. Only **data inputs** are single-connection now (a pin has exactly one value source); exec inputs accept converging flows and every output fans out. This matches what the runtime actually does: `ExecutionContext.evaluateInput` reads one source per data input, while `getConnectionsFromPin` supports any number of wires on an exec pin in either direction.
- `Graph.addConnection` only consulted `allowMultiple` on the target pin, so the flag was dead on outputs — a template declaring `allowMultiple: false` on an output had no effect. It is now enforced on both ends, which also lets a template declare an exec output single-connection (Unreal-style, forcing a `Sequence` node to fan out).
- An exec output pin wired to several nodes now renders a 1-based execution order badge on each wire, numbered in the order the runtime follows them. Identical-looking wires previously gave no hint that they ran in sequence. Opt out with `ConnectionLayer`'s `showExecOrder={false}`.
