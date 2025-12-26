/**
 * @zh 输入事件节点 - 输入触发时触发
 * @en Event Input Node - Triggered on input events
 */

import { BlueprintNodeTemplate, BlueprintNode } from '../../types/nodes';
import { ExecutionContext, ExecutionResult } from '../../runtime/ExecutionContext';
import { INodeExecutor, RegisterNode } from '../../runtime/NodeRegistry';

/**
 * @zh EventInput 节点模板
 * @en EventInput node template
 */
export const EventInputTemplate: BlueprintNodeTemplate = {
    type: 'EventInput',
    title: 'Event Input',
    category: 'event',
    color: '#CC0000',
    description: 'Triggered when input action occurs / 输入动作发生时触发',
    keywords: ['input', 'key', 'button', 'action', 'event'],
    menuPath: ['Event', 'Input'],
    inputs: [
        {
            name: 'action',
            type: 'string',
            displayName: 'Action',
            defaultValue: ''
        }
    ],
    outputs: [
        {
            name: 'exec',
            type: 'exec',
            displayName: ''
        },
        {
            name: 'action',
            type: 'string',
            displayName: 'Action'
        },
        {
            name: 'value',
            type: 'float',
            displayName: 'Value'
        },
        {
            name: 'pressed',
            type: 'bool',
            displayName: 'Pressed'
        },
        {
            name: 'released',
            type: 'bool',
            displayName: 'Released'
        }
    ]
};

/**
 * @zh EventInput 节点执行器
 * @en EventInput node executor
 *
 * @zh 注意：事件节点的输出由 VM 在触发时通过 setOutputs 设置
 * @en Note: Event node outputs are set by VM via setOutputs when triggered
 */
@RegisterNode(EventInputTemplate)
export class EventInputExecutor implements INodeExecutor {
    execute(node: BlueprintNode, _context: ExecutionContext): ExecutionResult {
        return {
            nextExec: 'exec',
            outputs: {
                action: node.data?.action ?? '',
                value: 0,
                pressed: false,
                released: false
            }
        };
    }
}
