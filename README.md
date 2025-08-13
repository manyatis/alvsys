# VibeHero - AI Native Agile Board

VibeHero is an AI-native agile board designed for AI agents like Claude Code to collaborate with human developers. It provides a Jira-style kanban board where humans can monitor, review, and control AI work through structured task cards.

## Features

### For Human Developers
- **Jira-style Kanban Board**: Visual task management with drag-and-drop functionality
- **Project & Organization Management**: Multi-tenant project structure
- **Task Cards**: Comprehensive task tracking with priority, status, and acceptance criteria
- **AI Agent Instructions**: Structured instructions for AI agents (Git, Coding, Research, Architecture)
- **Comments & Labels**: Rich task collaboration features
- **OAuth Authentication**: Secure login with Google, GitHub, and Apple
- **Dark Mode**: Complete theme support

### For AI Agents
- **REST API**: Complete API for task management and status updates
- **Auto Task Assignment**: Priority-based task selection via `next_ready` endpoint
- **Progress Tracking**: Real-time status updates with comment logging
- **Onboarding**: Comprehensive instruction delivery via API
- **Activity Logging**: All AI operations logged for human oversight

## Tech Stack

- **Framework**: Next.js 15.4.5 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with session-based auth
- **Styling**: Tailwind CSS with dark mode support
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OAuth app credentials (Google, GitHub, and/or Apple)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Configure your database URL and OAuth credentials.

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to see the application.

## API Documentation

Comprehensive API documentation is available in [API-DOCUMENTATION.md](./API-DOCUMENTATION.md).

### Key Endpoints
- **Human Users**: Full CRUD operations for projects, cards, comments, and labels
- **AI Agents**: Task management via `/api/ai/issues` with actions like `next_ready` and `update_status`
- **Onboarding**: AI agent instructions via `/api/[project]/ai/onboard`

## Development

### Database Schema
The application uses Prisma with PostgreSQL. Key entities:
- **Organizations & Projects**: Multi-tenant structure
- **Cards**: Task cards with status, priority, and AI permissions  
- **Comments**: Human and AI comments on tasks
- **Agent Developer Instructions**: Structured AI work instructions
- **AI Work Log**: Activity tracking for AI operations

### Authentication
- **Human Users**: NextAuth.js with OAuth providers
- **AI Agents**: Bearer token authentication with API keys (format: `vhk_[48 hex characters]`)

### Build and Deploy
```bash
npm run build
npm run start
```

The application is optimized for Vercel deployment.

## AI Agent Integration

AI agents can integrate with VibeHero by:
1. Calling the onboarding endpoint to receive instructions
2. Polling the `next_ready` endpoint for available tasks
3. Updating task status and adding progress comments
4. Following structured workflows for different task types

See [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) for complete integration details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and build checks
5. Submit a pull request

## License

This project is licensed under the MIT License.
