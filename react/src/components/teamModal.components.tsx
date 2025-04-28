import NourHeadshot from '../assets/headshots/NoureldeenAhmed.jpeg'
import JasonHeadshot from '../assets/headshots/JasonTan.jpg'
import BrettHeadshot from '../assets/headshots/BrettanCutchall.jpg'
import ValmikHeadshot from '../assets/headshots/ValmikHeadshot.jpeg'
import MazenHeadshot from '../assets/headshots/MazenHeadshot.jpg'
import { Button, ButtonSize } from './button.component'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'

interface TeamModalProps {
  onClose: () => void
  className: string
}

interface Contributor {
  name: string
  link: string
  image: string
}

const contributors: Contributor[] = [
  {
    name: 'Noureldeen\nAhmed',
    link: 'https://nnourr.tech',
    image: NourHeadshot,
  },
  {
    name: 'Jason\nTan',
    link: 'https://jasontan.co/',
    image: JasonHeadshot,
  },
  {
    name: 'Brettan\nCutchall',
    link: 'https://github.com/Bcutch',
    image: BrettHeadshot,
  },
  {
    name: 'Mazen\nBahgat',
    link: 'https://www.mazenbahgat.com/',
    image: MazenHeadshot,
  },
  {
    name: 'Valmik\nDixon',
    link: 'https://www.valmikdixon.com/',
    image: ValmikHeadshot,
  },
]

export const TeamModal: React.FC<TeamModalProps> = ({ onClose, className }) => {
  const profiles = contributors.map((contributor, index) => (
    <a
      className='group/profile flex w-28 flex-col items-center gap-2 text-center text-white transition-opacity group-hover/collab:opacity-50 hover:!opacity-100 md:w-32'
      key={index}
      href={contributor.link}
      target='__blank'
    >
      <div
        className={`aspect-square w-full overflow-hidden rounded-full border-2 border-transparent transition-opacity group-hover/profile:border-blue-500`}
      >
        <img
          src={contributor.image}
          className='aspect-square w-full object-cover'
          alt={`${contributor.name} + headshot`}
        />
      </div>
      <p className='text-bold whitespace-pre-line'>{contributor.name}</p>
    </a>
  ))
  return (
    <div
      className={`${className} fixed inset-0 flex items-center justify-center backdrop-blur-sm transition-opacity duration-200`}
    >
      <div
        className='absolute top-0 left-0 -z-1 h-full w-full'
        onClick={onClose}
      />
      <div className='w-fit rounded-xl bg-slate-800 p-6 shadow-xl'>
        <div className='flex w-full justify-between'>
          <h2 className='mb-6 text-2xl font-bold text-white'>Meet the Team</h2>
          <Button size={ButtonSize.icon} onClick={onClose} className='h-8 w-8'>
            <FontAwesomeIcon icon={faClose} className='text-white' />
          </Button>
        </div>
        <div className='group/collab flex h-full flex-wrap justify-center gap-8 overflow-y-auto'>
          {profiles}
        </div>
      </div>
    </div>
  )
}
