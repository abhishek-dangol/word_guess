// Define the structure for a word card
export interface WordCard {
  mainWord: string;
  tabooWords: string[];
}

// List of word cards with their associated taboo words
export const wordList: WordCard[] = [
  {
    mainWord: "Basketball",
    tabooWords: ["Hoop", "Court", "Dribble", "NBA"],
  },
  {
    mainWord: "Computer",
    tabooWords: ["Screen", "Keyboard", "Mouse", "Internet"],
  },
  {
    mainWord: "Pizza",
    tabooWords: ["Cheese", "Dough", "Tomato", "Slice"],
  },
  // Add more words as needed
];

/**
 * Returns a random word card from the word list
 * @returns {WordCard} A randomly selected word card
 */
export function getRandomWordCard(): WordCard {
  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex];
}
