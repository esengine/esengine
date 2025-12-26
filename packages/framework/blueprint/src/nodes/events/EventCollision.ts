/**
 * @zh 碰撞事件节点 - 碰撞发生时触发
 * @en Event Collision Node - Triggered on collision events
 */

import { BlueprintNodeTemplate, BlueprintNode } from '../../types/nodes';
import { ExecutionResult } from '../../runtime/ExecutionContext';
import { INodeExecutor, RegisterNode } from '../../runtime/NodeRegistry';

/**
 * @zh EventCollisionEnter 节点模板
 * @en EventCollisionEnter node template
 */
export const EventCollisionEnterTemplate: BlueprintNodeTemplate = {
    type: 'EventCollisionEnter',
    title: 'Event Collision Enter',
    category: 'event',
    color: '#CC0000',
    description: 'Triggered when collision starts / 碰撞开始时触发',
    keywords: ['collision', 'enter', 'hit', 'overlap', 'event'],
    menuPath: ['Event', 'Collision', 'Enter'],
    inputs: [],
    outputs: [
        {
            name: 'exec',
            type: 'exec',
            displayName: ''
        },
        {
            name: 'otherEntityId',
            type: 'string',
            displayName: 'Other Entity'
        },
        {
            name: 'pointX',
            type: 'float',
            displayName: 'Point X'
        },
        {
            name: 'pointY',
            type: 'float',
            displayName: 'Point Y'
        },
        {
            name: 'normalX',
            type: 'float',
            displayName: 'Normal X'
        },
        {
            name: 'normalY',
            type: 'float',
            displayName: 'Normal Y'
        }
    ]
};

/**
 * @zh EventCollisionEnter 节点执行器
 * @en EventCollisionEnter node executor
 */
@RegisterNode(EventCollisionEnterTemplate)
export class EventCollisionEnterExecutor implements INodeExecutor {
    execute(_node: BlueprintNode): ExecutionResult {
        return {
            nextExec: 'exec',
            outputs: {
                otherEntityId: '',
                pointX: 0,
                pointY: 0,
                normalX: 0,
                normalY: 0
            }
        };
    }
}

/**
 * @zh EventCollisionExit 节点模板
 * @en EventCollisionExit node template
 */
export const EventCollisionExitTemplate: BlueprintNodeTemplate = {
    type: 'EventCollisionExit',
    title: 'Event Collision Exit',
    category: 'event',
    color: '#CC0000',
    description: 'Triggered when collision ends / 碰撞结束时触发',
    keywords: ['collision', 'exit', 'end', 'separate', 'event'],
    menuPath: ['Event', 'Collision', 'Exit'],
    inputs: [],
    outputs: [
        {
            name: 'exec',
            type: 'exec',
            displayName: ''
        },
        {
            name: 'otherEntityId',
            type: 'string',
            displayName: 'Other Entity'
        }
    ]
};

/**
 * @zh EventCollisionExit 节点执行器
 * @en EventCollisionExit node executor
 */
@RegisterNode(EventCollisionExitTemplate)
export class EventCollisionExitExecutor implements INodeExecutor {
    execute(_node: BlueprintNode): ExecutionResult {
        return {
            nextExec: 'exec',
            outputs: {
                otherEntityId: ''
            }
        };
    }
}
