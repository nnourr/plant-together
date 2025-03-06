import { useState, useCallback, useEffect, type MouseEvent } from "react";
import { plantuml } from "../plantuml";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { IPlantUmlError } from "../models/plantUmlError.model";

interface UmlDisplayProps {
  className?: string;
  umlStr: string;
  syntaxError?: IPlantUmlError;
  setSyntaxError: (error: IPlantUmlError | undefined) => void;
}

export const UmlDisplay: React.FC<UmlDisplayProps> = ({
  umlStr,
  className,
  syntaxError,
  setSyntaxError,
}) => {
  const [imgSource, setImgSource] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlantUmlInitiated, setIsPlantUmlInitiated] =
    useState<boolean>(false);

  const getSvg = useCallback(async () => {
    setIsLoading(true);
    const res = await plantuml.renderSvg(umlStr);
    if (res[0] !== "<") {
      const resBody = JSON.parse(res);
      setSyntaxError(resBody);
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
      setSyntaxError(pngResult.error); // if blob exists, error is defined
      return;
    }

    const png = URL.createObjectURL(pngResult.blob);
    const pngAnchorRef = document.createElement("a");
    pngAnchorRef.href = png;
    pngAnchorRef.download = "plantTogether";
    pngAnchorRef.click();

    URL.revokeObjectURL(png);
  }, []);

  const handleDownloadingPng = useCallback(
    async (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      await getPng(umlStr);
    },
    [getPng, umlStr]
  );

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
          {syntaxError.message}!
        </div>
      )}
      <div className="absolute z-50 right-4 bottom-4 flex flex-col gap-2">
        <a
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
