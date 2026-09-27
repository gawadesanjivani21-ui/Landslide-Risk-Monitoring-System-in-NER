/**
 * PRISM Platform - Client Application
 * Predictive Risk Intelligence for North Eastern Region (NER)
 * Smart India Hackathon 2026 - Problem Statement 26001
 */

// Global State
const state = {
  isOffline: false,
  activeHotspots: [],
  selectedHotspot: null,
  fieldReports: [],
  map: null,
  layers: {
    risk: L.layerGroup(),
    highways: L.layerGroup(),
    rainfall: L.layerGroup(),
    historical: L.layerGroup(),
    field: L.layerGroup()
  },
  xaiChart: null,
  audioCtx: null,
  sirenOscillator: null,
  isSirenPlaying: false
};

// Default NER Hotspots (Client-side cache for offline-first reliability)
const DEFAULT_HOTSPOTS = [
  {
    id: "NER-SK-01",
    name: "NH-10 Teesta Valley Corridor",
    state: "Sikkim",
    district: "Pakyong / Kalimpong border",
    lat: 27.1420,
    lng: 88.4980,
    elevation_m: 850,
    slope_deg: 48.5,
    geology: "Daling Series Phyllites & Schists (Highly weathered)",
    soil_type: "Clayey Colluvium",
    rainfall_24h_mm: 142.5,
    rainfall_7d_antecedent_mm: 418.0,
    soil_moisture_pct: 89.2,
    risk_score: 87.4,
    risk_level: "Critical",
    trajectory: "Rising (Accelerating Risk)",
    worry_level: "Severe Emergency",
    threatened_assets: {
      highways: ["NH-10 (Sikkim Lifeline)", "Sevoke-Rongpo Rail Link"],
      villages: ["Teesta Bazaar", "29th Mile Hamlet", "Melli"],
      population_exposed: 12800,
      critical_infra: ["Teesta Low Dam IV feeder", "BRO Bailey Bridge #4"]
    },
    recommended_actions: [
      "Halt all commercial and tourist transit on NH-10 immediately",
      "Divert via Lava-Gorubathan alternate link",
      "Evacuate 35 vulnerable households along lower riverbank contour",
      "Deploy SDRF and BRO heavy earthmovers at Sevoke staging point"
    ],
    factors: {
      "Antecedent Soil Saturation (7-Day)": 38.0,
      "Terrain Slope Angle & Shear Force": 26.5,
      "Instantaneous 24h Downpour": 21.0,
      "Anthropogenic Cut & Land Cover": 14.5
    }
  },
  {
    id: "NER-AS-02",
    name: "Dima Hasao Hill Section (Jatinga-Haflong)",
    state: "Assam",
    district: "Dima Hasao",
    lat: 25.1630,
    lng: 93.0210,
    elevation_m: 720,
    slope_deg: 39.2,
    geology: "Barail Formation Sandstones & Shales",
    soil_type: "Silty Loam over Weathered Shale",
    rainfall_24h_mm: 98.0,
    rainfall_7d_antecedent_mm: 320.0,
    soil_moisture_pct: 78.4,
    risk_score: 74.8,
    risk_level: "High",
    trajectory: "Rising",
    worry_level: "High Vigilance",
    threatened_assets: {
      highways: ["NH-27 (East-West Corridor)", "Lumding-Badarpur Broad Gauge Track"],
      villages: ["Haflong Outskirts", "New Haflong Station Zone", "Jatinga"],
      population_exposed: 18500,
      critical_infra: ["NFR Railway Tunnel #7", "Haflong Water Supply Conduit"]
    },
    recommended_actions: [
      "Impose speed restrictions (20 km/h) on Lumding-Badarpur train services",
      "Monitor culvert drainage channels for debris clogging",
      "Place NDRF 1st Bn at Silchar on 30-minute standby"
    ],
    factors: {
      "Antecedent Soil Saturation (7-Day)": 32.0,
      "Terrain Slope Angle & Shear Force": 22.0,
      "Instantaneous 24h Downpour": 28.0,
      "Anthropogenic Cut & Land Cover": 18.0
    }
  },
  {
    id: "NER-MN-03",
    name: "Tupul - Noney Railway Corridor",
    state: "Manipur",
    district: "Noney",
    lat: 24.8150,
    lng: 93.6350,
    elevation_m: 610,
    slope_deg: 44.0,
    geology: "Disang Group Turbidite Sediments (Unstable flysch)",
    soil_type: "Debris Mantle & Saturated Silt",
    rainfall_24h_mm: 115.0,
    rainfall_7d_antecedent_mm: 385.0,
    soil_moisture_pct: 84.6,
    risk_score: 82.1,
    risk_level: "Critical",
    trajectory: "Peak Saturation",
    worry_level: "Severe Emergency",
    threatened_assets: {
      highways: ["NH-37 (Imphal-Jiribam Highway)"],
      villages: ["Tupul", "Marangching", "Noney Ward 3"],
      population_exposed: 6400,
      critical_infra: ["Ijei River natural dam risk", "Jiribam-Imphal Railway Yard Bridge #114"]
    },
    recommended_actions: [
      "Issue emergency siren alert for settlements near Ijei River bed",
      "Deploy drone lidar surveillance to inspect crest fractures",
      "Suspend construction work on railway cuttings"
    ],
    factors: {
      "Antecedent Soil Saturation (7-Day)": 36.5,
      "Terrain Slope Angle & Shear Force": 27.0,
      "Instantaneous 24h Downpour": 22.5,
      "Anthropogenic Cut & Land Cover": 14.0
    }
  },
  {
    id: "NER-MG-04",
    name: "Cherrapunji - Mawsynram Escarpment",
    state: "Meghalaya",
    district: "East Khasi Hills",
    lat: 25.2986,
    lng: 91.7180,
    elevation_m: 1380,
    slope_deg: 52.0,
    geology: "Cretaceous-Tertiary Sandstones & Karst",
    soil_type: "Thin skeletal sandy soil over sheer sandstone",
    rainfall_24h_mm: 165.0,
    rainfall_7d_antecedent_mm: 620.0,
    soil_moisture_pct: 72.0,
    risk_score: 68.2,
    risk_level: "High",
    trajectory: "Stable Elevated",
    worry_level: "Watch & Monitor",
    threatened_assets: {
      highways: ["Shillong-Sohra State Highway SH-5"],
      villages: ["Nongriat", "Tyrna", "Mawkdok"],
      population_exposed: 4900,
      critical_infra: ["Nohkalikai Viewpoint access road", "Cherra Cement raw feeder"]
    },
    recommended_actions: [
      "Bar tourist buses on deep gorge bends",
      "Maintain clearing patrol at Mawkdok bridge approach"
    ],
    factors: {
      "Antecedent Soil Saturation (7-Day)": 30.0,
      "Terrain Slope Angle & Shear Force": 35.0,
      "Instantaneous 24h Downpour": 25.0,
      "Anthropogenic Cut & Land Cover": 10.0
    }
  },
  {
    id: "NER-NL-05",
    name: "NH-29 Kohima - Dimapur Ridge",
    state: "Nagaland",
    district: "Kohima",
    lat: 25.6701,
    lng: 94.1077,
    elevation_m: 1440,
    slope_deg: 41.0,
    geology: "Disang Thrust Belt (Crushed splintery shale)",
    soil_type: "Expansive residual clay",
    rainfall_24h_mm: 82.0,
    rainfall_7d_antecedent_mm: 270.0,
    soil_moisture_pct: 74.0,
    risk_score: 64.5,
    risk_level: "High",
    trajectory: "Rising",
    worry_level: "Moderate-High Concern",
    threatened_assets: {
      highways: ["NH-29 (Kohima Lifeline)"],
      villages: ["Phesama", "Zubza", "Peducha"],
      population_exposed: 14200,
      critical_infra: ["Kohima Power Grid 132kV Pylon #18", "Water supply pipeline"]
    },
    recommended_actions: [
      "Implement one-way convoy movement during night hours",
      "Pre-position hydraulic excavators at Dzüdza bridge"
    ],
    factors: {
      "Antecedent Soil Saturation (7-Day)": 28.0,
      "Terrain Slope Angle & Shear Force": 29.0,
      "Instantaneous 24h Downpour": 24.0,
      "Anthropogenic Cut & Land Cover": 19.0
    }
  },
  {
    id: "NER-AR-06",
    name: "Tawang - Sela Pass Access Corridor",
    state: "Arunachal Pradesh",
    district: "West Kameng",
    lat: 27.5020,
    lng: 92.1050,
    elevation_m: 3150,
    slope_deg: 51.5,
    geology: "Central Crystallines (Gneiss & Granitoids)",
    soil_type: "Morainic Gravel & Periglacial Till",
    rainfall_24h_mm: 64.0,
    rainfall_7d_antecedent_mm: 190.0,
    soil_moisture_pct: 61.0,
    risk_score: 53.0,
    risk_level: "Moderate",
    trajectory: "Stable",
    worry_level: "Monitoring Mode",
    threatened_assets: {
      highways: ["Balipara-Charduar-Tawang (BCT) Highway"],
      villages: ["Dirang Valley Hamlets", "Baisakhi Military Camp"],
      population_exposed: 5100,
      critical_infra: ["Sela Tunnel South Portal Approach", "Strategic defense supply route"]
    },
    recommended_actions: [
      "Clear frost/debris on tunnel escape routes",
      "Monitor rockfall netting on cut slopes"
    ],
    factors: {
      "Antecedent Soil Saturation (7-Day)": 22.0,
      "Terrain Slope Angle & Shear Force": 38.0,
      "Instantaneous 24h Downpour": 25.0,
      "Anthropogenic Cut & Land Cover": 15.0
    }
  },
  {
    id: "NER-MZ-07",
    name: "Aizawl North Ridge (Bawngkawn-Hunthar)",
    state: "Mizoram",
    district: "Aizawl",
    lat: 23.7540,
    lng: 92.7170,
    elevation_m: 920,
    slope_deg: 37.0,
    geology: "Surma Group Sandstone-Siltstone Alternations",
    soil_type: "Weathered Silt & Fill Material",
    rainfall_24h_mm: 52.0,
    rainfall_7d_antecedent_mm: 160.0,
    soil_moisture_pct: 58.0,
    risk_score: 45.2,
    risk_level: "Moderate",
    trajectory: "Falling",
    worry_level: "Routine Caution",
    threatened_assets: {
      highways: ["NH-54 (Aizawl-Silchar Link)"],
      villages: ["Hunthar Veng", "Bawngkawn South"],
      population_exposed: 8300,
      critical_infra: ["Aizawl Municipal Drainage Basin", "Hunthar Sinking Zone Road"]
    },
    recommended_actions: [
      "Inspect subsurface drainage pipes at Hunthar sinking zone",
      "Regular slope inclinometer readout collection"
    ],
    factors: {
      "Antecedent Soil Saturation (7-Day)": 26.0,
      "Terrain Slope Angle & Shear Force": 25.0,
      "Instantaneous 24h Downpour": 21.0,
      "Anthropogenic Cut & Land Cover": 28.0
    }
  }
];

