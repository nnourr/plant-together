import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../components/footer.component";
import { InputField } from "../components/inputField.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSeedling } from "@fortawesome/free-solid-svg-icons";

export const Landing: React.FC = () => {
  const [roomName, setRoomName] = useState<string>("");
  const navigate = useNavigate();

  const goToRoom = () => {
    if (roomName.includes(" ")) {
      alert("no spaces allowed x(");
      return;
    }
    if (roomName.includes("/")) {
      alert("no dash allowed x(");
      return;
    }
    navigate(`room/${roomName}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      goToRoom();
    }
  };

  return (
    <div>
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
        <div className="flex gap-4 flex-col md:flex-row box-border mt-8">
          <InputField 
            onChange= {(e) => setRoomName(e.target.value)}
            type="text"
            placeholder="enter a room name"
            onKeyDown={handleKeyDown}
          />
          <button
            className="text-2xl border-white/20 border-2 rounded-xl w-[80vw] lg:w-auto px-4 py-2 transition-all hover:border-white/60"
            onClick={goToRoom}
          >
            Submit
          </button>
        </div>
      </div>
      <Footer className="w-full" />
    </div>
  );
};
