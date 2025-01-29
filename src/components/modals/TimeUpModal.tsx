import React from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';

interface TimeUpModalProps {
  // Modal visibility state
  isVisible: boolean;
  // Player's final score for the round
  finalScore: number;
}

/**
 * TimeUpModal Component
 *
 * Displays an animated modal when the player's turn time expires.
 * Shows the final score achieved during the turn.
 *
 * @param isVisible - Controls modal visibility
 * @param finalScore - The final score achieved in the turn
 */
export function TimeUpModal({ isVisible, finalScore }: TimeUpModalProps) {
  return (
    <Modal visible={isVisible} transparent={true}>
      <View style={styles.timeUpModalOverlay}>
        <Animated.View style={styles.timeUpModalContent}>
          <Text style={styles.timeUpText}>Time's Up!</Text>
          <Text style={styles.finalScoreText}>Final Score: {finalScore}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  timeUpModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  timeUpModalContent: {
    backgroundColor: '#E74C3C',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  timeUpText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  finalScoreText: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});
