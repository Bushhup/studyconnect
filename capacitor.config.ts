import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studyconnect.app',
  appName: 'StudyConnect',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;