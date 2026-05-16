import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TableView from '../TableView.vue';
import * as appointmentStore from '../../domain/appointmentStore';
import * as authStore from '../../domain/authStore';

// 1. Facem mock pentru store-ul de autentificare
vi.mock('../../domain/authStore', () => ({
    logout: vi.fn(),
    currentUser: { value: { name: 'Barber Admin' } }
}));

// 2. Facem mock pentru store-ul de programări
vi.mock('../../domain/appointmentStore', async () => {
    const { ref } = await import('vue');
    return {
        appointments: ref([]),
        loadAllAppointments: vi.fn(),
        addAppointment: vi.fn(),
        updateAppointment: vi.fn(),
        deleteAppointmentById: vi.fn(),
    };
});

const baseData = [
    { id: 1, clientName: 'Ionut Popa', date: '2030-01-10', time: '12:00', status: 'upcoming', income: null },
    { id: 2, clientName: 'Marius Stan', date: '2030-01-10', time: '14:30', status: 'completed', income: 120 },
];

describe('TableView.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        appointmentStore.appointments.value = JSON.parse(JSON.stringify(baseData));
        appointmentStore.loadAllAppointments.mockResolvedValue(true);

        appointmentStore.addAppointment.mockImplementation(async (payload) => {
            appointmentStore.appointments.value.push({ ...payload, id: 99, status: payload.status ?? 'upcoming', income: payload.income ?? null });
            return { success: true, errors: {} };
        });

        appointmentStore.updateAppointment.mockResolvedValue({ success: true, errors: {} });

        appointmentStore.deleteAppointmentById.mockImplementation(async (id) => {
            appointmentStore.appointments.value = appointmentStore.appointments.value.filter((item) => item.id !== id);
            return true;
        });
    });

    it('loads appointments and calls authStore.logout() on exit', async () => {
        const wrapper = mount(TableView);
        await wrapper.vm.$nextTick();

        expect(appointmentStore.loadAllAppointments).toHaveBeenCalled();
        expect(wrapper.text()).toContain('Showing 2 of 2 appointments');

        // Apăsăm butonul de logout
        await wrapper.get('[data-testid="table-logout"]').trigger('click');
        
        // Acum verificăm corect dacă s-a declanșat funcția din store
        expect(authStore.logout).toHaveBeenCalled();
    });

    it('creates an appointment through store action', async () => {
        const wrapper = mount(TableView);

        await wrapper.get('[data-testid="table-add-appointment"]').trigger('click');
        await wrapper.get('[data-testid="appointment-client-name"]').setValue('API Client');
        await wrapper.get('[data-testid="appointment-date"]').setValue('2030-01-11');
        await wrapper.get('form').trigger('submit.prevent');
        await wrapper.vm.$nextTick();

        expect(appointmentStore.addAppointment).toHaveBeenCalled();
        expect(wrapper.text()).toContain('Showing 3 of 3 appointments');
    });

    it('shows backend validation errors in the form', async () => {
        appointmentStore.addAppointment.mockResolvedValueOnce({
            success: false,
            errors: { time: 'The selected time slot is already booked for this date.' },
        });

        const wrapper = mount(TableView);

        await wrapper.get('[data-testid="table-add-appointment"]').trigger('click');
        await wrapper.get('[data-testid="appointment-client-name"]').setValue('Busy Slot');
        await wrapper.get('[data-testid="appointment-date"]').setValue('2030-01-10');
        await wrapper.get('form').trigger('submit.prevent');
        await wrapper.vm.$nextTick();

        expect(wrapper.text()).toContain('already booked');
    });

    it('deletes appointment after modal confirmation', async () => {
        const wrapper = mount(TableView);

        await wrapper.find('button[title="Delete"]').trigger('click');
        await wrapper.get('[data-testid="delete-confirm"]').trigger('click');
        await wrapper.vm.$nextTick();

        expect(appointmentStore.deleteAppointmentById).toHaveBeenCalledWith(1);
        expect(wrapper.text()).toContain('Showing 1 of 1 appointments');
    });
});