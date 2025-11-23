<!DOCTYPE html>
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sofar Solar Dashboard</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #f2f2f2;
    }
    header {
      background: #1e73be;
      color: white;
      padding: 10px 20px;
      font-size: 22px;
      font-weight: bold;
    }
    .container {
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      grid-gap: 20px;
    }
    .card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.15);
    }
    .title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .value {
      font-size: 28px;
      font-weight: bold;
      margin-top: 10px;
    }
    .unit {
      opacity: 0.6;
      font-size: 14px;
    }

    /* POWER FLOW */
    .flow-container {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 10px 0;
    }
    .flow-box {
      text-align: center;
      width: 140px;
    }
    .arrow {
      font-size: 32px;
      transition: 0.3s;
      opacity: 0.4;
    }
    .arrow.active {
      opacity: 1;
      color: #1e73be;
    }
  </style>
</head>
<body>
  <header>Sofar Solar Dashboard</header>

  <div class="container">

    <div class="card">
      <div class="title">Výkon FV</div>
      <div class="value" id="pv_power">0 <span class="unit">W</span></div>
    </div>

    <div class="card">
      <div class="title">Spotřeba domu</div>
      <div class="value" id="load_power">0 <span class="unit">W</span></div>
    </div>

    <div class="card">
      <div class="title">Baterie – SOC</div>
      <div class="value" id="soc">0 <span class="unit">%</span></div>
    </div>

    <div class="card">
      <div class="title">Stav měniče</div>
      <div class="value" id="inverter_status">—</div>
    </div>

  </div>

  <!-- POWER FLOW -->
  <div class="card" style="margin: 20px;">
    <div class="title">Tok energie</div>

    <div class="flow-container">
      <div class="flow-box">PV</div>
      <div id="arrow_pv_load" class="arrow">➡️</div>
      <div class="flow-box">Dům</div>
    </div>

    <div class="flow-container">
      <div class="flow-box">Baterie</div>
      <div id="arrow_batt_load" class="arrow">⬅️➡️</div>
      <div class="flow-box">Dům</div>
    </div>

  </div>

<script>
// ============================
// LIVE DATA STREAM (EventSource)
// ============================

const es = new EventSource('/events');

es.onmessage = function (event) {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch (e) {
    return;
  }

  if (data.id && data.value !== undefined) updateValue(data.id, data.value);
};

function updateValue(id, val) {
  if (id === "sensor.pv_power") {
    pv_power.textContent = val + " W";
    arrow_pv_load.classList.toggle("active", val > 50);
  }

  if (id === "sensor.load_power") {
    load_power.textContent = val + " W";
  }

  if (id === "sensor.soc") {
    soc.textContent = val + " %";
  }

  if (id === "sensor.inverter_status") {
    inverter_status.textContent = val;
  }

  // Baterie → Dům šipka
  if (id === "sensor.battery_power") {
    arrow_batt_load.classList.toggle("active", Math.abs(val) > 50);
  }
}
</script>
</body>
</html>

});
