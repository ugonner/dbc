import { useEffect, useRef, useState } from "react";
import { useRTCToolsContextStore } from "../../contexts/rtc";
import { IonButton, IonIcon, IonPopover } from "@ionic/react";
import { caretDown, headsetSharp } from "ionicons/icons";

export const AudioOutputSelector = () => {
  const {setAudioOuputId} = useRTCToolsContextStore();
  
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);
  const [openAudioOuputsOverlay, setOpenAudioOutputsOverlay] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setAudioOutputs(devices.filter((d) => d.kind === 'audiooutput'));
    });
  }, []);



  return (
    <>
        <IonButton
        id="audio-outputs-trigger"
        fill="clear"
        aria-label="select audio output option"
        aria-haspopup={true}
        aria-expanded={openAudioOuputsOverlay}
        className="icon-only"
        onClick={() => setOpenAudioOutputsOverlay(true)}
        >
            <IonIcon className="ion-margin" icon={headsetSharp}></IonIcon> <IonIcon icon={caretDown}></IonIcon>
            </IonButton>    
            <IonPopover
            isOpen={openAudioOuputsOverlay}
            onDidDismiss={() => setOpenAudioOutputsOverlay(false)}
            trigger="audio-outputs-trigger"
            >
                {
                    audioOutputs.map((outputDevice) => (
                        <IonButton
                        key={outputDevice.deviceId}
                        fill="clear"
                        onClick={() => {
                            setAudioOuputId(outputDevice.deviceId);
                            setOpenAudioOutputsOverlay(false)
                        }}
                        >
                            {outputDevice.label || `Speaker ${outputDevice.deviceId}`}
                        </IonButton>
                    ))
                }
            </IonPopover>
    </>
  );
};
