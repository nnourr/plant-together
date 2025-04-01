import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { UmlEditor } from "../../components/umlEditor.component";
import { DocumentModel } from "../../models/document.model";
import {
  UserContext,
  UserContextObjectType,
} from "../../components/user.context";

const setMock = vi.fn();
const clearMock = vi.fn();
const createDecorationsCollectionMock = vi.fn().mockReturnValue({
  set: setMock,
  clear: clearMock,
});
const setLocalStateFieldMock = vi.fn();
const rangeMock = vi.fn();

// Mock the utility functions
vi.mock("../../utils/userIdentity.utils", () => ({
  generateQuirkyUsername: (userId: string) => {
    // Create a deterministic test output based on userId
    if (userId === "test-user-id-123") return "Test-Username";
    if (userId === "guest-123") return "Guest-Username";
    return "Default-Username";
  },
  generateColorFromString: (str: string) => {
    // Return predictable colors for testing
    if (str === "User1") return "hsl(120, 70%, 60%)";
    if (str === "User2") return "hsl(240, 70%, 60%)";
    if (str === "Test User") return "hsl(0, 70%, 60%)";
    return "hsl(180, 70%, 60%)";
  },
  getContrastingTextColor: () => ({
    textColor: "white",
    textShadow: "none",
  }),
}));

let capturedOnChange: ((value: string | undefined) => void) | undefined =
  undefined;

vi.mock("y-websocket", () => {
  return {
    WebsocketProvider: vi.fn().mockImplementation(() => ({
      destroy: vi.fn(),
      awareness: {
        setLocalStateField: setLocalStateFieldMock,
        on: vi.fn(),
        getStates: vi.fn().mockReturnValue(new Map()),
      },
    })),
  };
});

vi.mock("@monaco-editor/react", () => ({
  Editor: vi.fn(({ onMount, onChange }) => {
    capturedOnChange = onChange;
    const mockEditorInstance = {
      createDecorationsCollection: createDecorationsCollectionMock,
      getModel: vi.fn().mockReturnValue({
        setEOL: vi.fn(),
      }),
      setModel: vi.fn(),
    };

    const mockMonacoInstance = {
      Range: rangeMock,
    };
    onMount(mockEditorInstance, mockMonacoInstance);
    return <div>Monaco Editor</div>;
  }),
}));

// Mock for y-monaco
vi.mock("y-monaco", () => ({
  MonacoBinding: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
  })),
}));

