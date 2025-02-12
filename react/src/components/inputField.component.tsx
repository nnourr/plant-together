interface InputFieldProps {
    label: string;
    type: string;
    onChange: Function;
    onKeyDown?: Function;
    placeholder?: string;
}

export const InputField: React.FC<InputFieldProps> = ({label, placeholder, type, onChange, onKeyDown }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown != null) {
        onKeyDown(event);
    }
  }

  return (
    <div>
      <label htmlFor="input-field">{label}</label>
      <input
        className="rounded-xl bg-transparent border-2 border-white/20 text-2xl w-[80vw] lg:w-auto px-4 py-2"
        type={type}
        placeholder={placeholder}
        onChange={(e) => handleChange(e)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};