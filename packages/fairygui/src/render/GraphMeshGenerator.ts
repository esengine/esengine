/**
 * GraphMeshGenerator
 *
 * Generates mesh data for FairyGUI graph primitives (rect, ellipse, polygon).
 * Uses triangulation to convert shapes into triangles for GPU rendering.
 *
 * 为 FairyGUI 图形图元（矩形、椭圆、多边形）生成网格数据
 * 使用三角化将形状转换为 GPU 可渲染的三角形
 */

/**
 * Mesh vertex data
 * 网格顶点数据
 */
export interface MeshVertex {
    x: number;
    y: number;
    u: number;
    v: number;
    color: number;
}

/**
 * Generated mesh data
 * 生成的网格数据
 */
export interface GraphMeshData {
    /** Vertex positions [x, y, ...] | 顶点位置 */
    positions: number[];
    /** Texture coordinates [u, v, ...] | 纹理坐标 */
    uvs: number[];
    /** Vertex colors (packed RGBA) | 顶点颜色 */
    colors: number[];
    /** Triangle indices | 三角形索引 */
    indices: number[];
}

/**
 * GraphMeshGenerator
 *
 * Generates mesh data for various graph shapes.
 * 为各种图形形状生成网格数据
 */
export class GraphMeshGenerator {
    /**
     * Generate mesh for a filled rectangle
     * 生成填充矩形的网格
     */
    public static generateRect(
        width: number,
        height: number,
        fillColor: number,
        cornerRadius?: number[]
    ): GraphMeshData {
        // Simple rectangle without corner radius
        // 没有圆角的简单矩形
        if (!cornerRadius || cornerRadius.every(r => r <= 0)) {
            return this.generateSimpleRect(width, height, fillColor);
        }

        // Rectangle with corner radius - generate as polygon
        // 带圆角的矩形 - 作为多边形生成
        return this.generateRoundedRect(width, height, fillColor, cornerRadius);
    }

    /**
     * Generate simple rectangle (4 vertices, 2 triangles)
     * 生成简单矩形（4 个顶点，2 个三角形）
     */
    private static generateSimpleRect(
        width: number,
        height: number,
        color: number
    ): GraphMeshData {
        // Vertices: top-left, top-right, bottom-right, bottom-left
        const positions = [
            0, 0,           // top-left
            width, 0,       // top-right
            width, height,  // bottom-right
            0, height       // bottom-left
        ];

        const uvs = [
            0, 0,
            1, 0,
            1, 1,
            0, 1
        ];

        const colors = [color, color, color, color];

        // Two triangles: 0-1-2, 0-2-3
        const indices = [0, 1, 2, 0, 2, 3];

        return { positions, uvs, colors, indices };
    }

    /**
     * Generate rounded rectangle
     * 生成圆角矩形
     */
    private static generateRoundedRect(
        width: number,
        height: number,
        color: number,
        cornerRadius: number[]
    ): GraphMeshData {
        const [tl, tr, br, bl] = cornerRadius;
        const segments = 8; // Segments per corner

        const points: number[] = [];

        // Generate points for each corner
        // Top-left corner
        this.addCornerPoints(points, tl, tl, tl, Math.PI, Math.PI * 1.5, segments);
        // Top-right corner
        this.addCornerPoints(points, width - tr, tr, tr, Math.PI * 1.5, Math.PI * 2, segments);
        // Bottom-right corner
        this.addCornerPoints(points, width - br, height - br, br, 0, Math.PI * 0.5, segments);
        // Bottom-left corner
        this.addCornerPoints(points, bl, height - bl, bl, Math.PI * 0.5, Math.PI, segments);

        // Triangulate the polygon
        return this.triangulatePolygon(points, width, height, color);
    }

    /**
     * Add corner arc points
     * 添加圆角弧线点
     */
    private static addCornerPoints(
        points: number[],
        cx: number,
        cy: number,
        radius: number,
        startAngle: number,
        endAngle: number,
        segments: number
    ): void {
        if (radius <= 0) {
            points.push(cx, cy);
            return;
        }

        const angleStep = (endAngle - startAngle) / segments;
        for (let i = 0; i <= segments; i++) {
            const angle = startAngle + angleStep * i;
            points.push(
                cx + Math.cos(angle) * radius,
                cy + Math.sin(angle) * radius
            );
        }
    }