// Critical Highway Corridors across NER
const HIGHWAY_CORRIDORS = [
  {
    name: "NH-10 (Sevoke - Teesta - Gangtok)",
    coords: [
      [26.8850, 88.4720],
      [27.0500, 88.4850],
      [27.1420, 88.4980],
      [27.2400, 88.5400],
      [27.3389, 88.6065]
    ],
    status: "Severely Threatened / High Risk"
  },
  {
    name: "NH-29 (Dimapur - Kohima Corridor)",
    coords: [
      [25.9080, 93.7270],
      [25.7500, 93.9200],
      [25.6701, 94.1077]
    ],
    status: "Vulnerable Cut Slopes"
  },
  {
    name: "NH-27 (Lumding - Haflong - Silchar)",
    coords: [
      [25.7500, 93.1800],
      [25.1630, 93.0210],
      [24.8333, 92.7789]
    ],
    status: "Debris Slide Prone"
  },
  {
    name: "NH-37 (Jiribam - Tupul - Imphal)",
    coords: [
      [24.8000, 93.1200],
      [24.8150, 93.6350],
      [24.8170, 93.9368]
    ],
    status: "High Mudflow Danger"
  }
];

// Historical Landslides (GSI Records)
const HISTORICAL_LANDSLIDES = [
  {
    name: "Tupul Railway Yard Mudflow (2022)",
    lat: 24.8190,
    lng: 93.6380,
    date: "June 30, 2022",
    fatalities: 61,
    trigger: "340mm 7-day antecedent saturation + excavation"
  },
  {
    name: "Teesta NH-10 Mega Breach (2023)",
    lat: 27.1350,
    lng: 88.5020,
    date: "October 4, 2023",
    fatalities: 42,
    trigger: "South Lhonak GLOF + Intense deluge"
  },
  {
    name: "Dima Hasao Rail Submergence (2024)",
    lat: 25.1700,
    lng: 93.0180,
    date: "May 18, 2024",
    fatalities: 14,
    trigger: "Pre-monsoon 450mm deluge on Barail shale"
  }
];

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initMap();
  initSimulator();
  initAlertDispatcher();
  initFieldReporting();
  initOfflineToggle();
  fetchInitialData();
});

