import {
  useEffect,
  useRef,
  VideoHTMLAttributes,
} from "react";
import { useRTCToolsContextStore } from "../../contexts/rtc";
import { IProducerUser } from "../../shared/interfaces/socket-user";
import { IonItem, IonLabel, IonThumbnail } from "@ionic/react";
import { userReactionsEmojis } from "../../shared/DATASETS/user-reaction-emojis";
import { defaultUserImageUrl } from "../../shared/DATASETS/defaults";

export interface ICallVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  mediaStream?: MediaStream;
  containerWidth?: string;
  containerHeight?: string;
  producerUser?: IProducerUser;
}

export const ConsumingVideo = ({ producerUser, ...props }: ICallVideoProps) => {
  const {setPinnedProducerUser, audioOuputId} = useRTCToolsContextStore();

  let { mediaStream, containerHeight, containerWidth, ...videoProps } = props;
  const userReactions = producerUser
    ? Object.keys(userReactionsEmojis).filter(
        (reaction) =>
          (producerUser as unknown as { [key: string]: unknown })[reaction]
      )
    : null;
  containerHeight = containerHeight ? containerHeight : (props.width as string);
  const videoRef = useRef({} as HTMLVideoElement);
  useEffect(() => {
    if (props.mediaStream) {
      const videoElem = videoRef.current as HTMLVideoElement;
      if (videoElem) {
        videoElem.srcObject = props.mediaStream;
        
      }
    }
  }, []);

  useEffect(() => {
    const setAudioOuput = async () => {
      try{
        if(videoRef.current && audioOuputId) await videoRef.current.setSinkId(audioOuputId)
        
      }catch(error){
        console.log("Error setting audio output", (error as Error).message)
      }
    }
    setAudioOuput();
  }, [audioOuputId])
  return (
    <div>
      {producerUser?.isVideoTurnedOff && (
        <div 
        style={{
          width: "100%",
          height:  "90%",
          objectFit: "cover",
          fontSize: "3em",
          textAlign: "center",
          justifyContent: "center",
          backgroundColor: "black",
          textTransform: "uppercase"
        }}
        onDoubleClick={() => setPinnedProducerUser(producerUser)}>
          {(producerUser?.userName?.substring(0, 1)) || "NA"}
        </div>
      )}
      <video
        {...videoProps}
        width={"100%"}
        height={"auto"}
        ref={videoRef}
        autoPlay
        playsInline
        hidden={producerUser?.isVideoTurnedOff}
      ></video>
      <div>
        {userReactions?.map((reaction) => (
          <span>{userReactionsEmojis[reaction][0]}</span>
        ))}
      </div>
    </div>
  );
};
