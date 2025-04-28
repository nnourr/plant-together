import { render, screen, fireEvent } from '@testing-library/react'
import { NavBar } from '../../components/navBar.component'
import { BrowserRouter } from 'react-router-dom'
import { UserContext } from '../../components/user.context'
import '@testing-library/jest-dom'

// Mock the plant service
const mockChangeRoomAccess = vi.fn()
const mockShareRoom = vi.fn()

vi.mock('../../service/plant.service', () => ({
  changeRoomAccess: (...args: any[]) => mockChangeRoomAccess(...args),
  shareRoom: (...args: any[]) => mockShareRoom(...args),
}))

describe('NavBar', () => {
  const defaultProps = {
    isPrivate: true,
    roomId: '1',
    roomName: 'test',
    isOwner: true,
    ownerId: 'test-id',
  }

  const mockUserContext = {
    context: {
      displayName: 'Test User',
      isGuest: false,
      userId: '123',
      sessionActive: true,
    },
  }

  const renderWithContext = (ui: React.ReactElement) => {
    return render(
      <UserContext.Provider value={mockUserContext}>
        <BrowserRouter>{ui}</BrowserRouter>
      </UserContext.Provider>,
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render a button saying new room', () => {
    renderWithContext(<NavBar {...defaultProps} />)
    const button = screen.getByRole('button', { name: /new room/i })
    expect(button).toBeInTheDocument()
  })

  it('should show private room button for non-guest owners', () => {
    renderWithContext(<NavBar {...defaultProps} />)
    const privateButton = screen.getByRole('button', {
      name: /private room/i,
    })
    expect(privateButton).toBeInTheDocument()
    expect(privateButton).toHaveClass('bg-blue-500')
  })

  it('should show public room button for non-guest owners', () => {
    renderWithContext(<NavBar {...defaultProps} isPrivate={false} />)
    const publicButton = screen.getByRole('button', {
      name: /public room/i,
    })
    expect(publicButton).toBeInTheDocument()
    expect(publicButton).toHaveClass('bg-green-500')
  })

  it('should not show room access button for guest users', () => {
    const guestContext = {
      context: {
        ...mockUserContext.context,
        isGuest: true,
      },
    }
    render(
      <UserContext.Provider value={guestContext}>
        <BrowserRouter>
          <NavBar {...defaultProps} />
        </BrowserRouter>
      </UserContext.Provider>,
    )
    const roomAccessButton = screen.queryByRole('button', {
      name: /private room|public room/i,
    })
    expect(roomAccessButton).not.toBeInTheDocument()
  })

  it('should not show room access button for non-owners', () => {
    renderWithContext(<NavBar {...defaultProps} isOwner={false} />)
    const roomAccessButton = screen.queryByRole('button', {
      name: /private room|public room/i,
    })
    expect(roomAccessButton).not.toBeInTheDocument()
  })

  it('should show share room button only for private rooms', () => {
    renderWithContext(<NavBar {...defaultProps} />)
    const shareButton = screen.getByRole('button', { name: /share room/i })
    expect(shareButton).toBeInTheDocument()
  })

  it('should not show share room button for public rooms', () => {
    renderWithContext(<NavBar {...defaultProps} isPrivate={false} />)
    const shareButton = screen.queryByRole('button', {
      name: /share room/i,
    })
    expect(shareButton).not.toBeInTheDocument()
  })

  it('should call changeRoomAccess when room access button is clicked', async () => {
    renderWithContext(<NavBar {...defaultProps} />)

    const privateButton = screen.getByRole('button', {
      name: /private room/i,
    })
    await fireEvent.click(privateButton)

    expect(mockChangeRoomAccess).toHaveBeenCalledWith('1', false)
  })

  it('should call shareRoom when share button is clicked', async () => {
    renderWithContext(<NavBar {...defaultProps} />)

    const shareButton = screen.getByRole('button', { name: /share room/i })
    await fireEvent.click(shareButton)

    expect(mockShareRoom).toHaveBeenCalledWith('1')
  })
})
