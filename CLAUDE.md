# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Workflow

Never commit or write code directly on `master`. Before starting any change, create a new branch off `master` first, then work there.

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

- `pnpm run config` - Interactive configuration management CLI
- `pnpm run config:view` - View current configuration values
- `pnpm run config:set` - Interactively modify configuration values (displays numbered lists of modules and keys)

### Database Management

- `pnpm run db:generate` - Generate Drizzle migrations
- `pnpm run db:migrate` - Run Drizzle migrations
- `pnpm run db:push` - Push schema changes to database

## Git Worktrees

This repo is checked out as a bare repo plus worktrees, not a single working directory:

```
Flyerscord-Bot/
  .bare/            # bare git dir (all refs, remotes, local branches)
  .git               # file: "gitdir: ./.bare"
  worktrees/
    master/          # a normal checkout, one per branch
    <branch>/
```

- Add a worktree for a branch: `git worktree add worktrees/<branch> <branch>` (or `-b <branch>` for a new one), run from `Flyerscord-Bot/`.
- Each worktree needs its own `pnpm install` and its own `.env` (copy `.env.example`); these are gitignored and not shared between worktrees.
- Remove a worktree: `git worktree remove worktrees/<branch>` once its branch is merged/deleted.
- All worktrees share one dev database stack; see below.

### Shared Dev Database Stack

`docker-compose-dev.yml` only runs the dev database infra (postgres, pgbouncer, adminer) - it no longer runs the bot in Docker. Bring it up once, from whichever worktree you use as your main checkout:

- `make dev-infra` - start postgres/pgbouncer/adminer (shared across all worktrees)
- `make dev-infra-down` - stop it
- `make dev-infra-clean` - stop it and wipe volumes/images

Every worktree's bot runs on the host against that same stack:

- `pnpm run start:dev` - build and run the bot for that worktree's code
- `pnpm run db:push` / `db:generate` / `db:migrate` - schema management, also against the shared stack
- `pnpm run config:set` / `config:view` (or `make dev-config` / `dev-config-view`) - configuration, no longer via `docker exec`

`DATABASE_URL_POOLED` (via pgbouncer, host port 6432) and `DATABASE_URL_SINGLE` (direct to postgres, host port 5433) point at the shared stack and are set per-worktree in each `.env` - see `.env.example`. Because every worktree talks to the same database, running two worktrees' bots at once means two bot processes on the same config/data; only run one at a time unless you know that's what you want.

## Architecture Overview

### Core Structure

This is a modular Discord bot built with Discord.js v14 and TypeScript. The architecture follows a plugin-based module system where each feature is encapsulated in its own module.

**Key Directories:**

- `src/bot.ts` - Main entry point with comprehensive startup sequence
- `src/common/` - Shared utilities, managers, configuration, and base classes
- `src/modules/` - Feature modules (each Discord bot feature is a separate module)
- `src/cli/` - Configuration management CLI tool

### Module System

The bot uses a centralized ModuleManager that loads modules in a specific order:

1. **HealthCheckModule** - Must be loaded first for monitoring
2. **ImageProxyModule** - Production-only, loaded after HealthCheck
3. **CustomCommandsModule** - Production-only
4. **Core Feature Modules** - Game day posts, levels, pins, etc.
5. **RegisterCommandsModule** - Must be loaded last to register all commands

Each module follows the singleton pattern and extends the base `Module` class.

**Active Modules (19 total):**
Common, Admin, BlueSky, CustomCommands, DaysUntil, GameDayPosts, HealthCheck, ImageProxy, JoinLeave, Levels, Misc, NHL, Pins, PlayerEmojis, ReactionRole, RegisterCommands, Rules, StatsVoiceChannel, VisitorRole

**Module Configuration Pattern:**
Each module exports a `configSchema` array that defines its configuration using Zod validators:

```typescript
export const moduleConfigSchema = [
  {
    key: "module.configKey",
    description: "Description of config",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
] as const satisfies readonly IModuleConfigSchema<ModuleConfigKeys>[];
```

Modules register their schemas during initialization, providing type-safe configuration access throughout the application.

### Code Organization: Common vs. Module-Specific

`src/common/` holds building blocks shared across modules (base classes, managers, `src/common/utils/discord/*` helpers, etc.). When writing or reviewing module code, if a function or a piece of logic is generic (not tied to that module's specific domain/schema) and could plausibly be reused by another module, it belongs in `src/common/` instead of buried in the module.

- Example: a helper that checks whether a Discord role ID still exists in the guild belongs in `src/common/utils/discord/roles.ts`, not duplicated inside a module's utils file.
- Example: a domain-specific calculation (e.g. how a specific module shuffles signups into teams) stays in that module: it isn't reusable outside its own feature.

Don't be aggressive about this. Move something to `common` when the logic itself is genuinely generic (not tied to one module's domain/schema), even if only one module uses it today. But don't extract a one-line wrapper or bolt on parameters/options to a common helper just to make it "more flexible" for a use case that doesn't exist yet; that's over-abstracting the API, not generalizing the logic. Over-abstracting or over-simplifying prematurely makes the code harder to follow than just leaving the logic where it is.

