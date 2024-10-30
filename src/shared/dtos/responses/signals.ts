import MediaSoup from 'mediasoup-client';

export interface CreatedTransportDTO {
    id: string;
    iceParameters: MediaSoup.types.IceParameters;
    iceCandidates: MediaSoup.types.IceCandidate[];
    dtlsParameters: MediaSoup.types.DtlsParameters;
}

export interface CreatedConsumerDTO {
    id: string;
    producerId: string;
    rtpParameters: MediaSoup.types.RtpParameters;
    kind: MediaSoup.types.MediaKind;
}
export interface IProducerUser {
    videoProducerId: string;
    audioProducerId: string;
    userId: string;
    name?: string;
}
export interface IProducersDTO {
    [socketId: string]: IProducerUser
}

export interface ToggleProducerStateDTO {
    room: string;
    action: "mute" | "unMute" | "turnOffVideo" | "turnOnVideo";
    socketId?: string;
}