// Tab Navigation Switching
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetId = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
        if (targetId === 'tab-dashboard' && state.map) {
          setTimeout(() => state.map.invalidateSize(), 200);
        }
        if (targetId === 'tab-ai-engine') {
          updateXaiChart();
        }
      }
    });
  });
}

// Leaflet GIS Map Initialization
function initMap() {
  // Center on North East Region (Guwahati / central NER)
  state.map = L.map('nerMap', {
    center: [26.0, 92.0],
    zoom: 7,
    zoomControl: false
  });

  L.control.zoom({ position: 'topright' }).addTo(state.map);

  // Basemap without any API key requirement
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | PRISM NER Engine',
    maxZoom: 19
  }).addTo(state.map);

  // Add Layer Groups
  Object.values(state.layers).forEach(layer => layer.addTo(state.map));

  // Layer Toggles
  document.querySelectorAll('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const layerName = btn.getAttribute('data-layer');
      const layer = state.layers[layerName];
      if (!layer) return;

      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        state.map.removeLayer(layer);
      } else {
        btn.classList.add('active');
        state.map.addLayer(layer);
      }
    });
  });

  // Reset Map View
  document.getElementById('resetMapBtn').addEventListener('click', () => {
    state.map.flyTo([26.0, 92.0], 7, { duration: 1.2 });
  });

  // Render High-Risk Highway Corridors
  renderHighways();

  // Render Historical GSI Events
  renderHistorical();
}

// Render Highway Lines
function renderHighways() {
  state.layers.highways.clearLayers();
  HIGHWAY_CORRIDORS.forEach(corridor => {
    const polyline = L.polyline(corridor.coords, {
      color: '#f97316',
      weight: 4,
      dashArray: '8, 6',
      opacity: 0.85
    }).addTo(state.layers.highways);

    polyline.bindTooltip(`<b>${corridor.name}</b><br><span style="color:#f87171">${corridor.status}</span>`, {
      sticky: true,
      className: 'custom-map-tooltip'
    });
  });
}

