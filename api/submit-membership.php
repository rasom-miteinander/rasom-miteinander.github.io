<?php
/**
 * Verarbeitet eine Einreichung des Online-Mitgliedsantrags von
 * /mitglied-werden/. Wird auf STRATO Hosting Basic betrieben (kann auf
 * GitHub Pages nicht laufen, da dort kein PHP ausgeführt wird).
 *
 * Diese Datei kann in dieser Umgebung nicht ausgeführt oder getestet
 * werden (kein PHP/SMTP verfügbar). Sie ist vollständig dokumentiert und
 * so geschrieben, dass sie nach dem Umzug auf STRATO funktionsfähig sein
 * sollte – bitte nach dem Deployment dort gründlich testen, bevor der
 * MEMBERSHIP_API_ENDPOINT im Frontend (site/js/mitglied-werden.js)
 * aktiviert wird.
 *
 * Sicherheitsprinzipien (siehe auch api/README-SETUP.md):
 *  - Keine Geheimnisse in dieser Datei oder im Repository (SMTP-Zugang
 *    liegt in config/mail-config.php, NICHT eingecheckt).
 *  - CSRF-Schutz über ein Double-Submit-Cookie-Token.
 *  - Honeypot-Feld gegen einfache Bots.
 *  - Datei-basiertes Rate-Limiting pro IP (keine Datenbank).
 *  - Keine personenbezogenen Daten werden dauerhaft gespeichert – die
 *    Angaben werden ausschließlich per E-Mail an den Verein weitergeleitet
 *    und danach nicht auf dem Server behalten.
 *  - Keine personenbezogenen Daten in Server-Logs.
 *  - Keine Weitergabe an Dritt-Dienste – der E-Mail-Versand läuft über
 *    das eigene STRATO-Postfach des Vereins (PHPMailer/SMTP), nicht über
 *    einen externen Anbieter.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// ---------------------------------------------------------------------
// 0. Konfiguration laden
// ---------------------------------------------------------------------
$configPath = __DIR__ . '/config/mail-config.php';
if (!file_exists($configPath)) {
    // Absichtlich keine Details nach außen geben.
    error_log('[mitgliedsantrag] mail-config.php fehlt – Formular ist nicht konfiguriert.');
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'server_not_configured']);
    exit;
}
$config = require $configPath;

function fail(int $status, string $error): void
{
    http_response_code($status);
    echo json_encode(['success' => false, 'error' => $error]);
    exit;
}

// ---------------------------------------------------------------------
// 1. Nur POST, nur JSON, nur vom eigenen Origin
// ---------------------------------------------------------------------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'method_not_allowed');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === '' || $origin !== $config['allowed_origin']) {
    fail(403, 'origin_not_allowed');
}
header('Access-Control-Allow-Origin: ' . $config['allowed_origin']);
header('Access-Control-Allow-Credentials: true');

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'application/json') === false) {
    fail(415, 'unsupported_content_type');
}

// Grenze die Anfragegröße (Signatur-Bild ist ein Data-URI und damit der
// größte Teil der Anfrage) auf einen großzügigen, aber endlichen Wert.
$maxBytes = 2 * 1024 * 1024; // 2 MB
$rawBody = file_get_contents('php://input', false, null, 0, $maxBytes + 1);
if ($rawBody === false || strlen($rawBody) > $maxBytes) {
    fail(413, 'payload_too_large');
}

// ---------------------------------------------------------------------
// 2. CSRF-Prüfung (Double-Submit-Cookie, siehe csrf-token.php)
// ---------------------------------------------------------------------
$csrfCookie = $_COOKIE['rasom_csrf'] ?? '';
$csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
if ($csrfCookie === '' || $csrfHeader === '' || !hash_equals($csrfCookie, $csrfHeader)) {
    fail(403, 'csrf_check_failed');
}

// ---------------------------------------------------------------------
// 3. Rate-Limiting pro IP (dateibasiert, keine Datenbank)
//    Erlaubt max. 5 Einreichungsversuche pro IP und Stunde.
// ---------------------------------------------------------------------
$storageDir = __DIR__ . '/storage';
if (!is_dir($storageDir)) {
    mkdir($storageDir, 0750, true);
}
$rateLimitFile = $storageDir . '/rate-limit.json';
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
// IP wird nur gehasht und nur für die Dauer des Zeitfensters gespeichert –
// keine personenbezogenen Antragsdaten landen in dieser Datei.
$ipHash = hash('sha256', $ip . ($config['rate_limit_salt'] ?? 'rasom'));

$now = time();
$window = 3600; // 1 Stunde
$maxAttempts = 5;

$fp = fopen($rateLimitFile, 'c+');
if ($fp) {
    flock($fp, LOCK_EX);
    $raw = stream_get_contents($fp);
    $data = $raw ? json_decode($raw, true) : [];
    if (!is_array($data)) {
        $data = [];
    }
    // Alte Einträge und alte IP-Hashes aufräumen.
    $attempts = array_values(array_filter($data[$ipHash] ?? [], function ($ts) use ($now, $window) {
        return ($now - $ts) < $window;
    }));

    if (count($attempts) >= $maxAttempts) {
        flock($fp, LOCK_UN);
        fclose($fp);
        fail(429, 'rate_limited');
    }

    $attempts[] = $now;
    $data[$ipHash] = $attempts;
    // Auch andere, längst abgelaufene IP-Hashes entfernen, damit die Datei
    // nicht unbegrenzt wächst.
    foreach ($data as $hash => $timestamps) {
        $fresh = array_values(array_filter($timestamps, function ($ts) use ($now, $window) {
            return ($now - $ts) < $window;
        }));
        if (empty($fresh)) {
            unset($data[$hash]);
        } else {
            $data[$hash] = $fresh;
        }
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data));
    flock($fp, LOCK_UN);
    fclose($fp);
}

// ---------------------------------------------------------------------
// 4. Eingabe parsen, validieren, bereinigen (serverseitig – niemals der
//    clientseitigen Validierung vertrauen)
// ---------------------------------------------------------------------
$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    fail(400, 'invalid_json');
}

/** Entfernt Zeilenumbrüche/Steuerzeichen, um Header-Injection in E-Mails
 *  zu verhindern, und begrenzt die Länge. */
