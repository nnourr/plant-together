interface FooterProps {
  className: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer
      className={`${className} bg-black lg:px-16 lg:py-12 w-full text-white lg:text-3xl font-bold flex justify-between lg:flex-row flex-col px-8 py-9 text-xl gap-4`}
    >
      <a href="https://github.com/nnourr/plant-together" target="__blank">
        view github
      </a>
      <a href="https://nnourr.tech" target="__blank">
        made by <span className="text-pink-600">nnourr.tech</span>
      </a>
    </footer>
  );
};
