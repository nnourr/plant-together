import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DocumentModel } from "../models/document.model";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { Button, ButtonSize } from "./button.component";
import { useState, useEffect, useRef } from "react";

interface SideBarProps {
  currDocument?: DocumentModel;
  documents?: DocumentModel[];
  setCurrDocument: (newVal: DocumentModel) => void;
  className?: string;
  newDocument: () => void;
  updateDocument: (documentId: any, documentNewName: string) => void;
}

export const SideBar: React.FC<SideBarProps> = ({
  currDocument,
  documents,
  setCurrDocument,
  newDocument,
  updateDocument,
  className = "",
}) => {
  if (!currDocument || !documents) {
    return <div className={className}>Loading...</div>;
  }

  const [docName, setDocName] = useState<string>("");
  const [edit, setEdit] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const editableRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (edit && editableRef.current) {
      editableRef.current.style.width = "auto";
      editableRef.current.focus();
    }
  }, [edit]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (docName.trim().length < 1) {
        setEdit(false);
        return;
      }
      updateDocument(currDocument.id, docName.trim());
      setEdit(false);
    }
  };

  const onBlur = () => {
    if (docName.trim().length < 1) {
      setEdit(false);
      return;
    }
    updateDocument(currDocument.id, docName.trim());
    setEdit(false);
  };

  const documentButtons = documents.map((document) => {
    if (document.id === currDocument.id) {
      return (
        <Button
          key={document.id}
          size={ButtonSize.md}
          onClick={() => setCurrDocument(document)}
          primary={true}
        >
          <div className="flex items-center gap-2">
            {edit ? (
              <input
                className="w-40 bg-transparent text-white text-ellipsis text-clip"
                type="text"
                ref={editableRef}
                value={docName}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setDocName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={onBlur}
              />
            ) : (
              <div className="text-left truncate">{document.name}</div>
            )}
            {!edit && (
              <button
                aria-label="edit"
                className="transition-all"
                onClick={() => {
                  setEdit(true);
                  setDocName(document.name);
                }}
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
            )}
          </div>
        </Button>
      );
    } else {
      return (
        <Button
          key={document.id}
          size={ButtonSize.md}
          className="text-left truncate"
          onClick={() => setCurrDocument(document)}
          primary={false}
        >
          {document.name}
        </Button>
      );
    }
  });

  return (
    <div
      className={`${className} relative hidden md:flex flex-col gap-2 bg-slate-900 text-white px-8 border-t-4 border-slate-500 py-4`}
    >
      <h2 className="text-white font-bold text-2xl">Documents:</h2>
      {documentButtons}
      <Button size={ButtonSize.md} onClick={newDocument}>
        <FontAwesomeIcon icon={faPlus} />
      </Button>

      <button
        className="absolute bottom-4 left-4 text-white focus:outline-none"
        aria-label="Help"
        onClick={() => setShowTooltip((prev) => !prev)}
      >
        <FontAwesomeIcon icon={faQuestionCircle} size="2x" />
      </button>

      {showTooltip && (
        <div
          className="absolute bottom-14 left-4 bg-[#1e1e1e] text-white text-lg p-3 rounded shadow-lg cursor-pointer"
          onClick={() => window.open("https://plantuml.com/", "_blank")}
        >
          About Plant UML
        </div>
      )}

    </div>
  );
};
