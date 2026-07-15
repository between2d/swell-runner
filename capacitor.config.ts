import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.riegulate.dunalivre',
  appName: 'Duna Livre',
  webDir: 'dist',
  loggingBehavior: 'none',
  backgroundColor: '#241720',
  android: {
    backgroundColor: '#241720',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      launchShowDuration: 1200,
      backgroundColor: '#241720',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    SystemBars: {
      hidden: true,
      style: 'DARK',
      insetsHandling: 'css',
      animation: 'NONE',
    },
  },
};

export default config;
