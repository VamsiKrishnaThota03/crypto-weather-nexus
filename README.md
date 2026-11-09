# CryptoWeather Nexus

A Next.js dashboard that combines live cryptocurrency prices, current weather for major cities and crypto news. It supports favorites and toast alerts for price and weather changes.

![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2-764ABC?logo=redux&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Jest](https://img.shields.io/badge/tests-Jest-C21325?logo=jest&logoColor=white)

## Live demo

**https://crypto-weather-nexus-eta.vercel.app**

## Overview

The app is built on the Next.js 14 App Router. The browser calls the app's own API routes, which fetch data from [CoinGecko](https://www.coingecko.com/) (crypto) and [OpenWeatherMap](https://openweathermap.org/) (weather). News comes from the [CryptoCompare](https://min-api.cryptocompare.com/) news API. State is managed with Redux Toolkit, and favorites persist in `localStorage`. The dashboard tracks Bitcoin, Ethereum and Cardano, plus the weather in New York, London and Tokyo, and refreshes every 60 seconds.

## Features

- **Dashboard:** crypto, weather and news sections side by side, refreshed every minute
- **Crypto:**
  - list of tracked coins with price, 24h change (color-coded), market cap and volume
  - detail page (`/crypto/[id]`) with market cap, rank, circulating and total supply, and a **7-day price chart** (Recharts)
- **Weather:**
  - current conditions for each city: temperature, humidity, wind speed and condition icon
  - detail page (`/weather/[city]`)
- **News:** latest crypto headlines with source and timestamp
- **Favorites:** star coins and cities and view them on `/favorites`. They are saved to `localStorage`.
- **Toast notifications** (`react-hot-toast`):
  - a price moved 1% or more since the last update
  - a favorite city's temperature changed by 5°C or more, or its weather condition changed
- **API resilience:** the CoinGecko routes retry with exponential backoff on HTTP 429 and use Next.js `revalidate` caching (30 s)
- **Live price channel (experimental):** a `ws` WebSocket server (port 3001) and a server-sent-events route (`/api/crypto/stream`) push BTC/ETH prices every 10 s. On the client, the price service does an initial HTTP fetch, then opens a WebSocket and retries with a growing delay if it drops. It connects to `ws://localhost:3000/api/websocket`, so this channel only works in local development.
- **Responsive UI** with Tailwind CSS and Heroicons
- **Unit tests** with Jest and jsdom for the favorites slice and the WebSocket service

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| State | Redux Toolkit, React Redux |
| UI | Tailwind CSS, Heroicons, Recharts, react-hot-toast |
| Data | axios / fetch, CoinGecko API, OpenWeatherMap API, CryptoCompare news API |
| Realtime | `ws`, server-sent events |
| Testing | Jest, jest-environment-jsdom |
| Hosting | Vercel |

## Project structure

```
crypto-weather-nexus/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── crypto/route.ts          # GET /api/crypto?ids=
│   │   │   ├── crypto/history/route.ts  # GET /api/crypto/history?ids=&days=
│   │   │   ├── crypto/stream/route.ts   # GET /api/crypto/stream (SSE)
│   │   │   ├── weather/route.ts         # GET /api/weather?city=
│   │   │   └── websocket/route.ts       # starts ws server on :3001
│   │   ├── dashboard/, crypto/, crypto/[id]/, weather/, weather/[city]/, favorites/
│   │   └── layout.tsx, providers.tsx
│   ├── components/      # CryptoSection, WeatherSection, NewsSection, PriceChart, Navbar
│   ├── hooks/           # useWebSocket
│   ├── services/        # websocket.ts (price stream, alerts) + tests
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
touch .env.local          # then add the variables below
npm run dev               # http://localhost:3000
```

### Environment variables (`.env.local`)

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_OPENWEATHER_API_KEY` | Yes | OpenWeatherMap API key, used by `/api/weather` and the weather slice |

```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=<your-openweathermap-api-key>
```

> Because the variable is `NEXT_PUBLIC_`, the key is exposed in the browser bundle (the weather slice calls OpenWeatherMap directly from the browser).

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
| GET | `/api/crypto/history?ids=<id>&days=7` | Price history used by the chart |
| GET | `/api/crypto/stream` | Server-sent events: BTC/ETH price and 24h change every 10 s |
| GET | `/api/weather?city=<name>` | Current OpenWeatherMap weather for a city (metric units) |
| GET | `/api/websocket` | Starts the `ws` server on port 3001 and returns a status message |

## Acknowledgments

- [CoinGecko](https://www.coingecko.com/) for cryptocurrency data
- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [CryptoCompare](https://www.cryptocompare.com/) for news
