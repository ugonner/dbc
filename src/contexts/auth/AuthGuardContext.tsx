import { IonModal, IonPopover, useIonRouter } from "@ionic/react";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { LoginOrRegister } from "../../components/auth/LoginOrRegister";
import { ComponentModal } from "../../utils/components/modals/ComponentModal";

export interface IAuthContextProps {
    isLoggedIn: boolean;
    setIsLoggedIn: SetStateAction<Dispatch<boolean>>;
    openAuthModal: boolean;
    setOpenAuthModal: SetStateAction<Dispatch<boolean>>;
}

const AuthGuardContext = createContext<IAuthContextProps>({} as IAuthContextProps);
export const AuthGuardContextProvider = ({children}: React.PropsWithChildren) => {
    const accessToken = localStorage.getItem("token") || "";
    const storedRefreshToken = localStorage.getItem("refreshToken") || "";
    const [isLoggedIn, setIsLoggedIn] = useState(accessToken ? true : false);
    
    const [openAuthModal, setOpenAuthModal] = useState(false);
    useEffect(() => {
        if(!isLoggedIn) setOpenAuthModal(true);
    }, [isLoggedIn])

    const initAuthContextProps: IAuthContextProps = {
        isLoggedIn,
        setIsLoggedIn,
        openAuthModal,
        setOpenAuthModal
    };

  return (
    <AuthGuardContext.Provider value={initAuthContextProps}>
        {children}
        <IonPopover isOpen={openAuthModal}>
            <LoginOrRegister />
        </IonPopover>
        {/* <ComponentModal
        showModalText="login-or-register-modal"
        modalTitle="Welcome Dear"
        modalBody={<LoginOrRegister />}
        /> */}
        
    </AuthGuardContext.Provider>
  )
}
export const useAuthGuardContextStore = () => useContext(AuthGuardContext);