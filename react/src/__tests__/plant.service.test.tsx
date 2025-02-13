import { createDocumentInRoom } from "../service/plant.service";
import { Socket } from 'socket.io-client';
import jest from 'jest-mock';

// Mock the Socket instance
const mockSocket = {
  emit: jest.fn(),
} as unknown as Socket;

describe('createDocumentInRoom', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test('should emit the /create event with correct data and handle success response', (done) => {
    const documentName = 'Test Document';
    const mockResponse = { status: 'SUCCESS', message: 'Document created successfully!' };
    
    // Mock the emit function to call the callback with mockResponse
    mockSocket.emit = jest.fn((event, data, callback) => {
      if (event === '/create') callback(mockResponse);
    });

    const callback = jest.fn((response) => {
      expect(response).toEqual(mockResponse); // Ensure callback is called with mockResponse
      done();
    });

    createDocumentInRoom(mockSocket, documentName, callback);

    expect(mockSocket.emit).toHaveBeenCalledWith(
      '/create',
      { documentName },
      expect.any(Function)
    );
  });

  test('should emit the /create event and handle failure response', (done) => {
    const documentName = 'Test Document';
    const mockResponse = { status: 'FAILURE', message: 'Error creating document' };

    // Mock the emit function to call the callback with mockResponse
    mockSocket.emit = jest.fn((event, data, callback) => {
      if (event === '/create') callback(mockResponse);
    });

    const callback = jest.fn((response) => {
      expect(response).toEqual(mockResponse); // Ensure callback is called with mockResponse
      done();
    });

    createDocumentInRoom(mockSocket, documentName, callback);

    expect(mockSocket.emit).toHaveBeenCalledWith(
      '/create',
      { documentName },
      expect.any(Function)
    );
  });

  test('should log success message to console on success', (done) => {
    const documentName = 'Test Document';
    const mockResponse = { status: 'SUCCESS', message: 'Document created successfully!' };

    console.log = jest.fn(); // Mock console.log

    // Mock the emit function to call the callback with mockResponse
    mockSocket.emit = jest.fn((event, data, callback) => {
      if (event === '/create') callback(mockResponse);
    });

    createDocumentInRoom(mockSocket, documentName, (response) => {
      expect(console.log).toHaveBeenCalledWith('Document created successfully!');
      done();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith(
      '/create',
      { documentName },
      expect.any(Function)
    );
  });

  test('should log error message to console on failure', (done) => {
    const documentName = 'Test Document';
    const mockResponse = { status: 'FAILURE', message: 'Error creating document' };

    console.error = jest.fn(); // Mock console.error

    // Mock the emit function to call the callback with mockResponse
    mockSocket.emit = jest.fn((event, data, callback) => {
      if (event === '/create') callback(mockResponse);
    });

    createDocumentInRoom(mockSocket, documentName, (response) => {
      expect(console.error).toHaveBeenCalledWith('Failed to create document: Error creating document');
      done();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith(
      '/create',
      { documentName },
      expect.any(Function)
    );
  });
});
