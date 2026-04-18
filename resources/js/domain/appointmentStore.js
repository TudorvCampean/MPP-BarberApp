import { ref } from 'vue';
import { validateAppointment } from './appointmentModel';
// --- RAM DATABASE  ---
export const appointments = ref([
    { id: 1, clientName: 'Ionut Popa', date: '2026-03-10', time: '12:00' },
    { id: 2, clientName: 'Marius Stan', date: '2026-03-10', time: '14:30' },
    { id: 3, clientName: 'Alexandru Vlad', date: '2026-03-11', time: '09:00' },
    { id: 4, clientName: 'Cristian Radu', date: '2026-03-11', time: '11:15' },
    { id: 5, clientName: 'Bogdan Ionescu', date: '2026-03-12', time: '16:00' },
    { id: 6, clientName: 'Tudor Dumitru', date: '2026-03-12', time: '17:30' },
]);

export const addAppointment = (newApt) => {
    const { isValid } = validateAppointment(newApt);
    if (isValid) {
        appointments.value.push({ ...newApt });
        return true;
    }
    return false;
};

export const updateAppointment = (updatedApt) => {
    const index = appointments.value.findIndex(a => a.id === updatedApt.id);
    const { isValid } = validateAppointment(updatedApt);

    if (index !== -1 && isValid) {
        appointments.value[index] = { ...updatedApt };
        return true;
    }
    return false;
};

export const deleteAppointmentById = (id) => {
    appointments.value = appointments.value.filter(a => a.id !== id);
};
