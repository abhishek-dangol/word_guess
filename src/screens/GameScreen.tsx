import React from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Pressable,
  Text,
  Alert,
  Modal,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { WordCard } from '../components/WordCard';
import { getRandomCard } from '../lib/cardService';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { CardData } from '../types/game';
import { supabase } from '../lib/supabase';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { BlurView } from 'expo-blur';
import { Audio } from 'expo-av';
import { useSettings } from '../context/SettingsContext';
import { saveGameSession } from '../services/gameSessionService';
import type { GameSession } from '../types/game';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { maxSkips, roundDuration, disqualificationRule } = useSettings();

  // State management for word card, timer, and scoring
  const [currentWordCard, setCurrentWordCard] = useState<CardData | null>(null);
  const [timeLeft, setTimeLeft] = useState(roundDuration);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [score, setScore] = useState(0);
  const [skips, setSkips] = useState(0);

  // Calculate remaining skips
  const remainingSkips = maxSkips - skips;

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
    setTimeLeft(roundDuration);
    setIsTimerActive(false);
    setScore(0);
    setSkips(0);

    hasInitialized.current = true; // Mark as initialized
  }, [teamSettings, roundDuration]);

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

  // Add a state to track if player was disqualified
  const [wasDisqualified, setWasDisqualified] = useState(false);

  // Add new state to track disqualified players
  const [disqualifiedPlayers, setDisqualifiedPlayers] = useState<{
    team1: boolean[];
    team2: boolean[];
  }>({
    team1: Array(teamSettings.team1Players.length).fill(false),
    team2: Array(teamSettings.team2Players.length).fill(false),
  });

  // Modify handleEndTurn to properly handle disqualification
  const handleEndTurn = useCallback(() => {
    if (!currentTurn) return;

    setPlayerScores((prev) => {
      const teamKey = `team${currentTurn.teamNumber}` as keyof typeof prev;
      const newScores = { ...prev };
      newScores[teamKey] = [...prev[teamKey]];

      if (wasDisqualified) {
        newScores[teamKey][currentTurn.playerIndex] = disqualificationRule === 'zero' ? 0 : score;
      } else {
        newScores[teamKey][currentTurn.playerIndex] = score;
      }

      return newScores;
    });

    // If this was the last turn
    if (turnCount + 1 >= totalPlayers) {
      const finalTeam1Total = playerScores.team1
        .map((score, index) => (disqualifiedPlayers.team1[index] ? 0 : score))
        .reduce((acc, score) => acc + score, 0);

      const finalTeam2Total = playerScores.team2
        .map((score, index) => (disqualifiedPlayers.team2[index] ? 0 : score))
        .reduce((acc, score) => acc + score, 0);

      // Save game session
      const gameSession: GameSession = {
        timestamp: Date.now(),
        teamSettings: {
          team1Name: teamSettings.team1Name,
          team1Players: teamSettings.team1Players,
          team2Name: teamSettings.team2Name,
          team2Players: teamSettings.team2Players,
        },
        gameSettings: {
          selectedCategories,
          selectedSet: gameSettings.selectedSet,
        },
        settings: {
          maxSkips,
          roundDuration,
        },
      };

      saveGameSession(gameSession);

      // Determine winner with simplified logic
      if (
        disqualifiedPlayers.team1.every((isDisqualified) => isDisqualified) &&
        disqualifiedPlayers.team2.every((isDisqualified) => isDisqualified)
      ) {
        setWinningTeam("It's a tie! All players were disqualified");
      } else if (disqualifiedPlayers.team1.every((isDisqualified) => isDisqualified)) {
        setWinningTeam(teamSettings.team2Name);
      } else if (disqualifiedPlayers.team2.every((isDisqualified) => isDisqualified)) {
        setWinningTeam(teamSettings.team1Name);
      } else if (finalTeam1Total > finalTeam2Total) {
        setWinningTeam(teamSettings.team1Name);
      } else if (finalTeam2Total > finalTeam1Total) {
        setWinningTeam(teamSettings.team2Name);
      } else {
        setWinningTeam("It's a tie!");
      }

      setIsWinnerModalVisible(true);
    }

    // Reset states
    setWasDisqualified(false);
    setScore(0); // Reset score for next turn

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
    wasDisqualified,
    disqualifiedPlayers,
    gameSettings,
    maxSkips,
    roundDuration,
    selectedCategories,
    disqualificationRule,
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
          }, 5000);

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

  // Add these states and refs near your other state declarations
  const [isCorrectAnimationVisible, setIsCorrectAnimationVisible] = useState(false);
  const correctAnimationOpacity = useRef(new Animated.Value(0)).current;

  // Add this function near your other animation-related functions
  const showCorrectAnimation = () => {
    setIsCorrectAnimationVisible(true);
    correctAnimationOpacity.setValue(0);

    Animated.sequence([
      Animated.timing(correctAnimationOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(correctAnimationOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsCorrectAnimationVisible(false);
    });
  };

  // Update the handleCorrect function
  const handleCorrect = async () => {
    if (isTimerActive && !isProcessingRef.current) {
      try {
        isProcessingRef.current = true;
        Vibration.vibrate(50);
        showCorrectAnimation();
        setScore((prev) => prev + 1);
        await fetchNewCard();
      } finally {
        isProcessingRef.current = false;
      }
    }
  };

  // Add new state and ref near the other animation states
  const [isSkipAnimationVisible, setIsSkipAnimationVisible] = useState(false);
  const skipAnimationOpacity = useRef(new Animated.Value(0)).current;

  // Add this function near showCorrectAnimation
  const showSkipAnimation = () => {
    setIsSkipAnimationVisible(true);
    skipAnimationOpacity.setValue(0);

    Animated.sequence([
      Animated.timing(skipAnimationOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(skipAnimationOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSkipAnimationVisible(false);
    });
  };

  // Update handleSkip function
  const handleSkip = async () => {
    if (isTimerActive && skips < maxSkips && !isProcessingRef.current) {
      try {
        isProcessingRef.current = true;
        Vibration.vibrate(100);
        showSkipAnimation();
        setSkips((prev) => prev + 1);
        await fetchNewCard();
      } finally {
        isProcessingRef.current = false;
      }
    }
  };

  // Handler for starting first turn
  const handleStartFirstTurn = useCallback(() => {
    setIsInitialTurnModalVisible(false);
    setIsTimerActive(true);
  }, []);

  // Add new state for disqualification modal
  const [isDisqualifiedModalVisible, setIsDisqualifiedModalVisible] = useState(false);

  // Update handleDisqualification function
  const handleDisqualification = useCallback(() => {
    if (!currentTurn) return;

    setWasDisqualified(true);
    setIsTimerActive(false);

    // Mark player as disqualified
    setDisqualifiedPlayers((prev) => {
      const newDisqualified = { ...prev };
      newDisqualified[`team${currentTurn.teamNumber}`] = [...prev[`team${currentTurn.teamNumber}`]];
      newDisqualified[`team${currentTurn.teamNumber}`][currentTurn.playerIndex] = true;
      return newDisqualified;
    });

    // Show disqualification modal
    setIsDisqualifiedModalVisible(true);
    Vibration.vibrate([100, 200, 100]);

    // End turn after delay
    setTimeout(() => {
      setIsDisqualifiedModalVisible(false);
      handleEndTurn();
    }, 3000);
  }, [currentTurn, handleEndTurn]);

  // Add back handleStartNextTurn function
  const handleStartNextTurn = useCallback(() => {
    if (!nextTurn) return;

    setCurrentTurn(nextTurn);
    setNextTurn(null);
    setIsNextTurnModalVisible(false);
    setTimeLeft(roundDuration);
    setIsTimerActive(true);
    setScore(0);
    setSkips(0);
    fetchNewCard();
  }, [nextTurn, fetchNewCard]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8F9FA',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E9EF',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
    },
    backButtonText: {
      marginLeft: 8,
      fontSize: 16,
      color: '#2C3E50',
      fontWeight: '500',
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 6,
    },
    turnInfo: {
      backgroundColor: 'white',
      padding: 4,
      borderRadius: 12,
      marginBottom: 4,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    teamName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2C3E50',
      marginBottom: 4,
    },
    playerName: {
      fontSize: 16,
      color: '#34495E',
    },
    // Improved Score Layout
    scoreContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between', // Ensures equal spacing
      marginBottom: 8,
    },
    scoreItem: {
      flex: 1,
      backgroundColor: 'white',
      padding: 12,
      borderRadius: 12,
      marginHorizontal: 4,
      alignItems: 'center',
    },
    scoreLabel: {
      fontSize: 16,
      color: '#666',
      marginBottom: 8,
      fontWeight: '500',
    },
    scoreValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#2C3E50',
    },
    // Timer Styling
    timerContainer: {
      backgroundColor: 'white',
      paddingVertical: 10,
      paddingHorizontal: 2,
      borderRadius: 12,
      marginBottom: 12,
      marginTop: 8,
      alignItems: 'center',
    },
    timer: {
      fontSize: 24, // Increased for better visibility
      fontWeight: 'bold',
      color: '#2C3E50',
    },
    timerWarning: {
      color: '#E74C3C',
    },
    // Card Layout Improvements
    cardWrapper: {
      width: '100%',
      height: 280, // Fixed height for the card container
      alignItems: 'center',
      marginBottom: 80,
      marginTop: 0.1,
    },
    buttonContainer: {
      width: '100%',
      paddingBottom: 20, // Ensures spacing on all devices
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    gameButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8, // Ensures uniform spacing
    },
    button: {
      flex: 1,
      paddingVertical: 14, // Adjusted for better touch area
      borderRadius: 10,
      alignItems: 'center',
    },
    correctButton: {
      backgroundColor: '#2ECC71',
    },
    skipButton: {
      backgroundColor: '#E67E22',
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    buttonDisabled: {
      backgroundColor: '#BDC3C7', // Light gray when disabled
      opacity: 0.6,
    },
    buttonTextDisabled: {
      color: '#7F8C8D', // Darker gray for disabled text
    },
    // Modal styles with consistent spacing
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
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
      backgroundColor: '#D1D5DB',
      borderColor: '#9CA3AF',
    },
    disabledButtonText: {
      color: '#6B7280',
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
    modalButton: {
      backgroundColor: '#2ECC71',
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 12,
      marginTop: 24,
      minWidth: 200,
      alignItems: 'center',
    },
    modalButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
    },
    disqualifyButton: {
      backgroundColor: '#E74C3C', // Red color for disqualification
    },
    disqualifiedModalContent: {
      backgroundColor: '#E74C3C',
    },
    disqualifiedScore: {
      color: '#E74C3C',
      fontStyle: 'italic',
    },
    noSkipsLeft: {
      color: '#E74C3C', // Red color to indicate no skips remaining
    },
    correctAnimationOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
    },
    correctAnimationContent: {
      backgroundColor: '#2ECC71',
      padding: 20,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    correctAnimationText: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
    },
    skipAnimationOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
    },
    skipAnimationContent: {
      backgroundColor: '#E67E22',
      padding: 20,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    skipAnimationText: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={[styles.timer, timeLeft <= 10 && styles.timerWarning]}>
            Time Left: {timeLeft} seconds
          </Text>
        </View>

        {/* Word card */}
        {currentWordCard && (
          <View style={styles.cardWrapper}>
            <WordCard wordCard={currentWordCard} />
          </View>
        )}

        {/* Game buttons */}
        <View style={styles.buttonContainer}>
          {timeLeft > 0 && isTimerActive && (
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
                  (!isTimerActive || remainingSkips === 0) && styles.buttonDisabled,
                ]}
                onPress={handleSkip}
                disabled={!isTimerActive || remainingSkips === 0}
              >
                <Text
                  style={[
                    styles.buttonText,
                    (!isTimerActive || remainingSkips === 0) && styles.buttonTextDisabled,
                  ]}
                >
                  Skip {remainingSkips > 0 ? `(${remainingSkips})` : ''}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.button,
                  styles.disqualifyButton,
                  !isTimerActive && styles.buttonDisabled,
                ]}
                onPress={handleDisqualification}
                disabled={!isTimerActive}
              >
                <Text style={styles.buttonText}>Disqualify</Text>
              </Pressable>
            </View>
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
                  <Text style={styles.teamName}>
                    Player {currentTurn.playerIndex + 1}: {currentTurn.playerName}
                  </Text>
                </>
              )}
              <Pressable style={styles.modalButton} onPress={handleStartFirstTurn}>
                <Text style={styles.modalButtonText}>Start Game</Text>
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
                  <Text style={styles.teamName}>Team: {nextTurn.teamName}</Text>
                  <Text style={styles.teamName}>
                    Player {nextTurn.playerIndex + 1}: {nextTurn.playerName}
                  </Text>
                </>
              )}
              <Pressable style={styles.modalButton} onPress={handleStartNextTurn}>
                <Text style={styles.modalButtonText}>Start Turn</Text>
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
                {(() => {
                  const team1Total = playerScores.team1
                    .map((score, index) =>
                      disqualifiedPlayers.team1[index] && disqualificationRule === 'zero'
                        ? 0
                        : score,
                    )
                    .reduce((acc, score) => acc + score, 0);
                  const team2Total = playerScores.team2
                    .map((score, index) =>
                      disqualifiedPlayers.team2[index] && disqualificationRule === 'zero'
                        ? 0
                        : score,
                    )
                    .reduce((acc, score) => acc + score, 0);

                  if (team1Total === 0 && team2Total === 0) {
                    return "Winner: It's a tie!";
                  } else if (team1Total > team2Total) {
                    return `Winner: ${teamSettings.team1Name}`;
                  } else if (team2Total > team1Total) {
                    return `Winner: ${teamSettings.team2Name}`;
                  } else {
                    return "Winner: It's a tie!";
                  }
                })()}
              </Text>
              <Text style={styles.modalSubtitle}>Summary</Text>
              <View>
                <Text style={styles.teamName}>{teamSettings.team1Name}</Text>
                {teamSettings.team1Players.map((player, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.playerScore,
                      disqualifiedPlayers.team1[index] && styles.disqualifiedScore,
                    ]}
                  >
                    Player {index + 1}: {player} -{' '}
                    {disqualifiedPlayers.team1[index]
                      ? `Disqualified (${disqualificationRule === 'zero' ? '0' : playerScores.team1[index]} points)`
                      : `${playerScores.team1[index]} points`}
                  </Text>
                ))}
                <Text style={styles.teamTotal}>
                  Team Total:{' '}
                  {playerScores.team1
                    .map((score, index) =>
                      disqualifiedPlayers.team1[index] && disqualificationRule === 'zero'
                        ? 0
                        : score,
                    )
                    .reduce((acc, score) => acc + score, 0)}{' '}
                  points
                </Text>

                <Text style={[styles.teamName, styles.secondTeam]}>{teamSettings.team2Name}</Text>
                {teamSettings.team2Players.map((player, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.playerScore,
                      disqualifiedPlayers.team2[index] && styles.disqualifiedScore,
                    ]}
                  >
                    Player {index + 1}: {player} -{' '}
                    {disqualifiedPlayers.team2[index]
                      ? `Disqualified (${disqualificationRule === 'zero' ? '0' : playerScores.team2[index]} points)`
                      : `${playerScores.team2[index]} points`}
                  </Text>
                ))}
                <Text style={styles.teamTotal}>
                  Team Total:{' '}
                  {playerScores.team2
                    .map((score, index) =>
                      disqualifiedPlayers.team2[index] && disqualificationRule === 'zero'
                        ? 0
                        : score,
                    )
                    .reduce((acc, score) => acc + score, 0)}{' '}
                  points
                </Text>
              </View>
              <Pressable
                style={styles.modalButton}
                onPress={() => {
                  setIsWinnerModalVisible(false);
                  navigation.navigate('Home');
                }}
              >
                <Text style={styles.modalButtonText}>Back to Home</Text>
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

        {/* Disqualification Modal */}
        <Modal visible={isDisqualifiedModalVisible} transparent={true}>
          <View style={styles.timeUpModalOverlay}>
            <Animated.View style={[styles.timeUpModalContent, styles.disqualifiedModalContent]}>
              <Text style={styles.timeUpText}>Player Disqualified!</Text>
              <Text style={styles.finalScoreText}>
                Score: {disqualificationRule === 'zero' ? '0' : score}
              </Text>
            </Animated.View>
          </View>
        </Modal>

        {/* Correct Animation */}
        {isCorrectAnimationVisible && (
          <Animated.View
            style={[styles.correctAnimationOverlay, { opacity: correctAnimationOpacity }]}
          >
            <View style={styles.correctAnimationContent}>
              <FontAwesome name="thumbs-up" size={30} color="white" />
              <Text style={styles.correctAnimationText}>Correct!</Text>
            </View>
          </Animated.View>
        )}

        {/* Skip Animation */}
        {isSkipAnimationVisible && (
          <Animated.View style={[styles.skipAnimationOverlay, { opacity: skipAnimationOpacity }]}>
            <View style={styles.skipAnimationContent}>
              <FontAwesome name="forward" size={30} color="white" />
              <Text style={styles.skipAnimationText}>Skipped!</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
