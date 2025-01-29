import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import type { TeamSettings } from '../../types/game';

interface GameSummaryModalProps {
  // Modal visibility state
  isVisible: boolean;
  // Team settings containing names and players
  teamSettings: TeamSettings;
  // Scores for each team's players
  playerScores: {
    team1: number[];
    team2: number[];
  };
  // Tracks which players were disqualified
  disqualifiedPlayers: {
    team1: boolean[];
    team2: boolean[];
  };
  // Rule for handling disqualified player scores
  disqualificationRule: 'zero' | 'total';
  // Callback for when user wants to return home
  onBackToHome: () => void;
}

/**
 * GameSummaryModal Component
 *
 * Displays the game's final results including:
 * - Winning team
 * - Each player's score
 * - Team totals
 * - Disqualified players
 *
 * @param isVisible - Controls modal visibility
 * @param teamSettings - Team names and player information
 * @param playerScores - Individual scores for each player
 * @param disqualifiedPlayers - Tracks disqualified players
 * @param disqualificationRule - How to handle disqualified scores
 * @param onBackToHome - Handler for returning to home screen
 */
export function GameSummaryModal({
  isVisible,
  teamSettings,
  playerScores,
  disqualifiedPlayers,
  disqualificationRule,
  onBackToHome,
}: GameSummaryModalProps) {
  // Calculate team totals accounting for disqualifications
  const team1Total = playerScores.team1
    .map((score, index) =>
      disqualifiedPlayers.team1[index] && disqualificationRule === 'zero' ? 0 : score,
    )
    .reduce((acc, score) => acc + score, 0);

  const team2Total = playerScores.team2
    .map((score, index) =>
      disqualifiedPlayers.team2[index] && disqualificationRule === 'zero' ? 0 : score,
    )
    .reduce((acc, score) => acc + score, 0);

  // Determine the winner
  const getWinnerText = () => {
    if (team1Total === 0 && team2Total === 0) return "Winner: It's a tie!";
    if (team1Total > team2Total) return `Winner: ${teamSettings.team1Name}`;
    if (team2Total > team1Total) return `Winner: ${teamSettings.team2Name}`;
    return "Winner: It's a tie!";
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Game Over</Text>
          <Text style={styles.winnerText}>{getWinnerText()}</Text>
          <Text style={styles.modalSubtitle}>Summary</Text>

          {/* Team 1 Summary */}
          <View>
            <Text style={styles.teamName}>{teamSettings.team1Name}</Text>
            {teamSettings.team1Players.map((player, index) => (
              <Text
                key={index}
                style={[
                  styles.playerScore,
                  disqualifiedPlayers.team1[index] && styles.disqualifiedScore,
                ]}
              >
                Player {index + 1}: {player} -{' '}
                {disqualifiedPlayers.team1[index]
                  ? `Disqualified (${
                      disqualificationRule === 'zero' ? '0' : playerScores.team1[index]
                    } points)`
                  : `${playerScores.team1[index]} points`}
              </Text>
            ))}
            <Text style={styles.teamTotal}>Team Total: {team1Total} points</Text>
          </View>

          {/* Team 2 Summary */}
          <View style={styles.secondTeam}>
            <Text style={styles.teamName}>{teamSettings.team2Name}</Text>
            {teamSettings.team2Players.map((player, index) => (
              <Text
                key={index}
                style={[
                  styles.playerScore,
                  disqualifiedPlayers.team2[index] && styles.disqualifiedScore,
                ]}
              >
                Player {index + 1}: {player} -{' '}
                {disqualifiedPlayers.team2[index]
                  ? `Disqualified (${
                      disqualificationRule === 'zero' ? '0' : playerScores.team2[index]
                    } points)`
                  : `${playerScores.team2[index]} points`}
              </Text>
            ))}
            <Text style={styles.teamTotal}>Team Total: {team2Total} points</Text>
          </View>

          <Pressable style={styles.modalButton} onPress={onBackToHome}>
            <Text style={styles.modalButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  winnerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ECC71',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  playerScore: {
    fontSize: 16,
    color: '#34495E',
    marginBottom: 5,
  },
  disqualifiedScore: {
    color: '#E74C3C',
    fontStyle: 'italic',
  },
  teamTotal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 8,
    marginBottom: 8,
  },
  secondTeam: {
    marginTop: 16,
  },
  modalButton: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
