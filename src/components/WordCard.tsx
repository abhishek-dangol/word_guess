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
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    alignSelf: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  category: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  setLabel: {
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    overflow: 'hidden',
    minWidth: 70,
  },
  mainWord: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 24,
    textAlign: 'center',
  },
  hintWordsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  hintWord: {
    fontSize: 22,
    color: '#34495E',
    paddingVertical: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
});
