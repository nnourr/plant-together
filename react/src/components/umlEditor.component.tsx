import { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { editor } from "monaco-editor";
import { DocumentModel } from "../models/document.model";

const serverWsUrl = import.meta.env.VITE_SERVER_WS_URL;

interface UmlEditorProps {
  roomId: string;
  currDocument: DocumentModel;
  className?: string;
  setEditorValue: (newVal: string) => void;
}

export const UmlEditor: React.FC<UmlEditorProps> = ({
  roomId,
  currDocument,
  setEditorValue,
  className,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [wsID, setWsID] = useState<string>(`${roomId}${currDocument.id}`);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const docRef = useRef<Y.Doc | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  useEffect(() => {
    setWsID(`${roomId}${currDocument.id}`);
  }, [currDocument, roomId]);

  const setBinding = useCallback( () => {
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

    // Bind Yjs doc to Monaco editor model
    const type = doc.getText("monaco");

    // Check if the editor is initialized before creating the binding
    if (editorRef.current) {
      const binding = new MonacoBinding(
        type,
        editorRef.current.getModel()!,
        new Set([editorRef.current])
      );
      bindingRef.current = binding;
    }

    // Clean up on component unmount or when wsID changes
    return () => {
      provider.destroy();
      bindingRef.current?.destroy();
    }
  }, [wsID])

  useEffect(() => {
    if (!!!currDocument || !!!roomId) {
      return;
    }

    setBinding()    
  }, [currDocument, roomId, setBinding]);

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor) {
    editorRef.current = editor;

    const newModel = editorRef.current.getModel();
    if (newModel === null) {
      console.log("Model is null");
      return;
    }
    newModel.setEOL(0);
    editorRef.current.setModel(newModel);

    setBinding()
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
