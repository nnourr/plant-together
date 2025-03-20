import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ButtonSize } from "./button.component";
import { UserContext } from "../components/user.context";

export const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const userContext = useContext(UserContext);

  const displayName = userContext.context.displayName;

  return (
    <div className="bg-slate-900 w-full h-16 flex items-center px-8 justify-between">
      <a href="/" onClick={() => navigate("/")}>
        <h1 className="text-white font-mono text-xl font-bold">
          {displayName && `Hi ${displayName}! Welcome to `} Plant Together
        </h1>
      </a>
      <Button size={ButtonSize.sm} onClick={() => navigate("/")}>
        new room
      </Button>
    </div>
  );
};
