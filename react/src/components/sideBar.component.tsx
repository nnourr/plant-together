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
  faTrash,
  faDownload
} from "@fortawesome/free-solid-svg-icons";
import { DownloadModal } from "./downloadModal.component";
import { ConfirmModal } from "./confirmModal.component";

interface SideBarProps {
  currDocument?: DocumentModel;
  documents?: DocumentModel[];
  setCurrDocument: (newVal: DocumentModel) => void;
  className?: string;
  newDocument: () => void;
  updateDocument: (documentId: any, documentNewName: string) => void;
  deleteDocument: (documentId: any) => void;
  setClose: () => void;
}

export const SideBar: React.FC<SideBarProps> = ({
  currDocument,
  documents,
  setCurrDocument,
  newDocument,
  updateDocument,
  deleteDocument,
  className,
  setClose,
}) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [docName, setDocName] = useState<string>("");
  const [edit, setEdit] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const editableRef = useRef(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [choice, setChoice] = useState("No");
  const [isLastDoc, setIsLastDoc] = useState(false);

  useEffect(() => {
    if (edit) {
      if (editableRef.current != null) {
        (editableRef.current as HTMLInputElement).style.width = "auto";
        (editableRef.current as HTMLInputElement).focus();
      }
    }
  }, [edit]);

  useEffect(() => {
    if(choice == "Yes") {
      setChoice("No");
      deleteDocument(currDocument!.id);
    }
  }, [choice])

  if (!!!currDocument || !!!documents) {
    return <div className={className}>Loading...</div>;
  }

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
              <div className="flex space-x-2">
                <button
                  aria-label="edit"
                  className={`text-md text-left left-0 transition-all`}
                  key={document.id}
                  onClick={() => {
                    setEdit(true);
                    setDocName(document.name);
                  }}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>

                <button
                  aria-label="delete"
                  className={`text-md text-left left-0 transition-all`}
                  key={document.id}
                  onClick={() => {
                    if (documents.length > 1) {
                      setIsConfirmModalOpen(true);
                    } else {
                      setIsLastDoc(true);
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
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
      <Button 
        size={ButtonSize.md}
        onClick={() => {
          setIsDownloadModalOpen(true)
        }}
        className="flex items-center gap-2 justify-center mb-2"
      >
        <FontAwesomeIcon icon={faDownload} />
        <span>Download Package</span>
      </Button>

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

      {
        isConfirmModalOpen && (
          <ConfirmModal
            onClose={(arg: string) => {
              setIsConfirmModalOpen(false);
              setChoice(arg);
            }}
            document={currDocument.name}
          />
        )
      }

      {
        isLastDoc && (
          <div data-testid="error-modal" className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-[9999] transition-opacity duration-200">
            <div className="bg-slate-800 p-6 rounded-xl w-[32rem] shadow-xl">
                <div className="items-center justify-between mb-6 space-y-2">
                    <h2 className="text-white text-2xl font-bold">Cannot delete last document in room!</h2>

                </div>
                <div className="text-center space-y-2 space-x-40 max-h-[60vh]">
                    <Button
                        size={ButtonSize.lg}
                        onClick={() => {
                            setIsLastDoc(false);
                        }}
                        aria-label="back"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
        )
      }
      
      {
        isDownloadModalOpen && (
          <DownloadModal
            onClose={() => setIsDownloadModalOpen(false)}
            documents={documents}
          />
        )
      }
      </div>
    </>
  );
};
