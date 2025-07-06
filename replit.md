# AI Bullet Journal - Replit.md

## Overview

This is a full-stack web application for an AI-powered bullet journal system. The application allows users to create journal entries and receive AI-generated insights and reflections about their entries. Built with a modern tech stack featuring React frontend, Express backend, and PostgreSQL database with Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Pattern**: RESTful API design
- **Database ORM**: Drizzle ORM for type-safe database operations
- **AI Integration**: OpenAI API for generating journal reflections

### Database Architecture
- **Database**: PostgreSQL (configured via DATABASE_URL)
- **ORM**: Drizzle ORM with migrations support
- **Schema**: Single table design for journal entries with JSONB for AI reflections
- **Storage**: DatabaseStorage class replaces MemStorage for persistent data

## Key Components

### Database Schema
The application uses a simple but effective schema:
- **journal_entries** table with fields:
  - `id`: Serial primary key
  - `content`: Text content of the journal entry
  - `ai_reflection`: JSONB field storing AI-generated insights
  - `mood`: Optional text field for user's mood
  - `tags`: Array of text tags for categorization
  - `created_at`: Timestamp with default to current time

### API Endpoints
- `GET /api/entries` - Fetch recent journal entries with optional limit
- `GET /api/entries/:id` - Fetch specific journal entry by ID
- `POST /api/entries` - Create new journal entry
- `POST /api/analyze` - Analyze journal entry and generate AI reflection

### Core Features
1. **Journal Entry Creation**: Users can write journal entries with rich text formatting
2. **Mood Selection**: Choose from 10 different mood options with emoji indicators (excited, happy, content, neutral, thoughtful, sad, anxious, frustrated, calm, energetic)
3. **Custom Tags**: Add and manage custom tags for categorizing journal entries
4. **AI-Powered Reflections**: Integration with OpenAI GPT-4o to generate insights, growth patterns, and reflection questions
5. **Entry History**: View and browse previous journal entries with mood and tag filtering
6. **Responsive Design**: Mobile-first design with adaptive layouts that work across all devices

## Data Flow

1. **Entry Creation**: User writes journal entry → Validation with Zod schemas → Storage in PostgreSQL
2. **AI Analysis**: Journal content → OpenAI API → AI reflection generated → Stored as JSONB
3. **Data Retrieval**: Frontend queries → Express API → Drizzle ORM → PostgreSQL → JSON response
4. **Real-time Updates**: TanStack Query handles caching and automatic refetching

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **OpenAI**: AI-powered journal analysis and insights
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library
- **lucide-react**: Icon library

### Development Tools
- **TypeScript**: Static typing for both frontend and backend
- **Vite**: Fast development server and build tool
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast bundling for production builds

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app to static files in `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `OPENAI_API_KEY` or `OPENAI_KEY`: OpenAI API key for AI features
- `NODE_ENV`: Environment setting (development/production)

### Scripts
- `dev`: Development server with hot reload
- `build`: Production build for both frontend and backend
- `start`: Production server startup
- `db:push`: Apply database schema changes

## Changelog

```
Changelog:
- July 06, 2025. Initial setup - Created AI-powered journaling app with React frontend and Express backend
- July 06, 2025. Added PostgreSQL database - Replaced in-memory storage with persistent PostgreSQL database using Drizzle ORM
- July 06, 2025. Added mood and tags functionality - Users can now select moods and add custom tags to journal entries
- July 06, 2025. Production ready - Resolved frontend caching issues and completed all core features
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```