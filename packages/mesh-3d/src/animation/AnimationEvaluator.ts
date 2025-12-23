/**
 * AnimationEvaluator - Utility for evaluating animation clips.
 * AnimationEvaluator - 动画片段评估工具。
 */

import type { IGLTFAnimationClip, IAnimationSampler, IAnimationChannel } from '@esengine/asset-system';

/**
 * Animation channel target path types.
 * 动画通道目标路径类型。
 */
export type AnimationTargetPath = 'translation' | 'rotation' | 'scale' | 'weights';

/**
 * Evaluated animation value.
 * 评估后的动画值。
 */
export interface EvaluatedValue {
    /** Target path (translation, rotation, scale, weights). | 目标路径。 */
    path: AnimationTargetPath;
    /** Evaluated value (vec3, quat, or morph weights). | 评估后的值。 */
    value: number[];
}

/**
 * Animation clip evaluator.
 * 动画片段评估器。
 *
 * Samples animation channels at a given time and returns interpolated values.
 * 在给定时间采样动画通道并返回插值后的值。
 */
export class AnimationEvaluator {
    /**
     * Evaluate animation clip at a given time.
     * 在给定时间评估动画片段。
     *
     * @param clip - Animation clip to evaluate. | 要评估的动画片段。
     * @param time - Time in seconds. | 时间（秒）。
     * @returns Map of node index to evaluated values. | 节点索引到评估值的映射。
     */
    public evaluate(clip: IGLTFAnimationClip, time: number): Map<number, EvaluatedValue> {
        const result = new Map<number, EvaluatedValue>();

        // Clamp time to clip duration
        // 将时间限制在片段持续时间内
        const sampleTime = Math.max(0, Math.min(time, clip.duration));

        for (const channel of clip.channels) {
            const sampler = clip.samplers[channel.samplerIndex];
            if (!sampler) continue;

            const value = this.sampleChannel(sampler, channel.target.path, sampleTime);
            if (value) {
                result.set(channel.target.nodeIndex, {
                    path: channel.target.path,
                    value
                });
            }
        }

        return result;
    }

    /**
     * Sample a single animation channel.
     * 采样单个动画通道。
     */
    private sampleChannel(
        sampler: IAnimationSampler,
        path: AnimationTargetPath,
        time: number
    ): number[] | null {
        const { input, output, interpolation } = sampler;

        if (!input || !output || input.length === 0) {
            return null;
        }

        // Find keyframe index
        // 查找关键帧索引
        const frameIndex = this.findKeyframe(input, time);

        // Components per value
        // 每个值的分量数
        // rotation = 4 (quaternion), translation/scale = 3 (vec3), weights = variable
        // 旋转 = 4（四元数），平移/缩放 = 3（vec3），权重 = 可变
        let componentCount: number;
        if (path === 'rotation') {
            componentCount = 4;
        } else if (path === 'weights') {
            // For morph targets, infer from output length / input length
            // 对于变形目标，从输出长度 / 输入长度推断
            componentCount = input.length > 0 ? Math.floor(output.length / input.length) : 1;
        } else {
            componentCount = 3;
        }

        // Handle edge cases
        // 处理边界情况
        if (frameIndex <= 0) {
            return this.getOutputValue(output, 0, componentCount);
        }

        if (frameIndex >= input.length) {
            return this.getOutputValue(output, input.length - 1, componentCount);
        }

        // Get surrounding keyframes
        // 获取周围的关键帧
        const prevIndex = frameIndex - 1;
        const nextIndex = frameIndex;
        const prevTime = input[prevIndex];
        const nextTime = input[nextIndex];

        // Calculate interpolation factor
        // 计算插值因子
        const duration = nextTime - prevTime;
        const t = duration > 0 ? (time - prevTime) / duration : 0;

        // Get values
        // 获取值
        const prevValue = this.getOutputValue(output, prevIndex, componentCount);
        const nextValue = this.getOutputValue(output, nextIndex, componentCount);

        if (!prevValue || !nextValue) {
            return null;
        }

        // Interpolate
        // 插值
        switch (interpolation) {
            case 'STEP':
                return prevValue;

            case 'LINEAR':
                if (path === 'rotation') {
                    return this.slerp(prevValue, nextValue, t);
                } else {
                    // translation, scale, weights all use linear interpolation
                    // 平移、缩放、权重都使用线性插值
                    return this.lerp(prevValue, nextValue, t);
                }

            case 'CUBICSPLINE':
                // For cubicspline, output has 3 values per keyframe: in-tangent, value, out-tangent
                // 对于三次样条，输出每个关键帧有 3 个值：入切线、值、出切线
                // Simplified: just use linear for now
                // 简化：暂时只使用线性
                if (path === 'rotation') {
                    return this.slerp(prevValue, nextValue, t);
                } else {
                    return this.lerp(prevValue, nextValue, t);
                }

            default:
                return prevValue;
        }
    }

