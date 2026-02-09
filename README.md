# TimeBack - Visual Website Time Machine

> Rewind any website through time with a beautiful visual timeline and AI-powered insights.

![TimeBack Demo](demo.gif)

## Features

### Core Features
- **Visual Rewind Slider** - Scrub through time with an intuitive slider
- **Wayback Machine Integration** - Fetches real archived snapshots via CDX API
- **AI Insights** - GPT-4 analyzes website evolution, redesigns, and trends
- **Snapshot Grid** - Browse all available snapshots at a glance
- **Auto-Play Mode** - Watch websites transform automatically
- **Full Page View** - Open any snapshot in Wayback Machine

### Comparison Features
- **Side-by-Side View** - View two snapshots next to each other
- **Slider Comparison** - Drag to reveal differences between versions
- **Overlay Mode** - Fade between two snapshots with opacity control
- **Visual Diff Mode** - Highlight changed areas with colored overlays
- **Quick Compare** - Click "Compare" on any snapshot card
- **Keyboard Shortcuts** - Tab to switch panels, 1-4 for view modes, ← → to navigate

### AI Analysis (NEW!)
- **Enhanced AI Prompts** - Actionable insights, not just descriptions
- **Sentiment Trend Visualization** - See how design tone evolved (professional → playful, etc)
- **Export Reports** - Download analysis as Markdown, HTML, or print to PDF
- **Smart Caching** - AI results cached to avoid redundant API calls
- **Fun Facts While Loading** - Domain-specific trivia about popular websites
- **Collapsible Analysis Sections** - Design, Content, Business insights organized

### UX Features
- **Keyboard Navigation** - Arrow keys to navigate, Space to play/pause
- **Year Markers** - Timeline shows year indicators
- **Quick Jump** - Jump to oldest/newest with one click
- **Loading States** - Smooth loading indicators
- **Error Handling** - Graceful fallbacks when previews fail
- **Example Sites** - Pre-loaded popular sites to try

### Design
- **Dark Theme** - Easy on the eyes, perfect for exploration
- **Responsive** - Works on desktop and mobile
- **Smooth Animations** - Polished transitions throughout
- **Modern Stack** - Next.js 14, React 18, Tailwind CSS, TypeScript

## Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API key (optional, for AI insights)

### Installation

```bash
# Clone the repo
git clone https://github.com/galacticjack/timeback.git
cd timeback

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local (optional)

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

**One-Click Deploy:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/galacticjack/timeback)

**Manual Deploy:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Environment Variables (Optional):**
- `OPENAI_API_KEY` - For AI-powered insights (app works without it)

## API Routes

### `/api/insights`
Generates AI-powered insights about a website's evolution.

**POST** body:
```json
{
  "url": "apple.com",
  "snapshotCount": 50,
  "dateRange": {
    "oldest": "2000-01-01",
    "newest": "2024-01-01"
  }
}
```

## How It Works

1. **User enters a URL** - Any website that's been archived
2. **Fetch snapshots** - Query Wayback Machine CDX API for archived versions
3. **Visual timeline** - Display snapshots on an interactive timeline
4. **Preview** - Embed archived pages in an iframe
5. **AI analysis** - Generate insights about the site's evolution

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **Language**: TypeScript
- **API**: Wayback Machine CDX API
- **AI**: OpenAI GPT-4 (optional)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` | Previous snapshot |
| `→` | Next snapshot |
| `Space` | Play/Pause auto-rewind |

## Roadmap

- [x] Side-by-side comparison view ✅ (Feb 2026)
- [x] Visual diff highlighting ✅ (Feb 2026)
- [x] Enhanced AI insights with sentiment analysis ✅ (Feb 2026)
- [x] Export reports (Markdown/HTML/PDF) ✅ (Feb 2026)
- [x] AI result caching ✅ (Feb 2026)
- [x] Fun facts during loading ✅ (Feb 2026)
- [ ] Screenshot thumbnails
- [ ] Share specific moments
- [ ] Export timeline as video
- [ ] Browser extension
- [ ] API for developers

## Contributing

PRs welcome! Please open an issue first to discuss major changes.

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ by [Galactic Jack](https://github.com/galacticjack)
