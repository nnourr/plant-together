import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DocumentModel } from "../models/document.model";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { Button, ButtonSize } from "./button.component";
import { useState, useEffect, useRef } from "react";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

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
  className,
}) => {
  // const [showSideBar, setShowSideBar] = useState<boolean>(false)
  if (!!!currDocument || !!!documents) {
    return <div className={className}>Loading...</div>;
  }

  const [docName, setDocName] = useState<string>("");
  const [edit, setEdit] = useState(false);
  const editableRef = useRef(null);
  const maxSize = 10;

  useEffect(() => {
    if(edit) {
      if(editableRef.current != null){
        (editableRef.current as HTMLInputElement).style.width = 'auto';
        (editableRef.current as HTMLInputElement).focus();
      }
    }
  }, [edit])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      updateDocument(currDocument.id, docName);
      setEdit(false);
    }
  };

  function truncate(str: string, n: number){
    return (str.length > n) ? str.slice(0, n-1) + '&hellip;' : str;
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
          <div className={`flex`}>
            {edit && 
              <input
                className={`w-40 text-centre text-white text-ellipsis text-clip bg-transparent`}
                type="text"
                ref={editableRef}
                value={docName}
                onFocus={(e) => {e.currentTarget.select()}}
                onChange={(e) => {setDocName(e.target.value)}}
                onKeyDown={handleKeyDown}
                onBlur={() => setEdit(false)}
              />
            }
            {!edit &&
              <div className={`${className} text-left`}>
                {truncate(document.name, maxSize)}
              </div> 
            }
            {!edit &&
              <button
                aria-label="edit"
                className={`text-left px-2 py-1 left-0 transition-all`}
                key={document.id}
                onClick={() => {
                  setEdit(true);
                  setDocName(document.name)
                }}
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
            }
          </div>
        </Button>
      )
    } else {
      return (
        <Button
          key={document.id}
          size={ButtonSize.md}
          className={`text-left`}
          onClick={() => setCurrDocument(document)}
          primary={false}
        >
          {truncate(document.name, maxSize)}
        </Button>
      )
    }
  });

  return (
    <>
      <div
        className={`${className} hidden md:flex flex-col gap-2 bg-slate-900 text-white px-8 border-t-4 border-slate-500 py-4`}
      >
        <h2 className="text-white font-bold text-2xl">Documents:</h2>
        {documentButtons}
        <Button size={ButtonSize.md} onClick={() => newDocument()}>
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>
    </>
  );
};
