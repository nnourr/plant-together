import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import React from "react";

// Stub the root element in the document.
const rootDiv = document.createElement("div");
rootDiv.id = "root";
document.body.appendChild(rootDiv);

// Stub createRoot to capture render argument.
const renderMock = vi.fn();
const createRootMock = vi.fn(() => ({ render: renderMock }));
vi.mock("react-dom/client", () => ({
  createRoot: createRootMock,
}));

// Stub PostHogProvider to render its children.
const PostHogProviderMock = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="posthog">{children}</div>
);
vi.mock("posthog-js/react", () => ({
  PostHogProvider: PostHogProviderMock,
}));

// Replace the Clarity mock with a default export.
const clarityInitMock = vi.fn();
vi.mock("@microsoft/clarity", () => ({
  default: { init: clarityInitMock },
}));

// Stub the router provider as-is.
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    RouterProvider: (props: any) => (
      <div data-testid="router">{props.router}</div>
    ),
  };
});

describe("main.tsx", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    renderMock.mockClear();
    createRootMock.mockClear();
    clarityInitMock.mockClear();
  });

  afterEach(() => {
    renderMock.mockReset();
  });

  it("renders with PostHogProvider and calls Clarity.init when environment options are provided", async () => {
    // Stub environment variables
    vi.stubEnv("VITE_POSTHOG_HOST", "http://example.com");
    vi.stubEnv("VITE_POSTHOG_KEY", "test-key");
    vi.stubEnv("VITE_CLARITY_PROJECT_ID", "clarity123");

    // Trigger main
    await import("../main");
    // Verify createRoot was called with the correct element.
    expect(createRootMock).toHaveBeenCalledWith(
      document.getElementById("root")
    );
    // Verify that render was called.
    expect(renderMock).toHaveBeenCalled();
    const renderedElement = renderMock.mock.calls[0][0];

    // Check that the rendered tree contains the PostHogProvider.
    expect(renderedElement.props.children.type).toBe(PostHogProviderMock);
    // Verify Clarity.init is called with the correct project id.
    expect(clarityInitMock).toHaveBeenCalledWith("clarity123");
  });

  it("renders without PostHogProvider when no host option is provided", async () => {
    vi.stubEnv("VITE_POSTHOG_HOST", "");
    vi.stubEnv("VITE_POSTHOG_KEY", "");
    await import("../main");
    expect(createRootMock).toHaveBeenCalledWith(
      document.getElementById("root")
    );
    expect(renderMock).toHaveBeenCalled();
    const renderedElement = renderMock.mock.calls[0][0];
    // Without PostHogProvider, the top level should be directly the RouterProvider.
    expect(renderedElement.props.children.type).not.toBe(PostHogProviderMock);
    // Clarity.init should not have been called.
    expect(clarityInitMock).not.toHaveBeenCalled();
  });
});
