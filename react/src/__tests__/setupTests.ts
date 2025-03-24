import "@testing-library/jest-dom/vitest";

// y-monaco doesn't play nicely with unit tests. Took me 3 hours to work around.
vi.mock("y-monaco", () => ({
  MonacoBinding: vi.fn().mockReturnValue({
    destroy: vi.fn(),
  }),
}));
