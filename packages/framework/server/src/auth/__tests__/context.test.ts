import { describe, it, expect, beforeEach } from 'vitest';
import { AuthContext, createGuestContext, createAuthContext, defaultUserExtractor } from '../context';
import type { AuthResult } from '../types';

describe('AuthContext', () => {
    let context: AuthContext<{ id: string; name: string; roles: string[] }>;

    beforeEach(() => {
        context = new AuthContext();
    });

    describe('initial state', () => {
        it('should not be authenticated initially', () => {
            expect(context.isAuthenticated).toBe(false);
        });

        it('should have null user initially', () => {
            expect(context.user).toBeNull();
        });

        it('should have null userId initially', () => {
            expect(context.userId).toBeNull();
        });

        it('should have empty roles initially', () => {
            expect(context.roles).toEqual([]);
        });

        it('should have null authenticatedAt initially', () => {
            expect(context.authenticatedAt).toBeNull();
        });

        it('should have null expiresAt initially', () => {
            expect(context.expiresAt).toBeNull();
        });
    });

    describe('setAuthenticated', () => {
        it('should set authenticated state on success', () => {
            const result: AuthResult<{ id: string; name: string; roles: string[] }> = {
                success: true,
                user: { id: '123', name: 'Alice', roles: ['player'] }
            };

            context.setAuthenticated(result);

            expect(context.isAuthenticated).toBe(true);
            expect(context.user).toEqual({ id: '123', name: 'Alice', roles: ['player'] });
            expect(context.userId).toBe('123');
            expect(context.roles).toEqual(['player']);
            expect(context.authenticatedAt).toBeTypeOf('number');
        });

        it('should set expiresAt when provided', () => {
            const expiresAt = Date.now() + 3600000;
            const result: AuthResult<{ id: string; name: string; roles: string[] }> = {
                success: true,
                user: { id: '123', name: 'Alice', roles: [] },
                expiresAt
            };

            context.setAuthenticated(result);

            expect(context.expiresAt).toBe(expiresAt);
        });

        it('should clear state on failed result', () => {
            context.setAuthenticated({
                success: true,
                user: { id: '123', name: 'Alice', roles: ['player'] }
            });

            context.setAuthenticated({
                success: false,
                error: 'Token expired'
            });

            expect(context.isAuthenticated).toBe(false);
            expect(context.user).toBeNull();
        });

        it('should clear state when success but no user', () => {
            context.setAuthenticated({
                success: true
            });

            expect(context.isAuthenticated).toBe(false);
        });
    });

    describe('isAuthenticated with expiry', () => {
        it('should return false when token is expired', () => {
            context.setAuthenticated({
                success: true,
                user: { id: '123', name: 'Alice', roles: [] },
                expiresAt: Date.now() - 1000
            });

            expect(context.isAuthenticated).toBe(false);
        });

        it('should return true when token is not expired', () => {
            context.setAuthenticated({
                success: true,
                user: { id: '123', name: 'Alice', roles: [] },
                expiresAt: Date.now() + 3600000
            });

            expect(context.isAuthenticated).toBe(true);
        });
    });

    describe('role checking', () => {
        beforeEach(() => {
            context.setAuthenticated({
                success: true,
                user: { id: '123', name: 'Alice', roles: ['player', 'premium'] }
            });
        });

        it('hasRole should return true for existing role', () => {
            expect(context.hasRole('player')).toBe(true);
            expect(context.hasRole('premium')).toBe(true);
        });

        it('hasRole should return false for non-existing role', () => {
            expect(context.hasRole('admin')).toBe(false);
        });

        it('hasAnyRole should return true if any role matches', () => {
            expect(context.hasAnyRole(['admin', 'player'])).toBe(true);
            expect(context.hasAnyRole(['guest', 'premium'])).toBe(true);
        });

        it('hasAnyRole should return false if no role matches', () => {
            expect(context.hasAnyRole(['admin', 'moderator'])).toBe(false);
        });

        it('hasAllRoles should return true if all roles match', () => {
            expect(context.hasAllRoles(['player', 'premium'])).toBe(true);
        });

        it('hasAllRoles should return false if any role is missing', () => {
            expect(context.hasAllRoles(['player', 'admin'])).toBe(false);
        });
    });

    describe('clear', () => {
        it('should reset all state', () => {
            context.setAuthenticated({
                success: true,
                user: { id: '123', name: 'Alice', roles: ['player'] },
                expiresAt: Date.now() + 3600000
            });

            context.clear();

            expect(context.isAuthenticated).toBe(false);
            expect(context.user).toBeNull();
            expect(context.userId).toBeNull();
            expect(context.roles).toEqual([]);
            expect(context.authenticatedAt).toBeNull();
            expect(context.expiresAt).toBeNull();
        });
    });
});

describe('defaultUserExtractor', () => {
    describe('getId', () => {
        it('should extract id from user object', () => {
            expect(defaultUserExtractor.getId({ id: '123' })).toBe('123');
        });

        it('should extract numeric id as string', () => {
            expect(defaultUserExtractor.getId({ id: 456 })).toBe('456');
        });

        it('should extract userId', () => {
            expect(defaultUserExtractor.getId({ userId: 'abc' })).toBe('abc');
        });

        it('should extract sub (JWT standard)', () => {
            expect(defaultUserExtractor.getId({ sub: 'jwt-sub' })).toBe('jwt-sub');
        });

        it('should return empty string for invalid user', () => {
            expect(defaultUserExtractor.getId(null)).toBe('');
            expect(defaultUserExtractor.getId(undefined)).toBe('');
            expect(defaultUserExtractor.getId({})).toBe('');
        });
    });

    describe('getRoles', () => {
        it('should extract roles array', () => {
            expect(defaultUserExtractor.getRoles({ roles: ['a', 'b'] })).toEqual(['a', 'b']);
        });

        it('should extract single role', () => {
            expect(defaultUserExtractor.getRoles({ role: 'admin' })).toEqual(['admin']);
        });

        it('should filter non-string roles', () => {
            expect(defaultUserExtractor.getRoles({ roles: ['a', 123, 'b'] })).toEqual(['a', 'b']);
        });

        it('should return empty array for invalid user', () => {
            expect(defaultUserExtractor.getRoles(null)).toEqual([]);
            expect(defaultUserExtractor.getRoles({})).toEqual([]);
        });
    });
});

describe('createGuestContext', () => {
    it('should create unauthenticated context', () => {
        const guest = createGuestContext();
        expect(guest.isAuthenticated).toBe(false);
        expect(guest.user).toBeNull();
    });
});

describe('createAuthContext', () => {
    it('should create authenticated context from result', () => {
        const result: AuthResult<{ id: string }> = {
            success: true,
            user: { id: '123' }
        };

        const ctx = createAuthContext(result);
        expect(ctx.isAuthenticated).toBe(true);
        expect(ctx.userId).toBe('123');
    });

    it('should create unauthenticated context from failed result', () => {
        const result: AuthResult<{ id: string }> = {
            success: false,
            error: 'Failed'
        };

        const ctx = createAuthContext(result);
        expect(ctx.isAuthenticated).toBe(false);
    });
});
