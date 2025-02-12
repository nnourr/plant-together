import { UmlEditor } from "../components/umlEditor.component";
import { UmlDisplay } from "../components/umlDisplay.component";
import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { NavBar } from "../components/navBar.component";
import * as plantService from "../service/plant.service.tsx"
import { DocumentModel } from "../models/document.model";
import { SideBar } from "../components/sideBar.component";
import { useSocket } from "../hooks/useSocket.tsx";
import { useSocketEvent } from "../hooks/useSocketEvent.tsx";
import { SocketContext } from "../context/SocketContext.tsx";

export const CollabRoom: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  // useSocketEvent("/document", console.log());
  const [editorValue, setEditorValue] = useState<string>("");
  const [roomDocuments, setRoomDocuments] = useState<DocumentModel[]>([])
  const [currDocument, setCurrDocument] = useState<DocumentModel>()

  useEffect(() => {
    const getRoomInfo = async (r: string) => {
      const room = await plantService.getRoomWithDocuments(r)
      if (!!!room.documents || room.documents.length === 0) {
        await plantService.createRoomWithDocument(r, r, "Document1")
        await getRoomInfo(r)
        return
      }

      setRoomDocuments(room.documents)
      setCurrDocument(room.documents[0])
    }

    if (roomId) {
      getRoomInfo(roomId)
    }
  }, []);

  if (roomId === undefined) {
    navigate("/");
    return;
  }  

  const createNewDocument = async (roomId: string, documentName: any) => {
    console.log(socket);
    await plantService.createDocumentInRoom(socket!, roomId, documentName, () => console.log("HeLLo wOrLD"))
    // window.location.reload()
  }

  return (
    <div className="w-full h-full flex flex-col">
      <NavBar />
      <div className="flex w-full h-full max-w-[100vw] flex-col-reverse md:flex-row">
        <SideBar
        currDocument={currDocument}
        documents={roomDocuments}
        setCurrDocument={setCurrDocument}
        newDocument={() => createNewDocument(roomId, `Document${roomDocuments.length+1}`)}
        className="w-80"
        />
        {/* {currDocument &&
        <UmlEditor
          className="h-1/2 md:w-1/3 md:h-full"
          roomId={roomId}
          currDocument={currDocument}
          setEditorValue={setEditorValue}
        />
        }
        <UmlDisplay className="h-1/2 md:w-1/2 md:h-full" umlStr={editorValue} /> */}
      </div>
    </div>
  );
};
