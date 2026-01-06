/**
 * @zh 蓝图路径工具
 * @en Blueprint Path Utilities
 *
 * @zh 用于解析和操作数据路径，支持数组索引和嵌套属性访问
 * @en Used to parse and manipulate data paths, supports array indices and nested property access
 */

// ============================================================================
// Path Types
// ============================================================================

/**
 * @zh 路径部分类型
 * @en Path part type
 */
export type PathPartType = 'property' | 'index' | 'wildcard';

/**
 * @zh 路径部分
 * @en Path part
 */
export interface PathPart {
    type: PathPartType;
    /** Property name (for 'property' type) */
    name?: string;
    /** Array index (for 'index' type) */
    index?: number;
}

/**
 * @zh 端口地址 - 解析后的路径结构
 * @en Port address - parsed path structure
 */
export interface PortAddress {
    /** Base property name (基础属性名) */
    baseName: string;
    /** Array indices [0, 2] represents arr[0][2] (数组索引路径) */
    indices: number[];
    /** Nested property path ['x', 'y'] (嵌套属性路径) */
    subPath: string[];
    /** Original path string (原始路径字符串) */
    original: string;
}

// ============================================================================
// Path Parsing
// ============================================================================

/**
 * @zh 解析路径字符串为部分数组
 * @en Parse path string to parts array
 *
 * @example
 * parsePath("waypoints[0].position.x")
 * // => [
 * //   { type: 'property', name: 'waypoints' },
 * //   { type: 'index', index: 0 },
 * //   { type: 'property', name: 'position' },
 * //   { type: 'property', name: 'x' }
 * // ]
 */
export function parsePath(path: string): PathPart[] {
    const parts: PathPart[] = [];
    const regex = /([^.\[\]]+)|\[(\*|\d+)\]/g;
    let match;

    while ((match = regex.exec(path)) !== null) {
        if (match[1]) {
            // Property name
            parts.push({ type: 'property', name: match[1] });
        } else if (match[2] === '*') {
            // Wildcard
            parts.push({ type: 'wildcard' });
        } else {
            // Array index
            parts.push({ type: 'index', index: parseInt(match[2], 10) });
        }
    }

    return parts;
}

/**
 * @zh 解析端口路径字符串为 PortAddress
 * @en Parse port path string to PortAddress
 *
 * @example
 * parsePortPath("waypoints[0].position.x")
 * // => { baseName: "waypoints", indices: [0], subPath: ["position", "x"], original: "..." }
 */
export function parsePortPath(path: string): PortAddress {
    const result: PortAddress = {
        baseName: '',
        indices: [],
        subPath: [],
        original: path
    };

    const parts = parsePath(path);
    let foundFirstIndex = false;
    let afterIndices = false;

    for (const part of parts) {
        if (part.type === 'property') {
            if (!foundFirstIndex) {
                if (result.baseName) {
                    // Multiple properties before index - treat as nested base
                    result.baseName += '.' + part.name;
                } else {
                    result.baseName = part.name!;
                }
            } else {
                afterIndices = true;
                result.subPath.push(part.name!);
            }
        } else if (part.type === 'index') {
            foundFirstIndex = true;
            if (!afterIndices) {
                result.indices.push(part.index!);
            } else {
                // Index after property - encode in subPath
                result.subPath.push(`[${part.index}]`);
            }
        }
    }

    return result;
}

/**
 * @zh 构建路径字符串
 * @en Build path string from parts
 */
export function buildPath(parts: PathPart[]): string {
    let path = '';

    for (const part of parts) {
        switch (part.type) {
            case 'property':
                if (path && !path.endsWith('[')) {
                    path += '.';
                }
                path += part.name;
                break;
            case 'index':
                path += `[${part.index}]`;
                break;
            case 'wildcard':
                path += '[*]';
                break;
        }
    }

    return path;
}

/**
 * @zh 从 PortAddress 构建路径字符串
 * @en Build path string from PortAddress
 */
export function buildPortPath(address: PortAddress): string {
    let path = address.baseName;

    for (const index of address.indices) {
        path += `[${index}]`;
    }

    if (address.subPath.length > 0) {
        for (const sub of address.subPath) {
            if (sub.startsWith('[')) {
                path += sub;
            } else {
                path += '.' + sub;
            }
        }
    }

    return path;
}

