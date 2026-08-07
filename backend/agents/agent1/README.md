# Data Ingestion Agent - Autonomous Farm-to-Field Pipeline

## Overview
The **Data Ingestion Agent** is the first agent in a pipeline of Agentic AI models designed for autonomous farm management.  
It collects, cleans, standardizes, and synchronizes multi-source data for **Rice, Wheat, Cotton, and Sugarcane** fields. The output is **fully standardized**, allowing downstream Agentic AIs to consume it seamlessly.

This agent is designed for **low-connectivity rural environments** and can work with **simulated data**, making it hackathon-ready.

---

## Features
- Collects data from:
  - **Sensors:** soil moisture, nutrients, temperature (simulated)
  - **Weather APIs:** current + forecast (real or simulated)
  - **Satellite/Drone imagery:** NDVI or placeholder data
  - **Market prices:** local/regional (simulated)
- Cleans and validates data:
  - Handles missing values
  - Removes sensor noise
  - Normalizes units (°C, mm, etc.)
- Standardizes into a **unified schema**:

```json
{
  "timestamp": "2026-04-02T10:00",
  "location": "field_12",
  "soil_moisture": 23.4,
  "temperature": 31,
  "rain_forecast": 0.6,
  "ndvi_index": 0.72,
  "reliability_score": 0.9
}