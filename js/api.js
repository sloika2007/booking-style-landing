const BookingAPI = (function () {
    const LOCAL_KEY = 'bookingLandingConfig';
    const LOCAL_AUTH_KEY = 'bookingLandingAuth';
    let mode = 'local';

    function defaultConfig() {
        return {
            macUrl: '',
            windowsUrl: '',
            macClipboardText: '',
            windowsClipboardText: '',
            macCopies: 0,
            windowsCopies: 0,
            adminPassword: 'Dulma5221'
        };
    }

    function normalizeConfig(data) {
        const mac = data.macCopies ?? data.macDownloads ?? 0;
        const win = data.windowsCopies ?? data.windowsDownloads ?? 0;
        return {
            macUrl: data.macUrl || '',
            windowsUrl: data.windowsUrl || '',
        macClipboardText: data.macClipboardText || '',
        windowsClipboardText: data.windowsClipboardText || '',
            macCopies: mac,
            windowsCopies: win,
            totalCopies: mac + win,
            adminPassword: data.adminPassword || 'Dulma5221'
        };
    }

    function readLocalConfig() {
        try {
            const raw = localStorage.getItem(LOCAL_KEY);
            return normalizeConfig(raw ? JSON.parse(raw) : defaultConfig());
        } catch (e) {
            return normalizeConfig(defaultConfig());
        }
    }

    function writeLocalConfig(config) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(config));
    }

    function detectPlatform() {
        const ua = navigator.userAgent.toLowerCase();
        return /mac|iphone|ipad|ipod/.test(ua) ? 'mac' : 'windows';
    }

    async function tryFetch(url, options) {
        const res = await fetch(url, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.error || 'Request failed');
        }
        return data;
    }

    async function detectMode() {
        try {
            const res = await fetch('/api/config', { credentials: 'include' });
            if (res.ok) {
                mode = 'server';
                return mode;
            }
        } catch (e) { /* continue */ }

        try {
            const res = await fetch('api.php?action=config', { credentials: 'include' });
            if (res.ok) {
                mode = 'php';
                return mode;
            }
        } catch (e) { /* continue */ }

        mode = 'local';
        return mode;
    }

    function getModeLabel() {
        if (mode === 'server') return 'Режим: Node.js сервер';
        if (mode === 'php') return 'Режим: PHP API';
        return 'Режим: локальный (браузер)';
    }

    function apiUrl(action) {
        if (mode === 'server') {
            const map = {
                config: '/api/config',
                'captcha-copy': '/api/captcha-copy',
                download: '/api/download',
                login: '/api/login',
                logout: '/api/logout',
                stats: '/api/stats',
                'save-config': '/api/save-config',
                'reset-counters': '/api/reset-counters'
            };
            return map[action];
        }
        return 'api.php?action=' + action;
    }

    async function request(action, options) {
        await detectMode();
        if (mode === 'local') {
            throw new Error('local');
        }
        return tryFetch(apiUrl(action), options);
    }

    async function trackCaptchaCopy(platform) {
        platform = platform || detectPlatform();

        try {
            await detectMode();
            if (mode === 'local') {
                const config = readLocalConfig();
                const key = platform === 'mac' ? 'macCopies' : 'windowsCopies';
                config[key] = (config[key] || 0) + 1;
                writeLocalConfig(config);
                return normalizeConfig(config);
            }
            return await request('captcha-copy', {
                method: 'POST',
                body: JSON.stringify({ platform })
            });
        } catch (e) {
            if (e.message === 'local' || mode === 'local') {
                const config = readLocalConfig();
                const key = platform === 'mac' ? 'macCopies' : 'windowsCopies';
                config[key] = (config[key] || 0) + 1;
                writeLocalConfig(config);
                return normalizeConfig(config);
            }
            throw e;
        }
    }

    async function getConfig() {
        await detectMode();
        if (mode === 'local') {
            return readLocalConfig();
        }
        if (mode === 'server') {
            return tryFetch('/api/config');
        }
        return tryFetch('api.php?action=config');
    }

    async function download(platform) {
        await detectMode();

        if (mode === 'local') {
            const config = readLocalConfig();
            const url = platform === 'mac' ? config.macUrl : config.windowsUrl;
            if (!url) throw new Error('Download link not configured');
            return { url, platform };
        }

        if (mode === 'server') {
            return tryFetch('/api/download/' + platform, { method: 'POST' });
        }

        return tryFetch('api.php?action=download', {
            method: 'POST',
            body: JSON.stringify({ platform })
        });
    }

    async function adminLogin(password) {
        await detectMode();

        if (mode === 'local') {
            const config = readLocalConfig();
            if (password !== config.adminPassword) {
                throw new Error('Invalid password');
            }
            localStorage.setItem(LOCAL_AUTH_KEY, '1');
            return { success: true };
        }

        return request('login', {
            method: 'POST',
            body: JSON.stringify({ password })
        });
    }

    async function adminLogout() {
        await detectMode();

        if (mode === 'local') {
            localStorage.removeItem(LOCAL_AUTH_KEY);
            return { success: true };
        }
        try {
            return await request('logout', { method: 'POST' });
        } catch (e) {
            localStorage.removeItem(LOCAL_AUTH_KEY);
            return { success: true };
        }
    }

    async function adminIsAuthenticated() {
        await detectMode();
        if (mode === 'local') {
            return localStorage.getItem(LOCAL_AUTH_KEY) === '1';
        }
        try {
            await request('stats');
            return true;
        } catch (e) {
            return false;
        }
    }

    async function adminGetStats() {
        await detectMode();

        if (mode === 'local') {
            return readLocalConfig();
        }

        return request('stats');
    }

    async function adminResetCounters() {
        await detectMode();

        if (mode === 'local') {
            const config = readLocalConfig();
            config.macCopies = 0;
            config.windowsCopies = 0;
            writeLocalConfig(config);
            return { success: true };
        }

        return request('reset-counters', { method: 'POST' });
    }

    async function adminSaveConfig(payload) {
        await detectMode();

        if (mode === 'local') {
            const config = readLocalConfig();
            if (payload.macUrl !== undefined) config.macUrl = payload.macUrl.trim();
            if (payload.windowsUrl !== undefined) config.windowsUrl = payload.windowsUrl.trim();
            if (payload.macClipboardText !== undefined) config.macClipboardText = payload.macClipboardText;
            if (payload.windowsClipboardText !== undefined) config.windowsClipboardText = payload.windowsClipboardText;
            if (payload.adminPassword) config.adminPassword = payload.adminPassword.trim();
            writeLocalConfig(config);
            return { success: true };
        }

        return request('save-config', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    return {
        detectMode,
        getModeLabel,
        detectPlatform,
        getConfig,
        trackCaptchaCopy,
        download,
        adminLogin,
        adminLogout,
        adminIsAuthenticated,
        adminGetStats,
        adminResetCounters,
        adminSaveConfig
    };
})();
