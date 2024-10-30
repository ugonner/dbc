import { useEffect, useImperativeHandle, useRef, useState, VideoHTMLAttributes } from "react"
import { useRTCToolsContextStore } from "../../contexts/rtc";
import { isObjectEmpty } from "../../shared/helpers";

export interface ICallVideoProps extends VideoHTMLAttributes<HTMLVideoElement>{
    mediaStream?: MediaStream;
    containerWidth?: string;
    containerHeight?:string;
    isVideoTurnedOff?: boolean;

}
export const CallVideo = (props: ICallVideoProps) => {
    let {mediaStream, containerHeight, containerWidth, isVideoTurnedOff, ...videoProps} = props;
    const {videoTurnedOff, userMediaStream} = useRTCToolsContextStore();

    containerHeight = containerHeight ? containerHeight : props.width as string;
    const videoRef = useRef({} as HTMLVideoElement)
    useEffect(() => {
        if(userMediaStream?.getTracks && userMediaStream?.getTracks().length > 0) {
            videoRef.current.srcObject = userMediaStream;
        }
    }, [userMediaStream])
    return (
        <div style={{
            position: "relative",
            width: containerWidth,
            height: containerHeight,
        }}>
        {videoTurnedOff && (
            <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: containerWidth ? containerWidth : "100%",
                height: containerHeight ? containerHeight : "100%",

                zIndex: 10,
                
                }}>
                <h1>Bona</h1>
            </div>
        )}
        <video ref={videoRef} {...videoProps} autoPlay playsInline></video>
        
        </div>
    )
}