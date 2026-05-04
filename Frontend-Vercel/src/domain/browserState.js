const COOKIE_NAME = 'elitecuts_browser_state_v1';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const MAX_ACTIVITY_ITEMS = 12;

const DEFAULT_STATE = {
    lastPage: 'presentation',
    tableViewMode: 'table',
    lastAction: 'app_open',
    lastActionAt: null,
    activity: [],
};

const isBrowser = () => typeof document !== 'undefined';

const safeParse = (value) => {
    try {
        return JSON.parse(decodeURIComponent(value));
    } catch {
        return null;
    }
};

const getCookieValue = (name) => {
    if (!isBrowser()) return null;

    const parts = document.cookie ? document.cookie.split('; ') : [];
    const match = parts.find((part) => part.startsWith(`${name}=`));

    return match ? match.slice(name.length + 1) : null;
};

const normalizeActivity = (activity) => {
    if (!Array.isArray(activity)) return [];

    return activity
        .filter((item) => item && typeof item === 'object')
        .slice(-MAX_ACTIVITY_ITEMS);
};

const normalizeState = (state) => {
    const safeState = state && typeof state === 'object' ? state : {};

    return {
        ...DEFAULT_STATE,
        ...safeState,
        activity: normalizeActivity(safeState.activity),
    };
};

const writeCookie = (state) => {
    if (!isBrowser()) return;

    document.cookie = [
        `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(state))}`,
        'path=/',
        `max-age=${COOKIE_MAX_AGE_SECONDS}`,
        'samesite=lax',
    ].join('; ');
};

export const readBrowserState = () => {
    const raw = getCookieValue(COOKIE_NAME);
    if (!raw) return { ...DEFAULT_STATE };

    const parsed = safeParse(raw);
    return normalizeState(parsed);
};

export const recordBrowserEvent = (action, value = null, meta = {}) => {
    const currentState = readBrowserState();
    const timestamp = new Date().toISOString();
    const activityEntry = { action, value, at: timestamp, meta };

    const nextState = normalizeState({
        ...currentState,
        lastAction: action,
        lastActionValue: value,
        lastActionAt: timestamp,
        activity: [...currentState.activity, activityEntry].slice(-MAX_ACTIVITY_ITEMS),
    });

    if (action === 'navigate') {
        nextState.lastPage = value || nextState.lastPage;
    }

    if (action === 'table_view_mode') {
        nextState.tableViewMode = value || nextState.tableViewMode;
    }

    writeCookie(nextState);
    return nextState;
};

export const updateBrowserState = (patch = {}) => {
    const currentState = readBrowserState();
    const nextState = normalizeState({
        ...currentState,
        ...patch,
        activity: normalizeActivity(patch.activity ?? currentState.activity),
    });

    writeCookie(nextState);
    return nextState;
};

export const clearBrowserState = () => {
    if (!isBrowser()) return;

    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
};

export const BROWSER_STATE_COOKIE_NAME = COOKIE_NAME;

