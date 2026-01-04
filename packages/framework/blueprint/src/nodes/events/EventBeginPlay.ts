/**
 * Event Begin Play Node - Triggered when the blueprint starts
 * 开始播放事件节点 - 蓝图启动时触发
 */

import { BlueprintNodeTemplate, BlueprintNode } from '../../types/nodes';
import { ExecutionContext, ExecutionResult } from '../../runtime/ExecutionContext';
import { INodeExecutor, RegisterNode } from '../../runtime/NodeRegistry';

/**
 * EventBeginPlay node template
 * EventBeginPlay 节点模板
 */
export const EventBeginPlayTemplate: BlueprintNodeTemplate = {
    type: 'EventBeginPlay',
    title: 'Event Begin Play',
    category: 'event',
    color: '#CC0000',
    description: 'Triggered once when the blueprint starts executing (蓝图开始执行时触发一次)',
    keywords: ['start', 'begin', 'init', 'event', 'self'],
    menuPath: ['Events', 'Begin Play'],
    inputs: [],
    outputs: [
        {
            name: 'exec',
            type: 'exec',
            displayName: ''
        },
        {
            name: 'self',
            type: 'entity',
            displayName: 'Self'
        }
    ]
};

/**
 * EventBeginPlay node executor
 * EventBeginPlay 节点执行器
 */
@RegisterNode(EventBeginPlayTemplate)
export class EventBeginPlayExecutor implements INodeExecutor {
    execute(_node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        return {
            nextExec: 'exec',
            outputs: {
                self: context.entity
            }
        };
    }
}
