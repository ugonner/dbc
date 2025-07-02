import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonRow,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { CallVideo } from "../../components/video/CallVideo";
import { RouteComponentProps, useHistory, useParams } from "react-router-dom";
import { useRTCToolsContextStore } from "../../contexts/rtc";
import { Dispatch, useEffect, useState } from "react";
import {
  toggleAudio,
  toggleVIdeo,
} from "../../utils/rtc/mediasoup/functionalities";
import { mic, micOff, videocam, videocamOff } from "ionicons/icons";
import { Camera } from "@capacitor/camera";


export interface IProducingPageProps {
  joinHandler?: Function;
  canJoin: boolean;
}

export const ProducingPage = (props: IProducingPageProps) => {
  const {
    userMediaStreamRef,
    videoTurnedOff,
    setVideoTurnedOff,
    setAudioTurnedOff,
    audioTurnedOff,
    producerAppDataRef,
  } = useRTCToolsContextStore();
  const [presentToast] = useIonToast();
  const [showToolbar, setShowTaskbar] = useState(false);

  const requestPermissions = async () => {
    try{
      const cameraPermission = await Camera.checkPermissions();
      if((!cameraPermission.camera) || (cameraPermission.camera !== "granted")){
        const permState = await Camera.requestPermissions();
        if(permState.camera !== "granted") throw new Error("Permision denied, but you need to grant camera and microphone permissions");
      }
    }catch(error){
      console.log("Permission Error: ", (error as Error).message)
    }
  }
  useEffect(() => {
    (async () => {
      try {
        await requestPermissions();
        if (!navigator.mediaDevices)
          throw new Error("Your device does not support media sharing");
        const mediaStream = await navigator.mediaDevices?.getUserMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        if (mediaStream)
          userMediaStreamRef.current = mediaStream;

        setShowTaskbar(true);
      } catch (error) {
        console.log("Error starting producing", (error as Error).message);
        presentToast((error as Error).message, 3000);
        setShowTaskbar(true);
      }
    })();
  }, []);

  const [openJoinRequestSpinner, setOpenJinRequestSpinner] = useState(false);

  return (
    <div>
      <IonGrid>
        <IonRow>
          <IonCol size="12">
            <div className="ion-text-center">
              <IonLabel>
                <h2>Lobby</h2>
                <p>Have A Preview And Join</p>
              </IonLabel>
            </div>
            <div style={{height: "400px", width: "auto", objectFit: "contain", justifyContent: "center", textAlign: "center"}}>
              <CallVideo mediaStream={userMediaStreamRef.current as MediaStream} />
            </div>
          </IonCol>
          </IonRow>
          <IonRow>
          <IonCol size="12">
            {showToolbar && (
              <IonToolbar>
                <IonItem>

                  <IonButton
                    fill="clear"
                    size="large"
                    onClick={() => {
                      toggleVIdeo(
                        producerAppDataRef,
                        setVideoTurnedOff,
                        userMediaStreamRef
                      );
                      
                    }}
                    aria-label={
                      videoTurnedOff ? "turn video on" : "turn video off"
                    }
                  >
                    <IonIcon
                      icon={videoTurnedOff ? videocamOff : videocam}
                    ></IonIcon>
                  </IonButton>

                  
                  <IonButton
                    fill="clear"
                    size="large"
                    onClick={async () => {
                      toggleAudio(
                        producerAppDataRef,
                      setAudioTurnedOff,
                      userMediaStreamRef
                      );
                      
                    }}
                    aria-label={
                      audioTurnedOff ? "turn audio on" : "turn audio off"
                    }
                  >
                    <IonIcon icon={audioTurnedOff ? micOff : mic}></IonIcon>
                  </IonButton>

                  <IonButton
                    fill="clear"
                    slot="end"
                    onClick={async () => {
                      if (props.joinHandler) await props.joinHandler();
                      if (!props.canJoin) setOpenJinRequestSpinner(true);
                    }}
                  >
                      {props.canJoin
                        ? "Join"
                        : !openJoinRequestSpinner
                        ? "Ask to join"
                        : "waiting to be admitted..."}
                    
                  </IonButton>
                </IonItem>
              </IonToolbar>
            )}
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};
