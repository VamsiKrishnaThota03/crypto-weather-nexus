# CryptoWeather Nexus

A modern web application that combines cryptocurrency market data with weather information, providing a unique dashboard experience.

Live Link: **[Click here to view the live application](https://crypto-weather-nexus-eta.vercel.app/)**

## Features

### Cryptocurrency Section
- Real-time price updates for major cryptocurrencies
- Price change indicators with color coding
- Market cap and volume information
- Detailed cryptocurrency pages with:
  - Current price and 24h change
  - Market cap and rank
  - Supply information
  - Price charts (coming soon)
  - Favorite functionality

### Weather Section
- Current weather conditions for major cities
- Temperature, humidity, and wind speed
- Weather condition icons
- Detailed weather pages with:
  - Current weather metrics
  - Additional weather information
  - 5-day forecast (coming soon)
  - Favorite functionality

### News Section
- Latest cryptocurrency and weather-related news
- News source attribution
- Timestamp for each article

### Favorites
- Save favorite cryptocurrencies and cities
- Quick access to saved items
- Persistent storage using localStorage

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **API Integration**: 
  - CoinGecko API for cryptocurrency data
  - OpenWeatherMap API for weather data
  - News API for news articles
- **Real-time Updates**: WebSocket for live data

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- API keys for:
  - CoinGecko API
  - OpenWeatherMap API
  - News API

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VamsiKrishnaThota03/crypto-weather-nexus.git
   cd crypto-weather-nexus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your API keys:
   ```
   OPENWEATHER_API_KEY=your_openweather_api_key
   NEWS_API_KEY=your_news_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
crypto-weather-nexus/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── crypto/         # Crypto pages
│   │   ├── weather/        # Weather pages
│   │   └── dashboard/      # Dashboard page
│   ├── components/         # React components
│   ├── store/              # Redux store and slices
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── package.json           # Project dependencies
```

## API Routes

### Cryptocurrency API
- `GET /api/crypto` - Fetch cryptocurrency data
- `GET /api/crypto/[id]` - Get detailed cryptocurrency information

### Weather API
- `GET /api/weather` - Fetch weather data
- `GET /api/weather/[city]` - Get detailed weather information

### WebSocket API
- `GET /api/websocket` - WebSocket endpoint for real-time updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [CoinGecko](https://www.coingecko.com/) for cryptocurrency data
- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [News API](https://newsapi.org/) for news articles
