import React from "react";
import { render, fireEvent, screen, within } from "@testing-library/react";
import mockIO, { serverSocket, cleanup } from "socket.io-client"; // Mocked Socket.IO client

afterEach(cleanup); // Ensure the mocked events are cleaned up between tests

test("Should add a document to an existing room", () => {
  // Render the app
  const { getByTestId } = render(<App />);

  // Simulate user interaction to add a document
  const documentInput = getByTestId("document-name-input"); // Assuming the document input has this test ID
  const addDocumentButton = getByTestId("add-document-button");

  fireEvent.change(documentInput, { target: { value: "Test Document" } });
  fireEvent.click(addDocumentButton);

  // Mock server response
  serverSocket.emit("createDocument", { status: "SUCCESS", documentName: "Test Document" });

  // Assert that the document appears in the room
  const documentList = getByTestId("document-list");
  expect(within(documentList).getByText("Test Document")).toBeTruthy();
});
