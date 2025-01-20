import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { CategorySetupScreen } from './screens/CategorySetupScreen';
import TeamSetupScreen from './screens/TeamSetupScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { SetSetupScreen } from './screens/SetSetupScreen';
import { RootStackParamList } from './types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TeamSetupScreen" component={TeamSetupScreen} />
        <Stack.Screen name="CategorySetup" component={CategorySetupScreen} />
        <Stack.Screen name="SetSetupScreen" component={SetSetupScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
