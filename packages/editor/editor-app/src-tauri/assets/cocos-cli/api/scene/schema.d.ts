import { z } from 'zod';
import { SchemaAssetUrlOrUUID } from '../base/schema-identifier';
export declare const SchemaCurrentResult: z.ZodNullable<z.ZodUnion<[z.ZodObject<{
    assetName: z.ZodString;
    assetUuid: z.ZodString;
    assetUrl: z.ZodString;
    assetType: z.ZodString;
} & {
    name: z.ZodString;
    prefab: z.ZodUnion<[z.ZodNullable<z.ZodObject<{
        asset: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            uuid: z.ZodString;
            data: z.ZodObject<{
                nodeId: z.ZodString;
                path: z.ZodString;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                path: string;
                nodeId: string;
            }, {
                name: string;
                path: string;
                nodeId: string;
            }>;
            optimizationPolicy: z.ZodNumber;
            persistent: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            name: string;
            data: {
                name: string;
                path: string;
                nodeId: string;
            };
            uuid: string;
            persistent: boolean;
            optimizationPolicy: number;
        }, {
            name: string;
            data: {
                name: string;
                path: string;
                nodeId: string;
            };
            uuid: string;
            persistent: boolean;
            optimizationPolicy: number;
        }>>;
        root: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            nodeId: z.ZodString;
            path: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            path: string;
            nodeId: string;
        }, {
            name: string;
            path: string;
            nodeId: string;
        }>>>;
        instance: z.ZodOptional<z.ZodObject<{
            fileId: z.ZodString;
            prefabRootNode: z.ZodOptional<z.ZodObject<{
                nodeId: z.ZodString;
                path: z.ZodString;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                path: string;
                nodeId: string;
            }, {
                name: string;
                path: string;
                nodeId: string;
            }>>;
            mountedChildren: z.ZodArray<z.ZodObject<{
                targetInfo: z.ZodNullable<z.ZodObject<{
                    localID: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    localID: string[];
                }, {
                    localID: string[];
                }>>;
                nodes: z.ZodArray<z.ZodObject<{
                    nodeId: z.ZodString;
                    path: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    path: string;
                    nodeId: string;
                }, {
                    name: string;
                    path: string;
                    nodeId: string;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }, {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }>, "many">;
            mountedComponents: z.ZodArray<z.ZodObject<{
                targetInfo: z.ZodNullable<z.ZodObject<{
                    localID: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    localID: string[];
                }, {
                    localID: string[];
                }>>;
                components: z.ZodArray<z.ZodObject<{
                    cid: z.ZodString;
                    path: z.ZodString;
                    uuid: z.ZodString;
                    name: z.ZodString;
                    type: z.ZodString;
                    enabled: z.ZodBoolean;
                }, "strip", z.ZodTypeAny, {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }, {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }, {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }>, "many">;
            propertyOverrides: z.ZodArray<z.ZodObject<{
                targetInfo: z.ZodNullable<z.ZodObject<{
                    localID: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    localID: string[];
                }, {
                    localID: string[];
                }>>;
                propertyPath: z.ZodArray<z.ZodString, "many">;
                value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }, {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }>, "many">;
            removedComponents: z.ZodArray<z.ZodObject<{
                localID: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                localID: string[];
            }, {
                localID: string[];
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            fileId: string;
            mountedChildren: {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            mountedComponents: {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            propertyOverrides: {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }[];
            removedComponents: {
                localID: string[];
            }[];
            prefabRootNode?: {
                name: string;
                path: string;
                nodeId: string;
            } | undefined;
        }, {
            fileId: string;
            mountedChildren: {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            mountedComponents: {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            propertyOverrides: {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }[];
            removedComponents: {
                localID: string[];
            }[];
            prefabRootNode?: {
                name: string;
                path: string;
                nodeId: string;
            } | undefined;
        }>>;
        fileId: z.ZodString;
        targetOverrides: z.ZodArray<z.ZodObject<{
            source: z.ZodUnion<[z.ZodObject<{
                cid: z.ZodString;
                path: z.ZodString;
                uuid: z.ZodString;
                name: z.ZodString;
                type: z.ZodString;
                enabled: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            }, {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            }>, z.ZodObject<{
                nodeId: z.ZodString;
                path: z.ZodString;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                path: string;
                nodeId: string;
            }, {
                name: string;
                path: string;
                nodeId: string;
            }>, z.ZodNull]>;
            sourceInfo: z.ZodNullable<z.ZodObject<{
                localID: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                localID: string[];
            }, {
                localID: string[];
            }>>;
            propertyPath: z.ZodArray<z.ZodString, "many">;
            target: z.ZodNullable<z.ZodObject<{
                nodeId: z.ZodString;
                path: z.ZodString;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                path: string;
                nodeId: string;
            }, {
                name: string;
                path: string;
                nodeId: string;
            }>>;
            targetInfo: z.ZodNullable<z.ZodObject<{
                localID: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                localID: string[];
            }, {
                localID: string[];
            }>>;
        }, "strip", z.ZodTypeAny, {
            target: {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            source: {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            } | {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            targetInfo: {
                localID: string[];
            } | null;
            propertyPath: string[];
            sourceInfo: {
                localID: string[];
            } | null;
        }, {
            target: {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            source: {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            } | {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            targetInfo: {
                localID: string[];
            } | null;
            propertyPath: string[];
            sourceInfo: {
                localID: string[];
            } | null;
        }>, "many">;
        nestedPrefabInstanceRoots: z.ZodArray<z.ZodObject<{
            nodeId: z.ZodString;
            path: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            path: string;
            nodeId: string;
        }, {
            name: string;
            path: string;
            nodeId: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        fileId: string;
        targetOverrides: {
            target: {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            source: {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            } | {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            targetInfo: {
                localID: string[];
            } | null;
            propertyPath: string[];
            sourceInfo: {
                localID: string[];
            } | null;
        }[];
        nestedPrefabInstanceRoots: {
            name: string;
            path: string;
            nodeId: string;
        }[];
        asset?: {
            name: string;
            data: {
                name: string;
                path: string;
                nodeId: string;
            };
            uuid: string;
            persistent: boolean;
            optimizationPolicy: number;
        } | undefined;
        root?: {
            name: string;
            path: string;
            nodeId: string;
        } | undefined;
        instance?: {
            fileId: string;
            mountedChildren: {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            mountedComponents: {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            propertyOverrides: {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }[];
            removedComponents: {
                localID: string[];
            }[];
            prefabRootNode?: {
                name: string;
                path: string;
                nodeId: string;
            } | undefined;
        } | undefined;
    }, {
        fileId: string;
        targetOverrides: {
            target: {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            source: {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            } | {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            targetInfo: {
                localID: string[];
            } | null;
            propertyPath: string[];
            sourceInfo: {
                localID: string[];
            } | null;
        }[];
        nestedPrefabInstanceRoots: {
            name: string;
            path: string;
            nodeId: string;
        }[];
        asset?: {
            name: string;
            data: {
                name: string;
                path: string;
                nodeId: string;
            };
            uuid: string;
            persistent: boolean;
            optimizationPolicy: number;
        } | undefined;
        root?: {
            name: string;
            path: string;
            nodeId: string;
        } | undefined;
        instance?: {
            fileId: string;
            mountedChildren: {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            mountedComponents: {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            propertyOverrides: {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }[];
            removedComponents: {
                localID: string[];
            }[];
            prefabRootNode?: {
                name: string;
                path: string;
                nodeId: string;
            } | undefined;
        } | undefined;
    }>>, z.ZodNull]>;
    children: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<import("../../core/scene").INode, z.ZodTypeDef, import("../../core/scene").INode>>, "many">>>;
    components: z.ZodDefault<z.ZodArray<z.ZodObject<{
        cid: z.ZodString;
        path: z.ZodString;
        uuid: z.ZodString;
        name: z.ZodString;
        type: z.ZodString;
        enabled: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        name: string;
        type: string;
        path: string;
        uuid: string;
        cid: string;
    }, {
        enabled: boolean;
        name: string;
        type: string;
        path: string;
        uuid: string;
        cid: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    prefab: {
        fileId: string;
        targetOverrides: {
            target: {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            source: {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            } | {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            targetInfo: {
                localID: string[];
            } | null;
            propertyPath: string[];
            sourceInfo: {
                localID: string[];
            } | null;
        }[];
        nestedPrefabInstanceRoots: {
            name: string;
            path: string;
            nodeId: string;
        }[];
        asset?: {
            name: string;
            data: {
                name: string;
                path: string;
                nodeId: string;
            };
            uuid: string;
            persistent: boolean;
            optimizationPolicy: number;
        } | undefined;
        root?: {
            name: string;
            path: string;
            nodeId: string;
        } | undefined;
        instance?: {
            fileId: string;
            mountedChildren: {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            mountedComponents: {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            propertyOverrides: {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }[];
            removedComponents: {
                localID: string[];
            }[];
            prefabRootNode?: {
                name: string;
                path: string;
                nodeId: string;
            } | undefined;
        } | undefined;
    } | null;
    assetType: string;
    assetUuid: string;
    components: {
        enabled: boolean;
        name: string;
        type: string;
        path: string;
        uuid: string;
        cid: string;
    }[];
    children: import("../../core/scene").INode[];
    assetName: string;
    assetUrl: string;
}, {
    name: string;
    prefab: {
        fileId: string;
        targetOverrides: {
            target: {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            source: {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            } | {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            targetInfo: {
                localID: string[];
            } | null;
            propertyPath: string[];
            sourceInfo: {
                localID: string[];
            } | null;
        }[];
        nestedPrefabInstanceRoots: {
            name: string;
            path: string;
            nodeId: string;
        }[];
        asset?: {
            name: string;
            data: {
                name: string;
                path: string;
                nodeId: string;
            };
            uuid: string;
            persistent: boolean;
            optimizationPolicy: number;
        } | undefined;
        root?: {
            name: string;
            path: string;
            nodeId: string;
        } | undefined;
        instance?: {
            fileId: string;
            mountedChildren: {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            mountedComponents: {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            propertyOverrides: {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }[];
            removedComponents: {
                localID: string[];
            }[];
            prefabRootNode?: {
                name: string;
                path: string;
                nodeId: string;
            } | undefined;
        } | undefined;
    } | null;
    assetType: string;
    assetUuid: string;
    assetName: string;
    assetUrl: string;
    components?: {
        enabled: boolean;
        name: string;
        type: string;
        path: string;
        uuid: string;
        cid: string;
    }[] | undefined;
    children?: import("../../core/scene").INode[] | undefined;
}>, z.ZodType<import("../../core/scene").INode, z.ZodTypeDef, import("../../core/scene").INode>]>>;
export declare const SchemaOpenResult: z.ZodUnion<[z.ZodObject<{
    assetName: z.ZodString;
    assetUuid: z.ZodString;
    assetUrl: z.ZodString;
    assetType: z.ZodString;
} & {
    name: z.ZodString;
    prefab: z.ZodUnion<[z.ZodNullable<z.ZodObject<{
        asset: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            uuid: z.ZodString;
            data: z.ZodObject<{
                nodeId: z.ZodString;
                path: z.ZodString;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                path: string;
                nodeId: string;
            }, {
                name: string;
                path: string;
                nodeId: string;
            }>;
            optimizationPolicy: z.ZodNumber;
            persistent: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            name: string;
            data: {
                name: string;
                path: string;
                nodeId: string;
            };
            uuid: string;
            persistent: boolean;
            optimizationPolicy: number;
        }, {
            name: string;
            data: {
                name: string;
                path: string;
                nodeId: string;
            };
            uuid: string;
            persistent: boolean;
            optimizationPolicy: number;
        }>>;
        root: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            nodeId: z.ZodString;
            path: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            path: string;
            nodeId: string;
        }, {
            name: string;
            path: string;
            nodeId: string;
        }>>>;
        instance: z.ZodOptional<z.ZodObject<{
            fileId: z.ZodString;
            prefabRootNode: z.ZodOptional<z.ZodObject<{
                nodeId: z.ZodString;
                path: z.ZodString;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                path: string;
                nodeId: string;
            }, {
                name: string;
                path: string;
                nodeId: string;
            }>>;
            mountedChildren: z.ZodArray<z.ZodObject<{
                targetInfo: z.ZodNullable<z.ZodObject<{
                    localID: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    localID: string[];
                }, {
                    localID: string[];
                }>>;
                nodes: z.ZodArray<z.ZodObject<{
                    nodeId: z.ZodString;
                    path: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    name: string;
                    path: string;
                    nodeId: string;
                }, {
                    name: string;
                    path: string;
                    nodeId: string;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }, {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }>, "many">;
            mountedComponents: z.ZodArray<z.ZodObject<{
                targetInfo: z.ZodNullable<z.ZodObject<{
                    localID: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    localID: string[];
                }, {
                    localID: string[];
                }>>;
                components: z.ZodArray<z.ZodObject<{
                    cid: z.ZodString;
                    path: z.ZodString;
                    uuid: z.ZodString;
                    name: z.ZodString;
                    type: z.ZodString;
                    enabled: z.ZodBoolean;
                }, "strip", z.ZodTypeAny, {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }, {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }, {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }>, "many">;
            propertyOverrides: z.ZodArray<z.ZodObject<{
                targetInfo: z.ZodNullable<z.ZodObject<{
                    localID: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    localID: string[];
                }, {
                    localID: string[];
                }>>;
                propertyPath: z.ZodArray<z.ZodString, "many">;
                value: z.ZodAny;
            }, "strip", z.ZodTypeAny, {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }, {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }>, "many">;
            removedComponents: z.ZodArray<z.ZodObject<{
                localID: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                localID: string[];
            }, {
                localID: string[];
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            fileId: string;
            mountedChildren: {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            mountedComponents: {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            propertyOverrides: {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }[];
            removedComponents: {
                localID: string[];
            }[];
            prefabRootNode?: {
                name: string;
                path: string;
                nodeId: string;
            } | undefined;
        }, {
            fileId: string;
            mountedChildren: {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            mountedComponents: {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            propertyOverrides: {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }[];
            removedComponents: {
                localID: string[];
            }[];
            prefabRootNode?: {
                name: string;
                path: string;
                nodeId: string;
            } | undefined;
        }>>;
        fileId: z.ZodString;
        targetOverrides: z.ZodArray<z.ZodObject<{
            source: z.ZodUnion<[z.ZodObject<{
                cid: z.ZodString;
                path: z.ZodString;
                uuid: z.ZodString;
                name: z.ZodString;
                type: z.ZodString;
                enabled: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            }, {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            }>, z.ZodObject<{
                nodeId: z.ZodString;
                path: z.ZodString;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                path: string;
                nodeId: string;
            }, {
                name: string;
                path: string;
                nodeId: string;
            }>, z.ZodNull]>;
            sourceInfo: z.ZodNullable<z.ZodObject<{
                localID: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                localID: string[];
            }, {
                localID: string[];
            }>>;
            propertyPath: z.ZodArray<z.ZodString, "many">;
            target: z.ZodNullable<z.ZodObject<{
                nodeId: z.ZodString;
                path: z.ZodString;
                name: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                path: string;
                nodeId: string;
            }, {
                name: string;
                path: string;
                nodeId: string;
            }>>;
            targetInfo: z.ZodNullable<z.ZodObject<{
                localID: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                localID: string[];
            }, {
                localID: string[];
            }>>;
        }, "strip", z.ZodTypeAny, {
            target: {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            source: {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            } | {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            targetInfo: {
                localID: string[];
            } | null;
            propertyPath: string[];
            sourceInfo: {
                localID: string[];
            } | null;
        }, {
            target: {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            source: {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            } | {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            targetInfo: {
                localID: string[];
            } | null;
            propertyPath: string[];
            sourceInfo: {
                localID: string[];
            } | null;
        }>, "many">;
        nestedPrefabInstanceRoots: z.ZodArray<z.ZodObject<{
            nodeId: z.ZodString;
            path: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            path: string;
            nodeId: string;
        }, {
            name: string;
            path: string;
            nodeId: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        fileId: string;
        targetOverrides: {
            target: {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            source: {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            } | {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            targetInfo: {
                localID: string[];
            } | null;
            propertyPath: string[];
            sourceInfo: {
                localID: string[];
            } | null;
        }[];
        nestedPrefabInstanceRoots: {
            name: string;
            path: string;
            nodeId: string;
        }[];
        asset?: {
            name: string;
            data: {
                name: string;
                path: string;
                nodeId: string;
            };
            uuid: string;
            persistent: boolean;
            optimizationPolicy: number;
        } | undefined;
        root?: {
            name: string;
            path: string;
            nodeId: string;
        } | undefined;
        instance?: {
            fileId: string;
            mountedChildren: {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            mountedComponents: {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            propertyOverrides: {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }[];
            removedComponents: {
                localID: string[];
            }[];
            prefabRootNode?: {
                name: string;
                path: string;
                nodeId: string;
            } | undefined;
        } | undefined;
    }, {
        fileId: string;
        targetOverrides: {
            target: {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            source: {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            } | {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            targetInfo: {
                localID: string[];
            } | null;
            propertyPath: string[];
            sourceInfo: {
                localID: string[];
            } | null;
        }[];
        nestedPrefabInstanceRoots: {
            name: string;
            path: string;
            nodeId: string;
        }[];
        asset?: {
            name: string;
            data: {
                name: string;
                path: string;
                nodeId: string;
            };
            uuid: string;
            persistent: boolean;
            optimizationPolicy: number;
        } | undefined;
        root?: {
            name: string;
            path: string;
            nodeId: string;
        } | undefined;
        instance?: {
            fileId: string;
            mountedChildren: {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            mountedComponents: {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            propertyOverrides: {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }[];
            removedComponents: {
                localID: string[];
            }[];
            prefabRootNode?: {
                name: string;
                path: string;
                nodeId: string;
            } | undefined;
        } | undefined;
    }>>, z.ZodNull]>;
    children: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodType<import("../../core/scene").INode, z.ZodTypeDef, import("../../core/scene").INode>>, "many">>>;
    components: z.ZodDefault<z.ZodArray<z.ZodObject<{
        cid: z.ZodString;
        path: z.ZodString;
        uuid: z.ZodString;
        name: z.ZodString;
        type: z.ZodString;
        enabled: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        name: string;
        type: string;
        path: string;
        uuid: string;
        cid: string;
    }, {
        enabled: boolean;
        name: string;
        type: string;
        path: string;
        uuid: string;
        cid: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    prefab: {
        fileId: string;
        targetOverrides: {
            target: {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            source: {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            } | {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            targetInfo: {
                localID: string[];
            } | null;
            propertyPath: string[];
            sourceInfo: {
                localID: string[];
            } | null;
        }[];
        nestedPrefabInstanceRoots: {
            name: string;
            path: string;
            nodeId: string;
        }[];
        asset?: {
            name: string;
            data: {
                name: string;
                path: string;
                nodeId: string;
            };
            uuid: string;
            persistent: boolean;
            optimizationPolicy: number;
        } | undefined;
        root?: {
            name: string;
            path: string;
            nodeId: string;
        } | undefined;
        instance?: {
            fileId: string;
            mountedChildren: {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            mountedComponents: {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            propertyOverrides: {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }[];
            removedComponents: {
                localID: string[];
            }[];
            prefabRootNode?: {
                name: string;
                path: string;
                nodeId: string;
            } | undefined;
        } | undefined;
    } | null;
    assetType: string;
    assetUuid: string;
    components: {
        enabled: boolean;
        name: string;
        type: string;
        path: string;
        uuid: string;
        cid: string;
    }[];
    children: import("../../core/scene").INode[];
    assetName: string;
    assetUrl: string;
}, {
    name: string;
    prefab: {
        fileId: string;
        targetOverrides: {
            target: {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            source: {
                enabled: boolean;
                name: string;
                type: string;
                path: string;
                uuid: string;
                cid: string;
            } | {
                name: string;
                path: string;
                nodeId: string;
            } | null;
            targetInfo: {
                localID: string[];
            } | null;
            propertyPath: string[];
            sourceInfo: {
                localID: string[];
            } | null;
        }[];
        nestedPrefabInstanceRoots: {
            name: string;
            path: string;
            nodeId: string;
        }[];
        asset?: {
            name: string;
            data: {
                name: string;
                path: string;
                nodeId: string;
            };
            uuid: string;
            persistent: boolean;
            optimizationPolicy: number;
        } | undefined;
        root?: {
            name: string;
            path: string;
            nodeId: string;
        } | undefined;
        instance?: {
            fileId: string;
            mountedChildren: {
                nodes: {
                    name: string;
                    path: string;
                    nodeId: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            mountedComponents: {
                components: {
                    enabled: boolean;
                    name: string;
                    type: string;
                    path: string;
                    uuid: string;
                    cid: string;
                }[];
                targetInfo: {
                    localID: string[];
                } | null;
            }[];
            propertyOverrides: {
                targetInfo: {
                    localID: string[];
                } | null;
                propertyPath: string[];
                value?: any;
            }[];
            removedComponents: {
                localID: string[];
            }[];
            prefabRootNode?: {
                name: string;
                path: string;
                nodeId: string;
            } | undefined;
        } | undefined;
    } | null;
    assetType: string;
    assetUuid: string;
    assetName: string;
    assetUrl: string;
    components?: {
        enabled: boolean;
        name: string;
        type: string;
        path: string;
        uuid: string;
        cid: string;
    }[] | undefined;
    children?: import("../../core/scene").INode[] | undefined;
}>, z.ZodType<import("../../core/scene").INode, z.ZodTypeDef, import("../../core/scene").INode>]>;
export declare const SchemaCloseResult: z.ZodBoolean;
export declare const SchemaSaveResult: z.ZodNullable<z.ZodType<any, z.ZodTypeDef, any>>;
export declare const SchemaReload: z.ZodBoolean;
export declare const SchemaCreateOptions: z.ZodObject<{
    baseName: z.ZodString;
    templateType: z.ZodOptional<z.ZodEnum<["2d", "3d", "quality"]>>;
    dbURL: z.ZodString;
}, "strip", z.ZodTypeAny, {
    dbURL: string;
    baseName: string;
    templateType?: "3d" | "2d" | "quality" | undefined;
}, {
    dbURL: string;
    baseName: string;
    templateType?: "3d" | "2d" | "quality" | undefined;
}>;
export declare const SchemaCreateResult: z.ZodObject<{
    assetName: z.ZodString;
    assetUuid: z.ZodString;
    assetUrl: z.ZodString;
    assetType: z.ZodString;
}, "strip", z.ZodTypeAny, {
    assetType: string;
    assetUuid: string;
    assetName: string;
    assetUrl: string;
}, {
    assetType: string;
    assetUuid: string;
    assetName: string;
    assetUrl: string;
}>;
export type TAssetUrlOrUUID = z.infer<typeof SchemaAssetUrlOrUUID>;
export type TCurrentResult = z.infer<typeof SchemaCurrentResult>;
export type TOpenResult = z.infer<typeof SchemaOpenResult>;
export type TCloseResult = z.infer<typeof SchemaCloseResult>;
export type TSaveResult = z.infer<typeof SchemaSaveResult>;
export type TReload = z.infer<typeof SchemaReload>;
export type TCreateOptions = z.infer<typeof SchemaCreateOptions>;
export type TCreateResult = z.infer<typeof SchemaCreateResult>;
