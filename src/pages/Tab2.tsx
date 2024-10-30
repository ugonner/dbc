// import {
//   IonContent,
//   IonHeader,
//   IonPage,
//   IonTitle,
//   IonToolbar,
//   useIonToast,
// } from "@ionic/react";
// import ExploreContainer from "../components/ExploreContainer";
// import "./Tab2.css";
// import { useEffect, useState } from "react";
// import { io, Socket } from "socket.io-client";
// import MediaSoup, { Device } from "mediasoup-client";
// import { AppData, ConnectionState, Producer, Transport } from "mediasoup-client/lib/types";
// import { ClientEvents,  } from "../shared/enums/events.enum";
// import { IProducers } from "../shared/interfaces/socket-user";
// import { CallVideo } from "../components/video/CallVideo";
// import {
//   ProducingDTO,
// } from "../shared/dtos/requests/signals";
// import { consumeAllProducers } from "../utils/rtc/mediasoup/consuming";
// import { createDeviceAndTransports } from "../utils/rtc/mediasoup/create-device-transport";
// import { toggleAudio } from "../utils/rtc/mediasoup/functionalities";

// export interface IProducerStream {
//   producerId: string;
//   streamObject: MediaStream;
// }
// export interface IPBroadcastEventss {
//   [producerId: string]: IProducerStream;
// }

// const Tab2: React.FC = () => {
//   const [device, setDevice] = useState({} as Device);

//   const [consumerTransport, setConsumerTransport] = useState(
//     {} as MediaSoup.types.Transport<AppData>
//   );

//   const [producerTransport, setProducerTransport] = useState(
//     {} as MediaSoup.types.Transport<AppData>
//   );

//   const [producers, setProducers] = useState({} as IProducers);
//   const [pBroadcastEventss, setPBroadcastEventss] = useState(
//     {} as IPBroadcastEventss
//   );
//   const [socket, setSocket] = useState({} as Socket);
//   const room = "videoCall";
//   const [audioTrackProducer, setAudeoTrackProducer] = useState({} as Producer)
//   const [videoTrackProducer, setVideoTrackProducer] = useState({} as Producer);

//   const [takeAudio, setTakeAudio] = useState(true)
//   const [takeVideo, setTakeVideo] = useState(true)

//   const [presentToast] = useIonToast(); 
//   useEffect(() => {
//     (async () => {
//       try {
//         const socketInit = io("http://localhost:3001/call");

//         await joinRoom(socketInit);
//         const {device, consumerTransport, producerTransport} = await createDeviceAndTransports(socketInit,room);
//         setProducerTransport(producerTransport);
//         await setProducerAndStreams(socketInit, consumerTransport, device, room)
//         handleNewProducer(socketInit, consumerTransport, device);
//         handleClosedProducer(socketInit, consumerTransport, device);
//         setSocket(socketInit);
//       } catch (error) {
//         console.log((error as Error).message);
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     attachStreamToProducerVideoElements(pBroadcastEventss);
//   }, [pBroadcastEventss]);

//   async function setProducerAndStreams(socketInit: Socket, consumerTransport: Transport, device: Device, room: string){
//     const res = await consumeAllProducers(socketInit, consumerTransport, device, room);
//         if(res){
//           setPBroadcastEventss(res.producerStreams);
//           setProducers(res.availableProducers);
//         }
//   }
//   async function joinRoom(socket: Socket) {
//     return await new Promise((resolve) => {
//       socket.emit(ClientEvents.JOIN_ROOM, { room, userId: "1" }, resolve);
//     });
//   }

//   const [userMediaStream, setUserMediaStream] = useState({} as MediaStream)
//   async function startProducing(sendingTransport: MediaSoup.types.Transport, mediaTrackState: {
//     takeAudio: boolean;
//     takeVideo: boolean
//   } = {takeAudio: true, takeVideo: true}
// ) {
//     try {
//       const mediaStream = await navigator.mediaDevices.getUserMedia({
//         video: mediaTrackState.takeAudio,
//         audio: mediaTrackState.takeVideo,
//       });
//       setUserMediaStream(mediaStream);
   
