import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonItem,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonModal,
  useIonToast,
} from "@ionic/react";
import ExploreContainer from "../../components/ExploreContainer";
import { Dispatch, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import MediaSoup, { Device } from "mediasoup-client";
import {
  AppData,
  ConnectionState,
  Producer,
  Transport,
} from "mediasoup-client/lib/types";
import { ClientEvents, BroadcastEvents } from "../../shared/enums/events.enum";
import { IProducers, IProducerUser } from "../../shared/interfaces/socket-user";
import { CallVideo } from "../../components/video/CallVideo";
import {
  ProducingDTO,
  RequestPermissionDTO,
} from "../../shared/dtos/requests/signals";
import {
  consumeAllProducers,
  consumeRoomProducer,
} from "../../utils/rtc/mediasoup/consuming";
import {
  createConsumerTransport,
  createDevice,
  createProducerTransport,
} from "../../utils/rtc/mediasoup/create-device-transport";
import {
  canJoinRoom,
  joinRoom,
  stopMediaTracks,
  toggleAudio,
  toggleVIdeo,
} from "../../utils/rtc/mediasoup/functionalities";
import { useRTCToolsContextStore } from "../../contexts/rtc";
import { useHistory, useParams } from "react-router";
import { socketIOBaseURL } from "../../api/base";
import { IAuthUserProfile, IProfile } from "../../shared/interfaces/user";
import { IApiResponse } from "../../shared/dtos/responses/api-response";
import {
  previewVideo,
  startProducing,
} from "../../utils/rtc/mediasoup/producing";
import { ConsumingVideo } from "../../components/video/ConsumingVideo";
import { ToggleProducerStateDTO } from "../../shared/dtos/responses/signals";
import { useModalContextStore } from "../../utils/contexts/overlays/ModalContextProvider";
import { ProducingPage } from "./ProducingPage";
import { ComponentModal } from "../../utils/components/modals/ComponentModal";

const ConferenceRoom: React.FC = () => {
  const navParams = useParams<{ roomId: string }>();
  const roomId = navParams.roomId;
  const navigation = useHistory();

  const storedUser = localStorage.getItem("user");
  const user: IAuthUserProfile = storedUser ? JSON.parse(storedUser) : {};

  const userId = user.userId || "6c06b8";
  const [producingStreams, setProducingStreams] = useState(
    [] as IProducerUser[]
  );
  const [presentAlert, dismissAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const {
    socket,
    setSocket,
    device,
    setDevice,
    consumerTransport,
    setConsumerTransport,
    producerTransport,
    setProducerTransport,
    userMediaStream,
    setUserMediaStream,
    audioTurnedOff,
    setAudioTurnedOff,
    videoTurnedOff,
    setVideoTurnedOff,
  } = useRTCToolsContextStore();

  const [presentModal, dismissModal] = useIonModal(ProducingPage);
  const { setShowModalText, showModalText } = useModalContextStore();
  const producingStreamsRef = useRef<IProducers>();
  const [canJoin, setCanJoin] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const socketInit = io(`${socketIOBaseURL}`);
        setSocket(socketInit as Socket & Dispatch<Socket>);
        socketInit.on(BroadcastEvents.JOIN_REQUEST_ACCEPTED, async () => {
          console.log("fired accepted accepted");
          await setUp(socketInit);
          await setShowModalText("");
        });

        socketInit.on(
          BroadcastEvents.REQUEST_TO_JOIN,
          (data: IProfile, callBack) => {
            displayAdmitUserAlert(socketInit, data);
          }
        );

        socketInit.on(
          BroadcastEvents.REQUEST_TO_PUBLISH,
          (data: RequestPermissionDTO) => {
            displayAdmitUserAlert(socketInit, data);
          }
        );

        const userCanJoin = await canJoinRoom(userId, roomId);
        setCanJoin(userCanJoin);
        setShowModalText(`room-${roomId}`);
      } catch (error) {
        console.log((error as Error).message);
      }
    })();
  }, []);

  async function setUp(socketInit: Socket) {
    setShowModalText("");
    await joinRoom(socketInit, roomId, userId);
    const device = await createDevice(socketInit, roomId);
    const consumerTransport = await createConsumerTransport(
      socketInit,
      device,
      roomId
    );
    const producerTransport = await createProducerTransport(
      socketInit,
      device,
      roomId,
      { isAudioTurnedOff: audioTurnedOff, isVideoTurnedOff: videoTurnedOff }
    );
    setDevice(device as Device & Dispatch<Device>);
    setProducerTransport(producerTransport as Transport & Dispatch<Transport>);
    setConsumerTransport(consumerTransport as Transport & Dispatch<Transport>);

    //-- Attah events handlers for re-consuming room producers
    [
      BroadcastEvents.PRODUCER_PRODUCING,
      BroadcastEvents.PRODUCER_CLOSED,
      BroadcastEvents.TOGGLE_PRODUCER_STATE,
    ].forEach((eventName) => {
      addConsumeProducerEventHandler(
        eventName,
        socketInit,
        consumerTransport,
        device
      );
    });

    await startProducing(producerTransport, userMediaStream as MediaStream);
    await consumeAllAndSetProducingStreams(
      socketInit,
      consumerTransport,
      device,
      roomId
    );
  }

  function displayAdmitUserAlert(
    socketInit: Socket,
    data: RequestPermissionDTO
  ) {
    presentAlert({
      header: "Someone wants to join",
      message: `${data.avatar} ${
        data.firstName ? data.firstName : ""
      } wants to be admitted, Please verify user before admitting `,
      buttons: [
        {
          text: "Admit",
          handler: () => {
            socketInit.emit(BroadcastEvents.JOIN_REQUEST_ACCEPTED, data);
            dismissAlert();
          },
        },
        {
          text: "Reject",
          handler: () => {
            dismissAlert(); // TODO - Send Rejection event
          },
        },
      ],
    });
  }

  async function consumeAllAndSetProducingStreams(
    socketInit: Socket,
    consumerTransport: Transport,
    device: Device,
    room: string
  ) {
    const res = await consumeAllProducers(
      socketInit,
      consumerTransport,
      device,
      room
    );
    if (res) {
      const producerUserArr = Object.values(res.availableProducers);
      setProducingStreams(producerUserArr);
      producingStreamsRef.current = res.availableProducers;
    }
  }

  function addConsumeProducerEventHandler(
    eventName: BroadcastEvents,
    socket: Socket,
    consumerTransport: Transport,
    device: Device
  ) {
    try {
      socket.on(eventName, async (data: IProducerUser) => {
        let producerStream: MediaStream;

        if (data?.audioProducerId && data?.videoProducerId) {
          const { audioProducerId, videoProducerId } = data;
          producerStream = await consumeRoomProducer(
            {
              audioProducerId,
              videoProducerId,
            },
            socket,
            consumerTransport,
            device,
            roomId
          );
          const roomProducers = producingStreamsRef.current;
          if (roomProducers) {
            roomProducers[data.socketId] = {
              ...data,
              mediaStream: producerStream,
            };
            producingStreamsRef.current = roomProducers;
            const producerUserArr = Object.values(roomProducers);
            setProducingStreams(producerUserArr);
          }
        }
      });
    } catch (error) {
      console.log(
        `Error handling event ${eventName}`,
        (error as Error).message
      );
    }
  }

  async function requestToJoin(socket: Socket) {
    try {
      const joinRes: IApiResponse<Boolean> = await new Promise((resolve) => {
        socket.emit(BroadcastEvents.REQUEST_TO_JOIN, { room: roomId }, resolve);
      });
      if (!/success/.test(joinRes.status)) {
        await presentToast(`${joinRes.message}`), 300;
        navigateOutOfRoom();
      }
    } catch (error) {
      console.log("Error requesting to join", (error as Error).message);
    }
  }

  async function navigateOutOfRoom() {
    socket.disconnect();
    setSocket({} as any);
    stopMediaTracks(userMediaStream);
    setUserMediaStream({} as MediaStream & Dispatch<MediaStream>);
    navigation.push("/conference/rooms");
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
        <div></div>
        {!showModalText && (
          <div className="">
            <CallVideo autoPlay playsInline />
          </div>
        )}
        <IonGrid>
          <IonRow>
            {producingStreams.map((p, i) => (
              <IonCol size="6" key={i}>
                <ConsumingVideo
                  key={i}
                  width={"100px"}
                  height={"100px"}
                  mediaStream={p.mediaStream}
                  isVideoTurnedOff={p.isVideoTurnedOff}
                />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        <IonToolbar>
          <IonItem>
            <IonButton
              onClick={async () => {
                const data: ToggleProducerStateDTO = {
                  room: roomId,
                  action: audioTurnedOff ? "unMute" : "mute",
                };
                socket.emit(BroadcastEvents.TOGGLE_PRODUCER_STATE, data);
                toggleAudio(userMediaStream, setAudioTurnedOff);
              }}
            >
              Toggle Audio
            </IonButton>

            <IonButton
              onClick={() => {
                const data: ToggleProducerStateDTO = {
                  room: roomId,
                  action: videoTurnedOff ? "turnOnVideo" : "turnOffVideo",
                };
                socket.emit(BroadcastEvents.TOGGLE_PRODUCER_STATE, data);
                toggleVIdeo(userMediaStream, setVideoTurnedOff);
              }}
            >
              Toggle Video
            </IonButton>

            <IonButton slot="end" onClick={navigateOutOfRoom}>
              Leave
            </IonButton>
          </IonItem>
        </IonToolbar>
        <ComponentModal
          modalBody={
            <ProducingPage
              joinHandler={async () => {
                canJoin ? await setUp(socket) : await requestToJoin(socket);
              }}
            />
          }
          modalTitle="Waiting Room"
          showModalText={`room-${roomId}`}
        />
      </IonContent>
    </IonPage>
  );
};

export default ConferenceRoom;
