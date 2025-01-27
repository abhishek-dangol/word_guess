import { View, Image, Text, StyleSheet } from 'react-native';

export const CATEGORY_IMAGES = {
  'Animals': require('../../assets/images/Animals.jpeg'),
  'Arts': require('../../assets/images/Arts.jpeg'),
  'Hollywood': require('../../assets/images/Hollywood.jpeg'),
  'Astronomy': require('../../assets/images/Astronomy.jpeg'),
  'History': require('../../assets/images/History.jpeg'),
  'Food': require('../../assets/images/Food.jpeg'),
  'Geography': require('../../assets/images/Geography.jpeg'),
  'Science': require('../../assets/images/Science.jpeg'),
  'Bollywood': require('../../assets/images/Bollywood.jpeg'),
  'Music': require('../../assets/images/Music.jpeg'),
};

export const DEFAULT_IMAGE = require('../../assets/images/DefaultCategory.jpeg')
export type CategoryName = keyof typeof CATEGORY_IMAGES;
export type CategoryImageKeys = keyof typeof CATEGORY_IMAGES;