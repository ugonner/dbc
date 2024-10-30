import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { ellipse, square, triangle } from "ionicons/icons";
import Tab1 from "./pages/Tab1";
import Tab2 from "./pages/Tab2";
import { ConferenceTab } from "./pages/ConferenceTab";

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
import { ProducingPage } from "./pages/video-conferencing/ProducingPage";
import ConferenceRoom from "./pages/video-conferencing/ConferenceRoom";
import { ModalContextProvider } from "./utils/contexts/overlays/ModalContextProvider";
import { AsyncHelperProvider, useAsyncHelpersContext } from "./contexts/async-helpers";
import { ComponentModal } from "./utils/components/modals/ComponentModal";
import { Loader } from "./components/Loader";

setupIonicReact();

const App: React.FC = () => (

  <IonApp>
    <RTCToolsProvider>
      <ModalContextProvider>
        <AsyncHelperProvider>
          <IonReactRouter>
            <IonTabs>
              <IonRouterOutlet>
                <Route path="/law/:id">
                  <Tab1 />
                </Route>
                <Route exact path="/hub">
                  <Tab2 />
                </Route>

                <Route path={"/:tab(conference)/rooms"} component={Rooms} />
                <Route
                  path={"/:tab(conference)/room/:roomId"}
                  component={ProducingPage}
                />
                <Route
                  path={"/:tab(conference)/conference-room/:roomId"}
                  component={ConferenceRoom}
                />

                <Route exact path="/">
                  <Redirect to="/law/ugonna" />
                </Route>
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="law" href="/law/bona">
                  <IonIcon aria-hidden="true" icon={triangle} />
                  <IonLabel>Law</IonLabel>
                </IonTabButton>
                <IonTabButton tab="hub" href="/hub">
                  <IonIcon aria-hidden="true" icon={ellipse} />
                  <IonLabel>Hub</IonLabel>
                </IonTabButton>
                <IonTabButton tab="conference" href="/conference/rooms">
                  <IonIcon aria-hidden="true" icon={square} />
                  <IonLabel>Conference</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </IonReactRouter>
            
        </AsyncHelperProvider>
      </ModalContextProvider>
    </RTCToolsProvider>
  </IonApp>

);

export default App;