### JSDoc Comments

When creating a new function (exported or module-private), add a JSDoc comment above it describing what it does. Follow the style already used throughout the codebase (e.g. `src/common/utils/discord/roles.ts`): a short description, then `@param` for each parameter and `@returns` when the return value isn't self-evident from the description. Trivial one-line getters/wrappers where the function name already says everything can skip `@param`/`@returns` but should still get at least a one-line description if their purpose isn't obvious from the name alone.

### Database Architecture

The bot uses **Drizzle ORM** with **Neon PostgreSQL** (fully migrated from Enmap):

- **ORM**: Drizzle ORM with PostgreSQL backend via HTTP connections
- **Connection**: `getDb(pooled)` function supports both pooled and direct connections
  - `DATABASE_URL_POOLED` - Pooled connection for runtime operations
  - `DATABASE_URL_SINGLE` - Direct connection for migrations/admin tasks
- **Schema Management**: Each module defines its schema in `db/schema.ts`
- **Common Tables**:
  - `common__config` - Stores all configuration values
  - `common__audit_log` - Audit logging for module operations
- **Migrations**: Managed through Drizzle Kit (`pnpm run db:generate`, `pnpm run db:migrate`, `pnpm run db:push`)

### Configuration System

The bot uses a **database-driven configuration system** with Zod schema validation:

- **Storage**: All configuration stored in `common__config` PostgreSQL table
- **Schema-Driven**: Each module defines its configuration via Zod schemas in `configSchema` exports
- **Type Safety**: Configuration access is fully type-safe using TypeScript types inferred from Zod schemas
- **CLI Tool**: Interactive configuration management via `pnpm run config` (see CLI Tool section)
- **Secret Management**: Encrypted secrets using `SecretManager` with `ENCRYPTION_KEY` environment variable
- **Metadata**: Each config has metadata (required, secret, requiresRestart, description, defaultValue)
- **Access Pattern**: `ConfigManager.getInstance().getConfig<"ModuleName">()`

**No longer uses file-based configuration** - all configs are in the database and managed via the CLI tool.

### Command Types

The bot supports multiple Discord interaction types:

- **Slash Commands** - Modern Discord commands with parameters
- **Text Commands** - Traditional prefix-based commands
- **Context Menu Commands** - Right-click menu items
- **Modal Interactions** - Forms and dialogs

All are managed through dedicated manager classes in `src/common/managers/`.

## CLI Configuration Tool

The bot includes a comprehensive CLI tool for managing configuration (`src/cli/`):

**Commands:**

- `pnpm run config` - Interactive configuration management
- `pnpm run config:view` - View current configuration (supports filtering and --show-secrets flag)
- `pnpm run config:set` - Interactively modify configuration values

**Features:**

- Schema introspection with Zod type analysis
- Support for complex types: strings, numbers, booleans, arrays, objects
- Constraint extraction: min/max lengths, numeric ranges, regex patterns
- Interactive selection menus with numbered lists of modules and config keys
- Visual badges for config metadata (required, secret, restart required)
- Encrypted secret handling with visual indicators
- Table-based display of configuration values
- Type-safe value validation during input

**CLI Architecture:**

- `config-tool.ts` - Main entry point using Commander.js
- `ConfigCLI.ts` - CLI orchestrator with view/set commands
- `ConfigViewer.ts` - Display configuration with formatting and tables
- `ConfigSetter.ts` - Interactive prompts with numbered module/key lists
- `InteractivePrompts.ts` - Zod schema-based prompt generation
- `SchemaInspector.ts` - Analyzes Zod schemas to extract type/constraint info
- `types.ts` - Shared type definitions for CLI

## Development Setup

### Initial Configuration

1. Install dependencies: `pnpm install`
2. Set environment variables:
   - `DATABASE_URL_POOLED` - Pooled PostgreSQL connection
   - `DATABASE_URL_SINGLE` - Direct PostgreSQL connection
   - `ENCRYPTION_KEY` - Key for encrypting secret configuration values
   - `DISCORD_TOKEN` - Discord bot token (can also be set via config CLI)
3. Run database migrations: `pnpm run db:push`
4. Configure the bot: `pnpm run config:set`
5. Build project: `pnpm run build`

### Environment Requirements

- **Node.js**: Version 24+ (specified in GitHub Actions)
- **Package Manager**: pnpm (project uses pnpm workspaces)
- **Database**: Neon PostgreSQL with HTTP connections
  - `DATABASE_URL_POOLED` - Pooled connection for runtime operations
  - `DATABASE_URL_SINGLE` - Direct connection for migrations/admin tasks
- **Environment Variables**:
  - `DATABASE_URL_POOLED` - Required for database operations
  - `DATABASE_URL_SINGLE` - Required for migrations
  - `ENCRYPTION_KEY` - Required for encrypting configuration secrets
  - `DISCORD_TOKEN` - Discord bot token (can be set via database config instead)
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

