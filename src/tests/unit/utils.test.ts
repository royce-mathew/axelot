import { describe, it, expect, vi } from "vitest"
import { timeAgo, getInitials, hslToHex, stringToHslColor } from "@/lib/utils"
import { Timestamp } from "firebase/firestore"

// Mock Firebase Timestamp
vi.mock("firebase/firestore", () => ({
  Timestamp: {
    now: () => ({ toDate: () => new Date() }),
    fromDate: (date: Date) => ({ toDate: () => date }),
  },
}))

describe("utils", () => {
  describe("getInitials", () => {
    it('should return "??" for null or undefined', () => {
      expect(getInitials(null)).toBe("??")
      expect(getInitials(undefined)).toBe("??")
    })

    it("should return first letter for single name", () => {
      expect(getInitials("Royce")).toBe("R")
    })

    it("should return first and last initials for full name", () => {
      expect(getInitials("Royce Mathew")).toBe("RM")
    })

    it("should return first and last initials for multi-part name", () => {
      expect(getInitials("Royce John Mathew")).toBe("RM")
    })
  })

  describe("hslToHex", () => {
    it("should convert HSL to Hex correctly", () => {
      expect(hslToHex(0, 100, 50)).toBe("#ff0000") // Red
      expect(hslToHex(120, 100, 50)).toBe("#00ff00") // Green
      expect(hslToHex(240, 100, 50)).toBe("#0000ff") // Blue
    })

    it("should handle achromatic colors", () => {
      expect(hslToHex(0, 0, 0)).toBe("#000000") // Black
      expect(hslToHex(0, 0, 100)).toBe("#ffffff") // White
    })
  })

  describe("stringToHslColor", () => {
    it("should generate consistent colors for same string", () => {
      const color1 = stringToHslColor("test-string")
      const color2 = stringToHslColor("test-string")
      expect(color1).toBe(color2)
    })

    it("should generate different colors for different strings", () => {
      const color1 = stringToHslColor("string-1")
      const color2 = stringToHslColor("string-2")
      expect(color1).not.toBe(color2)
    })
  })

  describe("timeAgo", () => {
    it("should return relative time string", () => {
      const now = new Date()
      const past = new Date(now.getTime() - 1000 * 60 * 5) // 5 minutes ago
      const timestamp = { toDate: () => past } as Timestamp

      expect(timeAgo(timestamp)).toBe("5 minutes ago")
    })

    it("should handle errors gracefully", () => {
      // @ts-ignore - Testing invalid input
      expect(timeAgo(null)).toBe("Never")
    })
  })
})
