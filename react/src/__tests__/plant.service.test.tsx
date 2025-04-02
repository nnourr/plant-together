import { createDocumentInRoom } from "../service/plant.service";
import { updateDocumentInRoom } from "../service/plant.service";
import { getPublicRoom, getPrivateRoom, shareRoom, changeRoomAccess } from "../service/plant.service";
import { Socket } from 'socket.io-client';
import { vi } from 'vitest'

const mockSocket = {
  emit: vi.fn(),
} as unknown as Socket;

const mockFetch = vi.fn();

vi.stubGlobal('fetch', mockFetch);

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

vi.mock('../service/plant.service.tsx', async () => {
  const actual = await vi.importActual('../service/plant.service.tsx');
  return {
    ...actual,
    retrieveToken: vi.fn().mockResolvedValue('mock.jwt.token'),
    refreshToken: vi.fn().mockResolvedValue('mock.jwt.token')
  };
});

vi.mock('../utils/auth.helpers.ts', async () => {
  const actual = await vi.importActual('../utils/auth.helpers.ts');
  return {
    ...actual,
    parseToken: vi.fn().mockReturnValue({
      sessionActive: true,
      userId: 'mockUserId',
      email: 'mockEmail',
      isGuest: false,
      expiry: Date.now() / 1000 + 1000
    })
  };
});

const serverHttpUrl = (import.meta.env.VITE_SERVER_HTTP_URL || "http://localhost:3000");

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

describe('Room Service Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue('mock.jwt.token');
  });

  describe('getPublicRoom', () => {
    test('should successfully fetch a public room', async () => {
      const mockResponse = { documents: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getPublicRoom('testRoom');
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/room/public/testRoom'),
        expect.objectContaining({
          headers: {
            'Authorization': 'mock.jwt.token'
          }
        })
      );
    });

    test('should handle 404 response for non-existent room', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Room not found' })
      });

      const result = await getPublicRoom('nonexistent');
      expect(result).toEqual({});
    });

    test('should handle server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(getPublicRoom('testRoom')).rejects.toThrow('Response status: 500');
    });
  });

  describe('getPrivateRoom', () => {
    test('should successfully fetch a private room', async () => {
      const mockResponse = { documents: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getPrivateRoom('owner123', 'testRoom');
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        new URL(`${serverHttpUrl}/room/private/owner123/testRoom`),
        {
          headers: {
            'Authorization': 'mock.jwt.token'
          }
        }
      );
    });

    test('should include signature in URL when provided', async () => {
      const mockResponse = { documents: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await getPrivateRoom('owner123', 'testRoom', 'test-signature');
      expect(mockFetch).toHaveBeenCalledWith(
        new URL(`${serverHttpUrl}/room/private/owner123/testRoom?signature=test-signature`),
        {
          headers: {
            'Authorization': 'mock.jwt.token'
          }
        }
      );
    });

    test('should handle 404 response for non-existent room', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Room not found' })
      });

      const result = await getPrivateRoom('owner123', 'nonexistent');
      expect(result).toEqual({});
    });
  });

  describe('shareRoom', () => {
    test('should successfully share a room', async () => {
      const mockResponse = { signature: 'test-signature' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await shareRoom('room123');
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/room/share/room123'),
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Authorization': 'mock.jwt.token'
          }
        })
      );
    });

    test('should handle failure when sharing room', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(shareRoom('room123')).rejects.toThrow('Failed to share room');
    });
  });

  describe('changeRoomAccess', () => {
    test('should successfully change room access to private', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true
      });

      await changeRoomAccess('room123', true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/room/room123/access'),
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'mock.jwt.token'
          },
          body: JSON.stringify({ is_private: true })
        })
      );
    });

    test('should handle failure when changing room access', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      });

      await expect(changeRoomAccess('room123', true)).rejects.toThrow('Unauthorized');
    });
  });
});
