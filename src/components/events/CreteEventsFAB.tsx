import React, { useState } from 'react';
import { IonApp, IonContent, IonFab, IonFabButton, IonFabList, IonIcon } from '@ionic/react';
import { add, share, heart, pencil } from 'ionicons/icons';

export const CreateEventsFAB: React.FC = () => {
  
    const [openCreateEventModal, setCreateEventModal] = useState(false);

    return (
      <>
        {/* Main FAB button with an expandable action list */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton>
            <IonIcon icon={add} />
          </IonFabButton>

          {/* Expandable list of action buttons */}
          <IonFabList side="top">
            <IonFabButton>
              <IonIcon icon={share} />
            </IonFabButton>
            <IonFabButton>
              <IonIcon icon={heart} />
            </IonFabButton>
            <IonFabButton>
              <IonIcon icon={pencil} />
            </IonFabButton>
          </IonFabList>
        </IonFab>
      </>
  );
};

