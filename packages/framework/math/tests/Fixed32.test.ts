import { Fixed32 } from '../src/Fixed32';
import { FixedMath } from '../src/FixedMath';

describe('Fixed32', () => {
    describe('创建和转换', () => {
        test('from 应正确从浮点数创建', () => {
            const a = Fixed32.from(3.5);
            expect(a.toNumber()).toBeCloseTo(3.5, 4);
        });

        test('fromInt 应正确从整数创建', () => {
            const a = Fixed32.fromInt(42);
            expect(a.toInt()).toBe(42);
            expect(a.toNumber()).toBe(42);
        });

        test('fromRaw 应正确从原始值创建', () => {
            const raw = 65536 * 2; // 2.0
            const a = Fixed32.fromRaw(raw);
            expect(a.toNumber()).toBe(2);
        });

        test('常量应正确', () => {
            expect(Fixed32.ZERO.toNumber()).toBe(0);
            expect(Fixed32.ONE.toNumber()).toBe(1);
            expect(Fixed32.HALF.toNumber()).toBe(0.5);
            expect(Fixed32.PI.toNumber()).toBeCloseTo(Math.PI, 3);
        });
    });

    describe('基础运算', () => {
        test('add 应正确计算', () => {
            const a = Fixed32.from(2.5);
            const b = Fixed32.from(1.5);
            expect(a.add(b).toNumber()).toBeCloseTo(4, 4);
        });

        test('sub 应正确计算', () => {
            const a = Fixed32.from(5);
            const b = Fixed32.from(3);
            expect(a.sub(b).toNumber()).toBeCloseTo(2, 4);
        });

        test('mul 应正确计算', () => {
            const a = Fixed32.from(3);
            const b = Fixed32.from(4);
            expect(a.mul(b).toNumber()).toBeCloseTo(12, 4);
        });

        test('mul 应正确处理小数', () => {
            const a = Fixed32.from(2.5);
            const b = Fixed32.from(1.5);
            expect(a.mul(b).toNumber()).toBeCloseTo(3.75, 4);
        });

        test('div 应正确计算', () => {
            const a = Fixed32.from(10);
            const b = Fixed32.from(4);
            expect(a.div(b).toNumber()).toBeCloseTo(2.5, 4);
        });

        test('div 应抛出除零错误', () => {
            const a = Fixed32.from(10);
            expect(() => a.div(Fixed32.ZERO)).toThrow('Division by zero');
        });

        test('neg 应正确取反', () => {
            const a = Fixed32.from(5);
            expect(a.neg().toNumber()).toBeCloseTo(-5, 4);
        });

        test('abs 应正确取绝对值', () => {
            const a = Fixed32.from(-5);
            expect(a.abs().toNumber()).toBeCloseTo(5, 4);
        });
    });

    describe('比较运算', () => {
        test('eq 应正确比较', () => {
            const a = Fixed32.from(5);
            const b = Fixed32.from(5);
            const c = Fixed32.from(6);
            expect(a.eq(b)).toBe(true);
            expect(a.eq(c)).toBe(false);
        });

        test('lt/le/gt/ge 应正确比较', () => {
            const a = Fixed32.from(3);
            const b = Fixed32.from(5);
            expect(a.lt(b)).toBe(true);
            expect(a.le(b)).toBe(true);
            expect(b.gt(a)).toBe(true);
            expect(b.ge(a)).toBe(true);
        });
    });

    describe('数学函数', () => {
        test('sqrt 应正确计算', () => {
            const a = Fixed32.from(16);
            expect(Fixed32.sqrt(a).toNumber()).toBeCloseTo(4, 3);

            const b = Fixed32.from(2);
            expect(Fixed32.sqrt(b).toNumber()).toBeCloseTo(Math.sqrt(2), 3);
        });

        test('floor/ceil/round 应正确计算', () => {
            const a = Fixed32.from(3.7);
            expect(Fixed32.floor(a).toNumber()).toBeCloseTo(3, 4);
            expect(Fixed32.ceil(a).toNumber()).toBeCloseTo(4, 4);
            expect(Fixed32.round(a).toNumber()).toBeCloseTo(4, 4);

            const b = Fixed32.from(3.2);
            expect(Fixed32.round(b).toNumber()).toBeCloseTo(3, 4);
        });

        test('min/max/clamp 应正确计算', () => {
            const a = Fixed32.from(3);
            const b = Fixed32.from(5);
            expect(Fixed32.min(a, b).toNumber()).toBe(3);
            expect(Fixed32.max(a, b).toNumber()).toBe(5);

            const x = Fixed32.from(7);
            expect(Fixed32.clamp(x, a, b).toNumber()).toBe(5);
        });

        test('lerp 应正确插值', () => {
            const a = Fixed32.from(0);
            const b = Fixed32.from(10);
            const t = Fixed32.from(0.5);
            expect(Fixed32.lerp(a, b, t).toNumber()).toBeCloseTo(5, 4);
        });
    });

    describe('确定性', () => {
        test('相同输入应产生相同输出', () => {
            const results: number[] = [];
            for (let i = 0; i < 100; i++) {
                const a = Fixed32.from(3.14159);
                const b = Fixed32.from(2.71828);
                const result = a.mul(b).add(Fixed32.sqrt(a)).toRaw();
                results.push(result);
            }
            // 所有结果应该完全相同
            expect(new Set(results).size).toBe(1);
        });
    });
});

