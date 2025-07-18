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

### Latest Updates (2025-07-18)
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