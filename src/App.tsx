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
import { ellipse, phonePortrait, square, triangle } from "ionicons/icons";

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
import { AdminBoard } from "./pages/admin/AdminBoard";
import { Chats } from "./pages/talkable/Chats";
import { TalkableHome } from "./pages/talkable/TalkableHome";
import { ChatRoomPage } from "./pages/talkable/ChatRoomPage";
import { TalkableContextProvider } from "./contexts/talkables/talkable";

setupIonicReact();

const App: React.FC = () => (

  <IonApp>
    <RTCToolsProvider>
      <ModalContextProvider>
        <AsyncHelperProvider>
          <IonReactRouter>
              
            <IonTabs>
              <IonRouterOutlet>
               <Route
               exact
               path={"/talkable"}
               component={TalkableHome}
               />
                
                <Route
                  exact 
                  path={"/talkable/chat-room/:chatId"}
                  component={ChatRoomPage}
                />

                <Route 
                exact 
                path="/hub"
                component={TalkableHome}
                  />

                <Route path={"/:tab(conference)/rooms"} component={Rooms} />
                
                <Route
                  path={"/:tab(conference)/conference-room/:roomId"}
                  component={ConferenceRoom}
                />

                <Route exact path="/">
                  <Redirect to="/talkable" />
                </Route>
                <Route path={"/admin"} component={AdminBoard}></Route>
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="talkable" href="/talkable">
                  <IonIcon aria-hidden="true" icon={phonePortrait} />
                  <IonLabel>Talkable</IonLabel>
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