// ============================================================================
// Data Access
// ============================================================================

/**
 * @zh 根据路径获取数据
 * @en Get data by path
 *
 * @example
 * const data = { waypoints: [{ position: { x: 10, y: 20 } }] };
 * getByPath(data, "waypoints[0].position.x") // => 10
 */
export function getByPath(data: unknown, path: string): unknown {
    if (!path) return data;

    const parts = parsePath(path);
    let current: unknown = data;

    for (const part of parts) {
        if (current === null || current === undefined) {
            return undefined;
        }

        switch (part.type) {
            case 'property':
                if (typeof current === 'object' && current !== null) {
                    current = (current as Record<string, unknown>)[part.name!];
                } else {
                    return undefined;
                }
                break;

            case 'index':
                if (Array.isArray(current)) {
                    current = current[part.index!];
                } else {
                    return undefined;
                }
                break;

            case 'wildcard':
                // Wildcard returns array of all values
                if (Array.isArray(current)) {
                    return current;
                }
                return undefined;
        }
    }

    return current;
}

/**
 * @zh 根据路径设置数据
 * @en Set data by path
 *
 * @example
 * const data = { waypoints: [{ position: { x: 0, y: 0 } }] };
 * setByPath(data, "waypoints[0].position.x", 100);
 * // data.waypoints[0].position.x === 100
 */
export function setByPath(data: unknown, path: string, value: unknown): boolean {
    if (!path) return false;

    const parts = parsePath(path);
    let current: unknown = data;

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];

        if (current === null || current === undefined) {
            return false;
        }

        switch (part.type) {
            case 'property':
                if (typeof current === 'object' && current !== null) {
                    current = (current as Record<string, unknown>)[part.name!];
                } else {
                    return false;
                }
                break;

            case 'index':
                if (Array.isArray(current)) {
                    current = current[part.index!];
                } else {
                    return false;
                }
                break;

            case 'wildcard':
                // Cannot set on wildcard
                return false;
        }
    }

    // Set the final value
    const lastPart = parts[parts.length - 1];

    if (current === null || current === undefined) {
        return false;
    }

    switch (lastPart.type) {
        case 'property':
            if (typeof current === 'object' && current !== null) {
                (current as Record<string, unknown>)[lastPart.name!] = value;
                return true;
            }
            break;

        case 'index':
            if (Array.isArray(current)) {
                current[lastPart.index!] = value;
                return true;
            }
            break;
    }

    return false;
}

/**
 * @zh 检查路径是否存在
 * @en Check if path exists
 */
export function hasPath(data: unknown, path: string): boolean {
    return getByPath(data, path) !== undefined;
}

/**
 * @zh 删除路径上的数据
 * @en Delete data at path
 */
export function deleteByPath(data: unknown, path: string): boolean {
    if (!path) return false;

    const parts = parsePath(path);
    let current: unknown = data;

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];

        if (current === null || current === undefined) {
            return false;
        }

        switch (part.type) {
            case 'property':
                if (typeof current === 'object' && current !== null) {
                    current = (current as Record<string, unknown>)[part.name!];
                } else {
                    return false;
                }
                break;

            case 'index':
                if (Array.isArray(current)) {
                    current = current[part.index!];
                } else {
                    return false;
                }
                break;

            default:
                return false;
        }
    }

    const lastPart = parts[parts.length - 1];

    if (current === null || current === undefined) {
        return false;
    }

    switch (lastPart.type) {
        case 'property':
            if (typeof current === 'object' && current !== null) {
                delete (current as Record<string, unknown>)[lastPart.name!];
                return true;
            }
            break;

        case 'index':
            if (Array.isArray(current)) {
                current.splice(lastPart.index!, 1);
                return true;
            }
            break;
    }

    return false;
}

// ============================================================================
// Array Operations
// ============================================================================

/**
 * @zh 数组操作类型
 * @en Array operation type
 */
export type ArrayOperation = 'insert' | 'remove' | 'move';

