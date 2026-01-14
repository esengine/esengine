"use strict";
// Re:
// https://github.com/yi/node-max-rects-bin-pack/blob/master/src/maxrects.coffee
// https://github.com/juj/RectangleBinPack/blob/master/MaxRectsBinPack.cpp
Object.defineProperty(exports, "__esModule", { value: true });
const BestShortSideFit = 0; ///< -BSSF: Positions the Rectangle against the short side of a free Rectangle into which it fits the best.
const BestLongSideFit = 1; ///< -BLSF: Positions the Rectangle against the long side of a free Rectangle into which it fits the best.
const BestAreaFit = 2; ///< -BAF: Positions the Rectangle into the smallest free Rectangle into which it fits.
const BottomLeftRule = 3; ///< -BL: Does the Tetris placement.
const ContactPointRule = 4; ///< -CP: Choosest the placement where the Rectangle touches other Rectangles as much as possible.
const LeftoverArea = 5;
/**
 * Rect
 */
class Rect {
    x;
    y;
    width;
    height;
    rotated;
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;
    }
    clone() {
        return new Rect(this.x, this.y, this.width, this.height);
    }
    static isContainedIn(a, b) {
        return a.x >= b.x && a.y >= b.y &&
            a.x + a.width <= b.x + b.width &&
            a.y + a.height <= b.y + b.height;
    }
}
/**
 * MaxRectanglesBinPack
 */