function cleanField($value, int $maxLength = 300): string
{
    $value = is_string($value) ? $value : '';
    $value = preg_replace('/[\r\n\x00-\x1F\x7F]+/', ' ', $value);
    $value = trim($value);
    return mb_substr($value, 0, $maxLength);
}

// Honeypot: unsichtbares Feld, das nur Bots ausfüllen. Bei Befüllung wird
// so reagiert, als wäre alles erfolgreich gewesen – ohne irgendetwas zu
// versenden oder zu protokollieren. So lernt der Bot nicht, dass er
// erkannt wurde.
if (cleanField($payload['firma_webseite'] ?? '') !== '') {
    echo json_encode(['success' => true]);
    exit;
}

$fields = [
    'vorname' => cleanField($payload['vorname'] ?? '', 100),
    'nachname' => cleanField($payload['nachname'] ?? '', 100),
    'geburtsdatum' => cleanField($payload['geburtsdatum'] ?? '', 20),
    'strasse' => cleanField($payload['strasse'] ?? '', 150),
    'plz' => cleanField($payload['plz'] ?? '', 10),
    'ort' => cleanField($payload['ort'] ?? '', 100),
    'email' => cleanField($payload['email'] ?? '', 150),
    'telefon' => cleanField($payload['telefon'] ?? '', 40),
    'mitgliedschaft' => cleanField($payload['mitgliedschaft'] ?? '', 20),
    'unterschrift_ort' => cleanField($payload['unterschrift_ort'] ?? '', 100),
    'unterschrift_datum' => cleanField($payload['unterschrift_datum'] ?? '', 20),
];

