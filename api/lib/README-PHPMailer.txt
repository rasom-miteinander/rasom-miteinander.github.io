PHPMailer wird hier manuell abgelegt (kein Composer/SSH auf STRATO Hosting
Basic vorausgesetzt):

1. Neueste Version von https://github.com/PHPMailer/PHPMailer herunterladen
   (Button "Code" -> "Download ZIP").
2. Aus dem ZIP den Ordner "src" entpacken und als
   api/lib/PHPMailer/src/  auf den Server hochladen, sodass folgende
   Dateien existieren:
     api/lib/PHPMailer/src/PHPMailer.php
     api/lib/PHPMailer/src/SMTP.php
     api/lib/PHPMailer/src/Exception.php
3. Nichts weiter konfigurieren – submit-membership.php bindet diese
   Dateien direkt per require_once ein.

Dieser Ordner ist in .gitignore eingetragen und wird nicht ins Repository
übernommen (keine Lizenzpflicht, aber unnötiger Ballast im Git-Verlauf).
