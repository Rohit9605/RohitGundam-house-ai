# House AI

House AI turns an architectural reference image into an original conceptual floor plan and a walkable 3D model.

## Current prototype

1. Upload a house photo or paste a direct image URL.
2. Set approximate square footage, bedroom count, and number of floors.
3. The AI analyzes architectural style, massing, roof language, materials, and windows.
4. It returns an original structured room layout.
5. View the layout as a 2D floor plan or a generated 3D model.
6. Enter first-person walkthrough mode with WASD + mouse look.

> This is conceptual visualization only. It does not produce construction, engineering, code-compliance, or permit documents.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

Without an API key, the app still works in demo mode using a built-in sample house.

## Enable AI analysis

Set these in `.env.local`:

```
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.6-luna
```

The API key is only read server-side by `app/api/generate/route.ts`.

## Deploy

The project is ready for a standard Next.js deployment (for example, Vercel). Add the same environment variables in your hosting provider.

## Next milestones

- doors/windows and collision-aware navigation
- roof generation from analyzed roof type
- façade materials and exterior rendering
- editable walls/rooms
- conversational changes ("make the kitchen bigger")
- furniture/layout generation
- save/share projects
- cost estimation
