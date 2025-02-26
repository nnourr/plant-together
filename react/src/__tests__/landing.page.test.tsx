import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Landing } from "../pages/landing.page";
import { vi } from "vitest";
import { useNavigate } from "react-router-dom";

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
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
        vi.spyOn(window, "alert").mockImplementation(() => {});
    });

    test("shows alert when input contains spaces", () => {
        render(
            <MemoryRouter>
                <Landing />
            </MemoryRouter>
        );

        const input = screen.getByPlaceholderText("enter a room name");
        const button = screen.getByText("Submit");

        fireEvent.change(input, { target: { value: "room name" } });
        fireEvent.click(button);

        expect(window.alert).toHaveBeenCalledWith("no spaces allowed x(");
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
        expect(window.alert).not.toHaveBeenCalled(); 
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

        expect(window.alert).toHaveBeenCalledWith("no spaces allowed x(");
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
        expect(window.alert).not.toHaveBeenCalled();
    });

    test("does not allow empty input", () => {
        render(
          <MemoryRouter>
            <Landing />
          </MemoryRouter>
        );
      
        const input = screen.getByPlaceholderText("enter a room name");
        const button = screen.getByText("Submit");
      
        fireEvent.change(input, { target: { value: "" } });
        fireEvent.click(button);
      
        expect(window.alert).toHaveBeenCalledWith("room name cannot be empty x("); 
        expect(mockNavigate).not.toHaveBeenCalled(); 
      });
      

});
