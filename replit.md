# Maternal Wellness App

## Overview

This is a React-based maternal wellness application that provides comprehensive support for expecting and new mothers. The app serves as a digital village offering AI-powered chat support, daily check-ins, journaling capabilities, educational resources, and expert consultations. It's built with a modern full-stack architecture using React, Express.js, and PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.
Display preference: Show only first name in greetings and throughout the app for personalization.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom maternal wellness color palette
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API Design**: RESTful API with JSON responses
- **AI Integration**: OpenAI GPT-4o for chat responses and content generation

### Database Schema
The application uses a PostgreSQL database with the following main entities:
- **Users**: Core user profiles with pregnancy tracking, including separate firstName and lastName fields
- **Chat Messages**: Conversation history with AI doula
- **Journal Entries**: Personal reflection entries with AI-generated prompts
- **Check-ins**: Daily wellness assessments
- **Affirmations**: Positive messaging content
- **Experts**: Healthcare professional profiles
- **Resources**: Educational content and materials

## Key Components

### AI-Powered Chat Interface
- Conversational AI doula named "Nia" using GPT-4o
- Context-aware responses based on user's pregnancy stage
- 24/7 emotional support and guidance
- Real-time chat with message history

### Daily Check-in System
- Energy level tracking (1-5 scale)
- Mood assessment
- Symptom logging with JSON storage
- Pregnancy week correlation

### Baby Guidance Page
- Weekly pregnancy insights with fruit size comparisons
- Baby milestone tracking and development updates
- Mom's body changes and common symptoms
- Integrated learning content from Resources page
- Week-by-week navigation with current week highlighting
- Seamless integration with Resources tab for detailed learning

### Journaling Platform
- AI-generated personalized prompts
- Pregnancy week tracking
- Reflection content storage
- Date-based organization

### Expert Network
- Healthcare professional profiles
- Specialty-based filtering (doula, lactation, therapy, nutrition)
- Availability status tracking
- Direct consultation booking

### Resource Library
- Pregnancy stage-specific content
- Multiple content types (videos, articles, guides)
- Popularity-based recommendations
- Search and filtering capabilities

## Data Flow

1. **User Authentication**: Local storage-based user session management
2. **API Communication**: RESTful endpoints with JSON payloads
3. **State Management**: TanStack Query for caching and synchronization
4. **Real-time Updates**: Optimistic updates with query invalidation
5. **AI Integration**: Server-side OpenAI API calls with context injection

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **zod**: Runtime type validation
- **wouter**: Lightweight routing

### AI and Services
- **OpenAI API**: GPT-4o for conversational AI
- **date-fns**: Date manipulation utilities

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type-safe JavaScript
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **API Server**: Express.js with tsx for TypeScript execution
- **Database**: Neon serverless PostgreSQL
- **Environment**: Replit-optimized with runtime error overlay

### Production Build
- **Frontend**: Vite build with static asset optimization
- **Backend**: esbuild bundling for Node.js deployment
- **Database**: Drizzle migrations with PostgreSQL
- **Deployment**: Node.js production server

### Key Features
- **Hot Module Replacement**: Fast development iterations
- **TypeScript**: Full type safety across frontend and backend
- **Responsive Design**: Mobile-first approach with Tailwind
- **Performance**: Optimized queries and caching strategies
- **Accessibility**: Radix UI components for WCAG compliance

The application is designed as a comprehensive maternal wellness platform that prioritizes user experience, data privacy, and clinical accuracy while providing accessible support throughout pregnancy and postpartum periods.

## Recent Changes

### Latest Updates (2025-10-23)
- **Partner/Supporter Matching System**: Complete invite-based connection system for spouses/partners/supporters
  - Added `partnerships` table with invite codes, permissions, status tracking, and expiration dates
  - Added `partnerUpdates` table for event tracking (check-ins, appointments, journal entries, resources)
  - Atomic partner registration endpoint with transactional integrity:
    - POST /api/partners/register validates invite code, creates user, and links accounts in single transaction
    - Proper rollback: deletes user if redemption fails to prevent orphaned accounts
    - Retry support: reuses existing partner accounts to avoid duplicate email errors
    - Clear error messages and loading states for all failure scenarios
  - Mom onboarding includes optional partner invitation step (Step 4)
    - Generates unique 8-10 character invite code with 7-day default expiration
    - Shareable code for spouse/partner/supporter to join
    - Skip option for moms who don't want to invite anyone yet
  - Partner onboarding requires valid invite code to create account
    - 3-step process: user type selection, code entry, profile creation
    - Validates code before allowing registration
    - Links accounts atomically on successful registration
  - Permission system with visibility presets:
    - full_support: Partner sees everything (check-ins, journal, appointments, resources)
    - essentials_only: Limited to appointments and key updates
    - appointments_only: Only shared appointments
    - custom: Granular toggle controls (canViewCheckIns, canViewJournal, canViewAppointments, canViewResources)
  - Backend API routes for partnership management:
    - GET /api/partnerships/:userId - Get user's partnership connections
    - POST /api/partnerships/generate - Generate invite code for mom
    - POST /api/partners/register - Atomic partner registration with rollback
    - GET /api/partners/:partnerId/updates - Retrieve partner updates based on permissions
