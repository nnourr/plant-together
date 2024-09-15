import { UmlEditor } from "../components/umlEditor.component";
import { UmlDisplay } from "../components/umlDisplay.component";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { NavBar } from "../components/navBar.component";

export const CollabRoom: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [editorValue, setEditorValue] = useState<string>("");

  useEffect(() => {
    console.log(editorValue);
  }, [editorValue]);

  if (roomId === undefined) {
    navigate("/");
    return;
  }
  return (
    <div className="w-full h-full flex flex-col">
      <NavBar />
      <div className="flex w-full h-full max-w-[100vw] flex-col md:flex-row">
        <UmlEditor
          className="h-1/2 md:w-1/2 md:h-full"
          roomId={roomId}
          setEditorValue={setEditorValue}
        />
        <UmlDisplay className="h-1/2 md:w-1/2 md:h-full" umlStr={editorValue} />
      </div>
    </div>
  );
};
