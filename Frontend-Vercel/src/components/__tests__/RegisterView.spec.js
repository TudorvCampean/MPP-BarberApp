import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterView from '../RegisterView.vue';
import * as authStore from '../../domain/authStore';

// Mock-uim authStore
vi.mock('../../domain/authStore', () => ({
    register: vi.fn(),
    authError: { value: null },
    isLoading: { value: false }
}));

describe('RegisterView.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('submits the registration form with all required fields', async () => {
        const wrapper = mount(RegisterView);

        // Completăm toate câmpurile cerute de Backend (Assignment 4)
        await wrapper.find('input[type="text"]').setValue('Tudor Campean');
        await wrapper.find('input[type="email"]').setValue('tudor@elitecuts.ro');
        // Identificăm parolele după ordine sau placeholder
        const passwordInputs = wrapper.findAll('input[type="password"]');
        await passwordInputs[0].setValue('parola123');
        await passwordInputs[1].setValue('parola123'); // password_confirmation

        // Trimitem formularul
        await wrapper.find('form').trigger('submit.prevent');

        // Verificăm dacă funcția register a fost apelată cu argumentele corecte
        expect(authStore.register).toHaveBeenCalledWith(
            'Tudor Campean',
            'tudor@elitecuts.ro',
            'parola123',
            'parola123'
        );
    });

    it('displays an error message if registration fails', async () => {
        // Simulăm o eroare de validare de la Laravel (ex: email deja existent)
        authStore.authError.value = 'The email has already been taken.';
        const wrapper = mount(RegisterView);

        await wrapper.vm.$nextTick();

        // Verificăm dacă eroarea este vizibilă în interfață
        expect(wrapper.text()).toContain('The email has already been taken.');
    });
});
