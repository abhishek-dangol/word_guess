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

import type { TeamSettings, GameSettings } from './game';

export type RootStackParamList = {
  Home: undefined;
  TeamSetupScreen: undefined;
  CategorySetupScreen: {
    teamSettings: TeamSettings;
    gameSettings: {
      selectedSet: string;
      selectedCategories: string[];
    };
  };
  Game: {
    gameSettings: GameSettings;
  };
  Settings: undefined;
  SetSetupScreen: {
    teamSettings: {
      team1Name: string;
      team2Name: string;
      team1Players: string[];
      team2Players: string[];
      playersPerTeam: number;
    };
    gameSettings: {
      selectedCategories: string[];
    };
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
