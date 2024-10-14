import { useNavigate } from "react-router-dom";

export const NavBar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-slate-900 w-full h-16 flex items-center px-8 justify-between">
      <a href="/" onClick={() => navigate("/")}>
        <h1 className="text-white font-mono text-xl font-bold">
          Plant Together
        </h1>
      </a>
      <button
        className="text-white font-bold border-white/20 border-2 rounded-xl px-2 py-1 transition-all hover:border-white/60"
        onClick={() => navigate("/")}
      >
        new room
      </button>
    </div>
  );
};
