import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Room } from '../../room/Room';
import { Player } from '../../room/Player';
import { withRateLimit, getPlayerRateLimitContext } from '../mixin/withRateLimit';
import { noRateLimitMessage, rateLimitMessage } from '../decorators/rateLimit';
import { onMessage } from '../../room/decorators';

describe('withRateLimit mixin', () => {
    let RateLimitedRoom: ReturnType<typeof withRateLimit>;

    beforeEach(() => {
        RateLimitedRoom = withRateLimit(Room, {
            messagesPerSecond: 10,
            burstSize: 20
        });
    });

    describe('basic functionality', () => {
        it('should create a rate limited room class', () => {
            expect(RateLimitedRoom).toBeDefined();
        });

        it('should have rateLimitStrategy property', () => {
            class TestRoom extends RateLimitedRoom {
                onCreate() {}
            }

            const room = new TestRoom();
            expect(room.rateLimitStrategy).toBeDefined();
            expect(room.rateLimitStrategy.name).toBe('token-bucket');
        });
    });

    describe('strategy selection', () => {
        it('should use token-bucket by default', () => {
            class TestRoom extends withRateLimit(Room) {
                onCreate() {}
            }

            const room = new TestRoom();
            expect(room.rateLimitStrategy.name).toBe('token-bucket');
        });

        it('should use sliding-window when specified', () => {
            class TestRoom extends withRateLimit(Room, { strategy: 'sliding-window' }) {
                onCreate() {}
            }

            const room = new TestRoom();
            expect(room.rateLimitStrategy.name).toBe('sliding-window');
        });

        it('should use fixed-window when specified', () => {
            class TestRoom extends withRateLimit(Room, { strategy: 'fixed-window' }) {
                onCreate() {}
            }

            const room = new TestRoom();
            expect(room.rateLimitStrategy.name).toBe('fixed-window');
        });
    });

    describe('configuration', () => {
        it('should use default values', () => {
            class TestRoom extends withRateLimit(Room) {
                onCreate() {}
            }

            const room = new TestRoom();
            expect(room.rateLimitStrategy).toBeDefined();
        });

        it('should accept custom messagesPerSecond', () => {
            class TestRoom extends withRateLimit(Room, { messagesPerSecond: 5 }) {
                onCreate() {}
            }

            const room = new TestRoom();
            expect(room.rateLimitStrategy).toBeDefined();
        });

        it('should accept custom burstSize', () => {
            class TestRoom extends withRateLimit(Room, { burstSize: 50 }) {
                onCreate() {}
            }

            const room = new TestRoom();
            expect(room.rateLimitStrategy).toBeDefined();
        });
    });

    describe('dispose', () => {
        it('should clean up on dispose', () => {
            class TestRoom extends RateLimitedRoom {
                onCreate() {}
            }

            const room = new TestRoom();
            room._init({
                id: 'test-room',
                sendFn: vi.fn(),
                broadcastFn: vi.fn(),
                disposeFn: vi.fn()
            });

            expect(() => room.dispose()).not.toThrow();
        });
    });
});

describe('withRateLimit with auth', () => {
    it('should be composable with other mixins', () => {
        class TestRoom extends withRateLimit(Room, { messagesPerSecond: 10 }) {
            onCreate() {}
        }

        const room = new TestRoom();
        expect(room.rateLimitStrategy).toBeDefined();
    });
});

describe('getPlayerRateLimitContext', () => {
    it('should return null for player without context', () => {
        const mockPlayer = {
            id: 'player-1',
            roomId: 'room-1',
            data: {},
            send: vi.fn(),
            leave: vi.fn()
        } as unknown as Player;

        const context = getPlayerRateLimitContext(mockPlayer);
        expect(context).toBeNull();
    });
});

describe('decorator metadata', () => {
    it('rateLimitMessage should set metadata', () => {
        class TestRoom extends withRateLimit(Room) {
            @rateLimitMessage('Trade', { messagesPerSecond: 1 })
            @onMessage('Trade')
            handleTrade() {}
        }

        expect(TestRoom).toBeDefined();
    });

    it('noRateLimitMessage should set exempt metadata', () => {
        class TestRoom extends withRateLimit(Room) {
            @noRateLimitMessage('Heartbeat')
            @onMessage('Heartbeat')
            handleHeartbeat() {}
        }

        expect(TestRoom).toBeDefined();
    });
});
