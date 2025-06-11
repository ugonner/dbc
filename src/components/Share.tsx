import React from 'react';
import { IonButton, IonIcon, IonPopover } from '@ionic/react';
import { shareSocialOutline } from 'ionicons/icons';

export interface ShareProps {
  contentName: string;
  contentUrl: string;
  contentDescription: string;
}

export const ShareContent: React.FC<ShareProps> = ({ contentName, contentUrl, contentDescription }) => {
  const [showPopover, setShowPopover] = React.useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: contentName,
          text: contentDescription,
          url: contentUrl,
        });
        console.log('Product shared successfully!');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      setShowPopover(true); // Show fallback sharing options
    }
  };

  // Fallback URLs for sharing
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    contentUrl
  )}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Check out ${contentName}: ${contentUrl}`
  )}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check out ${contentName}: ${contentUrl}`
  )}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    contentUrl
  )}`;
  const instagramShareInfo = 'Instagram doesn’t allow direct URL sharing; you can recommend manually sharing the link.';

  return (
    <>
      <IonButton fill='clear' onClick={handleShare}>
        <IonIcon icon={shareSocialOutline} slot="start" />
        Share
      </IonButton>

      {/* Popover for fallback sharing options */}
      <IonPopover
        isOpen={showPopover}
        onDidDismiss={() => setShowPopover(false)}
      >
        <div style={{ padding: '1rem' }}>
          <h3>Share on:</h3>
          <IonButton
            href={facebookShareUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </IonButton>
          <IonButton
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </IonButton>
          <IonButton
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            X (Twitter)
          </IonButton>
          <IonButton
            href={linkedinShareUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </IonButton>
          <IonButton onClick={() => alert(instagramShareInfo)}>
            Instagram
          </IonButton>
        </div>
      </IonPopover>
    </>
  );
};

