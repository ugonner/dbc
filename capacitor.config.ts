import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "app.talkable.online",
  appName: 'dbc',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 5000,
      backgroundColor: "#111111111",
      showSpinner: false
    }
  }
};

export default config;
