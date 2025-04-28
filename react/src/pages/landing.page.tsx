import { useState, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Footer } from '../components/footer.component'
import { InputField } from '../components/inputField.component'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSeedling } from '@fortawesome/free-solid-svg-icons'
import { Button, ButtonSize } from '../components/button.component'
import { UserContext } from '../components/user.context'
import { endSession } from '../utils/auth.helpers'
import * as plantService from '../service/plant.service'

export const Landing: React.FC = () => {
    const [roomName, setRoomName] = useState<string>('')
    const [error, setError] = useState(false)
    const [isPrivate, setIsPrivate] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const userContext = useContext(UserContext)
    const navigate = useNavigate()

    const handleGoToRoom = useCallback(async () => {
        if (!roomName.trim()) {
            setError(true)
            setErrorMessage('room name cannot be empty x(')
            return
        }
        if (roomName.includes(' ')) {
            setError(true)
            setErrorMessage('no spaces allowed x(')
            return
        }
        if (roomName.includes('/')) {
            setError(true)
            setErrorMessage('no slash allowed x(')
            return
        }

        try {
            const roomToGoTo = isPrivate
                ? `private/${userContext?.context?.userId}/${roomName}`
                : roomName
            // check if room exists in either public or private and goto it
            const room = isPrivate
                ? await plantService.getPrivateRoom(
                      userContext?.context?.userId!,
                      roomName,
                  )
                : await plantService.getPublicRoom(roomName)
            if (room?.documents) {
                // rooms that exist will have documents key
                navigate(`/${roomToGoTo}`)
                return
            }

            // create the room
            await plantService.createRoomWithDocument(
                roomName,
                isPrivate,
                'Document1',
            )
            navigate(`/${roomToGoTo}`)
        } catch (error: any) {
            setError(true)
            setErrorMessage(error.message.replace(/ /g, ''))
        }
    }, [
        roomName,
        navigate,
        isPrivate,
        userContext?.context?.userId,
        plantService,
    ])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleGoToRoom()
        }
    }

    const checkOnBlur = () => {
        if (!roomName.trim()) {
            setError(false)
            setErrorMessage('')
            return
        }
        if (roomName.includes(' ')) {
            setError(true)
            setErrorMessage('no spaces allowed x(')
            return
        }
        if (roomName.includes('/')) {
            setError(true)
            setErrorMessage('no slash allowed x(')
            return
        }

        return
    }

    const handleLoginOut = () => {
        try {
            endSession(userContext)
            navigate('/login')
        } catch (error: any) {
            console.error(error.message)
        }
    }

    return (
        <div className='flex h-full flex-col bg-slate-900'>
            <header className='flex justify-end p-4'>
                <div>
                    <Button size={ButtonSize.md} onClick={handleLoginOut}>
                        {!userContext?.context?.sessionActive ||
                            (userContext?.context?.isGuest && 'Login') ||
                            'Logout'}
                    </Button>
                </div>
            </header>
            <div className='flex h-full w-full flex-col items-center justify-center gap-10 text-white'>
                <h1 className='relative max-w-[100vw] text-center font-mono text-6xl font-bold lg:text-8xl'>
                    <FontAwesomeIcon
                        icon={faSeedling}
                        className='!hidden md:mr-14 md:!inline lg:mr-16'
                    />
                    Plant Together.
                </h1>
                <h2 className='px-8 text-center text-xl text-slate-500 md:text-2xl'>
                    A simple, collaborative PlantUML editor.
                    <br />
                    Powered by{' '}
                    <a
                        className='font-mono underline'
                        href='https://cheerpj.com/'
                        target='__blank'
                    >
                        Cheerpj
                    </a>
                    .
                </h2>
                <div className='relative mt-4 box-border flex flex-col items-center gap-4 md:w-96'>
                    <p
                        role='alert'
                        className={`${
                            !error ? 'opacity-0' : 'opacity-100'
                        } absolute bottom-12 -translate-y-[200%] text-lg text-red-500 transition-opacity`}
                    >
                        {errorMessage}
                    </p>
                    <div className='flex w-full flex-col gap-4 md:flex-row'>
                        <InputField
                            onChange={e => setRoomName(e.target.value)}
                            type='text'
                            placeholder='enter a room name'
                            onKeyDown={handleKeyDown}
                            onBlur={checkOnBlur}
                            className='shrink md:w-2/3'
                        />
                        <Button size={ButtonSize.lg} onClick={handleGoToRoom}>
                            Submit
                        </Button>
                    </div>
                    <div
                        className='flex items-center gap-2'
                        title='Joining a private room?'
                    >
                        <label
                            htmlFor='room-privacy'
                            className='relative cursor-pointer'
                        >
                            <input
                                type='checkbox'
                                id='room-privacy'
                                className='peer sr-only'
                                aria-label='room-privacy'
                                role='checkbox'
                                checked={isPrivate}
                                onChange={() => setIsPrivate(!isPrivate)}
                            />
                            <div className="peer h-6 w-11 rounded-full bg-gray-400 peer-checked:bg-blue-500 after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                        </label>
                        <span className='text-2xl select-none'>Private</span>
                    </div>
                </div>
                <div className='relative box-border flex flex-col md:flex-row'></div>
            </div>
            <Footer className='w-full' />
        </div>
    )
}
