import NourHeadshot from "../assets/headshots/NoureldeenAhmed.jpeg";
import JasonHeadshot from "../assets/headshots/JasonTan.jpg";
import BrettHeadshot from "../assets/headshots/BrettanCutchall.jpg";
import ValmikHeadshot from "../assets/headshots/ValmikHeadshot.jpeg";
import MazenHeadshot from "../assets/headshots/MazenHeadshot.jpg";
import { Button, ButtonSize } from "./button.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

interface TeamModalProps {
  onClose: () => void;
  className: string;
}

interface Contributor {
  name: string;
  link: string;
  image: string;
}

const contributors: Contributor[] = [
  {
    name: "Noureldeen\nAhmed",
    link: "https://nnourr.tech",
    image: NourHeadshot,
  },
  {
    name: "Jason\nTan",
    link: "https://jasontan.co/",
    image: JasonHeadshot,
  },
  {
    name: "Brettan\nCutchall",
    link: "https://github.com/Bcutch",
    image: BrettHeadshot,
  },
  {
    name: "Mazen\nBahgat",
    link: "https://www.mazenbahgat.com/",
    image: MazenHeadshot,
  },
  {
    name: "Valmik\nDixon",
    link: "https://www.valmikdixon.com/",
    image: ValmikHeadshot,
  },
];

export const TeamModal: React.FC<TeamModalProps> = ({ onClose, className }) => {
  const profiles = contributors.map((contributor, index) => (
    <a
      className="flex gap-2 items-center w-28 md:w-32 flex-col text-white text-center group/profile group-hover/collab:opacity-50 hover:!opacity-100 transition-opacity"
      key={index}
      href={contributor.link}
      target="__blank"
    >
      <div
        className={`rounded-full w-full aspect-square overflow-hidden border-transparent border-2 group-hover/profile:border-blue-500 transition-opacity`}
      >
        <img
          src={contributor.image}
          className="w-full aspect-square object-cover"
          alt={`${contributor.name} + headshot`}
        />
      </div>
      <p className="text-bold whitespace-pre-line">{contributor.name}</p>
    </a>
  ));
  return (
    <div
      className={`${className} fixed inset-0 backdrop-blur-sm flex items-center justify-center transition-opacity duration-200`}
    >
      <div
        className="w-full absolute top-0 left-0 h-full -z-1"
        onClick={onClose}
      />
      <div className="bg-slate-800 p-6 rounded-xl shadow-xl w-fit">
        <div className="flex justify-between w-full">
          <h2 className="text-white text-2xl font-bold mb-6">Meet the Team</h2>
          <Button size={ButtonSize.icon} onClick={onClose} className="h-8 w-8">
            <FontAwesomeIcon icon={faClose} className="text-white" />
          </Button>
        </div>
        <div className="flex gap-8 justify-center group/collab flex-wrap overflow-y-auto h-full">
          {profiles}
        </div>
      </div>
    </div>
  );
};
