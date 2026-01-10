# Dendros: Logic Flow & Branching Narrative Engine

**Dendros** (from the Greek for *Tree*) is a sophisticated **Graph-Based Workflow Engine** designed to transform linear data collection into dynamic, branching narratives. Inspired by the flowchart structures of *Detroit: Become Human*, Dendros allows creators to build complex "choose-your-own-adventure" logic trees where every user response dictates a unique path, merge point, or outcome.

---

## 🛠 Technical Architecture

Dendros is engineered as a **Directed Acyclic Graph (DAG)** management platform, ensuring logical consistency and preventing infinite loops in user workflows.

* **Framework:** Next.js 14 (App Router) for high-performance server-side rendering and routing.
* **Workflow UI:** `React Flow` for a professional-grade, drag-and-drop node-based editor.
* **Database & Auth:** Firebase (Firestore & Authentication) for flexible NoSQL schema management and secure identity handling.
* **Security:** Next.js `middleware.ts` for server-side JWT verification and owner-based route protection.
* **State Management:** Zustand for efficient handling of deep, nested graph states.

---

## 🏗 Data Schema: "The Dendros Graph"

Dendros moves away from traditional array-based forms, storing every interaction as a collection of **Nodes** (questions/content) and **Edges** (conditional logic jumps).

```json
{
  "dendrosId": "dndr_unique_id",
  "ownerId": "creator_firebase_uid",
  "config": {
    "title": "Ecosystem Onboarding",
    "slug": "onboarding-2026"
  },
  "graph": {
    "nodes": [
      { "id": "n1", "type": "root", "data": { "label": "Are you a Developer?" } },
      { "id": "n2", "type": "input", "data": { "label": "GitHub Profile?" } },
      { "id": "n3", "type": "end", "data": { "label": "Application Submitted!" } }
    ],
    "edges": [
      { "id": "e1-2", "source": "n1", "target": "n2", "condition": "Yes" },
      { "id": "e1-3", "source": "n1", "target": "n3", "condition": "No" }
    ]
  }
}

```

---

## 🚀 Development Roadmap

### Phase 1: The Foundation

* Firebase SDK integration & Authentication setup.
* Next.js Middleware implementation for protected `/[id]/admin` routes.
* Initial project scaffolding with Tailwind CSS.

### Phase 2: The Tree Editor (Admin UI)

* Integration of `React Flow` canvas.
* Custom node components (Question, Logic, Ending).
* Real-time persistence layer to sync graph state with Firestore.

### Phase 3: The Rendering Engine (Participant UI)

* Development of the "Graph Walker" logic to calculate the next node based on user input.
* Public-facing route (`/f/[id]`) with immersive, single-node focus.
* Automated response collection and path-history logging.

### Phase 4: Detroit-Style Analytics

* Aggregation of user paths to calculate edge-traversal percentages.
* "Heatmap" overlay on the Admin Tree View to visualize the most common user journeys.
* Data export functionality (JSON/CSV).

---

## 🛡 Security & Access Logic

* **Creator Access:** Restricted to authenticated users via email/password. Creators can only modify graphs where their `uid` matches the document's `ownerId`.
* **Participant Access:** Publicly accessible via unique Form IDs. No registration is required for participants to maximize conversion and ease of use.
* **Integrity:** Server-side validation to ensure graphs are acyclic and all edges have valid targets.

---

## 💻 Setup Instructions

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/dendros.git

```


2. **Install dependencies:**
```bash
npm install

```


3. **Environment Variables:**
Create a `.env.local` file and add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
...

```


4. **Run Development Server:**
```bash
npm run dev

```