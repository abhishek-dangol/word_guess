import { View, Text, Pressable, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";

// Define the navigation prop type for type safety
// This ensures we can only navigate to screens defined in RootStackParamList
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

// HomeScreen component - The main landing screen of the Word Guess game
export function HomeScreen() {
  // Initialize navigation with proper typing
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      {/* Main title of the game */}
      <Text style={styles.title}>Word Guess</Text>

      {/* Button to start a new game */}
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate("Game")}
      >
        <Text style={styles.buttonText}>Start Game</Text>
      </Pressable>
    </View>
  );
}

// Styles for the HomeScreen component
const styles = StyleSheet.create({
  // Container styles - uses flex layout for centered content
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Title text styling
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  // Start game button styling
  button: {
    backgroundColor: "#007AFF", // iOS blue color
    padding: 15,
    borderRadius: 8,
  },
  // Button text styling
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
