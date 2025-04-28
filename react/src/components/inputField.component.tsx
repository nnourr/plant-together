interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  title,
  id = "input-field",
  className,
  ...props
}) => {
  return (
    <div
      className={`${className} rounded-xl border-2 px-4 py-2 border-white/20 focus-within:border-white/40 flex gap-4 bg-transparent flex-col md:flex-row box-border`}
    >
      {title && <label htmlFor={id}>{title}</label>}
      <input
        className="text-lg md:text-2xl w-full focus:outline-none"
        {...props}
        id={id}
      />
    </div>
  );
};
