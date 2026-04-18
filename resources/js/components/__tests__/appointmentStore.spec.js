import { describe, it, expect, beforeEach } from 'vitest';
import { appointments, addAppointment, updateAppointment, deleteAppointmentById } from '../../domain/appointmentStore';

describe('appointmentStore.js - Functional Repository', () => {
    beforeEach(() => {
        appointments.value = []; // Reset RAM
    });

    it('1. Adds a valid appointment to the list', () => {
        const success = addAppointment({ clientName: 'Test', date: '2026-03-23', time: '12:00' });
        expect(success).toBe(true);
        expect(appointments.value.length).toBe(1);
    });

    it('2. Rejects adding an invalid appointment', () => {
        const success = addAppointment({ clientName: '' }); // Lipsește data/ora
        expect(success).toBe(false);
        expect(appointments.value.length).toBe(0);
    });

    it('3. Updates an existing appointment object', () => {
        addAppointment({ clientName: 'Old', date: '2026-01-01', time: '10:00' });
        const id = appointments.value[0].id;

        const success = updateAppointment({ id, clientName: 'New', date: '2026-01-01', time: '10:00' });
        expect(success).toBe(true);
        expect(appointments.value[0].clientName).toBe('New');
    });

    it('4. Fails to update if ID does not exist (Line 30 coverage)', () => {
        const result = updateAppointment({ id: 999, clientName: 'Ghost', date: '2026-01-01', time: '10:00' });
        expect(result).toBe(false);
    });

    it('5. Fails to update if data is invalid (Line 30 coverage)', () => {
        const result = updateAppointment({ id: 1, clientName: '', date: '2026-01-01', time: '10:00' });
        expect(result).toBe(false);
    });

    it('6. Deletes an appointment by ID', () => {
        appointments.value = [{ id: 1, clientName: 'Test' }];

        deleteAppointmentById(1);
        expect(appointments.value.length).toBe(0);
    });
});
