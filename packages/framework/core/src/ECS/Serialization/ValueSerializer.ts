/**
 * 值序列化器
 *
 * Value serializer with circular reference detection and extensible type handlers.
 */

export type PrimitiveValue = string | number | boolean | null | undefined;

export type SerializableValue =
    | PrimitiveValue
    | SerializableValue[]
    | { readonly [key: string]: SerializableValue }
    | { readonly __type: string; readonly value: unknown };

type Serializer<T> = (value: T, serialize: (v: unknown) => SerializableValue) => SerializableValue;
type Deserializer<T> = (data: { __type: string; value: unknown }) => T;

interface TypeDef<T = unknown> {
    check: (value: unknown) => value is T;
    serialize: Serializer<T>;
    deserialize: Deserializer<T>;
}

const types = new Map<string, TypeDef>();

function registerType<T>(name: string, def: TypeDef<T>): void {
    types.set(name, def as TypeDef);
}

// 内置类型
registerType<Date>('Date', {
    check: (v): v is Date => v instanceof Date,
    serialize: (v) => ({ __type: 'Date', value: v.toISOString() }),
    deserialize: (d) => new Date(d.value as string)
});

registerType<Map<unknown, unknown>>('Map', {
    check: (v): v is Map<unknown, unknown> => v instanceof Map,
    serialize: (v, ser) => ({ __type: 'Map', value: [...v].map(([k, val]) => [ser(k), ser(val)]) }),
    deserialize: (d) => new Map(d.value as Array<[unknown, unknown]>)
});

registerType<Set<unknown>>('Set', {
    check: (v): v is Set<unknown> => v instanceof Set,
    serialize: (v, ser) => ({ __type: 'Set', value: [...v].map(ser) }),
    deserialize: (d) => new Set(d.value as unknown[])
});

function serialize(value: unknown, seen = new WeakSet<object>()): SerializableValue {
    if (value == null) return value as null | undefined;

    const t = typeof value;
    if (t === 'string' || t === 'number' || t === 'boolean') return value as PrimitiveValue;
    if (t === 'function') return undefined;

    const obj = value as object;
    if (seen.has(obj)) return undefined;
    seen.add(obj);

    for (const [, def] of types) {
        if (def.check(value)) {
            return def.serialize(value, (v) => serialize(v, seen));
        }
    }

    if (Array.isArray(value)) {
        return value.map((v) => serialize(v, seen));
    }

    const result: Record<string, SerializableValue> = {};
    for (const k of Object.keys(value as object)) {
        result[k] = serialize((value as Record<string, unknown>)[k], seen);
    }
    return result;
}

function deserialize(value: SerializableValue): unknown {
    if (value == null) return value;

    const t = typeof value;
    if (t === 'string' || t === 'number' || t === 'boolean') return value;

    if (isTypedValue(value)) {
        const def = types.get(value.__type);
        return def ? def.deserialize(value) : value;
    }

    if (Array.isArray(value)) {
        return value.map(deserialize);
    }

    const result: Record<string, unknown> = {};
    for (const k of Object.keys(value)) {
        result[k] = deserialize((value as Record<string, SerializableValue>)[k]);
    }
    return result;
}

function isTypedValue(v: unknown): v is { __type: string; value: unknown } {
    if (v === null || typeof v !== 'object') {
        return false;
    }
    return '__type' in v;
}

export const ValueSerializer = {
    serialize,
    deserialize,
    register: registerType
} as const;

export type { TypeDef as TypeHandler };
export type TypedValue = { readonly __type: string; readonly value: unknown };
