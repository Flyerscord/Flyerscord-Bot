/**
 * Jest setup file for global test configuration
 */

// Mock environment variables for database
process.env.DATABASE_URL_POOLED = "mock://database";
process.env.DATABASE_URL_SINGLE = "mock://database";
