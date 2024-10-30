import { Socket } from "socket.io-client";
import { ClientEvents } from "../../../shared/enums/events.enum";
import {SetStateAction, Dispatch } from "react";
import { IProducers } from "../../../shared/interfaces/socket-user";
import { IApiResponse } from "../../../shared/dtos/responses/api-response";
import { APIBaseURL, getData } from "../../../api/base";
import { IRoom } from "../../../shared/interfaces/room";
export function toggleAudio(userMediaStream: MediaStream,  setAudioTurnedOff: SetStateAction<Dispatch<boolean>>){
    userMediaStream.getAudioTracks()[0].enabled = !(userMediaStream.getAudioTracks()[0].enabled)
    setAudioTurnedOff((!userMediaStream.getAudioTracks()[0].enabled as boolean & Dispatch<boolean>))
  }
  
export function toggleVIdeo(userMediaStream: MediaStream, setVideoTurnedOff: SetStateAction<Dispatch<boolean>>){
  userMediaStream.getVideoTracks()[0].enabled = !(userMediaStream.getVideoTracks()[0].enabled)
  setVideoTurnedOff((!userMediaStream.getVideoTracks()[0].enabled as boolean & Dispatch<boolean>))
}

export async function joinRoom(socket: Socket, room: string, userId: string) {
    return await new Promise((resolve) => {
      socket.emit(ClientEvents.JOIN_ROOM, { room, userId }, resolve);
    });
  }

  export function stopMediaTracks(userMediaStream: MediaStream) {
    const tracks = userMediaStream?.getTracks();
    tracks.forEach((track) => track.stop())
  }

  export async function getRoomAdmins(socket: Socket, room: string): Promise<IProducers | undefined> {
    const res: IApiResponse<IProducers> = await new Promise((resolve) => {
      socket.emit(ClientEvents.GET_ROOM_ADMINS, {room}, resolve);
    });
    if(res.error) throw new Error(res.message);
    return res.data;
  }

  export async function isRoomAdmin(socket: Socket, room: string, userId: string): Promise<boolean> {
    const roomAdmins = await getRoomAdmins(socket, room);
    if(roomAdmins){
      Object.values(roomAdmins).find((roomAdmin) => roomAdmin.userId === userId);
      return true;
    }
    return false;
  }

  export async function canJoinRoom(userId: string, roomId: string): Promise<boolean> {
    try{
      const room = await getData<IRoom>(`${APIBaseURL}/room/${roomId}`);
      console.log("detail", room.owner?.userId, "and ", userId, "R", roomId);
      if(room?.owner?.userId === userId || room?.invitees?.find((user) => user.userId === userId)) return true;
      return false;
    }catch(error){
      console.log("Error checking if user can join", (error as Error).message)
      return false;
    }
  }