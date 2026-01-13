import { z } from 'zod';
export declare const SchemaOptimizationPolicy: z.ZodNumber;
export declare const SchemaTargetInfo: z.ZodObject<{
    localID: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    localID: string[];
}, {
    localID: string[];
}>;
export declare const SchemaMountedChildrenInfo: z.ZodObject<{
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
}>;
export declare const SchemaPropertyOverrideInfo: z.ZodObject<{
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
}>;
export declare const SchemaMountedComponentsInfo: z.ZodObject<{
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
}>;
export declare const SchemaPrefabInstance: z.ZodObject<{
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
}>;
export declare const SchemaCompPrefabInfo: z.ZodObject<{
    fileId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fileId: string;
}, {
    fileId: string;
}>;
export declare const SchemaTargetOverrideInfo: z.ZodObject<{
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
}>;
export declare const SchemaPrefab: z.ZodObject<{
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
}>;
/** Associated prefab asset information */ export declare const SchemaPrefabInfo: z.ZodNullable<z.ZodObject<{
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
}>>;
