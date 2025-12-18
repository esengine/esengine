/**
 * Entity Reference Field Editor
 * 实体引用字段编辑器
 *
 * Handles editing of entity reference fields with drag-and-drop support.
 * 处理实体引用字段的编辑，支持拖放操作。
 */

import React from 'react';
import { IFieldEditor, FieldEditorProps } from '@esengine/editor-core';
import { EntityRefField } from '../../components/inspectors/fields/EntityRefField';

/**
 * Field editor for entity references (entity IDs)
 * 实体引用（实体 ID）的字段编辑器
 *
 * Supports:
 * - Drag-and-drop entities from SceneHierarchy
 * - Click to navigate to referenced entity
 * - Clear button to remove reference
 *
 * 支持：
 * - 从场景层级面板拖放实体
 * - 点击导航到引用的实体
 * - 清除按钮移除引用
 */
export class EntityRefFieldEditor implements IFieldEditor<number> {
    readonly type = 'entityRef';
    readonly name = 'Entity Reference Field Editor';
    readonly priority = 100;

    /**
     * Check if this editor can handle the given field type
     * 检查此编辑器是否可以处理给定的字段类型
     */
    canHandle(fieldType: string): boolean {
        return fieldType === 'entityRef' ||
               fieldType === 'entityReference' ||
               fieldType === 'EntityRef' ||
               fieldType.endsWith('EntityId');
    }

    /**
     * Render the entity reference field
     * 渲染实体引用字段
     */
    render({ label, value, onChange, context }: FieldEditorProps<number>): React.ReactElement {
        const placeholder = context.metadata?.placeholder || '拖拽实体到此处 / Drop entity here';

        return (
            <EntityRefField
                label={label}
                value={value ?? 0}
                onChange={onChange}
                placeholder={placeholder}
                readonly={context.readonly}
            />
        );
    }
}
