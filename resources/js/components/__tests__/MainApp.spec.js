import { mount } from '@vue/test-utils';
import { beforeEach, describe, it, expect } from 'vitest';

import MainApp from '../MainApp.vue';
import PresentationView from '../PresentationView.vue';
import LoginView from '../LoginView.vue';
import TableView from '../TableView.vue';
import StatisticsView from '../StatisticsView.vue';

const clearCookies = () => {
    const cookies = document.cookie ? document.cookie.split(';') : [];

    for (const cookie of cookies) {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
};

describe('MainApp.vue - Routing Logic', () => {
    beforeEach(() => {
        clearCookies();
    });

    it('1. Renders PresentationView by default on startup', () => {
        const wrapper = mount(MainApp);


        expect(wrapper.findComponent(PresentationView).exists()).toBe(true);

        expect(wrapper.findComponent(LoginView).exists()).toBe(false);
        expect(wrapper.findComponent(TableView).exists()).toBe(false);
    });

    it('2. Navigates to LoginView when receiving "login" event', async () => {
        const wrapper = mount(MainApp);
        const presentationComponent = wrapper.findComponent(PresentationView);


        await presentationComponent.vm.$emit('navigate', 'login');


        expect(wrapper.findComponent(LoginView).exists()).toBe(true);
        expect(wrapper.findComponent(PresentationView).exists()).toBe(false);
    });

    it('3. Navigates to TableView when receiving "table" event', async () => {
        const wrapper = mount(MainApp);


        await wrapper.findComponent(PresentationView).vm.$emit('navigate', 'table');


        expect(wrapper.findComponent(TableView).exists()).toBe(true);
        expect(wrapper.findComponent(PresentationView).exists()).toBe(false);
    });

    it('4. Navigates from TableView to StatisticsView and back to TableView', async () => {
        const wrapper = mount(MainApp);

        await wrapper.findComponent(PresentationView).vm.$emit('navigate', 'table');
        expect(wrapper.findComponent(TableView).exists()).toBe(true);

        await wrapper.findComponent(TableView).vm.$emit('navigate', 'statistics');
        expect(wrapper.findComponent(StatisticsView).exists()).toBe(true);
        expect(wrapper.findComponent(TableView).exists()).toBe(false);

        await wrapper.findComponent(StatisticsView).vm.$emit('navigate', 'table');
        expect(wrapper.findComponent(TableView).exists()).toBe(true);
        expect(wrapper.findComponent(StatisticsView).exists()).toBe(false);
    });
});
