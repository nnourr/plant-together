import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../components/footer.component";
import { InputField } from "../components/inputField.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSeedling } from "@fortawesome/free-solid-svg-icons";
import { Button, ButtonSize } from "../components/button.component";
import { UserContext } from "../components/user.context";
import { endSession } from "../utils/auth.helpers";

export const Landing: React.FC = () => {
  const [roomName, setRoomName] = useState<string>("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const userContext = useContext(UserContext);
  const navigate = useNavigate();

  const goToRoom = () => {
    if (!roomName.trim()) {
      setError(true);
      setErrorMessage("room name cannot be empty x(");
      return;
    }
    if (roomName.includes(" ")) {
      setError(true);
      setErrorMessage("no spaces allowed x(");
      return;
    }
    if (roomName.includes("/")) {
      setError(true);
      setErrorMessage("no slash allowed x(");
      return;
    }
    navigate(`room/${roomName}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      goToRoom();
    }
  };

  const checkOnBlur = () => {
    if (!roomName.trim()) {
      setError(false);
      setErrorMessage("");
      return;
    }
    if (roomName.includes(" ")) {
      setError(true);
      setErrorMessage("no spaces allowed x(");
      return;
    }
    if (roomName.includes("/")) {
      setError(true);
      setErrorMessage("no slash allowed x(");
      return;
    }
    
    return;
  };

  const handleLoginOut = () => {
    try {
      endSession(userContext);
      navigate("/login");
    } catch(error: any) {
      console.error(error.message);
    }
  };

  return (
    <div>
      <header className="p-4 flex justify-end bg-slate-900">
        <div>
          <Button size={ButtonSize.md} onClick={handleLoginOut}>
            {!userContext?.context?.sessionActive || userContext?.context?.isGuest
            && 'Login' || 'Logout'}
          </Button>
        </div>
      </header>
      <div className="w-full h-[100dvh] bg-slate-900 text-white flex justify-center items-center flex-col gap-12">
        <h1 className="max-w-[100vw] text-6xl relative text-center lg:text-9xl font-mono font-bold">
          <FontAwesomeIcon
            icon={faSeedling}
            className="mr-16 hidden lg:inline"
          />
          Plant Together.
        </h1>
        <FontAwesomeIcon
          icon={faSeedling}
          className="text-6xl -my-4 lg:hidden"
        />
        <h2 className="text-center text-xl px-8 lg:text-3xl">
          A simple, collaborative PlantUML editor.
          <br />
          Powered by{" "}
          <a
            className="font-mono underline"
            href="https://cheerpj.com/"
            target="__blank"
          >
            Cheerpj
          </a>
          .
        </h2>
        <div className="flex gap-4 flex-col md:flex-row box-border mt-8 relative">
          <p
            role="alert"
            className={`${
              !error ? "opacity-0" : "opacity-100"
            } text-red-500 absolute -bottom-8 text-lg transition-opacity`}
          >
            {errorMessage}
          </p>
          <InputField
            onChange={(e) => setRoomName(e.target.value)}
            type="text"
            placeholder="enter a room name"
            onKeyDown={handleKeyDown}
            onBlur={checkOnBlur}
          />
          <Button size={ButtonSize.lg} onClick={goToRoom}>
            Submit
          </Button>
        </div>
      </div>
      <Footer className="w-full" />
    </div>
  );
};
