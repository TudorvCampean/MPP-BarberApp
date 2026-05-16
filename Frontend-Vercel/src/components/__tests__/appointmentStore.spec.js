import { describe, it, expect, beforeEach, vi } from 'vitest';
// Corectat: Importăm funcțiile individuale exact cum sunt ele definite în store-ul tău
import {
    appointments,
    loadAllAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointmentById
} from '../../domain/appointmentStore';

global.fetch = vi.fn();

describe('appointmentStore.js - API-backed repository', () => {
    beforeEach(() => {
        // Corectat: Setăm `appointments.value` pentru că este un ref de Vue
        appointments.value = []; 
        vi.clearAllMocks();
    });

    it('adds a valid appointment via API and maps fields', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: {
                    id: 1,
                    client_name: 'Tudor',
                    date: '2026-10-10',
                    time: '10:00:00',
                    status: 'scheduled'
                }
            })
        });

        const response = await addAppointment({ clientName: 'Tudor', date: '2026-10-10', time: '10:00' });
        expect(response.success).toBe(true);
        expect(appointments.value.length).toBe(1);
        expect(appointments.value[0].clientName).toBe('Tudor');
    });

    it('rejects invalid appointment before calling API', async () => {
        const response = await addAppointment({ clientName: '', date: '2020-01-01', time: '10:00' });
        expect(response.success).toBe(false);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('updates an existing appointment via API', async () => {
        appointments.value = [{ id: 1, clientName: 'Old', date: '2026-05-05', time: '10:00', status: 'upcoming' }];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: {
                    id: 1,
                    client_name: 'New Name',
                    date: '2026-06-06',
                    time: '12:00',
                    status: 'scheduled'
                }
            })
        });

        const response = await updateAppointment({ id: 1, clientName: 'New Name', date: '2026-06-06', time: '12:00' });
        expect(response.success).toBe(true);
        expect(appointments.value[0].clientName).toBe('New Name');
    });

    it('allows completing a historical appointment without failing past-date validation', async () => {
        appointments.value = [{ id: 99, clientName: 'History', date: '2020-01-01', time: '10:00', status: 'upcoming' }];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: {
                    id: 99,
                    client_name: 'History',
                    date: '2020-01-01',
                    time: '10:00',
                    status: 'completed'
                }
            })
        });

        const response = await updateAppointment({ id: 99, clientName: 'History', date: '2020-01-01', time: '10:00', status: 'completed' });
        expect(response.success).toBe(true);
        expect(appointments.value[0].status).toBe('completed');
    });

    it('returns normalized server-side validation errors', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 422,
            json: async () => ({
                message: 'Validation failed',
                errors: { time: ['Invalid format'] }
            })
        });

        const response = await addAppointment({ clientName: 'Test', date: '2026-10-10', time: '10:00' });
        expect(response.success).toBe(false);
        expect(response.errors.time).toBe('Invalid format');
    });

    it('deletes appointment by id via API', async () => {
        appointments.value = [{ id: 1 }, { id: 2 }];
        global.fetch.mockResolvedValueOnce({ ok: true, status: 204 });

        await deleteAppointmentById(1);
        expect(appointments.value.length).toBe(1);
        expect(appointments.value[0].id).toBe(2);
    });

    it('loads all pages from paginated endpoint', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: [{ id: 1, client_name: 'A', date: '2026-01-01', time: '10:00' }],
                meta: { last_page: 1 }
            })
        });

        await loadAllAppointments();
        expect(appointments.value.length).toBe(1);
    });

    it('logs out and redirects when receiving a 401 Unauthorized', async () => {
        delete window.location;
        window.location = { href: '' };

        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ message: 'Unauthenticated.' })
        });

        try {
            await loadAllAppointments();
        } catch (e) {
            // Este așteptat să arunce eroarea "Session expired"
        }

        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(window.location.href).toBe('/');
    });
});