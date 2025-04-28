interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string
}

export const InputField: React.FC<InputFieldProps> = ({
  title,
  id = 'input-field',
  className,
  ...props
}) => {
  return (
    <div className={`${className} box-border flex flex-col gap-4 md:flex-row`}>
      {title && <label htmlFor={id}>{title}</label>}
      <input
        className='w-full rounded-xl border-2 border-white/20 bg-transparent px-4 py-2 text-2xl'
        {...props}
        id={id}
      />
    </div>
  )
}
