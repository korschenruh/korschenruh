document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href) return;
    event.preventDefault();
    window.location.href = href;
  });
});

const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const tabRoot = document.querySelector("[data-tabs]");
if (tabRoot) {
  const tabs = tabRoot.querySelectorAll('[role="tab"]');
  const panels = tabRoot.querySelectorAll('[role="tabpanel"]');

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("aria-controls");
      const season = tab.getAttribute("data-season");
      tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");
      if (season) {
        tabRoot.setAttribute("data-active", season);
      }
      panels.forEach((panel) => {
        panel.hidden = panel.id !== id;
      });
    });
  });
}

const houseBigEl = document.getElementById("calcHouseBig");
const houseForestEl = document.getElementById("calcHouseForest");
const guestsEl = document.getElementById("calcGuests");
const guestsWrap = document.getElementById("calcGuestsWrap");
const guestsLabel = document.getElementById("calcGuestsLabel");
const chanEl = document.getElementById("calcChan");
const fillEl = document.getElementById("calcFill");
const venikEl = document.getElementById("calcVenik");
const resultEl = document.getElementById("calcResult");
const breakdownEl = document.getElementById("calcBreakdown");
const calcForm = document.getElementById("calc");
const orderBtn = document.querySelector(".calc__order");
const TELEGRAM_ORDER = "MANAGER_LuDoMaN";

let lastOrder = { lines: [], total: 0 };

function money(n) {
  return `${n.toLocaleString("ru-RU")} ₽`;
}

function buildOrderMessage(order) {
  const body =
    order.lines.length > 0
      ? order.lines.map((line) => `• ${line}`).join("\n")
      : "• Позиции не выбраны";
  const totalLine =
    order.total > 0 ? `Итого: ≈ ${money(order.total)}` : "Итого: не рассчитано";
  return `Здравствуйте! Заявка с сайта Korschenruh\n\n${body}\n\n${totalLine}`;
}

function syncOrderLink() {
  if (!orderBtn) return;
  const text = buildOrderMessage(lastOrder);
  orderBtn.href = `https://t.me/${TELEGRAM_ORDER}?text=${encodeURIComponent(text)}`;
}

function updateCalc() {
  if (!resultEl || !breakdownEl) return;

  const lines = [];
  let total = 0;

  const big = houseBigEl?.checked;
  const forest = houseForestEl?.checked;
  const forestOnly = forest && !big;
  const maxGuests = forestOnly ? 8 : 24;

  if (guestsEl) {
    guestsEl.max = String(maxGuests);
    let raw = Number(guestsEl.value) || 8;
    if (raw > maxGuests) {
      raw = maxGuests;
      guestsEl.value = String(maxGuests);
    }
    if (raw < 1) {
      raw = 1;
      guestsEl.value = "1";
    }
  }

  const guests = Math.max(1, Math.min(maxGuests, Number(guestsEl?.value) || 8));

  if (guestsWrap) {
    guestsWrap.hidden = !(big || forest);
  }

  if (guestsLabel) {
    if (forestOnly) {
      guestsLabel.textContent = "Гостей в лесном доме (макс. 8)";
    } else if (big) {
      guestsLabel.textContent = "Гостей в большом доме";
    } else {
      guestsLabel.textContent = "Гостей";
    }
  }

  if (big) {
    let houseTotal = 20000;
    if (guests > 8) {
      houseTotal += (guests - 8) * 500;
    }
    total += houseTotal;
    lines.push(
      guests > 8
        ? `Большой дом, ${guests} гостей — ${money(houseTotal)}`
        : `Большой дом — ${money(houseTotal)}`
    );
  }

  if (forest) {
    total += 15000;
    lines.push(
      forestOnly
        ? `Лесной дом, ${guests} гостей — ${money(15000)}`
        : `Лесной дом — ${money(15000)}`
    );
  }

  const banyaYardEl = document.getElementById("calcBanyaYard");
  const banyaForestEl = document.getElementById("calcBanyaForest");

  if (banyaYardEl?.checked) {
    total += 4000;
    lines.push(`Баня во дворе — ${money(4000)}`);
  }
  if (banyaForestEl?.checked) {
    total += 5000;
    lines.push(`Баня в лесном доме — ${money(5000)}`);
  }

  if (chanEl?.checked) {
    total += 7000;
    lines.push(`Чан — ${money(7000)}`);
  }

  if (fillEl?.checked) {
    total += 1000;
    lines.push(`Наполнение чана — ${money(1000)}`);
  }

  if (venikEl?.checked) {
    total += 500;
    lines.push(`Веник — ${money(500)}`);
  }

  const sourceEl = document.getElementById("calcSource");
  const sourceTextEl = document.getElementById("calcSourceText");
  const sourceLabels = {
    avito: "Авито",
    friends: "От друзей / знакомых",
    instagram: "Instagram",
    telegram: "Telegram",
    yandex: "Яндекс / поиск",
    vk: "ВКонтакте",
    repeat: "Уже были у нас",
    other: "Другое",
  };
  const sourceValue = sourceEl?.value || "";
  const sourceNote = (sourceTextEl?.value || "").trim();
  if (sourceValue || sourceNote) {
    const label = sourceValue ? sourceLabels[sourceValue] || sourceValue : "";
    const how = [label, sourceNote].filter(Boolean).join(" — ");
    lines.push(`Узнали о нас: ${how}`);
  }

  lastOrder = { lines, total };
  breakdownEl.innerHTML = lines.map((line) => `<li>${line}</li>`).join("");

  if (total === 0) {
    resultEl.textContent = "Выберите услуги для расчёта";
  } else {
    resultEl.textContent = `≈ ${money(total)}`;
  }

  syncOrderLink();
}

orderBtn?.addEventListener("click", (event) => {
  syncOrderLink();
  if (lastOrder.total === 0 && lastOrder.lines.length === 0) {
    event.preventDefault();
    resultEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (resultEl) resultEl.textContent = "Выберите услуги для расчёта";
  }
});

calcForm?.addEventListener("input", updateCalc);
calcForm?.addEventListener("change", updateCalc);

updateCalc();
