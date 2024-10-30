import { Socket } from "socket.io-client";
import { ClientEvents } from "../../../shared/enums/events.enum";
import { IApiResponse } from "../../../shared/dtos/responses/api-response";
import { IProducers } from "../../../shared/interfaces/socket-user";
import { Producer, Transport } from "mediasoup-client/lib/types";

export async function getAllRoomProducers(socket: Socket, room: string): Promise<IProducers> {
    return new Promise((resolve, reject) => {
      socket.emit(
        ClientEvents.GET_ROOM_PRODUCERS,
        { room },
        (res: IApiResponse<IProducers>) => {
          if (res.error) reject(res.message);
          else resolve(res.data as IProducers);
        }
      );
    });
  }

  
  export async function previewVideo(previewElementId: string): Promise<MediaStream | undefined> {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const videoElem = document.getElementById(`${previewElementId}`);
      if(videoElem){
        (videoElem as HTMLVideoElement).srcObject = mediaStream;
      }
      return mediaStream;
    } catch (error) {
      console.log("Error previewing video", (error as Error).message);  
    }
  }
  
  export async function startProducing(
    sendingTransport: Transport,
    mediaStream: MediaStream
  ): Promise<{audioProducer: Producer, videoProducer: Producer} | undefined> {
    try {
      const videoTrack = mediaStream.getVideoTracks()[0];
      const audioTrack = mediaStream.getAudioTracks()[0];
      const videoProducer = await sendingTransport.produce({
        track: videoTrack,
      });
      const audioProducer = await sendingTransport.produce({
        track: audioTrack,
      });
      return {videoProducer, audioProducer};
    } catch (error) {
      console.log((error as Error).message);
    }
  }