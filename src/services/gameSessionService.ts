import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameSession } from '../types/game';

const GAME_SESSIONS_KEY = '@game_sessions';

export async function saveGameSession(session: GameSession): Promise<void> {
  try {
    // Get existing sessions
    const existingSessions = await getGameSessions();

    // Add new session to the beginning of the array
    const updatedSessions = [session, ...existingSessions].slice(0, 10); // Keep last 10 sessions

    // Save updated sessions
    await AsyncStorage.setItem(GAME_SESSIONS_KEY, JSON.stringify(updatedSessions));
  } catch (error) {
    console.error('Error saving game session:', error);
  }
}

export async function getGameSessions(): Promise<GameSession[]> {
  try {
    const sessions = await AsyncStorage.getItem(GAME_SESSIONS_KEY);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error getting game sessions:', error);
    return [];
  }
}

export async function getLastGameSession(): Promise<GameSession | null> {
  try {
    const sessions = await getGameSessions();
    return sessions.length > 0 ? sessions[0] : null;
  } catch (error) {
    console.error('Error getting last game session:', error);
    return null;
  }
}
