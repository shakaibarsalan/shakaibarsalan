<h1 align="center">Shakaib Arsalan</h1>

<p align="center">
  <b>I ship systems that stay up.</b><br>
  Software engineer · Lahore, Pakistan
</p>

<p align="center">
  <a href="https://shakaib.vercel.app/"><img src="https://img.shields.io/badge/portfolio-shakaib.vercel.app-0f766e?style=flat-square&labelColor=0b1220" alt="Portfolio"></a>
  <a href="https://www.linkedin.com/in/shakaib-arsalan/"><img src="https://img.shields.io/badge/linkedin-shakaib--arsalan-0b1220?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="mailto:shakaibarsalan6553@gmail.com"><img src="https://img.shields.io/badge/email-shakaibarsalan6553-0b1220?style=flat-square&logo=gmail&logoColor=white" alt="Email"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/open%20to-Software%20Engineer%20%C2%B7%20Full--Stack%20roles-16a34a?style=flat-square&labelColor=0b1220" alt="Open to roles">
</p>

---

### Running in production

Not demos. Every one of these has users, a URL, and something that breaks at 3am if I got it wrong.

| | What it is | The hard part | Stack |
|:--|:--|:--|:--|
| 🟢 **[Attendify](https://attendify.pro/)** | Attendance that can't be faked | ArcFace embeddings over pgvector HNSW, liveness detection, rotating QR, GPS geofencing. 50+ endpoints, 7 containers. | `TypeScript` `React` `FastAPI` `pgvector` `Docker` |
| 🟢 **[Invento](https://inventobase.com/)** | Multi-tenant inventory SaaS | Tenant-scoped isolation where one leaked query is a breach. 6 roles × 18 protected sections, 25 models across 11 Django apps. | `Django` `PostgreSQL` `Supabase` `Vercel` |
| 🟢 **[Sandstorms AI](https://sandstorms.ai/)** | Voice agents that answer the phone | STT → LLM → TTS with voice cloning, fast enough that the caller doesn't hear the seams. | `Python` `STT/TTS` `LLM` |
| 🟢 **[Govava](https://www.govava.com/)** | RAG over millions of listings | Retrieval and re-ranking where the index is too big to brute force. | `AWS Bedrock` `Python` `RAG` |
| 🟢 **[Vanta LMS](https://lms-frontend-one-jet.vercel.app/)** | Academic workflow platform | Generated quizzes, automated grading, analytics teachers actually read. | `Django` `FastAPI` `PostgreSQL` |

> **Attendify** started as a final year project and kept running after the grade was in. That's the part I care about.

---

### How I work

```
schema ──▶ API ──▶ deploy ──▶ the part nobody demos
                                  │
                   ┌──────────────┼──────────────┐
                   ▼              ▼              ▼
              who can see    what happens    what it costs
               which row      when it's      to run this
                             slow at 3am     next month
```

Most of what I build is multi-tenant or biometric, which means the interesting
problems aren't features. They're isolation, latency budgets, and what the
system does on its worst day.

---

### Tools

**Languages** &nbsp; Python · TypeScript · JavaScript · Java · SQL · C++

**Backend** &nbsp; Django · FastAPI · Express · REST · JWT/RBAC

**Frontend** &nbsp; React · Hotwire/Turbo · Streamlit

**Data** &nbsp; PostgreSQL · pgvector · Supabase

**Infra** &nbsp; AWS · Docker · Kubernetes · Vercel · GitHub Actions

---

### Also on here

Coursework I haven't hidden, because the C++ from first year is part of the line
that leads to the pgvector work — plus **[audio-transcription-tool](https://github.com/shakaibarsalan/audio-transcription-tool)**,
local Whisper transcription with NLP analysis, built for CS438 and still getting
fixes whenever someone finds a rough edge.

---

### Background

**BS Computer Science** — University of Management & Technology<br>
CGPA **3.73** / 4.00 · Rector's Award ×2 (SGPA 4.00)<br>
Huawei HCCDA-AI Cloud Advanced · TensorFlow Fundamentals

<br>

<p align="center">
  <a href="https://github.com/shakaibarsalan?tab=repositories"><b>All repositories →</b></a>
</p>
