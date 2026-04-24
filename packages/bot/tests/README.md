# Testing Guide

This document explains the test suite for the Flyerscord Bot.

## Overview

The project uses Jest as the testing framework with TypeScript support via `ts-jest`. Tests are located in the `tests/` directory.

## Running Tests

```bash
# Run all tests without coverage
pnpm run test

# Run all tests with coverage report
pnpm run test:coverage

# Run a specific test file
pnpm run test -- tests/cli/SchemaInspector.test.ts
```

## Test Structure

```
tests/
├── setup.ts                              # Jest global setup (auto-loaded)
├── cli/
│   ├── SchemaInspector.test.ts           # Zod schema introspection tests
│   └── ConfigSetter.encryption.test.ts   # Encryption integration tests
└── common/
    ├── config/
    │   └── ConfigManager.test.ts         # Configuration management tests
    └── managers/
        └── SecretManager.test.ts         # Encryption/decryption tests
```

## Test Categories

### CLI Tests

- **SchemaInspector.test.ts**: Tests the Zod schema analysis utilities used by the config CLI tool
- **ConfigSetter.encryption.test.ts**: Tests the integration between encrypted config schemas and the SecretManager

### Common Tests

- **ConfigManager.test.ts**: Tests the database-driven configuration system including schema registration, config loading, and validation
- **SecretManager.test.ts**: Tests AES-256-GCM encryption/decryption for sensitive configuration values

## Best Practices

1. **Reset mocks**: Use `beforeEach` to create fresh mocks for each test
2. **Clear singletons**: Reset singleton instances between tests to avoid state leakage
3. **Test behavior, not implementation**: Focus on what the method returns, not internal details
4. **Keep tests isolated**: Each test should be independent and not rely on others

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
