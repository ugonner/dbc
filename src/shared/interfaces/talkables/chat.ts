import { CommunicationModeEnum } from "../../enums/talkables/talkables.enum";


export interface IChatUser {
    userId: string;
    userName: string;
    avatar?: string;
    organization?: string;
    purpose?: string;
    communicationMode?: CommunicationModeEnum;
    gender?: "M" | "F"

}

export interface IChat {
    chatId: string;
    users: IChatUser[];
    lastMessage?: IChatMessage
}

export interface IChatMessage {
    chatId: string;
    message?: string;
    sender: IChatUser;
    receiver: IChatUser;
    isViewed: boolean;
    createdAt: string
    isAdmin?: boolean;
    socketId?: string;
}