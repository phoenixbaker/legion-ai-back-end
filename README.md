# Legion AI Backend

## 🤖 Overview

Legion AI is a powerful agent-based AI framework built with NestJS that enables you to create, manage, and orchestrate multiple AI agents. The platform provides a flexible architecture for building AI applications with support for:

- ✅ **Multi-Agent Communication**: Allow agents to communicate with each other
- ✅ **Tool Integration**: Execute CLI commands, make API calls, search the web, and more
- ✅ **Template-Based Agents**: Create reusable agent templates with predefined capabilities
- ✅ **OpenAI Integration**: Seamlessly integrate with OpenAI's latest models
- ✅ **Project Management**: Organize agents within project contexts

## 🔧 Tech Stack

- **Backend**: NestJS (TypeScript)
- **Database**: MongoDB (via Prisma ORM)
- **AI Integration**: OpenAI API, OpenRouter
- **Additional**: Docker for containerization

## 📋 Prerequisites

- Node.js (v18+)
- npm or yarn
- MongoDB
- Docker (optional, for containerization)

## 🚀 Getting Started

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/legion-ai-backend.git
cd legion-ai-backend
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```
DATABASE_URL="mongodb://username:password@localhost:5432/legion_ai"
OPENROUTER_API_KEY="your_openrouter_api_key"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
```

4. Run database migrations

```bash
npx prisma migrate dev
```

5. Start the development server

```bash
npm run start:dev
```

## 🏗️ Architecture

Legion AI is built with a modular architecture:

- **Agent Module**: Core functionality for creating and managing AI agents
- **Template Module**: Manages agent templates with predefined capabilities
- **Tools Module**: Provides a set of tools that agents can use to interact with the world
- **OpenAI Module**: Handles integration with OpenAI and OpenRouter
- **Messages Module**: Manages communication between agents
- **Project Module**: Organizes agents into projects
- **Docker Module**: Handles containerization for isolated agent environments

## 🛠️ Available Tools

Agents in Legion AI can use several built-in tools:

1. **CLI Execution**: Execute commands in a controlled environment
2. **Web Search**: Search the web for information
3. **API Calls**: Make HTTP requests to external services
4. **Agent Communication**: Send messages to other agents

## 📚 API Documentation

API endpoints are available at `/api` when running the server. Key endpoints include:

- `/agents`: CRUD operations for agents
- `/templates`: Manage agent templates
- `/projects`: Organize agents into projects
- `/messages`: Handle agent communications

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Integration tests
npm run test:integration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