class MaxRectsBinPack {
    binWidth = 0;
    binHeight = 0;
    allowRotate = false;
    usedRectangles = [];
    freeRectangles = [];
    constructor(width, height, allowRotate = false) {
        this.init(width, height, allowRotate);
    }
    /**
     * Init
     */
    init(width, height, allowRotate) {
        this.binWidth = width;
        this.binHeight = height;
        this.allowRotate = allowRotate || false;
        this.usedRectangles.length = 0;
        this.freeRectangles.length = 0;
        this.freeRectangles.push(new Rect(0, 0, width, height));
    }
    /**
     * Insert a set of rectangles
     * @param rectangles
     * @param method 0~4
     * @return success inserted rectangles
     */
    insertRects(rectangles, method) {
        const res = [];
        while (rectangles.length > 0) {
            let bestScore1 = Infinity;
            let bestScore2 = Infinity;
            let bestRectangleIndex = -1;
            let bestNode = new Rect();
            for (let i = 0; i < rectangles.length; i++) {
                const score1 = { value: 0 };
                const score2 = { value: 0 };
                const newNode = this._scoreRectangle(rectangles[i].width, rectangles[i].height, method, score1, score2);
                if (score1.value < bestScore1 || (score1.value === bestScore1 && score2.value < bestScore2)) {
                    bestScore1 = score1.value;
                    bestScore2 = score2.value;
                    bestNode = newNode;
                    bestRectangleIndex = i;
                }
            }
            if (bestRectangleIndex === -1) {
                return res;
            }
            this._placeRectangle(bestNode);
            const rect = rectangles.splice(bestRectangleIndex, 1)[0];
            rect.x = bestNode.x;
            rect.y = bestNode.y;
            if (rect.width !== rect.height && rect.width === bestNode.height && rect.height === bestNode.width) {
                rect.rotated = !rect.rotated;
            }
            res.push(rect);
        }
        return res;
    }
    _placeRectangle(node) {
        for (let i = 0; i < this.freeRectangles.length; i++) {
            if (this._splitFreeNode(this.freeRectangles[i], node)) {
                this.freeRectangles.splice(i, 1);
                i--;
            }
        }
        this._pruneFreeList();
        this.usedRectangles.push(node);
    }
    _scoreRectangle(width, height, method, score1, score2) {
        let newNode = new Rect();
        score1.value = Infinity;
        score2.value = Infinity;
        switch (method) {
            case BestShortSideFit:
                newNode = this._findPositionForNewNodeBestShortSideFit(width, height, score1, score2);
                break;
            case BottomLeftRule:
                newNode = this._findPositionForNewNodeBottomLeft(width, height, score1, score2);
                break;
            case ContactPointRule:
                newNode = this._findPositionForNewNodeContactPoint(width, height, score1);
                // todo: reverse
                // @ts-ignore - 保持与 JS 版本一致的行为
                score1 = -score1; // Reverse since we are minimizing, but for contact point score bigger is better.
                break;
            case BestLongSideFit:
                newNode = this._findPositionForNewNodeBestLongSideFit(width, height, score2, score1);
                break;
            case BestAreaFit:
                newNode = this._findPositionForNewNodeBestAreaFit(width, height, score1, score2);
                break;
            case LeftoverArea:
                newNode = this._findPositionForNewNodeLeftoverArea(width, height, score1, score2);
                break;
        }
        // Cannot fit the current Rectangle.
        if (newNode.height === 0) {
            score1.value = Infinity;
            score2.value = Infinity;
        }
        return newNode;
    }
    _findPositionForNewNodeBottomLeft(width, height, bestY, bestX) {
        const freeRectangles = this.freeRectangles;
        const bestNode = new Rect();
        bestY.value = Infinity;
        let rect;
        let topSideY;
        for (let i = 0; i < freeRectangles.length; i++) {
            rect = freeRectangles[i];
            // Try to place the Rectangle in upright (non-flipped) orientation.
            if (rect.width >= width && rect.height >= height) {
                topSideY = rect.y + height;
                if (topSideY < bestY.value || (topSideY === bestY.value && rect.x < bestX.value)) {
                    bestNode.x = rect.x;
                    bestNode.y = rect.y;
                    bestNode.width = width;
                    bestNode.height = height;
                    bestY.value = topSideY;
                    bestX.value = rect.x;
                }
            }
            if (this.allowRotate && rect.width >= height && rect.height >= width) {
                topSideY = rect.y + width;
                if (topSideY < bestY.value || (topSideY === bestY.value && rect.x < bestX.value)) {
                    bestNode.x = rect.x;
                    bestNode.y = rect.y;
                    bestNode.width = height;
                    bestNode.height = width;
                    bestY.value = topSideY;
                    bestX.value = rect.x;
                }
            }
        }
        return bestNode;
    }
    _findPositionForNewNodeBestShortSideFit(width, height, bestShortSideFit, bestLongSideFit) {
        const freeRectangles = this.freeRectangles;
        const bestNode = new Rect();
        bestShortSideFit.value = Infinity;
        let rect;
        let leftoverHoriz;
        let leftoverVert;
        let shortSideFit;
        let longSideFit;
        for (let i = 0; i < freeRectangles.length; i++) {
            rect = freeRectangles[i];
            // Try to place the Rectangle in upright (non-flipped) orientation.
            if (rect.width >= width && rect.height >= height) {
                leftoverHoriz = Math.abs(rect.width - width);
                leftoverVert = Math.abs(rect.height - height);
                shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                longSideFit = Math.max(leftoverHoriz, leftoverVert);
                if (shortSideFit < bestShortSideFit.value || (shortSideFit === bestShortSideFit.value && longSideFit < bestLongSideFit.value)) {
                    bestNode.x = rect.x;
                    bestNode.y = rect.y;
                    bestNode.width = width;
                    bestNode.height = height;
                    bestShortSideFit.value = shortSideFit;
                    bestLongSideFit.value = longSideFit;
                }
            }
            let flippedLeftoverHoriz;
            let flippedLeftoverVert;
            let flippedShortSideFit;
            let flippedLongSideFit;
            if (this.allowRotate && rect.width >= height && rect.height >= width) {
                flippedLeftoverHoriz = Math.abs(rect.width - height);
                flippedLeftoverVert = Math.abs(rect.height - width);
                flippedShortSideFit = Math.min(flippedLeftoverHoriz, flippedLeftoverVert);
                flippedLongSideFit = Math.max(flippedLeftoverHoriz, flippedLeftoverVert);
                if (flippedShortSideFit < bestShortSideFit.value || (flippedShortSideFit === bestShortSideFit.value && flippedLongSideFit < bestLongSideFit.value)) {
                    bestNode.x = rect.x;
                    bestNode.y = rect.y;
                    bestNode.width = height;
                    bestNode.height = width;
                    bestShortSideFit.value = flippedShortSideFit;
                    bestLongSideFit.value = flippedLongSideFit;
                }
            }
        }
        return bestNode;
    }
    _findPositionForNewNodeBestLongSideFit(width, height, bestShortSideFit, bestLongSideFit) {
        const freeRectangles = this.freeRectangles;
        const bestNode = new Rect();
        bestLongSideFit.value = Infinity;
        let rect;
        let leftoverHoriz;
        let leftoverVert;
        let shortSideFit;
        let longSideFit;
        for (let i = 0; i < freeRectangles.length; i++) {
            rect = freeRectangles[i];
            // Try to place the Rectangle in upright (non-flipped) orientation.
            if (rect.width >= width && rect.height >= height) {
                leftoverHoriz = Math.abs(rect.width - width);
                leftoverVert = Math.abs(rect.height - height);
                shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                longSideFit = Math.max(leftoverHoriz, leftoverVert);
                if (longSideFit < bestLongSideFit.value || (longSideFit === bestLongSideFit.value && shortSideFit < bestShortSideFit.value)) {
                    bestNode.x = rect.x;
                    bestNode.y = rect.y;
                    bestNode.width = width;
                    bestNode.height = height;
                    bestShortSideFit.value = shortSideFit;
                    bestLongSideFit.value = longSideFit;
                }
            }
            if (this.allowRotate && rect.width >= height && rect.height >= width) {
                leftoverHoriz = Math.abs(rect.width - height);
                leftoverVert = Math.abs(rect.height - width);
                shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                longSideFit = Math.max(leftoverHoriz, leftoverVert);
                if (longSideFit < bestLongSideFit.value || (longSideFit === bestLongSideFit.value && shortSideFit < bestShortSideFit.value)) {
                    bestNode.x = rect.x;
                    bestNode.y = rect.y;
                    bestNode.width = height;
                    bestNode.height = width;
                    bestShortSideFit.value = shortSideFit;
                    bestLongSideFit.value = longSideFit;
                }
            }
        }
        return bestNode;
    }
    _findPositionForNewNodeBestAreaFit(width, height, bestAreaFit, bestShortSideFit) {
        const freeRectangles = this.freeRectangles;
        const bestNode = new Rect();
        const requestArea = width * height;
        bestAreaFit.value = Infinity;
        let leftoverHoriz;
        let leftoverVert;
        let shortSideFit;
        for (let i = 0; i < freeRectangles.length; i++) {
            const rect = freeRectangles[i];
            const areaFit = rect.width * rect.height - requestArea;
            // Try to place the Rectangle in upright (non-flipped) orientation.
            if (rect.width >= width && rect.height >= height) {
                leftoverHoriz = rect.width - width;
                leftoverVert = rect.height - height;
                shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                if (areaFit < bestAreaFit.value || (areaFit === bestAreaFit.value && shortSideFit < bestShortSideFit.value)) {
                    bestNode.x = rect.x;
                    bestNode.y = rect.y;
                    bestNode.width = width;
                    bestNode.height = height;
                    bestShortSideFit.value = shortSideFit;
                    bestAreaFit.value = areaFit;
                }
            }
            if (this.allowRotate && rect.width >= height && rect.height >= width) {
                leftoverHoriz = rect.width - height;
                leftoverVert = rect.height - width;
                shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                if (areaFit < bestAreaFit.value || (areaFit === bestAreaFit.value && shortSideFit < bestShortSideFit.value)) {
                    bestNode.x = rect.x;
                    bestNode.y = rect.y;
                    bestNode.width = height;
                    bestNode.height = width;
                    bestShortSideFit.value = shortSideFit;
                    bestAreaFit.value = areaFit;
                }
            }
        }
        return bestNode;
    }
    _findPositionForNewNodeLeftoverArea(width, height, bestAreaFit, bestShortSideFit) {
        const freeRectangles = this.freeRectangles;
        const bestNode = new Rect();
        bestAreaFit.value = 0;
        bestShortSideFit.value = 0;
        let rect;
        let leftoverHoriz;
        let leftoverVert;
        let shortSideFit;
        let areaFit;
        for (let i = 0; i < freeRectangles.length; i++) {
            rect = freeRectangles[i];
            areaFit = rect.width * rect.height - width * height;
            // Try to place the Rectangle in upright (non-flipped) orientation.
            if (rect.width >= width && rect.height >= height) {
                leftoverHoriz = Math.abs(rect.width - width);
                leftoverVert = Math.abs(rect.height - height);
                shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                if (areaFit > bestAreaFit.value || (areaFit === bestAreaFit.value && shortSideFit > bestShortSideFit.value)) {
                    bestNode.x = rect.x;
                    bestNode.y = rect.y;
                    bestNode.width = width;
                    bestNode.height = height;
                    bestShortSideFit.value = shortSideFit;
                    bestAreaFit.value = areaFit;
                }
            }
            if (this.allowRotate && rect.width >= height && rect.height >= width) {
                leftoverHoriz = Math.abs(rect.width - height);
                leftoverVert = Math.abs(rect.height - width);
                shortSideFit = Math.min(leftoverHoriz, leftoverVert);
                if (areaFit > bestAreaFit.value || (areaFit === bestAreaFit.value && shortSideFit > bestShortSideFit.value)) {
                    bestNode.x = rect.x;
                    bestNode.y = rect.y;
                    bestNode.width = height;
                    bestNode.height = width;
                    bestShortSideFit.value = shortSideFit;
                    bestAreaFit.value = areaFit;
                }
            }
        }
        bestAreaFit.value = this.binWidth * this.binHeight - bestAreaFit.value;
        bestShortSideFit.value = Math.min(this.binWidth, this.binHeight) - bestShortSideFit.value;
        return bestNode;
    }
    /// Returns 0 if the two intervals i1 and i2 are disjoint, or the length of their overlap otherwise.
    _commonIntervalLength(i1start, i1end, i2start, i2end) {
        if (i1end < i2start || i2end < i1start) {
            return 0;
        }
        return Math.min(i1end, i2end) - Math.max(i1start, i2start);
    }
    _contactPointScoreNode(x, y, width, height) {
        const usedRectangles = this.usedRectangles;
        let score = 0;
        if (x === 0 || x + width === this.binWidth) {
            score += height;
        }
        if (y === 0 || y + height === this.binHeight) {
            score += width;
        }
        let rect;
        for (let i = 0; i < usedRectangles.length; i++) {
            rect = usedRectangles[i];
            if (rect.x === x + width || rect.x + rect.width === x) {
                score += this._commonIntervalLength(rect.y, rect.y + rect.height, y, y + height);
            }
            if (rect.y === y + height || rect.y + rect.height === y) {
                score += this._commonIntervalLength(rect.x, rect.x + rect.width, x, x + width);
            }
        }
        return score;
    }
    _findPositionForNewNodeContactPoint(width, height, bestContactScore) {
        const freeRectangles = this.freeRectangles;
        const bestNode = new Rect();
        bestContactScore.value = -1;
        let rect;
        let score;
        for (let i = 0; i < freeRectangles.length; i++) {
            rect = freeRectangles[i];
            // Try to place the Rectangle in upright (non-flipped) orientation.
            if (rect.width >= width && rect.height >= height) {
                score = this._contactPointScoreNode(rect.x, rect.y, width, height);
                if (score > bestContactScore.value) {
                    bestNode.x = rect.x;
                    bestNode.y = rect.y;
                    bestNode.width = width;
                    bestNode.height = height;
                    // @ts-ignore - 保持与 JS 版本一致
                    bestContactScore = score;
                }
            }
            if (this.allowRotate && rect.width >= height && rect.height >= width) {
                score = this._contactPointScoreNode(rect.x, rect.y, height, width);
                if (score > bestContactScore.value) {
                    bestNode.x = rect.x;
                    bestNode.y = rect.y;
                    bestNode.width = height;
                    bestNode.height = width;
                    bestContactScore.value = score;
                }
            }
        }
        return bestNode;
    }
    _splitFreeNode(freeNode, usedNode) {
        const freeRectangles = this.freeRectangles;
        // Test with SAT if the Rectangles even intersect.
        if (usedNode.x >= freeNode.x + freeNode.width || usedNode.x + usedNode.width <= freeNode.x ||
            usedNode.y >= freeNode.y + freeNode.height || usedNode.y + usedNode.height <= freeNode.y) {
            // 没有相交的部分
            return false;
        }
        let newNode;
        if (usedNode.y > freeNode.y && usedNode.y < freeNode.y + freeNode.height) {
            // usedNode 顶部包含在 freeNode 中间，那就 usedNode 上边拆出 newNode。
            newNode = freeNode.clone();
            newNode.height = usedNode.y - freeNode.y;
            freeRectangles.push(newNode);
        }
        // New node at the bottom side of the used node.
        if (usedNode.y + usedNode.height < freeNode.y + freeNode.height) {
            newNode = freeNode.clone();
            newNode.y = usedNode.y + usedNode.height;
            newNode.height = freeNode.y + freeNode.height - newNode.y;
            freeRectangles.push(newNode);
        }
        // New node at the left side of the used node.
        if (usedNode.x > freeNode.x && usedNode.x < freeNode.x + freeNode.width) {
            newNode = freeNode.clone();
            newNode.width = usedNode.x - freeNode.x;
            freeRectangles.push(newNode);
        }
        // New node at the right side of the used node.
        if (usedNode.x + usedNode.width < freeNode.x + freeNode.width) {
            newNode = freeNode.clone();
            newNode.x = usedNode.x + usedNode.width;
            newNode.width = freeNode.x + freeNode.width - newNode.x;
            freeRectangles.push(newNode);
        }
        return true;
    }
    _pruneFreeList() {
        const freeRectangles = this.freeRectangles;
        for (let i = 0; i < freeRectangles.length; i++) {
            for (let j = i + 1; j < freeRectangles.length; j++) {
                if (Rect.isContainedIn(freeRectangles[i], freeRectangles[j])) {
                    freeRectangles.splice(i, 1);
                    i--;
                    break;
                }
                if (Rect.isContainedIn(freeRectangles[j], freeRectangles[i])) {
                    freeRectangles.splice(j, 1);
                    j--;
                }
            }
        }
    }
    static heuristics = {
        BestShortSideFit,
        BestLongSideFit,
        BestAreaFit,
        BottomLeftRule,
        ContactPointRule,
        LeftoverArea,
    };
}
exports.default = MaxRectsBinPack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF4cmVjdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY29yZS9idWlsZGVyL3dvcmtlci9idWlsZGVyL2Fzc2V0LWhhbmRsZXIvdGV4dHVyZS1wYWNrZXIvYWxnb3JpdGhtL21heHJlY3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxNQUFNO0FBQ04sZ0ZBQWdGO0FBQ2hGLDBFQUEwRTs7QUFXMUUsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQywyR0FBMkc7QUFDdkksTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUMsMEdBQTBHO0FBQ3JJLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLHVGQUF1RjtBQUM5RyxNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxvQ0FBb0M7QUFDOUQsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxrR0FBa0c7QUFDOUgsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBRXZCOztHQUVHO0FBQ0gsTUFBTSxJQUFJO0lBQ04sQ0FBQyxDQUFTO0lBQ1YsQ0FBQyxDQUFTO0lBQ1YsS0FBSyxDQUFTO0lBQ2QsTUFBTSxDQUFTO0lBQ2YsT0FBTyxDQUFXO0lBRWxCLFlBQVksSUFBWSxDQUFDLEVBQUUsSUFBWSxDQUFDLEVBQUUsUUFBZ0IsQ0FBQyxFQUFFLFNBQWlCLENBQUM7UUFDM0UsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCxLQUFLO1FBQ0QsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFF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LGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQzNELGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUM1QixDQUFDLEVBQUUsQ0FBQztvQkFDSixNQUFNO2dCQUNWLENBQUM7Z0JBQ0QsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUMzRCxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDNUIsQ0FBQyxFQUFFLENBQUM7Z0JBQ1IsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVELE1BQU0sQ0FBQyxVQUFVLEdBQUc7UUFDaEIsZ0JBQWdCO1FBQ2hCLGVBQWU7UUFDZixXQUFXO1FBQ1gsY0FBYztRQUNkLGdCQUFnQjtRQUNoQixZQUFZO0tBQ2YsQ0FBQzs7QUFHTixrQkFBZSxlQUFlLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBSZTpcclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3lpL25vZGUtbWF4LXJlY3RzLWJpbi1wYWNrL2Jsb2IvbWFzdGVyL3NyYy9tYXhyZWN0cy5jb2ZmZWVcclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2p1ai9SZWN0YW5nbGVCaW5QYWNrL2Jsb2IvbWFzdGVyL01heFJlY3RzQmluUGFjay5jcHBcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVJlY3Qge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgd2lkdGg6IG51bWJlcjtcclxuICAgIGhlaWdodDogbnVtYmVyO1xyXG4gICAgcm90YXRlZD86IGJvb2xlYW47XHJcbiAgICBjbG9uZSgpOiBJUmVjdDtcclxufVxyXG5cclxuY29uc3QgQmVzdFNob3J0U2lkZUZpdCA9IDA7IC8vLzwgLUJTU0Y6IFBvc2l0aW9ucyB0aGUgUmVjdGFuZ2xlIGFnYWluc3QgdGhlIHNob3J0IHNpZGUgb2YgYSBmcmVlIFJlY3RhbmdsZSBpbnRvIHdoaWNoIGl0IGZpdHMgdGhlIGJlc3QuXHJcbmNvbnN0IEJlc3RMb25nU2lkZUZpdCA9IDE7IC8vLzwgLUJMU0Y6IFBvc2l0aW9ucyB0aGUgUmVjdGFuZ2xlIGFnYWluc3QgdGhlIGxvbmcgc2lkZSBvZiBhIGZyZWUgUmVjdGFuZ2xlIGludG8gd2hpY2ggaXQgZml0cyB0aGUgYmVzdC5cclxuY29uc3QgQmVzdEFyZWFGaXQgPSAyOyAvLy88IC1CQUY6IFBvc2l0aW9ucyB0aGUgUmVjdGFuZ2xlIGludG8gdGhlIHNtYWxsZXN0IGZyZWUgUmVjdGFuZ2xlIGludG8gd2hpY2ggaXQgZml0cy5cclxuY29uc3QgQm90dG9tTGVmdFJ1bGUgPSAzOyAvLy88IC1CTDogRG9lcyB0aGUgVGV0cmlzIHBsYWNlbWVudC5cclxuY29uc3QgQ29udGFjdFBvaW50UnVsZSA9IDQ7IC8vLzwgLUNQOiBDaG9vc2VzdCB0aGUgcGxhY2VtZW50IHdoZXJlIHRoZSBSZWN0YW5nbGUgdG91Y2hlcyBvdGhlciBSZWN0YW5nbGVzIGFzIG11Y2ggYXMgcG9zc2libGUuXHJcbmNvbnN0IExlZnRvdmVyQXJlYSA9IDU7XHJcblxyXG4vKipcclxuICogUmVjdFxyXG4gKi9cclxuY2xhc3MgUmVjdCBpbXBsZW1lbnRzIElSZWN0IHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxuICAgIHdpZHRoOiBudW1iZXI7XHJcbiAgICBoZWlnaHQ6IG51bWJlcjtcclxuICAgIHJvdGF0ZWQ/OiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciA9IDAsIHk6IG51bWJlciA9IDAsIHdpZHRoOiBudW1iZXIgPSAwLCBoZWlnaHQ6IG51bWJlciA9IDApIHtcclxuICAgICAgICB0aGlzLnggPSB4IHx8IDA7XHJcbiAgICAgICAgdGhpcy55ID0geSB8fCAwO1xyXG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aCB8fCAwO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDA7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvbmUoKTogSVJlY3Qge1xyXG4gICAgICAgIHJldHVybiBuZXcgUmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBpc0NvbnRhaW5lZEluKGE6IElSZWN0LCBiOiBJUmVjdCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBhLnggPj0gYi54ICYmIGEueSA+PSBiLnkgJiZcclxuICAgICAgICAgICAgYS54ICsgYS53aWR0aCA8PSBiLnggKyBiLndpZHRoICYmXHJcbiAgICAgICAgICAgIGEueSArIGEuaGVpZ2h0IDw9IGIueSArIGIuaGVpZ2h0O1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogTWF4UmVjdGFuZ2xlc0JpblBhY2tcclxuICovXHJcbmNsYXNzIE1heFJlY3RzQmluUGFjayB7XHJcbiAgICBiaW5XaWR0aDogbnVtYmVyID0gMDtcclxuICAgIGJpbkhlaWdodDogbnVtYmVyID0gMDtcclxuICAgIGFsbG93Um90YXRlOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICB1c2VkUmVjdGFuZ2xlczogSVJlY3RbXSA9IFtdO1xyXG4gICAgZnJlZVJlY3RhbmdsZXM6IElSZWN0W10gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgYWxsb3dSb3RhdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIHRoaXMuaW5pdCh3aWR0aCwgaGVpZ2h0LCBhbGxvd1JvdGF0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbml0XHJcbiAgICAgKi9cclxuICAgIGluaXQod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGFsbG93Um90YXRlOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5iaW5XaWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuYmluSGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuYWxsb3dSb3RhdGUgPSBhbGxvd1JvdGF0ZSB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy51c2VkUmVjdGFuZ2xlcy5sZW5ndGggPSAwO1xyXG4gICAgICAgIHRoaXMuZnJlZVJlY3RhbmdsZXMubGVuZ3RoID0gMDtcclxuICAgICAgICB0aGlzLmZyZWVSZWN0YW5nbGVzLnB1c2gobmV3IFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zZXJ0IGEgc2V0IG9mIHJlY3RhbmdsZXNcclxuICAgICAqIEBwYXJhbSByZWN0YW5nbGVzXHJcbiAgICAgKiBAcGFyYW0gbWV0aG9kIDB+NFxyXG4gICAgICogQHJldHVybiBzdWNjZXNzIGluc2VydGVkIHJlY3RhbmdsZXNcclxuICAgICAqL1xyXG4gICAgaW5zZXJ0UmVjdHMocmVjdGFuZ2xlczogSVJlY3RbXSwgbWV0aG9kOiBudW1iZXIpOiBJUmVjdFtdIHtcclxuICAgICAgICBjb25zdCByZXM6IElSZWN0W10gPSBbXTtcclxuICAgICAgICB3aGlsZSAocmVjdGFuZ2xlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBiZXN0U2NvcmUxID0gSW5maW5pdHk7XHJcbiAgICAgICAgICAgIGxldCBiZXN0U2NvcmUyID0gSW5maW5pdHk7XHJcbiAgICAgICAgICAgIGxldCBiZXN0UmVjdGFuZ2xlSW5kZXggPSAtMTtcclxuICAgICAgICAgICAgbGV0IGJlc3ROb2RlID0gbmV3IFJlY3QoKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVjdGFuZ2xlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NvcmUxID0geyB2YWx1ZTogMCB9O1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NvcmUyID0geyB2YWx1ZTogMCB9O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3Tm9kZSA9IHRoaXMuX3Njb3JlUmVjdGFuZ2xlKHJlY3RhbmdsZXNbaV0ud2lkdGgsIHJlY3RhbmdsZXNbaV0uaGVpZ2h0LCBtZXRob2QsIHNjb3JlMSwgc2NvcmUyKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2NvcmUxLnZhbHVlIDwgYmVzdFNjb3JlMSB8fCAoc2NvcmUxLnZhbHVlID09PSBiZXN0U2NvcmUxICYmIHNjb3JlMi52YWx1ZSA8IGJlc3RTY29yZTIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdFNjb3JlMSA9IHNjb3JlMS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0U2NvcmUyID0gc2NvcmUyLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlID0gbmV3Tm9kZTtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0UmVjdGFuZ2xlSW5kZXggPSBpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYmVzdFJlY3RhbmdsZUluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VSZWN0YW5nbGUoYmVzdE5vZGUpO1xyXG4gICAgICAgICAgICBjb25zdCByZWN0ID0gcmVjdGFuZ2xlcy5zcGxpY2UoYmVzdFJlY3RhbmdsZUluZGV4LCAxKVswXTtcclxuICAgICAgICAgICAgcmVjdC54ID0gYmVzdE5vZGUueDtcclxuICAgICAgICAgICAgcmVjdC55ID0gYmVzdE5vZGUueTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyZWN0LndpZHRoICE9PSByZWN0LmhlaWdodCAmJiByZWN0LndpZHRoID09PSBiZXN0Tm9kZS5oZWlnaHQgJiYgcmVjdC5oZWlnaHQgPT09IGJlc3ROb2RlLndpZHRoKSB7XHJcbiAgICAgICAgICAgICAgICByZWN0LnJvdGF0ZWQgPSAhcmVjdC5yb3RhdGVkO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXMucHVzaChyZWN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9wbGFjZVJlY3RhbmdsZShub2RlOiBJUmVjdCk6IHZvaWQge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5mcmVlUmVjdGFuZ2xlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fc3BsaXRGcmVlTm9kZSh0aGlzLmZyZWVSZWN0YW5nbGVzW2ldLCBub2RlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mcmVlUmVjdGFuZ2xlcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX3BydW5lRnJlZUxpc3QoKTtcclxuICAgICAgICB0aGlzLnVzZWRSZWN0YW5nbGVzLnB1c2gobm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfc2NvcmVSZWN0YW5nbGUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIG1ldGhvZDogbnVtYmVyLCBzY29yZTE6IHsgdmFsdWU6IG51bWJlciB9LCBzY29yZTI6IHsgdmFsdWU6IG51bWJlciB9KTogSVJlY3Qge1xyXG4gICAgICAgIGxldCBuZXdOb2RlID0gbmV3IFJlY3QoKTtcclxuICAgICAgICBzY29yZTEudmFsdWUgPSBJbmZpbml0eTtcclxuICAgICAgICBzY29yZTIudmFsdWUgPSBJbmZpbml0eTtcclxuICAgICAgICBzd2l0Y2ggKG1ldGhvZCkge1xyXG4gICAgICAgICAgICBjYXNlIEJlc3RTaG9ydFNpZGVGaXQ6XHJcbiAgICAgICAgICAgICAgICBuZXdOb2RlID0gdGhpcy5fZmluZFBvc2l0aW9uRm9yTmV3Tm9kZUJlc3RTaG9ydFNpZGVGaXQod2lkdGgsIGhlaWdodCwgc2NvcmUxLCBzY29yZTIpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQm90dG9tTGVmdFJ1bGU6XHJcbiAgICAgICAgICAgICAgICBuZXdOb2RlID0gdGhpcy5fZmluZFBvc2l0aW9uRm9yTmV3Tm9kZUJvdHRvbUxlZnQod2lkdGgsIGhlaWdodCwgc2NvcmUxLCBzY29yZTIpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQ29udGFjdFBvaW50UnVsZTpcclxuICAgICAgICAgICAgICAgIG5ld05vZGUgPSB0aGlzLl9maW5kUG9zaXRpb25Gb3JOZXdOb2RlQ29udGFjdFBvaW50KHdpZHRoLCBoZWlnaHQsIHNjb3JlMSk7XHJcbiAgICAgICAgICAgICAgICAvLyB0b2RvOiByZXZlcnNlXHJcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0g5L+d5oyB5LiOIEpTIOeJiOacrOS4gOiHtOeahOihjOS4ulxyXG4gICAgICAgICAgICAgICAgc2NvcmUxID0gLXNjb3JlMTsgLy8gUmV2ZXJzZSBzaW5jZSB3ZSBhcmUgbWluaW1pemluZywgYnV0IGZvciBjb250YWN0IHBvaW50IHNjb3JlIGJpZ2dlciBpcyBiZXR0ZXIuXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBCZXN0TG9uZ1NpZGVGaXQ6XHJcbiAgICAgICAgICAgICAgICBuZXdOb2RlID0gdGhpcy5fZmluZFBvc2l0aW9uRm9yTmV3Tm9kZUJlc3RMb25nU2lkZUZpdCh3aWR0aCwgaGVpZ2h0LCBzY29yZTIsIHNjb3JlMSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBCZXN0QXJlYUZpdDpcclxuICAgICAgICAgICAgICAgIG5ld05vZGUgPSB0aGlzLl9maW5kUG9zaXRpb25Gb3JOZXdOb2RlQmVzdEFyZWFGaXQod2lkdGgsIGhlaWdodCwgc2NvcmUxLCBzY29yZTIpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgTGVmdG92ZXJBcmVhOlxyXG4gICAgICAgICAgICAgICAgbmV3Tm9kZSA9IHRoaXMuX2ZpbmRQb3NpdGlvbkZvck5ld05vZGVMZWZ0b3ZlckFyZWEod2lkdGgsIGhlaWdodCwgc2NvcmUxLCBzY29yZTIpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDYW5ub3QgZml0IHRoZSBjdXJyZW50IFJlY3RhbmdsZS5cclxuICAgICAgICBpZiAobmV3Tm9kZS5oZWlnaHQgPT09IDApIHtcclxuICAgICAgICAgICAgc2NvcmUxLnZhbHVlID0gSW5maW5pdHk7XHJcbiAgICAgICAgICAgIHNjb3JlMi52YWx1ZSA9IEluZmluaXR5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5ld05vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZmluZFBvc2l0aW9uRm9yTmV3Tm9kZUJvdHRvbUxlZnQod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGJlc3RZOiB7IHZhbHVlOiBudW1iZXIgfSwgYmVzdFg6IHsgdmFsdWU6IG51bWJlciB9KTogSVJlY3Qge1xyXG4gICAgICAgIGNvbnN0IGZyZWVSZWN0YW5nbGVzID0gdGhpcy5mcmVlUmVjdGFuZ2xlcztcclxuICAgICAgICBjb25zdCBiZXN0Tm9kZSA9IG5ldyBSZWN0KCk7XHJcblxyXG4gICAgICAgIGJlc3RZLnZhbHVlID0gSW5maW5pdHk7XHJcbiAgICAgICAgbGV0IHJlY3Q6IElSZWN0O1xyXG4gICAgICAgIGxldCB0b3BTaWRlWTogbnVtYmVyO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZnJlZVJlY3RhbmdsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgcmVjdCA9IGZyZWVSZWN0YW5nbGVzW2ldO1xyXG4gICAgICAgICAgICAvLyBUcnkgdG8gcGxhY2UgdGhlIFJlY3RhbmdsZSBpbiB1cHJpZ2h0IChub24tZmxpcHBlZCkgb3JpZW50YXRpb24uXHJcbiAgICAgICAgICAgIGlmIChyZWN0LndpZHRoID49IHdpZHRoICYmIHJlY3QuaGVpZ2h0ID49IGhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgdG9wU2lkZVkgPSByZWN0LnkgKyBoZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBpZiAodG9wU2lkZVkgPCBiZXN0WS52YWx1ZSB8fCAodG9wU2lkZVkgPT09IGJlc3RZLnZhbHVlICYmIHJlY3QueCA8IGJlc3RYLnZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLnggPSByZWN0Lng7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUueSA9IHJlY3QueTtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0WS52YWx1ZSA9IHRvcFNpZGVZO1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RYLnZhbHVlID0gcmVjdC54O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFsbG93Um90YXRlICYmIHJlY3Qud2lkdGggPj0gaGVpZ2h0ICYmIHJlY3QuaGVpZ2h0ID49IHdpZHRoKSB7XHJcbiAgICAgICAgICAgICAgICB0b3BTaWRlWSA9IHJlY3QueSArIHdpZHRoO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRvcFNpZGVZIDwgYmVzdFkudmFsdWUgfHwgKHRvcFNpZGVZID09PSBiZXN0WS52YWx1ZSAmJiByZWN0LnggPCBiZXN0WC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS54ID0gcmVjdC54O1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLnkgPSByZWN0Lnk7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUud2lkdGggPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUuaGVpZ2h0ID0gd2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdFkudmFsdWUgPSB0b3BTaWRlWTtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0WC52YWx1ZSA9IHJlY3QueDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYmVzdE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZmluZFBvc2l0aW9uRm9yTmV3Tm9kZUJlc3RTaG9ydFNpZGVGaXQod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGJlc3RTaG9ydFNpZGVGaXQ6IHsgdmFsdWU6IG51bWJlciB9LCBiZXN0TG9uZ1NpZGVGaXQ6IHsgdmFsdWU6IG51bWJlciB9KTogSVJlY3Qge1xyXG4gICAgICAgIGNvbnN0IGZyZWVSZWN0YW5nbGVzID0gdGhpcy5mcmVlUmVjdGFuZ2xlcztcclxuICAgICAgICBjb25zdCBiZXN0Tm9kZSA9IG5ldyBSZWN0KCk7XHJcblxyXG4gICAgICAgIGJlc3RTaG9ydFNpZGVGaXQudmFsdWUgPSBJbmZpbml0eTtcclxuXHJcbiAgICAgICAgbGV0IHJlY3Q6IElSZWN0O1xyXG4gICAgICAgIGxldCBsZWZ0b3Zlckhvcml6OiBudW1iZXI7XHJcbiAgICAgICAgbGV0IGxlZnRvdmVyVmVydDogbnVtYmVyO1xyXG4gICAgICAgIGxldCBzaG9ydFNpZGVGaXQ6IG51bWJlcjtcclxuICAgICAgICBsZXQgbG9uZ1NpZGVGaXQ6IG51bWJlcjtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmVlUmVjdGFuZ2xlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICByZWN0ID0gZnJlZVJlY3RhbmdsZXNbaV07XHJcbiAgICAgICAgICAgIC8vIFRyeSB0byBwbGFjZSB0aGUgUmVjdGFuZ2xlIGluIHVwcmlnaHQgKG5vbi1mbGlwcGVkKSBvcmllbnRhdGlvbi5cclxuICAgICAgICAgICAgaWYgKHJlY3Qud2lkdGggPj0gd2lkdGggJiYgcmVjdC5oZWlnaHQgPj0gaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICBsZWZ0b3Zlckhvcml6ID0gTWF0aC5hYnMocmVjdC53aWR0aCAtIHdpZHRoKTtcclxuICAgICAgICAgICAgICAgIGxlZnRvdmVyVmVydCA9IE1hdGguYWJzKHJlY3QuaGVpZ2h0IC0gaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHNob3J0U2lkZUZpdCA9IE1hdGgubWluKGxlZnRvdmVySG9yaXosIGxlZnRvdmVyVmVydCk7XHJcbiAgICAgICAgICAgICAgICBsb25nU2lkZUZpdCA9IE1hdGgubWF4KGxlZnRvdmVySG9yaXosIGxlZnRvdmVyVmVydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNob3J0U2lkZUZpdCA8IGJlc3RTaG9ydFNpZGVGaXQudmFsdWUgfHwgKHNob3J0U2lkZUZpdCA9PT0gYmVzdFNob3J0U2lkZUZpdC52YWx1ZSAmJiBsb25nU2lkZUZpdCA8IGJlc3RMb25nU2lkZUZpdC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS54ID0gcmVjdC54O1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLnkgPSByZWN0Lnk7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdFNob3J0U2lkZUZpdC52YWx1ZSA9IHNob3J0U2lkZUZpdDtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0TG9uZ1NpZGVGaXQudmFsdWUgPSBsb25nU2lkZUZpdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgZmxpcHBlZExlZnRvdmVySG9yaXo6IG51bWJlcjtcclxuICAgICAgICAgICAgbGV0IGZsaXBwZWRMZWZ0b3ZlclZlcnQ6IG51bWJlcjtcclxuICAgICAgICAgICAgbGV0IGZsaXBwZWRTaG9ydFNpZGVGaXQ6IG51bWJlcjtcclxuICAgICAgICAgICAgbGV0IGZsaXBwZWRMb25nU2lkZUZpdDogbnVtYmVyO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hbGxvd1JvdGF0ZSAmJiByZWN0LndpZHRoID49IGhlaWdodCAmJiByZWN0LmhlaWdodCA+PSB3aWR0aCkge1xyXG4gICAgICAgICAgICAgICAgZmxpcHBlZExlZnRvdmVySG9yaXogPSBNYXRoLmFicyhyZWN0LndpZHRoIC0gaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGZsaXBwZWRMZWZ0b3ZlclZlcnQgPSBNYXRoLmFicyhyZWN0LmhlaWdodCAtIHdpZHRoKTtcclxuICAgICAgICAgICAgICAgIGZsaXBwZWRTaG9ydFNpZGVGaXQgPSBNYXRoLm1pbihmbGlwcGVkTGVmdG92ZXJIb3JpeiwgZmxpcHBlZExlZnRvdmVyVmVydCk7XHJcbiAgICAgICAgICAgICAgICBmbGlwcGVkTG9uZ1NpZGVGaXQgPSBNYXRoLm1heChmbGlwcGVkTGVmdG92ZXJIb3JpeiwgZmxpcHBlZExlZnRvdmVyVmVydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGZsaXBwZWRTaG9ydFNpZGVGaXQgPCBiZXN0U2hvcnRTaWRlRml0LnZhbHVlIHx8IChmbGlwcGVkU2hvcnRTaWRlRml0ID09PSBiZXN0U2hvcnRTaWRlRml0LnZhbHVlICYmIGZsaXBwZWRMb25nU2lkZUZpdCA8IGJlc3RMb25nU2lkZUZpdC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS54ID0gcmVjdC54O1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLnkgPSByZWN0Lnk7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUud2lkdGggPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUuaGVpZ2h0ID0gd2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdFNob3J0U2lkZUZpdC52YWx1ZSA9IGZsaXBwZWRTaG9ydFNpZGVGaXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdExvbmdTaWRlRml0LnZhbHVlID0gZmxpcHBlZExvbmdTaWRlRml0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYmVzdE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZmluZFBvc2l0aW9uRm9yTmV3Tm9kZUJlc3RMb25nU2lkZUZpdCh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgYmVzdFNob3J0U2lkZUZpdDogeyB2YWx1ZTogbnVtYmVyIH0sIGJlc3RMb25nU2lkZUZpdDogeyB2YWx1ZTogbnVtYmVyIH0pOiBJUmVjdCB7XHJcbiAgICAgICAgY29uc3QgZnJlZVJlY3RhbmdsZXMgPSB0aGlzLmZyZWVSZWN0YW5nbGVzO1xyXG4gICAgICAgIGNvbnN0IGJlc3ROb2RlID0gbmV3IFJlY3QoKTtcclxuICAgICAgICBiZXN0TG9uZ1NpZGVGaXQudmFsdWUgPSBJbmZpbml0eTtcclxuICAgICAgICBsZXQgcmVjdDogSVJlY3Q7XHJcblxyXG4gICAgICAgIGxldCBsZWZ0b3Zlckhvcml6OiBudW1iZXI7XHJcbiAgICAgICAgbGV0IGxlZnRvdmVyVmVydDogbnVtYmVyO1xyXG4gICAgICAgIGxldCBzaG9ydFNpZGVGaXQ6IG51bWJlcjtcclxuICAgICAgICBsZXQgbG9uZ1NpZGVGaXQ6IG51bWJlcjtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZyZWVSZWN0YW5nbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJlY3QgPSBmcmVlUmVjdGFuZ2xlc1tpXTtcclxuICAgICAgICAgICAgLy8gVHJ5IHRvIHBsYWNlIHRoZSBSZWN0YW5nbGUgaW4gdXByaWdodCAobm9uLWZsaXBwZWQpIG9yaWVudGF0aW9uLlxyXG4gICAgICAgICAgICBpZiAocmVjdC53aWR0aCA+PSB3aWR0aCAmJiByZWN0LmhlaWdodCA+PSBoZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGxlZnRvdmVySG9yaXogPSBNYXRoLmFicyhyZWN0LndpZHRoIC0gd2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgbGVmdG92ZXJWZXJ0ID0gTWF0aC5hYnMocmVjdC5oZWlnaHQgLSBoZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgc2hvcnRTaWRlRml0ID0gTWF0aC5taW4obGVmdG92ZXJIb3JpeiwgbGVmdG92ZXJWZXJ0KTtcclxuICAgICAgICAgICAgICAgIGxvbmdTaWRlRml0ID0gTWF0aC5tYXgobGVmdG92ZXJIb3JpeiwgbGVmdG92ZXJWZXJ0KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobG9uZ1NpZGVGaXQgPCBiZXN0TG9uZ1NpZGVGaXQudmFsdWUgfHwgKGxvbmdTaWRlRml0ID09PSBiZXN0TG9uZ1NpZGVGaXQudmFsdWUgJiYgc2hvcnRTaWRlRml0IDwgYmVzdFNob3J0U2lkZUZpdC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS54ID0gcmVjdC54O1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLnkgPSByZWN0Lnk7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdFNob3J0U2lkZUZpdC52YWx1ZSA9IHNob3J0U2lkZUZpdDtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0TG9uZ1NpZGVGaXQudmFsdWUgPSBsb25nU2lkZUZpdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuYWxsb3dSb3RhdGUgJiYgcmVjdC53aWR0aCA+PSBoZWlnaHQgJiYgcmVjdC5oZWlnaHQgPj0gd2lkdGgpIHtcclxuICAgICAgICAgICAgICAgIGxlZnRvdmVySG9yaXogPSBNYXRoLmFicyhyZWN0LndpZHRoIC0gaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGxlZnRvdmVyVmVydCA9IE1hdGguYWJzKHJlY3QuaGVpZ2h0IC0gd2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgc2hvcnRTaWRlRml0ID0gTWF0aC5taW4obGVmdG92ZXJIb3JpeiwgbGVmdG92ZXJWZXJ0KTtcclxuICAgICAgICAgICAgICAgIGxvbmdTaWRlRml0ID0gTWF0aC5tYXgobGVmdG92ZXJIb3JpeiwgbGVmdG92ZXJWZXJ0KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobG9uZ1NpZGVGaXQgPCBiZXN0TG9uZ1NpZGVGaXQudmFsdWUgfHwgKGxvbmdTaWRlRml0ID09PSBiZXN0TG9uZ1NpZGVGaXQudmFsdWUgJiYgc2hvcnRTaWRlRml0IDwgYmVzdFNob3J0U2lkZUZpdC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS54ID0gcmVjdC54O1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLnkgPSByZWN0Lnk7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUud2lkdGggPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUuaGVpZ2h0ID0gd2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdFNob3J0U2lkZUZpdC52YWx1ZSA9IHNob3J0U2lkZUZpdDtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0TG9uZ1NpZGVGaXQudmFsdWUgPSBsb25nU2lkZUZpdDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYmVzdE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfZmluZFBvc2l0aW9uRm9yTmV3Tm9kZUJlc3RBcmVhRml0KHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBiZXN0QXJlYUZpdDogeyB2YWx1ZTogbnVtYmVyIH0sIGJlc3RTaG9ydFNpZGVGaXQ6IHsgdmFsdWU6IG51bWJlciB9KTogSVJlY3Qge1xyXG4gICAgICAgIGNvbnN0IGZyZWVSZWN0YW5nbGVzID0gdGhpcy5mcmVlUmVjdGFuZ2xlcztcclxuICAgICAgICBjb25zdCBiZXN0Tm9kZSA9IG5ldyBSZWN0KCk7XHJcbiAgICAgICAgY29uc3QgcmVxdWVzdEFyZWEgPSB3aWR0aCAqIGhlaWdodDtcclxuXHJcbiAgICAgICAgYmVzdEFyZWFGaXQudmFsdWUgPSBJbmZpbml0eTtcclxuXHJcbiAgICAgICAgbGV0IGxlZnRvdmVySG9yaXo6IG51bWJlcjtcclxuICAgICAgICBsZXQgbGVmdG92ZXJWZXJ0OiBudW1iZXI7XHJcbiAgICAgICAgbGV0IHNob3J0U2lkZUZpdDogbnVtYmVyO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZyZWVSZWN0YW5nbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlY3QgPSBmcmVlUmVjdGFuZ2xlc1tpXTtcclxuICAgICAgICAgICAgY29uc3QgYXJlYUZpdCA9IHJlY3Qud2lkdGggKiByZWN0LmhlaWdodCAtIHJlcXVlc3RBcmVhO1xyXG5cclxuICAgICAgICAgICAgLy8gVHJ5IHRvIHBsYWNlIHRoZSBSZWN0YW5nbGUgaW4gdXByaWdodCAobm9uLWZsaXBwZWQpIG9yaWVudGF0aW9uLlxyXG4gICAgICAgICAgICBpZiAocmVjdC53aWR0aCA+PSB3aWR0aCAmJiByZWN0LmhlaWdodCA+PSBoZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIGxlZnRvdmVySG9yaXogPSByZWN0LndpZHRoIC0gd2lkdGg7XHJcbiAgICAgICAgICAgICAgICBsZWZ0b3ZlclZlcnQgPSByZWN0LmhlaWdodCAtIGhlaWdodDtcclxuICAgICAgICAgICAgICAgIHNob3J0U2lkZUZpdCA9IE1hdGgubWluKGxlZnRvdmVySG9yaXosIGxlZnRvdmVyVmVydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGFyZWFGaXQgPCBiZXN0QXJlYUZpdC52YWx1ZSB8fCAoYXJlYUZpdCA9PT0gYmVzdEFyZWFGaXQudmFsdWUgJiYgc2hvcnRTaWRlRml0IDwgYmVzdFNob3J0U2lkZUZpdC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS54ID0gcmVjdC54O1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLnkgPSByZWN0Lnk7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdFNob3J0U2lkZUZpdC52YWx1ZSA9IHNob3J0U2lkZUZpdDtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0QXJlYUZpdC52YWx1ZSA9IGFyZWFGaXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFsbG93Um90YXRlICYmIHJlY3Qud2lkdGggPj0gaGVpZ2h0ICYmIHJlY3QuaGVpZ2h0ID49IHdpZHRoKSB7XHJcbiAgICAgICAgICAgICAgICBsZWZ0b3Zlckhvcml6ID0gcmVjdC53aWR0aCAtIGhlaWdodDtcclxuICAgICAgICAgICAgICAgIGxlZnRvdmVyVmVydCA9IHJlY3QuaGVpZ2h0IC0gd2lkdGg7XHJcbiAgICAgICAgICAgICAgICBzaG9ydFNpZGVGaXQgPSBNYXRoLm1pbihsZWZ0b3Zlckhvcml6LCBsZWZ0b3ZlclZlcnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChhcmVhRml0IDwgYmVzdEFyZWFGaXQudmFsdWUgfHwgKGFyZWFGaXQgPT09IGJlc3RBcmVhRml0LnZhbHVlICYmIHNob3J0U2lkZUZpdCA8IGJlc3RTaG9ydFNpZGVGaXQudmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUueCA9IHJlY3QueDtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS55ID0gcmVjdC55O1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLndpZHRoID0gaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLmhlaWdodCA9IHdpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RTaG9ydFNpZGVGaXQudmFsdWUgPSBzaG9ydFNpZGVGaXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdEFyZWFGaXQudmFsdWUgPSBhcmVhRml0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBiZXN0Tm9kZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9maW5kUG9zaXRpb25Gb3JOZXdOb2RlTGVmdG92ZXJBcmVhKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBiZXN0QXJlYUZpdDogeyB2YWx1ZTogbnVtYmVyIH0sIGJlc3RTaG9ydFNpZGVGaXQ6IHsgdmFsdWU6IG51bWJlciB9KTogSVJlY3Qge1xyXG4gICAgICAgIGNvbnN0IGZyZWVSZWN0YW5nbGVzID0gdGhpcy5mcmVlUmVjdGFuZ2xlcztcclxuICAgICAgICBjb25zdCBiZXN0Tm9kZSA9IG5ldyBSZWN0KCk7XHJcblxyXG4gICAgICAgIGJlc3RBcmVhRml0LnZhbHVlID0gMDtcclxuICAgICAgICBiZXN0U2hvcnRTaWRlRml0LnZhbHVlID0gMDtcclxuXHJcbiAgICAgICAgbGV0IHJlY3Q6IElSZWN0O1xyXG5cclxuICAgICAgICBsZXQgbGVmdG92ZXJIb3JpejogbnVtYmVyO1xyXG4gICAgICAgIGxldCBsZWZ0b3ZlclZlcnQ6IG51bWJlcjtcclxuICAgICAgICBsZXQgc2hvcnRTaWRlRml0OiBudW1iZXI7XHJcbiAgICAgICAgbGV0IGFyZWFGaXQ6IG51bWJlcjtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmVlUmVjdGFuZ2xlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICByZWN0ID0gZnJlZVJlY3RhbmdsZXNbaV07XHJcbiAgICAgICAgICAgIGFyZWFGaXQgPSByZWN0LndpZHRoICogcmVjdC5oZWlnaHQgLSB3aWR0aCAqIGhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIC8vIFRyeSB0byBwbGFjZSB0aGUgUmVjdGFuZ2xlIGluIHVwcmlnaHQgKG5vbi1mbGlwcGVkKSBvcmllbnRhdGlvbi5cclxuICAgICAgICAgICAgaWYgKHJlY3Qud2lkdGggPj0gd2lkdGggJiYgcmVjdC5oZWlnaHQgPj0gaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICBsZWZ0b3Zlckhvcml6ID0gTWF0aC5hYnMocmVjdC53aWR0aCAtIHdpZHRoKTtcclxuICAgICAgICAgICAgICAgIGxlZnRvdmVyVmVydCA9IE1hdGguYWJzKHJlY3QuaGVpZ2h0IC0gaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHNob3J0U2lkZUZpdCA9IE1hdGgubWluKGxlZnRvdmVySG9yaXosIGxlZnRvdmVyVmVydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGFyZWFGaXQgPiBiZXN0QXJlYUZpdC52YWx1ZSB8fCAoYXJlYUZpdCA9PT0gYmVzdEFyZWFGaXQudmFsdWUgJiYgc2hvcnRTaWRlRml0ID4gYmVzdFNob3J0U2lkZUZpdC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS54ID0gcmVjdC54O1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLnkgPSByZWN0Lnk7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdFNob3J0U2lkZUZpdC52YWx1ZSA9IHNob3J0U2lkZUZpdDtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0QXJlYUZpdC52YWx1ZSA9IGFyZWFGaXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFsbG93Um90YXRlICYmIHJlY3Qud2lkdGggPj0gaGVpZ2h0ICYmIHJlY3QuaGVpZ2h0ID49IHdpZHRoKSB7XHJcbiAgICAgICAgICAgICAgICBsZWZ0b3Zlckhvcml6ID0gTWF0aC5hYnMocmVjdC53aWR0aCAtIGhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICBsZWZ0b3ZlclZlcnQgPSBNYXRoLmFicyhyZWN0LmhlaWdodCAtIHdpZHRoKTtcclxuICAgICAgICAgICAgICAgIHNob3J0U2lkZUZpdCA9IE1hdGgubWluKGxlZnRvdmVySG9yaXosIGxlZnRvdmVyVmVydCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGFyZWFGaXQgPiBiZXN0QXJlYUZpdC52YWx1ZSB8fCAoYXJlYUZpdCA9PT0gYmVzdEFyZWFGaXQudmFsdWUgJiYgc2hvcnRTaWRlRml0ID4gYmVzdFNob3J0U2lkZUZpdC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS54ID0gcmVjdC54O1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLnkgPSByZWN0Lnk7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUud2lkdGggPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUuaGVpZ2h0ID0gd2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdFNob3J0U2lkZUZpdC52YWx1ZSA9IHNob3J0U2lkZUZpdDtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0QXJlYUZpdC52YWx1ZSA9IGFyZWFGaXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGJlc3RBcmVhRml0LnZhbHVlID0gdGhpcy5iaW5XaWR0aCAqIHRoaXMuYmluSGVpZ2h0IC0gYmVzdEFyZWFGaXQudmFsdWU7XHJcbiAgICAgICAgYmVzdFNob3J0U2lkZUZpdC52YWx1ZSA9IE1hdGgubWluKHRoaXMuYmluV2lkdGgsIHRoaXMuYmluSGVpZ2h0KSAtIGJlc3RTaG9ydFNpZGVGaXQudmFsdWU7XHJcblxyXG4gICAgICAgIHJldHVybiBiZXN0Tm9kZTtcclxuICAgIH1cclxuXHJcbiAgICAvLy8gUmV0dXJucyAwIGlmIHRoZSB0d28gaW50ZXJ2YWxzIGkxIGFuZCBpMiBhcmUgZGlzam9pbnQsIG9yIHRoZSBsZW5ndGggb2YgdGhlaXIgb3ZlcmxhcCBvdGhlcndpc2UuXHJcbiAgICBwcml2YXRlIF9jb21tb25JbnRlcnZhbExlbmd0aChpMXN0YXJ0OiBudW1iZXIsIGkxZW5kOiBudW1iZXIsIGkyc3RhcnQ6IG51bWJlciwgaTJlbmQ6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKGkxZW5kIDwgaTJzdGFydCB8fCBpMmVuZCA8IGkxc3RhcnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBNYXRoLm1pbihpMWVuZCwgaTJlbmQpIC0gTWF0aC5tYXgoaTFzdGFydCwgaTJzdGFydCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY29udGFjdFBvaW50U2NvcmVOb2RlKHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgY29uc3QgdXNlZFJlY3RhbmdsZXMgPSB0aGlzLnVzZWRSZWN0YW5nbGVzO1xyXG4gICAgICAgIGxldCBzY29yZSA9IDA7XHJcblxyXG4gICAgICAgIGlmICh4ID09PSAwIHx8IHggKyB3aWR0aCA9PT0gdGhpcy5iaW5XaWR0aCkge1xyXG4gICAgICAgICAgICBzY29yZSArPSBoZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh5ID09PSAwIHx8IHkgKyBoZWlnaHQgPT09IHRoaXMuYmluSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHNjb3JlICs9IHdpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcmVjdDogSVJlY3Q7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1c2VkUmVjdGFuZ2xlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICByZWN0ID0gdXNlZFJlY3RhbmdsZXNbaV07XHJcbiAgICAgICAgICAgIGlmIChyZWN0LnggPT09IHggKyB3aWR0aCB8fCByZWN0LnggKyByZWN0LndpZHRoID09PSB4KSB7XHJcbiAgICAgICAgICAgICAgICBzY29yZSArPSB0aGlzLl9jb21tb25JbnRlcnZhbExlbmd0aChyZWN0LnksIHJlY3QueSArIHJlY3QuaGVpZ2h0LCB5LCB5ICsgaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVjdC55ID09PSB5ICsgaGVpZ2h0IHx8IHJlY3QueSArIHJlY3QuaGVpZ2h0ID09PSB5KSB7XHJcbiAgICAgICAgICAgICAgICBzY29yZSArPSB0aGlzLl9jb21tb25JbnRlcnZhbExlbmd0aChyZWN0LngsIHJlY3QueCArIHJlY3Qud2lkdGgsIHgsIHggKyB3aWR0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNjb3JlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2ZpbmRQb3NpdGlvbkZvck5ld05vZGVDb250YWN0UG9pbnQod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGJlc3RDb250YWN0U2NvcmU6IHsgdmFsdWU6IG51bWJlciB9KTogSVJlY3Qge1xyXG4gICAgICAgIGNvbnN0IGZyZWVSZWN0YW5nbGVzID0gdGhpcy5mcmVlUmVjdGFuZ2xlcztcclxuICAgICAgICBjb25zdCBiZXN0Tm9kZSA9IG5ldyBSZWN0KCk7XHJcblxyXG4gICAgICAgIGJlc3RDb250YWN0U2NvcmUudmFsdWUgPSAtMTtcclxuXHJcbiAgICAgICAgbGV0IHJlY3Q6IElSZWN0O1xyXG4gICAgICAgIGxldCBzY29yZTogbnVtYmVyO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZnJlZVJlY3RhbmdsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgcmVjdCA9IGZyZWVSZWN0YW5nbGVzW2ldO1xyXG4gICAgICAgICAgICAvLyBUcnkgdG8gcGxhY2UgdGhlIFJlY3RhbmdsZSBpbiB1cHJpZ2h0IChub24tZmxpcHBlZCkgb3JpZW50YXRpb24uXHJcbiAgICAgICAgICAgIGlmIChyZWN0LndpZHRoID49IHdpZHRoICYmIHJlY3QuaGVpZ2h0ID49IGhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgc2NvcmUgPSB0aGlzLl9jb250YWN0UG9pbnRTY29yZU5vZGUocmVjdC54LCByZWN0LnksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNjb3JlID4gYmVzdENvbnRhY3RTY29yZS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLnggPSByZWN0Lng7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUueSA9IHJlY3QueTtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0g5L+d5oyB5LiOIEpTIOeJiOacrOS4gOiHtFxyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RDb250YWN0U2NvcmUgPSBzY29yZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5hbGxvd1JvdGF0ZSAmJiByZWN0LndpZHRoID49IGhlaWdodCAmJiByZWN0LmhlaWdodCA+PSB3aWR0aCkge1xyXG4gICAgICAgICAgICAgICAgc2NvcmUgPSB0aGlzLl9jb250YWN0UG9pbnRTY29yZU5vZGUocmVjdC54LCByZWN0LnksIGhlaWdodCwgd2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNjb3JlID4gYmVzdENvbnRhY3RTY29yZS52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3ROb2RlLnggPSByZWN0Lng7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE5vZGUueSA9IHJlY3QueTtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS53aWR0aCA9IGhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Tm9kZS5oZWlnaHQgPSB3aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0Q29udGFjdFNjb3JlLnZhbHVlID0gc2NvcmU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGJlc3ROb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX3NwbGl0RnJlZU5vZGUoZnJlZU5vZGU6IElSZWN0LCB1c2VkTm9kZTogSVJlY3QpOiBib29sZWFuIHtcclxuICAgICAgICBjb25zdCBmcmVlUmVjdGFuZ2xlcyA9IHRoaXMuZnJlZVJlY3RhbmdsZXM7XHJcbiAgICAgICAgLy8gVGVzdCB3aXRoIFNBVCBpZiB0aGUgUmVjdGFuZ2xlcyBldmVuIGludGVyc2VjdC5cclxuICAgICAgICBpZiAodXNlZE5vZGUueCA+PSBmcmVlTm9kZS54ICsgZnJlZU5vZGUud2lkdGggfHwgdXNlZE5vZGUueCArIHVzZWROb2RlLndpZHRoIDw9IGZyZWVOb2RlLnggfHxcclxuICAgICAgICAgICAgdXNlZE5vZGUueSA+PSBmcmVlTm9kZS55ICsgZnJlZU5vZGUuaGVpZ2h0IHx8IHVzZWROb2RlLnkgKyB1c2VkTm9kZS5oZWlnaHQgPD0gZnJlZU5vZGUueSkge1xyXG4gICAgICAgICAgICAvLyDmsqHmnInnm7jkuqTnmoTpg6jliIZcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgbmV3Tm9kZTogSVJlY3Q7XHJcblxyXG4gICAgICAgIGlmICh1c2VkTm9kZS55ID4gZnJlZU5vZGUueSAmJiB1c2VkTm9kZS55IDwgZnJlZU5vZGUueSArIGZyZWVOb2RlLmhlaWdodCkge1xyXG4gICAgICAgICAgICAvLyB1c2VkTm9kZSDpobbpg6jljIXlkKvlnKggZnJlZU5vZGUg5Lit6Ze077yM6YKj5bCxIHVzZWROb2RlIOS4iui+ueaLhuWHuiBuZXdOb2Rl44CCXHJcbiAgICAgICAgICAgIG5ld05vZGUgPSBmcmVlTm9kZS5jbG9uZSgpO1xyXG4gICAgICAgICAgICBuZXdOb2RlLmhlaWdodCA9IHVzZWROb2RlLnkgLSBmcmVlTm9kZS55O1xyXG4gICAgICAgICAgICBmcmVlUmVjdGFuZ2xlcy5wdXNoKG5ld05vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTmV3IG5vZGUgYXQgdGhlIGJvdHRvbSBzaWRlIG9mIHRoZSB1c2VkIG5vZGUuXHJcbiAgICAgICAgaWYgKHVzZWROb2RlLnkgKyB1c2VkTm9kZS5oZWlnaHQgPCBmcmVlTm9kZS55ICsgZnJlZU5vZGUuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIG5ld05vZGUgPSBmcmVlTm9kZS5jbG9uZSgpO1xyXG4gICAgICAgICAgICBuZXdOb2RlLnkgPSB1c2VkTm9kZS55ICsgdXNlZE5vZGUuaGVpZ2h0O1xyXG4gICAgICAgICAgICBuZXdOb2RlLmhlaWdodCA9IGZyZWVOb2RlLnkgKyBmcmVlTm9kZS5oZWlnaHQgLSBuZXdOb2RlLnk7XHJcbiAgICAgICAgICAgIGZyZWVSZWN0YW5nbGVzLnB1c2gobmV3Tm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBOZXcgbm9kZSBhdCB0aGUgbGVmdCBzaWRlIG9mIHRoZSB1c2VkIG5vZGUuXHJcbiAgICAgICAgaWYgKHVzZWROb2RlLnggPiBmcmVlTm9kZS54ICYmIHVzZWROb2RlLnggPCBmcmVlTm9kZS54ICsgZnJlZU5vZGUud2lkdGgpIHtcclxuICAgICAgICAgICAgbmV3Tm9kZSA9IGZyZWVOb2RlLmNsb25lKCk7XHJcbiAgICAgICAgICAgIG5ld05vZGUud2lkdGggPSB1c2VkTm9kZS54IC0gZnJlZU5vZGUueDtcclxuICAgICAgICAgICAgZnJlZVJlY3RhbmdsZXMucHVzaChuZXdOb2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5ldyBub2RlIGF0IHRoZSByaWdodCBzaWRlIG9mIHRoZSB1c2VkIG5vZGUuXHJcbiAgICAgICAgaWYgKHVzZWROb2RlLnggKyB1c2VkTm9kZS53aWR0aCA8IGZyZWVOb2RlLnggKyBmcmVlTm9kZS53aWR0aCkge1xyXG4gICAgICAgICAgICBuZXdOb2RlID0gZnJlZU5vZGUuY2xvbmUoKTtcclxuICAgICAgICAgICAgbmV3Tm9kZS54ID0gdXNlZE5vZGUueCArIHVzZWROb2RlLndpZHRoO1xyXG4gICAgICAgICAgICBuZXdOb2RlLndpZHRoID0gZnJlZU5vZGUueCArIGZyZWVOb2RlLndpZHRoIC0gbmV3Tm9kZS54O1xyXG4gICAgICAgICAgICBmcmVlUmVjdGFuZ2xlcy5wdXNoKG5ld05vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfcHJ1bmVGcmVlTGlzdCgpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBmcmVlUmVjdGFuZ2xlcyA9IHRoaXMuZnJlZVJlY3RhbmdsZXM7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmVlUmVjdGFuZ2xlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCBmcmVlUmVjdGFuZ2xlcy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKFJlY3QuaXNDb250YWluZWRJbihmcmVlUmVjdGFuZ2xlc1tpXSwgZnJlZVJlY3RhbmdsZXNbal0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZnJlZVJlY3RhbmdsZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGktLTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChSZWN0LmlzQ29udGFpbmVkSW4oZnJlZVJlY3RhbmdsZXNbal0sIGZyZWVSZWN0YW5nbGVzW2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZyZWVSZWN0YW5nbGVzLnNwbGljZShqLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBqLS07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGhldXJpc3RpY3MgPSB7XHJcbiAgICAgICAgQmVzdFNob3J0U2lkZUZpdCxcclxuICAgICAgICBCZXN0TG9uZ1NpZGVGaXQsXHJcbiAgICAgICAgQmVzdEFyZWFGaXQsXHJcbiAgICAgICAgQm90dG9tTGVmdFJ1bGUsXHJcbiAgICAgICAgQ29udGFjdFBvaW50UnVsZSxcclxuICAgICAgICBMZWZ0b3ZlckFyZWEsXHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYXhSZWN0c0JpblBhY2s7XHJcbiJdfQ==