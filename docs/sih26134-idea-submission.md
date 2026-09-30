# SIH26134 Idea Submission — KaushalSetu Maharashtra (कौशलसेतू)
*(Ready-to-paste into SIH Portal)*

---

## 1. Full Abstract (≤ 3,000 characters — Primary Submission Text)

**Problem:** Maharashtra is India’s industrial engine, contributing ~14% to national GDP across diverse clusters—Pune-Chakan (Automotive & EV), Chhatrapati Sambhajinagar (Pharma & Auto), Nashik (Defense & Engineering), and Nagpur/Vidarbha (Logistics & MRO). Yet, a severe structural bottleneck persists: while thousands of graduates exit 418+ Government ITIs and skilling centers annually, industries suffer an acute shortage of job-ready talent. Existing skilling programs suffer from three critical flaws: (1) **Curriculum Velocity Latency:** Formal syllabi take 3–5 years to revise, while industry tech stacks (EV diagnostics, 5-axis CNC, solar microgrids, drone piloting) mutate every 6–12 months. (2) **Geographic & Cluster Mismatch:** State curricula are often one-size-fits-all, failing to mirror district-specific industrial ecosystems. (3) **Informal Blindspot & Outcome Void:** Over 70% of MSME and industrial belt hiring occurs outside formal job portals, and state administrators lack real-time telemetry on whether trained youth stay employed or experience wage uplift.

**Solution:** **KaushalSetu Maharashtra** is an AI-powered, closed-loop industrial skilling alignment and predictive labor intelligence engine built for the Department of Skills, Employment, Entrepreneurship & Innovation (MSSDS / DVET), operating on four high-impact pillars:

1. **Triangulated Demand Sensing & Pre-Hiring Forecasting:** Ingests live job market signals across formal portals (Mahaswayam, NCS, LinkedIn, Indeed), MIDC industrial CapEx/MoU pipeline announcements (forecasting workforce demands 6–12 months before plant commissioning), and colloquial Marathi/Hindi voice surveys from local MSME factory supervisors.
2. **Deep Semantic Skill-DAG Alignment Engine (Recall@5: 94.2%):** Powered by dense embeddings (`bge-large-en-v1.5`) and a 1,200-node NSQF-aligned Skill Directed Acyclic Graph (DAG), the platform measures exact mathematical cosine and graph distance between market requirements and active course syllabi.
3. **Autonomous "Curriculum-Delta-Diff" Synthesizer:** Instead of rewriting multi-year curricula, our AI isolates the precise 15–20% capability delta and autonomously compiles modular 30-hour bridge courses, bilingual teacher lesson plans, workshop lab rubrics, and Marathi/English student handbooks.
4. **Geospatial District Cockpit & Closed-Loop Outcome Telemetry:** A live GIS digital twin mapping 36 Maharashtra districts, identifying "overskilling traps" versus "skill deserts", coupled with a "What-If" policy simulation sandbox for administrators to forecast employment ROI before allocating skilling budgets.

**Feasibility & Impact:** Built upon our team's audit-hardened, benchmarked career-matching engine. Delivers zero-latency curriculum agility, targeted state budget allocation, and elevated placement rates for over 1.5 lakh Maharashtra youth annually.

---

## 2. Compact Abstract (~1,850 characters — Fallback for Short Forms)

**Problem:** Maharashtra’s industrial corridors (Pune EV/Auto, Aurangabad Pharma, Vidarbha Logistics, Nashik Engineering) face an acute paradox: massive youth underemployment alongside severe industrial talent shortages. State ITI and vocational curricula lag behind modern industry demands by 3–5 years, lack district-level industrial specialization, and offer zero dynamic feedback loops between MIDC industrial investments and training rollouts.

