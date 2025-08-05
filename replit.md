# Quest Journal

## Overview
Quest Journal is a comprehensive 3-tier AI-powered life guidance system designed to transform personal reflection into an immersive, goal-oriented experience. The platform consists of three interconnected modules: (1) Entry Management (digital mind mapping through journaling), (2) Vision Planning (AI-guided goal structuring and milestone tracking), and (3) Mastermind (high-level strategic guidance). The system features a persistent AI agent that learns across all modules to provide increasingly personalized guidance. All three modules will be fully developed before launch to ensure a cohesive, integrated user experience.

## User Preferences
Preferred communication style: Simple, everyday language.
User name: Alex

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter

### Backend
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js
- **API Pattern**: RESTful API
- **Database ORM**: Drizzle ORM
- **AI Integration**: OpenAI API

### Database
- **Type**: PostgreSQL
- **ORM**: Drizzle ORM
- **Schema**: `journal_entries` (content, AI reflection, mood, tags, pinning, folder_id) and `folders` (user_id, name, color).

### Core Features

#### Module 1: Entry Management (Journaling)
- **Free Tier**: Unlimited entries, one monthly AI insight
- **Premium Tier ($4.99/month)**: Weekly AI insights, individual entry-based insights
- **Features**: Rich text editing, mood selection, custom tags, folders, search/filtering, pinning, bulk operations

#### Module 2: Vision Planning ($8.99/month) - Admin Beta Testing Phase
- **Includes**: Full journal access + vision planning features
- **Features**: AI-guided goal structuring, milestone tracking, vision board creation, progress visualization, goal interconnection mapping
- **Status**: Complete system developed, currently restricted to admin-only access for testing
- **Access**: Available through admin panel and header dropdown for admin users

#### Module 3: Mastermind ($14.99/month)
- **Includes**: Everything from Vision Planning + high-level strategic guidance
- **Features**: AI mastermind council, strategic course correction, life path analysis, cross-module intelligence synthesis

#### Shared Features Across All Tiers
- **Persistent AI Agent**: Learns across all modules for personalized guidance
- **Multi-Agent System**: Specialized AI for journal analysis, vision architecture, progress tracking, strategic advisory
- **Cross-Module Intelligence**: Connects journal insights to goals to strategic guidance
- **UI/UX**: Responsive design, dark/light mode, custom adventure-themed icons
- **PWA**: Progressive Web App capabilities for offline use
- **Gamification**: XP progression, achievement badges, daily quests, streak tracking

### Architectural Decisions
- **Modularity**: Separation of concerns between frontend, backend, and database layers.
- **Type Safety**: Extensive use of TypeScript across the stack.
- **Performance**: Vite for fast builds, TanStack Query for efficient data fetching and caching.
- **Scalability**: PostgreSQL with Drizzle ORM for robust data management, designed to support future growth.
- **Security**: Robust authentication (username/password, JWT), session management, data isolation for user-specific content, input validation (Zod schemas).
- **Extensibility**: API design allows for easy addition of new features and AI models.
- **User Experience**: Focus on intuitive UI, engaging gamification, and personalized AI interactions.
- **Styling**: Utility-first CSS with Tailwind and pre-built components (shadcn/ui, Radix UI) for consistent and accessible design.

## External Dependencies

- **Database**: PostgreSQL (via `@neondatabase/serverless` for serverless environments)
- **ORM**: `drizzle-orm`
- **AI**: `OpenAI` API
- **Payments**: `Stripe`
- **Frontend State Management**: `@tanstack/react-query`
- **Routing**: `wouter`
- **UI Components**: `@radix-ui/*`, `shadcn/ui`
- **Styling**: `tailwindcss`, `lucide-react` (icons)
- **Development Tools**: `TypeScript`, `Vite`, `tsx`, `esbuild`
- **External Workflow Integration**: `n8n` (for Vision Architect)