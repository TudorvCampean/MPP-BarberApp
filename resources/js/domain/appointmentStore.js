import { ref } from 'vue';
import { validateAppointment } from './appointmentModel';
const API_BASE = '/api/appointments';
const FALLBACK_APPOINTMENTS = [
    { id: 1, clientName: 'Ionut Popa', date: '2026-03-10', time: '12:00', status: 'upcoming', income: null },
    { id: 2, clientName: 'Marius Stan', date: '2026-03-10', time: '14:30', status: 'completed', income: 120 },
    { id: 3, clientName: 'Alexandru Vlad', date: '2026-03-11', time: '09:00', status: 'upcoming', income: null },
];

export const appointments = ref([...FALLBACK_APPOINTMENTS]);
export const appointmentsLoading = ref(false);
export const appointmentsError = ref(null);

const mapApiToClient = (apt) => ({
    id: apt.id,
    clientName: apt.client_name,
    date: apt.date,
    time: apt.time,
    status: apt.status,
    income: apt.income,
});

const mapClientToApi = (apt) => ({
    client_name: apt.clientName,
    date: apt.date,
    time: apt.time,
    status: apt.status,
    income: apt.income,
});

const setError = (error) => {
    appointmentsError.value = error?.response?.data?.message || error?.message || 'Unknown API error';
};

export const loadAppointments = async ({ page = 1, perPage = 100, status, dateFrom, dateTo } = {}) => {
    appointmentsLoading.value = true;
    appointmentsError.value = null;

    try {
        const response = await window.axios.get(API_BASE, {
            params: {
                page,
                per_page: perPage,
                status,
                date_from: dateFrom,
                date_to: dateTo,
            },
        });

        appointments.value = (response.data?.data || []).map(mapApiToClient);
        return true;
    } catch (error) {
        setError(error);
        return false;
    } finally {
        appointmentsLoading.value = false;
    }
};

// We aggregate all pages for views (calendar/history) that need the full in-memory set.
export const loadAllAppointments = async ({ status, dateFrom, dateTo } = {}) => {
    appointmentsLoading.value = true;
    appointmentsError.value = null;

    try {
        let page = 1;
        let lastPage = 1;
        const accumulator = [];

        do {
            const response = await window.axios.get(API_BASE, {
                params: {
                    page,
                    per_page: 100,
                    status,
                    date_from: dateFrom,
                    date_to: dateTo,
                },
            });

            const chunk = (response.data?.data || []).map(mapApiToClient);
            accumulator.push(...chunk);

            lastPage = response.data?.meta?.last_page || 1;
            page += 1;
        } while (page <= lastPage);

        appointments.value = accumulator;
        return true;
    } catch (error) {
        setError(error);
        return false;
    } finally {
        appointmentsLoading.value = false;
    }
};

export const addAppointment = async (newApt) => {
    const { isValid } = validateAppointment(newApt);

    if (!isValid) {
        return false;
    }

    try {
        await window.axios.post(API_BASE, mapClientToApi(newApt));
        await loadAllAppointments();
        return true;
    } catch (error) {
        setError(error);
        return false;
    }
};

export const updateAppointment = async (updatedApt) => {
    const { isValid } = validateAppointment(updatedApt);

    if (!isValid) {
        return false;
    }

    try {
        await window.axios.put(`${API_BASE}/${updatedApt.id}`, mapClientToApi(updatedApt));
        await loadAllAppointments();
        return true;
    } catch (error) {
        setError(error);
        return false;
    }
};

export const deleteAppointmentById = async (id) => {
    try {
        await window.axios.delete(`${API_BASE}/${id}`);
        await loadAllAppointments();
        return true;
    } catch (error) {
        setError(error);
        return false;
    }
};
