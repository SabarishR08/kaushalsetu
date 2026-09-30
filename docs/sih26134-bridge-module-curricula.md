# SIH26134 — Bridge-Module Curricula (30-Hour Format)
### Generated from the measured demand signal · KaushalSetu Maharashtra

> **Provenance:** every module below targets a skill block in `data/alignment.json`
> (`uncoveredSkills`) whose demand comes from `data/demand.json` — 13,511 real
> Maharashtra Naukri postings across 69 sectors. Example posting IDs are real
> corpus rows (Naukri job IDs) and can be pulled from the JSONL corpora for
> classroom use. The format follows the deck's "Curriculum-Delta-Diff" promise:
> a 30-hour add-on a training center can schedule next Monday, not a syllabus
> rewrite.
>
> **Module rules:** 10 sessions × 3 hours (or 5 × 6). Every session = 1h
> instruction + 1h guided lab + 1h assessed practice. Every module ends with a
> graded practicum and a verifiable Kaushal Passport micro-credential. Bilingual
> delivery (Marathi + English) is assumed throughout.

---

## Module 1 — Retail & B2B Sales Excellence
**Target gap:** `biz_sales` — **2,167 postings** demand it, **zero catalog coverage**.
**Hotspots:** Mumbai (~1,908 actionable postings — the city's single largest
unmet skill), Nagpur, Thane. Sector tab: BFSI + Services.
**Evidence anchors (real postings):** `nk-231224500680`, `nk-201224006799`, `nk-040324005788`.

| # | Session (3 h) | Key outcomes |
|---|---|---|
| 1 | The Maharashtra sales landscape | Map formal (Naukri/Mahaswayam) vs informal hiring; read a real JD; the 21%-of-Mumbai-demand story |
| 2 | Buyer psychology & consultative selling | SPIN/question frameworks; role-play with Marathi-English code-switching |
| 3 | Lead generation & pipeline discipline | CRM basics (spreadsheet-CRM first), lead scoring, follow-up cadence |
| 4 | Objection handling | The 10 common objections from real postings' sectors (BFSI, FMCG, auto retail) |
| 5 | Digital selling I — WhatsApp Business & LinkedIn | Profile building, outreach templates, compliance (no spam) |
| 6 | Digital selling II — telecalling craft | Scripts, tone, call-log hygiene; live mock calling lab |
| 7 | Retail floor excellence | Store walk audits, upsell/cross-sell, visual merchandising basics |
| 8 | B2B essentials — quoting & negotiation | Quote sheets, margin math (uses `dc_spreadsheets` skills), discount authority |
| 9 | Sales analytics & MIS | Daily sales MIS in Excel; funnel metrics; feeds existing `cg_report_writing` strength |
| 10 | **Practicum:** end-to-end sales simulation | Assessed role-play + pipeline workbook + call-log review |

**Assessment:** 40% practicum · 30% session labs · 20% written scenario test · 10% attendance.
**Passport credential:** *Sales Readiness — Level 1 (Retail & B2B)*.

---

## Module 2 — Cloud & AI Foundations for Government Skilling
**Target gap:** the cloud/AI/DevOps block — **4,833 postings aggregate** (AWS 1,046, Azure 921, ML 898, Docker/K8s 755, GCP 476, DL 252, NLP 230, GenAI 140, CV 115), **zero catalog coverage**.
**Hotspots:** Pune and Mumbai tech corridors (AWS skews Pune; Azure skews enterprise Mumbai).
**Evidence anchors (real postings):** `nk-231224500732` (SQL+AWS), `nk-231224902246` (Python+Azure), `nk-211224008589` (Python+ML/DL/NLP/GenAI), `nk-111224502204` (Docker).

