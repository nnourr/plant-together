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

// List of quirky adjectives and nouns for username generation
const quirkyAdjectives = [
  "Flying",
  "Dancing",
  "Clever",
  "Sleepy",
  "Brave",
  "Cosmic",
  "Curious",
  "Dazzling",
  "Fluffy",
  "Gentle",
  "Happy",
  "Jolly",
  "Magical",
  "Noble",
  "Peaceful",
  "Quirky",
  "Radiant",
  "Silly",
  "Thoughtful",
  "Witty",
];

const quirkyNouns = [
  "Panda",
  "Dolphin",
  "Phoenix",
  "Dragon",
  "Unicorn",
  "Wizard",
  "Astronaut",
  "Butterfly",
  "Cactus",
  "Koala",
  "Robot",
  "Penguin",
  "Raccoon",
  "Tiger",
  "Falcon",
  "Jellyfish",
  "Octopus",
  "Platypus",
  "Squirrel",
  "Walrus",
];

// Generate a pseudorandom number using a string seed
const seededRandom = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Normalize to 0-1 range
  return Math.abs(hash) / 2 ** 31;
};

// Generate a quirky username based on userId
const generateQuirkyUsername = (userId: string): string => {
  const adjIndex = Math.floor(seededRandom(userId) * quirkyAdjectives.length);
  // Use a different part of the userId for the noun to reduce collisions
  const nounIndex = Math.floor(
    seededRandom(userId.split("").reverse().join("")) * quirkyNouns.length
  );

  const adjective = quirkyAdjectives[adjIndex];
  const noun = quirkyNouns[nounIndex];

  return `${adjective}-${noun}`;
};

// Generate a visually pleasing color based on a string (username)
const generateColorFromString = (str: string): string => {
  // Simple hash function to generate a number from a string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const pleasingHueRanges = [
    [0, 30], // Reds
    [40, 60], // Oranges
    [190, 240], // Blues
    [260, 280], // Purples
    [290, 330], // Magentas
    [120, 150], // Greens
  ];

  // Select a hue range based on hash
  const rangeIndex = Math.abs(hash) % pleasingHueRanges.length;
  const [minHue, maxHue] = pleasingHueRanges[rangeIndex];

  // Generate hue within the selected range
  const hue = minHue + (Math.abs(hash >> 8) % (maxHue - minHue));

  // Control saturation and lightness for vibrant but not overwhelming colors
  const saturation = 65 + (Math.abs(hash >> 16) % 20); // 65-85%
  const lightness = 55 + (Math.abs(hash >> 24) % 10); // 55-65%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

interface UmlEditorProps {
  roomId: string;
  currDocument: DocumentModel;
  className?: string;
  setEditorValue: (newVal: string) => void;
  error?: IPlantUmlError;
}

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

  // Generate username for guests or use displayName for signed-in users
  const username =
    userContext.context?.displayName ||
    generateQuirkyUsername(
      userContext.context?.userId || `guest-${Date.now()}`
    );

  const userColor = useRef(generateColorFromString(username));

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
      if (state[1].user) {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
        .yRemoteSelectionHead-${clientId}{
          border-left: 2px solid ${state[1].user.color};
          border-right: 8px solid transparent;
          position:relative;
        }
        .yRemoteSelection-${clientId}{
          background-color: ${state[1].user.color} !important;
          opacity: 0.5 !important;
        }
        .yRemoteSelectionHead-${clientId}::before {
          content: '${state[1].user.name}';
          color: black; 
          top: -15px;
          position:absolute;
          left: -2px;
          background-color:${state[1].user.color};
          opacity:0;
          transition: opacity 0.3s;
          font-size:10px;
          padding-left:1px;
          margin-bottom:8px;
          border-top-right-radius: 5px;
          border-bottom-right-radius: 5px;
          pointer-events: none !important;
          border-top-left-radius:5px;
        }
        .yRemoteSelectionHead-${clientId}:hover::before {
          opacity:0.8;
        }
      `;
        document.head.appendChild(styleSheet);
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
      name: username,
      color: userColor.current,
    });

    provider.awareness.on("change", () => {
      const statesArray = Array.from(provider.awareness.getStates());
      const newClients = statesArray.map((state) => state[0]);
      const clientsChanged =
        !clientsRef.current ||
        clientsRef.current.length !== newClients.length ||
        !clientsRef.current.every((client) => newClients.includes(client));

      if (clientsChanged) {
        clientsRef.current = newClients;
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
      provider.awareness.destroy();
      provider.destroy();
      bindingRef.current?.destroy();
    };
  }, [wsID, username]);

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
