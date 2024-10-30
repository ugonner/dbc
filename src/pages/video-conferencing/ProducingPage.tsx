import { IonButton, IonItem, IonToolbar, useIonToast } from "@ionic/react";
import { CallVideo } from "../../components/video/CallVideo";
import { RouteComponentProps, useHistory, useParams } from "react-router-dom";
import { useRTCToolsContextStore } from "../../contexts/rtc";
import { Dispatch, useEffect, useState } from "react";
import { previewVideo } from "../../utils/rtc/mediasoup/producing";
import {
  toggleAudio,
  toggleVIdeo,
} from "../../utils/rtc/mediasoup/functionalities";
import { useModalContextStore } from "../../utils/contexts/overlays/ModalContextProvider";
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
  const {setShowModalText} = useModalContextStore();
  useEffect(() => {
    (async () => {
      try {
        const mediaStream = await previewVideo("producing-video-main");
        
        mediaStream
          ? setUserMediaStream(
              mediaStream as MediaStream & Dispatch<MediaStream>
            )
          : null;
        
        setShowTaskbar(true);
      } catch (error) {
        console.log("Error starting producing", (error as Error).message);
        presentToast("Error initializing", 3000);
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
                toggleAudio(userMediaStream, setAudioTurnedOff)
              }
            >
              Toggle Audio
            </IonButton>

            <IonButton
              onClick={() => toggleVIdeo(userMediaStream, setVideoTurnedOff)}
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
        <CallVideo
          mediaStream={userMediaStream}
          width={"400px"}
          height={"400px"}
          isVideoTurnedOff={videoTurnedOff}
        />
      </div>
    </div>
  );
};
