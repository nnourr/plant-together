import { useState } from "react";
import { DocumentModel } from "../models/document.model";
import { Button, ButtonSize } from "./button.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons/faChevronDown";
import { faCode } from "@fortawesome/free-solid-svg-icons/faCode";
import { faImage } from "@fortawesome/free-solid-svg-icons/faImage";
import { faFileImage } from "@fortawesome/free-solid-svg-icons/faFileImage";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons/faLayerGroup";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { plantuml } from "../plantuml";
import { getRoomUML } from "../service/plant.service";
import JSZip from 'jszip';

interface DownloadModalProps {
  onClose: () => void;
  documents: DocumentModel[];
  roomId: string;
}

interface DocumentDownloadState {
  document: DocumentModel;
  isSelected: boolean;
  code: boolean;
  svg: boolean;
  png: boolean;
  isOpen: boolean;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  onClose,
  documents,
  roomId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [downloadStates, setDownloadStates] = useState<DocumentDownloadState[]>(
    documents.map((doc) => ({
      document: doc,
      isSelected: true,
      code: true,
      svg: true,
      png: true,
      isOpen: false,
    }))
  );

  const convertToSVG = async (umlText: string): Promise<string> => {
    const svgResult = await plantuml.renderSvg(umlText);
    
    // Check if the result is an error (not starting with '<')
    if (svgResult[0] !== "<") {
      throw new Error('Failed to convert UML to SVG');
    }
    
    return svgResult;
  };

  const convertToPNG = async (umlText: string): Promise<Blob> => {
    const pngResult = await plantuml.renderPng(umlText);
    
    if (!pngResult.blob || pngResult.error) {
      throw new Error(pngResult.error?.message || 'Failed to convert UML to PNG');
    }
    
    return pngResult.blob;
  };

  const filterAll = () => {
    setDownloadStates((prev) =>
      prev.map((state) => ({
        ...state,
        isSelected: true,
        code: true,
        svg: true,
        png: true,
      }))
    );
  };

  const filterCode = () => {
    setDownloadStates((prev) =>
      prev.map((state) => ({
        ...state,
        isSelected: true,
        code: true,
        svg: false,
        png: false,
      }))
    );
  };

  const filterSvg = () => {
    setDownloadStates((prev) =>
      prev.map((state) => ({
        ...state,
        isSelected: true,
        code: false,
        svg: true,
        png: false,
      }))
    );
  };

  const filterPng = () => {
    setDownloadStates((prev) =>
      prev.map((state) => ({
        ...state,
        isSelected: true,
        code: false,
        svg: false,
        png: true,
      }))
    );
  };

  const handleDocumentCheck = (docId: number, checked: boolean) => {
    setDownloadStates((prev: DocumentDownloadState[]) =>
      prev.map((state: DocumentDownloadState) =>
        state.document.id === docId
          ? { ...state, isSelected: checked, code: checked, svg: checked, png: checked }
          : state
      )
    );
  };

  // Logic for checking the type of diagram to download
  // If all unchecked, uncheck parent
  // If any checked, check parent
  const handleTypeCheck = (docId: number, type: "code" | "svg" | "png", checked: boolean) => {
    setDownloadStates((prev: DocumentDownloadState[]) =>
      prev.map((state: DocumentDownloadState) => {
        if (state.document.id === docId) {
          const newState = { ...state, [type]: checked };
          // If all unchecked, uncheck parent
          if (!newState.code && !newState.svg && !newState.png) {
            newState.isSelected = false;
          }
          // If any checked, check parent
          if (newState.code || newState.svg || newState.png) {
            newState.isSelected = true;
          }
          return newState;
        }
        return state;
      })
    );
  };

  const toggleDropdown = (docId: number) => {
    setDownloadStates((prev: DocumentDownloadState[]) =>
      prev.map((state: DocumentDownloadState) =>
        state.document.id === docId
          ? { ...state, isOpen: !state.isOpen }
          : { ...state, isOpen: false }
      )
    );
  };

