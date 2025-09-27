# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

### Build and Type Checking
- `pnpm run build` - TypeScript compilation and type checking for main code
- `pnpm run build:test` - TypeScript compilation and type checking for tests
- `pnpm run start` - Run the bot directly with tsx
- `pnpm run start:dev` - Build then start the bot (recommended for development)
- `pnpm run start:watch` - Run bot with file watching for automatic restarts

### Code Quality
- `pnpm run lint` - Run ESLint on codebase
- `pnpm run lint:fix` - Run ESLint with automatic fixes
- `pnpm run format` - Format code with Prettier
- `pnpm run circular-deps` - Check for circular dependencies using madge

### Testing
- `pnpm run test` - Run Jest tests without coverage
- `pnpm run test:coverage` - Run Jest tests with coverage report

### Configuration
- `pnpm run generate-config` - Generate default configuration file

## Architecture Overview

### Core Structure
This is a modular Discord bot built with Discord.js v14 and TypeScript. The architecture follows a plugin-based module system where each feature is encapsulated in its own module.

**Key Directories:**
- `src/bot.ts` - Main entry point with comprehensive startup sequence
- `src/common/` - Shared utilities, managers, configuration, and base classes
- `src/modules/` - Feature modules (each Discord bot feature is a separate module)

### Module System
The bot uses a centralized ModuleManager that loads modules in a specific order:

1. **HealthCheckModule** - Must be loaded first for monitoring
2. **ImageProxyModule** - Production-only, loaded after HealthCheck
3. **CustomCommandsModule** - Production-only
4. **Core Feature Modules** - Game day posts, levels, pins, etc.
5. **RegisterCommandsModule** - Must be loaded last to register all commands

Each module follows the singleton pattern and extends the base `Module` class.

### Database Architecture
The bot is currently transitioning from Enmap (local storage) to Drizzle ORM with PostgreSQL:

- **Legacy**: Enmap-based databases extending `Database` class in `src/common/providers/Database.ts`
- **New**: Drizzle ORM setup in `src/common/db/db.ts` with Neon/PostgreSQL backend
- **Migration**: `Dump` class handles data migration from Enmap to PostgreSQL
- **Schema Management**: `SchemaManager` singleton registers and manages Drizzle schemas

### Configuration System
- **Config Manager**: Centralized configuration in `src/common/config/`
- **Local Development**: Copy `src/common/config/defaults.config.ts` to `src/common/config/local.config.ts`
- **Module Configs**: Each module can have its own configuration section
- **Environment**: Production/development mode detection affects module loading

### Command Types
The bot supports multiple Discord interaction types:
- **Slash Commands** - Modern Discord commands with parameters
- **Text Commands** - Traditional prefix-based commands
- **Context Menu Commands** - Right-click menu items
- **Modal Interactions** - Forms and dialogs

All are managed through dedicated manager classes in `src/common/managers/`.

## Development Setup

### Initial Configuration
1. Install dependencies: `pnpm install`
2. Create config: `cp src/common/config/defaults.config.ts src/common/config/local.config.ts`
3. Set environment variables: `DATABASE_URL`, Discord bot token in config
4. Build project: `pnpm run build`

### Environment Requirements
- **Node.js**: Version 18+ (specified in GitHub Actions)
- **Package Manager**: pnpm (project uses pnpm workspaces)
- **Database**: PostgreSQL/Neon for production (DATABASE_URL environment variable)
- **Canvas Dependencies**: Required for image generation features

### Production vs Development
- **Production Mode**: Enables CustomCommands and ImageProxy modules
- **Development Mode**: Runs core features only, safer for testing
- **Module Loading**: Some modules are production-only for security/performance

### Key Integration Points
- **Express Server**: Runs alongside Discord bot for health checks and image proxy
- **Canvas/Sharp**: Image generation and manipulation capabilities
- **NHL API**: Integration for hockey-related features
- **BlueSky**: Social media integration for cross-posting
- **Scheduled Tasks**: Node-schedule for automated posting and cleanup

## Testing and Quality Assurance

The project enforces code quality through:
- **TypeScript**: Strict type checking with separate test configuration
- **ESLint**: Code linting with TypeScript-specific rules
- **Prettier**: Code formatting consistency
- **Jest**: Unit testing framework with coverage reporting
- **Circular Dependency Detection**: Prevents import cycles
- **GitHub Actions**: Automated CI/CD with version enforcement

Always run `pnpm run build`, `pnpm run lint`, and `pnpm run test` before committing changes.