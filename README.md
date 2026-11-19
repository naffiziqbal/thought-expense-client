# ThoughtExpense: web app

**An expense tracker you type into like a notes app.** Write `coffee 120, uber 250, rent 15000`, and AI parses, categorizes and budgets it for you.

**▶ Live:** [thought-expense.nafiziqbal.com](https://thought-expense.nafiziqbal.com)

This repo is the Next.js web client. The product also has:

| Part | Stack |
|---|---|
| **Web app** (this repo) | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Zustand, Recharts, Zod, Sentry |
| **[API](https://github.com/naffiziqbal/thought-expense-server)** | Express + TypeScript, PostgreSQL, Redis, Gemini for parsing and insights, Pinecone for similar-expense search, Resend email, scheduled backups to DigitalOcean Spaces |
| **[Mobile app](https://github.com/naffiziqbal/though-expense-native)** | React Native + Expo, matching the web app's features, RevenueCat subscriptions |
| **[Admin console](https://github.com/naffiziqbal/though-expense-admin)** | Next.js 16 + shadcn/ui: growth, users, subscriptions, system health |

I designed and built all four, and deployed them on my own VPS with Docker.

## Features

- **Quick log in plain language.** Multiple expenses per line, a live local preview, and AI categorization when you save.
- **Receipt scanning** in the browser with Tesseract.js OCR.
- **Dashboard.** Monthly total, budget donut, safe-to-spend, top category, alerts.
- **AI insights.** Spending observations and weekly briefings.
- **Budgets.** Write `Food 500, Rent 2000` and it becomes category budgets, with progress you can drill into.
- **Goals, recurring expenses and multiple currencies**, plus an AI assistant you can ask about your spending.
- **Premium tier.** Full history, plus CSV and PDF export.
- **Auth.** JWT sessions, password reset by email, and a security page for managing your account.

## Run locally

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev                  # http://localhost:3000
npm run typecheck
```

## Layout

```
app/         (marketing) landing and legal pages; (main) dashboard: add, expenses, budget, goals, recurring, insights, assistant, premium, settings
components/  UI primitives and dashboard components
lib/         API client and helpers
store/       Zustand stores
hooks/       route protection and data hooks
types/       shared API types
```

---

Built by [Nafiz Iqbal](https://nafiziqbal.com).
