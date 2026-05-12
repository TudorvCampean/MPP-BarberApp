import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    addAppointment,
    appointments,
    deleteAppointmentById,
    loadAllAppointments,
    updateAppointment,
} from '../../domain/appointmentStore';
beforeEach(() => {
    localStorage.setItem('auth_token', 'test-token'); // Adaugă un token fictiv pentru teste
    vi.clearAllMocks();
});
const mockFetchResponse = (payload, ok = true, status = 200) => ({
    ok,
    status,
    json: vi.fn().mockResolvedValue(payload),
});

describe('appointmentStore.js - API-backed repository', () => {
    beforeEach(() => {
        appointments.value = [];
        vi.restoreAllMocks();
    });

    it('adds a valid appointment via API and maps fields', async () => {
        global.fetch = vi.fn().mockResolvedValue(
            mockFetchResponse({
                data: {
                    id: 11,
                    client_name: 'Test Client',
                    date: '2030-01-01',
                    time: '10:00',
                    status: 'upcoming',
                    income: null,
                },
            }),
        );

        const result = await addAppointment({
            clientName: 'Test Client',
            date: '2030-01-01',
            time: '10:00',
            status: 'upcoming',
        });

        expect(result.success).toBe(true);
        expect(appointments.value).toHaveLength(1);
        expect(appointments.value[0].clientName).toBe('Test Client');
    });

    it('rejects invalid appointment before calling API', async () => {
        global.fetch = vi.fn();

        const result = await addAppointment({ clientName: '' });

        expect(result.success).toBe(false);
        expect(result.errors.clientName).toBeTruthy();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('updates an existing appointment via API', async () => {
        appointments.value = [
            { id: 7, clientName: 'Old Name', date: '2030-01-01', time: '09:00', status: 'upcoming', income: null },
        ];

        global.fetch = vi.fn().mockResolvedValue(
            mockFetchResponse({
                data: {
                    id: 7,
                    client_name: 'New Name',
                    date: '2030-01-01',
                    time: '09:00',
                    status: 'upcoming',
                    income: null,
                },
            }),
        );

        const result = await updateAppointment({
            id: 7,
            clientName: 'New Name',
            date: '2030-01-01',
            time: '09:00',
            status: 'upcoming',
        });

        expect(result.success).toBe(true);
        expect(appointments.value[0].clientName).toBe('New Name');
    });

    it('allows completing a historical appointment without failing past-date validation', async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 2);
        const pastDateStr = pastDate.toISOString().split('T')[0];

        appointments.value = [
            { id: 21, clientName: 'History Client', date: pastDateStr, time: '10:00', status: 'upcoming', income: null },
        ];

        global.fetch = vi.fn().mockResolvedValue(
            mockFetchResponse({
                data: {
                    id: 21,
                    client_name: 'History Client',
                    date: pastDateStr,
                    time: '10:00',
                    status: 'completed',
                    income: 75,
                },
            }),
        );

        const result = await updateAppointment({
            id: 21,
            clientName: 'History Client',
            date: pastDateStr,
            time: '10:00',
            status: 'completed',
            income: 75,
        });

        expect(result.success).toBe(true);
        expect(appointments.value[0].status).toBe('completed');
        expect(appointments.value[0].income).toBe(75);
    });

    it('returns normalized server-side validation errors', async () => {
        global.fetch = vi.fn().mockResolvedValue(
            mockFetchResponse(
                {
                    message: 'The given data was invalid.',
                    errors: {
                        time: ['The selected time slot is already booked for this date.'],
                    },
                },
                false,
                422,
            ),
        );

        const result = await updateAppointment({
            id: 99,
            clientName: 'Ghost',
            date: '2030-01-01',
            time: '10:00',
            status: 'upcoming',
        });

        expect(result.success).toBe(false);
        expect(result.errors.time).toContain('already booked');
    });

    it('deletes appointment by id via API', async () => {
        appointments.value = [{ id: 1, clientName: 'Test', date: '2030-01-01', time: '08:00', status: 'upcoming', income: null }];
        global.fetch = vi.fn().mockResolvedValue(mockFetchResponse(null, true, 204));

        const deleted = await deleteAppointmentById(1);

        expect(deleted).toBe(true);
        expect(appointments.value).toHaveLength(0);
    });

    it('loads all pages from paginated endpoint', async () => {
        global.fetch = vi
            .fn()
            .mockResolvedValueOnce(
                mockFetchResponse({
                    data: [{ id: 1, client_name: 'A', date: '2030-01-01', time: '08:00', status: 'upcoming', income: null }],
                    meta: { page: 1, per_page: 100, total: 2, last_page: 2 },
                }),
            )
            .mockResolvedValueOnce(
                mockFetchResponse({
                    data: [{ id: 2, client_name: 'B', date: '2030-01-02', time: '09:00', status: 'completed', income: 50 }],
                    meta: { page: 2, per_page: 100, total: 2, last_page: 2 },
                }),
            );

        const loaded = await loadAllAppointments();

        expect(loaded).toBe(true);
        expect(appointments.value).toHaveLength(2);
        expect(appointments.value[1].clientName).toBe('B');
    });
    it('logs out and redirects when receiving a 401 Unauthorized', async () => {
        // Simulăm un token expirat (401)
        global.fetch = vi.fn().mockResolvedValue(mockFetchResponse({ message: 'Unauthorized' }, false, 401));

        // Mock-uim window.location pentru a nu da eroare în test
        delete window.location;
        window.location = { href: vi.fn() };

        try {
            await loadAllAppointments();
        } catch (e) {
            // Ne așteptăm să arunce eroarea "Session expired" definită în request
        }

        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(window.location.href).toBe('/login');
    });
});
