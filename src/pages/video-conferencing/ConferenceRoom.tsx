import {
  IonAvatar,
  IonButton,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonPopover,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonModal,
  useIonRouter,
  useIonToast,
  useIonViewDidEnter,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  Consumer,
  Dispatch,
  LegacyRef,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import MediaSoup, { Device } from "mediasoup-client";
import {
  DataConsumer,
  DataProducer,
  Transport,
} from "mediasoup-client/lib/types";
import { ClientEvents, BroadcastEvents } from "../../shared/enums/events.enum";
import {
  IProducers,
  IProducerUser,
  IUserReactions,
  UserActions,
} from "../../shared/interfaces/socket-user";
import { CallVideo } from "../../components/video/CallVideo";
import {
  AccessibilityPreferenceDTO,
  CaptionDTO,
  ChatMessageDTO,
  CloseMediaDTO,
  IProducerAppData,
  JoinRoomDTO,
} from "../../shared/dtos/requests/signals";
import {
  consume,
  consumeAllProducers,
  consumeData,
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
import { useHistory, useLocation, useParams } from "react-router";
import { AppBaseUrl, socketIOBaseURL } from "../../api/base";
import { IAuthUserProfile, IProfile } from "../../shared/interfaces/user";
import { IApiResponse } from "../../shared/dtos/responses/api-response";
import {
  getAllRoomProducers,
  startProducing,
  startProducingData,
} from "../../utils/rtc/mediasoup/producing";
import { ConsumingVideo } from "../../components/video/ConsumingVideo";
import {
  ToggleProducerStateDTO,
  UserReactionsDTO,
} from "../../shared/dtos/responses/signals";
import { ProducingPage } from "./ProducingPage";
import { RoomParticipants } from "../../components/conference-room/RoomParticipants";
import { userReactionsEmojis } from "../../shared/DATASETS/user-reaction-emojis";
import {
  mic,
  micOff,
  videocam,
  videocamOff,
  power,
  close,
  people,
  ellipsisVertical,
  ellipsisHorizontal,
  closeCircle,
  powerSharp,
  navigate,
  caretForwardCircleSharp,
  cloudCircle,
  chatboxSharp,
  peopleCircle,
} from "ionicons/icons";
import {
  AccessibilityPriority,
  ICanJoinAs,
  IRoomContext,
} from "../../shared/interfaces/room";
import { formatCamelCaseToSentence, speakText } from "../../shared/helpers";
import { RoomMenu } from "../../components/conference-room/RoomMenu";
import {
  IRoomMessage,
  RoomMessages,
} from "../../components/conference-room/RoomMessages";
import { Captioning } from "../../components/conference-room/Captioning";
import { defaultUserImageUrl } from "../../shared/DATASETS/defaults";
import { IDataMessageDTO } from "../../shared/interfaces/data-message";
import { App } from "@capacitor/app";
import { ShareContent } from "../../components/Share";

const ConferenceRoom: React.FC = () => {
  const navigate = useIonRouter();
  const socketRef = useRef<Socket>();

  const currentPageRef = useRef(window.location.href);

  const [ariaAssertiveNotification, setAriaAssertiveNotification] =
    useState<string>();
  const [ariaPoliteNotification, setAriaPoliteNotification] =
    useState<string>();

  const navParams = useParams<{ roomId: string }>();
  const roomId = navParams.roomId?.replace(" ", "");
  const navigation = useHistory();

  const storedUser = localStorage.getItem("user");
  const user: IAuthUserProfile = storedUser ? JSON.parse(storedUser) : {};

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userFromQuery = {
    userId: queryParams.get("userId"),
    userName: queryParams.get("firstName"),
    avatar: queryParams.get("avatar"),
  };

  const userProfile = (
    userFromQuery.userId ? userFromQuery : user?.profile || {}
  ) as IProfile;
  userProfile.avatar = userProfile.avatar || defaultUserImageUrl;

  const { userId, firstName: userName, avatar } = userProfile;
  const [producingStreams, setProducingStreams] = useState(
    [] as IProducerUser[]
  );

  const [lastUserReation, setLastUserReaction] = useState<UserActions>();

  const [openRequestPopover, setOpenRequestPopover] = useState(false);
  const [openRoomMenuPopover, setOpenRoomMenuPopover] = useState(false);
  const [lastUser, setLastUser] = useState<IProducerUser>();
  const [openUsersModal, setOpenUsersModal] = useState(false);
  const [openLastUserModal, setOpenLastUserModal] = useState(false);
  const [openJoinRequestPopover, setOpenJoinRequestPopover] = useState(false);
  const [requestToJoinUserData, setRequestToJoinUserData] =
    useState<JoinRoomDTO>();
  const [isAdmin, setIsAdmin] = useState(true);
  const [openReactionsActionSheet, setOpenReactionsActionSheet] =
    useState(false);
  const [specialPresnterStream, setSpecialPresenterStream] =
    useState<IProducerUser>();
  const [openSpecialPresenter, setOpenSpecialPresenter] = useState(true);
  const [screenSharingStream, setScreenSharingStream] = useState<MediaStream>();
  const [openMoreToolsOverlay, setOpenMoreToolsOverlay] = useState(false);
  const [presentToast] = useIonToast();

  const {
    socket,
    setSocket,
    setDevice,
    setConsumerTransport,
    producerTransport,
    setProducerTransport,
    userMediaStreamRef,
    audioTurnedOff,
    setAudioTurnedOff,
    videoTurnedOff,
    setVideoTurnedOff,
    setUserReactionsState,
    userReactionsState,
    accessibilityPreferences,
    setAccessibilityPreferences,
    pinnedProducerUser,
    setPinnedProducerUser,
    setChatMessages,
    chatMessages,
    roomContext,
    setRoomContext,
    subTitles,
    setSubTitles,
    showModalText,
    setShowModalText,
    producerAppDataRef,
    currentRoomRef,
  } = useRTCToolsContextStore();

  const chatMessagesRef = useRef<IRoomMessage[]>();
  const [openCaptionsOverlay, setOpenCaptionsOverlay] = useState(false);
  const captionsTriggerRef = useRef<HTMLIonButtonElement>();

  const dataProducerRef = useRef<DataProducer>();
  const socketIdRef = useRef<string>();
  const dataConsumersRef = useRef<DataConsumer[]>([]);

  const roomSubtitleRef = useRef<IRoomMessage[]>();

  const [openChatMessagesModal, setOpenChatMessagesModal] = useState(false);
  const [openRoomSubtitleModal, setOpenRoomSubtitleModal] = useState(false);

  const [presentAlert, dismissAlert] = useIonAlert();

  const [presentModal, dismissModal] = useIonModal(ProducingPage);
  const producingStreamsRef = useRef<IProducers>();
  const [canJoin, setCanJoin] = useState<ICanJoinAs>();

  useIonViewWillEnter(() => {
    (async () => {
      try {
        // if current room ref is roomId; then user has been in room before
        // ie setup has been successfully called before
        if (socket && currentRoomRef.current === roomId) {
          setUp(socket);
          return;
        }

        const socketInit = io(`${socketIOBaseURL}`);
        socketIdRef.current = socketInit?.id;
        setSocket(socketInit as Socket & Dispatch<Socket>);
        socketRef.current = socketInit;

        socketInit.on(BroadcastEvents.JOIN_REQUEST_ACCEPTED, async () => {
          try {
            await setUp(socketInit);
            setShowModalText("");
          } catch (error) {
            console.log("Set up error", error);
          }
        });
        socketInit.on(BroadcastEvents.JOIN_REQUEST_REJECTEDD, async () => {
          setAriaAssertiveNotification(
            "Your request to join has been rejected"
          );
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

        //should always be directly before canjoin;
        if (currentRoomRef.current === roomId) {
          setUp(socketInit);
          return;
        }
        const userCanJoin = await canJoinRoom(userId, roomId);
        setCanJoin(userCanJoin);
        setShowModalText(`room-${roomId}`);
      } catch (error) {
        console.log((error as Error).message);
      }
    })();
  }, []);

  useEffect(() => {
    const handlePopState = (event: any) => {
      try {
        event.preventDefault();
        navigateOutOfRoom();
        presentAlert({
          header: "Room Exit",
          message:
            "You have exited the room, You probably pressed a Back button but To close views click the close button (usually at the top right corner), to leave room click the switch button",
          backdropDismiss: false,
          buttons: [
            {
              text: "Ok",
              role: "destructive",
            },
          ],
        });
        return;
      } catch (error) {
        console.log(
          "Error handling pop / bak navigation",
          (error as Error).message
        );
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  async function setUp(socketInit: Socket) {
    setShowModalText("");
    await joinRoom(socketInit, { room: roomId, userId, userName, avatar });

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

    //handle new producers
    socketInit.on(
      BroadcastEvents.PRODUCER_PRODUCING,
      async (data: IProducerUser) => {
        setAriaPoliteNotification(`${data?.userName || "Participant"} joins`);
        await addConsumeProducerEventHandler(
          data,
          socketInit,
          consumerTransport,
          device,
          BroadcastEvents.PRODUCER_PRODUCING
        );
      }
    );

    //HANDLE PRODUCING DATA
    socketInit.on(
      BroadcastEvents.PRODUCER_PRODUCING_DATA,
      async (data: IProducerUser) => {
        if (!data.audioProducerId) return;
        const dataConsumer = await consumeData(
          data.dataProducerId as string,
          socketInit,
          consumerTransport,
          device,
          roomId
        );
        dataConsumer?.on("message", (data) => {
          handleDataProducerMessage(JSON.parse(data || JSON.stringify({})));
        });
        dataConsumersRef.current.push(dataConsumer);
      }
    );

    socketInit.on(
      BroadcastEvents.TOGGLE_PRODUCER_STATE,
      async (data: IProducerUser) => {
        await addConsumeProducerEventHandler(
          data,
          socketInit,
          consumerTransport,
          device,
          BroadcastEvents.PRODUCER_PRODUCING
        );
      }
    );

    // handle user reactions;
    socketInit.on(
      BroadcastEvents.USER_REACTION,
      async (data: IProducerUser & UserReactionsDTO) => {
        const reactionMsg = data.actionState
          ? `is ${data.action}`
          : `stopped ${data.action}`;
        setAriaPoliteNotification(
          `${data?.userName || "Participant"} ${reactionMsg}`
        );
        await addReRenderProducers(
          data,
          socketInit,
          BroadcastEvents.USER_REACTION,
          "rerender"
        );
      }
    );

    // closed producer
    socketInit.on(
      BroadcastEvents.PRODUCER_CLOSED,
      async (data: IProducerUser) => {
        setAriaPoliteNotification(`${data?.userName || "Participant"} left`);
        await addReRenderProducers(
          data,
          socketInit,
          BroadcastEvents.PRODUCER_CLOSED,
          "remove"
        );
      }
    );
    // handle leave room
    socketInit.on(BroadcastEvents.LEAVE_ROOM, async (data: IProducerUser) => {
      setAriaPoliteNotification(`Removed from room`);
      await navigateOutOfRoom();
    });

    // handle room context modifications
    socketInit.on(
      BroadcastEvents.ROOM_CONTEXT_MODIFICATION,
      async (data: IRoomContext & { payload: IRoomContext }) => {
        let actionText = "";
        console.log("modification event ", data.payload);
        if (data?.payload?.accessibilityPriority)
          actionText = `accessibilityPriority`;
        if (data?.payload?.specialPresenterSocketId)
          actionText = `Special Presenter`;
        setAriaPoliteNotification(actionText);
        const currentRoomContext = await new Promise((resolve) => {
          socketInit.emit(
            BroadcastEvents.GET_ROOM_CONTEXT,
            { room: roomId },
            resolve
          );
        });
        // if presenter was set;
        if (data.payload?.specialPresenterSocketId) {
          const presenterProducerUser = (producingStreamsRef.current || {})[
            data?.payload?.specialPresenterSocketId
          ];
          if (presenterProducerUser)
            setSpecialPresenterStream(presenterProducerUser);
          setOpenSpecialPresenter(true);
        }

        //Set captioning if accessibility priority is high
        if (data.payload.accessibilityPriority === AccessibilityPriority.HIGH) {
          if (!openCaptionsOverlay) setOpenCaptionsOverlay(true);
        }

        setRoomContext(currentRoomContext as IRoomContext);
      }
    );

    socketInit.on(
      BroadcastEvents.REQUEST_ACCESSIBLITY_PREFERENCE,
      (data: IProducerUser & { payload: AccessibilityPreferenceDTO }) => {
        presentAlert({
          header: `Accessibility Preference Request`,
          subHeader: `${data.userName} requests ${formatCamelCaseToSentence(
            Object.keys(data?.payload?.accessibilityPreferences || {}).join(
              ", "
            )
          )}`,
          buttons: [
            {
              role: "destructive",
              text: "Approve",
              handler: () => {
                socketInit.emit(
                  BroadcastEvents.ACCESSIBLITY_PREFERENCE_ACCEPTANCE,
                  data?.payload
                );
              },
            },
            {
              role: "destructive",
              text: "Reject",
              handler: () => {
                socketInit.emit(
                  BroadcastEvents.ACCESSIBLITY_PREFERENCE_REJECTION,
                  data?.payload
                );
              },
            },
          ],
        });
      }
    );

    // handle accessibility pref acceptance
    socketInit.on(
      BroadcastEvents.ACCESSIBLITY_PREFERENCE_ACCEPTANCE,
      (data: IProducerUser & { payload: AccessibilityPreferenceDTO }) => {
        setOpenRequestPopover(false);
        setAccessibilityPreferences({
          ...accessibilityPreferences,
          ...data.payload?.accessibilityPreferences,
        });
        setAriaAssertiveNotification(`Accessibility Preference Approved`);
      }
    );
    // handle accessibility pref acceptance
    socketInit.on(BroadcastEvents.ACCESSIBLITY_PREFERENCE_REJECTION, () => {
      setOpenRequestPopover(false);
      setAriaAssertiveNotification(`Accessibility Preference Approved`);
    });

    //-- handle screen sharing
    socketInit.on(
      BroadcastEvents.SCREEN_SHARING,
      async (data: IRoomContext) => {
        setAriaPoliteNotification(`${data?.sharerUserName} is sharing screen`);
        console.log("Screen shared", data);
        await consumeAndSetSharedScreen(
          data,
          socketInit,
          consumerTransport,
          device
        );
        setRoomContext(data);
      }
    );

    socketInit.on(
      BroadcastEvents.SCREEN_SHARING_STOPPED,
      (data: IRoomContext) => {
        //console.log("screen sharing stopped");
        setAriaPoliteNotification(
          `${data?.sharerUserName || "Participant"} stopped sharing screen`
        );
        setRoomContext(undefined);
        setScreenSharingStream(undefined);
      }
    );

    // handle chat messages
    socketInit.on(
      BroadcastEvents.CHAT_MESSAGE,
      async (data: IProducerUser & { payload: ChatMessageDTO }) => {
        const roomContext: IRoomContext = await new Promise((resolve) => {
          socketInit.emit(
            BroadcastEvents.GET_ROOM_CONTEXT,
            { room: roomId },
            resolve
          );
        });
        const chatMessageData: IRoomMessage = {
          message: data?.payload.message,
          senderSocketId: data?.payload.socketId as string,
          senderUserName: data?.userName,
        };
        if (
          roomContext?.accessibilityPriority === AccessibilityPriority.HIGH &&
          data?.payload?.usesTextualCommunication
        ) {
          //speak(data>.payload?.message);
          setRoomCaptions(chatMessageData);
          await speakText(data.payload?.message);
        }
        presentToast(chatMessageData.message, 4000);
        chatMessagesRef.current = [
          ...(chatMessagesRef.current || []),
          chatMessageData,
        ];
        setChatMessages(chatMessagesRef.current);
      }
    );

    let mediaStream = userMediaStreamRef.current;
    if (!userMediaStreamRef.current) {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      userMediaStreamRef.current = mediaStream;
    }

    await startProducing(
      producerTransport,
      mediaStream as MediaStream,
      producerAppDataRef.current
    );

    const dataProducer = await startProducingData(producerTransport);
    dataProducerRef.current = dataProducer;

    const roomContextData: IRoomContext = await new Promise((resolve) => {
      socketInit.emit(
        BroadcastEvents.GET_ROOM_CONTEXT,
        { room: roomId },
        resolve
      );
    });
    // auto turn on captioning if accessibility is set to high
    if (roomContextData?.accessibilityPriority === AccessibilityPriority.HIGH) {
      if (!openCaptionsOverlay) setOpenCaptionsOverlay(true);
    }
    setRoomContext(roomContextData);

    await consumeAllAndSetProducingStreams(
      socketInit,
      consumerTransport,
      device,
      roomId,
      roomContextData
    );

    await consumeAllDataProducers(socketInit, consumerTransport, device);

    //--- SCREEN SHARING
    if (roomContext?.isSharing && roomContext?.screenShareProducerId) {
      await consumeAndSetSharedScreen(
        roomContext,
        socketInit,
        consumerTransport,
        device
      );
    }

    // handle if user is a special presenter ie a sign language aid provider for the room
    if (canJoin?.isSpecialPresenter) {
      await setAsRoomSpecialPresenter(socketInit, roomId);
    }

    //AT END OF SETUP
    currentRoomRef.current = roomId;
  }

  async function consumeAllDataProducers(
    socket: Socket,
    consumerTransport: Transport,
    device: Device
  ) {
    const roomProducers = await getAllRoomProducers(socket, roomId);
    const roomUserDetails = Object.values(roomProducers || {});
    const promiseRes = await Promise.allSettled(
      roomUserDetails.map((user) =>
        consumeData(
          user.dataProducerId as string,
          socket,
          consumerTransport,
          device,
          roomId
        )
      )
    );

    promiseRes.forEach((res) => {
      if (res.status === "fulfilled") {
        res.value.on("message", (data) => {
          handleDataProducerMessage(JSON.parse(data || JSON.stringify({})));
        });
        dataConsumersRef.current.push(res.value);
      }
    });
  }
  async function setAsRoomSpecialPresenter(socket: Socket, room: string) {
    try {
      const data: IRoomContext = {
        room,
        hasSpecialPresenter: true,
        specialPresenterSocketId: socket.id,
      } as IRoomContext;
      await new Promise((resolve) => {
        socket.emit(BroadcastEvents.ROOM_CONTEXT_MODIFICATION, data, resolve);
      });
    } catch (error) {
      console.log("Error setting special presenter", (error as Error).message);
    }
  }

  function setRoomCaptions(captionMessage: IRoomMessage) {
    const overShoot = (roomSubtitleRef.current?.length || 0) - 100;
    let slicedSubtitles = roomSubtitleRef.current || [];
    if (overShoot >= 0) {
      slicedSubtitles = (roomSubtitleRef.current || []).slice(overShoot + 1);
    }
    roomSubtitleRef.current = [...slicedSubtitles, captionMessage];
    setSubTitles(roomSubtitleRef.current);
  }

  async function consumeAndSetSharedScreen(
    roomContextData: IRoomContext,
    socket: Socket,
    consumerTransport: Transport,
    device: Device
  ) {
    try {
      const track = await consume(
        `${roomContextData.screenShareProducerId}`,
        socket,
        consumerTransport,
        device,
        roomId
      );
      const stream = new MediaStream();
      stream.addTrack(track);
      setScreenSharingStream(stream);
    } catch (error) {
      console.log("Error handling shared screen", (error as Error).message);
    }
  }

  async function consumeAllAndSetProducingStreams(
    socketInit: Socket,
    consumerTransport: Transport,
    device: Device,
    room: string,
    roomContextInit: IRoomContext
  ) {
    const res = await consumeAllProducers(
      socketInit,
      consumerTransport,
      device,
      room
    );
    if (res) {
      const producerUserArr = Object.values(res.availableProducers);
      if (roomContextInit?.hasSpecialPresenter) {
        const specialPresenterUser = producerUserArr?.find(
          (pUser) =>
            pUser.socketId === roomContextInit?.specialPresenterSocketId
        );
        if (specialPresenterUser)
          setSpecialPresenterStream(specialPresenterUser);
      }
      setProducingStreams(producerUserArr);
      producingStreamsRef.current = res.availableProducers;
    }
  }

  async function handleDataProducerMessage(data: IDataMessageDTO) {
    console.log("data on CHAT MESSAGE", data);
    const sender = (
      producingStreamsRef.current as { [key: string]: IProducerUser }
    )[`${data?.socketId}`];
    const chatMessageData: IRoomMessage = {
      senderSocketId: data.socketId,
      senderUserName: sender?.userName,
      message: data.message,
    };
    setRoomCaptions(chatMessageData);
  }

  async function addConsumeProducerEventHandler(
    data: IProducerUser,
    socket: Socket,
    consumerTransport: Transport,
    device: Device,
    eventName: string
  ) {
    try {
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
    } catch (error) {
      console.log(
        `Error handling event ${eventName}`,
        (error as Error).message
      );
    }
  }

  async function addReRenderProducers(
    data: IProducerUser,
    socket: Socket,
    eventName: BroadcastEvents,
    action: "add" | "remove" | "rerender"
  ) {
    try {
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
        socket.emit(
          BroadcastEvents.REQUEST_TO_JOIN,
          { room: roomId, userName, avatar, userId },
          resolve
        );
      });
      if (!/success/.test(joinRes.status)) {
        await presentToast(`${joinRes.message}`, 3000);
        setShowModalText("");
        navigateOutOfRoom();
      }
    } catch (error) {
      console.log("Error requesting to join", (error as Error).message);
    }
  }

  function navigateOutOfRoom() {
    socketRef.current?.disconnect();
    setSocket(undefined);
    socketRef.current = undefined;
    stopMediaTracks(userMediaStreamRef.current as MediaStream);
    Object.values(producingStreamsRef.current || {}).forEach((producerUser) => {
      producerUser.mediaStream?.getTracks().forEach((track) => track.stop());
    });
    userMediaStreamRef.current = null;
    setConsumerTransport(null as unknown as Transport);
    setProducerTransport(null as unknown as Transport);
    setRoomContext(undefined);
    setDevice(null as unknown as Device);
    producerAppDataRef.current = null as unknown as IProducerAppData;
    currentRoomRef.current = "";
    dataConsumersRef.current = null as unknown as DataConsumer[];
    navigation.push("/conference/rooms");
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <Captioning
            dataProducerRef={dataProducerRef as MutableRefObject<DataProducer>}
            mediaStream={userMediaStreamRef.current as MediaStream}
            socketIdRef={socketIdRef as MutableRefObject<string>}
            room={roomId}
            setOpenCaptionsOverlay={setOpenCaptionsOverlay}
          />
          <IonButton
            ref={captionsTriggerRef as LegacyRef<HTMLIonButtonElement>}
            onClick={() => {
              setOpenCaptionsOverlay(!openCaptionsOverlay);
            }}
            fill="clear"
          >
            {openCaptionsOverlay ? "Hide Captions" : "Show Captions"}
          </IonButton>
          <IonText
            role="button"
            slot="end"
            id="room-menu-button"
            onClick={() => setOpenRoomMenuPopover(!openRoomMenuPopover)}
            aria-label="menu button"
          >
            <IonIcon icon={ellipsisVertical}></IonIcon>
          </IonText>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen style={{ minHeight: "60%" }}>
        <div
          style={{ position: "absolute", left: "-9999px" }}
          aria-hidden={false}
          aria-live="assertive"
        >
          {ariaAssertiveNotification}
        </div>
        <div
          style={{ position: "absolute", left: "-9998px" }}
          aria-hidden={false}
          aria-live="polite"
        >
          {ariaPoliteNotification}
        </div>
        <div>
          {roomContext?.isSharing ? (
            <div>
              <h4 className="sr-only">Screen is sharing</h4>
              <ConsumingVideo mediaStream={screenSharingStream} />
            </div>
          ) : (
            <></>
          )}
        </div>
        {!showModalText && <div className=""></div>}
        <IonGrid style={{ minHeight: "65%" }}>
          <IonRow>
            {producingStreams.length === 0 && (
              <IonCol size="12">
                <p>You are the only one in this meeting</p>
                <h6>
                  Please endeavour to be disability inclusive in all your
                  programs and activites - to pretect the rights of persons with
                  disabilities around the world.
                </h6>
                <h6>
                  You can start here by setting the accessibility priority of
                  this event,
                </h6>
                <div>
                  <ShareContent
                    contentName="DBC Conferencing Meeting"
                    contentDescription={`Use this link to join ${formatCamelCaseToSentence(
                      roomId
                    )}`}
                    contentUrl={`${AppBaseUrl}/conference/conference-room/${roomId}?userId=Anonymous`}
                  />
                </div>
              </IonCol>
            )}
            {producingStreams.map((p, i) => (
              <IonCol size="6" key={i}>
                <ConsumingVideo
                  key={i}
                  width={"100px"}
                  height={"100px"}
                  mediaStream={p.mediaStream}
                  producerUser={p}
                />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        <IonFooter>
          <IonToolbar>
            <IonItem>
              <div slot="start" style={{ width: "20%" }}>
                <CallVideo
                  socket={socket as Socket}
                  mediaStream={userMediaStreamRef.current as MediaStream}
                  room={roomId}
                  autoPlay
                  playsInline
                />
              </div>
              {openSpecialPresenter &&
                roomContext?.specialPresenterSocketId &&
                specialPresnterStream && (
                  <div slot="end" style={{ width: "20%" }}>
                    <IonItem>
                      <IonText
                        role="button"
                        slot="end"
                        className="icon-only"
                        onClick={() => {
                          if (
                            roomContext?.accessibilityPriority !==
                            AccessibilityPriority.HIGH
                          )
                            setOpenSpecialPresenter(false);
                          else
                            presentToast(
                              `Room Accessibility Priority is set to ${AccessibilityPriority.HIGH}, so you can not remove special presenters`,
                              4000
                            );
                        }}
                        aria-label="hide special presenter screen"
                      >
                        <IonIcon icon={close}></IonIcon>
                      </IonText>
                    </IonItem>
                    <ConsumingVideo
                      producerUser={specialPresnterStream}
                      mediaStream={specialPresnterStream?.mediaStream}
                    ></ConsumingVideo>
                  </div>
                )}
            </IonItem>
            <div
              style={{
                height: "48px",
                overflow: "auto",
              }}
            >
              {openCaptionsOverlay &&
                subTitles.map((subTitle, index) => (
                  <span key={index}>
                    <small>{subTitle.message} &nbsp; </small>
                  </span>
                ))}
            </div>
            <IonItem>
              <IonButton
                fill="clear"
                className="icon-only"
                onClick={async () => {
                  const data: ToggleProducerStateDTO = {
                    room: roomId,
                    action: audioTurnedOff ? "unMute" : "mute",
                  };
                  socket?.emit(BroadcastEvents.TOGGLE_PRODUCER_STATE, data);
                  toggleAudio(
                    producerAppDataRef,
                    setAudioTurnedOff,
                    userMediaStreamRef
                  );
                }}
                aria-label={audioTurnedOff ? "turn on audio" : "turn off audio"}
                size="large"
              >
                <IonIcon icon={audioTurnedOff ? micOff : mic}></IonIcon>
              </IonButton>
              <IonButton
                fill="clear"
                className="icon-only"
                onClick={() => {
                  const data: ToggleProducerStateDTO = {
                    room: roomId,
                    action: videoTurnedOff ? "turnOnVideo" : "turnOffVideo",
                  };
                  socket?.emit(BroadcastEvents.TOGGLE_PRODUCER_STATE, data);
                  toggleVIdeo(
                    producerAppDataRef,
                    setVideoTurnedOff,
                    userMediaStreamRef
                  );
                }}
                aria-label={audioTurnedOff ? "turn on video" : "turn off video"}
                size="large"
              >
                <IonIcon
                  icon={videoTurnedOff ? videocamOff : videocam}
                ></IonIcon>
              </IonButton>

              {/* <Captioning producerUsers={producingStreams} /> */}

              <IonButton
                fill="clear"
                className="icon-only"
                id="more-tools-toggler"
                onClick={() => setOpenMoreToolsOverlay(!openMoreToolsOverlay)}
                aria-label="open more tools"
                size="large"
              >
                <IonIcon icon={ellipsisHorizontal}></IonIcon>
              </IonButton>

              <IonButton
                color={"danger"}
                className="icon-only"
                aria-label="leave meeting"
                slot="end"
                onClick={navigateOutOfRoom}
                size="large"
              >
                <IonIcon color="light" icon={powerSharp}></IonIcon>
              </IonButton>
            </IonItem>
          </IonToolbar>
        </IonFooter>

        <IonModal
          isOpen={showModalText === `room-${roomId}`}
          onDidDismiss={() => setShowModalText("")}
          backdropDismiss={false}
        >
          <ProducingPage
            joinHandler={async () => {
              canJoin
                ? await setUp(socket as Socket)
                : await requestToJoin(socket as Socket);
            }}
            canJoin={canJoin ? true : false}
          />
        </IonModal>

        <IonPopover isOpen={openJoinRequestPopover}>
          <div>
            <IonItem>
              <IonAvatar slot="start">
                <img
                  src={requestToJoinUserData?.avatar}
                  alt={`${requestToJoinUserData?.userName}'s image`}
                />
              </IonAvatar>
              <IonLabel>
                <h4>Someone wants to join</h4>
                <p>{`${requestToJoinUserData?.userName} want's to join`}</p>
              </IonLabel>
            </IonItem>
            <div>
              <IonItem>
                <IonText
                  role="button destructive"
                  slot="end"
                  onClick={() => {
                    socket?.emit(
                      BroadcastEvents.JOIN_REQUEST_ACCEPTED,
                      requestToJoinUserData
                    );
                    setOpenJoinRequestPopover(false);
                    setRequestToJoinUserData(undefined);
                  }}
                >
                  Admit
                </IonText>
                <IonText
                  role="button destructive"
                  slot="end"
                  onClick={() => {
                    socket?.emit(
                      BroadcastEvents.JOIN_REQUEST_REJECTEDD,
                      requestToJoinUserData
                    );
                    setOpenJoinRequestPopover(false);
                    setRequestToJoinUserData(undefined);
                  }}
                >
                  Reject
                </IonText>
              </IonItem>
            </div>
          </div>
        </IonPopover>

        <IonPopover
          isOpen={openLastUserModal}
          onDidDismiss={() => setOpenLastUserModal(false)}
          title={lastUserReation}
        >
          <IonItem>
            <IonButton
              fill="clear"
              slot="end"
              className="icon-only"
              onClick={() => setOpenLastUserModal(false)}
              aria-label="close modal"
            >
              <IonIcon icon={closeCircle} />
            </IonButton>
          </IonItem>
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
        >
          <IonContent>
            
          <IonItem>
            <IonButton
              fill="clear"
              slot="end"
              className="icon-only"
              onClick={() => setOpenUsersModal(false)}
              aria-label="close modal"
            >
              <IonIcon icon={closeCircle} />
            </IonButton>
          </IonItem>
          <RoomParticipants
            roomParticipants={producingStreams}
            socket={socket as Socket}
            room={roomId}
            isAdmin={isAdmin}
            reactionType={lastUserReation}
          />
          </IonContent>
        </IonModal>

        <IonPopover
          isOpen={openReactionsActionSheet}
          onDidDismiss={() => setOpenReactionsActionSheet}
          title={`${socket ? "socket is true" : "no socket"}`}
        >
          <div>
            {Object.keys(userReactionsEmojis).map((reaction) => (
              <IonItem key={reaction}>
                <span
                  role="button"
                  slot="start"
                  style={{textTransform: "capitalize"}}
                  onClick={async () => {
                    const actionState = (
                      userReactionsState as { [key: string]: boolean }
                    )[reaction]
                      ? false
                      : true;
                    const data: UserReactionsDTO = {
                      room: roomId,
                      action: reaction as UserActions,
                      actionState,
                    };
                    try {
                      await new Promise((resolve) =>
                        socket?.emit(
                          BroadcastEvents.USER_REACTION,
                          data,
                          resolve
                        )
                      );
                      setOpenReactionsActionSheet(false);
                      setUserReactionsState({
                        ...userReactionsState,
                        [reaction]: actionState,
                      });
                    } catch (error) {
                      console.log((error as Error).message);
                    }
                  }}
                >
                  {formatCamelCaseToSentence(reaction)}
                </span>
                <IonText
                  role="button"
                  slot="end"
                  onClick={() => {
                    setOpenReactionsActionSheet(false);
                    setLastUserReaction(reaction as UserActions);
                    setOpenUsersModal(true);
                  }}
                >
                  <small>See People</small>
                </IonText>
              </IonItem>
            ))}
          </div>
        </IonPopover>

        <IonPopover
          isOpen={openRequestPopover}
          onDidDismiss={() => setOpenRequestPopover(false)}
        >
          <div>
            <h5>Request</h5>
            <small>Awaiting</small>
          </div>
        </IonPopover>

        <IonPopover
          isOpen={openRoomMenuPopover}
          trigger="room-menu-button"
          onDidDismiss={() => setOpenRoomMenuPopover(false)}
        >
          <RoomMenu socket={socket as Socket} room={roomId}></RoomMenu>
        </IonPopover>

        <IonModal
          isOpen={openChatMessagesModal}
          onDidDismiss={() => setOpenChatMessagesModal(false)}
        >
          <div>
            <IonItem>
              <IonTitle slot="start">Chat Messages</IonTitle>
              <IonText
                role="button destructive"
                slot="end"
                onClick={() => setOpenChatMessagesModal(false)}
                aria-label="close"
              >
                <IonIcon icon={closeCircle}></IonIcon>
              </IonText>
            </IonItem>
            <RoomMessages
              room={roomId}
              socket={socket as Socket}
              roomMessages={chatMessages}
              showInput={true}
            ></RoomMessages>
          </div>
        </IonModal>

        <IonPopover
          isOpen={openMoreToolsOverlay}
          onDidDismiss={() => setOpenMoreToolsOverlay(false)}
          // trigger="more-tools-toggler"
        >
          <div
            style={{
              width: "400px",
              padding: "10px",
              overflow: "auto",
              textAlign: "center",
            }}
          >
            <IonGrid>
              <IonRow>
                <IonCol size="3">
                  <IonText
                    onClick={() => {
                      setOpenReactionsActionSheet(!openReactionsActionSheet);
                      setOpenMoreToolsOverlay(false);
                    }}
                    role="button"
                    className=""
                    aria-label="react"
                    aria-haspopup={true}
                    aria-expanded={openReactionsActionSheet}
                  >
                    <IonIcon icon={caretForwardCircleSharp}></IonIcon>
                    <br /> <small>Reactions</small>
                  </IonText>
                </IonCol>

                <IonCol size="3">
                  <IonText
                    onClick={async () => {
                      try {
                        if (
                          !navigator.mediaDevices ||
                          !navigator.mediaDevices.getDisplayMedia
                        )
                          throw new Error(
                            "Your device does not support media sharing"
                          );
                        const screenShareStream =
                          await navigator.mediaDevices?.getDisplayMedia({
                            video: true,
                          });
                        const videoTrack =
                          screenShareStream.getVideoTracks()[0];
                        videoTrack.onended = () => {
                          const dto: CloseMediaDTO = {
                            isScreenSharing: true,
                            mediaKind: "video",
                            room: roomId,
                          };
                          socket?.emit(
                            BroadcastEvents.SCREEN_SHARING_STOPPED,
                            dto
                          );
                        };
                        await producerTransport?.produce({
                          track: videoTrack,
                          appData: { isScreenShare: true },
                        });
                        setOpenMoreToolsOverlay(false);
                      } catch (error) {
                        presentToast((error as Error).message, 3000);
                        console.log(
                          "Error sharing screen ",
                          (error as Error).message
                        );
                      }
                    }}
                    aria-label="share screen"
                  >
                    <IonIcon icon={cloudCircle}></IonIcon>
                    <br /> <small>Share Screen</small>
                  </IonText>
                </IonCol>

                <IonCol size="3">
                  <IonText
                    role="button"
                    onClick={() => {
                      setOpenChatMessagesModal(true);
                      setOpenMoreToolsOverlay(false);
                    }}
                    aria-label="chat messages"
                    className="icon-only"
                  >
                    <IonIcon icon={chatboxSharp}></IonIcon>
                    <br /> <small>Message</small>
                  </IonText>
                </IonCol>

                <IonCol size="3">
                  <IonText
                    role="button"
                    className="icon-only"
                    onClick={() => {
                      setOpenUsersModal(true);
                      setOpenMoreToolsOverlay(false);
                    }}
                    aria-label="show participants"
                  >
                    <IonIcon icon={peopleCircle}></IonIcon>
                    <br />{" "}
                    <small>
                      {" "}
                      Participants<sub>{producingStreams.length + 1}</sub>
                    </small>
                  </IonText>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
          <div>
            <IonText
              class="ion-margin"
              className="icon-only"
              aria-label="Share meeting link"
            >
              <ShareContent
                contentName="DBC Conferencing Meeting"
                contentDescription={`Use this link to join ${formatCamelCaseToSentence(
                  roomId
                )}`}
                contentUrl={`${AppBaseUrl}/conference/conference-room/${roomId}?userId=Anonymous`}
              />
            </IonText>
          </div>
        </IonPopover>
        <IonModal
          isOpen={pinnedProducerUser ? true : false}
          onDidDismiss={() => setPinnedProducerUser(null)}
        >
          <IonButton
            expand="full"
            fill="clear"
            onClick={() => setPinnedProducerUser(null)}
            aria-label="close zoomed user"
          >
            close{" "}
            <IonIcon
              className="ion-margin-horizontal"
              icon={closeCircle}
            ></IonIcon>
          </IonButton>
          <div style={{ justifyContent: "center", width: "400px" }}>
            <ConsumingVideo
              muted={true}
              producerUser={pinnedProducerUser as IProducerUser}
              mediaStream={pinnedProducerUser?.mediaStream}
            />
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default ConferenceRoom;
