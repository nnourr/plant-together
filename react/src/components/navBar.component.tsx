import { useNavigate } from "react-router-dom";
import { Button, ButtonSize } from "./button.component";

export const NavBar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-slate-900 w-full h-16 flex items-center px-8 justify-between">
      <a href="/" onClick={() => navigate("/")}>
        <h1 className="text-white font-mono text-xl font-bold">
          Plant Together
        </h1>
      </a>
      <Button size={ButtonSize.sm} onClick={() => navigate("/")}>
        new room
      </Button>
    </div>
  );
};
