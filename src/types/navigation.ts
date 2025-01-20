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
  CategorySetup: {
    teamSettings: TeamSettings;
  };
  Game: {
    gameSettings: GameSettings;
  };
  Leaderboard: undefined;
  SetSetupScreen: {
    gameSettings: { teamSettings: TeamSettings; selectedCategories: string[] };
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
