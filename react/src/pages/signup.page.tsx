import type React from 'react'

import { useState, useContext } from 'react'

import { Button, ButtonSize } from '../components/button.component'
import { InputField } from '../components/inputField.component'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSeedling } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../components/user.context'

import {
  failedCreateSession,
  loginGuestUser,
  createUser,
} from '../utils/auth.helpers.ts'

export const Signup: React.FC = () => {
  const [displayName, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const userContext = useContext(UserContext)
  const navigate = useNavigate()

  const DEFAULT_ERROR_MESSAGE =
    'Error occurred while creating account. Please try again later.'

  const handleGuest = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await loginGuestUser(userContext)
      setError('')
      navigate('/', { replace: true })
    } catch (error: any) {
      await failedCreateSession(
        error.message || DEFAULT_ERROR_MESSAGE,
        setError,
        userContext,
      )
    }
  }

  const validateSignupForm = (): boolean => {
    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill missing fields')
      return false
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateSignupForm()) return

    try {
      await createUser(displayName, email, password, userContext)
      setError('')
      navigate('/', { replace: true })
    } catch (error: any) {
      await failedCreateSession(
        error.message || DEFAULT_ERROR_MESSAGE,
        setError,
        userContext,
      )
    }
  }

  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4 text-white'>
      <div className='w-full max-w-md space-y-8'>
        <div className='flex flex-col items-center text-center'>
          <div className='mb-2 flex items-center gap-2 text-4xl font-bold'>
            <FontAwesomeIcon icon={faSeedling} className='hidden lg:inline' />
            <h1>Plant Together.</h1>
          </div>
        </div>

        <div className='rounded-md border-0 bg-[#1a2234] shadow-lg'>
          <h1 className='p-8 md:py-10'>
            <div className='text-center text-2xl font-bold'>
              Create an Account
            </div>
          </h1>
          <div className='px-12 pb-12'>
            {error && (
              <div className='mb-6 rounded-md border border-red-700 bg-red-900/30 p-3 text-sm text-red-200'>
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className='space-y-6'>
              <div className='space-y-2'>
                <label
                  htmlFor='displayName'
                  className='block text-sm font-medium text-gray-300'
                >
                  Display Name
                </label>
                <InputField
                  id='displayName'
                  value={displayName}
                  onChange={e => setUsername(e.target.value)}
                  placeholder='Choose a display name'
                  className='w-full rounded-md border-white/20 bg-slate-900 px-3 py-2 text-lg'
                />
              </div>
              <div className='space-y-2'>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-300'
                >
                  Email
                </label>
                <InputField
                  id='email'
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder='Enter your email'
                  className='w-full rounded-md border-white/20 bg-slate-900 px-3 py-2 text-lg'
                />
              </div>
              <div className='space-y-2'>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-300'
                >
                  Password
                </label>
                <InputField
                  id='password'
                  type='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder='Create a password'
                  className='w-full rounded-md border-white/20 bg-slate-900 px-3 py-2 text-lg'
                  autoComplete='new-password'
                />
              </div>
              <div className='space-y-2'>
                <label
                  htmlFor='confirm-password'
                  className='block text-sm font-medium text-gray-300'
                >
                  Confirm Password
                </label>
                <InputField
                  id='confirm-password'
                  type='password'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder='Confirm your password'
                  className='w-full rounded-md border-white/20 bg-slate-900 px-3 py-2 text-lg'
                  autoComplete='new-password'
                />
              </div>

              <Button
                type='submit'
                size={ButtonSize.lg}
                className='w-full rounded-md bg-green-600 hover:bg-green-700'
                primary
              >
                Create Account
              </Button>

              <div className='relative my-6'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-600' />
                </div>
                <div className='relative flex justify-center'>
                  <span className='bg-[#1a2234] px-2 text-xs text-gray-400'>
                    OR
                  </span>
                </div>
              </div>

              <Button
                type='button'
                size={ButtonSize.lg}
                className='w-full rounded-md hover:bg-green-600/10'
                onClick={handleGuest}
              >
                Continue as Guest
              </Button>
            </form>

            <div className='mt-6 text-center text-sm text-gray-400'>
              Already have an account?{' '}
              <a
                onClick={() => navigate('/login')}
                className='cursor-pointer text-green-500 hover:underline'
              >
                Log in
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
