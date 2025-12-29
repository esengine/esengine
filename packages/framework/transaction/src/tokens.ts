/**
 * @zh Transaction 模块服务令牌
 * @en Transaction module service tokens
 */

import { createServiceToken } from '@esengine/ecs-framework';
import type { TransactionManager } from './core/TransactionManager.js';
import type { ITransactionStorage } from './core/types.js';

/**
 * @zh 事务管理器令牌
 * @en Transaction manager token
 */
export const TransactionManagerToken = createServiceToken<TransactionManager>('transactionManager');

/**
 * @zh 事务存储令牌
 * @en Transaction storage token
 */
export const TransactionStorageToken = createServiceToken<ITransactionStorage>('transactionStorage');
