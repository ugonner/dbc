import { IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';
import { AuthLayout } from '../layouts/AuthLayout';
import { AuthGuardContextProvider } from '../contexts/auth/AuthGuardContext';

const Tab1: React.FC = () => {
  
  return (
    <AuthGuardContextProvider>
      
    <AuthLayout pageTitle='The Law'>
      <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Tab 1 page" />
    </AuthLayout>
    </AuthGuardContextProvider>
  
  );
};

export default Tab1;