    /**
     * Find keyframe index for given time using binary search.
     * 使用二分查找为给定时间查找关键帧索引。
     *
     * Returns the index of the first keyframe with time > input time.
     * 返回第一个时间 > 输入时间的关键帧索引。
     */
    private findKeyframe(input: Float32Array, time: number): number {
        let low = 0;
        let high = input.length;

        while (low < high) {
            const mid = (low + high) >>> 1;
            if (input[mid] <= time) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        return low;
    }

    /**
     * Get output value at keyframe index.
     * 获取关键帧索引处的输出值。
     */
    private getOutputValue(output: Float32Array, index: number, componentCount: number): number[] {
        const offset = index * componentCount;
        const result: number[] = [];

        for (let i = 0; i < componentCount; i++) {
            result.push(output[offset + i] ?? 0);
        }

        return result;
    }

    /**
     * Linear interpolation for vec3.
     * vec3 的线性插值。
     */
    private lerp(a: number[], b: number[], t: number): number[] {
        const result: number[] = [];
        for (let i = 0; i < a.length; i++) {
            result.push(a[i] + (b[i] - a[i]) * t);
        }
        return result;
    }

    /**
     * Spherical linear interpolation for quaternion.
     * 四元数的球面线性插值。
     */
    private slerp(a: number[], b: number[], t: number): number[] {
        // Normalize quaternions
        // 归一化四元数
        const ax = a[0], ay = a[1], az = a[2], aw = a[3];
        let bx = b[0], by = b[1], bz = b[2], bw = b[3];

        // Calculate angle between quaternions
        // 计算四元数之间的角度
        let dot = ax * bx + ay * by + az * bz + aw * bw;

        // Negate b if dot product is negative (to take shorter path)
        // 如果点积为负则取反 b（取较短路径）
        if (dot < 0) {
            bx = -bx;
            by = -by;
            bz = -bz;
            bw = -bw;
            dot = -dot;
        }

        // If very close, use linear interpolation
        // 如果非常接近，使用线性插值
        if (dot > 0.9995) {
            return this.normalizeQuat([
                ax + (bx - ax) * t,
                ay + (by - ay) * t,
                az + (bz - az) * t,
                aw + (bw - aw) * t
            ]);
        }

        // Calculate slerp
        // 计算球面线性插值
        const theta0 = Math.acos(dot);
        const theta = theta0 * t;
        const sinTheta = Math.sin(theta);
        const sinTheta0 = Math.sin(theta0);

        const s0 = Math.cos(theta) - dot * sinTheta / sinTheta0;
        const s1 = sinTheta / sinTheta0;

        return [
            ax * s0 + bx * s1,
            ay * s0 + by * s1,
            az * s0 + bz * s1,
            aw * s0 + bw * s1
        ];
    }

    /**
     * Normalize quaternion.
     * 归一化四元数。
     */
    private normalizeQuat(q: number[]): number[] {
        const len = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
        if (len === 0) {
            return [0, 0, 0, 1];
        }
        const inv = 1 / len;
        return [q[0] * inv, q[1] * inv, q[2] * inv, q[3] * inv];
    }
}
