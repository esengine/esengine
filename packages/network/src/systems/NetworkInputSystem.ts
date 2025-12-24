import { EntitySystem, Matcher } from '@esengine/ecs-framework';
import type { IPlayerInput } from '@esengine/network-protocols';
import type { NetworkService } from '../services/NetworkService';

/**
 * 网络输入系统
 * Network input system
 *
 * 收集本地玩家输入并发送到服务器。
 * Collects local player input and sends to server.
 */
export class NetworkInputSystem extends EntitySystem {
    private _networkService: NetworkService;
    private _frame: number = 0;
    private _inputQueue: IPlayerInput[] = [];

    constructor(networkService: NetworkService) {
        // 不查询任何实体，此系统只处理输入
        // Don't query any entities, this system only handles input
        super(Matcher.nothing());
        this._networkService = networkService;
    }

    /**
     * 处理输入队列
     * Process input queue
     */
    protected override process(): void {
        if (!this._networkService.isConnected) return;

        this._frame++;

        // 发送队列中的输入
        // Send queued inputs
        while (this._inputQueue.length > 0) {
            const input = this._inputQueue.shift()!;
            input.frame = this._frame;
            this._networkService.sendInput(input);
        }
    }

    /**
     * 添加移动输入
     * Add move input
     */
    public addMoveInput(x: number, y: number): void {
        this._inputQueue.push({
            frame: 0,
            moveDir: { x, y }
        });
    }

    /**
     * 添加动作输入
     * Add action input
     */
    public addActionInput(action: string): void {
        const lastInput = this._inputQueue[this._inputQueue.length - 1];
        if (lastInput) {
            lastInput.actions = lastInput.actions || [];
            lastInput.actions.push(action);
        } else {
            this._inputQueue.push({
                frame: 0,
                actions: [action]
            });
        }
    }

    protected override onDestroy(): void {
        this._inputQueue.length = 0;
    }
}
