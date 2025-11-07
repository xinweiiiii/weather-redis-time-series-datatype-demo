# Weather Time Series Demo with Redis

A real-time weather monitoring application that demonstrates **Redis TimeSeries** capabilities using NestJS backend and React frontend. The application polls weather data every minute and stores it in Redis TimeSeries for efficient time-series data management.

## 💡 Why Redis TimeSeries?

Redis TimeSeries is a purpose-built data structure optimized for time-series workloads, offering significant advantages over traditional approaches:

### Key Benefits

- **High Performance**: Native time-series operations execute in O(1) or O(log N) time complexity
- **Built-in Operations**: Automatic aggregations, downsampling, and compaction without custom code
- **Memory Efficient**: Optimized compression reduces memory footprint by up to 90%
- **Simplified Development**: No need to manage complex indexes or custom time-based queries
- **Auto-Cleanup**: Built-in retention policies automatically expire old data

### Specific Benefits for This Demo

1. **Automatic Duplicate Handling**: `ON_DUPLICATE LAST` policy ensures latest temperature is always stored, preventing data inconsistencies
2. **24-Hour Auto-Cleanup**: `RETENTION 86400000` automatically removes old data without cron jobs or cleanup scripts
3. **Fast Range Queries**: `TS.RANGE` retrieves all data points for any time window in a single command
4. **Label-Based Filtering**: Query weather data by city or metric type using built-in labels
5. **Zero Configuration**: Time series auto-created on first data point with all settings in one command

**How TimeSeries Solved This**:
```redis
# TimeSeries Solution:
TS.ADD weather:ts:singapore 1699000000 28  # First reading stored
TS.ADD weather:ts:singapore 1699000060 28  # Second reading stored independently
# Result: Both entries stored correctly! Timestamp is the natural key.
```

## 🌟 Features

- **Real-time Weather Polling**: WebSocket-based polling every 1 minute
- **Time Series Storage**: Uses Redis TimeSeries data structure for optimal performance
- **Interactive Charts**: Visualize temperature trends over time using Recharts
- **Flexible Time Ranges**: View data over 1h, 6h, or 24h periods
- **Auto-cleanup**: 24-hour data retention policy
- **City Selection**: Monitor weather for different cities

## 🛠️ Tech Stack

### Backend
- **NestJS** - TypeScript framework for Node.js
- **Socket.IO** - WebSocket communication
- **Redis** - In-memory data store
- **Redis TimeSeries** - Time series data structure module

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Recharts** - Charting library
- **Socket.IO Client** - WebSocket client

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd weather-redis-time-series-datatype-demo
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the root directory:

```env
REDIS_HOST=your-redis-host.redns.redis-cloud.com
REDIS_PORT=your-redis-port
REDIS_PASSWORD=your-redis-password
PORT=3001
```

### Frontend Configuration (Optional)

The frontend defaults to `http://localhost:3001`. To use a different backend URL, set the environment variable:

```bash
# frontend/.env
VITE_API_BASE=http://localhost:3001
```

## 🏃 Running the Application

### Start Backend Server

```bash
npm run start:dev
```

The backend will start on **http://localhost:3001**

### Start Frontend Development Server

In a separate terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on **http://localhost:5173**

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 📡 API Endpoints

### REST API

#### Get Weather Series Data
```http
GET /weather/series?city=Singapore&from=2025-11-07T00:00:00.000Z&to=2025-11-07T06:00:00.000Z
```

**Query Parameters:**
- `city` (string) - City name (default: "Singapore")
- `from` (ISO 8601 datetime) - Start timestamp
- `to` (ISO 8601 datetime) - End timestamp

**Response:**
```json
{
  "city": "Singapore",
  "from": "2025-11-07T00:00:00.000Z",
  "to": "2025-11-07T06:00:00.000Z",
  "points": [
    { "ts": 1762497169031, "tempC": 28 },
    { "ts": 1762497229045, "tempC": 26 }
  ]
}
```

### WebSocket API

#### Namespace: `/weather`

**Event: `getWeather`**

**Emit:**
```javascript
socket.emit('getWeather', { city: 'Singapore' }, (response) => {
  console.log(response); // { city, tempC, conditions, updatedAt }
});
```

