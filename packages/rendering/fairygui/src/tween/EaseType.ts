/**
 * Easing function types
 * 缓动函数类型
 */
export const enum EEaseType {
    Linear = 0,
    SineIn = 1,
    SineOut = 2,
    SineInOut = 3,
    QuadIn = 4,
    QuadOut = 5,
    QuadInOut = 6,
    CubicIn = 7,
    CubicOut = 8,
    CubicInOut = 9,
    QuartIn = 10,
    QuartOut = 11,
    QuartInOut = 12,
    QuintIn = 13,
    QuintOut = 14,
    QuintInOut = 15,
    ExpoIn = 16,
    ExpoOut = 17,
    ExpoInOut = 18,
    CircIn = 19,
    CircOut = 20,
    CircInOut = 21,
    ElasticIn = 22,
    ElasticOut = 23,
    ElasticInOut = 24,
    BackIn = 25,
    BackOut = 26,
    BackInOut = 27,
    BounceIn = 28,
    BounceOut = 29,
    BounceInOut = 30,
    Custom = 31
}

const PI = Math.PI;
const HALF_PI = PI / 2;

/**
 * Evaluate easing function
 * 计算缓动函数值
 */
export function evaluateEase(
    easeType: EEaseType,
    time: number,
    duration: number,
    overshootOrAmplitude: number = 1.70158,
    period: number = 0
): number {
    if (duration <= 0) return 1;

    let t = time / duration;

    switch (easeType) {
        case EEaseType.Linear:
            return t;

        case EEaseType.SineIn:
            return -Math.cos(t * HALF_PI) + 1;

        case EEaseType.SineOut:
            return Math.sin(t * HALF_PI);

        case EEaseType.SineInOut:
            return -0.5 * (Math.cos(PI * t) - 1);

        case EEaseType.QuadIn:
            return t * t;

        case EEaseType.QuadOut:
            return -t * (t - 2);

        case EEaseType.QuadInOut:
            if ((t *= 2) < 1) return 0.5 * t * t;
            return -0.5 * (--t * (t - 2) - 1);

        case EEaseType.CubicIn:
            return t * t * t;

        case EEaseType.CubicOut:
            return (t -= 1) * t * t + 1;

        case EEaseType.CubicInOut:
            if ((t *= 2) < 1) return 0.5 * t * t * t;
            return 0.5 * ((t -= 2) * t * t + 2);

        case EEaseType.QuartIn:
            return t * t * t * t;

        case EEaseType.QuartOut:
            return -((t -= 1) * t * t * t - 1);

        case EEaseType.QuartInOut:
            if ((t *= 2) < 1) return 0.5 * t * t * t * t;
            return -0.5 * ((t -= 2) * t * t * t - 2);

        case EEaseType.QuintIn:
            return t * t * t * t * t;

        case EEaseType.QuintOut:
            return (t -= 1) * t * t * t * t + 1;

        case EEaseType.QuintInOut:
            if ((t *= 2) < 1) return 0.5 * t * t * t * t * t;
            return 0.5 * ((t -= 2) * t * t * t * t + 2);

        case EEaseType.ExpoIn:
            return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));

        case EEaseType.ExpoOut:
            return t === 1 ? 1 : -Math.pow(2, -10 * t) + 1;

        case EEaseType.ExpoInOut:
            if (t === 0) return 0;
            if (t === 1) return 1;
            if ((t *= 2) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
            return 0.5 * (-Math.pow(2, -10 * --t) + 2);

        case EEaseType.CircIn:
            return -(Math.sqrt(1 - t * t) - 1);

        case EEaseType.CircOut:
            return Math.sqrt(1 - (t -= 1) * t);

        case EEaseType.CircInOut:
            if ((t *= 2) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
            return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);

        case EEaseType.ElasticIn: {
            if (t === 0) return 0;
            if (t === 1) return 1;
            if (period === 0) period = duration * 0.3;
            let s: number;
            if (overshootOrAmplitude < 1) {
                overshootOrAmplitude = 1;
                s = period / 4;
            } else {
                s = (period / (2 * PI)) * Math.asin(1 / overshootOrAmplitude);
            }
            return -(
                overshootOrAmplitude *
                Math.pow(2, 10 * (t -= 1)) *
                Math.sin(((t * duration - s) * (2 * PI)) / period)
            );
        }

        case EEaseType.ElasticOut: {
            if (t === 0) return 0;
            if (t === 1) return 1;
            if (period === 0) period = duration * 0.3;
            let s: number;
            if (overshootOrAmplitude < 1) {
                overshootOrAmplitude = 1;
                s = period / 4;
            } else {
                s = (period / (2 * PI)) * Math.asin(1 / overshootOrAmplitude);
            }
            return (
                overshootOrAmplitude *
                    Math.pow(2, -10 * t) *
                    Math.sin(((t * duration - s) * (2 * PI)) / period) +
                1
            );
        }

        case EEaseType.ElasticInOut: {
            if (t === 0) return 0;
            if ((t *= 2) === 2) return 1;
            if (period === 0) period = duration * 0.45;
            let s: number;
            if (overshootOrAmplitude < 1) {
                overshootOrAmplitude = 1;
                s = period / 4;
            } else {
                s = (period / (2 * PI)) * Math.asin(1 / overshootOrAmplitude);
            }
            if (t < 1) {
                return (
                    -0.5 *
                    (overshootOrAmplitude *
                        Math.pow(2, 10 * (t -= 1)) *
                        Math.sin(((t * duration - s) * (2 * PI)) / period))
                );
            }
            return (
                overshootOrAmplitude *
                    Math.pow(2, -10 * (t -= 1)) *
                    Math.sin(((t * duration - s) * (2 * PI)) / period) *
                    0.5 +
                1
            );
        }

        case EEaseType.BackIn:
            return t * t * ((overshootOrAmplitude + 1) * t - overshootOrAmplitude);

        case EEaseType.BackOut:
            return (t -= 1) * t * ((overshootOrAmplitude + 1) * t + overshootOrAmplitude) + 1;

        case EEaseType.BackInOut:
            if ((t *= 2) < 1) {
                return 0.5 * (t * t * (((overshootOrAmplitude *= 1.525) + 1) * t - overshootOrAmplitude));
            }
            return 0.5 * ((t -= 2) * t * (((overshootOrAmplitude *= 1.525) + 1) * t + overshootOrAmplitude) + 2);

        case EEaseType.BounceIn:
            return 1 - bounceOut(1 - t);

        case EEaseType.BounceOut:
            return bounceOut(t);

        case EEaseType.BounceInOut:
            if (t < 0.5) return (1 - bounceOut(1 - 2 * t)) * 0.5;
            return bounceOut(2 * t - 1) * 0.5 + 0.5;

        default:
            return t;
    }
}

function bounceOut(t: number): number {
    if (t < 1 / 2.75) {
        return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
        return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
        return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
}
