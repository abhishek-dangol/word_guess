import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import type { PlayerTurn } from '../../types/game';

interface TurnModalProps {
  // Whether this is the initial turn modal or next turn modal
  isInitialTurn: boolean;
  // Visibility state of the modal
  isVisible: boolean;
  // Current or next player's turn information
  turnInfo: PlayerTurn | null;
  // Callback function when user presses the start button
  onStart: () => void;
}

/**
 * TurnModal Component
 *
 * Displays a modal for either the initial turn or next turn in the game.
 * Shows the team name and player information, with a button to start the turn.
 *
 * @param isInitialTurn - Boolean to determine if this is the first turn
 * @param isVisible - Boolean to control modal visibility
 * @param turnInfo - Object containing turn information (team and player details)
 * @param onStart - Callback function when start button is pressed
 */
export function TurnModal({ isInitialTurn, isVisible, turnInfo, onStart }: TurnModalProps) {
  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{isInitialTurn ? 'First Turn' : 'Next Turn'}</Text>
          {turnInfo && (
            <>
              <Text style={styles.teamName}>Team: {turnInfo.teamName}</Text>
              <Text style={styles.teamName}>
                Player {turnInfo.playerIndex + 1}: {turnInfo.playerName}
              </Text>
            </>
          )}
          <Pressable style={styles.modalButton} onPress={onStart}>
            <Text style={styles.modalButtonText}>
              {isInitialTurn ? 'Start Game' : 'Start Turn'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// Styles for the modal component
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
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
