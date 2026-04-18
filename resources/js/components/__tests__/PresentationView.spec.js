import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import PresentationView from '../PresentationView.vue';

describe('PresentationView.vue', () => {
    it('1. Renders all mandatory Bronze Challenge elements', () => {
        const wrapper = mount(PresentationView);


        expect(wrapper.text()).toContain('Elite Cuts'); // Name
        expect(wrapper.text()).toContain('Your Style, Our Craft'); // Tagline
        expect(wrapper.text()).toContain('Professional appointment management system'); // Description
    });

    it('2. Emits navigate event to "table" when Calendar button is clicked', async () => {
        const wrapper = mount(PresentationView);


        const calendarBtn = wrapper.findAll('button').find(b => b.text().includes('Open Calendar'));
        await calendarBtn.trigger('click');


        expect(wrapper.emitted()).toHaveProperty('navigate');
        expect(wrapper.emitted().navigate[0]).toEqual(['table']);
    });

    it('3. Emits navigate event to "login" when Sign In button is clicked', async () => {
        const wrapper = mount(PresentationView);

        const loginBtn = wrapper.findAll('button').find(b => b.text().includes('Sign In'));
        await loginBtn.trigger('click');

        expect(wrapper.emitted().navigate[0]).toEqual(['login']);
    });
});
