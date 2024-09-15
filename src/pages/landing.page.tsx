import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="w-full h-full bg-slate-900 flex justify-center items-center flex-col gap-16">
      <h1 className="text-white max-w-[100vw] text-6xl text-center lg:text-9xl font-mono font-bold">
        Plant Together
      </h1>
      <div className="flex gap-4 flex-col md:flex-row box-border">
        <input
          onChange={(event) => setRoomName(event.target.value)}
          className="rounded-xl bg-transparent border-2 border-white/20 text-white text-2xl w-[80vw] lg:w-auto px-4 py-2"
          type="text"
          placeholder="enter a room name"
        ></input>
        <button
          className="text-white text-2xl border-white/20 border-2 rounded-xl w-[80vw] lg:w-auto px-4 py-2 transition-all hover:border-white/60"
          onClick={goToRoom}
        >
          Submit
        </button>
      </div>
    </div>
  );
};
