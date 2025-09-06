# SynergySphere 🚀

> A modern, full-stack project management platform built for seamless collaboration between project managers and their teams.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1-green.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1-purple.svg)](https://vitejs.dev/)

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [User Roles & Permissions](#-user-roles--permissions)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## 🎯 Overview

SynergySphere is a comprehensive project management solution designed to streamline collaboration between project managers and employees. Built with modern web technologies, it offers real-time communication, task management, project tracking, and comprehensive analytics in a responsive, user-friendly interface.

### 🌟 Why SynergySphere?

- **Role-Based Access Control**: Tailored experiences for project managers and employees
- **Real-Time Collaboration**: Instant messaging with file attachments
- **Smart Notifications**: Automated task assignment notifications
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Type-Safe Architecture**: Full TypeScript integration from frontend to backend
- **Modern UI/UX**: Clean, accessible interface with dark/light theme support

## ✨ Key Features

### 📊 Dashboard & Analytics
- **Project Overview**: Visual progress tracking with completion percentages
- **Task Summary**: Today's tasks, recent activities, and workload distribution
- **Smart Status Calculation**: Automatic project status based on deadlines and progress
- **Workload Visualization**: Grid-based project workload heatmap

### 🎯 Project Management
- **Create & Manage Projects**: Full project lifecycle management
- **Project Details**: Comprehensive project information with deadlines and priorities
- **Progress Tracking**: Real-time completion percentage calculations
- **Tag-Based Organization**: Categorize projects with custom tags
- **Priority Levels**: High, medium, and low priority classification

### ✅ Task Management
- **Task Creation**: Project managers can assign tasks to employees
- **Status Tracking**: New, In Progress, Completed, and Approved statuses
- **Deadline Management**: Due date tracking with overdue notifications
- **File Attachments**: Attach documents and files to tasks
- **Comments System**: Collaborative discussion on tasks
- **Role-Based Views**: Different interfaces for managers and employees

### 💬 Real-Time Communication
- **Global Chatroom**: Company-wide communication channel
- **File Sharing**: Attach and share files in conversations
- **Role Identification**: Visual badges for project managers and employees
- **Message History**: Persistent chat history with timestamps
- **Real-Time Updates**: Instant message delivery and notifications

### 🔔 Smart Notifications
- **Task Assignment Alerts**: Automatic notifications when tasks are assigned
- **Real-Time Updates**: Live notification count in the header
- **Mark as Read**: Individual and bulk notification management
- **Notification History**: Persistent notification tracking

### 👥 User Management
- **User Profiles**: Comprehensive profile management
- **Role Assignment**: Project Manager and Employee roles
- **Time Logging**: Login activity tracking
- **Authentication**: Secure JWT-based authentication
- **Account Management**: Profile updates and preferences

### 🎨 UI/UX Features
- **Dark/Light Themes**: Toggle between themes with system preference detection
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Accessible Components**: ARIA-compliant UI components
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: Comprehensive error boundaries and user feedback

## 🛠 Technology Stack

### Frontend
- **React 18**: Modern React with concurrent features and suspense
- **TypeScript**: Full type safety across the application
- **Vite**: Fast build tool with hot module replacement
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Accessible, unstyled UI primitives
- **React Query**: Advanced data fetching and caching
- **React Router**: Client-side routing with protected routes
- **Next Themes**: Theme management with system preference support

### Backend
- **Express.js**: Fast, unopinionated web framework for Node.js
- **TypeScript**: Type-safe server-side development
- **JWT**: Secure token-based authentication
- **Bcrypt**: Password hashing and security
- **CORS**: Cross-origin resource sharing configuration
- **Neon Database**: Serverless PostgreSQL database

### Development Tools
- **Vite**: Development server with proxy integration
- **ESLint & Prettier**: Code quality and formatting
- **Vitest**: Fast unit testing framework
- **Path Aliases**: Clean import statements with TypeScript paths

### Deployment
- **Netlify**: Static site hosting with serverless functions
- **Serverless Functions**: Backend API deployment
- **Environment Variables**: Secure configuration management

## 🏗 Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   React SPA     │◄──►│  Express API    │◄──►│ Neon Database   │
│                 │    │                 │    │                 │
│  - Components   │    │  - Routes       │    │  - PostgreSQL   │
│  - Pages        │    │  - Middleware   │    │  - Serverless   │
│  - Hooks        │    │  - Auth         │    │  - Managed      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  Shared Types   │    │  Netlify Funcs  │    │  Time Logging   │
│                 │    │                 │    │                 │
│  - API Types    │    │  - Serverless   │    │  - User Activ.  │
│  - Interfaces   │    │  - Auto Deploy  │    │  - Analytics    │
│  - Validation   │    │  - Edge Compute │    │  - Monitoring   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow Architecture

```
┌─── User Authentication ───┐
│                           │
│  Login/Signup ──► JWT ────┼──► Protected Routes
│                           │
└───────────────────────────┘
            │
            ▼
┌─── Role-Based Access ─────┐
│                           │
│  Project Manager ────────┼──► Create Projects/Tasks
│  Employee ───────────────┼──► View Assigned Tasks
│                           │
└───────────────────────────┘
            │
            ▼
┌─── Real-Time Features ────┐
│                           │
│  Chat Messages ──────────┼──► Global Communication
│  Notifications ──────────┼──► Task Assignments
│  Live Updates ───────────┼──► Dashboard Metrics
│                           │
└───────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **Git**
- **Neon Database** account (for production)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/synergysphere.git
cd synergysphere
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Environment setup**
```bash
# Copy environment template
cp .env.example .env

# Add your environment variables
echo "DATABASE_URL=your_neon_database_url" >> .env
echo "JWT_SECRET=your_jwt_secret" >> .env
```

4. **Start development server**
```bash
pnpm dev
```

The application will be available at `http://localhost:8080`

### First Run Setup

1. **Create Admin Account**
   - Navigate to `/signup`
   - Create account with `project_manager` role
   - This will be your admin account

2. **Create Employee Accounts**
   - Use the admin account to invite employees
   - Or employees can sign up with `employee` role

3. **Start Creating Projects**
   - Navigate to `Projects → New Project`
   - Add project details, deadlines, and priorities
   - Assign tasks to team members

## 👥 User Roles & Permissions

### Project Manager 👨‍💼

**Full Management Access**
- ✅ Create and manage projects
- ✅ Create and assign tasks to employees
- ✅ View all project metrics and analytics
- ✅ Access user management features
- ✅ View team workload distribution
- ✅ Send notifications to employees
- ✅ Access time logs and activity reports

**Dashboard View**
- Team tasks overview
- Project portfolio summary
- Employee workload distribution
- System-wide metrics

### Employee 👨‍💻

**Personal Workspace Access**
- ✅ View assigned projects (read-only)
- ✅ Manage assigned tasks (update status, add comments)
- ✅ Upload task attachments
- ✅ Participate in global chatroom
- ✅ Receive task assignment notifications
- ✅ Update personal profile
- ✅ View personal time logs

**Dashboard View**
- Personal task list
- Assigned project progress
- Today's deadlines
- Personal metrics

### Navigation & UI Adaptation

The system automatically adapts the navigation and UI based on user roles:

- **Project Managers**: See all navigation options including user management
- **Employees**: Limited navigation focused on their tasks and projects
- **Dynamic Buttons**: Create buttons only appear for authorized roles
- **Data Filtering**: API responses filtered based on user permissions

## 📚 API Documentation

### Authentication Endpoints

```typescript
// Register new user
POST /api/auth/signup
Body: { email, password, name, role? }
Response: { success, message, user, token }

// User login
POST /api/auth/login
Body: { email, password }
Response: { success, message, user, token }

// Verify token
GET /api/auth/verify
Headers: { Authorization: "Bearer <token>" }
Response: { success, user }
```

### Project Management

```typescript
// Get all projects (filtered by role)
GET /api/projects
Headers: { Authorization: "Bearer <token>" }
Response: { success, projects }

// Create new project (PM only)
POST /api/projects
Body: { name, description, deadline, priority, tags }
Response: { success, project }

// Get project details
GET /api/projects/:id
Response: { success, project }

// Update project (PM only)
PATCH /api/projects/:id
Body: { name?, description?, deadline?, priority?, tags? }
Response: { success, project }
```

### Task Management

```typescript
// Get dashboard data
GET /api/tasks/dashboard
Response: { success, data: { user_role, tasks, projects } }

// Get tasks (filtered by role)
GET /api/tasks
Response: { success, tasks }

// Create task (PM only)
POST /api/tasks
Body: { name, description, assignee, project_id, deadline }
Response: { success, task }

// Update task status
PATCH /api/tasks/:id/status
Body: { status }
Response: { success, task }

// Add task comment
POST /api/tasks/:id/comments
Body: { content }
Response: { success, comment }

// Upload task attachment
POST /api/tasks/:id/attachments
Body: FormData with file
Response: { success, file }
```

### Communication

```typescript
// Get chat messages
GET /api/chat/messages
Response: { success, messages }

// Send chat message
POST /api/chat/messages
Body: { content }
Response: { success, message }

// Upload chat file
POST /api/chat/files
Body: FormData with file
Response: { success, file }
```

### Notifications

```typescript
// Get user notifications
GET /api/notifications
Response: { success, notifications }

// Get unread count
GET /api/notifications/unread-count
Response: { success, count }

// Mark notification as read
PATCH /api/notifications/:id/read
Response: { success }

// Mark all as read
PATCH /api/notifications/mark-all-read
Response: { success }
```

## 📁 Project Structure

```
synergysphere/
├── client/                     # Frontend React application
│   ├── components/            # Reusable UI components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   │   ├── Header.tsx     # Main header with notifications
│   │   │   ├── Sidebar.tsx    # Navigation sidebar
│   │   │   ├── TodayTasks.tsx # Task list component
│   │   │   └── ProjectSummary.tsx # Project overview
│   │   ├── ui/               # Base UI component library
│   │   │   ├── button.tsx    # Button variants
│   │   │   ├── card.tsx      # Card components
│   │   │   ├── sidebar.tsx   # Sidebar primitives
│   │   │   └── ...
│   │   ├── ProtectedRoute.tsx # Authentication wrapper
│   │   ├── RoleBasedRoute.tsx # Role-based access control
│   │   └── ThemeToggle.tsx   # Theme switching component
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.tsx       # Authentication state management
│   │   ├── use-mobile.tsx    # Mobile breakpoint detection
│   │   └── use-toast.ts      # Toast notification hook
│   ├── pages/                # Application pages/routes
│   │   ├── Index.tsx         # Dashboard page
│   │   ├── Login.tsx         # Authentication page
│   │   ├── Projects.tsx      # Project listing
│   │   ├── ProjectDetail.tsx # Individual project view
│   │   ├── Tasks.tsx         # Task management
│   │   ├── Chatroom.tsx      # Global communication
│   │   └── ...
│   ├── lib/                  # Utility functions
│   │   └── utils.ts          # Common utilities and helpers
│   ├── App.tsx               # Root application component
│   └── global.css            # Global styles and Tailwind imports
│
├── server/                    # Backend Express application
│   ├── routes/               # API route handlers
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── projects.ts      # Project management API
│   │   ├── tasks.ts         # Task management API
│   │   ├── chat.ts          # Chat messaging API
│   │   ├── notifications.ts # Notification system API
│   │   └── users.ts         # User management API
│   ├── middleware/           # Express middleware
│   │   └── auth.ts          # JWT authentication middleware
│   ├── db.ts                # Database connection and queries
│   └── index.ts             # Express server configuration
│
├── shared/                   # Shared TypeScript definitions
│   └── api.ts               # API interfaces and types
│
├── netlify/functions/        # Serverless deployment functions
│   └── api.ts              # Netlify function wrapper
│
├── public/                   # Static assets
│   ├── robots.txt           # SEO configuration
│   └── test-*.html          # Testing utilities
│
├── package.json             # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── vite.config.server.ts   # Server build configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── netlify.toml            # Netlify deployment configuration
```

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm typecheck             # Type checking

# Building
pnpm build                 # Build for production
pnpm build:client          # Build frontend only
pnpm build:server          # Build backend only

# Testing
pnpm test                  # Run test suite
pnpm test:watch           # Run tests in watch mode

# Code Quality
pnpm format.fix           # Format code with Prettier
pnpm lint                 # Run ESLint

# Production
pnpm start                # Start production server
```

### Development Workflow

1. **Feature Development**
   ```bash
   git checkout -b feature/your-feature-name
   pnpm dev  # Start development server
   # Make your changes
   pnpm typecheck  # Ensure type safety
   pnpm test      # Run tests
   ```

2. **Database Changes**
   - Update schema in `server/db.ts`
   - Add migration logic if needed
   - Update TypeScript interfaces in `shared/api.ts`

3. **Adding New Components**
   - Create component in appropriate directory
   - Export from index file if needed
   - Add to Storybook (if applicable)
   - Write tests

### Environment Variables

```bash
# Required for development
DATABASE_URL=postgresql://username:password@host/database
JWT_SECRET=your-super-secret-jwt-key

# Optional
PING_MESSAGE=Custom ping message
NODE_ENV=development
PORT=8080
```

### Hot Reload & Proxy

The development setup uses Vite's proxy feature to forward API requests to the Express server, enabling:
- **Single Port Development**: Frontend and backend on same port (8080)
- **Hot Module Replacement**: Instant frontend updates
- **API Integration**: Seamless development experience
- **CORS Handling**: No cross-origin issues during development

## 🚢 Deployment

### Netlify Deployment (Recommended)

1. **Prepare for deployment**
   ```bash
   pnpm build
   ```

2. **Deploy to Netlify**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Deploy
   netlify deploy --prod
   ```

3. **Environment Variables**
   Set these in Netlify dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - Any other production variables

### Manual Deployment

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Deploy static files**
   - Upload `dist/spa/` to your static hosting service
   - Configure redirects for SPA routing

3. **Deploy serverless functions**
   - Use `netlify/functions/` for Netlify
   - Or deploy `dist/server/` to your Node.js hosting

### Database Setup

1. **Create Neon Database**
   - Sign up at [neon.tech](https://neon.tech)
   - Create new project
   - Copy connection string

2. **Set Environment Variable**
   ```bash
   DATABASE_URL=postgresql://username:password@host/database?sslmode=require
   ```

3. **Initialize Tables**
   - Tables are created automatically on first run
   - Database initialization happens in `server/db.ts`

## 🤝 Contributing

We welcome contributions to SynergySphere! Here's how to get started:

### Development Setup

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/synergysphere.git
   ```
3. **Install dependencies**
   ```bash
   pnpm install
   ```
4. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

### Code Standards

- **TypeScript**: All code must be properly typed
- **ESLint**: Follow the configured linting rules
- **Prettier**: Code must be formatted with Prettier
- **Testing**: Add tests for new features
- **Documentation**: Update README for significant changes

### Pull Request Process

1. **Ensure all tests pass**
   ```bash
   pnpm test
   pnpm typecheck
   ```
2. **Update documentation if needed**
3. **Create detailed PR description**
4. **Request review from maintainers**

### Reporting Issues

When reporting issues, please include:
- **Environment details** (OS, Node.js version, browser)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Console errors** or logs

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Vercel Team** - For Vite and the incredible development experience
- **Radix UI** - For accessible UI components
- **Tailwind Labs** - For the utility-first CSS framework
- **Neon** - For serverless PostgreSQL hosting
- **Netlify** - For seamless deployment and hosting

## 📞 Support

If you encounter any issues or have questions:

- **GitHub Issues**: [Create an issue](https://github.com/your-username/synergysphere/issues)
- **Documentation**: Check this README and inline code comments
- **Community**: Join our discussions in GitHub Discussions

---

<div align="center">
  <p><strong>Built with ❤️ by the SynergySphere Team</strong></p>
  <p><em>Empowering teams to achieve more together</em></p>
</div>