    /**
     * Generate mesh for an ellipse
     * 生成椭圆的网格
     */
    public static generateEllipse(
        width: number,
        height: number,
        fillColor: number
    ): GraphMeshData {
        const radiusX = width / 2;
        const radiusY = height / 2;
        const centerX = radiusX;
        const centerY = radiusY;

        // Calculate number of segments based on perimeter
        // 根据周长计算分段数
        const perimeter = Math.PI * (radiusX + radiusY);
        const segments = Math.min(Math.max(Math.ceil(perimeter / 4), 24), 128);

        const positions: number[] = [centerX, centerY]; // Center vertex
        const uvs: number[] = [0.5, 0.5]; // Center UV
        const colors: number[] = [fillColor];
        const indices: number[] = [];

        const angleStep = (Math.PI * 2) / segments;

        for (let i = 0; i <= segments; i++) {
            const angle = angleStep * i;
            const x = centerX + Math.cos(angle) * radiusX;
            const y = centerY + Math.sin(angle) * radiusY;

            positions.push(x, y);
            uvs.push(
                (Math.cos(angle) + 1) / 2,
                (Math.sin(angle) + 1) / 2
            );
            colors.push(fillColor);

            // Create triangle from center to edge
            if (i > 0) {
                indices.push(0, i, i + 1);
            }
        }

        // Close the circle
        indices.push(0, segments, 1);

        return { positions, uvs, colors, indices };
    }

    /**
     * Generate mesh for a polygon
     * 生成多边形的网格
     *
     * Uses ear clipping algorithm for triangulation.
     * 使用耳切法进行三角化
     */
    public static generatePolygon(
        points: number[],
        width: number,
        height: number,
        fillColor: number
    ): GraphMeshData {
        return this.triangulatePolygon(points, width, height, fillColor);
    }

    /**
     * Triangulate a polygon using ear clipping algorithm
     * 使用耳切法三角化多边形
     */
    private static triangulatePolygon(
        points: number[],
        width: number,
        height: number,
        color: number
    ): GraphMeshData {
        const numVertices = points.length / 2;
        if (numVertices < 3) {
            return { positions: [], uvs: [], colors: [], indices: [] };
        }

        const positions: number[] = [...points];
        const uvs: number[] = [];
        const colors: number[] = [];

        // Generate UVs based on position
        for (let i = 0; i < numVertices; i++) {
            const x = points[i * 2];
            const y = points[i * 2 + 1];
            uvs.push(width > 0 ? x / width : 0, height > 0 ? y / height : 0);
            colors.push(color);
        }

        // Ear clipping triangulation
        const indices: number[] = [];
        const restIndices: number[] = [];
        for (let i = 0; i < numVertices; i++) {
            restIndices.push(i);
        }

        while (restIndices.length > 3) {
            let earFound = false;

            for (let i = 0; i < restIndices.length; i++) {
                const i0 = restIndices[i];
                const i1 = restIndices[(i + 1) % restIndices.length];
                const i2 = restIndices[(i + 2) % restIndices.length];

                const ax = points[i0 * 2], ay = points[i0 * 2 + 1];
                const bx = points[i1 * 2], by = points[i1 * 2 + 1];
                const cx = points[i2 * 2], cy = points[i2 * 2 + 1];

                // Check if this is a convex vertex (ear candidate)
                if ((ay - by) * (cx - bx) + (bx - ax) * (cy - by) >= 0) {
                    // Check if no other point is inside this triangle
                    let isEar = true;
                    for (let j = 0; j < restIndices.length; j++) {
                        if (j === i || j === (i + 1) % restIndices.length || j === (i + 2) % restIndices.length) {
                            continue;
                        }
                        const idx = restIndices[j];
                        const px = points[idx * 2], py = points[idx * 2 + 1];
                        if (this.isPointInTriangle(px, py, ax, ay, bx, by, cx, cy)) {
                            isEar = false;
                            break;
                        }
                    }

                    if (isEar) {
                        indices.push(i0, i1, i2);
                        restIndices.splice((i + 1) % restIndices.length, 1);
                        earFound = true;
                        break;
                    }
                }
            }

            if (!earFound) {
                // No ear found, polygon may be degenerate
                break;
            }
        }

        // Add the last triangle
        if (restIndices.length === 3) {
            indices.push(restIndices[0], restIndices[1], restIndices[2]);
        }

        return { positions, uvs, colors, indices };
    }

    /**
     * Check if point is inside triangle
     * 检查点是否在三角形内
     */
    private static isPointInTriangle(
        px: number, py: number,
        ax: number, ay: number,
        bx: number, by: number,
        cx: number, cy: number
    ): boolean {
        const v0x = cx - ax, v0y = cy - ay;
        const v1x = bx - ax, v1y = by - ay;
        const v2x = px - ax, v2y = py - ay;

        const dot00 = v0x * v0x + v0y * v0y;
        const dot01 = v0x * v1x + v0y * v1y;
        const dot02 = v0x * v2x + v0y * v2y;
        const dot11 = v1x * v1x + v1y * v1y;
        const dot12 = v1x * v2x + v1y * v2y;

        const invDen = 1 / (dot00 * dot11 - dot01 * dot01);
        const u = (dot11 * dot02 - dot01 * dot12) * invDen;
        const v = (dot00 * dot12 - dot01 * dot02) * invDen;

        return u >= 0 && v >= 0 && u + v < 1;
    }