//       const videoElem = document.getElementById("my-video");
//       (videoElem as HTMLVideoElement).srcObject = mediaStream;
//       const videoTrack = mediaStream.getVideoTracks()[0];
//       const audioTrack = mediaStream.getAudioTracks()[0];
//       //const audioProducer = await sendingTransport.produce({ track: videoTrack });
//       const videoProducer = await sendingTransport.produce({ track: videoTrack });
//       //setAudeoTrackProducer(audioProducer);
//       setVideoTrackProducer(videoProducer);
//     } catch (error) {
//       console.log((error as Error).message);
//       presentToast({
//         message:
//           "Unable to produce from your media devices, your devices might be in use y other applications",
//         duration: 3000,
//         position: "top",
//       });
//     }
//   }

//   function handleNewProducer(socket: Socket, consumerTransport: Transport, device: Device) {
//     try {
//       socket.on(ServerEvents.PRODUCER_PRODUCING,  (data: ProducingDTO) => {
//         setProducerAndStreams(socket, consumerTransport, device, room)
//         .catch((err) => console.log("Error handling new producer; Re-Consuming all", err.message))
//       });
//     } catch (error) {
//       console.log((error as Error).message);
//       presentToast({
//         message: "Unable to process new participant",
//         duration: 3000,
//         position: "top",
//       });
//     }
//   }

//   function handleClosedProducer(socket: Socket, consumerTransport: Transport, device: Device) {
//     socket.on(ServerEvents.PRODUCER_CLOSED, (data: ProducingDTO) => {
//       setProducerAndStreams(socket, consumerTransport, device, room)
//       .catch((err) => console.log("Error re-consuming all producers on new producer rvent", err.message))
//     });
//   }

//   function attachStreamToProducerVideoElements(
//     producerObject: IPBroadcastEventss
//   ) {
//     try {
//       Object.values(producerObject).forEach((p) => {
//         const videoElement: HTMLVideoElement = document.getElementById(
//           p.producerId
//         ) as HTMLVideoElement;
//         if (!videoElement) {
//           console.log("no souch element found");
//           return;
//         }
//         videoElement.srcObject = p.streamObject;
//       });
//     } catch (error) {
//       console.log((error as Error).message);
//       presentToast({
//         message: "Unable to display retrieved streams in view",
//         duration: 3000,
//         position: "top",
//       });
//     }
//   }

//   return (
//     <IonPage>
//       <IonHeader>
//         <IonToolbar>
//           <IonTitle>Conference Room</IonTitle>
//         </IonToolbar>
//       </IonHeader>
//       <IonContent fullscreen>
//         <IonHeader collapse="condense">
//           <IonToolbar>
//             <IonTitle size="large">Tab 2</IonTitle>
//           </IonToolbar>
//         </IonHeader>
//         <ExploreContainer name="Tab 2 page" />
//         <div>
//           <button onClick={async () => await startProducing(producerTransport)}>
//             Start proucing
//           </button>
//           <br />
//           <button onClick={() => consumeAllProducers(socket, consumerTransport, device, room)}>
//             consume All
//           </button>
//           <br />
          
//           <button onClick={async () => toggleAudio(userMediaStream)}>
//             Toggle Audio
//           </button>
//           <br/>
          
//           <button onClick={async () => userMediaStream.getVideoTracks()[0].enabled = !(userMediaStream.getVideoTracks()[0].enabled) }>
//             Toggle Video
//           </button>

//         </div>
//         <div className="">
//           <video id="my-video" autoPlay playsInline></video>
//         </div>
//         {Object.keys(pBroadcastEventss).map((p) => (
//           <CallVideo key={p} id={p} autoPlay playsInline />
//         ))}
//       </IonContent>
//     </IonPage>
//   );
// };

// export default Tab2;
const Tab2 = () => {
  return (
    <></>
  )
}
export default Tab2
