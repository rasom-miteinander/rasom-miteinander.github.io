<?php
/**
 * Stellt ein kurzlebiges CSRF-Token für das Mitgliedsantrag-Formular aus.
 *
 * Funktionsweise (Double-Submit-Cookie): Dieses Skript erzeugt ein
 * zufälliges Token, setzt es als httpOnly-unabhängiges Cookie und gibt es
 * zusätzlich als JSON zurück. Das Frontend schickt das Token beim
 * eigentlichen Absenden im Header "X-CSRF-Token" mit; submit-membership.php
 * prüft, ob Cookie-Wert und Header-Wert übereinstimmen. Nur eine Seite, die
 * zuvor dieses Skript aufrufen konnte (also die eigene Website), kennt
 * beide Werte gemeinsam.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$config = require __DIR__ . '/config/mail-config.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && $origin !== $config['allowed_origin']) {
    http_response_code(403);
    echo json_encode(['error' => 'origin_not_allowed']);
    exit;
}
if ($origin !== '') {
    header('Access-Control-Allow-Origin: ' . $config['allowed_origin']);
    header('Access-Control-Allow-Credentials: true');
}

$token = bin2hex(random_bytes(32));

setcookie('rasom_csrf', $token, [
    'expires' => time() + 900, // 15 Minuten reichen für das Ausfüllen des Formulars
    'path' => '/',
    'secure' => true,
    'httponly' => false, // muss vom JavaScript lesbar sein, siehe Erklärung oben
    'samesite' => 'Strict',
]);

echo json_encode(['token' => $token]);
