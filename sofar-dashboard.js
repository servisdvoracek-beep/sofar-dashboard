// Sofar Solar Dashboard v1.0
// Tento soubor nahraď na GitHub a použij URL v ESPHome YAML
(function() {
  'use strict';
  
  // CSS styly
  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Segoe UI', Tahoma, sans-serif; 
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        min-height: 100vh; 
        color: #fff; 
        padding: 15px;
      }
      .solar-dashboard { max-width: 1200px; margin: 0 auto; }
      .solar-header { text-align: center; margin-bottom: 20px; padding: 15px; }
      .solar-header h1 { 
        font-size: 1.8rem; 
        background: linear-gradient(90deg, #ffd700, #ff8c00);
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .solar-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
        gap: 15px; 
      }
      .solar-card {
        background: rgba(255,255,255,0.08);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 20px;
        border: 1px solid rgba(255,255,255,0.1);
      }
      .solar-card-header { 
        display: flex; 
        align-items: center; 
        gap: 10px; 
        margin-bottom: 15px;
        font-size: 1rem;
        color: rgba(255,255,255,0.7);
      }
      .solar-card-icon {
        width: 40px; height: 40px;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.3rem;
      }
      .icon-solar { background: linear-gradient(135deg, #ffd700, #ff8c00); }
      .icon-battery { background: linear-gradient(135deg, #00b894, #00cec9); }
      .icon-grid { background: linear-gradient(135deg, #6c5ce7, #a29bfe); }
      .icon-home { background: linear-gradient(135deg, #e17055, #fdcb6e); }
      .solar-value { 
        font-size: 2.5rem; 
        font-weight: bold; 
        margin: 10px 0;
      }
      .solar-value .unit { 
        font-size: 1rem; 
        color: rgba(255,255,255,0.5); 
        margin-left: 5px;
      }
      .solar-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid rgba(255,255,255,0.1);
      }
      .solar-detail-label { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
      .solar-detail-value { font-size: 1.1rem; font-weight: 600; }
      .battery-bar {
        height: 25px;
        background: rgba(255,255,255,0.1);
        border-radius: 12px;
        overflow: hidden;
        margin: 10px 0;
      }
      .battery-fill {
        height: 100%;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 0.9rem;
        transition: width 0.5s ease;
        min-width: 40px;
      }
      .battery-low { background: linear-gradient(90deg, #e74c3c, #c0392b); }
      .battery-medium { background: linear-gradient(90deg, #f39c12, #e67e22); }
      .battery-high { background: linear-gradient(90deg, #00b894, #00cec9); }
      .solar-summary {
        grid-column: 1 / -1;
        background: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,140,0,0.1));
        border-color: rgba(255,215,0,0.3);
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 15px;
        text-align: center;
      }
      .summary-item {
        padding: 12px;
        background: rgba(0,0,0,0.2);
        border-radius: 12px;
      }
      .summary-value { font-size: 1.5rem; font-weight: bold; color: #ffd700; }
      .summary-label { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 5px; }
      .flow-status {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 10px;
        padding: 8px;
        background: rgba(0,0,0,0.2);
        border-radius: 8px;
        font-size: 0.9rem;
      }
      .flow-arrow { animation: pulse 1.5s infinite; }
      @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      .update-time {
        text-align: center;
        margin-top: 20px;
        color: rgba(255,255,255,0.4);
        font-size: 0.8rem;
      }
      @media (max-width: 600px) {
        .solar-value { font-size: 2rem; }
        .summary-value { font-size: 1.2rem; }
        body { padding: 10px; }
      }
    </style>
  `;

  // HTML šablona
  const template = `
    <div class="solar-dashboard">
      <div class="solar-header">
        <h1>☀️ Sofar Solar Dashboard</h1>
      </div>
      
      <div class="solar-grid">
        <!-- Souhrn -->
        <div class="solar-card solar-summary">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value" id="sd-total-pv">-- W</div>
              <div class="summary-label">☀️ Výroba</div>
            </div>
            <div class="summary-item">
              <div class="summary-value" id="sd-battery-soc">-- %</div>
              <div class="summary-label">🔋 Baterie</div>
            </div>
            <div class="summary-item">
              <div class="summary-value" id="sd-grid-power">-- W</div>
              <div class="summary-label">⚡ Síť</div>
            </div>
            <div class="summary-item">
              <div class="summary-value" id="sd-load">-- W</div>
              <div class="summary-label">🏠 Spotřeba</div>
            </div>
          </div>
        </div>

        <!-- PV1 -->
        <div class="solar-card">
          <div class="solar-card-header">
            <div class="solar-card-icon icon-solar">☀️</div>
            <span>PV1 - String 1</span>
          </div>
          <div class="solar-value"><span id="sd-pv1-power">--</span><span class="unit">W</span></div>
          <div class="solar-details">
            <div><div class="solar-detail-label">Napětí</div><div class="solar-detail-value" id="sd-pv1-voltage">-- V</div></div>
            <div><div class="solar-detail-label">Proud</div><div class="solar-detail-value" id="sd-pv1-current">-- A</div></div>
          </div>
        </div>

        <!-- PV2 -->
        <div class="solar-card">
          <div class="solar-card-header">
            <div class="solar-card-icon icon-solar">☀️</div>
            <span>PV2 - String 2</span>
          </div>
          <div class="solar-value"><span id="sd-pv2-power">--</span><span class="unit">W</span></div>
          <div class="solar-details">
            <div><div class="solar-detail-label">Napětí</div><div class="solar-detail-value" id="sd-pv2-voltage">-- V</div></div>
            <div><div class="solar-detail-label">Proud</div><div class="solar-detail-value" id="sd-pv2-current">-- A</div></div>
          </div>
        </div>

        <!-- Baterie -->
        <div class="solar-card">
          <div class="solar-card-header">
            <div class="solar-card-icon icon-battery">🔋</div>
            <span>Baterie</span>
          </div>
          <div class="battery-bar">
            <div class="battery-fill battery-high" id="sd-battery-bar" style="width:50%">
              <span id="sd-battery-percent">50%</span>
            </div>
          </div>
          <div class="solar-value"><span id="sd-battery-power">--</span><span class="unit">W</span></div>
          <div class="flow-status" id="sd-battery-flow">
            <span class="flow-arrow">⚡</span>
            <span id="sd-battery-status">Standby</span>
          </div>
          <div class="solar-details">
            <div><div class="solar-detail-label">Napětí</div><div class="solar-detail-value" id="sd-battery-voltage">-- V</div></div>
            <div><div class="solar-detail-label">Teplota</div><div class="solar-detail-value" id="sd-battery-temp">-- °C</div></div>
          </div>
        </div>

        <!-- Síť -->
        <div class="solar-card">
          <div class="solar-card-header">
            <div class="solar-card-icon icon-grid">⚡</div>
            <span>Síť</span>
          </div>
          <div class="solar-value"><span id="sd-grid-value">--</span><span class="unit">W</span></div>
          <div class="flow-status" id="sd-grid-flow">
            <span class="flow-arrow">→</span>
            <span id="sd-grid-status">--</span>
          </div>
          <div class="solar-details">
            <div><div class="solar-detail-label">Frekvence</div><div class="solar-detail-value" id="sd-grid-freq">-- Hz</div></div>
            <div><div class="solar-detail-label">L1 Napětí</div><div class="solar-detail-value" id="sd-l1-voltage">-- V</div></div>
          </div>
        </div>

        <!-- Spotřeba -->
        <div class="solar-card">
          <div class="solar-card-header">
            <div class="solar-card-icon icon-home">🏠</div>
            <span>Spotřeba domu</span>
          </div>
          <div class="solar-value"><span id="sd-load-value">--</span><span class="unit">W</span></div>
          <div class="solar-details">
            <div><div class="solar-detail-label">Výroba dnes</div><div class="solar-detail-value" id="sd-daily-prod">-- kWh</div></div>
            <div><div class="solar-detail-label">SOC baterie</div><div class="solar-detail-value" id="sd-soc-detail">-- %</div></div>
          </div>
        </div>
      </div>
      
      <div class="update-time">Aktualizace: <span id="sd-update-time">--</span></div>
    </div>
  `;

  // Mapování ESPHome ID na dashboard ID
  const sensorMap = {
    'sensor-pv1_vykon': { el: 'sd-pv1-power', format: v => Math.round(v) },
    'sensor-pv1_napeti': { el: 'sd-pv1-voltage', format: v => v.toFixed(1) + ' V' },
    'sensor-pv1_proud': { el: 'sd-pv1-current', format: v => v.toFixed(2) + ' A' },
    'sensor-pv2_vykon': { el: 'sd-pv2-power', format: v => Math.round(v) },
    'sensor-pv2_napeti': { el: 'sd-pv2-voltage', format: v => v.toFixed(1) + ' V' },
    'sensor-pv2_proud': { el: 'sd-pv2-current', format: v => v.toFixed(2) + ' A' },
    'sensor-pv_celkovy_vykon': { el: 'sd-total-pv', format: v => Math.round(v) + ' W' },
    'sensor-baterie_soc': { 
      el: 'sd-battery-soc', 
      format: v => Math.round(v) + ' %',
      extra: (v) => {
        const bar = document.getElementById('sd-battery-bar');
        const pct = document.getElementById('sd-battery-percent');
        const detail = document.getElementById('sd-soc-detail');
        if (bar && pct) {
          bar.style.width = v + '%';
          pct.textContent = Math.round(v) + '%';
          bar.className = 'battery-fill ' + (v < 20 ? 'battery-low' : v < 50 ? 'battery-medium' : 'battery-high');
        }
        if (detail) detail.textContent = Math.round(v) + ' %';
      }
    },
    'sensor-baterie_vykon': { 
      el: 'sd-battery-power', 
      format: v => Math.abs(Math.round(v)),
      extra: (v) => {
        const status = document.getElementById('sd-battery-status');
        if (status) {
          if (v > 50) status.textContent = '→ Nabíjí';
          else if (v < -50) status.textContent = '← Vybíjí';
          else status.textContent = 'Standby';
        }
      }
    },
    'sensor-sofar_baterie_napeti': { el: 'sd-battery-voltage', format: v => v.toFixed(1) + ' V' },
    'sensor-sofar_baterie_teplota': { el: 'sd-battery-temp', format: v => v.toFixed(1) + ' °C' },
    'sensor-grid_vykon': { 
      el: 'sd-grid-value', 
      format: v => Math.abs(Math.round(v)),
      extra: (v) => {
        const summary = document.getElementById('sd-grid-power');
        const status = document.getElementById('sd-grid-status');
        if (summary) summary.textContent = Math.round(v) + ' W';
        if (status) {
          if (v > 50) status.textContent = '← Odběr';
          else if (v < -50) status.textContent = '→ Dodávka';
          else status.textContent = 'Nula';
        }
      }
    },
    'sensor-grid_frekvence': { el: 'sd-grid-freq', format: v => v.toFixed(2) + ' Hz' },
    'sensor-l1_napeti': { el: 'sd-l1-voltage', format: v => v.toFixed(1) + ' V' },
    'sensor-spotreba_domu': { 
      el: 'sd-load-value', 
      format: v => Math.abs(Math.round(v)),
      extra: (v) => {
        const summary = document.getElementById('sd-load');
        if (summary) summary.textContent = Math.abs(Math.round(v)) + ' W';
      }
    },
    'sensor-solarni_vyroba_dnes': { el: 'sd-daily-prod', format: v => v.toFixed(2) + ' kWh' }
  };

  // Inicializace
  function init() {
    // Najdi hlavní kontejner ESPHome
    const container = document.body;
    
    // Vlož styly
    container.insertAdjacentHTML('afterbegin', styles);
    
    // Najdi nebo vytvoř wrapper
    let wrapper = document.querySelector('.solar-dashboard');
    if (!wrapper) {
      container.insertAdjacentHTML('afterbegin', template);
    }

    // Připoj se na ESPHome event stream
    connectEventSource();
    
    console.log('Sofar Dashboard initialized');
  }

  // Event Source pro real-time data
  function connectEventSource() {
    const source = new EventSource('/events');
    
    source.addEventListener('state', (e) => {
      try {
        const data = JSON.parse(e.data);
        updateSensor(data.id, data.value);
      } catch (err) {
        console.error('Parse error:', err);
      }
    });

    source.onerror = () => {
      console.log('EventSource error, reconnecting...');
      setTimeout(connectEventSource, 5000);
    };

    // Aktualizuj čas
    setInterval(() => {
      const el = document.getElementById('sd-update-time');
      if (el) el.textContent = new Date().toLocaleTimeString('cs-CZ');
    }, 1000);
  }

  // Aktualizace senzoru
  function updateSensor(id, value) {
    const mapping = sensorMap[id];
    if (!mapping) return;
    
    const el = document.getElementById(mapping.el);
    if (el && value !== undefined && !isNaN(value)) {
      el.textContent = mapping.format(parseFloat(value));
      if (mapping.extra) mapping.extra(parseFloat(value));
    }
  }

  // Spusť po načtení
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
})();
