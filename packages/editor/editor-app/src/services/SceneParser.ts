/**
 * @zh 场景解析器 - 从场景 JSON 提取节点层级（不需要反序列化）
 * @en Scene Parser - Extract node hierarchy from scene JSON (without deserialization)
 *
 * 用于 Scene 模式编辑时显示节点树，无需加载自定义脚本或材质
 * Used for Scene mode editing to display node tree without loading custom scripts or materials
 */

export interface ParsedNode {
    id: string;
    name: string;
    active: boolean;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; w: number };
    scale: { x: number; y: number; z: number };
    components: ParsedComponent[];
    children: ParsedNode[];
}

export interface ParsedComponent {
    type: string;
    classId?: string;
    className?: string;
    enabled: boolean;
}

export interface ParsedScene {
    name: string;
    nodes: ParsedNode[];
    raw: unknown;
}

/**
 * @zh 从场景 JSON 数组解析节点层级
 * @en Parse node hierarchy from scene JSON array
 *
 * Cocos 场景 JSON 格式是一个扁平数组，每个元素有 __type__ 和引用其他元素的 __id__
 */
export function parseSceneJson(sceneData: unknown[]): ParsedScene {
    if (!Array.isArray(sceneData)) {
        return { name: 'Unknown', nodes: [], raw: sceneData };
    }

    // Build index map for quick lookup
    const indexMap = new Map<number, unknown>();
    sceneData.forEach((item, index) => {
        indexMap.set(index, item);
    });

    // Find the SceneAsset (usually first element)
    const sceneAsset = sceneData[0] as { __type__?: string; _name?: string; scene?: { __id__: number } };
    const sceneName = sceneAsset?._name || 'Scene';

    // Find the Scene node
    const sceneRef = sceneAsset?.scene;
    if (!sceneRef || typeof sceneRef.__id__ !== 'number') {
        return { name: sceneName, nodes: [], raw: sceneData };
    }

    const sceneNode = sceneData[sceneRef.__id__] as {
        __type__?: string;
        _children?: Array<{ __id__: number }>;
    };

    if (!sceneNode?._children) {
        return { name: sceneName, nodes: [], raw: sceneData };
    }

    // Parse root nodes
    const nodes = sceneNode._children
        .filter(ref => ref && typeof ref.__id__ === 'number')
        .map(ref => parseNode(sceneData, ref.__id__, indexMap))
        .filter((node): node is ParsedNode => node !== null);

    return { name: sceneName, nodes, raw: sceneData };
}

/**
 * @zh 解析单个节点
 * @en Parse a single node
 */
function parseNode(
    sceneData: unknown[],
    nodeIndex: number,
    indexMap: Map<number, unknown>
): ParsedNode | null {
    const nodeData = indexMap.get(nodeIndex) as {
        __type__?: string;
        _name?: string;
        _active?: boolean;
        _lpos?: { x: number; y: number; z: number };
        _lrot?: { x: number; y: number; z: number; w: number };
        _lscale?: { x: number; y: number; z: number };
        _children?: Array<{ __id__: number }>;
        _components?: Array<{ __id__: number }>;
        node?: { __id__: number };
    } | undefined;

    if (!nodeData) return null;

    // Check if this is a Node type
    const type = nodeData.__type__;
    if (type && type !== 'cc.Node' && type !== 'cc.Scene' && !type.startsWith('cc.')) {
        // Skip non-node types
        return null;
    }

    const id = `node_${nodeIndex}`;
    const name = nodeData._name || `Node_${nodeIndex}`;
    const active = nodeData._active !== false;

    const position = nodeData._lpos || { x: 0, y: 0, z: 0 };
    const rotation = nodeData._lrot || { x: 0, y: 0, z: 0, w: 1 };
    const scale = nodeData._lscale || { x: 1, y: 1, z: 1 };

    // Parse components
    const components: ParsedComponent[] = [];
    if (nodeData._components) {
        for (const compRef of nodeData._components) {
            if (compRef && typeof compRef.__id__ === 'number') {
                const comp = parseComponent(sceneData, compRef.__id__, indexMap);
                if (comp) components.push(comp);
            }
        }
    }

    // Parse children recursively
    const children: ParsedNode[] = [];
    if (nodeData._children) {
        for (const childRef of nodeData._children) {
            if (childRef && typeof childRef.__id__ === 'number') {
                const child = parseNode(sceneData, childRef.__id__, indexMap);
                if (child) children.push(child);
            }
        }
    }

    return {
        id,
        name,
        active,
        position,
        rotation,
        scale,
        components,
        children,
    };
}

/**
 * @zh 解析组件
 * @en Parse component
 */
function parseComponent(
    sceneData: unknown[],
    compIndex: number,
    indexMap: Map<number, unknown>
): ParsedComponent | null {
    const compData = indexMap.get(compIndex) as {
        __type__?: string;
        _enabled?: boolean;
    } | undefined;

    if (!compData) return null;

    const type = compData.__type__ || 'Unknown';
    const enabled = compData._enabled !== false;

    // Determine component type name
    let className: string;
    let classId: string | undefined;

    if (type.startsWith('cc.')) {
        // Built-in Cocos component
        className = type.substring(3); // Remove 'cc.' prefix
    } else if (type.length === 22 || type.length === 23) {
        // Likely a class ID (UUID format)
        classId = type;
        className = `Script (${type.substring(0, 8)}...)`; // Shortened ID
    } else {
        className = type;
    }

    return {
        type,
        classId,
        className,
        enabled,
    };
}

/**
 * @zh 查找节点通过 ID
 * @en Find node by ID
 */
export function findNodeById(nodes: ParsedNode[], id: string): ParsedNode | null {
    for (const node of nodes) {
        if (node.id === id) return node;
        const found = findNodeById(node.children, id);
        if (found) return found;
    }
    return null;
}

/**
 * @zh 获取所有节点的扁平列表
 * @en Get flat list of all nodes
 */
export function flattenNodes(nodes: ParsedNode[]): ParsedNode[] {
    const result: ParsedNode[] = [];
    const addNode = (node: ParsedNode) => {
        result.push(node);
        node.children.forEach(addNode);
    };
    nodes.forEach(addNode);
    return result;
}
