import { App } from "@capacitor/app";
import { PropsWithChildren, useEffect } from "react";
import { AppBaseUrl } from "../api/base";

export const BaseLayout = ({ children }: PropsWithChildren) => {
    useEffect(() => {
    try {
      App.addListener("appUrlOpen", (event) => {
        const routeUrl = event.url.replace(`${AppBaseUrl}/conference`, "");
        window.location.href = routeUrl;
      });
    } catch (error) {
      alert((error as Error).message);
    }
  }, []);

  return (
    <>
      {children}
    </>
  );
};
