import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DocumentModel } from "../models/document.model";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { Button, ButtonSize } from "./button.component";

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
  className,
}) => {
  // const [showSideBar, setShowSideBar] = useState<boolean>(false)
  if (!!!currDocument || !!!documents) {
    return <div className={className}>Loading...</div>;
  }

  const documentButtons = documents.map((document) => {
    return (
      <Button
        key={document.id}
        size={ButtonSize.md}
        onClick={() => setCurrDocument(document)}
        primary={document.id === currDocument.id}
      >
        {document.name}
      </Button>
    );
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
