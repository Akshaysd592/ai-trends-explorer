# 🚀 AI Trend Explorer

Discover and explore trending AI tools, agents, and ML projects from GitHub and Hugging Face — aggregated, normalized, and ranked in one place.

> **What's trending in AI right now, and why does it matter?**

---

## ✨ What It Does

AI Trend Explorer aggregates trending AI projects from multiple developer platforms and presents them through a unified API:

- **GitHub** — trending AI repositories with stars, forks, languages, and topics
- **Hugging Face** — trending AI models and ML projects with likes, downloads, and pipeline tags

Results are normalized into a common `Trend` model, deduplicated, and returned with per-source status tracking.

### Example API Response

```json
{
  "success": true,
  "data": [
    {
      "id": "365739812",
      "title": "tldraw/tldraw",
      "description": "Build infinite canvas apps in React with the tldraw SDK.",
      "source": "github",
      "url": "https://github.com/tldraw/tldraw",
      "language": "TypeScript",
      "stars": 49664,
      "forks": 3446,
      "score": 49664,
      "topics": ["canvas", "collaboration", "design", "diagram", "drawing", "infinite", "multiplayer", "react", "sdk", "sketch", "sync", "whiteboard"],
      "createdAt": "2021-05-09T11:48:37Z",
      "updatedAt": "2026-08-08T10:24:34Z"
    }
  ],
  "sources": {
    "github": { "status": "ok" },
    "huggingface": { "status": "ok" }
  },
  "pagination": { "page": 1, "limit": 10 },
  "timestamp": "2026-08-08T10:25:15.787Z"
}
```

---

## 🏗️ Architecture

A monorepo built with [Nx](https://nx.dev) and [pnpm](https://pnpm.io):

```
ai-trend-explorer/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api-gateway/      # NestJS API gateway
├── packages/
│   ├── config/           # Environment configuration
│   ├── logger/           # Structured logging
│   ├── shared-types/     # Canonical Trend model & interfaces
│   └── shared-utils/     # Shared utilities
```

### Data Flow

```
GitHub API ──┐
             │
HuggingFace ─┤
             ▼
   Trend Provider Registry
             │
             ▼
      Trend Aggregation
             │
             ▼
        API Gateway
             │
             ▼
         Next.js UI
```

Each data source implements a common `TrendProvider` interface, ensuring consistent querying and response normalization across all sources.

---

## 🚀 API

### Get Trends

```
GET /trends
```

| Parameter  | Type   | Default                  | Description                          |
| ---------- | ------ | ------------------------ | ------------------------------------ |
| `page`     | number | `1`                      | Page number for pagination           |
| `limit`    | number | `20`                     | Results per page (1–100)             |
| `topic`    | string | `artificial-intelligence`| Search topic                         |
| `language` | string | _(none)_                 | Filter by programming language       |
| `sort`     | string | `stars`                  | Sort by `stars` or `updated`         |

```bash
curl "http://localhost:3001/api/trends?page=1&limit=10&topic=artificial-intelligence&sort=stars"
```

### Get Trend by ID

```
GET /trends/:id
```

Fetches a single trend by its ID from the database.

```bash
curl "http://localhost:3001/api/trends/365739812"
```

### Health Check

```
GET /health
```

---

## 🛠️ Local Development

### Prerequisites

- Node.js 22+
- pnpm
- Docker (for PostgreSQL, Kafka — future phases)
- Redis (via Docker or local install)

### Setup

```bash
# Install dependencies
pnpm install

# Configure environment
# Create a .env file with your GitHub and Hugging Face API tokens
# See .env for reference

# Start the API gateway
cd apps/api-gateway
pnpm start:dev
```

The API will be available at `http://localhost:3001`.

### Frontend

```bash
# Start the Next.js frontend (runs on port 3000)
npx nx dev @ai-trend-explorer/web --port=3000
```

The frontend will be available at `http://localhost:3000`. It proxies API requests to the API gateway at `http://localhost:3001`.

### Testing

```bash
# Run all tests
pnpm test

# Run tests for the API gateway
cd apps/api-gateway
npx jest --config jest.config.cts
```

### AI Analysis Feature

The AI Analysis feature uses Kafka for asynchronous processing:

1. User visits a trend detail page
2. Frontend calls `GET /api/trends/:id/analysis`
3. If no analysis exists, API publishes a message to Kafka and returns `pending`
4. `AiAnalysisConsumer` processes the message asynchronously
5. Consumer calls Inference API to generate analysis
6. Result is saved to PostgreSQL and cached in Redis
7. Frontend polls every 5 seconds and displays the completed analysis

**API Endpoint:**
```
GET /api/trends/:id/analysis
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trendId": "123",
    "status": "completed",
    "summary": "This project is a...",
    "keyPoints": ["Point 1", "Point 2"],
    "category": "Dev Tools",
    "sentiment": "positive",
    "tags": ["ai", "tools"],
    "generatedAt": "2026-08-08T10:25:15.787Z"
  },
  "timestamp": "2026-08-08T10:25:15.787Z"
}
```

---

## �️ Roadmap

| Phase | Feature              | Status     |
| ----- | -------------------- | ---------- |
| 1     | Foundation           | ✅ Complete |
| 2     | GitHub Integration   | ✅ Complete |
| 3     | Provider Architecture| ✅ Complete |
| 4     | Hugging Face         | ✅ Complete |
| 5     | Product Hunt         | ⏳ Deferred |
| 6     | PostgreSQL           | ✅ Complete |
| 7     | Redis Caching        | ✅ Complete |
| 8     | AI Analysis          | ✅ Complete |
| 9     | Kafka                | ✅ Complete |
| 10    | Microservices        | ⏳ Planned  |
| 11    | Frontend UI          | ✅ Complete |
| 12    | Production Deployment| ⏳ Planned  |

---

## 📄 License

Akshay Dhobale
All rights are reserved.
