import { useState } from "react";
import { TeamModal } from "./teamModal.components";

interface FooterProps {
  className: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      <TeamModal
        className={`${showModal ? "opacity-100 z-9999" : "opacity-0 -z-9999"}`}
        onClose={() => setShowModal(false)}
      />
      <footer
        className={`${className} bg-slate-800 md:px-16 md:py-6 w-full md:text-2xl font-bold flex justify-between md:flex-row flex-col px-8 py-6 text-xl gap-4`}
      >
        <button
          onClick={() => setShowModal(true)}
          className="text-left w-full text-blue-500 text-nowrap cursor-pointer"
        >
          Meet the Team
        </button>
        <a
          href="https://github.com/nnourr/plant-together"
          target="__blank"
          className="w-full text-white text-left md:text-right "
        >
          View Github
        </a>
      </footer>
    </>
  );
};
