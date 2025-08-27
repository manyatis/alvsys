# memolab Self-Hosting Plan

## Overview
This document outlines a plan for enabling memolab to be self-hosted in a simplified, development-focused mode without the marketing pages, authentication complexity, and SaaS features.

## Goals
- Create a self-contained version of memolab suitable for local development and self-hosting
- Remove marketing/landing pages and SaaS-specific features
- Simplify authentication (single user or bypass)
- Focus on core functionality: project boards, GitHub integration, and MCP support
- Enable easy local development without external dependencies

## Current Architecture Analysis

### Core Application Components (Keep)
- `/src/app/projects/[id]/board/page.tsx` - Main Kanban board interface
- `/src/components/board/` - Board-related components
- `/src/lib/issue-functions.ts` - Core issue management
- `/src/lib/project-functions.ts` - Project management
- `/src/lib/sprint-functions.ts` - Sprint functionality
- `/src/lib/github-functions.ts` - GitHub integration
- `/src/lib/mcp/` - MCP server and tools
- Database schema (Prisma)

### Marketing/SaaS Components (Remove/Simplify)
- `/src/app/page.tsx` - Landing page
- `/src/app/pricing/` - Pricing pages
- `/src/app/features/` - Features marketing
- `/src/app/account/` - Account management
- `/src/app/subscribe/` - Subscription flow
- `/src/components/payments/` - Payment components
- `/src/lib/stripe.ts` - Payment processing
- `/src/lib/subscription-functions.ts` - Subscription management
- Complex authentication flow

## Implementation Strategy

### Phase 1: Environment-Based Configuration
Create deployment modes using environment variables:

```env
# Self-hosted mode
memolab_MODE=selfhost
# Skip authentication
memolab_AUTH_BYPASS=true
# Default user/project
memolab_DEFAULT_USER_ID=self-host-user
memolab_DEFAULT_PROJECT_ID=default-project
```

### Phase 2: Conditional Rendering
Modify components to conditionally render based on mode:

#### Router Changes
- Self-host mode: Direct to `/projects/[default-id]/board`
- Skip marketing pages entirely
- Simplified navigation

#### Authentication Bypass
- Create middleware to auto-authenticate in self-host mode
- Inject default user session
- Skip OAuth flows

#### Navigation Simplification
- Remove pricing, features, account links
- Focus on core project navigation
- Simple project switcher

### Phase 3: Database Seeding
Create seeding script for self-host mode:

#### Default Data Structure
```typescript
// Self-host seed data
const defaultUser = {
  id: 'self-host-user',
  name: 'Self-Host User',
  email: 'user@localhost'
};

const defaultProject = {
  id: 'default-project',
  name: 'My Project',
  ownerId: 'self-host-user'
};
```

#### GitHub Integration (Optional)
- Allow GitHub integration for self-hosters
- Environment variable for GitHub app credentials
- Graceful fallback when GitHub not configured

### Phase 4: Docker Configuration
Create Docker setup for easy self-hosting:

#### Dockerfile
- Multi-stage build
- Include necessary dependencies
- Environment variable configuration
- Database initialization

#### docker-compose.yml
```yaml
services:
  memolab:
    build: .
    environment:
      - memolab_MODE=selfhost
      - DATABASE_URL=postgresql://...
    ports:
      - "3000:3000"
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=memolab
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### Phase 5: Build Optimization
Optimize build for self-host mode:

#### Next.js Configuration
- Static optimization for core pages
- Remove unused dependencies in self-host builds
- Smaller bundle size

#### Environment-Specific Dependencies
- Conditional imports based on mode
- Tree-shake marketing components
- Reduce bundle size

## File Structure Changes

### New Files to Create
```
/docs/
  └── self-hosting/
      ├── installation.md
      ├── configuration.md
      └── docker-setup.md
      
/scripts/
  ├── seed-selfhost.ts
  └── build-selfhost.sh
  
/docker/
  ├── Dockerfile.selfhost
  └── docker-compose.selfhost.yml
  
/config/
  └── selfhost.ts
```

### Modified Files
- `next.config.js` - Environment-based configuration
- `src/middleware.ts` - Authentication bypass
- `src/app/layout.tsx` - Conditional navigation
- `src/lib/auth.ts` - Self-host auth provider
- `prisma/seed.ts` - Self-host data seeding

## Configuration Options

### Runtime Environment Variables
```env
# Core Settings
memolab_MODE=selfhost|saas
memolab_AUTH_BYPASS=true|false
memolab_DEFAULT_USER_NAME="Self-Host User"
memolab_DEFAULT_PROJECT_NAME="My Project"

# GitHub Integration (Optional)
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# MCP Configuration
VIBE_HERO_PROJECT_ID=auto-generated-on-seed

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/memolab

# Features Toggle
memolab_ENABLE_GITHUB=true|false
memolab_ENABLE_MCP=true|false
memolab_ENABLE_MULTIPLAYER=true|false
```

### Build-Time Configuration
```javascript
// next.config.js
const isSelfHost = process.env.memolab_MODE === 'selfhost';

module.exports = {
  experimental: {
    outputFileTracingExcludes: isSelfHost ? {
      '/api/stripe': ['stripe'],
      '/api/payments': ['stripe'],
    } : {}
  },
  // Conditional page exclusion
  async rewrites() {
    if (isSelfHost) {
      return [
        {
          source: '/',
          destination: `/projects/${process.env.memolab_DEFAULT_PROJECT_ID}/board`
        }
      ];
    }
    return [];
  }
};
```

## Migration Path

### For Existing Installations
1. Add environment variables
2. Run database migration if needed
3. Restart application in self-host mode
4. Verify core functionality works

### For New Self-Host Users
1. Clone repository
2. Set up environment variables
3. Run Docker compose or manual setup
4. Access directly at `/projects/default/board`

## Benefits

### For Self-Hosters
- No authentication complexity
- No payment/subscription concerns
- Focused on core functionality
- Easy local development
- Full control over data

### For SaaS Users
- No impact on existing functionality
- Clean separation of concerns
- Easier testing of core features
- Simplified development environment

## Considerations

### Security
- Self-host mode should never be used in production with public access
- Clear documentation about intended use
- Warning messages about security implications

### Maintenance
- Maintain feature parity between modes where applicable
- Automated testing for both modes
- Clear documentation for both deployment types

### Support
- Community support for self-host mode
- Clear boundaries between SaaS and self-host support
- Documentation-driven support model

## Next Steps

1. **Create environment detection utilities**
2. **Implement authentication bypass middleware** 
3. **Create database seeding for self-host mode**
4. **Modify navigation components for conditional rendering**
5. **Create Docker configuration files**
6. **Write self-hosting documentation**
7. **Test deployment scenarios**
8. **Create build optimization for self-host mode**

## Success Criteria

- [ ] Can start memolab in self-host mode with single environment variable
- [ ] No authentication required in self-host mode
- [ ] Direct access to project board functionality
- [ ] GitHub integration works (when configured)
- [ ] MCP server functions correctly
- [ ] Docker deployment works out of the box
- [ ] Documentation covers common self-host scenarios
- [ ] Bundle size reduced for self-host builds
- [ ] No breaking changes to SaaS mode

This plan provides a comprehensive approach to enabling self-hosting while maintaining the existing SaaS functionality and ensuring a smooth experience for both deployment scenarios.