import { UmlEditor } from "../components/umlEditor.component";
import { UmlDisplay } from "../components/umlDisplay.component";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState, useContext, useMemo } from "react";
import { NavBar } from "../components/navBar.component";
import * as plantService from "../service/plant.service.tsx";
import { DocumentModel } from "../models/document.model";
import { SideBar } from "../components/sideBar.component";
import { io, Socket } from "socket.io-client";
import { IPlantUmlError } from "../models/plantUmlError.model.tsx";
import { Button, ButtonSize } from "../components/button.component.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../components/user.context";

const serverHttpUrl =
  (import.meta.env.VITE_SERVER_HTTP_URL || "http://localhost:3000") +
  "/documents";

export const CollabRoom: React.FC = () => {
  const { roomName, ownerId } = useParams();
  const [searchParams] = useSearchParams();
  const signature = searchParams.get('signature');
  const navigate = useNavigate();
  //useSocketEvent("/document", console.log());
  const [editorValue, setEditorValue] = useState<string>("");
  const [roomDocuments, setRoomDocuments] = useState<DocumentModel[]>([]);
  const [currDocument, setCurrDocument] = useState<DocumentModel>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [syntaxError, setSyntaxError] = useState<IPlantUmlError>();
  const [sideBarOpen, setSideBarOpen] = useState<boolean>(true);
  const [mobile, setMobile] = useState<boolean>(false);
  const [umlClosed, setUmlClosed] = useState<boolean>(false);
  const [umlStyle, setUmlStyle] = useState<string>("h-full");
  const [roomId, setRoomId] = useState<string>('');
  const userContext = useContext(UserContext);
  
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const isPrivate = useMemo<boolean>(() => Boolean(ownerId), [ownerId]);

  useEffect(() => {
    const getRoomInfo = async () => {
      try {
        const room = isPrivate 
          ? await plantService.getPrivateRoom(ownerId!, roomName!, signature) 
          : await plantService.getPublicRoom(roomName!);
        
        if (!room) {
          alert("Room not found");
          navigate('/');
          return;
        }

        setIsOwner(room.owner_id === userContext?.context?.userId);
        setRoomId(room.id);
        setRoomDocuments(room.documents);
        setCurrDocument(room.documents[0]);
      } catch (error) {
        console.error("Error getting room info:", error);
        alert(`Error getting room info: ${error}`);
        navigate('/');
      }
    };

    if (roomName) {
      getRoomInfo();
    }
  }, [userContext, roomName, ownerId, signature]);

  if (roomName === undefined) {
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

  useEffect(() => {
    if (window.innerWidth <= 767) {
      setSideBarOpen(false);
      setMobile(true);
    }
  }, []);

  const updateDocument = async (documentId: any, documentNewName: string) => {
    if (!userContext?.context?.sessionActive) return;

    await plantService.updateDocumentInRoom(
      socket!,
      documentId,
      documentNewName,
      ({ documentName }) => {
        const updatedRoomDocuments = [...roomDocuments];
        const updatedDoc = updatedRoomDocuments.find(
          (doc) => doc.id === documentId
        );
        updatedDoc!.name = documentName;
        setRoomDocuments(updatedRoomDocuments);
      }
    );
  };

  const deleteDocument = async (documentId: any) => {
    if (!userContext?.context?.sessionActive) return;

    await plantService.deleteDocumentInRoom(
      socket!,
      documentId,
      ({ documentId }) => {
        const updatedRoomDocuments = [...roomDocuments];
        const deletedDoc = updatedRoomDocuments.find(
          (doc) => doc.id === documentId
        );
        const index = updatedRoomDocuments.indexOf(deletedDoc!);

        const deleted = updatedRoomDocuments.splice(index, 1);
        setRoomDocuments(updatedRoomDocuments);

        if (currDocument === deleted[0]) {
          setCurrDocument(updatedRoomDocuments[0]);
        }
      }
    );
  };

  useEffect(() => {
    (async () => {
      if (!userContext?.context?.sessionActive || !roomId) return;

      const authToken = await plantService.retrieveToken();

      const newSocket = io(serverHttpUrl, {
        extraHeaders: {
          "room-id": roomId,
          Authorization: `Bearer ${authToken}`,
        },
      });

      setSocket(newSocket);
    })();
  }, [userContext, roomId]);

  useEffect(() => {
    socket?.on("/document", ({ code, documentName, id }: any) => {
      if (code != 200) {
        alert("Unable to update new document");
      }

      setRoomDocuments((docs) => [...docs, { id: id, name: documentName }]);
    });

    socket?.on(
      "/document/rename",
      ({ code, newDocumentName, documentId }: any) => {
        if (code != 200) {
          alert("Unable to rename document");
        }

        setRoomDocuments((docs: any) => {
          const updatedRoomDocuments = [...docs];
          const updatedDoc = updatedRoomDocuments.find(
            (doc) => doc.id === documentId
          );
          updatedDoc!.name = newDocumentName;
          return updatedRoomDocuments;
        });
      }
    );

    socket?.on(
      "/document/delete",
      ({ code, documentId }: any) => {
        if (code != 200) {
          alert("Unable to delete document");
        }

        setRoomDocuments((docs: any) => {
          const updatedRoomDocuments = [...docs];
          const deletedDoc = updatedRoomDocuments.find(
            (doc) => doc.id === documentId
          );
          const index = updatedRoomDocuments.indexOf(deletedDoc!);

          const deleted = updatedRoomDocuments.splice(index, 1);

          setCurrDocument((doc: any) =>{
            if (doc.id === documentId) {
              return updatedRoomDocuments[0];
            } else {
              return doc;
            }
          })

          return updatedRoomDocuments;
        });

        
      }
    );

    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (mobile && sideBarOpen) {
      setUmlStyle("h-1/4 overflow-auto");
      setUmlClosed(true);
    } else {
      setUmlStyle("h-full");
      setUmlClosed(false);
    }
  }, [sideBarOpen]);

  const mobileSideBar = () => {
    if (sideBarOpen) {
      return (
        <SideBar
          currDocument={currDocument}
          documents={roomDocuments}
          setCurrDocument={setCurrDocument}
          newDocument={() =>
            createNewDocument(roomId, `Document${roomDocuments.length + 1}`)
          }
          updateDocument={updateDocument}
          deleteDocument={deleteDocument}
          className="w-full h-1/2"
          setClose={() => setSideBarOpen(false)}
          roomId={roomId}
        />
      );
    } else {
      return (
        <div
          className={`border-white/0 flex-col gap-2 bg-slate-900 text-white px-2 border-t-4 border-slate-500 py-1`}
        >
          <button
            onClick={() => setSideBarOpen(true)}
            className={`border-white/20 border-2 rounded-xl px-2 py-1 text-base font-bold w-full`}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      );
    }
  };

  const closableSideBar = () => {
    if (sideBarOpen) {
      return (
        <SideBar
          currDocument={currDocument}
          documents={roomDocuments}
          setCurrDocument={setCurrDocument}
          newDocument={() =>
            createNewDocument(roomId, `Document${roomDocuments.length + 1}`)
          }
          updateDocument={updateDocument}
          deleteDocument={deleteDocument}
          className="w-80"
          setClose={() => setSideBarOpen(false)}
          roomId={roomId}
        />
      );
    } else {
      return (
        <div
          className={`h-1/2 md:w-16 md:h-full md:flex flex-col gap-2 bg-slate-900 text-white px-2 border-t-4 border-slate-500 py-4`}
        >
          <Button size={ButtonSize.sm} onClick={() => setSideBarOpen(true)}>
            <FontAwesomeIcon icon={faBars} />
          </Button>
        </div>
      );
    }
  };

  const mobileToggle = () => {
    if (window.innerWidth <= 767) {
      setSideBarOpen(false);
      setMobile(true);
    } else {
      setSideBarOpen(true);
      setMobile(false);
      setUmlClosed(false);
    }
    setUmlStyle("h-full");
  };

  window.addEventListener("resize", mobileToggle);

  return (
    <div className="w-full h-full flex flex-col">
      <NavBar isPrivate={isPrivate} roomId={roomId} roomName={roomName} isOwner={isOwner} />
      <div className="flex w-full h-[calc(100%-4rem)] max-w-[100vw] flex-col-reverse md:flex-row">
        {!mobile && closableSideBar()}
        {mobile && mobileSideBar()}
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
          className={`${umlStyle} md:w-1/2`}
          umlStr={editorValue}
          closed={umlClosed}
        />
      </div>
    </div>
  );
};
