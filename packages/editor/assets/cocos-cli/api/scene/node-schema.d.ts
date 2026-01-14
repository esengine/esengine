import { z } from 'zod';
import { INode } from '../../core/scene';
export declare const SchemaNodeProperty: z.ZodObject<{
    position: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        z: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        z: number;
    }, {
        x: number;
        y: number;
        z: number;
    }>;
    rotation: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        z: z.ZodNumber;
        w: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        z: number;
        w: number;
    }, {
        x: number;
        y: number;
        z: number;
        w: number;
    }>;
    eulerAngles: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        z: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        z: number;
    }, {
        x: number;
        y: number;
        z: number;
    }>;
    scale: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        z: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        z: number;
    }, {
        x: number;
        y: number;
        z: number;
    }>;
    mobility: z.ZodNumber;
    layer: z.ZodNumber;
    active: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    layer: number;
    rotation: {
        x: number;
        y: number;
        z: number;
        w: number;
    };
    scale: {
        x: number;
        y: number;
        z: number;
    };
    position: {
        x: number;
        y: number;
        z: number;
    };
    eulerAngles: {
        x: number;
        y: number;
        z: number;
    };
    mobility: number;
    active: boolean;
}, {
    layer: number;
    rotation: {
        x: number;
        y: number;
        z: number;
        w: number;
    };
    scale: {
        x: number;
        y: number;
        z: number;
    };
    position: {
        x: number;
        y: number;
        z: number;
    };
    eulerAngles: {
        x: number;
        y: number;
        z: number;
    };
    mobility: number;
    active: boolean;
}>;
export declare const SchemaNode: z.ZodType<INode>;
export declare const SchemaNodeSearch: z.ZodObject<{
    nodeId: z.ZodString;
    path: z.ZodString;
    name: z.ZodString;
} & {
    deeps: z.ZodDefault<z.ZodNumber>;
    queryChildren: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    path: string;
    nodeId: string;
    deeps: number;
    queryChildren: boolean;
}, {
    name: string;
    path: string;
    nodeId: string;
    deeps?: number | undefined;
    queryChildren?: boolean | undefined;
}>;
export declare const SchemaNodeQuery: z.ZodObject<{
    path: z.ZodString;
    queryChildren: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    path: string;
    queryChildren: boolean;
}, {
    path: string;
    queryChildren?: boolean | undefined;
}>;
export declare const SchemaNodeQueryResult: z.ZodType<INode>;
export declare const SchemaNodeUpdate: z.ZodObject<{
    path: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    properties: z.ZodOptional<z.ZodObject<{
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x: number;
            y: number;
            z: number;
        }>>;
        rotation: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
            w: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
            w: number;
        }, {
            x: number;
            y: number;
            z: number;
            w: number;
        }>>;
        eulerAngles: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x: number;
            y: number;
            z: number;
        }>>;
        scale: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x: number;
            y: number;
            z: number;
        }>>;
        mobility: z.ZodOptional<z.ZodNumber>;
        layer: z.ZodOptional<z.ZodNumber>;
        active: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        layer?: number | undefined;
        rotation?: {
            x: number;
            y: number;
            z: number;
            w: number;
        } | undefined;
        scale?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        position?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        eulerAngles?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        mobility?: number | undefined;
        active?: boolean | undefined;
    }, {
        layer?: number | undefined;
        rotation?: {
            x: number;
            y: number;
            z: number;
            w: number;
        } | undefined;
        scale?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        position?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        eulerAngles?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        mobility?: number | undefined;
        active?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    name?: string | undefined;
    properties?: {
        layer?: number | undefined;
        rotation?: {
            x: number;
            y: number;
            z: number;
            w: number;
        } | undefined;
        scale?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        position?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        eulerAngles?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        mobility?: number | undefined;
        active?: boolean | undefined;
    } | undefined;
}, {
    path: string;
    name?: string | undefined;
    properties?: {
        layer?: number | undefined;
        rotation?: {
            x: number;
            y: number;
            z: number;
            w: number;
        } | undefined;
        scale?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        position?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        eulerAngles?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        mobility?: number | undefined;
        active?: boolean | undefined;
    } | undefined;
}>;
export declare const SchemaNodeUpdateResult: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const SchemaNodeDeleteResult: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const SchemaNodeDelete: z.ZodObject<{
    path: z.ZodString;
    keepWorldTransform: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    path: string;
    keepWorldTransform?: boolean | undefined;
}, {
    path: string;
    keepWorldTransform?: boolean | undefined;
}>;
export declare const SchemaNodeCreateByAsset: z.ZodObject<{
    path: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    workMode: z.ZodOptional<z.ZodEnum<["2d", "3d"]>>;
    keepWorldTransform: z.ZodOptional<z.ZodBoolean>;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        z: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        z: number;
    }, {
        x: number;
        y: number;
        z: number;
    }>>;
    canvasRequired: z.ZodOptional<z.ZodBoolean>;
} & {
    dbURL: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    dbURL: string;
    name?: string | undefined;
    position?: {
        x: number;
        y: number;
        z: number;
    } | undefined;
    keepWorldTransform?: boolean | undefined;
    workMode?: "3d" | "2d" | undefined;
    canvasRequired?: boolean | undefined;
}, {
    path: string;
    dbURL: string;
    name?: string | undefined;
    position?: {
        x: number;
        y: number;
        z: number;
    } | undefined;
    keepWorldTransform?: boolean | undefined;
    workMode?: "3d" | "2d" | undefined;
    canvasRequired?: boolean | undefined;
}>;
export declare const SchemaNodeCreateByType: z.ZodObject<{
    path: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    workMode: z.ZodOptional<z.ZodEnum<["2d", "3d"]>>;
    keepWorldTransform: z.ZodOptional<z.ZodBoolean>;
    position: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        z: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        z: number;
    }, {
        x: number;
        y: number;
        z: number;
    }>>;
    canvasRequired: z.ZodOptional<z.ZodBoolean>;
} & {
    nodeType: z.ZodEnum<[string, ...string[]]>;
}, "strip", z.ZodTypeAny, {
    path: string;
    nodeType: string;
    name?: string | undefined;
    position?: {
        x: number;
        y: number;
        z: number;
    } | undefined;
    keepWorldTransform?: boolean | undefined;
    workMode?: "3d" | "2d" | undefined;
    canvasRequired?: boolean | undefined;
}, {
    path: string;
    nodeType: string;
    name?: string | undefined;
    position?: {
        x: number;
        y: number;
        z: number;
    } | undefined;
    keepWorldTransform?: boolean | undefined;
    workMode?: "3d" | "2d" | undefined;
    canvasRequired?: boolean | undefined;
}>;
export type TDeleteNodeOptions = z.infer<typeof SchemaNodeDelete>;
export type TUpdateNodeOptions = z.infer<typeof SchemaNodeUpdate>;
export type TCreateNodeByAssetOptions = z.infer<typeof SchemaNodeCreateByAsset>;
export type TCreateNodeByTypeOptions = z.infer<typeof SchemaNodeCreateByType>;
export type TQueryNodeOptions = z.infer<typeof SchemaNodeQuery>;
export type TNodeDetail = z.infer<typeof SchemaNodeQueryResult>;
export type TNodeUpdateResult = z.infer<typeof SchemaNodeUpdateResult>;
export type TNodeDeleteResult = z.infer<typeof SchemaNodeDeleteResult>;
export type TNode = z.infer<typeof SchemaNode>;