| # | Session (3 h) | Key outcomes |
|---|---|---|
| 1 | Cloud literacy: IaaS/PaaS/SaaS | Regions, VMs, storage, billing models; the 2,700+ posting cloud demand story |
| 2 | AWS core (I) | EC2, S3, IAM — free-tier guided lab; real JD walkthrough (`nk-231224500732`) |
| 3 | AWS core (II) + Azure parity | Lambda, RDS; then the same tasks on Azure (App Service, Blob, Entra) |
| 4 | Linux, networking & the CLI | Shell basics, SSH, DNS, firewalls — the gap under every cloud role |
| 5 | Python for cloud ops (bridges existing `it_python_basics` demand: 1,691) | Boto3/beginner automation; scheduled scripts |
| 6 | ML foundations | Train/test split, overfitting, metrics — build a tiny model in scikit-learn |
| 7 | GenAI & prompt engineering | LLM concepts, prompting patterns, RAG at whiteboard level; responsible-AI guardrails (maps `it_data_ethics`) |
| 8 | Containers & CI/CD | Docker images, compose, a GitHub Actions pipeline |
| 9 | Cost, security & compliance basics | Tags/budgets, least privilege, DPDP Act awareness for citizen data |
| 10 | **Practicum:** deploy a working micro-service | Containerized app on a free-tier cloud with a CI pipeline + cost sheet |

**Assessment:** 40% practicum · 30% labs · 20% quiz · 10% attendance.
**Passport credential:** *Cloud & AI Foundations — Level 1*. (Natural next step: vendor certs — AWS CCP / Azure AZ-900.)

---

## Module 3 — Modern Production Operations (Industry 4.0 Bridge)
**Target gap:** `mfg_production` — **1,381 postings** (+ `mfg_quality` Six-Sigma demand in-sector), **zero catalog coverage**.
**Hotspots:** Chhatrapati Sambhajinagar (top unmet skill: Production — 45% of its demand), Auto belt (Pune/Chakan), Kolhapur.
**Evidence anchors (real postings):** `nk-201224504862`, `nk-051224008574`, `nk-181224502724`.

| # | Session (3 h) | Key outcomes |
|---|---|---|
| 1 | The modern factory floor | Value-stream mapping on paper; takt, bottlenecks; Industry 4.0 vocabulary |
| 2 | 5S & standard work | Workplace organization lab; SOP writing (bridges `cg_report_writing`) |
| 3 | Lean waste elimination | 8 wastes hunt on a mock line; kaizen burst exercise |
| 4 | Quality systems I — SPC | Control charts by hand + spreadsheet; uses existing `sm_descriptive` strength (1,184) |
| 5 | Quality systems II — Six Sigma intro | DMAIC walkthrough; defective-PMU case from real auto postings |
| 6 | Digital shopfloor — data capture | Counters, andon, Excel OEE dashboard (bridges `dc_spreadsheets`, `it_dashboards`) |
| 7 | Automation literacy — PLCs & robotics | Ladder-logic sandbox, teach-pendant simulator; ties to `mfg_plc` demand |
| 8 | Predictive maintenance & sensors | Failure modes, vibration/temperature signals, maintenance calendars |
| 9 | Safety, compliance & documentation | Safety audits, incident logs, ISO 9001 awareness (bridges `dq_quality_audit`) |
| 10 | **Practicum:** line-simulation capstone | Teams run a mock line: OEE tracked, one kaizen implemented, MIS presented |

**Assessment:** 40% practicum · 30% labs · 20% written · 10% attendance.
**Passport credential:** *Production Operations — Industry 4.0 Ready (Level 1)*.

---

## Deployment Notes (for MSSDS / DVET)

1. **Sequencing by actionable postings** (from the District-specific actions panel):
   start Module 1 in **Mumbai** (~1,908 postings), Module 3 in **Chhatrapati
   Sambhajinagar + the auto belt**, Module 2 in **Pune + Mumbai** IT corridors.
2. **Stack on existing strengths:** all three modules deliberately reuse skills
   the catalog already teaches (Excel, report writing, descriptive statistics,
   dashboards) — instructors can be drawn from current ITI/igot pools with a
   2-day TOT (training-of-trainers).
3. **Measure the loop:** each cohort's placement data feeds back into
   `demand.json`-style telemetry; the KaushalSetu dashboard's coverage number
   for `biz_sales` / cloud / `mfg_production` should move off 0% — that is the
   KPI.
4. **Refresh cadence:** re-run `npm run sih:demand && npm run sih:alignment`
   quarterly; sessions cite real posting IDs so labs can be re-anchored to
   current JDs without rewriting the module.
5. **Language:** student handbooks bilingual (Marathi/English); session 1 of
   each module includes the sector's Marathi vocabulary drill.
