import { UmlEditor } from "../components/umlEditor.component";
import { UmlDisplay } from "../components/umlDisplay.component";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { NavBar } from "../components/navBar.component";
import * as plantService from "../service/plant.service.tsx";
import { DocumentModel } from "../models/document.model";
import { SideBar } from "../components/sideBar.component";
import { io, Socket } from "socket.io-client";
import { IPlantUmlError } from "../models/plantUmlError.model.tsx";
import { UserContext } from "../components/user.context";

const serverHttpUrl =
  (import.meta.env.VITE_SERVER_HTTP_URL || "http://localhost:3000") +
  "/documents";

export const CollabRoom: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  // useSocketEvent("/document", console.log());
  const [editorValue, setEditorValue] = useState<string>("");
  const [roomDocuments, setRoomDocuments] = useState<DocumentModel[]>([]);
  const [currDocument, setCurrDocument] = useState<DocumentModel>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [syntaxError, setSyntaxError] = useState<IPlantUmlError>();
  const userContext = useContext(UserContext);

  useEffect(() => {
    const getRoomInfo = async (r: string) => {
      if (!userContext?.context?.sessionActive) return; 
      
      const room = await plantService.getRoomWithDocuments(r);
      if (!!!room.documents || room.documents.length === 0) {
        await plantService.createRoomWithDocument(r, r, "Document1");
        await getRoomInfo(r);
        return;
      }

      setRoomDocuments(room.documents);
      setCurrDocument(room.documents[0]);
    };

    if (roomId) {
      getRoomInfo(roomId);
    }
  }, [userContext]);

  if (roomId === undefined) {
    navigate("/");
    return;
  }

  const createNewDocument = async (_roomId: string, documentName: any) => {
    if (!userContext?.context?.sessionActive) return; 

    await plantService.createDocumentInRoom(socket!, documentName, ({ id }) => {
      setRoomDocuments((docs) => [...docs, { id: id, name: documentName }]);
      setCurrDocument({ id: id, name: documentName });
    });
  };

  const updateDocument = async (documentId: any, documentNewName: string) => {
    if (!userContext?.context?.sessionActive) return; 

    await plantService.updateDocumentInRoom(socket!, documentId, documentNewName, ({ documentName }) => {
      const updatedRoomDocuments = [...roomDocuments];
      const updatedDoc = updatedRoomDocuments.find(doc => doc.id === documentId);
      updatedDoc!.name = documentName;
      setRoomDocuments(updatedRoomDocuments);
    })
  }

  useEffect(() => {
    (async () => {
      if (!userContext?.context?.sessionActive) return; 

      const authToken = await plantService.retrieveToken();

      const newSocket = io(serverHttpUrl, {
        extraHeaders: { 
          "room-id": roomId,
          "Authorization": `Bearer ${authToken}`
        },
      });
      
      setSocket(newSocket);
    })();
  }, [userContext]);

  useEffect(() => {
    socket?.on("/document", ({ code, documentName, id }: any) => {
      if (code != 200) {
        alert("Unable to update new document");
      }

      setRoomDocuments((docs) => [...docs, { id: id, name: documentName }]);
    });

    socket?.on("/document/rename", ({ code, newDocumentName, documentId }: any) => {
      if (code != 200) {
        alert("Unable to rename document");
      }

      const newDocs = roomDocuments.map((doc) => {
        if (doc.id !== documentId) return doc
        doc.name = newDocumentName  
        return doc
      });

      setRoomDocuments(newDocs);
    });

    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return (
    <div className="w-full h-full flex flex-col">
      <NavBar />
      <div className="flex w-full h-full max-w-[100vw] flex-col-reverse md:flex-row">
        <SideBar
          currDocument={currDocument}
          documents={roomDocuments}
          setCurrDocument={setCurrDocument}
          newDocument={() => createNewDocument(roomId, `Document${roomDocuments.length + 1}`)}
          updateDocument={updateDocument}
          className="w-80"
        />
        {currDocument && (
          <UmlEditor
            className="h-1/2 md:w-1/3 md:h-full"
            roomId={roomId}
            currDocument={currDocument}
            setEditorValue={setEditorValue}
            error={syntaxError}
          />
        )}
        <UmlDisplay
          setSyntaxError={setSyntaxError}
          syntaxError={syntaxError}
          className="h-1/2 md:w-1/2 md:h-full"
          umlStr={editorValue}
        />
      </div>
    </div>
  );
};
