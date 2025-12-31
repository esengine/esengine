/**
 * @zh 数据库驱动导出
 * @en Database drivers export
 */

export {
    MongoConnection,
    createMongoConnection,
    type IMongoConnection
} from './MongoConnection.js'

export {
    RedisConnection,
    createRedisConnection,
    type IRedisConnection
} from './RedisConnection.js'

// Re-export interfaces
export type {
    IMongoCollection,
    IMongoDatabase,
    InsertOneResult,
    InsertManyResult,
    UpdateResult,
    DeleteResult,
    FindOptions,
    FindOneAndUpdateOptions,
    IndexOptions
} from '../interfaces/IMongoCollection.js'
