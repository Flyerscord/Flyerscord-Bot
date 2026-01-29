// Mock ConfigManager BEFORE any imports
jest.mock("@common/managers/ConfigManager", () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        getConfig: jest.fn(() => ({
          "imgur.clientId": "test-client-id",
          "imgur.clientSecret": "test-client-secret",
          prefix: "!",
        })),
        isLoaded: jest.fn(() => true),
      })),
    },
  };
});

// Mock the Imgur library
const mockGetImage = jest.fn();

jest.mock("imgur", () => {
  return jest.fn().mockImplementation(() => ({
    getImage: mockGetImage,
  }));
});

import Imgur from "@modules/customCommands/utils/Imgur";

describe("Imgur", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the singleton instance for fresh tests
    // @ts-expect-error - accessing private static for testing
    Imgur.instance = undefined;
  });

  describe("getImageUrlForImgurUrl", () => {
    it("should return direct URL for JPEG images", async () => {
      mockGetImage.mockResolvedValue({
        success: true,
        data: { type: "image/jpeg" },
      });

      const imgur = Imgur.getInstance();
      const result = await imgur.getImageUrlForImgurUrl("https://imgur.com/abc123");

      expect(result).toBe("https://i.imgur.com/abc123.jpg");
    });

    it("should return direct URL for PNG images", async () => {
      mockGetImage.mockResolvedValue({
        success: true,
        data: { type: "image/png" },
      });

      const imgur = Imgur.getInstance();
      const result = await imgur.getImageUrlForImgurUrl("https://imgur.com/def456");

      expect(result).toBe("https://i.imgur.com/def456.png");
    });

    it("should return direct URL for GIF images", async () => {
      mockGetImage.mockResolvedValue({
        success: true,
        data: { type: "image/gif" },
      });

      const imgur = Imgur.getInstance();
      const result = await imgur.getImageUrlForImgurUrl("https://imgur.com/ghi789");

      expect(result).toBe("https://i.imgur.com/ghi789.gif");
    });

    it("should return direct URL for APNG images as PNG", async () => {
      mockGetImage.mockResolvedValue({
        success: true,
        data: { type: "image/apng" },
      });

      const imgur = Imgur.getInstance();
      const result = await imgur.getImageUrlForImgurUrl("https://imgur.com/apng123");

      expect(result).toBe("https://i.imgur.com/apng123.png");
    });

    it("should return direct URL for TIFF images", async () => {
      mockGetImage.mockResolvedValue({
        success: true,
        data: { type: "image/tiff" },
      });

      const imgur = Imgur.getInstance();
      const result = await imgur.getImageUrlForImgurUrl("https://imgur.com/tiff456");

      expect(result).toBe("https://i.imgur.com/tiff456.tiff");
    });

    it("should return direct URL for PDF files", async () => {
      mockGetImage.mockResolvedValue({
        success: true,
        data: { type: "application/pdf" },
      });

      const imgur = Imgur.getInstance();
      const result = await imgur.getImageUrlForImgurUrl("https://imgur.com/pdf789");

      expect(result).toBe("https://i.imgur.com/pdf789.pdf");
    });

    it("should return undefined for unsupported image types", async () => {
      mockGetImage.mockResolvedValue({
        success: true,
        data: { type: "image/bmp" },
      });

      const imgur = Imgur.getInstance();
      const result = await imgur.getImageUrlForImgurUrl("https://imgur.com/bmp123");

      expect(result).toBeUndefined();
    });

    it("should return undefined when API call fails", async () => {
      mockGetImage.mockResolvedValue({
        success: false,
      });

      const imgur = Imgur.getInstance();
      const result = await imgur.getImageUrlForImgurUrl("https://imgur.com/fail123");

      expect(result).toBeUndefined();
    });

    it("should handle i.imgur.com URLs with file extensions", async () => {
      mockGetImage.mockResolvedValue({
        success: true,
        data: { type: "image/jpeg" },
      });

      const imgur = Imgur.getInstance();
      const result = await imgur.getImageUrlForImgurUrl("https://i.imgur.com/xyz789.png");

      expect(result).toBe("https://i.imgur.com/xyz789.jpg");
      expect(mockGetImage).toHaveBeenCalledWith("xyz789");
    });

    it("should return undefined for invalid Imgur URLs", async () => {
      const imgur = Imgur.getInstance();
      const result = await imgur.getImageUrlForImgurUrl("https://example.com/notimgur");

      expect(result).toBeUndefined();
      expect(mockGetImage).not.toHaveBeenCalled();
    });
  });
});
