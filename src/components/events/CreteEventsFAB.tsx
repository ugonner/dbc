import React, { useState } from 'react';
import { IonApp, IonButton, IonCol, IonContent, IonFab, IonFabButton, IonFabList, IonGrid, IonIcon, IonItem, IonModal, IonPopover, IonRow } from '@ionic/react';
import { add, share, heart, pencil, warningOutline, timeSharp, timeOutline } from 'ionicons/icons';
import { CreateRoom, ICreateRoomProps } from '../../pages/video-conferencing/CreateRoom';

export const CreateEventsFAB: React.FC = () => {
  
    const [openEventTypeOverlay, setOpenEventTypeOverlay] = useState(false);
  const [openCreateEventOverlay, setOpenCreateEventOverlay] = useState(false);
  const [createRoomProps, setCreateRoomProps] = useState<ICreateRoomProps>();
  
  
  
  return (
      <>

            <IonPopover
            isOpen={openEventTypeOverlay}
            onDidDismiss={() =>  setOpenEventTypeOverlay(false)}
            >
              <IonItem>
                <IonButton
                slot='end'
                onClick={() => setOpenCreateEventOverlay(false)}
                aria-label='close event type view'
                fill='clear'
                >x</IonButton>
              </IonItem>
             <div style={{width: "400px", overflow: "auto"}}>
               <IonGrid>
                <IonRow>
                  <IonCol size='3'>
                    <IonButton
                    className='ion-margin'
                    fill='clear'
                    onClick={() => {
                      setCreateRoomProps({
                        onSuccess: () => { setOpenCreateEventOverlay(false)},
                        roomType: "instant"
                      })
                      setOpenEventTypeOverlay(false);
                      setOpenCreateEventOverlay(true);
                    }}>
                      <IonIcon icon={warningOutline}></IonIcon>
                      <br/>
                      <small>Instant Meeting</small>
                    </IonButton>
                  </IonCol>

                  <IonCol size='3'></IonCol>

                  
                  <IonCol size='3'>
                    <IonButton
                    className='ion-margin'
                    fill='clear'
                    onClick={() => {
                      setCreateRoomProps({
                        onSuccess: () => { setOpenCreateEventOverlay(false)},
                        roomType: "scheduled"
                      })
                      setOpenEventTypeOverlay(false);
                      setOpenCreateEventOverlay(true);
                    }}>
                      <IonIcon icon={timeOutline}></IonIcon>
                      <br/>
                      <small>Schedule Meeting</small>
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
             </div>
              </IonPopover>    
            <IonModal 
            isOpen={openCreateEventOverlay}
            onDidDismiss={() => setOpenCreateEventOverlay(false)}
            >
              <CreateRoom onSuccess={() => setOpenCreateEventOverlay(false)} roomType={createRoomProps?.roomType}></CreateRoom>
            </IonModal>

        {/* Main FAB button with an expandable action list */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton>
            <IonIcon icon={add} />
          </IonFabButton>

          {/* Expandable list of action buttons */}
          <IonFabList side="top">
            
            <IonFabButton onClick={() => setOpenEventTypeOverlay(!openEventTypeOverlay)}>
              <IonIcon icon={pencil} />
            </IonFabButton>
          </IonFabList>
        </IonFab>
      </>
  );
};

