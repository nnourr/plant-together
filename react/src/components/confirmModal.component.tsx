import { Button, ButtonSize } from './button.component'

interface ConfirmModalProps {
  onClose: (arg: string) => void
  document: string
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  onClose,
  document,
}: ConfirmModalProps) => {
  return (
    <div className='fixed inset-0 z-9999 flex items-center justify-center backdrop-blur-xs transition-opacity duration-200'>
      <div className='w-[32rem] rounded-xl bg-slate-800 p-6 shadow-xl'>
        <div className='mb-6 items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold text-white'>Delete {document}?</h2>
          <h3 className='text-xl font-bold text-white'>
            Are you sure you want to delete this document?
          </h3>
        </div>
        <div className='max-h-[60vh] space-y-2 space-x-40 text-center'>
          <Button
            size={ButtonSize.lg}
            onClick={() => {
              onClose('No')
            }}
          >
            No
          </Button>
          <Button
            size={ButtonSize.lg}
            onClick={() => {
              onClose('Yes')
            }}
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  )
}
