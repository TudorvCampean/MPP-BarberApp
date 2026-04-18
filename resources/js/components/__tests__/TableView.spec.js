import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import TableView from '../TableView.vue';
import { appointments } from '../../domain/appointmentStore';

const initialData = [
    { id: 1, clientName: 'Ionut Popa', date: '2026-03-10', time: '12:00' },
    { id: 2, clientName: 'Marius Stan', date: '2026-03-10', time: '14:30' },
    { id: 3, clientName: 'Alexandru Vlad', date: '2026-03-11', time: '09:00' },
    { id: 4, clientName: 'Cristian Radu', date: '2026-03-11', time: '11:15' },
    { id: 5, clientName: 'Bogdan Ionescu', date: '2026-03-12', time: '16:00' },
    { id: 6, clientName: 'Tudor Dumitru', date: '2026-03-12', time: '17:30' },
];

describe('TableView.vue - Compact & High Coverage Suite', () => {
    let wrapper;

    beforeEach(() => {
        appointments.value = JSON.parse(JSON.stringify(initialData));
        wrapper = mount(TableView);
    });

    it('1. Renders Master View, switches ALL Tabs, and navigates Home', async () => {
        expect(wrapper.text()).toContain('Showing 5 of 6 appointments');


        await wrapper.findAll('button').find(b => b.text().includes('Visual')).trigger('click');
        expect(wrapper.text()).not.toContain('Manage your schedule');

        await wrapper.findAll('button').find(b => b.text().includes('Calendar')).trigger('click');

        await wrapper.findAll('button').find(b => b.text().includes('Table')).trigger('click');
        expect(wrapper.text()).toContain('Manage your schedule');

        await wrapper.find('button.rounded-full').trigger('click');
        expect(wrapper.emitted().navigate[0]).toEqual(['presentation']);
    });

    it('2. Navigates Pagination and handles completely Empty RAM state', async () => {
        const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Next'));
        await nextBtn.trigger('click');
        expect(wrapper.text()).toContain('Page 2');

        const prevBtn = wrapper.findAll('button').find(b => b.text().includes('Previous'));
        await prevBtn.trigger('click');
        expect(wrapper.text()).toContain('Page 1');


        appointments.value = [];
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain('No appointments found in RAM.');
    });

    it('3. Form Validation Flow (Fails empty/partial -> Succeeds full -> Cancels next)', async () => {
        await wrapper.findAll('button').find(b => b.text().includes('Add AppointmentModel')).trigger('click');

        await wrapper.find('form').trigger('submit.prevent');


        const inputs = wrapper.findAll('input');
        await inputs[0].setValue('Test Validare');
        await inputs[2].setValue('10:00');
        await wrapper.find('form').trigger('submit.prevent');

        await inputs[2].setValue('');
        await inputs[1].setValue('2026-04-15');
        await wrapper.find('form').trigger('submit.prevent');

        await inputs[2].setValue('10:00');
        await wrapper.find('form').trigger('submit.prevent');
        expect(wrapper.text()).toContain('Showing 5 of 7 appointments');

        await wrapper.findAll('button').find(b => b.text().includes('Add AppointmentModel')).trigger('click');
        await wrapper.findAll('button').find(b => b.text() === 'Cancel').trigger('click');
        expect(wrapper.text()).not.toContain('New AppointmentModel');
    });

    it('4. Read and Update Flow (Modals & Edit)', async () => {
        await wrapper.find('button[title="View Details"]').trigger('click');
        await wrapper.findAll('.fixed button').at(0).trigger('click');

        await wrapper.find('button[title="Edit"]').trigger('click');
        await wrapper.findAll('input')[0].setValue('Nume Editat');
        await wrapper.find('form').trigger('submit.prevent');

        expect(wrapper.text()).toContain('Nume Editat');
    });

    it('5. Deletes an appointment and handles page fallback', async () => {
        window.confirm = () => true;

        const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Next'));
        await nextBtn.trigger('click');

        await wrapper.find('button[title="Delete"]').trigger('click');

        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain('Page 1');
        expect(wrapper.text()).toContain('Showing 5 of 5 appointments');
    });

    it('6. Safely formats fallback dates', async () => {
        appointments.value = [{ id: 999, clientName: 'Error Client', date: 'Soon', time: '12:00' }];
        await wrapper.vm.$nextTick();

        expect(wrapper.text()).toContain('Soon');
    });
});