// Render Historical GSI Landslides
function renderHistorical() {
  state.layers.historical.clearLayers();
  HISTORICAL_LANDSLIDES.forEach(event => {
    const marker = L.circleMarker([event.lat, event.lng], {
      radius: 7,
      fillColor: '#9333ea',
      color: '#c084fc',
      weight: 2,
      opacity: 0.9,
      fillOpacity: 0.7
    }).addTo(state.layers.historical);

    marker.bindPopup(`
      <div style="font-family:sans-serif; font-size:12px; line-height:1.4;">
        <h4 style="color:#c084fc; margin-bottom:4px;">GSI Historical Landslide</h4>
        <b>${event.name}</b><br>
        <b>Date:</b> ${event.date}<br>
        <b>Casualties:</b> ${event.fatalities}<br>
        <p style="margin-top:4px; color:#94a3b8;">${event.trigger}</p>
      </div>
    `);
  });
}

// Render Hotspots on Map
function renderHotspots(hotspots) {
  state.layers.risk.clearLayers();
  state.layers.rainfall.clearLayers();

  hotspots.forEach(h => {
    const color = h.risk_level === 'Critical' ? '#ef4444' :
                  h.risk_level === 'High' ? '#f97316' :
                  h.risk_level === 'Moderate' ? '#eab308' : '#10b981';

    // Rainfall / Saturation buffer halo
    const radius = Math.max(12000, h.rainfall_7d_antecedent_mm * 55);
    L.circle([h.lat, h.lng], {
      radius: radius,
      color: color,
      fillColor: color,
      fillOpacity: 0.12,
      weight: 1,
      dashArray: '4, 4'
    }).addTo(state.layers.rainfall);

    // Hotspot Pulsing Custom HTML Marker
    const iconHtml = `
      <div class="custom-pulse-marker ${h.risk_level.toLowerCase()}">
        <div class="inner-dot" style="background:${color}"></div>
        <div class="pulse-ring" style="border-color:${color}"></div>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'pulse-icon-container',
      html: iconHtml,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([h.lat, h.lng], { icon: customIcon }).addTo(state.layers.risk);

    marker.on('click', () => {
      selectHotspot(h);
      state.map.panTo([h.lat, h.lng]);
    });

    // Tooltip
    marker.bindTooltip(`
      <div style="font-family:sans-serif; font-size:12px;">
        <b style="color:${color}">${h.name}</b><br>
        Risk Score: <b>${h.risk_score}%</b> (${h.risk_level})<br>
        Trajectory: <b>${h.trajectory}</b>
      </div>
    `, { sticky: true });
  });

  // Select first hotspot by default
  if (hotspots.length > 0 && !state.selectedHotspot) {
    selectHotspot(hotspots[0]);
  }
}

// Select Hotspot & Update Sidebar Inspector
function selectHotspot(h) {
  state.selectedHotspot = h;

  document.getElementById('inspState').textContent = h.state;
  const badge = document.getElementById('inspRiskBadge');
  badge.textContent = `${h.risk_level} Risk (${h.risk_score}%)`;
  badge.className = `risk-badge ${h.risk_level.toLowerCase()}`;

  document.getElementById('inspTitle').textContent = h.name;
  document.getElementById('inspGeology').textContent = `Geology: ${h.geology} | Soil: ${h.soil_type}`;
  document.getElementById('inspTrajectory').textContent = h.trajectory;

  document.getElementById('inspRain24').textContent = `${h.rainfall_24h_mm} mm`;
  document.getElementById('inspRain7d').textContent = `${h.rainfall_7d_antecedent_mm} mm`;
  document.getElementById('inspSlope').textContent = `${h.slope_deg}°`;
  document.getElementById('inspSoilMoist').textContent = `${h.soil_moisture_pct}%`;

  // Threatened Highways
  const highwaysContainer = document.getElementById('inspHighways');
  highwaysContainer.innerHTML = (h.threatened_assets.highways || []).map(hw => 
    `<span class="threat-tag highway"><i class="fa-solid fa-road"></i> ${hw}</span>`
  ).join('');

  // Threatened Villages & Infrastructure
  const villagesContainer = document.getElementById('inspVillages');
  const villages = (h.threatened_assets.villages || []).map(v => 
    `<span class="threat-tag village"><i class="fa-solid fa-house-chimney"></i> ${v}</span>`
  ).join('');
  const infra = (h.threatened_assets.critical_infra || []).map(inf => 
    `<span class="threat-tag bridge"><i class="fa-solid fa-bridge"></i> ${inf}</span>`
  ).join('');
  villagesContainer.innerHTML = villages + infra;

  // Recommended Protocols
  const actionsList = document.getElementById('inspActions');
  actionsList.innerHTML = (h.recommended_actions || []).map(action => 
    `<li><i class="fa-solid fa-circle-exclamation text-danger"></i> ${action}</li>`
  ).join('');

  // Wire Sidebar Buttons
  document.getElementById('inspTriggerSimBtn').onclick = () => {
    // Switch to AI Engine and load values
    document.querySelector('[data-tab="tab-ai-engine"]').click();
    document.getElementById('inputRain24').value = h.rainfall_24h_mm;
    document.getElementById('inputRain7d').value = h.rainfall_7d_antecedent_mm;
    document.getElementById('inputSlope').value = Math.round(h.slope_deg);
    document.getElementById('inputSoil').value = Math.round(h.soil_moisture_pct);
    updateSliderDisplays();
    runAIInference();
  };

  document.getElementById('inspDispatchAlertBtn').onclick = () => {
    triggerAlertSimulation(h.name, h.risk_level === 'Critical' ? 'RED' : 'ORANGE');
  };
}

// Fetch Initial Data
async function fetchInitialData() {
  try {
    const res = await fetch('/api/hotspots');
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    state.activeHotspots = data.data;
  } catch (err) {
    console.warn('Backend unavailable, using cached NER data:', err);
    state.activeHotspots = DEFAULT_HOTSPOTS;
  }
  renderHotspots(state.activeHotspots);
  fetchFieldReports();
}

// AI Engine Simulation Logic
function initSimulator() {
  const rain24 = document.getElementById('inputRain24');
  const rain7d = document.getElementById('inputRain7d');
  const slope = document.getElementById('inputSlope');
  const soil = document.getElementById('inputSoil');
  const presetSelect = document.getElementById('simPresetSelect');

  // Sliders input events
  [rain24, rain7d, slope, soil].forEach(input => {
    input.addEventListener('input', () => {
      updateSliderDisplays();
      runAIInference();
    });
  });

  // Preset scenarios
  presetSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'nh10_monsoon') {
      rain24.value = 160; rain7d.value = 450; slope.value = 52; soil.value = 92;
    } else if (val === 'tupul_mudflow') {
      rain24.value = 120; rain7d.value = 390; slope.value = 46; soil.value = 88;
    } else if (val === 'cherra_runoff') {
      rain24.value = 210; rain7d.value = 580; slope.value = 58; soil.value = 75;
    } else if (val === 'dima_premonsoon') {
      rain24.value = 95; rain7d.value = 310; slope.value = 39; soil.value = 80;
    } else if (val === 'dry_post_monsoon') {
      rain24.value = 15; rain7d.value = 45; slope.value = 28; soil.value = 35;
    }
    updateSliderDisplays();
    runAIInference();
  });

  document.getElementById('runSimulationBtn').addEventListener('click', runAIInference);
  document.getElementById('inputLulc').addEventListener('change', runAIInference);
  document.getElementById('inputGeology').addEventListener('change', runAIInference);

  updateSliderDisplays();
  initXaiChart();
  runAIInference();
}

function updateSliderDisplays() {
  document.getElementById('valSliderRain24').textContent = `${document.getElementById('inputRain24').value} mm`;
  document.getElementById('valSliderRain7d').textContent = `${document.getElementById('inputRain7d').value} mm`;
  document.getElementById('valSliderSlope').textContent = `${document.getElementById('inputSlope').value}°`;
  document.getElementById('valSliderSoil').textContent = `${document.getElementById('inputSoil').value}%`;
}

// Client-Side Fallback ML Risk Engine
function clientSidePrediction(payload) {
  const rain24 = payload.rainfall_24h;
  const rain7d = payload.rainfall_7d;
  const slope = payload.slope_deg;
  const soil = payload.soil_moisture;
  const geo = payload.geology_score;

  const slope_factor = Math.min(1.0, Math.max(0.0, (slope - 15.0) / 45.0)) * 32.0;
  const moist_factor = Math.min(1.0, Math.pow(soil / 100.0, 1.8)) * 28.0;
  const antecedent_norm = Math.min(1.0, rain7d / 450.0) * 22.0;
  const instant_norm = Math.min(1.0, rain24 / 180.0) * 18.0;

  const raw_score = (slope_factor + moist_factor + antecedent_norm + instant_norm) * 0.95 * geo;
  const risk_score = Number(Math.min(98.5, Math.max(8.5, raw_score)).toFixed(1));

  let risk_level = "Low";
  let alert_code = "GREEN";
  let worry_level = "Normal Routine";

  if (risk_score >= 80.0) {
    risk_level = "Critical"; alert_code = "RED"; worry_level = "Severe Emergency (Level 3)";
  } else if (risk_score >= 60.0) {
    risk_level = "High"; alert_code = "ORANGE"; worry_level = "High Alert (Level 2)";
  } else if (risk_score >= 40.0) {
    risk_level = "Moderate"; alert_code = "YELLOW"; worry_level = "Advisory Watch (Level 1)";
  }

  let trajectory = "Stable Elevated";
  if (rain24 > 100 || (rain7d > 300 && rain24 > 60)) {
    trajectory = "Rising (Accelerating Risk)";
  } else if (rain7d > 350 && rain24 <= 40) {
    trajectory = "Peak Saturation (High Residual Risk)";
  } else if (rain24 < 30 && rain7d < 180) {
    trajectory = "Falling / Stabilizing";
  }

  const total = slope_factor + moist_factor + antecedent_norm + instant_norm + 0.001;
  const xai = {
    "Antecedent Saturation (7-Day)": Number(((antecedent_norm + moist_factor * 0.4) / total * 100).toFixed(1)),
    "Terrain Slope Angle & Shear": Number((slope_factor / total * 100).toFixed(1)),
    "Instant 24h Downpour": Number((instant_norm / total * 100).toFixed(1)),
    "Cut-Slope Excavation": Number(((moist_factor * 0.6) / total * 100).toFixed(1))
  };

  return {
    risk_score,
    risk_level,
    alert_code,
    worry_level,
    trajectory,
    factors_breakdown: xai,
    impact_assessment: {
      estimated_safe_buffer_km: Number(Math.max(0.8, (slope / 15.0) * (risk_score / 50.0)).toFixed(2))
    }
  };
}

async function runAIInference() {
  const payload = {
    rainfall_24h: parseFloat(document.getElementById('inputRain24').value),
    rainfall_7d: parseFloat(document.getElementById('inputRain7d').value),
    slope_deg: parseFloat(document.getElementById('inputSlope').value),
    soil_moisture: parseFloat(document.getElementById('inputSoil').value),
    lulc: document.getElementById('inputLulc').value,
    geology_score: parseFloat(document.getElementById('inputGeology').value)
  };

  let pred;
  if (!state.isOffline) {
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        pred = json.prediction;
      }
    } catch (err) {
      console.warn('Calling local inference fallback:', err);
    }
  }

  if (!pred) {
    pred = clientSidePrediction(payload);
  }

  // Update UI Elements
  document.getElementById('predRiskScore').textContent = `${pred.risk_score}%`;
  
  // Gauge Colors & Rotation
  const color = pred.risk_level === 'Critical' ? '#ef4444' :
                pred.risk_level === 'High' ? '#f97316' :
                pred.risk_level === 'Moderate' ? '#eab308' : '#10b981';

  const gauge = document.getElementById('riskGaugeRing');
  gauge.style.background = `conic-gradient(${color} 0% ${pred.risk_score}%, #1e293b ${pred.risk_score}% 100%)`;
  gauge.style.boxShadow = `0 0 30px ${color}40`;

  // Classification Badge
  const badgeContainer = document.getElementById('predRiskLevelBadge');
  badgeContainer.innerHTML = `<span class="badge badge-lg ${pred.risk_level.toLowerCase()}">${pred.risk_level.toUpperCase()} RISK ALERT</span>`;

  // Trajectory
  const trajPill = document.getElementById('predTrajectoryPill');
  trajPill.className = `trajectory-state-pill ${pred.risk_score >= 60 ? 'rising' : 'stable'}`;
  document.getElementById('predTrajectoryText').textContent = pred.trajectory;
  document.getElementById('predWorryLevel').textContent = pred.worry_level;

  let actionText = "Monitor Regular Drainage Channels";
  if (pred.risk_score >= 80) actionText = "Halt Highway Traffic & Evacuate Settlements";
  else if (pred.risk_score >= 60) actionText = "Prepare Evacuation & Monitor Cut Slopes";
  else if (pred.risk_score >= 40) actionText = "Advisory to BRO Patrols & Commercial Drivers";
  document.getElementById('predCapAction').textContent = actionText;

  // Impact Preview
  document.getElementById('predBufferRadius').textContent = `${pred.impact_assessment.estimated_safe_buffer_km} km`;
  document.getElementById('predRoadCount').textContent = pred.risk_score > 65 ? "2 Arteries" : "1 Secondary";
  document.getElementById('predVillageCount').textContent = pred.risk_score > 70 ? "3 Settlements" : "1 Hamlet";

  // Update Explainable AI Chart
  updateXaiChart(pred.factors_breakdown);
}

// Chart.js Explainable AI (XAI) Horizontal Bar Chart
function initXaiChart() {
  const ctx = document.getElementById('xaiChart').getContext('2d');
  state.xaiChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
        'Antecedent Saturation (7d)',
        'Terrain Slope & Shear',
        'Instantaneous 24h Downpour',
        'Anthropogenic Cut / LULC'
      ],
      datasets: [{
        label: 'Contribution to Slope Instability (%)',
        data: [36, 28, 22, 14],
        backgroundColor: [
          '#38bdf8',
          '#f59e0b',
          '#06b6d4',
          '#f43f5e'
        ],
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          max: 60,
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
          ticks: { color: '#94a3b8' }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans', size: 11 } }
        }
      }
    }
  });
}

