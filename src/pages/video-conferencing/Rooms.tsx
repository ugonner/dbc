import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import ExploreContainer from "../../components/ExploreContainer";
import { useEffect, useState } from "react";
import { IRoom } from "../../shared/interfaces/room";
import { APIBaseURL, getData } from "../../api/base";
import { AuthGuardContextProvider } from "../../contexts/auth/AuthGuardContext";
import { AuthLayout } from "../../layouts/AuthLayout";
import { CreateEventsFAB } from "../../components/events/CreteEventsFAB";

export const Rooms: React.FC = () => {
  const [presentToast] = useIonToast();
  const [rooms, setRooms] = useState([] as IRoom[]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getData<IRoom[]>(`${APIBaseURL}/room`, {
          invitees: "userId",
        });
        setRooms(res);
      } catch (error) {
        console.log("Error fetching", error as Error);
        presentToast("Error fetching your meetings");
      }
    })();
  }, []);

  return (
    <AuthGuardContextProvider>
      <AuthLayout pageTitle="Conference Events">
        <div>
          {rooms.length > 0 &&
            rooms.map((room) => (
              <div key={room.id}>
                <IonItem>
                  <IonLabel>{room.roomId}</IonLabel>
                  <IonButton
                    slot="end"
                    routerLink={`/conference/conference-room/${room.roomId}`}
                  >
                    Join
                  </IonButton>
                </IonItem>
              </div>
            ))}
        </div>
        <CreateEventsFAB />
      </AuthLayout>
    </AuthGuardContextProvider>
  );
};

export default Rooms;