import React, { createContext, Dispatch, SetStateAction, useContext, useState } from "react";
import { ComponentModal } from "../utils/components/modals/ComponentModal";
import { LoaderModal } from "../utils/components/modals/LoaderModal";

export interface ILoadingProps {
    isLoading: boolean;
    loadingMessage: string;
}

export interface IErrorProps {
    isError: boolean;
    errorMessage: string;
    errorDismissal?: Function
}
export interface IAsyncProps {
    loading: ILoadingProps
    setLoading: SetStateAction<Dispatch<ILoadingProps>>;
    error: IErrorProps;
    setError: SetStateAction<Dispatch<IErrorProps>>;
}

const AsyncContext: React.Context<IAsyncProps> = createContext({} as IAsyncProps);

export const AsyncHelperProvider = ({children}: React.PropsWithChildren) => {
    const [loading, setLoading] = useState<ILoadingProps>({isLoading: false, loadingMessage: ""});
    const [error, setError] = useState<IErrorProps>({isError: false, errorMessage: ""});
    const initAsyncHelperProps: IAsyncProps = {
        error,
        setError,
        loading,
        setLoading
    };

    return (
        <AsyncContext.Provider value={initAsyncHelperProps}>
            {children}
            <ComponentModal
            showModalText={`loader-modal`}
            modalTitle={loading.loadingMessage}
            modalBody={<LoaderModal />}
            />
            <ComponentModal
            showModalText="error-modal"
            modalTitle={`${error.errorMessage}`}
            modalBody={<div></div>}
            />
            
        </AsyncContext.Provider>
    )
}

export const useAsyncHelpersContext = () => useContext(AsyncContext);
