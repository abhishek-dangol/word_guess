import { View, Text, StyleSheet } from 'react-native';
import type { CardData } from '../types/game';

interface WordCardProps {
  wordCard: CardData;
}

/**
 * WordCard component displays a main word and its associated taboo words
 * @param {WordCardProps} props - Component props containing the word card data
 * @returns {JSX.Element} Rendered component
 */
export function WordCard({ wordCard }: WordCardProps) {
  console.log('Rendering WordCard with:', wordCard);
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.category}>{wordCard.category}</Text>
        <Text style={styles.setLabel}>{wordCard.set || 'No Set'}</Text>
      </View>
      <Text style={styles.mainWord}>{wordCard.tabooword}</Text>
      <View style={styles.hintWordsContainer}>
        {wordCard.hintwords.map((word, index) => (
          <Text key={index} style={styles.hintWord}>
            {word}
          </Text>
        ))}
      </View>
    </View>
  );
}

// Styles for the WordCard component
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#666',
  },
  setLabel: {
    fontSize: 14,
    color: '#2C3E50',
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    minWidth: 60,
  },
  mainWord: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  hintWordsContainer: {
    width: '100%',
  },
  hintWord: {
    fontSize: 18,
    color: '#34495E',
    paddingVertical: 4,
    textAlign: 'center',
  },
});
