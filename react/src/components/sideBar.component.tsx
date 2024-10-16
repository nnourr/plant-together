import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DocumentModel } from "../models/document.model";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { useState } from "react";

interface SideBarProps {
  currDocument?: DocumentModel;
  documents?: DocumentModel[];
  setCurrDocument: (newVal: DocumentModel) => void;
  className?: string;
  newDocument: () => void;
}

export const SideBar: React.FC<SideBarProps> = ({
  currDocument,
  documents,
  setCurrDocument,
  newDocument,
  className
}) => {
  // const [showSideBar, setShowSideBar] = useState<boolean>(false)
  if (!!!currDocument || !!!documents) {
    return <div className={className}>Loading...</div>
  }

  const documentButtons = documents.map(document => {
    if (document.id === currDocument.id) {
      return (
        <button key={document.id} className="text-xl border-white/60 border-2 rounded-xl w-full px-4 py-2 transition-all" onClick={() => setCurrDocument(document)}>{document.name}</button>
      )
    }
    return (
      <button key={document.id}  className="text-xl border-white/20 border-2 rounded-xl w-full px-4 py-2 transition-all hover:border-white/60" onClick={() => setCurrDocument(document)}>{document.name}</button>
    )
  })

  return (
  <>
    <div className={`${className} hidden md:flex flex-col gap-2 bg-slate-900 text-white px-8 border-t-4 border-slate-500 py-4`}>
      <h2 className="text-white font-bold text-2xl">Documents:</h2>
      {documentButtons}
      <button className="text-xl border-white/20 border-2 rounded-xl w-full px-4 py-2 transition-all hover:border-white/60" onClick={() => newDocument()}><FontAwesomeIcon icon={faPlus}/></button>
    </div>
  </>
  )
}