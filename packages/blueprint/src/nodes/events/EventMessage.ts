/**
 * @zh 消息事件节点 - 接收消息时触发
 * @en Event Message Node - Triggered when message is received
 */

import { BlueprintNodeTemplate, BlueprintNode } from '../../types/nodes';
import { ExecutionResult } from '../../runtime/ExecutionContext';
import { INodeExecutor, RegisterNode } from '../../runtime/NodeRegistry';

/**
 * @zh EventMessage 节点模板
 * @en EventMessage node template
 */
export const EventMessageTemplate: BlueprintNodeTemplate = {
    type: 'EventMessage',
    title: 'Event Message',
    category: 'event',
    color: '#CC0000',
    description: 'Triggered when a message is received / 接收到消息时触发',
    keywords: ['message', 'receive', 'broadcast', 'event', 'signal'],
    menuPath: ['Event', 'Message'],
    inputs: [
        {
            name: 'messageName',
            type: 'string',
            displayName: 'Message Name',
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
            name: 'messageName',
            type: 'string',
            displayName: 'Message'
        },
        {
            name: 'senderId',
            type: 'string',
            displayName: 'Sender ID'
        },
        {
            name: 'payload',
            type: 'any',
            displayName: 'Payload'
        }
    ]
};

/**
 * @zh EventMessage 节点执行器
 * @en EventMessage node executor
 */
@RegisterNode(EventMessageTemplate)
export class EventMessageExecutor implements INodeExecutor {
    execute(node: BlueprintNode): ExecutionResult {
        return {
            nextExec: 'exec',
            outputs: {
                messageName: node.data?.messageName ?? '',
                senderId: '',
                payload: null
            }
        };
    }
}
