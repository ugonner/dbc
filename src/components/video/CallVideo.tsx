import { VideoHTMLAttributes } from "react"

export interface ICallVideoProps extends VideoHTMLAttributes<HTMLVideoElement>{

}
export const CallVideo = (props: ICallVideoProps) => {
    return (
        <video {...props}></video>
    )
}