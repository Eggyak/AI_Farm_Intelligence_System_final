# 🌾 Agritech Farm — Complete Feature & Technical Specification Document

This document provides a comprehensive breakdown of all features included in the **Agritech Farm Intelligence System**, detailing:
1. **Inputs Required**: What parameters, data, uploads, or selections each feature takes.
2. **Outputs & Results Produced**: What metrics, visual cards, charts, diagnostics, and AI advice each feature yields.
3. **Underlying Architecture & Endpoints**: How backend APIs, local engines, and external integrations operate.

---

## 📋 Summary Table of Application Features (Standalone Tabs & Pages)

| Feature Name | Primary Dedicated Page | Inputs Required | Outputs / Results Produced |
| :--- | :--- | :--- | :--- |
| **1. Autonomous Agent Fleet Orchestration** | [`index.html`](file:///d:/Agritech_Farm-main/Agritech_Farm-main/frontend/index.html) | Soil moisture, temperature, humidity sliders, crop type, region, sensitivity, strategy selector, budget & water limit sliders | Real-time risk score, 5-agent execution pipeline output, historical risk chart, unified field recommendation, DOC/JSON export |
| **2. Mandi Market Details & Price Analytics** | [`market.html`](file:///d:/Agritech_Farm-main/Agritech_Farm-main/frontend/market.html) | GPS location (lat/lon), search query, crop category filter, state filter, sorting order, Data.gov.in API Key (`api_keys.txt`) | Min price, Max price, Expected (Modal) price per kg & quintal, price trends (+/-%), GPS distance to Mandi, crop photos, market KPIs |
| **3. Farm Support & Machinery Locator** | [`farm_support.html`](file:///d:/Agritech_Farm-main/Agritech_Farm-main/frontend/farm_support.html) | User GPS coordinates, Category trigger buttons (*Fertilizer Shops*, *Machinery Rentals*, *Mandi Markets*) | Proximity-sorted provider cards, category badges, full street address, contact phone, operating hours, ratings, **Direct Google Maps Redirection** link |
| **4. Harvest Yield Calculator & Analytics** | [`yield_calculator.html`](file:///d:/Agritech_Farm-main/Agritech_Farm-main/frontend/yield_calculator.html) | Previous harvest yield (kg), Latest harvest yield (kg), Crop selection, Land area (acres), Market price (₹/kg) | Net yield gain/loss (kg), percentage variance (%), yield rate per acre (kg/acre), projected financial revenue delta (₹), AI agronomy advice, saved history log |
| **5. Plant Growth Tracker & Visual Analysis** | [`plant_growth.html`](file:///d:/Agritech_Farm-main/Agritech_Farm-main/frontend/plant_growth.html) | Crop name, days elapsed, previous height (cm), latest height (cm), growth stage, leaf condition notes, previous & latest plant photo upload | Side-by-side photo comparison cards with floating height tags, height gain (cm), growth velocity (cm/day), speed rating, AI care guide (watering, NPK fertilizer, staking, pest control), saved history log |
| **6. Government Subsidies & Schemes Portal** | [`subsidies.html`](file:///d:/Agritech_Farm-main/Agritech_Farm-main/frontend/subsidies.html) | Search query, Category pills (*Irrigation*, *Solar*, *Machinery*, *Income*, *Loan*, *Insurance*, *Fertilizer*) | Verification cards for PMKSY, PM-KUSUM, SMAM, PM-KISAN, KCC, PMFBY, Soil Health Card; subsidy % (up to 80%), financial benefit, eligibility, documents, **Direct Official Portal Link** |
| **7. Water Stress AI & Cost Optimizer** | [`water_stress.html`](file:///d:/Agritech_Farm-main/Agritech_Farm-main/frontend/water_stress.html) | Soil moisture %, temperature °C, humidity %, days since last watering, soil type, acreage | Crop Water Stress Index (CWSI 0.0-1.0), stress category gauge, water wastage prevented (Liters), input pumping cost saved (₹), precision irrigation advice |
| **8. Farm Photo Upload & Aerial Inspector** | [`farm_inspector.html`](file:///d:/Agritech_Farm-main/Agritech_Farm-main/frontend/farm_inspector.html) | Farm field photo / drone / satellite upload, crop type selection | Canopy coverage %, Field Health Score (0-100), weed density %, moisture deficit zone alerts, bulleted AI diagnostic notes |
| **9. Landscape Orchestration Report** | [`dashboard2.html`](file:///d:/Agritech_Farm-main/Agritech_Farm-main/frontend/dashboard2.html) | Saved pipeline results from Agent 3 / Memory | Overall success %, plan risk reduction %, risk level indicator, immediate action plan queue, budget & strategy meta |
| **10. Neural Assistant Chatbot** | Floating across all pages | Natural language questions / prompts or quick action clicks | Smart intent responses with direct navigation buttons (*Locate Fertilizer Shops*, *Open Market Prices*, *Open Yield Calculator*, *Open Plant Growth*, *Open Subsidies*), Mistral LLM advice |
| **11. One-Click Local Launcher** | [`run_app.bat`](file:///d:/Agritech_Farm-main/Agritech_Farm-main/run_app.bat) | Windows execution | Launches FastAPI backend (port 8001) & HTTP web server (port 8000), opens browser automatically |

---

## 📡 Backend API Endpoints Reference

| Endpoint | Method | Input Payload | Output JSON Data |
| :--- | :--- | :--- | :--- |
| `/run-agent` | `POST` | `{ query, agent1, agent2, agent3, agent4 }` | `{ status, pipeline_output: { agent_outputs, final_output } }` |
| `/progress` | `GET` | None | `{ step, status, log }` |
| `/api/market-prices` | `GET` | `lat, lon, commodity, state, category` | `{ status, source, api_key_configured, total_items, data: [...] }` |
| `/api/farm-support` | `GET` | `type, lat, lon` | `{ status, user_gps, results: [ { name, distance_km, gmaps_url, ... } ] }` |
| `/api/yield-analysis`| `POST` | `{ previous_yield, latest_yield, crop_name, acres, price_per_kg }` | `{ status, difference_kg, percentage_change, revenue_diff_inr, status_tag, ai_insight }` |
| `/api/plant-growth` | `POST` | `{ crop_name, previous_height_cm, latest_height_cm, days_elapsed, stage, leaf_condition }` | `{ status, diff_cm, pct_growth, daily_rate_cm, speed_rating, insight_summary, suggestions: [...] }` |
| `/api/farmer-subsidies` | `GET` | `category, search` | `{ status, total_schemes, schemes: [ { title, subsidy_percent, financial_benefit, portal_url, ... } ] }` |
| `/api/water-stress` | `POST` | `{ soil_moisture, temperature, humidity, days_since_watering, soil_type, acres }` | `{ status, cwsi, stress_level, req_water_per_acre_l, water_saved_liters, cost_saved_inr, action_advice }` |
| `/api/farm-image-analysis` | `POST` | `{ image_data, crop_type }` | `{ status, canopy_coverage_pct, health_index, weed_density, moisture_patches, agronomy_notes: [...] }` |
| `/chat` | `POST` | `{ message }` | `{ reply, action_link, action_text }` |

---

## 💻 How to Run the Application

1. Open project directory in Windows File Explorer.
2. Double-click [`run_app.bat`](file:///d:/Agritech_Farm-main/Agritech_Farm-main/run_app.bat).
3. The application will open automatically in your browser at `http://localhost:8000/index.html`.
4. (Optional) Paste your Data.gov.in API key in [`api_keys.txt`](file:///d:/Agritech_Farm-main/Agritech_Farm-main/api_keys.txt) for live government mandi price feeds.
