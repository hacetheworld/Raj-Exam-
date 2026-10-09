# Raj Exam AI

Daily 2.5-minute audio digest + 5 MCQs for Rajasthan exam aspirants (RPSC, REET, Rajasthan Police, CET, Patwari).

## Repository Structure

- `backend/` - Node.js Express MVC API & daily scraper/LLM/TTS pipeline
- `frontend/` - Next.js (App Router, Tailwind CSS) web application
- `supabase/migrations/` - Database SQL migrations
- `.github/workflows/` - GitHub Actions daily cron pipeline

## Quick Start (Local Development)

### 1. Supabase Setup
1. Create a Supabase project.
2. Run `supabase/migrations/001_init.sql` in the SQL Editor.
3. Enable Email/Password Auth & set minimum password length to 8.
4. Set Redirect URL to `http://localhost:3000/auth/callback`.

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, OPENAI_API_KEY
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with NEXT_PUBLIC_ variables
npm run dev
```

### 4. Running the Pipeline
```bash
cd backend
# Dry run check
npm run pipeline -- --dry-run

# Rebuild specific date
npm run pipeline -- --date=2026-10-01 --force
```

## Running Tests
```bash
cd backend
npm test
```
