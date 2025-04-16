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
        className={`${
          showModal ? "opacity-100 z-[9999]" : "opacity-0 -z-[9999]"
        }`}
        onClose={() => setShowModal(false)}
      />
      <footer
        className={`${className} bg-black lg:px-16 lg:py-12 w-full text-white lg:text-3xl font-bold flex justify-between lg:flex-row flex-col px-8 py-9 text-xl gap-4`}
      >
        <a href="https://github.com/nnourr/plant-together" target="__blank">
          view github
        </a>
        <button onClick={() => setShowModal(true)}>Meet the Team</button>
      </footer>
    </>
  );
};
