import { describe, it, expect, beforeEach } from 'vitest';
import { JwtAuthProvider, createJwtAuthProvider } from '../providers/JwtAuthProvider';
import { SessionAuthProvider, createSessionAuthProvider, type ISessionStorage } from '../providers/SessionAuthProvider';

describe('JwtAuthProvider', () => {
    const secret = 'test-secret-key-for-testing';
    let provider: JwtAuthProvider<{ id: string; name: string; roles: string[] }>;

    beforeEach(() => {
        provider = createJwtAuthProvider({
            secret,
            expiresIn: 3600
        });
    });

    describe('sign and verify', () => {
        it('should sign and verify a token', async () => {
            const payload = { sub: '123', name: 'Alice', roles: ['player'] };
            const token = provider.sign(payload);

            expect(token).toBeTypeOf('string');
            expect(token.split('.')).toHaveLength(3);

            const result = await provider.verify(token);
            expect(result.success).toBe(true);
            expect(result.user).toBeDefined();
        });

        it('should extract user from payload', async () => {
            const payload = { sub: '123', name: 'Alice' };
            const token = provider.sign(payload);

            const result = await provider.verify(token);
            expect(result.success).toBe(true);
            expect((result.user as any).sub).toBe('123');
            expect((result.user as any).name).toBe('Alice');
        });

        it('should return expiration time', async () => {
            const token = provider.sign({ sub: '123' });
            const result = await provider.verify(token);

            expect(result.expiresAt).toBeTypeOf('number');
            expect(result.expiresAt).toBeGreaterThan(Date.now());
        });
    });

    describe('verify errors', () => {
        it('should fail for empty token', async () => {
            const result = await provider.verify('');
            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('INVALID_TOKEN');
        });

        it('should fail for invalid token', async () => {
            const result = await provider.verify('invalid.token.here');
            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('INVALID_TOKEN');
        });

        it('should fail for expired token', async () => {
            const shortLivedProvider = createJwtAuthProvider({
                secret,
                expiresIn: -1
            });

            const token = shortLivedProvider.sign({ sub: '123' });
            const result = await shortLivedProvider.verify(token);

            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('EXPIRED_TOKEN');
        });

        it('should fail for wrong secret', async () => {
            const token = provider.sign({ sub: '123' });

            const wrongSecretProvider = createJwtAuthProvider({
                secret: 'wrong-secret'
            });

            const result = await wrongSecretProvider.verify(token);
            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('INVALID_TOKEN');
        });
    });

    describe('with getUser callback', () => {
        it('should use getUser to transform payload', async () => {
            const customProvider = createJwtAuthProvider({
                secret,
                getUser: async (payload) => ({
                    id: payload.sub as string,
                    name: payload.name as string,
                    roles: (payload.roles as string[]) || []
                })
            });

            const token = customProvider.sign({ sub: '123', name: 'Bob', roles: ['admin'] });
            const result = await customProvider.verify(token);

            expect(result.success).toBe(true);
            expect(result.user).toEqual({
                id: '123',
                name: 'Bob',
                roles: ['admin']
            });
        });

        it('should fail when getUser returns null', async () => {
            const customProvider = createJwtAuthProvider({
                secret,
                getUser: async () => null
            });

            const token = customProvider.sign({ sub: '123' });
            const result = await customProvider.verify(token);

            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('USER_NOT_FOUND');
        });
    });

    describe('refresh', () => {
        it('should refresh a valid token', async () => {
            const token = provider.sign({ sub: '123', name: 'Alice' });

            // Wait a bit so iat changes
            await new Promise((resolve) => setTimeout(resolve, 1100));

            const result = await provider.refresh(token);

            expect(result.success).toBe(true);
            expect(result.token).toBeDefined();
            expect(result.token).not.toBe(token);
        });

        it('should return new expiration time', async () => {
            const token = provider.sign({ sub: '123' });
            const result = await provider.refresh(token);

            expect(result.success).toBe(true);
            expect(result.expiresAt).toBeTypeOf('number');
            expect(result.expiresAt).toBeGreaterThan(Date.now());
        });

        it('should fail to refresh invalid token', async () => {
            const result = await provider.refresh('invalid');

            expect(result.success).toBe(false);
        });
    });

    describe('decode', () => {
        it('should decode token without verification', () => {
            const token = provider.sign({ sub: '123', name: 'Alice' });
            const payload = provider.decode(token);

            expect(payload).toBeDefined();
            expect(payload?.sub).toBe('123');
            expect(payload?.name).toBe('Alice');
        });

        it('should return null for invalid token', () => {
            const payload = provider.decode('not-a-token');
            expect(payload).toBeNull();
        });
    });
});

