export const createDefaultAppointment = () => ({
    id: Date.now() + Math.floor(Math.random() * 1000),
    clientName: '',
    date: '',
    time: '',
    status: 'upcoming'
});

export const validateAppointment = (appointment, options = {}) => {
    const { allowPastDate = false } = options;
    const errors = {};

    // 1. Validare Nume
    if (!appointment.clientName?.trim()) {
        errors.clientName = "Name is required";
    } else if (/\d/.test(appointment.clientName)) {
        errors.clientName = "Name cannot contain numbers";
    }

    // 2. Validare Dată
    if (!appointment.date) {
        errors.date = "Date is required";
    } else {
        // Obținem data de azi în format YYYY-MM-DD
        const todayStr = new Date().toISOString().split('T')[0];
        if (!allowPastDate && appointment.date < todayStr) {
            errors.date = "Appointments cannot be booked in the past";
        }
    }

    // 3. Validare Oră (08:00 - 20:00)
    if (!appointment.time) {
        errors.time = "Time is required";
    } else {
        // Extragem ora ca număr (ex: "08:30" devine 8)
        const hour = parseInt(appointment.time.split(':')[0], 10);
        if (hour < 8 || hour >= 20) {
            errors.time = "Working hours are between 08:00 and 20:00";
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
