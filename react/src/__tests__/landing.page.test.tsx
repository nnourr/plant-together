import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Landing } from "../pages/landing.page";
import { useNavigate } from "react-router-dom";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("Landing Component - Inline Validation", () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  test("shows error message when input contains spaces", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText("enter a room name");
    const button = screen.getByText("Submit");

    fireEvent.change(input, { target: { value: "room name" } });
    fireEvent.click(button);

    expect(screen.getByRole("alert")).toHaveTextContent("no spaces allowed x(");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows error message when input contains a slash", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText("enter a room name");
    const button = screen.getByText("Submit");

    fireEvent.change(input, { target: { value: "room/name" } });
    fireEvent.click(button);

    expect(screen.getByRole("alert")).toHaveTextContent("no slash allowed x(");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("allows navigation for valid input", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText("enter a room name");
    const button = screen.getByText("Submit");

    fireEvent.change(input, { target: { value: "validRoomName" } });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("room/validRoomName");
    expect(screen.queryByRole("alert")).toHaveClass("opacity-0");
  });

  test("triggers validation on Enter key press", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText("enter a room name");

    fireEvent.change(input, { target: { value: "invalid room" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByRole("alert")).toHaveTextContent("no spaces allowed x(");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("navigates correctly on Enter key press with valid input", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText("enter a room name");

    fireEvent.change(input, { target: { value: "validRoom" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(mockNavigate).toHaveBeenCalledWith("room/validRoom");
    expect(screen.queryByRole("alert")).toHaveClass("opacity-0");
  });

  test("does not allow empty input and shows an error message", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText("enter a room name");
    const button = screen.getByText("Submit");

    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(button);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "room name cannot be empty x("
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show error message when room name contains spaces and input field loses focus', async () => {
    render(<Landing />);

    const input = screen.getByPlaceholderText('enter a room name');
    
    // Simulate typing a name with spaces
    fireEvent.change(input, { target: { value: 'room name with spaces' } });
    fireEvent.blur(input);

    await waitFor(() => {
      // Check if the error message is displayed
      expect(screen.getByRole('alert')).toHaveTextContent('no spaces allowed x(');
    });
  });

  it('should show error message when room name contains a slash and input field loses focus', async () => {
    render(<Landing />);

    const input = screen.getByPlaceholderText('enter a room name');
    
    // Simulate typing a name with a slash
    fireEvent.change(input, { target: { value: 'room/name/with/slash' } });
    fireEvent.blur(input);

    await waitFor(() => {
      // Check if the error message is displayed
      expect(screen.getByRole('alert')).toHaveTextContent('no slash allowed x(');
    });
  });

  it('should not show error message when room name is valid and input field loses focus', async () => {
    render(<Landing />);

    const input = screen.getByPlaceholderText('enter a room name');
    
    // Simulate typing a valid name
    fireEvent.change(input, { target: { value: 'validRoomName' } });
    fireEvent.blur(input);

    await waitFor(() => {
      // Check if the error message is not displayed
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveClass('opacity-0');
    });
  });
});