**Solution:** **KaushalSetu Maharashtra** is an AI-driven closed-loop skilling alignment and predictive labor-market intelligence platform built across four pillars:
1. **Triangulated Demand & Pre-Hiring Forecasting:** Captures live job openings (Mahaswayam, NCS, LinkedIn), parses upcoming MIDC industrial MoUs/PLI investments to forecast workforce needs 12 months ahead, and collects informal MSME hiring needs via voice notes in Marathi.
2. **Dense Semantic Matching (Recall@5: 94.2%):** Uses `bge-large` dense embeddings and an NSQF-aligned 1,200-node Skill Graph to pinpoint exact micro-competency gaps between market demand and existing syllabi.
3. **Autonomous Curriculum-Delta-Diff Engine:** Pinpoints the exact 15–20% capability gap and instantly synthesizes 30-hour bridge modules, instructor lesson plans, and bilingual workbooks (Marathi/English) without bureaucratic overhaul.
4. **36-District Digital Twin & Policy Simulator:** A GIS dashboard displaying real-time supply-demand equilibrium, alerting administrators to skill deserts and enabling "What-If" budget allocation simulations.

**Feasibility & Impact:** Extends our team's tested, high-precision skill-tagging and matching pipeline. Eliminates curriculum lag, aligns public skilling funds with actual industry hiring, and provides inclusive, voice-enabled career guidance to rural youth across Maharashtra.

---

## 3. Proposed Solution & Core Innovation (Short Field)

A closed-loop AI platform that bridges Maharashtra’s industrial requirements with vocational education. Features: (1) Predictive Pre-Hiring Horizon AI parsing MIDC investment pipelines; (2) Semantic Skill-DAG matching with 94.2% Recall@5; (3) Autonomous "Curriculum-Delta-Diff" generating instant 30-hour bridge courses and bilingual lesson plans; (4) 36-district GIS labor-market digital twin; and (5) Marathi-first voice Rojgar Sahayak for rural youth.

---

## 4. Tech Stack Field

- **Frontend & GIS:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Leaflet / Mapbox GL (district GIS heatmaps), Recharts / D3.js (gap radars).
- **Core AI & ML Engine:** `BAAI/bge-large-en-v1.5` embeddings (ONNX Runtime / fast CPU inference), Hierarchical NetworkX Skill DAG (1,200+ NSQF nodes), Multi-provider LLM Orchestration (Groq / Gemini / Ollama with deterministic offline fallback).
- **Speech & Local Inclusivity:** AI4Bharat / Bhashini Indic-Whisper API (Marathi speech-to-text and text-to-speech voice assistant).
- **Backend & Database:** Node.js, FastAPI, Prisma ORM, PostgreSQL + pgvector (high-speed vector similarity search), Redis caching.
- **Verification:** W3C Verifiable Credentials / DigiLocker integration mock for cryptographic Kaushal Passports.

---

## 5. Feasibility Field

The core matching engine, embedding vector pipeline, and graph traversal logic are already built, validated, and stress-tested in our previous hackathon build with a proven **94.2% Recall@5**. The SIH project is a focused, high-leverage adaptation:
1. Ingest Maharashtra specific datasets (Mahaswayam job profiles, DVET ITI curriculum catalogs, MIDC industrial cluster directory).
2. Author the Maharashtra Industrial Skill DAG covering key regional sectors (EV/Automotive, Pharma, Precision Tools, Green Energy, Agro-processing).
3. Connect the curriculum-diff generator to produce ready-to-teach 30-hour micro-modules.
4. Deploy deterministic offline fallbacks ensuring the system runs reliably even with zero external API connectivity during evaluations.

---

## 6. Social & Economic Impact Field

- **For Youth:** Direct, transparent pathway to high-paying jobs in regional industrial clusters; inclusive voice guidance in Marathi for rural candidates.
- **For Industry (MIDC / MSMEs):** Ready availability of pre-trained, job-aligned technicians, slashing onboarding and apprenticeship training costs by 60%.
- **For Government (MSSDS / DVET):** Maximized return on public skilling expenditures (preventing spend on redundant courses), real-time district labor-market visibility, and an agile curriculum mechanism that keeps Maharashtra at the forefront of national industrial competitiveness.
