import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TokenBucketStrategy, createTokenBucketStrategy } from '../strategies/TokenBucket';
import { SlidingWindowStrategy, createSlidingWindowStrategy } from '../strategies/SlidingWindow';
import { FixedWindowStrategy, createFixedWindowStrategy } from '../strategies/FixedWindow';

describe('TokenBucketStrategy', () => {
    let strategy: TokenBucketStrategy;

    beforeEach(() => {
        strategy = createTokenBucketStrategy({
            rate: 10,
            capacity: 20
        });
    });

    describe('consume', () => {
        it('should allow requests when tokens available', () => {
            const result = strategy.consume('user-1');
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(19);
        });

        it('should consume multiple tokens', () => {
            const result = strategy.consume('user-1', 5);
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(15);
        });

        it('should deny when not enough tokens', () => {
            for (let i = 0; i < 20; i++) {
                strategy.consume('user-1');
            }

            const result = strategy.consume('user-1');
            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
            expect(result.retryAfter).toBeGreaterThan(0);
        });

        it('should refill tokens over time', async () => {
            for (let i = 0; i < 20; i++) {
                strategy.consume('user-1');
            }

            await new Promise(resolve => setTimeout(resolve, 150));

            const result = strategy.consume('user-1');
            expect(result.allowed).toBe(true);
        });

        it('should handle different keys independently', () => {
            for (let i = 0; i < 20; i++) {
                strategy.consume('user-1');
            }

            const result1 = strategy.consume('user-1');
            const result2 = strategy.consume('user-2');

            expect(result1.allowed).toBe(false);
            expect(result2.allowed).toBe(true);
        });
    });

    describe('getStatus', () => {
        it('should return full capacity for new key', () => {
            const status = strategy.getStatus('new-user');
            expect(status.remaining).toBe(20);
            expect(status.allowed).toBe(true);
        });

        it('should not consume tokens', () => {
            strategy.getStatus('user-1');
            const status = strategy.getStatus('user-1');
            expect(status.remaining).toBe(20);
        });
    });

    describe('reset', () => {
        it('should reset key to full capacity', () => {
            for (let i = 0; i < 15; i++) {
                strategy.consume('user-1');
            }

            strategy.reset('user-1');

            const status = strategy.getStatus('user-1');
            expect(status.remaining).toBe(20);
        });
    });

    describe('cleanup', () => {
        it('should clean up full buckets', async () => {
            strategy.consume('user-1');

            await new Promise(resolve => setTimeout(resolve, 100));

            strategy.cleanup();
        });
    });
});

describe('SlidingWindowStrategy', () => {
    let strategy: SlidingWindowStrategy;

    beforeEach(() => {
        strategy = createSlidingWindowStrategy({
            rate: 10,
            capacity: 10
        });
    });

    describe('consume', () => {
        it('should allow requests within capacity', () => {
            const result = strategy.consume('user-1');
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(9);
        });

        it('should deny when capacity exceeded', () => {
            for (let i = 0; i < 10; i++) {
                strategy.consume('user-1');
            }

            const result = strategy.consume('user-1');
            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
        });

        it('should allow after window expires', async () => {
            for (let i = 0; i < 10; i++) {
                strategy.consume('user-1');
            }

            await new Promise(resolve => setTimeout(resolve, 1100));

            const result = strategy.consume('user-1');
            expect(result.allowed).toBe(true);
        });
    });

    describe('getStatus', () => {
        it('should return full capacity for new key', () => {
            const status = strategy.getStatus('new-user');
            expect(status.remaining).toBe(10);
            expect(status.allowed).toBe(true);
        });
    });

    describe('reset', () => {
        it('should clear timestamps', () => {
            for (let i = 0; i < 5; i++) {
                strategy.consume('user-1');
            }

            strategy.reset('user-1');

            const status = strategy.getStatus('user-1');
            expect(status.remaining).toBe(10);
        });
    });
});

describe('FixedWindowStrategy', () => {
    let strategy: FixedWindowStrategy;

    beforeEach(() => {
        strategy = createFixedWindowStrategy({
            rate: 10,
            capacity: 10
        });
    });

    describe('consume', () => {
        it('should allow requests within capacity', () => {
            const result = strategy.consume('user-1');
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(9);
        });

        it('should deny when capacity exceeded', () => {
            for (let i = 0; i < 10; i++) {
                strategy.consume('user-1');
            }

            const result = strategy.consume('user-1');
            expect(result.allowed).toBe(false);
            expect(result.retryAfter).toBeGreaterThanOrEqual(0);
        });

        it('should reset at window boundary', async () => {
            for (let i = 0; i < 10; i++) {
                strategy.consume('user-1');
            }

            await new Promise(resolve => setTimeout(resolve, 1100));

            const result = strategy.consume('user-1');
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(9);
        });
    });

    describe('getStatus', () => {
        it('should return full capacity for new key', () => {
            const status = strategy.getStatus('new-user');
            expect(status.remaining).toBe(10);
        });
    });

    describe('reset', () => {
        it('should reset count', () => {
            for (let i = 0; i < 5; i++) {
                strategy.consume('user-1');
            }

            strategy.reset('user-1');

            const status = strategy.getStatus('user-1');
            expect(status.remaining).toBe(10);
        });
    });

    describe('cleanup', () => {
        it('should clean up old windows', async () => {
            strategy.consume('user-1');

            await new Promise(resolve => setTimeout(resolve, 2100));

            strategy.cleanup();
        });
    });
});

describe('Factory functions', () => {
    it('createTokenBucketStrategy should create TokenBucketStrategy', () => {
        const strategy = createTokenBucketStrategy({ rate: 5, capacity: 10 });
        expect(strategy.name).toBe('token-bucket');
    });

    it('createSlidingWindowStrategy should create SlidingWindowStrategy', () => {
        const strategy = createSlidingWindowStrategy({ rate: 5, capacity: 5 });
        expect(strategy.name).toBe('sliding-window');
    });

    it('createFixedWindowStrategy should create FixedWindowStrategy', () => {
        const strategy = createFixedWindowStrategy({ rate: 5, capacity: 5 });
        expect(strategy.name).toBe('fixed-window');
    });
});