- **Regional Access Control with Waitlist System**: Implemented Detroit-area targeting with graceful waitlist for national expansion
  - Added zipCode field to user schema for region-based access control
  - Added waitlistUser boolean flag to track users outside Detroit area
  - Created comprehensive list of Detroit and surrounding metro area zip codes
  - Backend automatically checks zip codes and flags non-Detroit users as waitlist members
  - Built beautiful waitlist thank-you page with warm messaging about founding waitlist
  - Onboarding flow now routes Detroit users to main app, non-Detroit users to waitlist page
  - Messaging emphasizes "Now serving Detroit-area moms first" while welcoming national users to join waitlist
  - Updated onboarding form to collect city/state and zip code separately
  - Changed "Tell us about yourself" to "Tell me about yourself" for consistent Nia voice

### Previous Updates (2025-07-23)
- **Enhanced Marketing Landing Page**: Beautiful, warm landing page with improved design and app previews
  - Created professional landing page at `/landing` route for lead generation
  - Enhanced with warm rose-orange-amber gradient color palette for emotional connection
  - Beautiful animated background elements with pulsing gradient orbs
  - Interactive app mockup showing actual interface components and features
  - Enhanced email signup form with gradient buttons and improved UX
  - Feature showcase with colorful gradient icons and hover animations
  - Customer testimonials with enhanced styling and rating displays
  - Responsive design optimized for mobile and desktop experiences
  - Backend API endpoint for email collection with database storage
  - Success confirmation flow with next steps for subscribers
  - HIPAA compliance and privacy-first messaging for trust building
- **Partner Portal Implementation**: Complete partner-facing side for spouses/partners
  - Added comprehensive partnership database schema with permissions and invite system
  - Created partner onboarding flow with 3-step registration process
  - Built partner dashboard with learning resources, insights, and appointment sharing
  - Implemented privacy controls allowing mothers to choose what partners can access
  - Added partner-specific educational content and progress tracking
  - Created invite code system for secure partner connections
  - Partner settings page with notification preferences and privacy controls
  - Support for viewing mom's daily check-ins, appointments, and shared resources
  - Real-time partnership status tracking and connection management
- **Enhanced Floating Chat Interface**: Completely redesigned chat modal for optimal user experience
  - Fixed user message visibility issues with proper sage green styling
  - Removed intrusive "Nia is here..." tooltip that was blocking mobile screens
  - Clean minimal interface with just the green chat icon
  - Restructured modal layout to ensure input box is always visible at bottom
  - Centered modal positioning for better screen compatibility
  - Improved message display with better spacing and readability
- **New Insights/Dashboard Page**: Comprehensive wellness journey visualization
  - Added "Insights" tab to main navigation with chart icon
  - Key metrics display: journal streak, pregnancy week, learning progress, mood trends
  - Emotional check-in trends visualization over past week
  - Learning journey progress tracking with completed modules
  - Upcoming appointments overview with scheduling integration
  - Support team/village member display from expert network
  - Planning tools section: baby names, birth plan, nursery checklist buttons
  - Robust error handling for date formatting and data validation

### Previous Updates (2025-07-18)
- **Simplified Check-in System**: Condensed daily check-in to 3 focused questions:
  1. "How are you feeling today?" (Peaceful/Anxious/Tired/Overwhelmed/Grateful/Other)
  2. "Have you cared for your body today?" (Not yet/A little/Yes, I tried/Yes, feeling nourished)
  3. "Do you feel supported right now?" (Not really/A little/Mostly/Fully supported)
- **Updated Database Schema**: Replaced complex check-in fields with simplified `feeling`, `bodyCare`, and `feelingSupported` columns
- **Enhanced User Experience**: Personalized responses and encouragement based on check-in answers
- **AI Integration**: Updated Nia's context awareness to understand new check-in format
- **Added Baby Guidance Page**: Comprehensive weekly pregnancy insights with fruit size comparisons, baby milestones, mom's body changes, and integrated learning content
- **Enhanced Navigation**: Added Baby tab to main navigation between Check-in and Chat
- **Resource Integration**: Baby page now shows related resources and redirects to Resources tab for detailed learning
- **Fixed DOM Issues**: Resolved HTML validation warnings in component structure
- **Database Connection**: Fixed database connection issues in storage layer and seeding process
- Application successfully running on port 5000 with all features operational