describe('FixedMath', () => {
    describe('三角函数', () => {
        test('sin 应正确计算', () => {
            expect(FixedMath.sin(Fixed32.ZERO).toNumber()).toBeCloseTo(0, 3);
            expect(FixedMath.sin(Fixed32.HALF_PI).toNumber()).toBeCloseTo(1, 3);
            expect(FixedMath.sin(Fixed32.PI).toNumber()).toBeCloseTo(0, 2);
        });

        test('cos 应正确计算', () => {
            expect(FixedMath.cos(Fixed32.ZERO).toNumber()).toBeCloseTo(1, 3);
            expect(FixedMath.cos(Fixed32.HALF_PI).toNumber()).toBeCloseTo(0, 2);
            expect(FixedMath.cos(Fixed32.PI).toNumber()).toBeCloseTo(-1, 3);
        });

        test('sin²x + cos²x = 1', () => {
            const angles = [0, 0.5, 1, 1.5, 2, 2.5, 3];
            for (const a of angles) {
                const angle = Fixed32.from(a);
                const sin = FixedMath.sin(angle);
                const cos = FixedMath.cos(angle);
                const sum = sin.mul(sin).add(cos.mul(cos));
                expect(sum.toNumber()).toBeCloseTo(1, 2);
            }
        });

        test('atan2 应正确计算', () => {
            // atan2(0, 1) = 0
            expect(FixedMath.atan2(Fixed32.ZERO, Fixed32.ONE).toNumber()).toBeCloseTo(0, 3);

            // atan2(1, 0) = π/2
            expect(FixedMath.atan2(Fixed32.ONE, Fixed32.ZERO).toNumber()).toBeCloseTo(Math.PI / 2, 2);

            // atan2(1, 1) = π/4
            expect(FixedMath.atan2(Fixed32.ONE, Fixed32.ONE).toNumber()).toBeCloseTo(Math.PI / 4, 2);
        });
    });

    describe('角度函数', () => {
        test('radToDeg/degToRad 应正确转换', () => {
            const rad = Fixed32.PI;
            const deg = FixedMath.radToDeg(rad);
            expect(deg.toNumber()).toBeCloseTo(180, 1);

            const deg90 = Fixed32.from(90);
            const rad90 = FixedMath.degToRad(deg90);
            expect(rad90.toNumber()).toBeCloseTo(Math.PI / 2, 2);
        });

        test('normalizeAngle 应正确规范化', () => {
            const angle1 = Fixed32.from(Math.PI * 3); // 3π -> π
            expect(Math.abs(FixedMath.normalizeAngle(angle1).toNumber())).toBeLessThanOrEqual(Math.PI + 0.1);

            const angle2 = Fixed32.from(-Math.PI * 3); // -3π -> -π
            expect(Math.abs(FixedMath.normalizeAngle(angle2).toNumber())).toBeLessThanOrEqual(Math.PI + 0.1);
        });

        test('lerpAngle 应走最短路径', () => {
            const from = Fixed32.from(0.1);
            const to = Fixed32.from(-0.1);
            const t = Fixed32.HALF;
            const result = FixedMath.lerpAngle(from, to, t);
            expect(result.toNumber()).toBeCloseTo(0, 2);
        });
    });

    describe('确定性', () => {
        test('三角函数应产生确定性结果', () => {
            const results: number[] = [];
            for (let i = 0; i < 100; i++) {
                const angle = Fixed32.from(1.234);
                const result = FixedMath.sin(angle).toRaw();
                results.push(result);
            }
            expect(new Set(results).size).toBe(1);
        });
    });
});
