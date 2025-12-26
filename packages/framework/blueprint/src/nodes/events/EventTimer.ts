/**
 * @zh 定时器事件节点 - 定时器触发时调用
 * @en Event Timer Node - Triggered when timer fires
 */

import { BlueprintNodeTemplate, BlueprintNode } from '../../types/nodes';
import { ExecutionResult } from '../../runtime/ExecutionContext';
import { INodeExecutor, RegisterNode } from '../../runtime/NodeRegistry';

/**
 * @zh EventTimer 节点模板
 * @en EventTimer node template
 */
export const EventTimerTemplate: BlueprintNodeTemplate = {
    type: 'EventTimer',
    title: 'Event Timer',
    category: 'event',
    color: '#CC0000',
    description: 'Triggered when a timer fires / 定时器触发时执行',
    keywords: ['timer', 'delay', 'schedule', 'event', 'interval'],
    menuPath: ['Event', 'Timer'],
    inputs: [
        {
            name: 'timerId',
            type: 'string',
            displayName: 'Timer ID',
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
            name: 'timerId',
            type: 'string',
            displayName: 'Timer ID'
        },
        {
            name: 'isRepeating',
            type: 'bool',
            displayName: 'Is Repeating'
        },
        {
            name: 'timesFired',
            type: 'int',
            displayName: 'Times Fired'
        }
    ]
};

/**
 * @zh EventTimer 节点执行器
 * @en EventTimer node executor
 */
@RegisterNode(EventTimerTemplate)
export class EventTimerExecutor implements INodeExecutor {
    execute(node: BlueprintNode): ExecutionResult {
        return {
            nextExec: 'exec',
            outputs: {
                timerId: node.data?.timerId ?? '',
                isRepeating: false,
                timesFired: 0
            }
        };
    }
}
