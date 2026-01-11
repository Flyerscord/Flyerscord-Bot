// Mock for cli-table3 ESM module
const MockTable = jest.fn().mockImplementation(() => ({
  push: jest.fn(),
  toString: jest.fn().mockReturnValue("mocked-table"),
}));

export default MockTable;
