export interface IRect {
    x: number;
    y: number;
    width: number;
    height: number;
    rotated?: boolean;
    clone(): IRect;
}
/**
 * MaxRectanglesBinPack
 */
declare class MaxRectsBinPack {
    binWidth: number;
    binHeight: number;
    allowRotate: boolean;
    usedRectangles: IRect[];
    freeRectangles: IRect[];
    constructor(width: number, height: number, allowRotate?: boolean);
    /**
     * Init
     */
    init(width: number, height: number, allowRotate: boolean): void;
    /**
     * Insert a set of rectangles
     * @param rectangles
     * @param method 0~4
     * @return success inserted rectangles
     */
    insertRects(rectangles: IRect[], method: number): IRect[];
    private _placeRectangle;
    private _scoreRectangle;
    private _findPositionForNewNodeBottomLeft;
    private _findPositionForNewNodeBestShortSideFit;
    private _findPositionForNewNodeBestLongSideFit;
    private _findPositionForNewNodeBestAreaFit;
    private _findPositionForNewNodeLeftoverArea;
    private _commonIntervalLength;
    private _contactPointScoreNode;
    private _findPositionForNewNodeContactPoint;
    private _splitFreeNode;
    private _pruneFreeList;
    static heuristics: {
        BestShortSideFit: number;
        BestLongSideFit: number;
        BestAreaFit: number;
        BottomLeftRule: number;
        ContactPointRule: number;
        LeftoverArea: number;
    };
}
export default MaxRectsBinPack;
