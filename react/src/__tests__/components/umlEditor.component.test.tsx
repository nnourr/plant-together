import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { UmlEditor } from "../../components/umlEditor.component";
import { DocumentModel } from "../../models/document.model";

const setMock = vi.fn();
const clearMock = vi.fn();
const createDecorationsCollectionMock = vi.fn().mockReturnValue({
  set: setMock,
  clear: clearMock,
});

let capturedOnChange: ((value: string | undefined) => void) | undefined =
  undefined;

const rangeMock = vi.fn();
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

vi.mock("y-websocket", () => ({
  WebsocketProvider: vi.fn().mockReturnValue({
    destroy: vi.fn(),
  }),
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

    const newError = { line: 2, error: "New Error", duration: 0, status: "" };
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
});
