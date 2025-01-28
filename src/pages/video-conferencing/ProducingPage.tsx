import { IonButton, IonItem, IonToolbar, useIonToast } from "@ionic/react";
import { CallVideo } from "../../components/video/CallVideo";
import { RouteComponentProps, useHistory, useParams } from "react-router-dom";
import { useRTCToolsContextStore } from "../../contexts/rtc";
import { Dispatch, useEffect, useState } from "react";
import {
  toggleAudio,
  toggleVIdeo,
} from "../../utils/rtc/mediasoup/functionalities";
import { Socket } from "socket.io-client";
import { BroadcastEvents } from "../../shared/enums/events.enum";

export interface IProducingPageProps {
  joinHandler?: Function;
}
export const ProducingPage = (props: IProducingPageProps) => {
  const {
    setUserMediaStream,
    userMediaStream,
    videoTurnedOff,
    setVideoTurnedOff,
    setAudioTurnedOff,
  } = useRTCToolsContextStore();
  const [presentToast] = useIonToast();
  const [showToolbar, setShowTaskbar] = useState(false);
  
  useEffect(() => {
    (async () => {
      try {
       
      if(!navigator.mediaDevices) throw new Error("Your device does not support media sharing");
      const mediaStream = await navigator.mediaDevices?.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
          sampleRate: 16000
        },
      }); 
        if(mediaStream) setUserMediaStream(
              mediaStream as MediaStream & Dispatch<MediaStream>
            );
        
        setShowTaskbar(true);
      } catch (error) {
        console.log("Error starting producing", (error as Error).message);
        presentToast((error as Error).message, 3000);
        setShowTaskbar(true);
      }
    })();
  }, []);


  return (
    <div>
      {showToolbar && (
        <IonToolbar>
          <IonItem>
            <IonButton
              onClick={async () =>
                toggleAudio(userMediaStream as MediaStream, setAudioTurnedOff)
              }
            >
              Toggle Audio
            </IonButton>

            <IonButton
              onClick={() => toggleVIdeo(userMediaStream as MediaStream, setVideoTurnedOff)}
            >
              Toggle Video
            </IonButton>

            <IonButton
              slot="end"
              onClick={ async () => {
                if(props.joinHandler) await props.joinHandler();
              }}
            >
              Ask To Join
            </IonButton>
          </IonItem>
        </IonToolbar>
      )}

      <div>
        {/* <CallVideo
          mediaStream={userMediaStream}
        /> */}
      </div>
    </div>
  );
};
