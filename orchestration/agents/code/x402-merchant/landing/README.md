# Agent Intel Service - Landing Page

A compelling, dark-mode landing page for the x402 Agent Intel Service.

## Overview

This landing page converts visitors into paying customers for CLAUDIA's Agent Intel Service—an x402-powered marketplace where AI agents purchase research intelligence.

## Features

- **Dark Mode Design** - Modern, sleek dark theme with gradient accents
- **Mobile Responsive** - Fully responsive across all devices
- **Value Proposition** - Clear problem → solution → pricing flow
- **Sample Report** - JSON preview showing actual deliverable
- **x402 Integration** - Wallet address and protocol links prominently displayed

## Sections

1. **Hero** - Bold headline with dual CTAs
2. **Problem** - Three pain points agents face (no web access, stale data, fragmented sources)
3. **Solution** - What CLAUDIA provides (research, real-time data, agent-native format)
4. **How It Works** - Simple 3-step visual process
5. **Pricing** - Three tiers (Basic $25, Deep $125, Custom $250)
6. **Sample Report** - JSON preview of actual deliverable
7. **Trust** - x402 badge with wallet address
8. **CTA** - Final conversion push

## File Structure

```
landing/
├── index.html      # Single-page landing site
└── README.md       # This file
```

## Serving the Landing Page

The main server (`server.js`) automatically serves this landing page at the root URL:

```bash
# Start the server
npm start

# Visit the landing page
open http://localhost:4020
```

## Deployment

### Option 1: With the API Server
The landing page is served automatically when you deploy the x402-merchant server.

### Option 2: Static Hosting
You can deploy just the landing page to any static host:

```bash
# Netlify
netlify deploy --dir=landing --prod

# Vercel
vercel --cwd landing

# GitHub Pages
# Copy index.html to your gh-pages branch
```

## Customization

### Wallet Address
Update the wallet address in:
- `index.html` (trust section)
- `../server.js` (MERCHANT_ADDRESS constant)

### Pricing
Modify the pricing cards in `index.html` and update the `PRICING_TIERS` in `../server.js`.

### Colors
The CSS uses CSS variables at the top of the file:
```css
:root {
  --bg-primary: #0a0a0f;
  --accent: #6366f1;
  /* ... */
}
```

## Copy Improvements (Future)

With more time, these improvements would increase conversion:

1. **Social Proof** - Add real testimonials from beta agents
2. **Live Demo** - Interactive "Try It" button with sample request
3. **Use Cases** - Specific examples (DeFi research, competitor analysis, trend spotting)
4. **Comparison Table** - Side-by-side tier comparison
5. **FAQ Section** - Address common objections
6. **Trust Badges** - Security certifications, audit info
7. **Animated Demo** - GIF/video showing the API flow
8. **Stats Banner** - "X reports delivered", "Y agents served"

## Tech Stack

- Pure HTML5 + CSS3 (no frameworks)
- Google Fonts (Inter)
- CSS Grid & Flexbox for layouts
- CSS Variables for theming
- No JavaScript dependencies

## License

MIT - Built for CLAUDIA's $1M Revenue Goal
