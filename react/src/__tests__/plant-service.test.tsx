import React from "react";
import { render, fireEvent, screen, within } from "@testing-library/react";
import mockIO, { serverSocket, cleanup } from "socket.io-client"; // Mocked Socket.IO client

afterEach(cleanup); // Ensure the mocked events are cleaned up between tests

test("Should create a room and display it on the UI", () => {
  // Render the app
  const { getByTestId } = render(<App />);

  // Simulate user interaction to create a room
  const roomInput = getByTestId("room-name-input"); // Assuming the room input has this test ID
  const createRoomButton = getByTestId("create-room-button");

  fireEvent.change(roomInput, { target: { value: "Test Room" } });
  fireEvent.click(createRoomButton);

  // Mock server response
  serverSocket.emit("createRoom", { status: "SUCCESS", roomName: "Test Room" });

  // Assert that the room appears on the UI
  const roomList = getByTestId("room-list");
  expect(within(roomList).getByText("Test Room")).toBeTruthy();
});

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

test("Should fetch documents and display them in the UI", () => {
  // Render the app
  const { getByTestId } = render(<App />);

  // Mock server response for fetching documents
  const mockDocuments = [
    { documentName: "Doc1" },
    { documentName: "Doc2" },
  ];
  serverSocket.emit("getDocuments", { status: "SUCCESS", documents: mockDocuments });

  // Assert that the documents are displayed on the UI
  const documentList = getByTestId("document-list");
  expect(within(documentList).getByText("Doc1")).toBeTruthy();
  expect(within(documentList).getByText("Doc2")).toBeTruthy();
});
