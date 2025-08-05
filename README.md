# ScreenForge

A comprehensive screen recording tool with built-in video editing and sophisticated sharing controls.

## Project Structure

This is a monorepo containing both the frontend and backend applications:

```
screenforge/
├── frontend/          # React + TypeScript frontend
├── backend/           # Node.js + Express backend
├── package.json       # Workspace configuration
└── README.md          # This file
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database

### Installation

1. Install dependencies for all workspaces:
```bash
npm run install:all
```

2. Set up environment variables:
   - Copy `frontend/.env.example` to `frontend/.env`
   - Copy `backend/.env.example` to `backend/.env`
   - Fill in your values

3. Set up the database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start both development servers:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Available Scripts

### Root Level Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production
- `npm run install:all` - Install dependencies for all workspaces
- `npm run clean` - Remove all node_modules folders
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Frontend Scripts
```bash
cd frontend
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Backend Scripts
```bash
cd backend
npm run dev      # Start with nodemon
npm run build    # Build TypeScript
npm run start    # Start production server
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **React Router** for navigation
- **Zustand** for state management

### Backend
- **Node.js** with Express and TypeScript
- **PostgreSQL** database
- **Prisma** ORM
- **Clerk** for authentication middleware

## Development Guidelines

- Keep frontend and backend code separated
- Use TypeScript strictly with proper type definitions
- Follow the project-specific coding instructions in `.github/copilot-instructions.md`
- Use Prisma for all database operations
- Implement proper error handling and loading states

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation as needed
4. Ensure both frontend and backend builds pass

## Deployment

### Vercel Deployment

This project is configured for deployment on Vercel. See `DEPLOYMENT.md` for detailed instructions.

**Quick deployment validation:**
```bash
./validate-deployment.sh
```

**Deployment options:**
1. **Separate deployments** (recommended): Deploy frontend and backend as separate Vercel projects
2. **Monorepo deployment**: Deploy from root with frontend-only configuration

See `DEPLOYMENT.md` for complete deployment instructions and environment variable setup.

## License

MIT
