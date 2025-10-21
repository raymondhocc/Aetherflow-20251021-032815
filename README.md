# AetherFlow: Real-time Data Ingestion & Analytics Platform

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/raymondhocc/Aetherflow-20251021-032815)

AetherFlow is a cutting-edge real-time data ingestion and pipeline management platform designed to facilitate seamless synchronization of data from diverse enterprise sources, starting with AS400 systems, into a modern lakehouse architecture. This platform is meticulously engineered to prepare and optimize data for advanced analytics, particularly for consumption by Large Language Models (LLMs) to unlock deep business insights. The application provides a visually stunning, intuitive, and highly responsive user interface that mirrors the sophistication and comprehensive functionality of leading data integration tools like GlueSync. Users can effortlessly configure data sources and destinations, design complex data pipelines with transformation logic, monitor real-time data flow metrics, and gain actionable insights into data quality and pipeline performance. The core components include a dynamic Dashboard for overall health and activity, dedicated sections for managing Data Sources, Data Destinations, and Pipelines, and a robust Monitoring suite for real-time visibility and alerting. AetherFlow prioritizes user experience, visual elegance, and robust functionality to deliver a truly exceptional data management solution.

## Key Features

*   **Real-time Data Ingestion**: Seamless synchronization from diverse enterprise sources (e.g., AS400) to modern lakehouse architectures.
*   **LLM-Ready Data**: Data is meticulously prepared and optimized for consumption by Large Language Models to unlock deep business insights.
*   **Intuitive Dashboard**: A primary landing page providing an overview of all active data pipelines, their health status, recent activities, and key performance indicators like data volume ingested and error rates, with interactive charts.
*   **Data Source Management**: Dedicated section for configuring and managing connections to various data sources, including AS400. Supports CRUD operations, connection testing, and schema viewing.
*   **Data Destination Management**: Manages the configuration of data lakehouse environments. Users can define connection details, specify target storage locations, data formats, and manage access credentials. Supports CRUD operations.
*   **Visual Pipeline Builder**: Central hub for creating, managing, and deploying data ingestion pipelines. Offers a visual builder for defining data flows, transformation rules (filtering, mapping, anonymization), and scheduling options (real-time or scheduled).
*   **Real-time Monitoring**: Provides live metrics (throughput, latency, error rates), detailed event logs, and configurable alerting mechanisms for proactive issue detection and resolution.
*   **User-Centric Design**: Visually stunning, intuitive, and highly responsive user interface with a focus on delightful interactions and flawless layouts across all device sizes.

## Technology Stack

AetherFlow is built with a modern and robust technology stack to ensure high performance, scalability, and an exceptional developer and user experience.

*   **Frontend**:
    *   **React**: A declarative, component-based JavaScript library for building user interfaces.
    *   **React Router DOM**: For declarative routing in React applications.
    *   **Zustand**: A small, fast, and scalable bear-necessities state-management solution.
    *   **Shadcn/ui**: A collection of beautifully designed UI components built with Radix UI and Tailwind CSS.
    *   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
    *   **Framer Motion**: A production-ready motion library for React.
    *   **Recharts**: A composable charting library built with React and D3.
    *   **Lucide React**: A beautiful, customizable icon library.
    *   **React Hook Form**: For flexible and extensible forms with easy-to-use validation.
    *   **Zod**: A TypeScript-first schema declaration and validation library.
    *   **Sonner**: An opinionated toast component for React.
*   **Backend**:
    *   **Hono**: A small, simple, and ultrafast web framework for the Edge.
    *   **Cloudflare Workers**: Serverless execution environment for deploying backend logic at the edge.
    *   **Durable Objects**: Cloudflare's strongly consistent storage primitive for stateful serverless applications.
*   **Language**:
    *   **TypeScript**: A strongly typed superset of JavaScript that compiles to plain JavaScript.
*   **Build Tools**:
    *   **Vite**: A fast frontend build tool.
    *   **Bun**: An all-in-one JavaScript runtime, bundler, test runner, and package manager.

## UI/UX Principles

AetherFlow adheres to the highest standards of visual excellence and user experience:

