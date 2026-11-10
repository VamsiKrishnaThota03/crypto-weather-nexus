# CryptoWeather Nexus

A Next.js dashboard that combines live cryptocurrency prices, current weather for major cities and crypto news. It supports favorites and toast alerts for price and weather changes.

![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2-764ABC?logo=redux&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Jest](https://img.shields.io/badge/tests-Jest-C21325?logo=jest&logoColor=white)

[![CI](https://github.com/VamsiKrishnaThota03/crypto-weather-nexus/actions/workflows/ci.yml/badge.svg)](https://github.com/VamsiKrishnaThota03/crypto-weather-nexus/actions/workflows/ci.yml)
[![CodeQL](https://github.com/VamsiKrishnaThota03/crypto-weather-nexus/actions/workflows/codeql.yml/badge.svg)](https://github.com/VamsiKrishnaThota03/crypto-weather-nexus/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Live demo

**https://crypto-weather-nexus-eta.vercel.app**

| Dashboard | Coin detail | Mobile |
| --- | --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Bitcoin detail with 7-day chart](docs/screenshots/crypto-detail.png) | ![Crypto list on mobile](docs/screenshots/mobile-crypto.png) |

## Overview

The app is built on the Next.js 14 App Router. The browser only calls the app's own API routes, which fetch data from [CoinGecko](https://www.coingecko.com/) (crypto), [OpenWeatherMap](https://openweathermap.org/) (weather) and the [CryptoCompare](https://min-api.cryptocompare.com/) news API, with short in-memory caches. The OpenWeather key stays on the server. State is managed with Redux Toolkit, and favorites persist in `localStorage`. The dashboard tracks Bitcoin, Ethereum and Cardano, plus the weather in New York, London and Tokyo, and refreshes every 60 seconds.

## Features

- **Dashboard:** crypto, weather and news sections side by side, refreshed every minute
- **Crypto:**
  - list of tracked coins with price, 24h change (color-coded) and market cap
  - detail page (`/crypto/[id]`) with market cap, rank, circulating and total supply, and a **7-day price chart** (Recharts)
- **Weather:**
  - current conditions for each city: temperature, humidity, wind speed and condition icon
  - detail page (`/weather/[city]`)
- **News:** latest crypto headlines with source and timestamp
- **Favorites:** star coins and cities and view them on `/favorites`. They are saved to `localStorage`.
- **Toast notifications** (`react-hot-toast`), from a background poller that runs on every page:
  - BTC or ETH moved 1% or more since the previous check (checked every 30 s while the tab is visible)
  - a favorite city's temperature changed by 5°C or more, or its weather condition changed
- **API resilience:** the CoinGecko route retries on HTTP 429, every route caches responses in memory (30 s for prices, 5 min for weather, news and history) and serves stale data if the upstream fails
- **Input validation:** coin ids, chart ranges and city names are checked before any upstream URL is built
- **Responsive, accessible UI** with Tailwind CSS and Heroicons: skeleton loaders, empty and error states with retry, focus rings and labelled favorite buttons
- **Unit tests** with Jest and jsdom for the favorites slice, the live-update poller and the validators

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| State | Redux Toolkit, React Redux |
| UI | Tailwind CSS, Heroicons, Recharts, react-hot-toast |
| Data | axios / fetch, CoinGecko API, OpenWeatherMap API, CryptoCompare news API |
| Testing | Jest, jest-environment-jsdom |
| Hosting | Vercel |

## Project structure

```
crypto-weather-nexus/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── crypto/route.ts          # GET /api/crypto?ids=
│   │   │   ├── crypto/history/route.ts  # GET /api/crypto/history?id=&days=
│   │   │   ├── news/route.ts            # GET /api/news
│   │   │   └── weather/route.ts         # GET /api/weather?city=
│   │   ├── dashboard/, crypto/, crypto/[id]/, weather/, weather/[city]/, favorites/
│   │   └── layout.tsx, providers.tsx, icon.svg
│   ├── components/      # CryptoSection, WeatherSection, NewsSection, PriceChart, Navbar, ui.tsx
│   ├── hooks/           # useLiveUpdates, useRefresh
│   ├── lib/             # validation, constants (+ tests)
│   ├── services/        # liveUpdates.ts (price/weather alert poller) + tests
│   └── store/           # Redux store + crypto, weather, news, favorites slices
├── jest.config.js
└── next.config.js
```

## Getting started

### Prerequisites

- Node.js 18+ and npm
- A free [OpenWeatherMap API key](https://home.openweathermap.org/api_keys). CoinGecko and CryptoCompare news are called without a key.

### Install and run

```bash
git clone https://github.com/VamsiKrishnaThota03/crypto-weather-nexus.git
cd crypto-weather-nexus
npm install
cp .env.example .env.local   # then add your OpenWeatherMap key
npm run dev               # http://localhost:3000
```

### Environment variables (`.env.local`)

| Variable | Required | Description |
| --- | --- | --- |
| `OPENWEATHER_API_KEY` | For weather | OpenWeatherMap API key. Read only by the `/api/weather` route on the server; it is never sent to the browser. Without it the weather sections show a configuration error and everything else works. |

```env
OPENWEATHER_API_KEY=<your-openweathermap-api-key>
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Next.js ESLint |
| `npm test` | Run Jest |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:coverage` | Jest with a coverage report |

## API routes

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/crypto?ids=bitcoin,ethereum` | Market data for the given CoinGecko IDs (retries on 429) |
| GET | `/api/crypto/history?id=<id>&days=7` | CoinGecko `market_chart` price history used by the chart (`days`: 1, 7, 14, 30, 90, 180, 365) |
| GET | `/api/weather?city=<name>` | Current OpenWeatherMap weather for a city (metric units) |
| GET | `/api/news` | Latest six CryptoCompare headlines |

## Known limitations

- The tracked coins and cities are fixed (`src/lib/constants.ts`); there is no search to add new ones.
- "Live" updates are polling, not push: prices are checked every 30 s and the dashboard refreshes every minute.
- Caches live in server memory, so on serverless hosts each instance has its own cache and the free CoinGecko tier can still rate-limit.
- Next.js is on the latest 14.2 release; some advisories are only fixed in Next 15+, which needs a separate migration.

## Acknowledgments

- [CoinGecko](https://www.coingecko.com/) for cryptocurrency data
- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [CryptoCompare](https://www.cryptocompare.com/) for news


## Protecting the upstream APIs

All four upstream calls go through this app's own route handlers, and the
OpenWeatherMap key is read server-side only. CI proves the key never reaches the
browser: it builds with a known placeholder and then greps `.next/static` for
it, so a `NEXT_PUBLIC_` prefix or a stray import of server code into a client
component would fail the build.

Hiding a key stops it being *stolen*. It does not stop it being *spent*, and
that was the gap here — the deployed app is the key, so anyone who found the URL
could have called `/api/weather` in a loop and burned the free tier's 1,000
calls a day. There is a second version of the same problem on the keyless
endpoints: CoinGecko and CryptoCompare rate limit **by IP**, so an unthrottled
proxy gets the *server's* IP throttled and breaks the dashboard for every user
at once, not just the abuser.

All four handlers are now rate limited per caller (30 requests/minute), and the
guard is the first statement in each one — so a blocked request never reaches
the upstream API, which is the whole point.

`clientKey()` reads the **first** `x-forwarded-for` entry, not the last. That
detail separates a working limit from a decorative one: Vercel appends the real
client first, so reading the last would let a caller send their own header and
pick a fresh bucket at will. There is a test for it, and for the fact that the
function never returns an empty key (which would merge every such caller into a
single shared bucket).

The counter is an in-process fixed window, and the trade-off is stated rather
than hidden: serverless instances do not share memory, so the effective limit is
per instance and a burst spread across cold starts can exceed it. For protecting
free quotas on a demo that is the right size of solution; a hard global limit
would need Redis or Vercel KV.

## Security headers

`next.config.js` now sets a CSP plus `nosniff`,
`strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, HSTS and a
`Permissions-Policy` denying camera, microphone and geolocation.
`poweredByHeader` is off.

`script-src` has to include `'unsafe-inline'` because Next injects inline
bootstrap scripts; removing it would need a nonce threaded through the document
via middleware. That is documented in the config rather than glossed over.
`connect-src` is `'self'` only, since the browser never calls an upstream API
directly; `img-src` allows the OpenWeatherMap icon CDN, CryptoCompare article
images and CoinGecko assets.

## Tests

```bash
npm test
npm run test:coverage
```

26 tests. The 14 that existed covered validation, the favourites slice and the
live-update service. The 12 added cover the limiter: counting, per-caller
isolation, window reset, `retryAfter` never rounding to 0 while blocked, the
`x-forwarded-for` ordering, the never-empty key, and `rateLimitGuard` returning
a JSON 429 with `Retry-After` while leaving other callers alone.

That suite carries a `@jest-environment node` docblock — the default jsdom
environment provides `Headers` but not `Request`/`Response`, and route-handler
code runs server-side anyway, so node is also the more faithful environment.

## Continuous integration

| Job | What it proves |
| --- | --- |
| `test` (Node 20, 22) | ESLint, `tsc --noEmit`, 26 tests, plus coverage on 20 |
| `build` | A production build; that the API key is absent from `.next/static`; and that the security headers are still present in `next.config.js` |

CodeQL runs weekly and on every push; Dependabot groups weekly patch/minor bumps.
