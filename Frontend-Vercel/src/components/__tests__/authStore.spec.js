import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register, logout, currentUser, authError, isLoading } from '../../domain/authStore';

// Mock the global fetch function
global.fetch = vi.fn();

describe('Auth Store Tests (Vue)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        currentUser.value = null;
        authError.value = null;
        isLoading.value = false;
    });

    it('login() should send correct payload to relative route /api/login', async () => {
        const mockUser = { id: 1, name: 'Test User' };
        const mockToken = 'fake-jwt-token';

        // Simulate a successful server response
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: mockUser, access_token: mockToken }),
        });

        const result = await login('test@example.com', 'password123');

        // Verify that the request was sent correctly to the Vite proxy
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/login'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
            })
        );

        expect(result).toBe(true);
        expect(localStorage.getItem('auth_token')).toBe(mockToken);
        expect(currentUser.value).toEqual(mockUser);
    });

    it('login() should populate authError if the server returns an error', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Invalid credentials' }),
        });

        const result = await login('wrong@example.com', 'wrongpass');

        expect(result).toBe(false);
        expect(authError.value).toBe('Invalid credentials');
        expect(currentUser.value).toBeNull();
    });

    it('logout() should remove the token from localStorage', () => {
        localStorage.setItem('auth_token', 'existing-token');
        currentUser.value = { name: 'Test User' };

        // Since logout performs a redirect, we prevent jsdom errors by mocking window.location
        delete window.location;
        window.location = { href: '' };

        logout();

        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(currentUser.value).toBeNull();
    });
});
