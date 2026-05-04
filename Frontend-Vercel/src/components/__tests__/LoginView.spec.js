import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import LoginView from '../LoginView.vue';

describe('LoginView.vue', () => {
    it('1. Renders the login form correctly', () => {
        const wrapper = mount(LoginView);
        expect(wrapper.text()).toContain('Sign in to your account');
        expect(wrapper.find('input[type="email"]').exists()).toBe(true);
        expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    });

    it('2. Toggles between Login and Register views', async () => {
        const wrapper = mount(LoginView);


        const toggleBtn = wrapper.findAll('button').find(b => b.text().includes("Don't have an account?"));
        await toggleBtn.trigger('click');


        expect(wrapper.text()).toContain('Create new account');
    });

    it('3. Emits navigate event to "table" when Continue as Guest is clicked', async () => {
        const wrapper = mount(LoginView);

        const guestBtn = wrapper.findAll('button').find(b => b.text().includes('Continue as Guest'));
        await guestBtn.trigger('click');

        expect(wrapper.emitted()).toHaveProperty('navigate');
        expect(wrapper.emitted().navigate[0]).toEqual(['table']);
    });

    it('4. Submits the form and navigates to "table"', async () => {
        const wrapper = mount(LoginView);


        const emailInput = wrapper.find('input[type="email"]');
        const passInput = wrapper.find('input[type="password"]');

        await emailInput.setValue('test@elitecuts.ro');
        await passInput.setValue('parola123');


        await wrapper.find('form').trigger('submit.prevent');


        expect(wrapper.emitted()).toHaveProperty('navigate');
        expect(wrapper.emitted().navigate[0]).toEqual(['table']);
    });
});
