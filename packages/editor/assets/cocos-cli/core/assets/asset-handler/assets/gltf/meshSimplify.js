"use strict";
/*
MIT License

Copyright(c) 2017-2020 Mattias Edlund

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/////////////////////////////////////////////
//
// Mesh Simplification Tutorial
//
// (C) by Sven Forstmann in 2014
//
// License : MIT
// http://opensource.org/licenses/MIT
//
//https://github.com/sp4cerat/Fast-Quadric-Mesh-Simplification
// @ts-nocheck 此方法有很多定义不明，暂时无法完善定义
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshSimplify = void 0;
exports.getDefaultSimplifyOptions = getDefaultSimplifyOptions;
exports.simplifyMesh = simplifyMesh;
const cc_1 = require("cc");
const cc_2 = require("cc");
const _tempVec2 = new cc_1.Vec2();
const _tempVec3 = new cc_1.Vec3();
const _tempVec3_2 = new cc_1.Vec3();
const _tempVec3_3 = new cc_1.Vec3();
const _tempVec4 = new cc_1.Vec4();
const _tempColor = new cc_1.Color();
const DenomEpilson = 0.00000001;
// 颜色相加
function colorScaleAndAdd(out, colora, colorb, scale) {
    out.r = Math.max(colora.r + colorb.r * scale, 255);
    out.g = Math.max(colora.g + colorb.g * scale, 255);
    out.b = Math.max(colora.b + colorb.b * scale, 255);
    out.a = Math.max(colora.a + colorb.a * scale, 255);
}
class SymetricMatrix {
    m;
    constructor() {
        this.m = new Array(10).fill(0);
    }
    set(m11, m12, m13, m14, m22, m23, m24, m33, m34, m44) {
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m13;
        this.m[3] = m14;
        this.m[4] = m22;
        this.m[5] = m23;
        this.m[6] = m24;
        this.m[7] = m33;
        this.m[8] = m34;
        this.m[9] = m44;
        return this;
    }
    makePlane(a, b, c, d) {
        return this.set(a * a, a * b, a * c, a * d, b * b, b * c, b * d, c * c, c * d, d * d);
    }
    det(a11, a12, a13, a21, a22, a23, a31, a32, a33) {
        const det = this.m[a11] * this.m[a22] * this.m[a33] +
            this.m[a13] * this.m[a21] * this.m[a32] +
            this.m[a12] * this.m[a23] * this.m[a31] -
            this.m[a13] * this.m[a22] * this.m[a31] -
            this.m[a11] * this.m[a23] * this.m[a32] -
            this.m[a12] * this.m[a21] * this.m[a33];
        return det;
    }
    // produces new Matrix
    add(n) {
        return new SymetricMatrix().set(this.m[0] + n.m[0], this.m[1] + n.m[1], this.m[2] + n.m[2], this.m[3] + n.m[3], this.m[4] + n.m[4], this.m[5] + n.m[5], this.m[6] + n.m[6], this.m[7] + n.m[7], this.m[8] + n.m[8], this.m[9] + n.m[9]);
    }
    addSelf(n) {
        this.m[0] += n.m[0];
        this.m[1] += n.m[1];
        this.m[2] += n.m[2];
        this.m[3] += n.m[3];
        this.m[4] += n.m[4];
        this.m[5] += n.m[5];
        this.m[6] += n.m[6];
        this.m[7] += n.m[7];
        this.m[8] += n.m[8];
        this.m[9] += n.m[9];
    }
}
class Triangle {
    v;
    va;
    err;
    deleted;
    dirty;
    n;
    constructor() {
        this.v = new Array(3); // indices for array
        this.va = new Array(3); // indices for arra
        this.err = new Array(4); // errors
        this.deleted = false;
        this.dirty = false;
        this.n = new cc_1.Vec3(); // Normal
    }
}
class Vertex {
    index;
    p;
    // public n: Vec3;
    // public uv: Vec2;
    // public tangents: Vec4;
    tstart;
    tcount;
    q;
    border;
    uvSteam;
    uvFoldover;
    constructor() {
        this.p = new cc_1.Vec3();
        this.tstart = -1;
        this.tcount = -1;
        this.q = new SymetricMatrix();
        this.border = false;
    }
}
class Ref {
    tvertex;
    tid;
}
class BorderVertex {
    index;
    hash;
    constructor(index, hash) {
        this.index = index;
        this.hash = hash;
    }
}
/**
 * 设置参数
 */
class SimplificationOptions {
    preserveSurfaceCurvature = false;
    preserveBorderEdges = false;
    preserveUVSeamEdges = false;
    preserveUVFoldoverEdges = false;
    enableSmartLink = true;
    vertexLinkDistance = Number.MIN_VALUE;
    maxIterationCount = 100;
    agressiveness = 7.0;
}
/**
 * 网格简化
 */
