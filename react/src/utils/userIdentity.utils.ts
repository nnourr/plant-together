// List of quirky adjectives and nouns for username generation
const quirkyAdjectives = [
  "Flying",
  "Dancing",
  "Clever",
  "Sleepy",
  "Brave",
  "Cosmic",
  "Curious",
  "Dazzling",
  "Fluffy",
  "Gentle",
  "Happy",
  "Jolly",
  "Magical",
  "Noble",
  "Peaceful",
  "Quirky",
  "Radiant",
  "Silly",
  "Thoughtful",
  "Witty",
];

const quirkyNouns = [
  "Panda",
  "Dolphin",
  "Phoenix",
  "Dragon",
  "Unicorn",
  "Wizard",
  "Astronaut",
  "Butterfly",
  "Cactus",
  "Koala",
  "Robot",
  "Penguin",
  "Raccoon",
  "Tiger",
  "Falcon",
  "Jellyfish",
  "Octopus",
  "Platypus",
  "Squirrel",
  "Walrus",
];

/**
 * Generate a pseudorandom number using a string seed
 * @param seed String to use as a seed for the random number generator
 * @returns A number between 0 and 1
 */
export const seededRandom = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Normalize to 0-1 range
  return Math.abs(hash) / 2 ** 31;
};

/**
 * Generate a quirky username based on userId
 * @param userId User ID to use as a seed
 * @returns A quirky username like "Flying-Panda"
 */
export const generateQuirkyUsername = (userId: string): string => {
  const adjIndex = Math.floor(seededRandom(userId) * quirkyAdjectives.length);
  // Use a different part of the userId for the noun to reduce collisions
  const nounIndex = Math.floor(
    seededRandom(userId.split("").reverse().join("")) * quirkyNouns.length
  );

  const adjective = quirkyAdjectives[adjIndex];
  const noun = quirkyNouns[nounIndex];

  return `${adjective}-${noun}`;
};

/**
 * Generate a visually pleasing color based on a string (username)
 * @param str String to generate color from (usually username)
 * @returns HSL color string (e.g., "hsl(210, 70%, 60%)")
 */
export const generateColorFromString = (str: string): string => {
  // Simple hash function to generate a number from a string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const pleasingHueRanges = [
    [0, 30], // Reds
    [40, 60], // Oranges
    [190, 240], // Blues
    [260, 280], // Purples
    [290, 330], // Magentas
    [120, 150], // Greens
  ];

  // Select a hue range based on hash
  const rangeIndex = Math.abs(hash) % pleasingHueRanges.length;
  const [minHue, maxHue] = pleasingHueRanges[rangeIndex];

  // Generate hue within the selected range
  const hue = minHue + (Math.abs(hash >> 8) % (maxHue - minHue));

  // Control saturation and lightness for vibrant but not overwhelming colors
  const saturation = 65 + (Math.abs(hash >> 16) % 20); // 65-85%
  const lightness = 55 + (Math.abs(hash >> 24) % 10); // 55-65%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
