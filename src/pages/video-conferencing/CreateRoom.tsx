import { FormEvent, FormEventHandler, useState } from "react";
import { IRoom } from "../../shared/interfaces/room";
import { AuthGuardContextProvider } from "../../contexts/auth/AuthGuardContext";
import { AuthLayout } from "../../layouts/AuthLayout";
import {
  DatetimeChangeEventDetail,
  DatetimeCustomEvent,
  IonButton,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  SelectCustomEvent,
} from "@ionic/react";
import { APIBaseURL, postData } from "../../api/base";

export interface ICreateRoomProps {
  roomType?: "instant" | "scheduled";
}

export const CreateRoom = ({ roomType }: ICreateRoomProps) => {
  const [room, setRoom] = useState({} as IRoom);

  const handleCustomInput = (
    evt:
      | DatetimeCustomEvent
      | SelectCustomEvent
      | FormEvent<HTMLIonInputElement>
  ) => {
    const { name, value } = (evt as FormEvent<HTMLIonInputElement>)
      .currentTarget;
    alert("name " + name + " VALUE " + value);
    setRoom({ ...room, [name]: value });
  };

  const createEvent = async () => {
    try {
      alert(JSON.stringify(room));

      const res = await postData(`${APIBaseURL}/room`, {
        method: "post",
        ...room,
      });
    } catch (error) {
      console.log("Error creating event room", (error as Error).message);
    }
  };
  return (
    <>
      <IonHeader>
        <IonTitle> Create Meeting </IonTitle>
      </IonHeader>
      <IonContent>
        <div className="form-grop">
          <form>
            <IonItem className="no-lines">
              <IonInput
                type="text"
                name="roomName"
                label="name"
                labelPlacement="floating"
                placeholder="My Meeting"
                onInput={handleCustomInput}
              />
            </IonItem>

            <IonItem className="no-lines">
              <IonLabel>Start Time</IonLabel>
              <IonDatetimeButton datetime="event-start-time"></IonDatetimeButton>
            </IonItem>

            <IonModal keepContentsMounted={true}>
              <IonDatetime
                id="event-start-time"
                name="startTime"
                aria-label="Select start date for the event"
                onIonChange={handleCustomInput}
              ></IonDatetime>
            </IonModal>

            <IonItem className="no-lines">
              <IonSelect
                name="duration"
                value={5}
                onIonChange={handleCustomInput}
                label="Event Duration"
                labelPlacement="stacked"
              >
                {[5, 10, 15, 20, 30].map((durationTime, i) => (
                  <IonSelectOption key={i} value={durationTime}>
                    {durationTime} minutes{" "}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem className="no-lines">
              <IonButton expand="full" onClick={createEvent}>
                Create Event
              </IonButton>
            </IonItem>
          </form>
        </div>
      </IonContent>
    </>
  );
};
