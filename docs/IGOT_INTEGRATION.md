# StatSetu × iGOT Karmayogi — Integration Architecture

**PS:** SIH26101 (MoSPI) — *"Develop an AI enabled learning platform that identifies competency
gaps, recommends personalized training through integration with the iGOT Karmayogi ecosystem,
and capable of generating Quizzes and Multiple choice questions (MCQs) from uploaded learning
materials to strengthen capacity building in India's Official Statistical System."*

This is the **as-built** architecture: every component below exists in `src/lib/igot/` and
`src/app/api/igot/` today. Design rule: **mock and live are the same interface** — switching is
configuration (`STATSETU_IGOT_MODE=live|mock`), never a code change. Honesty rule: every mock
response is tagged `mock: true` with a disclosure note the UI renders; the live path never
fabricates — it throws and callers surface the failure.

---

## 1. Big picture

```
                    ┌────────────────────────────────────────────────┐
                    │                StatSetu core                   │
                    │  skill graph (59 skills / 7 domains) · gap     │
                    │  engine · path planner · doc→MCQ pipeline      │
                    └───────▲───────────────▲───────────────▲───────┘
                            │               │               │
              competency    │    completions│   catalogue   │  classroom feed
              gaps          │    (evidence) │  (courses)    │
                    ┌───────┴───┐   ┌───────┴──────┐   ┌────┴─────────┐
                    │  gap →    │   │  iGOT        │   │  NSSTA TPAC  │
                    │  course   │   │  adapter     │   │  store       │
                    │  matcher  │   │  (Sunbird)   │   │  (runtime    │
                    └───────────┘   └──┬────┬──┬───┘   │   editable)  │
                                       │    │  │       └──────────────┘
             ┌─────────────────────────┘    │  └──────────────┐
             ▼                              ▼                 ▼
   ┌──────────────────┐        ┌──────────────────┐   ┌────────────────┐
   │ Deep links       │        │ Live Sunbird API │   │ Mock connector │
   │ (work TODAY)     │        │ search · enrol · │   │ deterministic, │
   │ igot.gov.in URLs │        │ enrollment list  │   │ offline demo   │
   └──────────────────┘        └──────────────────┘   └────────────────┘
             ▲                              ▲                 ▲
             │        Keycloak SSO (OIDC) — issues the user token
             └──────────────────────────────┴─────────────────┘
```

Why Sunbird: iGOT has no public developer API, but the platform behind
`igotkarmayogi.gov.in` is **Sunbird** — the MIT-licensed LMS behind DIKSHA. Its REST contract
is publicly documented, so the live client is written against a *real* contract, not a guess.
The remaining bottleneck is administrative: a data-sharing agreement with **Karmayogi Bharat
SPV / DoPT** issuing `STATSETU_IGOT_BASE_URL` + `STATSETU_IGOT_API_KEY` (+ Keycloak client
credentials for SSO). From that moment, live mode is a `.env` change.

### Sunbird endpoints used (under `STATSETU_IGOT_BASE_URL`)

| Purpose | Endpoint | Used by |
|---|---|---|
| Course search | `POST /api/course/v1/search` | catalogue import, live search, health probe |
| Course detail | `GET /api/course/v1/hierarchy/{id}` | (future) syllabus-level MCQ grounding |
| Open batch lookup | `POST /api/course/v1/batch/list` | (future) enrol-by-config flows |
| Enrol a user | `POST /api/course/v1/enrollment/enrol` | (future) one-click enrol from a path |
| Completion pull | `GET /api/course/v1/enrollment/list/{userId}` | completion sync |

Auth model: server-to-server `Authorization: Bearer <api-key>` plus, for user-scoped calls,
the Keycloak-issued user token in `x-authenticated-user-token`.

---

## 2. Catalogue import

**Goal:** 35-course MoSPI/iGOT catalogue mapped to 100% of graph skills, loadable without any
credential, upgradeable to live search later.

**Pipeline**

