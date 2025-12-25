/**
 * TypeDoc Plugin for Bilingual Documentation
 * TypeDoc 双语文档插件
 *
 * Supports @zh and @en tags for bilingual documentation generation.
 * 支持 @zh 和 @en 标签来生成双语文档。
 *
 * @example
 * ```typescript
 * /**
 *  * @zh 组件基类，所有组件都应继承此类
 *  * @en Base class for all components
 *  *\/
 * export class Component { }
 * ```
 */

import { Application, Converter, ReflectionKind, Comment, CommentTag } from 'typedoc';

/**
 * @zh TypeDoc 双语插件入口
 * @en TypeDoc bilingual plugin entry
 * @param {Application} app - TypeDoc 应用实例 | TypeDoc application instance
 */
export function load(app) {
    // 注册自定义标签 | Register custom tags
    app.options.addReader({
        name: 'bilingual-tags',
        order: 0,
        supportsPackages: false,
        read(container) {
            // 添加 @zh 和 @en 作为已知标签
            // Add @zh and @en as known tags
            const knownTags = container.getValue('blockTags') || [];
            if (!knownTags.includes('@zh')) {
                knownTags.push('@zh');
            }
            if (!knownTags.includes('@en')) {
                knownTags.push('@en');
            }
            container.setValue('blockTags', knownTags);
        }
    });

    // 监听解析完成事件 | Listen for conversion completion
    app.converter.on(Converter.EVENT_RESOLVE_BEGIN, (context) => {
        processReflections(context.project);
    });
}

/**
 * @zh 处理所有反射对象的注释
 * @en Process comments for all reflections
 * @param {import('typedoc').ProjectReflection} project
 */
function processReflections(project) {
    for (const reflection of project.getReflectionsByKind(ReflectionKind.All)) {
        if (reflection.comment) {
            processBilingualComment(reflection.comment);
        }

        // 处理签名注释 | Process signature comments
        if ('signatures' in reflection && reflection.signatures) {
            for (const sig of reflection.signatures) {
                if (sig.comment) {
                    processBilingualComment(sig.comment);
                }
            }
        }
    }
}

/**
 * @zh 处理单个注释的双语标签
 * @en Process bilingual tags in a single comment
 * @param {Comment} comment
 */
function processBilingualComment(comment) {
    const zhTags = comment.blockTags?.filter(tag => tag.tag === '@zh') || [];
    const enTags = comment.blockTags?.filter(tag => tag.tag === '@en') || [];

    if (zhTags.length === 0 && enTags.length === 0) {
        return;
    }

    // 构建双语摘要 | Build bilingual summary
    const parts = [];

    // 添加中文部分 | Add Chinese part
    if (zhTags.length > 0) {
        const zhText = zhTags.map(tag => tagContentToString(tag)).join('\n');
        parts.push(zhText);
    }

    // 添加英文部分 | Add English part
    if (enTags.length > 0) {
        const enText = enTags.map(tag => tagContentToString(tag)).join('\n');
        if (parts.length > 0) {
            parts.push(''); // 空行分隔 | Empty line separator
        }
        parts.push(enText);
    }

    // 如果有双语内容，更新摘要 | Update summary if bilingual content exists
    if (parts.length > 0) {
        // 保留原有摘要（如果不是来自 @zh/@en）| Keep original summary if not from @zh/@en
        const originalSummary = comment.summary?.map(part => {
            if (typeof part === 'string') return part;
            if (part.kind === 'text') return part.text;
            return '';
        }).join('') || '';

        // 如果原有摘要不是空的且不是重复的，保留它
        // Keep original summary if not empty and not duplicate
        const bilingualText = parts.join('\n');
        if (originalSummary && !bilingualText.includes(originalSummary.trim())) {
            comment.summary = [
                { kind: 'text', text: originalSummary + '\n\n' + bilingualText }
            ];
        } else {
            comment.summary = [
                { kind: 'text', text: bilingualText }
            ];
        }
    }

    // 移除已处理的 @zh/@en 标签，避免重复显示
    // Remove processed @zh/@en tags to avoid duplicate display
    comment.blockTags = comment.blockTags?.filter(
        tag => tag.tag !== '@zh' && tag.tag !== '@en'
    );
}

/**
 * @zh 将标签内容转换为字符串
 * @en Convert tag content to string
 * @param {CommentTag} tag
 * @returns {string}
 */
function tagContentToString(tag) {
    if (!tag.content) return '';

    return tag.content.map(part => {
        if (typeof part === 'string') return part;
        if (part.kind === 'text') return part.text;
        if (part.kind === 'code') return '`' + part.text + '`';
        return '';
    }).join('');
}

export default { load };