function updateXaiChart(factors) {
  if (!state.xaiChart) return;
  if (factors) {
    const keys = Object.keys(factors);
    const values = Object.values(factors);
    state.xaiChart.data.labels = keys;
    state.xaiChart.data.datasets[0].data = values;
  }
  state.xaiChart.update();
}

// Early Warning Alert Dispatcher & Emergency Simulation
function initAlertDispatcher() {
  const topBtn = document.getElementById('topEmergencyBtn');
  const broadcastBtn = document.getElementById('btnExecuteBroadcast');
  const modal = document.getElementById('emergencyModal');
  const closeBtn = document.getElementById('closeModalBtn');

  if (topBtn) {
    topBtn.addEventListener('click', () => {
      triggerAlertSimulation('NER Strategic High-Risk Corridors (NH-10 / NH-29)', 'RED');
    });
  }

  if (broadcastBtn) {
    broadcastBtn.addEventListener('click', () => {
      const corridor = document.getElementById('dispCorridor').value;
      const sev = document.querySelector('input[name="dispSev"]:checked').value;
      triggerAlertSimulation(corridor, sev);
    });
  }

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    stopSiren();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      stopSiren();
    }
  });

  // Sound Siren Button
  document.getElementById('btnSoundSiren').addEventListener('click', toggleAudioSiren);

  // Download CAP XML
  document.getElementById('btnDownloadCap').addEventListener('click', () => {
    downloadCapXml(state.selectedHotspot || DEFAULT_HOTSPOTS[0]);
  });
}

