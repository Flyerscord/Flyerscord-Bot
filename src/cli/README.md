# Configuration CLI Tool

A comprehensive command-line interface for managing the Flyerscord bot's database-driven configuration system. This tool provides interactive prompts for viewing and modifying configuration values with built-in type safety and validation.

## Table of Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Commands](#commands)
  - [View Configuration](#view-configuration)
  - [Set Configuration](#set-configuration)
- [Features](#features)
- [Architecture](#architecture)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Overview

The Configuration CLI tool provides a safe, interactive way to manage bot configuration stored in the PostgreSQL database. All configuration values are validated against Zod schemas defined by each module, ensuring type safety and data integrity.

**Key Benefits:**
- Interactive numbered menus for easy navigation
- Type-safe value validation using Zod schemas
- Automatic encryption for sensitive values
- Visual indicators for required fields, encrypted values, and restart requirements
- Comprehensive error handling and input validation

## Requirements

Before using the CLI tool, ensure you have:

1. **Environment Variables Set:**
   - `DATABASE_URL_POOLED` - PostgreSQL connection string (pooled)
   - `ENCRYPTION_KEY` - Key for encrypting secret configuration values

2. **Database Initialized:**
   - Run `pnpm run db:push` to ensure the latest schema is applied

3. **Dependencies Installed:**
   - Run `pnpm install` to install all required packages

## Quick Start

### Local Development

### View All Configuration
```bash
pnpm run config:view
```

### Set Configuration Values
```bash
pnpm run config:set
```

### View Specific Module
```bash
pnpm run config:view --module Common
```

### Set Specific Config
```bash
pnpm run config:set --module Levels --key xpPerMessage
```

### Running from Docker Container

If the bot is running inside a Docker container, you can execute the CLI tool using `docker exec`:

### Production Container
```bash
docker exec -it flyerscord-discord-prod-bot-1 pnpm run config:view
docker exec -it flyerscord-discord-prod-bot-1 pnpm run config:set
```

### Development Container
```bash
docker exec -it flyerscord-discord-dev-bot-1 pnpm run config:view
docker exec -it flyerscord-discord-dev-bot-1 pnpm run config:set
```

### Examples with Docker
```bash
# View specific module in production
docker exec -it flyerscord-discord-prod-bot-1 pnpm run config:view --module Levels

# Set specific config in development
docker exec -it flyerscord-discord-dev-bot-1 pnpm run config:set --module Levels --key xpPerMessage
```

**Note:** The `-it` flags are required for interactive prompts to work properly. These flags enable:
- `-i` - Interactive mode (keeps STDIN open)
- `-t` - Allocates a pseudo-TTY (required for colored output and prompts)

## Commands

### View Configuration

Display current configuration values across all modules or filter by specific criteria.

**Usage:**
```bash
pnpm run config:view [options]
```

**Options:**
- `-m, --module <module>` - Filter by module name (e.g., "Common", "Levels")
- `-k, --key <key>` - View specific config key (format: `Module.key`)

**Examples:**
```bash
# View all configuration
pnpm run config:view

# View configuration for a specific module
pnpm run config:view --module Levels

# View a specific config key
pnpm run config:view --key levels.xpPerMessage
```

**Output Format:**

The view command displays configuration in a formatted table with:
- **Key** - The configuration key name
- **Description** - Human-readable description of the config
- **Type** - Data type with constraints (e.g., `string (length: 1-100)`, `number (range: 1-100)`)
- **Required** - Whether the config must be set (Yes/No)
- **Current Value** - The current value or indication if not set

### Set Configuration

Interactively modify configuration values with guided prompts and validation.

**Usage:**
```bash
pnpm run config:set [options]
```

**Options:**
- `-m, --module <module>` - Jump directly to a specific module
- `-k, --key <key>` - Jump directly to a specific config key

**Examples:**
```bash
# Interactive mode - select module and key via menus
pnpm run config:set

# Jump to specific module
pnpm run config:set --module Levels

# Jump to specific config
pnpm run config:set --module Levels --key xpPerMessage
```

**Interactive Flow:**

1. **Select Module** - Choose from a numbered list of available modules
   - Navigate using **arrow keys** (↑/↓) or type the **number** and press Enter
2. **Select Config Key** - Choose from configuration options with visual badges:
   - Navigate using **arrow keys** (↑/↓) or type the **number** and press Enter
   - `[req]` - Required configuration
   - `[encrypted]` - Value will be encrypted in the database
   - `[restart]` - Requires bot restart to take effect
3. **View Current Info** - See current value, type, and metadata
4. **Enter New Value** - Prompted based on the schema type:
   - **String** - Text input with length validation
   - **Number** - Numeric input with range validation
   - **Boolean** - Yes/No confirmation
   - **Array** - JSON array input with element validation
   - **Object** - JSON object input with structure validation
5. **Preview Changes** - Review old and new values
6. **Confirm** - Approve or cancel the change
7. **Save** - Value is validated, optionally encrypted, and saved to database
8. **Continue** - Option to set another configuration value

## Features

### Type Safety

All configuration values are validated against Zod schemas defined by each module:

```typescript
{
  key: "levels.xpPerMessage",
  description: "XP awarded per message",
  required: true,
  secret: false,
  requiresRestart: false,
  defaultValue: 10,
  schema: Zod.number().min(1).max(100),
}
```

The CLI automatically extracts type information and constraints from schemas:
- String length constraints (min/max)
- Number range constraints (min/max)
- Regex patterns
- Array element types
- Object structures

### Secret Management

Values marked with encrypted schemas are automatically encrypted before storage:

```typescript
schema: Zod.string().transform((val) => SecretManager.getInstance().decrypt(val))
```

- Encrypted values are stored securely in the database
- The CLI displays an "encrypted" badge for these fields
- Values are decrypted automatically when retrieved

### Visual Indicators

The CLI uses color-coded badges and formatting:

- **Required Fields** - Red `[req]` badge indicates mandatory configuration
- **Encrypted Values** - Yellow `[encrypted]` badge for secure storage
- **Restart Required** - Magenta `[restart]` badge for configs requiring bot restart
- **Type Information** - Gray text showing data type and constraints
- **Current Values** - Color-coded display (green for true, red for false, etc.)

### Input Validation

All input is validated before saving:

- **Type Checking** - Ensures values match the expected type
- **Constraint Validation** - Enforces min/max lengths, numeric ranges, patterns
- **Schema Validation** - Full Zod validation pipeline
- **Error Handling** - Clear error messages with retry prompts

## Architecture

The CLI tool is structured with clear separation of concerns:

### Core Components

- **[config-tool.ts](config-tool.ts)** - Entry point, initializes managers and runs the CLI
- **[lib/ConfigCLI.ts](lib/ConfigCLI.ts)** - CLI orchestrator using Commander.js for command routing
- **[lib/ConfigViewer.ts](lib/ConfigViewer.ts)** - Displays configuration with formatted tables
- **[lib/ConfigSetter.ts](lib/ConfigSetter.ts)** - Interactive configuration modification workflow
- **[lib/InteractivePrompts.ts](lib/InteractivePrompts.ts)** - Reusable prompts for user input
- **[lib/SchemaInspector.ts](lib/SchemaInspector.ts)** - Analyzes Zod schemas to extract type/constraint info
- **[lib/types.ts](lib/types.ts)** - Shared TypeScript type definitions

### Data Flow

1. **Startup** - ConfigManager loads all module config schemas from the database
2. **User Input** - Commander.js parses command-line arguments
3. **Schema Analysis** - SchemaInspector extracts type information from Zod schemas
4. **Interactive Prompts** - User selects module/key and enters new value
5. **Validation** - Zod validates input against schema constraints
6. **Storage** - Value is encrypted (if needed) and saved to PostgreSQL
7. **Refresh** - ConfigManager reloads configuration from database

### Integration Points

- **ModuleManager** - Registers all modules and their config schemas
- **ConfigManager** - Manages configuration state and database access
- **SecretManager** - Handles encryption/decryption of sensitive values
- **Drizzle ORM** - Database operations for the `common__config` table

## Examples

### Example 1: Setting a Required String Value

```bash
$ pnpm run config:set

📋 Select Module
1) Admin (3 configs)
2) Common (2 configs)
3) Levels (5 configs)
...

Enter number: 2

⚙️  Select Config Key for Common
1) common.discordToken (string) [req] [encrypted] [restart] - Discord bot token
2) common.guildId (string) [req] - Discord server ID

Enter number: 2

=== Config Information ===
Module: Common
Key: common.guildId
Description: Discord server ID
Type: string
Required: Yes
Encrypted: No
Current value: (not set)

=== Enter New Value ===
Enter value: 123456789012345678

=== Preview Changes ===
Module: Common
Key: common.guildId
Old Value: (not set)
New Value: 123456789012345678

Save this change? (Y/n): y

✓ Successfully updated Common.common.guildId
```

### Example 2: Setting a Number with Constraints

```bash
$ pnpm run config:set --module Levels --key xpPerMessage

=== Config Information ===
Module: Levels
Key: levels.xpPerMessage
Description: XP awarded per message
Type: number (range: 1-100)
Required: Yes
Encrypted: No
Current value: 10

=== Enter New Value ===
Enter value: 150

✗ Validation failed: Number must be at most 100

Enter value: 15

=== Preview Changes ===
Module: Levels
Key: levels.xpPerMessage
Old Value: 10
New Value: 15

Save this change? (Y/n): y

✓ Successfully updated Levels.levels.xpPerMessage
```

### Example 3: Setting an Array Value

```bash
$ pnpm run config:set --module CustomCommands --key allowedRoles

=== Config Information ===
Module: CustomCommands
Key: customCommands.allowedRoles
Description: Roles allowed to manage custom commands
Type: array of string
Required: No
Encrypted: No
Current value: ["123456789", "987654321"]

=== Enter New Value ===
Enter JSON array: ["123456789", "987654321", "555555555"]

=== Preview Changes ===
Module: CustomCommands
Key: customCommands.allowedRoles
Old Value: ["123456789", "987654321"]
New Value: ["123456789", "987654321", "555555555"]

Save this change? (Y/n): y

✓ Successfully updated CustomCommands.customCommands.allowedRoles
```

### Example 4: Viewing Configuration

```bash
$ pnpm run config:view --module Levels

=== Levels ===
┌──────────────────────┬────────────────────────────┬──────────────────┬──────────┬─────────────┐
│ Key                  │ Description                │ Type             │ Required │ Current Val │
├──────────────────────┼────────────────────────────┼──────────────────┼──────────┼─────────────┤
│ levels.xpPerMessage  │ XP awarded per message     │ number (1-100)   │ Yes      │ 15          │
├──────────────────────┼────────────────────────────┼──────────────────┼──────────┼─────────────┤
│ levels.xpCooldown    │ Cooldown between XP gains  │ number (0-3600)  │ Yes      │ 60          │
├──────────────────────┼────────────────────────────┼──────────────────┼──────────┼─────────────┤
│ levels.enabledVoiceXp│ Enable XP from voice chat  │ boolean          │ No       │ true        │
└──────────────────────┴────────────────────────────┴──────────────────┴──────────┴─────────────┘
```

## Troubleshooting

### Common Issues

**Issue: "Missing environment variables"**
```
Missing environment variables: DATABASE_URL_POOLED, ENCRYPTION_KEY
```
**Solution:** Set the required environment variables in your `.env` file or shell:
```bash
export DATABASE_URL_POOLED="postgresql://..."
export ENCRYPTION_KEY="your-encryption-key"
```

**Issue: "Configs have not been loaded yet"**
**Solution:** This indicates a database connection issue. Verify:
1. Database is running and accessible
2. `DATABASE_URL_POOLED` is correct
3. Schema is up to date: `pnpm run db:push`

**Issue: "Validation failed" when entering values**
**Solution:** Check the type description and constraints shown in the config information. Ensure your value:
- Matches the expected type (string, number, boolean, array, object)
- Meets length/range constraints
- Follows any regex patterns

**Issue: Changes not taking effect**
**Solution:** If the config has a `[restart]` badge, you must restart the bot:
```bash
pnpm run start:dev
```

**Issue: "No configs found for module"**
**Solution:** The module may not have any configuration defined, or the module failed to register. Check:
1. Module is listed in the active modules
2. Module exports a `configSchema` array
3. Module is properly registered in ModuleManager

### Debug Mode

For troubleshooting, you can check the database directly:

```sql
-- View all configuration
SELECT * FROM common__config ORDER BY "moduleName", key;

-- View specific module
SELECT * FROM common__config WHERE "moduleName" = 'Levels';

-- Check for required configs that are not set
SELECT cs.key, cs.description
FROM common__config_schemas cs
LEFT JOIN common__config c ON cs.key = c.key
WHERE cs.required = true AND c.value IS NULL;
```

### Getting Help

If you encounter issues:

1. Check the [CLAUDE.md](../../CLAUDE.md) file for additional context
2. Review module configuration schemas in `src/modules/<module>/index.ts`
3. Verify database schema is up to date: `pnpm run db:push`
4. Check logs for detailed error messages

---

**Note:** This CLI tool is part of the Flyerscord bot project. For more information about the overall architecture and development workflow, see the main [CLAUDE.md](../../CLAUDE.md) file.
