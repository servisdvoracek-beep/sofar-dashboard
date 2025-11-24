// Sofar Solar Dashboard v4.0 - Pure CSS styling
// Žádné DOM manipulace, pouze styling
(function() {
  'use strict';
  
  // Počkej na načtení
  function waitAndApply() {
    if (document.body && document.head) {
      applyStyles();
    } else {
      setTimeout(waitAndApply, 50);
    }
  }
  
  function applyStyles() {
    // Pouze přidej CSS
    const style = document.createElement('style');
    style.id = 'sofar-custom-styles';
    style.textContent = `
      /* Základní vzhled */
      body, html {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
        min-height: 100vh;
        margin: 0;
        padding: 15px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
      }
      
      /* Header přidej před tabulku */
      body::before {
        content: '☀️ Sofar Solar Dashboard';
        display: block;
        text-align: center;
        font-size: 2.5rem;
        font-weight: bold;
        background: linear-gradient(90deg, #ffd700, #ff8c00);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        padding: 30px 15px;
        margin-bottom: 25px;
      }
      
      /* Tabulka styling */
      table {
        width: 100% !important;
        max-width: 900px !important;
        margin: 0 auto !important;
        background: rgba(255,255,255,0.08) !important;
        backdrop-filter: blur(15px) !important;
        border-radius: 16px !important;
        overflow: hidden !important;
        border-collapse: collapse !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
      }
      
      /* Table header */
      thead tr {
        background: rgba(255,215,0,0.15) !important;
        border-bottom: 2px solid rgba(255,215,0,0.3) !important;
      }
      
      th {
        background: transparent !important;
        color: #ffd700 !important;
        padding: 18px 20px !important;
        font-weight: 700 !important;
        text-align: left !important;
        font-size: 1.05rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }
      
      /* Table rows */
      tbody tr {
        border-bottom: 1px solid rgba(255,255,255,0.08) !important;
        transition: all 0.3s !important;
      }
      
      tbody tr:hover {
        background: rgba(255,215,0,0.1) !important;
        transform: scale(1.01) !important;
      }
      
      /* Table cells */
      td {
        padding: 15px 20px !important;
        color: #fff !important;
        font-size: 1rem !important;
      }
      
      /* First column (Name) - bold */
      td:first-child {
        font-weight: 600 !important;
        color: rgba(255,255,255,0.9) !important;
      }
      
      /* Second column (State) - highlighted value */
      td:nth-child(2) {
        font-weight: 700 !important;
        font-size: 1.1rem !important;
        color: #ffd700 !important;
      }
      
      /* Zvýrazni důležité řádky */
      tr:has(td:first-child:contains("Baterie SOC")) {
        background: rgba(0,206,201,0.08) !important;
      }
      
      tr:has(td:first-child:contains("PV")) {
        background: rgba(255,215,0,0.05) !important;
      }
      
      tr:has(td:first-child:contains("Grid")) {
        background: rgba(162,155,254,0.08) !important;
      }
      
      /* Actions column */
      td:last-child {
        text-align: center !important;
      }
      
      /* ESPHome controls */
      input[type="range"],
      button,
      select {
        background: rgba(255,255,255,0.15) !important;
        border: 1px solid rgba(255,255,255,0.3) !important;
        color: #fff !important;
        border-radius: 8px !important;
        padding: 6px 12px !important;
        cursor: pointer !important;
        transition: all 0.3s !important;
      }
      
      input[type="range"]:hover,
      button:hover,
      select:hover {
        background: rgba(255,215,0,0.25) !important;
        border-color: rgba(255,215,0,0.5) !important;
      }
      
      /* Footer */
      body::after {
        content: 'Aktualizováno: ' attr(data-time) ' | Sofar Solar Dashboard v4.0';
        display: block;
        text-align: center;
        padding: 25px;
        margin-top: 30px;
        color: rgba(255,255,255,0.4);
        font-size: 0.85rem;
      }
      
      /* Responzivita */
      @media (max-width: 768px) {
        body::before {
          font-size: 1.8rem;
          padding: 20px 10px;
        }
        
        table {
          font-size: 0.9rem !important;
        }
        
        th, td {
          padding: 12px 10px !important;
        }
      }
      
      /* Animace načtení */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      table {
        animation: fadeIn 0.6s ease-out !important;
      }
      
      /* Skryj ESPHome header pokud existuje */
      esphome-app > div:first-child,
      h1:contains("Sofar solar") {
        display: none !important;
      }
    `;
    
    document.head.appendChild(style);
    
    // Update time
    setInterval(() => {
      document.body.setAttribute('data-time', new Date().toLocaleTimeString('cs-CZ'));
    }, 1000);
    
    console.log('Sofar Dashboard v4.0 (Pure CSS) loaded');
  }
  
  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitAndApply);
  } else {
    waitAndApply();
  }
})();
