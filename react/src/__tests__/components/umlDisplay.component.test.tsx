import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UmlDisplay } from "../../components/umlDisplay.component";
import { plantuml } from "../../plantuml";
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Mock } from "vitest";

// Dependency utilized by react-zoom-pan-pinch
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock("../../plantuml", () => ({
  plantuml: {
    initialize: vi.fn().mockResolvedValue(undefined),
    renderSvg: vi.fn(),
    renderPng: vi.fn(),
  },
}));

describe("UmlDisplay", () => {
  const mockUmlStr = "A -> B";
  const mockSvg = "<svg>test content</svg>";
  const mockPngBlob = new Blob(["test-png-data"], { type: "image/png" });
  const mockSetSyntaxError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (plantuml.renderSvg as Mock).mockResolvedValue(mockSvg);
    (plantuml.renderPng as Mock).mockResolvedValue({ blob: mockPngBlob });

    // Mock URL.createObjectURL and URL.revokeObjectURL
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue("mock-url");
    globalThis.URL.revokeObjectURL = vi.fn();

    // Mock ResizeObserver
    globalThis.ResizeObserver = ResizeObserverMock;
  });

  it("should initialize PlantUML and show loading state", () => {
    render(
      <UmlDisplay
        setSyntaxError={mockSetSyntaxError}
        umlStr={mockUmlStr}
        closed={false}
      />
    );

    expect(screen.getByText("Loading plantUml...")).toBeInTheDocument();
    expect(plantuml.initialize).toHaveBeenCalled();
  });

  it("should render SVG after initialization", async () => {
    render(
      <UmlDisplay
        setSyntaxError={mockSetSyntaxError}
        umlStr={mockUmlStr}
        closed={false}
      />
    );

    await waitFor(() => {
      expect(plantuml.renderSvg).toHaveBeenCalledWith(mockUmlStr);
    });

    const img = await screen.findByRole("img");
    expect(img).toHaveAttribute("src", "mock-url");
  });

  it("should render syntax errors", async () => {
    const errorResponse = {
      message: "Invalid syntax",
      line: 5,
      duration: 3,
      status: "",
    };

    render(
      <UmlDisplay
        closed={false}
        setSyntaxError={mockSetSyntaxError}
        syntaxError={errorResponse}
        umlStr={mockUmlStr}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Invalid syntax!")).toBeInTheDocument();
    });
  });

  it("should call setSyntaxError when renderSvg returns an error", async () => {
    // Mock the response to return an error message
    const mockErrorResponse = JSON.stringify({
      duration: 100,
      status: "error",
      line: 2,
      error: "Syntax error in line 2",
    });

    (plantuml.renderSvg as Mock).mockResolvedValue(mockErrorResponse);

    render(
      <UmlDisplay
        umlStr={mockUmlStr}
        setSyntaxError={mockSetSyntaxError}
        closed={false}
      />
    );

    // Wait for the function to be called
    await waitFor(() => {
      expect(mockSetSyntaxError).toHaveBeenCalledWith({
        duration: 100,
        status: "error",
        line: 2,
        message: "Syntax error in line 2",
      });
    });
  });

  it("should handle PNG download", async () => {
    render(
      <UmlDisplay
        setSyntaxError={mockSetSyntaxError}
        umlStr={mockUmlStr}
        closed={false}
      />
    );

    await waitFor(() => {
      expect(plantuml.initialize).toHaveBeenCalled();
      expect(plantuml.renderSvg).toHaveBeenCalled();
    });

    const downloadPngButton = await screen.findByText("Download PNG");
    fireEvent.click(downloadPngButton);

    await waitFor(() => {
      expect(plantuml.renderPng).toHaveBeenCalledWith(mockUmlStr);
    });
  });

  it("should handle PNG rendering errors", async () => {
    const errorResponse = {
      error: {
        message: "PNG rendering failed",
        status: "error",
        line: 3,
        duration: 3,
      },
    };
    (plantuml.renderPng as Mock).mockResolvedValue(errorResponse);

    render(
      <UmlDisplay
        setSyntaxError={mockSetSyntaxError}
        umlStr={mockUmlStr}
        closed={false}
      />
    );

    await waitFor(() => {
      expect(plantuml.initialize).toHaveBeenCalled();
      expect(plantuml.renderSvg).toHaveBeenCalled();
    });

    // Wait for the download button to appear
    const downloadPngButton = await screen.findByText("Download PNG");
    fireEvent.click(downloadPngButton);

    await waitFor(() => {
      expect(mockSetSyntaxError).toHaveBeenCalledOnce();
    });
  });

  it("should handle SVG download", async () => {
    render(
      <UmlDisplay
        setSyntaxError={mockSetSyntaxError}
        umlStr={mockUmlStr}
        closed={false}
      />
    );

    // Wait for initialization and component to be ready
    await waitFor(() => {
      expect(plantuml.initialize).toHaveBeenCalled();
      expect(plantuml.renderSvg).toHaveBeenCalled();
    });

    // Wait for the download button to appear
    const downloadSvgButton = await screen.findByText("Download SVG");
    expect(downloadSvgButton).toHaveAttribute("href", "mock-url");
    expect(downloadSvgButton).toHaveAttribute("download", "plantTogether");
  });
});
