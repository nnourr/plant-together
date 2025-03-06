import { render, screen, fireEvent } from "@testing-library/react";
import { SideBar } from "../../components/sideBar.component";
import { DocumentModel } from "../../models/document.model";

// Mock the updateDocument function and other necessary props
const mockUpdateDocument = vi.fn();
const mockSetCurrDocument = vi.fn();
const mockNewDocument = vi.fn();

const sampleDocuments: DocumentModel[] = [
  { id: 1, name: "Document 1" },
  { id: 2, name: "Document 2" },
  { id: 3, name: "Document 3" }
];

describe("SideBar Component", () => {
  let currDocument: DocumentModel;

  beforeEach(() => {
    currDocument = sampleDocuments[0]; // Set the first document as the current document
    mockUpdateDocument.mockClear(); // Clear any previous mock calls
  });

  test("renders the component correctly", () => {
    render(
      <SideBar
        currDocument={currDocument}
        documents={sampleDocuments}
        setCurrDocument={mockSetCurrDocument}
        newDocument={mockNewDocument}
        updateDocument={mockUpdateDocument}
        className="test-class"
      />
    );

    expect(screen.getByText("Documents:")).toBeInTheDocument();
    expect(screen.getByText("Document 1")).toBeInTheDocument();
    expect(screen.getByText("Document 2")).toBeInTheDocument();
    expect(screen.getByText("Document 3")).toBeInTheDocument();
  });

  test("clicking the edit button shows the input field and allows document name editing", () => {
    render(
      <SideBar
        currDocument={currDocument}
        documents={sampleDocuments}
        setCurrDocument={mockSetCurrDocument}
        newDocument={mockNewDocument}
        updateDocument={mockUpdateDocument}
        className="test-class"
      />
    );

    // Click the edit button
    const editButton = screen.getByRole('button', {name: /edit/i});
    fireEvent.click(editButton);

    // Ensure the input field appears
    const inputField = screen.getByRole("textbox");
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveValue(currDocument.name);

    // Simulate typing a new document name
    fireEvent.change(inputField, { target: { value: "Updated Document 1" } });

    expect(inputField).toHaveValue("Updated Document 1");
  });

  test("calling updateDocument when Enter is pressed", () => {
    render(
      <SideBar
        currDocument={currDocument}
        documents={sampleDocuments}
        setCurrDocument={mockSetCurrDocument}
        newDocument={mockNewDocument}
        updateDocument={mockUpdateDocument}
        className="test-class"
      />
    );

    // Click the edit button
    const editButton = screen.getByRole('button', {name: /edit/i});
    fireEvent.click(editButton);

    const inputField = screen.getByRole("textbox");
    fireEvent.change(inputField, { target: { value: "Updated Document 1" } });

    // Simulate pressing Enter key
    fireEvent.keyDown(inputField, { key: "Enter", code: "Enter" });

    // Assert that the updateDocument function was called with correct arguments
    expect(mockUpdateDocument).toHaveBeenCalledWith(currDocument.id, "Updated Document 1");
  });

  test("focuses on input when editing a document", () => {
    render(
      <SideBar
        currDocument={currDocument}
        documents={sampleDocuments}
        setCurrDocument={mockSetCurrDocument}
        newDocument={mockNewDocument}
        updateDocument={mockUpdateDocument}
        className="test-class"
      />
    );

    // Click the edit button
    const editButton = screen.getByRole('button', {name: /edit/i});
    fireEvent.click(editButton);

    const inputField = screen.getByRole("textbox");
    expect(inputField).toHaveFocus();
  });

  test("does not allow update if the document is not selected", () => {
    render(
      <SideBar
        currDocument={undefined}
        documents={sampleDocuments}
        setCurrDocument={mockSetCurrDocument}
        newDocument={mockNewDocument}
        updateDocument={mockUpdateDocument}
        className="test-class"
      />
    );

    // Check that no document update happens
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(mockUpdateDocument).not.toHaveBeenCalled();
  });
});
