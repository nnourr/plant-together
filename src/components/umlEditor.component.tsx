import { useRef } from "react";
import { Editor } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { editor } from "monaco-editor";

const serverWsUrl = import.meta.env.VITE_SERVER_WS_URL;

interface UmlEditorProps {
  roomId: string;
  className?: string;
  setEditorValue: (newVal: string) => void;
}

export const UmlEditor: React.FC<UmlEditorProps> = ({
  roomId,
  setEditorValue,
  className,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor>();

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor) {
    editorRef.current = editor;

    // Initialize yjs
    const doc = new Y.Doc(); // collection of shared objects

    // Connect to peers with WebSocket
    const provider: WebsocketProvider = new WebsocketProvider(
      serverWsUrl,
      roomId,
      doc
    );
    const type = doc.getText("monaco");

    // Bind yjs doc to Manaco editor
    const binding = new MonacoBinding(
      type,
      editorRef.current!.getModel()!,
      new Set([editorRef.current!])
    );
    console.log(binding, provider);
  }
  return (
    <div className={`${className}`}>
      <Editor
        language={"python"}
        theme={"vs-dark"}
        onMount={handleEditorDidMount}
        onChange={(value) => setEditorValue(value || "")}
      />
    </div>
  );
};
