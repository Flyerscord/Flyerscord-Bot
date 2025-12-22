/**
 * Helper functions for mocking Drizzle database operations in tests
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Creates a mock database query builder that can be chained
 * This allows mocking Drizzle queries like: db.select().from().where()
 *
 * @param mockResult - The final result to return when the query chain completes
 * @returns A chainable mock object
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createMockQueryBuilder(mockResult: any): any {
  const mockQuery: any = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnValue(mockResult),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnValue(mockResult),
    limit: jest.fn().mockReturnValue(mockResult),
    execute: jest.fn().mockReturnValue(mockResult),
    $client: jest.fn(),
  };

  return mockQuery;
}

/**
 * Sets up a mock for a specific query pattern
 *
 * @example
 * ```typescript
 * const mockDb = setupMockQuery({
 *   select: [{ id: 1, name: 'test' }]
 * });
 * ```
 */
export function setupMockQuery(options: { select?: any; insert?: any; update?: any; delete?: any }): any {
  const mockDb: any = {
    $client: jest.fn(),
  };

  if (options.select !== undefined) {
    mockDb.select = jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(options.select),
        limit: jest.fn().mockResolvedValue(options.select),
      }),
    });
  }

  if (options.insert !== undefined) {
    mockDb.insert = jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue(options.insert),
      }),
    });
  }

  if (options.update !== undefined) {
    mockDb.update = jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(options.update),
      }),
    });
  }

  if (options.delete !== undefined) {
    mockDb.delete = jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(options.delete),
    });
  }

  mockDb.execute = jest.fn().mockResolvedValue([]);

  return mockDb;
}
