import { ref } from 'vue';
import { validateAppointment } from './appointmentModel';
import { clearBrowserState } from './browserState';

const getApiBase = () => {
    // Preia link-ul Backend-ului de pe Vercel. Dacă ești local, folosește '' pentru proxy.
    const origin = import.meta.env.VITE_API_BASE_URL || '';
    return `${origin}/api/appointments`;
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
    // 1. Citim token-ul AICI, la fiecare cerere, pentru a fi siguri că e cel actual
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${getApiBase()}${path}`, {
        method: options.method || 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Formatul cerut pentru Assignment 4
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        // 2. IMPORTANT: Adaugă body-ul, altfel POST/PUT nu vor trimite date!
        body: options.body,
    });

    // 3. Gestionarea Sesiunii (Inactivitate/Expirare Token)
    if (response.status === 401) {
        localStorage.removeItem('auth_token');

        // Folosim funcția nativă care știe numele corect al cookie-ului
        clearBrowserState();

        // Mergem pe root, MainApp va decide ce să afișeze (implicit Presentation/Login)
        window.location.href = '/';
        throw new Error('Session expired');
    }

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
