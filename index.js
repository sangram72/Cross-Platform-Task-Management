// index.js
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App';

// 1. Import getMessaging and setBackgroundMessageHandler
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

// 2. Initialize the messaging instance
const messaging = getMessaging();

// 3. Register the handler at the top level (outside of any component)
setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
  // Perform your background tasks (e.g., syncing data) here
});

AppRegistry.registerComponent(appName, () => App);