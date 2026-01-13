Phase 1: The Foundation (Infrastructure)
[x] Project Init: Initialize Next.js 14 (App Router) with Tailwind CSS and TypeScript.

[x] Firebase Setup: Configure Firebase SDK (Auth and Firestore) and secure your .env.local.

[x] Authentication: Implement Email/Password Auth for the "Architect" role.

[x] Middleware Guard: Build middleware.ts to verify JWT and restrict /[id]/admin routes to the document ownerId.

[x] Global State: Setup a Zustand store to manage the graph state across the editor and renderer.

Phase 2: The Core Logic (The "Brain")
[ ] Schema Definition: Finalize the JSON structure for nodes and edges (The DAG Model).

[ ] The Graph Walker: Write a pure TypeScript function that takes current_node + input and returns the next_node.

[ ] Cycle Detection: Implement an algorithm (e.g., Depth-First Search) to prevent infinite loops in the tree.

[ ] Firestore Persistence: Write the saveDendros and fetchDendros services to handle complex graph objects.

Phase 3: The Dendros Editor (Admin Experience)
[ ] React Flow Integration: Set up the main canvas for visual orchestration.

[ ] Custom Nodes: Develop UI components for different node types: Question, Logic Gate, and End Screen.

[ ] Edge Configuration: Build a sidebar/modal to define "Conditions" for each edge (e.g., "If Answer == 'Yes'").

[ ] Auto-Save: Implement a debounced sync feature to save changes to Firestore as the admin edits the tree.

Phase 4: The Public Renderer (Participant Experience)
[ ] Dynamic Routing: Create app/f/[id]/page.tsx for zero-friction public access.

[ ] Immersive UI: Build a "Step-by-Step" renderer that only displays the active node with high focus.

[ ] History Tracking: Ensure the renderer keeps track of the user's path (The "Breadcrumb" state).

[ ] Submission Logic: Create the submissions collection in Firestore to store finalized user journeys.

Phase 5: The "Detroit" Analytics (The Final Polish)
[ ] Data Aggregator: Write a server function to calculate the frequency of each path taken by participants.

[ ] Heatmap Overlay: Visualize these frequencies on the Admin Tree using variable edge thickness or color coding.

[ ] Result Dashboard: Build a summary view showing the "Most Traveled Path" and "Common Drop-off Points".