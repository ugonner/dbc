import { useIonToast } from "@ionic/react";

export  const isObjectEmpty = (obj: object) => Object.keys(obj).length === 0;

export function presentToast(message: string){
    const [presentToastMessage] = useIonToast()
    presentToastMessage({message, duration: 3000, position: "top"});
}