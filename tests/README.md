# Testing Guide

This document explains how to write tests for the Flyerscord Bot, particularly when working with Drizzle ORM database operations.

## Overview

The project uses Jest as the testing framework with TypeScript support via `ts-jest`. Tests are located in the `tests/` directory and mirror the structure of the `src/` directory.

## Running Tests

```bash
# Run all tests without coverage
pnpm run test

# Run all tests with coverage report
pnpm run test:coverage

# Run a specific test file
pnpm run test -- tests/modules/customCommands/db/CustomCommandsDB.test.ts
```

## Database Mocking with Drizzle

Since our application uses Drizzle ORM with Neon PostgreSQL, we mock the database connection to avoid requiring a real database during tests.

### Basic Setup

Every test file that uses database classes needs to mock `getDb()`:

```typescript
import { getDb } from "@common/db/db";

// Mock the database module
jest.mock("@common/db/db");

const mockGetDb = getDb as jest.MockedFunction<typeof getDb>;
```

### Mocking Query Chains

Drizzle uses method chaining for queries. Here's how to mock different query patterns:

#### SELECT Query

```typescript
// Mock: db.select().from(table).where(condition)
mockDb.select.mockReturnValue({
  from: jest.fn().mockReturnValue({
    where: jest.fn().mockResolvedValue([{ id: 1, name: "test" }]),
  }),
});
```

#### INSERT Query

```typescript
// Mock: db.insert(table).values(data).returning()
mockDb.insert.mockReturnValue({
  values: jest.fn().mockReturnValue({
    returning: jest.fn().mockResolvedValue([{ id: 1 }]),
  }),
});
```

#### UPDATE Query

```typescript
// Mock: db.update(table).set(data).where(condition)
mockDb.update.mockReturnValue({
  set: jest.fn().mockReturnValue({
    where: jest.fn().mockResolvedValue([]),
  }),
});
```

#### DELETE Query

```typescript
// Mock: db.delete(table).where(condition)
mockDb.delete.mockReturnValue({
  where: jest.fn().mockResolvedValue([]),
});
```

### Complete Test Example

See [CustomCommandsDB.test.ts](./modules/customCommands/db/CustomCommandsDB.test.ts) for a complete example:

```typescript
import CustomCommandsDB from "@modules/customCommands/db/CustomCommandsDB";
import { getDb } from "@common/db/db";
import CustomCommandsModule from "@modules/customCommands/CustomCommandsModule";

// Mock getDb
jest.mock("@common/db/db");
const mockGetDb = getDb as jest.MockedFunction<typeof getDb>;

describe("CustomCommandsDB", () => {
  let mockDb: any;

  beforeEach(() => {
    // Initialize module with test config
    CustomCommandsModule.getInstance({
      customcommands: {
        prefix: "!",
        // ... other config
      },
    });

    // Create fresh mock database for each test
    mockDb = {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      execute: jest.fn(),
      $client: jest.fn(),
    };

    mockGetDb.mockReturnValue(mockDb);
  });

  it("should return command when it exists", async () => {
    const mockCommand = {
      id: 1,
      name: "testcommand",
      text: "test response",
      createdBy: "user123",
      createdOn: new Date(),
    };

    // Mock the query chain
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([mockCommand]),
      }),
    });

    const db = new CustomCommandsDB();
    const result = await db.getCommand("testcommand");

    expect(result).toEqual(mockCommand);
  });
});
```

## Testing Pure Logic

For testing pure business logic that doesn't interact with the database, you can test the methods directly without mocking:

```typescript
import CustomCommandsDB from "@modules/customCommands/db/CustomCommandsDB";

describe("createCommandListMessages", () => {
  it("should format commands correctly", () => {
    const db = new CustomCommandsDB();
    const commands = [{ name: "cmd1" }, { name: "cmd2" }];

    const result = db.createCommandListMessages(commands);

    expect(result[0]).toContain("!cmd1");
    expect(result[0]).toContain("!cmd2");
  });
});
```

## Best Practices

1. **Mock at the right level**: Mock `getDb()` rather than individual Drizzle methods
2. **Reset mocks**: Use `beforeEach` to create fresh mocks for each test
3. **Test behavior, not implementation**: Focus on what the method returns, not how it queries
4. **Use TypeScript**: Let TypeScript catch errors in your mocks
5. **Keep tests isolated**: Each test should be independent and not rely on others

## Module Testing

When testing modules that extend `Module` class, initialize them with test configuration:

```typescript
CustomCommandsModule.getInstance({
  customcommands: {
    prefix: "!",
    commandTempChannelId: "",
    customCommandListChannelId: "",
    // ... other required config
  },
});
```

## Troubleshooting

### "Database connection string format" error

This means the database mock wasn't set up. Make sure you:
1. Import and mock `getDb` at the top of your test file
2. Set up the mock in `beforeEach`

### "Property 'from' does not exist" TypeScript error

Use `any` type for the mock database object to avoid TypeScript complaints about chainable methods.

### Tests failing intermittently

Make sure you're resetting mocks in `beforeEach` to avoid state leaking between tests.

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Testing Best Practices](https://testingjavascript.com/)