    /**
     * Generate outline mesh (stroke)
     * 生成轮廓线网格（描边）
     */
    public static generateOutline(
        points: number[],
        lineWidth: number,
        lineColor: number,
        closed: boolean = true
    ): GraphMeshData {
        const numPoints = points.length / 2;
        if (numPoints < 2) {
            return { positions: [], uvs: [], colors: [], indices: [] };
        }

        const positions: number[] = [];
        const uvs: number[] = [];
        const colors: number[] = [];
        const indices: number[] = [];

        const halfWidth = lineWidth / 2;

        for (let i = 0; i < numPoints; i++) {
            const x0 = points[i * 2];
            const y0 = points[i * 2 + 1];

            let x1: number, y1: number;
            if (i < numPoints - 1) {
                x1 = points[(i + 1) * 2];
                y1 = points[(i + 1) * 2 + 1];
            } else if (closed) {
                x1 = points[0];
                y1 = points[1];
            } else {
                continue; // Last point, no segment
            }

            // Calculate perpendicular vector
            const dx = x1 - x0;
            const dy = y1 - y0;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 0.001) continue;

            const nx = -dy / len * halfWidth;
            const ny = dx / len * halfWidth;

            // Add 4 vertices for this segment (quad)
            const baseIdx = positions.length / 2;
            positions.push(
                x0 - nx, y0 - ny,
                x0 + nx, y0 + ny,
                x1 - nx, y1 - ny,
                x1 + nx, y1 + ny
            );

            uvs.push(0, 0, 0, 1, 1, 0, 1, 1);
            colors.push(lineColor, lineColor, lineColor, lineColor);

            // Two triangles for the quad
            indices.push(
                baseIdx, baseIdx + 1, baseIdx + 3,
                baseIdx, baseIdx + 3, baseIdx + 2
            );

            // Joint with previous segment
            if (i > 0) {
                const prevBaseIdx = baseIdx - 4;
                indices.push(
                    prevBaseIdx + 2, prevBaseIdx + 3, baseIdx + 1,
                    prevBaseIdx + 2, baseIdx + 1, baseIdx
                );
            }
        }

        // Close the outline joints
        if (closed && numPoints > 2) {
            const lastBaseIdx = positions.length / 2 - 4;
            indices.push(
                lastBaseIdx + 2, lastBaseIdx + 3, 1,
                lastBaseIdx + 2, 1, 0
            );
        }

        return { positions, uvs, colors, indices };
    }

    /**
     * Generate mesh for rectangle outline
     * 生成矩形轮廓线网格
     */
    public static generateRectOutline(
        width: number,
        height: number,
        lineWidth: number,
        lineColor: number,
        cornerRadius?: number[]
    ): GraphMeshData {
        const points: number[] = [];

        if (!cornerRadius || cornerRadius.every(r => r <= 0)) {
            // Simple rectangle
            points.push(0, 0, width, 0, width, height, 0, height);
        } else {
            // Rounded rectangle
            const [tl, tr, br, bl] = cornerRadius;
            const segments = 8;

            this.addCornerPoints(points, tl, tl, tl, Math.PI, Math.PI * 1.5, segments);
            this.addCornerPoints(points, width - tr, tr, tr, Math.PI * 1.5, Math.PI * 2, segments);
            this.addCornerPoints(points, width - br, height - br, br, 0, Math.PI * 0.5, segments);
            this.addCornerPoints(points, bl, height - bl, bl, Math.PI * 0.5, Math.PI, segments);
        }

        return this.generateOutline(points, lineWidth, lineColor, true);
    }

    /**
     * Generate mesh for ellipse outline
     * 生成椭圆轮廓线网格
     */
    public static generateEllipseOutline(
        width: number,
        height: number,
        lineWidth: number,
        lineColor: number
    ): GraphMeshData {
        const radiusX = width / 2;
        const radiusY = height / 2;
        const centerX = radiusX;
        const centerY = radiusY;

        const perimeter = Math.PI * (radiusX + radiusY);
        const segments = Math.min(Math.max(Math.ceil(perimeter / 4), 24), 128);

        const points: number[] = [];
        const angleStep = (Math.PI * 2) / segments;

        for (let i = 0; i < segments; i++) {
            const angle = angleStep * i;
            points.push(
                centerX + Math.cos(angle) * radiusX,
                centerY + Math.sin(angle) * radiusY
            );
        }

        return this.generateOutline(points, lineWidth, lineColor, true);
    }
}
