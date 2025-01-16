import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
  IonText,
  useIonAlert,
} from "@ionic/react";
import { IChatMessage } from "../../shared/interfaces/talkables/chat";
import {
  checkmarkDone,
  checkmarkOutline,
  closeCircle,
  ellipsisVertical,
} from "ionicons/icons";
import { formatDate } from "../../shared/helpers";
import { useTalkableContextStore } from "../../contexts/talkables/talkable";
import { useState } from "react";
import { APIBaseURL } from "../../api/base";

export const ChatMessage = ({ chatMessage }: { chatMessage: IChatMessage }) => {
  const { transcribeAudioURL } = useTalkableContextStore();
  const [openTranscriptOverlay, setOpenTranscriptOverlay] = useState(false);
  const [transcript, setTranscript] = useState("Loading audio transcript");
  const [openMessageMenuOverlay, setOpenMessageMenuOverlay] = useState(false);

  return (
    <IonItem>
      <IonLabel slot="end">
        <IonButton
          id={`msg-menu-${chatMessage.message?.replace(" ", "_")}`}
          fill="clear"
          onClick={() => setOpenMessageMenuOverlay(!openMessageMenuOverlay)}
        >
          <IonIcon icon={ellipsisVertical}></IonIcon>
        </IonButton>
      </IonLabel>

      <IonLabel>
        <h6>{chatMessage.sender?.userName}</h6>
        <p>
          <p>{chatMessage.message}</p>
          {chatMessage.attachment?.attachmentUrl && (
            <audio src={`${APIBaseURL.replace("/api", "")}${chatMessage.attachment.attachmentUrl}`} controls />
          )}

          <br />
          <small>
            {chatMessage.isViewed ? (
              <IonIcon icon={checkmarkDone}></IonIcon>
            ) : (
              <IonIcon icon={checkmarkOutline}></IonIcon>
            )}
            {formatDate(chatMessage.createdAt)}
          </small>
        </p>
      </IonLabel>
      <IonPopover
        trigger={`msg-menu-${chatMessage.message?.replace(" ", "_")}`}
        isOpen={openMessageMenuOverlay}
        onDidDismiss={() => setOpenMessageMenuOverlay(false)}
      >
        <IonList>
          <IonItem>
            <IonButton
              fill="clear"
              onClick={async () => {
                setOpenTranscriptOverlay(true);
                const audioText = await transcribeAudioURL(
                  `${APIBaseURL.replace("/api", "")}${chatMessage.attachment?.attachmentUrl}`
                );
                setTranscript(audioText);
              }}
            >
              Transcribe
            </IonButton>
          </IonItem>
        </IonList>
      </IonPopover>
      <IonPopover
        isOpen={openTranscriptOverlay}
        onDidDismiss={() => setOpenTranscriptOverlay(false)}
      >
        <div>
          <IonItem>
            <IonLabel slot="end">
              <IonButton
                fill="clear"
                onClick={() => {
                    setOpenTranscriptOverlay(false);
                    setOpenMessageMenuOverlay(false);
                }}
              >
                <IonIcon icon={closeCircle}></IonIcon>
              </IonButton>
            </IonLabel>
          </IonItem>

          <div>
            <h4>Audio Transcript</h4>
            <p>{transcript}</p>
          </div>
        </div>
      </IonPopover>
    </IonItem>
  );
};