*   **Visual Hierarchy Mastery**: Stunning typography, thoughtful color psychology, and harmonious spacing rhythm.
*   **Interactive Design Excellence**: Delightful micro-interactions, smooth hover/focus/active states, and elegant transitions.
*   **Layout Architecture Excellence**: Intentional container strategies, balanced grid systems, and precise Flexbox mastery.
*   **Component Design Excellence**: Beautifully designed cards, intuitive forms, and clear navigation.
*   **Responsive Design Mastery**: Mobile-first approach with flawless layouts across all device sizes and optimized touch targets.

## Architecture Overview

The application follows a client-server architecture leveraging Cloudflare's edge capabilities:

*   **Frontend (React)**: Consumes data from the Cloudflare Worker via RESTful API calls. Manages local UI state with `zustand`.
*   **Hono Worker (API)**: Processes frontend requests, implements business logic, and interacts with the Durable Object for persistence.
*   **GlobalDurableObject (Persistent Storage)**: A single Durable Object instance used as a KV-like storage for all persistent data.
*   **Entity Management**: Data entities like Data Sources, Data Destinations, and Pipelines are managed by `IndexedEntity` wrappers, abstracting direct Durable Object interactions and ensuring atomicity and consistency.

## Getting Started

Follow these instructions to set up and run the AetherFlow project locally.

### Prerequisites

*   [Bun](https://bun.sh/docs/installation) (v1.1.0 or later)
*   [Cloudflare Account](https://dash.cloudflare.com/sign-up) (for deployment)
*   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-update/) (installed and configured for your Cloudflare account)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/aether-flow.git
    cd aether-flow
    ```
2.  **Install dependencies**:
    ```bash
    bun install
    ```
3.  **Generate Cloudflare Worker types**:
    ```bash
    bun run cf-typegen
    ```

### Development

To run the application in development mode:

```bash
bun dev
```

This will start the Vite development server for the frontend and the Hono Worker. The application will typically be accessible at `http://localhost:3000`.

### Building for Production

To build the application for production:

```bash
bun run build
```

This command will compile the frontend assets and the Cloudflare Worker script, preparing them for deployment.

### Deployment

AetherFlow is designed to be deployed on Cloudflare Workers.

1.  **Ensure you have built the project**:
    ```bash
    bun run build
    ```
2.  **Deploy to Cloudflare Workers**:
    ```bash
    bun run deploy
    ```
    Wrangler will guide you through the deployment process, including associating your Worker with a Cloudflare account and domain.

Alternatively, you can deploy directly using the Cloudflare button:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/raymondhocc/Aetherflow-20251021-032815)

## Project Structure

```
.
├── public/
├── shared/
│   ├── mock-data.ts        # Mock data for frontend development
│   └── types.ts            # Shared TypeScript interfaces for API and data entities
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/         # Application layout components
│   │   │   └── AppLayout.tsx
│   │   ├── ui/             # Shadcn/ui components (pre-installed)
│   │   ├── app-sidebar.tsx # Main application sidebar navigation
│   │   └── ThemeToggle.tsx # Theme switching component
│   ├── hooks/
│   │   ├── use-mobile.tsx  # Hook for mobile detection
│   │   └── use-theme.ts    # Hook for theme management
│   ├── lib/
│   │   ├── api-client.ts   # Utility for making API calls
│   │   └── utils.ts        # General utility functions
│   ├── pages/
│   │   ├── HomePage.tsx    # The main Dashboard page
│   │   └── DemoPage.tsx    # Boilerplate demo page (can be removed/replaced)
│   ├── App.css
│   ├── index.css           # Global CSS and Tailwind directives
│   └── main.tsx            # React application entry point and router configuration
├── worker/
│   ├── core-utils.ts       # Core Durable Object and entity management utilities (DO NOT MODIFY)
│   ├── entities.ts         # Durable Object entity definitions (e.g., User, ChatBoard)
│   ├── index.ts            # Cloudflare Worker entry point (DO NOT MODIFY)
│   └── user-routes.ts      # API routes for application-specific logic
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── wrangler.jsonc          # Cloudflare Wrangler configuration (DO NOT MODIFY)
```