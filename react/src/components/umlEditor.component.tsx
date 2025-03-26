import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Editor, Monaco } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { editor } from "monaco-editor";
import { DocumentModel } from "../models/document.model";
import { IPlantUmlError } from "../models/plantUmlError.model";
import { UserContext } from "./user.context";

const serverWsUrl =
  import.meta.env.VITE_SERVER_WS_URL || "http://localhost:3002";

interface UmlEditorProps {
  roomId: string;
  currDocument: DocumentModel;
  className?: string;
  setEditorValue: (newVal: string) => void;
  error?: IPlantUmlError;
}
const colors = ["red", "green", "blue", "yellow", "purple", "orange", "cyan"];

const color = colors[Math.floor(Math.random() * colors.length)];
export const UmlEditor: React.FC<UmlEditorProps> = ({
  roomId,
  currDocument,
  setEditorValue,
  className,
  error,
}) => {
  const [wsID, setWsID] = useState<string>(`${roomId}${currDocument.id}`);
  const clientsRef = useRef<number[]>([]);
  const [decorations, setDecorations] =
    useState<editor.IEditorDecorationsCollection | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const docRef = useRef<Y.Doc | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const userContext = useContext(UserContext);

  useEffect(() => {
    setWsID(`${roomId}${currDocument.id}`);
  }, [currDocument, roomId]);

  useEffect(() => {
    if (!monacoRef.current || !editorRef.current) return;

    if (error && error.line) {
      const monaco = monacoRef.current;
      decorations?.set([
        {
          range: new monaco.Range(error.line, 1, error.line, 1),
          options: {
            isWholeLine: true,
            inlineClassName: "underline decoration-red-700 decoration-wavy",
          },
        },
      ]);
    } else {
      decorations?.clear();
    }
  }, [error?.line]);

  const updateClientStyleSheets = (
    statesArray: [number, { [x: string]: any }][]
  ) => {
    statesArray.forEach((state) => {
      const clientId = state[0];
      console.log(clientId);
      if (state[1].user) {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
        .yRemoteSelectionHead-${clientId}{
          border-left: 2px solid ${state[1].user.color} ;
          position:relative;
        }
        .yRemoteSelection-${clientId}{
          background-color: ${state[1].user.color} !important;
          opacity: 0.5 !important;
        }
      `;
        document.head.appendChild(styleSheet);
        // console.log("the color is" + state[1].user.color);
      }
    });
  };

  const setBinding = useCallback(() => {
    // Clean up the previous provider if it exists
    if (providerRef.current) {
      providerRef.current.destroy();
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
      docRef.current = null;
      providerRef.current = null;
    }

    // Create a new Yjs document and WebSocket provider
    const doc = new Y.Doc();
    docRef.current = doc;
    const provider = new WebsocketProvider(serverWsUrl, wsID, doc);
    providerRef.current = provider;

    provider.awareness.setLocalStateField("user", {
      name: userContext.context?.displayName || "guest",
      color: color,
    });

    provider.awareness.on("change", () => {
      const statesArray = Array.from(provider.awareness.getStates());
      const newClients = statesArray.map((state) => state[0]);
      console.log(clientsRef.current); // Use ref for logging
      const clientsChanged =
        !clientsRef.current ||
        clientsRef.current.length !== newClients.length ||
        !clientsRef.current.every((client) => newClients.includes(client));

      if (clientsChanged) {
        clientsRef.current = newClients; // Update the ref with new clients
        updateClientStyleSheets(statesArray);
      }
    });

    // Bind Yjs doc to Monaco editor model
    const type = doc.getText("monaco");

    // Check if the editor is initialized before creating the binding
    if (editorRef.current) {
      const binding = new MonacoBinding(
        type,
        editorRef.current.getModel()!,
        new Set([editorRef.current]),
        provider.awareness
      );
      bindingRef.current = binding;
    }

    // Clean up on component unmount or when wsID changes
    return () => {
      provider.destroy();
      bindingRef.current?.destroy();
    };
  }, [wsID]);

  useEffect(() => {
    if (!!!currDocument || !!!roomId) {
      return;
    }

    setBinding();
  }, [currDocument, roomId, setBinding]);

  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    // init the decorations so we can update them later
    const decorationCollection = editorRef.current.createDecorationsCollection(
      []
    );
    setDecorations(decorationCollection);

    const newModel = editorRef.current.getModel();
    if (newModel === null) {
      console.log("Model is null");
      return;
    }
    // this is a hack to fix the issue with different line endings on different platforms
    newModel.setEOL(0);
    editorRef.current.setModel(newModel);

    setBinding();
  }

  return (
    <div className={`${className}`}>
      <Editor
        theme={"vs-dark"}
        defaultLanguage={"python"}
        onMount={handleEditorDidMount}
        onChange={(value) => setEditorValue(value || "")}
      />
    </div>
  );
};
