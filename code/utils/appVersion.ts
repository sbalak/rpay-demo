import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const getAppVersion = (): string => {
  try {
    const appVersion = Constants.expoConfig?.version || '1.0.0';
    
    let buildNumber = '';
    if (Platform.OS === 'ios') {
      buildNumber = Constants.expoConfig?.ios?.buildNumber || '1';
    } else if (Platform.OS === 'android') {
      buildNumber = String(Constants.expoConfig?.android?.versionCode || 1);
    } else {
      // Use Android version code for web platforms
      buildNumber = String(Constants.expoConfig?.android?.versionCode || 1);
    }
    
    return `App Version: ${appVersion} (${buildNumber})`;
  } catch (error) {
    console.error('Error getting app version:', error);
    return 'App Version: 1.0.0 (1)';
  }
};
