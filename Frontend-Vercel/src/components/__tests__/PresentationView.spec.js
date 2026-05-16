import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import PresentationView from '../PresentationView.vue';

describe('PresentationView.vue', () => {
    it('1. Renders all mandatory Bronze Challenge elements', () => {
        const wrapper = mount(PresentationView);

        // Corectat: Verificăm numele exact cu spațiu cum e în componentă
        expect(wrapper.text()).toContain('Elite Cuts');
        expect(wrapper.text()).toContain('Your Style, Our Craft');
        
        expect(wrapper.findAll('svg').length).toBeGreaterThan(0);
    });

    it('2. Emits navigate event to "register" when Create Account button is clicked', async () => {
        const wrapper = mount(PresentationView);

        // Corectat: Căutăm butonul existent 'Create Account'
        const registerBtn = wrapper.findAll('button').find(b => b.text().includes('Create Account'));
        await registerBtn.trigger('click');

        expect(wrapper.emitted().navigate[0]).toEqual(['register']);
    });

    it('3. Emits navigate event to "login" when Log In button is clicked', async () => {
        const wrapper = mount(PresentationView);

        // Corectat: Căutăm butonul existent 'Log In'
        const loginBtn = wrapper.findAll('button').find(b => b.text().includes('Log In'));
        await loginBtn.trigger('click');

        expect(wrapper.emitted().navigate[0]).toEqual(['login']);
    });
});