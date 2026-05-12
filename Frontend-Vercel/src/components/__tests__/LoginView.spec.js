import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import LoginView from '../LoginView.vue';
import * as authStore from '../../domain/authStore';

// Mock-uim authStore pentru a nu face cereri reale la rețea în timpul testului
vi.mock('../../domain/authStore', () => ({
    login: vi.fn(),
    authError: { value: null },
    isLoading: { value: false }
}));

describe('LoginView.vue', () => {
    it('triggers the login function with correct data on submit', async () => {
        const wrapper = mount(LoginView);

        // Completăm câmpurile din formular
        await wrapper.find('input[type="email"]').setValue('tudor@test.ro');
        await wrapper.find('input[type="password"]').setValue('parola123');

        // Trimitem formularul
        await wrapper.find('form').trigger('submit.prevent');

        // Verificăm dacă funcția de login a fost apelată cu datele corecte
        expect(authStore.login).toHaveBeenCalledWith('tudor@test.ro', 'parola123');
    });
});
