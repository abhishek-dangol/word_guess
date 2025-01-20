/**
 * This file defines the type definitions for React Navigation in the app.
 *
 * RootStackParamList defines the available screens and their parameters:
 * - Home: The home/landing screen with no parameters
 * - Game: The main game screen with teamSettings
 *
 * The global declaration extends ReactNavigation's RootParamList interface
 * with our custom RootStackParamList to provide type safety and autocompletion
 * when navigating between screens using useNavigation() and navigation.navigate()
 */

import type { TeamSettings } from "./game";

export type RootStackParamList = {
  Home: undefined;
  TeamSetupScreen: undefined;
  Game: {
    teamSettings: {
      team1Name: string;
      team2Name: string;
      team1Players: string[];
      team2Players: string[];
      playersPerTeam: number;
    };
  };
  Leaderboard: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
