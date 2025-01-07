import React from "react";
import AuthStore from '../../../auth/contexts/auth'

export const ApiContextStore = {AuthStore}

export const ApiContextProvider = ({children}: React.PropsWithChildren) => {


    const ApiContext = React.createContext(ApiContextStore)


    return (
        <ApiContext.Provider value={ApiContextStore}>
            {children}
        </ApiContext.Provider>
    )
}