import { plantuml } from '../plantuml';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Mock } from 'vitest';

declare global {
  var cheerpjInit: Mock;
  var cheerpjRunMain: Mock;
  var cjCall: Mock;
  var cjFileBlob: Mock;
  var cheerpjGetFSMountForPath: Mock;
}

interface MockTransaction {
  objectStore: Mock;
  oncomplete: (() => void) | null;
}

describe('plantuml', () => {
  beforeEach(() => {
    // Setup globalThis mocks
    vi.stubGlobal('cheerpjInit', vi.fn().mockResolvedValue(undefined));
    vi.stubGlobal('cheerpjRunMain', vi.fn().mockResolvedValue(undefined));
    vi.stubGlobal('cjCall', vi.fn());
    vi.stubGlobal('cjFileBlob', vi.fn());
    vi.stubGlobal('cheerpjGetFSMountForPath', vi.fn());

    // Mock fetch globally
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    }));
  });

  describe('initialize', () => {
    it('should initialize PlantUML with default path', async () => {
      await plantuml.initialize();
      
      expect(globalThis.cheerpjInit).toHaveBeenCalled();
      expect(globalThis.cheerpjRunMain).toHaveBeenCalledWith(
        'com.plantuml.api.cheerpj.v1.RunInit',
        '/app/plantuml-wasm/plantuml-core.jar',
        '/app/plantuml-wasm/'
      );

      // Verify fetch calls
      expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('plantuml-core.jar.js'));
      expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('plantuml-core.jar'));
    });

    it('should initialize PlantUML with custom path', async () => {
      await plantuml.initialize('/custom/path');
      
      expect(globalThis.cheerpjInit).toHaveBeenCalled();
      expect(globalThis.cheerpjRunMain).toHaveBeenCalledWith(
        'com.plantuml.api.cheerpj.v1.RunInit',
        '/custom/path/plantuml-core.jar',
        '/custom/path/'
      );

      // Verify fetch calls
      expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/custom/path/plantuml-core.jar.js'));
      expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining('/custom/path/plantuml-core.jar'));
    });
  });

  describe('renderPng', () => {
    const mockPumlContent = '@startuml\nA -> B\n@enduml';
    const mockTimestamp = 1234567890000;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(mockTimestamp));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle successful PNG rendering', async () => {
      const mockBlob = new Blob(['mock-png-data'], { type: 'image/png' });
      const mockTransaction: MockTransaction = {
        objectStore: vi.fn().mockReturnValue({
          delete: vi.fn()
        }),
        oncomplete: null
      };

      globalThis.cjCall.mockResolvedValue(JSON.stringify({ status: 'ok' }));   
      globalThis.cjFileBlob.mockResolvedValue(mockBlob);

      globalThis.cheerpjGetFSMountForPath.mockReturnValue({
        dbConnection: {
          transaction: vi.fn().mockImplementation(() => {
            // Simulate the async transaction completion
            // The timer doesn't actually run until runAllTimersAsync is called
            setTimeout(() => {
              if (mockTransaction.oncomplete) {
                mockTransaction.oncomplete();
              }
            }, 0);
            return mockTransaction;
          })
        }
      });

      const resultPromise = plantuml.renderPng(mockPumlContent);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(globalThis.cjCall).toHaveBeenCalledWith(
        'com.plantuml.api.cheerpj.v1.Png',
        'convertToBlob',
        'light',
        mockPumlContent,
        `/files/result-${mockTimestamp}.png`
      );
      expect(result).toEqual({ blob: mockBlob });
    });

    it('should handle rendering errors', async () => {
      const mockError = {
        status: 'error',
        duration: 100,
        line: 2,
        error: 'Syntax error'
      };

      globalThis.cjCall.mockResolvedValue(JSON.stringify(mockError));

      const result = await plantuml.renderPng(mockPumlContent);

      expect(result).toEqual({
        error: {
          duration: 100,
          status: 'error',
          line: 2,
          message: 'Syntax error'
        }
      });
    });
  });

  describe('renderSvg', () => {
    const mockPumlContent = '@startuml\nA -> B\n@enduml';

    it('should render SVG successfully', async () => {
      const mockSvg = '<svg>mock content</svg>';
      globalThis.cjCall.mockResolvedValue(mockSvg);

      const result = await plantuml.renderSvg(mockPumlContent);

      expect(globalThis.cjCall).toHaveBeenCalledWith(
        'com.plantuml.api.cheerpj.v1.Svg',
        'convert',
        'light',
        mockPumlContent
      );
      expect(result).toBe(mockSvg);
    });
  });
});
