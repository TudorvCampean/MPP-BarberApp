import { ref } from 'vue';
import { validateAppointment } from './appointmentModel';

// If the app is deployed somewhere but needs to talk to a tunneled/local backend (e.g. herd share),
// the hosting entrypoint can set `window.__API_BASE__` (see `src/main.js`). If present, build an
// absolute API base like `${window.__API_BASE__}/api/appointments`. Otherwise fall back to the
// relative path which targets the same origin (`/api/appointments`).
//
// NOTE: This is evaluated lazily (at call time) because main.js sets window.__API_BASE__
// AFTER importing this module, so a top-level check would always see undefined.
const getApiBase = () => {
    if (typeof window !== 'undefined' && window.__API_BASE__) {
        const origin = String(window.__API_BASE__).replace(/\/$/, '');
        return `${origin}/api/appointments`;
    }
    return '/api/appointments';
};
const DEFAULT_PER_PAGE = 100;

export const appointments = ref([]);
export const isLoadingAppointments = ref(false);
export const appointmentsError = ref(null);

const mapFromApi = (appointment) => ({
    id: appointment.id,
    clientName: appointment.client_name,
    date: appointment.date,
    time: appointment.time,
    status: appointment.status,
    income: appointment.income,
});

const mapToApi = (appointment) => ({
    client_name: appointment.clientName,
    date: appointment.date,
    time: appointment.time,
    status: appointment.status ?? 'upcoming',
    income: appointment.income ?? null,
});

const normalizeApiErrors = (payload) => {
    if (!payload || typeof payload !== 'object') {
        return { general: 'Unexpected server error.' };
    }

    if (payload.errors && typeof payload.errors === 'object') {
        const entries = Object.entries(payload.errors).map(([key, value]) => {
            const mappedKey = key === 'client_name' ? 'clientName' : key;
            return [mappedKey, Array.isArray(value) ? value[0] : String(value)];
        });

        return Object.fromEntries(entries);
    }

    if (typeof payload.message === 'string' && payload.message.length > 0) {
        return { general: payload.message };
    }

    return { general: 'Unexpected server error.' };
};

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const request = async (path = '', options = {}) => {
    const response = await fetch(`${getApiBase()}${path}`, {
        method: options.method || 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        body: options.body,
    });

    const payload = await safeJson(response);

    if (!response.ok) {
        const error = new Error('API request failed');
        error.status = response.status;
        error.payload = payload;
        throw error;
    }

    return payload;
};

const fetchAllPages = async () => {
    let page = 1;
    let lastPage = 1;
    const result = [];

    while (page <= lastPage) {
        const payload = await request(`?page=${page}&per_page=${DEFAULT_PER_PAGE}`);
        const pageData = Array.isArray(payload?.data) ? payload.data : [];
        result.push(...pageData);

        lastPage = payload?.meta?.last_page ?? page;
        page += 1;
    }

    return result;
};

export const loadAllAppointments = async () => {
    appointmentsError.value = null;
    isLoadingAppointments.value = true;

    try {
        const data = await fetchAllPages();
        appointments.value = data.map(mapFromApi);
        return true;
    } catch {
        appointmentsError.value = 'Could not load appointments from server.';
        appointments.value = [];
        return false;
    } finally {
        isLoadingAppointments.value = false;
    }
};

export const addAppointment = async (newApt) => {
    const { isValid, errors } = validateAppointment(newApt);

    if (!isValid) {
        return { success: false, errors };
    }

    try {
        const payload = await request('', {
            method: 'POST',
            body: JSON.stringify(mapToApi(newApt)),
        });

        if (payload?.data) {
            appointments.value.push(mapFromApi(payload.data));
        }

        return { success: true, errors: {} };
    } catch (error) {
        return { success: false, errors: normalizeApiErrors(error.payload) };
    }
};

export const updateAppointment = async (updatedApt) => {
    const { isValid, errors } = validateAppointment(updatedApt, { allowPastDate: true });
    if (!isValid) {
        return { success: false, errors };
    }

    try {
        const payload = await request(`/${updatedApt.id}`, {
            method: 'PUT',
            body: JSON.stringify(mapToApi(updatedApt)),
        });

        const index = appointments.value.findIndex((entry) => entry.id === updatedApt.id);
        if (index !== -1 && payload?.data) {
            appointments.value[index] = mapFromApi(payload.data);
        }

        return { success: true, errors: {} };
    } catch (error) {
        return { success: false, errors: normalizeApiErrors(error.payload) };
    }
};

export const deleteAppointmentById = async (id) => {
    try {
        await request(`/${id}`, { method: 'DELETE' });
        appointments.value = appointments.value.filter((entry) => entry.id !== id);
        return true;
    } catch {
        return false;
    }
};