$errors = [];
foreach (['vorname', 'nachname', 'geburtsdatum', 'strasse', 'plz', 'ort', 'email', 'unterschrift_ort', 'unterschrift_datum'] as $required) {
    if ($fields[$required] === '') {
        $errors[] = $required;
    }
}
if (!filter_var($fields['email'], FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'email';
}
if (!preg_match('/^[0-9]{5}$/', $fields['plz'])) {
    $errors[] = 'plz';
}
if (!in_array($fields['mitgliedschaft'], ['ordentlich', 'foerder'], true)) {
    $errors[] = 'mitgliedschaft';
}

$signatureDataUri = is_string($payload['unterschrift_bild'] ?? null) ? $payload['unterschrift_bild'] : '';
if (strpos($signatureDataUri, 'data:image/png;base64,') !== 0) {
    $errors[] = 'unterschrift_bild';
}

if (!empty($errors)) {
    fail(422, 'validation_failed:' . implode(',', $errors));
}

// ---------------------------------------------------------------------
// 5. Unterschrift-Bild dekodieren (nur temporär im Speicher, nicht auf
//    Platte dauerhaft gespeichert)
// ---------------------------------------------------------------------
$signatureBinary = base64_decode(substr($signatureDataUri, strlen('data:image/png;base64,')), true);
if ($signatureBinary === false || strlen($signatureBinary) > 1024 * 1024) {
    fail(422, 'validation_failed:unterschrift_bild');
}
$tmpSignaturePath = tempnam(sys_get_temp_dir(), 'sig_');
file_put_contents($tmpSignaturePath, $signatureBinary);

// ---------------------------------------------------------------------
// 6. Ausgefülltes Antrags-PDF erzeugen (FPDF – siehe api/lib/README-FPDF.txt)
// ---------------------------------------------------------------------
$fpdfPath = __DIR__ . '/lib/fpdf/fpdf.php';
$pdfPath = null;
if (file_exists($fpdfPath)) {
    require_once $fpdfPath;

    $mitgliedschaftLabel = $fields['mitgliedschaft'] === 'ordentlich'
        ? 'Ordentliche Mitgliedschaft'
        : 'Fördermitgliedschaft (gemäß § 4A der Satzung)';

    $pdf = new FPDF();
    $pdf->AddPage();

    $logoPath = __DIR__ . '/../images/logo.png';
    if (file_exists($logoPath)) {
        $pdf->Image($logoPath, 10, 8, 22);
    }

    $pdf->SetFont('Arial', 'B', 16);
    $pdf->Ln(20);
    $pdf->Cell(0, 10, 'Mitgliedsantrag - Rasom-Miteinander e.V.', 0, 1, 'C');
    $pdf->Ln(4);

    $pdf->SetFont('Arial', '', 11);
    $rows = [
        'Vorname' => $fields['vorname'],
        'Nachname' => $fields['nachname'],
        'Geburtsdatum' => $fields['geburtsdatum'],
        'Adresse' => $fields['strasse'] . ', ' . $fields['plz'] . ' ' . $fields['ort'],
        'E-Mail' => $fields['email'],
        'Telefon' => $fields['telefon'] !== '' ? $fields['telefon'] : '-',
        'Mitgliedschaftsart' => $mitgliedschaftLabel,
    ];
    foreach ($rows as $label => $value) {
        $pdf->SetFont('Arial', 'B', 11);
        $pdf->Cell(50, 8, $label . ':', 0, 0);
        $pdf->SetFont('Arial', '', 11);
        // mb-sicheres Ausgeben von Umlauten etc. für FPDF (Latin-1):
        $pdf->Cell(0, 8, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $value), 0, 1);
    }

    $pdf->Ln(6);
    $pdf->SetFont('Arial', '', 11);
    $pdf->Cell(60, 8, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Ort, Datum: ' . $fields['unterschrift_ort'] . ', ' . $fields['unterschrift_datum']), 0, 1);

    $pdf->Ln(2);
    $pdf->Cell(0, 6, 'Unterschrift:', 0, 1);
    $pdf->Image($tmpSignaturePath, $pdf->GetX(), $pdf->GetY(), 60);
    $pdf->Ln(28);

    // Vorstandsvermerk – erscheint bewusst NUR im generierten PDF für den
    // internen Gebrauch des Vorstands, nicht im öffentlichen Web-Formular.
    $pdf->SetDrawColor(180, 180, 180);
    $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
    $pdf->Ln(4);
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->Cell(0, 8, 'Vorstandsvermerk (nur fuer internen Gebrauch)', 0, 1);
    $pdf->SetFont('Arial', '', 11);
    $pdf->Cell(0, 8, '[ ] Aufnahme beschlossen', 0, 1);
    $pdf->Cell(0, 8, '[ ] Aufnahme abgelehnt', 0, 1);
    $pdf->Cell(0, 8, 'Beschlussdatum: ______________', 0, 1);
    $pdf->Cell(0, 8, 'Mitgliedsnummer: ______________', 0, 1);
    $pdf->Cell(0, 8, 'Unterschrift Vorstand: ______________', 0, 1);

    $pdfPath = tempnam(sys_get_temp_dir(), 'antrag_') . '.pdf';
    $pdf->Output('F', $pdfPath);
}

// ---------------------------------------------------------------------
// 7. E-Mail per PHPMailer/SMTP versenden (eigenes STRATO-Postfach, kein
//    Drittanbieter)
// ---------------------------------------------------------------------
$phpMailerAutoload = __DIR__ . '/lib/PHPMailer/src/PHPMailer.php';
if (!file_exists($phpMailerAutoload)) {
    error_log('[mitgliedsantrag] PHPMailer fehlt – siehe api/lib/README-PHPMailer.txt');
    fail(500, 'server_not_configured');
}
require_once __DIR__ . '/lib/PHPMailer/src/Exception.php';
require_once __DIR__ . '/lib/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/lib/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->Port = $config['smtp_port'];
    $mail->SMTPSecure = $config['smtp_secure'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];
    $mail->CharSet = 'UTF-8';

    $mail->setFrom($config['from_email'], $config['from_name']);
    $mail->addAddress($config['recipient_email']);
    // Antworten gehen direkt an den Antragstellenden, nicht als "From"
    // missbraucht (verhindert Spoofing über diese Adresse).
    $mail->addReplyTo($fields['email'], $fields['vorname'] . ' ' . $fields['nachname']);

    $mail->Subject = 'Neuer Mitgliedsantrag: ' . $fields['vorname'] . ' ' . $fields['nachname'];
    $mail->Body = "Ein neuer Mitgliedsantrag wurde über die Website eingereicht.\n\n"
        . "Vorname: {$fields['vorname']}\n"
        . "Nachname: {$fields['nachname']}\n"
        . "Geburtsdatum: {$fields['geburtsdatum']}\n"
        . "Adresse: {$fields['strasse']}, {$fields['plz']} {$fields['ort']}\n"
        . "E-Mail: {$fields['email']}\n"
        . "Telefon: " . ($fields['telefon'] !== '' ? $fields['telefon'] : '-') . "\n"
        . "Mitgliedschaftsart: {$fields['mitgliedschaft']}\n"
        . "Ort, Datum der Unterschrift: {$fields['unterschrift_ort']}, {$fields['unterschrift_datum']}\n\n"
        . "Den vollständig ausgefüllten Antrag mit Unterschrift finden Sie im PDF-Anhang.";

    if ($pdfPath && file_exists($pdfPath)) {
        $mail->addAttachment($pdfPath, 'Mitgliedsantrag_' . $fields['nachname'] . '.pdf');
    }

    $mail->send();

    // Kurze Bestätigung an die antragstellende Person.
    $confirmation = new PHPMailer(true);
    $confirmation->isSMTP();
    $confirmation->Host = $config['smtp_host'];
    $confirmation->Port = $config['smtp_port'];
    $confirmation->SMTPSecure = $config['smtp_secure'];
    $confirmation->SMTPAuth = true;
    $confirmation->Username = $config['smtp_username'];
    $confirmation->Password = $config['smtp_password'];
    $confirmation->CharSet = 'UTF-8';
    $confirmation->setFrom($config['from_email'], $config['from_name']);
    $confirmation->addAddress($fields['email'], $fields['vorname'] . ' ' . $fields['nachname']);
    $confirmation->Subject = 'Ihr Mitgliedsantrag bei Rasom-Miteinander e.V.';
    $confirmation->Body = "Liebe/r {$fields['vorname']} {$fields['nachname']},\n\n"
        . "vielen Dank für Ihren Mitgliedsantrag bei Rasom-Miteinander e.V. "
        . "Wir haben Ihre Angaben erhalten und melden uns in Kürze bei Ihnen.\n\n"
        . "Herzliche Grüße\nIhr Rasom-Miteinander e.V.";
    $confirmation->send();

    echo json_encode(['success' => true]);
} catch (PHPMailerException $e) {
    // Niemals personenbezogene Daten mitloggen – nur ein generischer Hinweis.
    error_log('[mitgliedsantrag] Mailversand fehlgeschlagen: ' . $e->getMessage());
    fail(502, 'mail_send_failed');
} finally {
    if (file_exists($tmpSignaturePath)) {
        unlink($tmpSignaturePath);
    }
    if ($pdfPath && file_exists($pdfPath)) {
        unlink($pdfPath);
    }
}
