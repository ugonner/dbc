import MediaSoup from "mediasoup-client";
import { IProfile } from "../../interfaces/user";

export interface JoinRoomDTO {
    userId: string;
    room: string;
    userName: string;
    avatar: string;
}

export interface getRouterRTCCapabilitiesDTO{
    room: string;
}
export interface createTransportDTO {
    isProducer: boolean;
    room: string;
}

export interface ConnectTransportDTO {
    dtlsParameters: MediaSoup.types.DtlsParameters;
    transportId: string;
    room: string;
    isProducer: boolean;
}

export interface CreateProducerDTO{
    rtpParameters: MediaSoup.types.RtpParameters;
    kind: MediaSoup.types.MediaKind;
    transportId: string;
    room: string;
    mediaKind: "audio" | "video";
    isAudioTurnedOff: boolean;
    isVideoTurnedOff: boolean;
}

export interface CreateConsumerDTO {
    rtpCapabilities: MediaSoup.types.RtpCapabilities;
    producerId: string;
    transportId: string;
    room: string;
}

export interface ProducingDTO{
    producerId: string;
    userId: string;
}

export interface PublishProducerDTO{
    producerId: string;
    userId: string;
    room: string;
    socketId?: string;
}

export interface RequestPermissionDTO extends IProfile {
    producerId?: string;
}