import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import type { WordCard as WordCardType } from "../data/wordList";

interface WordCardProps {
  wordCard: WordCardType;
}

/**
 * WordCard component displays a main word and its associated taboo words
 * @param {WordCardProps} props - Component props containing the word card data
 * @returns {JSX.Element} Rendered component
 */
export function WordCard({ wordCard }: WordCardProps) {
  // Get screen dimensions for responsive sizing
  const { width } = useWindowDimensions();
  const cardWidth = width * 0.85; // Card takes up 85% of screen width

  return (
    <View style={[styles.container, { width: cardWidth }]}>
      {/* Main word section */}
      <View style={styles.mainWordContainer}>
        <Text style={styles.mainWord}>{wordCard.mainWord}</Text>
      </View>

      {/* Taboo words section */}
      <View style={styles.tabooWordsContainer}>
        {wordCard.tabooWords.map((word, index) => (
          <View key={index} style={styles.tabooWordItem}>
            <Text style={styles.tabooWord}>{word}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Styles for the WordCard component
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    minHeight: 300, // Ensure minimum height for better appearance
  },
  mainWordContainer: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  mainWord: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2C3E50",
    letterSpacing: 0.5,
  },
  tabooWordsContainer: {
    marginTop: 24,
    gap: 12,
  },
  tabooWordItem: {
    backgroundColor: "#F5F6FA",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tabooWord: {
    fontSize: 20,
    color: "#E74C3C",
    textAlign: "center",
    fontWeight: "500",
  },
});
