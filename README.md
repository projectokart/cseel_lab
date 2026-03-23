# CSEEL — Center for Scientific Exploration & Experimental Learning

India's leading platform for hands-on science experiments, virtual lab simulations, STEM education, teacher training, and science exhibitions.

**Website:** https://www.cseel.org

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase (backend)
- Framer Motion (animations)
- react-snap (SEO prerendering)

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:8080

## Build & Deploy

```bash
npm run build
# react-snap automatically runs after build (postbuild script)
# Output: dist/ folder — deploy to Vercel or Netlify
```

## Deploy to Vercel

1. Push code to GitHub
2. Go to vercel.com → Import project
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy

## Project Structure

```
src/
  components/    — Reusable UI components
  pages/         — All page components
  contexts/      — Auth, Cart context
  integrations/  — Supabase client
public/
  sitemap.xml    — SEO sitemap
  robots.txt     — Search engine rules
  site.webmanifest — PWA manifest
```
