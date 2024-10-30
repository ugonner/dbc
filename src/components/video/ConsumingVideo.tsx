import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  VideoHTMLAttributes,
} from "react";
import { useRTCToolsContextStore } from "../../contexts/rtc";

export interface ICallVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  mediaStream?: MediaStream;
  containerWidth?: string;
  containerHeight?: string;
  isVideoTurnedOff?: boolean;
}
export const ConsumingVideo = (props: ICallVideoProps) => {
  let { mediaStream, containerHeight, containerWidth, isVideoTurnedOff, ...videoProps } = props;

  containerHeight = containerHeight ? containerHeight : (props.width as string);
  const videoRef = useRef({} as HTMLVideoElement);
  useEffect(() => {
    if (props.mediaStream) {
      const videoElem = videoRef.current as HTMLVideoElement;
      if(videoElem) videoElem.srcObject = props.mediaStream;
    }
  }, [])
  return (
    <div>
      {props.isVideoTurnedOff && (
        <div>
          <h1>Bona</h1>
        </div>
      )}
      <video {...videoProps} width={"100%"} height={"auto"} ref={videoRef} autoPlay playsInline hidden={props.isVideoTurnedOff }></video>
     
    </div>
  );
};
