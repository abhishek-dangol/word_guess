import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TextInput,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AntDesign } from '@expo/vector-icons';
import { getLastGameSession } from '../services/gameSessionService';

type TeamSetupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TeamSetupScreen'
>;

interface TeamSetupScreenProps {
  navigation: TeamSetupScreenNavigationProp;
}

const TeamSetupScreen: React.FC<TeamSetupScreenProps> = ({ navigation }) => {
  const [teamSettings, setTeamSettings] = useState({
    team1Name: '',
    team2Name: '',
    team1Players: [''],
    team2Players: [''],
    playersPerTeam: 1,
  });

  const handleTeamNameChange = (team: 'team1' | 'team2', name: string) => {
    setTeamSettings((prev) => ({
      ...prev,
      [`${team}Name`]: name,
    }));
  };

  const handlePlayerNameChange = (team: 'team1' | 'team2', index: number, name: string) => {
    setTeamSettings((prev) => ({
      ...prev,
      [`${team}Players`]: prev[`${team}Players`].map((player, i) => (i === index ? name : player)),
    }));
  };

  const addPlayer = (team: 'team1' | 'team2') => {
    setTeamSettings((prev) => ({
      ...prev,
      [`${team}Players`]: [...prev[`${team}Players`], ''],
      playersPerTeam: Math.max(prev.team1Players.length + 1, prev.team2Players.length + 1),
    }));
  };

  const removePlayer = (team: 'team1' | 'team2', index: number) => {
    setTeamSettings((prev) => ({
      ...prev,
      [`${team}Players`]: prev[`${team}Players`].filter((_, i) => i !== index),
      playersPerTeam: Math.max(
        team === 'team1' ? prev.team1Players.length - 1 : prev.team1Players.length,
        team === 'team2' ? prev.team2Players.length - 1 : prev.team2Players.length,
      ),
    }));
  };

  const handleStartGame = () => {
    const team1Players = teamSettings.team1Players.filter((name) => name.trim());
    const team2Players = teamSettings.team2Players.filter((name) => name.trim());

    if (!teamSettings.team1Name.trim() || !teamSettings.team2Name.trim()) {
      alert('Please enter names for both teams');
      return;
    }

    if (team1Players.length === 0 || team2Players.length === 0) {
      alert('Please add at least one player for each team');
      return;
    }

    navigation.navigate('CategorySetup', {
      teamSettings: {
        ...teamSettings,
        team1Players,
        team2Players,
      },
    });
  };

  useEffect(() => {
    async function loadLastSession() {
      const lastSession = await getLastGameSession();
      if (lastSession) {
        setTeamSettings((prev) => ({
          ...prev,
          team1Name: lastSession.teamSettings.team1Name,
          team1Players: lastSession.teamSettings.team1Players,
          team2Name: lastSession.teamSettings.team2Name,
          team2Players: lastSession.teamSettings.team2Players,
        }));
      }
    }
    loadLastSession();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <AntDesign name="arrowleft" size={24} color="#2C3E50" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.teamSection}>
            <Text style={styles.sectionTitle}>Team 1</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Team 1 Name"
              placeholderTextColor="#95A5A6"
              value={teamSettings.team1Name}
              onChangeText={(text) => handleTeamNameChange('team1', text)}
            />
            {teamSettings.team1Players.map((player, index) => (
              <View key={`team1-player-${index}`} style={styles.playerInputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, styles.playerInput]}
                    placeholder={`Player ${index + 1}`}
                    placeholderTextColor="#95A5A6"
                    value={player}
                    onChangeText={(text) => handlePlayerNameChange('team1', index, text)}
                  />
                  {index > 0 && (
                    <Pressable
                      onPress={() => removePlayer('team1', index)}
                      style={styles.removeButtonInner}
                    >
                      <AntDesign name="minuscircle" size={20} color="#E74C3C" />
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
            <Button mode="outlined" onPress={() => addPlayer('team1')} style={styles.addButton}>
              Add Player
            </Button>
          </View>

          <View style={styles.teamSection}>
            <Text style={styles.sectionTitle}>Team 2</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Team 2 Name"
              placeholderTextColor="#95A5A6"
              value={teamSettings.team2Name}
              onChangeText={(text) => handleTeamNameChange('team2', text)}
            />
            {teamSettings.team2Players.map((player, index) => (
              <View key={`team2-player-${index}`} style={styles.playerInputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, styles.playerInput]}
                    placeholder={`Player ${index + 1}`}
                    placeholderTextColor="#95A5A6"
                    value={player}
                    onChangeText={(text) => handlePlayerNameChange('team2', index, text)}
                  />
                  {index > 0 && (
                    <Pressable
                      onPress={() => removePlayer('team2', index)}
                      style={styles.removeButtonInner}
                    >
                      <AntDesign name="minuscircle" size={20} color="#E74C3C" />
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
            <Button mode="outlined" onPress={() => addPlayer('team2')} style={styles.addButton}>
              Add Player
            </Button>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <Button mode="contained" onPress={handleStartGame} style={styles.startButton}>
            Next Step: Select Categories
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 24,
  },
  teamSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2C3E50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  addButton: {
    marginTop: 8,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    backgroundColor: 'white',
  },
  startButton: {
    padding: 8,
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
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#2C3E50',
  },
  playerInputContainer: {
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  playerInput: {
    flex: 1,
    marginBottom: 0,
    paddingRight: 40,
  },
  removeButtonInner: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
});

export default TeamSetupScreen;
