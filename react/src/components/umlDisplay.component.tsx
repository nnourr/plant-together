import { useState, useCallback, useEffect, useRef, type MouseEvent } from "react";
import { plantuml } from "../plantuml";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

interface UmlDisplayProps {
  className?: string;
  umlStr: string;
}

export const UmlDisplay: React.FC<UmlDisplayProps> = ({
  umlStr,
  className,
}) => {
  const [imgSource, setImgSource] = useState<string>("");
  const pngAnchorRef = useRef<HTMLAnchorElement>(null);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syntaxError, setSyntaxError] = useState<string>();
  const [isPlantUmlInitiated, setIsPlantUmlInitiated] =
    useState<boolean>(false);

  const getSvg = useCallback(async () => {
    setIsLoading(true);
    const res = await plantuml.renderSvg(umlStr);
    if (res[0] !== "<") {
      const resBody = JSON.parse(res);
      setSyntaxError(resBody.error);
    } else {
      const blob = new Blob([res], { type: "image/svg+xml" });
      const svg = URL.createObjectURL(blob);
      setImgSource(svg);
    }
    setIsLoading(false);
  }, [umlStr]);

  const getPng = useCallback(async (umlString: string) => {
    const pngResult = await plantuml.renderPng(umlString);
    if (!pngResult.blob || pngResult.error) {
      setSyntaxError(pngResult.error!.message); // if blob exists, error is defined
      return;
    }
    
    const png = URL.createObjectURL(pngResult.blob);
    pngAnchorRef.current!.href = png;
    pngAnchorRef.current!.download = "plantTogether";
    pngAnchorRef.current!.click();

    URL.revokeObjectURL(png);
  }, [pngAnchorRef])

  const handleDownloadingPng = useCallback(async (e: MouseEvent<HTMLAnchorElement>) => {
    if (isDownloadingPng) return;
    e.preventDefault();

    setIsDownloadingPng(true);
    await getPng(umlStr);
    setIsDownloadingPng(false);
  }, [getPng, isDownloadingPng, umlStr]);

  useEffect(() => {
    if (isPlantUmlInitiated) {
      setSyntaxError(undefined);
      getSvg();
    }
  }, [getSvg, isPlantUmlInitiated]);

  useEffect(() => {
    const initPlantUml = async () => {
      await plantuml.initialize();
      console.log("done init");

      setIsPlantUmlInitiated(true);
    };
    initPlantUml();
  }, []);

  return (
    <div className={`${className} relative flex justify-center items-center`}>
      {!isPlantUmlInitiated ? (
        <h1 className="text-3xl text-center w-full">Loading plantUml...</h1>
      ) : isLoading ? (
        <FontAwesomeIcon icon={faSpinner} spinPulse className="text-5xl" />
      ) : (
        <TransformWrapper doubleClick={{ mode: "toggle" }} centerOnInit>
          <TransformComponent wrapperClass="!w-full !h-full">
            <img className={`object-scale-down`} src={imgSource} />
          </TransformComponent>
        </TransformWrapper>
      )}
      {syntaxError && (
        <div className="absolute top-6 text-center w-full text-3xl">
          {syntaxError}!
        </div>
      )}
      <div className="absolute z-50 right-4 bottom-4 flex flex-col gap-2">
        <a
          ref={pngAnchorRef}
          className=" cursor-pointer z-50 border-slate-900/20 border-2 rounded-xl px-2 py-1 transition-all hover:border-slate-900/60"
          onClick={handleDownloadingPng}
        >
          Download PNG
        </a>
        <a
          className="cursor-pointer z-50 border-slate-900/20 border-2 rounded-xl px-2 py-1 transition-all hover:border-slate-900/60"
          download={"plantTogether"}
          href={imgSource}
        >
          Download SVG
        </a>
      </div>
    </div>
  );
};
