export interface IProducerUser {
  userId?: string;
  producerId?: string;
  userName?: string;
}

export interface IProducers {
  [producerId: string]: IProducerUser
}
