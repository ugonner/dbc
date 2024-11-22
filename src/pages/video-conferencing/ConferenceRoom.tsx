import {
  IonActionSheet,
  IonAvatar,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonPopover,
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
import {
  IProducers,
  IProducerUser,
  UserActions,
} from "../../shared/interfaces/socket-user";
import { CallVideo } from "../../components/video/CallVideo";
import {
  JoinRoomDTO,
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
  isRoomAdmin,
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
import {
  ToggleProducerStateDTO,
  UserReactionsDTO,
} from "../../shared/dtos/responses/signals";
import { useModalContextStore } from "../../utils/contexts/overlays/ModalContextProvider";
import { ProducingPage } from "./ProducingPage";
import { ComponentModal } from "../../utils/components/modals/ComponentModal";
import { RoomParticipants } from "../../components/conference-room/RoomParticipants";
import { userReactionsEmojis } from "../../shared/DATASETS/user-reaction-emojis";

const ConferenceRoom: React.FC = () => {
  const navParams = useParams<{ roomId: string }>();
  const roomId = navParams.roomId;
  const navigation = useHistory();

  const storedUser = localStorage.getItem("user");
  const user: IAuthUserProfile = storedUser ? JSON.parse(storedUser) : {};

  const {userId, firstName: userName, avatar} = (user.profile || {}) as IProfile;
  const [producingStreams, setProducingStreams] = useState(
    [] as IProducerUser[]
  );

  const [lastUserReation, setLastUserReaction] = useState<UserActions>();

  const [lastUser, setLastUser] = useState<IProducerUser>();
  const [openUsersModal, setOpenUsersModal] = useState(false);
  const [openLastUserModal, setOpenLastUserModal] = useState(false);
  const [openJoinRequestPopover, setOpenJoinRequestPopover] = useState(false);
  const [requestToJoinUserData, setRequestToJoinUserData] = useState<JoinRoomDTO>();
  const [isAdmin, setIsAdmin] = useState(true);
  const [openReactionsActionSheet, setOpenReactionsActionSheet] =
    useState(false);

  
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
          await setUp(socketInit);
          await setShowModalText("");
        });
        socketInit.on(BroadcastEvents.JOIN_REQUEST_REJECTEDD, async () => {
          await setShowModalText("");
          presentToast("Your request to join was rejected ", 3000);
          await navigateOutOfRoom();
        });

        socketInit.on(
          BroadcastEvents.REQUEST_TO_JOIN,
          (data: JoinRoomDTO, callBack) => {
            //displayAdmitUserAlert(socketInit, data);
            setRequestToJoinUserData(data);
            setOpenJoinRequestPopover(true);
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
    await joinRoom(socketInit, {room: roomId, userId, userName, avatar});
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
      BroadcastEvents.USER_REACTION,
    ].forEach((eventName) => {
      if (eventName === BroadcastEvents.PRODUCER_CLOSED)
        addReRenderProducers(socketInit, eventName, "remove");
      else if (eventName === BroadcastEvents.USER_REACTION)
        addReRenderProducers(socketInit, eventName, "rerender");
      else
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

  async function addReRenderProducers(
    socket: Socket,
    eventName: BroadcastEvents,
    action: "add" | "remove" | "rerender"
  ) {
    try {
      socket.on(eventName, (data: IProducerUser) => {
        if (!data || !data?.socketId) return;
        const { socketId } = data;

        const roomProducers = producingStreamsRef.current || {};
        const producerUser = {
          ...(roomProducers[`${socketId}`] || {}),
          ...data,
        };
        roomProducers[`${socketId}`] = producerUser;
        if (eventName === BroadcastEvents.USER_REACTION) {
          setLastUser(producerUser);
          setLastUserReaction(
            (data as IProducerUser & { action: UserActions }).action
          );
          setOpenLastUserModal(true);
          autoDismissLastUserModal();
        }
        if (action === "remove") delete roomProducers[`${socketId}`];
        producingStreamsRef.current = roomProducers;
        const producingArr = Object.values(roomProducers);
        setProducingStreams(producingArr);
      });
    } catch (error) {
      console.log((error as Error).message);
      presentToast((error as Error).message, 3000);
    }
  }

  function autoDismissLastUserModal() {
    try {
      const timeout = setTimeout(() => {
        setOpenLastUserModal(false);
        clearTimeout(timeout);
      }, 10000);
    } catch (error) {
      console.log((error as Error).message);
    }
  }

  async function requestToJoin(socket: Socket) {
    try {
      const joinRes: IApiResponse<Boolean> = await new Promise((resolve) => {
        socket.emit(BroadcastEvents.REQUEST_TO_JOIN, { room: roomId, userName, avatar, userId }, resolve);
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
    socket?.disconnect();
    setSocket(undefined);
    stopMediaTracks(userMediaStream as MediaStream);
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
                socket?.emit(BroadcastEvents.TOGGLE_PRODUCER_STATE, data);
                toggleAudio(userMediaStream as MediaStream, setAudioTurnedOff);
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
                socket?.emit(BroadcastEvents.TOGGLE_PRODUCER_STATE, data);
                toggleVIdeo(userMediaStream as MediaStream, setVideoTurnedOff);
              }}
            >
              Toggle Video
            </IonButton>

            <IonButton
              onClick={async () => {
                try {
                  const screenShareStream =
                    await navigator.mediaDevices.getDisplayMedia({
                      video: true,
                    });
                  const videoTrack = screenShareStream.getVideoTracks()[0];
                  await producerTransport?.produce({ track: videoTrack });
                  setUserMediaStream(screenShareStream);
                } catch (error) {
                  presentToast((error as Error).message, 3000);
                  console.log(
                    "Error sharing screen ",
                    (error as Error).message
                  );
                }
              }}
            >
              Share Screen
            </IonButton>
            <IonButton
              onClick={() =>
                setOpenReactionsActionSheet(!openReactionsActionSheet)
              }
            >
              React
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
                canJoin
                  ? await setUp(socket as Socket)
                  : await requestToJoin(socket as Socket);
              }}
            />
          }
          modalTitle="Waiting Room"
          showModalText={`room-${roomId}`}
        />

        <IonPopover
        isOpen={openJoinRequestPopover}
        >
          <div>
            <IonItem>
              <IonAvatar slot="start">
              <img src={requestToJoinUserData?.avatar} alt={`${requestToJoinUserData?.userName}'s image`} />
              </IonAvatar>
              <IonLabel>
                
            <h4>Someone wants to join</h4>
            <p>{`${requestToJoinUserData?.userName} want's to join`}</p>
           
              </IonLabel>
            </IonItem>
            <div>
              <IonItem>
              <IonButton slot="end" role="destructive" onClick={
                () => {
                  socket?.emit(BroadcastEvents.JOIN_REQUEST_ACCEPTED, requestToJoinUserData);
                  setOpenJoinRequestPopover(false);
                  setRequestToJoinUserData(undefined)
                }
              }>Admit</IonButton>
              <IonButton slot="end" role="destructive" onClick={
                () => {
                  socket?.emit(BroadcastEvents.JOIN_REQUEST_REJECTEDD, requestToJoinUserData);
                  setOpenJoinRequestPopover(false);
                  setRequestToJoinUserData(undefined)
                }
              }>Reject</IonButton>
              </IonItem>
            </div>
          </div>
        </IonPopover>

        <IonPopover
          isOpen={openLastUserModal}
          onDidDismiss={() => setOpenLastUserModal(false)}
          title={lastUserReation}
        >
          <RoomParticipants
            roomParticipants={[lastUser as IProducerUser]}
            socket={socket as Socket}
            room={roomId}
            reactionType={lastUserReation}
            isAdmin={isAdmin}
          />
        </IonPopover>

        <IonModal
          isOpen={openUsersModal}
          onDidDismiss={() => setOpenUsersModal(false)}
          backdropDismiss={true}
        >
          <RoomParticipants
            roomParticipants={producingStreams}
            socket={socket as Socket}
            room={roomId}
            isAdmin={isAdmin}
          />
        </IonModal>

        <IonActionSheet
          isOpen={openReactionsActionSheet}
          onDidDismiss={() => setOpenReactionsActionSheet}
          header={`${socket ? "socket is true" : "no socket"}`}
          buttons={Object.keys(userReactionsEmojis).map((reaction) => ({
            icon: userReactionsEmojis[reaction][0],
            text: reaction,
            handler: async () => {
              const data: UserReactionsDTO = {
                room: roomId,
                action: reaction as UserActions,
              };
              try {
                socket?.emit(BroadcastEvents.USER_REACTION, data);
                await new Promise((resolve, reject) =>
                  socket?.emit(BroadcastEvents.USER_REACTION, data, resolve)
                );
                setOpenReactionsActionSheet(false);
              } catch (error) {
                console.log((error as Error).message);
              }
            },
          }))}
        />
      </IonContent>
    </IonPage>
  );
};

export default ConferenceRoom;
