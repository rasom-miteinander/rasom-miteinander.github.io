FPDF wird hier manuell abgelegt (reines PHP, keine Composer-Abhängigkeiten,
funktioniert auf STRATO Hosting Basic ohne SSH):

1. Neueste Version von http://www.fpdf.org/ herunterladen ("Download" ->
   aktuelle Version als ZIP).
2. Aus dem ZIP die Datei "fpdf.php" (sowie den Ordner "font", falls
   mitgeliefert) hierhin entpacken, sodass folgende Datei existiert:
     api/lib/fpdf/fpdf.php
3. submit-membership.php bindet diese Datei direkt per require_once ein
   und erzeugt daraus das ausgefüllte Antrags-PDF (inkl. Logo, allen
   Angaben, Datum und der eingebetteten Unterschrift), das per E-Mail an
   den Verein verschickt wird.

Dieser Ordner ist in .gitignore eingetragen (FPDF ist freie Software ohne
Lizenzpflicht, wird aber aus Platzgründen nicht im Repository mitgeführt).
