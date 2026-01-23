# 🚀 Fiverr Success - AI-Powered Gig Optimization Tool

Create **winning Fiverr gigs** with AI. Research keywords, generate optimized content, and save your sessions.

## ✨ Features

- 🔍 **AI Keyword Research** - Specific, actionable keywords from Fiverr, Reddit, & Google
- 📝 **Complete Gig Generation** - Title, tags, pricing, description, FAQs, requirements
- 📖 **Simple Language** - Grade 6 reading level for maximum conversions
- 💾 **Session History** - Save and manage all your gig research
- 🔐 **User Accounts** - Secure auth via Supabase

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` → Settings → Add your OpenAI API key → Start generating!

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Netlify

1. Push to GitHub
2. Import in [Netlify](https://netlify.com)
3. Add environment variables in Site Settings → Environment
4. Deploy!

## 🗄️ Database Setup (Supabase)

1. Create project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the SQL from `supabase/migrations/001_initial_schema.sql`
4. Copy your Project URL and Anon Key from Settings → API

## 📁 Project Structure

```
src/
├── components/     # UI components
├── lib/           # Supabase client
├── pages/         # Route pages (History)
├── services/      # OpenAI integration
├── store/         # Zustand state
└── types/         # TypeScript types
```

## 🛠️ Tech Stack

React 19 • TypeScript • Vite • OpenAI GPT-4o-mini • Supabase • Zustand

## 📜 License

MIT

---

*Not affiliated with Fiverr International Ltd.*