class MeshSimplify {
    simplificationOptions = new SimplificationOptions();
    _triangles = []; // Triangle
    _vertices = []; // Vertex
    _vertNormals = null;
    _vertTangents = null;
    _vertUV2D = null;
    _vertUV3D = null;
    _vertUV4D = null;
    _vertColors = null;
    _vertJoints = null;
    _vertWeights = null;
    _refs = []; // Ref
    _geometricInfo = '';
    _triangleHashSet1 = new Map();
    _triangleHashSet2 = new Map();
    /**
     * 初始化
     * @param origVertices
     * @param origFaces
     * @param info
     */
    init(origVertices, origFaces, info) {
        this._vertices = origVertices.map((p, index) => {
            const vert = new Vertex();
            vert.index = index;
            vert.p = new cc_1.Vec3(p.x, p.y, p.z);
            return vert;
        });
        if (info.uvs && info.uvs.length > 0) {
            this._vertUV2D = [];
            for (let i = 0; i < info.uvs.length; i += 2) {
                this._vertUV2D.push(new cc_1.Vec2(info.uvs[i], info.uvs[i + 1]));
            }
        }
        if (info.normals && info.normals.length > 0) {
            this._vertNormals = [];
            for (let i = 0; i < info.normals.length; i += 3) {
                this._vertNormals.push(new cc_1.Vec3(info.normals[i], info.normals[i + 1], info.normals[i + 2]));
            }
        }
        if (info.tangents && info.tangents.length > 0) {
            this._vertTangents = [];
            for (let i = 0; i < info.tangents.length; i += 4) {
                this._vertTangents.push(new cc_1.Vec4(info.tangents[i], info.tangents[i + 1], info.tangents[i + 2], info.tangents[i + 3]));
            }
        }
        if (info.colors && info.colors.length > 0) {
            this._vertColors = [];
            for (let i = 0; i < info.colors.length; i += 4) {
                this._vertColors.push(new cc_1.Color(info.colors[i], info.colors[i + 1], info.colors[i + 2], info.colors[i + 3]));
            }
        }
        if (info.joints && info.joints.length > 0) {
            this._vertJoints = [];
            for (let i = 0; i < info.joints.length; i += 4) {
                this._vertJoints.push(new cc_1.Vec4(info.joints[i], info.joints[i + 1], info.joints[i + 2], info.joints[i + 3]));
            }
        }
        if (info.weights && info.weights.length > 0) {
            this._vertWeights = [];
            for (let i = 0; i < info.weights.length; i += 4) {
                this._vertWeights.push(new cc_1.Vec4(info.weights[i], info.weights[i + 1], info.weights[i + 2], info.weights[i + 3]));
            }
        }
        this._triangles = origFaces.map((f) => {
            const tri = new Triangle();
            tri.v[0] = f.a;
            tri.v[1] = f.b;
            tri.v[2] = f.c;
            tri.va[0] = f.a;
            tri.va[1] = f.b;
            tri.va[2] = f.c;
            return tri;
        });
    }
    /**
     * 修改队列长度
     * @param array
     * @param count
     * @returns
     */
    _resize(array, count) {
        if (count < array.length) {
            return array.splice(count);
        }
        if (count > array.length) {
            // in JS, arrays need not be expanded
            // console.log('more');
        }
    }
    /**
     * 移动数据
     * @param refs
     * @param dest
     * @param source
     * @param count
     */
    _move(refs, dest, source, count) {
        for (let i = 0; i < count; i++) {
            // 	refs[dest + i] = refs[source + i];
            refs[dest + i].tvertex = refs[source + i].tvertex;
            refs[dest + i].tid = refs[source + i].tid;
        }
    }
    /**
     * 合并网格
     */
    compactMesh() {
        //	console.log('compact_mesh');
        let /*int */ dst = 0;
        for (let i = 0; i < this._vertices.length; i++) {
            this._vertices[i].tcount = 0;
        }
        for (let i = 0; i < this._triangles.length; i++) {
            if (!this._triangles[i].deleted) {
                const /*Triangle &*/ t = this._triangles[i];
                for (let j = 0; j < 3; j++) {
                    if (t.va[j] != t.v[j]) {
                        const iDest = t.va[j];
                        const iSrc = t.v[j];
                        cc_1.Vec3.copy(this._vertices[iDest].p, this._vertices[iSrc].p);
                        if (this._vertWeights != null) {
                            cc_1.Vec4.copy(this._vertWeights[iDest], this._vertWeights[iSrc]);
                        }
                        if (this._vertJoints != null) {
                            cc_1.Vec4.copy(this._vertJoints[iDest], this._vertJoints[iSrc]);
                        }
                        t.v[j] = t.va[j];
                    }
                }
                this._triangles[dst++] = t;
                for (let j = 0; j < 3; j++)
                    this._vertices[t.v[j]].tcount = 1;
            }
        }
        this._resize(this._triangles, dst);
        dst = 0;
        for (let i = 0; i < this._vertices.length; i++) {
            if (this._vertices[i].tcount) {
                this._vertices[i].tstart = dst;
                this._vertices[dst].index = dst;
                this._vertices[dst].p = this._vertices[i].p;
                if (this._vertUV2D) {
                    this._vertUV2D[dst] = this._vertUV2D[i];
                }
                if (this._vertNormals) {
                    this._vertNormals[dst] = this._vertNormals[i];
                }
                if (this._vertTangents) {
                    this._vertTangents[dst] = this._vertTangents[i];
                }
                if (this._vertColors) {
                    this._vertColors[dst] = this._vertColors[i];
                }
                if (this._vertJoints) {
                    this._vertJoints[dst] = this._vertJoints[i];
                }
                if (this._vertWeights) {
                    this._vertWeights[dst] = this._vertWeights[i];
                }
                dst++;
            }
        }
        for (let i = 0; i < this._triangles.length; i++) {
            const /*Triangle &*/ t = this._triangles[i];
            for (let j = 0; j < 3; j++)
                t.v[j] = this._vertices[t.v[j]].tstart;
        }
        //	console.log('%cCompact Mesh', 'background:#f00', this._vertices.length, dst);
        this._resize(this._vertices, dst);
        //	console.log('%cCompact Mesh ok', 'background:#f00', this._vertices.length, dst);
    }
    /**
     * 简化网格
     * @param target_count
     * @param agressiveness
     */
    _simplifyMesh(target_count, agressiveness) {
        if (agressiveness === undefined)
            agressiveness = this.simplificationOptions.agressiveness;
        // TODO normalize_mesh to max length 1?
        console.time('simplify_mesh');
        let i, il;
        // set all triangles to non deleted
        for (i = 0, il = this._triangles.length; i < il; i++) {
            this._triangles[i].deleted = false;
        }
        // main iteration loop
        let deleted_triangles = 0;
        const deleted0 = [], deleted1 = []; // std::vector<int>
        const triangle_count = this._triangles.length;
        for (let iteration = 0; iteration < this.simplificationOptions.maxIterationCount; iteration++) {
            // 	console.log("iteration %d - triangles %d, tris\n", iteration, triangle_count - deleted_triangles, this._triangles.length);
            if (triangle_count - deleted_triangles <= target_count)
                break;
            // update mesh once in a while
            if (iteration % 5 === 0) {
                this._updateMesh(iteration);
            }
            // clear dirty flag
            for (let j = 0; j < this._triangles.length; j++) {
                this._triangles[j].dirty = false;
            }
            //
            // All triangles with edges below the threshold will be removed
            //
            // The following numbers works well for most models.
            // If it does not, try to adjust the 3 parameters
            //
            //let threshold = 0.000000001 * Math.pow(iteration + 3, agressiveness);
            const threshold = 1e-13 * Math.pow(iteration + 3, agressiveness);
            // remove vertices & mark deleted triangles
            for (i = 0, il = this._triangles.length; i < il; i++) {
                const t = this._triangles[i];
                if (t.err[3] > threshold || t.deleted || t.dirty)
                    continue;
                for (let j = 0; j < 3; j++) {
                    if (t.err[j] < threshold) {
                        const i0 = t.v[j];
                        const v0 = this._vertices[i0];
                        const i1 = t.v[(j + 1) % 3];
                        const v1 = this._vertices[i1];
                        // Border check
                        if (v0.border != v1.border)
                            continue;
                        else if (v0.uvSteam != v1.uvSteam)
                            continue;
                        else if (v0.uvFoldover != v1.uvFoldover)
                            continue;
                        else if (this.simplificationOptions.preserveBorderEdges && v0.border)
                            continue;
                        // If seams should be preserved
                        else if (this.simplificationOptions.preserveUVSeamEdges && v0.uvSteam)
                            continue;
                        // If foldovers should be preserved
                        else if (this.simplificationOptions.preserveUVFoldoverEdges && v0.uvFoldover)
                            continue;
                        // Compute vertex to collapse to
                        const p = new cc_1.Vec3();
                        this._calculateError(i0, i1, p);
                        // console.log('Compute vertex to collapse to', p);
                        this._resize(deleted0, v0.tcount); // normals temporarily
                        this._resize(deleted1, v1.tcount); // normals temporarily
                        // dont remove if _flipped
                        if (this._flipped(p, i0, i1, v0, v1, deleted0))
                            continue;
                        if (this._flipped(p, i1, i0, v1, v0, deleted1))
                            continue;
                        // Calculate the barycentric coordinates within the triangle
                        const i2 = t.v[(j + 2) % 3];
                        const barycentricCoord = new cc_1.Vec3();
                        this.calculateBarycentricCoords(p, v0.p, v1.p, this._vertices[i2].p, barycentricCoord);
                        // not _flipped, so remove edge
                        v0.p = p;
                        // v0.q = v1.q + v0.q;
                        v0.q.addSelf(v1.q);
                        // Interpolate the vertex attributes
                        let ia0 = t.va[j];
                        const ia1 = t.va[(j + 1) % 3];
                        const ia2 = t.va[(j + 2) % 3];
                        this._interpolateVertexAttributes(ia0, ia0, ia1, ia2, barycentricCoord);
                        if (this._vertices[i0].uvSteam) {
                            ia0 = -1;
                        }
                        const tstart = this._refs.length;
                        // CONTINUE
                        deleted_triangles = this._updateTriangles(i0, ia0, v0, deleted0, deleted_triangles);
                        // console.log('deleted triangle v0', deleted_triangles);
                        deleted_triangles = this._updateTriangles(i0, ia0, v1, deleted1, deleted_triangles);
                        // console.log('deleted triangle v1', deleted_triangles);
                        const tcount = this._refs.length - tstart;
                        if (tcount <= v0.tcount) {
                            // console.log('save ram?');
                            if (tcount)
                                this._move(this._refs, v0.tstart, tstart, tcount);
                        }
                        // append
                        else
                            v0.tstart = tstart;
                        v0.tcount = tcount;
                        break;
                    }
                } // end for j
                // done?
                if (triangle_count - deleted_triangles <= target_count)
                    break;
            }
        } // end iteration
        // clean up mesh
        this.compactMesh();
        // ready
        console.timeEnd('simplify_mesh');
        // int timeEnd=timeGetTime();
        // printf("%s - %d/%d %d%% removed in %d ms\n",__FUNCTION__,
        // 	triangle_count-deleted_triangles,
        // 	triangle_count,deleted_triangles*100/triangle_count,
        // 	timeEnd-timeStart);
    }
    _flipped(
    /* vec3f */ p, 
    /*int*/ i0, 
    /*int*/ i1, 
    /*Vertex*/ v0, 
    /*Vertex*/ v1, // not needed
    /*std::vector<int>*/ deleted) {
        // let bordercount = 0;
        for (let k = 0; k < v0.tcount; k++) {
            // Triangle &
            const t = this._triangles[this._refs[v0.tstart + k].tid];
            if (t.deleted)
                continue;
            const s = this._refs[v0.tstart + k].tvertex;
            const id1 = t.v[(s + 1) % 3];
            const id2 = t.v[(s + 2) % 3];
            if (id1 == i1 || id2 == i1) {
                // delete ?
                // bordercount++;
                deleted[k] = true;
                continue;
            }
            /* vec3f */
            cc_1.Vec3.subtract(_tempVec3, this._vertices[id1].p, p);
            _tempVec3.normalize();
            cc_1.Vec3.subtract(_tempVec3_2, this._vertices[id2].p, p);
            _tempVec3_2.normalize();
            if (Math.abs(cc_1.Vec3.dot(_tempVec3, _tempVec3_2)) > 0.999)
                return true;
            /*vec3f  n;*/
            cc_1.Vec3.cross(_tempVec3_3, _tempVec3, _tempVec3_2);
            _tempVec3_3.normalize();
            deleted[k] = false;
            if (cc_1.Vec3.dot(_tempVec3_3, t.n) < 0.2)
                return true;
        }
        return false;
    }
    // Update triangle connections and edge error after a edge is collapsed
    /**
     * 更新三角形信息
     * @param i0
     * @param ia0
     * @param v
     * @param deleted
     * @param deleted_triangles
     * @returns
     */
    _updateTriangles(
    /*int*/ i0, ia0, 
    /*Vertex &*/ v, 
    /*std::vector<int> & */ deleted, 
    /*int &*/ deleted_triangles) {
        // console.log('_updateTriangles');
        // vec3f p;
        const p = new cc_1.Vec3();
        for (let k = 0; k < v.tcount; k++) {
            const /*Ref &*/ r = this._refs[v.tstart + k];
            const /*Triangle &*/ t = this._triangles[r.tid];
            if (t.deleted)
                continue;
            if (deleted[k]) {
                t.deleted = true;
                deleted_triangles++;
                continue;
            }
            t.v[r.tvertex] = i0;
            if (ia0 != -1) {
                t.va[r.tvertex] = ia0;
            }
            t.dirty = true;
            t.err[0] = this._calculateError(t.v[0], t.v[1], p);
            t.err[1] = this._calculateError(t.v[1], t.v[2], p);
            t.err[2] = this._calculateError(t.v[2], t.v[0], p);
            t.err[3] = Math.min(t.err[0], t.err[1], t.err[2]);
            this._refs.push(r);
        }
        return deleted_triangles;
    }
    // compact triangles, compute edge error and build reference list
    _updateMesh(iteration) {
        // console.log('_updateMesh', iteration, this._triangles.length);
        if (iteration > 0) {
            // compact triangles
            let dst = 0;
            for (let i = 0; i < this._triangles.length; i++) {
                const target = this._triangles[i];
                if (!target.deleted) {
                    this._triangles[dst++] = target;
                }
            }
            // console.log('not deleted dst', this._triangles.length, dst);
            this._triangles.splice(dst);
        }
        this._updateReferences();
        // Init Quadrics by Plane & Edge Errors
        //
        // required at the beginning ( iteration == 0 )
        // recomputing during the simplification is not required,
        // but mostly improves the result for closed meshes
        //
        // Identify boundary : vertices[].border=0,1
        if (iteration == 0) {
            // std::vector<int> vcount,vids;
            let vcount, vids;
            let borderVertexCount = 0;
            let borderMinX = 1.7976931348623157e308;
            let borderMaxX = -1.7976931348623157e308;
            for (let i = 0; i < this._vertices.length; i++) {
                this._vertices[i].border = false;
                this._vertices[i].uvSteam = false;
                this._vertices[i].uvFoldover = false;
            }
            for (let i = 0; i < this._vertices.length; i++) {
                const /*Vertex &*/ v = this._vertices[i];
                // vcount.clear();
                // vids.clear();
                vcount = [];
                vids = [];
                for (let j = 0; j < v.tcount; j++) {
                    const k = this._refs[v.tstart + j].tid;
                    const /*Triangle &*/ t = this._triangles[k];
                    for (let k = 0; k < 3; k++) {
                        let ofs = 0, id = t.v[k];
                        while (ofs < vcount.length) {
                            if (vids[ofs] == id)
                                break;
                            ofs++;
                        }
                        if (ofs == vcount.length) {
                            vcount.push(1);
                            vids.push(id);
                        }
                        else {
                            vcount[ofs]++;
                        }
                    }
                }
                for (let j = 0; j < vcount.length; j++) {
                    if (vcount[j] == 1) {
                        this._vertices[vids[j]].border = true;
                        borderVertexCount++;
                        if (this.simplificationOptions.enableSmartLink) {
                            const id = vids[j];
                            if (this._vertices[id].p.x < borderMinX) {
                                borderMinX = this._vertices[id].p.x;
                            }
                            if (this._vertices[id].p.x > borderMaxX) {
                                borderMaxX = this._vertices[id].p.x;
                            }
                        }
                    }
                }
            }
            if (this.simplificationOptions.enableSmartLink) {
                // First find all border vertices
                const borderVertices = new Array(borderVertexCount);
                let borderIndexCount = 0;
                const borderAreaWidth = borderMaxX - borderMinX;
                for (let i = 0; i < this._vertices.length; i++) {
                    if (this._vertices[i].border) {
                        const vertexHash = (((this._vertices[i].p.x - borderMinX) / borderAreaWidth) * 2.0 - 1.0) * 2147483647;
                        borderVertices[borderIndexCount] = new BorderVertex(i, vertexHash);
                        ++borderIndexCount;
                    }
                }
                // Sort the border vertices by hash
                borderVertices.sort((x, y) => {
                    // if (x.hash > y.hash) {
                    // 	return 1
                    // } else if (x.hash < y.hash) {
                    // 	return -1
                    // }
                    return x.hash - y.hash;
                });
                // Calculate the maximum hash distance based on the maximum vertex link distance
                const vertexLinkDistanceSqr = this.simplificationOptions.vertexLinkDistance * this.simplificationOptions.vertexLinkDistance;
                const vertexLinkDistance = Math.sqrt(vertexLinkDistanceSqr);
                const hashMaxDistance = Math.max((vertexLinkDistance / borderAreaWidth) * 2147483647, 1);
                // Then find identical border vertices and bind them together as one
                for (let i = 0; i < borderIndexCount; i++) {
                    const myIndex = borderVertices[i].index;
                    if (myIndex == -1)
                        continue;
                    const myPoint = this._vertices[myIndex].p;
                    for (let j = i + 1; j < borderIndexCount; j++) {
                        const otherIndex = borderVertices[j].index;
                        if (otherIndex == -1)
                            continue;
                        else if (borderVertices[j].hash - borderVertices[i].hash > hashMaxDistance)
                            // There is no point to continue beyond this point
                            break;
                        const otherPoint = this._vertices[otherIndex].p;
                        const sqrX = (myPoint.x - otherPoint.x) * (myPoint.x - otherPoint.x);
                        const sqrY = (myPoint.y - otherPoint.y) * (myPoint.y - otherPoint.y);
                        const sqrZ = (myPoint.z - otherPoint.z) * (myPoint.z - otherPoint.z);
                        const sqrMagnitude = sqrX + sqrY + sqrZ;
                        if (sqrMagnitude <= vertexLinkDistanceSqr) {
                            borderVertices[j].index = -1; // NOTE: This makes sure that the "other" vertex is not processed again
                            this._vertices[myIndex].border = false;
                            this._vertices[otherIndex].border = false;
                            // AreUVsTheSame
                            if (this._vertUV2D[myIndex].equals(this._vertUV2D[otherIndex])) {
                                this._vertices[myIndex].uvFoldover = true;
                                this._vertices[otherIndex].uvFoldover = true;
                            }
                            else {
                                this._vertices[myIndex].uvSteam = true;
                                this._vertices[otherIndex].uvSteam = true;
                            }
                            const otherTriangleCount = this._vertices[otherIndex].tcount;
                            const otherTriangleStart = this._vertices[otherIndex].tstart;
                            for (let k = 0; k < otherTriangleCount; k++) {
                                const r = this._refs[otherTriangleStart + k];
                                this._triangles[r.tid].v[r.tvertex] = myIndex;
                            }
                        }
                    }
                }
                // Update the references again
                this._updateReferences();
            }
            for (let i = 0; i < this._vertices.length; i++) {
                // may not need to do this.
                this._vertices[i].q = new SymetricMatrix();
            }
            const p1p0 = new cc_1.Vec3();
            const p2p0 = new cc_1.Vec3();
            const p = new Array(3);
            const tmp = new SymetricMatrix();
            for (let i = 0; i < this._triangles.length; i++) {
                const /*Triangle &*/ t = this._triangles[i];
                const n = new cc_1.Vec3();
                for (let j = 0; j < 3; j++) {
                    p[j] = this._vertices[t.v[j]].p;
                }
                cc_1.Vec3.subtract(p1p0, p[1], p[0]);
                cc_1.Vec3.subtract(p2p0, p[2], p[0]);
                cc_1.Vec3.cross(n, p1p0, p2p0);
                cc_1.Vec3.normalize(n, n);
                t.n = n;
                tmp.makePlane(n.x, n.y, n.z, -n.dot(p[0]));
                for (let j = 0; j < 3; j++) {
                    this._vertices[t.v[j]].q.addSelf(tmp);
                }
                // vertices[t.v[j]].q =
                // vertices[t.v[j]].q.add(SymetricMatrix(n.x,n.y,n.z,-n.dot(p[0])));
            }
            for (let i = 0; i < this._triangles.length; i++) {
                // Calc Edge Error
                const /*Triangle &*/ t = this._triangles[i];
                // vec3f p;
                const p = new cc_1.Vec3();
                for (let j = 0; j < 3; j++) {
                    t.err[j] = this._calculateError(t.v[j], t.v[(j + 1) % 3], p);
                }
                t.err[3] = Math.min(t.err[0], t.err[1], t.err[2]);
            }
        }
    }
    // Finally compact mesh before exiting
    // Error between vertex and Quadric
    _vertexError(/*SymetricMatrix*/ q, /*double*/ x, y, z) {
        return (q.m[0] * x * x +
            2 * q.m[1] * x * y +
            2 * q.m[2] * x * z +
            2 * q.m[3] * x +
            q.m[4] * y * y +
            2 * q.m[5] * y * z +
            2 * q.m[6] * y +
            q.m[7] * z * z +
            2 * q.m[8] * z +
            q.m[9]);
    }
    // Error for one edge
    // if DECIMATE is defined vertex positions are NOT interpolated
    // Luebke Survey of Polygonal Simplification Algorithms:  "vertices of a model simplified by the decimation algorithm are a subset of the original model’s vertices."
    // http://www.cs.virginia.edu/~luebke/publications/pdf/cg+a.2001.pdf
    _calculateError(id_v1, id_v2, p_result) {
        // compute interpolated vertex
        const vertex1 = this._vertices[id_v1];
        const vertex2 = this._vertices[id_v2];
        const q = vertex1.q.add(vertex2.q);
        const border = vertex1.border && vertex2.border;
        let error = 0;
        const det = q.det(0, 1, 2, 1, 4, 5, 2, 5, 7);
        if (det !== 0 && !border) {
            // q_delta is invertible
            p_result.x = (-1 / det) * q.det(1, 2, 3, 4, 5, 6, 5, 7, 8); // vx = A41/det(q_delta)
            p_result.y = (1 / det) * q.det(0, 2, 3, 1, 5, 6, 2, 7, 8); // vy = A42/det(q_delta)
            p_result.z = (-1 / det) * q.det(0, 1, 3, 1, 4, 6, 2, 5, 8); // vz = A43/det(q_delta)
            let curvatureError = 0;
            if (this.simplificationOptions.preserveSurfaceCurvature) {
                curvatureError = this._curvatureError(vertex1, vertex2);
            }
            error = this._vertexError(q, p_result.x, p_result.y, p_result.z) + curvatureError;
        }
        else {
            // det = 0 -> try to find best result
            const /*vec3f*/ p1 = vertex1.p;
            const /*vec3f*/ p2 = vertex2.p;
            const /*vec3f*/ p3 = new cc_1.Vec3();
            cc_1.Vec3.add(p3, p1, p2);
            p3.multiplyScalar(0.5);
            const error1 = this._vertexError(q, p1.x, p1.y, p1.z);
            const error2 = this._vertexError(q, p2.x, p2.y, p2.z);
            const error3 = this._vertexError(q, p3.x, p3.y, p3.z);
            error = Math.min(error1, error2, error3);
            if (error1 === error)
                cc_1.Vec3.copy(p_result, p1);
            if (error2 === error)
                cc_1.Vec3.copy(p_result, p2);
            if (error3 === error)
                cc_1.Vec3.copy(p_result, p3);
        }
        return error;
    }
    _updateReferences() {
        // Init Reference ID list
        for (let i = 0; i < this._vertices.length; i++) {
            this._vertices[i].tstart = 0;
            this._vertices[i].tcount = 0;
        }
        for (let i = 0; i < this._triangles.length; i++) {
            /*Triangle &*/
            const t = this._triangles[i];
            for (let j = 0; j < 3; j++)
                this._vertices[t.v[j]].tcount++;
        }
        let tstart = 0;
        for (let i = 0; i < this._vertices.length; i++) {
            const /*Vertex &*/ v = this._vertices[i];
            v.tstart = tstart;
            tstart += v.tcount;
            v.tcount = 0;
        }
        // Write References
        // _resize(refs, triangles.length * 3)
        // console.log('pre ref', this._refs.length, this._triangles.length * 3);
        for (let i = this._refs.length; i < this._triangles.length * 3; i++) {
            this._refs[i] = new Ref();
        }
        for (let i = 0; i < this._triangles.length; i++) {
            /*Triangle &*/
            const t = this._triangles[i];
            for (let j = 0; j < 3; j++) {
                /*Vertex &*/
                const v = this._vertices[t.v[j]];
                this._refs[v.tstart + v.tcount].tid = i;
                this._refs[v.tstart + v.tcount].tvertex = j;
                v.tcount++;
            }
        }
    }
    _curvatureError(vert0, vert1) {
        cc_1.Vec3.subtract(_tempVec3, vert0.p, vert1.p);
        const diffVector = _tempVec3.length();
        const trianglesWithViOrVjOrBoth = this._triangleHashSet1;
        trianglesWithViOrVjOrBoth.clear();
        this._getTrianglesContainingVertex(vert0, trianglesWithViOrVjOrBoth);
        this._getTrianglesContainingVertex(vert1, trianglesWithViOrVjOrBoth);
        const trianglesWithViAndVjBoth = this._triangleHashSet2;
        trianglesWithViAndVjBoth.clear();
        this._getTrianglesContainingBothVertices(vert0, vert1, trianglesWithViAndVjBoth);
        let maxDotOuter = 0;
        trianglesWithViOrVjOrBoth.forEach((index, triangleWithViOrVjOrBoth) => {
            let maxDotInner = 0;
            const normVecTriangleWithViOrVjOrBoth = triangleWithViOrVjOrBoth.n.clone();
            trianglesWithViAndVjBoth.forEach((index, triangleWithViAndVjBoth) => {
                const normVecTriangleWithViAndVjBoth = triangleWithViAndVjBoth.n.clone();
                const dot = cc_1.Vec3.dot(normVecTriangleWithViOrVjOrBoth, normVecTriangleWithViAndVjBoth);
                if (dot > maxDotInner)
                    maxDotInner = dot;
            });
            if (maxDotInner > maxDotOuter)
                maxDotOuter = maxDotInner;
        });
        return diffVector * maxDotOuter;
    }
    _getTrianglesContainingVertex(vert, tris) {
        const trianglesCount = vert.tcount;
        const startIndex = vert.tstart;
        for (let a = startIndex; a < startIndex + trianglesCount; a++) {
            tris.set(this._triangles[this._refs[a].tid], true);
        }
    }
    _getTrianglesContainingBothVertices(vert0, vert1, tris) {
        const triangleCount = vert0.tcount;
        const startIndex = vert0.tstart;
        for (let refIndex = startIndex; refIndex < startIndex + triangleCount; refIndex++) {
            const tid = this._refs[refIndex].tid;
            const tri = this._triangles[tid];
            if (this._vertices[tri.v[0]].index == vert1.index ||
                this._vertices[tri.v[1]].index == vert1.index ||
                this._vertices[tri.v[2]].index == vert1.index) {
                tris.set(tri, true);
            }
        }
    }
    simplifyMesh(target_count, agressiveness = 7) {
        try {
            target_count = Math.round(target_count);
            const geometry = JSON.parse(this._geometricInfo);
            this.init(geometry.vertices, geometry.faces, geometry);
            console.time('simplify');
            this._simplifyMesh(target_count, agressiveness);
            console.timeEnd('simplify');
            //	console.log('old vertices ' + geometry.vertices.length, 'old faces ' + geometry.faces.length);
            console.log('new vertices ' + this._vertices.length, 'old faces ' + this._triangles.length);
            // TODO convert to buffer geometry.
            const newGeo = {
                positions: [],
                indices: [],
                attrs: {},
            };
            const newLength = this._vertices.length;
            for (let i = 0; i < this._vertices.length; i++) {
                const v = this._vertices[i];
                newGeo.positions.push(v.p.x);
                newGeo.positions.push(v.p.y);
                newGeo.positions.push(v.p.z);
            }
            if (this._vertUV2D) {
                this._resize(this._vertUV2D, newLength);
                newGeo.uvs = [];
                for (let i = 0; i < this._vertUV2D.length; i++) {
                    const v = this._vertUV2D[i];
                    newGeo.uvs.push(v.x);
                    newGeo.uvs.push(v.y);
                }
            }
            if (this._vertNormals) {
                this._resize(this._vertNormals, newLength);
                newGeo.normals = [];
                for (let i = 0; i < this._vertNormals.length; i++) {
                    const v = this._vertNormals[i];
                    newGeo.normals.push(v.x);
                    newGeo.normals.push(v.y);
                    newGeo.normals.push(v.z);
                }
            }
            if (this._vertTangents) {
                this._resize(this._vertTangents, newLength);
                newGeo.tangents = [];
                for (let i = 0; i < this._vertTangents.length; i++) {
                    const v = this._vertTangents[i];
                    newGeo.tangents.push(v.x);
                    newGeo.tangents.push(v.y);
                    newGeo.tangents.push(v.z);
                    newGeo.tangents.push(v.w);
                }
            }
            if (this._vertColors) {
                this._resize(this._vertColors, newLength);
                newGeo.colors = [];
                for (let i = 0; i < this._vertColors.length; i++) {
                    const v = this._vertColors[i];
                    newGeo.colors.push(v.r);
                    newGeo.colors.push(v.g);
                    newGeo.colors.push(v.b);
                    newGeo.colors.push(v.a);
                }
            }
            if (this._vertJoints) {
                this._resize(this._vertJoints, newLength);
                const list = (newGeo.attrs['joints'] = []);
                for (let i = 0; i < this._vertJoints.length; i++) {
                    const v = this._vertJoints[i];
                    list.push(v.x);
                    list.push(v.y);
                    list.push(v.z);
                    list.push(v.w);
                }
            }
            if (this._vertWeights) {
                this._resize(this._vertWeights, newLength);
                const list = (newGeo.attrs['weights'] = []);
                for (let i = 0; i < this._vertWeights.length; i++) {
                    const v = this._vertWeights[i];
                    list.push(v.x);
                    list.push(v.y);
                    list.push(v.z);
                    list.push(v.w);
                }
            }
            for (let i = 0; i < this._triangles.length; i++) {
                const tri = this._triangles[i];
                newGeo.indices.push(tri.v[0]);
                newGeo.indices.push(tri.v[1]);
                newGeo.indices.push(tri.v[2]);
            }
            return newGeo;
        }
        catch (e) {
            console.error(e);
        }
    }
    /**
     * 构建geometry信息
     * @param geometry
     */
    buildGeometric(geometry) {
        //@ts-ignore
        //	mergeVertices(geometry);
        const faces = [];
        if (geometry.indices) {
            for (let i = 0; i < geometry.indices.length; i += 3) {
                faces.push({
                    a: geometry.indices[i],
                    b: geometry.indices[i + 1],
                    c: geometry.indices[i + 2],
                });
            }
        }
        else {
            const nVertices = geometry.positions.length / 3;
            for (let i = 0; i < nVertices; i += 3) {
                faces.push({
                    a: 3 * i + 0,
                    b: 3 * i + 1,
                    c: 3 * i + 2,
                });
            }
        }
        geometry.faces = faces;
        const vertices = [];
        for (let i = 0; i < geometry.positions.length; i += 3) {
            vertices.push(new cc_1.Vec3(geometry.positions[i], geometry.positions[i + 1], geometry.positions[i + 2]));
        }
        geometry.vertices = vertices;
        for (const key in geometry) {
            if (geometry[key]) {
                if (!(geometry[key] instanceof Array)) {
                    geometry[key] = Array.from(geometry[key]);
                }
            }
            else {
                delete geometry[key];
            }
        }
        this._geometricInfo = JSON.stringify(geometry);
        // this.init(geometry.vertices, geometry.faces, geometry);
        // console.log('old vertices ' + geometry.vertices.length, 'old faces ' + geometry.faces.length);
        // simplify!
        // simplify_mesh(geometry.faces.length * 0.5 | 0, 7);
        // simplify_mesh(geometry.faces.length - 2, 4);
    }
    /**
     * 计算合并的uv信息
     * @param point
     * @param a
     * @param b
     * @param c
     * @param result
     */
    calculateBarycentricCoords(point, a, b, c, result) {
        const v0 = new cc_1.Vec3();
        const v1 = new cc_1.Vec3();
        const v2 = new cc_1.Vec3();
        cc_1.Vec3.subtract(v0, b, a);
        cc_1.Vec3.subtract(v1, c, a);
        cc_1.Vec3.subtract(v2, point, a);
        const d00 = cc_1.Vec3.dot(v0, v0);
        const d01 = cc_1.Vec3.dot(v0, v1);
        const d11 = cc_1.Vec3.dot(v1, v1);
        const d20 = cc_1.Vec3.dot(v2, v0);
        const d21 = cc_1.Vec3.dot(v2, v1);
        let denom = d00 * d11 - d01 * d01;
        // Make sure the denominator is not too small to cause math problems
        if (Math.abs(denom) < DenomEpilson) {
            denom = DenomEpilson;
        }
        const v = (d11 * d20 - d01 * d21) / denom;
        const w = (d00 * d21 - d01 * d20) / denom;
        const u = 1.0 - v - w;
        result.set(u, v, w);
    }
    _interpolateVertexAttributes(dst, i0, i1, i2, barycentricCoord) {
        if (this._vertNormals) {
            _tempVec3.set(0, 0, 0);
            cc_1.Vec3.scaleAndAdd(_tempVec3, _tempVec3, this._vertNormals[i0], barycentricCoord.x);
            cc_1.Vec3.scaleAndAdd(_tempVec3, _tempVec3, this._vertNormals[i1], barycentricCoord.y);
            cc_1.Vec3.scaleAndAdd(_tempVec3, _tempVec3, this._vertNormals[i2], barycentricCoord.z);
            cc_1.Vec3.normalize(_tempVec3, _tempVec3);
            cc_1.Vec3.copy(this._vertNormals[dst], _tempVec3);
        }
        if (this._vertUV2D) {
            _tempVec2.set(0, 0);
            cc_1.Vec2.scaleAndAdd(_tempVec2, _tempVec2, this._vertUV2D[i0], barycentricCoord.x);
            cc_1.Vec2.scaleAndAdd(_tempVec2, _tempVec2, this._vertUV2D[i1], barycentricCoord.y);
            cc_1.Vec2.scaleAndAdd(_tempVec2, _tempVec2, this._vertUV2D[i2], barycentricCoord.z);
            cc_1.Vec2.copy(this._vertUV2D[dst], _tempVec2);
        }
        if (this._vertTangents) {
            _tempVec4.set(0, 0, 0, 0);
            cc_1.Vec4.scaleAndAdd(_tempVec4, _tempVec4, this._vertTangents[i0], barycentricCoord.x);
            cc_1.Vec4.scaleAndAdd(_tempVec4, _tempVec4, this._vertTangents[i1], barycentricCoord.y);
            cc_1.Vec4.scaleAndAdd(_tempVec4, _tempVec4, this._vertTangents[i2], barycentricCoord.z);
            this._normalizeTangent(this._vertTangents[dst], _tempVec4);
        }
        if (this._vertColors) {
            _tempColor.set(0, 0, 0, 0);
            colorScaleAndAdd(_tempColor, _tempColor, this._vertColors[i0], barycentricCoord.x);
            colorScaleAndAdd(_tempColor, _tempColor, this._vertColors[i1], barycentricCoord.y);
            colorScaleAndAdd(_tempColor, _tempColor, this._vertColors[i2], barycentricCoord.z);
            this._vertColors[dst].set(_tempColor.r, _tempColor.g, _tempColor.b, _tempColor.a);
        }
    }
    _normalizeTangent(out, tangent) {
        const tangentVec = new cc_1.Vec3(tangent.x, tangent.y, tangent.z);
        tangentVec.normalize();
        out.set(tangentVec.x, tangentVec.y, tangentVec.z, tangent.w);
    }
}
exports.MeshSimplify = MeshSimplify;
function appendUint8Array(a, b) {
    const c = new Uint8Array(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}
function getDefaultSimplifyOptions() {
    return {
        targetRatio: 1,
        enableSmartLink: true,
        agressiveness: 7,
        maxIterationCount: 100,
    };
}
//simplify the mesh return a new mesh， only support indexed triangle mesh
function simplifyMesh(mesh, options) {
    for (let i = 0; i < mesh.struct.primitives.length; i++) {
        const primitive = mesh.struct.primitives[i];
        if (primitive.primitiveMode !== cc_2.gfx.PrimitiveMode.TRIANGLE_LIST || primitive.indexView === undefined) {
            //TODO: support other primitive mode
            console.warn('SimplifyMesh current only support indexed triangle mesh, opreation is skipped');
            return mesh;
        }
    }
    const defaultOptions = getDefaultSimplifyOptions();
    options = Object.assign(defaultOptions, options || {});
    let byteOffset = 0, j = 0;
    const vertexBundles = new Array();
    const primitives = new Array();
    let data = new Uint8Array(0); //initlize out mesh data with empty data
    //simplify each submesh of the mesh
    for (let i = 0; i < mesh.struct.vertexBundles.length; i++) {
        const indices = mesh.readIndices(i);
        const vertexCount = mesh.struct.vertexBundles[i].view.count;
        const triangleCount = indices ? indices.length / 3 : vertexCount / 3;
        if (triangleCount > 0) {
            const uvs = mesh.readAttribute(i, cc_2.gfx.AttributeName.ATTR_TEX_COORD);
            const tangents = mesh.readAttribute(i, cc_2.gfx.AttributeName.ATTR_TANGENT);
            const normals = mesh.readAttribute(i, cc_2.gfx.AttributeName.ATTR_NORMAL);
            const weights = mesh.readAttribute(i, cc_2.gfx.AttributeName.ATTR_WEIGHTS);
            const joints = mesh.readAttribute(i, cc_2.gfx.AttributeName.ATTR_JOINTS);
            const colors = mesh.readAttribute(i, cc_2.gfx.AttributeName.ATTR_COLOR);
            const positions = mesh.readAttribute(i, cc_2.gfx.AttributeName.ATTR_POSITION);
            const simplify = new MeshSimplify();
            simplify.buildGeometric({ positions, normals, uvs, indices: indices ?? undefined, tangents, weights, joints, colors });
            simplify.simplificationOptions.agressiveness = options.agressiveness;
            simplify.simplificationOptions.enableSmartLink = options.enableSmartLink;
            const result = simplify.simplifyMesh(options.targetRatio * triangleCount);
            const gInfo = { ...result, customAttributes: [], primitiveMode: cc_2.gfx.PrimitiveMode.TRIANGLE_LIST };
            if (gInfo.attrs) {
                const attrs = gInfo.attrs;
                delete gInfo.attrs;
                for (const key in attrs) {
                    if (key == 'joints') {
                        const info = {
                            attr: new cc_2.gfx.Attribute(cc_2.gfx.AttributeName.ATTR_JOINTS, cc_2.gfx.Format.RGBA16UI),
                            values: attrs[key],
                        };
                        gInfo.customAttributes.push(info);
                    }
                    else if (key == 'weights') {
                        const info = {
                            attr: new cc_2.gfx.Attribute(cc_2.gfx.AttributeName.ATTR_WEIGHTS, cc_2.gfx.Format.RGBA32F),
                            values: attrs[key],
                        };
                        gInfo.customAttributes.push(info);
                    }
                }
            }
            const subMesh = new cc_2.Mesh();
            cc_2.utils.createMesh(gInfo, subMesh, { calculateBounds: true });
            // append submesh data to out mesh data
            (0, cc_1.assert)(subMesh.struct.vertexBundles.length == 1);
            const vertexBundle = subMesh.struct.vertexBundles[0];
            data = appendUint8Array(data, subMesh.data.slice(vertexBundle.view.offset, vertexBundle.view.offset + vertexBundle.view.length));
            vertexBundle.view.offset = byteOffset;
            vertexBundles.push(vertexBundle);
            byteOffset += vertexBundle.view.length;
            let primitive;
            if (subMesh.struct.primitives !== undefined) {
                (0, cc_1.assert)(subMesh.struct.primitives.length == 1);
                primitive = subMesh.struct.primitives[0];
                (0, cc_1.assert)(primitive.indexView);
                data = appendUint8Array(data, subMesh.data.slice(primitive.indexView.offset, primitive.indexView.offset + primitive.indexView.length));
                primitive.indexView.offset = byteOffset;
                primitive.jointMapIndex = subMesh.struct.primitives[0].jointMapIndex;
                primitives.push(primitive);
                byteOffset += primitive.indexView.length;
                primitives[j].vertexBundelIndices = [j];
                j += 1;
            }
        }
    }
    const meshCreateInfo = {
        struct: {
            vertexBundles: vertexBundles,
            primitives: primitives,
            minPosition: mesh.struct.minPosition,
            maxPosition: mesh.struct.maxPosition,
        },
        data: data,
    };
    const out = new cc_2.Mesh();
    out.reset(meshCreateInfo);
    out.hash;
    return out;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzaFNpbXBsaWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NvcmUvYXNzZXRzL2Fzc2V0LWhhbmRsZXIvYXNzZXRzL2dsdGYvbWVzaFNpbXBsaWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXNCRTtBQUNGLDZDQUE2QztBQUM3QyxFQUFFO0FBQ0YsK0JBQStCO0FBQy9CLEVBQUU7QUFDRixnQ0FBZ0M7QUFDaEMsRUFBRTtBQUNGLGdCQUFnQjtBQUNoQixxQ0FBcUM7QUFDckMsRUFBRTtBQUNGLDhEQUE4RDtBQUM5RCxrQ0FBa0M7OztBQStyQ2xDLDhEQU9DO0FBR0Qsb0NBa0dDO0FBenlDRCwyQkFBaUU7QUFDakUsMkJBQXNDO0FBR3RDLE1BQU0sU0FBUyxHQUFHLElBQUksU0FBSSxFQUFFLENBQUM7QUFDN0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxTQUFJLEVBQUUsQ0FBQztBQUM3QixNQUFNLFdBQVcsR0FBRyxJQUFJLFNBQUksRUFBRSxDQUFDO0FBQy9CLE1BQU0sV0FBVyxHQUFHLElBQUksU0FBSSxFQUFFLENBQUM7QUFDL0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxTQUFJLEVBQUUsQ0FBQztBQUM3QixNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQUssRUFBRSxDQUFDO0FBRS9CLE1BQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQztBQUVoQyxPQUFPO0FBQ1AsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFVLEVBQUUsTUFBYSxFQUFFLE1BQWEsRUFBRSxLQUFhO0lBQzdFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ25ELEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FB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QyxDQUFDLENBQUMsRUFFbEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNsQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBRWxCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDckIsQ0FBQztJQUNOLENBQUM7SUFFTSxPQUFPLENBQUMsQ0FBaUI7UUFDNUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsQ0FBQyxDQUFD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QztRQUNMLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7WUFDdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxTQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEcsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDNUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7WUFDeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxTQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUgsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDeEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFDdEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakgsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDeEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFDdEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxTQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFD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Q3ZDO1FBQ0QsSUFBSSxFQUFFLElBQUk7S0FDYixDQUFDO0lBQ0YsTUFBTSxHQUFHLEdBQUcsSUFBSSxTQUFJLEVBQUUsQ0FBQztJQUN2QixHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzFCLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFDVCxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG5NSVQgTGljZW5zZVxyXG5cclxuQ29weXJpZ2h0KGMpIDIwMTctMjAyMCBNYXR0aWFzIEVkbHVuZFxyXG5cclxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxyXG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXHJcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcclxudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxyXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcclxuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuXHJcblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxyXG5jb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxyXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcclxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXHJcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcclxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcclxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcclxuU09GVFdBUkUuXHJcbiovXHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vL1xyXG4vLyBNZXNoIFNpbXBsaWZpY2F0aW9uIFR1dG9yaWFsXHJcbi8vXHJcbi8vIChDKSBieSBTdmVuIEZvcnN0bWFubiBpbiAyMDE0XHJcbi8vXHJcbi8vIExpY2Vuc2UgOiBNSVRcclxuLy8gaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxyXG4vL1xyXG4vL2h0dHBzOi8vZ2l0aHViLmNvbS9zcDRjZXJhdC9GYXN0LVF1YWRyaWMtTWVzaC1TaW1wbGlmaWNhdGlvblxyXG4vLyBAdHMtbm9jaGVjayDmraTmlrnms5XmnInlvojlpJrlrprkuYnkuI3mmI7vvIzmmoLml7bml6Dms5XlrozlloTlrprkuYlcclxuXHJcbmltcG9ydCB7IFZlYzMsIFZlYzIsIFZlYzQsIENvbG9yLCBtYXRoLCBhc3NlcnQsIHZpZXcgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IGdmeCwgTWVzaCwgdXRpbHMgfSBmcm9tICdjYyc7XHJcbmltcG9ydCB7IFNpbXBsaWZ5T3B0aW9ucyB9IGZyb20gJy4uLy4uL21ldGEtc2NoZW1hcy9nbFRGLm1ldGEnO1xyXG5cclxuY29uc3QgX3RlbXBWZWMyID0gbmV3IFZlYzIoKTtcclxuY29uc3QgX3RlbXBWZWMzID0gbmV3IFZlYzMoKTtcclxuY29uc3QgX3RlbXBWZWMzXzIgPSBuZXcgVmVjMygpO1xyXG5jb25zdCBfdGVtcFZlYzNfMyA9IG5ldyBWZWMzKCk7XHJcbmNvbnN0IF90ZW1wVmVjNCA9IG5ldyBWZWM0KCk7XHJcbmNvbnN0IF90ZW1wQ29sb3IgPSBuZXcgQ29sb3IoKTtcclxuXHJcbmNvbnN0IERlbm9tRXBpbHNvbiA9IDAuMDAwMDAwMDE7XHJcblxyXG4vLyDpopzoibLnm7jliqBcclxuZnVuY3Rpb24gY29sb3JTY2FsZUFuZEFkZChvdXQ6IENvbG9yLCBjb2xvcmE6IENvbG9yLCBjb2xvcmI6IENvbG9yLCBzY2FsZTogbnVtYmVyKSB7XHJcbiAgICBvdXQuciA9IE1hdGgubWF4KGNvbG9yYS5yICsgY29sb3JiLnIgKiBzY2FsZSwgMjU1KTtcclxuICAgIG91dC5nID0gTWF0aC5tYXgoY29sb3JhLmcgKyBjb2xvcmIuZyAqIHNjYWxlLCAyNTUpO1xyXG4gICAgb3V0LmIgPSBNYXRoLm1heChjb2xvcmEuYiArIGNvbG9yYi5iICogc2NhbGUsIDI1NSk7XHJcbiAgICBvdXQuYSA9IE1hdGgubWF4KGNvbG9yYS5hICsgY29sb3JiLmEgKiBzY2FsZSwgMjU1KTtcclxufVxyXG5jbGFzcyBTeW1ldHJpY01hdHJpeCB7XHJcbiAgICBwdWJsaWMgbTtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubSA9IG5ldyBBcnJheSgxMCkuZmlsbCgwKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQoXHJcbiAgICAgICAgbTExOiBudW1iZXIsXHJcbiAgICAgICAgbTEyOiBudW1iZXIsXHJcbiAgICAgICAgbTEzOiBudW1iZXIsXHJcbiAgICAgICAgbTE0OiBudW1iZXIsXHJcbiAgICAgICAgbTIyOiBudW1iZXIsXHJcbiAgICAgICAgbTIzOiBudW1iZXIsXHJcbiAgICAgICAgbTI0OiBudW1iZXIsXHJcbiAgICAgICAgbTMzOiBudW1iZXIsXHJcbiAgICAgICAgbTM0OiBudW1iZXIsXHJcbiAgICAgICAgbTQ0OiBudW1iZXIsXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLm1bMF0gPSBtMTE7XHJcbiAgICAgICAgdGhpcy5tWzFdID0gbTEyO1xyXG4gICAgICAgIHRoaXMubVsyXSA9IG0xMztcclxuICAgICAgICB0aGlzLm1bM10gPSBtMTQ7XHJcblxyXG4gICAgICAgIHRoaXMubVs0XSA9IG0yMjtcclxuICAgICAgICB0aGlzLm1bNV0gPSBtMjM7XHJcbiAgICAgICAgdGhpcy5tWzZdID0gbTI0O1xyXG5cclxuICAgICAgICB0aGlzLm1bN10gPSBtMzM7XHJcbiAgICAgICAgdGhpcy5tWzhdID0gbTM0O1xyXG5cclxuICAgICAgICB0aGlzLm1bOV0gPSBtNDQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG1ha2VQbGFuZShhOiBudW1iZXIsIGI6IG51bWJlciwgYzogbnVtYmVyLCBkOiBudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXQoYSAqIGEsIGEgKiBiLCBhICogYywgYSAqIGQsIGIgKiBiLCBiICogYywgYiAqIGQsIGMgKiBjLCBjICogZCwgZCAqIGQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXQoYTExOiBudW1iZXIsIGExMjogbnVtYmVyLCBhMTM6IG51bWJlciwgYTIxOiBudW1iZXIsIGEyMjogbnVtYmVyLCBhMjM6IG51bWJlciwgYTMxOiBudW1iZXIsIGEzMjogbnVtYmVyLCBhMzM6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IGRldCA9XHJcbiAgICAgICAgICAgIHRoaXMubVthMTFdICogdGhpcy5tW2EyMl0gKiB0aGlzLm1bYTMzXSArXHJcbiAgICAgICAgICAgIHRoaXMubVthMTNdICogdGhpcy5tW2EyMV0gKiB0aGlzLm1bYTMyXSArXHJcbiAgICAgICAgICAgIHRoaXMubVthMTJdICogdGhpcy5tW2EyM10gKiB0aGlzLm1bYTMxXSAtXHJcbiAgICAgICAgICAgIHRoaXMubVthMTNdICogdGhpcy5tW2EyMl0gKiB0aGlzLm1bYTMxXSAtXHJcbiAgICAgICAgICAgIHRoaXMubVthMTFdICogdGhpcy5tW2EyM10gKiB0aGlzLm1bYTMyXSAtXHJcbiAgICAgICAgICAgIHRoaXMubVthMTJdICogdGhpcy5tW2EyMV0gKiB0aGlzLm1bYTMzXTtcclxuICAgICAgICByZXR1cm4gZGV0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHByb2R1Y2VzIG5ldyBNYXRyaXhcclxuICAgIHB1YmxpYyBhZGQobjogU3ltZXRyaWNNYXRyaXgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFN5bWV0cmljTWF0cml4KCkuc2V0KFxyXG4gICAgICAgICAgICB0aGlzLm1bMF0gKyBuLm1bMF0sXHJcbiAgICAgICAgICAgIHRoaXMubVsxXSArIG4ubVsxXSxcclxuICAgICAgICAgICAgdGhpcy5tWzJdICsgbi5tWzJdLFxyXG4gICAgICAgICAgICB0aGlzLm1bM10gKyBuLm1bM10sXHJcblxyXG4gICAgICAgICAgICB0aGlzLm1bNF0gKyBuLm1bNF0sXHJcbiAgICAgICAgICAgIHRoaXMubVs1XSArIG4ubVs1XSxcclxuICAgICAgICAgICAgdGhpcy5tWzZdICsgbi5tWzZdLFxyXG5cclxuICAgICAgICAgICAgdGhpcy5tWzddICsgbi5tWzddLFxyXG4gICAgICAgICAgICB0aGlzLm1bOF0gKyBuLm1bOF0sXHJcblxyXG4gICAgICAgICAgICB0aGlzLm1bOV0gKyBuLm1bOV0sXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWRkU2VsZihuOiBTeW1ldHJpY01hdHJpeCkge1xyXG4gICAgICAgIHRoaXMubVswXSArPSBuLm1bMF07XHJcbiAgICAgICAgdGhpcy5tWzFdICs9IG4ubVsxXTtcclxuICAgICAgICB0aGlzLm1bMl0gKz0gbi5tWzJdO1xyXG4gICAgICAgIHRoaXMubVszXSArPSBuLm1bM107XHJcbiAgICAgICAgdGhpcy5tWzRdICs9IG4ubVs0XTtcclxuICAgICAgICB0aGlzLm1bNV0gKz0gbi5tWzVdO1xyXG4gICAgICAgIHRoaXMubVs2XSArPSBuLm1bNl07XHJcbiAgICAgICAgdGhpcy5tWzddICs9IG4ubVs3XTtcclxuICAgICAgICB0aGlzLm1bOF0gKz0gbi5tWzhdO1xyXG4gICAgICAgIHRoaXMubVs5XSArPSBuLm1bOV07XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFRyaWFuZ2xlIHtcclxuICAgIHB1YmxpYyB2OiBudW1iZXJbXTtcclxuICAgIHB1YmxpYyB2YTogbnVtYmVyW107XHJcbiAgICBwdWJsaWMgZXJyOiBhbnlbXTtcclxuICAgIHB1YmxpYyBkZWxldGVkOiBib29sZWFuO1xyXG4gICAgcHVibGljIGRpcnR5OiBib29sZWFuO1xyXG4gICAgcHVibGljIG46IFZlYzM7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnYgPSBuZXcgQXJyYXkoMyk7IC8vIGluZGljZXMgZm9yIGFycmF5XHJcbiAgICAgICAgdGhpcy52YSA9IG5ldyBBcnJheSgzKTsgLy8gaW5kaWNlcyBmb3IgYXJyYVxyXG4gICAgICAgIHRoaXMuZXJyID0gbmV3IEFycmF5KDQpOyAvLyBlcnJvcnNcclxuICAgICAgICB0aGlzLmRlbGV0ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5uID0gbmV3IFZlYzMoKTsgLy8gTm9ybWFsXHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFZlcnRleCB7XHJcbiAgICBwdWJsaWMgaW5kZXg6IG51bWJlcjtcclxuICAgIHB1YmxpYyBwOiBWZWMzO1xyXG4gICAgLy8gcHVibGljIG46IFZlYzM7XHJcbiAgICAvLyBwdWJsaWMgdXY6IFZlYzI7XHJcbiAgICAvLyBwdWJsaWMgdGFuZ2VudHM6IFZlYzQ7XHJcbiAgICBwdWJsaWMgdHN0YXJ0OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgdGNvdW50OiBudW1iZXI7XHJcbiAgICBwdWJsaWMgcTogU3ltZXRyaWNNYXRyaXg7XHJcbiAgICBwdWJsaWMgYm9yZGVyOiBib29sZWFuO1xyXG4gICAgcHVibGljIHV2U3RlYW0hOiBib29sZWFuO1xyXG4gICAgcHVibGljIHV2Rm9sZG92ZXIhOiBib29sZWFuO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5wID0gbmV3IFZlYzMoKTtcclxuICAgICAgICB0aGlzLnRzdGFydCA9IC0xO1xyXG4gICAgICAgIHRoaXMudGNvdW50ID0gLTE7XHJcbiAgICAgICAgdGhpcy5xID0gbmV3IFN5bWV0cmljTWF0cml4KCk7XHJcbiAgICAgICAgdGhpcy5ib3JkZXIgPSBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUmVmIHtcclxuICAgIHB1YmxpYyB0dmVydGV4ITogbnVtYmVyO1xyXG4gICAgcHVibGljIHRpZCE6IG51bWJlcjtcclxufVxyXG5cclxuY2xhc3MgQm9yZGVyVmVydGV4IHtcclxuICAgIHB1YmxpYyBpbmRleDogbnVtYmVyO1xyXG4gICAgcHVibGljIGhhc2g6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoaW5kZXg6IG51bWJlciwgaGFzaDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHRoaXMuaGFzaCA9IGhhc2g7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiDorr7nva7lj4LmlbBcclxuICovXHJcbmNsYXNzIFNpbXBsaWZpY2F0aW9uT3B0aW9ucyB7XHJcbiAgICBwdWJsaWMgcHJlc2VydmVTdXJmYWNlQ3VydmF0dXJlID0gZmFsc2U7XHJcbiAgICBwdWJsaWMgcHJlc2VydmVCb3JkZXJFZGdlcyA9IGZhbHNlO1xyXG4gICAgcHVibGljIHByZXNlcnZlVVZTZWFtRWRnZXMgPSBmYWxzZTtcclxuICAgIHB1YmxpYyBwcmVzZXJ2ZVVWRm9sZG92ZXJFZGdlcyA9IGZhbHNlO1xyXG4gICAgcHVibGljIGVuYWJsZVNtYXJ0TGluayA9IHRydWU7XHJcbiAgICBwdWJsaWMgdmVydGV4TGlua0Rpc3RhbmNlID0gTnVtYmVyLk1JTl9WQUxVRTtcclxuICAgIHB1YmxpYyBtYXhJdGVyYXRpb25Db3VudCA9IDEwMDtcclxuICAgIHB1YmxpYyBhZ3Jlc3NpdmVuZXNzID0gNy4wO1xyXG59XHJcblxyXG4vKipcclxuICog572R5qC8566A5YyWXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTWVzaFNpbXBsaWZ5IHtcclxuICAgIHB1YmxpYyBzaW1wbGlmaWNhdGlvbk9wdGlvbnM6IFNpbXBsaWZpY2F0aW9uT3B0aW9ucyA9IG5ldyBTaW1wbGlmaWNhdGlvbk9wdGlvbnMoKTtcclxuICAgIHByaXZhdGUgX3RyaWFuZ2xlczogVHJpYW5nbGVbXSA9IFtdOyAvLyBUcmlhbmdsZVxyXG4gICAgcHJpdmF0ZSBfdmVydGljZXM6IFZlcnRleFtdID0gW107IC8vIFZlcnRleFxyXG5cclxuICAgIHByaXZhdGUgX3ZlcnROb3JtYWxzOiBWZWMzW10gfCBudWxsID0gbnVsbDtcclxuICAgIHByaXZhdGUgX3ZlcnRUYW5nZW50czogVmVjNFtdIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwcml2YXRlIF92ZXJ0VVYyRDogVmVjMltdIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwcml2YXRlIF92ZXJ0VVYzRDogVmVjM1tdIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwcml2YXRlIF92ZXJ0VVY0RDogVmVjNFtdIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwcml2YXRlIF92ZXJ0Q29sb3JzOiBDb2xvcltdIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgcHJpdmF0ZSBfdmVydEpvaW50czogVmVjNFtdIHwgbnVsbCA9IG51bGw7XHJcbiAgICBwcml2YXRlIF92ZXJ0V2VpZ2h0czogVmVjNFtdIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgcHJpdmF0ZSBfcmVmczogUmVmW10gPSBbXTsgLy8gUmVmXHJcbiAgICBwcml2YXRlIF9nZW9tZXRyaWNJbmZvID0gJyc7XHJcblxyXG4gICAgcHJpdmF0ZSBfdHJpYW5nbGVIYXNoU2V0MSA9IG5ldyBNYXA8VHJpYW5nbGUsIGJvb2xlYW4+KCk7XHJcbiAgICBwcml2YXRlIF90cmlhbmdsZUhhc2hTZXQyID0gbmV3IE1hcDxUcmlhbmdsZSwgYm9vbGVhbj4oKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIOWIneWni+WMllxyXG4gICAgICogQHBhcmFtIG9yaWdWZXJ0aWNlc1xyXG4gICAgICogQHBhcmFtIG9yaWdGYWNlc1xyXG4gICAgICogQHBhcmFtIGluZm9cclxuICAgICAqL1xyXG4gICAgcHVibGljIGluaXQob3JpZ1ZlcnRpY2VzOiBWZWMzW10sIG9yaWdGYWNlczogYW55W10sIGluZm86IHsgbm9ybWFscz87IHV2cz87IHRhbmdlbnRzPzsgY29sb3JzPzsgam9pbnRzPzsgd2VpZ2h0cz8gfSkge1xyXG4gICAgICAgIHRoaXMuX3ZlcnRpY2VzID0gb3JpZ1ZlcnRpY2VzLm1hcCgocCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdmVydCA9IG5ldyBWZXJ0ZXgoKTtcclxuICAgICAgICAgICAgdmVydC5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgICAgICB2ZXJ0LnAgPSBuZXcgVmVjMyhwLngsIHAueSwgcC56KTtcclxuICAgICAgICAgICAgcmV0dXJuIHZlcnQ7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChpbmZvLnV2cyAmJiBpbmZvLnV2cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZlcnRVVjJEID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5mby51dnMubGVuZ3RoOyBpICs9IDIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZlcnRVVjJELnB1c2gobmV3IFZlYzIoaW5mby51dnNbaV0sIGluZm8udXZzW2kgKyAxXSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbmZvLm5vcm1hbHMgJiYgaW5mby5ub3JtYWxzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5fdmVydE5vcm1hbHMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbmZvLm5vcm1hbHMubGVuZ3RoOyBpICs9IDMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZlcnROb3JtYWxzLnB1c2gobmV3IFZlYzMoaW5mby5ub3JtYWxzW2ldLCBpbmZvLm5vcm1hbHNbaSArIDFdLCBpbmZvLm5vcm1hbHNbaSArIDJdKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbmZvLnRhbmdlbnRzICYmIGluZm8udGFuZ2VudHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl92ZXJ0VGFuZ2VudHMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbmZvLnRhbmdlbnRzLmxlbmd0aDsgaSArPSA0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92ZXJ0VGFuZ2VudHMucHVzaChuZXcgVmVjNChpbmZvLnRhbmdlbnRzW2ldLCBpbmZvLnRhbmdlbnRzW2kgKyAxXSwgaW5mby50YW5nZW50c1tpICsgMl0sIGluZm8udGFuZ2VudHNbaSArIDNdKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbmZvLmNvbG9ycyAmJiBpbmZvLmNvbG9ycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZlcnRDb2xvcnMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbmZvLmNvbG9ycy5sZW5ndGg7IGkgKz0gNCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmVydENvbG9ycy5wdXNoKG5ldyBDb2xvcihpbmZvLmNvbG9yc1tpXSwgaW5mby5jb2xvcnNbaSArIDFdLCBpbmZvLmNvbG9yc1tpICsgMl0sIGluZm8uY29sb3JzW2kgKyAzXSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5mby5qb2ludHMgJiYgaW5mby5qb2ludHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl92ZXJ0Sm9pbnRzID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5mby5qb2ludHMubGVuZ3RoOyBpICs9IDQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZlcnRKb2ludHMucHVzaChuZXcgVmVjNChpbmZvLmpvaW50c1tpXSwgaW5mby5qb2ludHNbaSArIDFdLCBpbmZvLmpvaW50c1tpICsgMl0sIGluZm8uam9pbnRzW2kgKyAzXSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5mby53ZWlnaHRzICYmIGluZm8ud2VpZ2h0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZlcnRXZWlnaHRzID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5mby53ZWlnaHRzLmxlbmd0aDsgaSArPSA0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl92ZXJ0V2VpZ2h0cy5wdXNoKG5ldyBWZWM0KGluZm8ud2VpZ2h0c1tpXSwgaW5mby53ZWlnaHRzW2kgKyAxXSwgaW5mby53ZWlnaHRzW2kgKyAyXSwgaW5mby53ZWlnaHRzW2kgKyAzXSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl90cmlhbmdsZXMgPSBvcmlnRmFjZXMubWFwKChmKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRyaSA9IG5ldyBUcmlhbmdsZSgpO1xyXG4gICAgICAgICAgICB0cmkudlswXSA9IGYuYTtcclxuICAgICAgICAgICAgdHJpLnZbMV0gPSBmLmI7XHJcbiAgICAgICAgICAgIHRyaS52WzJdID0gZi5jO1xyXG5cclxuICAgICAgICAgICAgdHJpLnZhWzBdID0gZi5hO1xyXG4gICAgICAgICAgICB0cmkudmFbMV0gPSBmLmI7XHJcbiAgICAgICAgICAgIHRyaS52YVsyXSA9IGYuYztcclxuICAgICAgICAgICAgcmV0dXJuIHRyaTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOS/ruaUuemYn+WIl+mVv+W6plxyXG4gICAgICogQHBhcmFtIGFycmF5XHJcbiAgICAgKiBAcGFyYW0gY291bnRcclxuICAgICAqIEByZXR1cm5zXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3Jlc2l6ZShhcnJheTogYW55W10sIGNvdW50OiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoY291bnQgPCBhcnJheS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFycmF5LnNwbGljZShjb3VudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY291bnQgPiBhcnJheS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgLy8gaW4gSlMsIGFycmF5cyBuZWVkIG5vdCBiZSBleHBhbmRlZFxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnbW9yZScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOenu+WKqOaVsOaNrlxyXG4gICAgICogQHBhcmFtIHJlZnNcclxuICAgICAqIEBwYXJhbSBkZXN0XHJcbiAgICAgKiBAcGFyYW0gc291cmNlXHJcbiAgICAgKiBAcGFyYW0gY291bnRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfbW92ZShyZWZzOiBSZWZbXSwgZGVzdDogbnVtYmVyLCBzb3VyY2U6IG51bWJlciwgY291bnQ6IG51bWJlcikge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICAvLyBcdHJlZnNbZGVzdCArIGldID0gcmVmc1tzb3VyY2UgKyBpXTtcclxuICAgICAgICAgICAgcmVmc1tkZXN0ICsgaV0udHZlcnRleCA9IHJlZnNbc291cmNlICsgaV0udHZlcnRleDtcclxuICAgICAgICAgICAgcmVmc1tkZXN0ICsgaV0udGlkID0gcmVmc1tzb3VyY2UgKyBpXS50aWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5ZCI5bm2572R5qC8XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjb21wYWN0TWVzaCgpIHtcclxuICAgICAgICAvL1x0Y29uc29sZS5sb2coJ2NvbXBhY3RfbWVzaCcpO1xyXG4gICAgICAgIGxldCAvKmludCAqLyBkc3QgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdmVydGljZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5fdmVydGljZXNbaV0udGNvdW50ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl90cmlhbmdsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl90cmlhbmdsZXNbaV0uZGVsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgLypUcmlhbmdsZSAmKi8gdCA9IHRoaXMuX3RyaWFuZ2xlc1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDM7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0LnZhW2pdICE9IHQudltqXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpRGVzdCA9IHQudmFbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlTcmMgPSB0LnZbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFZlYzMuY29weSh0aGlzLl92ZXJ0aWNlc1tpRGVzdF0ucCwgdGhpcy5fdmVydGljZXNbaVNyY10ucCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl92ZXJ0V2VpZ2h0cyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBWZWM0LmNvcHkodGhpcy5fdmVydFdlaWdodHNbaURlc3RdLCB0aGlzLl92ZXJ0V2VpZ2h0c1tpU3JjXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3ZlcnRKb2ludHMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVmVjNC5jb3B5KHRoaXMuX3ZlcnRKb2ludHNbaURlc3RdLCB0aGlzLl92ZXJ0Sm9pbnRzW2lTcmNdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0LnZbal0gPSB0LnZhW2pdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl90cmlhbmdsZXNbZHN0KytdID0gdDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgMzsgaisrKSB0aGlzLl92ZXJ0aWNlc1t0LnZbal1dLnRjb3VudCA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcmVzaXplKHRoaXMuX3RyaWFuZ2xlcywgZHN0KTtcclxuICAgICAgICBkc3QgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdmVydGljZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2VzW2ldLnRjb3VudCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmVydGljZXNbaV0udHN0YXJ0ID0gZHN0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmVydGljZXNbZHN0XS5pbmRleCA9IGRzdDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZlcnRpY2VzW2RzdF0ucCA9IHRoaXMuX3ZlcnRpY2VzW2ldLnA7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3ZlcnRVVjJEKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmVydFVWMkRbZHN0XSA9IHRoaXMuX3ZlcnRVVjJEW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3ZlcnROb3JtYWxzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmVydE5vcm1hbHNbZHN0XSA9IHRoaXMuX3ZlcnROb3JtYWxzW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3ZlcnRUYW5nZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZlcnRUYW5nZW50c1tkc3RdID0gdGhpcy5fdmVydFRhbmdlbnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3ZlcnRDb2xvcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl92ZXJ0Q29sb3JzW2RzdF0gPSB0aGlzLl92ZXJ0Q29sb3JzW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3ZlcnRKb2ludHMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl92ZXJ0Sm9pbnRzW2RzdF0gPSB0aGlzLl92ZXJ0Sm9pbnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3ZlcnRXZWlnaHRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmVydFdlaWdodHNbZHN0XSA9IHRoaXMuX3ZlcnRXZWlnaHRzW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZHN0Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdHJpYW5nbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IC8qVHJpYW5nbGUgJiovIHQgPSB0aGlzLl90cmlhbmdsZXNbaV07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgMzsgaisrKSB0LnZbal0gPSB0aGlzLl92ZXJ0aWNlc1t0LnZbal1dLnRzdGFydDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9cdGNvbnNvbGUubG9nKCclY0NvbXBhY3QgTWVzaCcsICdiYWNrZ3JvdW5kOiNmMDAnLCB0aGlzLl92ZXJ0aWNlcy5sZW5ndGgsIGRzdCk7XHJcbiAgICAgICAgdGhpcy5fcmVzaXplKHRoaXMuX3ZlcnRpY2VzLCBkc3QpO1xyXG4gICAgICAgIC8vXHRjb25zb2xlLmxvZygnJWNDb21wYWN0IE1lc2ggb2snLCAnYmFja2dyb3VuZDojZjAwJywgdGhpcy5fdmVydGljZXMubGVuZ3RoLCBkc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog566A5YyW572R5qC8XHJcbiAgICAgKiBAcGFyYW0gdGFyZ2V0X2NvdW50XHJcbiAgICAgKiBAcGFyYW0gYWdyZXNzaXZlbmVzc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9zaW1wbGlmeU1lc2godGFyZ2V0X2NvdW50OiBudW1iZXIsIGFncmVzc2l2ZW5lc3M6IG51bWJlciB8IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGlmIChhZ3Jlc3NpdmVuZXNzID09PSB1bmRlZmluZWQpIGFncmVzc2l2ZW5lc3MgPSB0aGlzLnNpbXBsaWZpY2F0aW9uT3B0aW9ucy5hZ3Jlc3NpdmVuZXNzO1xyXG5cclxuICAgICAgICAvLyBUT0RPIG5vcm1hbGl6ZV9tZXNoIHRvIG1heCBsZW5ndGggMT9cclxuXHJcbiAgICAgICAgY29uc29sZS50aW1lKCdzaW1wbGlmeV9tZXNoJyk7XHJcblxyXG4gICAgICAgIGxldCBpLCBpbDtcclxuXHJcbiAgICAgICAgLy8gc2V0IGFsbCB0cmlhbmdsZXMgdG8gbm9uIGRlbGV0ZWRcclxuICAgICAgICBmb3IgKGkgPSAwLCBpbCA9IHRoaXMuX3RyaWFuZ2xlcy5sZW5ndGg7IGkgPCBpbDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RyaWFuZ2xlc1tpXS5kZWxldGVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBtYWluIGl0ZXJhdGlvbiBsb29wXHJcblxyXG4gICAgICAgIGxldCBkZWxldGVkX3RyaWFuZ2xlcyA9IDA7XHJcbiAgICAgICAgY29uc3QgZGVsZXRlZDA6IG5ldmVyW10gPSBbXSxcclxuICAgICAgICAgICAgZGVsZXRlZDE6IGFueVtdID0gW107IC8vIHN0ZDo6dmVjdG9yPGludD5cclxuICAgICAgICBjb25zdCB0cmlhbmdsZV9jb3VudCA9IHRoaXMuX3RyaWFuZ2xlcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGl0ZXJhdGlvbiA9IDA7IGl0ZXJhdGlvbiA8IHRoaXMuc2ltcGxpZmljYXRpb25PcHRpb25zLm1heEl0ZXJhdGlvbkNvdW50OyBpdGVyYXRpb24rKykge1xyXG4gICAgICAgICAgICAvLyBcdGNvbnNvbGUubG9nKFwiaXRlcmF0aW9uICVkIC0gdHJpYW5nbGVzICVkLCB0cmlzXFxuXCIsIGl0ZXJhdGlvbiwgdHJpYW5nbGVfY291bnQgLSBkZWxldGVkX3RyaWFuZ2xlcywgdGhpcy5fdHJpYW5nbGVzLmxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodHJpYW5nbGVfY291bnQgLSBkZWxldGVkX3RyaWFuZ2xlcyA8PSB0YXJnZXRfY291bnQpIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgLy8gdXBkYXRlIG1lc2ggb25jZSBpbiBhIHdoaWxlXHJcbiAgICAgICAgICAgIGlmIChpdGVyYXRpb24gJSA1ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVNZXNoKGl0ZXJhdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGNsZWFyIGRpcnR5IGZsYWdcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLl90cmlhbmdsZXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RyaWFuZ2xlc1tqXS5kaXJ0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAvLyBBbGwgdHJpYW5nbGVzIHdpdGggZWRnZXMgYmVsb3cgdGhlIHRocmVzaG9sZCB3aWxsIGJlIHJlbW92ZWRcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBudW1iZXJzIHdvcmtzIHdlbGwgZm9yIG1vc3QgbW9kZWxzLlxyXG4gICAgICAgICAgICAvLyBJZiBpdCBkb2VzIG5vdCwgdHJ5IHRvIGFkanVzdCB0aGUgMyBwYXJhbWV0ZXJzXHJcbiAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgIC8vbGV0IHRocmVzaG9sZCA9IDAuMDAwMDAwMDAxICogTWF0aC5wb3coaXRlcmF0aW9uICsgMywgYWdyZXNzaXZlbmVzcyk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRocmVzaG9sZCA9IDFlLTEzICogTWF0aC5wb3coaXRlcmF0aW9uICsgMywgYWdyZXNzaXZlbmVzcyk7XHJcbiAgICAgICAgICAgIC8vIHJlbW92ZSB2ZXJ0aWNlcyAmIG1hcmsgZGVsZXRlZCB0cmlhbmdsZXNcclxuICAgICAgICAgICAgZm9yIChpID0gMCwgaWwgPSB0aGlzLl90cmlhbmdsZXMubGVuZ3RoOyBpIDwgaWw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdCA9IHRoaXMuX3RyaWFuZ2xlc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmICh0LmVyclszXSA+IHRocmVzaG9sZCB8fCB0LmRlbGV0ZWQgfHwgdC5kaXJ0eSkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAzOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodC5lcnJbal0gPCB0aHJlc2hvbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaTAgPSB0LnZbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHYwID0gdGhpcy5fdmVydGljZXNbaTBdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaTEgPSB0LnZbKGogKyAxKSAlIDNdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2MSA9IHRoaXMuX3ZlcnRpY2VzW2kxXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJvcmRlciBjaGVja1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodjAuYm9yZGVyICE9IHYxLmJvcmRlcikgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYwLnV2U3RlYW0gIT0gdjEudXZTdGVhbSkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHYwLnV2Rm9sZG92ZXIgIT0gdjEudXZGb2xkb3ZlcikgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuc2ltcGxpZmljYXRpb25PcHRpb25zLnByZXNlcnZlQm9yZGVyRWRnZXMgJiYgdjAuYm9yZGVyKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgc2VhbXMgc2hvdWxkIGJlIHByZXNlcnZlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLnNpbXBsaWZpY2F0aW9uT3B0aW9ucy5wcmVzZXJ2ZVVWU2VhbUVkZ2VzICYmIHYwLnV2U3RlYW0pIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBmb2xkb3ZlcnMgc2hvdWxkIGJlIHByZXNlcnZlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLnNpbXBsaWZpY2F0aW9uT3B0aW9ucy5wcmVzZXJ2ZVVWRm9sZG92ZXJFZGdlcyAmJiB2MC51dkZvbGRvdmVyKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbXB1dGUgdmVydGV4IHRvIGNvbGxhcHNlIHRvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHAgPSBuZXcgVmVjMygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWxjdWxhdGVFcnJvcihpMCwgaTEsIHApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnQ29tcHV0ZSB2ZXJ0ZXggdG8gY29sbGFwc2UgdG8nLCBwKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZShkZWxldGVkMCwgdjAudGNvdW50KTsgLy8gbm9ybWFscyB0ZW1wb3JhcmlseVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXNpemUoZGVsZXRlZDEsIHYxLnRjb3VudCk7IC8vIG5vcm1hbHMgdGVtcG9yYXJpbHlcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRvbnQgcmVtb3ZlIGlmIF9mbGlwcGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9mbGlwcGVkKHAsIGkwLCBpMSwgdjAsIHYxLCBkZWxldGVkMCkpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZmxpcHBlZChwLCBpMSwgaTAsIHYxLCB2MCwgZGVsZXRlZDEpKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgYmFyeWNlbnRyaWMgY29vcmRpbmF0ZXMgd2l0aGluIHRoZSB0cmlhbmdsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpMiA9IHQudlsoaiArIDIpICUgM107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhcnljZW50cmljQ29vcmQgPSBuZXcgVmVjMygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZUJhcnljZW50cmljQ29vcmRzKHAsIHYwLnAsIHYxLnAsIHRoaXMuX3ZlcnRpY2VzW2kyXS5wLCBiYXJ5Y2VudHJpY0Nvb3JkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdCBfZmxpcHBlZCwgc28gcmVtb3ZlIGVkZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgdjAucCA9IHA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHYwLnEgPSB2MS5xICsgdjAucTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdjAucS5hZGRTZWxmKHYxLnEpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW50ZXJwb2xhdGUgdGhlIHZlcnRleCBhdHRyaWJ1dGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpYTAgPSB0LnZhW2pdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpYTEgPSB0LnZhWyhqICsgMSkgJSAzXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaWEyID0gdC52YVsoaiArIDIpICUgM107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ludGVycG9sYXRlVmVydGV4QXR0cmlidXRlcyhpYTAsIGlhMCwgaWExLCBpYTIsIGJhcnljZW50cmljQ29vcmQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2VzW2kwXS51dlN0ZWFtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpYTAgPSAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHN0YXJ0ID0gdGhpcy5fcmVmcy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDT05USU5VRVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGVkX3RyaWFuZ2xlcyA9IHRoaXMuX3VwZGF0ZVRyaWFuZ2xlcyhpMCwgaWEwLCB2MCwgZGVsZXRlZDAsIGRlbGV0ZWRfdHJpYW5nbGVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2RlbGV0ZWQgdHJpYW5nbGUgdjAnLCBkZWxldGVkX3RyaWFuZ2xlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZWRfdHJpYW5nbGVzID0gdGhpcy5fdXBkYXRlVHJpYW5nbGVzKGkwLCBpYTAsIHYxLCBkZWxldGVkMSwgZGVsZXRlZF90cmlhbmdsZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnZGVsZXRlZCB0cmlhbmdsZSB2MScsIGRlbGV0ZWRfdHJpYW5nbGVzKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRjb3VudCA9IHRoaXMuX3JlZnMubGVuZ3RoIC0gdHN0YXJ0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRjb3VudCA8PSB2MC50Y291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdzYXZlIHJhbT8nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0Y291bnQpIHRoaXMuX21vdmUodGhpcy5fcmVmcywgdjAudHN0YXJ0LCB0c3RhcnQsIHRjb3VudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXBwZW5kXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgdjAudHN0YXJ0ID0gdHN0YXJ0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdjAudGNvdW50ID0gdGNvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IC8vIGVuZCBmb3IgalxyXG5cclxuICAgICAgICAgICAgICAgIC8vIGRvbmU/XHJcbiAgICAgICAgICAgICAgICBpZiAodHJpYW5nbGVfY291bnQgLSBkZWxldGVkX3RyaWFuZ2xlcyA8PSB0YXJnZXRfY291bnQpIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSAvLyBlbmQgaXRlcmF0aW9uXHJcblxyXG4gICAgICAgIC8vIGNsZWFuIHVwIG1lc2hcclxuICAgICAgICB0aGlzLmNvbXBhY3RNZXNoKCk7XHJcblxyXG4gICAgICAgIC8vIHJlYWR5XHJcbiAgICAgICAgY29uc29sZS50aW1lRW5kKCdzaW1wbGlmeV9tZXNoJyk7XHJcblxyXG4gICAgICAgIC8vIGludCB0aW1lRW5kPXRpbWVHZXRUaW1lKCk7XHJcbiAgICAgICAgLy8gcHJpbnRmKFwiJXMgLSAlZC8lZCAlZCUlIHJlbW92ZWQgaW4gJWQgbXNcXG5cIixfX0ZVTkNUSU9OX18sXHJcbiAgICAgICAgLy8gXHR0cmlhbmdsZV9jb3VudC1kZWxldGVkX3RyaWFuZ2xlcyxcclxuICAgICAgICAvLyBcdHRyaWFuZ2xlX2NvdW50LGRlbGV0ZWRfdHJpYW5nbGVzKjEwMC90cmlhbmdsZV9jb3VudCxcclxuICAgICAgICAvLyBcdHRpbWVFbmQtdGltZVN0YXJ0KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgLypib29sKi8gX2ZsaXBwZWQoXHJcbiAgICAgICAgLyogdmVjM2YgKi8gcDogbWF0aC5JVmVjM0xpa2UsXHJcbiAgICAgICAgLyppbnQqLyBpMDogbnVtYmVyLFxyXG4gICAgICAgIC8qaW50Ki8gaTE6IG51bWJlcixcclxuICAgICAgICAvKlZlcnRleCovIHYwOiBWZXJ0ZXgsXHJcbiAgICAgICAgLypWZXJ0ZXgqLyB2MTogVmVydGV4LCAvLyBub3QgbmVlZGVkXHJcbiAgICAgICAgLypzdGQ6OnZlY3RvcjxpbnQ+Ki8gZGVsZXRlZDogYW55W10sXHJcbiAgICApIHtcclxuICAgICAgICAvLyBsZXQgYm9yZGVyY291bnQgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgdjAudGNvdW50OyBrKyspIHtcclxuICAgICAgICAgICAgLy8gVHJpYW5nbGUgJlxyXG4gICAgICAgICAgICBjb25zdCB0ID0gdGhpcy5fdHJpYW5nbGVzW3RoaXMuX3JlZnNbdjAudHN0YXJ0ICsga10udGlkXTtcclxuICAgICAgICAgICAgaWYgKHQuZGVsZXRlZCkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzID0gdGhpcy5fcmVmc1t2MC50c3RhcnQgKyBrXS50dmVydGV4O1xyXG4gICAgICAgICAgICBjb25zdCBpZDEgPSB0LnZbKHMgKyAxKSAlIDNdO1xyXG4gICAgICAgICAgICBjb25zdCBpZDIgPSB0LnZbKHMgKyAyKSAlIDNdO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlkMSA9PSBpMSB8fCBpZDIgPT0gaTEpIHtcclxuICAgICAgICAgICAgICAgIC8vIGRlbGV0ZSA/XHJcbiAgICAgICAgICAgICAgICAvLyBib3JkZXJjb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlZFtrXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLyogdmVjM2YgKi9cclxuICAgICAgICAgICAgVmVjMy5zdWJ0cmFjdChfdGVtcFZlYzMsIHRoaXMuX3ZlcnRpY2VzW2lkMV0ucCwgcCk7XHJcbiAgICAgICAgICAgIF90ZW1wVmVjMy5ub3JtYWxpemUoKTtcclxuICAgICAgICAgICAgVmVjMy5zdWJ0cmFjdChfdGVtcFZlYzNfMiwgdGhpcy5fdmVydGljZXNbaWQyXS5wLCBwKTtcclxuICAgICAgICAgICAgX3RlbXBWZWMzXzIubm9ybWFsaXplKCk7XHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhWZWMzLmRvdChfdGVtcFZlYzMsIF90ZW1wVmVjM18yKSkgPiAwLjk5OSkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIC8qdmVjM2YgIG47Ki9cclxuICAgICAgICAgICAgVmVjMy5jcm9zcyhfdGVtcFZlYzNfMywgX3RlbXBWZWMzLCBfdGVtcFZlYzNfMik7XHJcbiAgICAgICAgICAgIF90ZW1wVmVjM18zLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgICAgICBkZWxldGVkW2tdID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChWZWMzLmRvdChfdGVtcFZlYzNfMywgdC5uKSA8IDAuMikgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgdHJpYW5nbGUgY29ubmVjdGlvbnMgYW5kIGVkZ2UgZXJyb3IgYWZ0ZXIgYSBlZGdlIGlzIGNvbGxhcHNlZFxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5pu05paw5LiJ6KeS5b2i5L+h5oGvXHJcbiAgICAgKiBAcGFyYW0gaTBcclxuICAgICAqIEBwYXJhbSBpYTBcclxuICAgICAqIEBwYXJhbSB2XHJcbiAgICAgKiBAcGFyYW0gZGVsZXRlZFxyXG4gICAgICogQHBhcmFtIGRlbGV0ZWRfdHJpYW5nbGVzXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF91cGRhdGVUcmlhbmdsZXMoXHJcbiAgICAgICAgLyppbnQqLyBpMDogbnVtYmVyLFxyXG4gICAgICAgIGlhMDogbnVtYmVyLFxyXG4gICAgICAgIC8qVmVydGV4ICYqLyB2OiBWZXJ0ZXgsXHJcbiAgICAgICAgLypzdGQ6OnZlY3RvcjxpbnQ+ICYgKi8gZGVsZXRlZDogYW55W10sXHJcbiAgICAgICAgLyppbnQgJiovIGRlbGV0ZWRfdHJpYW5nbGVzOiBudW1iZXIsXHJcbiAgICApIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnX3VwZGF0ZVRyaWFuZ2xlcycpO1xyXG4gICAgICAgIC8vIHZlYzNmIHA7XHJcbiAgICAgICAgY29uc3QgcCA9IG5ldyBWZWMzKCk7XHJcbiAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCB2LnRjb3VudDsgaysrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IC8qUmVmICYqLyByID0gdGhpcy5fcmVmc1t2LnRzdGFydCArIGtdO1xyXG4gICAgICAgICAgICBjb25zdCAvKlRyaWFuZ2xlICYqLyB0ID0gdGhpcy5fdHJpYW5nbGVzW3IudGlkXTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0LmRlbGV0ZWQpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBpZiAoZGVsZXRlZFtrXSkge1xyXG4gICAgICAgICAgICAgICAgdC5kZWxldGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZWRfdHJpYW5nbGVzKys7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0LnZbci50dmVydGV4XSA9IGkwO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlhMCAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgdC52YVtyLnR2ZXJ0ZXhdID0gaWEwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0LmRpcnR5ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHQuZXJyWzBdID0gdGhpcy5fY2FsY3VsYXRlRXJyb3IodC52WzBdLCB0LnZbMV0sIHApO1xyXG4gICAgICAgICAgICB0LmVyclsxXSA9IHRoaXMuX2NhbGN1bGF0ZUVycm9yKHQudlsxXSwgdC52WzJdLCBwKTtcclxuICAgICAgICAgICAgdC5lcnJbMl0gPSB0aGlzLl9jYWxjdWxhdGVFcnJvcih0LnZbMl0sIHQudlswXSwgcCk7XHJcbiAgICAgICAgICAgIHQuZXJyWzNdID0gTWF0aC5taW4odC5lcnJbMF0sIHQuZXJyWzFdLCB0LmVyclsyXSk7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlZnMucHVzaChyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRlbGV0ZWRfdHJpYW5nbGVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvbXBhY3QgdHJpYW5nbGVzLCBjb21wdXRlIGVkZ2UgZXJyb3IgYW5kIGJ1aWxkIHJlZmVyZW5jZSBsaXN0XHJcbiAgICBwcml2YXRlIF91cGRhdGVNZXNoKGl0ZXJhdGlvbjogbnVtYmVyKSAvKmludCovIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnX3VwZGF0ZU1lc2gnLCBpdGVyYXRpb24sIHRoaXMuX3RyaWFuZ2xlcy5sZW5ndGgpO1xyXG4gICAgICAgIGlmIChpdGVyYXRpb24gPiAwKSB7XHJcbiAgICAgICAgICAgIC8vIGNvbXBhY3QgdHJpYW5nbGVzXHJcbiAgICAgICAgICAgIGxldCBkc3QgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3RyaWFuZ2xlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5fdHJpYW5nbGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0YXJnZXQuZGVsZXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RyaWFuZ2xlc1tkc3QrK10gPSB0YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdub3QgZGVsZXRlZCBkc3QnLCB0aGlzLl90cmlhbmdsZXMubGVuZ3RoLCBkc3QpO1xyXG4gICAgICAgICAgICB0aGlzLl90cmlhbmdsZXMuc3BsaWNlKGRzdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl91cGRhdGVSZWZlcmVuY2VzKCk7XHJcblxyXG4gICAgICAgIC8vIEluaXQgUXVhZHJpY3MgYnkgUGxhbmUgJiBFZGdlIEVycm9yc1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gcmVxdWlyZWQgYXQgdGhlIGJlZ2lubmluZyAoIGl0ZXJhdGlvbiA9PSAwIClcclxuICAgICAgICAvLyByZWNvbXB1dGluZyBkdXJpbmcgdGhlIHNpbXBsaWZpY2F0aW9uIGlzIG5vdCByZXF1aXJlZCxcclxuICAgICAgICAvLyBidXQgbW9zdGx5IGltcHJvdmVzIHRoZSByZXN1bHQgZm9yIGNsb3NlZCBtZXNoZXNcclxuICAgICAgICAvL1xyXG5cclxuICAgICAgICAvLyBJZGVudGlmeSBib3VuZGFyeSA6IHZlcnRpY2VzW10uYm9yZGVyPTAsMVxyXG4gICAgICAgIGlmIChpdGVyYXRpb24gPT0gMCkge1xyXG4gICAgICAgICAgICAvLyBzdGQ6OnZlY3RvcjxpbnQ+IHZjb3VudCx2aWRzO1xyXG4gICAgICAgICAgICBsZXQgdmNvdW50LCB2aWRzO1xyXG4gICAgICAgICAgICBsZXQgYm9yZGVyVmVydGV4Q291bnQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgYm9yZGVyTWluWCA9IDEuNzk3NjkzMTM0ODYyMzE1N2UzMDg7XHJcbiAgICAgICAgICAgIGxldCBib3JkZXJNYXhYID0gLTEuNzk3NjkzMTM0ODYyMzE1N2UzMDg7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdmVydGljZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZlcnRpY2VzW2ldLmJvcmRlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmVydGljZXNbaV0udXZTdGVhbSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmVydGljZXNbaV0udXZGb2xkb3ZlciA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3ZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCAvKlZlcnRleCAmKi8gdiA9IHRoaXMuX3ZlcnRpY2VzW2ldO1xyXG4gICAgICAgICAgICAgICAgLy8gdmNvdW50LmNsZWFyKCk7XHJcbiAgICAgICAgICAgICAgICAvLyB2aWRzLmNsZWFyKCk7XHJcbiAgICAgICAgICAgICAgICB2Y291bnQgPSBbXTtcclxuICAgICAgICAgICAgICAgIHZpZHMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHYudGNvdW50OyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBrID0gdGhpcy5fcmVmc1t2LnRzdGFydCArIGpdLnRpZDtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCAvKlRyaWFuZ2xlICYqLyB0ID0gdGhpcy5fdHJpYW5nbGVzW2tdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IDM7IGsrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb2ZzID0gMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gdC52W2tdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAob2ZzIDwgdmNvdW50Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZpZHNbb2ZzXSA9PSBpZCkgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZnMrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9mcyA9PSB2Y291bnQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2Y291bnQucHVzaCgxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZHMucHVzaChpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2Y291bnRbb2ZzXSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB2Y291bnQubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodmNvdW50W2pdID09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmVydGljZXNbdmlkc1tqXV0uYm9yZGVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyVmVydGV4Q291bnQrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2ltcGxpZmljYXRpb25PcHRpb25zLmVuYWJsZVNtYXJ0TGluaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaWQgPSB2aWRzW2pdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2VzW2lkXS5wLnggPCBib3JkZXJNaW5YKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyTWluWCA9IHRoaXMuX3ZlcnRpY2VzW2lkXS5wLng7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fdmVydGljZXNbaWRdLnAueCA+IGJvcmRlck1heFgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJNYXhYID0gdGhpcy5fdmVydGljZXNbaWRdLnAueDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuc2ltcGxpZmljYXRpb25PcHRpb25zLmVuYWJsZVNtYXJ0TGluaykge1xyXG4gICAgICAgICAgICAgICAgLy8gRmlyc3QgZmluZCBhbGwgYm9yZGVyIHZlcnRpY2VzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBib3JkZXJWZXJ0aWNlczogQm9yZGVyVmVydGV4W10gPSBuZXcgQXJyYXkoYm9yZGVyVmVydGV4Q291bnQpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGJvcmRlckluZGV4Q291bnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYm9yZGVyQXJlYVdpZHRoID0gYm9yZGVyTWF4WCAtIGJvcmRlck1pblg7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3ZlcnRpY2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2VzW2ldLmJvcmRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB2ZXJ0ZXhIYXNoID0gKCgodGhpcy5fdmVydGljZXNbaV0ucC54IC0gYm9yZGVyTWluWCkgLyBib3JkZXJBcmVhV2lkdGgpICogMi4wIC0gMS4wKSAqIDIxNDc0ODM2NDc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclZlcnRpY2VzW2JvcmRlckluZGV4Q291bnRdID0gbmV3IEJvcmRlclZlcnRleChpLCB2ZXJ0ZXhIYXNoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKytib3JkZXJJbmRleENvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTb3J0IHRoZSBib3JkZXIgdmVydGljZXMgYnkgaGFzaFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyVmVydGljZXMuc29ydCgoeDogQm9yZGVyVmVydGV4LCB5OiBCb3JkZXJWZXJ0ZXgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiAoeC5oYXNoID4geS5oYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRyZXR1cm4gMVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH0gZWxzZSBpZiAoeC5oYXNoIDwgeS5oYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRyZXR1cm4gLTFcclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHguaGFzaCAtIHkuaGFzaDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgbWF4aW11bSBoYXNoIGRpc3RhbmNlIGJhc2VkIG9uIHRoZSBtYXhpbXVtIHZlcnRleCBsaW5rIGRpc3RhbmNlXHJcbiAgICAgICAgICAgICAgICBjb25zdCB2ZXJ0ZXhMaW5rRGlzdGFuY2VTcXIgPSB0aGlzLnNpbXBsaWZpY2F0aW9uT3B0aW9ucy52ZXJ0ZXhMaW5rRGlzdGFuY2UgKiB0aGlzLnNpbXBsaWZpY2F0aW9uT3B0aW9ucy52ZXJ0ZXhMaW5rRGlzdGFuY2U7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2ZXJ0ZXhMaW5rRGlzdGFuY2UgPSBNYXRoLnNxcnQodmVydGV4TGlua0Rpc3RhbmNlU3FyKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGhhc2hNYXhEaXN0YW5jZSA9IE1hdGgubWF4KCh2ZXJ0ZXhMaW5rRGlzdGFuY2UgLyBib3JkZXJBcmVhV2lkdGgpICogMjE0NzQ4MzY0NywgMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVGhlbiBmaW5kIGlkZW50aWNhbCBib3JkZXIgdmVydGljZXMgYW5kIGJpbmQgdGhlbSB0b2dldGhlciBhcyBvbmVcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYm9yZGVySW5kZXhDb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXlJbmRleCA9IGJvcmRlclZlcnRpY2VzW2ldLmluZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChteUluZGV4ID09IC0xKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXlQb2ludCA9IHRoaXMuX3ZlcnRpY2VzW215SW5kZXhdLnA7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgYm9yZGVySW5kZXhDb3VudDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG90aGVySW5kZXggPSBib3JkZXJWZXJ0aWNlc1tqXS5pbmRleDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG90aGVySW5kZXggPT0gLTEpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChib3JkZXJWZXJ0aWNlc1tqXS5oYXNoIC0gYm9yZGVyVmVydGljZXNbaV0uaGFzaCA+IGhhc2hNYXhEaXN0YW5jZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZXJlIGlzIG5vIHBvaW50IHRvIGNvbnRpbnVlIGJleW9uZCB0aGlzIHBvaW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG90aGVyUG9pbnQgPSB0aGlzLl92ZXJ0aWNlc1tvdGhlckluZGV4XS5wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzcXJYID0gKG15UG9pbnQueCAtIG90aGVyUG9pbnQueCkgKiAobXlQb2ludC54IC0gb3RoZXJQb2ludC54KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3FyWSA9IChteVBvaW50LnkgLSBvdGhlclBvaW50LnkpICogKG15UG9pbnQueSAtIG90aGVyUG9pbnQueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNxclogPSAobXlQb2ludC56IC0gb3RoZXJQb2ludC56KSAqIChteVBvaW50LnogLSBvdGhlclBvaW50LnopO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzcXJNYWduaXR1ZGUgPSBzcXJYICsgc3FyWSArIHNxclo7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3FyTWFnbml0dWRlIDw9IHZlcnRleExpbmtEaXN0YW5jZVNxcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyVmVydGljZXNbal0uaW5kZXggPSAtMTsgLy8gTk9URTogVGhpcyBtYWtlcyBzdXJlIHRoYXQgdGhlIFwib3RoZXJcIiB2ZXJ0ZXggaXMgbm90IHByb2Nlc3NlZCBhZ2FpblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmVydGljZXNbbXlJbmRleF0uYm9yZGVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl92ZXJ0aWNlc1tvdGhlckluZGV4XS5ib3JkZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFyZVVWc1RoZVNhbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl92ZXJ0VVYyRCFbbXlJbmRleF0uZXF1YWxzKHRoaXMuX3ZlcnRVVjJEIVtvdGhlckluZGV4XSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl92ZXJ0aWNlc1tteUluZGV4XS51dkZvbGRvdmVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl92ZXJ0aWNlc1tvdGhlckluZGV4XS51dkZvbGRvdmVyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmVydGljZXNbbXlJbmRleF0udXZTdGVhbSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmVydGljZXNbb3RoZXJJbmRleF0udXZTdGVhbSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3RoZXJUcmlhbmdsZUNvdW50ID0gdGhpcy5fdmVydGljZXNbb3RoZXJJbmRleF0udGNvdW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3RoZXJUcmlhbmdsZVN0YXJ0ID0gdGhpcy5fdmVydGljZXNbb3RoZXJJbmRleF0udHN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBvdGhlclRyaWFuZ2xlQ291bnQ7IGsrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHIgPSB0aGlzLl9yZWZzW290aGVyVHJpYW5nbGVTdGFydCArIGtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RyaWFuZ2xlc1tyLnRpZF0udltyLnR2ZXJ0ZXhdID0gbXlJbmRleDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlZmVyZW5jZXMgYWdhaW5cclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVJlZmVyZW5jZXMoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92ZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgLy8gbWF5IG5vdCBuZWVkIHRvIGRvIHRoaXMuXHJcbiAgICAgICAgICAgICAgICB0aGlzLl92ZXJ0aWNlc1tpXS5xID0gbmV3IFN5bWV0cmljTWF0cml4KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHAxcDAgPSBuZXcgVmVjMygpO1xyXG4gICAgICAgICAgICBjb25zdCBwMnAwID0gbmV3IFZlYzMoKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHA6IFZlYzNbXSA9IG5ldyBBcnJheSgzKTtcclxuICAgICAgICAgICAgY29uc3QgdG1wID0gbmV3IFN5bWV0cmljTWF0cml4KCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdHJpYW5nbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCAvKlRyaWFuZ2xlICYqLyB0ID0gdGhpcy5fdHJpYW5nbGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbiA9IG5ldyBWZWMzKCk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDM7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHBbal0gPSB0aGlzLl92ZXJ0aWNlc1t0LnZbal1dLnA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgVmVjMy5zdWJ0cmFjdChwMXAwLCBwWzFdLCBwWzBdKTtcclxuICAgICAgICAgICAgICAgIFZlYzMuc3VidHJhY3QocDJwMCwgcFsyXSwgcFswXSk7XHJcbiAgICAgICAgICAgICAgICBWZWMzLmNyb3NzKG4sIHAxcDAsIHAycDApO1xyXG4gICAgICAgICAgICAgICAgVmVjMy5ub3JtYWxpemUobiwgbik7XHJcbiAgICAgICAgICAgICAgICB0Lm4gPSBuO1xyXG4gICAgICAgICAgICAgICAgdG1wLm1ha2VQbGFuZShuLngsIG4ueSwgbi56LCAtbi5kb3QocFswXSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgMzsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmVydGljZXNbdC52W2pdXS5xLmFkZFNlbGYodG1wKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyB2ZXJ0aWNlc1t0LnZbal1dLnEgPVxyXG4gICAgICAgICAgICAgICAgLy8gdmVydGljZXNbdC52W2pdXS5xLmFkZChTeW1ldHJpY01hdHJpeChuLngsbi55LG4ueiwtbi5kb3QocFswXSkpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl90cmlhbmdsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIC8vIENhbGMgRWRnZSBFcnJvclxyXG4gICAgICAgICAgICAgICAgY29uc3QgLypUcmlhbmdsZSAmKi8gdCA9IHRoaXMuX3RyaWFuZ2xlc1tpXTtcclxuICAgICAgICAgICAgICAgIC8vIHZlYzNmIHA7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwID0gbmV3IFZlYzMoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDM7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHQuZXJyW2pdID0gdGhpcy5fY2FsY3VsYXRlRXJyb3IodC52W2pdLCB0LnZbKGogKyAxKSAlIDNdLCBwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0LmVyclszXSA9IE1hdGgubWluKHQuZXJyWzBdLCB0LmVyclsxXSwgdC5lcnJbMl0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEZpbmFsbHkgY29tcGFjdCBtZXNoIGJlZm9yZSBleGl0aW5nXHJcblxyXG4gICAgLy8gRXJyb3IgYmV0d2VlbiB2ZXJ0ZXggYW5kIFF1YWRyaWNcclxuXHJcbiAgICBwcml2YXRlIF92ZXJ0ZXhFcnJvcigvKlN5bWV0cmljTWF0cml4Ki8gcTogU3ltZXRyaWNNYXRyaXgsIC8qZG91YmxlKi8geDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcikge1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIHEubVswXSAqIHggKiB4ICtcclxuICAgICAgICAgICAgMiAqIHEubVsxXSAqIHggKiB5ICtcclxuICAgICAgICAgICAgMiAqIHEubVsyXSAqIHggKiB6ICtcclxuICAgICAgICAgICAgMiAqIHEubVszXSAqIHggK1xyXG4gICAgICAgICAgICBxLm1bNF0gKiB5ICogeSArXHJcbiAgICAgICAgICAgIDIgKiBxLm1bNV0gKiB5ICogeiArXHJcbiAgICAgICAgICAgIDIgKiBxLm1bNl0gKiB5ICtcclxuICAgICAgICAgICAgcS5tWzddICogeiAqIHogK1xyXG4gICAgICAgICAgICAyICogcS5tWzhdICogeiArXHJcbiAgICAgICAgICAgIHEubVs5XVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRXJyb3IgZm9yIG9uZSBlZGdlXHJcbiAgICAvLyBpZiBERUNJTUFURSBpcyBkZWZpbmVkIHZlcnRleCBwb3NpdGlvbnMgYXJlIE5PVCBpbnRlcnBvbGF0ZWRcclxuICAgIC8vIEx1ZWJrZSBTdXJ2ZXkgb2YgUG9seWdvbmFsIFNpbXBsaWZpY2F0aW9uIEFsZ29yaXRobXM6ICBcInZlcnRpY2VzIG9mIGEgbW9kZWwgc2ltcGxpZmllZCBieSB0aGUgZGVjaW1hdGlvbiBhbGdvcml0aG0gYXJlIGEgc3Vic2V0IG9mIHRoZSBvcmlnaW5hbCBtb2RlbOKAmXMgdmVydGljZXMuXCJcclxuICAgIC8vIGh0dHA6Ly93d3cuY3MudmlyZ2luaWEuZWR1L35sdWVia2UvcHVibGljYXRpb25zL3BkZi9jZythLjIwMDEucGRmXHJcblxyXG4gICAgcHJpdmF0ZSBfY2FsY3VsYXRlRXJyb3IoaWRfdjE6IG51bWJlciwgaWRfdjI6IG51bWJlciwgcF9yZXN1bHQ6IFZlYzMpIHtcclxuICAgICAgICAvLyBjb21wdXRlIGludGVycG9sYXRlZCB2ZXJ0ZXhcclxuICAgICAgICBjb25zdCB2ZXJ0ZXgxID0gdGhpcy5fdmVydGljZXNbaWRfdjFdO1xyXG4gICAgICAgIGNvbnN0IHZlcnRleDIgPSB0aGlzLl92ZXJ0aWNlc1tpZF92Ml07XHJcblxyXG4gICAgICAgIGNvbnN0IHEgPSB2ZXJ0ZXgxLnEuYWRkKHZlcnRleDIucSk7XHJcbiAgICAgICAgY29uc3QgYm9yZGVyID0gdmVydGV4MS5ib3JkZXIgJiYgdmVydGV4Mi5ib3JkZXI7XHJcbiAgICAgICAgbGV0IGVycm9yID0gMDtcclxuICAgICAgICBjb25zdCBkZXQgPSBxLmRldCgwLCAxLCAyLCAxLCA0LCA1LCAyLCA1LCA3KTtcclxuXHJcbiAgICAgICAgaWYgKGRldCAhPT0gMCAmJiAhYm9yZGVyKSB7XHJcbiAgICAgICAgICAgIC8vIHFfZGVsdGEgaXMgaW52ZXJ0aWJsZVxyXG4gICAgICAgICAgICBwX3Jlc3VsdC54ID0gKC0xIC8gZGV0KSAqIHEuZGV0KDEsIDIsIDMsIDQsIDUsIDYsIDUsIDcsIDgpOyAvLyB2eCA9IEE0MS9kZXQocV9kZWx0YSlcclxuICAgICAgICAgICAgcF9yZXN1bHQueSA9ICgxIC8gZGV0KSAqIHEuZGV0KDAsIDIsIDMsIDEsIDUsIDYsIDIsIDcsIDgpOyAvLyB2eSA9IEE0Mi9kZXQocV9kZWx0YSlcclxuICAgICAgICAgICAgcF9yZXN1bHQueiA9ICgtMSAvIGRldCkgKiBxLmRldCgwLCAxLCAzLCAxLCA0LCA2LCAyLCA1LCA4KTsgLy8gdnogPSBBNDMvZGV0KHFfZGVsdGEpXHJcblxyXG4gICAgICAgICAgICBsZXQgY3VydmF0dXJlRXJyb3IgPSAwO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zaW1wbGlmaWNhdGlvbk9wdGlvbnMucHJlc2VydmVTdXJmYWNlQ3VydmF0dXJlKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJ2YXR1cmVFcnJvciA9IHRoaXMuX2N1cnZhdHVyZUVycm9yKHZlcnRleDEsIHZlcnRleDIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBlcnJvciA9IHRoaXMuX3ZlcnRleEVycm9yKHEsIHBfcmVzdWx0LngsIHBfcmVzdWx0LnksIHBfcmVzdWx0LnopICsgY3VydmF0dXJlRXJyb3I7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gZGV0ID0gMCAtPiB0cnkgdG8gZmluZCBiZXN0IHJlc3VsdFxyXG4gICAgICAgICAgICBjb25zdCAvKnZlYzNmKi8gcDEgPSB2ZXJ0ZXgxLnA7XHJcbiAgICAgICAgICAgIGNvbnN0IC8qdmVjM2YqLyBwMiA9IHZlcnRleDIucDtcclxuICAgICAgICAgICAgY29uc3QgLyp2ZWMzZiovIHAzID0gbmV3IFZlYzMoKTtcclxuICAgICAgICAgICAgVmVjMy5hZGQocDMsIHAxLCBwMik7XHJcbiAgICAgICAgICAgIHAzLm11bHRpcGx5U2NhbGFyKDAuNSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yMSA9IHRoaXMuX3ZlcnRleEVycm9yKHEsIHAxLngsIHAxLnksIHAxLnopO1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvcjIgPSB0aGlzLl92ZXJ0ZXhFcnJvcihxLCBwMi54LCBwMi55LCBwMi56KTtcclxuICAgICAgICAgICAgY29uc3QgZXJyb3IzID0gdGhpcy5fdmVydGV4RXJyb3IocSwgcDMueCwgcDMueSwgcDMueik7XHJcbiAgICAgICAgICAgIGVycm9yID0gTWF0aC5taW4oZXJyb3IxLCBlcnJvcjIsIGVycm9yMyk7XHJcbiAgICAgICAgICAgIGlmIChlcnJvcjEgPT09IGVycm9yKSBWZWMzLmNvcHkocF9yZXN1bHQsIHAxKTtcclxuICAgICAgICAgICAgaWYgKGVycm9yMiA9PT0gZXJyb3IpIFZlYzMuY29weShwX3Jlc3VsdCwgcDIpO1xyXG4gICAgICAgICAgICBpZiAoZXJyb3IzID09PSBlcnJvcikgVmVjMy5jb3B5KHBfcmVzdWx0LCBwMyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZXJyb3I7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfdXBkYXRlUmVmZXJlbmNlcygpIHtcclxuICAgICAgICAvLyBJbml0IFJlZmVyZW5jZSBJRCBsaXN0XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92ZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLl92ZXJ0aWNlc1tpXS50c3RhcnQgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLl92ZXJ0aWNlc1tpXS50Y291bnQgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3RyaWFuZ2xlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAvKlRyaWFuZ2xlICYqL1xyXG4gICAgICAgICAgICBjb25zdCB0ID0gdGhpcy5fdHJpYW5nbGVzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDM7IGorKykgdGhpcy5fdmVydGljZXNbdC52W2pdXS50Y291bnQrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRzdGFydCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92ZXJ0aWNlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCAvKlZlcnRleCAmKi8gdiA9IHRoaXMuX3ZlcnRpY2VzW2ldO1xyXG4gICAgICAgICAgICB2LnRzdGFydCA9IHRzdGFydDtcclxuICAgICAgICAgICAgdHN0YXJ0ICs9IHYudGNvdW50O1xyXG4gICAgICAgICAgICB2LnRjb3VudCA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBXcml0ZSBSZWZlcmVuY2VzXHJcbiAgICAgICAgLy8gX3Jlc2l6ZShyZWZzLCB0cmlhbmdsZXMubGVuZ3RoICogMylcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygncHJlIHJlZicsIHRoaXMuX3JlZnMubGVuZ3RoLCB0aGlzLl90cmlhbmdsZXMubGVuZ3RoICogMyk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuX3JlZnMubGVuZ3RoOyBpIDwgdGhpcy5fdHJpYW5nbGVzLmxlbmd0aCAqIDM7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLl9yZWZzW2ldID0gbmV3IFJlZigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl90cmlhbmdsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgLypUcmlhbmdsZSAmKi9cclxuICAgICAgICAgICAgY29uc3QgdCA9IHRoaXMuX3RyaWFuZ2xlc1tpXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAzOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIC8qVmVydGV4ICYqL1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMuX3ZlcnRpY2VzW3QudltqXV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWZzW3YudHN0YXJ0ICsgdi50Y291bnRdLnRpZCA9IGk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZWZzW3YudHN0YXJ0ICsgdi50Y291bnRdLnR2ZXJ0ZXggPSBqO1xyXG4gICAgICAgICAgICAgICAgdi50Y291bnQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9jdXJ2YXR1cmVFcnJvcih2ZXJ0MDogVmVydGV4LCB2ZXJ0MTogVmVydGV4KSB7XHJcbiAgICAgICAgVmVjMy5zdWJ0cmFjdChfdGVtcFZlYzMsIHZlcnQwLnAsIHZlcnQxLnApO1xyXG4gICAgICAgIGNvbnN0IGRpZmZWZWN0b3IgPSBfdGVtcFZlYzMubGVuZ3RoKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRyaWFuZ2xlc1dpdGhWaU9yVmpPckJvdGggPSB0aGlzLl90cmlhbmdsZUhhc2hTZXQxO1xyXG4gICAgICAgIHRyaWFuZ2xlc1dpdGhWaU9yVmpPckJvdGguY2xlYXIoKTtcclxuICAgICAgICB0aGlzLl9nZXRUcmlhbmdsZXNDb250YWluaW5nVmVydGV4KHZlcnQwLCB0cmlhbmdsZXNXaXRoVmlPclZqT3JCb3RoKTtcclxuICAgICAgICB0aGlzLl9nZXRUcmlhbmdsZXNDb250YWluaW5nVmVydGV4KHZlcnQxLCB0cmlhbmdsZXNXaXRoVmlPclZqT3JCb3RoKTtcclxuXHJcbiAgICAgICAgY29uc3QgdHJpYW5nbGVzV2l0aFZpQW5kVmpCb3RoID0gdGhpcy5fdHJpYW5nbGVIYXNoU2V0MjtcclxuICAgICAgICB0cmlhbmdsZXNXaXRoVmlBbmRWakJvdGguY2xlYXIoKTtcclxuICAgICAgICB0aGlzLl9nZXRUcmlhbmdsZXNDb250YWluaW5nQm90aFZlcnRpY2VzKHZlcnQwLCB2ZXJ0MSwgdHJpYW5nbGVzV2l0aFZpQW5kVmpCb3RoKTtcclxuXHJcbiAgICAgICAgbGV0IG1heERvdE91dGVyID0gMDtcclxuICAgICAgICB0cmlhbmdsZXNXaXRoVmlPclZqT3JCb3RoLmZvckVhY2goKGluZGV4LCB0cmlhbmdsZVdpdGhWaU9yVmpPckJvdGgpID0+IHtcclxuICAgICAgICAgICAgbGV0IG1heERvdElubmVyID0gMDtcclxuICAgICAgICAgICAgY29uc3Qgbm9ybVZlY1RyaWFuZ2xlV2l0aFZpT3JWak9yQm90aDogVmVjMyA9IHRyaWFuZ2xlV2l0aFZpT3JWak9yQm90aC5uLmNsb25lKCk7XHJcbiAgICAgICAgICAgIHRyaWFuZ2xlc1dpdGhWaUFuZFZqQm90aC5mb3JFYWNoKChpbmRleCwgdHJpYW5nbGVXaXRoVmlBbmRWakJvdGgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5vcm1WZWNUcmlhbmdsZVdpdGhWaUFuZFZqQm90aDogVmVjMyA9IHRyaWFuZ2xlV2l0aFZpQW5kVmpCb3RoLm4uY2xvbmUoKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRvdCA9IFZlYzMuZG90KG5vcm1WZWNUcmlhbmdsZVdpdGhWaU9yVmpPckJvdGgsIG5vcm1WZWNUcmlhbmdsZVdpdGhWaUFuZFZqQm90aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGRvdCA+IG1heERvdElubmVyKSBtYXhEb3RJbm5lciA9IGRvdDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChtYXhEb3RJbm5lciA+IG1heERvdE91dGVyKSBtYXhEb3RPdXRlciA9IG1heERvdElubmVyO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZGlmZlZlY3RvciAqIG1heERvdE91dGVyO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2dldFRyaWFuZ2xlc0NvbnRhaW5pbmdWZXJ0ZXgodmVydDogVmVydGV4LCB0cmlzOiBNYXA8VHJpYW5nbGUsIGJvb2xlYW4+KSB7XHJcbiAgICAgICAgY29uc3QgdHJpYW5nbGVzQ291bnQgPSB2ZXJ0LnRjb3VudDtcclxuICAgICAgICBjb25zdCBzdGFydEluZGV4ID0gdmVydC50c3RhcnQ7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGEgPSBzdGFydEluZGV4OyBhIDwgc3RhcnRJbmRleCArIHRyaWFuZ2xlc0NvdW50OyBhKyspIHtcclxuICAgICAgICAgICAgdHJpcy5zZXQodGhpcy5fdHJpYW5nbGVzW3RoaXMuX3JlZnNbYV0udGlkXSwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBfZ2V0VHJpYW5nbGVzQ29udGFpbmluZ0JvdGhWZXJ0aWNlcyh2ZXJ0MDogVmVydGV4LCB2ZXJ0MTogVmVydGV4LCB0cmlzOiBNYXA8VHJpYW5nbGUsIGJvb2xlYW4+KSB7XHJcbiAgICAgICAgY29uc3QgdHJpYW5nbGVDb3VudCA9IHZlcnQwLnRjb3VudDtcclxuICAgICAgICBjb25zdCBzdGFydEluZGV4ID0gdmVydDAudHN0YXJ0O1xyXG5cclxuICAgICAgICBmb3IgKGxldCByZWZJbmRleCA9IHN0YXJ0SW5kZXg7IHJlZkluZGV4IDwgc3RhcnRJbmRleCArIHRyaWFuZ2xlQ291bnQ7IHJlZkluZGV4KyspIHtcclxuICAgICAgICAgICAgY29uc3QgdGlkID0gdGhpcy5fcmVmc1tyZWZJbmRleF0udGlkO1xyXG4gICAgICAgICAgICBjb25zdCB0cmk6IFRyaWFuZ2xlID0gdGhpcy5fdHJpYW5nbGVzW3RpZF07XHJcblxyXG4gICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICB0aGlzLl92ZXJ0aWNlc1t0cmkudlswXV0uaW5kZXggPT0gdmVydDEuaW5kZXggfHxcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZlcnRpY2VzW3RyaS52WzFdXS5pbmRleCA9PSB2ZXJ0MS5pbmRleCB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmVydGljZXNbdHJpLnZbMl1dLmluZGV4ID09IHZlcnQxLmluZGV4XHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgdHJpcy5zZXQodHJpLCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2ltcGxpZnlNZXNoKHRhcmdldF9jb3VudDogbnVtYmVyLCBhZ3Jlc3NpdmVuZXNzID0gNykge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRhcmdldF9jb3VudCA9IE1hdGgucm91bmQodGFyZ2V0X2NvdW50KTtcclxuICAgICAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSBKU09OLnBhcnNlKHRoaXMuX2dlb21ldHJpY0luZm8pO1xyXG4gICAgICAgICAgICB0aGlzLmluaXQoZ2VvbWV0cnkudmVydGljZXMsIGdlb21ldHJ5LmZhY2VzLCBnZW9tZXRyeSk7XHJcblxyXG4gICAgICAgICAgICBjb25zb2xlLnRpbWUoJ3NpbXBsaWZ5Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NpbXBsaWZ5TWVzaCh0YXJnZXRfY291bnQsIGFncmVzc2l2ZW5lc3MpO1xyXG4gICAgICAgICAgICBjb25zb2xlLnRpbWVFbmQoJ3NpbXBsaWZ5Jyk7XHJcblxyXG4gICAgICAgICAgICAvL1x0Y29uc29sZS5sb2coJ29sZCB2ZXJ0aWNlcyAnICsgZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoLCAnb2xkIGZhY2VzICcgKyBnZW9tZXRyeS5mYWNlcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbmV3IHZlcnRpY2VzICcgKyB0aGlzLl92ZXJ0aWNlcy5sZW5ndGgsICdvbGQgZmFjZXMgJyArIHRoaXMuX3RyaWFuZ2xlcy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETyBjb252ZXJ0IHRvIGJ1ZmZlciBnZW9tZXRyeS5cclxuICAgICAgICAgICAgY29uc3QgbmV3R2VvOiB7IHBvc2l0aW9uczsgaW5kaWNlczsgbm9ybWFscz86IG51bWJlcltdOyB1dnM/OyB0YW5nZW50cz87IGNvbG9ycz87IGF0dHJzIH0gPSB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbnM6IFtdLFxyXG4gICAgICAgICAgICAgICAgaW5kaWNlczogW10sXHJcbiAgICAgICAgICAgICAgICBhdHRyczoge30sXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBjb25zdCBuZXdMZW5ndGggPSB0aGlzLl92ZXJ0aWNlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdmVydGljZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB0aGlzLl92ZXJ0aWNlc1tpXTtcclxuICAgICAgICAgICAgICAgIG5ld0dlby5wb3NpdGlvbnMucHVzaCh2LnAueCk7XHJcbiAgICAgICAgICAgICAgICBuZXdHZW8ucG9zaXRpb25zLnB1c2godi5wLnkpO1xyXG4gICAgICAgICAgICAgICAgbmV3R2VvLnBvc2l0aW9ucy5wdXNoKHYucC56KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX3ZlcnRVVjJEKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNpemUodGhpcy5fdmVydFVWMkQsIG5ld0xlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBuZXdHZW8udXZzID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3ZlcnRVVjJELmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMuX3ZlcnRVVjJEW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0dlby51dnMucHVzaCh2LngpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0dlby51dnMucHVzaCh2LnkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5fdmVydE5vcm1hbHMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZSh0aGlzLl92ZXJ0Tm9ybWFscywgbmV3TGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIG5ld0dlby5ub3JtYWxzID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3ZlcnROb3JtYWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMuX3ZlcnROb3JtYWxzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0dlby5ub3JtYWxzLnB1c2godi54KTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdHZW8ubm9ybWFscy5wdXNoKHYueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3R2VvLm5vcm1hbHMucHVzaCh2LnopO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5fdmVydFRhbmdlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNpemUodGhpcy5fdmVydFRhbmdlbnRzLCBuZXdMZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgbmV3R2VvLnRhbmdlbnRzID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3ZlcnRUYW5nZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB0aGlzLl92ZXJ0VGFuZ2VudHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3R2VvLnRhbmdlbnRzLnB1c2godi54KTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdHZW8udGFuZ2VudHMucHVzaCh2LnkpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld0dlby50YW5nZW50cy5wdXNoKHYueik7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3R2VvLnRhbmdlbnRzLnB1c2godi53KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX3ZlcnRDb2xvcnMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Jlc2l6ZSh0aGlzLl92ZXJ0Q29sb3JzLCBuZXdMZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgbmV3R2VvLmNvbG9ycyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92ZXJ0Q29sb3JzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdiA9IHRoaXMuX3ZlcnRDb2xvcnNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3R2VvLmNvbG9ycy5wdXNoKHYucik7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3R2VvLmNvbG9ycy5wdXNoKHYuZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3R2VvLmNvbG9ycy5wdXNoKHYuYik7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3R2VvLmNvbG9ycy5wdXNoKHYuYSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl92ZXJ0Sm9pbnRzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNpemUodGhpcy5fdmVydEpvaW50cywgbmV3TGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxpc3Q6IG51bWJlcltdID0gKG5ld0dlby5hdHRyc1snam9pbnRzJ10gPSBbXSk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3ZlcnRKb2ludHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB2ID0gdGhpcy5fdmVydEpvaW50c1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2godi54KTtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2godi55KTtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2godi56KTtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2godi53KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX3ZlcnRXZWlnaHRzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNpemUodGhpcy5fdmVydFdlaWdodHMsIG5ld0xlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsaXN0OiBudW1iZXJbXSA9IChuZXdHZW8uYXR0cnNbJ3dlaWdodHMnXSA9IFtdKTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdmVydFdlaWdodHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB2ID0gdGhpcy5fdmVydFdlaWdodHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKHYueCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKHYueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKHYueik7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKHYudyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdHJpYW5nbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0cmkgPSB0aGlzLl90cmlhbmdsZXNbaV07XHJcbiAgICAgICAgICAgICAgICBuZXdHZW8uaW5kaWNlcy5wdXNoKHRyaS52WzBdKTtcclxuICAgICAgICAgICAgICAgIG5ld0dlby5pbmRpY2VzLnB1c2godHJpLnZbMV0pO1xyXG4gICAgICAgICAgICAgICAgbmV3R2VvLmluZGljZXMucHVzaCh0cmkudlsyXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG5ld0dlbztcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5p6E5bu6Z2VvbWV0cnnkv6Hmga9cclxuICAgICAqIEBwYXJhbSBnZW9tZXRyeVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYnVpbGRHZW9tZXRyaWMoZ2VvbWV0cnk6IHtcclxuICAgICAgICB2ZXJ0aWNlcz86IFZlYzNbXTtcclxuICAgICAgICBmYWNlcz86IGFueVtdO1xyXG4gICAgICAgIHBvc2l0aW9uczogc3RyaW5nIHwgYW55W107XHJcbiAgICAgICAgbm9ybWFscztcclxuICAgICAgICB1dnM7XHJcbiAgICAgICAgdGFuZ2VudHM7XHJcbiAgICAgICAgaW5kaWNlcz86IEFycmF5TGlrZTxudW1iZXI+O1xyXG4gICAgICAgIHdlaWdodHM/O1xyXG4gICAgICAgIGpvaW50cz87XHJcbiAgICAgICAgY29sb3JzPztcclxuICAgIH0pIHtcclxuICAgICAgICAvL0B0cy1pZ25vcmVcclxuICAgICAgICAvL1x0bWVyZ2VWZXJ0aWNlcyhnZW9tZXRyeSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGZhY2VzOiB7IGE6IG51bWJlcjsgYjogbnVtYmVyOyBjOiBudW1iZXIgfVtdID0gW107XHJcbiAgICAgICAgaWYgKGdlb21ldHJ5LmluZGljZXMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBnZW9tZXRyeS5pbmRpY2VzLmxlbmd0aDsgaSArPSAzKSB7XHJcbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBhOiBnZW9tZXRyeS5pbmRpY2VzW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgIGI6IGdlb21ldHJ5LmluZGljZXNbaSArIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgIGM6IGdlb21ldHJ5LmluZGljZXNbaSArIDJdLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBuVmVydGljZXMgPSBnZW9tZXRyeS5wb3NpdGlvbnMubGVuZ3RoIC8gMztcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuVmVydGljZXM7IGkgKz0gMykge1xyXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgYTogMyAqIGkgKyAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGI6IDMgKiBpICsgMSxcclxuICAgICAgICAgICAgICAgICAgICBjOiAzICogaSArIDIsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBnZW9tZXRyeS5mYWNlcyA9IGZhY2VzO1xyXG5cclxuICAgICAgICBjb25zdCB2ZXJ0aWNlcyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ2VvbWV0cnkucG9zaXRpb25zLmxlbmd0aDsgaSArPSAzKSB7XHJcbiAgICAgICAgICAgIHZlcnRpY2VzLnB1c2gobmV3IFZlYzMoZ2VvbWV0cnkucG9zaXRpb25zW2ldLCBnZW9tZXRyeS5wb3NpdGlvbnNbaSArIDFdLCBnZW9tZXRyeS5wb3NpdGlvbnNbaSArIDJdKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzID0gdmVydGljZXM7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGdlb21ldHJ5KSB7XHJcbiAgICAgICAgICAgIGlmIChnZW9tZXRyeVtrZXldKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIShnZW9tZXRyeVtrZXldIGluc3RhbmNlb2YgQXJyYXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnlba2V5XSA9IEFycmF5LmZyb20oZ2VvbWV0cnlba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgZ2VvbWV0cnlba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fZ2VvbWV0cmljSW5mbyA9IEpTT04uc3RyaW5naWZ5KGdlb21ldHJ5KTtcclxuICAgICAgICAvLyB0aGlzLmluaXQoZ2VvbWV0cnkudmVydGljZXMsIGdlb21ldHJ5LmZhY2VzLCBnZW9tZXRyeSk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ29sZCB2ZXJ0aWNlcyAnICsgZ2VvbWV0cnkudmVydGljZXMubGVuZ3RoLCAnb2xkIGZhY2VzICcgKyBnZW9tZXRyeS5mYWNlcy5sZW5ndGgpO1xyXG5cclxuICAgICAgICAvLyBzaW1wbGlmeSFcclxuICAgICAgICAvLyBzaW1wbGlmeV9tZXNoKGdlb21ldHJ5LmZhY2VzLmxlbmd0aCAqIDAuNSB8IDAsIDcpO1xyXG4gICAgICAgIC8vIHNpbXBsaWZ5X21lc2goZ2VvbWV0cnkuZmFjZXMubGVuZ3RoIC0gMiwgNCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDorqHnrpflkIjlubbnmoR1duS/oeaBr1xyXG4gICAgICogQHBhcmFtIHBvaW50XHJcbiAgICAgKiBAcGFyYW0gYVxyXG4gICAgICogQHBhcmFtIGJcclxuICAgICAqIEBwYXJhbSBjXHJcbiAgICAgKiBAcGFyYW0gcmVzdWx0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjYWxjdWxhdGVCYXJ5Y2VudHJpY0Nvb3Jkcyhwb2ludDogVmVjMywgYTogVmVjMywgYjogVmVjMywgYzogVmVjMywgcmVzdWx0OiBWZWMzKSB7XHJcbiAgICAgICAgY29uc3QgdjAgPSBuZXcgVmVjMygpO1xyXG4gICAgICAgIGNvbnN0IHYxID0gbmV3IFZlYzMoKTtcclxuICAgICAgICBjb25zdCB2MiA9IG5ldyBWZWMzKCk7XHJcbiAgICAgICAgVmVjMy5zdWJ0cmFjdCh2MCwgYiwgYSk7XHJcbiAgICAgICAgVmVjMy5zdWJ0cmFjdCh2MSwgYywgYSk7XHJcbiAgICAgICAgVmVjMy5zdWJ0cmFjdCh2MiwgcG9pbnQsIGEpO1xyXG4gICAgICAgIGNvbnN0IGQwMCA9IFZlYzMuZG90KHYwLCB2MCk7XHJcbiAgICAgICAgY29uc3QgZDAxID0gVmVjMy5kb3QodjAsIHYxKTtcclxuICAgICAgICBjb25zdCBkMTEgPSBWZWMzLmRvdCh2MSwgdjEpO1xyXG4gICAgICAgIGNvbnN0IGQyMCA9IFZlYzMuZG90KHYyLCB2MCk7XHJcbiAgICAgICAgY29uc3QgZDIxID0gVmVjMy5kb3QodjIsIHYxKTtcclxuICAgICAgICBsZXQgZGVub20gPSBkMDAgKiBkMTEgLSBkMDEgKiBkMDE7XHJcblxyXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgZGVub21pbmF0b3IgaXMgbm90IHRvbyBzbWFsbCB0byBjYXVzZSBtYXRoIHByb2JsZW1zXHJcbiAgICAgICAgaWYgKE1hdGguYWJzKGRlbm9tKSA8IERlbm9tRXBpbHNvbikge1xyXG4gICAgICAgICAgICBkZW5vbSA9IERlbm9tRXBpbHNvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHYgPSAoZDExICogZDIwIC0gZDAxICogZDIxKSAvIGRlbm9tO1xyXG4gICAgICAgIGNvbnN0IHcgPSAoZDAwICogZDIxIC0gZDAxICogZDIwKSAvIGRlbm9tO1xyXG4gICAgICAgIGNvbnN0IHUgPSAxLjAgLSB2IC0gdztcclxuICAgICAgICByZXN1bHQuc2V0KHUsIHYsIHcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2ludGVycG9sYXRlVmVydGV4QXR0cmlidXRlcyhkc3Q6IG51bWJlciwgaTA6IG51bWJlciwgaTE6IG51bWJlciwgaTI6IG51bWJlciwgYmFyeWNlbnRyaWNDb29yZDogVmVjMykge1xyXG4gICAgICAgIGlmICh0aGlzLl92ZXJ0Tm9ybWFscykge1xyXG4gICAgICAgICAgICBfdGVtcFZlYzMuc2V0KDAsIDAsIDApO1xyXG4gICAgICAgICAgICBWZWMzLnNjYWxlQW5kQWRkKF90ZW1wVmVjMywgX3RlbXBWZWMzLCB0aGlzLl92ZXJ0Tm9ybWFsc1tpMF0sIGJhcnljZW50cmljQ29vcmQueCk7XHJcbiAgICAgICAgICAgIFZlYzMuc2NhbGVBbmRBZGQoX3RlbXBWZWMzLCBfdGVtcFZlYzMsIHRoaXMuX3ZlcnROb3JtYWxzW2kxXSwgYmFyeWNlbnRyaWNDb29yZC55KTtcclxuICAgICAgICAgICAgVmVjMy5zY2FsZUFuZEFkZChfdGVtcFZlYzMsIF90ZW1wVmVjMywgdGhpcy5fdmVydE5vcm1hbHNbaTJdLCBiYXJ5Y2VudHJpY0Nvb3JkLnopO1xyXG4gICAgICAgICAgICBWZWMzLm5vcm1hbGl6ZShfdGVtcFZlYzMsIF90ZW1wVmVjMyk7XHJcbiAgICAgICAgICAgIFZlYzMuY29weSh0aGlzLl92ZXJ0Tm9ybWFsc1tkc3RdLCBfdGVtcFZlYzMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRVVjJEKSB7XHJcbiAgICAgICAgICAgIF90ZW1wVmVjMi5zZXQoMCwgMCk7XHJcbiAgICAgICAgICAgIFZlYzIuc2NhbGVBbmRBZGQoX3RlbXBWZWMyLCBfdGVtcFZlYzIsIHRoaXMuX3ZlcnRVVjJEW2kwXSwgYmFyeWNlbnRyaWNDb29yZC54KTtcclxuICAgICAgICAgICAgVmVjMi5zY2FsZUFuZEFkZChfdGVtcFZlYzIsIF90ZW1wVmVjMiwgdGhpcy5fdmVydFVWMkRbaTFdLCBiYXJ5Y2VudHJpY0Nvb3JkLnkpO1xyXG4gICAgICAgICAgICBWZWMyLnNjYWxlQW5kQWRkKF90ZW1wVmVjMiwgX3RlbXBWZWMyLCB0aGlzLl92ZXJ0VVYyRFtpMl0sIGJhcnljZW50cmljQ29vcmQueik7XHJcbiAgICAgICAgICAgIFZlYzIuY29weSh0aGlzLl92ZXJ0VVYyRFtkc3RdLCBfdGVtcFZlYzIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRUYW5nZW50cykge1xyXG4gICAgICAgICAgICBfdGVtcFZlYzQuc2V0KDAsIDAsIDAsIDApO1xyXG4gICAgICAgICAgICBWZWM0LnNjYWxlQW5kQWRkKF90ZW1wVmVjNCwgX3RlbXBWZWM0LCB0aGlzLl92ZXJ0VGFuZ2VudHNbaTBdLCBiYXJ5Y2VudHJpY0Nvb3JkLngpO1xyXG4gICAgICAgICAgICBWZWM0LnNjYWxlQW5kQWRkKF90ZW1wVmVjNCwgX3RlbXBWZWM0LCB0aGlzLl92ZXJ0VGFuZ2VudHNbaTFdLCBiYXJ5Y2VudHJpY0Nvb3JkLnkpO1xyXG4gICAgICAgICAgICBWZWM0LnNjYWxlQW5kQWRkKF90ZW1wVmVjNCwgX3RlbXBWZWM0LCB0aGlzLl92ZXJ0VGFuZ2VudHNbaTJdLCBiYXJ5Y2VudHJpY0Nvb3JkLnopO1xyXG4gICAgICAgICAgICB0aGlzLl9ub3JtYWxpemVUYW5nZW50KHRoaXMuX3ZlcnRUYW5nZW50c1tkc3RdLCBfdGVtcFZlYzQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRDb2xvcnMpIHtcclxuICAgICAgICAgICAgX3RlbXBDb2xvci5zZXQoMCwgMCwgMCwgMCk7XHJcbiAgICAgICAgICAgIGNvbG9yU2NhbGVBbmRBZGQoX3RlbXBDb2xvciwgX3RlbXBDb2xvciwgdGhpcy5fdmVydENvbG9yc1tpMF0sIGJhcnljZW50cmljQ29vcmQueCk7XHJcbiAgICAgICAgICAgIGNvbG9yU2NhbGVBbmRBZGQoX3RlbXBDb2xvciwgX3RlbXBDb2xvciwgdGhpcy5fdmVydENvbG9yc1tpMV0sIGJhcnljZW50cmljQ29vcmQueSk7XHJcbiAgICAgICAgICAgIGNvbG9yU2NhbGVBbmRBZGQoX3RlbXBDb2xvciwgX3RlbXBDb2xvciwgdGhpcy5fdmVydENvbG9yc1tpMl0sIGJhcnljZW50cmljQ29vcmQueik7XHJcbiAgICAgICAgICAgIHRoaXMuX3ZlcnRDb2xvcnNbZHN0XS5zZXQoX3RlbXBDb2xvci5yLCBfdGVtcENvbG9yLmcsIF90ZW1wQ29sb3IuYiwgX3RlbXBDb2xvci5hKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfbm9ybWFsaXplVGFuZ2VudChvdXQ6IFZlYzQsIHRhbmdlbnQ6IFZlYzQpIHtcclxuICAgICAgICBjb25zdCB0YW5nZW50VmVjID0gbmV3IFZlYzModGFuZ2VudC54LCB0YW5nZW50LnksIHRhbmdlbnQueik7XHJcbiAgICAgICAgdGFuZ2VudFZlYy5ub3JtYWxpemUoKTtcclxuICAgICAgICBvdXQuc2V0KHRhbmdlbnRWZWMueCwgdGFuZ2VudFZlYy55LCB0YW5nZW50VmVjLnosIHRhbmdlbnQudyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGVuZFVpbnQ4QXJyYXkoYTogVWludDhBcnJheSwgYjogVWludDhBcnJheSkge1xyXG4gICAgY29uc3QgYyA9IG5ldyBVaW50OEFycmF5KGEubGVuZ3RoICsgYi5sZW5ndGgpO1xyXG4gICAgYy5zZXQoYSwgMCk7XHJcbiAgICBjLnNldChiLCBhLmxlbmd0aCk7XHJcbiAgICByZXR1cm4gYztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRTaW1wbGlmeU9wdGlvbnMoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRhcmdldFJhdGlvOiAxLFxyXG4gICAgICAgIGVuYWJsZVNtYXJ0TGluazogdHJ1ZSxcclxuICAgICAgICBhZ3Jlc3NpdmVuZXNzOiA3LFxyXG4gICAgICAgIG1heEl0ZXJhdGlvbkNvdW50OiAxMDAsXHJcbiAgICB9O1xyXG59XHJcblxyXG4vL3NpbXBsaWZ5IHRoZSBtZXNoIHJldHVybiBhIG5ldyBtZXNo77yMIG9ubHkgc3VwcG9ydCBpbmRleGVkIHRyaWFuZ2xlIG1lc2hcclxuZXhwb3J0IGZ1bmN0aW9uIHNpbXBsaWZ5TWVzaChtZXNoOiBNZXNoLCBvcHRpb25zPzogU2ltcGxpZnlPcHRpb25zKSB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1lc2guc3RydWN0LnByaW1pdGl2ZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBwcmltaXRpdmUgPSBtZXNoLnN0cnVjdC5wcmltaXRpdmVzW2ldO1xyXG4gICAgICAgIGlmIChwcmltaXRpdmUucHJpbWl0aXZlTW9kZSAhPT0gZ2Z4LlByaW1pdGl2ZU1vZGUuVFJJQU5HTEVfTElTVCB8fCBwcmltaXRpdmUuaW5kZXhWaWV3ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgLy9UT0RPOiBzdXBwb3J0IG90aGVyIHByaW1pdGl2ZSBtb2RlXHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignU2ltcGxpZnlNZXNoIGN1cnJlbnQgb25seSBzdXBwb3J0IGluZGV4ZWQgdHJpYW5nbGUgbWVzaCwgb3ByZWF0aW9uIGlzIHNraXBwZWQnKTtcclxuICAgICAgICAgICAgcmV0dXJuIG1lc2g7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSBnZXREZWZhdWx0U2ltcGxpZnlPcHRpb25zKCk7XHJcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyB8fCB7fSk7XHJcbiAgICBsZXQgYnl0ZU9mZnNldCA9IDAsXHJcbiAgICAgICAgaiA9IDA7XHJcbiAgICBjb25zdCB2ZXJ0ZXhCdW5kbGVzID0gbmV3IEFycmF5PE1lc2guSVZlcnRleEJ1bmRsZT4oKTtcclxuICAgIGNvbnN0IHByaW1pdGl2ZXMgPSBuZXcgQXJyYXk8TWVzaC5JU3ViTWVzaD4oKTtcclxuICAgIGxldCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoMCk7IC8vaW5pdGxpemUgb3V0IG1lc2ggZGF0YSB3aXRoIGVtcHR5IGRhdGFcclxuICAgIC8vc2ltcGxpZnkgZWFjaCBzdWJtZXNoIG9mIHRoZSBtZXNoXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1lc2guc3RydWN0LnZlcnRleEJ1bmRsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCBpbmRpY2VzID0gbWVzaC5yZWFkSW5kaWNlcyhpKTtcclxuICAgICAgICBjb25zdCB2ZXJ0ZXhDb3VudCA9IG1lc2guc3RydWN0LnZlcnRleEJ1bmRsZXNbaV0udmlldy5jb3VudDtcclxuICAgICAgICBjb25zdCB0cmlhbmdsZUNvdW50ID0gaW5kaWNlcyA/IGluZGljZXMubGVuZ3RoIC8gMyA6IHZlcnRleENvdW50IC8gMztcclxuICAgICAgICBpZiAodHJpYW5nbGVDb3VudCA+IDApIHtcclxuICAgICAgICAgICAgY29uc3QgdXZzID0gbWVzaC5yZWFkQXR0cmlidXRlKGksIGdmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfVEVYX0NPT1JEKTtcclxuICAgICAgICAgICAgY29uc3QgdGFuZ2VudHMgPSBtZXNoLnJlYWRBdHRyaWJ1dGUoaSwgZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9UQU5HRU5UKTtcclxuICAgICAgICAgICAgY29uc3Qgbm9ybWFscyA9IG1lc2gucmVhZEF0dHJpYnV0ZShpLCBnZnguQXR0cmlidXRlTmFtZS5BVFRSX05PUk1BTCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHdlaWdodHMgPSBtZXNoLnJlYWRBdHRyaWJ1dGUoaSwgZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9XRUlHSFRTKTtcclxuICAgICAgICAgICAgY29uc3Qgam9pbnRzID0gbWVzaC5yZWFkQXR0cmlidXRlKGksIGdmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfSk9JTlRTKTtcclxuICAgICAgICAgICAgY29uc3QgY29sb3JzID0gbWVzaC5yZWFkQXR0cmlidXRlKGksIGdmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfQ09MT1IpO1xyXG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBtZXNoLnJlYWRBdHRyaWJ1dGUoaSwgZ2Z4LkF0dHJpYnV0ZU5hbWUuQVRUUl9QT1NJVElPTik7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBzaW1wbGlmeSA9IG5ldyBNZXNoU2ltcGxpZnkoKTtcclxuICAgICAgICAgICAgc2ltcGxpZnkuYnVpbGRHZW9tZXRyaWMoeyBwb3NpdGlvbnMsIG5vcm1hbHMsIHV2cywgaW5kaWNlczogaW5kaWNlcyA/PyB1bmRlZmluZWQsIHRhbmdlbnRzLCB3ZWlnaHRzLCBqb2ludHMsIGNvbG9ycyB9KTtcclxuICAgICAgICAgICAgc2ltcGxpZnkuc2ltcGxpZmljYXRpb25PcHRpb25zLmFncmVzc2l2ZW5lc3MgPSBvcHRpb25zLmFncmVzc2l2ZW5lc3M7XHJcbiAgICAgICAgICAgIHNpbXBsaWZ5LnNpbXBsaWZpY2F0aW9uT3B0aW9ucy5lbmFibGVTbWFydExpbmsgPSBvcHRpb25zLmVuYWJsZVNtYXJ0TGluaztcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gc2ltcGxpZnkuc2ltcGxpZnlNZXNoKG9wdGlvbnMudGFyZ2V0UmF0aW8gKiB0cmlhbmdsZUNvdW50KTtcclxuICAgICAgICAgICAgY29uc3QgZ0luZm8gPSB7IC4uLnJlc3VsdCwgY3VzdG9tQXR0cmlidXRlczogW10sIHByaW1pdGl2ZU1vZGU6IGdmeC5QcmltaXRpdmVNb2RlLlRSSUFOR0xFX0xJU1QgfTtcclxuICAgICAgICAgICAgaWYgKGdJbmZvLmF0dHJzKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRycyA9IGdJbmZvLmF0dHJzO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGdJbmZvLmF0dHJzO1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09ICdqb2ludHMnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyOiBuZXcgZ2Z4LkF0dHJpYnV0ZShnZnguQXR0cmlidXRlTmFtZS5BVFRSX0pPSU5UUywgZ2Z4LkZvcm1hdC5SR0JBMTZVSSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IGF0dHJzW2tleV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdJbmZvLmN1c3RvbUF0dHJpYnV0ZXMucHVzaChpbmZvKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PSAnd2VpZ2h0cycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHI6IG5ldyBnZnguQXR0cmlidXRlKGdmeC5BdHRyaWJ1dGVOYW1lLkFUVFJfV0VJR0hUUywgZ2Z4LkZvcm1hdC5SR0JBMzJGKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlczogYXR0cnNba2V5XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ0luZm8uY3VzdG9tQXR0cmlidXRlcy5wdXNoKGluZm8pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBzdWJNZXNoID0gbmV3IE1lc2goKTtcclxuICAgICAgICAgICAgdXRpbHMuY3JlYXRlTWVzaChnSW5mbywgc3ViTWVzaCwgeyBjYWxjdWxhdGVCb3VuZHM6IHRydWUgfSk7XHJcbiAgICAgICAgICAgIC8vIGFwcGVuZCBzdWJtZXNoIGRhdGEgdG8gb3V0IG1lc2ggZGF0YVxyXG4gICAgICAgICAgICBhc3NlcnQoc3ViTWVzaC5zdHJ1Y3QudmVydGV4QnVuZGxlcy5sZW5ndGggPT0gMSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHZlcnRleEJ1bmRsZSA9IHN1Yk1lc2guc3RydWN0LnZlcnRleEJ1bmRsZXNbMF07XHJcbiAgICAgICAgICAgIGRhdGEgPSBhcHBlbmRVaW50OEFycmF5KFxyXG4gICAgICAgICAgICAgICAgZGF0YSxcclxuICAgICAgICAgICAgICAgIHN1Yk1lc2guZGF0YS5zbGljZSh2ZXJ0ZXhCdW5kbGUudmlldy5vZmZzZXQsIHZlcnRleEJ1bmRsZS52aWV3Lm9mZnNldCArIHZlcnRleEJ1bmRsZS52aWV3Lmxlbmd0aCksXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHZlcnRleEJ1bmRsZS52aWV3Lm9mZnNldCA9IGJ5dGVPZmZzZXQ7XHJcbiAgICAgICAgICAgIHZlcnRleEJ1bmRsZXMucHVzaCh2ZXJ0ZXhCdW5kbGUpO1xyXG4gICAgICAgICAgICBieXRlT2Zmc2V0ICs9IHZlcnRleEJ1bmRsZS52aWV3Lmxlbmd0aDtcclxuICAgICAgICAgICAgbGV0IHByaW1pdGl2ZTogTWVzaC5JU3ViTWVzaDtcclxuICAgICAgICAgICAgaWYgKHN1Yk1lc2guc3RydWN0LnByaW1pdGl2ZXMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgYXNzZXJ0KHN1Yk1lc2guc3RydWN0LnByaW1pdGl2ZXMubGVuZ3RoID09IDEpO1xyXG4gICAgICAgICAgICAgICAgcHJpbWl0aXZlID0gc3ViTWVzaC5zdHJ1Y3QucHJpbWl0aXZlc1swXTtcclxuICAgICAgICAgICAgICAgIGFzc2VydChwcmltaXRpdmUuaW5kZXhWaWV3KTtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBhcHBlbmRVaW50OEFycmF5KFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEsXHJcbiAgICAgICAgICAgICAgICAgICAgc3ViTWVzaC5kYXRhLnNsaWNlKHByaW1pdGl2ZS5pbmRleFZpZXcub2Zmc2V0LCBwcmltaXRpdmUuaW5kZXhWaWV3Lm9mZnNldCArIHByaW1pdGl2ZS5pbmRleFZpZXcubGVuZ3RoKSxcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICBwcmltaXRpdmUuaW5kZXhWaWV3Lm9mZnNldCA9IGJ5dGVPZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBwcmltaXRpdmUuam9pbnRNYXBJbmRleCA9IHN1Yk1lc2guc3RydWN0LnByaW1pdGl2ZXNbMF0uam9pbnRNYXBJbmRleDtcclxuICAgICAgICAgICAgICAgIHByaW1pdGl2ZXMucHVzaChwcmltaXRpdmUpO1xyXG4gICAgICAgICAgICAgICAgYnl0ZU9mZnNldCArPSBwcmltaXRpdmUuaW5kZXhWaWV3Lmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHByaW1pdGl2ZXNbal0udmVydGV4QnVuZGVsSW5kaWNlcyA9IFtqXTtcclxuICAgICAgICAgICAgICAgIGogKz0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnN0IG1lc2hDcmVhdGVJbmZvOiBNZXNoLklDcmVhdGVJbmZvID0ge1xyXG4gICAgICAgIHN0cnVjdDoge1xyXG4gICAgICAgICAgICB2ZXJ0ZXhCdW5kbGVzOiB2ZXJ0ZXhCdW5kbGVzLFxyXG4gICAgICAgICAgICBwcmltaXRpdmVzOiBwcmltaXRpdmVzLFxyXG4gICAgICAgICAgICBtaW5Qb3NpdGlvbjogbWVzaC5zdHJ1Y3QubWluUG9zaXRpb24sXHJcbiAgICAgICAgICAgIG1heFBvc2l0aW9uOiBtZXNoLnN0cnVjdC5tYXhQb3NpdGlvbixcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICB9O1xyXG4gICAgY29uc3Qgb3V0ID0gbmV3IE1lc2goKTtcclxuICAgIG91dC5yZXNldChtZXNoQ3JlYXRlSW5mbyk7XHJcbiAgICBvdXQuaGFzaDtcclxuICAgIHJldHVybiBvdXQ7XHJcbn1cclxuIl19