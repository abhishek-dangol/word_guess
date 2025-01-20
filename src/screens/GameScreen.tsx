import { View, StyleSheet, Pressable, Text, Alert, Modal, Animated } from 'react-native';
import { WordCard } from '../components/WordCard';
import { getRandomCard } from '../lib/cardService';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { CardData } from '../types/game';
import { supabase } from '../lib/supabase';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { BlurView } from 'expo-blur';
import { Audio } from 'expo-av';

const INITIAL_TIME = 10; // Initial timer value in seconds
const MAX_SKIPS = 3; // Maximum number of skips allowed per round

// Interface for tracking player turns
interface PlayerTurn {
  teamNumber: 1 | 2;
  playerIndex: number;
  playerName: string;
  teamName: string;
}

// Interface for tracking available players
interface AvailablePlayers {
  team1: boolean[];
  team2: boolean[];
}

export function GameScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Game'>>();
  const { gameSettings } = route.params;
  const { teamSettings, selectedCategories } = gameSettings;

  // State management for word card, timer, and scoring
  const [currentWordCard, setCurrentWordCard] = useState<CardData | null>(null);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [score, setScore] = useState(0);
  const [skips, setSkips] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // State for tracking current player turn and available players
  const [currentTurn, setCurrentTurn] = useState<PlayerTurn | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<AvailablePlayers>({
    team1: Array(teamSettings.team1Players.length).fill(true),
    team2: Array(teamSettings.team2Players.length).fill(true),
  });

  // State for next turn modal
  const [isNextTurnModalVisible, setIsNextTurnModalVisible] = useState(false);
  const [nextTurn, setNextTurn] = useState<PlayerTurn | null>(null);

  // Add new state for initial modal
  const [isInitialTurnModalVisible, setIsInitialTurnModalVisible] = useState(true);

  // Add state to track last team
  const [lastTeamNumber, setLastTeamNumber] = useState<1 | 2 | null>(null);

  // Ref to track if initialization has occurred
  const hasInitialized = useRef(false);

  // State to track scores for each player
  const [playerScores, setPlayerScores] = useState<{
    team1: number[];
    team2: number[];
  }>({
    team1: Array(teamSettings.team1Players.length).fill(0),
    team2: Array(teamSettings.team2Players.length).fill(0),
  });

  // State for winner modal
  const [isWinnerModalVisible, setIsWinnerModalVisible] = useState(false);
  const [winningTeam, setWinningTeam] = useState<string | null>(null);

  // Add a counter for the number of turns taken
  const [turnCount, setTurnCount] = useState(0);

  // Calculate the total number of players
  const totalPlayers = teamSettings.team1Players.length + teamSettings.team2Players.length;

  // Add this helper function
  const getNextTeamNumber = useCallback((currentTeam: 1 | 2 | null): 1 | 2 => {
    return currentTeam === 1 ? 2 : 1;
  }, []);

  // Function to fetch new card
  const fetchNewCard = useCallback(async () => {
    console.log('Fetching new card...');
    try {
      // Log the query parameters for debugging
      console.log('Query params:', {
        categories: selectedCategories,
        set: gameSettings.selectedSet,
      });

      // First get all matching cards
      const { data: allCards, error: countError } = await supabase
        .from('carddata')
        .select('cardnumber')
        .in('category', selectedCategories)
        .eq('set', gameSettings.selectedSet);

      if (countError) throw countError;

      if (!allCards || allCards.length === 0) {
        console.error('No cards found for the selected categories and set');
        return;
      }

      // Get a random card from the matching cards
      const randomIndex = Math.floor(Math.random() * allCards.length);
      const { data, error } = await supabase
        .from('carddata')
        .select('cardnumber, tabooword, hintwords, category, set')
        .in('category', selectedCategories)
        .eq('set', gameSettings.selectedSet)
        .eq('cardnumber', allCards[randomIndex].cardnumber)
        .single();

      if (error) throw error;

      if (data) {
        const processedCard = {
          cardnumber: data.cardnumber,
          tabooword: data.tabooword,
          hintwords: data.hintwords,
          category: data.category,
          set: data.set,
        };
        console.log('Processed card:', processedCard);
        setCurrentWordCard(processedCard);
      }
    } catch (error) {
      console.error('Error fetching card:', error);
    }
  }, [selectedCategories, gameSettings.selectedSet]);

  // Add useEffect to fetch initial card
  useEffect(() => {
    fetchNewCard();
  }, [fetchNewCard]);

  // Initialize game state function
  const initializeGame = useCallback(() => {
    if (hasInitialized.current) return; // Prevent re-initialization

    const initialTeam = (Math.random() < 0.5 ? 2 : 1) as 1 | 2;
    const firstTurn: PlayerTurn = {
      teamNumber: (initialTeam === 1 ? 2 : 1) as 1 | 2,
      playerIndex: 0,
      playerName: teamSettings[`team${initialTeam === 1 ? 2 : 1}Players`][0],
      teamName: teamSettings[`team${initialTeam === 1 ? 2 : 1}Name`],
    };

    setLastTeamNumber(initialTeam);
    setCurrentTurn(firstTurn);
    setCurrentWordCard(null);
    setTimeLeft(INITIAL_TIME);
    setIsTimerActive(false);
    setScore(0);
    setSkips(0);

    hasInitialized.current = true; // Mark as initialized
  }, [teamSettings]);

  // Call initialize only once on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Modify selectRandomPlayer to be simpler
  const selectRandomPlayer = useCallback(
    (teamNumber: 1 | 2) => {
      const teamAvailable = availablePlayers[`team${teamNumber}`]
        .map((available, index) => (available ? index : -1))
        .filter((index) => index !== -1);

      if (teamAvailable.length === 0) return null;

      const playerIndex = teamAvailable[Math.floor(Math.random() * teamAvailable.length)];

      return {
        teamNumber,
        playerIndex,
        playerName: teamSettings[`team${teamNumber}Players`][playerIndex],
        teamName: teamSettings[`team${teamNumber}Name`],
      };
    },
    [availablePlayers, teamSettings],
  );

  // Function to calculate the winner
  const calculateWinner = useCallback(() => {
    const team1Total = playerScores.team1.reduce((acc, score) => acc + score, 0);
    const team2Total = playerScores.team2.reduce((acc, score) => acc + score, 0);

    if (team1Total > team2Total) {
      setWinningTeam(teamSettings.team1Name);
    } else if (team2Total > team1Total) {
      setWinningTeam(teamSettings.team2Name);
    } else {
      setWinningTeam("It's a tie!");
    }
  }, [playerScores, teamSettings]);

  // Modify handleEndTurn to check if all players have played
  const handleEndTurn = useCallback(() => {
    if (!currentTurn) return;

    // Update player score and handle end of game in a single state update
    setPlayerScores((prev) => {
      const teamKey = `team${currentTurn.teamNumber}` as keyof typeof playerScores;
      const newScores = { ...prev };
      newScores[teamKey] = [...prev[teamKey]];
      newScores[teamKey][currentTurn.playerIndex] += score;

      // If this was the last turn, calculate winner and show modal
      if (turnCount + 1 >= totalPlayers) {
        const team1Total = newScores.team1.reduce((acc, s) => acc + s, 0);
        const team2Total = newScores.team2.reduce((acc, s) => acc + s, 0);

        // Set winner after scores are updated
        setTimeout(() => {
          if (team1Total > team2Total) {
            setWinningTeam(teamSettings.team1Name);
          } else if (team2Total > team1Total) {
            setWinningTeam(teamSettings.team2Name);
          } else {
            setWinningTeam("It's a tie!");
          }
          setIsWinnerModalVisible(true);
        }, 0);
      }

      return newScores;
    });

    // Mark current player as unavailable
    setAvailablePlayers((prev) => ({
      ...prev,
      [`team${currentTurn.teamNumber}`]: prev[`team${currentTurn.teamNumber}`].map(
        (available: boolean, index) => (index === currentTurn.playerIndex ? false : available),
      ),
    }));

    // Increment the turn counter
    setTurnCount((prev) => prev + 1);

    // Only proceed with next turn if game isn't over
    if (turnCount + 1 < totalPlayers) {
      const nextTeamNumber = getNextTeamNumber(currentTurn.teamNumber);
      let next = selectRandomPlayer(nextTeamNumber);

      if (!next) {
        // Reset next team's players
        setAvailablePlayers((prev) => ({
          ...prev,
          [`team${nextTeamNumber}`]: Array(
            teamSettings[`team${nextTeamNumber}Players`].length,
          ).fill(true),
        }));
        next = selectRandomPlayer(nextTeamNumber);
      }

      if (next) {
        setLastTeamNumber(next.teamNumber);
        setNextTurn(next);
        setIsNextTurnModalVisible(true);
      }
    }
  }, [
    currentTurn,
    selectRandomPlayer,
    getNextTeamNumber,
    teamSettings,
    score,
    turnCount,
    totalPlayers,
  ]);

  // Timer countdown effect
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Add new state for Time's Up modal
  const [isTimeUpModalVisible, setIsTimeUpModalVisible] = useState(false);

  // Add state for sound
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Add function to play sound
  const playTimeUpSound = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/timer-end.mp3'), // Note the path change
        { shouldPlay: true },
      );
      setSound(newSound);

      // Play the sound
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // Clean up sound when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Modify the timer effect
  useEffect(() => {
    if (!isTimerActive) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          setIsTimerActive(false);
          playTimeUpSound();
          setIsTimeUpModalVisible(true);

          // Add delay before showing next turn
          setTimeout(() => {
            setIsTimeUpModalVisible(false);
            handleEndTurn();
          }, 2000);

          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerActive, handleEndTurn]);

  // Add this ref at the top with other refs
  const isProcessingRef = useRef(false);

  // Update the handleCorrect function
  const handleCorrect = async () => {
    if (isTimerActive && !isProcessingRef.current) {
      try {
        isProcessingRef.current = true;
        setScore((prev) => prev + 1);
        await fetchNewCard();
      } finally {
        isProcessingRef.current = false;
      }
    }
  };

  // Update the handleSkip function similarly
  const handleSkip = async () => {
    if (isTimerActive && skips < MAX_SKIPS && !isProcessingRef.current) {
      try {
        isProcessingRef.current = true;
        setSkips((prev) => prev + 1);
        await fetchNewCard();
      } finally {
        isProcessingRef.current = false;
      }
    }
  };

  // Calculate remaining skips
  const remainingSkips = MAX_SKIPS - skips;

  // Handler for saving score to Supabase
  const handleSaveScore = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      const { data, error } = await supabase
        .from('carddata')
        .select('cardnumber, tabooword, hintwords, category, set')
        .in('category', gameSettings.selectedCategories);

      if (error) throw error;

      // Make sure to include 'set' when processing the card
      const processedCards = data.map((card) => ({
        cardnumber: card.cardnumber,
        tabooword: card.tabooword,
        hintwords: card.hintwords,
        category: card.category,
        set: card.set,
      }));

      const { error: supabaseError } = await supabase.from('scores').insert([
        {
          score,
          skips,
          created_at: new Date().toISOString(),
        },
      ]);

      if (supabaseError) throw supabaseError;

      Alert.alert('Success', 'Your score has been saved!', [
        { text: 'OK', onPress: handleEndTurn },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save score. Please try again.', [{ text: 'OK' }]);
      console.error('Error saving score:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Start next turn without calling handleEndTurn directly
  const handleStartNextTurn = useCallback(async () => {
    if (!nextTurn) return;

    setCurrentTurn(nextTurn);
    setNextTurn(null);
    setIsNextTurnModalVisible(false);
    setTimeLeft(INITIAL_TIME);
    setIsTimerActive(true);
    await fetchNewCard();
    setScore(0);
    setSkips(0);
  }, [nextTurn, fetchNewCard]);

  // Handler for starting first turn
  const handleStartFirstTurn = useCallback(() => {
    setIsInitialTurnModalVisible(false);
    setIsTimerActive(true);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <AntDesign name="arrowleft" size={24} color="#2C3E50" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.content,
          (isInitialTurnModalVisible || isNextTurnModalVisible) && styles.hidden,
        ]}
      >
        {/* Current Team and Player Display */}
        {currentTurn && (
          <View style={styles.turnInfo}>
            <Text style={styles.teamName}>Team: {currentTurn.teamName}</Text>
            <Text style={styles.playerName}>
              Player {currentTurn.playerIndex + 1}: {currentTurn.playerName}
            </Text>
          </View>
        )}

        {/* Score display */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Skips Left</Text>
            <Text style={[styles.scoreValue, remainingSkips === 0 && styles.noSkipsLeft]}>
              {remainingSkips}
            </Text>
          </View>
        </View>

        {/* Timer display */}
        <View style={styles.timerContainer}>
          <Text style={[styles.timer, timeLeft <= 3 && styles.timerWarning]}>{timeLeft}s</Text>
        </View>

        {/* Word card */}
        {currentWordCard && <WordCard wordCard={currentWordCard} />}

        {/* Game buttons */}
        <View style={styles.buttonContainer}>
          {timeLeft > 0 ? (
            // Game buttons during active play
            <View style={styles.gameButtons}>
              <Pressable
                style={[
                  styles.button,
                  styles.correctButton,
                  !isTimerActive && styles.buttonDisabled,
                ]}
                onPress={handleCorrect}
                disabled={!isTimerActive}
              >
                <Text style={styles.buttonText}>Correct</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.button,
                  styles.skipButton,
                  remainingSkips === 0 && styles.disabledButton,
                  (!isTimerActive || remainingSkips === 0) && styles.buttonDisabled,
                ]}
                onPress={handleSkip}
                disabled={!isTimerActive || remainingSkips === 0}
              >
                <Text
                  style={[styles.buttonText, remainingSkips === 0 && styles.disabledButtonText]}
                >
                  Skip {remainingSkips > 0 ? `(${remainingSkips})` : ''}
                </Text>
              </Pressable>
            </View>
          ) : (
            // Save score and Reset buttons when game is over
            <>
              <Pressable
                style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
                onPress={handleSaveScore}
                disabled={isSaving}
              >
                <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Save Score'}</Text>
              </Pressable>

              <Pressable style={[styles.button, styles.resetButton]} onPress={handleEndTurn}>
                <Text style={styles.buttonText}>Reset Game</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Initial Turn Modal */}
        <Modal visible={isInitialTurnModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>First Turn</Text>
              {currentTurn && (
                <>
                  <Text style={styles.teamName}>Team: {currentTurn.teamName}</Text>
                  <Text style={styles.playerName}>
                    Player {currentTurn.playerIndex + 1}: {currentTurn.playerName}
                  </Text>
                </>
              )}
              <Pressable style={[styles.button, styles.startButton]} onPress={handleStartFirstTurn}>
                <Text style={styles.buttonText}>Start Game</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Next Turn Modal */}
        <Modal visible={isNextTurnModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Next Turn</Text>
              {nextTurn && (
                <>
                  <Text style={styles.teamName}>{nextTurn.teamName}</Text>
                  <Text style={styles.playerName}>
                    Player {nextTurn.playerIndex + 1}: {nextTurn.playerName}
                  </Text>
                </>
              )}
              <Pressable style={[styles.button, styles.startButton]} onPress={handleStartNextTurn}>
                <Text style={styles.buttonText}>Start Turn</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Winner Modal */}
        <Modal visible={isWinnerModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Game Over</Text>
              <Text style={styles.winnerText}>
                {winningTeam ? `Winner: ${winningTeam}` : "It's a tie!"}
              </Text>
              <Text style={styles.modalSubtitle}>Scores:</Text>
              <View>
                <Text style={styles.teamName}>{teamSettings.team1Name}</Text>
                {teamSettings.team1Players.map((player, index) => (
                  <Text key={index} style={styles.playerScore}>
                    Player {index + 1}: {player} scored {playerScores.team1[index]} points
                  </Text>
                ))}
                <Text style={styles.teamTotal}>
                  Team Total: {playerScores.team1.reduce((acc, score) => acc + score, 0)} points
                </Text>

                <Text style={[styles.teamName, styles.secondTeam]}>{teamSettings.team2Name}</Text>
                {teamSettings.team2Players.map((player, index) => (
                  <Text key={index} style={styles.playerScore}>
                    Player {index + 1}: {player} scored {playerScores.team2[index]} points
                  </Text>
                ))}
                <Text style={styles.teamTotal}>
                  Team Total: {playerScores.team2.reduce((acc, score) => acc + score, 0)} points
                </Text>
              </View>
              <Pressable
                style={[styles.button, styles.startButton]}
                onPress={() => {
                  setIsWinnerModalVisible(false);
                  navigation.navigate('Home');
                }}
              >
                <Text style={styles.buttonText}>Back to Home</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Time's Up Modal */}
        <Modal visible={isTimeUpModalVisible} transparent={true}>
          <View style={styles.timeUpModalOverlay}>
            <Animated.View style={styles.timeUpModalContent}>
              <Text style={styles.timeUpText}>Time's Up!</Text>
              <Text style={styles.finalScoreText}>Final Score: {score}</Text>
            </Animated.View>
          </View>
        </Modal>
      </View>

      {(isInitialTurnModalVisible || isNextTurnModalVisible) && (
        <BlurView intensity={100} style={[StyleSheet.absoluteFill, styles.blurOverlay]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#2C3E50',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 12,
    width: '100%',
  },
  scoreItem: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  timerContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  timer: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  timerWarning: {
    color: '#E74C3C',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
    width: '100%',
    alignItems: 'center',
  },
  gameButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  correctButton: {
    backgroundColor: '#2ECC71',
  },
  skipButton: {
    backgroundColor: '#E67E22',
  },
  resetButton: {
    backgroundColor: '#34495E',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noSkipsLeft: {
    color: '#E74C3C', // Red color to indicate no skips remaining
  },
  saveButton: {
    backgroundColor: '#3498DB',
    width: '100%',
    maxWidth: 300,
  },
  turnInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 20,
    color: '#34495E',
  },
  startButton: {
    backgroundColor: '#2ECC71',
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  hidden: {
    opacity: 0,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  winnerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 10,
  },
  playerScore: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 5,
  },
  secondTeam: {
    marginTop: 16,
  },
  teamTotal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 8,
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB', // Grey color
    borderColor: '#9CA3AF',
  },
  disabledButtonText: {
    color: '#6B7280', // Darker grey for text
  },
  timeUpModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  timeUpModalContent: {
    backgroundColor: '#E74C3C',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  timeUpText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  finalScoreText: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});
