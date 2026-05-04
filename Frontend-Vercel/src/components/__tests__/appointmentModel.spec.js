import { describe, it, expect } from 'vitest';
import { validateAppointment, createDefaultAppointment } from '../../domain/appointmentModel';

describe('appointmentModel.js - Functional Validation', () => {
    const futureDateString = (daysAhead = 5) => {
        const date = new Date();
        date.setDate(date.getDate() + daysAhead);
        return date.toISOString().split('T')[0];
    };

    it('1. Returns errors for empty appointment objects', () => {
        const emptyApt = {};
        const { isValid, errors } = validateAppointment(emptyApt);

        expect(isValid).toBe(false);
        expect(errors).toHaveProperty('clientName');
        expect(errors).toHaveProperty('date');
    });

    it('2. Validates a correct appointment object', () => {
        const validApt = { clientName: 'Tudor', date: futureDateString(3), time: '10:00' };
        const { isValid } = validateAppointment(validApt);

        expect(isValid).toBe(true);
    });

    it('3. Generates a default object with a unique ID', () => {
        const defaultApt = createDefaultAppointment();
        expect(defaultApt).toHaveProperty('id');
        expect(defaultApt.clientName).toBe('');
    });

    it('4. Rejects names containing numbers', () => {

        const invalidApt = {
            clientName: 'Tudor123',
            date: futureDateString(4),
            time: '10:00'
        };

        const { isValid, errors } = validateAppointment(invalidApt);


        expect(isValid).toBe(false);
        expect(errors.clientName).toBe("Name cannot contain numbers");
    });

    it('5. Rejects appointments booked in the past', () => {
        // Generăm o dată de ieri
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        const pastDateStr = pastDate.toISOString().split('T')[0];

        const invalidApt = { clientName: 'Tudor', date: pastDateStr, time: '10:00' };
        const { isValid, errors } = validateAppointment(invalidApt);

        expect(isValid).toBe(false);
        expect(errors.date).toBe("Appointments cannot be booked in the past");
    });

    it('6. Rejects appointments outside working hours (08:00 - 20:00)', () => {
        // O dată validă din viitor
        const futureDateStr = futureDateString(5);

        // Testăm prea devreme
        const earlyApt = { clientName: 'Tudor', date: futureDateStr, time: '07:30' };
        const earlyResult = validateAppointment(earlyApt);

        expect(earlyResult.isValid).toBe(false);
        expect(earlyResult.errors.time).toBe("Working hours are between 08:00 and 20:00");

        // Testăm prea târziu
        const lateApt = { clientName: 'Tudor', date: futureDateStr, time: '21:00' };
        const lateResult = validateAppointment(lateApt);

        expect(lateResult.isValid).toBe(false);
        expect(lateResult.errors.time).toBe("Working hours are between 08:00 and 20:00");
    });
});
