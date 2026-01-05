import { Fixed32 } from '../src/Fixed32';
import { FixedVector2 } from '../src/FixedVector2';

describe('FixedVector2', () => {
    describe('创建和转换', () => {
        test('from 应正确从浮点数创建', () => {
            const v = FixedVector2.from(3, 4);
            const obj = v.toObject();
            expect(obj.x).toBeCloseTo(3, 4);
            expect(obj.y).toBeCloseTo(4, 4);
        });

        test('fromInt 应正确从整数创建', () => {
            const v = FixedVector2.fromInt(5, 6);
            expect(v.x.toInt()).toBe(5);
            expect(v.y.toInt()).toBe(6);
        });

        test('常量应正确', () => {
            expect(FixedVector2.ZERO.isZero()).toBe(true);
            expect(FixedVector2.ONE.x.toNumber()).toBe(1);
            expect(FixedVector2.ONE.y.toNumber()).toBe(1);
            expect(FixedVector2.RIGHT.x.toNumber()).toBe(1);
            expect(FixedVector2.RIGHT.y.toNumber()).toBe(0);
        });

        test('toRawObject 应返回原始值', () => {
            const v = FixedVector2.from(1, 2);
            const raw = v.toRawObject();
            expect(raw.x).toBe(Fixed32.from(1).toRaw());
            expect(raw.y).toBe(Fixed32.from(2).toRaw());
        });
    });

    describe('基础运算', () => {
        test('add 应正确计算', () => {
            const a = FixedVector2.from(1, 2);
            const b = FixedVector2.from(3, 4);
            const result = a.add(b).toObject();
            expect(result.x).toBeCloseTo(4, 4);
            expect(result.y).toBeCloseTo(6, 4);
        });

        test('sub 应正确计算', () => {
            const a = FixedVector2.from(5, 7);
            const b = FixedVector2.from(2, 3);
            const result = a.sub(b).toObject();
            expect(result.x).toBeCloseTo(3, 4);
            expect(result.y).toBeCloseTo(4, 4);
        });

        test('mul 应正确计算标量乘法', () => {
            const v = FixedVector2.from(3, 4);
            const result = v.mul(Fixed32.from(2)).toObject();
            expect(result.x).toBeCloseTo(6, 4);
            expect(result.y).toBeCloseTo(8, 4);
        });

        test('div 应正确计算标量除法', () => {
            const v = FixedVector2.from(6, 8);
            const result = v.div(Fixed32.from(2)).toObject();
            expect(result.x).toBeCloseTo(3, 4);
            expect(result.y).toBeCloseTo(4, 4);
        });

        test('neg 应正确取反', () => {
            const v = FixedVector2.from(3, -4);
            const result = v.neg().toObject();
            expect(result.x).toBeCloseTo(-3, 4);
            expect(result.y).toBeCloseTo(4, 4);
        });
    });

    describe('向量运算', () => {
        test('dot 应正确计算点积', () => {
            const a = FixedVector2.from(1, 2);
            const b = FixedVector2.from(3, 4);
            // 1*3 + 2*4 = 11
            expect(a.dot(b).toNumber()).toBeCloseTo(11, 4);
        });

        test('cross 应正确计算叉积', () => {
            const a = FixedVector2.from(1, 0);
            const b = FixedVector2.from(0, 1);
            // 1*1 - 0*0 = 1
            expect(a.cross(b).toNumber()).toBeCloseTo(1, 4);
        });

        test('length 应正确计算', () => {
            const v = FixedVector2.from(3, 4);
            expect(v.length().toNumber()).toBeCloseTo(5, 3);
        });

        test('lengthSquared 应正确计算', () => {
            const v = FixedVector2.from(3, 4);
            expect(v.lengthSquared().toNumber()).toBeCloseTo(25, 4);
        });

        test('normalize 应正确归一化', () => {
            const v = FixedVector2.from(3, 4);
            const n = v.normalize();
            expect(n.length().toNumber()).toBeCloseTo(1, 2);
            expect(n.x.toNumber()).toBeCloseTo(0.6, 2);
            expect(n.y.toNumber()).toBeCloseTo(0.8, 2);
        });

        test('normalize 零向量应返回零向量', () => {
            const v = FixedVector2.ZERO;
            const n = v.normalize();
            expect(n.isZero()).toBe(true);
        });

        test('distanceTo 应正确计算', () => {
            const a = FixedVector2.from(0, 0);
            const b = FixedVector2.from(3, 4);
            expect(a.distanceTo(b).toNumber()).toBeCloseTo(5, 3);
        });

        test('perpendicular 应正确计算', () => {
            const v = FixedVector2.from(1, 0);
            const perp = v.perpendicular();
            // 顺时针 90 度: (1, 0) -> (0, -1)
            expect(perp.x.toNumber()).toBeCloseTo(0, 4);
            expect(perp.y.toNumber()).toBeCloseTo(-1, 4);
        });
    });

    describe('旋转和角度', () => {
        test('rotate 应正确旋转', () => {
            const v = FixedVector2.from(1, 0);
            const angle = Fixed32.HALF_PI; // 90 度
            const rotated = v.rotate(angle);
            // 顺时针旋转 90 度: (1, 0) -> (0, -1)
            expect(rotated.x.toNumber()).toBeCloseTo(0, 2);
            expect(rotated.y.toNumber()).toBeCloseTo(-1, 2);
        });

        test('angle 应正确计算', () => {
            const v = FixedVector2.from(1, 0);
            expect(v.angle().toNumber()).toBeCloseTo(0, 3);

            const v2 = FixedVector2.from(0, 1);
            expect(v2.angle().toNumber()).toBeCloseTo(Math.PI / 2, 2);
        });

        test('fromAngle 应正确创建', () => {
            const v = FixedVector2.fromAngle(Fixed32.ZERO);
            expect(v.x.toNumber()).toBeCloseTo(1, 3);
            expect(v.y.toNumber()).toBeCloseTo(0, 3);
        });

        test('fromPolar 应正确创建', () => {
            const v = FixedVector2.fromPolar(Fixed32.from(5), Fixed32.ZERO);
            expect(v.x.toNumber()).toBeCloseTo(5, 3);
            expect(v.y.toNumber()).toBeCloseTo(0, 3);
        });
    });

    describe('插值和限制', () => {
        test('lerp 应正确插值', () => {
            const a = FixedVector2.from(0, 0);
            const b = FixedVector2.from(10, 20);
            const result = a.lerp(b, Fixed32.HALF).toObject();
            expect(result.x).toBeCloseTo(5, 4);
            expect(result.y).toBeCloseTo(10, 4);
        });

        test('clampLength 应正确限制长度', () => {
            const v = FixedVector2.from(6, 8); // 长度 10
            const clamped = v.clampLength(Fixed32.from(5));
            expect(clamped.length().toNumber()).toBeCloseTo(5, 2);
        });

        test('moveTowards 应正确移动', () => {
            const a = FixedVector2.from(0, 0);
            const b = FixedVector2.from(10, 0);
            const result = a.moveTowards(b, Fixed32.from(3));
            expect(result.x.toNumber()).toBeCloseTo(3, 3);
            expect(result.y.toNumber()).toBeCloseTo(0, 3);
        });
    });

    describe('比较运算', () => {
        test('equals 应正确比较', () => {
            const a = FixedVector2.from(3, 4);
            const b = FixedVector2.from(3, 4);
            const c = FixedVector2.from(3, 5);
            expect(a.equals(b)).toBe(true);
            expect(a.equals(c)).toBe(false);
        });

        test('isZero 应正确判断', () => {
            expect(FixedVector2.ZERO.isZero()).toBe(true);
            expect(FixedVector2.ONE.isZero()).toBe(false);
        });
    });

    describe('确定性', () => {
        test('向量运算应产生确定性结果', () => {
            const results: string[] = [];
            for (let i = 0; i < 100; i++) {
                const a = FixedVector2.from(3.14159, 2.71828);
                const b = FixedVector2.from(1.41421, 1.73205);
                const result = a.add(b).mul(Fixed32.from(0.5)).normalize();
                results.push(`${result.x.toRaw()},${result.y.toRaw()}`);
            }
            expect(new Set(results).size).toBe(1);
        });

        test('旋转应产生确定性结果', () => {
            const results: string[] = [];
            for (let i = 0; i < 100; i++) {
                const v = FixedVector2.from(1, 0);
                const angle = Fixed32.from(0.7853981634); // π/4
                const rotated = v.rotate(angle);
                results.push(`${rotated.x.toRaw()},${rotated.y.toRaw()}`);
            }
            expect(new Set(results).size).toBe(1);
        });
    });

    describe('静态方法', () => {
        test('distance 应正确计算', () => {
            const a = FixedVector2.from(0, 0);
            const b = FixedVector2.from(3, 4);
            expect(FixedVector2.distance(a, b).toNumber()).toBeCloseTo(5, 3);
        });

        test('min/max 应正确计算', () => {
            const a = FixedVector2.from(1, 5);
            const b = FixedVector2.from(3, 2);

            const min = FixedVector2.min(a, b);
            expect(min.x.toNumber()).toBeCloseTo(1, 4);
            expect(min.y.toNumber()).toBeCloseTo(2, 4);

            const max = FixedVector2.max(a, b);
            expect(max.x.toNumber()).toBeCloseTo(3, 4);
            expect(max.y.toNumber()).toBeCloseTo(5, 4);
        });
    });
});
