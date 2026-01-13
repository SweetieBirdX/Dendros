Phase 1: The Secure Foundation (Week 1)
Goal: Establish the boundary between the "Creator" and the "Participant."

Project Initialization: Next.js 14 (App Router), Tailwind CSS, and Firebase SDK setup.

Authentication: Implement Firebase Auth with Email/Password.

The Middleware Guard: Create a middleware.ts that:

Intercepts requests to /form/[id]/admin.

Verifies the user's JWT.

Checks Firestore to ensure the uid matches the ownerId of the form.

Database Seeding: Manually create the first "Dendros" document in Firestore to test the connection.

Phase 2: The Logic Engine & Data Schema (The "Brain")
Goal: Define how a "path" is walked. This is where most developers fail.

The Schema Definition: Finalize the JSON structure for nodes (questions) and edges (logic jumps).

The "Graph Walker" Function: Write a headless TypeScript function that:

Input: current_node_id, user_answer.

Output: next_node_id.

Consultant Note: This function must be pure. Do not tie it to the UI yet.

Persistence Layer: CRUD operations in Firestore for saving/loading these complex graph objects.

Phase 3: The Dendros Editor (The Admin Experience)
Goal: Stop writing JSON by hand. Start drawing it.

React Flow Integration: Embed the canvas where the admin can drag and drop nodes.

Custom Node Components: Create specific UI for "Question Nodes," "Logic Splitters," and "End Points."

The Sync Engine: Every change on the canvas must update the Firestore nodes and edges arrays in real-time (or via a "Save" button).

Validation Logic: Implement a "Check for Loops" feature. If a user connects Node A to Node B, and Node B back to Node A, the editor must throw an error. Infinite loops kill UX.

Phase 4: The Public Renderer (The User Experience)
Goal: One question at a time. High immersion.

Dynamic Routing: Build app/f/[id]/page.tsx for public access.

The Stepper UI: A component that only shows the active node.

Transition Logic: When a user clicks an option, trigger an animation, call the "Graph Walker," and update the view to the next node.

Submission Logic: When the "End Node" is reached, save the entire path (e.g., ["n1", "n4", "n7"]) to a submissions collection.

Phase 5: The "Detroit" Analytics (The Masterpiece)
Goal: Visualize the aggregate data back on the tree.

Data Aggregation: A background function that calculates how many people passed through each edge.

Visual Overlays: Go back to the React Flow view but for "Analytics Mode."

Thicker lines for more traveled paths.

Percentage labels on each edge (e.g., "65% chose this path").

Exporting Results: Allow the admin to export the raw data for further analysis.

⚠️ Strategic Audit (The Mirror)
Priority 1 (High): Do not waste time on a "Landing Page." Your landing page is your dashboard.

Priority 2 (Medium): Use Zustand. Managing a branching tree in local React state will become a nightmare within 48 hours.

Priority 3 (Low): Dark mode/Themes. Leave this for the very end. If the logic doesn't work, no one cares if it's dark or light.