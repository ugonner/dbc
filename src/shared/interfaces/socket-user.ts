export interface IProducerUser {
  userId?: string;
  videoProducerId?: string;
  audioProducerId?: string;
  socketId: string;
  isAudioTurnedOff: boolean;
  isVideoTurnedOff: boolean;
  userName?: string;
  mediaStream: MediaStream;
}

export interface IProducers {
  [socketId: string]: IProducerUser
}