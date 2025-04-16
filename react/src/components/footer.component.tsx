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
        className={`${className} bg-black md:px-16 md:py-12 w-full text-white md:text-3xl font-bold flex justify-between md:flex-row flex-col px-8 py-9 text-xl gap-4`}
      >
        <a
          href="https://github.com/nnourr/plant-together"
          target="__blank"
          className="w-full"
        >
          View Github
        </a>
        <button
          onClick={() => setShowModal(true)}
          className="text-left text-blue-500 text-nowrap cursor-pointer"
        >
          Meet the Team
        </button>
      </footer>
    </>
  );
};
