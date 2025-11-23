// Sofar Solar Dashboard v3.1 - Opravená DOM manipulace
// Kompatibilní s ESPHome web_server v2 Lit framework

// ... (Zbytek kódu, který jste vložil) ...

(function() {
  'use strict';
  
  let attempts = 0;
  const maxAttempts = 50;
  
  // !!! KRITICKÁ ZMĚNA 1: ZVYŠTE ZPOŽDĚNÍ PRO JISTOTU !!!
  const initialDelay = 1500; // ZVÝŠENO na 1500ms (1.5 sekundy)
  const retryInterval = 300;  // ZVÝŠENO na 300ms

  function tryInit() {
    attempts++;
    
    // Čekej až se načte ESPHome UI (tabulka nebo hlavní aplikace)
    // Záměrně hledáme buď esphome-app nebo hlavní tabulku, které označují, že Lit dokončil render
    const table = document.querySelector('table');
    const esphomeApp = document.querySelector('esphome-app');
    
    if (table || esphomeApp || attempts > maxAttempts) {
        // !!! KRITICKÁ ZMĚNA 2: PŘIDEJTE DODATEČNÉ ZPOŽDĚNÍ ZDE
        // Tím zajistíme, že se náš kód spustí až po Lit frameworku.
        setTimeout(applyDashboard, initialDelay); 
    } else {
      setTimeout(tryInit, retryInterval);
    }
  }
// ... (Zbytek kódu beze změny) ...

  function applyDashboard() {
    // === KROK 1: Přidej custom CSS ===
    const style = document.createElement('style');
    style.textContent = `
      /* Základní styly */
      body, html {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
        min-height: 100vh;
        font-family: 'Segoe UI', Tahoma, sans-serif !important;
      }
      
      /* Header */
      .dashboard-header {
        text-align: center;
        padding: 25px 15px;
        margin-bottom: 20px;
      }
      .dashboard-header h1 {
        font-size: 2.2rem;
        background: linear-gradient(90deg, #ffd700, #ff8c00);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 15px 0;
      }
      
      /* Souhrn karty */
      .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        margin-bottom: 25px;
        padding: 0 15px;
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
      }
      .summary-card {
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 20px 15px;
        text-align: center;
        border: 1px solid rgba(255,255,255,0.15);
      }
      .summary-card.solar { border-top: 3px solid #ffd700; }
      .summary-card.battery { border-top: 3px solid #00cec9; }
      .summary-card.grid { border-top: 3px solid #a29bfe; }
      .summary-card.home { border-top: 3px solid #fdcb6e; }
      .summary-icon { font-size: 1.8rem; margin-bottom: 8px; }
      .summary-value { 
        font-size: 1.8rem; 
        font-weight: bold; 
        color: #fff;
        margin: 5px 0;
      }
      .summary-label { 
        font-size: 0.85rem; 
        color: rgba(255,255,255,0.6); 
      }
      
      /* Tabs */
      .tab-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        padding: 0 15px;
      }
      .tab-btn {
        padding: 12px 28px;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 25px;
        color: #fff;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s;
      }
      .tab-btn:hover { background: rgba(255,255,255,0.2); }
      .tab-btn.active { 
        background: linear-gradient(135deg, #ffd700, #ff8c00);
        color: #000;
        font-weight: bold;
        border-color: transparent;
      }
      
      /* Tab content */
      .tab-panel { display: none; padding: 0 15px; }
      .tab-panel.active { display: block; }
      
      /* ESPHome tabulka - styly */
      table {
        width: 100% !important;
        max-width: 1000px !important;
        margin: 0 auto !important;
        background: rgba(255,255,255,0.05) !important;
        border-radius: 12px !important;
        overflow: hidden !important;
        border-collapse: collapse !important;
      }
      th {
        background: rgba(255,255,255,0.1) !important;
        color: rgba(255,255,255,0.8) !important;
        padding: 15px !important;
        font-weight: 600 !important;
        text-align: left !important;
      }
      td {
        padding: 12px 15px !important;
        color: #fff !important;
        border-bottom: 1px solid rgba(255,255,255,0.05) !important;
      }
      tr:hover td {
        background: rgba(255,255,255,0.03) !important;
      }
      
      /* Footer */
      .dashboard-footer {
        text-align: center;
        padding: 20px;
        color: rgba(255,255,255,0.4);
        font-size: 0.85rem;
        margin-top: 30px;
      }
      
      /* Skryj původní ESPHome header pokud existuje */
      esphome-app > div:first-child { display: none !important; }
      
      /* Responzivita */
      @media (max-width: 600px) {
        .summary-value { font-size: 1.4rem; }
        .dashboard-header h1 { font-size: 1.6rem; }
        .tab-btn { padding: 10px 20px; font-size: 0.9rem; }
      }
    `;
    document.head.appendChild(style);

    // === KROK 2: VYČIŠTĚNÍ PŮVODNÍHO OBSAHU a Vytvoření wrapperu ===
    
    // Ulož původní obsah (ESPHome app nebo jen tabulka)
    const esphomeApp = document.querySelector('esphome-app');
    const table = document.querySelector('table');
    let originalContent = esphomeApp || table;
    
    let wrapper = document.querySelector('.dashboard-wrapper');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'dashboard-wrapper';
        
        // !!! KRITICKÁ ZMĚNA: Agresivní přesun obsahu nahradíme jednodušším appendováním po smazání body.
        // Tím se sníží riziko kolize s Lit frameworkem, který se stále snaží renderovat.
        // Nejprve smažeme VŠECHEN obsah body.
        document.body.innerHTML = ''; 
        // A přidáme nový wrapper, do kterého se vše bude vkládat.
        document.body.appendChild(wrapper); 
    }

    // === KROK 3: Sestavení Dashboardu ===

    // Přidej header
    if (!document.querySelector('.dashboard-header')) {
      const header = document.createElement('div');
      header.className = 'dashboard-header';
      header.innerHTML = `<h1>☀️ Sofar Solar Dashboard</h1>`;
      wrapper.appendChild(header); // Přidáváme přímo do wrapperu
    }

    // Přidej summary karty
    if (!document.querySelector('.summary-cards')) {
      const summary = document.createElement('div');
      summary.className = 'summary-cards';
      summary.innerHTML = `
        <div class="summary-card solar">
          <div class="summary-icon">☀️</div>
          <div class="summary-value" id="sum-pv">-- W</div>
          <div class="summary-label">Výroba</div>
        </div>
        <div class="summary-card battery">
          <div class="summary-icon">🔋</div>
          <div class="summary-value" id="sum-bat">-- %</div>
          <div class="summary-label">Baterie</div>
        </div>
        <div class="summary-card grid">
          <div class="summary-icon">⚡</div>
          <div class="summary-value" id="sum-grid">-- W</div>
          <div class="summary-label">Síť</div>
        </div>
        <div class="summary-card home">
          <div class="summary-icon">🏠</div>
          <div class="summary-value" id="sum-load">-- W</div>
          <div class="summary-label">Spotřeba</div>
        </div>
      `;
      wrapper.appendChild(summary); // Přidáváme přímo do wrapperu
    }

    // Přidej taby
    if (!document.querySelector('.tab-buttons')) {
      const tabs = document.createElement('div');
      tabs.className = 'tab-buttons';
      tabs.innerHTML = `
        <button class="tab-btn active" data-tab="customer">🏠 Zákazník</button>
        <button class="tab-btn" data-tab="service">🔧 Servis</button>
      `;
      wrapper.appendChild(tabs); // Přidáváme přímo do wrapperu

      // Event listeners pro taby
      tabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
          const tabId = btn.getAttribute('data-tab');
          const panel = document.getElementById('panel-' + tabId);
          if (panel) panel.classList.add('active');
        });
      });
    }

    // Vytvoř tab panely
    if (!document.querySelector('.tab-panel')) {
      
      // Customer panel
      const customerPanel = document.createElement('div');
      customerPanel.id = 'panel-customer';
      customerPanel.className = 'tab-panel active';
      customerPanel.innerHTML = `
        <div style="max-width:1000px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px,1fr)); gap:15px;">
          <div class="summary-card" style="padding:25px; text-align:left;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">
              <span style="font-size:2rem;">☀️</span>
              <span style="color:rgba(255,255,255,0.7);">Solární výroba</span>
            </div>
            <div style="font-size:2.2rem; font-weight:bold;" id="card-pv">-- W</div>
            <div style="margin-top:15px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.1); display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div><div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">PV1</div><div id="card-pv1">-- W</div></div>
              <div><div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">PV2</div><div id="card-pv2">-- W</div></div>
            </div>
          </div>
          <div class="summary-card" style="padding:25px; text-align:left;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">
              <span style="font-size:2rem;">🔋</span>
              <span style="color:rgba(255,255,255,0.7);">Baterie</span>
            </div>
            <div style="height:25px; background:rgba(255,255,255,0.1); border-radius:12px; overflow:hidden; margin-bottom:10px;">
              <div id="card-bat-bar" style="height:100%; width:50%; background:linear-gradient(90deg,#00b894,#00cec9); border-radius:12px; display:flex; align-items:center; justify-content:center; font-weight:bold; transition:width 0.5s;">
                <span id="card-bat-pct">50%</span>
              </div>
            </div>
            <div style="font-size:2.2rem; font-weight:bold;" id="card-bat-power">-- W</div>
            <div style="margin-top:10px; padding:8px 12px; background:rgba(0,0,0,0.2); border-radius:8px; text-align:center;" id="card-bat-status">⏸️ Standby</div>
          </div>
          <div class="summary-card" style="padding:25px; text-align:left;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">
              <span style="font-size:2rem;">⚡</span>
              <span style="color:rgba(255,255,255,0.7);">Síť</span>
            </div>
            <div style="font-size:2.2rem; font-weight:bold;" id="card-grid">-- W</div>
            <div style="margin-top:10px; padding:8px 12px; background:rgba(0,0,0,0.2); border-radius:8px; text-align:center;" id="card-grid-status">--</div>
          </div>
          <div class="summary-card" style="padding:25px; text-align:left;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:15px;">
              <span style="font-size:2rem;">🏠</span>
              <span style="color:rgba(255,255,255,0.7);">Spotřeba</span>
            </div>
            <div style="font-size:2.2rem; font-weight:bold;" id="card-load">-- W</div>
          </div>
        </div>
      `;

      // Service panel s tabulkou
      const servicePanel = document.createElement('div');
      servicePanel.id = 'panel-service';
      servicePanel.className = 'tab-panel';
      
      // Přidáme panely do wrapperu
      wrapper.appendChild(customerPanel);
      wrapper.appendChild(servicePanel);
      
      // Vložíme původní obsah ESPHome (pokud existuje) do Service panelu
      if (originalContent) {
          servicePanel.appendChild(originalContent);
      }
    }

    // Přidej footer
    if (!document.querySelector('.dashboard-footer')) {
      const footer = document.createElement('div');
      footer.className = 'dashboard-footer';
      footer.innerHTML = `Aktualizace: <span id="upd-time">--</span> | Sofar Solar Dashboard v3.1 (Opraveno pro Lit-kompatibilitu)`;
      wrapper.appendChild(footer);
    }

    // EventSource pro živá data
    connectEvents();
    
    // Update time
    setInterval(() => {
      const el = document.getElementById('upd-time');
      if (el) el.textContent = new Date().toLocaleTimeString('cs-CZ');
    }, 1000);

    console.log('Sofar Dashboard v3.1 loaded successfully (Lit compatible)');
  }

  function connectEvents() {
    try {
      // Použijeme lokální EventSource
      const source = new EventSource('/events');
      
      source.addEventListener('state', (e) => {
        try {
          const d = JSON.parse(e.data);
          updateValues(d.id, d.value);
        } catch(err) {}
      });

      source.onerror = () => {
        // Opakovaný pokus o připojení
        setTimeout(connectEvents, 5000);
      };
    } catch(err) {
      console.log('EventSource error:', err);
      // Opakovaný pokus o připojení i v případě chyby EventSource
      setTimeout(connectEvents, 5000);
    }
  }

  const data = {};
  
  function updateValues(id, value) {
    if (value === undefined || value === null) return;
    const v = parseFloat(value);
    if (isNaN(v)) return;
    
    data[id] = v;

    // PV
    if (id === 'sensor-pv1_vykon' || id === 'sensor-pv2_vykon') {
      const pv1 = data['sensor-pv1_vykon'] || 0;
      const pv2 = data['sensor-pv2_vykon'] || 0;
      const total = pv1 + pv2;
      setText('sum-pv', Math.round(total) + ' W');
      setText('card-pv', Math.round(total) + ' W');
      setText('card-pv1', Math.round(pv1) + ' W');
      setText('card-pv2', Math.round(pv2) + ' W');
    }
    
    // Battery SOC
    if (id === 'sensor-baterie_soc') {
      setText('sum-bat', Math.round(v) + ' %');
      setText('card-bat-pct', Math.round(v) + '%');
      const bar = document.getElementById('card-bat-bar');
      if (bar) {
        bar.style.width = v + '%';
        if (v < 20) bar.style.background = 'linear-gradient(90deg,#e74c3c,#c0392b)';
        else if (v < 50) bar.style.background = 'linear-gradient(90deg,#f39c12,#e67e22)';
        else bar.style.background = 'linear-gradient(90deg,#00b894,#00cec9)';
      }
    }
    
    // Battery power
    if (id === 'sensor-baterie_vykon') {
      setText('card-bat-power', Math.abs(Math.round(v)) + ' W');
      const status = document.getElementById('card-bat-status');
      if (status) {
        if (v > 50) status.textContent = '⬆️ Nabíjí ' + Math.round(v) + ' W';
        else if (v < -50) status.textContent = '⬇️ Vybíjí ' + Math.abs(Math.round(v)) + ' W';
        else status.textContent = '⏸️ Standby';
      }
    }
    
    // Grid
    if (id === 'sensor-grid_vykon') {
      setText('sum-grid', Math.round(v) + ' W');
      setText('card-grid', Math.abs(Math.round(v)) + ' W');
      const status = document.getElementById('card-grid-status');
      if (status) {
        // Grid Výkon je v ESPHome nastaven tak, že kladná hodnota je ODBĚR (grid > 0)
        // a záporná hodnota je DODÁVKA (grid < 0)
        if (v > 50) status.textContent = '⬅️ Odběr ze sítě';
        else if (v < -50) status.textContent = '➡️ Dodávka do sítě';
        else status.textContent = '⚖️ Vyrovnáno';
      }
    }
    
    // Load (Spotřeba domu)
    if (id === 'sensor-spotreba_domu') {
      setText('sum-load', Math.abs(Math.round(v)) + ' W');
      setText('card-load', Math.abs(Math.round(v)) + ' W');
    }
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
