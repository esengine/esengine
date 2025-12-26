/**
 * @zh 状态事件节点 - 状态机状态变化时触发
 * @en Event State Node - Triggered on state machine state changes
 */

import { BlueprintNodeTemplate, BlueprintNode } from '../../types/nodes';
import { ExecutionResult } from '../../runtime/ExecutionContext';
import { INodeExecutor, RegisterNode } from '../../runtime/NodeRegistry';

/**
 * @zh EventStateEnter 节点模板
 * @en EventStateEnter node template
 */
export const EventStateEnterTemplate: BlueprintNodeTemplate = {
    type: 'EventStateEnter',
    title: 'Event State Enter',
    category: 'event',
    color: '#CC0000',
    description: 'Triggered when entering a state / 进入状态时触发',
    keywords: ['state', 'enter', 'fsm', 'machine', 'event'],
    menuPath: ['Event', 'State', 'Enter'],
    inputs: [
        {
            name: 'stateName',
            type: 'string',
            displayName: 'State Name',
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
            name: 'stateMachineId',
            type: 'string',
            displayName: 'State Machine'
        },
        {
            name: 'currentState',
            type: 'string',
            displayName: 'Current State'
        },
        {
            name: 'previousState',
            type: 'string',
            displayName: 'Previous State'
        }
    ]
};

/**
 * @zh EventStateEnter 节点执行器
 * @en EventStateEnter node executor
 */
@RegisterNode(EventStateEnterTemplate)
export class EventStateEnterExecutor implements INodeExecutor {
    execute(node: BlueprintNode): ExecutionResult {
        return {
            nextExec: 'exec',
            outputs: {
                stateMachineId: '',
                currentState: node.data?.stateName ?? '',
                previousState: ''
            }
        };
    }
}

/**
 * @zh EventStateExit 节点模板
 * @en EventStateExit node template
 */
export const EventStateExitTemplate: BlueprintNodeTemplate = {
    type: 'EventStateExit',
    title: 'Event State Exit',
    category: 'event',
    color: '#CC0000',
    description: 'Triggered when exiting a state / 退出状态时触发',
    keywords: ['state', 'exit', 'leave', 'fsm', 'machine', 'event'],
    menuPath: ['Event', 'State', 'Exit'],
    inputs: [
        {
            name: 'stateName',
            type: 'string',
            displayName: 'State Name',
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
            name: 'stateMachineId',
            type: 'string',
            displayName: 'State Machine'
        },
        {
            name: 'currentState',
            type: 'string',
            displayName: 'Current State'
        },
        {
            name: 'previousState',
            type: 'string',
            displayName: 'Previous State'
        }
    ]
};

/**
 * @zh EventStateExit 节点执行器
 * @en EventStateExit node executor
 */
@RegisterNode(EventStateExitTemplate)
export class EventStateExitExecutor implements INodeExecutor {
    execute(node: BlueprintNode): ExecutionResult {
        return {
            nextExec: 'exec',
            outputs: {
                stateMachineId: '',
                currentState: '',
                previousState: node.data?.stateName ?? ''
            }
        };
    }
}
