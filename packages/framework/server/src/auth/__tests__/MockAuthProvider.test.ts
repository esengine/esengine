import { describe, it, expect, beforeEach } from 'vitest';
import { MockAuthProvider, createMockAuthProvider, type MockUser } from '../testing/MockAuthProvider';

describe('MockAuthProvider', () => {
    const testUsers: MockUser[] = [
        { id: '1', name: 'Alice', roles: ['player'] },
        { id: '2', name: 'Bob', roles: ['admin', 'player'] },
        { id: '3', name: 'Charlie', roles: ['guest'] }
    ];

    let provider: MockAuthProvider;

    beforeEach(() => {
        provider = createMockAuthProvider({
            users: testUsers
        });
    });

    describe('basic properties', () => {
        it('should have name "mock"', () => {
            expect(provider.name).toBe('mock');
        });
    });

    describe('verify', () => {
        it('should verify existing user by id (token)', async () => {
            const result = await provider.verify('1');
            expect(result.success).toBe(true);
            expect(result.user?.id).toBe('1');
            expect(result.user?.name).toBe('Alice');
        });

        it('should return user roles', async () => {
            const result = await provider.verify('2');
            expect(result.success).toBe(true);
            expect(result.user?.roles).toEqual(['admin', 'player']);
        });

        it('should fail for unknown user', async () => {
            const result = await provider.verify('unknown');
            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('USER_NOT_FOUND');
        });

        it('should fail for empty token', async () => {
            const result = await provider.verify('');
            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('INVALID_TOKEN');
        });

        it('should return expiresAt', async () => {
            const result = await provider.verify('1');
            expect(result.expiresAt).toBeTypeOf('number');
            expect(result.expiresAt).toBeGreaterThan(Date.now());
        });
    });

    describe('with defaultUser', () => {
        it('should return default user for empty token', async () => {
            const providerWithDefault = createMockAuthProvider({
                defaultUser: { id: 'default', name: 'Guest' }
            });

            const result = await providerWithDefault.verify('');
            expect(result.success).toBe(true);
            expect(result.user?.id).toBe('default');
        });
    });

    describe('with autoCreate', () => {
        it('should auto create user for unknown token', async () => {
            const autoProvider = createMockAuthProvider({
                autoCreate: true
            });

            const result = await autoProvider.verify('new-user-123');
            expect(result.success).toBe(true);
            expect(result.user?.id).toBe('new-user-123');
            expect(result.user?.name).toBe('User_new-user-123');
            expect(result.user?.roles).toEqual(['guest']);
        });

        it('should persist auto-created users', async () => {
            const autoProvider = createMockAuthProvider({
                autoCreate: true
            });

            await autoProvider.verify('auto-1');
            const user = autoProvider.getUser('auto-1');
            expect(user).toBeDefined();
            expect(user?.id).toBe('auto-1');
        });
    });

    describe('with validateToken', () => {
        it('should validate token format', async () => {
            const validatingProvider = createMockAuthProvider({
                users: testUsers,
                validateToken: (token) => token.length >= 1 && !token.includes('invalid')
            });

            const validResult = await validatingProvider.verify('1');
            expect(validResult.success).toBe(true);

            const invalidResult = await validatingProvider.verify('invalid-token');
            expect(invalidResult.success).toBe(false);
            expect(invalidResult.errorCode).toBe('INVALID_TOKEN');
        });
    });

    describe('with delay', () => {
        it('should add artificial delay', async () => {
            const delayProvider = createMockAuthProvider({
                users: testUsers,
                delay: 50
            });

            const start = Date.now();
            await delayProvider.verify('1');
            const elapsed = Date.now() - start;

            expect(elapsed).toBeGreaterThanOrEqual(45);
        });
    });

    describe('refresh', () => {
        it('should refresh token (returns same result as verify)', async () => {
            const result = await provider.refresh('1');
            expect(result.success).toBe(true);
            expect(result.user?.id).toBe('1');
        });
    });

    describe('revoke', () => {
        it('should revoke token', async () => {
            const result1 = await provider.verify('1');
            expect(result1.success).toBe(true);

            const revoked = await provider.revoke('1');
            expect(revoked).toBe(true);

            const result2 = await provider.verify('1');
            expect(result2.success).toBe(false);
            expect(result2.errorCode).toBe('INVALID_TOKEN');
        });
    });

    describe('user management', () => {
        it('should add user', () => {
            provider.addUser({ id: '4', name: 'Dave', roles: ['tester'] });
            const user = provider.getUser('4');
            expect(user?.name).toBe('Dave');
        });

        it('should remove user', () => {
            const removed = provider.removeUser('1');
            expect(removed).toBe(true);

            const user = provider.getUser('1');
            expect(user).toBeUndefined();
        });

        it('should return false when removing non-existent user', () => {
            const removed = provider.removeUser('non-existent');
            expect(removed).toBe(false);
        });

        it('should get all users', () => {
            const users = provider.getUsers();
            expect(users).toHaveLength(3);
            expect(users.map((u) => u.id)).toContain('1');
            expect(users.map((u) => u.id)).toContain('2');
            expect(users.map((u) => u.id)).toContain('3');
        });
    });

    describe('clear', () => {
        it('should reset to initial state', async () => {
            provider.addUser({ id: '4', name: 'Dave' });
            await provider.revoke('1');

            provider.clear();

            const users = provider.getUsers();
            expect(users).toHaveLength(3);

            const result = await provider.verify('1');
            expect(result.success).toBe(true);
        });
    });

    describe('generateToken', () => {
        it('should return user id as token', () => {
            const token = provider.generateToken('user-123');
            expect(token).toBe('user-123');
        });
    });
});

describe('createMockAuthProvider', () => {
    it('should create provider with empty config', () => {
        const provider = createMockAuthProvider();
        expect(provider.name).toBe('mock');
    });

    it('should create provider with custom users', () => {
        const provider = createMockAuthProvider({
            users: [{ id: 'test', name: 'Test User' }]
        });

        const user = provider.getUser('test');
        expect(user?.name).toBe('Test User');
    });
});
