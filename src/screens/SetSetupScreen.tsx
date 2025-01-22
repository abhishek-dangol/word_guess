import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { AntDesign } from '@expo/vector-icons';
import { getLastGameSession } from '../services/gameSessionService';

type SetSetupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SetSetupScreen'>;
  route: RouteProp<RootStackParamList, 'SetSetupScreen'>;
};

const AVAILABLE_SETS = ['Set One', 'Set Two', 'Set Three', 'Set Four', 'Set Five'];

export function SetSetupScreen({ navigation, route }: SetSetupScreenProps) {
  const [selectedSet, setSelectedSet] = useState<string>('');
  const { gameSettings } = route.params;

  useEffect(() => {
    async function loadLastSession() {
      const lastSession = await getLastGameSession();
      if (lastSession) {
        setSelectedSet(lastSession.gameSettings.selectedSet);
      }
    }
    loadLastSession();
  }, []);

  const handleSetSelection = (set: string) => {
    setSelectedSet(set);
  };

  const handleStartGame = () => {
    if (!selectedSet) {
      Alert.alert('Set Required', 'Please select a set to continue.');
      return;
    }

    navigation.navigate('Game', {
      gameSettings: {
        ...gameSettings,
        selectedSet,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="#2C3E50" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>

      <Text style={styles.instructions}>Select one set for your game:</Text>

      <View style={styles.setsList}>
        {AVAILABLE_SETS.map((set) => (
          <Pressable
            key={set}
            style={[styles.setItem, selectedSet === set && styles.selectedSet]}
            onPress={() => handleSetSelection(set)}
          >
            <Text style={[styles.setText, selectedSet === set && styles.selectedSetText]}>
              {set}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.bottomContainer}>
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
  setsList: {
    padding: 16,
    gap: 12,
  },
  setItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedSet: {
    backgroundColor: '#2ECC71',
    borderColor: '#27AE60',
  },
  setText: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
  },
  selectedSetText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bottomContainer: {
    padding: 16,
    marginTop: 'auto',
  },
  startButton: {
    padding: 8,
  },
});
