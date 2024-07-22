import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import ExploreContainer from "../components/ExploreContainer";
import "./Tab2.css";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import MediaSoup, { Device } from "mediasoup-client";
import { AppData, ConnectionState, Transport } from "mediasoup-client/lib/types";
import { ClientEvents, ServerEvents } from "../shared/enums/events.enum";
import { IProducers } from "../shared/interfaces/socket-user";
import { CallVideo } from "../components/video/CallVideo";
import {
  ConnectTransportDTO,
  CreateConsumerDTO,
  CreateProducerDTO,
  createTransportDTO,
  ProducingDTO,
} from "../shared/dtos/requests/signals";
import {
  CreatedConsumerDTO,
  CreatedTransportDTO,
} from "../shared/dtos/responses/signals";
import { IApiResponse } from "../shared/dtos/responses/api-response";

export interface IProducerStream {
  producerId: string;
  streamObject: MediaStream;
}
export interface IProducingStreams {
  [producerId: string]: IProducerStream;
}

const Tab2: React.FC = () => {
  const [device, setDevice] = useState({} as Device);

  const [consumerTransport, setConsumerTransport] = useState(
    {} as MediaSoup.types.Transport<AppData>
  );

  const [producerTransport, setProducerTransport] = useState(
    {} as MediaSoup.types.Transport<AppData>
  );

  const [producers, setProducers] = useState({} as IProducers);
  const [producingStreams, setProducingStreams] = useState(
    {} as IProducingStreams
  );
  const [socket, setSocket] = useState({} as Socket);
  const room = "videoCall";

  const [presentToast] = useIonToast();

  useEffect(() => {
    (async () => {
      try {
        const socketInit = io("http://localhost:3001/call");

        await joinRoom(socketInit);
        const {device, consumerTransport} = await createDeviceAndTransports(socketInit);

        handleNewProducer(socketInit, consumerTransport, device);
        handleClosedProducer(socketInit);
        setSocket(socketInit);
      } catch (error) {
        console.log((error as any).message);
      }
    })();
  }, []);

  useEffect(() => {
    attachStreamToProducerVideoElements(producingStreams);
  }, [producingStreams]);

  async function joinRoom(socket: Socket) {
    return await new Promise((resolve) => {
      socket.emit(ClientEvents.JOIN_ROOM, { room, userId: "1" }, resolve);
    });
  }

  async function createDeviceAndTransports(socket: Socket): Promise<{
    device: Device, consumerTransport: Transport, producerTransport: Transport
  }> {
    const data: IApiResponse<MediaSoup.types.RtpCapabilities> =
      await new Promise((resolve, reject) => {
        socket.emit(
          ClientEvents.GET_ROUTER_RTCCAPABILITIES,
          { room },
          (res: IApiResponse<MediaSoup.types.RtpCapabilities>) => {
            if (res.error) reject(res.message);
            resolve(res);
          }
        );
      });

    const deviceInit = new Device();
    await deviceInit.load({ routerRtpCapabilities: data.data as any });

    setDevice(deviceInit);
    const consumerTransportInit = await createConsumerTransport(socket, deviceInit);
    const producerTransportInit = await createProducerransport(socket, deviceInit);
    return {device: deviceInit, consumerTransport: consumerTransportInit, producerTransport: producerTransportInit }
  }

  async function createProducerransport(socket: Socket, device: Device): Promise<Transport> {
    const isProducer = true;
    const dto: createTransportDTO = { room, isProducer };
    const res: IApiResponse<CreatedTransportDTO> = await new Promise(
      (resolve) => {
        socket.emit(
          ClientEvents.CREATE_TRANSPORT,
          dto,
          (res: IApiResponse<CreatedTransportDTO>) => resolve(res)
        );
      }
    );

    if (res.error) throw new Error(res.message);
    if (!res.data) throw new Error("No data returned from server");

      const transportInit = device.createSendTransport(res.data);

      transportInit.on(
        "connect",
        async (data, callBack: Function, errorBack: Function) => {
          await new Promise((resolve) => {
            const dto: ConnectTransportDTO = {
              ...data,
              room,
              transportId: transportInit.id,
              isProducer: true,
            };
            socket.emit(ClientEvents.CONNECT_TRANSPORT, dto, resolve);
          });
          callBack();
        }
      );

      transportInit.on("produce", async (data, callBack, errorBack) => {
        const dto: CreateProducerDTO = {
          ...data,
          room,
          transportId: transportInit.id,
        };
        const res: IApiResponse<{ id: string }> = await new Promise(
          (resolve) => {
            socket.emit(ClientEvents.PRODUCE, dto, resolve);
          }
        );
        if (res.error) throw new Error(res.message);
        if (res.data) callBack({ id: res.data.id });
      });

      transportInit.on("connectionstatechange", (data: ConnectionState) => {
        if (data === "closed" || data === "disconnected") {
          presentToast({
            message: "You just lost connection, please check your connection",
            duration: 3000,
            position: "top",
          });
          socket.emit(ServerEvents.PRODUCER_CLOSED, {
            transportId: transportInit.id,
            room,
          });
        }
      });

      setProducerTransport(transportInit);
      return transportInit;
    
  }

  async function createConsumerTransport(socket: Socket, device: Device): Promise<Transport> {
    const isProducer = false;
    const dto: createTransportDTO = { room, isProducer };
    const res: IApiResponse<CreatedTransportDTO> = await new Promise(
      (resolve, reject) => {
        socket.emit(
          ClientEvents.CREATE_TRANSPORT,
          dto,
          (res: IApiResponse<CreatedTransportDTO>) => resolve(res)
        );
      }
    );

    if (res.error) throw new Error(res.message);
    if (!res.data) throw new Error("No data returned from server");
    
    const transportInit = device.createRecvTransport(res.data);

      transportInit.on(
        "connect",
        async (data, callBack: Function, errorBack: Function) => {
          await new Promise((resolve) => {
            const dto: ConnectTransportDTO = {
              ...data,
              isProducer,
              room,
              transportId: transportInit.id,
            };
            socket.emit(ClientEvents.CONNECT_TRANSPORT, dto, resolve);
          });
          callBack();
        }
      );

      setConsumerTransport(transportInit);
      return transportInit;
    
  }

  async function consume(
    producerId: string,
    socket: Socket,
    consumerTransport: Transport,
    device: Device
  ): Promise<MediaStream> {
    try {
      const response: IApiResponse<CreatedConsumerDTO> = await new Promise(
        (resolve) => {
          const dto: CreateConsumerDTO = {
            producerId,
            rtpCapabilities: device.rtpCapabilities,
            room,
            transportId: consumerTransport.id,
          };
          console.log("dto", dto);
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
        const stream = new MediaStream();
        stream.addTrack(track);
        return stream;
      }
      throw new Error(response.message);
    } catch (error) {
      console.log("Error from server:", (error as Error).message);
      throw new Error("something went wrong trying to play content");
    }
  }

  async function getAllRoomProducers(socket: Socket): Promise<IProducers> {
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

  async function consumeAllProducers(socket: Socket,consumerTransport: Transport, device: Device) {
    try {
      const roomProducers: IProducers = await getAllRoomProducers(socket);
      const producersArr = Object.keys(roomProducers);
      const promiseRes = await Promise.allSettled(
        producersArr.map((pId) => consume(pId, socket, consumerTransport, device))
      );

      let producerStreams: IProducingStreams = {};
      let availableProducers: IProducers = {};

      promiseRes.forEach((res, i) => {
        if (res.status === "fulfilled") {
          const producerId = producersArr[i];
          producerStreams[producerId] = {
            producerId,
            streamObject: res.value,
          };
          availableProducers[producerId] = roomProducers[producerId];
        }
      });

      setProducingStreams(producerStreams);
      setProducers(availableProducers);
    } catch (error) {
      presentToast({
        message: "Unable to fetch participant strems",
        duration: 3000,
        position: "top",
      });
      console.log((error as Error).message);
    }
  }

  async function startProducing(sendingTransport: MediaSoup.types.Transport) {
    try {
      const videoStram = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const videoElem = document.getElementById("my-video");
      (videoElem as HTMLVideoElement).srcObject = videoStram;
      const track = videoStram.getVideoTracks()[0];

      await sendingTransport.produce({ track });
    } catch (error) {
      console.log((error as Error).message);
      presentToast({
        message:
          "Unable to produce from your media devices, your devices might be in use y other applications",
        duration: 3000,
        position: "top",
      });
    }
  }

  function handleNewProducer(socket: Socket, consumerTransport: Transport, device: Device) {
    try {
      socket.on(ServerEvents.PRODUCER_PRODUCING, async (data: ProducingDTO) => {
        const { producerId } = data;
        const streamObject = await consume(producerId, socket, consumerTransport, device);
        setProducingStreams({
          ...producingStreams,
          [producerId]: { producerId, streamObject },
        });
      });
    } catch (error) {
      console.log((error as Error).message);
      presentToast({
        message: "Unable to process new participant",
        duration: 3000,
        position: "top",
      });
    }
  }

  function handleClosedProducer(socket: Socket) {
    socket.on(ServerEvents.PRODUCER_CLOSED, (data: ProducingDTO) => {
      const { producerId } = data;
      setProducingStreams((prev) => {
        const {
          [producerId]: {},
          ...rest
        } = prev;
        return rest;
      });
    });
  }

  function attachStreamToProducerVideoElements(
    producerObject: IProducingStreams
  ) {
    try {
      Object.values(producerObject).forEach((p) => {
        const videoElement: HTMLVideoElement = document.getElementById(
          p.producerId
        ) as HTMLVideoElement;
        if (!videoElement) {
          console.log("no souch element found");
          return;
        }
        videoElement.srcObject = p.streamObject;
      });
    } catch (error) {
      console.log((error as Error).message);
      presentToast({
        message: "Unable to display retrieved streams in view",
        duration: 3000,
        position: "top",
      });
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Conference Room</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 2</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Tab 2 page" />
        <div>
          <button onClick={async () => await startProducing(producerTransport)}>
            Start proucing
          </button>
          <br />
          <button onClick={() => consumeAllProducers(socket, consumerTransport, device)}>
            consume All
          </button>
          <br />
          <button
            onClick={() =>
              attachStreamToProducerVideoElements(producingStreams)
            }
          >
            Attach video element to all
          </button>
        </div>
        <div className="">
          <video id="my-video" autoPlay playsInline></video>
        </div>
        {Object.keys(producingStreams).map((p) => (
          <CallVideo key={p} id={p} autoPlay playsInline />
        ))}
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
