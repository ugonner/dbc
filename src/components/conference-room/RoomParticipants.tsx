import { useEffect } from "react";
import { IProducerUser, UserActions } from "../../shared/interfaces/socket-user";
import { Socket } from "socket.io-client";
import { ToggleProducerStateDTO, UserMediaToggleActionType, UserReactionsDTO } from "../../shared/dtos/responses/signals";
import { BroadcastEvents } from "../../shared/enums/events.enum";
import { IonButton, IonIcon, IonItem, IonList, useIonAlert } from "@ionic/react";
import { userReactionsEmojis } from "../../shared/DATASETS/user-reaction-emojis";
import { mic, micOff, videocam, videocamOff } from "ionicons/icons";

export interface IRoomParticipantsProp {
    roomParticipants: IProducerUser[];
    socket: Socket;
    reactionType?: UserActions;
    userMediaToggleAction?: "muted" | "videoTurnedOff";
    room: string;
    isAdmin: boolean;
}
export const RoomParticipants = ({roomParticipants, socket, reactionType, room, isAdmin, userMediaToggleAction}: IRoomParticipantsProp) => {
   let participants: IProducerUser[] = reactionType ? roomParticipants.filter((user) => !(user[reactionType])) : roomParticipants;
   participants = userMediaToggleAction  ? participants?.filter((user) => {
    if(userMediaToggleAction === "muted") return user?.isAudioTurnedOff;
    else if(userMediaToggleAction === "videoTurnedOff") return user?.isVideoTurnedOff;
   }) : participants;
  
   const [presentAlert, dismissAlert] = useIonAlert();

   const displayAlert = (message: string, data: IProducerUser, action?: UserMediaToggleActionType) => {
    presentAlert({
        message,
        buttons: [
            {
                text: "Continue",
                handler: () =>  {
                    if(action) toggleMedia(data, action);
                    else toggleReaction(data);
                    dismissAlert();
                },
            },
            {
                text: "Cancel",
                handler: () => dismissAlert()
            }
        ]
    })
   }
  
   const  toggleReaction = (user: IProducerUser) => {
    const data: UserReactionsDTO = {
        socketId: user.socketId,
        room,
        action: reactionType as UserActions
    }
    socket?.emit(BroadcastEvents.USER_REACTION, data);
   }

   const toggleMedia = (user: IProducerUser, action: UserMediaToggleActionType ) => {
    const data: ToggleProducerStateDTO = {
        socketId: user?.socketId,
        action,
        room
    }
    socket?.emit(BroadcastEvents.TOGGLE_PRODUCER_STATE, data);
   }

   return (
    <div>
        <h1>Users are here</h1>
        
        <IonList>
            {
                participants.map((user) => (
                    <IonItem>
                        {user.userName } | {user.userId}
                        <IonButton slot="end" onClick={() => {
                            if(isAdmin) displayAlert("Toggle User's Reaction", user);
                            }}>
                                {(user as unknown as {[key: string]: unknown})[`${reactionType}`] ? userReactionsEmojis[`${reactionType}`][0] : userReactionsEmojis[`${reactionType}`][1]}
                            </IonButton>
                        
                        <IonButton slot="end" className="icon-only" onClick={() => {
                            const action: UserMediaToggleActionType = user.isAudioTurnedOff ? "unMute" : "mute";
                            if(isAdmin) displayAlert(`${action} user `, user, action);
                            }}>
                                <IonIcon icon={user.isAudioTurnedOff ? micOff : mic}></IonIcon>
                            </IonButton>
                        <IonButton slot="end" className="icon-only" onClick={() => {
                            const action: UserMediaToggleActionType = user.isVideoTurnedOff ? "turnOnVideo" : "turnOffVideo";
                            if(isAdmin) displayAlert(`${user.isVideoTurnedOff ? "Turn On User's Video" : "Turn Off User's Video"} user `, user, action);
                            }}>
                                <IonIcon icon={user.isVideoTurnedOff ? videocamOff : videocam}></IonIcon>
                            </IonButton>

                    </IonItem>
                ))
            }
        </IonList>
    </div>
   )
}