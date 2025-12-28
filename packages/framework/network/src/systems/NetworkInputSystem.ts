/**
 * @zh 网络输入系统
 * @en Network Input System
 */

import { EntitySystem, Matcher } from '@esengine/ecs-framework'
import type { PlayerInput } from '../protocol'
import type { NetworkService } from '../services/NetworkService'

/**
 * @zh 网络输入系统
 * @en Network input system
 *
 * @zh 收集本地玩家输入并发送到服务器
 * @en Collects local player input and sends to server
 */
export class NetworkInputSystem extends EntitySystem {
    private _networkService: NetworkService
    private _frame: number = 0
    private _inputQueue: PlayerInput[] = []

    constructor(networkService: NetworkService) {
        super(Matcher.nothing())
        this._networkService = networkService
    }

    /**
     * @zh 处理输入队列
     * @en Process input queue
     */
    protected override process(): void {
        if (!this._networkService.isConnected) return

        this._frame++

        while (this._inputQueue.length > 0) {
            const input = this._inputQueue.shift()!
            input.frame = this._frame
            this._networkService.sendInput(input)
        }
    }

    /**
     * @zh 添加移动输入
     * @en Add move input
     */
    public addMoveInput(x: number, y: number): void {
        this._inputQueue.push({
            frame: 0,
            moveDir: { x, y },
        })
    }

    /**
     * @zh 添加动作输入
     * @en Add action input
     */
    public addActionInput(action: string): void {
        const lastInput = this._inputQueue[this._inputQueue.length - 1]
        if (lastInput) {
            lastInput.actions = lastInput.actions || []
            lastInput.actions.push(action)
        } else {
            this._inputQueue.push({
                frame: 0,
                actions: [action],
            })
        }
    }

    protected override onDestroy(): void {
        this._inputQueue.length = 0
    }
}
