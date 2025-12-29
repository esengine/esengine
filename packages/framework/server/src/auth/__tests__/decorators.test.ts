import { describe, it, expect, beforeEach } from 'vitest';
import { requireAuth, AUTH_METADATA_KEY, getAuthMetadata, type AuthMetadata } from '../decorators/requireAuth';
import { requireRole } from '../decorators/requireRole';

describe('requireAuth decorator', () => {
    class TestClass {
        @requireAuth()
        basicMethod() {
            return 'basic';
        }

        @requireAuth({ allowGuest: true })
        guestAllowedMethod() {
            return 'guest';
        }

        @requireAuth({ errorMessage: 'Custom error' })
        customErrorMethod() {
            return 'custom';
        }

        undecorated() {
            return 'undecorated';
        }
    }

    let instance: TestClass;

    beforeEach(() => {
        instance = new TestClass();
    });

    describe('metadata storage', () => {
        it('should store auth metadata on target', () => {
            const metadata = getAuthMetadata(TestClass.prototype, 'basicMethod');
            expect(metadata).toBeDefined();
            expect(metadata?.requireAuth).toBe(true);
        });

        it('should store options in metadata', () => {
            const metadata = getAuthMetadata(TestClass.prototype, 'guestAllowedMethod');
            expect(metadata?.options?.allowGuest).toBe(true);
        });

        it('should store custom error message', () => {
            const metadata = getAuthMetadata(TestClass.prototype, 'customErrorMethod');
            expect(metadata?.options?.errorMessage).toBe('Custom error');
        });

        it('should return undefined for undecorated methods', () => {
            const metadata = getAuthMetadata(TestClass.prototype, 'undecorated');
            expect(metadata).toBeUndefined();
        });

        it('should return undefined for non-existent methods', () => {
            const metadata = getAuthMetadata(TestClass.prototype, 'nonExistent');
            expect(metadata).toBeUndefined();
        });
    });

    describe('method behavior', () => {
        it('should not alter method behavior', () => {
            expect(instance.basicMethod()).toBe('basic');
            expect(instance.guestAllowedMethod()).toBe('guest');
            expect(instance.customErrorMethod()).toBe('custom');
        });
    });

    describe('metadata key', () => {
        it('should use symbol for metadata storage', () => {
            expect(typeof AUTH_METADATA_KEY).toBe('symbol');
        });

        it('should store metadata in a Map', () => {
            const metadataMap = (TestClass.prototype as any)[AUTH_METADATA_KEY];
            expect(metadataMap).toBeInstanceOf(Map);
        });
    });
});

describe('requireRole decorator', () => {
    class RoleTestClass {
        @requireRole('admin')
        adminOnly() {
            return 'admin';
        }

        @requireRole(['moderator', 'admin'])
        modOrAdmin() {
            return 'mod';
        }

        @requireRole(['verified', 'premium'], { mode: 'all' })
        verifiedPremium() {
            return 'vip';
        }

        @requireRole('player', { mode: 'any' })
        playerExplicit() {
            return 'player';
        }
    }

    describe('single role', () => {
        it('should store single role as array', () => {
            const metadata = getAuthMetadata(RoleTestClass.prototype, 'adminOnly');
            expect(metadata?.roles).toEqual(['admin']);
        });

        it('should set requireAuth to true', () => {
            const metadata = getAuthMetadata(RoleTestClass.prototype, 'adminOnly');
            expect(metadata?.requireAuth).toBe(true);
        });

        it('should default to any mode', () => {
            const metadata = getAuthMetadata(RoleTestClass.prototype, 'adminOnly');
            expect(metadata?.roleMode).toBe('any');
        });
    });

    describe('multiple roles', () => {
        it('should store multiple roles', () => {
            const metadata = getAuthMetadata(RoleTestClass.prototype, 'modOrAdmin');
            expect(metadata?.roles).toEqual(['moderator', 'admin']);
        });
    });

    describe('role mode', () => {
        it('should support all mode', () => {
            const metadata = getAuthMetadata(RoleTestClass.prototype, 'verifiedPremium');
            expect(metadata?.roleMode).toBe('all');
            expect(metadata?.roles).toEqual(['verified', 'premium']);
        });

        it('should support explicit any mode', () => {
            const metadata = getAuthMetadata(RoleTestClass.prototype, 'playerExplicit');
            expect(metadata?.roleMode).toBe('any');
        });
    });

    describe('method behavior', () => {
        it('should not alter method behavior', () => {
            const instance = new RoleTestClass();
            expect(instance.adminOnly()).toBe('admin');
            expect(instance.modOrAdmin()).toBe('mod');
            expect(instance.verifiedPremium()).toBe('vip');
        });
    });
});

describe('combined decorators', () => {
    class CombinedTestClass {
        @requireAuth({ allowGuest: false })
        @requireRole('admin')
        combinedMethod() {
            return 'combined';
        }
    }

    it('should merge metadata from both decorators', () => {
        const metadata = getAuthMetadata(CombinedTestClass.prototype, 'combinedMethod');
        expect(metadata?.requireAuth).toBe(true);
        expect(metadata?.roles).toEqual(['admin']);
    });
});
