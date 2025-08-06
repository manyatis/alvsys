## Instructions for the session:

You are permitted to run curl commands (GET/POST/PUT etc),
You are permitted to edit files in this directory
You are permitted to run any bash commands in this directory.
You have full access to all git commands on the feature/vibesight-vibesight branch.

# VibeSight - AI Native Agile Board

## Project Description

VibeSight is an AI-native agile board designed for AI agents like Claude Code to collaborate with human developers. It provides a Jira-style kanban board where humans can monitor, review, and control AI work through structured task cards. The core of the app is a set of API endpoints that AI agents interact with to onboard, receive instructions, update task status, and add progress comments.

## Current Implementation Status

### ✅ Completed Features

#### API Infrastructure
- **Authentication**: NextAuth.js with Google, GitHub, Apple OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Session Management**: Database sessions with Prisma adapter

#### Core API Endpoints
- **AI Onboarding**: `GET /api/[project]/ai/OnboardAgent` - Provides comprehensive AI agent instructions
- **Card Management**: Full CRUD operations for cards with project-specific access
- **AI Card Operations**: 
  - `next_ready` - Get highest priority READY task
  - `update_status` - Update card status with optional comments
  - `get_card_details` - Get detailed card information
- **Project Management**: Create/read projects and organizations
- **Activity Logging**: All AI API calls logged to AIWorkLog table

#### User Interface
- **Landing Page**: Modern design with authentication
- **Navigation**: Responsive navbar with user dropdown, dark mode support
- **Projects Page**: List all user projects, create new projects/organizations
- **Kanban Board**: Jira-style board with 6 status columns
  - Refinement, To Do, In Progress, Blocked, Review, Done
  - Collapsible sidebar with board actions
  - Professional card design with priority indicators
  - AI-allowed task badges
  - User avatars and assignee indicators

#### Design System
- **Dark Mode**: Complete theme support throughout
- **Responsive**: Mobile-first design with proper breakpoints
- **Professional Styling**: Rounded corners, smooth transitions, proper spacing
- **Accessibility**: Proper focus states, keyboard navigation

### 🔧 Technical Architecture

#### Database Schema (Prisma)
- **Organizations**: Multi-tenant organization structure
- **Projects**: Project ownership and user access control
- **Cards**: Task cards with priority, status, AI permissions
- **Comments**: Task comments from humans and AI agents
- **Agent Developer Instructions**: Structured AI work instructions
- **AI Work Log**: Activity tracking for all AI operations
- **Users**: Authentication and subscription management

#### AI Agent Integration
- **Onboarding Flow**: AI agents receive comprehensive instructions via API
- **Task Assignment**: Priority-based task selection with `next_ready` endpoint
- **Status Updates**: Real-time status changes with comment logging
- **Progress Tracking**: All AI activity logged for human oversight

### 📋 Current Card Schema

#### Core Fields
- **Priority**: Integer (1=highest, 5=lowest) with visual indicators
- **Status**: Enum (REFINEMENT, READY, IN_PROGRESS, BLOCKED, READY_FOR_REVIEW, COMPLETED)
- **Title**: Required summary text
- **Description**: Optional detailed description
- **Acceptance Criteria**: Optional completion requirements
- **isAiAllowedTask**: Boolean flag for AI agent permissions
- **Comments**: Related comments from humans and AI agents

#### Agent Developer Instructions
- **Type**: GIT, SPIKE, CODING, ARCHITECTURE
- **Branch Management**: Branch naming and creation flags
- **Research Prompts**: Web and code research instructions
- **Architecture Guidelines**: System design considerations
- **General Instructions**: Flexible instruction field

### 🎯 AI Agent Workflow

1. **Onboarding**: Agent calls onboarding endpoint to receive instructions
2. **Task Selection**: Agent calls `next_ready` to get highest priority task
3. **Work Initiation**: Agent updates status to IN_PROGRESS with comment
4. **Progress Updates**: Agent adds comments during work
5. **Completion**: Agent updates to READY_FOR_REVIEW when done
6. **Blocking**: Agent updates to BLOCKED if assistance needed

### 🚀 Next Development Priorities

#### API Enhancements
- **Card Drag & Drop**: Real-time status updates via API
- **User Assignment**: Assign specific users to cards
- **Card Comments API**: Full comment CRUD operations
- **Bulk Operations**: Multi-card status updates
- **Webhooks**: External system notifications

#### UI/UX Improvements
- **Card Details Modal**: Expandable card view with full information
- **Real-time Updates**: WebSocket or polling for live board updates
- **Advanced Filtering**: Filter by assignee, priority, AI status
- **Search Functionality**: Full-text search across cards
- **Activity Timeline**: Visual history of card changes

#### AI Agent Features
- **Card Assignment**: Specific agent assignment to cards
- **Progress Estimation**: Time estimates and progress tracking
- **Error Handling**: Robust error reporting and recovery
- **Multi-agent Coordination**: Agent collaboration on complex tasks

### 📝 Development Notes
- **Tech Stack**: Next.js 15.4.5, TypeScript, Tailwind CSS, Prisma, PostgreSQL
- **Authentication**: Session-based with NextAuth.js
- **Deployment**: Ready for Vercel deployment
- **Environment**: Development environment configured with Supabase PostgreSQL