# 🚀 FlowGen — AI-Powered Learning Orchestration Platform

> Transform any topic into a structured, multi-module learning experience — powered by asynchronous AI workflows and priority-driven execution.

🌐 **Live Demo:**  
https://flow-gen-eight.vercel.app/home

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
- Triggered when user submits a course prompt
- Worker generates structured outline via GROQ LLM
- Saves Course, Module, and Lesson documents to MongoDB
- Dispatches Module 1 lessons to `LOW_PRIORITY_LESSON_QUEUE` after saving
- Fully asynchronous — API returns immediately after enqueue

## 📗 HIGH_PRIORITY_LESSON_QUEUE
- Triggered when a user actively navigates to a lesson
- Processes immediately with `priority: 1`
- Skips generation if lesson is already `GENERATED` or `GENERATING` (idempotent)
- Marks lesson `GENERATING` before AI call, then saves on completion
- Failure marks lesson `FAILED` — no silent data loss

## 📘 LOW_PRIORITY_LESSON_QUEUE
- Triggered automatically after course creation for background pre-generation
- Rate-limited to 1 job per 10 seconds to stay within GROQ API limits
- `priority: 5`, `attempts: 3`, exponential backoff on failure
- Pre-generates Module 1 lessons so they are ready when user arrives
- Remaining modules generate on-demand via `HIGH_PRIORITY_LESSON_QUEUE`

---

# 🧩 System Design Principles

### 🟢 Asynchronous First
AI tasks never block the request-response lifecycle.

### 🟢 Priority-Based Scheduling
Active users always get faster responses.


### 🟢 Cost Optimization
Lessons generate only when accessed.



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

# 📈 Scalability Strategy

- Redis queues absorb traffic spikes
- Workers scale independently
- Priority scheduling protects user experience

### Future Enhancements
- Multi-tenant queues
- Rate limiting
- Tier-based prioritization

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
GROQ_API_KEY=your_api_key
YOUTUBE_API_KEY=your_api_key
```

---

## Running Locally

### Backend
```bash
# 1. Start API server
npm install
npm run dev
```

```bash
# 2. Start workers (each in a separate terminal)
node workers/course.worker.js
node workers/low.priority.lesson.worker.js
node workers/high.priority.lesson.worker.js
```

### Frontend
```bash
npm install
npm run dev
```

---



# 👨‍💻 Author

**Rushi Danidhariya**
