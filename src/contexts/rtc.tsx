import { Device } from "mediasoup-client";
import { Producer, Transport } from "mediasoup-client/lib/types";
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState, useSyncExternalStore } from "react";
import { Socket } from "socket.io-client";

export interface IRTCTools {
    socket: Socket;
    setSocket: SetStateAction<Dispatch<Socket>>;
    device: Device;
    setDevice: SetStateAction<Dispatch<Device>>;
    consumerTransport: Transport;
    setProducerTransport: SetStateAction<Dispatch<Transport>>;
    producerTransport: Transport;
    setConsumerTransport: SetStateAction<Dispatch<Transport>>;
    videoProducer?: Producer;
    setVideoProducer: SetStateAction<Dispatch<Producer>>;
    audioProducer?: Producer;
    setAudioProducer: SetStateAction<Dispatch<Producer>>;
    userMediaStream: MediaStream;
    setUserMediaStream: SetStateAction<Dispatch<MediaStream>>;
    videoTurnedOff: boolean;
    setVideoTurnedOff: SetStateAction<Dispatch<boolean>>;
    audioTurnedOff: boolean;
    setAudioTurnedOff: SetStateAction<Dispatch<boolean>>;
    
}

export const RTCToolsContext = createContext({} as unknown as IRTCTools)

export const RTCToolsProvider = ({children}: PropsWithChildren) => {
    const [socket, setSocket] = useState({} as Socket);
    const [device, setDevice] = useState({} as Device);
    const [producerTransport, setProducerTransport] = useState({} as Transport);
    const [consumerTransport, setConsumerTransport] = useState({} as Transport);
    const [videoProducer, setVideoProducer] = useState({} as Producer);
    const [audioProducer, setAudioProducer] = useState({} as Producer);
    
    const [audioTurnedOff, setAudioTurnedOff] = useState(false);
    const [videoTurnedOff, setVideoTurnedOff] = useState(false);

    const [userMediaStream, setUserMediaStream] = useState({} as MediaStream)

    const initRTCTools: IRTCTools = {
        socket, setSocket, device, setDevice, producerTransport, setProducerTransport, consumerTransport, setConsumerTransport, videoProducer, setVideoProducer,audioProducer, setAudioProducer,  userMediaStream, setUserMediaStream, audioTurnedOff, setAudioTurnedOff, videoTurnedOff, setVideoTurnedOff
    };
    
    return (
        <RTCToolsContext.Provider value={initRTCTools}>{children}</RTCToolsContext.Provider>
    )
}
export const useRTCToolsContextStore = () => useContext(RTCToolsContext);