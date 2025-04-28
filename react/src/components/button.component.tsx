export const enum ButtonSize {
  icon = "",
  sm = "px-2 py-1 text-base font-bold",
  md = "text-xl px-4 py-2",
  lg = "text-xl md:text-2xl px-4 py-2",
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size: ButtonSize;
  primary?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  size,
  className,
  primary = false,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`${className} ${size} text-white border-white/${
        primary ? 60 : 20
      } border-2 rounded-xl transition-all hover:border-white/60 cursor-pointer`}
      {...props}
    >
      {children}
    </button>
  );
};
