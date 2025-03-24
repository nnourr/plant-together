import { createDocumentInRoom } from "../service/plant.service";
import { updateDocumentInRoom } from "../service/plant.service";
import { Socket } from 'socket.io-client';
import { vi } from 'vitest'

const mockSocket = {
  emit: vi.fn(),
} as unknown as Socket;

describe('createDocumentInRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should emit the /create event with correct data and handle success response', () => {
    const documentName = 'Test Document';
    const mockResponse = { status: 'SUCCESS', message: 'Document created successfully!' };
    

    mockSocket.emit = vi.fn((event, _data, callback) => {
      if (event === '/create') callback(mockResponse);
      return mockSocket
    });

    const callback = vi.fn((response) => {
      expect(response).toEqual(mockResponse);
    });

    createDocumentInRoom(mockSocket, documentName, callback);

    expect(mockSocket.emit).toHaveBeenCalledWith(
      '/create',
      { documentName },
      expect.any(Function)
    );
  });

  test('should emit the /create event and handle failure response', () => {
    const documentName = 'Test Document';
    const mockResponse = { status: 'FAILURE', message: 'Error creating document' };

    mockSocket.emit = vi.fn((event, _data, callback) => {
      if (event === '/create') callback(mockResponse);
      return mockSocket
    });

    const callback = vi.fn((response) => {
      expect(response).toEqual(mockResponse);
    });

    createDocumentInRoom(mockSocket, documentName, callback);

    expect(mockSocket.emit).toHaveBeenCalledWith(
      '/create',
      { documentName },
      expect.any(Function)
    );
  });

  test('should emit the /rename event with correct data and handle success response', () => {
    const documentId = 'doc1';
    const newDocumentName = 'Updated Document';
    const mockResponse = { status: 'SUCCESS', message: 'Document renamed successfully!' };

    // Mock the socket.emit behavior
    mockSocket.emit = vi.fn((event, _data, callback) => {
      if (event === '/rename') callback(mockResponse);
      return mockSocket;
    });

    const callback = vi.fn((response) => {
      expect(response).toEqual(mockResponse);
    });

    updateDocumentInRoom(mockSocket, documentId, newDocumentName, callback);

    // Assert that the socket emit was called with the correct arguments
    expect(mockSocket.emit).toHaveBeenCalledWith(
      '/rename',
      { documentId, newDocumentName },
      expect.any(Function)
    );
  });

  test('should emit the /rename event and handle failure response', () => {
    const documentId = 'doc1';
    const newDocumentName = 'Updated Document';
    const mockResponse = { status: 'FAILURE', message: 'Error renaming document' };

    // Mock the socket.emit behavior
    mockSocket.emit = vi.fn((event, _data, callback) => {
      if (event === '/rename') callback(mockResponse);
      return mockSocket;
    });

    const callback = vi.fn((response) => {
      expect(response).toEqual(mockResponse);
    });

    updateDocumentInRoom(mockSocket, documentId, newDocumentName, callback);

    // Assert that the socket emit was called with the correct arguments
    expect(mockSocket.emit).toHaveBeenCalledWith(
      '/rename',
      { documentId, newDocumentName },
      expect.any(Function)
    );
  });

  test('should log success message to console on success of Document creation', () => {
    const documentName = 'Test Document';
    const mockResponse = { status: 'SUCCESS', message: 'Document created successfully!' };

    console.log = vi.fn(); 


    mockSocket.emit = vi.fn((event, _data, callback) => {
      if (event === '/create') callback(mockResponse);
      return mockSocket
    });

    createDocumentInRoom(mockSocket, documentName, (_response) => {
      expect(console.log).toHaveBeenCalledWith('Document created successfully!');
    });

    expect(mockSocket.emit).toHaveBeenCalledWith(
      '/create',
      { documentName },
      expect.any(Function)
    );
  });

  test('should log success message to console on success of Document update', () => {
    const documentId = 'doc1';
    const newDocumentName = 'Updated Document';
    const mockResponse = { status: 'SUCCESS', message: 'Document renamed successfully!' };

    // Mock console.log
    console.log = vi.fn();

    // Mock the socket.emit behavior
    mockSocket.emit = vi.fn((event, _data, callback) => {
      if (event === '/rename') callback(mockResponse);
      return mockSocket;
    });

    updateDocumentInRoom(mockSocket, documentId, newDocumentName, (_response) => {
      expect(console.log).toHaveBeenCalledWith('Document renamed successfully!');
    });

    // Assert that the socket emit was called with the correct arguments
    expect(mockSocket.emit).toHaveBeenCalledWith(
      '/rename',
      { documentId, newDocumentName },
      expect.any(Function)
    );
  });

  test('should log error message to console on failure of Document creation', () => {
    const documentName = 'Test Document';
    const mockResponse = { status: 'FAILURE', message: 'Error creating document' };

    console.error = vi.fn(); 

    mockSocket.emit = vi.fn((event, _data, callback) => {
      if (event === '/create') callback(mockResponse);
      return mockSocket
    });

    createDocumentInRoom(mockSocket, documentName, (_response) => {
      expect(console.error).toHaveBeenCalledWith('Failed to create document: Error creating document');
    });

    expect(mockSocket.emit).toHaveBeenCalledWith(
      '/create',
      { documentName },
      expect.any(Function)
    );
  });

  test('should log error message to console on failure of Document update', () => {
    const documentId = 'doc1';
    const newDocumentName = 'Updated Document';
    const mockResponse = { status: 'FAILURE', message: 'Error renaming document' };

    // Mock console.error
    console.error = vi.fn();

    // Mock the socket.emit behavior
    mockSocket.emit = vi.fn((event, _data, callback) => {
      if (event === '/rename') callback(mockResponse);
      return mockSocket;
    });

    updateDocumentInRoom(mockSocket, documentId, newDocumentName, (_response) => {
      expect(console.error).toHaveBeenCalledWith('Failed to rename document: Error renaming document');
    });

    // Assert that the socket emit was called with the correct arguments
    expect(mockSocket.emit).toHaveBeenCalledWith(
      '/rename',
      { documentId, newDocumentName },
      expect.any(Function)
    );
  });
});
