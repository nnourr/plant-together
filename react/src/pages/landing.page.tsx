import { useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../components/footer.component";
import { InputField } from "../components/inputField.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSeedling } from "@fortawesome/free-solid-svg-icons";
import { Button, ButtonSize } from "../components/button.component";
import { UserContext } from "../components/user.context";
import { endSession } from "../utils/auth.helpers";
import * as plantService from "../service/plant.service";

export const Landing: React.FC = () => {
  const [roomName, setRoomName] = useState<string>("");
  const [error, setError] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const userContext = useContext(UserContext);
  const navigate = useNavigate();

  const handleGoToRoom = useCallback(async () => {
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

    try {
      const roomToGoTo = isPrivate ? `private/${userContext?.context?.userId}/${roomName}` : roomName;
      // check if room exists in either public or private and goto it
      const room = isPrivate ? await plantService.getPrivateRoom(userContext?.context?.userId!, roomName) : await plantService.getPublicRoom(roomName);
      if (room?.documents) { // rooms that exist will have documents key
        navigate(`/${roomToGoTo}`);
        return;
      }

      // create the room
      await plantService.createRoomWithDocument(roomName, isPrivate, "Document1");
      navigate(`/${roomToGoTo}`);
    } catch (error: any) {
      setError(true);
      setErrorMessage(error.message);
    }
  }, [roomName, navigate, isPrivate, userContext?.context?.userId, plantService]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleGoToRoom();
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
        <div className="flex gap-4 flex-col box-border mt-8 relative items-center">
          <p
            role="alert"
            className={`${
              !error ? "opacity-0" : "opacity-100"
            } text-red-500 absolute bottom-12 -translate-y-[200%] text-lg transition-opacity`}
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
          <div className="flex items-center gap-2">
            <label htmlFor="room-privacy" className="cursor-pointer relative">
              <input
                type="checkbox"
                id="room-privacy"
                className="sr-only peer"
                checked={isPrivate}
                onChange={() => setIsPrivate(!isPrivate)}
              />
              <div className="w-11 h-6 bg-gray-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500" />
            </label>
            <span className="text-2xl font-medium select-none">
              Private
            </span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row box-border relative">
          <Button size={ButtonSize.lg} onClick={handleGoToRoom}>
            Submit
          </Button>          
        </div>
      </div>
      <Footer className="w-full" />
    </div>
  );
};
