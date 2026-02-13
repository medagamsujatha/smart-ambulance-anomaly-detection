Project description :This project presents a safety‑critical time‑series machine learning system designed for real‑time patient vitals monitoring in a Smart Ambulance environment. The system processes continuously streamed physiological signals including Heart Rate (HR), SpO₂, Blood Pressure (systolic and diastolic), and motion or vibration data. It focuses on handling noisy and artifact‑prone sensor data before performing anomaly detection to identify early warning signals rather than simple threshold violations.

The solution incorporates explicit artifact detection, signal preprocessing, feature engineering, and anomaly modeling to detect potential patient deterioration during transport. A multi‑factor risk scoring mechanism combines multiple vitals, trend behavior, and confidence estimation to generate meaningful and safety‑aware alerts. Alert performance is evaluated using precision, recall, false alert rate, and latency, along with detailed failure analysis to understand system limitations.

The model is deployed as a reproducible ML service using a REST API (FastAPI/Flask), ensuring clean architecture, modular code structure, and engineering discipline suitable for safety‑critical healthcare applications.

```Project Structure:
smart-ambulance-anomaly-detection/
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── synthetic_generator.py
│
├── notebooks/
│   ├── 01_data_exploration.ipynb
│   ├── 02_artifact_handling.ipynb
│   └── 03_model_experiments.ipynb
│
├── src/
│   ├── config/
│   │   └── settings.py
│   │
│   ├── data/
│   │   ├── data_loader.py
│   │   ├── preprocessing.py
│   │   └── artifact_detection.py
│   │
│   ├── features/
│   │   └── feature_engineering.py
│   │
│   ├── models/
│   │   ├── anomaly_model.py
│   │   ├── risk_scoring.py
│   │   └── train.py
│   │
│   ├── evaluation/
│   │   ├── metrics.py
│   │   └── failure_analysis.py
│   │
│   └── utils/
│       ├── logger.py
│       └── helpers.py
│
├── api/
│   ├── main.py
│   ├── schemas.py
│   └── inference.py
│
├── tests/
│   ├── test_model.py
│   └── test_api.py
│
├── models_saved/
│   └── trained_model.pkl
│
├── requirements.txt
├── README.md
├── Dockerfile   (optional bonus)
└── .env```
Benfits:
1.Early Warning Detection – Identifies patient deterioration before critical threshold breaches.
2.Artifact Handling – Reduces false alerts caused by motion and sensor noise.
3.Improved Patient Safety – Supports faster and informed medical decisions.
4.Reduced Alert Fatigue – Filters unnecessary alarms using risk scoring logic.
5.Multi‑Vital Risk Assessment – Combines HR, SpO₂, BP, and trends for smarter alerts.
6.Real-Time Monitoring – Designed for continuous second-by-second data streams.
7.Explainable Alerts – Provides confidence score and reasoning for each alert.
8.Performance Evaluation – Uses precision, recall, and latency metrics for reliability.
9.Scalable API Deployment – Can integrate with ambulance systems via REST API.
10.Safety-Critical Design – Focuses on engineering judgment and failure analysis.
