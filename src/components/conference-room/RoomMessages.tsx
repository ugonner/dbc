import {
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTextarea,
  IonToolbar,
} from "@ionic/react";
import { useRTCToolsContextStore } from "../../contexts/rtc";
import { BroadcastEvents } from "../../shared/enums/events.enum";
import { ChatMessageDTO } from "../../shared/dtos/requests/signals";
import { LegacyRef, useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { send } from "ionicons/icons";

export interface IRoomMessage {
  message: string;
  senderUserName?: string;
  senderSocketId: string;
}

export interface IRoomMessagesProps {
  roomMessages: IRoomMessage[];
  room: string;
  socket: Socket;
  showInput: boolean;
}

export const RoomMessages = ({
  roomMessages,
  room,
  socket,
  showInput,
}: IRoomMessagesProps) => {
  const [message, setMessage] = useState<string>("");
  const textareaColWidth = 72;
  const [textareaRowHeight, setTextareaRowHeight] = useState(1);

  const textInputRef = useRef<HTMLIonTextareaElement>();

  useEffect(() => {
    if(textInputRef.current) textInputRef.current.focus();
  }, [message, roomMessages])
  return (
    <>
      <div>
        <IonList>
          {roomMessages.map((msg, i) => (
            <IonItem key={i}>
              <IonLabel
                slot={msg.senderSocketId === socket?.id ? "end" : "start"}
              >
                <small>{msg.senderUserName}</small>
                <p>{msg.message}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
        <IonFooter>
          <IonToolbar>
            {showInput && (
              <IonItem>
                <IonTextarea
                  ref={textInputRef as LegacyRef<HTMLIonTextareaElement>}
                  label="Type in chat"
                  labelPlacement="floating"
                  placeholder="type in message"
                  name="message"
                  onIonInput={(evt) => {
                    if (
                      message.length % textareaColWidth === 0 &&
                      textareaRowHeight <= 5
                    ) {
                      setTextareaRowHeight((prev) => prev + 1);
                    }
                    setMessage(evt.detail.value as string);
                  }}
                  value={message}
                  cols={textareaColWidth}
                  rows={textareaRowHeight}
                ></IonTextarea>
                <IonButton
                  slot="end"
                  onClick={async () => {
                    try {
                      await new Promise((resolve) => {
                        const data: ChatMessageDTO = {
                          room,
                          message,
                          socketId: socket.id,
                        };
                        socket?.emit(
                          BroadcastEvents.CHAT_MESSAGE,
                          data,
                          resolve
                        );
                      });
                      setMessage("");
                    } catch (error) {
                      console.log(
                        "Error sending message in chat",
                        (error as Error).message
                      );
                    }
                  }}
                  className="icon-only"
                  aria-label="send"
                >
                  <IonIcon icon={send}></IonIcon>
                </IonButton>
              </IonItem>
            )}
          </IonToolbar>
        </IonFooter>
      </div>
    </>
  );
};
