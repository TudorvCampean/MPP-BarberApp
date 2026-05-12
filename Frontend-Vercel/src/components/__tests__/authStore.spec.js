import { describe, it, expect, beforeEach, vi } from 'vitest';
import { login, logout, authError } from '../../domain/authStore';

describe('authStore', () => {
    beforeEach(() => {
        // Curățăm mediul înainte de fiecare test
        localStorage.clear();
        vi.clearAllMocks();
        authError.value = null;
    });

    it('saves the token to localStorage on successful login', async () => {
        // Simulăm un răspuns de succes de la serverul LAN
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                access_token: 'fake-token-123',
                user: { name: 'Tudor' }
            })
        });

        const success = await login('test@test.ro', 'password');

        expect(success).toBe(true);
        expect(localStorage.getItem('auth_token')).toBe('fake-token-123');
    });

    it('sets an error message when login fails', async () => {
        // Simulăm o eroare de autentificare (ex: date greșite)
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ message: 'Invalid credentials' })
        });

        const success = await login('wrong@test.ro', 'wrong');

        expect(success).toBe(false);
        expect(authError.value).toBe('Invalid credentials');
    });

    it('removes the token from storage on logout', () => {
        localStorage.setItem('auth_token', 'active-token');
        logout(); // Gestionarea sesiunii cerută de Assignment 4
        expect(localStorage.getItem('auth_token')).toBeNull();
    });
});
