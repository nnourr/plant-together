interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    title?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ title, ...props }) => {

  return (
    <div className="flex gap-4 flex-col md:flex-row box-border mt-8">
      <label htmlFor="input-field">{title}</label>
      <input {...props}
        className="rounded-xl bg-transparent border-2 border-white/20 text-2xl w-[80vw] lg:w-auto px-4 py-2"
      />
    </div>
  );
};