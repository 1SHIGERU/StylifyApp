# Stylify

Stylify is a fashion marketplace built around one core ML problem: **detecting and moderating abusive or policy-breaking messages in real time**.
The product combines a full commerce flow with a hybrid moderation pipeline, making it a strong example of **ML integrated into a production app** rather than a standalone model demo.

## Why this project stands out

- **Hybrid moderation pipeline**: rule-based filtering + ML service fallback for message classification.
- **Turn-aware analysis**: messages are evaluated in conversation context, not in isolation.
- **Production-oriented safety**: suspicious content can be warned, blocked, or escalated to moderation.
- **Real product surface**: chat, transactions, offers, reviews, notifications, and admin/moderation flows.
- **Observability-friendly design**: the pipeline exposes timing and debug metadata for diagnostics.

## ML engineering signals

- Context-aware classification over conversation turns
- Layered decisioning: rules first, ML second
- Graceful degradation when inference is unavailable
- Timing metadata for latency analysis
- Dedicated timing test endpoint for performance experiments

## ML / moderation pipeline

Stylify’s chat moderation is designed as a layered system:

1. **Context building** — the server reconstructs the current conversation turn before classification.
2. **Fast rules layer** — lightweight rules catch obvious policy violations early.
3. **ML layer** — a dedicated classification service analyzes the full turn and the latest message.
4. **Decision handling** — messages can be allowed, warned, or blocked.
5. **Fallback path** — when the ML service is unavailable, the app falls back to rule-based classification.

This makes the project useful for showing practical ML engineering skills:
- latency-aware inference design,
- robustness when dependencies fail,
- moderation workflows,
- system-level tradeoffs between precision and recall.

## Core product features

- Authentication and session management
- Offer creation with image uploads
- Marketplace browsing and filtering
- Favorites, orders, wallet/history views
- User-to-user chat
- Reviews and seller ratings
- Notifications
- Stripe checkout
- Admin and moderation dashboard

## Tech stack

**Frontend**
- React
- React Router
- React Hook Form
- Tailwind CSS
- Chart.js
- React Toastify

**Backend**
- Node.js
- Express
- Sequelize
- PostgreSQL
- JWT
- bcrypt
- Stripe

**ML / integrations**
- Hybrid message moderation pipeline
- External ML service for classification
- Azure AI / Computer Vision / Form Recognizer
- Cloudinary for image uploads

## Architecture

- `client/` — React UI and user flows
- `server/` — API, authentication, payments, chat, moderation, persistence
- PostgreSQL via Sequelize models
- Cloudinary for media storage
- Stripe for checkout sessions
- ML service for message classification and moderation

## Local setup

### Backend

```bash
cd server
npm install
npm start
```

### Frontend

```bash
cd client
npm install
npm start
```

## Environment variables

Configure the app with your own environment values for:

- database connection
- JWT/session secrets
- Stripe keys
- Cloudinary credentials
- ML service URL
- Azure AI credentials

## Testing

Backend tests are available with:

```bash
cd server
npm test
```

There is also a timing-focused test script for the moderation pipeline:

```bash
cd server
npm run test:timing
```

## CV angle

If you are using Stylify in a CV, the strongest framing is:

> I built a production-style moderation pipeline for a marketplace platform, combining rule-based filtering with ML classification, fallback handling, and conversation-level context reconstruction to reduce abusive content in user chat.
