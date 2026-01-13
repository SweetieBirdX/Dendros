1. Directed Acyclic Graph (DAG) Architecture
Dendros does not treat data as a linear list but as a complex network of Nodes and Edges.

Nodes: These represent the content units (questions, information screens, or logic gates).

Edges: These are the conditional bridges that connect nodes based on user input.

The Acyclic Rule: The system must strictly prevent "Logic Loops" where a path leads back to itself, causing an infinite cycle. This is the "Golden Rule" of your data integrity.

2. The "Graph Walker" Engine
This is the cerebral cortex of your application—the logic that dictates movement.

Instead of loading a whole form, the engine calculates the Next State in real-time based on the user's current node and their specific response.

It ensures that the user is only ever aware of their current "scene," making the experience immersive and preventing data leakage from other paths.

3. Hybrid Identity & Zero-Friction Access
As a winner of high-level hackathons, you know that user drop-off is the enemy of any application.

The Architect (Admin): Requires full Firebase Authentication and JWT-protected routes via Next.js Middleware to manage and own their "Dendros".

The Voyager (Participant): To maximize conversion, participants must have Zero-Friction Access. They enter via unique IDs without needing to log in, ensuring the highest possible response rate.

4. Visual Orchestration (No-Code Editor)
Manual JSON management is prone to human error; Dendros solves this through visual design.

Using React Flow, you turn the abstract logic of a form into a tangible map.

This allows the Admin to "see" the narrative and identify dead-ends or logical gaps before the form goes live.

5. Narrative Path Analytics
Data in Dendros is not just a spreadsheet; it is a Map of Human Choices.

Inspired by the Detroit: Become Human flowcharts, this concept involves overlaying aggregate data back onto the visual graph.

The Admin can see exactly what percentage of users took each branch, making it easy to identify the most (and least) traveled paths.