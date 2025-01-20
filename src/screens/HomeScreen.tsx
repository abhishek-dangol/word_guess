import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("TeamSetupScreen")}
        style={styles.button}
      >
        Start Game
      </Button>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("Leaderboard")}
        style={styles.button}
      >
        Leaderboard
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  button: {
    marginVertical: 8,
    width: "80%",
    maxWidth: 300,
  },
});
