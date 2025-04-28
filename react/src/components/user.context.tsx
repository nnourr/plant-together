import { createContext, useState } from 'react'
import { createUserSession, loginGuestUser } from '../utils/auth.helpers'

export type UserContextObjectType = {
  sessionActive: boolean
  isGuest?: boolean
  userId?: string
  displayName?: string
  email?: string
  expiry?: number
}

export type UserContextType = {
  context: UserContextObjectType
  set?: React.Dispatch<React.SetStateAction<UserContextObjectType>>
}

export const UserContext = createContext<UserContextType>({
  context: { sessionActive: false },
})

const userContextInit = async (userContext: UserContextType) => {
  const token = window.localStorage.getItem('jwt')

  if (token) {
    try {
      await createUserSession({ token }, userContext)
    } catch (error: any) {
      console.error(`Failed to refresh user session. ${error.message}`)
    }

    return
  }

  try {
    await loginGuestUser(userContext)
  } catch (error: any) {
    console.error(`Failed to initialize guest user session. ${error.message}`)
  }
}

export const UserContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [userContextValue, setUserContextValue] =
    useState<UserContextObjectType>({ sessionActive: false })

  if (!userContextValue.sessionActive)
    (async () => {
      await userContextInit({
        context: userContextValue,
        set: setUserContextValue,
      })
    })()

  return (
    <UserContext.Provider
      value={{ context: userContextValue, set: setUserContextValue }}
    >
      {children}
    </UserContext.Provider>
  )
}
