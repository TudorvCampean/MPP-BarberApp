import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register, logout, currentUser, authError, isLoading } from '../../domain/authStore';

// Mock the global fetch API natively
global.fetch = vi.fn();

describe('Auth Store Tests (Vue via Proxy)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        currentUser.value = null;
        authError.value = null;
        isLoading.value = false;
    });

    it('login() should dispatch payload to the relative proxy endpoint /api/login', async () => {
        const mockUser = { id: 1, name: 'Barber User' };
        const mockToken = 'sanctum-mock-token';

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: mockUser, access_token: mockToken }),
        });

        const success = await login('test@example.com', 'password');

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/login'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com', password: 'password' })
            })
        );

        expect(success).toBe(true);
        expect(localStorage.getItem('auth_token')).toBe(mockToken);
        expect(currentUser.value).toEqual(mockUser);
    });

    it('login() should register an error string if server returns an error code', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Invalid credentials' }),
        });

        const success = await login('error@example.com', 'badpass');

        expect(success).toBe(false);
        expect(authError.value).toBe('Invalid credentials');
        expect(currentUser.value).toBeNull();
    });

    it('logout() should flush the auth state and clear storage keys', () => {
        localStorage.setItem('auth_token', 'active-session-token');
        currentUser.value = { name: 'Active Practitioner' };

        delete window.location;
        window.location = { href: '' };

        logout();

        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(currentUser.value).toBeNull();
    });
});
