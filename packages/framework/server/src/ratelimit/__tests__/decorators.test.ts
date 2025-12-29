import { describe, it, expect, beforeEach } from 'vitest';
import {
    rateLimit,
    noRateLimit,
    rateLimitMessage,
    noRateLimitMessage,
    getRateLimitMetadata,
    RATE_LIMIT_METADATA_KEY
} from '../decorators/rateLimit';

describe('rateLimitMessage decorator', () => {
    class TestClass {
        @rateLimitMessage('Trade', { messagesPerSecond: 1, burstSize: 2 })
        handleTrade() {
            return 'trade';
        }

        @rateLimitMessage('Move', { cost: 2 })
        handleMove() {
            return 'move';
        }

        undecorated() {
            return 'undecorated';
        }
    }

    describe('metadata storage', () => {
        it('should store rate limit metadata on target', () => {
            const metadata = getRateLimitMetadata(TestClass.prototype, 'Trade');
            expect(metadata).toBeDefined();
            expect(metadata?.enabled).toBe(true);
        });

        it('should store config in metadata', () => {
            const metadata = getRateLimitMetadata(TestClass.prototype, 'Trade');
            expect(metadata?.config?.messagesPerSecond).toBe(1);
            expect(metadata?.config?.burstSize).toBe(2);
        });

        it('should store cost in metadata', () => {
            const metadata = getRateLimitMetadata(TestClass.prototype, 'Move');
            expect(metadata?.config?.cost).toBe(2);
        });

        it('should return undefined for unregistered message types', () => {
            const metadata = getRateLimitMetadata(TestClass.prototype, 'Unknown');
            expect(metadata).toBeUndefined();
        });
    });

    describe('method behavior', () => {
        it('should not alter method behavior', () => {
            const instance = new TestClass();
            expect(instance.handleTrade()).toBe('trade');
            expect(instance.handleMove()).toBe('move');
        });
    });
});

describe('noRateLimitMessage decorator', () => {
    class TestClass {
        @noRateLimitMessage('Heartbeat')
        handleHeartbeat() {
            return 'heartbeat';
        }

        @noRateLimitMessage('Ping')
        handlePing() {
            return 'ping';
        }
    }

    describe('metadata storage', () => {
        it('should mark message as exempt', () => {
            const metadata = getRateLimitMetadata(TestClass.prototype, 'Heartbeat');
            expect(metadata?.exempt).toBe(true);
            expect(metadata?.enabled).toBe(false);
        });

        it('should store for multiple messages', () => {
            const heartbeatMeta = getRateLimitMetadata(TestClass.prototype, 'Heartbeat');
            const pingMeta = getRateLimitMetadata(TestClass.prototype, 'Ping');

            expect(heartbeatMeta?.exempt).toBe(true);
            expect(pingMeta?.exempt).toBe(true);
        });
    });

    describe('method behavior', () => {
        it('should not alter method behavior', () => {
            const instance = new TestClass();
            expect(instance.handleHeartbeat()).toBe('heartbeat');
            expect(instance.handlePing()).toBe('ping');
        });
    });
});

describe('combined decorators', () => {
    class CombinedTestClass {
        @rateLimitMessage('SlowAction', { messagesPerSecond: 1 })
        handleSlow() {
            return 'slow';
        }

        @noRateLimitMessage('FastAction')
        handleFast() {
            return 'fast';
        }

        @rateLimitMessage('ExpensiveAction', { cost: 10 })
        handleExpensive() {
            return 'expensive';
        }
    }

    it('should handle multiple different decorators', () => {
        const slowMeta = getRateLimitMetadata(CombinedTestClass.prototype, 'SlowAction');
        const fastMeta = getRateLimitMetadata(CombinedTestClass.prototype, 'FastAction');
        const expensiveMeta = getRateLimitMetadata(CombinedTestClass.prototype, 'ExpensiveAction');

        expect(slowMeta?.enabled).toBe(true);
        expect(slowMeta?.config?.messagesPerSecond).toBe(1);

        expect(fastMeta?.exempt).toBe(true);
        expect(fastMeta?.enabled).toBe(false);

        expect(expensiveMeta?.enabled).toBe(true);
        expect(expensiveMeta?.config?.cost).toBe(10);
    });
});

describe('RATE_LIMIT_METADATA_KEY', () => {
    it('should be a symbol', () => {
        expect(typeof RATE_LIMIT_METADATA_KEY).toBe('symbol');
    });

    it('should be used for metadata storage', () => {
        class TestClass {
            @rateLimitMessage('Test', {})
            handleTest() {}
        }

        const metadataMap = (TestClass.prototype as any)[RATE_LIMIT_METADATA_KEY];
        expect(metadataMap).toBeInstanceOf(Map);
    });
});

describe('rateLimit decorator (auto-detect)', () => {
    it('should be a decorator function', () => {
        expect(typeof rateLimit).toBe('function');
        expect(typeof rateLimit()).toBe('function');
    });

    it('should accept config', () => {
        class TestClass {
            @rateLimit({ messagesPerSecond: 5 })
            someMethod() {
                return 'test';
            }
        }

        const instance = new TestClass();
        expect(instance.someMethod()).toBe('test');
    });
});

describe('noRateLimit decorator (auto-detect)', () => {
    it('should be a decorator function', () => {
        expect(typeof noRateLimit).toBe('function');
        expect(typeof noRateLimit()).toBe('function');
    });

    it('should work as decorator', () => {
        class TestClass {
            @noRateLimit()
            someMethod() {
                return 'test';
            }
        }

        const instance = new TestClass();
        expect(instance.someMethod()).toBe('test');
    });
});
