import { IonIcon, IonItem, IonLabel, IonText } from "@ionic/react";
import { IChatMessage } from "../../shared/interfaces/talkables/chat";
import { checkmarkDone, checkmarkOutline } from "ionicons/icons";
import { formatDate } from "../../shared/helpers";

export const ChatMessage = ({chatMessage}: {chatMessage: IChatMessage}) => {

    return (
            <IonLabel>
                <h6>{chatMessage.sender?.userName}</h6>
                <p>
                    {chatMessage.message}
                    <br/>
                    <small>{chatMessage.isViewed ? (
                        <IonIcon icon={checkmarkDone}></IonIcon>
                    ) : (
                        <IonIcon icon={checkmarkOutline}></IonIcon>
                    )} 
                     {formatDate(chatMessage.createdAt)}</small>
            
                </p>
            </IonLabel>
        
    )
}