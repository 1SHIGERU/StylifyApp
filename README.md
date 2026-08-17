# Stylify - hybrid ML moderation for a C2C marketplace

> A production-style Polish-language Trust & Safety system that detects payment fraud, platform-bypass attempts, PII sharing, and toxic content in marketplace chat.

Stylify is a full-stack C2C fashion marketplace whose core ML Engineering component is a real-time moderation pipeline. Instead of treating moderation as an isolated notebook model, the project deploys a fine-tuned transformer alongside deterministic PII detection, integrates both into the message-delivery path, reconstructs conversational context, records decisions for review, and degrades safely when the ML service is unavailable.

The system was designed and evaluated as part of my MSc thesis, *Detection of Fraud Attempts and Payment System Evasion in User Communication within C2C Applications Using Text Analysis and Machine Learning* (2026).

## Why this is an ML Engineering project

- **Hybrid inference architecture:** Microsoft Presidio and domain-specific Polish recognizers handle high-confidence structural signals; a fine-tuned HerBERT classifier handles ambiguous, semantic cases.
- **Latency-aware routing:** obvious abuse is resolved before transformer inference. In the thesis evaluation, Presidio handled 68.3% of test messages.
- **Context-aware classification:** consecutive messages from one sender are joined into a conversation turn, which exposes attacks split across multiple messages.
- **Application integration:** FastAPI inference is called from the Node.js chat API before message delivery; decisions result in `allow`, `warn`, or `block` UX.
- **Operational safeguards:** decisions, confidence, reason, detector, and conversation-turn metadata are persisted for moderation review. A deterministic server-side fallback is used when the ML service cannot be reached.
- **Measured, not just trained:** the repository includes a timing endpoint and benchmark script for Presidio, HerBERT, and the end-to-end hybrid path.

## Results

Evaluation was performed on a held-out, balanced synthetic test set of 120 Polish marketplace-chat messages. The split was not used for training or hyperparameter selection.

| Approach | Macro precision | Macro recall | Macro F1 | Accuracy |
| --- | ---: | ---: | ---: | ---: |
| A - rule-based baseline | 0.454 | 0.420 | 0.333 | 0.433 |
| B - Presidio + custom regex | 0.967 | 0.955 | 0.958 | 0.958 |
| C - fine-tuned HerBERT | 0.982 | 0.985 | 0.983 | 0.983 |
| D - hybrid Presidio + HerBERT | **0.991** | **0.992** | **0.991** | **0.992** |

The hybrid pipeline made one false-positive prediction in 120 test messages. On the same benchmark, the average component latencies were **8.38 ms** for Presidio and **43.48 ms** for HerBERT. These are thesis results on synthetic data, not a claim of production performance; validation on real, independently annotated traffic remains future work.

## System design

```mermaid
flowchart LR
    U["Chat message"] --> T["Build current conversation turn"]
    T --> P["Presidio + Polish domain recognizers"]
    P -->|"Risk found"| D["allow / warn / block"]
    P -->|"No risk found"| H["Fine-tuned HerBERT"]
    H --> D
    D --> A["Persist message, turn, flag and metadata"]
    A --> M["Moderator review workflow"]
```

The Node.js API first calls the Presidio stage on the complete current turn. If it returns a risk decision, the message does not incur transformer latency. Otherwise the service classifies both the newest message and the full turn with HerBERT, then selects the stricter decision. Calling the model at both granularities avoids hiding a late malicious message in an otherwise benign turn.

If the ML service times out or fails, the API uses its deterministic `rules_v1` fallback and marks the result accordingly. This keeps the message flow available rather than making a remote ML dependency a single point of failure.

## Moderation taxonomy

| Model label | Examples of signals |
| --- | --- |
| `bypass` | phone/email sharing, social-media handles, attempts to move a transaction outside Stylify |
| `fraud` | Polish IBANs, BLIK/payment-code requests, advance-payment requests, phishing links |
| `toxic` | abuse, threats, insults, and aggressive language |
| `benign` | normal marketplace communication |

The Presidio stage contains custom Polish recognizers for phone numbers, emails, IBANs, payment-card/CVV and BLIK patterns, advance-payment language, phishing links, social-media handles, platform-bypass phrases, and toxic expressions. HerBERT provides semantic classification where static patterns are insufficient, particularly for toxic messages without explicit profanity.

## Dataset

The repository includes a 1,200-example JSONL dataset tailored to Polish C2C chat. It is intentionally balanced across `benign`, `bypass`, `fraud`, and `toxic` classes.

| File | Purpose | Examples |
| --- | --- | ---: |
| `ml-service/dataset/processed/train.jsonl` | training | 960 |
| `ml-service/dataset/processed/val.jsonl` | validation | 120 |
| `ml-service/dataset/processed/test.jsonl` | held-out evaluation | 120 |
| `ml-service/dataset/processed/dataset.jsonl` | full dataset | 1,200 |

