import { mount } from '@vue/test-utils';
import { beforeEach, describe, it, expect } from 'vitest';

import MainApp from '../MainApp.vue';
import PresentationView from '../PresentationView.vue';
import LoginView from '../LoginView.vue';
import TableView from '../TableView.vue';
import StatisticsView from '../StatisticsView.vue';
import { clearBrowserState, updateBrowserState } from '../../domain/browserState';

describe('MainApp.vue - Routing Logic', () => {
    beforeEach(() => {
        clearBrowserState();
        updateBrowserState({
            lastPage: 'presentation',
            tableViewMode: 'table',
            lastAction: null,
            activity: [],
        });
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