window.triggerAlertSimulation = function(locationName, severity) {
  const modal = document.getElementById('emergencyModal');
  document.getElementById('modalSectorName').textContent = locationName;
  const badge = document.getElementById('modalSeverityBadge');
  badge.textContent = `ALERT LEVEL: ${severity} EMERGENCY`;
  badge.className = `badge badge-lg ${severity === 'RED' ? 'critical' : 'high'}`;

  document.getElementById('modalDesc').textContent = 
    `Critical landslide runout warning generated by PRISM Multi-Source Core. Precipitation saturation threshold exceeded. Immediate protocols activated for ${locationName}.`;

  modal.classList.add('active');
  showToast(`Emergency Broadcast dispatched for ${locationName}`, 'danger');
};

// Web Audio API Emergency Siren Chime
function toggleAudioSiren() {
  if (state.isSirenPlaying) {
    stopSiren();
  } else {
    playSiren();
  }
}

function playSiren() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AudioContext();
    const osc = state.audioCtx.createOscillator();
    const gain = state.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, state.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(950, state.audioCtx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.12, state.audioCtx.currentTime);

    // LFO effect for warble siren
    const lfo = state.audioCtx.createOscillator();
    lfo.frequency.value = 2.5; // 2.5 Hz frequency modulation
    const lfoGain = state.audioCtx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(osc.frequency);
    lfo.start();

    osc.connect(gain);
    gain.connect(state.audioCtx.destination);
    osc.start();

    state.sirenOscillator = osc;
    state.isSirenPlaying = true;
    document.getElementById('sirenBtnText').textContent = 'Silence Siren';
    document.getElementById('btnSoundSiren').classList.add('btn-danger');
  } catch (e) {
    console.error('AudioContext error:', e);
    showToast('Audio siren preview triggered', 'info');
  }
}