```
raw JSON/CSV (iGOT export, MoSPI list, manual entry)
   │
   ▼
importCourses(raw)          — schema validation, normalize, per-record reject reasons
   │  valid[] / rejected[{index, reason}]
   ▼
mergeImportedCourses(valid) — merge-by-course_id into data/courses.json
   │
   ▼
course_skill_mapping.json   — course → graph skill ids (recommendation fuel)
```

- `importCourses` accepts `{courses:[...]}` or a bare array; requires `course_id`, `Title`,
  http(s) `URL`; optional `ShortIntro, Category, SubCategory, CourseType, Skills, Level,
  Rating, Viewers, DurationRaw, source(igot|mospi|other)`. Deterministic — no LLM, no network,
  so the importer UI can show exact reject reasons per record.
- Every imported course carries `Skills` (comma-separated graph skill names); the sync step
  resolves names → ids against `skill_graph.json`, which is how an iGOT completion becomes
  verified evidence on the graph.
- Live mode (`sunbirdSearchCourses`) normalizes Sunbird hits (`identifier, name, description,
  webUrl, primaryCategory, level, duration`) into the **same** `IgotCourseRecord`, so mapping,
  recommendation and UI stay mode-agnostic. A 5-minute catalogue cache sits in front of the
  live path.

**Surfaces:** `GET /api/igot/catalogue?q=&limit=` (live search or disclosed mock seed),
import via the admin flow, merge into the committed seed catalogue.

---

## 3. Deep links — the integration that works today

`deepLink(courseId, url)` returns the iGOT course URL (`https://igotkarmayogi.gov.in/course/…`).
That is deliberate: deep links need **zero** API access, no PII leaves the platform, and an
official's click-through is a real iGOT session. Every recommendation — path planner step,
gap report, TPAC alternative — renders as a deep link *first*. Deep links are also the fallback
when live mode errors: a broken API never removes the officer's training option.

Onboarding an official is therefore: StatSetu maps gaps → picks courses → renders deep links →
officer enrols on iGOT natively. The future `enrol` endpoint turns this one-click, but the
journey works end-to-end today.

---

## 4. Completion sync

**Goal:** turn "officer finished an iGOT course" into **verified evidence** stamped on the
skill graph, closing the loop: gap → training → proof.

```
syncCompletions(email, live?{userId, userToken})
   │
   ├─ mock mode → mockCompletions(email)      deterministic, seed = hash(email)
   └─ live mode → GET /api/course/v1/enrollment/list/{userId}
                  headers: api-key + x-authenticated-user-token
                  completion ⇔ status==="COMPLETED" | progress===100
                        │
                        ▼
   map course_id → Skills (courses.json) → skill ids (skill_graph.json)
                        │
                        ▼
   IgotSyncResult { mode, polled_at, endpoint,
                    completions[{courseId, learnerEmail, completedAt,
                                 scorePercent, matchedSkillIds}],
                    mock, note }   ← note is rendered in the UI verbatim
```

- **Evidence stamping:** `matchedSkillIds` is the contract with the evidence engine — each
  completed course upgrades the corresponding graph nodes from *claimed* toward *verified*
  (course-attested), never to *proven* (that tier is reserved for assessed work: calibration
  quizzes and grounded MCQs).
- **Identity resolution:** live sync needs the officer's Sunbird `userId` + a fresh Keycloak
  token — exactly what the SSO callback returns (`igot_user_id`). Without SSO, email-scoped
  mock/demo sync still works.
- **Failure semantics:** live failures throw (`Sunbird enrollment list HTTP 5xx` → surfaced in
  the API response); nothing silently degrades to fake data.
- **Cadence:** poll on dashboard load + a nightly cron-style sweep is enough; Sunbird's
  enrollment list is a cheap read and the 5-min cache protects the quota.

**Surface:** `GET /api/igot/sync?email=…&userId=&userToken=` — mode, endpoint, completions,
`mock` flag and disclosure note.

---

## 5. Keycloak SSO (identity bridge)

`src/lib/igot/sso.ts` implements the standard OAuth2 authorization-code flow (RFC 6749 §4.1)
against iGOT's Keycloak realm:

1. `buildSsoRedirectUrl()` → officer logs in on iGOT's own login page
2. `exchangeSsoCode()` → tokens
3. `fetchSsoProfile()` → `sub` = Sunbird `userId` (the key the live adapter needs), email, name

