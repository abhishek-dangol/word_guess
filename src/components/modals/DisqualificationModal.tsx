import React from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';

interface DisqualificationModalProps {
  // Modal visibility state
  isVisible: boolean;
  // Current score before disqualification
  score: number;
  // Rule for handling disqualified scores
  disqualificationRule: 'zero' | 'total';
}

/**
 * DisqualificationModal Component
 *
 * Displays when a player is disqualified during their turn.
 * Shows the score based on the disqualification rule.
 *
 * @param isVisible - Controls modal visibility
 * @param score - The score before disqualification
 * @param disqualificationRule - How to handle the score ('zero' or 'total')
 */
export function DisqualificationModal({
  isVisible,
  score,
  disqualificationRule,
}: DisqualificationModalProps) {
  return (
    <Modal visible={isVisible} transparent={true}>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, styles.disqualifiedContent]}>
          <Text style={styles.disqualifiedText}>Player Disqualified!</Text>
          <Text style={styles.scoreText}>
            Score: {disqualificationRule === 'zero' ? '0' : score}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
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
  disqualifiedContent: {
    backgroundColor: '#E74C3C',
  },
  disqualifiedText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  scoreText: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});
