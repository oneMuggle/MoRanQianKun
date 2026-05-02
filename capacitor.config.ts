import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moran.jianghu',
  appName: '墨色江湖',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
