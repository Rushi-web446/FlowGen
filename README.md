# 🚀 FlowGen — AI-Powered Learning Orchestration Platform

> Transform any topic into a structured, multi-module learning experience — powered by asynchronous AI workflows and priority-driven execution.

🌐 **Live Demo:**  
https://flowgen-ten.vercel.app

---

# 📐 Project Structure & System Architecture



<p align="center">
  <img src="./FlowGen%20Screen.jpeg" alt="FlowGen system diagram" width="800"/>
</p>



FlowGen is built on an **event-driven, asynchronous architecture** that decouples user interaction from AI computation.

The system leverages:

- Background workers
- Redis-backed job queues
- Priority-based execution
- Lazy content generation
- Fault-tolerant processing

This ensures:

- ⚡ Fast API responses  
- 📈 Horizontal scalability  
- 💰 Cost-optimized AI usage  
- 🔒 Isolation of failures  

---

# 🎯 Problem Statement

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

# 💡 FlowGen Solution

FlowGen introduces a **Queue-First Orchestration Model**:

1. User submits a topic prompt.
2. API immediately enqueues a job.
3. Workers process AI generation in the background.
4. Results are persisted in MongoDB.
5. UI fetches lesson status asynchronously.
6. User-triggered lessons are promoted to high priority.

### Result:
User-facing APIs remain responsive even under heavy AI workloads.

---

# ✨ Key Features

- 🧠 Prompt-based course generation  
- 📚 Structured modules & lessons  
- 💤 Lazy lesson generation (cost optimized)  
- 🚀 Priority-based lesson promotion  
- 🔄 Asynchronous processing via BullMQ  
- 🔐 Secure authentication with Auth0  
- 🗃 Persistent storage using MongoDB  
- 🧩 Idempotent lesson generation  
- 🛡 Fault-isolated worker execution  
- 📈 Horizontally scalable architecture  

---

# 🏗 High-Level Workflow

## 1️⃣ Course Creation
- User submits topic
- Job added to `COURSE_QUEUE`
- Worker generates structured outline
- Course stored in database

## 2️⃣ Lazy Lesson Scheduling
- Lessons scheduled at **low priority**
- Generated gradually in background

## 3️⃣ Active Lesson Promotion
- User clicks lesson
- Job promoted to **high priority**
- Worker processes immediately

## 4️⃣ UI Update
- Frontend polls lesson status
- Displays content when `GENERATED`

---

# 🔄 Queue Architecture

## 📦 COURSE_QUEUE
- Generates structured course outline
- Fully asynchronous
- Non-blocking API design

## 📘 LESSON_QUEUE
- Generates lesson content
- Supports priority-based execution
  - High → User-triggered
  - Low → Background lazy generation
- Uses deterministic job IDs to prevent duplication

---

# 🧩 System Design Principles

### 🟢 Asynchronous First
AI tasks never block the request-response lifecycle.

### 🟢 Priority-Based Scheduling
Active users always get faster responses.

### 🟢 Horizontal Scalability
Scale by adding more workers — no API changes required.

### 🟢 Cost Optimization
Lessons generate only when accessed.

### 🟢 Fault Isolation
Worker or AI failures never crash the API layer.

### 🟢 Idempotency
Duplicate job submissions do not corrupt data.

---

# 🛠 Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | React, React Router |
| Authentication | Auth0 React SDK |
| Backend | Node.js, Express.js |
| Queue System | BullMQ (Redis-based) |
| Database | MongoDB + Mongoose |
| Infrastructure | Redis (Upstash), MongoDB Atlas, Vercel, Render |

---

# 💾 Data Model Overview

## Course
- Title  
- Description  
- Creator (Auth0 user ID)  
- Modules  

## Module
- Title  
- Ordered Lessons  
- Metadata  

## Lesson
- Title  
- Content blocks  
- Status:
  - `PENDING`
  - `GENERATING`
  - `GENERATED`

---

# 🛡 Reliability & Failure Handling

- Worker crashes do NOT lose jobs (Redis persistence)
- Automatic job retries
- Safe failure marking
- AI failures isolated to worker layer
- Graceful degradation strategy
- No duplicate lesson generation

---

# 📈 Scalability Strategy

- Redis queues absorb traffic spikes
- Workers scale independently
- Queue depth monitoring supported
- Priority scheduling protects user experience

### Future Enhancements
- Multi-tenant queues
- Rate limiting
- Tier-based prioritization
- Distributed worker clusters
- Streaming lesson generation

---

# 🧪 Local Development Setup

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Upstash Redis instance
- Auth0 application

---

## Environment Variables

Create `.env` in backend directory:

```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
REDIS_URL=rediss://default:password@host:6379
AUTH0_ISSUER=https://your-auth0-domain/
AUTH0_AUDIENCE=your-api-identifier
OPENAI_API_KEY=your_api_key
YOUTUBE_API_KEY=your_api_key
```

---

## Running Locally

### Backend
```bash
npm install
npm run dev
```

### Frontend
```bash
npm install
npm run dev
```

---

# 🧠 Why This Project Stands Out

FlowGen demonstrates:

- Distributed system design principles
- Queue-based asynchronous architecture
- Priority-aware workload scheduling
- Production-grade fault tolerance
- Cost-efficient AI orchestration

This is not just an AI wrapper —  
it is a **learning orchestration engine designed for scale.**

---

# 👨‍💻 Author

**Rushi Danidhariya**
