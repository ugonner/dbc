import { useEffect, useRef, useState } from "react";
import { IProducerUser } from "../../shared/interfaces/socket-user";
import vosker, { Model } from "vosk-browser";
import { useRTCToolsContextStore } from "../../contexts/rtc";
import * as vosk from "vosk-browser";
import { AppBaseUrl } from "../../api/base";
import { IonButton, IonIcon, IonItem, IonPopover, IonText, IonToast } from "@ionic/react";
import { chatbox, closeCircle, diamondSharp } from "ionicons/icons";

export interface ICaptioningProps {
  producerUsers: IProducerUser[];
}

export const Captioning = ({ producerUsers }: ICaptioningProps) => {
  const audioSampleRate = 16000;
  const voskModelRef = useRef<Model>();
  const recognizerRef = useRef<vosk.KaldiRecognizer>();
  const audioWorkletRef = useRef<AudioWorkletNode | null>();
  const { userMediaStream } = useRTCToolsContextStore();
  const audioContextRef = useRef<AudioContext | null>();
  const captionsRef = useRef<string[]>([]);
  const [isCaptioning, setIsCaptioning] = useState(false);
  const [openCaptionsOverlay,   setOpenCaptionsOverlay] = useState(false);
  const [captions, setCaptions] = useState("");
  const streamRef = useRef<MediaStream | null>();
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>();
  const mediaSourceRef = useRef<MediaStreamAudioSourceNode | null>();

  const startCaptioning = async (producers: IProducerUser[]) => {
    try {
      const stream = new MediaStream();
      producers.forEach((pUser) => {
        if (!pUser.isAudioTurnedOff && pUser.mediaStream) {
          const track = pUser.mediaStream?.getAudioTracks()[0];
          stream.addTrack(track);
        }
      });

      //add user's own audio
      if (userMediaStream) {
        const track = userMediaStream.getAudioTracks()[0];
        if (track?.enabled) stream.addTrack(track);
      }

      if (stream.getTracks().length === 0) {
        console.log("no tracks");
        return;
      }

      if (!audioContextRef.current || !audioWorkletRef.current) {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)({ sampleRate: audioSampleRate });
        audioContextRef.current = audioContext;
        await audioContextRef.current.audioWorklet.addModule(
          "/worklet/PCMBatch-processor.js"
        );
        const audioWorkletNode = new AudioWorkletNode(
          audioContextRef.current,
          "pcm-batch-processor"
        );
        // audioWorkletNode.port.postMessage({
        //   sampleRate: audioContextRef.current?.sampleRate,
        // });
        audioWorkletRef.current = audioWorkletNode;
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      audioWorkletRef.current.port.onmessage = (evt) => {
        try {
          const floatArr = evt.data;
          const audioBufferData = audioContextRef.current?.createBuffer(
            1,
            floatArr.length,
            audioSampleRate
          );
          audioBufferData?.getChannelData(0).set(floatArr);
          recognizerRef.current?.acceptWaveform(audioBufferData as AudioBuffer);
        } catch (error) {
          console.log("Error in on message", (error as Error).message);
        }
      };
      source.connect(audioWorkletRef.current);
      audioWorkletRef.current.connect(audioContextRef.current.destination);
    } catch (error) {
      console.log("Error in transcripting", (error as Error).message);
    }
  };

  const startCaptioningLegacy = async (producers: IProducerUser[]) => {
    try {
      const stream = new MediaStream();
      producers.forEach((pUser) => {
        if (!pUser.isAudioTurnedOff && pUser.mediaStream) {
          const track = pUser.mediaStream?.getAudioTracks()[0];
          stream.addTrack(track);
        }
      });

      //add user's own audio
      if (userMediaStream) {
        const track = userMediaStream.getAudioTracks()[0];
        if (track?.enabled) stream.addTrack(track);
      }

      if (stream.getTracks().length === 0) {
        console.log("no tracks");
        return;
      }

      
      if (!audioContextRef.current) {
        const audioContext = new (AudioContext ||
          (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
      }

      const source = audioContextRef.current?.createMediaStreamSource(
        stream
      );
      const processor = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      );
      processor.onaudioprocess = (evt) => {
        recognizerRef.current?.acceptWaveform(evt.inputBuffer);
      };
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      mediaSourceRef.current = source;
      scriptProcessorRef.current = processor;
    } catch (error) {
      console.log("Error using script procesor");
    }
  };

  const stopCaptioning = async () => {
    try{
      await closeOut();
      captionsRef.current = [];
      setCaptions("");
      setIsCaptioning(false);  
    }catch(error){
      console.log("Error stopping captioning", (error as Error).message);
    }
  }


  
  const closeOut = async () => {
    try{

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioWorkletRef.current) {
        audioWorkletRef.current.port.close();
        audioWorkletRef.current.disconnect();
      }
  
      if(mediaSourceRef.current){
        mediaSourceRef.current.disconnect();
      }
      if(scriptProcessorRef.current){
        scriptProcessorRef.current.disconnect();
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        await audioContextRef.current.close();
      }
  
      streamRef.current = null;
      audioWorkletRef.current = null;
  
      mediaSourceRef.current = null;
      scriptProcessorRef.current = null;
  
      audioContextRef.current = null;
    }catch(error){
      console.log("Error closing out audio processing resources", (error as Error).message)
    }
  };

  useEffect(() => {
    const loadRecognixer = async () => {
      try {
        const modelPath = `/models/vosk-model-small-en-us-0.15.zip`;
        const sampleRate = audioSampleRate;

        const modell = await vosk.createModel(modelPath);
        modell.setLogLevel(1);
        const rec = new modell.KaldiRecognizer(sampleRate);
        
        rec.on("result", (message) => {
          const resultText = (message.event === "result") ? message.result.text : "";
          if(resultText){
            setCaptions(resultText);
            setOpenCaptionsOverlay(true);
          }
        });
        rec.on("partialresult", (message) => {
          console.log(`Partial result: ${(message as any).result.partial}`);
        });

        recognizerRef.current = rec;
      } catch (error) {
        console.log("Error at useEffect", (error as Error).message);
      }
    };
    loadRecognixer();
    }, []);

  return (
    <div>
      <IonButton
        className="icon-only"
        onClick={() => {
          if(isCaptioning) stopCaptioning(); 
          else startCaptioning(producerUsers);
          setIsCaptioning((!isCaptioning));
        }}
        aria-label="toggle captioning"
      >
        <IonText>{isCaptioning ? "Turn off captions" : "Turn on Ccaptions"}</IonText>
      </IonButton>
      <IonPopover
      isOpen={openCaptionsOverlay}
      onDidDismiss={() => setOpenCaptionsOverlay(false)}
      translate="yes"
      translucent={true}
      style={{innerWidth: "100%"}}
      >
        <IonItem>
          <IonButton
          role="destructive"
          slot="end"
          className="icon-only"
          onClick={() => setOpenCaptionsOverlay(false)}
          aria-label="close caption"
          >
            <IonIcon icon={closeCircle}></IonIcon>
          </IonButton>
        </IonItem>
        <p>
        {captions}
        </p>
      </IonPopover>
      {/* uses toast's duration to dismiss popover  */}
      <IonToast
      isOpen={openCaptionsOverlay}
      position="bottom"
      duration={10000}
      onDidDismiss={() => setOpenCaptionsOverlay(false)}
      translucent={true}
      ></IonToast>
    </div>
  );
};