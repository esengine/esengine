/**
 * Blit area of each cube map face in the whole image.
 */
export type ISimpleLayout = Record<'top' | 'bottom' | 'left' | 'right' | 'front' | 'back', {
    x: number;
    y: number;
    width: number;
    height: number;
}>;
/**
 * NOTE: this table shall be only used for internal usage(testing).
 */
export declare const simpleLayoutTable: Array<[
    [
        number,
        number
    ],
    {
        front: [number, number];
        back: [number, number];
        top: [number, number];
        bottom: [number, number];
        right: [number, number];
        left: [number, number];
    }
]>;
/**
 * Given the width and height of an image. If it match the simple layout, returns the layout.
 * Returns `undefined` otherwise.
 * @param width Image width.
 * @param height Image height.
 */
export declare function matchSimpleLayout(width: number, height: number): ISimpleLayout | undefined;
