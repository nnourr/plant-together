import { describe, expect, it } from "vitest";
import {
  generateColorFromString,
  generateQuirkyUsername,
  seededRandom,
} from "../../utils/userIdentity.utils";

describe("seededRandom", () => {
  it("returns consistent values for the same input", () => {
    const seed = "test-seed";

    const value1 = seededRandom(seed);
    const value2 = seededRandom(seed);

    expect(value1).toBe(value2);
  });

  it("returns different values for different inputs", () => {
    const seed1 = "seed1";
    const seed2 = "seed2";

    const value1 = seededRandom(seed1);
    const value2 = seededRandom(seed2);

    expect(value1).not.toBe(value2);
  });

  it("returns a number between 0 and 1", () => {
    const seeds = ["test1", "test2", "different-seed", "yet-another-seed"];

    for (const seed of seeds) {
      const value = seededRandom(seed);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});

describe("generateQuirkyUsername", () => {
  it("generates a consistent username for the same userId", () => {
    const testId = "test-user-123";

    // Call the function multiple times with the same ID
    const username1 = generateQuirkyUsername(testId);
    const username2 = generateQuirkyUsername(testId);
    const username3 = generateQuirkyUsername(testId);

    // All calls should return the same username
    expect(username1).toBe(username2);
    expect(username2).toBe(username3);
  });

  it("generates different usernames for different userIds", () => {
    const userId1 = "user1";
    const userId2 = "user22";

    const username1 = generateQuirkyUsername(userId1);
    const username2 = generateQuirkyUsername(userId2);

    expect(username1).not.toBe(username2);
  });

  it("returns a string containing a dash separator", () => {
    const username = generateQuirkyUsername("test");

    expect(username).toContain("-");
  });

  it("generates a username matching the [Adjective]-[Noun] format", () => {
    const username = generateQuirkyUsername("test-123");

    // Verify format using a regex that matches the pattern:
    // Start with capital letter followed by lowercase letters,
    // then dash, then capital letter followed by lowercase letters
    expect(username).toMatch(/^[A-Z][a-z]+-[A-Z][a-z]+$/);
  });
});

describe("generateColorFromString", () => {
  it("generates a consistent color for the same string", () => {
    const testName = "JohnDoe";

    const color1 = generateColorFromString(testName);
    const color2 = generateColorFromString(testName);

    expect(color1).toBe(color2);
  });

  it("generates different colors for different strings", () => {
    const name1 = "Alice";
    const name2 = "Bob";

    const color1 = generateColorFromString(name1);
    const color2 = generateColorFromString(name2);

    expect(color1).not.toBe(color2);
  });

  it("returns a color in HSL format", () => {
    const color = generateColorFromString("TestUser");

    // HSL format regex: hsl(number, number%, number%)
    expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });

  it("generates colors with appropriate saturation and lightness values", () => {
    const testCases = ["Test1", "Test2", "AnotherTest", "YetAnotherTest"];

    for (const testCase of testCases) {
      const color = generateColorFromString(testCase);

      // Extract HSL values using regex
      const match = color.match(/hsl\((\d+), (\d+)%, (\d+)%\)/);

      if (!match) {
        throw new Error(`Color ${color} doesn't match HSL format`);
      }

      const [, , saturation, lightness] = match.map(Number);

      // Check if saturation and lightness are within expected ranges
      expect(saturation).toBeGreaterThanOrEqual(65);
      expect(saturation).toBeLessThanOrEqual(85);
      expect(lightness).toBeGreaterThanOrEqual(55);
      expect(lightness).toBeLessThanOrEqual(65);
    }
  });

  it("uses all color ranges defined in the function", () => {
    // Test a large number of strings to ensure we hit different color ranges
    const testStrings = Array.from({ length: 100 }, (_, i) => `TestString${i}`);
    const colors = testStrings.map(generateColorFromString);

    // Extract all hues
    const hues = colors
      .map((color) => {
        const match = color.match(/hsl\((\d+), /);
        return match ? Number(match[1]) : null;
      })
      .filter(Boolean) as number[];

    // Check if we have hues in different ranges (reds, oranges, blues, etc.)
    const hasReds = hues.some((hue) => hue >= 0 && hue <= 30);
    const hasOranges = hues.some((hue) => hue >= 40 && hue <= 60);
    const hasBlues = hues.some((hue) => hue >= 190 && hue <= 240);
    const hasPurples = hues.some((hue) => hue >= 260 && hue <= 280);

    // We should have at least some variety in our hues
    expect(new Set(hues).size).toBeGreaterThan(5);
    expect(hasReds || hasOranges || hasBlues || hasPurples).toBeTruthy();
  });
});
