import React, { useState } from 'react';
import { IonApp, IonButton, IonCol, IonContent, IonFab, IonFabButton, IonFabList, IonGrid, IonIcon, IonItem, IonLabel, IonModal, IonPopover, IonRow } from '@ionic/react';
import { add, share, heart, pencil, warningOutline, timeSharp, timeOutline, calendarClear, calendarSharp, closeCircle } from 'ionicons/icons';
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
             <div>
              <IonGrid>
                <IonRow>
                  <IonCol size='12'>
                    
              <IonItem className='ion-margin-horizontal'>
                <IonLabel>
                  <h3>Create Event</h3>
                </IonLabel>
              </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>
             </div>
             <div style={{width: "400px", overflow: "auto"}}>
               <IonGrid>
                <IonRow>
                  <IonCol size='6'>
                    <div
                    className='ion-text-center'
                    role='button'
                    onClick={() => {
                      setCreateRoomProps({
                        onSuccess: () => { setOpenCreateEventOverlay(false)},
                        roomType: "instant"
                      })
                      setOpenEventTypeOverlay(false);
                      setOpenCreateEventOverlay(true);
                    }}
                    
                    aria-haspopup={true}
                    aria-expanded={openCreateEventOverlay}
                    aria-label='create instant event'
                    >
                      <IonIcon className='ion-margin' size='large' icon={timeSharp}></IonIcon>
                      <br/>
                      <small>Instant Meeting</small>
                    </div>
                  </IonCol>
                  

                  
                  <IonCol size='6'>
                    <div
                    className='ion-text-center'
                    onClick={() => {
                      setCreateRoomProps({
                        onSuccess: () => { setOpenCreateEventOverlay(false)},
                        roomType: "scheduled"
                      })
                      setOpenEventTypeOverlay(false);
                      setOpenCreateEventOverlay(true);
                    }}
                    aria-haspopup={true}
                    aria-expanded={openCreateEventOverlay}
                    aria-label='create a scheduled event'
                    >
                      <IonIcon className='ion-margin' size='large' icon={calendarSharp}></IonIcon>
                      <br/>
                      <small>Schedule Meeting</small>
                    </div>
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