## Adding New Configuration to Modules

When adding new configuration options to a module:

### IModuleConfigSchema Interface

All module configuration schemas must conform to the `IModuleConfigSchema<TKey>` interface defined in [src/common/models/Module.ts](src/common/models/Module.ts#L18-L47):

```typescript
export interface IModuleConfigSchema<TKey extends string> {
  /**
   * The key of the config in the database
   */
  key: TKey;
  /**
   * The description of the config setting
   */
  description: string;
  /**
   * Whether the config is required for the module to function
   */
  required: boolean;
  /**
   * Whether the config is secret and should not be displayed in the UI
   */
  secret: boolean;
  /**
   * Whether the config requires a restart of the bot to take effect
   */
  requiresRestart: boolean;
  /**
   * The default value of the config setting. Only used if the config is not required.
   */
  defaultValue: z.infer<z.ZodType>;
  /**
   * The Zod schema for the config setting. If the value is encrypted a transform is used in the schema.
   */
  schema: z.ZodType;
}
```

**Field Descriptions:**

- **key**: The database key in `moduleName.configName` format (e.g., `"levels.xpPerMessage"`)
- **description**: Human-readable description shown in the CLI tool
- **required**: If `true`, the config must have a value for the module to function
- **secret**: If `true`, the value will be hidden in CLI output and marked as secret in the UI
- **requiresRestart**: If `true`, changing this config requires restarting the bot
- **defaultValue**: Used when `required: false` and no value is set (can be any type matching the schema)
- **schema**: Zod validator that defines the type and validation rules
  - To encrypt a value in the database, use Zod transforms (detected by `SchemaInspector.isEncryptedString()`)
  - Encryption is separate from the `secret` field - encryption protects storage, `secret` controls visibility

**Important Notes:**

- The `secret` field controls UI visibility and is displayed as a badge in the CLI
- Database encryption is implemented through Zod schema transforms, not the `secret` field
- The CLI tool uses `SchemaInspector.isEncryptedString()` to detect encrypted schemas and display an "encrypted" badge
- A config can be both secret (hidden in UI) and encrypted (protected in database), or either independently

### Creating a Config Schema

1. **Define the config schema** in your module file:

```typescript
import { Zod } from "zod";
import type { IModuleConfigSchema } from "../common/types/ModuleConfig";

export type YourModuleConfigKeys = "yourModule.setting1" | "yourModule.setting2";

export const yourModuleConfigSchema = [
  {
    key: "yourModule.setting1",
    description: "Description of setting1",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "default",
    schema: Zod.string().min(1),
  },
  {
    key: "yourModule.setting2",
    description: "Sensitive API key",
    required: true,
    secret: true, // Will be encrypted
    requiresRestart: true,
    defaultValue: "",
    schema: Zod.string(),
  },
] as const satisfies readonly IModuleConfigSchema<YourModuleConfigKeys>[];
```

2. **Register the schema** in your module's constructor:

```typescript
constructor() {
  super("YourModule", yourModuleConfigSchema, []);
}
```

3. **Access configuration** in your module:

```typescript
const config = ConfigManager.getInstance().getConfig<"YourModule">();
const setting1 = config["yourModule.setting1"];
```

4. **Set values via CLI**:

```bash
pnpm run config:set
```

The CLI tool will automatically discover your new configuration schema and provide interactive prompts based on the Zod validators.

## Working with the Database

### Schema Definition

Each module defines its database schema in `src/modules/<module>/db/schema.ts` using Drizzle ORM:

```typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const yourModuleTable = pgTable("your_module__table_name", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Naming Convention**: Use `modulename__tablename` format (e.g., `levels__user_xp`, `pins__pinned_messages`)

### Schema Changes

When you modify a schema:

1. **Update the schema file** in `src/modules/<module>/db/schema.ts`
2. **Generate migration**: `pnpm run db:generate`
3. **Review the generated migration** in `drizzle/` directory
4. **Apply migration**: `pnpm run db:migrate`

For development, you can use `pnpm run db:push` to push schema changes directly without generating migrations.

**One migration per feature branch**: a feature branch should produce a single migration file, not one per schema-editing session. If the schema changes again before the branch merges (including edits made in response to review feedback partway through building the feature), delete the previous migration (its `.sql` file and its `meta/<n>_snapshot.json`), revert `meta/_journal.json` to drop its entry (`git checkout -- drizzle/migrations/meta/_journal.json` if nothing has been committed yet, otherwise re-edit it by hand), and re-run `pnpm run db:generate` to produce one fresh migration reflecting the final schema. Only keep multiple migrations on one branch when truly necessary, e.g. a data backfill that must run as its own step, or a migration that was already applied to a shared database and can no longer be edited.

### Database Access

Access the database in your module:

```typescript
import { getDb } from "../../common/db";
import { yourModuleTable } from "./db/schema";

// Use pooled connection for runtime operations
const db = getDb(true);
const results = await db.select().from(yourModuleTable);

// Use single connection for admin/migration tasks
const dbSingle = getDb(false);
```
