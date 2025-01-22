import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { GameScreen } from '../screens/GameScreen';
import TeamSetupScreen from '../screens/TeamSetupScreen';
import { RootStackParamList } from '../types/navigation';
import { CategorySetupScreen } from '../screens/CategorySetupScreen';
import { SetSetupScreen } from '../screens/SetSetupScreen'; // Import SetSetupScreen
import { SettingsScreen } from '../screens/SettingsScreen';
import { SettingsProvider } from '../context/SettingsContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: true,
            headerBackVisible: false,
            headerTitleStyle: {
              fontSize: 24,
              fontWeight: 'bold',
              color: '#2C3E50',
            },
            headerTitleAlign: 'center',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Word Guess' }} />
          <Stack.Screen
            name="TeamSetupScreen"
            component={TeamSetupScreen}
            options={{ title: 'Team Setup' }}
          />
          <Stack.Screen
            name="CategorySetup"
            component={CategorySetupScreen}
            options={{ title: 'Select Categories' }}
          />
          <Stack.Screen
            name="SetSetupScreen"
            component={SetSetupScreen}
            options={{ title: 'Select Set' }}
          />
          <Stack.Screen name="Game" component={GameScreen} options={{ title: 'Game' }} />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}
