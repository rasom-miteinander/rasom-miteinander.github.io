(function(){
  var translations = {
    de: {
      "nav.about": "Über uns",
      "nav.schwerpunkte": "Unsere Schwerpunkte",
      "nav.projekte": "Projekte",
      "nav.kontakt": "Kontakt",
      "header.donate": "Unterstützen",
      "hero.eyebrow": "Königs Wusterhausen & Zeuthen",
      "hero.h1": "Gemeinsam helfen. Kultur verbinden. Bildung und Kreativität fördern.",
      "hero.tagline": "DU Verein Rasom‑Miteinander e.V. für Kultur, Soziales, Bildung und Entwicklung",
      "hero.desc": "Ansprechpartner für die ukrainische Gemeinschaft in Königs Wusterhausen, Zeuthen und umliegenden Gemeinden, Brandenburg, LDS.",
      "hero.cta": "Jetzt spenden",
      "communityBanner.h2": "„Gemeinschaft entsteht dort, wo Menschen einander begegnen.“",
      "communityBanner.p": "Zusammen für eine offene, starke und solidarische Gesellschaft.",
      "events.h2": "Unsere Momente",
      "events.sub": "Vergangene Veranstaltungen",
      "events.link": "Galerie ansehen",
      "events.card1.title": "Ukrainischer Unabhängigkeitstag",
      "events.card1.desc": "Gemeinsam feierten wir den ukrainischen Unabhängigkeitstag – ein Fest der Freiheit, Kultur und Gemeinschaft.",
      "schwerpunkte.eyebrow": "Was wir tun",
      "schwerpunkte.h2": "Unsere Schwerpunkte",
      "card1.title": "Star Dance – Tanz & Kreativität",
      "card1.desc": "Tanzkurse für Kinder, Jugendliche und Erwachsene. Wir fördern Talente, Selbstbewusstsein und Gemeinschaft durch Bewegung.",
      "card2.title": "Hilfe für die Ukraine",
      "card2.desc": "Humanitäre Hilfe, Unterstützung von Familien und Kindern sowie Projekte, die direkt in der Ukraine Wirkung zeigen.",
      "card3.title": "Bildung & Integration",
      "card3.desc": "Deutschkurse, Workshops und Trainings zur Integration, beruflichen Orientierung und persönlichen Weiterentwicklung.",
      "card4.title": "Projekte & Initiativen",
      "card4.desc": "Wir initiieren und realisieren Projekte, die verbinden, stärken und nachhaltige Veränderungen schaffen.",
      "card.link": "Mehr erfahren",
      "about.photo-placeholder": "Foto folgt in Kürze",
      "about.eyebrow": "Über uns",
      "about.h2": "Wie alles begann",
      "about.p1": "Wir sind die Gründerinnen und Gründer des Vereins DU Rasom‑Miteinander e.V. und aktive Mitglieder der ukrainischen Gemeinschaft. Herzlich willkommen auf unserer Startseite.",
      "about.p2": "Unser Ziel ist es, die ukrainische Gemeinschaft in Deutschland zu vereinen, ein warmes und freundliches Umfeld für alle zu schaffen, die durch die Umstände hierher gekommen sind, einander zu unterstützen und uns gleichzeitig für neue Begegnungen mit unseren deutschen Freundinnen, Freunden und Nachbarn zu öffnen.",
      "about.p3": "Wir wurden im Oktober 2025 gegründet und beginnen unsere Arbeit im Landkreis Dahme‑Spreewald. Unsere wichtigsten Anlaufstellen sind Zeuthen und Königs Wusterhausen.",
      "banner.h2": "Gemeinsam können wir mehr bewegen",
      "banner.p": "Ob als Spender, Sponsor oder ehrenamtliche Unterstützung – jede Hilfe macht einen Unterschied.",
      "banner.cta": "Jetzt unterstützen",
      "feat1.strong": "Transparent",
      "feat1.span": "Wir arbeiten offen und verantwortungsvoll.",
      "feat2.strong": "Nachhaltig",
      "feat2.span": "Unsere Projekte schaffen langfristige Perspektiven.",
      "feat3.strong": "Gemeinsam",
      "feat3.span": "Wir verbinden Menschen und Kulturen.",
      "footer.tagline": "Rasom‑Miteinander e.V. · Königs Wusterhausen & Zeuthen, Brandenburg",
      "footer.copy": "© 2026 Deutsch‑Ukrainischer Verein Rasom‑Miteinander e.V."
    },
    uk: {
      "nav.about": "Про нас",
      "nav.schwerpunkte": "Наші напрямки",
      "nav.projekte": "Проєкти",
      "nav.kontakt": "Контакти",
      "header.donate": "Підтримати",
      "hero.eyebrow": "Кьонігс-Вустерхаузен і Цойтен",
      "hero.h1": "Разом допомагати. Об'єднувати культуру. Розвивати освіту та творчість.",
      "hero.tagline": "Українсько-німецьке об'єднання Rasom-Miteinander e.V. з питань культури, соціальної підтримки, освіти та розвитку",
      "hero.desc": "Контактна опора для української громади в Кьонігс-Вустерхаузені, Цойтені та навколишніх громадах, Бранденбург, округ Даме-Шпревальд.",
      "hero.cta": "Підтримати зараз",
      "communityBanner.h2": "«Спільнота народжується там, де люди зустрічають одне одного».",
      "communityBanner.p": "Разом за відкрите, сильне та солідарне суспільство.",
      "events.h2": "Наші моменти",
      "events.sub": "Минулі заходи",
      "events.link": "Переглянути галерею",
      "events.card1.title": "День незалежності України",
      "events.card1.desc": "Разом ми відсвяткували День незалежності України — свято свободи, культури та єдності.",
      "schwerpunkte.eyebrow": "Чим ми займаємось",
      "schwerpunkte.h2": "Наші напрямки",
      "card1.title": "Star Dance – танці та творчість",
      "card1.desc": "Танцювальні заняття для дітей, підлітків та дорослих. Розвиваємо таланти, впевненість у собі та спільноту через рух.",
      "card2.title": "Допомога Україні",
      "card2.desc": "Гуманітарна допомога, підтримка сімей і дітей, а також проєкти, що мають реальний вплив в Україні.",
      "card3.title": "Освіта та інтеграція",
      "card3.desc": "Курси німецької мови, воркшопи та тренінги з інтеграції, профорієнтації та особистого розвитку.",
      "card4.title": "Проєкти та ініціативи",
      "card4.desc": "Ми ініціюємо та реалізуємо проєкти, які об'єднують, підтримують і створюють сталі позитивні зміни.",
      "card.link": "Дізнатись більше",
      "about.photo-placeholder": "Фото буде додано незабаром",
      "about.eyebrow": "Про нас",
      "about.h2": "Як усе починалось",
      "about.p1": "Ми — засновники громадської організації DU Rasom-Miteinander e.V. та активні члени української громади, радо вітаємо вас на нашій головній сторінці.",
      "about.p2": "Наша мета — об'єднувати українську громаду в Німеччині, створювати тепле і дружнє середовище для кожного, хто опинився тут через обставини, підтримувати одне одного та водночас відкриватися для нових знайомств з нашими німецькими друзями й сусідами.",
      "about.p3": "Ми заснувались у жовтні 2025 року і розпочинаємо нашу діяльність в окрузі Даме-Шпревальд. Нашими основними центрами є Цойтен та Кьонігс Вюстерхаузен.",
      "banner.h2": "Разом ми можемо зробити більше",
      "banner.p": "Чи то як донор, спонсор або волонтер – кожна допомога має значення.",
      "banner.cta": "Підтримати зараз",
      "feat1.strong": "Прозоро",
      "feat1.span": "Ми працюємо відкрито та відповідально.",
      "feat2.strong": "Стало",
      "feat2.span": "Наші проєкти створюють довгострокові перспективи.",
      "feat3.strong": "Разом",
      "feat3.span": "Ми об'єднуємо людей і культури.",
      "footer.tagline": "Rasom-Miteinander e.V. · Кьонігс-Вустерхаузен і Цойтен, Бранденбург",
      "footer.copy": "© 2026 Українсько-німецьке об'єднання Rasom-Miteinander e.V."
    }
  };

  var current = "de";
  var nodes = document.querySelectorAll("[data-i18n]");
  var label = document.getElementById("lang-label");
  var toggleBtn = document.getElementById("lang-toggle");

  function applyLang(lang){
    var dict = translations[lang] || translations.de;
    nodes.forEach(function(node){
      var key = node.getAttribute("data-i18n");
      if (dict[key] !== undefined) node.textContent = dict[key];
    });
    if (label) label.textContent = lang === "uk" ? "UA" : "DE";
    document.documentElement.setAttribute("lang", lang === "uk" ? "uk" : "de");
    current = lang;
  }

  if (toggleBtn){
    toggleBtn.addEventListener("click", function(){
      applyLang(current === "de" ? "uk" : "de");
    });
  }

  // events carousel
  var eventsTrack = document.getElementById("events-track");
  var eventsPrev = document.getElementById("events-prev");
  var eventsNext = document.getElementById("events-next");
  if (eventsTrack && eventsPrev && eventsNext){
    function eventsStep(){
      var card = eventsTrack.querySelector(".event-card");
      if (!card) return eventsTrack.clientWidth;
      var trackStyle = getComputedStyle(eventsTrack);
      var gap = parseFloat(trackStyle.columnGap || trackStyle.gap || 0) || 0;
      return card.getBoundingClientRect().width + gap;
    }
    function updateEventsNav(){
      var max = eventsTrack.scrollWidth - eventsTrack.clientWidth;
      eventsPrev.disabled = eventsTrack.scrollLeft <= 2;
      eventsNext.disabled = eventsTrack.scrollLeft >= max - 2;
    }
    eventsPrev.addEventListener("click", function(){
      eventsTrack.scrollBy({ left: -eventsStep(), behavior: "smooth" });
    });
    eventsNext.addEventListener("click", function(){
      eventsTrack.scrollBy({ left: eventsStep(), behavior: "smooth" });
    });
    eventsTrack.addEventListener("scroll", updateEventsNav);
    window.addEventListener("resize", updateEventsNav);
    updateEventsNav();
  }
})();
