import {
  IonButton,
  IonContent,
  IonDatetimeButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import {
  AuthGuardContextProvider,
  useAuthGuardContextStore,
} from "../contexts/auth/AuthGuardContext";
import { Dispatch, PropsWithChildren, useState } from "react";
import { LoginOrRegister } from "../components/auth/LoginOrRegister";
import { flash, logInSharp, logOutSharp, powerSharp } from "ionicons/icons";
import { App } from "@capacitor/app";

export interface IAuthLayoutProps extends PropsWithChildren {
  pageTitle?: string;
}
export const AuthLayout = ({ pageTitle, children }: IAuthLayoutProps) => {
  const [presentAlert] = useIonAlert();
  const { isLoggedIn, setIsLoggedIn, openAuthModal, setOpenAuthModal } =
    useAuthGuardContextStore();
  const [openEventModal, setOpenEventModal] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false as boolean & Dispatch<boolean>);
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle slot="start">
            <IonIcon
              role="button"
              aria-label="exit app"
              icon={powerSharp}
              color="danger"
              size="large"
              className="ion-margin-horizontal"
              onClick={() => {
                presentAlert({
                  header: "Exit App",
                  message: "Are you sure you want to exit?",
                  buttons: [
                    {
                      text: "No",
                      role: "cancel"
                    },
                    {
                      text: "Exit",
                      handler: () => App.exitApp(),
                      role: "destructive"
                    }
                  ]
                })
              }}
            ></IonIcon>
            {pageTitle ? pageTitle : ""}
          </IonTitle>

          <IonButton
            slot="end"
            fill="clear"
            aria-label={isLoggedIn ? "log out" : "log in"}
            onClick={() => {
              if (isLoggedIn) logout();
              //else setShowModalText("login-or-register-modal");
              setOpenAuthModal(!openAuthModal as boolean & Dispatch<boolean>);
            }}
          >
            {isLoggedIn ? (
              <IonIcon icon={logOutSharp}></IonIcon>
            ) : (
              <IonIcon icon={logInSharp}></IonIcon>
            )}
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {children}
      </IonContent>

      <IonModal isOpen={openAuthModal}>
        <LoginOrRegister
          onSuccess={() =>
            setOpenAuthModal(false as boolean & Dispatch<boolean>)
          }
        />
      </IonModal>
    </IonPage>
  );
};
