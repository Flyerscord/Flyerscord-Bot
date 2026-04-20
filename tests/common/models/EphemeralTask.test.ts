// Mock node-schedule before any imports
const mockJobCancel = jest.fn();
const mockJob = { cancel: mockJobCancel };
const mockScheduleJob = jest.fn().mockReturnValue(mockJob);

jest.mock("node-schedule", () => ({
  __esModule: true,
  default: {
    scheduleJob: mockScheduleJob,
  },
  scheduleJob: mockScheduleJob,
}));

const mockStumper = {
  error: jest.fn(),
  warning: jest.fn(),
  caughtError: jest.fn(),
  success: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

jest.mock("stumper", () => mockStumper);

import EphemeralTask from "@common/models/EphemeralTask";
import { Singleton } from "@common/models/Singleton";

// Concrete implementation for testing
class TestEphemeralTask extends EphemeralTask {
  public executeCallCount = 0;
  public executeError: Error | undefined = undefined;

  constructor(date?: Date) {
    super("TestTask", date);
  }

  protected async execute(): Promise<void> {
    this.executeCallCount++;
    if (this.executeError) {
      throw this.executeError;
    }
  }

  // Expose private run method for testing via a public wrapper
  async triggerRun(): Promise<void> {
    // Access the run method via reflection for testing
    await (this as unknown as { run(): Promise<void> }).run();
  }
}

// Helper to clear only the TestEphemeralTask singleton instance
function clearTestSingleton(): void {
  // @ts-expect-error - Accessing private static field for testing
  (Singleton as unknown as { instances: Map<unknown, unknown> }).instances.delete(TestEphemeralTask);
}

describe("EphemeralTask", () => {
  let task: TestEphemeralTask;

  beforeEach(() => {
    jest.clearAllMocks();

    // Clear singleton instance so we get a fresh one each test
    clearTestSingleton();

    task = TestEphemeralTask.getInstance();
  });

  describe("constructor", () => {
    it("should append _Ephemeral to the name", () => {
      expect(task.getName()).toBe("TestTask_Ephemeral");
    });

    it("should have undefined date when none is provided", () => {
      expect(task.getDate()).toBeUndefined();
    });

    it("should set the initial date when provided", () => {
      // Clear singleton to get a fresh instance with a date
      clearTestSingleton();

      const futureDate = new Date(Date.now() + 10_000);
      const taskWithDate = TestEphemeralTask.getInstance(futureDate);
      expect(taskWithDate.getDate()).toBe(futureDate);
    });
  });

  describe("getName", () => {
    it("should return the name with _Ephemeral suffix", () => {
      expect(task.getName()).toBe("TestTask_Ephemeral");
    });
  });

  describe("getDate", () => {
    it("should return undefined when no date has been set", () => {
      expect(task.getDate()).toBeUndefined();
    });

    it("should return the date after setDate is called with a future date", () => {
      const futureDate = new Date(Date.now() + 60_000);
      task.setDate(futureDate);
      expect(task.getDate()).toBe(futureDate);
    });
  });

  describe("setDate", () => {
    it("should set a future date and create a scheduled job", () => {
      const futureDate = new Date(Date.now() + 60_000);
      task.setDate(futureDate);

      expect(task.getDate()).toBe(futureDate);
      expect(mockScheduleJob).toHaveBeenCalledWith(futureDate, expect.any(Function));
    });

    it("should reject a date in the past", () => {
      const pastDate = new Date(Date.now() - 60_000);
      task.setDate(pastDate);

      expect(task.getDate()).toBeUndefined();
      expect(mockStumper.error).toHaveBeenCalled();
      expect(mockScheduleJob).not.toHaveBeenCalled();
    });

    it("should reject a date that is exactly now (same millisecond)", () => {
      const nowDate = new Date(Date.now() - 1); // 1ms in the past
      task.setDate(nowDate);

      expect(task.getDate()).toBeUndefined();
      expect(mockStumper.error).toHaveBeenCalled();
    });

    it("should remove existing scheduled job before creating a new one when date is reset", () => {
      const firstDate = new Date(Date.now() + 60_000);
      task.setDate(firstDate);
      expect(mockScheduleJob).toHaveBeenCalledTimes(1);

      const secondDate = new Date(Date.now() + 120_000);
      task.setDate(secondDate);

      // Cancel should have been called on the old job
      expect(mockJobCancel).toHaveBeenCalledTimes(1);
      // Schedule should have been called twice total
      expect(mockScheduleJob).toHaveBeenCalledTimes(2);
      expect(task.getDate()).toBe(secondDate);
    });
  });

  describe("getTimeUntilExecution", () => {
    it("should return -1 when no date is set", () => {
      expect(task.getTimeUntilExecution()).toBe(-1);
    });

    it("should return a positive number for a future date", () => {
      const futureDate = new Date(Date.now() + 60_000);
      task.setDate(futureDate);

      const timeUntil = task.getTimeUntilExecution();
      expect(timeUntil).toBeGreaterThan(0);
      expect(timeUntil).toBeLessThanOrEqual(60_000);
    });

    it("should return approximate time until future date", () => {
      const delayMs = 30_000;
      const futureDate = new Date(Date.now() + delayMs);
      task.setDate(futureDate);

      const timeUntil = task.getTimeUntilExecution();
      // Allow for a small tolerance due to test execution time
      expect(timeUntil).toBeGreaterThan(delayMs - 500);
      expect(timeUntil).toBeLessThanOrEqual(delayMs);
    });
  });

  describe("isActive", () => {
    it("should return false when no job is scheduled", () => {
      expect(task.isActive()).toBe(false);
    });

    it("should return true after setDate is called with a future date", () => {
      const futureDate = new Date(Date.now() + 60_000);
      task.setDate(futureDate);

      expect(task.isActive()).toBe(true);
    });

    it("should return false after removeScheduledJob is called", () => {
      const futureDate = new Date(Date.now() + 60_000);
      task.setDate(futureDate);
      expect(task.isActive()).toBe(true);

      task.removeScheduledJob();
      expect(task.isActive()).toBe(false);
    });
  });

  describe("removeScheduledJob", () => {
    it("should do nothing when no job is scheduled", () => {
      // Should not throw
      task.removeScheduledJob();

      expect(mockJobCancel).not.toHaveBeenCalled();
    });

    it("should cancel the scheduled job", () => {
      const futureDate = new Date(Date.now() + 60_000);
      task.setDate(futureDate);

      task.removeScheduledJob();

      expect(mockJobCancel).toHaveBeenCalledTimes(1);
    });

    it("should clear the date after removing the job", () => {
      const futureDate = new Date(Date.now() + 60_000);
      task.setDate(futureDate);
      expect(task.getDate()).toBe(futureDate);

      task.removeScheduledJob();

      expect(task.getDate()).toBeUndefined();
    });

    it("should set isActive to false after removal", () => {
      const futureDate = new Date(Date.now() + 60_000);
      task.setDate(futureDate);
      expect(task.isActive()).toBe(true);

      task.removeScheduledJob();
      expect(task.isActive()).toBe(false);
    });

    it("should be idempotent - calling twice should not throw", () => {
      const futureDate = new Date(Date.now() + 60_000);
      task.setDate(futureDate);

      task.removeScheduledJob();
      // Second call should not throw and not call cancel again
      task.removeScheduledJob();

      expect(mockJobCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("run (via triggerRun)", () => {
    it("should call execute and then remove the scheduled job", async () => {
      const futureDate = new Date(Date.now() + 60_000);
      task.setDate(futureDate);
      expect(task.isActive()).toBe(true);

      await task.triggerRun();

      expect(task.executeCallCount).toBe(1);
      // After run, the job should be removed (run calls removeScheduledJob in finally)
      expect(task.isActive()).toBe(false);
    });

    it("should log info messages when running", async () => {
      await task.triggerRun();

      expect(mockStumper.info).toHaveBeenCalledWith(
        expect.stringContaining("Running EphemeralTask"),
        "common:EphemeralTask:run",
      );
      expect(mockStumper.info).toHaveBeenCalledWith(
        expect.stringContaining("Finished EphemeralTask"),
        "common:EphemeralTask:run",
      );
    });

    it("should catch and log errors during execute, still clean up job", async () => {
      task.executeError = new Error("Test execute error");
      const futureDate = new Date(Date.now() + 60_000);
      task.setDate(futureDate);

      // Should not throw even though execute throws
      await task.triggerRun();

      expect(mockStumper.caughtError).toHaveBeenCalled();
      // Job should still be cleaned up even after error
      expect(task.isActive()).toBe(false);
    });
  });

  describe("Singleton behavior", () => {
    it("should return the same instance on multiple getInstance calls", () => {
      // Instance is already created in beforeEach
      const instance1 = TestEphemeralTask.getInstance();
      const instance2 = TestEphemeralTask.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should return a fresh instance after clearing the singleton cache", () => {
      const instance1 = TestEphemeralTask.getInstance();
      clearTestSingleton();
      const instance2 = TestEphemeralTask.getInstance();

      // After clearing, a new instance is created
      expect(instance1).not.toBe(instance2);
    });
  });
});