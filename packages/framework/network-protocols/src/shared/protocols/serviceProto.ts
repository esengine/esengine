import { ServiceProto } from 'tsrpc-proto';
import { MsgDespawn } from './MsgDespawn';
import { MsgInput } from './MsgInput';
import { MsgSpawn } from './MsgSpawn';
import { MsgSync } from './MsgSync';
import { ReqJoin, ResJoin } from './PtlJoin';

export interface ServiceType {
    api: {
        "Join": {
            req: ReqJoin,
            res: ResJoin
        }
    },
    msg: {
        "Despawn": MsgDespawn,
        "Input": MsgInput,
        "Spawn": MsgSpawn,
        "Sync": MsgSync
    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "services": [
        {
            "id": 0,
            "name": "Despawn",
            "type": "msg"
        },
        {
            "id": 1,
            "name": "Input",
            "type": "msg"
        },
        {
            "id": 2,
            "name": "Spawn",
            "type": "msg"
        },
        {
            "id": 3,
            "name": "Sync",
            "type": "msg"
        },
        {
            "id": 4,
            "name": "Join",
            "type": "api"
        }
    ],
    "types": {
        "MsgDespawn/MsgDespawn": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "netId",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "MsgInput/MsgInput": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "input",
                    "type": {
                        "type": "Reference",
                        "target": "types/IPlayerInput"
                    }
                }
            ]
        },
        "types/IPlayerInput": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "frame",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "moveDir",
                    "type": {
                        "type": "Reference",
                        "target": "types/Vec2"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "actions",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "String"
                        }
                    },
                    "optional": true
                }
            ]
        },
        "types/Vec2": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "x",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "y",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "MsgSpawn/MsgSpawn": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "netId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "ownerId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "prefab",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 3,
                    "name": "pos",
                    "type": {
                        "type": "Reference",
                        "target": "types/Vec2"
                    }
                },
                {
                    "id": 4,
                    "name": "rot",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "MsgSync/MsgSync": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "time",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "entities",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "types/IEntityState"
                        }
                    }
                }
            ]
        },
        "types/IEntityState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "netId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "pos",
                    "type": {
                        "type": "Reference",
                        "target": "types/Vec2"
                    },
                    "optional": true
                },
                {
                    "id": 2,
                    "name": "rot",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                }
            ]
        },
        "PtlJoin/ReqJoin": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "playerName",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "PtlJoin/ResJoin": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "clientId",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "playerCount",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        }
    }
};