The initial data is synthetic and template-generated to avoid collecting private user conversations before launch. The moderation data model supports a human-in-the-loop workflow: flagged messages and their turn context can be reviewed and annotated, creating a path toward a real-data retraining set.

## Tech stack

| Area | Technologies |
| --- | --- |
| ML serving | Python, FastAPI, Hugging Face Transformers, PyTorch |
| NLP | Fine-tuned HerBERT, Microsoft Presidio, spaCy Polish pipeline, custom regex recognizers |
| Backend | Node.js, Express, Sequelize, PostgreSQL, JWT |
| Frontend | React, React Router, Tailwind CSS, Chart.js |
| Integrations | Stripe, Cloudinary |
| Infrastructure | Docker and Docker Compose |

## Repository structure

```text
Stylify/
├── client/                       # React marketplace UI
├── server/                       # Express API, persistence, chat and moderation orchestration
│   ├── controllers/chatController.js
│   ├── utils/turns.js            # conversation-turn reconstruction
│   ├── utils/rules.js            # deterministic fallback
│   └── tests/pipeline_timing_test.js
├── ml-service/                   # FastAPI inference service
│   ├── main.py                   # Presidio, HerBERT and health endpoints
│   ├── presidio_detector.py      # Polish/domain-specific recognizers
│   └── dataset/processed/        # JSONL training, validation and test splits
└── docker-compose.yaml
```

## Run locally

### Prerequisites

- Docker and Docker Compose, or Node.js 16+, Python 3.11+, and PostgreSQL
- A fine-tuned checkpoint at `ml-service/models/herbert-finetuned/`

The model directory is excluded from Git because model artifacts are large. Without a local checkpoint, `POST /classify/herbert` responds with `available: false`; to reproduce the full hybrid system, supply the checkpoint first.

### Environment configuration

Create `server/.env` locally. Do not commit credentials.

```dotenv
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stylify
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
ML_SERVICE_URL=http://localhost:8000
```

For a Compose deployment, use the service names `postgres` and `ml-service` for the database host and ML service URL respectively. Configure the frontend's API base in `client/.env`:

```dotenv
REACT_APP_API_URL=http://localhost:13000/
```

### Start the services

Run the ML service:

```powershell
cd ml-service
pip install -r requirements.txt
python -m spacy download pl_core_news_sm
uvicorn main:app --host 0.0.0.0 --port 8000
```

In a second terminal, start the API:

```powershell
cd server
npm install
npm start
```

In a third terminal, start the UI:

```powershell
cd client
npm install
npm start
```

Container definitions are provided in `docker-compose.yaml` for the frontend, API, PostgreSQL, and ML service. Ensure the application environment variables and model checkpoint are available to the containers before running `docker compose up --build`.

## API surface

### ML service

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | service health and HerBERT availability |
| `POST` | `/classify/presidio` | PII/domain-recognizer moderation |
| `POST` | `/classify/herbert` | fine-tuned transformer inference |
| `POST` | `/classify` | legacy multilingual toxicity-classification endpoint |

### Moderation flow in the application API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/chat/add-message` | build turn, moderate, persist and return UI action |
| `GET` | `/moderation/flags` | retrieve moderation flags |
| `POST` | `/moderation/flags/:flagId/mark` | record a moderator decision |
| `POST` | `/moderation/flags/:flagId/override` | unblock an overridden result |

## Measure the pipeline

The timing route is deliberately disabled by default. Enable it only in the environment where the API process starts:

```powershell
$env:ENABLE_LOAD_TEST_ENDPOINT = "true"
cd server
npm start
```

Then, in a separate terminal:

```powershell
cd server
$env:BASE_URL = "http://localhost:5000"
$env:ITERATIONS = "20"
npm run test:timing
```

The script calls `POST /chat/classify`, warms up the services, and reports average, p95, and p99 times for Presidio, HerBERT, and the hybrid path. Adjust `BASE_URL` for Docker or another deployment.

## Design decisions and next steps

The project intentionally combines a transparent, fast rules/PII layer with a semantic model rather than relying on a single classifier. This is especially useful for a marketplace domain: structural identifiers need deterministic handling, while conversational intent and indirect toxicity benefit from a transformer.

Current limitations are important:

- evaluation uses synthetic, single-author-labelled data, so real-world generalisation must be measured separately;
- the present system targets Polish-language text only;
- attackers can evade static patterns through obfuscation such as spacing or leetspeak;
- rule and model updates are not yet automated.

Planned work includes real-data annotation with moderator feedback, normalization and fuzzy matching for obfuscation, versioned model artifacts, experiment tracking, and continuous evaluation/retraining.

## Resume-ready summary

> Built and evaluated a real-time Polish Trust & Safety pipeline for a C2C marketplace. Combined Microsoft Presidio and custom PII/fraud recognizers with a fine-tuned HerBERT classifier in a FastAPI microservice, orchestrated from Node.js with conversation-turn reconstruction, failure fallback, moderator audit records, and latency instrumentation. Achieved macro-F1 0.991 on a held-out 120-example synthetic test split.