/**
 * @zh 当数组元素变化时，更新路径中的索引
 * @en Update indices in path when array elements change
 *
 * @param path - Original path (原始路径)
 * @param arrayPath - Array base path (数组基础路径)
 * @param operation - Operation type (操作类型)
 * @param index - Target index (目标索引)
 * @param toIndex - Move destination (移动目标，仅 move 操作)
 * @returns Updated path or empty string if path becomes invalid (更新后的路径，如果路径失效则返回空字符串)
 */
export function updatePathOnArrayChange(
    path: string,
    arrayPath: string,
    operation: ArrayOperation,
    index: number,
    toIndex?: number
): string {
    // Check if path starts with arrayPath[
    if (!path.startsWith(arrayPath + '[')) {
        return path;
    }

    const address = parsePortPath(path);

    if (address.indices.length === 0) {
        return path;
    }

    const currentIndex = address.indices[0];

    switch (operation) {
        case 'insert':
            if (currentIndex >= index) {
                address.indices[0]++;
            }
            break;

        case 'remove':
            if (currentIndex === index) {
                return ''; // Path becomes invalid
            }
            if (currentIndex > index) {
                address.indices[0]--;
            }
            break;

        case 'move':
            if (toIndex !== undefined) {
                if (currentIndex === index) {
                    address.indices[0] = toIndex;
                } else if (index < toIndex) {
                    // Moving down
                    if (currentIndex > index && currentIndex <= toIndex) {
                        address.indices[0]--;
                    }
                } else {
                    // Moving up
                    if (currentIndex >= toIndex && currentIndex < index) {
                        address.indices[0]++;
                    }
                }
            }
            break;
    }

    return buildPortPath(address);
}

/**
 * @zh 展开带通配符的路径
 * @en Expand path with wildcards
 *
 * @example
 * const data = { items: [{ x: 1 }, { x: 2 }, { x: 3 }] };
 * expandWildcardPath("items[*].x", data)
 * // => ["items[0].x", "items[1].x", "items[2].x"]
 */
export function expandWildcardPath(path: string, data: unknown): string[] {
    const parts = parsePath(path);
    const results: string[] = [];

    function expand(currentParts: PathPart[], currentData: unknown, index: number): void {
        if (index >= parts.length) {
            results.push(buildPath(currentParts));
            return;
        }

        const part = parts[index];

        if (part.type === 'wildcard') {
            if (Array.isArray(currentData)) {
                for (let i = 0; i < currentData.length; i++) {
                    const newParts = [...currentParts, { type: 'index' as const, index: i }];
                    expand(newParts, currentData[i], index + 1);
                }
            }
        } else {
            const newParts = [...currentParts, part];
            let nextData: unknown;

            if (part.type === 'property' && typeof currentData === 'object' && currentData !== null) {
                nextData = (currentData as Record<string, unknown>)[part.name!];
            } else if (part.type === 'index' && Array.isArray(currentData)) {
                nextData = currentData[part.index!];
            }

            expand(newParts, nextData, index + 1);
        }
    }

    expand([], data, 0);
    return results;
}

/**
 * @zh 检查路径是否包含通配符
 * @en Check if path contains wildcards
 */
export function hasWildcard(path: string): boolean {
    return path.includes('[*]');
}

/**
 * @zh 获取路径的父路径
 * @en Get parent path
 *
 * @example
 * getParentPath("items[0].position.x") // => "items[0].position"
 * getParentPath("items[0]") // => "items"
 * getParentPath("items") // => ""
 */
export function getParentPath(path: string): string {
    const parts = parsePath(path);
    if (parts.length <= 1) {
        return '';
    }
    return buildPath(parts.slice(0, -1));
}

/**
 * @zh 获取路径的最后一部分名称
 * @en Get the last part name of path
 *
 * @example
 * getPathLastName("items[0].position.x") // => "x"
 * getPathLastName("items[0]") // => "[0]"
 */
export function getPathLastName(path: string): string {
    const parts = parsePath(path);
    if (parts.length === 0) {
        return '';
    }

    const last = parts[parts.length - 1];
    if (last.type === 'property') {
        return last.name!;
    } else if (last.type === 'index') {
        return `[${last.index}]`;
    } else {
        return '[*]';
    }
}
