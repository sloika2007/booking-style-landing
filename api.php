<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$configPath = __DIR__ . '/data/config.json';

function readConfig($path) {
    if (!file_exists($path)) {
        $default = [
            'macUrl' => '',
            'windowsUrl' => '',
            'macClipboardText' => '',
            'windowsClipboardText' => '',
            'macCopies' => 0,
            'windowsCopies' => 0,
            'adminPassword' => 'Dulma5221'
        ];
        if (!is_dir(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }
        file_put_contents($path, json_encode($default, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $default;
    }
    return json_decode(file_get_contents($path), true);
}

function writeConfig($path, $config) {
    file_put_contents($path, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function publicConfig($config) {
    $mac = $config['macCopies'] ?? $config['macDownloads'] ?? 0;
    $win = $config['windowsCopies'] ?? $config['windowsDownloads'] ?? 0;
    return [
        'macUrl' => $config['macUrl'] ?? '',
        'windowsUrl' => $config['windowsUrl'] ?? '',
        'macClipboardText' => $config['macClipboardText'] ?? '',
        'windowsClipboardText' => $config['windowsClipboardText'] ?? '',
        'macCopies' => $mac,
        'windowsCopies' => $win,
        'totalCopies' => $mac + $win
    ];
}

function requireAuth() {
    if (empty($_SESSION['authenticated'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

function readBody() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

$action = $_GET['action'] ?? '';
$config = readConfig($configPath);

switch ($action) {
    case 'config':
        echo json_encode(publicConfig($config));
        break;

    case 'captcha-copy':
        $body = readBody();
        $platform = $body['platform'] ?? '';
        if ($platform !== 'mac' && $platform !== 'windows') {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid platform']);
            break;
        }
        $countKey = $platform === 'mac' ? 'macCopies' : 'windowsCopies';
        $legacyKey = $platform === 'mac' ? 'macDownloads' : 'windowsDownloads';
        $config[$countKey] = ($config[$countKey] ?? $config[$legacyKey] ?? 0) + 1;
        writeConfig($configPath, $config);
        $pub = publicConfig($config);
        echo json_encode([
            'platform' => $platform,
            'count' => $config[$countKey],
            'totalCopies' => $pub['totalCopies']
        ]);
        break;

    case 'download':
        $body = readBody();
        $platform = $body['platform'] ?? '';
        if ($platform !== 'mac' && $platform !== 'windows') {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid platform']);
            break;
        }
        $urlKey = $platform === 'mac' ? 'macUrl' : 'windowsUrl';
        if (empty($config[$urlKey])) {
            http_response_code(404);
            echo json_encode(['error' => 'Download link not configured']);
            break;
        }
        echo json_encode([
            'url' => $config[$urlKey],
            'platform' => $platform
        ]);
        break;

    case 'login':
        $body = readBody();
        $password = $body['password'] ?? '';
        if (!$password || $password !== ($config['adminPassword'] ?? '')) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid password']);
            break;
        }
        $_SESSION['authenticated'] = true;
        echo json_encode(['success' => true]);
        break;

    case 'logout':
        session_destroy();
        echo json_encode(['success' => true]);
        break;

    case 'stats':
        requireAuth();
        echo json_encode(publicConfig($config));
        break;

    case 'save-config':
        requireAuth();
        $body = readBody();
        if (isset($body['macUrl'])) $config['macUrl'] = trim($body['macUrl']);
        if (isset($body['windowsUrl'])) $config['windowsUrl'] = trim($body['windowsUrl']);
        if (isset($body['macClipboardText'])) $config['macClipboardText'] = $body['macClipboardText'];
        if (isset($body['windowsClipboardText'])) $config['windowsClipboardText'] = $body['windowsClipboardText'];
        if (!empty($body['adminPassword'])) $config['adminPassword'] = trim($body['adminPassword']);
        writeConfig($configPath, $config);
        echo json_encode(['success' => true]);
        break;

    case 'reset-counters':
        requireAuth();
        $config['macCopies'] = 0;
        $config['windowsCopies'] = 0;
        writeConfig($configPath, $config);
        echo json_encode(['success' => true]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Unknown action']);
}