describe('SessionAuthProvider', () => {
    let storage: ISessionStorage;
    let provider: SessionAuthProvider<{ id: string; name: string }>;
    let storageData: Map<string, unknown>;

    beforeEach(() => {
        storageData = new Map();

        storage = {
            async get<T>(key: string): Promise<T | null> {
                return (storageData.get(key) as T) ?? null;
            },
            async set<T>(key: string, value: T): Promise<void> {
                storageData.set(key, value);
            },
            async delete(key: string): Promise<boolean> {
                return storageData.delete(key);
            }
        };

        provider = createSessionAuthProvider({
            storage,
            sessionTTL: 3600000
        });
    });

    describe('createSession and verify', () => {
        it('should create and verify a session', async () => {
            const user = { id: '123', name: 'Alice' };
            const sessionId = await provider.createSession(user);

            expect(sessionId).toBeTypeOf('string');
            expect(sessionId.length).toBeGreaterThan(10);

            const result = await provider.verify(sessionId);

            expect(result.success).toBe(true);
            expect(result.user).toEqual(user);
        });

        it('should store session data', async () => {
            const user = { id: '123', name: 'Alice' };
            const sessionId = await provider.createSession(user, { customField: 'value' });

            const session = await provider.getSession(sessionId);

            expect(session).toBeDefined();
            expect(session?.user).toEqual(user);
            expect(session?.data?.customField).toBe('value');
            expect(session?.createdAt).toBeTypeOf('number');
            expect(session?.lastActiveAt).toBeTypeOf('number');
        });
    });

    describe('verify errors', () => {
        it('should fail for empty session id', async () => {
            const result = await provider.verify('');
            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('INVALID_TOKEN');
        });

        it('should fail for non-existent session', async () => {
            const result = await provider.verify('non-existent-session');
            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('EXPIRED_TOKEN');
        });
    });

    describe('with validateUser', () => {
        it('should validate user on verify', async () => {
            const validatingProvider = createSessionAuthProvider({
                storage,
                validateUser: (user: { id: string; name?: string }) => user.id !== 'banned'
            });

            const sessionId = await validatingProvider.createSession({ id: 'banned', name: 'Bad User' });
            const result = await validatingProvider.verify(sessionId);

            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('ACCOUNT_DISABLED');
        });

        it('should pass validation for valid user', async () => {
            const validatingProvider = createSessionAuthProvider({
                storage,
                validateUser: (user: { id: string; name?: string }) => user.id !== 'banned'
            });

            const sessionId = await validatingProvider.createSession({ id: '123', name: 'Good User' });
            const result = await validatingProvider.verify(sessionId);

            expect(result.success).toBe(true);
        });
    });

    describe('refresh', () => {
        it('should refresh session and update lastActiveAt', async () => {
            const sessionId = await provider.createSession({ id: '123', name: 'Alice' });

            const session1 = await provider.getSession(sessionId);
            const lastActive1 = session1?.lastActiveAt;

            await new Promise((resolve) => setTimeout(resolve, 10));

            const result = await provider.refresh(sessionId);
            expect(result.success).toBe(true);

            const session2 = await provider.getSession(sessionId);
            expect(session2?.lastActiveAt).toBeGreaterThanOrEqual(lastActive1!);
        });
    });

    describe('revoke', () => {
        it('should revoke session', async () => {
            const sessionId = await provider.createSession({ id: '123', name: 'Alice' });

            const revoked = await provider.revoke(sessionId);
            expect(revoked).toBe(true);

            const result = await provider.verify(sessionId);
            expect(result.success).toBe(false);
        });
    });

    describe('updateSession', () => {
        it('should update session data', async () => {
            const sessionId = await provider.createSession({ id: '123', name: 'Alice' });

            const updated = await provider.updateSession(sessionId, { newField: 'newValue' });
            expect(updated).toBe(true);

            const session = await provider.getSession(sessionId);
            expect(session?.data?.newField).toBe('newValue');
        });

        it('should return false for non-existent session', async () => {
            const updated = await provider.updateSession('non-existent', { field: 'value' });
            expect(updated).toBe(false);
        });
    });
});

describe('createJwtAuthProvider', () => {
    it('should create provider with default options', () => {
        const provider = createJwtAuthProvider({ secret: 'test' });
        expect(provider.name).toBe('jwt');
    });
});

describe('createSessionAuthProvider', () => {
    it('should create provider with default options', () => {
        const storage: ISessionStorage = {
            get: async () => null,
            set: async () => {},
            delete: async () => true
        };

        const provider = createSessionAuthProvider({ storage });
        expect(provider.name).toBe('session');
    });
});
