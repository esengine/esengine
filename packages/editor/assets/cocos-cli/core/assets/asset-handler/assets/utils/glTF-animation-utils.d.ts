import { GlTfAnimationInterpolation } from './glTF.constants';
import * as cc from 'cc';
import { ExoticAnimation } from 'cc/editor/exotic-animation';
type FloatArray = Float32Array | Float64Array;
export declare class GlTFTrsAnimationData {
    nodes: Record<string, GlTFNodeTrsAnimationData>;
    inputs: FloatArray[];
    addNodeAnimation(path: string): GlTFNodeTrsAnimationData;
    createExotic(): any;
}
declare class GlTFNodeTrsAnimationData {
    position: GlTFTrsTrackData | null;
    rotation: GlTFTrsTrackData | null;
    scale: GlTFTrsTrackData | null;
    setConstantPosition(v: cc.Vec3): void;
    setConstantRotation(v: cc.Quat): void;
    setConstantScale(v: cc.Vec3): void;
    emitExotic(exoticAnimation: ExoticAnimation, path: string): void;
}
export declare class GlTFTrsTrackData {
    interpolation: GlTfAnimationInterpolation;
    input: FloatArray;
    output: FloatArray;
    constructor(interpolation: GlTfAnimationInterpolation, input: FloatArray, output: FloatArray);
    toLinearVec3Curve(fps: number): {
        input: FloatArray;
        output: FloatArray;
    };
    toLinearQuatCurveNormalized(fps: number): {
        input: FloatArray;
        output: FloatArray;
    };
    toLinearQuatCurve(fps: number): {
        input: FloatArray;
        output: FloatArray;
    };
}
export {};
