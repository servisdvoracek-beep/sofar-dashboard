// Sofar Solar Dashboard v2.0
// Kompletně nahrazuje ESPHome UI
(function() {
  'use strict';

  // Počkej na načtení stránky
  function waitForLoad() {
    if (document.body) {
      setTimeout(initDashboard, 500);
    } else {
      setTimeout(waitForLoad, 100);
    }
  }

  function initDashboard() {
    // Kompletně nahraď obsah stránky
    document.head.innerHTML = `
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sofar Solar Dashboard</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, sans-serif; 
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          min-height: 100vh; 
          color: #fff; 
          padding: 15px;
        }
        .dashboard { max-width: 1400px; margin: 0 auto; }
        
        /* Header */
        .header { 
          text-align: center; 
          margin-bottom: 20px; 
          padding: 20px;
          background: rgba(255,255,255,0.05);
          border-radius: 16px;
        }
        .header h1 { 
          font-size: 2rem; 
          background: linear-gradient(90deg, #ffd700, #ff8c00);
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
        }
        .header .status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(0,255,0,0.15);
          border: 1px solid rgba(0,255,0,0.3);
          border-radius: 20px;
          font-size: 0.85rem;
        }
        .header .status.offline { background: rgba(255,0,0,0.15); border-color: rgba(255,0,0,0.3); }
        .status-dot {
          width: 8px; height: 8px;
          background: #0f0;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        .status.offline .status-dot { background: #f00; animation: none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        
        /* Tabs */
        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .tab {
          padding: 12px 24px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 10px;
          color: #fff;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s;
        }
        .tab:hover { background: rgba(255,255,255,0.2); }
        .tab.active { 
          background: linear-gradient(135deg, #ffd700, #ff8c00);
          color: #000;
          font-weight: bold;
        }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        
        /* Grid */
        .grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
          gap: 15px; 
        }
        
        /* Cards */
        .card {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: transform 0.3s;
        }
        .card:hover { transform: translateY(-3px); }
        .card-header { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          margin-bottom: 15px;
        }
        .card-icon {
          width: 45px; height: 45px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem;
        }
        .icon-solar { background: linear-gradient(135deg, #ffd700, #ff8c00); }
        .icon-battery { background: linear-gradient(135deg, #00b894, #00cec9); }
        .icon-grid { background: linear-gradient(135deg, #6c5ce7, #a29bfe); }
        .icon-home { background: linear-gradient(135deg, #e17055, #fdcb6e); }
        .icon-info { background: linear-gradient(135deg, #74b9ff, #0984e3); }
        .card-title { font-size: 1rem; color: rgba(255,255,255,0.7); }
        .card-value { 
          font-size: 2.5rem; 
          font-weight: bold; 
          margin: 10px 0;
        }
        .card-value .unit { 
          font-size: 1rem; 
          color: rgba(255,255,255,0.5); 
          margin-left: 5px;
        }
        .card-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .detail-label { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
        .detail-value { font-size: 1.1rem; font-weight: 600; }
        
        /* Battery bar */
        .battery-bar {
          height: 28px;
          background: rgba(255,255,255,0.1);
          border-radius: 14px;
          overflow: hidden;
          margin: 10px 0;
        }
        .battery-fill {
          height: 100%;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.9rem;
          transition: width 0.5s ease;
          min-width: 45px;
        }
        .battery-low { background: linear-gradient(90deg, #e74c3c, #c0392b); }
        .battery-medium { background: linear-gradient(90deg, #f39c12, #e67e22); }
        .battery-high { background: linear-gradient(90deg, #00b894, #00cec9); }
        
        /* Summary */
        .summary {
          grid-column: 1 / -1;
          background: linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,140,0,0.08));
          border-color: rgba(255,215,0,0.25);
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 15px;
          text-align: center;
        }
        .summary-item {
          padding: 15px 10px;
          background: rgba(0,0,0,0.25);
          border-radius: 12px;
        }
        .summary-value { font-size: 1.6rem; font-weight: bold; color: #ffd700; }
        .summary-label { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 5px; }
        
        /* Flow status */
        .flow-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 10px;
          padding: 8px 12px;
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
          font-size: 0.9rem;
        }
        
        /* Servis table */
        .servis-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .servis-table th, .servis-table td {
          padding: 10px 15px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .servis-table th {
          background: rgba(255,255,255,0.05);
          font-weight: 600;
          color: rgba(255,255,255,0.7);
        }
        .servis-table tr:hover { background: rgba(255,255,255,0.03); }
        
        /* Footer */
        .footer {
          text-align: center;
          margin-top: 25px;
          padding: 15px;
          color: rgba(255,255,255,0.4);
          font-size: 0.8rem;
        }
        
        @media (max-width: 600px) {
          .card-value { font-size: 2rem; }
          .summary-value { font-size: 1.3rem; }
          body { padding: 10px; }
          .tab { padding: 10px 16px; font-size: 0.9rem; }
        }
      </style>
    `;

    document.body.innerHTML = `
      <div class="dashboard">
        <div class="header">
          <h1>☀️ Sofar Solar Dashboard</h1>
          <div class="status" id="conn-status">
            <span class="status-dot"></span>
            <span id="status-text">Připojeno</span>
          </div>
        </div>
        
        <div class="tabs">
          <button class="tab active" onclick="showTab('zakaznik')">🏠 Zákazník</button>
          <button class="tab" onclick="showTab('servis')">🔧 Servis</button>
        </div>
        
        <!-- ZÁKAZNÍK TAB -->
        <div id="tab-zakaznik" class="tab-content active">
          <div class="grid">
            <!-- Souhrn -->
            <div class="card summary">
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-value" id="s-total-pv">-- W</div>
                  <div class="summary-label">☀️ Výroba</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value" id="s-soc">-- %</div>
                  <div class="summary-label">🔋 Baterie</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value" id="s-grid">-- W</div>
                  <div class="summary-label">⚡ Síť</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value" id="s-load">-- W</div>
                  <div class="summary-label">🏠 Spotřeba</div>
                </div>
              </div>
            </div>

            <!-- PV Celkem -->
            <div class="card">
              <div class="card-header">
                <div class="card-icon icon-solar">☀️</div>
                <div class="card-title">Solární výroba</div>
              </div>
              <div class="card-value"><span id="v-pv-total">--</span><span class="unit">W</span></div>
              <div class="card-details">
                <div><div class="detail-label">PV1</div><div class="detail-value" id="v-pv1">-- W</div></div>
                <div><div class="detail-label">PV2</div><div class="detail-value" id="v-pv2">-- W</div></div>
                <div><div class="detail-label">Dnes</div><div class="detail-value" id="v-pv-today">-- kWh</div></div>
                <div><div class="detail-label">Celkem</div><div class="detail-value" id="v-pv-total-kwh">-- kWh</div></div>
              </div>
            </div>

            <!-- Baterie -->
            <div class="card">
              <div class="card-header">
                <div class="card-icon icon-battery">🔋</div>
                <div class="card-title">Baterie</div>
              </div>
              <div class="battery-bar">
                <div class="battery-fill battery-high" id="bat-bar" style="width:50%">
                  <span id="bat-pct">50%</span>
                </div>
              </div>
              <div class="card-value"><span id="v-bat-power">--</span><span class="unit">W</span></div>
              <div class="flow-status">
                <span id="bat-status">⏸️ Standby</span>
              </div>
              <div class="card-details">
                <div><div class="detail-label">Napětí</div><div class="detail-value" id="v-bat-volt">-- V</div></div>
                <div><div class="detail-label">Teplota</div><div class="detail-value" id="v-bat-temp">-- °C</div></div>
              </div>
            </div>

            <!-- Síť -->
            <div class="card">
              <div class="card-header">
                <div class="card-icon icon-grid">⚡</div>
                <div class="card-title">Elektroměr / Síť</div>
              </div>
              <div class="card-value"><span id="v-grid">--</span><span class="unit">W</span></div>
              <div class="flow-status">
                <span id="grid-status">-- </span>
              </div>
              <div class="card-details">
                <div><div class="detail-label">Odběr dnes</div><div class="detail-value" id="v-import-today">-- kWh</div></div>
                <div><div class="detail-label">Dodáno dnes</div><div class="detail-value" id="v-export-today">-- kWh</div></div>
              </div>
            </div>

            <!-- Spotřeba -->
            <div class="card">
              <div class="card-header">
                <div class="card-icon icon-home">🏠</div>
                <div class="card-title">Spotřeba domu</div>
              </div>
              <div class="card-value"><span id="v-load">--</span><span class="unit">W</span></div>
              <div class="card-details">
                <div><div class="detail-label">Z FVE dnes</div><div class="detail-value" id="v-fve-today">-- kWh</div></div>
                <div><div class="detail-label">Soběstačnost</div><div class="detail-value" id="v-self">-- %</div></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- SERVIS TAB -->
        <div id="tab-servis" class="tab-content">
          <div class="grid">
            <div class="card" style="grid-column: 1 / -1;">
              <div class="card-header">
                <div class="card-icon icon-info">🔧</div>
                <div class="card-title">Servisní informace</div>
              </div>
              <table class="servis-table">
                <thead>
                  <tr><th>Parametr</th><th>Hodnota</th></tr>
                </thead>
                <tbody id="servis-tbody">
                  <tr><td>Načítání...</td><td>--</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div class="footer">
          Aktualizace: <span id="update-time">--</span> | Sofar Solar Dashboard v2.0
        </div>
      </div>
    `;

    // Připoj EventSource
    connectEvents();
    console.log('Sofar Dashboard v2.0 loaded');
  }

  // Tab switching
  window.showTab = function(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`[onclick="showTab('${tab}')"]`).classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
  };

  // Data storage
  const data = {};
  const servisData = [];

  // Event Source
  function connectEvents() {
    const source = new EventSource('/events');
    
    source.addEventListener('state', (e) => {
      try {
        const d = JSON.parse(e.data);
        data[d.id] = d.value;
        updateUI(d.id, d.value);
        updateServis(d.id, d.value);
      } catch (err) {}
    });

    source.onerror = () => {
      document.getElementById('conn-status').classList.add('offline');
      document.getElementById('status-text').textContent = 'Odpojeno';
      setTimeout(connectEvents, 5000);
    };

    source.onopen = () => {
      document.getElementById('conn-status').classList.remove('offline');
      document.getElementById('status-text').textContent = 'Připojeno';
    };

    setInterval(() => {
      const el = document.getElementById('update-time');
      if (el) el.textContent = new Date().toLocaleTimeString('cs-CZ');
    }, 1000);
  }

  // Servis data collection
  const servisItems = {};
  function updateServis(id, value) {
    if (value === undefined || value === null || isNaN(value)) return;
    
    // Překlad ID na český název
    const names = {
      'sensor-pv1_napeti': 'PV1 Napětí',
      'sensor-pv1_proud': 'PV1 Proud',
      'sensor-pv1_vykon': 'PV1 Výkon',
      'sensor-pv2_napeti': 'PV2 Napětí',
      'sensor-pv2_proud': 'PV2 Proud',
      'sensor-pv2_vykon': 'PV2 Výkon',
      'sensor-pv_celkovy_vykon': 'Solar Celkový Výkon',
      'sensor-baterie_soc': 'Baterie SOC',
      'sensor-baterie_vykon': 'Baterie Výkon',
      'sensor-sofar_baterie_napeti': 'Baterie Napětí',
      'sensor-sofar_baterie_proud': 'Baterie Proud',
      'sensor-sofar_baterie_teplota': 'Baterie Teplota',
      'sensor-baterie_soh': 'Baterie SOH',
      'sensor-baterie_cykly': 'Baterie Cykly',
      'sensor-grid_vykon': 'Grid Výkon',
      'sensor-grid_frekvence': 'Grid Frekvence',
      'sensor-spotreba_domu': 'Výstup z měniče',
      'sensor-l1_napeti': 'L1 Napětí',
      'sensor-l1_proud': 'L1 Proud',
      'sensor-l2_napeti': 'L2 Napětí',
      'sensor-l2_proud': 'L2 Proud',
      'sensor-l3_napeti': 'L3 Napětí',
      'sensor-l3_proud': 'L3 Proud',
      'sensor-solarni_vyroba_dnes': 'Solární výroba dnes',
      'sensor-solarni_vyroba_celkem': 'Solární výroba celkem',
      'sensor-sofar_rezim_uloziste': 'Režim úložiště',
      'sensor-sofar_export_stav': 'Export stav',
      'sensor-sofar_grid_charge_stav': 'Grid Charge stav',
      'sensor-sofar_battery_dod': 'Baterie DoD'
    };

    const units = {
      'sensor-pv1_napeti': 'V', 'sensor-pv2_napeti': 'V',
      'sensor-pv1_proud': 'A', 'sensor-pv2_proud': 'A',
      'sensor-pv1_vykon': 'W', 'sensor-pv2_vykon': 'W',
      'sensor-pv_celkovy_vykon': 'W',
      'sensor-baterie_soc': '%', 'sensor-baterie_soh': '%',
      'sensor-baterie_vykon': 'W',
      'sensor-sofar_baterie_napeti': 'V',
      'sensor-sofar_baterie_proud': 'A',
      'sensor-sofar_baterie_teplota': '°C',
      'sensor-baterie_cykly': 'cyklů',
      'sensor-grid_vykon': 'W',
      'sensor-grid_frekvence': 'Hz',
      'sensor-spotreba_domu': 'W',
      'sensor-l1_napeti': 'V', 'sensor-l2_napeti': 'V', 'sensor-l3_napeti': 'V',
      'sensor-l1_proud': 'A', 'sensor-l2_proud': 'A', 'sensor-l3_proud': 'A',
      'sensor-solarni_vyroba_dnes': 'kWh',
      'sensor-solarni_vyroba_celkem': 'kWh',
      'sensor-sofar_battery_dod': '%'
    };

    if (names[id]) {
      let val = parseFloat(value);
      let formatted = Number.isInteger(val) ? val : val.toFixed(2);
      servisItems[id] = { name: names[id], value: formatted + ' ' + (units[id] || '') };
      
      // Update table
      const tbody = document.getElementById('servis-tbody');
      if (tbody) {
        let html = '';
        for (const key in servisItems) {
          html += `<tr><td>${servisItems[key].name}</td><td>${servisItems[key].value}</td></tr>`;
        }
        tbody.innerHTML = html;
      }
    }
  }

  // UI Update
  function updateUI(id, value) {
    if (value === undefined || isNaN(value)) return;
    const v = parseFloat(value);

    // PV
    if (id === 'sensor-pv1_vykon') {
      setText('v-pv1', Math.round(v) + ' W');
      updateTotalPV();
    }
    if (id === 'sensor-pv2_vykon') {
      setText('v-pv2', Math.round(v) + ' W');
      updateTotalPV();
    }
    if (id === 'sensor-pv_celkovy_vykon') {
      setText('v-pv-total', Math.round(v));
      setText('s-total-pv', Math.round(v) + ' W');
    }
    if (id === 'sensor-solarni_vyroba_dnes') {
      setText('v-pv-today', v.toFixed(2) + ' kWh');
    }
    if (id === 'sensor-solarni_vyroba_celkem') {
      setText('v-pv-total-kwh', v.toFixed(1) + ' kWh');
    }

    // Battery
    if (id === 'sensor-baterie_soc') {
      setText('s-soc', Math.round(v) + ' %');
      setText('bat-pct', Math.round(v) + '%');
      const bar = document.getElementById('bat-bar');
      if (bar) {
        bar.style.width = v + '%';
        bar.className = 'battery-fill ' + (v < 20 ? 'battery-low' : v < 50 ? 'battery-medium' : 'battery-high');
      }
    }
    if (id === 'sensor-baterie_vykon') {
      setText('v-bat-power', Math.abs(Math.round(v)));
      const status = document.getElementById('bat-status');
      if (status) {
        if (v > 50) status.textContent = '⬆️ Nabíjí ' + Math.round(v) + ' W';
        else if (v < -50) status.textContent = '⬇️ Vybíjí ' + Math.abs(Math.round(v)) + ' W';
        else status.textContent = '⏸️ Standby';
      }
    }
    if (id === 'sensor-sofar_baterie_napeti') setText('v-bat-volt', v.toFixed(1) + ' V');
    if (id === 'sensor-sofar_baterie_teplota') setText('v-bat-temp', v.toFixed(1) + ' °C');

    // Grid
    if (id === 'sensor-grid_vykon') {
      setText('v-grid', Math.abs(Math.round(v)));
      setText('s-grid', Math.round(v) + ' W');
      const status = document.getElementById('grid-status');
      if (status) {
        if (v > 50) status.textContent = '⬅️ Odběr ze sítě';
        else if (v < -50) status.textContent = '➡️ Dodávka do sítě';
        else status.textContent = '⚖️ Vyrovnáno';
      }
    }

    // Load
    if (id === 'sensor-spotreba_domu') {
      setText('v-load', Math.abs(Math.round(v)));
      setText('s-load', Math.abs(Math.round(v)) + ' W');
    }

    // Energy stats
    if (id.includes('odber_ze_site_dnes')) setText('v-import-today', v.toFixed(2) + ' kWh');
    if (id.includes('dodavka_do_site_dnes')) setText('v-export-today', v.toFixed(2) + ' kWh');
    if (id.includes('spotreba_z_fve_dnes')) setText('v-fve-today', v.toFixed(2) + ' kWh');
  }

  function updateTotalPV() {
    const pv1 = data['sensor-pv1_vykon'] || 0;
    const pv2 = data['sensor-pv2_vykon'] || 0;
    const total = parseFloat(pv1) + parseFloat(pv2);
    setText('v-pv-total', Math.round(total));
    setText('s-total-pv', Math.round(total) + ' W');
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Start
  waitForLoad();
})();
