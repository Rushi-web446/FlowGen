# FlowGen 🚀

> **Live Demo:** [https://flow-767zwwbg2-rushis-projects-f751d98e.vercel.app/home](https://flow-767zwwbg2-rushis-projects-f751d98e.vercel.app/home)

![System Architecture](./architecture_diagram.jpg)

**FlowGen** is a scalable, AI-powered learning orchestration platform that converts a user’s intent into a structured, multi-module learning experience. It is designed with an **asynchronous, priority-driven architecture** to handle expensive AI workloads efficiently while maintaining a responsive user experience.

---

## 🏗️ Problem Overview

Generating high-quality educational content using large language models is computationally expensive and time-consuming. Traditional synchronous systems struggle under load, leading to poor user experience, high latency, and increased operational costs.

**FlowGen** addresses this challenge by decoupling user requests from AI computation using **background job queues** and **priority-based execution**. This ensures that the system remains responsive, cost-efficient, and horizontally scalable.

## ✨ Key Features

- **Prompt-based course generation**
- **Structured course outlines** with modules and lessons
- **Lazy lesson generation** to minimize unnecessary AI usage
- **Priority-based lesson generation** for active users
- **Asynchronous processing** using Redis-backed queues
- **Fault-tolerant background workers**
- **Persistent storage** of courses and lessons
- **Secure authentication** using Auth0
- **Scalable backend architecture** suitable for production workloads

## 📐 High-Level Architecture

FlowGen follows an event-driven, asynchronous architecture:

1.  **Users submit a topic prompt** via the frontend.
2.  The backend immediately enqueues a **course outline generation job**.
3.  Course outlines are generated asynchronously and stored in the database.
4.  Lessons are scheduled for **background generation with low priority**.
5.  When a user opens a specific lesson, it is promoted to **high priority**.
6.  Workers process jobs independently and persist results.
7.  The frontend polls or fetches lesson status until content is ready.

*This design ensures that user-facing APIs are never blocked by AI computation.*

## 🧩 System Design Principles

-   **Asynchronous First**: All AI-related workloads are handled outside the request-response lifecycle. User requests enqueue jobs and return immediately.
-   **Priority-Based Execution**: User-triggered lesson requests are always prioritized over background generation tasks, ensuring minimal wait time for active users.
-   **Horizontal Scalability**: The system scales by adding more workers. No changes are required to API logic or data models.
-   **Cost Optimization**: Lessons are generated only when needed. If a lesson is never opened, it may never be generated, reducing AI token usage.
-   **Fault Isolation**: Failures in AI services or workers do not affect user-facing APIs. Jobs are retried or marked failed safely.

## 🛠️ Technology Stack

| Component | Tech |
| :--- | :--- |
| **Frontend** | React, React Router, Auth0 React SDK |
| **Backend** | Node.js, Express.js |
| **Queues** | BullMQ (Redis-based) |
| **Database** | MongoDB with Mongoose |
| **Infrastructure** | Redis (Upstash), MongoDB Atlas, Vercel, Render |

## 🔄 Queue Architecture

### `COURSE_QUEUE`
-   Handles course outline generation
-   Triggered when a user submits a topic
-   Asynchronous and non-blocking

### `LESSON_QUEUE`
-   Handles lesson generation
-   Supports priority-based execution
    -   **High priority** for user-clicked lessons
    -   **Low priority** for background lazy generation
-   Jobs are deduplicated using deterministic job IDs to prevent duplicate lesson generation.

## 💾 Data Model Overview

-   **Course**: Title, Description, Creator (Auth0 user ID), Modules
-   **Module**: Metadata and timestamps, Ordered lessons
-   **Lesson**: Title, Content blocks, Generation status (PENDING, GENERATING, GENERATED)

## 🛡️ Failure Handling and Reliability

-   **Worker crashes** do not lose jobs; Redis persists job state.
-   **Failed jobs** can be retried automatically.
-   **AI API failures** are isolated to workers.
-   The system degrades gracefully instead of failing globally.
-   **Idempotent lesson generation** prevents data corruption.

## 🚀 Scalability Considerations

-   Redis queues absorb traffic spikes.
-   Workers can be scaled independently.
-   Priority-based scheduling protects user experience.
-   *Future extensions:* Rate limiting, Multi-tenant queues, Tier-based prioritization, Distributed worker clusters.

## 💻 Local Development Setup

### Prerequisites
-   Node.js 18+
-   MongoDB Atlas account
-   Upstash Redis instance
-   Auth0 application

### Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
REDIS_URL=rediss://default:password@host:6379
AUTH0_ISSUER=https://your-auth0-domain/
AUTH0_AUDIENCE=your-api-identifier
OPENAI_API_KEY=your_api_key
YOUTUBE_API_KEY=your_api_key
```

### Running the App
**Backend:**
```bash
npm install
npm run dev
```

**Frontend:**
```bash
npm install
npm run dev
```

## 👨‍💻 Author

**Rushi Danidhariya**
*Backend-focused software developer with a strong interest in scalable system design and distributed architectures.*