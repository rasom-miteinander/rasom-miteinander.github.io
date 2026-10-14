<?php
/**
 * Vorlage für die SMTP-/E-Mail-Konfiguration des Mitgliedsantrag-Formulars.
 *
 * WICHTIG: Diese Beispieldatei enthält KEINE echten Zugangsdaten und wird
 * mit ins Repository eingecheckt. Die echte Datei "mail-config.php" wird
 * NICHT eingecheckt (siehe .gitignore) und darf ausschließlich direkt auf
 * dem STRATO-Server angelegt werden.
 *
 * Einrichtung auf STRATO:
 *   1. Diese Datei per FTP/Datei-Manager nach "mail-config.php" (gleicher
 *      Ordner) kopieren.
 *   2. In der Kopie die echten Werte eintragen (SMTP-Postfach + Passwort
 *      des Vereins-Postfachs bei STRATO, z. B. info@rasom-miteinander.de).
 *   3. Sicherstellen, dass dieser Ordner (api/config/) per .htaccess vor
 *      direktem Web-Zugriff geschützt ist (liegt bereits als .htaccess
 *      in diesem Ordner) – die Datei wird nur von submit-membership.php
 *      per require eingebunden, nie direkt über eine URL aufgerufen.
 *   4. Niemals das echte Passwort in einer E-Mail, einem Chat oder einem
 *      Commit verschicken.
 */

return [
    // SMTP-Zugang des Vereins-Postfachs bei STRATO
    'smtp_host' => 'smtp.strato.de',
    'smtp_port' => 587,
    'smtp_secure' => 'tls', // 'tls' oder 'ssl', je nach Port/Vorgabe von STRATO
    'smtp_username' => 'info@rasom-miteinander.de',
    'smtp_password' => 'HIER-NIEMALS-DAS-ECHTE-PASSWORT-EINTRAGEN-IN-DIESER-BEISPIELDATEI',

    // Absenderadresse der versendeten E-Mails (meist identisch mit smtp_username)
    'from_email' => 'info@rasom-miteinander.de',
    'from_name' => 'Rasom-Miteinander e.V. – Mitgliedsantrag',

    // Empfänger des ausgefüllten Mitgliedsantrags.
    // Fallback-Adresse laut Absprache, falls das info@-Postfach noch
    // nicht eingerichtet ist: rasom.miteinander.ev@gmail.com
    'recipient_email' => 'info@rasom-miteinander.de',

    // Erlaubter Ursprung (Origin) für Anfragen an dieses Formular –
    // verhindert, dass fremde Websites dieses Skript missbrauchen.
    // Auf die tatsächliche Domain anpassen, sobald diese aktiv ist.
    'allowed_origin' => 'https://www.rasom-miteinander.de',
];
