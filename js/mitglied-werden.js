(function(){
  var form = document.getElementById("mitglied-form");
  if (!form) return; // this script only runs anything on the Mitglied-werden page

  function t(key, fallback){
    if (window.RasomI18n && typeof window.RasomI18n.t === "function"){
      var val = window.RasomI18n.t(key);
      if (val !== key) return val;
    }
    return fallback !== undefined ? fallback : key;
  }

  // ---------- auto date ----------
  var datumField = document.getElementById("f-sig-datum");
  function setToday(){
    if (!datumField) return;
    var d = new Date();
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    datumField.value = dd + "." + mm + "." + d.getFullYear();
  }
  setToday();

  // ---------- validation helpers ----------
  function showError(fieldId, msgKey, fallback){
    var errEl = form.querySelector('[data-error-for="' + fieldId + '"]') ||
                document.querySelector('[data-error-for="' + fieldId + '"]');
    var inputEl = document.getElementById(fieldId);
    if (errEl){
      errEl.textContent = t(msgKey, fallback);
      errEl.classList.add("show");
    }
    if (inputEl) inputEl.classList.add("invalid");
  }
  function clearAllErrors(){
    form.querySelectorAll(".field-error").forEach(function(el){ el.textContent = ""; el.classList.remove("show"); });
    form.querySelectorAll(".invalid").forEach(function(el){ el.classList.remove("invalid"); });
  }

  function validateForm(){
    clearAllErrors();
    var firstInvalid = null;
    var requiredTextFields = [
      "f-vorname", "f-nachname", "f-geburtsdatum", "f-strasse",
      "f-plz", "f-ort", "f-email", "f-sig-ort"
    ];
    requiredTextFields.forEach(function(id){
      var el = document.getElementById(id);
      if (el && !el.value.trim()){
        showError(id, "mitglied.error.required", "Bitte füllen Sie dieses Feld aus.");
        if (!firstInvalid) firstInvalid = el;
      }
    });

    var emailEl = document.getElementById("f-email");
    if (emailEl && emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())){
      showError("f-email", "mitglied.error.email", "Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      if (!firstInvalid) firstInvalid = emailEl;
    }

    var plzEl = document.getElementById("f-plz");
    if (plzEl && plzEl.value.trim() && !/^[0-9]{5}$/.test(plzEl.value.trim())){
      showError("f-plz", "mitglied.error.plz", "Bitte geben Sie eine gültige Postleitzahl ein (5 Ziffern).");
      if (!firstInvalid) firstInvalid = plzEl;
    }

    var mitgliedschaft = form.querySelector('input[name="mitgliedschaft"]:checked');
    if (!mitgliedschaft){
      showError("mitgliedschaft", "mitglied.error.required", "Bitte füllen Sie dieses Feld aus.");
      if (!firstInvalid) firstInvalid = form.querySelector('input[name="mitgliedschaft"]');
    }

    ["f-satzung", "f-datenschutz", "f-confirm"].forEach(function(id){
      var el = document.getElementById(id);
      if (el && !el.checked){
        showError(id, "mitglied.error.required", "Bitte füllen Sie dieses Feld aus.");
        if (!firstInvalid) firstInvalid = el;
      }
    });

    if (firstInvalid){
      firstInvalid.focus({ preventScroll: false });
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  // ---------- review step ----------
  var formFields = document.getElementById("form-fields");
  var actionsFill = document.getElementById("actions-fill");
  var reviewStep = document.getElementById("review-step");
  var btnToReview = document.getElementById("btn-to-review");
  var btnToEdit = document.getElementById("btn-to-edit");
  var btnSubmit = document.getElementById("btn-submit");
  var statusEl = document.getElementById("form-status");

  function val(id){
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function membershipLabel(){
    var checked = form.querySelector('input[name="mitgliedschaft"]:checked');
    if (!checked) return "";
    return checked.value === "ordentlich"
      ? t("mitglied.step2.ordentlich", "Ordentliche Mitgliedschaft")
      : t("mitglied.step2.foerder", "Fördermitgliedschaft");
  }

  function fillReview(){
    document.getElementById("rv-vorname").textContent = val("f-vorname");
    document.getElementById("rv-nachname").textContent = val("f-nachname");
    document.getElementById("rv-geburtsdatum").textContent = val("f-geburtsdatum");
    document.getElementById("rv-adresse").textContent = val("f-strasse") + ", " + val("f-plz") + " " + val("f-ort");
    document.getElementById("rv-email").textContent = val("f-email");
    document.getElementById("rv-telefon").textContent = val("f-telefon") || "—";
    document.getElementById("rv-mitgliedschaft").textContent = membershipLabel();
    document.getElementById("rv-ort-datum").textContent = val("f-sig-ort") + ", " + val("f-sig-datum");
  }

  if (btnToReview){
    btnToReview.addEventListener("click", function(){
      if (!validateForm()) return;
      fillReview();
      formFields.hidden = true;
      actionsFill.hidden = true;
      reviewStep.hidden = false;
      statusEl.hidden = true;
      reviewStep.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (btnToEdit){
    btnToEdit.addEventListener("click", function(){
      reviewStep.hidden = true;
      formFields.hidden = false;
      actionsFill.hidden = false;
      formFields.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function showStatus(kind, msgKey, fallback){
    statusEl.className = "form-status " + kind;
    statusEl.textContent = t(msgKey, fallback);
    statusEl.hidden = false;
    statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // ---------- PDF generation ----------
  // Our Satzung requires membership applications to be submitted in writing
  // (handwritten signature), so this button does not send anything anywhere.
  // It fills the official application layout with the entered data — leaving
  // the signature line and the Vorstandsvermerk section blank — as a PDF the
  // person downloads, prints, signs by hand, and sends or hands in themselves.
  function loadLogoDataUrl(){
    return new Promise(function(resolve){
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function(){
        try {
          var canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch (e) {
          resolve(null);
        }
      };
      img.onerror = function(){ resolve(null); };
      img.src = "/images/logo.png";
    });
  }

  function buildPdf(logoDataUrl){
    var jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFCtor) throw new Error("jsPDF not loaded");
    var doc = new jsPDFCtor({ unit: "mm", format: "a4" });

    if (logoDataUrl){
      try { doc.addImage(logoDataUrl, "PNG", 15, 12, 22, 22); } catch (e) { /* ignore */ }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("MITGLIEDSANTRAG", 105, 22, { align: "center" });
    doc.setFontSize(11);
    doc.text("Deutsch-Ukrainischer Verein Rasom-Miteinander e.V.", 105, 29, { align: "center" });

    var y = 45;
    function row(label, value){
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label, 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(value || "-", 70, y);
      y += 8;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("1. Angaben zur Person", 15, y);
    y += 8;
    row("Vorname:", val("f-vorname"));
    row("Nachname:", val("f-nachname"));
    row("Geburtsdatum:", val("f-geburtsdatum"));
    row("Anschrift:", val("f-strasse") + ", " + val("f-plz") + " " + val("f-ort"));
    row("Telefon:", val("f-telefon"));
    row("E-Mail:", val("f-email"));

    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("2. Art der Mitgliedschaft", 15, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(membershipLabel(), 15, y);
    y += 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("3. Erklärung", 15, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    var erklaerung = "Ich unterstütze die Zwecke und Ziele des Vereins und erkenne die Satzung in ihrer gültigen Fassung an. Mir ist bekannt, dass über die Aufnahme der Vorstand entscheidet. Ich nehme zur Kenntnis, dass Mitgliedsbeiträge gemäß § 5 der Satzung erhoben werden.";
    var erklaerungLines = doc.splitTextToSize(erklaerung, 180);
    doc.text(erklaerungLines, 15, y);
    y += erklaerungLines.length * 5 + 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("4. Datenschutz", 15, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    var datenschutz = "Ich willige in die Speicherung und Verarbeitung meiner personenbezogenen Daten zum Zwecke der Mitgliederverwaltung ein.";
    var datenschutzLines = doc.splitTextToSize(datenschutz, 180);
    doc.text(datenschutzLines, 15, y);
    y += datenschutzLines.length * 5 + 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Ort: " + val("f-sig-ort"), 15, y);
    doc.text("Datum: " + val("f-sig-datum"), 90, y);
    y += 16;
    doc.text("Unterschrift: " + "_".repeat(40), 15, y);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text("(bitte nach dem Ausdrucken handschriftlich unterschreiben)", 15, y + 5);
    doc.setTextColor(0);
    y += 20;

    doc.setDrawColor(180);
    doc.line(15, y, 195, y);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Vorstandsvermerk (nur für internen Gebrauch)", 15, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.text("[ ]  Aufnahme beschlossen", 15, y); y += 7;
    doc.text("[ ]  Aufnahme abgelehnt", 15, y); y += 7;
    doc.text("Beschlussdatum: _______________", 15, y); y += 7;
    doc.text("Mitgliedsnummer: _______________", 15, y); y += 7;
    doc.text("Unterschrift Vorstand: _______________", 15, y);

    return doc;
  }

  if (btnSubmit){
    btnSubmit.addEventListener("click", function(){
      var submitLabel = document.getElementById("btn-submit-label");
      var originalLabel = submitLabel ? submitLabel.textContent : "";
      btnSubmit.disabled = true;
      if (submitLabel) submitLabel.textContent = t("mitglied.btn.submitting", "PDF wird erstellt …");

      loadLogoDataUrl()
        .then(function(logoDataUrl){
          var doc = buildPdf(logoDataUrl);
          var filename = "Mitgliedsantrag_" + (val("f-nachname") || "Rasom-Miteinander") + ".pdf";
          doc.save(filename);
          showStatus("success", "mitglied.status.pdf-ready", "Ihr ausgefülltes PDF wurde heruntergeladen. Bitte drucken Sie es aus, unterschreiben Sie es handschriftlich und senden Sie es per Post, persönlich oder eingescannt per E-Mail an uns (Kontaktadresse siehe Impressum).");
        })
        .catch(function(){
          showStatus("error", "mitglied.status.pdf-error", "Beim Erstellen des PDFs ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder nutzen Sie den leeren Mitgliedsantrag zum Ausdrucken.");
        })
        .finally(function(){
          btnSubmit.disabled = false;
          if (submitLabel) submitLabel.textContent = originalLabel;
        });
    });
  }

  // keep any already-visible status message in sync when the language toggle is used
  document.addEventListener("rasom:langchange", function(){
    if (statusEl && !statusEl.hidden){
      var kind = statusEl.className.replace("form-status", "").trim();
      var keyMap = { success: "mitglied.status.pdf-ready", error: "mitglied.status.pdf-error" };
      if (keyMap[kind]) statusEl.textContent = t(keyMap[kind], statusEl.textContent);
    }
  });
})();