**Response:**
```json
{
  "city": "Singapore",
  "tempC": 28,
  "conditions": "Partly Cloudy",
  "updatedAt": "2025-11-07T06:32:41.267Z"
}
```

## 🔍 How It Works

### Data Flow

1. **Frontend Polling** 
   - React component establishes WebSocket connection on mount
   - Polls weather data every **60 seconds** (configurable)
   - Stores received data points in local state
   - Filters data based on selected time range (1h, 6h, 24h)

2. **Backend WebSocket Handler** (`src/weather/weather.gateway.ts`)
   - Receives `getWeather` event from frontend
   - Generates random temperature data (25-30°C)
   - Stores data point in Redis TimeSeries
   - Returns current weather data to client

3. **Redis TimeSeries Storage** (`src/weather/weather.service.ts`)
   - Uses `TS.ADD` command to store temperature with timestamp
   - Auto-creates time series with 24-hour retention policy
   - Handles duplicate timestamps with `ON_DUPLICATE LAST`
   - Adds labels for querying: `city` and `metric=temperature`

4. **Data Retrieval**
   - Uses `TS.RANGE` command to query by time range
   - Returns all data points within specified period
   - Frontend renders data using Recharts line chart

### Redis TimeSeries Commands Used

```redis
# Create time series (auto-created on first add)
TS.CREATE weather:ts:singapore RETENTION 86400000 LABELS city singapore metric temperature

# Add data point
TS.ADD weather:ts:singapore 1762497169031 28 ON_DUPLICATE LAST

# Query range
TS.RANGE weather:ts:singapore 1762490000000 1762500000000
```

## 📁 Project Structure

```
weather-redis-time-series-datatype-demo/
├── src/                          # Backend source code
│   ├── weather/
│   │   ├── weather.controller.ts # REST API endpoints
│   │   ├── weather.gateway.ts    # WebSocket handler
│   │   ├── weather.service.ts    # Redis TimeSeries logic
│   │   └── weather.module.ts     # Module configuration
│   ├── redis/
│   │   ├── redis.module.ts       # Redis client setup
│   │   └── redis.constants.ts    # Constants
│   ├── app.module.ts             # Root module
│   └── main.ts                   # Application entry point
│
├── frontend/                     # Frontend source code
│   ├── src/
│   │   ├── components/
│   │   │   └── WeatherChart.tsx  # Chart component
│   │   ├── lib/
│   │   │   ├── api.ts            # REST API calls
│   │   │   ├── socket.ts         # WebSocket client
│   │   │   └── types.ts          # TypeScript types
│   │   ├── App.tsx               # Main application
│   │   ├── main.tsx              # Entry point
│   │   └── styles.css            # Styles
│   └── package.json
│
├── .env                          # Environment variables
├── package.json                  # Backend dependencies
├── tsconfig.json                 # TypeScript configuration
├── nest-cli.json                 # NestJS CLI config
└── README.md                     # This file
```

## 🔑 Key Implementation Details

### Polling Frequency

**Location:** `frontend/src/App.tsx:47`

```javascript
timerRef.current = setTimeout(poll, 60000) // 60 seconds = 1 minute
```

To change polling frequency, modify the timeout value:
- `30000` = 30 seconds
- `60000` = 1 minute (current)
- `300000` = 5 minutes

### Data Retention

**Location:** `src/weather/weather.service.ts:69`

```javascript
'RETENTION', '86400000' // 24 hours in milliseconds
```

Redis automatically removes data points older than 24 hours.

### Temperature Generation

**Location:** `src/weather/weather.service.ts:40`

```javascript
tempC: 25 + Math.round(Math.random() * 5) // Random 25-30°C
```

Replace with real weather API integration as needed.

## 🚀 Production Deployment

### Backend

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm run start:prod
```

### Frontend

1. Build for production:
```bash
cd frontend
npm run build
```

2. Deploy `frontend/dist` folder to your hosting service (Vercel, Netlify, etc.)

3. Update `VITE_API_BASE` environment variable to production backend URL

## Enhancement
1. Hook the application up to a proper weather API to retrieve real time

## 📝 License

This project is for demonstration purposes.


