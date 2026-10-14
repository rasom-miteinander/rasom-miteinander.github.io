# Mitgliedsantrag-Formular – Backend-Einrichtung auf STRATO

Dieser Ordner (`api/`) enthält das PHP-Backend, das die Einreichungen des
Online-Mitgliedsantrags (`/mitglied-werden/`) per E-Mail an den Verein
weiterleitet. Es kann **nicht** auf GitHub Pages laufen (GitHub Pages
liefert nur statische Dateien aus, kein PHP) – es ist ausschließlich für
den Betrieb auf STRATO Hosting Basic gedacht, nach dem Umzug der Website.

Solange dieser Teil nicht eingerichtet ist, bleibt das Online-Formular auf
der Website voll benutzbar (Ausfüllen, Prüfen, Unterschreiben), zeigt beim
Absenden aber ehrlich einen Hinweis, dass die Online-Übermittlung noch
nicht aktiv ist, und verweist auf den PDF-Antrag als Alternative. Es wird
nie ein falsches „Erfolgreich gesendet" angezeigt, solange das Backend
nicht wirklich funktioniert.

## Schritt für Schritt

1. **Dateien hochladen.** Den gesamten Ordner `api/` zusammen mit dem Rest
   von `site/` auf den STRATO-Webspace hochladen (per FTP oder dem
   STRATO-Datei-Manager).

2. **PHPMailer installieren** – siehe `api/lib/README-PHPMailer.txt`.

3. **FPDF installieren** – siehe `api/lib/README-FPDF.txt`. (Erzeugt das
   ausgefüllte Antrags-PDF, das der Benachrichtigungs-E-Mail angehängt
   wird. Falls das aus Zeitgründen übersprungen wird, funktioniert der
   E-Mail-Versand trotzdem – nur ohne PDF-Anhang.)

4. **Echte Zugangsdaten eintragen, ohne sie ins Repository zu übernehmen:**
   - `api/config/mail-config.example.php` direkt auf dem Server (per
     FTP/Datei-Manager) nach `api/config/mail-config.php` kopieren.
   - In der Kopie das echte SMTP-Passwort des Vereins-Postfachs bei
     STRATO eintragen (`smtp_username`/`smtp_password`).
   - **`mail-config.php` niemals committen** – es steht bereits in
     `.gitignore`, damit es bei zukünftigen `git push` nicht versehentlich
     mit hochgeladen wird.
   - `recipient_email` auf die gewünschte Empfängeradresse setzen –
     Standard ist `info@rasom-miteinander.de`; falls dieses Postfach noch
     nicht eingerichtet ist, vorübergehend auf
     `rasom.miteinander.ev@gmail.com` setzen.
   - `allowed_origin` auf die tatsächliche Domain der Website setzen
     (z. B. `https://www.rasom-miteinander.de`), sobald diese aktiv ist.

5. **PHP-Version prüfen.** PHPMailer benötigt PHP 7.2 oder neuer; im
   STRATO-Kundenmenü unter „PHP-Einstellungen" sicherstellen, dass eine
   aktuelle PHP-Version aktiv ist.

6. **Testen – direkt auf dem Server, nicht nur lokal.** Mit einem
   Testantrag (eigene Daten) prüfen, ob:
   - die Bestätigungs-E-Mail an den Verein ankommt (mit PDF-Anhang, falls
     FPDF installiert wurde),
   - die kurze Bestätigungs-E-Mail beim Antragstellenden ankommt,
   - eine zweite schnelle Testeinreichung nach 5 Versuchen innerhalb einer
     Stunde korrekt mit „zu viele Versuche" abgelehnt wird (Rate-Limit).

7. **Erst danach im Frontend aktivieren:** in `site/js/mitglied-werden.js`
   ganz oben:
   ```js
   var MEMBERSHIP_API_ENDPOINT = "/api/submit-membership.php";
   var CSRF_TOKEN_ENDPOINT = "/api/csrf-token.php";
   ```
   setzen (beide Zeilen sind aktuell bewusst leer `""`). Erst ab diesem
   Zeitpunkt versucht das Formular wirklich zu senden.

## Warum es auf GitHub Pages nicht funktioniert

GitHub Pages hostet ausschließlich statische Dateien (HTML/CSS/JS) und
führt keinen Server-Code (PHP) aus. Deshalb liegt `MEMBERSHIP_API_ENDPOINT`
aktuell leer – das Formular erkennt das und zeigt den ehrlichen Hinweis
„Online-Übermittlung derzeit nicht aktiv" statt eine Anfrage ins Leere zu
schicken. Erst nach dem Umzug auf STRATO (wo PHP läuft) und nach den
Schritten oben kann der Endpunkt gesetzt werden.

## Sicherheits-Hinweise, die beim Testen relevant sind

- Es werden **keine** Antragsdaten dauerhaft auf dem Server gespeichert –
  nur eine kurzlebige, gehashte IP-Liste für das Rate-Limiting
  (`api/storage/rate-limit.json`, nicht über das Web erreichbar).
- Es werden **keine** personenbezogenen Daten in Server-Logs geschrieben;
  bei Fehlern wird nur eine generische Meldung protokolliert.
- `mail-config.php` ist durch `.htaccess` (`Require all denied`) vor
  direktem Web-Zugriff geschützt und wird nur serverseitig per `require`
  eingebunden.
- Der E-Mail-Versand läuft ausschließlich über das eigene STRATO-Postfach
  des Vereins – es wird kein externer Dritt-Dienst (z. B. SendGrid,
  Mailgun) eingebunden.

## Testumfang in dieser Entwicklungsumgebung

In dieser (Cloud-)Entwicklungsumgebung stand kein PHP-Mailserver zur
Verfügung. Geprüft wurde hier ausschließlich die PHP-Syntax aller Dateien
(`php -l`, fehlerfrei). Der tatsächliche Versand, das Rate-Limiting unter
echten Bedingungen und das Zusammenspiel mit PHPMailer/FPDF müssen nach
dem Hochladen direkt auf dem STRATO-Server getestet werden (siehe Schritt
6 oben).
