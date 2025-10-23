# Maternal Wellness App

## Overview

This React-based maternal wellness application offers comprehensive support for expecting and new mothers. It functions as a digital village, providing AI-powered chat support, daily check-ins, journaling, educational resources, and expert consultations. The app aims to provide accessible support throughout pregnancy and postpartum periods, prioritizing user experience, data privacy, and clinical accuracy. Key capabilities include a partner dashboard for shared pregnancy tracking, automatic pregnancy week calculation, a partner/supporter matching system, regional access control with a waitlist, and calendar sync integration for appointments.

## User Preferences

Preferred communication style: Simple, everyday language.
Display preference: Show only first name in greetings and throughout the app for personalization.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
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
Core entities include Users, Chat Messages, Journal Entries, Check-ins, Affirmations, Experts, Resources, Partnerships, and Appointments.

### Key Features
- **AI-Powered Chat Interface**: Conversational AI doula "Nia" using GPT-4o, providing context-aware responses and 24/7 emotional support.
- **Daily Check-in System**: Tracks energy levels, mood, and symptoms, correlated with pregnancy week. Simplified to three core questions.
- **Baby Guidance Page**: Provides weekly pregnancy insights, baby milestone tracking, mom's body changes, and integrated learning content.
- **Journaling Platform**: Offers AI-generated personalized prompts and reflection content storage.
- **Expert Network**: Profiles of healthcare professionals, with specialty filtering and consultation booking.
- **Resource Library**: Pregnancy stage-specific content (videos, articles, guides) with search and filtering.
- **Partner Dashboard**: A dedicated view for partners to track the connected mother's pregnancy journey, including baby development, check-ins, and appointments.
- **Partner/Supporter Matching System**: Invite-based connection system with granular permission controls for data visibility.
- **Calendar Sync Integration**: Infrastructure for aggregating pregnancy/postpartum appointments from external calendars (Google, Outlook) with smart keyword filtering.
- **Regional Access Control**: Implemented Detroit-area targeting with a waitlist system for national expansion based on zip codes.
- **Insights/Dashboard Page**: Visualizes wellness journey metrics, mood trends, learning progress, and upcoming appointments.

### Data Flow
- **User Authentication**: Local storage-based session management.
- **API Communication**: RESTful endpoints with JSON payloads.
- **State Management**: TanStack Query for caching and synchronization.
- **Real-time Updates**: Optimistic updates with query invalidation.
- **AI Integration**: Server-side OpenAI API calls with context injection.

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