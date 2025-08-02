# Quest Journal

## Overview
Quest Journal is an AI-powered full-stack web application designed to help users create journal entries, receive AI-generated reflections, and track personal growth. It aims to be a comprehensive life path companion, offering gamified elements like XP progression, achievement badges, and daily quests, alongside advanced organizational features for journal entries. The project's vision is to provide a unique, engaging, and insightful journaling experience that fosters self-discovery and personal development, leveraging AI to provide deep, personalized insights.

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
- **Journaling**: Entry creation with rich text, mood selection, custom tags.
- **AI Reflections**: OpenAI GPT-4o integration for insights, weekly/monthly reflections, and life path analysis (Ikigai-based).
- **Gamification**: XP progression system (levels, titles), achievement badges, daily quests, streak tracking, scoreboard.
- **Organization**: Pinning entries, custom folders with color-coding, advanced search/filtering, bulk operations, download entries.
- **Insights Vault**: Personal library for saving and organizing insights.
- **Merlin AI Assistant**: Narrative-based AI mentor providing guidance and prophecies.
- **UI/UX**: Responsive design, dark/light mode, custom adventure-themed icons, personalized user experience.
- **Subscription Management**: Free beta accounts, paid subscription plans (monthly/yearly) integrated with Stripe.
- **PWA**: Progressive Web App capabilities for offline use and home screen installation.

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