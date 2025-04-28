import { useState } from 'react'
import { TeamModal } from './teamModal.components'

interface FooterProps {
  className: string
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const [showModal, setShowModal] = useState<boolean>(false)

  return (
    <>
      <TeamModal
        className={`${showModal ? 'z-9999 opacity-100' : '-z-9999 opacity-0'}`}
        onClose={() => setShowModal(false)}
      />
      <footer
        className={`${className} flex w-full flex-col justify-between gap-4 bg-slate-800 px-8 py-6 text-xl font-bold md:flex-row md:px-16 md:py-6 md:text-2xl`}
      >
        <button
          onClick={() => setShowModal(true)}
          className='w-full cursor-pointer text-left text-nowrap text-blue-500'
        >
          Meet the Team
        </button>
        <a
          href='https://github.com/nnourr/plant-together'
          target='__blank'
          className='w-full text-left text-white md:text-right'
        >
          View Github
        </a>
      </footer>
    </>
  )
}
