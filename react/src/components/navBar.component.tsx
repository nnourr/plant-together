import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ButtonSize } from './button.component'
import { UserContext } from './user.context'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'
import * as plantService from '../service/plant.service'
import { faLockOpen } from '@fortawesome/free-solid-svg-icons'
import { faShareNodes } from '@fortawesome/free-solid-svg-icons'
interface NavBarProps {
  isPrivate: boolean
  roomId: string
  roomName: string
  isOwner: boolean
  ownerId: string
}

export const NavBar: React.FC<NavBarProps> = ({
  isPrivate,
  roomId,
  roomName,
  isOwner,
  ownerId,
}) => {
  const navigate = useNavigate()
  const userContext = useContext(UserContext)
  const [isLoading, setIsLoading] = useState(false)

  const displayName = userContext.context.displayName

  const handleAccessToggle = async () => {
    if (!roomId) return

    try {
      const navigateLink = !isPrivate
        ? `/private/${userContext.context.userId}/${roomName}`
        : `/${roomName}`
      setIsLoading(true)
      await plantService.changeRoomAccess(roomId, !isPrivate)
      navigate(navigateLink)
    } catch (error: any) {
      console.error('Failed to change room access:', error)
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      const { signature } = await plantService.shareRoom(roomId)
      const shareUrl = `${window.location.origin}/#/private/${ownerId}/${roomName}?signature=${signature}`

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl)
      alert('Share link copied to clipboard!')
    } catch (error: any) {
      console.error('Failed to share room:', error)
      alert(error.message)
    }
  }

  return (
    <div className='flex h-16 w-full items-center justify-between bg-slate-900 px-8'>
      <a href='/' onClick={() => navigate('/')}>
        <h1 className='font-mono text-xl font-bold text-white'>
          {displayName && `Hi ${displayName}! Welcome to `} Plant Together
        </h1>
      </a>
      <div className='flex items-center gap-2'>
        <Button size={ButtonSize.sm} onClick={() => navigate('/')}>
          new room
        </Button>
        {isPrivate && (
          <Button size={ButtonSize.sm} onClick={handleShare}>
            <FontAwesomeIcon className='mr-2' icon={faShareNodes} />
            share room
          </Button>
        )}
        {!userContext.context.isGuest && isOwner && (
          <Button
            size={ButtonSize.sm}
            onClick={handleAccessToggle}
            disabled={isLoading}
            className={`${isPrivate ? 'bg-blue-500' : 'bg-green-500'}`}
          >
            <FontAwesomeIcon
              className='mr-2'
              icon={isPrivate ? faLock : faLockOpen}
            />
            {isLoading
              ? 'Changing...'
              : isPrivate
                ? 'Private Room'
                : 'Public Room'}
          </Button>
        )}
      </div>
    </div>
  )
}
