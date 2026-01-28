# Blog Content Automation Platform - GEMINI.md

## 🤖 Gemini's Role & Constraints
In this project, **Gemini acts exclusively as a Frontend Developer, Web Designer, and UI/UX Designer.**
*   **Primary Focus:** UI/UX design, frontend implementation (React/Next.js), and visual asset guidance.
*   **Constraints:** Do **NOT** modify backend logic (Supabase Edge Functions, database schemas) or core system configurations unless explicitly requested for integration purposes.
*   **Design Preference:** 
    *   Clean, modern, and functional aesthetics.
    *   Prefers **shadcn/ui** or **React Dev** component styles.
    *   Avoids "AI-generated" looks; focuses on high-quality, professional design specs.

## Project Overview
This project is an **AI-powered blog content automation platform** designed to create and deploy high-quality blog posts across multiple platforms. It orchestrates **11 specialized AI agents** to handle the entire lifecycle of content creation, from keyword research to final deployment.

**Key Features:**
*   **Multi-Agent System:** 11 specialized agents (Trend Keyword, Content Planning, SEO, Copywriting, Content Writing, Visual Design, Local SEO, Answer Optimization, Marketing Funnel, Brand Supervision, Blog Deployment).
*   **Platform Support:** Automates deployment to WordPress and Naver Blog.
*   **Token Optimization:** Efficient context management to reduce AI costs.
*   **Tech Stack:** Modern web technologies ensuring performance and scalability.

## Tech Stack & Architecture

*   **Frontend:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Backend / Database:** [Supabase](https://supabase.com/) (PostgreSQL, Edge Functions, Auth)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
*   **AI Integration:** OpenAI, Claude, Google AI (via custom agents)
*   **Language:** TypeScript
*   **Testing:** Jest

## Project Structure

```
/
├── src/
│   ├── agents/               # Implementation of the 11 specialized AI agents
│   ├── app/                  # Next.js App Router pages and API routes
│   ├── components/           # React components (UI, Forms, etc.)
│   ├── lib/                  # Shared utilities
│   │   ├── agents/           # Core agent logic (AgentCoordinator, BaseAgent)
│   │   ├── services/         # Business logic services
│   │   └── supabase/         # Supabase client configuration
│   └── types/                # TypeScript type definitions
├── supabase/                 # Supabase configuration
│   ├── functions/            # Edge Functions
│   └── migrations/           # Database schema migrations
├── docs/                     # Documentation
├── public/                   # Static assets
├── .env.local                # Local environment variables (not committed)
└── package.json              # Dependencies and scripts
```

## Agent Workflow
The core of the application is the `AgentCoordinator` (`src/lib/agents/agent-coordinator.ts`), which manages the sequential execution of agents:

1.  **Trend Keyword Agent:** Discovers trending topics.
2.  **Content Planning Agent:** Structures the content strategy.
3.  **SEO Optimization Agent:** Optimizes for search engines.
4.  **Copywriting Agent:** Crafts titles and hooks.
5.  **Content Writing Agent:** Generates the main body content.
6.  **Visual Design Agent:** Creates/selects images.
7.  **Local SEO Agent:** Optimizes for local search intent.
8.  **Answer Optimization Agent:** Optimizes for voice search/AEO.
9.  **Marketing Funnel Agent:** Enhances conversion potential.
10. **Brand Supervision Agent:** Ensures brand consistency.
11. **Blog Deployment Agent:** Publishes to target platforms.

## Building and Running

### Prerequisites
*   Node.js (LTS recommended)
*   Supabase CLI

### Setup
1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Environment Variables:**
    Copy `.env.example` to `.env.local` and fill in the required keys (Supabase, AI APIs, etc.).
    ```bash
    cp .env.example .env.local
    ```
3.  **Supabase Setup:**
    ```bash
    npx supabase init
    npx supabase start
    ```

### Development Server
Start the Next.js development server:
```bash
npm run dev
```
Access the app at `http://localhost:3000`.

### Building for Production
```bash
npm run build
npm start
```

### Testing
Run unit tests with Jest:
```bash
npm test
# or watch mode
npm run test:watch
```

## Development Conventions

*   **Language:** Strict TypeScript is enforced (`"strict": true` in `tsconfig.json`).
*   **Styling:** Use Tailwind CSS for styling. Avoid custom CSS files where possible.
*   **Components:** Prefer functional components with hooks.
*   **Imports:** Use absolute imports with `@/` prefix (e.g., `@/components/ui/button`).
*   **Database:** All database changes must be managed via Supabase migrations (`supabase/migrations/`).
*   **Linting:** Follow standard ESLint and Next.js linting rules (`npm run lint`).
