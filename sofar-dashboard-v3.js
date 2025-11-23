// Sofar Dashboard v3.0
// Kompletní moderní dashboard pro Sofar (ESPHome + HA)
// Sekce: PowerFlow, Koncový Uživatel, Servisní Módy
// Autor: ChatGPT – generováno na míru

// ============================
// KONFIGURACE
// ============================
const CONFIG = {
  updateInterval: 1000,
  eventSourceURL: "/events",
  enableAnimations: true,
  debug: false,
};

// ============================
// INTERNÍ STAV
// ============================
const state = {
  pv1: { v: 0, a: 0, w: 0 },
  pv2: { v: 0, a: 0, w: 0 },
  pv_total: 0,
  battery: { soc: 0, v: 0, w: 0, mode: "idle" },
  house: { w: 0 },
  grid: { w: 0, direction: "import" },
};

// ============================
// HELPER FUNKCE
// ============================
function $(id) {
  return document.getElementById(id);
}

function setText(id, value, unit = "") {
  const el = $(id);
  if (el) el.textContent = `${value}${unit}`;
}

function logDebug(...msg) {
  if (CONFIG.debug) console.log("DEBUG:", ...msg);
}

// ============================
// PRŮBĚŽNÁ AKTUALIZACE UI
// ============================
function updateUI() {
  setText("pv1_v", state.pv1.v, " V");
  setText("pv1_a", state.pv1.a, " A");
  setText("pv1_w", state.pv1.w, " W");

  setText("pv2_v", state.pv2.v, " V");
  setText("pv2_a", state.pv2.a, " A");
  setText("pv2_w", state.pv2.w, " W");

  setText("pv_total", state.pv_total, " W");

  setText("bat_soc", state.battery.soc, " %");
  setText("bat_v", state.battery.v, " V");
  setText("bat_w", state.battery.w, " W");

  setText("house_w", state.house.w, " W");

  setText("grid_w", state.grid.w, " W");
  $("grid_dir").textContent = state.grid.direction === "import" ? "Import" : "Export";

  updateFlowArrows();
}

// ============================
// POWERFLOW – ANIMOVANÉ ŠIPKY
// ============================
function updateFlowArrows() {
  const pv = state.pv_total;
  const bat = state.battery.w;
  const grid = state.grid.w;
  const house = state.house.w;

  // PV → DŮM / BAT / GRID
  if (pv > 50) $("arrow_pv").classList.add("flow-on");
  else $("arrow_pv").classList.remove("flow-on");

  // BATTERY
  if (bat > 20) {
    $("arrow_bat").classList.add("flow-discharge");
    $("arrow_bat").classList.remove("flow-charge");
  } else if (bat < -20) {
    $("arrow_bat").classList.add("flow-charge");
    $("arrow_bat").classList.remove("flow-discharge");
  } else {
    $("arrow_bat").classList.remove("flow-charge", "flow-discharge");
  }

  // GRID
  if (grid > 50) {
    $("arrow_grid").classList.add("flow-import");
    $("arrow_grid").classList.remove("flow-export");
  } else if (grid < -50) {
    $("arrow_grid").classList.add("flow-export");
    $("arrow_grid").classList.remove("flow-import");
  } else {
    $("arrow_grid").classList.remove("flow-import", "flow-export");
  }
}

// ============================
// SEKCE KONCOVÝ UŽIVATEL
// ============================
function updateUserSection() {
  $("user_pv_today").textContent = `${state.pv_total} W / live`;
  $("user_house_now").textContent = `${state.house.w} W`;
  $("user_soc").textContent = `${state.battery.soc} %`;
}

// ============================
// SEKCE SERVIS – tabulky parametrů
// ============================
function updateServiceSection() {
  $("srv_bat_voltage").textContent = `${state.battery.v} V`;
  $("srv_pv1_v").textContent = `${state.pv1.v} V`;
  $("srv_pv2_v").textContent = `${state.pv2.v} V`;
  $("srv_grid_p").textContent = `${state.grid.w} W`;
  $("srv_house_p").textContent = `${state.house.w} W`;
}

// ============================
// EVENTSOURCE – LIVE DATA
// ============================
function startEventSource() {
  const es = new EventSource(CONFIG.eventSourceURL);

  es.onmessage = (event) => {
    try {
      const d = JSON.parse(event.data);

      if (!d.id || d.value === undefined) return;

      // mapování dat
      switch (d.id) {
        case "pv1_voltage": state.pv1.v = d.value; break;
        case "pv1_current": state.pv1.a = d.value; break;
        case "pv1_power": state.pv1.w = d.value; break;

        case "pv2_voltage": state.pv2.v = d.value; break;
        case "pv2_current": state.pv2.a = d.value; break;
        case "pv2_power": state.pv2.w = d.value; break;

        case "pv_power_total": state.pv_total = d.value; break;

        case "battery_soc": state.battery.soc = d.value; break;
        case "battery_voltage": state.battery.v = d.value; break;
        case "battery_power": state.battery.w = d.value; break;

        case "house_load_power": state.house.w = d.value; break;

        case "grid_power":
          state.grid.w = d.value;
          state.grid.direction = d.value >= 0 ? "import" : "export";
          break;
      }

      updateUI();
      updateUserSection();
      updateServiceSection();
    } catch (e) {
      console.error("Chyba EventSource:", e);
    }
  };

  es.onerror = () => {
    console.warn("EventSource chyba – restart za 3s");
    setTimeout(startEventSource, 3000);
  };
}

// ============================
// INIT
// ============================
window.addEventListener("DOMContentLoaded", () => {
  startEventSource();
  setInterval(updateUI, CONFIG.updateInterval);
});
