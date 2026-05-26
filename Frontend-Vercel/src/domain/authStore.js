import { ref } from 'vue';
import { clearBrowserState } from './browserState';

export const currentUser = ref(null);
export const authError = ref(null);
export const isLoading = ref(false);

const getAuthApiBase = () => {
    // Preia link-ul Backend-ului de pe Vercel, altfel folosește proxy-ul local ('')
    const origin = import.meta.env.VITE_API_BASE_URL || '';
    return `${origin}/api`;
};

/**
 * Loghează un utilizator existent
 */
export const login = async (email, password) => {
    authError.value = null;
    isLoading.value = true;
    try {
        const response = await fetch(`${getAuthApiBase()}/login`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Login failed');

        // Salvează token-ul pentru Bearer authentication
        localStorage.setItem('auth_token', data.access_token);
        currentUser.value = data.user; // Presupunem că API-ul returnează și datele user-ului
        return true;
    } catch (err) {
        authError.value = err.message;
        return false;
    } finally {
        isLoading.value = false;
    }
};

/**
 * Înregistrează un utilizator nou (Cerință Bronze)
 */
export const register = async (name, email, password, password_confirmation) => {
    authError.value = null;
    isLoading.value = true;
    try {
        const response = await fetch(`${getAuthApiBase()}/register`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                password,
                password_confirmation
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Gestionează erorile de validare de la Laravel
            const errorMsg = data.errors ? Object.values(data.errors).flat()[0] : data.message;
            throw new Error(errorMsg || 'Registration failed');
        }

        // După register, logăm utilizatorul automat salvând token-ul
        localStorage.setItem('auth_token', data.access_token);
        currentUser.value = data.user;
        return true;
    } catch (err) {
        authError.value = err.message;
        return false;
    } finally {
        isLoading.value = false;
    }
};

let inactivityTimer = null;
const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minute (ajustează pentru demo la 1 minut)

export const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);

    // Dacă suntem logați, pornim timer-ul
    if (localStorage.getItem('auth_token')) {
        inactivityTimer = setTimeout(() => {
            console.log("User logout due to inactivity");
            logout(); // Funcția de logout pe care am scris-o deja
        }, INACTIVITY_LIMIT);
    }
};

// Ascultăm evenimentele de mouse/tastatură pentru a reseta timer-ul
if (typeof window !== 'undefined') {
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(name => {
        window.addEventListener(name, resetInactivityTimer);
    });
}

/**
 * Șterge sesiunea locală (Logout)
 */
export const logout = () => {
    localStorage.removeItem('auth_token');
    currentUser.value = null;

    // Folosim funcția nativă care știe numele corect al cookie-ului
    clearBrowserState();

    window.location.href = '/';
};

/**
 * Verifică dacă utilizatorul are un token salvat și reface sesiunea la refresh
 */
export const restoreSession = async () => {
    const token = localStorage.getItem('auth_token');

    // Dacă nu avem token în storage, nu facem nimic
    if (!token) {
        currentUser.value = null;
        return false;
    }

    try {
        // Opțional: Aici poți face un request către backend (ex: /api/user)
        // pentru a aduce datele proaspete ale user-ului (nume, rol).
        // Pentru moment, doar refacem starea locală pentru a-l lăsa în aplicație:

        currentUser.value = { isRestored: true }; // Simulează că e logat
        return true;
    } catch (error) {
        // Dacă token-ul a expirat sau e invalid, curățăm tot
        logout();
        return false;
    }
};
