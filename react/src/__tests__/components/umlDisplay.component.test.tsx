import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UmlDisplay } from '../../components/umlDisplay.component';
import { plantuml } from '../../plantuml';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';

// Dependency utilized by react-zoom-pan-pinch
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock('../../plantuml', () => ({
  plantuml: {
    initialize: vi.fn().mockResolvedValue(undefined),
    renderSvg: vi.fn(),
    renderPng: vi.fn()
  }
}));

describe('UmlDisplay', () => {
  const mockUmlStr = 'A -> B';
  const mockSvg = '<svg>test content</svg>';
  const mockPngBlob = new Blob(['test-png-data'], { type: 'image/png' });

  beforeEach(() => {
    vi.clearAllMocks();
    (plantuml.renderSvg as Mock).mockResolvedValue(mockSvg);
    (plantuml.renderPng as Mock).mockResolvedValue({ blob: mockPngBlob });

    // Mock URL.createObjectURL and URL.revokeObjectURL
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue('mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();

    // Mock ResizeObserver
    globalThis.ResizeObserver = ResizeObserverMock;
  });

  it('should initialize PlantUML and show loading state', () => {
    render(<UmlDisplay umlStr={mockUmlStr} />);
    
    expect(screen.getByText('Loading plantUml...')).toBeInTheDocument();
    expect(plantuml.initialize).toHaveBeenCalled();
  });

  it('should render SVG after initialization', async () => {
    render(<UmlDisplay umlStr={mockUmlStr} />);

    await waitFor(() => {
      expect(plantuml.renderSvg).toHaveBeenCalledWith(mockUmlStr);
    });

    const img = await screen.findByRole('img');
    expect(img).toHaveAttribute('src', 'mock-url');
  });

  it('should handle syntax errors in SVG rendering', async () => {
    const errorResponse = JSON.stringify({ error: 'Invalid syntax' });
    (plantuml.renderSvg as Mock).mockResolvedValue(errorResponse);

    render(<UmlDisplay umlStr={mockUmlStr} />);

    await waitFor(() => {
      expect(screen.getByText('Invalid syntax!')).toBeInTheDocument();
    });
  });

  it('should handle PNG download', async () => {
    render(<UmlDisplay umlStr={mockUmlStr} />);

    await waitFor(() => {
      expect(plantuml.initialize).toHaveBeenCalled();
      expect(plantuml.renderSvg).toHaveBeenCalled();
    });

    const downloadPngButton = await screen.findByText('Download PNG');
    fireEvent.click(downloadPngButton);

    await waitFor(() => {
      expect(plantuml.renderPng).toHaveBeenCalledWith(mockUmlStr);
    });
  });

  it('should handle PNG rendering errors', async () => {
    const errorResponse = { error: { message: 'PNG rendering failed', status: 'error' } };
    (plantuml.renderPng as Mock).mockResolvedValue(errorResponse);

    render(<UmlDisplay umlStr={mockUmlStr} />);

    await waitFor(() => {
      expect(plantuml.initialize).toHaveBeenCalled();
      expect(plantuml.renderSvg).toHaveBeenCalled();
    });

    // Wait for the download button to appear
    const downloadPngButton = await screen.findByText('Download PNG');
    fireEvent.click(downloadPngButton);

    await waitFor(() => {
      expect(screen.getByText('PNG rendering failed!')).toBeInTheDocument();
    });
  });

  it('should handle SVG download', async () => {
    render(<UmlDisplay umlStr={mockUmlStr} />);

    // Wait for initialization and component to be ready
    await waitFor(() => {
      expect(plantuml.initialize).toHaveBeenCalled();
      expect(plantuml.renderSvg).toHaveBeenCalled();
    });

    // Wait for the download button to appear
    const downloadSvgButton = await screen.findByText('Download SVG');
    expect(downloadSvgButton).toHaveAttribute('href', 'mock-url');
    expect(downloadSvgButton).toHaveAttribute('download', 'plantTogether');
  });
});
