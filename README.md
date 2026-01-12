# Flyerscord Discord Bot

[![Build](https://github.com/Flyerscord/Flyerscord-Bot/actions/workflows/pr-check.yml/badge.svg?branch=master&event=push)](https://github.com/Flyerscord/Flyerscord-Bot/actions/workflows/pr-check.yml)

A modular Discord bot built for the [Philadelphia Flyer's Discord Server](https://discord.gg/flyers), featuring game day posts, leveling system, custom commands, NHL integration, and more.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development Setup](#local-development-setup)
  - [Docker Development Setup](#docker-development-setup)
- [Development](#development)
  - [Available Commands](#available-commands)
  - [Project Structure](#project-structure)
  - [Configuration Management](#configuration-management)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Documentation](#documentation)

## Features

- **Modular Architecture** - Independent modules including Admin, Levels, GameDayPosts, NHL, Pins, and more
- **Game Day Posts** - Automated NHL game day announcements and updates
- **Leveling System** - Track user activity with XP and levels
- **Custom Commands** - Create and manage custom bot commands
- **NHL Integration** - Live game updates and team information
- **BlueSky Integration** - Cross-post content to BlueSky social media
- **Reaction Roles** - Assign roles via message reactions
- **Database-Driven Configuration** - Type-safe configuration with CLI management tool
- **Health Monitoring** - Built-in health check endpoints for production monitoring

## Tech Stack

### Core Technologies

- **Runtime**: Node.js 24+
- **Language**: TypeScript 5.x
- **Package Manager**: pnpm
- **Discord Framework**: Discord.js v14

### Database & ORM

- **Database**: PostgreSQL (self-hosted)
- **ORM**: Drizzle ORM
- **Connection Pooling**: PgBouncer (Docker)
- **Migrations**: Drizzle Kit

### Key Libraries

- **Image Processing**: Canvas, Sharp
- **Web Server**: Express
- **Task Scheduling**: node-schedule
- **Validation**: Zod v4
- **CLI Tools**: Commander.js, Inquirer
- **Logging**: Stumper

### Development Tools

- **Build Tool**: TypeScript Compiler (tsc)
- **Runtime**: tsx
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Testing**: Jest with ts-jest
- **Dependency Analysis**: Madge (circular dependency detection)
- **Git Hooks**: Husky

### Infrastructure

- **Containerization**: Docker with Docker Compose
- **CI/CD**: GitHub Actions
- **Database Admin**: Adminer

## Getting Started

### Prerequisites

- **Node.js**: Version 24 or higher
- **pnpm**: Install globally with `npm install -g pnpm`
- **PostgreSQL**: Docker (includes PostgreSQL in compose file)

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Flyerscord/Flyerscord-Bot.git
   cd Flyerscord-Bot
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

   You can also install make to run the `make` commands below.

3. **Set up environment variables**

   Create a `.env` file in the root directory using the `.env.example` file as a template.

4. **Initialize the database**

   ```bash
   make dev-bot-db
   ```

5. **Configure the bot**

   ```bash
   pnpm run config:set
   ```

   This will launch an interactive CLI to set required configuration values. See [Configuration Management](#configuration-management) for details.

6. **Build and start the bot**
   ```bash
   pnpm run start:dev
   ```

### Docker Development Setup

Docker Compose provides a complete development environment including PostgreSQL, PgBouncer, the bot, and Adminer for database management.

1. **Clone the repository**

   ```bash
   git clone https://github.com/Flyerscord/Flyerscord-Bot.git
   cd Flyerscord-Bot
   ```

2. **Set up environment variables**

   Create a `.env` file in the root directory using the `.env.example` file as a template.

3. **Start the development stack**

   ```bash
   make dev-bot
   ```

4. **Configure the bot**

   ```bash
   docker exec -it flyerscord-discord-dev-bot-1 pnpm run config:set
   ```

5. **Access services**
   - Bot health check: http://localhost:3333/health
   - Adminer (database UI): http://localhost:6678
     - System: PostgreSQL
     - Server: postgres
     - Username: postgres
     - Password: flyerscord-dev-db
     - Database: flyerscord

6. **View logs**

   ```bash
   docker compose -f docker-compose-dev.yml logs -f bot
   ```

7. **Stop the stack**
   ```bash
   make dev-bot-down
   ```

## Development

### Available Commands

#### Building & Running

```bash
# Type check without emitting files
pnpm run build

# Type check test files
pnpm run build:test

# Start the bot
pnpm run start

# Build then start (recommended)
pnpm run start:dev

# Start with file watching for auto-restart
pnpm run start:watch
```

#### Code Quality

```bash
# Run ESLint
pnpm run lint

# Run ESLint with auto-fix
pnpm run lint:fix

# Format code with Prettier
pnpm run format

# Check for circular dependencies
pnpm run circular-deps

# Run all pre-push checks (build, test, lint)
pnpm run prepush
```

#### Testing

```bash
# Run tests without coverage
pnpm run test

# Run tests with coverage report
pnpm run test:coverage
```

#### Database Management

```bash
# Generate new migration from schema changes
pnpm run db:generate

# Run pending migrations
pnpm run db:migrate

# Push schema changes directly (development)
pnpm run db:push
```

#### Configuration Management

```bash
# Interactive configuration management
pnpm run config

# View current configuration
pnpm run config:view

# Set configuration values
pnpm run config:set
```

See [src/cli/README.md](src/cli/README.md) for detailed CLI documentation.

### Project Structure

```
Flyerscord-Bot/
├── src/
│   ├── bot.ts                 # Main entry point
│   ├── cli/                   # Configuration CLI tool
│   │   ├── config-tool.ts     # CLI entry point
│   │   └── lib/               # CLI implementation
│   ├── common/                # Shared utilities and base classes
│   │   ├── db/                # Database connection and schema
│   │   ├── managers/          # Core managers (Module, Config, etc.)
│   │   ├── models/            # Base classes and interfaces
│   │   └── utils/             # Utility functions
│   └── modules/               # Feature modules
│       ├── admin/             # Admin commands
│       ├── levels/            # XP and leveling system
│       ├── gamedayposts/      # NHL game day posts
│       ├── customcommands/    # Custom command management
│       └── ...                # Other modules
├── drizzle/                   # Database migrations
├── tests/                     # Jest test files
├── docker-compose-dev.yml     # Development Docker setup
├── Dockerfile                 # Production Docker image
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── CLAUDE.md                  # Claude Code assistant guide
└── README.md                  # This file
```

### Configuration Management

The bot uses a database-driven configuration system with type-safe schemas. Each module defines its configuration requirements using Zod schemas.

**CLI Tool Features:**

- Interactive numbered menus (navigate with arrow keys or type numbers)
- Type-safe value validation
- Automatic encryption for sensitive values
- Visual badges for required, encrypted, and restart-required configs

**Quick Examples:**

```bash
# View all configuration
pnpm run config:view

# View specific module
pnpm run config:view --module Levels

# Set configuration interactively
pnpm run config:set

# Set specific config
pnpm run config:set --module Common --key guildId
```

**Docker Usage:**

```bash
# Development container
docker exec -it flyerscord-discord-dev-bot-1 pnpm run config:view
docker exec -it flyerscord-discord-dev-bot-1 pnpm run config:set

# Production container
docker exec -it flyerscord-discord-prod-bot-1 pnpm run config:view
docker exec -it flyerscord-discord-prod-bot-1 pnpm run config:set
```

For complete CLI documentation, see [src/cli/README.md](src/cli/README.md).

## Testing

The project uses Jest for unit testing with TypeScript support via ts-jest.

```bash
# Run tests
pnpm run test

# Run tests with coverage
pnpm run test:coverage

# Type check test files
pnpm run build:test
```

Tests are located in the `tests/` directory and use the `.test.ts` extension.

## Deployment

### Production Docker Deployment

1. **Set environment variables**

   Create a production `.env` file using the `.env.example` file as a template.

2. **Run the container**

   ```bash
   make bot
   ```

3. **Health monitoring**

   The bot exposes a health check endpoint at `http://localhost:3000/health`

### Database Setup

**For Production:**

- Use `DATABASE_URL_POOLED` for runtime operations
- Use `DATABASE_URL_SINGLE` for migrations
- Migrations run automatically via the `migrate` service in Docker Compose

**For Development:**

- Docker Compose includes PostgreSQL 16 and PgBouncer
- Data persists in `./postgres-data/` volume
- Adminer UI available at http://localhost:6678

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run quality checks: `pnpm run prepush`
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

**Code Quality Requirements:**

- All code must pass TypeScript type checking (`pnpm run build`)
- ESLint must pass (`pnpm run lint`)
- All tests must pass (`pnpm run test`)
- No circular dependencies (`pnpm run circular-deps`)

**Commit Guidelines:**

- Use descriptive commit messages
- Reference issue numbers when applicable
- Follow conventional commit format when possible

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Comprehensive guide for Claude Code assistant with architecture details, module system, and development workflows
- **[src/cli/README.md](src/cli/README.md)** - Detailed documentation for the configuration CLI tool

## License

This project is licensed under the GPL-3.0 License.

## Support

For issues, questions, or contributions, please visit the [GitHub Issues](https://github.com/Flyerscord/Flyerscord-Bot/issues) page.
