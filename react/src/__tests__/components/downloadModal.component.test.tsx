import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DownloadModal } from "../../components/downloadModal.component";
import { DocumentModel } from "../../models/document.model";
import { MemoryRouter } from "react-router-dom";
import { plantuml } from "../../plantuml";
import { getRoomUML } from "../../service/plant.service";

// Mock dependencies
vi.mock("../../plantuml", () => ({
  plantuml: {
    renderSvg: vi.fn(),
    renderPng: vi.fn(),
  },
}));

vi.mock("../../service/plant.service", () => ({
  getRoomUML: vi.fn(),
}));

vi.mock("jszip", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      folder: vi.fn().mockReturnValue({
        file: vi.fn(),
      }),
      generateAsync: vi.fn().mockResolvedValue(new Blob()),
    })),
  };
});

// Mock useParams
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useParams: () => ({
      roomId: "123",
    }),
  };
});

// Mock window.URL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
Object.defineProperty(window.URL, 'createObjectURL', { value: mockCreateObjectURL, writable: true });
Object.defineProperty(window.URL, 'revokeObjectURL', { value: mockRevokeObjectURL, writable: true });

const mockOnClose = vi.fn();
const sampleDocuments: DocumentModel[] = [
  { id: 1, name: "Document 1" },
  { id: 2, name: "Document 2" },
];

const mockUMLContents = [
  { docName: "Document 1", uml: "@startuml\nclass Test1\n@enduml" },
  { docName: "Document 2", uml: "@startuml\nclass Test2\n@enduml" },
];

const sampleRoomId = "2c0a3406-8898-4835-93f0-d9ec64ccd05d";

const renderDownloadModal = () => {
  return render(
    <MemoryRouter initialEntries={["/room/123"]}>
      <DownloadModal onClose={mockOnClose} documents={sampleDocuments} roomId={sampleRoomId} />
    </MemoryRouter>
  );
};

describe("DownloadModal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock implementations
    (getRoomUML as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockUMLContents);
    (plantuml.renderSvg as unknown as ReturnType<typeof vi.fn>).mockResolvedValue("<svg>test</svg>");
    (plantuml.renderPng as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ blob: new Blob(), error: undefined });
  });

  describe("Initial Render", () => {
    test("renders modal with correct title", () => {
      renderDownloadModal();
      expect(screen.getByText("Download Package")).toBeInTheDocument();
    });

    test("renders all filter buttons", () => {
      renderDownloadModal();
      expect(screen.getByRole("button", { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /code only/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /svg only/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /png only/i })).toBeInTheDocument();
    });

    test("renders all documents with correct initial state", () => {
      renderDownloadModal();
      sampleDocuments.forEach(doc => {
        const docElement = screen.getByText(doc.name);
        expect(docElement).toBeInTheDocument();
        
        // Find the document's checkbox
        const checkbox = screen.getAllByRole("checkbox");
        const checkboxForDoc = checkbox.find(cb => cb.getAttribute("name") === doc.name);
        expect(checkboxForDoc).toBeInTheDocument();
        expect(checkboxForDoc).toBeChecked();
        
        // Initially all format types should be selected
        const formatTypes = ["Code", "SVG", "PNG"];
        formatTypes.forEach(format => {
          const formatElement = screen.getAllByText(format).find(el => 
            el.parentElement?.className.includes("flex gap-2 items-center mr-3")
          );
          expect(formatElement).toBeInTheDocument();
          expect(formatElement?.closest("span")).not.toHaveClass("line-through");
        });
      });
    });
  });

  describe.skip("Filter Functionality", () => {
    test("Code Only filter selects only code format", () => {
      renderDownloadModal();
      
      fireEvent.click(screen.getByRole("button", { name: /Code Only/ }));
      
      sampleDocuments.forEach(doc => {
        const docSection = screen.getByText(doc.name).closest("div");
        expect(docSection).toBeInTheDocument();
        
        // Code should be selected, others deselected, always gets first element
        const codeElement = screen.getAllByText("Code").find(el => 
          el.parentElement?.className.includes("flex gap-2 items-center mr-3")
        );
        const svgElement = screen.getAllByText("SVG").find(el => 
          el.parentElement?.className.includes("flex gap-2 items-center mr-3")
        );
        const pngElement = screen.getAllByText("PNG").find(el => 
          el.parentElement?.className.includes("flex gap-2 items-center mr-3")
        );
        
        expect(codeElement?.closest("span")).not.toHaveClass("line-through");
        expect(svgElement?.closest("span")).toHaveClass("line-through");
        expect(pngElement?.closest("span")).toHaveClass("line-through");
      });
    });
  });

  describe("Document Selection", () => {
    test("toggles document selection when checkbox is clicked", async () => {
      renderDownloadModal();
      
      const checkboxes = screen.getAllByRole("checkbox");
      const checkbox = checkboxes.filter(cb => cb.getAttribute("name") === "Document 1")[0];
      
      fireEvent.click(checkbox);
      
      // Document name should be struck through
      const docName = screen.getByText("Document 1");
      expect(docName.closest("span")).toHaveClass("line-through");
    });

    test("selecting document selects all format types", () => {
      renderDownloadModal();
      
      const checkboxes = screen.getAllByRole("checkbox");
      const checkbox = checkboxes.filter(cb => cb.getAttribute("name") === "Document 1")[0];

      // Uncheck first
      fireEvent.click(checkbox);
      // Check again
      fireEvent.click(checkbox);
      
      // Document name should not be struck through
      const docName = screen.getByText("Document 1");
      expect(docName.closest("span")).not.toHaveClass("line-through");
      
      // All format types should not be struck through
      ["Code", "SVG", "PNG"].forEach(format => {
        const formatElement = screen.getAllByText(format).find(el => 
          el.parentElement?.className.includes("flex gap-2 items-center mr-3")
        );
        expect(formatElement?.closest("span")).not.toHaveClass("line-through");
      });
    });
  });

  describe("Download Functionality", () => {
    test("starts download process when download button is clicked", async () => {
      renderDownloadModal();
      
      const downloadButton = screen.getByRole("button", { name: /Download/ });
      fireEvent.click(downloadButton);
      
      await waitFor(() => {
        expect(getRoomUML).toHaveBeenCalledWith(sampleRoomId);
      });
      
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    test("shows loading state during download", async () => {
      renderDownloadModal();
      
      fireEvent.click(screen.getByRole("button", { name: /Download/ }));
      
      // The download button should show a loading state
      expect(screen.getByRole("button", { name: /Processing.../ })).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByRole("button", { name: /Processing.../ })).not.toBeInTheDocument();
      });
    });

    test("handles download errors gracefully", async () => {
      const consoleError = vi.spyOn(console, "error");
      (getRoomUML as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Download failed"));
      
      renderDownloadModal();
      
      fireEvent.click(screen.getByRole("button", { name: /Download/ }));
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith("Failed to download diagrams:", expect.any(Error));
      });
      
      // Should not be in loading state anymore
      expect(screen.queryByRole("button", { name: /Processing.../ })).not.toBeInTheDocument();
      
      consoleError.mockRestore();
    });
  });

  describe("Modal Interaction", () => {
    test("closes modal when cancel button is clicked", () => {
      renderDownloadModal();
      
      fireEvent.click(screen.getByRole("button", { name: /Cancel/ }));
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
}); 