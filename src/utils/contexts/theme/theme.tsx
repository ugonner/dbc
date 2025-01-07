import React, { PropsWithChildren, SetStateAction, useContext, useState } from "react";

export interface ITheme {
    tableThemeCssClass: string;
    themeCssClass: string; 
}
export interface IThemeContext {
    themeCssClass: string;
    setThemeCssClass: React.Dispatch<SetStateAction<string>>
    tableThemeCssClass: string;
    setTableThemeCssClass: React.Dispatch<SetStateAction<string>>
}

const themeContext = React.createContext({} as IThemeContext);

export const ThemeContextProvider = ({children}: PropsWithChildren) => {
    const themeData: ITheme = JSON.parse((`${localStorage.getItem("themeData")}`));
    const [themeCssClass, setThemeCssClass] = useState((themeData?.themeCssClass ?? "bg-dark text-light") as string);
    const [tableThemeCssClass, setTableThemeCssClass] = useState((themeData?.tableThemeCssClass ?? "table-dark text-light") as string);
    return (
        <themeContext.Provider value={{themeCssClass, setThemeCssClass, tableThemeCssClass, setTableThemeCssClass}}>{children}</themeContext.Provider>
    )
}

export const useThemeContextStore = () => useContext(themeContext);
