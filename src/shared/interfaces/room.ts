import { IProfile } from "./user";

export interface IRoom {
    id?: number;
    roomId?: string;
    startTime?: string;
    endTime?: string;
    owner?: IProfile;
    invitees?: IProfile[];
}

export interface QueryRoomDTO{
   invitees?: string;
   userId?: string;
   id?: number;
   roomId?: string;
   startTime?: string;
   endTime?: string;
}

export interface ICreateRoomDTO extends IRoom {
    startTime: string;
    duration: string;
    roomId?: string;
}
