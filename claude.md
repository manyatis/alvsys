# AI Native Agile Board

## Project Description

AI Native Agile Board. It will be a UI Humans can monitor + review + control to have Claude code, and other tools code via prompts on their board in the form of a jira card. This way we can code from mobile, more structured, etc. The core of the app will be a set of API endpoints that Claude code will interact with, and use to onboard to the app (receive instruction on other API and how to use the apis), update the cards with status/comments etc.

## Prisma Schema

### 1. Organization Table
- Id
- Name
- User[]
- Project[]

### 2. Project Table
- Id
- Name
- Owner (User FK)
- Users (many-to-many through ProjectUser)

### 3. AI Work Log
- Id
- Date
- Track Activity from AI calling our endpoints

### 4. Cards
- Id
- Status (enum -> Refinement, Ready, In Progress, Blocked, Ready for Review, Completed)
- Project
- Created User
- CreatedTs
- UpdatedTs
- Title (string)
- Description (string, optional)
- Acceptance Criteria (string, optional)
- isAiAllowedTask (boolean, default true)
- Agent Developer Instructions (relation to AgentDeveloperInstruction[])

### 4a. Agent Developer Instructions
- Id
- Card (relation)
- Type (enum -> GIT, SPIKE, CODING, ARCHITECTURE)
- Branch Name (string, optional)
- Create New Branch (boolean, default false)
- Web Research Prompt (string, optional)
- Code Research Prompt (string, optional)
- Architecture Prompt (string, optional)
- General Instructions (string, optional)
- CreatedTs
- UpdatedTs

### 5. User Table
- Id
- Social used (google/github/apple -> make this an enum)
- OrganizationId FK
- Email (string)
- Created At
- Subscription Information FK
- Organization Admin (through OrganizationAdmin join table)

### 6. SubscriptionTier
- Tier (free/indie/professional -> make this an enum)
- Project Limit
- Daily Card Process Limit

### 7. Subscription Information
- Id
- Stripe Subscription Information
- SubscriptionTier FK
- User FK