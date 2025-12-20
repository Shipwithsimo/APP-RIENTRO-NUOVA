import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rientro.app',
  appName: 'RIENTRO',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Geolocation: {
      permissions: {
        location: {
          androidStr: 'RIENTRO ha bisogno della posizione per monitorare i tuoi viaggi in sicurezza.',
          iosStr: 'RIENTRO ha bisogno della posizione per monitorare i tuoi viaggi in sicurezza.'
        }
      }
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1f3d',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#1a1f3d'
    }
  }
};

export default config;
