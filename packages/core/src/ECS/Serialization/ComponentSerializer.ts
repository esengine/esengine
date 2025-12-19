/**
 * 组件序列化器
 *
 * Component serializer for ECS components.
 */

import { Component } from '../Component';
import { ComponentType } from '../Core/ComponentStorage';
import { getComponentTypeName, isEntityRefProperty } from '../Decorators';
import { getSerializationMetadata } from './SerializationDecorators';
import { ValueSerializer, SerializableValue } from './ValueSerializer';
import type { Entity } from '../Entity';
import type { SerializationContext, SerializedEntityRef } from './SerializationContext';

export type { SerializableValue } from './ValueSerializer';

export interface SerializedComponent {
    type: string;
    version: number;
    data: Record<string, SerializableValue>;
}

export class ComponentSerializer {
    static serialize(component: Component): SerializedComponent | null {
        const metadata = getSerializationMetadata(component);
        if (!metadata) return null;

        const componentType = component.constructor as ComponentType;
        const typeName = metadata.options.typeId || getComponentTypeName(componentType);
        const data: Record<string, SerializableValue> = {};

        for (const [fieldName, options] of metadata.fields) {
            if (metadata.ignoredFields.has(fieldName)) continue;

            const fieldKey = typeof fieldName === 'symbol' ? fieldName.toString() : fieldName;
            const value = (component as unknown as Record<string | symbol, unknown>)[fieldName];

            let serializedValue: SerializableValue;
            if (isEntityRefProperty(component, fieldKey)) {
                serializedValue = this.serializeEntityRef(value as Entity | null);
            } else if (options.serializer) {
                serializedValue = options.serializer(value);
            } else {
                serializedValue = ValueSerializer.serialize(value);
            }

            data[options.alias || fieldKey] = serializedValue;
        }

        return { type: typeName, version: metadata.options.version, data };
    }

    static deserialize(
        serializedData: SerializedComponent,
        componentRegistry: Map<string, ComponentType>,
        context?: SerializationContext
    ): Component | null {
        const componentClass = componentRegistry.get(serializedData.type);
        if (!componentClass) {
            console.warn(`Component type not found: ${serializedData.type}`);
            return null;
        }

        const metadata = getSerializationMetadata(componentClass);
        if (!metadata) {
            console.warn(`Component ${serializedData.type} is not serializable`);
            return null;
        }

        const component = new componentClass();

        for (const [fieldName, options] of metadata.fields) {
            const fieldKey = typeof fieldName === 'symbol' ? fieldName.toString() : fieldName;
            const key = options.alias || fieldKey;
            const serializedValue = serializedData.data[key];

            if (serializedValue === undefined) continue;

            if (this.isSerializedEntityRef(serializedValue)) {
                if (context) {
                    const ref = serializedValue.__entityRef;
                    context.registerPendingRef(component, fieldKey, ref.id, ref.guid);
                }
                (component as unknown as Record<string | symbol, unknown>)[fieldName] = null;
                continue;
            }

            const value = options.deserializer
                ? options.deserializer(serializedValue)
                : ValueSerializer.deserialize(serializedValue);

            (component as unknown as Record<string | symbol, unknown>)[fieldName] = value;
        }

        return component;
    }

    static serializeComponents(components: Component[]): SerializedComponent[] {
        return components
            .map(c => this.serialize(c))
            .filter((s): s is SerializedComponent => s !== null);
    }

    static deserializeComponents(
        serializedComponents: SerializedComponent[],
        componentRegistry: Map<string, ComponentType>,
        context?: SerializationContext
    ): Component[] {
        return serializedComponents
            .map(s => this.deserialize(s, componentRegistry, context))
            .filter((c): c is Component => c !== null);
    }

    static validateVersion(serializedData: SerializedComponent, expectedVersion: number): boolean {
        return serializedData.version === expectedVersion;
    }

    static getSerializationInfo(component: Component | ComponentType): {
        type: string;
        version: number;
        fields: string[];
        ignoredFields: string[];
        isSerializable: boolean;
    } {
        const metadata = getSerializationMetadata(component);
        if (!metadata) {
            return { type: 'unknown', version: 0, fields: [], ignoredFields: [], isSerializable: false };
        }

        const componentType = typeof component === 'function'
            ? component
            : (component.constructor as ComponentType);

        return {
            type: metadata.options.typeId || getComponentTypeName(componentType),
            version: metadata.options.version,
            fields: Array.from(metadata.fields.keys()).map(k => typeof k === 'symbol' ? k.toString() : k),
            ignoredFields: Array.from(metadata.ignoredFields).map(k => typeof k === 'symbol' ? k.toString() : k),
            isSerializable: true
        };
    }

    static serializeEntityRef(entity: Entity | null): SerializableValue {
        if (!entity) return null;
        return { __entityRef: { id: entity.id, guid: entity.persistentId } };
    }

    static isSerializedEntityRef(value: unknown): value is { __entityRef: SerializedEntityRef } {
        return typeof value === 'object' && value !== null && '__entityRef' in value;
    }
}
