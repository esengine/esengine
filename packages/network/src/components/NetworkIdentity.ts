import { Component, ECSComponent, Serialize, Serializable, Property } from '@esengine/ecs-framework';

/**
 * 网络身份组件
 * Network identity component
 *
 * 标识一个实体在网络上的唯一身份。
 * Identifies an entity's unique identity on the network.
 */
@ECSComponent('NetworkIdentity')
@Serializable({ version: 1, typeId: 'NetworkIdentity' })
export class NetworkIdentity extends Component {
    /**
     * 网络实体 ID
     * Network entity ID
     */
    @Serialize()
    @Property({ type: 'integer', label: 'Net ID', readOnly: true })
    public netId: number = 0;

    /**
     * 所有者客户端 ID
     * Owner client ID
     */
    @Serialize()
    @Property({ type: 'integer', label: 'Owner ID', readOnly: true })
    public ownerId: number = 0;

    /**
     * 是否为本地玩家拥有
     * Is owned by local player
     */
    public bIsLocalPlayer: boolean = false;

    /**
     * 是否有权限控制
     * Has authority
     */
    public bHasAuthority: boolean = false;

    /**
     * 预制体类型
     * Prefab type
     */
    @Serialize()
    @Property({ type: 'string', label: 'Prefab Type' })
    public prefabType: string = '';

    /**
     * 同步间隔 (ms)
     * Sync interval in milliseconds
     */
    @Serialize()
    @Property({ type: 'number', label: 'Sync Interval', min: 16 })
    public syncInterval: number = 100;

    /**
     * 上次同步时间
     * Last sync time
     */
    public lastSyncTime: number = 0;

    /**
     * 检查是否需要同步
     * Check if sync is needed
     */
    public needsSync(now: number): boolean {
        return now - this.lastSyncTime >= this.syncInterval;
    }
}