  const handleDownload = async () => {
    if (!roomId) return;
    setIsLoading(true);

    try {
      // Grab all UML content for each document in the room
      const umlContents = await getRoomUML(roomId);
      const zip = new JSZip();

      // Process each selected document
      for (const state of downloadStates) {
        if (!state.isSelected) continue;

        const umlContent = umlContents.find(content => content.docName === state.document.name);
        if (!umlContent) continue;

        // Create a folder for the document and the diagram(s) or raw code it may contain
        const docFolder = zip.folder(state.document.name);
        if (!docFolder) continue;

        // Add the diagram(s) or raw code it may contain
        if (state.code) {
          docFolder.file("diagram.puml", umlContent.uml);
        }
        if (state.svg) {
          try {
            const svgContent = await convertToSVG(umlContent.uml);
            docFolder.file("diagram.svg", svgContent);
          } catch (error) {
            console.error(`Failed to convert ${state.document.name} to SVG:`, error);
          }
        }
        if (state.png) {
          try {
            const pngBlob = await convertToPNG(umlContent.uml);
            docFolder.file("diagram.png", pngBlob);
          } catch (error) {
            console.error(`Failed to convert ${state.document.name} to PNG:`, error);
          }
        }
      }

      // Generate and download the zip file
      const blob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = "plant-uml-diagrams.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onClose();
    } catch (error) {
      console.error("Failed to download diagrams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate current filter state for button highlighting
  const isAllSelected = downloadStates.every((state) => state.code && state.svg && state.png);
  const isOnlyCode = downloadStates.every((state) => state.code && !state.svg && !state.png);
  const isOnlySvg = downloadStates.every((state) => !state.code && state.svg && !state.png);
  const isOnlyPng = downloadStates.every((state) => !state.code && !state.svg && state.png);

  return (
    <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-[9999] transition-opacity duration-200">
      <div className="bg-slate-800 p-6 rounded-xl w-[32rem] shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl font-bold">Download Package</h2>
          <div className="flex gap-2 mt-1">
            <Button
              size={ButtonSize.sm}
              onClick={filterAll}
              primary={isAllSelected}
              className={`flex items-center gap-1 px-2 bg-slate-500/20 ${isAllSelected ? '' : 'hover:bg-slate-700/50'}`}
            >
              <FontAwesomeIcon icon={faLayerGroup} />
              <span>All</span>
            </Button>
            <Button
              size={ButtonSize.sm}
              onClick={filterCode}
              primary={isOnlyCode}
              className={`flex items-center gap-1 px-2 bg-blue-500/20 ${isOnlyCode ? '' : 'hover:bg-slate-700/50'}`}
            >
              <FontAwesomeIcon icon={faCode} />
              <span>Code Only</span>
            </Button>
            <Button
              size={ButtonSize.sm}
              onClick={filterSvg}
              primary={isOnlySvg}
              className={`flex items-center gap-1 px-2 bg-purple-500/20 ${isOnlySvg ? '' : 'hover:bg-slate-700/50'}`}
            >
              <FontAwesomeIcon icon={faImage} />
              <span>SVG Only</span>
            </Button>
            <Button
              size={ButtonSize.sm}
              onClick={filterPng}
              primary={isOnlyPng}
              className={`flex items-center gap-1 px-2 bg-green-500/20 ${isOnlyPng ? '' : 'hover:bg-slate-700/50'}`}
            >
              <FontAwesomeIcon icon={faFileImage} />
              <span>PNG Only</span>
            </Button>
          </div>
        </div>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {downloadStates.map((state) => (
            <div 
              key={state.document.id} 
              className="bg-slate-700/30 rounded-lg overflow-hidden"
            >
              <div 
                className={`flex items-center px-4 py-3 bg-slate-700/40 border-l-4 
                  ${state.isSelected ? 'border-blue-500' : 'border-slate-500'}
                  cursor-pointer hover:bg-slate-700/60 transition-colors duration-200`}
                onClick={() => toggleDropdown(state.document.id)}
              >
                <div className="relative flex items-center flex-1">
                  <div 
                    className="relative z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={state.isSelected}
                      role="checkbox"
                      name={state.document.name}
                      onChange={(e) => {
                        handleDocumentCheck(state.document.id, e.target.checked);
                      }}
                      className="w-5 h-5 opacity-0 absolute cursor-pointer"
                    />
                    <div className={`w-5 h-5 border-2 rounded-md mr-3 flex items-center justify-center transition-all duration-200
                      ${state.isSelected 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-slate-400'}`}
                    >
                      {state.isSelected && <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />}
                    </div>
                  </div>
                  <span className={`text-white font-medium flex-1 transition-all duration-200
                    ${!state.isSelected ? 'line-through opacity-50' : ''}`}>
                    {state.document.name}
                  </span>
                  
                  {/* Tags */}
                  <div className="flex gap-2 items-center mr-3">
                    {(state.isSelected || state.code) && (
                      <span className={`px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs flex items-center gap-1 transition-all duration-200
                        ${!state.code ? 'line-through opacity-50' : ''}`}>
                        <FontAwesomeIcon icon={faCode} className="text-xs" />
                        Code
                      </span>
                    )}
                    {(state.isSelected || state.svg) && (
                      <span className={`px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs flex items-center gap-1 transition-all duration-200
                        ${!state.svg ? 'line-through opacity-50' : ''}`}>
                        <FontAwesomeIcon icon={faImage} className="text-xs" />
                        SVG
                      </span>
                    )}
                    {(state.isSelected || state.png) && (
                      <span className={`px-2 py-1 rounded-md bg-green-500/20 text-green-300 text-xs flex items-center gap-1 transition-all duration-200
                        ${!state.png ? 'line-through opacity-50' : ''}`}>
                        <FontAwesomeIcon icon={faFileImage} className="text-xs" />
                        PNG
                      </span>
                    )}
                  </div>

                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`text-slate-400 transition-transform duration-200 ${state.isOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {/* Dropdown Content */}
              <div className={`overflow-hidden transition-all duration-200 ${state.isOpen ? 'max-h-32' : 'max-h-0'}`}>
                <div className="px-4 py-3 space-y-2 bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Code</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={state.code}
                        onChange={(e) => handleTypeCheck(state.document.id, "code", e.target.checked)}
                        className="w-4 h-4 opacity-0 absolute cursor-pointer z-10"
                      />
                      <div className={`w-4 h-4 border-2 rounded-md flex items-center justify-center transition-all duration-200
                        ${state.code ? 'border-blue-400 bg-blue-400' : 'border-slate-400'}`}
                      >
                        {state.code && <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">SVG</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={state.svg}
                        onChange={(e) => handleTypeCheck(state.document.id, "svg", e.target.checked)}
                        className="w-4 h-4 opacity-0 absolute cursor-pointer z-10"
                      />
                      <div className={`w-4 h-4 border-2 rounded-md flex items-center justify-center transition-all duration-200
                        ${state.svg ? 'border-blue-400 bg-blue-400' : 'border-slate-400'}`}
                      >
                        {state.svg && <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">PNG</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={state.png}
                        onChange={(e) => handleTypeCheck(state.document.id, "png", e.target.checked)}
                        className="w-4 h-4 opacity-0 absolute cursor-pointer z-10"
                      />
                      <div className={`w-4 h-4 border-2 rounded-md flex items-center justify-center transition-all duration-200
                        ${state.png ? 'border-blue-400 bg-blue-400' : 'border-slate-400'}`}
                      >
                        {state.png && <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-600/30">
          <Button 
            size={ButtonSize.md} 
            onClick={onClose}
            disabled={isLoading}
            className="hover:bg-slate-700/50 transition-colors duration-200"
          >
            Cancel
          </Button>
          <Button 
            size={ButtonSize.md} 
            primary 
            onClick={handleDownload}
            disabled={isLoading || !downloadStates.some((state) => state.isSelected)}
            className="bg-blue-500 hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Download</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}; 