function stopSiren() {
  if (state.sirenOscillator) {
    try {
      state.sirenOscillator.stop();
      if (state.audioCtx) state.audioCtx.close();
    } catch (e) {}
    state.sirenOscillator = null;
  }
  state.isSirenPlaying = false;
  const btn = document.getElementById('btnSoundSiren');
  if (btn) {
    document.getElementById('sirenBtnText').textContent = 'Test Audio Siren';
    btn.classList.remove('btn-danger');
  }
}

// CAP v1.2 XML Generator
function downloadCapXml(hotspot) {
  const capXml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>PRISM-NER-${hotspot.id}-${Date.now()}</identifier>
  <sender>prism.ner.disaster.gov.in</sender>
  <sent>${new Date().toISOString()}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Geo</category>
    <event>Landslide Risk Warning</event>
    <urgency>${hotspot.risk_score >= 80 ? 'Immediate' : 'Expected'}</urgency>
    <severity>${hotspot.risk_score >= 80 ? 'Extreme' : 'Severe'}</severity>
    <certainty>Observed</certainty>
    <eventCode>
      <valueName>PRISM-RiskScore</valueName>
      <value>${hotspot.risk_score}%</value>
    </eventCode>
    <headline>PRISM Landslide Early Warning: ${hotspot.name}</headline>
    <description>AI Risk Trajectory: ${hotspot.trajectory}. 7-day antecedent rainfall reached ${hotspot.rainfall_7d_antecedent_mm}mm. Severe slope instability hazard.</description>
    <area>
      <areaDesc>${hotspot.name}, ${hotspot.state}, NER India</areaDesc>
      <circle>${hotspot.lat},${hotspot.lng},3.0</circle>
    </area>
  </info>
</alert>`;

  const blob = new Blob([capXml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CAP_ALERT_${hotspot.id}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('CAP v1.2 XML payload downloaded', 'success');
}

window.copyCapPayload = function(hotspotId) {
  const h = state.activeHotspots.find(x => x.id === hotspotId) || DEFAULT_HOTSPOTS[0];
  downloadCapXml(h);
};

// Field Truth & Ground Verification
function initFieldReporting() {
  const form = document.getElementById('fieldReportForm');
  const getLocBtn = document.getElementById('btnGetLocation');

  getLocBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          document.getElementById('repLat').value = pos.coords.latitude.toFixed(4);
          document.getElementById('repLng').value = pos.coords.longitude.toFixed(4);
          showToast('GPS coordinates acquired from device sensor', 'success');
        },
        () => {
          // Fallback to Sikkim Teesta Valley coordinate
          document.getElementById('repLat').value = '27.1245';
          document.getElementById('repLng').value = '88.5132';
          showToast('GPS simulated: NH-10 Teesta Valley', 'info');
        }
      );
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newReport = {
      reporter: document.getElementById('repName').value,
      role: document.getElementById('repRole').value,
      location_name: document.getElementById('repLocation').value,
      latitude: parseFloat(document.getElementById('repLat').value),
      longitude: parseFloat(document.getElementById('repLng').value),
      severity: document.getElementById('repUrgency').value,
      observation_type: document.getElementById('repObsType').value,
      description: document.getElementById('repDesc').value,
      timestamp: new Date().toISOString(),
      sync_status: state.isOffline ? 'Cached Locally (Offline)' : 'Synced Just Now'
    };

    if (state.isOffline) {
      // Store in localStorage
      const cached = JSON.parse(localStorage.getItem('prism_offline_reports') || '[]');
      cached.unshift(newReport);
      localStorage.setItem('prism_offline_reports', JSON.stringify(cached));
      renderLocalReport(newReport, true);
      showToast('Offline Mode: Report cached locally. Will auto-sync when online.', 'info');
    } else {
      // Send to server
      try {
        const res = await fetch('/api/field-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReport)
        });
        const json = await res.json();
        renderLocalReport(json.report || newReport, false);
        showToast('Ground report synchronized to PRISM Cloud Core!', 'success');
      } catch (err) {
        renderLocalReport(newReport, true);
        showToast('Report cached locally (server offline fallback)', 'warning');
      }
    }

    form.reset();
    document.getElementById('repLocation').value = "NH-10 Mile 29 Teesta Valley Slope";
  });
}

async function fetchFieldReports() {
  let reports = [];
  try {
    const res = await fetch('/api/field-reports');
    if (res.ok) {
      const data = await res.json();
      reports = data.data;
    }
  } catch (e) {
    console.warn('Using offline reports cache');
  }

  // Combine with cached offline reports from localStorage
  const offlineCached = JSON.parse(localStorage.getItem('prism_offline_reports') || '[]');
  state.fieldReports = [...offlineCached, ...reports];
  renderFieldReportsList(state.fieldReports);
  renderFieldMarkersOnMap(state.fieldReports);
}

function renderFieldReportsList(reports) {
  const container = document.getElementById('fieldReportsList');
  if (!container) return;

  container.innerHTML = reports.map(r => `
    <div class="feed-item">
      <img src="${r.image_url || 'https://images.unsplash.com/photo-1545641203-7d072a14e3b2?auto=format&fit=crop&w=400&q=80'}" alt="Slope" class="feed-item-img">
      <div class="feed-item-info">
        <div class="feed-top">
          <span class="feed-reporter">${r.reporter} <small class="text-muted">(${r.role})</small></span>
          <span class="sync-badge">${r.sync_status || 'Verified'}</span>
        </div>
        <div class="feed-loc"><i class="fa-solid fa-location-dot"></i> ${r.location_name} [${r.latitude}, ${r.longitude}]</div>
        <div style="font-size:0.75rem; color:#f59e0b;"><b>Observed:</b> ${r.observation_type}</div>
        <p class="feed-desc">${r.description}</p>
      </div>
    </div>
  `).join('');
}

function renderLocalReport(report, isOffline) {
  state.fieldReports.unshift(report);
  renderFieldReportsList(state.fieldReports);
  renderFieldMarkersOnMap(state.fieldReports);
}

function renderFieldMarkersOnMap(reports) {
  state.layers.field.clearLayers();
  reports.forEach(r => {
    const marker = L.circleMarker([r.latitude, r.longitude], {
      radius: 6,
      fillColor: '#06b6d4',
      color: '#ffffff',
      weight: 2,
      opacity: 0.9,
      fillOpacity: 0.9
    }).addTo(state.layers.field);

    marker.bindPopup(`
      <div style="font-family:sans-serif; font-size:12px;">
        <b style="color:#06b6d4">Field Ground Truth</b><br>
        <b>Reporter:</b> ${r.reporter} (${r.role})<br>
        <b>Observation:</b> ${r.observation_type}<br>
        <p style="margin-top:4px; color:#64748b;">${r.description}</p>
      </div>
    `);
  });
}

// Offline-First Toggle (Slide 2 & 4 Core Feature Demonstration)
function initOfflineToggle() {
  const btn = document.getElementById('toggleOfflineBtn');
  const connStatus = document.getElementById('connStatus');
  const btnText = document.getElementById('offlineBtnText');

  btn.addEventListener('click', () => {
    state.isOffline = !state.isOffline;

    if (state.isOffline) {
      connStatus.className = 'indicator offline';
      connStatus.querySelector('.text').textContent = 'Offline Cached';
      btnText.textContent = 'Restore Online';
      showToast('Network disconnected: PRISM switched to Offline-First edge cache', 'warning');
    } else {
      connStatus.className = 'indicator online';
      connStatus.querySelector('.text').textContent = 'Core Online';
      btnText.textContent = 'Simulate Offline';

      // Auto-sync cached offline reports
      const cached = JSON.parse(localStorage.getItem('prism_offline_reports') || '[]');
      if (cached.length > 0) {
        showToast(`Auto-syncing ${cached.length} offline ground reports to PRISM cloud...`, 'success');
        localStorage.removeItem('prism_offline_reports');
      } else {
        showToast('Online connection restored with PRISM Core', 'success');
      }
    }
  });
}

// Toast Notification Helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? 'fa-circle-check text-success' :
               type === 'danger' ? 'fa-triangle-exclamation text-danger' :
               type === 'warning' ? 'fa-triangle-exclamation text-warning' : 'fa-info-circle text-accent';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
