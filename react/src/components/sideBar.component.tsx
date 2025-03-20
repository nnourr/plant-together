import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DocumentModel } from "../models/document.model";
import { Button, ButtonSize } from "./button.component";
import { useState, useEffect, useRef } from "react";
import {
  faChevronDown,
  faChevronLeft,
  faEdit,
  faPlus,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

interface SideBarProps {
  currDocument?: DocumentModel;
  documents?: DocumentModel[];
  setCurrDocument: (newVal: DocumentModel) => void;
  className?: string;
  newDocument: () => void;
  updateDocument: (documentId: any, documentNewName: string) => void;
  setClose: () => void;
}

export const SideBar: React.FC<SideBarProps> = ({
  currDocument,
  documents,
  setCurrDocument,
  newDocument,
  updateDocument,
  className,
  setClose,
}) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  if (!!!currDocument || !!!documents) {
    return <div className={className}>Loading...</div>;
  }

  const [docName, setDocName] = useState<string>("");
  const [edit, setEdit] = useState(false);
  const editableRef = useRef(null);

  useEffect(() => {
    if (edit) {
      if (editableRef.current != null) {
        (editableRef.current as HTMLInputElement).style.width = "auto";
        (editableRef.current as HTMLInputElement).focus();
      }
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
          className="w-full flex-shrink-0"
        >
          <div className={`flex`}>
            {edit && (
              <input
                className={`w-40 text-centre text-white text-ellipsis bg-transparent`}
                type="text"
                ref={editableRef}
                value={docName}
                onFocus={(e) => {
                  e.currentTarget.select();
                }}
                onChange={(e) => {
                  setDocName(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                onBlur={onBlur}
              />
            )}
            {!edit && (
              <div className={`${className} text-left truncate`}>
                {document.name}
              </div>
            )}
            {!edit && (
              <button
                aria-label="edit"
                className={`text-left left-0 transition-all`}
                key={document.id}
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
          className={`w-full text-left truncate flex-shrink-0`}
          onClick={() => setCurrDocument(document)}
          primary={false}
        >
          {document.name}
        </Button>
      );
    }
  });

  return (
    <>
      <div
        className={`${className} flex-col flex gap-2 bg-slate-900 text-white px-8 border-t-4 border-slate-500 py-4`}
      >
        <div className="flex justify-between">
          <h2 className="text-white font-bold text-2xl">Documents:</h2>
          {window.innerWidth <= 767 ? (
            <button
              onClick={() => setClose()}
              className={`text-2xl font-bold `}
              data-testid="mobile-close-button"
            >
              {<FontAwesomeIcon icon={faChevronDown} className="p2" />}
            </button>
          ) : (
            <button
              onClick={() => setClose()}
              className={`border-white/0 px-2 py-0 text-2xl font-bold border-2 rounded-xl transition-all hover:border-white/60`}
            >
              {<FontAwesomeIcon icon={faChevronLeft} className="p2" />}
            </button>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {documentButtons}

          <Button
            size={ButtonSize.md}
            onClick={() => newDocument()}
            className="w-full flex-shrink-0"
            data-testid="add-button"
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4">
          <button
            className="text-white focus:outline-none"
            aria-label="Help"
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <FontAwesomeIcon icon={faQuestionCircle} size="2x" />
          </button>
          {showTooltip && (
            <div
              className="absolute bottom-14 left-0 bg-[#1e1e1e] text-white text-lg p-3 rounded shadow-lg cursor-pointer whitespace-nowrap"
              onClick={() => window.open("https://plantuml.com/", "_blank")}
            >
              About Plant UML
            </div>
          )}
        </div>
      </div>
    </>
  );
};
