# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm analyze` - Analyze bundle size (sets ANALYZE=true)

## Architecture Overview

This is a Next.js 15 application with TypeScript, using:

- **Database**: PostgreSQL accessed via Supabase PostgREST API
- **Internationalization**: next-intl with locale routing
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI Integration**: Multiple AI providers (OpenAI, DeepSeek, Replicate, xAI)
- **Payment**: Stripe integration
- **Authentication**: Custom auth system (no NextAuth detected)

### Key Architectural Patterns

#### Database Layer
- Custom PostgreSQL wrapper (`lib/db-wrapper.ts`) that automatically converts between camelCase (frontend) and snake_case (database)
- Models in `models/` define TypeScript interfaces
- Services in `services/` handle business logic
- All database operations use the wrapped client from `getPgWrapperClient()`

#### App Structure
- **App Router**: Using Next.js 13+ app directory
- **Locale Routing**: `[locale]` dynamic routes for i18n
- **Admin Section**: Protected admin routes under `(admin)/`
- **User Console**: User dashboard under `(console)/`
- **API Routes**: REST endpoints in `app/api/`

#### Component Architecture
- **Blocks**: Large UI sections in `components/blocks/`
- **UI Components**: Reusable components in `components/ui/` (shadcn/ui)
- **Layout Components**: Dashboard and console layouts with sidebars
- **Specialized Components**: Feature-specific components (chat, editor, etc.)

#### File Organization
- **Types**: TypeScript definitions in `types/` with subdirectories
- **Hooks**: Custom React hooks in `hooks/`
- **Utils**: Utility functions in `lib/`
- **Data**: SQL files and static data in `data/`

## Code Conventions

### Language Requirements
- **Comments**: All code comments must be written in Chinese
- **Conversations**: All discussions and communications should be in Chinese

### Naming (from .cursor/rules/naming-conventions.mdc)
- **Files**: kebab-case (`user-profile.tsx`, `get-user-info.ts`)
- **Variables/Fields**: camelCase (`userEmail`, `createdAt`, `stripeSessionId`)
- **Enums**: UPPERCASE (`ACTIVE`, `PENDING`, `COMPLETED`)

### Database Integration
- Always use `getPgWrapperClient()` for database operations
- Frontend code uses camelCase, database uses snake_case (automatic conversion)
- Models define TypeScript interfaces, services handle business logic

### Internationalization
- All user-facing text should support i18n
- Messages stored in `i18n/messages/` by locale
- Page-specific messages in `i18n/pages/`
- Use `useTranslations()` hook for client components

## Environment Variables

Required environment variables:
- `PG_API_URL` - PostgreSQL PostgREST endpoint
- Various AI provider API keys
- Stripe keys for payment processing

## Special Features

- **AI Style Transfer**: Image processing feature
- **Credit System**: User credits for AI operations
- **Invite System**: User referral/invite functionality
- **Multi-language Support**: Full i18n with locale-based routing
- **Admin Dashboard**: Complete admin interface for managing users, posts, orders