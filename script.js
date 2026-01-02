// ====== CONFIG ======
/**
 * ВАЖНО:
 * Укажите дату/время свадьбы в локальном времени (часовой пояс устройства).
 * Формат: new Date(year, monthIndex(0-11), day, hours, minutes, seconds)
 */
const WEDDING_DATE = new Date(2026, 7, 24, 16, 0, 0); // 24 Aug 2026 16:00

const LOCATION_NAME = "Villa Verde";
const LOCATION_ADDRESS = "Набережная, 12, Амстердам";

// ====== UTIL ======
const pad2 = (n) => String(n).padStart(2, "0");

// ====== REVEAL ON SCROLL ======
(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
            if (e.isIntersecting) e.target.classList.add("is-visible");
        }
    }, { threshold: 0.12 });

    els.forEach(el => io.observe(el));
})();

// ====== COUNTDOWN ======
(() => {
    const d = document.getElementById("cdDays");
    const h = document.getElementById("cdHours");
    const m = document.getElementById("cdMins");
    const s = document.getElementById("cdSecs");

    function tick() {
        const now = new Date();
        let diff = WEDDING_DATE.getTime() - now.getTime();

        if (diff <= 0) {
            d.textContent = "0";
            h.textContent = "00";
            m.textContent = "00";
            s.textContent = "00";
            return;
        }

        const sec = Math.floor(diff / 1000);
        const days = Math.floor(sec / (24 * 3600));
        const rem1 = sec % (24 * 3600);
        const hours = Math.floor(rem1 / 3600);
        const rem2 = rem1 % 3600;
        const mins = Math.floor(rem2 / 60);
        const secs = rem2 % 60;

        d.textContent = String(days);
        h.textContent = pad2(hours);
        m.textContent = pad2(mins);
        s.textContent = pad2(secs);
    }

    tick();
    setInterval(tick, 1000);
})();

// ====== MAP LINK + COPY ADDRESS ======
(() => {
    const mapBtn = document.getElementById("mapBtn");
    const copyBtn = document.getElementById("copyAddrBtn");
    const toast = document.getElementById("copyToast");

    const q = encodeURIComponent(`${LOCATION_NAME}, ${LOCATION_ADDRESS}`);
    // Универсальная ссылка (Google Maps Web)
    mapBtn.href = `https://www.google.com/maps/search/?api=1&query=${q}`;

    copyBtn.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(`${LOCATION_NAME}, ${LOCATION_ADDRESS}`);
            toast.textContent = "Адрес скопирован.";
        } catch {
            toast.textContent = "Не удалось скопировать. Выделите адрес вручную.";
        }
        setTimeout(() => (toast.textContent = ""), 2200);
    });
})();

// ====== RSVP (localStorage demo) ======
(() => {
    const form = document.getElementById("rsvpForm");
    const status = document.getElementById("formStatus");
    const fillDemoBtn = document.getElementById("fillDemoBtn");

    const STORAGE_KEY = "wedding_rsvp_v1";

    function getFormData() {
        const fd = new FormData(form);

        const attendance = fd.get("attendance"); // solo | plus1 | no
        const fullName = (fd.get("fullName") || "").toString().trim();
        const comment = (fd.get("comment") || "").toString().trim();

        const drinks = [];
        for (const [k, v] of fd.entries()) {
            if (k === "drinks") drinks.push(v.toString());
        }

        return { attendance, fullName, drinks, comment, savedAt: new Date().toISOString() };
    }

    function validate(data) {
        if (!data.attendance) return "Пожалуйста, выберите вариант присутствия.";
        if (!data.fullName || data.fullName.length < 3) return "Пожалуйста, укажите ФИО.";
        return "";
    }

    function save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function load() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return null; }
    }

    function applyLoaded(data) {
        if (!data) return;

        // attendance
        const a = form.querySelectorAll('input[name="attendance"]');
        a.forEach(r => r.checked = (r.value === data.attendance));

        // name
        const nameEl = document.getElementById("fullName");
        nameEl.value = data.fullName || "";

        // drinks
        const checks = form.querySelectorAll('input[name="drinks"]');
        checks.forEach(c => c.checked = (data.drinks || []).includes(c.value));

        // comment
        document.getElementById("comment").value = data.comment || "";

        status.textContent = "Ваш ответ уже сохранён на этом устройстве.";
        status.style.color = "var(--muted)";
    }

    // Load saved draft
    applyLoaded(load());

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const data = getFormData();
        const err = validate(data);

        if (err) {
            status.textContent = err;
            status.style.color = "#8A3B3B";
            // лёгкая подсветка ошибок
            form.classList.add("shake");
            setTimeout(() => form.classList.remove("shake"), 450);
            return;
        }

        save(data);
        status.textContent = "Спасибо! Ваш ответ сохранён. 🤍";
        status.style.color = "color-mix(in srgb, var(--graphite) 75%, var(--champagne) 25%)";
    });

    fillDemoBtn.addEventListener("click", () => {
        // демо-данные
        form.querySelector('input[name="attendance"][value="plus1"]').checked = true;
        document.getElementById("fullName").value = "Иван Иванов";
        form.querySelector('input[name="drinks"][value="wine"]').checked = true;
        form.querySelector('input[name="drinks"][value="nonalcohol"]').checked = true;
        document.getElementById("comment").value = "Без орехов, пожалуйста 🙂";
        status.textContent = "Пример заполнен — нажмите «Отправить ответ».";
        status.style.color = "var(--muted)";
    });
})();
// OPTIONAL: tiny shake animation via JS class
(() => {
    const style = document.createElement("style");
    style.textContent = `
    .shake { animation: shake .45s ease; }
    @keyframes shake{
      0%{ transform: translateX(0); }
      20%{ transform: translateX(-6px); }
      40%{ transform: translateX(6px); }
      60%{ transform: translateX(-4px); }
      80%{ transform: translateX(4px); }
      100%{ transform: translateX(0); }
    }
  `;
    document.head.appendChild(style);
})();