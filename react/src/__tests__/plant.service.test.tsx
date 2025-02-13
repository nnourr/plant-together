import { createDocumentInRoom } from "../service/plant.service";
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
    

    mockSocket.emit = vi.fn((event, data, callback) => {
      if (event === '/create') callback(mockResponse);
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

    mockSocket.emit = vi.fn((event, data, callback) => {
      if (event === '/create') callback(mockResponse);
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

  test('should log success message to console on success', () => {
    const documentName = 'Test Document';
    const mockResponse = { status: 'SUCCESS', message: 'Document created successfully!' };

    console.log = vi.fn(); 


    mockSocket.emit = vi.fn((event, data, callback) => {
      if (event === '/create') callback(mockResponse);
    });

    createDocumentInRoom(mockSocket, documentName, (response) => {
      expect(console.log).toHaveBeenCalledWith('Document created successfully!');
    });

    expect(mockSocket.emit).toHaveBeenCalledWith(
      '/create',
      { documentName },
      expect.any(Function)
    );
  });

  test('should log error message to console on failure', () => {
    const documentName = 'Test Document';
    const mockResponse = { status: 'FAILURE', message: 'Error creating document' };

    console.error = vi.fn(); 

    mockSocket.emit = vi.fn((event, data, callback) => {
      if (event === '/create') callback(mockResponse);
    });

    createDocumentInRoom(mockSocket, documentName, (response) => {
      expect(console.error).toHaveBeenCalledWith('Failed to create document: Error creating document');
    });

    expect(mockSocket.emit).toHaveBeenCalledWith(
      '/create',
      { documentName },
      expect.any(Function)
    );
  });
});
