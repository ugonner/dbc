import React, { Children, createContext, useContext, useState } from "react";

export interface ILoader {
    showLoader: boolean;
    loaderText?: string;
}
export interface IModalContextStore {
    setShowModalText: React.Dispatch<React.SetStateAction<string>>;
    showModalText: string;
    setShowPopoverId: React.Dispatch<React.SetStateAction<string>>;
    showPopoverId: string;
    setLoader: React.Dispatch<React.SetStateAction<ILoader>>;
    loader: ILoader;
}
const ModalContext = createContext({} as IModalContextStore);

export const ModalContextProvider = ({children}: React.PropsWithChildren) => {
    const [showModalText, setShowModalText] = useState("");
    const [showPopoverId, setShowPopoverId] = useState("");
    const [loader, setLoader] = useState({showLoader: false, loaderText: "loading"} as ILoader);

    return (
        <ModalContext.Provider value={{showModalText, setShowModalText, setShowPopoverId, showPopoverId, loader, setLoader}}>
            {children}
        </ModalContext.Provider>
    )
}

export const useModalContextStore = () => useContext(ModalContext)