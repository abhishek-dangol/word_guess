import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/HomeScreen";
import { GameScreen } from "../screens/GameScreen";
import { LeaderboardScreen } from "../screens/LeaderboardScreen";
import TeamSetupScreen from "../screens/TeamSetupScreen";
import { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: true,
          headerBackVisible: false,
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: "bold",
            color: "#2C3E50",
          },
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Word Guess" }}
        />
        <Stack.Screen
          name="TeamSetupScreen"
          component={TeamSetupScreen}
          options={{ title: "Team Setup" }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ title: "Game" }}
        />
        <Stack.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{ title: "Leaderboard" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
