import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, FlatList } from 'react-native';
import { Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { supabase } from '../lib/supabase';
import { AntDesign } from '@expo/vector-icons';
import { getLastGameSession } from '../services/gameSessionService';
import { Image } from 'expo-image';
import { CATEGORY_IMAGES, DEFAULT_IMAGE, CategoryImageKeys } from '../assets/categoryImages';
import type { CategoryImageKeys as ImportedCategoryImageKeys } from '../assets/categoryImages';

type CategorySetupScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'CategorySetupScreen' | 'TeamSetupScreen' | 'SetSetupScreen'
  >;
  route: RouteProp<RootStackParamList, 'CategorySetupScreen'>;
};

export function CategorySetupScreen({ navigation, route }: CategorySetupScreenProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [validCategories, setValidCategories] = useState<string[]>([]);
  const { teamSettings, gameSettings } = route.params;

  useEffect(() => {
    fetchCategories();
    fetchValidCategoriesForSet();
  }, []);

  useEffect(() => {
    async function loadLastSession() {
      const lastSession = await getLastGameSession();
      if (lastSession) {
        setSelectedCategories(lastSession.gameSettings.selectedCategories);
      }
    }
    loadLastSession();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('carddata').select('category').order('category');

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }

    // Get unique categories using Set
    const uniqueCategories = [...new Set(data.map((item: { category: string }) => item.category))];
    setCategories(uniqueCategories);
  };

  const fetchValidCategoriesForSet = async () => {
    const { data, error } = await supabase
      .from('carddata')
      .select('category')
      .eq('set', gameSettings.selectedSet);

    if (error) {
      console.error('Error fetching valid categories:', error);
      return;
    }

    const validCats = [...new Set(data.map((item: { category: string }) => item.category))];
    setValidCategories(validCats);
  };

  const toggleCategory = async (category: string) => {
    if (!validCategories.includes(category)) {
      Alert.alert(
        'Category Not Available',
        `The category "${category}" is not available in ${gameSettings.selectedSet}. Please select a different category.`
      );
      return;
    }

    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      if (prev.length >= 10) {
        Alert.alert('Maximum Categories', 'You can select up to 10 categories.');
        return prev;
      }
      return [...prev, category];
    });
  };

  const handleStartGame = () => {
    if (selectedCategories.length < 2) {
      Alert.alert(
        'Not Enough Categories',
        'Please select at least 2 categories to start the game.',
      );
      return;
    }

    navigation.navigate('Game', {
      gameSettings: {
        teamSettings: route.params.teamSettings,
        selectedSet: route.params.gameSettings.selectedSet,
        selectedCategories,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#2C3E50" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>

      <Text style={styles.instructions}>Select 2-10 categories for your game:</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        numColumns={3}
        contentContainerStyle={styles.categoriesGrid}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.categoryItem,
              selectedCategories.includes(item) && styles.selectedCategory,
              !validCategories.includes(item) && styles.disabledCategory,
            ]}
            onPress={() => toggleCategory(item)}
          >
            <View style={styles.categoryWrapper}>
              <Image
                source={CATEGORY_IMAGES[item as CategoryImageKeys] || DEFAULT_IMAGE}
                style={styles.categoryImage}
                contentFit="cover"
              />
              <View style={styles.textOverlay}>
                <Text style={[
                  styles.categoryLabel,
                  selectedCategories.includes(item) && styles.selectedCategoryText,
                  !validCategories.includes(item) && styles.disabledCategoryText,
                ]}>
                  {item}
                </Text>
                {!validCategories.includes(item) && (
                  <Text style={styles.unavailableText}>(Unavailable)</Text>
                )}
              </View>
            </View>
          </Pressable>
        )}
      />

      <View style={styles.bottomContainer}>
        <Text style={styles.selectionCount}>Total Categories Selected: {selectedCategories.length}/10</Text>
        <Button mode="contained" onPress={handleStartGame} style={styles.startButton}>
          Start Game
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#2C3E50',
  },
  instructions: {
    fontSize: 18,
    color: '#2C3E50',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  categoriesGrid: {
    padding: 8,
    gap: 8,
  },
  categoryItem: {
    flex: 1,
    minWidth: '30%',
    maxWidth: '32%',
    aspectRatio: 1,
    margin: 4,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
  },
  selectedCategory: {
    borderWidth:10,
    borderColor: '#2ECC71',
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    textAlign: 'center',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bottomContainer: {
    padding:40,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  selectionCount: {
    textAlign: 'center',
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
  },
  startButton: {
    padding: 8,
  },
  disabledCategory: {
    backgroundColor: '#E9ECEF',
    borderColor: '#DEE2E6',
    opacity: 0.7,
  },
  disabledCategoryText: {
    color: '#6C757D',
    fontStyle: 'italic',
  },
  categoryWrapper: {
    flex: 1,
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  categoryLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
    fontWeight: '500',
  },
  unavailableText: {
    fontSize: 10,
    color: '#E9ECEF',
    fontStyle: 'italic',
    textAlign: 'center',
  }
});
