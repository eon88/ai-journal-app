# Life Path Companion - Replit.md

## Overview

This is a full-stack web application for an AI-powered life path companion system. The application allows users to create journal entries and receive AI-generated insights and reflections about their entries. Built with a modern tech stack featuring React frontend, Express backend, and PostgreSQL database with Drizzle ORM.

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
The application uses an enhanced schema supporting advanced organization:
- **journal_entries** table with fields:
  - `id`: Serial primary key
  - `content`: Text content of the journal entry
  - `ai_reflection`: JSONB field storing AI-generated insights
  - `mood`: Optional text field for user's mood
  - `tags`: Array of text tags for categorization
  - `is_pinned`: Boolean flag for pinned entries (appear at top)
  - `folder_id`: Foreign key reference to folders table for organization
  - `created_at`: Timestamp with default to current time
- **folders** table with fields:
  - `id`: Serial primary key
  - `user_id`: Foreign key reference to users table
  - `name`: Folder name (max 100 characters)
  - `color`: Hex color code for visual identification
  - `created_at`: Timestamp with default to current time

### API Endpoints
- `GET /api/entries` - Fetch recent journal entries with pinned entries prioritized
- `GET /api/entries/:id` - Fetch specific journal entry by ID
- `POST /api/entries` - Create new journal entry with optional pinning and folder assignment
- `GET /api/entries/search` - Search and filter entries by content, tags, mood, date range, and folder
- `PATCH /api/entries/:id/pin` - Pin or unpin journal entries
- `PATCH /api/entries/:id/folder` - Move entry to specific folder or remove from folder
- `POST /api/entries/download` - Download selected entries as formatted text file
- `GET /api/folders` - Fetch user's custom folders
- `POST /api/folders` - Create new folder with name and color
- `PATCH /api/folders/:id` - Update folder name and color
- `DELETE /api/folders/:id` - Delete folder and move entries to "No folder"
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
16. **Advanced Entry Management**: Pin important entries, organize with custom folders, search by multiple criteria, and download as text files
17. **Entry Organization System**: Three-dot menu (⋯) on each entry with options to pin, move to folder, or download individual entries
18. **Sidebar Navigation**: Quick access to "All Entries", "Pinned Entries", and custom folders with color-coded organization
19. **Bulk Operations**: Select multiple entries for batch downloading and management
20. **Responsive Design**: Mobile-first design with adaptive layouts that work across all devices

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
- July 06, 2025. Initial setup - Created AI-powered life path companion app with React frontend and Express backend
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
- July 07, 2025. Mobile UI Optimization - Removed floating Merlin wizard from mobile devices to improve mobile user experience. Floating Merlin avatar now only appears on desktop screens (md:block), providing cleaner mobile interface without overlapping UI elements
- July 07, 2025. Username/Password Authentication System - Replaced Replit OAuth with traditional username/password registration system. Added secure password hashing with bcrypt, session management, and beautiful registration/login pages. Users can now create accounts with username, email, and password, with all journal data being user-specific and protected
- July 08, 2025. Application Rebranding - Changed application name from "AI Bullet Journal" to "Life Path Companion" throughout the entire codebase. Updated header, about page, email service, landing page, and documentation to reflect the new name and focus on life path discovery rather than traditional bullet journaling
- July 08, 2025. Advanced Entry Management System - Implemented comprehensive entry organization with pinning functionality, custom folders with color coding, advanced search/filtering by content/tags/mood/date/folder, bulk selection and download capabilities, three-dot menus (⋯) with pin/folder/download actions, and dedicated /entries page with sidebar navigation for quick access to pinned entries and folders
- July 08, 2025. XP-Based Forum Ranking System - Created comprehensive 10-tier forum hierarchy using user's custom rank names (Wanderer → Seeker → Student → Climber → Builder → Navigator → Architect → Guardian → Sage → Legendary Oracle). Integrated XP-based rank badges into forum posts, built leaderboard page, and added rank progression visualization to encourage community engagement
- July 08, 2025. Enhanced Bullet Journal System - Updated bullet symbols to comprehensive 18-symbol system including tasks (•, ✔, →, ✖), events (○), notes (–), insights (🪶), growth (🌱), goals (🎯), direction (🧭), motivation (🔥), achievements (🏆), Merlin prompts (🧙), media (📸), pinned entries (📌), and recurring patterns (🧩). Added organized symbol selector with categorized interface for improved entry organization
- July 08, 2025. Intelligent Tag Suggestions System - Implemented autocomplete tag suggestions with 7 predefined categories (Mind & Emotion, Inner Work, Goals & Progress, Relationships, Life Design, Spiritual & Reflective, Health & Energy) containing 56 curated tags for personal development tracking. Added smart dropdown interface with category organization and duplicate prevention for enhanced journaling experience
- July 08, 2025. Daily Motivational Quotes - Added daily inspirational quote system with 78 carefully curated quotes that change every morning using date-based rotation. Quotes focus on personal growth, self-discovery, and life transformation, positioned under the daily challenge for daily inspiration during journaling sessions
- July 08, 2025. Progressive Web App (PWA) Implementation - Added full PWA functionality including web app manifest, service worker for offline capability, app icons (192x192, 512x512, Apple touch), installable home screen shortcuts, and smart install prompt. Users can now save the app to their phone's home screen for native app-like experience with offline journaling capability
- July 09, 2025. Passive Education System - Implemented three-pronged approach to teach users about XP earning and feature unlocks without overwhelming them: 1) Daily quotes mysteriously transform into XP rule hints for 4 seconds randomly, 2) Desktop Merlin whisper bubbles with mystical game rule hints appearing occasionally, 3) Comprehensive "Rules of the Game" page accessible via link under scoreboard section, creating organic discovery of gamification mechanics
- July 09, 2025. CRITICAL SECURITY FIX - Fixed major data privacy vulnerability where frontend caching was causing journal entries to mix between users. Implemented comprehensive cache clearing on login/logout/registration and reduced staleTime from Infinity to 5 minutes to prevent future data leakage issues. Backend data isolation was always correct, but frontend cache persistence was compromising user privacy
- July 09, 2025. Mobile Scoreboard Integration - Created comprehensive mobile scoreboard component that seamlessly integrates user stats and gamification data into mobile experience. Features collapsible design with compact header showing level/streak/entries, expandable detailed view with XP progress, colorful stat cards, and direct access to game rules. Added to both Home and Entries pages for consistent mobile UX, solving the issue where desktop sidebar was hidden on mobile devices
- July 09, 2025. Text Visibility Fixes - Resolved multiple text contrast issues in light mode across achievement badges, periodic reflections, and mobile scoreboard components. Updated gray text colors from light variants (text-gray-300, text-gray-400, text-gray-500) to darker variants (text-gray-800, text-gray-900) for proper readability in light mode while maintaining light colors for dark mode. Added comprehensive CSS overrides to ensure consistent text visibility across all components
- July 10, 2025. Comprehensive Text Visibility Overhaul - Implemented universal CSS override system following simple principle: dark text on light backgrounds, white text on dark backgrounds. Added comprehensive overrides for all gray text variants (.text-gray-300 through .text-gray-800) and white text variants (.text-white, .text-white/70, .text-white/80) to ensure perfect contrast in both light and dark modes across all components without case-by-case fixes
- July 10, 2025. Mobile Responsive Redesign - Completely redesigned entries page layout for mobile devices. Replaced cramped desktop sidebar with responsive design: mobile dropdown filter for quick access, separate mobile and desktop layouts, improved text wrapping with break-words, and enhanced mobile-specific content layout to fix text overflow issues and provide full-width content area on mobile screens
- July 10, 2025. Admin Dashboard for Marketing Campaigns - Created comprehensive admin dashboard at /admin/dashboard with complete user database access for targeted promotions. Features detailed user analytics including engagement scoring (High/Medium/Low/Inactive), hierarchy level tracking, contact information access, CSV export functionality, and advanced filtering capabilities. Access restricted exclusively to owner account (eon) for privacy and security of user data during marketing campaigns
- July 10, 2025. Forum Moderator Security System - Demoted Tommy and Noony from admin to regular user accounts with dedicated forum moderator privileges only. Created forum_moderators table and middleware system allowing trusted users to moderate forum content without access to sensitive admin features like user database or marketing dashboard. Three-tier access structure: Owner (full admin) > Forum Moderator (forum-only) > Regular User
- July 10, 2025. CRITICAL SECURITY FIX - Data Isolation - Fixed major privacy vulnerability where user goals were shared between all users due to missing user_id column in user_goals table. Added proper user isolation with foreign key references and updated all CRUD operations to filter by user ID. Removed public Level Testing feature and restricted it to owner account only (user ID 2) to prevent unauthorized level manipulation. Enhanced API security with proper user validation on all sensitive endpoints
- July 10, 2025. Adventure Icon Integration - Successfully integrated custom adventure-style icons across all major components (mobile scoreboard, daily challenges, vault page, level sidebar, growth dashboard, recent entries) creating cohesive immersive theme with hand-drawn sepia-toned aesthetic. Fixed SelectItem error in search filters by replacing empty string values with "all" option and proper value handling. Improved text visibility in search modal with explicit dark/light mode text colors
- July 10, 2025. Comprehensive Forum Management System - Built complete admin forum management interface at /admin/forum-management with tabbed sections for Categories, Posts, Users, and Moderators. Includes full CRUD operations for forum categories with color coding, post management with pin/feature/lock/delete controls, user management with moderator privilege assignment, search functionality, and proper admin-only access restrictions. Integrated into admin dashboard navigation for complete community forum control
- July 10, 2025. Merlin Whisper Frequency Update - Updated Merlin's mystical whisper bubbles from random 20% chance every 20-40 seconds to guaranteed appearance every 7 minutes for more predictable and consistent user guidance during journaling sessions
- July 10, 2025. CRITICAL SECURITY FIXES - Fixed three major data integrity and security vulnerabilities: 1) Vault cross-pollination where user insights were mixing between accounts (added proper user ID filtering), 2) Completely rebuilt streak calculation logic to fix mathematically impossible results and properly handle multiple entries per day, 3) Enhanced daily challenge validation to prevent cheating by requiring actual journal entries before completion, ensuring authentic engagement with gamification system
- July 10, 2025. CRITICAL STREAK CALCULATION OVERHAUL - Fixed major database corruption and streak calculation errors: 1) Corrected getUserStats and updateUserStats methods using wrong column (id vs userId) causing multiple stats entries per user, 2) Completely rewrote streak calculation with proper consecutive day logic using calendar date grouping, 3) Fixed user stats corruption by cleaning duplicate entries and ensuring proper user data isolation, 4) Verified streak accuracy with proper current streak (0 when no recent entry) and longest streak (3 for consecutive days July 7-9)
- July 10, 2025. THREE-STATE CHALLENGE ANTI-CHEAT SYSTEM - Implemented comprehensive challenge security to prevent XP gaming: 1) Added "accepted" status column to daily_challenges table with proper database migration, 2) Created three-state flow: Accept Challenge → View/Copy Prompt → Complete After Journaling, 3) Added acceptChallenge() storage method and /api/challenge/:id/accept endpoint, 4) Rebuilt frontend component with conditional rendering for each state, 5) Added copy-to-clipboard functionality for challenge prompts, 6) Enhanced completion validation to require actual journal entries before XP reward, preventing users from skipping straight to completion without genuine engagement
- July 10, 2025. Compass Icon Visual Enhancement - Added custom adventure-themed compass icon to visually identify today's entries across all journal entry displays (recent entries, enhanced entries list). The compass icon appears next to any entry created today, providing immediate visual recognition of current day entries with consistent styling and tooltip functionality
- July 11, 2025. Custom Tags System Implementation - Built comprehensive custom tag management system with level-based limits (5 tags for levels 1-3, 10 tags for levels 4-7, 15 tags for levels 8-10). Features include: tag creation/editing/deletion modal, button-based tag selector in journal entry form, manual tag input capability, duplicate prevention, user-specific tag isolation, and complete database integration. Replaced dropdown tag suggestions with more intuitive custom tag buttons system
- July 11, 2025. Admin XP Gifting System - Created comprehensive admin functionality to gift XP to users with backend API endpoint (/api/admin/gift-xp) for admin-only access, automatic XP addition and level-up detection, frontend interface in admin dashboard with user selection dropdown, XP amount validation, optional reason tracking, success notifications with level-up alerts, and automatic data refresh
- July 11, 2025. Leaderboard Links Integration - Added leaderboard navigation links to all scoreboard components (LevelSidebar, MobileScoreboard, StreakScoreboard) with Trophy icons linking to /forum-leaderboard page, providing consistent access to community rankings from all user stat displays
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
User name: Alex
```