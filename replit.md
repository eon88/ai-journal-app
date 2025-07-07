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
- `GET /api/reflect/weekly?weekStart=YYYY-MM-DD` - Generate weekly reflection for specified week
- `GET /api/reflect/monthly?month=MonthName&year=YYYY` - Generate monthly reflection with goal suggestions
- `GET /api/stats` - Fetch user statistics (streak, total entries, XP points)
- `GET /api/growth-metrics` - Comprehensive growth analytics and trends
- `GET /api/insights` - Fetch saved insights from personal vault
- `POST /api/insights` - Save new insight to personal vault
- `DELETE /api/insights/:id` - Remove insight from vault
- `POST /api/life-path-analysis` - Analyze 16 questionnaire responses and generate comprehensive Ikigai-based life path insights

### Core Features
1. **Journal Entry Creation**: Users can write journal entries with rich text formatting
2. **Mood Selection**: Choose from 10 different mood options with emoji indicators (excited, happy, content, neutral, thoughtful, sad, anxious, frustrated, calm, energetic)
3. **Custom Tags**: Add and manage custom tags for categorizing journal entries
4. **AI-Powered Reflections**: Integration with OpenAI GPT-4o to generate insights, growth patterns, and reflection questions
5. **Weekly Reflections**: AI analysis of week's entries providing direction, momentum, emerging goals, and growth patterns
6. **Monthly Reflections**: Comprehensive AI insights including life direction, emerging goals, and concrete achievement suggestions
7. **Advanced Leveling System**: XP progression with titles from "Reflective Wanderer" to "Inner Architect" 
8. **Achievement Badges**: Unlock badges like "First Steps", "Week Warrior", "Consistency King", and "Streak Legend"
9. **Daily Challenges**: AI-generated micro-quests with prompts for fear exploration, gratitude, growth spotting, and future visioning
10. **Streak & Scoreboard System**: Gamification with current streak, total entries, longest streak, and XP points
11. **Growth Map Dashboard**: Visual analytics showing mood trends, writing frequency, and common themes
12. **Insights Vault**: Personal library for saving and organizing meaningful insights, lessons, and goals
13. **Merlin AI Assistant**: Narrative-based AI mentor providing daily prophecies, reflection guidance, and goal alignment with mystical, fantasy-themed interface, personalized with user names
14. **Life Path Discovery Questionnaire**: Comprehensive 16-question onboarding flow that guides users through self-discovery using the FRAME → DESTINATION → MAP → COMPASS methodology, with AI-powered Ikigai analysis providing personalized life path insights before journaling begins
15. **Entry History**: View and browse previous journal entries with mood and tag filtering
16. **Responsive Design**: Mobile-first design with adaptive layouts that work across all devices

## Data Flow

1. **Entry Creation**: User writes journal entry → Validation with Zod schemas → Storage in PostgreSQL
2. **AI Analysis**: Journal content → OpenAI API → AI reflection generated → Stored as JSONB
3. **Data Retrieval**: Frontend queries → Express API → Drizzle ORM → PostgreSQL → JSON response
4. **Real-time Updates**: TanStack Query handles caching and automatic refetching

### Subscription Features
16. **Free Beta Accounts**: Users start with full access during beta period with all premium features unlocked at no cost
17. **Light Subscription Plans**: Monthly ($2.99) and yearly ($29.99 with 2 months free) affordable plans with Stripe integration
18. **Stripe Payment Processing**: Secure subscription management with automatic billing, webhooks, and checkout sessions
19. **Account Type Management**: Dynamic account status tracking with beta access flags and subscription states
20. **Pricing Page**: Comprehensive pricing showcase with plan comparisons, features, and upgrade flows
21. **Subscription Dashboard**: User profile integration showing current plan, features, and upgrade options

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **OpenAI**: AI-powered journal analysis and insights
- **Stripe**: Payment processing and subscription management
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
- `STRIPE_SECRET_KEY`: Stripe secret key for payment processing
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key for frontend integration
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret for secure event handling (optional)
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
- July 06, 2025. Enhanced periodic reflections - Added directional insights, emerging goals, and achievement suggestions
- July 06, 2025. Gamification system - Added streak tracking, XP points, growth dashboard, and insights vault for complete life path companion experience
- July 06, 2025. Advanced gamification - Implemented leveling system, achievement badges, daily challenges, and enhanced user progression based on Alex's friend's suggestions
- July 06, 2025. Merlin AI Assistant - Added narrative-based AI mentor "Merlin the Wise" with fantasy-themed UI, daily prophecies, reflection guidance, and goal alignment consultation using GPT-4o
- July 07, 2025. Forum Community - Created comprehensive community forum with categories, post management, and full admin controls for moderation and content creation
- July 07, 2025. Terminology Update - Changed "mystical AI companion" to "AI guide" for clearer, more accessible language
- July 06, 2025. User Name System - Implemented dynamic user names with persistent storage, welcome modal for new users, and personalized AI interactions replacing hardcoded "Alex"
- July 06, 2025. Enhanced Merlin Practicality - Updated Merlin AI assistant to provide concrete, actionable advice while maintaining mystical personality. Now gives specific techniques, time frames, and practical steps instead of purely metaphorical responses
- July 06, 2025. Dark Mode Accessibility Fix - Fixed visibility issues in mood selection dropdown and tag input fields for dark mode, ensuring proper text contrast and readability across all interactive elements
- July 06, 2025. Life Path Discovery System - Implemented comprehensive 16-question onboarding questionnaire with FRAME→DESTINATION→MAP→COMPASS methodology, AI-powered Ikigai analysis, and beautiful progress-tracked UI that guides users through self-discovery before journaling begins
- July 07, 2025. Footer Pages Implementation - Created comprehensive About Us, Contact Us, and User Profile pages with full content, navigation, and functionality
- July 07, 2025. Security Enhancement - Removed journal export functionality from user profile and FAQ sections to prevent future security concerns and data management issues
- July 07, 2025. Subscription System Implementation - Added Stripe integration with free beta accounts and paid premium plans. Created subscription management, pricing page, account type system, and upgrade flows with comprehensive database schema for user accounts and billing
- July 07, 2025. Proper Subscription Flow - Implemented real payment processing simulation with free vs premium account distinction. Users start with limited free features and must upgrade to access premium features like unlimited entries, advanced AI insights, and goals management
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
User name: Alex
```