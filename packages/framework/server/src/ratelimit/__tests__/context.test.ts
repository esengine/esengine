import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimitContext } from '../context';
import { TokenBucketStrategy } from '../strategies/TokenBucket';
import { FixedWindowStrategy } from '../strategies/FixedWindow';

describe('RateLimitContext', () => {
    let globalStrategy: TokenBucketStrategy;
    let context: RateLimitContext;

    beforeEach(() => {
        globalStrategy = new TokenBucketStrategy({
            rate: 10,
            capacity: 20
        });
        context = new RateLimitContext('player-123', globalStrategy);
    });

    describe('check', () => {
        it('should check without consuming', () => {
            const result1 = context.check();
            const result2 = context.check();

            expect(result1.remaining).toBe(result2.remaining);
        });

        it('should use global strategy by default', () => {
            const result = context.check();
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(20);
        });
    });

    describe('consume', () => {
        it('should consume from global strategy', () => {
            const result = context.consume();
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(19);
        });

        it('should track consecutive limits', () => {
            for (let i = 0; i < 25; i++) {
                context.consume();
            }

            expect(context.consecutiveLimitCount).toBeGreaterThan(0);
        });

        it('should reset consecutive count on success', () => {
            // Consume all 20 tokens plus some more to trigger rate limiting
            for (let i = 0; i < 25; i++) {
                context.consume();
            }

            // After consuming 25 tokens (20 capacity), 5 should be rate limited
            expect(context.consecutiveLimitCount).toBeGreaterThan(0);

            context.reset();
            const result = context.consume();

            expect(result.allowed).toBe(true);
            expect(context.consecutiveLimitCount).toBe(0);
        });
    });

    describe('reset', () => {
        it('should reset global strategy', () => {
            for (let i = 0; i < 15; i++) {
                context.consume();
            }

            context.reset();

            const status = context.check();
            expect(status.remaining).toBe(20);
        });

        it('should reset specific message type', () => {
            const msgStrategy = new FixedWindowStrategy({ rate: 5, capacity: 5 });
            context.setMessageStrategy('Trade', msgStrategy);

            for (let i = 0; i < 5; i++) {
                context.consume('Trade');
            }

            context.reset('Trade');

            const status = context.check('Trade');
            expect(status.remaining).toBe(5);
        });
    });

    describe('message strategies', () => {
        it('should use message-specific strategy', () => {
            const tradeStrategy = new FixedWindowStrategy({ rate: 1, capacity: 1 });
            context.setMessageStrategy('Trade', tradeStrategy);

            const result1 = context.consume('Trade');
            expect(result1.allowed).toBe(true);

            const result2 = context.consume('Trade');
            expect(result2.allowed).toBe(false);
        });

        it('should fall back to global strategy for unknown types', () => {
            const result = context.consume('UnknownType');
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(19);
        });

        it('should check if message strategy exists', () => {
            expect(context.hasMessageStrategy('Trade')).toBe(false);

            const tradeStrategy = new FixedWindowStrategy({ rate: 1, capacity: 1 });
            context.setMessageStrategy('Trade', tradeStrategy);

            expect(context.hasMessageStrategy('Trade')).toBe(true);
        });

        it('should remove message strategy', () => {
            const tradeStrategy = new FixedWindowStrategy({ rate: 1, capacity: 1 });
            context.setMessageStrategy('Trade', tradeStrategy);

            context.removeMessageStrategy('Trade');

            expect(context.hasMessageStrategy('Trade')).toBe(false);
        });
    });

    describe('resetConsecutiveCount', () => {
        it('should reset consecutive limit count', () => {
            for (let i = 0; i < 25; i++) {
                context.consume();
            }

            expect(context.consecutiveLimitCount).toBeGreaterThan(0);

            context.resetConsecutiveCount();

            expect(context.consecutiveLimitCount).toBe(0);
        });
    });
});
