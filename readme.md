# Dendros

**Build Interactive Decision Trees in Minutes**

Dendros is a modern, graph-based workflow engine for creating dynamic decision trees, surveys, and branching narratives. Build intelligent, adaptive user experiences without writing code.

## Live Demo

**[dendros.vercel.app](https://dendros.vercel.app)**

Try it out without installation!

[![GitHub](https://img.shields.io/badge/GitHub-SweetieBirdX%2FDendros-purple)](https://github.com/SweetieBirdX/Dendros)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React Flow](https://img.shields.io/badge/React%20Flow-Powered-blue)](https://reactflow.dev/)

---

## Features

### Visual Editor
- **Drag-and-drop interface** for building complex decision trees
- **Real-time preview** of your workflows
- **Undo/Redo support** for safe editing
- **Multiple node types**: Root, Question, Info, End

### Smart Logic
- **Conditional branching** based on user responses
- **Dynamic workflows** that adapt to user input
- **Multiple choice paths** for complex decision making
- **Graph validation** to prevent errors

### Visual Analytics
- **Traffic visualization** with edge thickness based on volume
- **Percentage and count labels** on each path
- **User journey tracking** to see popular routes
- **Graph view / List view** toggle for different perspectives

### Modern Stack
- **Next.js 14** with App Router for optimal performance
- **React Flow** for professional node-based editing
- **Firebase** for authentication and real-time data
- **Tailwind CSS** for beautiful, responsive design
- **TypeScript** for type safety

---

## Use Cases

- **Surveys & Forms**: Create dynamic surveys that adapt based on responses
- **Decision Guides**: Help users make informed decisions with interactive guides
- **Workflows**: Design and visualize complex business processes
- **Interactive Stories**: Build branching narratives and choose-your-own-adventure experiences

---

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SweetieBirdX/Dendros.git
cd Dendros
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## How It Works

### 1. Create Your Dendros
- Sign up and access the dashboard
- Click "Create New Dendros"
- Give it a title and description

### 2. Build Your Flow
- Use the visual editor to add nodes
- Connect nodes with edges
- Configure questions and logic
- Preview in real-time

### 3. Publish & Share
- Click "Publish" when ready
- Share the public link with users
- Track responses in real-time

### 4. Analyze Results
- View analytics in Graph or List mode
- See traffic patterns and popular paths
- Export data for further analysis

---

## Architecture

### Data Model
Dendros uses a **Directed Acyclic Graph (DAG)** structure:

```typescript
{
  dendrosId: string;
  ownerId: string;
  config: {
    title: string;
    description: string;
    isPublished: boolean;
  };
  graph: {
    nodes: Node[];  // Questions, Info, Logic, Endings
    edges: Edge[];  // Connections with conditions
  };
}
```

### Node Types
- **Root**: Starting point of the flow
- **Question**: Multiple choice, checkbox, and text input questions
- **Info**: Information displays
- **End**: Terminal nodes

### Security
- **Creator Access**: Firebase Authentication required
- **Ownership Validation**: Server-side checks ensure only owners can edit
- **Public Access**: Anyone can access published Dendros via link
- **Unpublish Feature**: Pause submissions while preserving data

---

## Screenshots

### Landing Page
Modern, professional landing page with features showcase

### Visual Editor
Drag-and-drop interface with real-time preview

### Analytics Dashboard
Traffic visualization with edge thickness and percentages


---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Eyüp Efe**

- Twitter: [@eyupefekrkc](https://x.com/eyupefekrkc)
- GitHub: [@SweetieBirdX](https://github.com/SweetieBirdX)

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [React Flow](https://reactflow.dev/)
- Hosted on [Firebase](https://firebase.google.com/)

---

<div align="center">
  <strong>Built with ❤️ by Eyüp Efe also known as SweetieBirdX </strong>
  <br />
  <sub>© 2026 Dendros. All rights reserved.</sub>
</div>