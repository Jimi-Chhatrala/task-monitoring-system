# Task Management Monorepo

A full-stack monorepo project with React + TypeScript frontend and NestJS backend.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Monorepo**: pnpm workspaces + Turborepo

## Project Structure

```
repo-root/
├── apps/
│   ├── web/           # React frontend
│   └── api/           # NestJS backend
├── packages/
│   ├── types/         # Shared types & enums
│   ├── domain/        # Business logic
│   └── config/        # Shared configs
├── docker-compose.yml # Docker setup
└── turbo.json         # Turborepo config
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL (or use Docker)

### Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm --filter api prisma generate

# Push schema to database
pnpm --filter api prisma db push
```

### Development

```bash
# Run both frontend and backend
pnpm dev

# Run only backend
pnpm --filter api dev

# Run only frontend
pnpm --filter web dev
```

### Build

```bash
pnpm build
```

## Docker Setup (Optional)

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down
```

## Environment Variables

Create `.env` files in `apps/api/` and `apps/web/` directories:

### apps/api/.env
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskdb?schema=public"
API_PORT=3000
FRONTEND_URL=http://localhost:5173
```

## API Documentation

Once running, visit `http://localhost:3000/api/docs` for Swagger documentation.

## Features

- **Dashboard**: Overview with metrics and insights
- **Task Management**: CRUD operations with status transitions
- **Time Logging**: Track hours spent on tasks
- **Comments**: Add comments to tasks
- **Business Rules**: 
  - Tasks lock when marked DONE
  - Validated status transitions
- **Metrics**: Summary, monthly, yearly, and comparison APIs
- **Insights**: Automated analysis of productivity and efficiency

## Status Transitions

Allowed transitions:
- `TODO` → `IN_PROGRESS`
- `IN_PROGRESS` → `REVIEW`, `ON_HOLD`
- `REVIEW` → `TESTING`, `REOPEN`, `ON_HOLD`
- `TESTING` → `READY_TO_LIVE`, `REOPEN`, `ON_HOLD`
- `READY_TO_LIVE` → `DONE`, `REOPEN`
- `ON_HOLD` → previous state
- `REOPEN` → `IN_PROGRESS`
- `DONE` → locked (no transitions)

## License

MIT
