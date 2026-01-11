// Mock for chalk ESM module
const mockChalk = {
  red: (str: string): string => str,
  green: (str: string): string => str,
  yellow: (str: string): string => str,
  cyan: (str: string): string => str,
  dim: (str: string): string => str,
  bold: {
    cyan: (str: string): string => str,
  },
};

export default mockChalk;
