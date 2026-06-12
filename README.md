# 🚀 FlowGen — AI-Powered Learning Orchestration Platform with RAG

> Transform any topic into a structured, multi-module learning experience — powered by asynchronous AI workflows, priority-driven execution, and Retrieval-Augmented Generation (RAG) for semantic course reuse.


---

## � Table of Contents
- [Project Overview & RAG Implementation](#-project-overview--rag-implementation)
- [Problem Statement](#-problem-statement)
- [FlowGen Solution](#-flowgen-solution)
- [Key Features](#-key-features)
- [High-Level Workflow](#-high-level-workflow)
- [Queue Architecture](#-queue-architecture)
- [System Design Principles](#-system-design-principles)
- [Technology Stack](#-technology-stack)
- [Scalability Strategy](#-scalability-strategy)
- [Local Development Setup](#-local-development-setup)
- [Troubleshooting](#-troubleshooting)
- [Contribution Guidelines](#-contribution-guidelines)
- [Author](#-author)


---

## 🧠 Project Overview & RAG Implementation

### What is FlowGen?
FlowGen is an AI-powered learning platform that converts natural language prompts into structured, multi-module, multi-lesson courses.

### Retrieval-Augmented Generation (RAG) Integration
FlowGen uses RAG to **reduce redundant AI computation and lower API costs**:
1. **Embedding Generation**: When a user submits a prompt, FlowGen first extracts a structured learning intent and generates a vector embedding with Google Gemini Embedding API (`gemini-embedding-001`).
2. **Semantic Similarity Search**: Uses MongoDB Atlas Vector Search to compare the new query embedding with existing course embeddings, looking for matches above a 90% similarity threshold.
3. **Conditional Generation**: If a similar course exists (≥90% similarity), FlowGen returns the existing course instantly; if not, it generates a brand-new course outline and content.

### RAG Use Cases & Technical Benefits
- **Cost Reduction**: Avoids paying for redundant AI generation of similar courses
- **Faster Response Time**: Existing courses are returned immediately without AI computation
- **Improved Consistency**: Reusing vetted, high-quality courses ensures consistent learning outcomes


---

## 🎯 Problem Statement
Generating high-quality AI-powered educational content is:
- Computationally expensive
- Latency-heavy
- Difficult to scale synchronously
- Cost-sensitive under traffic spikes

Traditional request-response systems block until AI completes — leading to:
- Poor user experience
- Timeout risks
- High infrastructure costs


---

## 💡 FlowGen Solution
FlowGen introduces a **Queue-First Orchestration Model**:
1. User submits a topic prompt.
2. API enqueues a job and returns immediately (no blocking!).
3. Background workers process AI generation tasks asynchronously.
4. Generated content is persisted in MongoDB.
5. Frontend polls for status and displays content when ready.

### Request Handling Architecture
FlowGen uses **Redis-backed BullMQ queues** to decouple user requests from AI computation:
- **Queue Mechanism**: Incoming course/lesson requests are stored in Redis queues instead of being processed synchronously
- **Worker Processing**: Background workers pick up queued jobs in order of priority
- **Scalability**: Workers can be scaled independently of the API; Redis queues absorb traffic spikes
- **Resilience**: Failed jobs are retried with exponential backoff and moved to Dead Letter Queues (DLQ) after 3 failed attempts


---

## ✨ Key Features
- 🧠 Prompt-based course generation
- 📚 Structured modules & lessons
- 💤 Lazy lesson generation (cost optimized)
- 🚀 Priority-based lesson promotion
- 🔄 Asynchronous processing via BullMQ
- 🔐 Secure authentication with custom JWT
- 🗃 Persistent storage using MongoDB
- 🔍 Semantic similarity search with MongoDB Atlas Vector Search (RAG)
- ⚡ Circuit breaker for worker resilience
- 📦 Dead Letter Queue (DLQ) for failure recovery


---

## 🏗 High-Level Workflow
1. **Course Creation & RAG Check**:
   - User submits topic
   - Extract learning intent & generate embedding
   - Perform vector similarity search
   - If match: Return existing course; else, enqueue course generation
2. **Lazy Lesson Scheduling**:
   - Lessons are generated on-demand only when a user clicks them
3. **Lesson Generation**:
   - Lesson added to queue on user request
   - Worker processes lesson generation in background
4. **UI Update**:
   - Frontend polls lesson status
   - Displays content when marked `GENERATED`


---

## 🔄 Queue Architecture

### Text-Based Architecture Flowchart
```
┌─────────────────┐
│  Client (React) │───────────────────────────────────┐
└────────┬────────┘                                   │
         │ 1. Submit topic/lesson request             │
         ▼                                           │
┌──────────────────────────────┐                      │
│      Express API Server      │                      │
│ - JWT Authentication         │                      │
│ - Queue Enqueue (BullMQ)     │                      │
└────────┬─────────────────────┘                      │
         │ 2. Return job ID immediately               │
         │ (no blocking!)                            │
         ▼                                           │
┌───────────────────────────────────────┐            │
│      Redis (BullMQ Queues)            │            │
│  - LESSON_GENERATION_QUEUE            │            │
│  - LESSON_GENERATION_DLQ              │            │
└────────┬──────────────────────────────┘            │
         │ 3. Worker picks up job                    │
         ▼                                           │
┌─────────────────────────────────────────────┐     │
│  Lesson Generation Worker (Node.js)         │     │
│  - Circuit Breaker (5 failures to trigger)  │     │
│  - Exponential Backoff (3 attempts)         │     │
│  - AI Generation (GROQ API)                 │     │
│  - YouTube Integration (YouTube Data API)   │     │
└────────┬────────────────────────────────────┘     │
         │ 4. Save to MongoDB                        │
         ▼                                           │
┌─────────────────────────────────────────┐         │
│         MongoDB                         │         │
│ - Course, Module, Lesson Documents      │         │
│ - Vector Index for Similarity Search    │         │
└────────┬────────────────────────────────┘         │
         │ 5. Frontend polls for status             │
         ▼                                           │
┌─────────────────┐                                   │
│  Client (React) │◄──────────────────────────────────┘
└─────────────────┘
```

### � LESSON_GENERATION_QUEUE
- **Trigger**: User clicks a lesson that isn't yet generated
- **Job ID Deduplication**: Uses lesson ID as job key to prevent duplicate generation
- **Retries**: 3 attempts with exponential backoff (5 second initial delay)
- **Priority**: `priority: 10` (high priority for user-triggered requests)
- **Idempotent**: Skips generation if lesson is already `GENERATED` or `GENERATING`

### 📦 LESSON_GENERATION_DLQ (Dead Letter Queue)
- **Trigger**: Lesson generation fails after all 3 attempts
- **Use Case**: Stores failed jobs for manual inspection and reprocessing
- **Endpoints**:
  - `GET /queue/stats`: View queue metrics (waiting, active, completed, failed, DLQ count)
  - `POST /queue/dlq/:jobId/reprocess`: Reprocess a failed job from DLQ
  - `DELETE /queue/`: Clear all jobs from queue


---

## 🧩 System Design Principles
### 🟢 Asynchronous First
AI tasks never block the request-response lifecycle.

### 🟢 Priority-Based Scheduling
User-triggered lessons are always high priority.

### 🟢 Cost Optimization
Lessons generate only when accessed; RAG reuses existing courses to cut redundant AI costs.

### 🟢 Resilience First
Circuit breakers, retries, and dead letter queues minimize downtime and data loss.


---

## 🛠 Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend | React, React Router |
| Authentication | Custom JWT (bcryptjs for password hashing) |
| Backend | Node.js, Express.js |
| Queue System | BullMQ (Redis-based) |
| Database | MongoDB + Mongoose (with Atlas Vector Search) |
| AI/LLM | GROQ API (content generation), Google Gemini API (embeddings) |
| Video Integration | YouTube Data API v3 |
| Infrastructure | Redis (Upstash), MongoDB Atlas, Vercel, Render, Docker Compose |


---

## 📈 Scalability Strategy
- **Redis queues absorb traffic spikes** — no request overload on API servers
- **Workers scale independently** — add more worker instances to increase throughput
- **Priority scheduling protects user experience** — user-triggered tasks get processed first
- **Vector search optimizes cost** — reuses existing content instead of regenerating

### Future Enhancements
- Multi-tenant queues
- Rate limiting
- Tier-based prioritization
- WebSockets for real-time updates instead of polling


---

## 🧪 Local Development Setup

### Prerequisites
- Node.js 20+ (matches Docker image)
- Docker Desktop (optional, for local Redis/Mongo and containerized backend)
- MongoDB Atlas **or** the MongoDB service from Docker Compose
- Upstash Redis **or** the Redis service from Docker Compose
- GROQ API key
- Google Gemini API key (for embeddings)
- YouTube Data API key

---

### Environment Variables
Copy `backend/.env.example` to `backend/.env` and fill in secrets:
```env
PORT=3001
MONGODB_URI=mongodb+srv://...   # MongoDB Atlas, or local URI from docker-compose.env.example
REDIS_URL=redis://localhost:6379   # local Docker Redis; use rediss://... for Upstash (production)
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_data_api_key
START_WORKER=true   # Set to "false" if you don't want to start worker with server
```

Redis TLS is chosen automatically: `rediss://` enables TLS (Upstash/production); `redis://` disables TLS (local Docker).

---

### Docker (Local Development)
From the repository root:
1. Copy `docker-compose.env.example` to `.env` in the **repo root** (Compose reads it for API keys passed into the backend container).
2. Start Redis, MongoDB, and the backend with hot reload:
   ```bash
   docker compose up --build
   ```
3. The API listens on `http://localhost:3001`. Run the React app on the host for fast refresh:
   ```bash
   cd frontend
   npm install
   set REACT_APP_API_URL=http://localhost:3001
   npm start
   ```
   (On macOS/Linux use `export REACT_APP_API_URL=http://localhost:3001`.)

To run only Redis and MongoDB (Node.js on host):
```bash
docker compose up -d redis mongo
```
Then set `REDIS_URL=redis://localhost:6379` and a matching `MONGODB_URI` in `backend/.env`.

---

### Running Locally (Without Docker for API)
#### Backend
```bash
cd backend
npm install
npm run dev
```
Workers are started from `server.js` together with the API; you don't need separate worker terminals unless debugging.

#### Frontend
```bash
cd frontend
npm install
npm start
```


---

## 🔧 Troubleshooting

### Common Issues & Resolutions
1. **`Connection refused` for Redis/MongoDB**:
   - Verify Docker containers are running: `docker compose ps`
   - Check `REDIS_URL`/`MONGODB_URI` in `backend/.env`

2. **AI generation errors**:
   - Verify API keys in `backend/.env`
   - Check worker logs in the terminal

3. **Lesson not generating**:
   - Use `GET /queue/stats` to check job status
   - Inspect DLQ with `GET /queue/stats` and reprocess with `POST /queue/dlq/:jobId/reprocess`

4. **Frontend can't reach backend**:
   - Verify `REACT_APP_API_URL` is correctly set to `http://localhost:3001` in the frontend terminal
   - Check CORS configuration in `backend/server.js`


---

## 🤝 Contribution Guidelines
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow existing code conventions
- Use descriptive variable/function names
- Add comments for complex logic
- Test your changes before opening a PR


---

## 👨‍💻 Author
**Rushi Danidhariya**
