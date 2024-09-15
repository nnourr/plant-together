import { useState, useCallback, useEffect } from "react";
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
      <a
        className="absolute cursor-pointer z-50 bottom-4 right-4 border-slate-900/20 border-2 rounded-xl px-2 py-1 transition-all hover:border-slate-900/60"
        download={"plantTogether"}
        href={imgSource}
      >
        Download SVG
      </a>
    </div>
  );
};
