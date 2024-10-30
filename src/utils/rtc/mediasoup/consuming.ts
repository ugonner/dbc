import { Device, Transport } from "mediasoup-client/lib/types";
import { Socket } from "socket.io-client";
import { IApiResponse } from "../../../shared/dtos/responses/api-response";
import { CreatedConsumerDTO } from "../../../shared/dtos/responses/signals";
import { CreateConsumerDTO } from "../../../shared/dtos/requests/signals";
import { ClientEvents } from "../../../shared/enums/events.enum";
import {
  IProducers,
  IProducerUser,
} from "../../../shared/interfaces/socket-user";
import { getAllRoomProducers } from "./producing";

async function consume(
  producerId: string,
  socket: Socket,
  consumerTransport: Transport,
  device: Device,
  room: string
): Promise<MediaStreamTrack> {
  try {
    const response: IApiResponse<CreatedConsumerDTO> = await new Promise(
      (resolve) => {
        const dto: CreateConsumerDTO = {
          producerId,
          rtpCapabilities: device.rtpCapabilities,
          room,
          transportId: consumerTransport.id,
        };
        socket.emit(
          ClientEvents.CONSUME,
          dto,
          (res: IApiResponse<CreatedConsumerDTO>) => resolve(res)
        );
      }
    );

    if (response.error) throw new Error(response.error as string);
    if (response.data) {
      const consumer = await consumerTransport.consume(response.data);
      const { track } = consumer;
      return track;
    }
    throw new Error(response.message);
  } catch (error) {
    console.log("Error from server:", (error as Error).message);
    throw new Error("something went wrong trying to play content");
  }
}


export async function consumeRoomProducer(
  producerIds: {videoProducerId: string; audioProducerId: string},
  socket: Socket,
  consumerTransport: Transport,
  device: Device,
  room: string
): Promise<MediaStream> {
  const promiseRes = await Promise.allSettled(
    [
      consume(producerIds.videoProducerId, socket, consumerTransport, device, room),
      consume(producerIds.audioProducerId, socket, consumerTransport, device, room),
    ]
  );
  const mediaStream: MediaStream = new MediaStream();
  promiseRes.forEach((res) => {
    if(res.status === "fulfilled") mediaStream.addTrack(res.value);
  });
  return mediaStream;
}

export async function consumeAllProducers(
  socket: Socket,
  consumerTransport: Transport,
  device: Device,
  room: string
): Promise<
  | {
      availableProducers: IProducers;
    }
  | undefined
> {
  try {
    const roomProducers: IProducers = await getAllRoomProducers(socket, room);
    
    const producersArr: IProducerUser[] = Object.values(roomProducers);
    const promiseRes = await Promise.allSettled(
      producersArr.map((p: IProducerUser) =>
        consumeRoomProducer({videoProducerId: `${p.videoProducerId}`, audioProducerId: `${p.audioProducerId}` }, socket, consumerTransport, device, room)
      )
    );

    let availableProducers: IProducers = {};
    const fulfilled: string[]  = [];
    promiseRes.forEach((res, i) => {
      if (res.status === "fulfilled") {
        const socketId = producersArr[i].socketId;
        fulfilled.push(socketId);
        availableProducers[socketId] = {
          ...roomProducers[socketId],
          mediaStream: res.value,
        };
      }
    });
    
    return {
      availableProducers,
    };
  } catch (error) {
    console.log((error as Error).message);
  }
}