describe("UmlEditor", () => {
  const mockDocument: DocumentModel = { id: 34, name: "Test Document" };
  const mockSetEditorValue = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnChange = undefined;
  });

  test("renders UmlEditor component", async () => {
    render(
      <UmlEditor
        roomId="testRoom"
        currDocument={mockDocument}
        setEditorValue={mockSetEditorValue}
        className="test-class"
      />
    );

    expect(screen.getByText("Monaco Editor")).toBeInTheDocument();
  });

  test("updates decorations when error prop changes", async () => {
    const { rerender } = render(
      <UmlEditor
        roomId="testRoom"
        currDocument={mockDocument}
        setEditorValue={mockSetEditorValue}
        className="test-class"
      />
    );

    expect(setMock).not.toHaveBeenCalled();

    const newError = { line: 2, message: "New Error", duration: 0, status: "" };
    rerender(
      <UmlEditor
        roomId="testRoom"
        currDocument={mockDocument}
        setEditorValue={mockSetEditorValue}
        className="test-class"
        error={newError}
      />
    );

    await waitFor(() => {
      expect(setMock).toHaveBeenCalled();
      expect(rangeMock).toHaveBeenCalledWith(
        newError.line,
        1,
        newError.line,
        1
      );
    });

    rerender(
      <UmlEditor
        roomId="testRoom"
        currDocument={mockDocument}
        setEditorValue={mockSetEditorValue}
        className="test-class"
      />
    );

    await waitFor(() => {
      expect(clearMock).toHaveBeenCalled();
    });
  });

  test("calls setEditorValue when editor content changes", async () => {
    render(
      <UmlEditor
        roomId="testRoom"
        currDocument={mockDocument}
        setEditorValue={mockSetEditorValue}
        className="test-class"
      />
    );
    if (capturedOnChange) {
      capturedOnChange("new content");
    }
    expect(mockSetEditorValue).toHaveBeenCalledWith("new content");
  });

  test("sets user awareness with guest name when user is not signed in", async () => {
    // Render with no user context (guest mode)
    render(
      <UserContext.Provider value={{ context: { sessionActive: true } }}>
        <UmlEditor
          roomId="testRoom"
          currDocument={mockDocument}
          setEditorValue={mockSetEditorValue}
          className="test-class"
        />
      </UserContext.Provider>
    );

    // Check if awareness was set with quirky username
    await waitFor(() => {
      expect(setLocalStateFieldMock).toHaveBeenCalledWith(
        "user",
        expect.objectContaining({
          name: "Default-Username", // This matches our mock implementation
          color: expect.any(String),
        })
      );
    });
  });

  test("sets user awareness with quirky guest name when user is not signed in", async () => {
    // Render with a guest user (with userId but no displayName)
    render(
      <UserContext.Provider
        value={{ context: { sessionActive: true, userId: "guest-123" } }}
      >
        <UmlEditor
          roomId="testRoom"
          currDocument={mockDocument}
          setEditorValue={mockSetEditorValue}
          className="test-class"
        />
      </UserContext.Provider>
    );

    // Check if awareness was set with a quirky name
    await waitFor(() => {
      expect(setLocalStateFieldMock).toHaveBeenCalled();
      const userCall = setLocalStateFieldMock.mock.calls[0];

      expect(userCall[0]).toBe("user");
      expect(userCall[1]).toHaveProperty("name");
      expect(userCall[1].name).toBe("Guest-Username"); // From our mock
    });
  });

  test("sets user awareness with correct user name when user is signed in", async () => {
    const mockUser: UserContextObjectType = {
      displayName: "Test User",
      email: "test@example.com",
      sessionActive: true,
      userId: "123",
    };

    render(
      <UserContext.Provider value={{ context: mockUser }}>
        <UmlEditor
          roomId="testRoom"
          currDocument={mockDocument}
          setEditorValue={mockSetEditorValue}
          className="test-class"
        />
      </UserContext.Provider>
    );

    // Check if awareness was set with the user's display name
    await waitFor(() => {
      expect(setLocalStateFieldMock).toHaveBeenCalledWith(
        "user",
        expect.objectContaining({
          name: "Test User",
          color: expect.any(String),
        })
      );
    });
  });

  test("generates different colors for different usernames", async () => {
    // First render with one user
    const { unmount } = render(
      <UserContext.Provider
        value={{ context: { displayName: "User1", sessionActive: true } }}
      >
        <UmlEditor
          roomId="testRoom"
          currDocument={mockDocument}
          setEditorValue={mockSetEditorValue}
        />
      </UserContext.Provider>
    );

    // Capture the first color
    const firstCall = setLocalStateFieldMock.mock.calls[0][1];
    const firstColor = firstCall.color;

    unmount();
    vi.clearAllMocks();

    // Render with a different user
    render(
      <UserContext.Provider
        value={{ context: { displayName: "User2", sessionActive: true } }}
      >
        <UmlEditor
          roomId="testRoom"
          currDocument={mockDocument}
          setEditorValue={mockSetEditorValue}
        />
      </UserContext.Provider>
    );

    // Capture the second color and compare
    await waitFor(() => {
      const secondCall = setLocalStateFieldMock.mock.calls[0][1];
      const secondColor = secondCall.color;

      expect(firstColor).not.toEqual(secondColor);
      expect(firstColor).toMatch(/hsl\(\d+, \d+%, \d+%\)/);
      expect(secondColor).toMatch(/hsl\(\d+, \d+%, \d+%\)/);
    });
  });
});
