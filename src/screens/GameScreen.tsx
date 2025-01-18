import { View, StyleSheet, Pressable, Text } from "react-native";
import { WordCard } from "../components/WordCard";
import { getRandomWordCard } from "../data/wordList";
import { useState, useEffect, useCallback } from "react";
import type { WordCard as WordCardType } from "../data/wordList";

const INITIAL_TIME = 10; // Initial timer value in seconds
const MAX_SKIPS = 3; // Maximum number of skips allowed per round

export function GameScreen() {
  // State management for word card, timer, and scoring
  const [currentWordCard, setCurrentWordCard] = useState<WordCardType | null>(
    null,
  );
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [score, setScore] = useState(0);
  const [skips, setSkips] = useState(0);

  // Timer countdown effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isTimerActive && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }

    // Cleanup interval on unmount or when timer stops
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timeLeft, isTimerActive]);

  // Reset everything
  const handleReset = useCallback(() => {
    setTimeLeft(INITIAL_TIME);
    setIsTimerActive(true);
    setCurrentWordCard(getRandomWordCard());
    setScore(0);
    setSkips(0);
  }, []);

  // Load initial word
  useEffect(() => {
    handleReset();
  }, [handleReset]);

  // Handler for correct guess
  const handleCorrect = () => {
    if (isTimerActive) {
      setScore((prev) => prev + 1);
      setCurrentWordCard(getRandomWordCard());
    }
  };

  // Handler for skipping word
  const handleSkip = () => {
    if (isTimerActive && skips < MAX_SKIPS) {
      setSkips((prev) => prev + 1);
      setCurrentWordCard(getRandomWordCard());
    }
  };

  // Calculate remaining skips
  const remainingSkips = MAX_SKIPS - skips;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Score display */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Skips Left</Text>
            <Text
              style={[
                styles.scoreValue,
                remainingSkips === 0 && styles.noSkipsLeft,
              ]}
            >
              {remainingSkips}
            </Text>
          </View>
        </View>

        {/* Timer display */}
        <View style={styles.timerContainer}>
          <Text style={[styles.timer, timeLeft <= 3 && styles.timerWarning]}>
            {timeLeft}s
          </Text>
        </View>

        {/* Word card */}
        {currentWordCard && <WordCard wordCard={currentWordCard} />}

        {/* Game buttons */}
        <View style={styles.buttonContainer}>
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
                (!isTimerActive || remainingSkips === 0) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleSkip}
              disabled={!isTimerActive || remainingSkips === 0}
            >
              <Text style={styles.buttonText}>
                Skip {remainingSkips > 0 ? `(${remainingSkips})` : ""}
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>Reset Game</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginBottom: 20,
    width: "100%",
  },
  scoreItem: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    minWidth: 100,
    shadowColor: "#000",
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
    color: "#666",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  timerContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
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
    fontWeight: "bold",
    color: "#2C3E50",
  },
  timerWarning: {
    color: "#E74C3C",
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
    width: "100%",
    alignItems: "center",
  },
  gameButtons: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    width: "100%",
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: "center",
  },
  correctButton: {
    backgroundColor: "#2ECC71",
  },
  skipButton: {
    backgroundColor: "#E67E22",
  },
  resetButton: {
    backgroundColor: "#34495E",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  noSkipsLeft: {
    color: "#E74C3C", // Red color to indicate no skips remaining
  },
});
