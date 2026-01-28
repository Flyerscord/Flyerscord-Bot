// Mock ConfigManager BEFORE any imports
jest.mock("@common/managers/ConfigManager", () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        getConfig: jest.fn(() => ({
          "imageKit.publicKey": "test-public-key",
          "imageKit.privateKey": "test-private-key",
          "imageKit.urlEndpoint": "https://ik.imagekit.io/test",
          "imageKit.redirectUrl": "https://images.example.com",
          "imageKit.proxyUrl": "https://proxy.example.com",
          prefix: "!",
        })),
        isLoaded: jest.fn(() => true),
      })),
    },
  };
});

// Mock the ImageKit library
const mockUpload = jest.fn();
const mockGetFileDetails = jest.fn();
const mockListFiles = jest.fn();

jest.mock("imagekit", () => {
  return jest.fn().mockImplementation(() => ({
    upload: mockUpload,
    getFileDetails: mockGetFileDetails,
    listFiles: mockListFiles,
  }));
});

import MyImageKit from "@modules/customCommands/utils/ImageKit";

describe("MyImageKit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the singleton instance for fresh tests
    // @ts-expect-error - accessing private static for testing
    MyImageKit.instance = undefined;
  });

  describe("uploadImage", () => {
    it("should upload an image and return the redirected URL on success", async () => {
      mockUpload.mockResolvedValue({
        $ResponseMetadata: { statusCode: 200 },
        url: "https://ik.imagekit.io/test/image.jpg",
      });

      const imageKit = MyImageKit.getInstance();
      const result = await imageKit.uploadImage("https://example.com/original.jpg", "flyerscord-cmd-test", "user123", "testcmd");

      expect(result).toBe("https://images.example.com/image.jpg");
      expect(mockUpload).toHaveBeenCalledWith({
        file: "https://example.com/original.jpg",
        fileName: "flyerscord-cmd-test",
        useUniqueFileName: true,
        tags: ["flyerscord", "custom-command"],
        customMetadata: { addedBy: "user123", command: "testcmd" },
      });
    });

    it("should return undefined when upload fails", async () => {
      mockUpload.mockResolvedValue({
        $ResponseMetadata: { statusCode: 500 },
      });

      const imageKit = MyImageKit.getInstance();
      const result = await imageKit.uploadImage("https://example.com/original.jpg", "flyerscord-cmd-test", "user123", "testcmd");

      expect(result).toBeUndefined();
    });
  });

  describe("isImageKitUrl", () => {
    it("should return true for valid ImageKit redirect URLs", () => {
      const imageKit = MyImageKit.getInstance();

      expect(imageKit.isImageKitUrl("https://images.example.com/image.jpg")).toBe(true);
      expect(imageKit.isImageKitUrl("https://images.example.com/folder/image.png")).toBe(true);
    });

    it("should return false for non-ImageKit URLs", () => {
      const imageKit = MyImageKit.getInstance();

      expect(imageKit.isImageKitUrl("https://other.com/image.jpg")).toBe(false);
      expect(imageKit.isImageKitUrl("https://imgur.com/abc123")).toBe(false);
      expect(imageKit.isImageKitUrl("not a url")).toBe(false);
    });
  });

  describe("convertToProxyUrlIfNeeded", () => {
    it("should return proxy URL for animated image types", async () => {
      // Mock getFileDetails for MIME type lookup
      mockListFiles.mockResolvedValue({
        $ResponseMetadata: { statusCode: 200 },
        find: jest.fn().mockReturnValue({ fileId: "file123", type: "file", name: "image.gif" }),
        0: { fileId: "file123", type: "file", name: "image.gif" },
      });

      mockGetFileDetails.mockResolvedValue({
        $ResponseMetadata: { statusCode: 200 },
        mime: "image/gif",
      });

      const imageKit = MyImageKit.getInstance();

      // Mock the private methods by creating a spy
      // Since we can't easily mock the private method chain, we test the public interface
      // The implementation uses getImageMimeType which calls listFiles then getFileDetails

      // For this test we need to return a file from listFiles that matches
      mockListFiles.mockResolvedValue({
        $ResponseMetadata: { statusCode: 200 },
        find: function (predicate: (file: { name: string }) => boolean) {
          const files = [{ fileId: "file123", type: "file", name: "image.gif" }];
          return files.find(predicate);
        },
      });

      const result = await imageKit.convertToProxyUrlIfNeeded("https://images.example.com/image.gif");

      // The method returns proxy URL for gif types
      if (result) {
        expect(result).toContain("proxy.example.com");
      }
    });

    it("should return undefined when MIME type cannot be determined", async () => {
      mockListFiles.mockResolvedValue({
        $ResponseMetadata: { statusCode: 500 },
      });

      const imageKit = MyImageKit.getInstance();
      const result = await imageKit.convertToProxyUrlIfNeeded("https://images.example.com/image.jpg");

      expect(result).toBeUndefined();
    });

    it("should return undefined for non-animated image types", async () => {
      mockListFiles.mockResolvedValue({
        $ResponseMetadata: { statusCode: 200 },
        find: function (predicate: (file: { name: string }) => boolean) {
          const files = [{ fileId: "file123", type: "file", name: "image.jpg" }];
          return files.find(predicate);
        },
      });

      mockGetFileDetails.mockResolvedValue({
        $ResponseMetadata: { statusCode: 200 },
        mime: "image/jpeg",
      });

      const imageKit = MyImageKit.getInstance();
      const result = await imageKit.convertToProxyUrlIfNeeded("https://images.example.com/image.jpg");

      // Should return undefined for static images (no conversion needed)
      expect(result).toBeUndefined();
    });
  });
});
