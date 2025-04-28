import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Landing } from '../pages/landing.page'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../components/user.context'

// Mock the plant service
const mockGetPrivateRoom = vi.fn()
const mockGetPublicRoom = vi.fn()
const mockCreateRoomWithDocument = vi.fn()

vi.mock('../service/plant.service', () => ({
  getPrivateRoom: (...args: any[]) => mockGetPrivateRoom(...args),
  getPublicRoom: (...args: any[]) => mockGetPublicRoom(...args),
  createRoomWithDocument: (...args: any[]) =>
    mockCreateRoomWithDocument(...args),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

describe('Landing Component', () => {
  let mockNavigate: ReturnType<typeof vi.fn>
  const mockUserContext = {
    context: {
      userId: '123',
      sessionActive: true,
    },
  }

  beforeEach(() => {
    mockNavigate = vi.fn()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.clearAllMocks()
  })

  const renderWithContext = (ui: React.ReactElement) => {
    return render(
      <UserContext.Provider value={mockUserContext}>
        <MemoryRouter>{ui}</MemoryRouter>
      </UserContext.Provider>,
    )
  }

  describe('Input Validation', () => {
    test('shows error message when input contains spaces', () => {
      renderWithContext(<Landing />)

      const input = screen.getByPlaceholderText('enter a room name')
      const button = screen.getByText('Submit')

      fireEvent.change(input, { target: { value: 'room name' } })
      fireEvent.click(button)

      expect(screen.getByRole('alert')).toHaveTextContent(
        'no spaces allowed x(',
      )
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    test('shows error message when input contains a slash', () => {
      renderWithContext(<Landing />)

      const input = screen.getByPlaceholderText('enter a room name')
      const button = screen.getByText('Submit')

      fireEvent.change(input, { target: { value: 'room/name' } })
      fireEvent.click(button)

      expect(screen.getByRole('alert')).toHaveTextContent('no slash allowed x(')
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    test('does not allow empty input and shows an error message', () => {
      renderWithContext(<Landing />)

      const input = screen.getByPlaceholderText('enter a room name')
      const button = screen.getByText('Submit')

      fireEvent.change(input, { target: { value: '' } })
      fireEvent.click(button)

      expect(screen.getByRole('alert')).toHaveTextContent(
        'room name cannot be empty x(',
      )
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Room Creation and Navigation', () => {
    test('creates and navigates to a public room', async () => {
      mockGetPublicRoom.mockResolvedValue(null)
      renderWithContext(<Landing />)

      const input = screen.getByPlaceholderText('enter a room name')
      const button = screen.getByText('Submit')

      fireEvent.change(input, { target: { value: 'validRoom' } })
      await fireEvent.click(button)

      await waitFor(() => {
        expect(mockGetPublicRoom).toHaveBeenCalledWith('validRoom')
        expect(mockCreateRoomWithDocument).toHaveBeenCalledWith(
          'validRoom',
          false,
          'Document1',
        )
        expect(mockNavigate).toHaveBeenCalledWith('/validRoom')
      })
    })

    test('creates and navigates to a private room', async () => {
      mockGetPrivateRoom.mockResolvedValue(null)
      renderWithContext(<Landing />)

      const input = screen.getByPlaceholderText('enter a room name')
      const privacyToggle = screen.getByRole('checkbox', {
        name: 'room-privacy',
      })
      const button = screen.getByText('Submit')

      fireEvent.change(input, { target: { value: 'validRoom' } })
      fireEvent.click(privacyToggle)
      await fireEvent.click(button)

      await waitFor(() => {
        expect(mockGetPrivateRoom).toHaveBeenCalledWith('123', 'validRoom')
        expect(mockCreateRoomWithDocument).toHaveBeenCalledWith(
          'validRoom',
          true,
          'Document1',
        )
        expect(mockNavigate).toHaveBeenCalledWith('/private/123/validRoom')
      })
    })

    test('navigates to existing public room', async () => {
      mockGetPublicRoom.mockResolvedValue({ documents: [] })
      renderWithContext(<Landing />)

      const input = screen.getByPlaceholderText('enter a room name')
      const button = screen.getByText('Submit')

      fireEvent.change(input, { target: { value: 'existingRoom' } })
      await fireEvent.click(button)

      await waitFor(() => {
        expect(mockGetPublicRoom).toHaveBeenCalledWith('existingRoom')
        expect(mockCreateRoomWithDocument).not.toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith('/existingRoom')
      })
    })

    test('navigates to existing private room', async () => {
      mockGetPrivateRoom.mockResolvedValue({ documents: [] })
      renderWithContext(<Landing />)

      const input = screen.getByPlaceholderText('enter a room name')
      const privacyToggle = screen.getByRole('checkbox', {
        name: 'room-privacy',
      })
      const button = screen.getByText('Submit')

      fireEvent.change(input, { target: { value: 'existingRoom' } })
      fireEvent.click(privacyToggle)
      await fireEvent.click(button)

      await waitFor(() => {
        expect(mockGetPrivateRoom).toHaveBeenCalledWith('123', 'existingRoom')
        expect(mockCreateRoomWithDocument).not.toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith('/private/123/existingRoom')
      })
    })
  })

  describe('Privacy Toggle', () => {
    test('toggles privacy state when clicked', () => {
      renderWithContext(<Landing />)

      const privacyToggle = screen.getByRole('checkbox', {
        name: 'room-privacy',
      })
      expect(privacyToggle).not.toBeChecked()

      fireEvent.click(privacyToggle)
      expect(privacyToggle).toBeChecked()
    })
  })
})
