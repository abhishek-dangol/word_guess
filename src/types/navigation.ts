/**
 * This file defines the type definitions for React Navigation in the app.
 *
 * RootStackParamList defines the available screens and their parameters:
 * - Home: The home/landing screen with no parameters
 * - Game: The main game screen with no parameters
 *
 * The global declaration extends ReactNavigation's RootParamList interface
 * with our custom RootStackParamList to provide type safety and autocompletion
 * when navigating between screens using useNavigation() and navigation.navigate()
 */

export type RootStackParamList = {
  Home: undefined;
  Game: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
