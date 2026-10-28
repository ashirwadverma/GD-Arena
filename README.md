<<<<<<< HEAD
# GD Arena 🎙️

> **Voice-First AI Group Discussion Practice Room with Evidence-Backed Feedback**  
> **Event:** LLOYD Hackathon · **Problem Statement 2**  
> **Status:** v1.0 Production-Ready Build

---

## 1. What It Does (Problem Statement 2)

Students preparing for campus placement drives rarely get high-quality practice for Group Discussions (GDs). Organizing 6 to 8 peers and a fair faculty moderator is logistically difficult, and post-GD feedback is often generic ("be more confident").

**GD Arena** solves this by providing an instant, realistic spoken group discussion practice room:
- **Spoken Voice Interaction:** Speak through your microphone with live speech-to-text captions.
- **Autonomous Multi-AI Panel:** 3 to 5 distinct AI participants with tailored personas (e.g., Arjun the Dominator, Meera the Analyst, Kabir the Quiet One, Sana the Drifter) led by Dr. Nair (Moderator).
- **Natural Turn-Taking & Instant Barge-In:** AI participants bid for turns, reply to each other, pause naturally, and stop speaking immediately when interrupted (<150ms).
- **Strict Evidence-Backed Feedback:** Every feedback point in the post-session report quotes the literal words you spoke, with a server-side verification guard to ensure 0% hallucinated quotes.

---

## 2. Done / Left / Plan

### ✅ Completed in this Build:
- **Core Orchestrator & Floor State Machine:** Single-floor token, dynamic bidding matrix, 2-AI turn cap, and dead-air filler engine.
- **Voice Tier A (Zero Cost & Ultra Low Latency):** Web Speech API (`SpeechRecognition`) STT with interim stream + browser `SpeechSynthesis` with persona-specific pitch/rate/voice mappings.
- **Instant Barge-In Stop:** Immediate cancellation of in-flight audio and abort of LLM streams on student speech detection.
- **Instant Layer 1 Deterministic Metrics:** Talk share %, speaking pace (WPM), time to first entry, filler word counter (`um, basically, like`), and peer citations count.
- **Layer 2 AI Assessment & Evidence Validation:** 6-dimension rubric evaluation with exact transcript quote substring matching.
- **Extra Should-Haves (S1-S4):**
  - **S1:** "What you could have said" missed openings review.
  - **S2:** Silent real-time coaching nudges (e.g., alert on prolonged silence).
  - **S3:** Adjustable AI patience slider (600ms – 2500ms).
  - **S4:** IndexedDB session persistence & past performance review.
- **Debug Engine Inspector Overlay:** Live state machine, candidate bidding matrix, and latency monitors (toggle with `` ` `` key or button).
- **Typing Mode & Mic Fallback:** Seamless text chat fallback for unsupported browsers or noisy environments.

### ⏳ Future Enhancements:
- Multi-user human multiplayer rooms over WebSockets/LiveKit.
- Cloud TTS (ElevenLabs/Cartesia) voice switching.
- Multilingual / Hinglish mixed GD support.

---

## 3. Architecture & Key Decisions

```
+------------------------- Browser (Next.js App) ------------------------+
|  UI (React 19, Tailwind CSS, Dark Theme)                               |
|   |                                                                    |
|  Orchestrator (Floor state machine + Bidding engine + Phase/Timer)     |
|   |            |                      |                                |
|  STT Module   VAD/Audio-Level       TTS Module                         |
|  (Web Speech  (WebAudio Analyser)   (Browser SpeechSynthesis           |
|   API, text                          with Pitch & Rate tuning)         |
|   fallback)                                                            |
|   |                                                                    |
|  Session Store (Zustand) + Local Persistence (IndexedDB)               |
+-------------------|----------------------------------------------------+
                    | HTTPS + SSE (Streaming)
+-------------------v----------------------------------------------------+
| Next.js Stateless Route Handlers                                       |
|  POST /api/turn    -> Persona Prompt -> Stream -> Sentence SSE Chunks  |
|  POST /api/report  -> Rubric Prompt -> JSON -> Evidence Validation     |
|  POST /api/moderate-> Custom Topic Safety Filter                       |
+------------------------------------------------------------------------+
```

### Why Run Orchestration in the Browser?
- **Zero WebSocket Overhead:** A single-student practice room does not require central server synchronization.
- **Instant Barge-In:** Canceling speech on the client takes <150ms without waiting for a server roundtrip.
- **Zero Crash Resilience:** Even if external LLM APIs experience rate limits, the client and server seamlessly fall back to canned persona dialogues.

---

## 4. What We Added ("Make It Yours" Features)

1. **Evidence Validation & Anti-Hallucination Guard:** The server cross-checks every LLM quote against normalized transcript segments before rendering feedback. Clicking any quote chip scrolls to and highlights that exact line in the transcript.
2. **"What You Could Have Said" Replay (S1):** Highlights moments where you could have intervened with a strong counter-argument or synthesis.
3. **Silent Real-Time Nudges (S2):** Subtle coaching alerts prompt shy candidates when they have remained silent for too long.
4. **Customizable AI Patience (S3):** Adjust how long AI panelists wait before taking the floor (from fast-paced competitive GDs to relaxed practice).
5. **Live Engine Debugger:** Press `` ` `` anytime to inspect the state machine, bidding scores, and latency in real time.

---

## 5. Tools & AI Used

- **LLM Models:** Google Gemini Flash (`gemini-1.5-flash`), Groq (`llama-3.1-8b-instant`), and OpenAI.
- **Speech Engine:** Web Speech API (`SpeechRecognition` / `SpeechSynthesis`) + WebAudio API.
- **Frontend & Backend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Zod, IndexedDB (`idb`).
- **AI Transparency:** Prominent badges and headers disclose that all panel members and the moderator are simulated AI agents.

---

## 6. How to Run Locally

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 10+

### Step 1: Clone and Install
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add `GEMINI_API_KEY` for custom dynamic LLM generation. If left empty, the application uses built-in persona response generators.)*

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in Google Chrome or Microsoft Edge.

### Step 4: Run the Simulation Harness
```bash
npm run simulate
```

---

## 7. Who It Is For

- **Final-Year Campus Placement Candidates:** Students preparing for Tier-1 and Tier-2 software, consulting, and finance placement rounds.
- **Shy First-Time Candidates:** Students needing a low-stakes, supportive environment with adjustable patience settings to build confidence.
=======
# GD-Arena
>>>>>>> 86cf85e012ada1a33bdb3197a15905f8d042cead