Routes: `GET /api/igot/sso/login` and `/callback`. Gated by `ssoEnabled()`: until
`STATSETU_IGOT_SSO_*` credentials exist, the login button is hidden and `/login` returns **501
with setup instructions** — a demo can never break on a missing button, and enabling SSO later
is pure configuration. The callback hands `igot_user_id` to the app, which is what completion
sync uses for the live pull.

---

## 6. Mock connector (offline demo mode)

Purpose: judges/demos run with **no network, no credentials, no risk of showing fake data as
real**.

- `STATSETU_IGOT_MODE=mock` (default). `mockCompletions(email)` derives completions
  deterministically from a char-code seed of the email → the same demo always shows the same
  records (stable for screenshots and re-runs), picks a stable subset of
  `{IGOT001, IGOT002, GEN008}`, realistic scores `70–99`, completion dates in the past.
- Every response: `mock: true` + a long-form disclosure `note` ("MOCK FEED — … NOT verified
  iGOT records … live path activates with a data-sharing agreement: STATSETU_IGOT_MODE=live +
  base URL + API key"). The UI renders this note; nothing is faked silently.
- Mock catalogue = the committed seed (`data/courses.json`), which is itself real public
  course metadata — so even "mock" content is truthful.
- `GET /api/igot/health` is the honesty check: mock mode reports `connected:false,
  mode:"mock"`; live mode performs a **real round-trip** (1-record Sunbird search) and reports
  `connected:true/false` with measured latency. "Integration works" is a verifiable claim, not
  a screenshot.

**Demo script (offline):** dashboard → gap report → iGOT recommendations (deep links) →
"Simulate iGOT sync" (`/api/igot/sync`, mock note visible) → graph nodes upgrade → path
recomputed → health page shows `mode:"mock", connected:false` honestly.

---

## 7. NSSTA TPAC — the second training feed

iGOT covers self-paced online; NSSTA's TPAC calendar covers residential/hybrid classroom
programmes. Same competency-gap report drives both feeds: `recommendTpacProgrammes(gaps,
designation)` filters by designation eligibility, ranks by skill-overlap coverage
(`coveredGapSkillIds.length / gaps.length`), ties-break on shorter duration. The store
(`data/tpac_programmes.json`) is runtime-editable via `PUT/DELETE /api/admin/tpac-programmes/…`
so each cycle's calendar loads without a redeploy. Surface: `POST /api/igot/tpac/recommend`.

---

## 8. Configuration contract

| Env var | Purpose | Default |
|---|---|---|
| `STATSETU_IGOT_MODE` | `mock` \| `live` | `mock` |
| `STATSETU_IGOT_BASE_URL` | Sunbird root for live calls | — (required in live) |
| `STATSETU_IGOT_API_KEY` | server-to-server Bearer key | — |
| `STATSETU_IGOT_SSO_ENABLED` | show/enable Keycloak SSO | `false` |
| `STATSETU_IGOT_SSO_AUTH_URL` / `_TOKEN_URL` / `_USERINFO_URL` | Keycloak realm endpoints | — |
| `STATSETU_IGOT_SSO_CLIENT_ID` / `_CLIENT_SECRET` / `_REDIRECT_URI` | Keycloak client | — |

Live mode fails loudly if the base URL/key are missing ("not configured" errors) — another
instance of never fabricating.

## 9. Roadmap (post-agreement, configuration-only activation)

1. **One-click enrol** — wire `POST /api/course/v1/enrollment/enrol` + batch lookup into path
   planner steps ("Enrol" button per step).
2. **Certificate ingestion** — Sunbird issues completion certificates; store the artifact hash
   as provenance on the *verified* evidence tier.
3. **Hierarchy-grounded MCQs** — pull course hierarchy/syllabus from
   `/course/v1/hierarchy/{id}` to ground doc→MCQ generation on the actual iGOT syllabus.
4. **Ministry-wide telemetry** — aggregate (anonymized) completion analytics for MoSPI's
   national skills radar.
5. **Bhashini multilingual** — vernacular MCQ delivery once content pipeline is bilingual.
