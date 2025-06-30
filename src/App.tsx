import { Redirect, Route, useHistory } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";
import { RTCToolsProvider } from "./contexts/rtc";
import Rooms from "./pages/video-conferencing/Rooms";
import ConferenceRoom from "./pages/video-conferencing/ConferenceRoom";
import {
  AsyncHelperProvider,
  useAsyncHelpersContext,
} from "./contexts/async-helpers";

import { AdminBoard } from "./pages/admin/AdminBoard";
import { BaseLayout } from "./layouts/BaseLayout";

setupIonicReact();

const App: React.FC = () => {
  return (
  <IonApp>
    <RTCToolsProvider>
      <AsyncHelperProvider>
        <BaseLayout>
        
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path={"/conference/rooms"} component={Rooms} />

            <Route
            path={"/conference-room/:roomId"}
              component={ConferenceRoom}
            />
            <Route
            path={"/conference/conference-room/:roomId"}
              component={ConferenceRoom}
            />

            <Route exact path="/">
              <Redirect to="/conference/rooms" />
            </Route>
            <Route exact path={"/admin"} component={AdminBoard}></Route>
           <Redirect to="/conference/rooms" />
           
          </IonRouterOutlet>
        </IonReactRouter>
        </BaseLayout>
      </AsyncHelperProvider>
    </RTCToolsProvider>
  </IonApp>
);
}

export default App;
