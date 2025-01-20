import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { supabase } from '../lib/supabase';
import { AntDesign } from '@expo/vector-icons';

type CategorySetupScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'CategorySetup' | 'TeamSetupScreen' | 'SetSetupScreen'
  >;
  route: RouteProp<RootStackParamList, 'CategorySetup'>;
};

export function CategorySetupScreen({ navigation, route }: CategorySetupScreenProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { teamSettings } = route.params;

  useEffect(() => {
    fetchCategories();
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

  const toggleCategory = (category: string) => {
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

    navigation.navigate('SetSetupScreen', {
      gameSettings: {
        teamSettings,
        selectedCategories,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.navigate('TeamSetupScreen')}>
          <AntDesign name="arrowleft" size={24} color="#2C3E50" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>

      <Text style={styles.instructions}>Select 2-10 categories for your game:</Text>

      <ScrollView style={styles.categoriesList}>
        {categories.map((category) => (
          <Pressable
            key={category}
            style={[
              styles.categoryItem,
              selectedCategories.includes(category) && styles.selectedCategory,
            ]}
            onPress={() => toggleCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategories.includes(category) && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Text style={styles.selectionCount}>Selected: {selectedCategories.length}/10</Text>
        <Button mode="contained" onPress={handleStartGame} style={styles.startButton}>
          Next Step: Select Set
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
  categoriesList: {
    flex: 1,
    padding: 16,
  },
  categoryItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedCategory: {
    backgroundColor: '#2ECC71',
    borderColor: '#27AE60',
  },
  categoryText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bottomContainer: {
    padding: 16,
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
});
