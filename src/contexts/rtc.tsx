import { Device } from "mediasoup-client";
import { Producer, Transport } from "mediasoup-client/lib/types";
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState, useSyncExternalStore } from "react";
import { Socket } from "socket.io-client";
import { IUserReactions, UserActions } from "../shared/interfaces/socket-user";
import { BroadcastEvents } from "../shared/enums/events.enum";

export interface IRTCTools {
    socket: Socket | undefined;
    setSocket: Dispatch<SetStateAction<Socket | undefined>>;
    device: Device;
    setDevice: Dispatch<SetStateAction<Device>>;
    consumerTransport: Transport | undefined;
    setProducerTransport: Dispatch<SetStateAction<Transport | undefined>>;
    producerTransport: Transport | undefined;
    setConsumerTransport: Dispatch<SetStateAction<Transport | undefined>>;
    videoProducer?: Producer;
    setVideoProducer: Dispatch<SetStateAction<Producer>>;
    audioProducer?: Producer;
    setAudioProducer: Dispatch<SetStateAction<Producer>>;
    userMediaStream: MediaStream | undefined;
    setUserMediaStream: Dispatch<SetStateAction<MediaStream | undefined>>;
    videoTurnedOff: boolean;
    setVideoTurnedOff: Dispatch<SetStateAction<boolean>>;
    audioTurnedOff: boolean;
    setAudioTurnedOff: Dispatch<SetStateAction<boolean>>;
    userReactionsState: IUserReactions,
    setUserReactionsState: Dispatch<SetStateAction<IUserReactions>>
    
}

export const RTCToolsContext = createContext({} as unknown as IRTCTools)

export const RTCToolsProvider = ({children}: PropsWithChildren) => {
    const [socket, setSocket] = useState<Socket>();
    const [device, setDevice] = useState({} as Device);
    const [producerTransport, setProducerTransport] = useState<Transport>();
    const [consumerTransport, setConsumerTransport] = useState<Transport>();
    const [videoProducer, setVideoProducer] = useState({} as Producer);
    const [audioProducer, setAudioProducer] = useState({} as Producer);
    
    const [audioTurnedOff, setAudioTurnedOff] = useState(false);
    const [videoTurnedOff, setVideoTurnedOff] = useState(false);

    const [userMediaStream, setUserMediaStream] = useState<MediaStream>()
    const [userReactionsState, setUserReactionsState] = useState<IUserReactions>({})
    const initRTCTools: IRTCTools = {
        socket, setSocket, device, setDevice, producerTransport, setProducerTransport, consumerTransport, setConsumerTransport, videoProducer, setVideoProducer,audioProducer, setAudioProducer,  userMediaStream, setUserMediaStream, audioTurnedOff, setAudioTurnedOff, videoTurnedOff, setVideoTurnedOff, userReactionsState, setUserReactionsState
    };
    
    return (
        <RTCToolsContext.Provider value={initRTCTools}>{children}</RTCToolsContext.Provider>
    )
}
export const useRTCToolsContextStore = () => useContext(RTCToolsContext);